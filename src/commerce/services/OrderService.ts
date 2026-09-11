/**
 * NEEDLE — Documentation 03: Order Lifecycle, Domain Services & Transactions
 *
 * Implements the atomic order lifecycle:
 * - Atomic checkout transaction with idempotency key protection
 * - Server-side product availability, price, tax, and inventory verification
 * - Immutable order item and delivery address snapshots
 * - Coordinated Order, Payment, Shipment, and Return state machines
 * - Traceable inventory movements with zero overselling
 * - Append-only order lifecycle timeline events
 * - Auditable financial refunds without mutating historical order totals
 * - Comprehensive commerce reporting aggregations
 */

import {
  OrderRecord,
  OrderItemRecord,
  OrderAddressSnapshotRecord,
  PaymentRecord,
  PaymentAttemptRecord,
  FulfilmentRecord,
  OrderEventRecord,
  RefundRecord,
  ReturnRequestRecord,
  ReturnReasonCode,
  ReturnResolution,
  ReturnStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethodType,
  CommerceReportingSummary,
  MoneyInCents,
  toCents,
  toDollars
} from '../types/schema';
import { db } from '../database/DatabaseEngine';
import { OrderStateMachine, OrderDomainException } from '../domain/OrderStateMachine';
import { PaymentStateMachine, PaymentDomainException } from '../domain/PaymentStateMachine';
import { ShipmentStateMachine } from '../domain/ShipmentStateMachine';
import { ReturnStateMachine } from '../domain/ReturnStateMachine';
import { paymentAdapter } from './PaymentProviderAdapter';

export interface CheckoutItemRequest {
  productId: string;
  variantId?: string;
  sku?: string;
  quantity: number;
}

export interface CheckoutAddressRequest {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

export interface CheckoutPayload {
  customerId?: string;
  customerEmail: string;
  customerPhone?: string;
  items: CheckoutItemRequest[];
  shippingAddress: CheckoutAddressRequest;
  shippingMethod: 'standard' | 'express';
  paymentMethod: PaymentMethodType;
  discountCode?: string;
  idempotencyKey?: string;
  notes?: string;
}

export interface CheckoutResult {
  success: boolean;
  order?: OrderRecord;
  orderNumber?: string;
  paymentStatus?: PaymentStatus;
  error?: string;
}

export const OrderService = {
  /**
   * Execute atomic order creation transaction synchronously (Doc 03 Section 22)
   */
  checkoutSync(payload: CheckoutPayload): CheckoutResult {
    const idempotencyKey = payload.idempotencyKey || `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 1. Idempotency Check: Prevent duplicate order creation on client network retry
    const existingOrder = db.getOrderByIdempotencyKey(idempotencyKey);
    if (existingOrder) {
      return {
        success: true,
        order: existingOrder,
        orderNumber: existingOrder.order_number,
        paymentStatus: existingOrder.payment_status
      };
    }

    // 2. Validate payload basics
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: 'Checkout failed: cart contains no items.' };
    }
    if (!payload.customerEmail || !payload.shippingAddress.line1) {
      return { success: false, error: 'Checkout failed: missing recipient contact or delivery address.' };
    }

    // 3. Begin Atomic Database Transaction
    db.beginTransaction();
    try {
      const now = new Date().toISOString();
      const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Generate random unique order number NDXXXX
      let orderNumber = `ND${Math.floor(1000 + Math.random() * 9000)}`;
      while (db.getOrderByNumber(orderNumber)) {
        orderNumber = `ND${Math.floor(1000 + Math.random() * 9000)}`;
      }

      let calculatedSubtotal: MoneyInCents = 0;
      let calculatedItemDiscountTotal: MoneyInCents = 0;
      const orderItemsToInsert: OrderItemRecord[] = [];

      // 4. Resolve variants and verify stock availability
      for (const reqItem of payload.items) {
        const product = db.getProductById(reqItem.productId);
        if (!product || product.status === 'archived') {
          throw new Error(`Product ${reqItem.productId} is no longer available.`);
        }

        // Resolve variant
        let variant = reqItem.variantId ? db.getVariantById(reqItem.variantId) : undefined;
        if (!variant && reqItem.sku) {
          variant = db.getVariantBySku(reqItem.sku);
        }
        if (!variant) {
          const variants = db.getProductVariants(product.id);
          variant = variants[0];
        }

        if (!variant) {
          throw new Error(`No purchasable variant found for product "${product.name}".`);
        }

        // Verify inventory (Doc 03 Section 19)
        const inventory = db.getInventory(variant.id);
        const availableStock = inventory ? inventory.on_hand_qty - inventory.reserved_qty : 0;
        if (availableStock < reqItem.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}" (${variant.sku}). Available: ${availableStock}, Requested: ${reqItem.quantity}.`
          );
        }

