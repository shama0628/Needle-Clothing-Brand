/**
 * NEEDLE — Documentation 03 Section 15: RETURN_REQUEST MODEL
 * Explicit State-Transition Engine for Returns
 */

import { ReturnStatus } from '../types/schema';

const VALID_RETURN_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  requested: ['approved', 'rejected'],
  approved: ['in_transit', 'received'],
  rejected: [],
  in_transit: ['received'],
  received: ['inspected'],
  inspected: ['completed'],
  completed: []
};

export class ReturnDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReturnDomainException';
  }
}

export const ReturnStateMachine = {
  canTransition(currentStatus: ReturnStatus, nextStatus: ReturnStatus): boolean {
    const allowed = VALID_RETURN_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
  },

  assertTransition(currentStatus: ReturnStatus, nextStatus: ReturnStatus): void {
    if (!this.canTransition(currentStatus, nextStatus)) {
      const allowed = VALID_RETURN_TRANSITIONS[currentStatus] || [];
      const allowedStr = allowed.length > 0 ? allowed.join(', ') : 'None (Terminal state)';
      throw new ReturnDomainException(
        `Invalid return request transition from "${currentStatus}" to "${nextStatus}". Allowed: [${allowedStr}].`
      );
    }
  }
};
