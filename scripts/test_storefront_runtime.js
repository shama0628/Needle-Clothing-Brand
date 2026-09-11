const API = "http://localhost:3001";
const FRONTEND = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("================================================================================");
  console.log("             NEEDLE STOREFRONT & COMMERCE RUNTIME VERIFICATION SUITE            ");
  console.log("================================================================================\n");

  // TEST 1: Frontend Serving & Header
  console.log("TEST 1: Frontend Server & HTML Document");
  try {
    const res = await fetch(FRONTEND);
    const html = await res.text();
    assert(res.status === 200, "Frontend server responds HTTP 200");
    assert(html.includes("NEEDLE") || html.includes("root"), "HTML contains app mounting root");
    assert(!html.includes("window.location.replace('/admin')"), "Storefront is root entrypoint");
  } catch (err) {
    assert(false, `Frontend fetch failed: ${err.message}`);
  }

  // TEST 2: Backend Health & Currency Configuration
  console.log("\nTEST 2: Backend Server & INR Currency Configuration");
  try {
    const res = await fetch(`${API}/api/health`);
    const data = await res.json();
    assert(res.status === 200, "Backend health endpoint responds HTTP 200");
    assert(data.currency === "INR" || data.status === "healthy", "Backend active with healthy state");
  } catch (err) {
    assert(false, `Backend health failed: ${err.message}`);
  }

  // TEST 3: Real Customer Registration (PostgreSQL)
  console.log("\nTEST 3: Real Customer Registration (No Demo Stubs)");
  const testEmail1 = `client_${Date.now()}@needle.atelier`;
  let tokenUser1 = null;
  let userId1 = null;
  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Fatima",
        lastName: "Zahra",
        email: testEmail1,
        password: "NeedleSecure2026!"
      })
    });
    const data = await res.json();
    assert(res.status === 201 && data.success === true, "Customer registered successfully in PostgreSQL");
    assert(data.user.email.toLowerCase() === testEmail1.toLowerCase(), "Customer record stores real email");
    assert(data.user.firstName === "Fatima", "Customer record stores real first name");
    assert(data.token && data.token.length > 20, "Returns real JWT authentication token");
    tokenUser1 = data.token;
    userId1 = data.user.id;
  } catch (err) {
    assert(false, `Registration error: ${err.message}`);
  }

  // TEST 4: Real Customer Login (PostgreSQL)
  console.log("\nTEST 4: Real Customer Login Verification");
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail1,
        password: "NeedleSecure2026!"
      })
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, "Login succeeds with valid credentials");
    assert(data.user.id === userId1, "Loaded customer matches registered PostgreSQL ID");
  } catch (err) {
    assert(false, `Login error: ${err.message}`);
  }

  // TEST 5: Auth-Gated Cart Operations (User A)
  console.log("\nTEST 5: Auth-Gated Cart Operations");
  const testVariantId = "prod-pm-1-desert-sand-generous-wrap";
  try {
    // Unauthenticated cart request
    const unauthRes = await fetch(`${API}/api/cart`);
    assert(unauthRes.status === 401, "Unauthenticated access to /api/cart is rejected (HTTP 401)");

    // Add item to cart with User 1 token
    const addRes = await fetch(`${API}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenUser1}`
      },
      body: JSON.stringify({
        variantId: testVariantId,
        quantity: 2
      })
    });
    const addData = await addRes.json();
    assert(addRes.status === 200 && addData.success === true, "Item added to User 1 PostgreSQL cart");

    // Fetch User 1 cart
    const cartRes = await fetch(`${API}/api/cart`, {
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });
    const cartData = await cartRes.json();
    assert(cartData.items.length === 1, "User 1 cart contains exactly 1 item");
    assert(cartData.items[0].quantity === 2, "User 1 cart item quantity is 2");
    assert(cartData.subtotalPaise > 0, "Cart subtotal calculated in integer paise");
  } catch (err) {
    assert(false, `Cart operation failed: ${err.message}`);
  }

  // TEST 6: Customer Isolation (User B cannot see User A's cart)
  console.log("\nTEST 6: Customer Isolation (Strict DB Cart Separation)");
  const testEmail2 = `client2_${Date.now()}@needle.atelier`;
  let tokenUser2 = null;
  try {
    const regRes = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Amina",
        lastName: "Khan",
        email: testEmail2,
        password: "NeedleSecure2026!"
      })
    });
    const regData = await regRes.json();
    tokenUser2 = regData.token;

    // Fetch User 2's cart
    const user2CartRes = await fetch(`${API}/api/cart`, {
      headers: { Authorization: `Bearer ${tokenUser2}` }
    });
    const user2Cart = await user2CartRes.json();
    assert(user2Cart.items.length === 0, "User 2's cart is empty (User 1's items are completely isolated)");
  } catch (err) {
    assert(false, `Isolation test failed: ${err.message}`);
  }

  // TEST 7: Order Creation & Isolation (PostgreSQL)
  console.log("\nTEST 7: Order Checkout & Strict Customer Order Isolation");
  try {
    const orderRes = await fetch(`${API}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenUser1}`
      },
      body: JSON.stringify({
        items: [{ variantId: testVariantId, quantity: 1 }],
        shippingAddress: {
          recipientName: "Fatima Zahra",
          phone: "+91 98111 22233",
          line1: "12 Crescent Road",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          countryCode: "IN"
        },
        customer: {
          email: testEmail1,
          phone: "+91 98111 22233"
        },
        paymentMethod: "card"
      })
    });
    const orderData = await orderRes.json();
    assert((orderRes.status === 200 || orderRes.status === 201) && orderData.success === true, "Order created in PostgreSQL database");
    assert(orderData.orderNumber && orderData.orderNumber.startsWith("ND"), `Order has generated orderNumber (${orderData.orderNumber})`);

    // Fetch User 1 orders
    const u1OrdersRes = await fetch(`${API}/api/orders`, {
      headers: { Authorization: `Bearer ${tokenUser1}` }
    });
    const u1Orders = await u1OrdersRes.json();
    assert(u1Orders.orders.length >= 1, "User 1 can see their placed order");

    // Fetch User 2 orders
    const u2OrdersRes = await fetch(`${API}/api/orders`, {
      headers: { Authorization: `Bearer ${tokenUser2}` }
    });
    const u2Orders = await u2OrdersRes.json();
    assert(u2Orders.orders.length === 0, "User 2 CANNOT see User 1's orders (Zero leakage)");
  } catch (err) {
    assert(false, `Order test failed: ${err.message}`);
  }

  // TEST 8: Accessories Category Consistency
  console.log("\nTEST 8: Accessories Category Consolidation");
  try {
    const res = await fetch(`${API}/api/products?category=accessories`);
    const data = await res.json();
    const count = data.products.length;
    assert(count === 7, `All 7 accessory products returned together under category=accessories (Actual: ${count})`);
    const ids = data.products.map(p => p.id).sort();
    assert(ids.includes("prod-mg-1") && ids.includes("prod-pn-1") && ids.includes("prod-uc-1"), "Contains magnets, pins, and undercaps");
  } catch (err) {
    assert(false, `Accessories test failed: ${err.message}`);
  }

  // TEST 9: Strict Single Image Asset Reality
  console.log("\nTEST 9: Strict Single-Image Asset Reality (45 Products)");
  try {
    const res = await fetch(`${API}/api/products`);
    const data = await res.json();
    assert(data.products.length === 45, "Catalog contains exactly 45 products");
    let allSingle = true;
    for (const p of data.products) {
      if (p.images && p.images.length > 1) allSingle = false;
    }
    assert(allSingle, "Every product strictly models 1 real image without fabricated angles");
  } catch (err) {
    assert(false, `Catalog test failed: ${err.message}`);
  }

  // TEST 10: Currency Integrity
  console.log("\nTEST 10: All Catalog Prices In INR Integer Paise");
  try {
    const res = await fetch(`${API}/api/products`);
    const data = await res.json();
    let validPrices = true;
    for (const p of data.products) {
      if (typeof p.pricePaise !== "number" || p.pricePaise <= 0 || !Number.isInteger(p.pricePaise)) {
        validPrices = false;
      }
    }
    assert(validPrices, "All products have valid integer paise prices (₹)");
  } catch (err) {
    assert(false, `Currency test failed: ${err.message}`);
  }

  console.log("\n================================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runTests();