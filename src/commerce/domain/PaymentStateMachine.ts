/**
 * NEEDLE — Documentation 03 Section 12: PAYMENT STATUS MODEL
 * Explicit State-Transition Engine for Payments
 */

import { PaymentStatus } from '../types/schema';

const VALID_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ['authorized', 'paid', 'failed', 'cancelled'],
  authorized: ['paid', 'failed', 'cancelled'],
  paid: ['partially_refunded', 'refunded'],
  partially_refunded: ['refunded'],
  failed: ['pending'], // Retry allows a new attempt
  cancelled: [],
  refunded: []
};

export class PaymentDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentDomainException';
  }
}

export const PaymentStateMachine = {
  canTransition(currentStatus: PaymentStatus, nextStatus: PaymentStatus): boolean {
    const allowed = VALID_PAYMENT_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
  },

  assertTransition(currentStatus: PaymentStatus, nextStatus: PaymentStatus): void {
    if (!this.canTransition(currentStatus, nextStatus)) {
      const allowed = VALID_PAYMENT_TRANSITIONS[currentStatus] || [];
      const allowedStr = allowed.length > 0 ? allowed.join(', ') : 'None (Terminal state)';
      throw new PaymentDomainException(
        `Invalid payment state transition from "${currentStatus}" to "${nextStatus}". Allowed next states: [${allowedStr}].`
      );
    }
  },

  canRefund(currentStatus: PaymentStatus): boolean {
    return currentStatus === 'paid' || currentStatus === 'partially_refunded';
  }
};
