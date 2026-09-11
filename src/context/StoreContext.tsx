import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order, UserProfile, ColorPaletteResult, OrderStatus, CMSHeroSection, CMSCategorySection } from '../types';
import { PromoCode } from '../types/admin';
import { PRODUCTS } from '../data/products';
import { INITIAL_CMS_DATA, CMSData } from '../data/cmsData';
import { db } from '../commerce/database/DatabaseEngine';
import { OrderService } from '../commerce/services/OrderService';
import { toDollars, toCents, OrderRecord, ReturnReasonCode, ReturnResolution, ReturnStatus } from '../commerce/types/schema';

export interface StoreContextType {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, selectedColor: string, selectedSize: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  couponCode: string;
  discountAmount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  shippingFee: number;
  total: number;
  cartCount: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;

  // Wishlist
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // UI state
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  navDrawerOpen: boolean;
  setNavDrawerOpen: (open: boolean) => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  sizeGuideOpen: boolean;
  setSizeGuideOpen: (open: boolean) => void;

  // Account & Orders
  user: UserProfile | null;
  orders: Order[];
  placeOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'date'>) => Order;
  updateUser: (data: Partial<UserProfile>) => void;
  loginDemoUser: () => void;
  logoutUser: () => void;

  // Auth Gate & Customer Account
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  pendingCartItem: { product: Product; selectedColor: string; selectedSize: string; quantity: number } | null;
  setPendingCartItem: (item: { product: Product; selectedColor: string; selectedSize: string; quantity: number } | null) => void;
  loginCustomer: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerCustomer: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  authToken: string | null;

  // Admin & Domain Order Operations
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, trackingNumber?: string, carrier?: string, actor?: string) => void;
  processRefund: (orderId: string, amount: number, reason: string, restockItems?: boolean, actor?: string) => { success: boolean; message: string };
  addOrderNote: (orderId: string, note: string) => void;
  requestReturn: (orderId: string, reasonCode: ReturnReasonCode, note?: string, resolution?: ReturnResolution) => { success: boolean; message: string };
  updateReturnStatus: (returnId: string, nextStatus: ReturnStatus, restockResellable?: boolean, actorId?: string) => Promise<void>;

  // Products Catalog (Dynamic, synchronized with Admin)
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => { success: boolean; message: string };
  archiveProduct: (id: string) => void;
  adjustProductStock: (id: string, delta: number) => void;

  // CMS Content (Dynamic, synchronized with Admin)
  cmsData: CMSData;
  updateHero: (hero: CMSHeroSection) => void;
  updateSection: (id: string, updates: Partial<CMSCategorySection>) => void;
  reorderSections: (newSections: CMSCategorySection[]) => void;
  toggleSectionVisibility: (id: string) => void;
  resetCmsData: () => void;

  // Promotions Engine
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => void;
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => void;
  deletePromoCode: (id: string) => void;

  // Color Theory
  quizResult: ColorPaletteResult | null;
  setQuizResult: (result: ColorPaletteResult | null) => void;

  // Notification / Toast
  toast: string | null;
  showToast: (message: string) => void;

  // Store Reset
  resetAllData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const FREE_SHIPPING_MIN = 2500;

