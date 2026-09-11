import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { PRODUCTS } from '../src/data/products.js';

const dataDir = path.resolve(process.cwd(), 'data/postgres');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const pgliteInstance = new PGlite(dataDir);

export async function query<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[] }> {
  const result = await pgliteInstance.query<T>(sql, params);
  return { rows: result.rows };
}

export async function transaction<T>(callback: (tx: { query: <R = any>(sql: string, params?: any[]) => Promise<{ rows: R[] }> }) => Promise<T>): Promise<T> {
  return await pgliteInstance.transaction(async (tx) => {
    return await callback({
      query: async <R = any>(sql: string, params: any[] = []) => {
        const res = await tx.query<R>(sql, params);
        return { rows: res.rows };
      }
    });
  });
}

export function hashPassword(password: string): string {
  const salt = 'needle_atelier_salt_2026';
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export async function initDb(): Promise<void> {
  console.log('[PostgreSQL] Initializing tables and schema...');

  await pgliteInstance.exec(`
    -- 1. CUSTOMERS TABLE
    CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY,
        customer_number VARCHAR(32) NOT NULL UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50),
        password_hash VARCHAR(255),
        role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'suspended', 'deleted_requested')),
        email_verified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
    CREATE INDEX IF NOT EXISTS idx_customers_role ON customers(role);

    -- 2. ADDRESSES TABLE
    CREATE TABLE IF NOT EXISTS addresses (
        id UUID PRIMARY KEY,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('shipping', 'billing')),
        recipient_name VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        line_1 VARCHAR(255) NOT NULL,
        line_2 VARCHAR(255),
        landmark VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(30) NOT NULL,
        country_code VARCHAR(2) NOT NULL DEFAULT 'IN',
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. PRODUCTS & VARIANTS
    CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category_id VARCHAR(64) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('published', 'draft', 'archived')),
        description TEXT,
        material VARCHAR(255),
        fit VARCHAR(255),
        care TEXT,
        primary_image TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_variants (
        id VARCHAR(64) PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sku VARCHAR(64) NOT NULL UNIQUE,
        color VARCHAR(100) NOT NULL,
        color_hex VARCHAR(20),
        size VARCHAR(50) NOT NULL,
        price INT NOT NULL CHECK (price >= 0),
        sale_price INT CHECK (sale_price >= 0),
        cost_price INT CHECK (cost_price >= 0),
        image TEXT,
        status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'archived'))
    );

    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);

    -- 4. INVENTORY & INVENTORY MOVEMENTS
    CREATE TABLE IF NOT EXISTS inventory (
        variant_id VARCHAR(64) PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
        on_hand_qty INT NOT NULL DEFAULT 0 CHECK (on_hand_qty >= 0),
        reserved_qty INT NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
        low_stock_threshold INT NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
        id UUID PRIMARY KEY,
        variant_id VARCHAR(64) NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        quantity_delta INT NOT NULL,
        reason VARCHAR(100) NOT NULL,
        reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('order', 'restock', 'audit', 'return', 'manual')),
        reference_id VARCHAR(64),
        actor_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. ORDERS TABLE
    CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        order_number VARCHAR(32) NOT NULL UNIQUE,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        currency VARCHAR(3) NOT NULL DEFAULT 'INR',
        subtotal INT NOT NULL CHECK (subtotal >= 0),
        item_discount_total INT NOT NULL DEFAULT 0 CHECK (item_discount_total >= 0),
        order_discount_total INT NOT NULL DEFAULT 0 CHECK (order_discount_total >= 0),
        shipping_amount INT NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
        tax_amount INT NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
        grand_total INT NOT NULL CHECK (grand_total >= 0),
        payment_status VARCHAR(25) NOT NULL CHECK (payment_status IN ('pending', 'authorized', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded')),
        fulfillment_status VARCHAR(25) NOT NULL CHECK (fulfillment_status IN ('unfulfilled', 'processing', 'packed', 'shipped', 'delivered', 'cancelled')),
        order_status VARCHAR(25) NOT NULL CHECK (order_status IN ('pending_payment', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded', 'closed')),
        shipping_method VARCHAR(100),
        tracking_number VARCHAR(100),
        carrier VARCHAR(100),
        placed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        notes TEXT,
        idempotency_key VARCHAR(128) UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
    CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

    -- 6. ORDER ITEMS TABLE
    CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(64),
        variant_id VARCHAR(64),
        sku_snapshot VARCHAR(64) NOT NULL,
        product_name_snapshot VARCHAR(255) NOT NULL,
        variant_snapshot VARCHAR(150),
        primary_image_snapshot TEXT,
        quantity INT NOT NULL CHECK (quantity > 0),
        unit_price INT NOT NULL CHECK (unit_price >= 0),
        discount_amount INT NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
        tax_amount INT NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
        line_total INT NOT NULL CHECK (line_total >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

    -- 7. ORDER ADDRESSES TABLE
    CREATE TABLE IF NOT EXISTS order_addresses (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
        recipient_name VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        line_1 VARCHAR(255) NOT NULL,
        line_2 VARCHAR(255),
        landmark VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(30) NOT NULL,
        country_code VARCHAR(2) NOT NULL DEFAULT 'IN',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. PAYMENTS & PAYMENT ATTEMPTS
    CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        provider VARCHAR(64) NOT NULL,
        provider_payment_id VARCHAR(128) NOT NULL,
        amount INT NOT NULL CHECK (amount >= 0),
        currency VARCHAR(3) NOT NULL DEFAULT 'INR',
        status VARCHAR(25) NOT NULL CHECK (status IN ('pending', 'authorized', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded')),
        method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('card', 'apple_pay', 'cod', 'upi', 'net_banking')),
        failure_code VARCHAR(64),
        failure_message TEXT,
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

    CREATE TABLE IF NOT EXISTS payment_attempts (
        id UUID PRIMARY KEY,
        payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        attempt_number INT NOT NULL CHECK (attempt_number >= 1),
        amount INT NOT NULL CHECK (amount >= 0),
        provider_reference VARCHAR(128) NOT NULL,
        status VARCHAR(25) NOT NULL,
        failure_code VARCHAR(64),
        failure_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 9. FULFILMENTS TABLE
    CREATE TABLE IF NOT EXISTS fulfilments (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        carrier VARCHAR(100) NOT NULL,
        service VARCHAR(100) NOT NULL,
        tracking_number VARCHAR(100) NOT NULL,
        tracking_url TEXT,
        status VARCHAR(25) NOT NULL CHECK (status IN ('packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'returned')),
        shipped_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. ORDER EVENTS TABLE
    CREATE TABLE IF NOT EXISTS order_events (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        details TEXT,
        actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('customer', 'admin', 'system', 'provider')),
        actor_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);

    -- 11. RETURN REQUESTS TABLE
    CREATE TABLE IF NOT EXISTS return_requests (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        reason_code VARCHAR(30) NOT NULL CHECK (reason_code IN ('wrong_size', 'damaged_item', 'color_mismatch', 'defective_fabric', 'changed_mind', 'other')),
        customer_note TEXT,
        status VARCHAR(20) NOT NULL CHECK (status IN ('requested', 'approved', 'rejected', 'in_transit', 'received', 'inspected', 'completed')),
        requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMPTZ,
        in_transit_at TIMESTAMPTZ,
        received_at TIMESTAMPTZ,
        inspected_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        resolution VARCHAR(20) NOT NULL CHECK (resolution IN ('refund', 'exchange', 'store_credit')),
        restocked BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 12. REFUNDS TABLE
    CREATE TABLE IF NOT EXISTS refunds (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
        amount INT NOT NULL CHECK (amount > 0),
        currency VARCHAR(3) NOT NULL DEFAULT 'INR',
        reason VARCHAR(255) NOT NULL,
        provider_refund_id VARCHAR(128) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        requested_by VARCHAR(100) NOT NULL,
        restocked BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMPTZ
    );

    -- 13. WEBHOOK EVENTS TABLE
    CREATE TABLE IF NOT EXISTS webhook_events (
        id UUID PRIMARY KEY,
        provider VARCHAR(64) NOT NULL,
        provider_event_id VARCHAR(128) NOT NULL UNIQUE,
        event_type VARCHAR(64) NOT NULL,
        payload_hash VARCHAR(64) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('processed', 'ignored_duplicate', 'failed')),
        processed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 14. CARTS & CART ITEMS TABLE
    CREATE TABLE IF NOT EXISTS carts (
        id UUID PRIMARY KEY,
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        currency VARCHAR(3) NOT NULL DEFAULT 'INR',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY,
        cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        variant_id VARCHAR(64) NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        quantity INT NOT NULL CHECK (quantity > 0),
        unit_price INT NOT NULL CHECK (unit_price >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_cart_variant UNIQUE (cart_id, variant_id)
    );

    CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
  `);

  console.log('[PostgreSQL] Tables verified. Seeding initial users and catalogue if needed...');

  // 1. Seed Admin User
  const adminRes = await query('SELECT id FROM customers WHERE email = $1', ['admin@needle.com']);
  if (adminRes.rows.length === 0) {
    const adminId = crypto.randomUUID();
    await query(`
      INSERT INTO customers (id, customer_number, first_name, last_name, email, phone, password_hash, role, status, email_verified_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
    `, [
      adminId,
      'ADM-001',
      'Atelier',
      'Administrator',
      'admin@needle.com',
      '+91 98765 43210',
      hashPassword('NeedleAdmin2026!'),
      'admin',
      'active'
    ]);
    console.log('[PostgreSQL] Seeded Administrator account: admin@needle.com');
  }

  // 2. Seed Default Customer
  const custRes = await query('SELECT id FROM customers WHERE email = $1', ['sophia.laurent@needle.com']);
  if (custRes.rows.length === 0) {
    const custId = crypto.randomUUID();
    await query(`
      INSERT INTO customers (id, customer_number, first_name, last_name, email, phone, password_hash, role, status, email_verified_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
    `, [
      custId,
      'CUST-1001',
      'Sophia',
      'Laurent',
      'sophia.laurent@needle.com',
      '+91 98111 22233',
      hashPassword('NeedleClient2026!'),
      'customer',
      'active'
    ]);

    // Seed default address
    await query(`
      INSERT INTO addresses (id, customer_id, address_type, recipient_name, phone, line_1, line_2, landmark, city, state, postal_code, country_code, is_default)
      VALUES ($1, $2, 'shipping', 'Sophia Laurent', '+91 98111 22233', 'Flat 402, Sterling Heritage', 'Lavelle Road', 'Near Cubbon Park', 'Bengaluru', 'Karnataka', '560001', 'IN', true)
    `, [crypto.randomUUID(), custId]);

    console.log('[PostgreSQL] Seeded Customer account: sophia.laurent@needle.com');
  }

  // 3. Seed Products, Variants, and Inventory
  const productCountRes = await query('SELECT COUNT(*) as count FROM products');
  const count = parseInt(productCountRes.rows[0]?.count || '0', 10);
  if (count === 0) {
    console.log('[PostgreSQL] Seeding 45 products and variants...');
    for (const p of PRODUCTS) {
      const prodId = p.id;
      await query(`
        INSERT INTO products (id, name, slug, category_id, status, description, material, fit, care, primary_image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [
        prodId,
        p.name + (p.subtitle ? ` - ${p.subtitle}` : ''),
        p.slug,
        p.category,
        'published',
        p.description || '',
        p.material || '',
        p.fit || '',
        Array.isArray(p.care) ? p.care.join('; ') : (p.care || ''),
        p.primaryImage
      ]);

      const colors = p.colors && p.colors.length > 0 ? p.colors : [{ name: 'Default', hex: '#000000', image: p.primaryImage }];
      const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['Standard'];

      for (const color of colors) {
        for (const size of sizes) {
          const colorSlug = color.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const sizeSlug = size.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const variantId = `${prodId}-${colorSlug}-${sizeSlug}`;
          const sku = `NDL-${prodId.replace('prod-', '').toUpperCase()}-${color.name.slice(0, 3).toUpperCase()}-${size.slice(0, 2).toUpperCase()}`;
          const pricePaise = Math.round(p.price * 100);
          const salePricePaise = p.salePrice ? Math.round(p.salePrice * 100) : null;
          const costPricePaise = p.costPrice ? Math.round(p.costPrice * 100) : Math.round(p.price * 38);

          await query(`
            INSERT INTO product_variants (id, product_id, sku, color, color_hex, size, price, sale_price, cost_price, image, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
            ON CONFLICT (id) DO NOTHING
          `, [
            variantId,
            prodId,
            sku,
            color.name,
            color.hex || '#000000',
            size,
            pricePaise,
            salePricePaise,
            costPricePaise,
            color.image || p.primaryImage
          ]);

          await query(`
            INSERT INTO inventory (variant_id, on_hand_qty, reserved_qty, low_stock_threshold)
            VALUES ($1, $2, 0, 5)
            ON CONFLICT (variant_id) DO NOTHING
          `, [variantId, p.stockCount || 25]);
        }
      }
    }
    console.log('[PostgreSQL] Seeded products, variants, and inventory successfully!');
  }
}
