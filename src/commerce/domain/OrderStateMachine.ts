/**
 * NEEDLE — Documentation 03 Section 11: ORDER STATUS MODEL
 * Explicit State-Transition Engine for Orders
 */

import { OrderStatus } from '../types/schema';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['confirmed', 'cancelled'],
  placed: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['closed'],
  cancelled: ['refunded', 'closed'],
  refunded: ['closed'],
  closed: []
};

export class OrderDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderDomainException';
  }
}

export const OrderStateMachine = {
  /**
   * Check if a transition from currentStatus to nextStatus is permitted
   */
  canTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
  },

  /**
   * Validate and assert transition, throwing OrderDomainException if invalid
   */
  assertTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): void {
    if (!this.canTransition(currentStatus, nextStatus)) {
      const allowed = VALID_TRANSITIONS[currentStatus] || [];
      const allowedStr = allowed.length > 0 ? allowed.join(', ') : 'None (Terminal state)';
      throw new OrderDomainException(
        `Invalid order state transition from "${currentStatus}" to "${nextStatus}". Allowed next states: [${allowedStr}].`
      );
    }
  },

  /**
   * Get valid next states for a given status
   */
  getNextValidStates(currentStatus: OrderStatus): OrderStatus[] {
    return VALID_TRANSITIONS[currentStatus] || [];
  },

  /**
   * Check if order is eligible for customer or admin cancellation
   */
  canCancel(status: OrderStatus): boolean {
    return ['pending_payment', 'placed', 'confirmed', 'processing'].includes(status);
  },

  /**
   * Check if order is eligible for customer return request
   */
  canRequestReturn(status: OrderStatus): boolean {
    return status === 'delivered';
  }
};
