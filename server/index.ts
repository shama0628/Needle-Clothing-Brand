import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { initDb, query, transaction, hashPassword } from './db.js';
import { authenticateToken, requireAuth, requireAdmin, createToken } from './auth.js';
import { PaymentAdapter } from './paymentAdapter.js';
import { addSSEClient, removeSSEClient, broadcastAdminEvent } from './sse.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(authenticateToken);

// ==============================================================================
// 1. HEALTH & SYSTEM INFO
// ==============================================================================
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbRes = await query('SELECT COUNT(*) as count FROM products');
    res.json({
      status: 'healthy',
      database: 'PostgreSQL 16 (PGlite)',
      productsCount: parseInt(dbRes.rows[0]?.count || '0', 10),
      currency: 'INR',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// GET /api/products - Live PostgreSQL Products Catalog
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM products WHERE status = $1';
    const params: any[] = ['published'];
    if (category) {
      params.push(category);
      sql += ` AND category_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${(search as string).toLowerCase()}%`);
      sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`;
    }
    sql += ' ORDER BY id ASC';
    const result = await query(sql, params);

    const products = [];
    for (const prod of result.rows) {
      const vRes = await query('SELECT pv.*, inv.on_hand_qty, inv.reserved_qty FROM product_variants pv LEFT JOIN inventory inv ON pv.id = inv.variant_id WHERE pv.product_id = $1', [prod.id]);
      const minPrice = vRes.rows.length > 0 ? Math.min(...vRes.rows.map(v => v.price)) : 0;
      products.push({
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        category: prod.category_id,
        status: prod.status,
        description: prod.description,
        material: prod.material,
        fit: prod.fit,
        care: prod.care,
        primaryImage: prod.primary_image,
        images: [prod.primary_image],
        pricePaise: minPrice,
        variants: vRes.rows
      });
    }

    res.json({ products, count: products.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const prodRes = await query('SELECT * FROM products WHERE id = $1 OR slug = $1', [req.params.id]);
    if (prodRes.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const prod = prodRes.rows[0];
    const vRes = await query('SELECT pv.*, inv.on_hand_qty, inv.reserved_qty FROM product_variants pv LEFT JOIN inventory inv ON pv.id = inv.variant_id WHERE pv.product_id = $1', [prod.id]);
    const minPrice = vRes.rows.length > 0 ? Math.min(...vRes.rows.map(v => v.price)) : 0;

    res.json({
      product: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        category: prod.category_id,
        status: prod.status,
        description: prod.description,
        material: prod.material,
        fit: prod.fit,
        care: prod.care,
        primaryImage: prod.primary_image,
        images: [prod.primary_image],
        pricePaise: minPrice,
        variants: vRes.rows
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 2. AUTHENTICATION (Single Admin + Customer Accounts)
// ==============================================================================
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const pwdHash = hashPassword(password.trim());

  const result = await query(
    'SELECT id, customer_number, first_name, last_name, email, role, status FROM customers WHERE LOWER(email) = $1 AND password_hash = $2',
    [cleanEmail, pwdHash]
  );

  if (result.rows.length === 0) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const user = result.rows[0];
  if (user.status !== 'active') {
    res.status(403).json({ error: 'Your account is inactive. Please contact support.' });
    return;
  }

  const authUser = {
    id: user.id,
    customerNumber: user.customer_number,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role as 'customer' | 'admin'
  };

  const token = createToken(authUser);
  res.json({
    success: true,
    token,
    user: authUser
  });
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, password } = req.body;
  if (!firstName || !email || !password) {
    res.status(400).json({ error: 'First name, email, and password are required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await query('SELECT id FROM customers WHERE LOWER(email) = $1', [cleanEmail]);
  if (existing.rows.length > 0) {
    res.status(409).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const newId = crypto.randomUUID();
  const countRes = await query('SELECT COUNT(*) as count FROM customers');
  const nextNum = parseInt(countRes.rows[0]?.count || '1', 10) + 1000;
  const customerNumber = `CUST-${nextNum}`;
  const pwdHash = hashPassword(password.trim());

  await query(`
    INSERT INTO customers (id, customer_number, first_name, last_name, email, phone, password_hash, role, status, email_verified_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'customer', 'active', CURRENT_TIMESTAMP)
  `, [
    newId,
    customerNumber,
    firstName.trim(),
    lastName ? lastName.trim() : null,
    cleanEmail,
    phone ? phone.trim() : null,
    pwdHash
  ]);

  const authUser = {
    id: newId,
    customerNumber,
    email: cleanEmail,
    firstName: firstName.trim(),
    lastName: lastName ? lastName.trim() : '',
    role: 'customer' as const
  };

  const token = createToken(authUser);
  res.status(201).json({
    success: true,
    token,
    user: authUser
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ user: req.user });
});

// ==============================================================================
// 3. AUTH-GATED CART & REAL POSTGRESQL PERSISTENCE
// ==============================================================================
// Helper: get or create cart for customer
async function getOrCreateCart(customerId: string): Promise<string> {
  const existing = await query('SELECT id FROM carts WHERE customer_id = $1', [customerId]);
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }
  const newCartId = crypto.randomUUID();
  await query('INSERT INTO carts (id, customer_id, currency) VALUES ($1, $2, $3)', [
    newCartId,
    customerId,
    'INR'
  ]);
  return newCartId;
}

// GET /api/cart - Return customer's cart
app.get('/api/cart', requireAuth, async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const cartId = await getOrCreateCart(customerId);

  const itemsRes = await query(`
    SELECT ci.id, ci.variant_id, ci.quantity, ci.unit_price,
           pv.sku, pv.color, pv.size, pv.image as variant_image,
           p.id as product_id, p.name as product_name, p.primary_image
    FROM cart_items ci
    JOIN product_variants pv ON ci.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE ci.cart_id = $1
    ORDER BY ci.created_at ASC
  `, [cartId]);

  const items = itemsRes.rows.map(row => ({
    id: row.id,
    variantId: row.variant_id,
    productId: row.product_id,
    name: row.product_name,
    sku: row.sku,
    color: row.color,
    size: row.size,
    quantity: row.quantity,
    unitPrice: row.unit_price, // in paise
    image: row.variant_image || row.primary_image
  }));

  const subtotalPaise = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  res.json({
    cartId,
    currency: 'INR',
    items,
    subtotalPaise
  });
});

// POST /api/cart/items - Add to cart (Strictly Auth-Gated!)
app.post('/api/cart/items', requireAuth, async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { variantId, quantity = 1 } = req.body;

  if (!variantId) {
    res.status(400).json({ error: 'variantId is required' });
    return;
  }

  // Verify variant exists and fetch price
  const variantRes = await query('SELECT id, price, sale_price FROM product_variants WHERE id = $1', [variantId]);
  if (variantRes.rows.length === 0) {
    res.status(404).json({ error: 'Product variant not found' });
    return;
  }

  const variant = variantRes.rows[0];
  const unitPrice = variant.sale_price || variant.price;
  const cartId = await getOrCreateCart(customerId);

  // Check if item already exists in cart
  const existingItem = await query('SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2', [
    cartId,
    variantId
  ]);

  if (existingItem.rows.length > 0) {
    const newQty = existingItem.rows[0].quantity + quantity;
    await query('UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
      newQty,
      existingItem.rows[0].id
    ]);
  } else {
    const itemId = crypto.randomUUID();
    await query(`
      INSERT INTO cart_items (id, cart_id, variant_id, quantity, unit_price)
      VALUES ($1, $2, $3, $4, $5)
    `, [itemId, cartId, variantId, quantity, unitPrice]);
  }

  res.status(200).json({ success: true, message: 'Item added to cart' });
});

// PUT /api/cart/items/:id - Update quantity (Auth-Gated)
app.put('/api/cart/items/:id', requireAuth, async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const itemId = req.params.id;
  const { quantity } = req.body;

  const cartId = await getOrCreateCart(customerId);

  if (quantity <= 0) {
    await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartId]);
  } else {
    await query('UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND cart_id = $3', [
      quantity,
      itemId,
      cartId
    ]);
  }

  res.json({ success: true });
});

// DELETE /api/cart/items/:id - Remove item (Auth-Gated)
app.delete('/api/cart/items/:id', requireAuth, async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const itemId = req.params.id;
  const cartId = await getOrCreateCart(customerId);

  await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartId]);
  res.json({ success: true });
});

// POST /api/cart/clear - Clear cart
app.post('/api/cart/clear', requireAuth, async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const cartId = await getOrCreateCart(customerId);

  await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  res.json({ success: true });
});

// ==============================================================================
// 4. CHECKOUT & ATOMIC INVENTORY RESERVATION
// ==============================================================================
app.post('/api/checkout', async (req: Request, res: Response) => {
  const {
    items,
    shippingAddress,
    customer,
    paymentMethod = 'card',
    couponCode,
    discountPaise = 0,
    shippingAmountPaise = 0
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400).json({ error: 'Order must contain at least one item' });
    return;
  }

  if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.line1 || !shippingAddress.city) {
    res.status(400).json({ error: 'Incomplete shipping address provided' });
    return;
  }

  try {
    const result = await transaction(async (tx) => {
      // 1. Verify inventory availability and calculate server-side subtotal
      let serverSubtotalPaise = 0;
      const orderItemPayloads: any[] = [];

      for (const item of items) {
        // Query variant and inventory
        const vRes = await tx.query(`
          SELECT pv.id as variant_id, pv.product_id, pv.sku, pv.price, pv.sale_price, pv.color, pv.size,
                 p.name as product_name, pv.image as variant_image, p.primary_image,
                 inv.on_hand_qty, inv.reserved_qty
          FROM product_variants pv
          JOIN products p ON pv.product_id = p.id
          JOIN inventory inv ON pv.id = inv.variant_id
          WHERE pv.id = $1
        `, [item.variantId]);

        if (vRes.rows.length === 0) {
          throw new Error(`Variant ${item.variantId} does not exist.`);
        }

        const v = vRes.rows[0];
        const availableStock = v.on_hand_qty - v.reserved_qty;
        if (availableStock < item.quantity) {
          throw new Error(`Insufficient inventory for ${v.product_name} (${v.color}, ${v.size}). Requested: ${item.quantity}, Available: ${availableStock}.`);
        }

        const unitPricePaise = v.sale_price || v.price;
        const lineTotalPaise = unitPricePaise * item.quantity;
        serverSubtotalPaise += lineTotalPaise;

        orderItemPayloads.push({
          productId: v.product_id,
          variantId: v.variant_id,
          sku: v.sku,
          productName: v.product_name,
          variantSnapshot: `${v.color} / ${v.size}`,
          primaryImage: v.variant_image || v.primary_image,
          quantity: item.quantity,
          unitPrice: unitPricePaise,
          lineTotal: lineTotalPaise
        });

        // Reserve inventory atomically
        await tx.query(`
          UPDATE inventory
          SET reserved_qty = reserved_qty + $1, updated_at = CURRENT_TIMESTAMP
          WHERE variant_id = $2
        `, [item.quantity, v.variant_id]);

        // Record inventory movement
        await tx.query(`
          INSERT INTO inventory_movements (id, variant_id, quantity_delta, reason, reference_type, reference_id, actor_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          crypto.randomUUID(),
          v.variant_id,
          -item.quantity,
          'checkout_reservation',
          'order',
          'pending',
          req.user?.id || 'guest'
        ]);
      }

      // Calculate totals
      const taxAmountPaise = Math.round(serverSubtotalPaise * 0.05); // 5% GST
      const grandTotalPaise = Math.max(0, serverSubtotalPaise - discountPaise + shippingAmountPaise + taxAmountPaise);

      // Generate order number (e.g. ND8492)
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ND${randNum}`;
      const orderId = crypto.randomUUID();

      const customerId = req.user?.id || null;
      const customerEmail = customer?.email || req.user?.email;
      const customerPhone = customer?.phone || shippingAddress.phone;

      // Initial statuses
      const orderStatus = 'pending_payment';
      const paymentStatus = 'pending';
      const fulfillmentStatus = 'unfulfilled';

      // Insert Order
      await tx.query(`
        INSERT INTO orders (
          id, order_number, customer_id, customer_email, customer_phone, currency,
          subtotal, item_discount_total, order_discount_total, shipping_amount, tax_amount, grand_total,
          payment_status, fulfillment_status, order_status, shipping_method, carrier
        ) VALUES (
          $1, $2, $3, $4, $5, 'INR',
          $6, 0, $7, $8, $9, $10,
          $11, $12, $13, 'Express Atelier Delivery', 'Blue Dart / Delhivery'
        )
      `, [
        orderId, orderNumber, customerId, customerEmail, customerPhone,
        serverSubtotalPaise, discountPaise, shippingAmountPaise, taxAmountPaise, grandTotalPaise,
        paymentStatus, fulfillmentStatus, orderStatus
      ]);

      // Insert Order Items
      for (const it of orderItemPayloads) {
        await tx.query(`
          INSERT INTO order_items (
            id, order_id, product_id, variant_id, sku_snapshot, product_name_snapshot,
            variant_snapshot, primary_image_snapshot, quantity, unit_price, discount_amount, tax_amount, line_total
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, 0, $11
          )
        `, [
          crypto.randomUUID(), orderId, it.productId, it.variantId, it.sku, it.productName,
          it.variantSnapshot, it.primaryImage, it.quantity, it.unitPrice, it.lineTotal
        ]);
      }

      // Insert Shipping Address
      await tx.query(`
        INSERT INTO order_addresses (
          id, order_id, recipient_name, phone, line_1, line_2, landmark, city, state, postal_code, country_code
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
      `, [
        crypto.randomUUID(), orderId,
        shippingAddress.recipientName,
        shippingAddress.phone || customerPhone,
        shippingAddress.line1,
        shippingAddress.line2 || null,
        shippingAddress.landmark || null,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.postalCode,
        shippingAddress.countryCode || 'IN'
      ]);

      // Record Order Placed Timeline Event
      await tx.query(`
        INSERT INTO order_events (id, order_id, event_type, title, details, actor_type, actor_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        crypto.randomUUID(),
        orderId,
        'order_placed',
        'Order Placed',
        `Order ${orderNumber} placed for ₹${(grandTotalPaise / 100).toLocaleString('en-IN')}`,
        customerId ? 'customer' : 'guest',
        customerId || 'guest'
      ]);

      // If customer was logged in, clear their cart
      if (customerId) {
        const cRes = await tx.query('SELECT id FROM carts WHERE customer_id = $1', [customerId]);
        if (cRes.rows.length > 0) {
          await tx.query('DELETE FROM cart_items WHERE cart_id = $1', [cRes.rows[0].id]);
        }
      }

      return {
        orderId,
        orderNumber,
        grandTotalPaise,
        customerEmail,
        customerName: shippingAddress.recipientName
      };
    });

    // Create payment intent / order
    const paymentOrder = PaymentAdapter.createPaymentOrder({
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      amountPaise: result.grandTotalPaise,
      currency: 'INR',
      method: paymentMethod,
      customer: {
        name: result.customerName,
        email: result.customerEmail
      }
    });

    // Notify connected Admin dashboards in real-time
    broadcastAdminEvent('order.created', {
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      grandTotalPaise: result.grandTotalPaise,
      customerEmail: result.customerEmail
    });

    res.status(201).json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      grandTotalPaise: result.grandTotalPaise,
      payment: paymentOrder
    });

  } catch (err: any) {
    console.error('[Checkout Error]:', err);
    res.status(400).json({ error: err.message || 'Checkout failed' });
  }
});

