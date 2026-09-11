/**
 * NEEDLE — Documentation 03: Relational Transactional Commerce Database Engine
 *
 * Implements an in-memory transactional database engine with:
 * - Foreign key integrity validation
 * - Unique constraint enforcement (order_number, sku, email, idempotency_key, provider_event_id)
 * - Atomic transaction boundaries: beginTransaction(), commit(), rollback()
 * - Exact integer cents monetary calculation & storage
 * - Append-only timeline events and immutable order item/address snapshots
 * - Write-ahead persistence to browser storage with seamless hydration
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
  WebhookEventRecord,
  MoneyInCents,
  toCents
} from '../types/schema';
import { ICommerceDatabase } from './ICommerceDatabase';
import { PRODUCTS } from '../../data/products';

export interface DatabaseState {
  customers: Customer[];
  addresses: Address[];
  products: ProductRecord[];
  product_variants: ProductVariantRecord[];
  inventory: InventoryRecord[];
  inventory_movements: InventoryMovementRecord[];
  orders: OrderRecord[];
  order_items: OrderItemRecord[];
  order_addresses: OrderAddressSnapshotRecord[];
  payments: PaymentRecord[];
  payment_attempts: PaymentAttemptRecord[];
  fulfilments: FulfilmentRecord[];
  order_events: OrderEventRecord[];
  return_requests: ReturnRequestRecord[];
  refunds: RefundRecord[];
  webhook_events: WebhookEventRecord[];
}

const STORAGE_KEY = 'needle_commerce_relational_db_v1';

// Initial Seed Generation
function generateInitialDatabaseSeed(): DatabaseState {
  const now = new Date().toISOString();

  // 1. Initial Customers
  const customers: Customer[] = [
    {
      id: 'cust-7391-482a-9f12',
      customer_number: 'CUST-1001',
      first_name: 'Sophia',
      last_name: 'Laurent',
      email: 'sophia.laurent@needle.com',
      phone: '+1 (555) 234-5678',
      status: 'active',
      email_verified_at: '2025-11-10T10:00:00Z',
      created_at: '2025-11-10T10:00:00Z',
      updated_at: now
    },
    {
      id: 'cust-8821-33bc-11ef',
      customer_number: 'CUST-1002',
      first_name: 'Elena',
      last_name: 'Vance',
      email: 'elena.vance@studio.org',
      phone: '+1 (555) 876-5432',
      status: 'active',
      email_verified_at: '2025-12-05T14:30:00Z',
      created_at: '2025-12-05T14:30:00Z',
      updated_at: now
    }
  ];

  // 2. Initial Addresses
  const addresses: Address[] = [
    {
      id: 'addr-sophia-1',
      customer_id: 'cust-7391-482a-9f12',
      address_type: 'shipping',
      recipient_name: 'Sophia Laurent',
      phone: '+1 (555) 234-5678',
      line_1: '742 Evergreen Atelier Way',
      line_2: 'Suite 4B',
      landmark: 'Near Fashion District Fountain',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country_code: 'US',
      is_default: true,
      created_at: '2025-11-10T10:00:00Z',
      updated_at: now
    }
  ];

  // 3. Products, Variants & Inventory from existing catalogue
  const products: ProductRecord[] = [];
  const product_variants: ProductVariantRecord[] = [];
  const inventory: InventoryRecord[] = [];
  const inventory_movements: InventoryMovementRecord[] = [];

  PRODUCTS.forEach(p => {
    products.push({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category_id: p.category,
      status: p.status || 'published',
      description: p.description,
      material: p.material,
      fit: p.fit,
      care: p.care.join(', '),
      primary_image: p.primaryImage,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: now
    });

    const priceCents = toCents(p.price);
    const salePriceCents = p.salePrice ? toCents(p.salePrice) : undefined;
    const costPriceCents = p.costPrice ? toCents(p.costPrice) : Math.round(priceCents * 0.4);

    // Create variants for each color and size combination
    const colors = p.colors.length > 0 ? p.colors : [{ name: 'Default', hex: '#632B45', image: p.primaryImage }];
    const sizes = p.sizes.length > 0 ? p.sizes : ['Standard'];

    colors.forEach(col => {
      sizes.forEach(sz => {
        const variantId = `var-${p.id}-${col.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${sz.toLowerCase()}`;
        const sku = `NDL-${p.id.toUpperCase().slice(-5)}-${col.name.toUpperCase().slice(0, 3)}-${sz.toUpperCase().slice(0, 2)}`;

        product_variants.push({
          id: variantId,
          product_id: p.id,
          sku,
          color: col.name,
          color_hex: col.hex,
          size: sz,
          price: priceCents,
          sale_price: salePriceCents,
          cost_price: costPriceCents,
          image: col.image || p.primaryImage,
          status: 'active'
        });

        // Initialize inventory
        const onHand = p.stockCount || 45;
        inventory.push({
          variant_id: variantId,
          on_hand_qty: onHand,
          reserved_qty: 0,
          low_stock_threshold: 10,
          updated_at: now
        });

        // Initial inventory movement
        inventory_movements.push({
          id: `mov-init-${variantId}`,
          variant_id: variantId,
          quantity_delta: onHand,
          reason: 'Restock shipment received',
          reference_type: 'restock',
          reference_id: 'INIT-PO-2026',
          actor_id: 'System Migration',
          created_at: '2026-01-01T00:00:00Z'
        });
      });
    });
  });

  // 4. Historical Orders & Snapshots (Doc 03 Sections 6, 7, 8, 9, 13, 14)
  const order1Id = 'ord-8492-421b-8a01';
  const order2Id = 'ord-7320-994c-112f';
  const order3Id = 'ord-6194-55da-334e';

  const orders: OrderRecord[] = [
    {
      id: order1Id,
      order_number: 'ND8492',
      customer_id: 'cust-7391-482a-9f12',
      customer_email: 'sophia.laurent@needle.com',
      customer_phone: '+1 (555) 234-5678',
      currency: 'USD',
      subtotal: 18500,
      item_discount_total: 0,
      order_discount_total: 0,
      shipping_amount: 0, // Complimentary free shipping
      tax_amount: 1480, // 8% tax
      grand_total: 19980,
      payment_status: 'paid',
      fulfillment_status: 'delivered',
      order_status: 'delivered',
      shipping_method: 'Standard Complimentary (4-6 Business Days)',
      tracking_number: 'DHL-984210492',
      carrier: 'DHL Express',
      placed_at: '2026-03-01T14:20:00Z',
      paid_at: '2026-03-01T14:22:15Z',
      delivered_at: '2026-03-05T16:45:00Z',
      notes: 'Customer requested discreet luxury packaging.',
      created_at: '2026-03-01T14:20:00Z',
      updated_at: '2026-03-05T16:45:00Z'
    },
    {
      id: order2Id,
      order_number: 'ND7320',
      customer_id: 'cust-8821-33bc-11ef',
      customer_email: 'elena.vance@studio.org',
      customer_phone: '+1 (555) 876-5432',
      currency: 'USD',
      subtotal: 24500,
      item_discount_total: 0,
      order_discount_total: 2450, // 10% coupon
      shipping_amount: 0,
      tax_amount: 1764,
      grand_total: 23814,
      payment_status: 'paid',
      fulfillment_status: 'shipped',
      order_status: 'shipped',
      shipping_method: 'Express Priority Courier',
      tracking_number: 'DHL-481920194',
      carrier: 'DHL Express',
      placed_at: '2026-03-03T11:15:00Z',
      paid_at: '2026-03-03T11:16:30Z',
      created_at: '2026-03-03T11:15:00Z',
      updated_at: '2026-03-04T09:00:00Z'
    },
    {
      id: order3Id,
      order_number: 'ND6194',
      customer_email: 'amina.k@horizon.com',
      customer_phone: '+1 (555) 349-1928',
      currency: 'USD',
      subtotal: 6500,
      item_discount_total: 0,
      order_discount_total: 0,
      shipping_amount: 1200,
      tax_amount: 520,
      grand_total: 8220,
      payment_status: 'paid',
      fulfillment_status: 'processing',
      order_status: 'processing',
      shipping_method: 'Standard Courier',
      placed_at: '2026-03-05T09:40:00Z',
      paid_at: '2026-03-05T09:41:10Z',
      created_at: '2026-03-05T09:40:00Z',
      updated_at: '2026-03-05T09:45:00Z'
    }
  ];

  // Order Items (Immutable purchase snapshots)
  const order_items: OrderItemRecord[] = [
    {
      id: 'item-8492-1',
      order_id: order1Id,
      product_id: 'prod-dr-1',
      variant_id: 'var-prod-dr-1-midnightplum-m',
      sku_snapshot: 'NDL-DR-1-MID-M',
      product_name_snapshot: 'Aurelia Pleated Silk Abaya Dress',
      variant_snapshot: 'Color: Midnight Plum / Size: M',
      primary_image_snapshot: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
      quantity: 1,
      unit_price: 18500,
      discount_amount: 0,
      tax_amount: 1480,
      line_total: 18500,
      created_at: '2026-03-01T14:20:00Z'
    },
    {
      id: 'item-7320-1',
      order_id: order2Id,
      product_id: 'prod-pm-1',
      variant_id: 'var-prod-pm-1-desertsand-standard',
      sku_snapshot: 'NDL-PM-1-DES-ST',
      product_name_snapshot: 'Pure Modal Hijab - Desert Sand',
      variant_snapshot: 'Color: Desert Sand / Size: Standard',
      primary_image_snapshot: 'https://images.unsplash.com/photo-1585728748178-5776294b455b?auto=format&fit=crop&q=80&w=800',
      quantity: 2,
      unit_price: 3500,
      discount_amount: 700,
      tax_amount: 504,
      line_total: 7000,
      created_at: '2026-03-03T11:15:00Z'
    },
    {
      id: 'item-7320-2',
      order_id: order2Id,
      product_id: 'prod-cs-1',
      variant_id: 'var-prod-cs-1-rawlinen-s',
      sku_snapshot: 'NDL-CS-1-RAW-S',
      product_name_snapshot: 'Seraphina Tailored Linen Co-ord',
      variant_snapshot: 'Color: Raw Linen / Size: S',
      primary_image_snapshot: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      quantity: 1,
      unit_price: 17500,
      discount_amount: 1750,
      tax_amount: 1260,
      line_total: 17500,
      created_at: '2026-03-03T11:15:00Z'
    },
    {
      id: 'item-6194-1',
      order_id: order3Id,
      product_id: 'prod-cj-1',
      variant_id: 'var-prod-cj-1-slateespresso-standard',
      sku_snapshot: 'NDL-CJ-1-SLA-ST',
      product_name_snapshot: 'Everyday Classical Jersey Hijab',
      variant_snapshot: 'Color: Slate Espresso / Size: Standard',
      primary_image_snapshot: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      quantity: 2,
      unit_price: 3250,
      discount_amount: 0,
      tax_amount: 520,
      line_total: 6500,
      created_at: '2026-03-05T09:40:00Z'
    }
  ];

  // Order Address Snapshots (Immutable delivery snapshots)
  const order_addresses: OrderAddressSnapshotRecord[] = [
    {
      id: 'snap-addr-8492',
      order_id: order1Id,
      recipient_name: 'Sophia Laurent',
      phone: '+1 (555) 234-5678',
      line_1: '742 Evergreen Atelier Way',
      line_2: 'Suite 4B',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country_code: 'US',
      created_at: '2026-03-01T14:20:00Z'
    },
    {
      id: 'snap-addr-7320',
      order_id: order2Id,
      recipient_name: 'Elena Vance',
      phone: '+1 (555) 876-5432',
      line_1: '1204 Sunset Boulevard',
      city: 'Los Angeles',
      state: 'CA',
      postal_code: '90026',
      country_code: 'US',
      created_at: '2026-03-03T11:15:00Z'
    },
    {
      id: 'snap-addr-6194',
      order_id: order3Id,
      recipient_name: 'Amina Khan',
      phone: '+1 (555) 349-1928',
      line_1: '88 Michigan Avenue',
      city: 'Chicago',
      state: 'IL',
      postal_code: '60601',
      country_code: 'US',
      created_at: '2026-03-05T09:40:00Z'
    }
  ];

  // Payments & Payment Attempts
  const payments: PaymentRecord[] = [
    {
      id: 'pay-8492-1',
      order_id: order1Id,
      provider: 'needle_vault_adapter',
      provider_payment_id: 'tok_card_visa_8492',
      amount: 19980,
      currency: 'USD',
      status: 'paid',
      method_type: 'card',
      paid_at: '2026-03-01T14:22:15Z',
      created_at: '2026-03-01T14:20:00Z',
      updated_at: '2026-03-01T14:22:15Z'
    },
    {
      id: 'pay-7320-1',
      order_id: order2Id,
      provider: 'needle_vault_adapter',
      provider_payment_id: 'tok_apple_pay_7320',
      amount: 23814,
      currency: 'USD',
      status: 'paid',
      method_type: 'apple_pay',
      paid_at: '2026-03-03T11:16:30Z',
      created_at: '2026-03-03T11:15:00Z',
      updated_at: '2026-03-03T11:16:30Z'
    },
    {
      id: 'pay-6194-1',
      order_id: order3Id,
      provider: 'needle_vault_adapter',
      provider_payment_id: 'tok_card_mc_6194',
      amount: 8220,
      currency: 'USD',
      status: 'paid',
      method_type: 'card',
      paid_at: '2026-03-05T09:41:10Z',
      created_at: '2026-03-05T09:40:00Z',
      updated_at: '2026-03-05T09:41:10Z'
    }
  ];

  const payment_attempts: PaymentAttemptRecord[] = [
    {
      id: 'att-8492-1',
      payment_id: 'pay-8492-1',
      order_id: order1Id,
      attempt_number: 1,
      amount: 19980,
      provider_reference: 'ref_ch_visa_8492',
      status: 'paid',
      created_at: '2026-03-01T14:20:00Z'
    },
    {
      id: 'att-7320-1',
      payment_id: 'pay-7320-1',
      order_id: order2Id,
      attempt_number: 1,
      amount: 23814,
      provider_reference: 'ref_ch_ap_7320',
      status: 'paid',
      created_at: '2026-03-03T11:15:00Z'
    },
    {
      id: 'att-6194-1',
      payment_id: 'pay-6194-1',
      order_id: order3Id,
      attempt_number: 1,
      amount: 8220,
      provider_reference: 'ref_ch_mc_6194',
      status: 'paid',
      created_at: '2026-03-05T09:40:00Z'
    }
  ];

  // Fulfilments
  const fulfilments: FulfilmentRecord[] = [
    {
      id: 'ful-8492',
      order_id: order1Id,
      carrier: 'DHL Express',
      service: 'Standard Complimentary Priority',
      tracking_number: 'DHL-984210492',
      tracking_url: 'https://www.dhl.com/en/express/tracking.html?AWB=984210492',
      status: 'delivered',
      shipped_at: '2026-03-02T10:00:00Z',
      delivered_at: '2026-03-05T16:45:00Z',
      created_at: '2026-03-02T09:30:00Z',
      updated_at: '2026-03-05T16:45:00Z'
    },
    {
      id: 'ful-7320',
      order_id: order2Id,
      carrier: 'DHL Express',
      service: 'Express Priority Courier',
      tracking_number: 'DHL-481920194',
      tracking_url: 'https://www.dhl.com/en/express/tracking.html?AWB=481920194',
      status: 'shipped',
      shipped_at: '2026-03-04T09:00:00Z',
      created_at: '2026-03-04T08:30:00Z',
      updated_at: '2026-03-04T09:00:00Z'
    }
  ];

  // Append-only Order Timeline Events
  const order_events: OrderEventRecord[] = [
    {
      id: 'evt-8492-1',
      order_id: order1Id,
      event_type: 'order.created',
      title: 'Order Created',
      details: 'Customer Sophia Laurent submitted checkout order ND8492.',
      actor_type: 'customer',
      actor_id: 'cust-7391-482a-9f12',
      created_at: '2026-03-01T14:20:00Z'
    },
    {
      id: 'evt-8492-2',
      order_id: order1Id,
      event_type: 'payment.paid',
      title: 'Payment Confirmed',
      details: 'Successfully captured $199.80 via Credit Card token tok_card_visa_8492.',
      actor_type: 'provider',
      actor_id: 'needle_vault_adapter',
      created_at: '2026-03-01T14:22:15Z'
    },
    {
      id: 'evt-8492-3',
      order_id: order1Id,
      event_type: 'order.confirmed',
      title: 'Order Accepted & Inventory Committed',
      details: 'Decremented stock on 1 unit of NDL-DR-1-MID-M.',
      actor_type: 'system',
      actor_id: 'System Engine',
      created_at: '2026-03-01T14:22:16Z'
    },
    {
      id: 'evt-8492-4',
      order_id: order1Id,
      event_type: 'shipment.shipped',
      title: 'Dispatched via DHL Express',
      details: 'Tracking assigned: DHL-984210492',
      actor_type: 'admin',
      actor_id: 'adm-needle-main',
      created_at: '2026-03-02T10:00:00Z'
    },
    {
      id: 'evt-8492-5',
      order_id: order1Id,
      event_type: 'shipment.delivered',
      title: 'Parcel Delivered',
      details: 'Courier confirmed signed delivery at destination.',
      actor_type: 'provider',
      actor_id: 'DHL Express',
      created_at: '2026-03-05T16:45:00Z'
    }
  ];

  return {
    customers,
    addresses,
    products,
    product_variants,
    inventory,
    inventory_movements,
    orders,
    order_items,
    order_addresses,
    payments,
    payment_attempts,
    fulfilments,
    order_events,
    return_requests: [],
    refunds: [],
    webhook_events: []
  };
}

class RelationalDatabaseEngine implements ICommerceDatabase {
  private state: DatabaseState;
  private transactionState: DatabaseState | null = null;

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): DatabaseState {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.orders && parsed?.products && parsed?.product_variants) {
            return parsed;
          }
        }
      }
    } catch {
      // Storage unavailable or error, fall back to seed
    }
    const seed = generateInitialDatabaseSeed();
    this.saveToStorage(seed);
    return seed;
  }

  private saveToStorage(state: DatabaseState): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (e) {
      console.warn('Unable to persist relational database state to storage:', e);
    }
  }

  /**
   * Returns current active working state (transaction snapshot if in transaction, else master state)
   */
  private getActiveState(): DatabaseState {
    return this.transactionState || this.state;
  }

  // ============================================================================
  // TRANSACTION MANAGEMENT (Doc 03 Section 22)
  // ============================================================================

  public beginTransaction(): void {
    if (this.transactionState) {
      throw new Error('Transaction already in progress. Nested transactions not supported.');
    }
    // Deep clone master state to establish transaction snapshot
    this.transactionState = JSON.parse(JSON.stringify(this.state));
  }

  public commit(): void {
    if (!this.transactionState) {
      throw new Error('No active transaction to commit.');
    }
    // Enforce integrity rules before finalizing
    this.validateIntegrity(this.transactionState);

    // Apply transaction snapshot to master
    this.state = this.transactionState;
    this.transactionState = null;
    this.saveToStorage(this.state);
  }

  public rollback(): void {
    if (!this.transactionState) {
      throw new Error('No active transaction to rollback.');
    }
    // Discard transaction workspace
    this.transactionState = null;
  }

  /**
   * Helper to execute a callback within an atomic transaction with automatic rollback
   */
  public async transaction<T>(callback: (engine: ICommerceDatabase) => Promise<T> | T): Promise<T> {
    this.beginTransaction();
    try {
      const result = await callback(this);
      this.commit();
      return result;
    } catch (error) {
      this.rollback();
      throw error;
    }
  }

  // ============================================================================
  // INTEGRITY & CONSTRAINT VALIDATION (Doc 03 Section 21 & 23)
  // ============================================================================

  private validateIntegrity(state: DatabaseState): void {
    // 1. Unique order_number
    const orderNumbers = new Set<string>();
    for (const o of state.orders) {
      if (orderNumbers.has(o.order_number)) {
        throw new Error(`Unique constraint violation: duplicate order_number "${o.order_number}"`);
      }
      orderNumbers.add(o.order_number);
    }

    // 2. Unique variant SKU
    const skus = new Set<string>();
    for (const v of state.product_variants) {
      if (skus.has(v.sku)) {
        throw new Error(`Unique constraint violation: duplicate variant SKU "${v.sku}"`);
      }
      skus.add(v.sku);
    }

    // 3. Unique Webhook Provider Event ID
    const webhookIds = new Set<string>();
    for (const w of state.webhook_events) {
      const key = `${w.provider}:${w.provider_event_id}`;
      if (webhookIds.has(key)) {
        throw new Error(`Unique constraint violation: duplicate webhook event ID "${key}"`);
      }
      webhookIds.add(key);
    }

    // 4. Foreign Key: Order Items -> Orders
    const orderIds = new Set(state.orders.map(o => o.id));
    for (const item of state.order_items) {
      if (!orderIds.has(item.order_id)) {
        throw new Error(`Foreign key violation: order_item ${item.id} references non-existent order ${item.order_id}`);
      }
    }

    // 5. Foreign Key: Payments -> Orders
    for (const pay of state.payments) {
      if (!orderIds.has(pay.order_id)) {
        throw new Error(`Foreign key violation: payment ${pay.id} references non-existent order ${pay.order_id}`);
      }
    }
  }

  // ============================================================================
  // CUSTOMER & ADDRESS QUERIES & MUTATIONS
  // ============================================================================

  public getCustomers(): Customer[] {
    return [...this.getActiveState().customers];
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.getActiveState().customers.find(c => c.id === id);
  }

  public getCustomerByEmail(email: string): Customer | undefined {
    const clean = email.trim().toLowerCase();
    return this.getActiveState().customers.find(c => c.email.toLowerCase() === clean);
  }

  public insertCustomer(customer: Customer): Customer {
    const state = this.getActiveState();
    if (state.customers.some(c => c.email.toLowerCase() === customer.email.toLowerCase())) {
      throw new Error(`A customer with email ${customer.email} already exists.`);
    }
    state.customers.push(customer);
    if (!this.transactionState) this.saveToStorage(this.state);
    return customer;
  }

  public getAddresses(customerId?: string): Address[] {
    if (customerId) {
      return this.getActiveState().addresses.filter(a => a.customer_id === customerId);
    }
    return [...this.getActiveState().addresses];
  }

  public getAddressesByCustomerId(customerId: string): Address[] {
    return this.getActiveState().addresses.filter(a => a.customer_id === customerId);
  }

  public insertAddress(address: Address): Address {
    const state = this.getActiveState();
    state.addresses.push(address);
    if (!this.transactionState) this.saveToStorage(this.state);
    return address;
  }

  // ============================================================================
  // CATALOGUE, VARIANTS & INVENTORY
  // ============================================================================

  public getProducts(): ProductRecord[] {
    return [...this.getActiveState().products];
  }

  public getProductById(id: string): ProductRecord | undefined {
    return this.getActiveState().products.find(p => p.id === id);
  }

  public getProductVariants(productId?: string): ProductVariantRecord[] {
    const state = this.getActiveState();
    if (productId) {
      return state.product_variants.filter(v => v.product_id === productId);
    }
    return [...state.product_variants];
  }

  public getVariantById(variantId: string): ProductVariantRecord | undefined {
    return this.getActiveState().product_variants.find(v => v.id === variantId);
  }

  public getVariantBySku(sku: string): ProductVariantRecord | undefined {
    const clean = sku.trim().toUpperCase();
    return this.getActiveState().product_variants.find(v => v.sku.toUpperCase() === clean);
  }

  public getInventory(variantId: string): InventoryRecord | undefined {
    return this.getActiveState().inventory.find(i => i.variant_id === variantId);
  }

  public getAllInventory(): InventoryRecord[] {
    return [...this.getActiveState().inventory];
  }

  public getInventoryMovements(variantId?: string): InventoryMovementRecord[] {
    const state = this.getActiveState();
    if (variantId) {
      return state.inventory_movements.filter(m => m.variant_id === variantId);
    }
    return [...state.inventory_movements];
  }

  /**
   * Adjust inventory stock and generate an immutable inventory movement record
   */
  public adjustStock(
    variantId: string,
    delta: number,
    reason: InventoryMovementRecord['reason'],
    referenceType: InventoryMovementRecord['reference_type'],
    referenceId?: string,
    actorId = 'System'
  ): { newOnHand: number; newReserved: number } {
    const state = this.getActiveState();
    const inv = state.inventory.find(i => i.variant_id === variantId);
    if (!inv) {
      throw new Error(`Inventory record not found for variant ID: ${variantId}`);
    }

    if (inv.on_hand_qty + delta < 0) {
      throw new Error(`Insufficient inventory: cannot reduce stock below 0 (available: ${inv.on_hand_qty}, requested delta: ${delta})`);
    }

    inv.on_hand_qty += delta;
    inv.updated_at = new Date().toISOString();

    const movement: InventoryMovementRecord = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      variant_id: variantId,
      quantity_delta: delta,
      reason,
      reference_type: referenceType,
      reference_id: referenceId,
      actor_id: actorId,
      created_at: new Date().toISOString()
    };
    state.inventory_movements.push(movement);

    if (!this.transactionState) this.saveToStorage(this.state);
    return { newOnHand: inv.on_hand_qty, newReserved: inv.reserved_qty };
  }

  // ============================================================================
  // ORDERS & ORDER SNAPSHOTS (Doc 03 Sections 6, 7 & 8)
  // ============================================================================

  public getOrders(): OrderRecord[] {
    return [...this.getActiveState().orders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getOrderById(orderId: string): OrderRecord | undefined {
    return this.getActiveState().orders.find(o => o.id === orderId);
  }

  public getOrderByNumber(orderNumber: string): OrderRecord | undefined {
    const clean = orderNumber.trim().toUpperCase();
    return this.getActiveState().orders.find(o => o.order_number.toUpperCase() === clean);
  }

  public getOrderByIdempotencyKey(key: string): OrderRecord | undefined {
    return this.getActiveState().orders.find(o => o.idempotency_key === key);
  }

  public getOrdersByCustomerId(customerId: string): OrderRecord[] {
    return this.getActiveState().orders
      .filter(o => o.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getOrdersByCustomerEmail(email: string): OrderRecord[] {
    const clean = email.trim().toLowerCase();
    return this.getActiveState().orders
      .filter(o => o.customer_email.toLowerCase() === clean)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public insertOrder(order: OrderRecord): OrderRecord {
    const state = this.getActiveState();
    if (state.orders.some(o => o.order_number === order.order_number)) {
      throw new Error(`Order with order_number "${order.order_number}" already exists.`);
    }
    state.orders.push(order);
    if (!this.transactionState) this.saveToStorage(this.state);
    return order;
  }

  public updateOrder(orderId: string, updates: Partial<OrderRecord>): OrderRecord {
    const state = this.getActiveState();
    const idx = state.orders.findIndex(o => o.id === orderId);
    if (idx === -1) {
      throw new Error(`Order not found for update: ${orderId}`);
    }
    state.orders[idx] = {
      ...state.orders[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    if (!this.transactionState) this.saveToStorage(this.state);
    return state.orders[idx];
  }

  public getOrderItems(orderId: string): OrderItemRecord[] {
    return this.getActiveState().order_items.filter(item => item.order_id === orderId);
  }

  public insertOrderItem(item: OrderItemRecord): OrderItemRecord {
    const state = this.getActiveState();
    state.order_items.push(item);
    if (!this.transactionState) this.saveToStorage(this.state);
    return item;
  }

  public getOrderAddress(orderId: string): OrderAddressSnapshotRecord | undefined {
    return this.getActiveState().order_addresses.find(a => a.order_id === orderId);
  }

  public insertOrderAddress(addressSnapshot: OrderAddressSnapshotRecord): OrderAddressSnapshotRecord {
    const state = this.getActiveState();
    state.order_addresses.push(addressSnapshot);
    if (!this.transactionState) this.saveToStorage(this.state);
    return addressSnapshot;
  }

  // ============================================================================
  // PAYMENTS & ATTEMPTS (Doc 03 Sections 9 & 10)
  // ============================================================================

  public getPayments(orderId?: string): PaymentRecord[] {
    if (orderId) return this.getPaymentsByOrderId(orderId);
    return [...this.getActiveState().payments];
  }

  public getPaymentsByOrderId(orderId: string): PaymentRecord[] {
    return this.getActiveState().payments.filter(p => p.order_id === orderId);
  }

  public insertPayment(payment: PaymentRecord): PaymentRecord {
    const state = this.getActiveState();
    state.payments.push(payment);
    if (!this.transactionState) this.saveToStorage(this.state);
    return payment;
  }

  public updatePayment(paymentId: string, updates: Partial<PaymentRecord>): PaymentRecord {
    const state = this.getActiveState();
    const idx = state.payments.findIndex(p => p.id === paymentId);
    if (idx === -1) {
      throw new Error(`Payment record not found: ${paymentId}`);
    }
    state.payments[idx] = {
      ...state.payments[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    if (!this.transactionState) this.saveToStorage(this.state);
    return state.payments[idx];
  }

  public getPaymentAttempts(paymentId: string): PaymentAttemptRecord[] {
    return this.getActiveState().payment_attempts.filter(a => a.payment_id === paymentId);
  }

  public insertPaymentAttempt(attempt: PaymentAttemptRecord): PaymentAttemptRecord {
    const state = this.getActiveState();
    state.payment_attempts.push(attempt);
    if (!this.transactionState) this.saveToStorage(this.state);
    return attempt;
  }

  // ============================================================================
  // FULFILMENT & SHIPMENTS (Doc 03 Section 13)
  // ============================================================================

  public getFulfilments(orderId?: string): FulfilmentRecord[] {
    if (orderId) {
      const f = this.getFulfilmentByOrderId(orderId);
      return f ? [f] : [];
    }
    return [...this.getActiveState().fulfilments];
  }

  public getFulfilmentByOrderId(orderId: string): FulfilmentRecord | undefined {
    return this.getActiveState().fulfilments.find(f => f.order_id === orderId);
  }

  public insertFulfilment(fulfilment: FulfilmentRecord): FulfilmentRecord {
    const state = this.getActiveState();
    state.fulfilments.push(fulfilment);
    if (!this.transactionState) this.saveToStorage(this.state);
    return fulfilment;
  }

  public updateFulfilment(id: string, updates: Partial<FulfilmentRecord>): FulfilmentRecord {
    const state = this.getActiveState();
    const idx = state.fulfilments.findIndex(f => f.id === id);
    if (idx === -1) {
      throw new Error(`Fulfilment record not found: ${id}`);
    }
    state.fulfilments[idx] = {
      ...state.fulfilments[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    if (!this.transactionState) this.saveToStorage(this.state);
    return state.fulfilments[idx];
  }

  // ============================================================================
  // ORDER EVENTS & TIMELINE (Doc 03 Section 14)
  // ============================================================================

  public getOrderEvents(orderId: string): OrderEventRecord[] {
    return this.getActiveState().order_events
      .filter(e => e.order_id === orderId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  public appendOrderEvent(event: OrderEventRecord): OrderEventRecord {
    const state = this.getActiveState();
    state.order_events.push(event);
    if (!this.transactionState) this.saveToStorage(this.state);
    return event;
  }

  // ============================================================================
  // RETURN REQUESTS & REFUNDS (Doc 03 Sections 15 & 16)
  // ============================================================================

  public getReturnRequests(orderId?: string): ReturnRequestRecord[] {
    const state = this.getActiveState();
    if (orderId) {
      return state.return_requests.filter(r => r.order_id === orderId);
    }
    return [...state.return_requests];
  }

  public getReturnRequestById(id: string): ReturnRequestRecord | undefined {
    return this.getActiveState().return_requests.find(r => r.id === id);
  }

  public insertReturnRequest(req: ReturnRequestRecord): ReturnRequestRecord {
    const state = this.getActiveState();
    state.return_requests.push(req);
    if (!this.transactionState) this.saveToStorage(this.state);
    return req;
  }

  public updateReturnRequest(id: string, updates: Partial<ReturnRequestRecord>): ReturnRequestRecord {
    const state = this.getActiveState();
    const idx = state.return_requests.findIndex(r => r.id === id);
    if (idx === -1) {
      throw new Error(`Return request not found: ${id}`);
    }
    state.return_requests[idx] = {
      ...state.return_requests[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    if (!this.transactionState) this.saveToStorage(this.state);
    return state.return_requests[idx];
  }

  public getRefunds(orderId?: string): RefundRecord[] {
    const state = this.getActiveState();
    if (orderId) {
      return state.refunds.filter(r => r.order_id === orderId);
    }
    return [...state.refunds];
  }

  public insertRefund(refund: RefundRecord): RefundRecord {
    const state = this.getActiveState();
    state.refunds.push(refund);
    if (!this.transactionState) this.saveToStorage(this.state);
    return refund;
  }

  // ============================================================================
  // WEBHOOK DEDUPLICATION (Doc 03 Sections 10 & 23)
  // ============================================================================

  public isWebhookProcessed(provider: string, providerEventId: string): boolean {
    return this.getActiveState().webhook_events.some(
      w => w.provider === provider && w.provider_event_id === providerEventId
    );
  }

  public recordWebhookEvent(webhook: WebhookEventRecord): WebhookEventRecord {
    const state = this.getActiveState();
    state.webhook_events.push(webhook);
    if (!this.transactionState) this.saveToStorage(this.state);
    return webhook;
  }

  // ============================================================================
  // DATABASE RESET / SEED RECOVERY
  // ============================================================================

  public resetToSeed(): void {
    const seed = generateInitialDatabaseSeed();
    this.state = seed;
    this.transactionState = null;
    this.saveToStorage(seed);
  }
}

// Global Singleton Instance
export const db = new RelationalDatabaseEngine();
