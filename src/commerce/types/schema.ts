/**
 * NEEDLE — Documentation 03: Order Management, Database & Commerce Data Specification
 * Relational Entity Definitions & Type Specifications
 */

// Exact financial value represented in smallest currency unit (paise, e.g. ₹2,499.00 -> 249900 paise)
export type MoneyInPaise = number;
export type MoneyInCents = MoneyInPaise; // Backward compatibility alias

export function toPaise(rupees: number): MoneyInPaise {
  return Math.round(rupees * 100);
}
export const toCents = toPaise;

export function toRupees(paise: MoneyInPaise): number {
  return Number((paise / 100).toFixed(2));
}
export const toDollars = toRupees;

export function formatINR(paise: MoneyInPaise): string {
  const rupees = Math.round(paise / 100);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(rupees);
}

export function formatMoney(paise: MoneyInPaise, currencySymbol = '₹'): string {
  return formatINR(paise);
}

// ----------------------------------------------------------------------
// 1. CUSTOMER & ADDRESS (Doc 03 Sections 3 & 4)
// ----------------------------------------------------------------------

export type CustomerStatus = 'active' | 'suspended' | 'deleted_requested';

export interface Customer {
  id: string; // UUID
  customer_number: string; // Human-readable e.g. CUST-1001
  first_name: string;
  last_name?: string;
  email: string; // Unique
  phone?: string;
  password_hash?: string;
  status: CustomerStatus;
  email_verified_at?: string; // ISO UTC
  created_at: string; // ISO UTC
  updated_at: string; // ISO UTC
}

export type AddressType = 'shipping' | 'billing';