// ==============================================================================
// 5. PAYMENT VERIFICATION & WEBHOOKS
// ==============================================================================
app.post('/api/payments/verify', async (req: Request, res: Response) => {
  const { orderId, providerPaymentId, providerOrderId, signature, method = 'card' } = req.body;

  if (!orderId) {
    res.status(400).json({ error: 'orderId is required' });
    return;
  }

  const orderRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (orderRes.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  const order = orderRes.rows[0];

  const verification = PaymentAdapter.verifyPayment({
    orderId,
    providerPaymentId,
    providerOrderId,
    signature,
    method
  });

  if (!verification.success) {
    // Record failed attempt
    await query(`
      INSERT INTO payments (id, order_id, provider, provider_payment_id, amount, currency, status, method_type, failure_message)
      VALUES ($1, $2, 'razorpay', $3, $4, 'INR', 'failed', $5, $6)
    `, [crypto.randomUUID(), orderId, providerPaymentId || 'failed', order.grand_total, method, verification.failureReason]);

    res.status(400).json({ success: false, error: verification.failureReason });
    return;
  }

  // Payment successful! Run atomic transition
  await transaction(async (tx) => {
    // 1. Record payment
    const paymentId = crypto.randomUUID();
    await tx.query(`
      INSERT INTO payments (id, order_id, provider, provider_payment_id, amount, currency, status, method_type, paid_at)
      VALUES ($1, $2, 'razorpay', $3, $4, 'INR', $5, $6, CURRENT_TIMESTAMP)
    `, [paymentId, orderId, verification.providerPaymentId, order.grand_total, verification.status, method]);

    // 2. Update order status
    const newOrderStatus = method === 'cod' ? 'confirmed' : 'confirmed';
    const newPaymentStatus = verification.status;

    await tx.query(`
      UPDATE orders
      SET order_status = $1, payment_status = $2, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [newOrderStatus, newPaymentStatus, orderId]);

    // 3. Fulfill inventory reservation: deduct from on_hand_qty and reserved_qty
    const itemsRes = await tx.query('SELECT variant_id, quantity FROM order_items WHERE order_id = $1', [orderId]);
    for (const item of itemsRes.rows) {
      if (item.variant_id) {
        await tx.query(`
          UPDATE inventory
          SET on_hand_qty = GREATEST(0, on_hand_qty - $1),
              reserved_qty = GREATEST(0, reserved_qty - $1),
              updated_at = CURRENT_TIMESTAMP
          WHERE variant_id = $2
        `, [item.quantity, item.variant_id]);

        await tx.query(`
          INSERT INTO inventory_movements (id, variant_id, quantity_delta, reason, reference_type, reference_id, actor_id)
          VALUES ($1, $2, $3, 'payment_captured_stock_deduction', 'order', $4, 'payment_gateway')
        `, [crypto.randomUUID(), item.variant_id, -item.quantity, orderId]);
      }
    }

    // 4. Add order event
    await tx.query(`
      INSERT INTO order_events (id, order_id, event_type, title, details, actor_type, actor_id)
      VALUES ($1, $2, 'payment_captured', 'Payment Confirmed', $3, 'provider', 'razorpay')
    `, [
      crypto.randomUUID(),
      orderId,
      `Payment of ₹${(order.grand_total / 100).toLocaleString('en-IN')} confirmed via ${method.toUpperCase()} (Ref: ${verification.providerPaymentId})`
    ]);
  });

  // Broadcast to admin dashboard
  broadcastAdminEvent('payment.paid', {
    orderId,
    orderNumber: order.order_number,
    amountPaise: order.grand_total,
    providerPaymentId: verification.providerPaymentId
  });

  res.json({
    success: true,
    message: 'Payment verified and order confirmed',
    orderNumber: order.order_number
  });
});

// POST /api/payments/webhook - Idempotent webhook receiver
app.post('/api/payments/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawPayload = JSON.stringify(req.body);

  if (!PaymentAdapter.verifyWebhookSignature(rawPayload, signature)) {
    res.status(400).json({ error: 'Invalid webhook signature' });
    return;
  }

  const event = req.body;
  const eventId = event.id || event.payload?.payment?.entity?.id || `evt_${Date.now()}`;
  const payloadHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

  // Idempotency check
  const dupCheck = await query('SELECT id FROM webhook_events WHERE provider_event_id = $1', [eventId]);
  if (dupCheck.rows.length > 0) {
    res.json({ status: 'ignored_duplicate' });
    return;
  }

  await query(`
    INSERT INTO webhook_events (id, provider, provider_event_id, event_type, payload_hash, status)
    VALUES ($1, 'razorpay', $2, $3, $4, 'processed')
  `, [crypto.randomUUID(), eventId, event.event || 'payment.captured', payloadHash]);

  res.json({ status: 'success' });
});

// ==============================================================================
// 6. CUSTOMER ORDERS & ISOLATION
// ==============================================================================
// Scoped Customer Order History
app.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const ordersRes = await query(`
    SELECT o.*, oa.recipient_name, oa.line_1, oa.city, oa.state, oa.postal_code
    FROM orders o
    LEFT JOIN order_addresses oa ON o.id = oa.order_id
    WHERE o.customer_id = $1
    ORDER BY o.placed_at DESC
  `, [customerId]);

  const orders = [];
  for (const o of ordersRes.rows) {
    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
    orders.push({
      ...o,
      items: itemsRes.rows
    });
  }

  res.json({ orders });
});

// Guest Lookup with dual key: orderNumber + email
app.post('/api/orders/lookup', async (req: Request, res: Response) => {
  const { orderNumber, email } = req.body;
  if (!orderNumber || !email) {
    res.status(400).json({ error: 'Both order number and email are required for lookup.' });
    return;
  }

  const cleanNum = orderNumber.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();

  const oRes = await query(`
    SELECT o.*, oa.recipient_name, oa.phone as address_phone, oa.line_1, oa.line_2, oa.landmark, oa.city, oa.state, oa.postal_code, oa.country_code
    FROM orders o
    LEFT JOIN order_addresses oa ON o.id = oa.order_id
    WHERE UPPER(o.order_number) = $1 AND LOWER(o.customer_email) = $2
  `, [cleanNum, cleanEmail]);

  if (oRes.rows.length === 0) {
    res.status(404).json({ error: 'No matching order found. Please check your order number and email address.' });
    return;
  }

  const order = oRes.rows[0];
  const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
  const eventsRes = await query('SELECT * FROM order_events WHERE order_id = $1 ORDER BY created_at ASC', [order.id]);

  res.json({
    order: {
      ...order,
      items: itemsRes.rows,
      events: eventsRes.rows
    }
  });
});

// ==============================================================================
// 7. ADMIN ORDER MANAGEMENT & REAL-TIME SSE
// ==============================================================================
// Real-time SSE Stream for Admin Dashboard
app.get('/api/admin/events', requireAuth, requireAdmin, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = crypto.randomUUID();
  addSSEClient(clientId, res);

  req.on('close', () => {
    removeSSEClient(clientId);
  });
});

// List all orders with filters
app.get('/api/admin/orders', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { status, paymentStatus, search } = req.query;

  let sql = `
    SELECT o.*, oa.recipient_name, oa.phone as address_phone, oa.city, oa.state
    FROM orders o
    LEFT JOIN order_addresses oa ON o.id = oa.order_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'all') {
    params.push(status);
    sql += ` AND o.order_status = $${params.length}`;
  }

  if (paymentStatus && paymentStatus !== 'all') {
    params.push(paymentStatus);
    sql += ` AND o.payment_status = $${params.length}`;
  }

  if (search) {
    params.push(`%${(search as string).toLowerCase()}%`);
    sql += ` AND (LOWER(o.order_number) LIKE $${params.length} OR LOWER(o.customer_email) LIKE $${params.length} OR LOWER(oa.recipient_name) LIKE $${params.length})`;
  }

  sql += ` ORDER BY o.placed_at DESC`;

  const result = await query(sql, params);
  const orders = [];

  for (const o of result.rows) {
    const items = await query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
    orders.push({
      ...o,
      items: items.rows
    });
  }

  res.json({ orders });
});

// Get detailed order
app.get('/api/admin/orders/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const orderId = req.params.id;

  const oRes = await query(`
    SELECT o.*, oa.recipient_name, oa.phone as recipient_phone, oa.line_1, oa.line_2, oa.landmark, oa.city, oa.state, oa.postal_code, oa.country_code
    FROM orders o
    LEFT JOIN order_addresses oa ON o.id = oa.order_id
    WHERE o.id::text = $1 OR o.order_number = $1
  `, [orderId]);

  if (oRes.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const order = oRes.rows[0];
  const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
  const paymentsRes = await query('SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC', [order.id]);
  const eventsRes = await query('SELECT * FROM order_events WHERE order_id = $1 ORDER BY created_at ASC', [order.id]);
  const refundsRes = await query('SELECT * FROM refunds WHERE order_id = $1 ORDER BY created_at DESC', [order.id]);
  const returnsRes = await query('SELECT * FROM return_requests WHERE order_id = $1 ORDER BY requested_at DESC', [order.id]);

  res.json({
    order: {
      ...order,
      items: itemsRes.rows,
      payments: paymentsRes.rows,
      events: eventsRes.rows,
      refunds: refundsRes.rows,
      returns: returnsRes.rows
    }
  });
});

// Update order status & fulfilment
app.patch('/api/admin/orders/:id/status', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const orderId = req.params.id;
  const { newStatus, trackingNumber, carrier } = req.body;

  const oRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (oRes.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  const order = oRes.rows[0];

  let fulfillmentStatus = order.fulfillment_status;
  if (newStatus === 'shipped') fulfillmentStatus = 'shipped';
  else if (newStatus === 'delivered') fulfillmentStatus = 'delivered';
  else if (newStatus === 'cancelled') fulfillmentStatus = 'cancelled';
  else if (newStatus === 'packed') fulfillmentStatus = 'packed';
  else if (newStatus === 'processing') fulfillmentStatus = 'processing';

  await query(`
    UPDATE orders
    SET order_status = $1, fulfillment_status = $2, tracking_number = COALESCE($3, tracking_number), carrier = COALESCE($4, carrier), updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
  `, [newStatus, fulfillmentStatus, trackingNumber || null, carrier || null, orderId]);

  // If shipped and tracking number provided, create fulfilment record
  if (newStatus === 'shipped' && trackingNumber) {
    await query(`
      INSERT INTO fulfilments (id, order_id, carrier, service, tracking_number, status, shipped_at)
      VALUES ($1, $2, $3, 'Express Priority', $4, 'shipped', CURRENT_TIMESTAMP)
    `, [crypto.randomUUID(), orderId, carrier || 'Blue Dart', trackingNumber]);
  }

  // Add timeline event
  await query(`
    INSERT INTO order_events (id, order_id, event_type, title, details, actor_type, actor_id)
    VALUES ($1, $2, $3, $4, $5, 'admin', $6)
  `, [
    crypto.randomUUID(),
    orderId,
    `status_change_${newStatus}`,
    `Order Status Updated: ${newStatus.toUpperCase()}`,
    trackingNumber ? `Carrier: ${carrier || 'Blue Dart'}, Tracking: ${trackingNumber}` : `Status updated to ${newStatus}`,
    req.user!.email
  ]);

  broadcastAdminEvent('order.updated', { orderId, newStatus, fulfillmentStatus });

  res.json({ success: true, newStatus, fulfillmentStatus });
});

// Process refund
app.post('/api/admin/orders/:id/refund', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const orderId = req.params.id;
  const { amountPaise, reason, restockItems = false } = req.body;

  if (!amountPaise || amountPaise <= 0) {
    res.status(400).json({ error: 'Valid refund amount in paise is required' });
    return;
  }

  const oRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (oRes.rows.length === 0) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  const order = oRes.rows[0];

  const paymentRes = await query('SELECT * FROM payments WHERE order_id = $1 AND status = $2', [orderId, 'paid']);
  const paymentId = paymentRes.rows[0]?.id || crypto.randomUUID();

  const refundResult = PaymentAdapter.refundPayment(paymentId, amountPaise, reason || 'Customer requested return');

  await transaction(async (tx) => {
    // 1. Insert refund record
    await tx.query(`
      INSERT INTO refunds (id, order_id, payment_id, amount, currency, reason, provider_refund_id, status, requested_by, restocked)
      VALUES ($1, $2, $3, $4, 'INR', $5, $6, 'completed', $7, $8)
    `, [
      crypto.randomUUID(),
      orderId,
      paymentId,
      amountPaise,
      reason || 'Atelier return authorized',
      refundResult.refundId,
      req.user!.email,
      restockItems
    ]);

    // 2. Update order payment status
    const allRefundsRes = await tx.query('SELECT SUM(amount) as total FROM refunds WHERE order_id = $1', [orderId]);
    const totalRefunded = parseInt(allRefundsRes.rows[0]?.total || '0', 10);
    const newPaymentStatus = totalRefunded >= order.grand_total ? 'refunded' : 'partially_refunded';

    const newOrderStatus = newPaymentStatus === 'refunded' ? 'refunded' : order.order_status;
    await tx.query(`
      UPDATE orders
      SET payment_status = $1, order_status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [newPaymentStatus, newOrderStatus, orderId]);

    // 3. Restock inventory if requested
    if (restockItems) {
      const itemsRes = await tx.query('SELECT variant_id, quantity FROM order_items WHERE order_id = $1', [orderId]);
      for (const item of itemsRes.rows) {
        if (item.variant_id) {
          await tx.query(`
            UPDATE inventory
            SET on_hand_qty = on_hand_qty + $1, updated_at = CURRENT_TIMESTAMP
            WHERE variant_id = $2
          `, [item.quantity, item.variant_id]);

          await tx.query(`
            INSERT INTO inventory_movements (id, variant_id, quantity_delta, reason, reference_type, reference_id, actor_id)
            VALUES ($1, $2, $3, 'refund_restock', 'order', $4, $5)
          `, [crypto.randomUUID(), item.variant_id, item.quantity, orderId, req.user!.email]);
        }
      }
    }

    // 4. Record event
    await tx.query(`
      INSERT INTO order_events (id, order_id, event_type, title, details, actor_type, actor_id)
      VALUES ($1, $2, 'refund_processed', 'Refund Processed', $3, 'admin', $4)
    `, [
      crypto.randomUUID(),
      orderId,
      `Refund of ₹${(amountPaise / 100).toLocaleString('en-IN')} issued. Reason: ${reason}. Restocked: ${restockItems ? 'Yes' : 'No'}`,
      req.user!.email
    ]);
  });

  broadcastAdminEvent('refund.created', { orderId, amountPaise, refundId: refundResult.refundId });

  res.json({
    success: true,
    refundId: refundResult.refundId,
    message: `Refund of ₹${(amountPaise / 100).toLocaleString('en-IN')} successfully processed.`
  });
});

// Add order note
app.post('/api/admin/orders/:id/notes', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const orderId = req.params.id;
  const { note } = req.body;

  if (!note || !note.trim()) {
    res.status(400).json({ error: 'Note content cannot be empty' });
    return;
  }

  await query(`
    INSERT INTO order_events (id, order_id, event_type, title, details, actor_type, actor_id)
    VALUES ($1, $2, 'internal_note', 'Admin Note Added', $3, 'admin', $4)
  `, [crypto.randomUUID(), orderId, note.trim(), req.user!.email]);

  broadcastAdminEvent('order.updated', { orderId });
  res.json({ success: true });
});

// Start Server & Initialize Database
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  NEEDLE Luxury Modest Fashion - API Server Active`);
      console.log(`  Port: ${PORT}`);
      console.log(`  PostgreSQL: Active (PGlite @ ./data/postgres)`);
      console.log(`  Currency: INR (₹) Integer Paise`);
      console.log(`  Admin Account: admin@needle.com`);
      console.log(`  Payment Mode: ${PaymentAdapter ? 'Unified (Cards, UPI, COD, NetBanking)' : 'Active'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
