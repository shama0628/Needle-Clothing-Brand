/**
 * NEEDLE — Documentation 03: ORDER MANAGEMENT, DATABASE & COMMERCE DATA SPECIFICATION
 * Relational Database & Repository Contract (DAL Interface)
 *
 * ARCHITECTURAL CLASSIFICATION:
 * - In Development (Client-side Vite SPA): Implemented by `DatabaseEngine.ts` as an in-browser
 *   relational simulation engine using write-ahead localStorage snapshot persistence and transactional workspaces.
 * - In Production: Implemented by server-side Node.js relational database repositories
 *   (e.g., PostgreSQL with pg/Prisma/Kysely or SQLite with better-sqlite3) connecting to real SQL instances.
 *
 * STATUS: Real PostgreSQL/SQLite server connection is BLOCKED — EXTERNAL DEPENDENCY
 * (Requires standalone backend server container and database hosting infrastructure).
 */

import {
  Customer,
  Address,
  ProductRecord,
  ProductVariantRecord,
  InventoryRecord,
  InventoryMovementRecord,
  OrderRecord,
  OrderItemRecord,
  OrderAddressSnapshotRecord,
  PaymentRecord,
  PaymentAttemptRecord,
  FulfilmentRecord,
  OrderEventRecord,
  ReturnRequestRecord,
  RefundRecord,
  WebhookEventRecord
} from '../types/schema';

export interface ICommerceDatabase {
  // Transaction boundaries (ACID guarantees)
  beginTransaction(): void;
  commit(): void;
  rollback(): void;
  transaction<T>(callback: (db: ICommerceDatabase) => Promise<T> | T): Promise<T>;

  // Customer & Address Repository
  getCustomers(): Customer[];
  getCustomerById(id: string): Customer | undefined;
  getCustomerByEmail(email: string): Customer | undefined;
  getAddresses(customerId?: string): Address[];

  // Catalog & Inventory Repository
  getProducts(): ProductRecord[];
  getProductById(id: string): ProductRecord | undefined;
  getProductVariants(productId?: string): ProductVariantRecord[];
  getVariantById(variantId: string): ProductVariantRecord | undefined;
  getVariantBySku(sku: string): ProductVariantRecord | undefined;
  getInventory(variantId: string): InventoryRecord | undefined;
  getAllInventory(): InventoryRecord[];
  getInventoryMovements(variantId?: string): InventoryMovementRecord[];
  adjustStock(
    variantId: string,
    delta: number,
    reason: InventoryMovementRecord['reason'],
    referenceType: InventoryMovementRecord['reference_type'],
    referenceId?: string,
    actorId?: string
  ): { newOnHand: number; newReserved: number };

  // Orders & Snapshots Repository
  getOrders(): OrderRecord[];
  getOrderById(orderId: string): OrderRecord | undefined;
  getOrderByNumber(orderNumber: string): OrderRecord | undefined;
  getOrderByIdempotencyKey(key: string): OrderRecord | undefined;
  getOrderItems(orderId: string): OrderItemRecord[];
  getOrderAddress(orderId: string): OrderAddressSnapshotRecord | undefined;
  insertOrder(order: OrderRecord): OrderRecord;
  updateOrder(orderId: string, updates: Partial<OrderRecord>): OrderRecord;
  insertOrderItem(item: OrderItemRecord): OrderItemRecord;
  insertOrderAddress(address: OrderAddressSnapshotRecord): OrderAddressSnapshotRecord;

  // Payments Repository
  getPayments(orderId?: string): PaymentRecord[];
  insertPayment(payment: PaymentRecord): PaymentRecord;
  updatePayment(paymentId: string, updates: Partial<PaymentRecord>): PaymentRecord;
  insertPaymentAttempt(attempt: PaymentAttemptRecord): PaymentAttemptRecord;

  // Fulfilments Repository
  getFulfilments(orderId?: string): FulfilmentRecord[];
  getFulfilmentByOrderId(orderId: string): FulfilmentRecord | undefined;
  insertFulfilment(fulfilment: FulfilmentRecord): FulfilmentRecord;
  updateFulfilment(fulfilmentId: string, updates: Partial<FulfilmentRecord>): FulfilmentRecord;

  // Order Timeline Events
  getOrderEvents(orderId: string): OrderEventRecord[];
  appendOrderEvent(event: OrderEventRecord): OrderEventRecord;

  // Return Requests Repository
  getReturnRequests(orderId?: string): ReturnRequestRecord[];
  getReturnRequestById(id: string): ReturnRequestRecord | undefined;
  insertReturnRequest(request: ReturnRequestRecord): ReturnRequestRecord;
  updateReturnRequest(id: string, updates: Partial<ReturnRequestRecord>): ReturnRequestRecord;

  // Refunds Repository
  getRefunds(orderId?: string): RefundRecord[];
  insertRefund(refund: RefundRecord): RefundRecord;

  // Webhook Deduplication Repository
  isWebhookProcessed(provider: string, providerEventId: string): boolean;
  recordWebhookEvent(event: WebhookEventRecord): WebhookEventRecord;
}