export interface Address {
  id: string; // UUID
  customer_id?: string; // UUID, null for guest snapshot
  address_type: AddressType;
  recipient_name: string;
  phone: string;
  line_1: string;
  line_2?: string;
  landmark?: string;
  city: string;
  state: string;
  postal_code: string;
  country_code: string; // ISO-2 e.g. 'US'
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------
// 2. PRODUCT, VARIANT & INVENTORY (Doc 03 Section 5)
// ----------------------------------------------------------------------

export type ProductPublishStatus = 'published' | 'draft' | 'archived';

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  status: ProductPublishStatus;
  description: string;
  material: string;
  fit: string;
  care: string;
  primary_image: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariantRecord {
  id: string;
  product_id: string;
  sku: string; // Unique
  color: string;
  color_hex?: string;
  size: string;
  price: MoneyInCents;
  sale_price?: MoneyInCents;
  cost_price?: MoneyInCents;
  image?: string;
  status: 'active' | 'archived';
}

export interface InventoryRecord {
  variant_id: string; // FK to ProductVariantRecord (1-to-1)
  on_hand_qty: number;
  reserved_qty: number;
  low_stock_threshold: number;
  updated_at: string;
}

export type InventoryMovementReason =
  | 'Restock shipment received'
  | 'Order fulfillment'
  | 'Order cancellation restock'
  | 'Customer return restock'
  | 'Inventory audit discrepancy'
  | 'Damaged goods write-off'
  | 'Manual adjustment'
  | 'Temporary reservation';

export interface InventoryMovementRecord {
  id: string;
  variant_id: string;
  quantity_delta: number; // positive or negative
  reason: InventoryMovementReason;
  reference_type: 'order' | 'restock' | 'audit' | 'return' | 'manual';
  reference_id?: string;
  actor_id: string;
  created_at: string;
}

// ----------------------------------------------------------------------
// 3. ORDER & ORDER ITEMS (Doc 03 Sections 6, 7 & 8)
// ----------------------------------------------------------------------

export type OrderStatus =
  | 'pending_payment'
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'closed';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'partially_refunded'
  | 'refunded';

export type FulfillmentStatus =
  | 'unfulfilled'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderRecord {
  id: string; // UUID
  order_number: string; // Human-readable unique e.g. ND8492
  customer_id?: string; // null for guest checkout
  customer_email: string; // snapshot at order time
  customer_phone?: string; // snapshot at order time
  currency: string; // 'USD'
  subtotal: MoneyInCents;
  item_discount_total: MoneyInCents;
  order_discount_total: MoneyInCents;
  shipping_amount: MoneyInCents;
  tax_amount: MoneyInCents;
  grand_total: MoneyInCents;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  order_status: OrderStatus;
  shipping_method?: string;
  tracking_number?: string;
  carrier?: string;
  placed_at: string;
  paid_at?: string;
  cancelled_at?: string;
  delivered_at?: string;
  notes?: string;
  idempotency_key?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  sku_snapshot: string;
  product_name_snapshot: string;
  variant_snapshot?: string; // color / size
  primary_image_snapshot?: string;
  quantity: number;
  unit_price: MoneyInCents;
  discount_amount: MoneyInCents;
  tax_amount: MoneyInCents;
  line_total: MoneyInCents;
  created_at: string;
}

export interface OrderAddressSnapshotRecord {
  id: string;
  order_id: string;
  recipient_name: string;
  phone: string;
  line_1: string;
  line_2?: string;
  landmark?: string;
  city: string;
  state: string;
  postal_code: string;
  country_code: string;
  created_at: string;
}

// ----------------------------------------------------------------------
// 4. PAYMENT & PAYMENT ATTEMPTS (Doc 03 Sections 9 & 10)
// ----------------------------------------------------------------------

export type PaymentMethodType = 'card' | 'apple_pay' | 'cod' | 'upi' | 'net_banking';

export interface PaymentRecord {
  id: string; // UUID
  order_id: string;
  provider: string; // e.g. 'needle_vault_adapter', 'stripe', 'cod'
  provider_payment_id: string; // tokenized reference, e.g. 'pi_live_...'
  amount: MoneyInCents;
  currency: string;
  status: PaymentStatus;
  method_type: PaymentMethodType;
  failure_code?: string;
  failure_message?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentAttemptRecord {
  id: string;
  payment_id: string;
  order_id: string;
  attempt_number: number;
  amount: MoneyInCents;
  provider_reference: string;
  status: PaymentStatus;
  failure_code?: string;
  failure_message?: string;
  created_at: string;
}

// ----------------------------------------------------------------------
// 5. FULFILMENT / SHIPMENT (Doc 03 Section 13)
// ----------------------------------------------------------------------

export type ShipmentStatus =
  | 'unfulfilled'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'returned';

export interface FulfilmentRecord {
  id: string;
  order_id: string;
  carrier: string;
  service: string;
  tracking_number: string;
  tracking_url?: string;
  status: ShipmentStatus;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------
// 6. ORDER EVENT / TIMELINE (Doc 03 Section 14)
// ----------------------------------------------------------------------

export type OrderEventType =
  | 'order.created'
  | 'payment.pending'
  | 'payment.paid'
  | 'payment.failed'
  | 'order.confirmed'
  | 'order.processing'
  | 'order.packed'
  | 'shipment.created'
  | 'shipment.shipped'
  | 'shipment.delivered'
  | 'order.cancelled'
  | 'refund.created'
  | 'refund.completed'
  | 'return.requested'
  | 'return.received'
  | 'return.completed';

export interface OrderEventRecord {
  id: string;
  order_id: string;
  event_type: OrderEventType;
  title: string;
  details?: string;
  actor_type: 'customer' | 'admin' | 'system' | 'provider';
  actor_id: string;
  created_at: string; // ISO UTC
}

// ----------------------------------------------------------------------
// 7. RETURN REQUEST & REFUND (Doc 03 Sections 15 & 16)
// ----------------------------------------------------------------------

export type ReturnReasonCode =
  | 'wrong_size'
  | 'damaged_item'
  | 'color_mismatch'
  | 'defective_fabric'
  | 'changed_mind'
  | 'other';

export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'inspected'
  | 'completed';

export type ReturnResolution = 'refund' | 'exchange' | 'store_credit';

export interface ReturnRequestRecord {
  id: string;
  order_id: string;
  customer_id?: string;
  reason_code: ReturnReasonCode;
  customer_note?: string;
  status: ReturnStatus;
  requested_at: string;
  approved_at?: string;
  in_transit_at?: string;
  received_at?: string;
  inspected_at?: string;
  completed_at?: string;
  resolution: ReturnResolution;
  restocked?: boolean;
  created_at: string;
  updated_at: string;
}

export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface RefundRecord {
  id: string;
  order_id: string;
  payment_id: string;
  amount: MoneyInCents;
  currency: string;
  reason: string;
  provider_refund_id: string;
  status: RefundStatus;
  requested_by: string; // Admin ID or system
  created_at: string;
  completed_at?: string;
  restocked?: boolean;
}

// ----------------------------------------------------------------------
// 8. CART & CART ITEMS (Doc 03 Section 17)
// ----------------------------------------------------------------------

export interface CartRecord {
  id: string;
  customer_id?: string;
  session_id?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface CartItemRecord {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  unit_price: MoneyInCents;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------
// 8. WEBHOOK EVENT DEDUPLICATION (Doc 03 Sections 10 & 23)
// ----------------------------------------------------------------------

export interface WebhookEventRecord {
  id: string;
  provider: string;
  provider_event_id: string; // Unique deduplication key
  event_type: string;
  payload_hash: string;
  status: 'processed' | 'ignored_duplicate' | 'failed';
  processed_at: string;
}

// ----------------------------------------------------------------------
// 9. COMMERCE REPORTING AGGREGATE (Doc 03 Section 27)
// ----------------------------------------------------------------------

export interface CommerceReportingSummary {
  gross_merchandise_value: MoneyInCents;
  discounts_total: MoneyInCents;
  tax_total: MoneyInCents;
  shipping_revenue: MoneyInCents;
  refunds_total: MoneyInCents;
  net_sales: MoneyInCents; // GMV - discounts - refunds
  units_sold: number;
  total_orders: number;
  cancellations_count: number;
  returns_count: number;
}
