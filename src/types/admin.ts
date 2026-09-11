export type AdminRole = 'admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  avatar?: string;
  lastLogin: string;
}

export type AuditCategory = 
  | 'product' 
  | 'price' 
  | 'stock' 
  | 'order' 
  | 'refund' 
  | 'cms' 
  | 'category' 
  | 'color-theory'
  | 'user' 
  | 'settings';

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: AdminRole;
  category: AuditCategory;
  action: string;
  entityId?: string;
  entityName?: string;
  details: string;
  beforeAfter?: {
    before: any;
    after: any;
  };
}

export interface StockMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  sku: string;
  quantityDelta: number;
  newQuantity: number;
  reason: 
    | 'Restock shipment received'
    | 'Inventory audit discrepancy'
    | 'Damaged goods write-off'
    | 'Customer return restock'
    | 'Order fulfillment'
    | 'Order cancellation restock'
    | 'Manual adjustment';
  actorName: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend?: number;
  active: boolean;
  usageCount: number;
  expiresAt?: string;
  description: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  storeStatus: 'active' | 'maintenance';
}
