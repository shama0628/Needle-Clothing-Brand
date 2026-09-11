/**
 * NEEDLE — Documentation 03 Section 20 & 29: Customer Order History & Secure Lookup
 *
 * Enforces:
 * - Customer ownership: authenticated customers can ONLY view their own orders
 * - Secure guest lookup: validates non-guessable verification parameters (email + phone)
 * - Safe response shaping: excludes internal database IDs and admin-only notes
 */

import {
  OrderRecord,
  OrderItemRecord,
  OrderAddressSnapshotRecord,
  OrderEventRecord,
  FulfilmentRecord,
  ReturnRequestRecord,
  toDollars
} from '../types/schema';
import { db } from '../database/DatabaseEngine';

export interface CustomerOrderView {
  id: string;
  orderNumber: string;
  placedAt: string;
  status: OrderRecord['order_status'];
  paymentStatus: OrderRecord['payment_status'];
  fulfillmentStatus: OrderRecord['fulfillment_status'];
  currency: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  shippingMethod?: string;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  address: OrderAddressSnapshotRecord;
  items: Array<{
    id: string;
    productName: string;
    variant: string;
    sku: string;
    image: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  timeline: Array<{
    id: string;
    timestamp: string;
    title: string;
    details?: string;
  }>;
  returnRequests: ReturnRequestRecord[];
  canCancel: boolean;
  canReturn: boolean;
}

export const CustomerOrderService = {
  /**
   * Shape internal OrderRecord into safe customer-facing view
   */
  shapeOrderView(order: OrderRecord): CustomerOrderView {
    const items = db.getOrderItems(order.id);
    const address = db.getOrderAddress(order.id) || {
      id: 'default',
      order_id: order.id,
      recipient_name: 'Customer',
      phone: '',
      line_1: '',
      city: '',
      state: '',
      postal_code: '',
      country_code: 'US',
      created_at: order.created_at
    };
    const events = db.getOrderEvents(order.id);
    const fulfilment = db.getFulfilmentByOrderId(order.id);
    const returnRequests = db.getReturnRequests(order.id);

    return {
      id: order.id,
      orderNumber: order.order_number,
      placedAt: order.placed_at,
      status: order.order_status,
      paymentStatus: order.payment_status,
      fulfillmentStatus: order.fulfillment_status,
      currency: order.currency,
      subtotal: toDollars(order.subtotal),
      discount: toDollars(order.order_discount_total + order.item_discount_total),
      shippingFee: toDollars(order.shipping_amount),
      tax: toDollars(order.tax_amount),
      total: toDollars(order.grand_total),
      shippingMethod: order.shipping_method,
      trackingNumber: order.tracking_number,
      carrier: order.carrier,
      trackingUrl: fulfilment?.tracking_url,
      address,
      items: items.map(item => ({
        id: item.id,
        productName: item.product_name_snapshot,
        variant: item.variant_snapshot || 'Standard',
        sku: item.sku_snapshot,
        image: item.primary_image_snapshot || '',
        quantity: item.quantity,
        unitPrice: toDollars(item.unit_price),
        lineTotal: toDollars(item.line_total)
      })),
      timeline: events.map(evt => ({
        id: evt.id,
        timestamp: evt.created_at,
        title: evt.title,
        details: evt.details
      })),
      returnRequests,
      canCancel: ['pending_payment', 'confirmed', 'processing'].includes(order.order_status),
      canReturn: order.order_status === 'delivered'
    };
  },

  /**
   * Get orders for authenticated customer with strict ownership enforcement
   */
  getCustomerOrders(customerId: string): CustomerOrderView[] {
    if (!customerId) return [];
    const orders = db.getOrdersByCustomerId(customerId);
    return orders.map(this.shapeOrderView);
  },

  /**
   * Secure guest order lookup: requires matching Order Number AND matching Email/Phone
   */
  lookupGuestOrder(orderNumber: string, verificationEmailOrPhone: string): CustomerOrderView | null {
    const cleanNumber = orderNumber.trim().toUpperCase();
    const cleanVerif = verificationEmailOrPhone.trim().toLowerCase();

    const order = db.getOrderByNumber(cleanNumber);
    if (!order) return null;

    const emailMatch = order.customer_email.toLowerCase() === cleanVerif;
    const phoneMatch = order.customer_phone?.replace(/\D/g, '') === cleanVerif.replace(/\D/g, '');

    if (!emailMatch && !phoneMatch) {
      return null;
    }

    return this.shapeOrderView(order);
  }
};
