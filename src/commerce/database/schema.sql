-- ==============================================================================
-- NEEDLE — DOCUMENTATION 03: ORDER MANAGEMENT, DATABASE & COMMERCE SPECIFICATION
-- Relational DDL Schema (PostgreSQL / SQLite Compatible Standard)
-- ==============================================================================

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY,
    customer_number VARCHAR(32) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'suspended', 'deleted_requested')),
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

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
    country_code VARCHAR(2) NOT NULL DEFAULT 'US',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);

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
    price INT NOT NULL CHECK (price >= 0),            -- Smallest currency unit (cents)
    sale_price INT CHECK (sale_price >= 0),          -- Smallest currency unit (cents)
    cost_price INT CHECK (cost_price >= 0),          -- Smallest currency unit (cents)
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
    quantity_delta INT NOT NULL,                     -- Positive (restock) or negative (fulfillment)
    reason VARCHAR(100) NOT NULL,
    reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('order', 'restock', 'audit', 'return', 'manual')),
    reference_id VARCHAR(64),
    actor_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant ON inventory_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);

-- 5. ORDERS TABLE (MAIN RECORD)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY,
    order_number VARCHAR(32) NOT NULL UNIQUE,         -- Human-readable e.g. ND8492
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,            -- Order-time email snapshot
    customer_phone VARCHAR(50),                      -- Order-time phone snapshot
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    subtotal INT NOT NULL CHECK (subtotal >= 0),      -- In cents
    item_discount_total INT NOT NULL DEFAULT 0 CHECK (item_discount_total >= 0),
    order_discount_total INT NOT NULL DEFAULT 0 CHECK (order_discount_total >= 0),
    shipping_amount INT NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    tax_amount INT NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    grand_total INT NOT NULL CHECK (grand_total >= 0), -- Final payable/paid
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
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(order_status, created_at);

-- 6. ORDER ITEMS TABLE (IMMUTABLE PURCHASE SNAPSHOTS)
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
    unit_price INT NOT NULL CHECK (unit_price >= 0),  -- In cents
    discount_amount INT NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount INT NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    line_total INT NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(sku_snapshot);

-- 7. ORDER ADDRESS SNAPSHOT TABLE (IMMUTABLE SHIPPING SNAPSHOT)
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
    country_code VARCHAR(2) NOT NULL DEFAULT 'US',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_addresses_order ON order_addresses(order_id);

-- 8. PAYMENTS & PAYMENT ATTEMPTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(64) NOT NULL,
    provider_payment_id VARCHAR(128) NOT NULL,
    amount INT NOT NULL CHECK (amount >= 0),           -- In cents
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(25) NOT NULL CHECK (status IN ('pending', 'authorized', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded')),
    method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('card', 'apple_pay', 'cod', 'upi', 'net_banking')),
    failure_code VARCHAR(64),
    failure_message TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON payments(provider_payment_id);

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

CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment ON payment_attempts(payment_id);

-- 9. FULFILMENTS / SHIPMENTS TABLE
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

CREATE INDEX IF NOT EXISTS idx_fulfilments_order ON fulfilments(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfilments_tracking ON fulfilments(tracking_number);

-- 10. ORDER EVENTS TABLE (APPEND-ONLY TIMELINE)
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

CREATE INDEX IF NOT EXISTS idx_order_events_order_time ON order_events(order_id, created_at);

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

CREATE INDEX IF NOT EXISTS idx_return_requests_order ON return_requests(order_id);

-- 12. REFUNDS TABLE (DISTINCT AUDITABLE FINANCIAL ENTITY)
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    amount INT NOT NULL CHECK (amount > 0),             -- In cents
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    reason VARCHAR(255) NOT NULL,
    provider_refund_id VARCHAR(128) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    requested_by VARCHAR(100) NOT NULL,
    restocked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id);

-- 13. WEBHOOK EVENTS TABLE (IDEMPOTENCY DEDUPLICATION)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY,
    provider VARCHAR(64) NOT NULL,
    provider_event_id VARCHAR(128) NOT NULL UNIQUE,     -- Prevents duplicate execution
    event_type VARCHAR(64) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('processed', 'ignored_duplicate', 'failed')),
    processed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_id ON webhook_events(provider, provider_event_id);

-- 14. CARTS & CART ITEMS TABLE (DOC 03 SECTION 17)
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    session_id VARCHAR(128),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
