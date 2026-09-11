/**
 * NEEDLE — Documentation 03 Section 13: FULFILMENT / SHIPMENT MODEL
 * Explicit State-Transition Engine for Shipments
 */

import { ShipmentStatus } from '../types/schema';

const VALID_SHIPMENT_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  unfulfilled: ['packed', 'shipped'],
  packed: ['shipped', 'exception'],
  shipped: ['in_transit', 'out_for_delivery', 'delivered', 'exception'],
  in_transit: ['out_for_delivery', 'delivered', 'exception'],
  out_for_delivery: ['delivered', 'exception'],
  delivered: ['returned'],
  exception: ['in_transit', 'returned'],
  returned: []
};

export class ShipmentDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShipmentDomainException';
  }
}

export const ShipmentStateMachine = {
  canTransition(currentStatus: ShipmentStatus, nextStatus: ShipmentStatus): boolean {
    const allowed = VALID_SHIPMENT_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
  },

  assertTransition(currentStatus: ShipmentStatus, nextStatus: ShipmentStatus): void {
    if (!this.canTransition(currentStatus, nextStatus)) {
      const allowed = VALID_SHIPMENT_TRANSITIONS[currentStatus] || [];
      const allowedStr = allowed.length > 0 ? allowed.join(', ') : 'None (Terminal state)';
      throw new ShipmentDomainException(
        `Invalid shipment transition from "${currentStatus}" to "${nextStatus}". Allowed: [${allowedStr}].`
      );
    }
  }
};
