/**
 * NEEDLE — Documentation 03 Sections 9, 10 & 23: PAYMENT & WEBHOOK ADAPTER
 *
 * Provides a secure payment abstraction layer:
 * - Clear separation of external gateway interface from internal domain
 * - Strict PCI compliance: NEVER stores raw PAN, CVV, PIN, OTP, or passwords
 * - Supports multiple payment attempts per order
 * - Idempotent webhook deduplication via provider_event_id
 */

import { MoneyInCents, PaymentMethodType, PaymentStatus, WebhookEventRecord } from '../types/schema';
import { db } from '../database/DatabaseEngine';

export interface PaymentIntentRequest {
  orderId: string;
  orderNumber: string;
  amount: MoneyInCents;
  currency: string;
  methodType: PaymentMethodType;
  customerEmail: string;
  idempotencyKey?: string;
}

export interface PaymentIntentResult {
  success: boolean;
  provider: string;
  providerPaymentId: string;
  status: PaymentStatus;
  tokenizedReference?: string;
  failureCode?: string;
  failureMessage?: string;
}

export interface RefundGatewayRequest {
  orderId: string;
  paymentId: string;
  providerPaymentId: string;
  amount: MoneyInCents;
  currency: string;
  reason: string;
  idempotencyKey?: string;
}

export interface RefundGatewayResult {
  success: boolean;
  providerRefundId: string;
  status: 'completed' | 'failed';
  failureMessage?: string;
}

export interface WebhookPayload {
  provider: string;
  providerEventId: string;
  eventType: 'payment.success' | 'payment.failed' | 'refund.completed';
  orderId: string;
  providerPaymentId: string;
  amount: MoneyInCents;
  timestamp: string;
  signature?: string;
}

/**
 * Payment Provider Contract Interface
 */
export interface IPaymentProviderAdapter {
  createPaymentAttempt(request: PaymentIntentRequest): Promise<PaymentIntentResult>;
  processRefund(request: RefundGatewayRequest): Promise<RefundGatewayResult>;
  verifyWebhookSignature(payload: WebhookPayload, signature?: string): boolean;
  processWebhook(payload: WebhookPayload): Promise<{ processed: boolean; reason: string }>;
}

/**
 * Development Payment Adapter (Simulates external PCI-compliant gateway e.g. Stripe/Vault)
 *
 * NOTE FOR PRODUCTION:
 * In a live production environment, this adapter connects directly to the external PSP API
 * (e.g. Stripe Elements, Adyen, PayPal SDK) via server-to-server TLS mutual auth.
 * Raw credit card numbers and CVVs are NEVER received or stored by NEEDLE servers.
 */
export class DevelopmentPaymentProviderAdapter implements IPaymentProviderAdapter {
  private providerName = 'needle_vault_adapter';

  async createPaymentAttempt(request: PaymentIntentRequest): Promise<PaymentIntentResult> {
    // Simulate gateway network roundtrip (200ms)
    await new Promise(resolve => setTimeout(resolve, 200));

    // Handle test failure scenarios: amounts ending in 99 cents or specific test triggers
    if (request.customerEmail.includes('failpayment')) {
      return {
        success: false,
        provider: this.providerName,
        providerPaymentId: `tok_fail_${Date.now()}`,
        status: 'failed',
        failureCode: 'CARD_DECLINED_INSUFFICIENT_FUNDS',
        failureMessage: 'The issuer declined the transaction due to insufficient funds.'
      };
    }

    const token = `tok_${request.methodType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      success: true,
      provider: this.providerName,
      providerPaymentId: token,
      status: 'paid',
      tokenizedReference: `ref_ch_${Date.now()}`
    };
  }

  async processRefund(request: RefundGatewayRequest): Promise<RefundGatewayResult> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const refundToken = `re_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      providerRefundId: refundToken,
      status: 'completed'
    };
  }

  verifyWebhookSignature(payload: WebhookPayload, signature?: string): boolean {
    // In production: HMAC-SHA256 verification using webhook secret
    return !!payload.provider && !!payload.providerEventId;
  }

  async processWebhook(payload: WebhookPayload): Promise<{ processed: boolean; reason: string }> {
    // 1. Signature Authenticity Check (Doc 03 Section 23)
    if (!this.verifyWebhookSignature(payload, payload.signature)) {
      return {
        processed: false,
        reason: 'Webhook verification rejected: invalid or missing provider signature'
      };
    }

    // 2. Webhook Deduplication Check (Doc 03 Section 10 & 23)
    if (db.isWebhookProcessed(payload.provider, payload.providerEventId)) {
      return {
        processed: false,
        reason: `Ignored duplicate webhook event [${payload.provider}:${payload.providerEventId}]`
      };
    }

    // 3. Record Webhook Event Record First
    const record: WebhookEventRecord = {
      id: `whk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      provider: payload.provider,
      provider_event_id: payload.providerEventId,
      event_type: payload.eventType,
      payload_hash: `sha256_${Date.now()}`,
      status: 'processed',
      processed_at: new Date().toISOString()
    };
    db.recordWebhookEvent(record);

    // 4. Apply Business State Mutations through Domain Rules (Doc 03 Section 23)
    const now = new Date().toISOString();
    const order = db.getOrderById(payload.orderId);
    if (order) {
      if (payload.eventType === 'payment.success') {
        // Only update if not already paid to preserve idempotency
        if (order.payment_status !== 'paid') {
          db.updateOrder(order.id, {
            payment_status: 'paid',
            order_status: order.order_status === 'pending_payment' ? 'confirmed' : order.order_status,
            paid_at: now
          });

          const payments = db.getPayments(order.id);
          if (payments.length > 0) {
            db.updatePayment(payments[0].id, {
              status: 'paid',
              paid_at: now
            });
          }

          db.appendOrderEvent({
            id: `evt-${Date.now()}`,
            order_id: order.id,
            event_type: 'payment.paid',
            title: 'Payment Confirmed (Webhook)',
            details: `Provider ${payload.provider} verified webhook [${payload.providerEventId}]. Amount: $${(payload.amount / 100).toFixed(2)}`,
            actor_type: 'provider',
            actor_id: payload.provider,
            created_at: now
          });
        }
      } else if (payload.eventType === 'payment.failed') {
        db.updateOrder(order.id, { payment_status: 'failed' });
        const payments = db.getPayments(order.id);
        if (payments.length > 0) {
          db.updatePayment(payments[0].id, { status: 'failed' });
        }
        db.appendOrderEvent({
          id: `evt-${Date.now()}`,
          order_id: order.id,
          event_type: 'payment.failed',
          title: 'Payment Failed (Webhook)',
          details: `Provider ${payload.provider} reported failure on event [${payload.providerEventId}].`,
          actor_type: 'provider',
          actor_id: payload.provider,
          created_at: now
        });
      } else if (payload.eventType === 'refund.completed') {
        db.updateOrder(order.id, { payment_status: 'refunded' });
        db.appendOrderEvent({
          id: `evt-${Date.now()}`,
          order_id: order.id,
          event_type: 'refund.completed',
          title: 'Refund Confirmed (Webhook)',
          details: `Provider confirmed refund for $${(payload.amount / 100).toFixed(2)}.`,
          actor_type: 'provider',
          actor_id: payload.provider,
          created_at: now
        });
      }
    }

    return {
      processed: true,
      reason: `Processed webhook event ${payload.eventType} for order ${payload.orderId}`
    };
  }
}

export const paymentAdapter = new DevelopmentPaymentProviderAdapter();
