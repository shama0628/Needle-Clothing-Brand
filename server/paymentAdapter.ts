import crypto from 'crypto';

export interface PaymentOrderParams {
  orderId: string;
  orderNumber: string;
  amountPaise: number;
  currency: string;
  method: 'card' | 'upi' | 'net_banking' | 'cod';
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PaymentOrderResult {
  provider: string;
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  isDevelopmentMode: boolean;
  upiDetails?: {
    vpa?: string;
    intentUrl?: string;
    qrString?: string;
  };
}

export interface PaymentVerificationParams {
  orderId: string;
  providerPaymentId: string;
  providerOrderId?: string;
  signature?: string;
  method: 'card' | 'upi' | 'net_banking' | 'cod';
}

export interface PaymentVerificationResult {
  success: boolean;
  status: 'paid' | 'authorized' | 'failed';
  providerPaymentId: string;
  method: string;
  failureReason?: string;
}

const PAYMENT_KEY_ID = process.env.PAYMENT_KEY_ID || 'rzp_test_NeedleAtelier2026';
const PAYMENT_KEY_SECRET = process.env.PAYMENT_KEY_SECRET || 'dev_secret_needle_atelier_secure_9921';
const PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'dev_webhook_secret_needle_2026';

export const isLivePaymentConfigured = Boolean(
  process.env.PAYMENT_KEY_ID &&
  process.env.PAYMENT_KEY_SECRET &&
  !process.env.PAYMENT_KEY_ID.startsWith('rzp_test_NeedleAtelier')
);

export class PaymentAdapter {
  static createPaymentOrder(params: PaymentOrderParams): PaymentOrderResult {
    const isDev = !isLivePaymentConfigured;
    const providerOrderId = `order_${params.orderNumber.toLowerCase()}_${Date.now().toString(36)}`;

    const result: PaymentOrderResult = {
      provider: 'razorpay',
      providerOrderId,
      amountPaise: params.amountPaise,
      currency: params.currency || 'INR',
      keyId: PAYMENT_KEY_ID,
      isDevelopmentMode: isDev
    };

    if (params.method === 'upi') {
      const rupees = (params.amountPaise / 100).toFixed(2);
      // Generate standard UPI Intent URL: upi://pay?pa=...&pn=...&am=...&cu=INR
      const upiVpa = 'needle.atelier@okhdfcbank';
      const upiUrl = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent('NEEDLE Atelier')}&am=${rupees}&cu=INR&tn=${encodeURIComponent(`Order ${params.orderNumber}`)}`;
      
      result.upiDetails = {
        vpa: upiVpa,
        intentUrl: upiUrl,
        qrString: upiUrl
      };
    }

    return result;
  }

  static verifyPayment(params: PaymentVerificationParams): PaymentVerificationResult {
    // For COD: automatically valid upon order placement
    if (params.method === 'cod') {
      return {
        success: true,
        status: 'authorized', // COD is authorized upon checkout, collected on delivery
        providerPaymentId: `cod_${Date.now()}`,
        method: 'cod'
      };
    }

    // In development mode: accept valid test payments
    if (!isLivePaymentConfigured) {
      // In development mode, verify non-empty provider payment ID
      if (params.providerPaymentId) {
        return {
          success: true,
          status: 'paid',
          providerPaymentId: params.providerPaymentId,
          method: params.method
        };
      }
      return {
        success: false,
        status: 'failed',
        providerPaymentId: params.providerPaymentId || '',
        method: params.method,
        failureReason: 'Missing payment transaction identifier'
      };
    }

    // Live mode signature verification
    if (!params.providerOrderId || !params.signature) {
      return {
        success: false,
        status: 'failed',
        providerPaymentId: params.providerPaymentId,
        method: params.method,
        failureReason: 'Missing provider order ID or cryptographic signature'
      };
    }

    const payload = `${params.providerOrderId}|${params.providerPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', PAYMENT_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(params.signature),
      Buffer.from(expectedSignature)
    );

    if (isValid) {
      return {
        success: true,
        status: 'paid',
        providerPaymentId: params.providerPaymentId,
        method: params.method
      };
    } else {
      return {
        success: false,
        status: 'failed',
        providerPaymentId: params.providerPaymentId,
        method: params.method,
        failureReason: 'Invalid payment signature verification'
      };
    }
  }

  static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature) return false;
    const expectedSignature = crypto
      .createHmac('sha256', PAYMENT_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }

  static refundPayment(paymentId: string, amountPaise: number, reason: string): { success: boolean; refundId: string; status: 'completed' | 'failed'; error?: string } {
    const refundId = `rfnd_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
    return {
      success: true,
      refundId,
      status: 'completed'
    };
  }
}
