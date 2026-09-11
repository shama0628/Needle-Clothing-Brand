export type CategorySlug = 'hijab' | 'clothing' | 'accessories';

export type SubcategorySlug = 
  | 'classical-jersey'
  | 'printed-modal'
  | 'plain-modal'
  | 'partywear'
  | 'dresses'
  | 'coord-sets'
  | 'tops'
  | 'skirts'
  | 'undercapes'
  | 'hijab-magnets'
  | 'hijab-pins';

export interface ProductVariant {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string;
  image?: string;
  size?: string;
  inStock: boolean;
  stockCount: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: CategorySlug;
  subcategory: SubcategorySlug;
  price: number;
  salePrice?: number;
  costPrice?: number;
  status?: 'published' | 'draft' | 'archived';
  sku?: string;
  rating: number;
  reviewCount: number;
  primaryImage: string;
  gallery: string[];
  images?: string[];
  description: string;
  material: string;
  fit: string;
  care: string[];
  dimensions?: string;
  sizes: string[];
  colors: { name: string; hex: string; image?: string }[];
  paletteTags: string[]; // e.g., 'warm', 'cool', 'earthy', 'soft', 'deep'
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  inStock: boolean;
  stockCount: number;
  suggestedPairs?: string[]; // Product slugs to complete the look
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  unitPrice: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

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

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  primaryImage: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ND8492
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  estimatedTax: number;
  total: number;
  status: OrderStatus;
  estimatedDelivery: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'authorized' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  fulfillmentStatus?: 'unfulfilled' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  carrier?: string;
  internalNotes?: string;
  refundAmount?: number;
  refundReason?: string;
  refundDate?: string;
  orderEvents?: { id: string; timestamp: string; title: string; actor: string }[];
  returnRequests?: any[];
  refundRecords?: any[];
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberSince: string;
  savedAddresses: ShippingAddress[];
}

export interface CMSHeroSection {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  desktopImage: string;
  mobileImage: string;
  badge?: string;
}

export interface CMSCategorySection {
  id: string;
  category: string;
  title: string;
  statement: string;
  ctaText: string;
  destination: string;
  image: string;
  mobileImage: string;
  align: 'left' | 'right' | 'center' | 'split';
  badge?: string;
  order: number;
  active: boolean;
}

export interface ColorPaletteResult {
  undertone: 'Warm' | 'Cool' | 'Olive' | 'Neutral';
  paletteName: string;
  headline: string;
  description: string;
  paletteColors: { name: string; hex: string }[];
  jewelleryTone: string;
  jewelleryDescription: string;
  recommendedSubcategories: SubcategorySlug[];
  colorFilterKeywords: string[];
}