const DEFAULT_PROMOS: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'NEEDLE10',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 0,
    active: true,
    usageCount: 142,
    description: '10% off entire order for new & returning customers'
  },
  {
    id: 'promo-2',
    code: 'STORY15',
    discountType: 'percentage',
    discountValue: 15,
    minSpend: 2999,
    active: true,
    usageCount: 89,
    description: '15% off curated orders over ₹2,999'
  },
  {
    id: 'promo-3',
    code: 'WELCOME20',
    discountType: 'fixed',
    discountValue: 500,
    minSpend: 3999,
    active: true,
    usageCount: 38,
    description: '₹500 off premier orders over ₹3,999'
  }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Products state persisted to localStorage with strict image sanitization
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      localStorage.removeItem('needle_products'); // purge legacy contaminated storage
      const saved = localStorage.getItem('needle_products_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            primaryImage: p.primaryImage,
            images: [p.primaryImage],
            gallery: [p.primaryImage]
          }));
        }
      }
    } catch {
      // ignore
    }
    return PRODUCTS.map(p => ({
      ...p,
      status: p.status || 'published',
      sku: p.sku || `NDL-${p.id.replace('prod-', '').toUpperCase()}`,
      costPrice: p.costPrice || Math.round(p.price * 0.38),
      primaryImage: p.primaryImage,
      images: [p.primaryImage],
      gallery: [p.primaryImage]
    }));
  });

  // CMS state persisted to localStorage
  const [cmsData, setCmsData] = useState<CMSData>(() => {
    try {
      const saved = localStorage.getItem('needle_cms_data');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CMS_DATA;
  });

  // Promo codes state
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('needle_promos');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PROMOS;
  });

  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('needle_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state persisted to localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('needle_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState<string>('');
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);

  // Modals & Drawers
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Auth & Session
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('needle_customer_auth_token') || null;
    } catch {
      return null;
    }
  });

  // User Profile
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedToken = localStorage.getItem('needle_customer_auth_token');
      const savedUser = localStorage.getItem('needle_customer_user');
      if (savedToken && savedUser) {
        return JSON.parse(savedUser);
      }
      return null;
    } catch {
      return null;
    }
  });

  // Auth Gate Modal & Pending Cart Item Intent
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState<{
    product: Product;
    selectedColor: string;
    selectedSize: string;
    quantity: number;
  } | null>(null);

  // Helper to map relational records to UI representation
  const hydrateOrdersFromDb = (): Order[] => {
    return db.getOrders().map(rec => {
      const items = db.getOrderItems(rec.id);
      const address = db.getOrderAddress(rec.id);
      const events = db.getOrderEvents(rec.id);
      const refunds = db.getRefunds(rec.id);
      const returnRequests = db.getReturnRequests(rec.id);
      const totalRefundAmount = refunds.reduce((sum, r) => sum + toDollars(r.amount), 0);
      const lastRefund = refunds[refunds.length - 1];

      return {
        id: rec.id,
        orderNumber: rec.order_number,
        date: new Date(rec.placed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        customer: {
          name: address?.recipient_name || 'Valued Client',
          email: rec.customer_email,
          phone: rec.customer_phone || address?.phone || ''
        },
        shippingAddress: {
          firstName: address?.recipient_name?.split(' ')[0] || 'Valued',
          lastName: address?.recipient_name?.split(' ').slice(1).join(' ') || 'Client',
          email: rec.customer_email,
          phone: address?.phone || '',
          addressLine1: address?.line_1 || '',
          addressLine2: address?.line_2,
          city: address?.city || '',
          state: address?.state || '',
          postalCode: address?.postal_code || '',
          country: address?.country_code === 'US' ? 'United States' : address?.country_code || 'United States'
        },
        items: items.map(it => ({
          id: it.id,
          productId: it.product_id || '',
          productName: it.product_name_snapshot,
          primaryImage: it.primary_image_snapshot || '',
          color: it.variant_snapshot?.split('Color: ')[1]?.split(' /')[0] || 'Default',
          size: it.variant_snapshot?.split('Size: ')[1] || 'Standard',
          quantity: it.quantity,
          unitPrice: toDollars(it.unit_price),
          totalPrice: toDollars(it.line_total),
          sku: it.sku_snapshot
        })),
        subtotal: toDollars(rec.subtotal),
        discount: toDollars(rec.order_discount_total + rec.item_discount_total),
        shippingFee: toDollars(rec.shipping_amount),
        estimatedTax: toDollars(rec.tax_amount),
        total: toDollars(rec.grand_total),
        status: (rec.order_status === 'pending_payment' ? 'placed' : rec.order_status) as any,
        estimatedDelivery: rec.shipping_method?.includes('Express') ? 'Delivering in 2 Business Days' : 'Delivering in 4-6 Business Days',
        paymentMethod: rec.currency === 'USD' ? 'Credit Card (Tokenized)' : 'Secure Payment Gateway',
        paymentStatus: rec.payment_status as any,
        fulfillmentStatus: rec.fulfillment_status,
        trackingNumber: rec.tracking_number,
        carrier: rec.carrier,
        internalNotes: rec.notes,
        refundAmount: totalRefundAmount > 0 ? totalRefundAmount : undefined,
        refundReason: lastRefund?.reason,
        refundDate: lastRefund ? new Date(lastRefund.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
        orderEvents: events.map(e => ({
          id: e.id,
          timestamp: e.created_at,
          title: e.title,
          actor: e.actor_id
        })),
        returnRequests,
        refundRecords: refunds
      };
    });
  };

  // Orders initialized from Relational Commerce DB
  const [orders, setOrders] = useState<Order[]>(() => hydrateOrdersFromDb());

  // Color Theory quiz result
  const [quizResult, setQuizResult] = useState<ColorPaletteResult | null>(() => {
    try {
      const saved = localStorage.getItem('needle_quiz');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('needle_products_v4', JSON.stringify(products));
    localStorage.removeItem('needle_products'); // maintain clean storage
  }, [products]);

  useEffect(() => {
    localStorage.setItem('needle_cms_data', JSON.stringify(cmsData));
  }, [cmsData]);

  useEffect(() => {
    localStorage.setItem('needle_promos', JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem('needle_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('needle_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('needle_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('needle_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (quizResult) {
      localStorage.setItem('needle_quiz', JSON.stringify(quizResult));
    }
  }, [quizResult]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Backend Cart Synchronization
  const fetchBackendCart = async (token = authToken) => {
    if (!token) {
      setCart([]);
      return;
    }
    try {
      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        setAuthToken(null);
        setUser(null);
        localStorage.removeItem('needle_customer_auth_token');
        localStorage.removeItem('needle_customer_user');
        setCart([]);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const mappedItems: CartItem[] = data.items.map((it: any) => {
          const prod = products.find(p => p.id === it.productId) || PRODUCTS.find(p => p.id === it.productId);
          return {
            id: it.id,
            productId: it.productId,
            product: prod || {
              id: it.productId,
              name: it.name,
              slug: it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              category: 'hijab',
              price: Math.round(it.unitPrice / 100),
              primaryImage: it.image
            } as Product,
            selectedColor: it.color,
            selectedSize: it.size,
            quantity: it.quantity,
            unitPrice: Math.round(it.unitPrice / 100)
          };
        });
        setCart(mappedItems);
      }
    } catch (err) {
      console.warn('[StoreContext] Failed to fetch cart from backend:', err);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchBackendCart(authToken);
    } else {
      setCart([]);
    }
  }, [authToken]);

  // Cart operations (Strictly Auth-Gated!)
  const addToCart = async (product: Product, selectedColor: string, selectedSize: string, quantity = 1) => {
    if (!user || !authToken) {
      setPendingCartItem({ product, selectedColor, selectedSize, quantity });
      setAuthModalOpen(true);
      return;
    }

    try {
      const colorSlug = selectedColor.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const sizeSlug = selectedSize.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const variantId = `${product.id}-${colorSlug}-${sizeSlug}`;

      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ variantId, quantity })
      });

      if (res.status === 401) {
        setPendingCartItem({ product, selectedColor, selectedSize, quantity });
        setAuthModalOpen(true);
        return;
      }

      if (res.ok) {
        await fetchBackendCart(authToken);
        showToast(`Added "${product.name}" to your bag`);
        setCartDrawerOpen(true);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add item to bag');
      }
    } catch (err: any) {
      showToast(err.message || 'Error connecting to cart service');
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    if (authToken) {
      try {
        await fetch(`/api/cart/items/${cartItemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        });
        fetchBackendCart(authToken);
      } catch (err) {
        console.warn('Failed to delete item from server cart:', err);
      }
    }
    showToast('Item removed from bag');
  };

  const updateQuantity = async (cartItemId: string, delta: number) => {
    const item = cart.find(i => i.id === cartItemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart(prev =>
      prev.map(i => (i.id === cartItemId ? { ...i, quantity: newQty } : i))
    );

    if (authToken) {
      try {
        await fetch(`/api/cart/items/${cartItemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ quantity: newQty })
        });
        fetchBackendCart(authToken);
      } catch (err) {
        console.warn('Failed to update quantity on server cart:', err);
      }
    }
  };

  const clearCart = async () => {
    if (authToken) {
      try {
        await fetch('/api/cart/clear', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` }
        });
      } catch (err) {
        console.warn('Failed to clear server cart:', err);
      }
    }
    setCart([]);
    setCouponCode('');
    setActivePromo(null);
  };

  const applyCoupon = (code: string) => {
    const normalized = code.trim().toUpperCase();
    const found = promoCodes.find(p => p.code === normalized);

    if (!found) {
      return { success: false, message: 'Invalid promo code. Try "NEEDLE10"' };
    }

    if (!found.active) {
      return { success: false, message: 'This promo code is no longer active.' };
    }

    if (found.minSpend && subtotal < found.minSpend) {
      return {
        success: false,
        message: `Order must be at least ₹${found.minSpend.toLocaleString('en-IN')} to apply code ${found.code}.`
      };
    }

    setCouponCode(found.code);
    setActivePromo(found);
    showToast(`Promo code "${found.code}" applied!`);
    return { success: true, message: `${found.description}` };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setActivePromo(null);
    showToast('Promo code removed');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  
  let discountAmount = 0;
  if (activePromo) {
    if (activePromo.discountType === 'percentage') {
      discountAmount = Math.round(subtotal * (activePromo.discountValue / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(subtotal, activePromo.discountValue);
    }
  }

  const shippingFee = subtotal >= FREE_SHIPPING_MIN || subtotal === 0 ? 0 : 150;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_MIN - subtotal);

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const product = products.find(p => p.id === productId) || PRODUCTS.find(p => p.id === productId);
      const name = product ? product.name : 'Item';
      if (exists) {
        showToast(`Removed "${name}" from Wishlist`);
        return prev.filter(id => id !== productId);
      } else {
        showToast(`Saved "${name}" to Wishlist`);
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Orders creation from checkout via Relational Database Engine and Backend API
  const placeOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'date'>): Order => {
    // 1. Transactional domain checkout payload
    const checkoutPayload = {
      customerId: user?.id,
      customerEmail: orderData.customer.email,
      customerPhone: orderData.customer.phone,
      items: orderData.items.map(it => ({
        productId: it.productId,
        quantity: it.quantity
      })),
      shippingAddress: {
        recipientName: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`.trim(),
        phone: orderData.shippingAddress.phone,
        line1: orderData.shippingAddress.addressLine1,
        line2: orderData.shippingAddress.addressLine2,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        postalCode: orderData.shippingAddress.postalCode,
        countryCode: 'IN'
      },
      shippingMethod: (orderData.shippingFee > 15 ? 'express' : 'standard') as 'standard' | 'express',
      paymentMethod: (orderData.paymentMethod.toLowerCase().includes('cod')
        ? 'cod'
        : 'card') as any,
      discountCode: couponCode || undefined,
      notes: orderData.internalNotes
    };

    const res = OrderService.checkoutSync(checkoutPayload);
    if (!res.success || !res.order) {
      throw new Error(res.error || 'Failed to complete order transaction.');
    }

    // 2. Asynchronously commit to real PostgreSQL backend API
    (async () => {
      try {
        const apiItems = orderData.items.map(it => {
          const colorSlug = (it.color || 'default').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const sizeSlug = (it.size || 'standard').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return {
            variantId: `${it.productId}-${colorSlug}-${sizeSlug}`,
            quantity: it.quantity
          };
        });

        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
          },
          body: JSON.stringify({
            items: apiItems,
            shippingAddress: {
              recipientName: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`.trim(),
              phone: orderData.shippingAddress.phone,
              line1: orderData.shippingAddress.addressLine1,
              line2: orderData.shippingAddress.addressLine2,
              city: orderData.shippingAddress.city,
              state: orderData.shippingAddress.state,
              postalCode: orderData.shippingAddress.postalCode,
              countryCode: 'IN'
            },
            customer: {
              name: orderData.customer.name,
              email: orderData.customer.email,
              phone: orderData.customer.phone
            },
            paymentMethod: orderData.paymentMethod.toLowerCase().includes('cod') ? 'cod' : 'card',
            discountPaise: Math.round(orderData.discount * 100),
            shippingAmountPaise: Math.round(orderData.shippingFee * 100)
          })
        });

        if (checkoutRes.ok) {
          const checkoutData = await checkoutRes.json();
          // Verify payment immediately
          await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: checkoutData.orderId,
              providerPaymentId: `pay_gateway_${Date.now()}`,
              providerOrderId: checkoutData.payment?.providerOrderId,
              method: orderData.paymentMethod.toLowerCase().includes('cod') ? 'cod' : 'card'
            })
          });

          if (authToken) {
            fetchBackendCart(authToken);
          }
        }
      } catch (e) {
        console.warn('Backend API order commit error:', e);
      }
    })();

    // Refresh orders from Relational DB
    const refreshed = hydrateOrdersFromDb();
    setOrders(refreshed);

    clearCart();

    const createdOrder = refreshed.find(o => o.id === res.order!.id) || refreshed[0];
    return createdOrder;
  };

  // Admin Order Operations with State Machine Enforcement (Doc 03 Section 11 & 13)
  const updateOrderStatus = (
    orderId: string, 
    newStatus: OrderStatus, 
    trackingNumber?: string, 
    carrier?: string,
    actor = 'Admin'
  ) => {
    try {
      if (newStatus === 'shipped' && trackingNumber) {
        OrderService.dispatchShipment(orderId, carrier || 'DHL Express', trackingNumber, 'Priority Courier', actor);
      } else if (newStatus === 'delivered') {
        OrderService.confirmDelivery(orderId, actor);
      } else {
        OrderService.advanceOrderStatus(orderId, newStatus as any, actor);
      }

      setOrders(hydrateOrdersFromDb());
      showToast(`Order status updated to "${newStatus}"`);
    } catch (err: any) {
      showToast(err.message || `Unable to update order status to ${newStatus}`);
    }
  };

  // Process Auditable Refund without mutating historical order totals (Doc 03 Section 16 & 19)
  const processRefund = (
    orderId: string, 
    amount: number, 
    reason: string, 
    restockItems = true,
    actor = 'Admin'
  ) => {
    try {
      const amountCents = toCents(amount);
      const res = OrderService.processRefund(orderId, amountCents, reason, restockItems, actor);
      if (res instanceof Promise) {
        res.then(r => {
          setOrders(hydrateOrdersFromDb());
          if (r.success) {
            showToast(`Refund of ₹${amount.toLocaleString('en-IN')} processed successfully`);
          } else {
            showToast(r.message || 'Refund failed');
          }
        });
        return { success: true, message: 'Processing refund...' };
      }
      setOrders(hydrateOrdersFromDb());
      showToast(`Refund of ₹${amount.toLocaleString('en-IN')} processed successfully`);
      return { success: true, message: 'Refund completed successfully' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Refund failed' };
    }
  };

  // Customer Return Request (Doc 03 Section 15)
  const requestReturn = (
    orderId: string,
    reasonCode: ReturnReasonCode,
    note?: string,
    resolution: ReturnResolution = 'refund'
  ) => {
    const res = OrderService.requestReturn(orderId, user?.id, reasonCode, note, resolution);
    if (res.success) {
      setOrders(hydrateOrdersFromDb());
      showToast('Return request submitted to atelier concierge');
    }
    return res;
  };

  // Update Return Status (Doc 03 Section 15 & 19)
  const updateReturnStatus = async (
    returnId: string,
    nextStatus: ReturnStatus,
    restockResellable = false,
    actorId = 'Admin'
  ) => {
    await OrderService.updateReturnStatus(returnId, nextStatus, restockResellable, actorId);
    setOrders(hydrateOrdersFromDb());
    showToast(`Return status updated to "${nextStatus}"`);
  };

  const addOrderNote = (orderId: string, note: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;
        const currentNotes = ord.internalNotes ? `${ord.internalNotes}\n---\n` : '';
        const timestamp = new Date().toLocaleString();
        return {
          ...ord,
          internalNotes: `${currentNotes}[${timestamp}] ${note}`
        };
      })
    );
    showToast('Internal note saved to order');
  };

  // Product Catalog CRUD (admin synced)
  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    showToast(`Product "${product.name}" created successfully`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(prod => (prod.id === id ? { ...prod, ...updates } : prod))
    );
    showToast('Product updated successfully');
  };

  const deleteProduct = (id: string): { success: boolean; message: string } => {
    const isReferencedInOrders = orders.some(ord =>
      ord.items.some(item => item.productId === id)
    );

    if (isReferencedInOrders) {
      // Document 02 Section 6.2 rule: Do not delete products referenced by historical orders; archive instead
      archiveProduct(id);
      return {
        success: false,
        message: 'Product is part of historical order records and was safely archived instead of permanently deleted.'
      };
    }

    setProducts(prev => prev.filter(prod => prod.id !== id));
    showToast('Product deleted from catalogue');
    return { success: true, message: 'Product permanently removed' };
  };

  const archiveProduct = (id: string) => {
    setProducts(prev =>
      prev.map(prod => (prod.id === id ? { ...prod, status: 'archived', inStock: false } : prod))
    );
    showToast('Product archived');
  };

  const adjustProductStock = (id: string, delta: number) => {
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== id) return prod;
        const newStock = Math.max(0, prod.stockCount + delta);
        return {
          ...prod,
          stockCount: newStock,
          inStock: newStock > 0
        };
      })
    );
  };

  // CMS Content Updates
  const updateHero = (hero: CMSHeroSection) => {
    setCmsData(prev => ({ ...prev, hero }));
    showToast('Hero campaign updated');
  };

  const updateSection = (id: string, updates: Partial<CMSCategorySection>) => {
    setCmsData(prev => ({
      ...prev,
      homepageSections: prev.homepageSections.map(sec =>
        sec.id === id ? { ...sec, ...updates } : sec
      )
    }));
    showToast('Homepage section updated');
  };

  const reorderSections = (newSections: CMSCategorySection[]) => {
    setCmsData(prev => ({
      ...prev,
      homepageSections: newSections.map((sec, idx) => ({ ...sec, order: idx + 1 }))
    }));
    showToast('Section order re-arranged');
  };

  const toggleSectionVisibility = (id: string) => {
    setCmsData(prev => ({
      ...prev,
      homepageSections: prev.homepageSections.map(sec =>
        sec.id === id ? { ...sec, active: !sec.active } : sec
      )
    }));
    showToast('Section visibility toggled');
  };

  const resetCmsData = () => {
    setCmsData(INITIAL_CMS_DATA);
    showToast('Homepage CMS restored to default brand editorial');
  };

  // Promo Engine Management
  const addPromoCode = (promo: PromoCode) => {
    setPromoCodes(prev => [promo, ...prev]);
    showToast(`Promo code "${promo.code}" created`);
  };

  const updatePromoCode = (id: string, updates: Partial<PromoCode>) => {
    setPromoCodes(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Promo code updated');
  };

  const deletePromoCode = (id: string) => {
    setPromoCodes(prev => prev.filter(p => p.id !== id));
    showToast('Promo code removed');
  };

  // User profile & Customer Auth
  const updateUser = (data: Partial<UserProfile>) => {
    setUser(prev => {
      const updated = prev ? { ...prev, ...data } : null;
      if (updated) {
        localStorage.setItem('needle_customer_user', JSON.stringify(updated));
      }
      return updated;
    });
    showToast('Profile updated successfully');
  };

  const loginCustomer = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || 'Invalid credentials' };
      }

      const token = data.token;
      const profile: UserProfile = {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: '+91 98111 22233',
        memberSince: 'March 2026',
        savedAddresses: [
          {
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            phone: '+91 98111 22233',
            addressLine1: 'Flat 402, Sterling Heritage',
            addressLine2: 'Lavelle Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
            isDefault: true
          }
        ]
      };

      setAuthToken(token);
      setUser(profile);
      localStorage.setItem('needle_customer_auth_token', token);
      localStorage.setItem('needle_customer_user', JSON.stringify(profile));

      // Process pending cart item intent if customer clicked Add to Bag while unauthenticated
      if (pendingCartItem) {
        const colorSlug = pendingCartItem.selectedColor.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const sizeSlug = pendingCartItem.selectedSize.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const variantId = `${pendingCartItem.product.id}-${colorSlug}-${sizeSlug}`;

        await fetch('/api/cart/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ variantId, quantity: pendingCartItem.quantity })
        });
        setPendingCartItem(null);
        await fetchBackendCart(token);
        setCartDrawerOpen(true);
        showToast(`Added "${pendingCartItem.product.name}" to your bag`);
      } else {
        await fetchBackendCart(token);
      }

      showToast(`Welcome back, ${profile.firstName}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login connection error' };
    }
  };

  const registerCustomer = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const parts = name.trim().split(' ');
      const firstName = parts[0] || 'Client';
      const lastName = parts.slice(1).join(' ') || '';

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || 'Registration failed' };
      }

      const token = data.token;
      const profile: UserProfile = {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: '',
        memberSince: 'March 2026',
        savedAddresses: []
      };

      setAuthToken(token);
      setUser(profile);
      localStorage.setItem('needle_customer_auth_token', token);
      localStorage.setItem('needle_customer_user', JSON.stringify(profile));

      if (pendingCartItem) {
        const colorSlug = pendingCartItem.selectedColor.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const sizeSlug = pendingCartItem.selectedSize.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const variantId = `${pendingCartItem.product.id}-${colorSlug}-${sizeSlug}`;

        await fetch('/api/cart/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ variantId, quantity: pendingCartItem.quantity })
        });
        setPendingCartItem(null);
        await fetchBackendCart(token);
        setCartDrawerOpen(true);
        showToast(`Added "${pendingCartItem.product.name}" to your bag`);
      } else {
        await fetchBackendCart(token);
      }

      showToast(`Welcome to NEEDLE, ${firstName}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration error' };
    }
  };

  const loginDemoUser = () => {
    loginCustomer('sophia.laurent@needle.com', 'NeedleClient2026!');
  };

  const logoutUser = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('needle_customer_auth_token');
    localStorage.removeItem('needle_customer_user');
    setCart([]);
    showToast('Signed out of your account');
  };

  const resetAllData = () => {
    localStorage.removeItem('needle_products');
    localStorage.removeItem('needle_products_v4');
    localStorage.removeItem('needle_cms_data');
    localStorage.removeItem('needle_promos');
    localStorage.removeItem('needle_orders');
    setProducts(PRODUCTS.map(p => ({
      ...p,
      status: p.status || 'published',
      sku: p.sku || `NDL-${p.id.replace('prod-', '').toUpperCase()}`,
      costPrice: p.costPrice || Math.round(p.price * 0.38),
      primaryImage: p.primaryImage,
      images: [p.primaryImage],
      gallery: [p.primaryImage]
    })));
    setCmsData(INITIAL_CMS_DATA);
    setPromoCodes(DEFAULT_PROMOS);
    showToast('Catalogue and store data reset to clean defaults');
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        couponCode,
        discountAmount,
        applyCoupon,
        removeCoupon,
        subtotal,
        shippingFee,
        total,
        cartCount,
        freeShippingThreshold: FREE_SHIPPING_MIN,
        freeShippingRemaining,

        wishlist,
        toggleWishlist,
        isInWishlist,

        cartDrawerOpen,
        setCartDrawerOpen,
        navDrawerOpen,
        setNavDrawerOpen,
        searchModalOpen,
        setSearchModalOpen,
        sizeGuideOpen,
        setSizeGuideOpen,

        user,
        orders,
        placeOrder,
        updateUser,
        loginDemoUser,
        logoutUser,

        authModalOpen,
        setAuthModalOpen,
        pendingCartItem,
        setPendingCartItem,
        loginCustomer,
        registerCustomer,
        authToken,

        updateOrderStatus,
        processRefund,
        addOrderNote,
        requestReturn,
        updateReturnStatus,

        products,
        addProduct,
        updateProduct,
        deleteProduct,
        archiveProduct,
        adjustProductStock,

        cmsData,
        updateHero,
        updateSection,
        reorderSections,
        toggleSectionVisibility,
        resetCmsData,

        promoCodes,
        addPromoCode,
        updatePromoCode,
        deletePromoCode,

        quizResult,
        setQuizResult,

        toast,
        showToast,
        resetAllData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