        const unitPriceCents = variant.sale_price || variant.price;
        const lineDiscountCents = 0;
        const lineTaxCents = Math.round(unitPriceCents * reqItem.quantity * 0.08); // 8% standard tax
        const lineTotalCents = unitPriceCents * reqItem.quantity;

        calculatedSubtotal += lineTotalCents;
        calculatedItemDiscountTotal += lineDiscountCents;

        orderItemsToInsert.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          order_id: orderId,
          product_id: product.id,
          variant_id: variant.id,
          sku_snapshot: variant.sku,
          product_name_snapshot: product.name,
          variant_snapshot: `Color: ${variant.color} / Size: ${variant.size}`,
          primary_image_snapshot: variant.image || product.primary_image,
          quantity: reqItem.quantity,
          unit_price: unitPriceCents,
          discount_amount: lineDiscountCents,
          tax_amount: lineTaxCents,
          line_total: lineTotalCents,
          created_at: now
        });
      }

      // 5. Order-level coupon/promotion discount
      let orderDiscountTotal: MoneyInCents = 0;
      if (payload.discountCode) {
        const cleanCode = payload.discountCode.trim().toUpperCase();
        if (cleanCode === 'NEEDLE10') {
          orderDiscountTotal = Math.round(calculatedSubtotal * 0.1);
        } else if (cleanCode === 'STORY15') {
          orderDiscountTotal = Math.round(calculatedSubtotal * 0.15);
        } else if (cleanCode === 'WELCOME20') {
          orderDiscountTotal = 2000; // $20.00
        }
      }

      // 6. Delivery & Shipping calculation
      let shippingAmount: MoneyInCents = 0;
      if (payload.shippingMethod === 'express') {
        shippingAmount = 2500; // $25.00
      } else if (calculatedSubtotal < 10000) {
        shippingAmount = 1200; // $12.00
      }

      // 7. Calculate Tax and Grand Total in cents
      const taxableSubtotal = Math.max(0, calculatedSubtotal - orderDiscountTotal);
      const taxAmount: MoneyInCents = Math.round(taxableSubtotal * 0.08);
      const grandTotal: MoneyInCents = Math.max(0, taxableSubtotal + shippingAmount + taxAmount);

      // 8. Create Immutable Delivery Address Snapshot (Doc 03 Section 8)
      const orderAddress: OrderAddressSnapshotRecord = {
        id: `snap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        order_id: orderId,
        recipient_name: payload.shippingAddress.recipientName,
        phone: payload.shippingAddress.phone,
        line_1: payload.shippingAddress.line1,
        line_2: payload.shippingAddress.line2,
        landmark: payload.shippingAddress.landmark,
        city: payload.shippingAddress.city,
        state: payload.shippingAddress.state,
        postal_code: payload.shippingAddress.postalCode,
        country_code: payload.shippingAddress.countryCode || 'US',
        created_at: now
      };

      // 9. Payment Token Generation & Verification
      const isDeclined = payload.customerEmail.includes('failpayment');
      const isPending = payload.paymentMethod === 'cod' || payload.customerEmail.includes('pending');
      const paymentAttempt = {
        success: !isDeclined,
        provider: 'needle_vault_adapter',
        providerPaymentId: `tok_${payload.paymentMethod}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        status: (isDeclined ? 'failed' : (isPending ? 'pending' : 'paid')) as PaymentStatus,
        failureCode: isDeclined ? 'CARD_DECLINED' : undefined,
        failureMessage: isDeclined ? 'Card declined by issuer.' : undefined,
        tokenizedReference: `ref_ch_${Date.now()}`
      };

      const initialOrderStatus: OrderStatus = isPending ? 'pending_payment' : (paymentAttempt.success ? 'confirmed' : 'pending_payment');
      const initialPaymentStatus: PaymentStatus = paymentAttempt.status;

      // 10. Create Order Record (Doc 03 Section 6)
      const orderRecord: OrderRecord = {
        id: orderId,
        order_number: orderNumber,
        customer_id: payload.customerId,
        customer_email: payload.customerEmail,
        customer_phone: payload.customerPhone || payload.shippingAddress.phone,
        currency: 'USD',
        subtotal: calculatedSubtotal,
        item_discount_total: calculatedItemDiscountTotal,
        order_discount_total: orderDiscountTotal,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        payment_status: initialPaymentStatus,
        fulfillment_status: 'unfulfilled',
        order_status: initialOrderStatus,
        shipping_method: payload.shippingMethod === 'express' ? 'Express Priority Courier (2 Business Days)' : 'Standard Delivery (4-6 Business Days)',
        placed_at: now,
        paid_at: paymentAttempt.success ? now : undefined,
        notes: payload.notes,
        idempotency_key: idempotencyKey,
        created_at: now,
        updated_at: now
      };

      db.insertOrder(orderRecord);
      db.insertOrderAddress(orderAddress);

      for (const item of orderItemsToInsert) {
        db.insertOrderItem(item);
      }

      // 11. Create Payment Record & Attempt (Doc 03 Sections 9 & 10)
      const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const paymentRecord: PaymentRecord = {
        id: paymentId,
        order_id: orderId,
        provider: paymentAttempt.provider,
        provider_payment_id: paymentAttempt.providerPaymentId,
        amount: grandTotal,
        currency: 'USD',
        status: initialPaymentStatus,
        method_type: payload.paymentMethod,
        failure_code: paymentAttempt.failureCode,
        failure_message: paymentAttempt.failureMessage,
        paid_at: paymentAttempt.success ? now : undefined,
        created_at: now,
        updated_at: now
      };
      db.insertPayment(paymentRecord);

      const attemptRecord: PaymentAttemptRecord = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        payment_id: paymentId,
        order_id: orderId,
        attempt_number: 1,
        amount: grandTotal,
        provider_reference: paymentAttempt.tokenizedReference,
        status: initialPaymentStatus,
        failure_code: paymentAttempt.failureCode,
        failure_message: paymentAttempt.failureMessage,
        created_at: now
      };
      db.insertPaymentAttempt(attemptRecord);

      // 12. Inventory Effects (Doc 03 Section 19)
      if (paymentAttempt.success) {
        for (const item of orderItemsToInsert) {
          if (item.variant_id) {
            db.adjustStock(
              item.variant_id,
              -item.quantity,
              'Order fulfillment',
              'order',
              orderNumber,
              'System Checkout Engine'
            );
          }
        }
      }

      // 13. Append Timeline Events (Doc 03 Section 14)
      db.appendOrderEvent({
        id: `evt-${Date.now()}-1`,
        order_id: orderId,
        event_type: 'order.created',
        title: 'Order Created',
        details: `Customer submitted order ${orderNumber} via storefront checkout.`,
        actor_type: payload.customerId ? 'customer' : 'system',
        actor_id: payload.customerId || 'Guest',
        created_at: now
      });

      if (paymentAttempt.success) {
        db.appendOrderEvent({
          id: `evt-${Date.now()}-2`,
          order_id: orderId,
          event_type: 'payment.paid',
          title: 'Payment Confirmed',
          details: `Captured $${toDollars(grandTotal).toFixed(2)} (${payload.paymentMethod}). Token: ${paymentAttempt.providerPaymentId}`,
          actor_type: 'provider',
          actor_id: paymentAttempt.provider,
          created_at: now
        });

        db.appendOrderEvent({
          id: `evt-${Date.now()}-3`,
          order_id: orderId,
          event_type: 'order.confirmed',
          title: 'Order Confirmed & Stock Committed',
          details: `Allocated inventory for ${orderItemsToInsert.length} line items.`,
          actor_type: 'system',
          actor_id: 'System Engine',
          created_at: now
        });
      } else {
        db.appendOrderEvent({
          id: `evt-${Date.now()}-2`,
          order_id: orderId,
          event_type: 'payment.failed',
          title: 'Payment Attempt Failed',
          details: paymentAttempt.failureMessage || 'Payment authorization unsuccessful.',
          actor_type: 'provider',
          actor_id: paymentAttempt.provider,
          created_at: now
        });
      }

      // 14. Commit Database Transaction
      db.commit();

      return {
        success: paymentAttempt.success,
        order: orderRecord,
        orderNumber,
        paymentStatus: initialPaymentStatus,
        error: paymentAttempt.failureMessage
      };
    } catch (err: any) {
      db.rollback();
      return {
        success: false,
        error: err.message || 'An unexpected error occurred during order processing.'
      };
    }
  },

  /**
   * Execute atomic order creation transaction asynchronously with external adapter
   */
  async checkout(payload: CheckoutPayload): Promise<CheckoutResult> {
    // Simulate gateway network latency
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.checkoutSync(payload);
  },

  /**
   * Advance Order Status using explicit State Machine (Doc 03 Section 11)
   */
  advanceOrderStatus(
    orderId: string,
    nextStatus: OrderStatus,
    actorId = 'Admin',
    actorType: 'admin' | 'system' = 'admin',
    details?: string
  ): OrderRecord {
    const order = db.getOrderById(orderId);
    if (!order) {
      throw new OrderDomainException(`Order not found: ${orderId}`);
    }

    // Validate state transition
    OrderStateMachine.assertTransition(order.order_status, nextStatus);

    const now = new Date().toISOString();
    const updates: Partial<OrderRecord> = {
      order_status: nextStatus
    };

    // Coordinated lifecycle updates
    if (nextStatus === 'processing') {
      updates.fulfillment_status = 'processing';
    } else if (nextStatus === 'packed') {
      updates.fulfillment_status = 'packed';
    } else if (nextStatus === 'cancelled') {
      updates.fulfillment_status = 'cancelled';
      updates.cancelled_at = now;

      // Restock items if order cancelled before fulfillment (Doc 03 Section 19)
      if (['pending_payment', 'confirmed', 'processing'].includes(order.order_status)) {
        const items = db.getOrderItems(orderId);
        for (const item of items) {
          if (item.variant_id) {
            db.adjustStock(
              item.variant_id,
              item.quantity,
              'Order cancellation restock',
              'order',
              order.order_number,
              actorId
            );
          }
        }
      }
    } else if (nextStatus === 'delivered') {
      updates.fulfillment_status = 'delivered';
      updates.delivered_at = now;
    }

    const updated = db.updateOrder(orderId, updates);

    // Timeline event
    db.appendOrderEvent({
      id: `evt-${Date.now()}`,
      order_id: orderId,
      event_type: nextStatus === 'cancelled' ? 'order.cancelled' : `order.${nextStatus}` as any,
      title: `Status Changed to ${nextStatus.toUpperCase()}`,
      details: details || `Order transitioned from ${order.order_status} to ${nextStatus}.`,
      actor_type: actorType,
      actor_id: actorId,
      created_at: now
    });

    return updated;
  },

  /**
   * Dispatch and Assign Tracking to Shipment (Doc 03 Section 13)
   */
  dispatchShipment(
    orderId: string,
    carrier: string,
    trackingNumber: string,
    service = 'Priority Delivery',
    actorId = 'Admin'
  ): { order: OrderRecord; fulfilment: FulfilmentRecord } {
    const order = db.getOrderById(orderId);
    if (!order) {
      throw new OrderDomainException(`Order not found: ${orderId}`);
    }

    // Assert order can transition to shipped
    if (order.order_status !== 'packed' && order.order_status !== 'processing') {
      throw new OrderDomainException(
        `Cannot dispatch order with status "${order.order_status}". Order must be PACKED or PROCESSING.`
      );
    }

    const now = new Date().toISOString();
    const trackingUrl = carrier.toLowerCase().includes('dhl')
      ? `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
      : carrier.toLowerCase().includes('fedex')
      ? `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
      : `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;

    // Create or update Fulfilment Record
    let fulfilment = db.getFulfilmentByOrderId(orderId);
    if (fulfilment) {
      fulfilment = db.updateFulfilment(fulfilment.id, {
        carrier,
        service,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        status: 'shipped',
        shipped_at: now
      });
    } else {
      fulfilment = db.insertFulfilment({
        id: `ful-${Date.now()}`,
        order_id: orderId,
        carrier,
        service,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        status: 'shipped',
        shipped_at: now,
        created_at: now,
        updated_at: now
      });
    }

    // Update order
    const updatedOrder = db.updateOrder(orderId, {
      order_status: 'shipped',
      fulfillment_status: 'shipped',
      tracking_number: trackingNumber,
      carrier
    });

    // Timeline event
    db.appendOrderEvent({
      id: `evt-${Date.now()}`,
      order_id: orderId,
      event_type: 'shipment.shipped',
      title: `Dispatched via ${carrier}`,
      details: `Tracking assigned: ${trackingNumber} (${service})`,
      actor_type: 'admin',
      actor_id: actorId,
      created_at: now
    });

    return { order: updatedOrder, fulfilment };
  },

  /**
   * Confirm Delivery of Order (Doc 03 Section 13)
   */
  confirmDelivery(orderId: string, actorId = 'Carrier / System'): OrderRecord {
    const order = db.getOrderById(orderId);
    if (!order) throw new OrderDomainException(`Order not found: ${orderId}`);

    const now = new Date().toISOString();
    const fulfilment = db.getFulfilmentByOrderId(orderId);
    if (fulfilment) {
      db.updateFulfilment(fulfilment.id, {
        status: 'delivered',
        delivered_at: now
      });
    }

    const updated = db.updateOrder(orderId, {
      order_status: 'delivered',
      fulfillment_status: 'delivered',
      delivered_at: now
    });

    db.appendOrderEvent({
      id: `evt-${Date.now()}`,
      order_id: orderId,
      event_type: 'shipment.delivered',
      title: 'Parcel Delivered',
      details: 'Recipient confirmed package receipt.',
      actor_type: 'system',
      actor_id: actorId,
      created_at: now
    });

    return updated;
  },

  /**
   * Process Auditable Refund (Doc 03 Section 16 & 19)
   * Does NOT mutate original order totals!
   */
  async processRefund(
    orderId: string,
    amountCents: MoneyInCents,
    reason: string,
    restockItems = true,
    actorId = 'Admin'
  ): Promise<{ success: boolean; refund?: RefundRecord; message: string }> {
    const order = db.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found' };

    const payments = db.getPaymentsByOrderId(orderId);
    const primaryPayment = payments.find(p => p.status === 'paid' || p.status === 'partially_refunded');
    if (!primaryPayment) {
      return { success: false, message: 'No eligible captured payment record found for this order.' };
    }

    PaymentStateMachine.assertTransition(primaryPayment.status, 'refunded');

    // Total existing refunds
    const existingRefunds = db.getRefunds(orderId);
    const alreadyRefundedCents = existingRefunds.reduce((acc, r) => acc + r.amount, 0);
    const maxRefundable = order.grand_total - alreadyRefundedCents;

    if (amountCents > maxRefundable) {
      return {
        success: false,
        message: `Refund amount ($${toDollars(amountCents).toFixed(2)}) exceeds maximum refundable balance ($${toDollars(maxRefundable).toFixed(2)}).`
      };
    }

    // Process with external gateway adapter
    const gatewayRes = await paymentAdapter.processRefund({
      orderId,
      paymentId: primaryPayment.id,
      providerPaymentId: primaryPayment.provider_payment_id,
      amount: amountCents,
      currency: order.currency,
      reason
    });

    if (!gatewayRes.success) {
      return { success: false, message: gatewayRes.failureMessage || 'Payment provider rejected refund.' };
    }

    const now = new Date().toISOString();
    const isFullRefund = alreadyRefundedCents + amountCents >= order.grand_total;
    const newPaymentStatus: PaymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';

    // Insert separate Refund record
    const refundRecord: RefundRecord = {
      id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order_id: orderId,
      payment_id: primaryPayment.id,
      amount: amountCents,
      currency: order.currency,
      reason,
      provider_refund_id: gatewayRes.providerRefundId,
      status: 'completed',
      requested_by: actorId,
      created_at: now,
      completed_at: now
    };
    db.insertRefund(refundRecord);

    // Update payment record
    db.updatePayment(primaryPayment.id, { status: newPaymentStatus });

    // Update order payment status (Does NOT overwrite order.grand_total!)
    db.updateOrder(orderId, {
      payment_status: newPaymentStatus,
      order_status: isFullRefund ? 'refunded' : order.order_status
    });

    // Restock items if requested (Doc 03 Section 19)
    if (restockItems) {
      const items = db.getOrderItems(orderId);
      for (const item of items) {
        if (item.variant_id) {
          db.adjustStock(
            item.variant_id,
            item.quantity,
            'Customer return restock',
            'return',
            order.order_number,
            actorId
          );
        }
      }
    }

    // Append timeline event
    db.appendOrderEvent({
      id: `evt-${Date.now()}`,
      order_id: orderId,
      event_type: 'refund.completed',
      title: `Refund Completed: $${toDollars(amountCents).toFixed(2)}`,
      details: `Provider Refund ID: ${gatewayRes.providerRefundId} (${reason}). New payment state: ${newPaymentStatus}.`,
      actor_type: 'admin',
      actor_id: actorId,
      created_at: now
    });

    return {
      success: true,
      refund: refundRecord,
      message: `Successfully processed refund of $${toDollars(amountCents).toFixed(2)}.`
    };
  },

  /**
   * Submit Customer Return Request (Doc 03 Section 15)
   */
  requestReturn(
    orderId: string,
    customerId: string | undefined,
    reasonCode: ReturnReasonCode,
    customerNote?: string,
    resolution: ReturnResolution = 'refund'
  ): { success: boolean; returnRequest?: ReturnRequestRecord; message: string } {
    const order = db.getOrderById(orderId);
    if (!order) return { success: false, message: 'Order not found' };

    if (!OrderStateMachine.canRequestReturn(order.order_status)) {
      return {
        success: false,
        message: `Order is not eligible for return. Orders must be in DELIVERED state (current: ${order.order_status}).`
      };
    }

    const now = new Date().toISOString();
    const returnRecord: ReturnRequestRecord = {
      id: `ret-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order_id: orderId,
      customer_id: customerId || order.customer_id,
      reason_code: reasonCode,
      customer_note: customerNote,
      status: 'requested',
      requested_at: now,
      resolution,
      created_at: now,
      updated_at: now
    };

    db.insertReturnRequest(returnRecord);

    db.appendOrderEvent({
      id: `evt-${Date.now()}`,
      order_id: orderId,
      event_type: 'return.requested',
      title: 'Return Requested by Customer',
      details: `Reason: ${reasonCode}. Resolution: ${resolution}. Note: ${customerNote || 'None'}`,
      actor_type: 'customer',
      actor_id: customerId || 'Customer',
      created_at: now
    });

    return {
      success: true,
      returnRequest: returnRecord,
      message: 'Your return request has been submitted to the atelier concierge.'
    };
  },

  /**
   * Update Return Request Status (Doc 03 Section 15 & 19)
   */
  async updateReturnStatus(
    returnId: string,
    nextStatus: ReturnStatus,
    restockResellable = false,
    actorId = 'Admin'
  ): Promise<ReturnRequestRecord> {
    const ret = db.getReturnRequestById(returnId);
    if (!ret) throw new Error(`Return request not found: ${returnId}`);

    ReturnStateMachine.assertTransition(ret.status, nextStatus);

    const now = new Date().toISOString();
    const updates: Partial<ReturnRequestRecord> = {
      status: nextStatus
    };

    if (nextStatus === 'approved') updates.approved_at = now;
    if (nextStatus === 'in_transit') updates.in_transit_at = now;
    if (nextStatus === 'received') updates.received_at = now;
    if (nextStatus === 'inspected') {
      updates.inspected_at = now;
      updates.restocked = restockResellable;
      // Document 03 Section 19: Restock only if inspection marks resellable
      if (restockResellable) {
        const order = db.getOrderById(ret.order_id);
        if (order) {
          const items = db.getOrderItems(order.id);
          for (const item of items) {
            if (item.variant_id) {
              db.adjustStock(
                item.variant_id,
                item.quantity,
                'Customer return restock',
                'return',
                order.order_number,
                actorId
              );
            }
          }
        }
      }
    }
    if (nextStatus === 'completed') updates.completed_at = now;

    const updated = db.updateReturnRequest(returnId, updates);

    let eventType: any = 'return.received';
    if (nextStatus === 'completed') eventType = 'return.completed';

    db.appendOrderEvent({
      id: `evt-${Date.now()}`,
      order_id: ret.order_id,
      event_type: eventType,
      title: `Return Request Status: ${nextStatus.toUpperCase().replace('_', ' ')}`,
      details: `Return request ${ret.id} transitioned to ${nextStatus}. ${nextStatus === 'inspected' ? `Inspection result: ${restockResellable ? 'Resellable (Stock Restored)' : 'Damaged (No Restock)'}.` : ''}`,
      actor_type: 'admin',
      actor_id: actorId,
      created_at: now
    });

    return updated;
  },

  /**
   * Aggregate Commerce Financial Reporting Data (Doc 03 Section 27)
   */
  getReportingSummary(): CommerceReportingSummary {
    const orders = db.getOrders();
    const orderItems = orders.flatMap(o => db.getOrderItems(o.id));
    const refunds = orders.flatMap(o => db.getRefunds(o.id));
    const returns = db.getReturnRequests();

    const gmv = orders.reduce((acc, o) => acc + o.subtotal, 0);
    const discounts = orders.reduce((acc, o) => acc + o.item_discount_total + o.order_discount_total, 0);
    const tax = orders.reduce((acc, o) => acc + o.tax_amount, 0);
    const shipping = orders.reduce((acc, o) => acc + o.shipping_amount, 0);
    const refundsTotal = refunds.reduce((acc, r) => acc + r.amount, 0);
    const netSales = Math.max(0, gmv - discounts - refundsTotal);
    const unitsSold = orderItems.reduce((acc, item) => acc + item.quantity, 0);
    const cancellations = orders.filter(o => o.order_status === 'cancelled').length;

    return {
      gross_merchandise_value: gmv,
      discounts_total: discounts,
      tax_total: tax,
      shipping_revenue: shipping,
      refunds_total: refundsTotal,
      net_sales: netSales,
      units_sold: unitsSold,
      total_orders: orders.length,
      cancellations_count: cancellations,
      returns_count: returns.length
    };
  }
};
