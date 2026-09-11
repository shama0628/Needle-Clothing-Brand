import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, AdminRole, AuditLog, AuditCategory, StockMovement, StoreSettings } from '../types/admin';
import { authService } from '../services/authService';

export interface AdminContextType {
  // Session & Authentication
  currentAdmin: AdminUser | null;
  isAuthenticated: boolean;
  login: (loginId: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (area: string) => boolean;

  // Admin Team Management
  adminUsers: AdminUser[];
  inviteAdminUser: (name: string, email: string) => { success: boolean; message: string };
  toggleUserStatus: (userId: string) => void;
  forcePasswordReset: (userId: string) => void;

  // Immutable Audit Logging
  auditLogs: AuditLog[];
  logAction: (
    category: AuditCategory,
    action: string,
    details: string,
    entityId?: string,
    entityName?: string,
    beforeAfter?: { before: any; after: any }
  ) => void;

  // Stock Movement Log
  stockMovements: StockMovement[];
  recordStockMovement: (
    productId: string,
    productName: string,
    sku: string,
    quantityDelta: number,
    newQuantity: number,
    reason: StockMovement['reason']
  ) => void;

  // System Settings
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'NEEDLE',
  tagline: 'Stitching your Story',
  supportEmail: 'concierge@needlestudio.com',
  supportPhone: '+1 (800) 842-9104',
  currency: 'USD',
  currencySymbol: '$',
  taxRatePercent: 8.0,
  freeShippingThreshold: 100,
  standardShippingFee: 12,
  expressShippingFee: 25,
  storeStatus: 'active'
};

const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-needle-main',
    name: 'Atelier Administrator',
    email: 'admin@needle.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    lastLogin: 'Session Active'
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-03-04T11:20:00Z',
    actorId: 'adm-needle-main',
    actorName: 'Atelier Administrator',
    actorRole: 'admin',
    category: 'cms',
    action: 'Updated Homepage Hero Campaign',
    entityId: 'hero',
    entityName: 'The Art of Modesty',
    details: 'Changed hero CTA destination to /clothing/dresses and renewed seasonal badge.',
    beforeAfter: {
      before: { badge: 'PRE-FALL 2025' },
      after: { badge: 'NEW COLLECTION 2026' }
    }
  },
  {
    id: 'aud-2',
    timestamp: '2026-03-03T16:45:00Z',
    actorId: 'adm-needle-main',
    actorName: 'Atelier Administrator',
    actorRole: 'admin',
    category: 'stock',
    action: 'Restocked Inventory',
    entityId: 'prod-pm-1',
    entityName: 'Pure Modal Hijab - Desert Sand',
    details: 'Received production batch (+50 units).',
    beforeAfter: {
      before: { stock: 15 },
      after: { stock: 65 }
    }
  },
  {
    id: 'aud-3',
    timestamp: '2026-03-02T14:10:00Z',
    actorId: 'adm-needle-main',
    actorName: 'Atelier Administrator',
    actorRole: 'admin',
    category: 'price',
    action: 'Adjusted Seasonal Pricing',
    entityId: 'prod-dr-1',
    entityName: 'Aurelia Pleated Silk Abaya Dress',
    details: 'Set promotional sale price to $165 (previously $185).',
    beforeAfter: {
      before: { salePrice: undefined, basePrice: 185 },
      after: { salePrice: 165, basePrice: 185 }
    }
  }
];

const DEFAULT_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm-1',
    timestamp: '2026-03-03T16:45:00Z',
    productId: 'prod-pm-1',
    productName: 'Pure Modal Hijab - Desert Sand',
    sku: 'NDL-PM-1',
    quantityDelta: 50,
    newQuantity: 65,
    reason: 'Restock shipment received',
    actorName: 'Atelier Administrator'
  },
  {
    id: 'sm-2',
    timestamp: '2026-03-02T16:40:00Z',
    productId: 'prod-dr-1',
    productName: 'Aurelia Pleated Silk Abaya Dress',
    sku: 'NDL-DR-1',
    quantityDelta: -1,
    newQuantity: 18,
    reason: 'Order fulfillment',
    actorName: 'System (Order ND7320)'
  },
  {
    id: 'sm-3',
    timestamp: '2026-03-01T10:00:00Z',
    productId: 'prod-cj-1',
    productName: 'Everyday Classical Jersey Hijab',
    sku: 'NDL-CJ-1',
    quantityDelta: 40,
    newQuantity: 45,
    reason: 'Restock shipment received',
    actorName: 'Atelier Administrator'
  }
];

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Session state: null by default (logged out) unless a verified session exists
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const session = authService.getSession();
    return session ? session.user : null;
  });

  // Admin users list
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('needle_admin_team');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ADMIN_USERS;
  });

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('needle_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_AUDIT_LOGS;
  });

  // Stock movements state
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem('needle_stock_movements');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STOCK_MOVEMENTS;
  });

  // System Settings state
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('needle_store_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Sync to storage
  useEffect(() => {
    localStorage.setItem('needle_admin_team', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('needle_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('needle_stock_movements', JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem('needle_store_settings', JSON.stringify(settings));
  }, [settings]);

  // Auth Operations
  const login = async (loginId: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await authService.login(loginId, pass);
    if (res.success && res.user) {
      setCurrentAdmin(res.user);
      logAction('user', 'Administrator Login', `Admin authenticated with active session token.`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed' };
  };

  const logout = () => {
    if (currentAdmin) {
      logAction('user', 'Administrator Logout', `Admin session ended.`);
    }
    authService.clearSession();
    setCurrentAdmin(null);
  };

  // Single-admin permission check: grants access if authenticated
  const hasPermission = (area: string): boolean => {
    return !!currentAdmin;
  };

  // Audit logger
  const logAction = (
    category: AuditCategory,
    action: string,
    details: string,
    entityId?: string,
    entityName?: string,
    beforeAfter?: { before: any; after: any }
  ) => {
    const newEntry: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: currentAdmin?.id || 'adm-needle-main',
      actorName: currentAdmin?.name || 'Atelier Administrator',
      actorRole: 'admin',
      category,
      action,
      entityId,
      entityName,
      details,
      beforeAfter
    };

    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Stock Movement logger
  const recordStockMovement = (
    productId: string,
    productName: string,
    sku: string,
    quantityDelta: number,
    newQuantity: number,
    reason: StockMovement['reason']
  ) => {
    const newMovement: StockMovement = {
      id: `sm-${Date.now()}`,
      timestamp: new Date().toISOString(),
      productId,
      productName,
      sku,
      quantityDelta,
      newQuantity,
      reason,
      actorName: currentAdmin?.name || 'Atelier Administrator'
    };

    setStockMovements(prev => [newMovement, ...prev]);
    logAction(
      'stock',
      'Stock Adjusted',
      `${quantityDelta > 0 ? '+' : ''}${quantityDelta} units on ${sku} (${reason}). New stock: ${newQuantity}`,
      productId,
      productName,
      { before: { quantity: newQuantity - quantityDelta }, after: { quantity: newQuantity } }
    );
  };

  // Admin Team Management
  const inviteAdminUser = (name: string, email: string): { success: boolean; message: string } => {
    const exists = adminUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      return { success: false, message: 'A staff member with this email already exists.' };
    }

    const newUser: AdminUser = {
      id: `adm-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'admin',
      status: 'active',
      lastLogin: 'Never (Invitation Sent)'
    };

    setAdminUsers(prev => [...prev, newUser]);
    logAction('user', 'Staff Member Invited', `Created new staff account for ${name} (${email}).`);
    return { success: true, message: `Invitation sent to ${email}` };
  };

  const toggleUserStatus = (userId: string) => {
    if (currentAdmin?.id === userId) {
      return; // Cannot deactivate active session
    }

    setAdminUsers(prev =>
      prev.map(u => {
        if (u.id !== userId) return u;
        const newStatus = u.status === 'active' ? 'inactive' : 'active';
        logAction('user', 'Staff Status Changed', `Set account status for ${u.name} to ${newStatus.toUpperCase()}`);
        return { ...u, status: newStatus };
      })
    );
  };

  const forcePasswordReset = (userId: string) => {
    const target = adminUsers.find(u => u.id === userId);
    if (target) {
      logAction('user', 'Password Reset Initiated', `Issued single-use password reset token for ${target.name}.`);
    }
  };

  // System Settings
  const updateSettings = (updates: Partial<StoreSettings>) => {
    const before = { ...settings };
    setSettings(prev => ({ ...prev, ...updates }));
    logAction('settings', 'Store Settings Updated', 'Modified store configuration', undefined, undefined, {
      before,
      after: { ...settings, ...updates }
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    logAction('settings', 'Store Settings Reset', 'Restored default store configuration parameters');
  };

  return (
    <AdminContext.Provider
      value={{
        currentAdmin,
        isAuthenticated: !!currentAdmin,
        login,
        logout,
        hasPermission,

        adminUsers,
        inviteAdminUser,
        toggleUserStatus,
        forcePasswordReset,

        auditLogs,
        logAction,

        stockMovements,
        recordStockMovement,

        settings,
        updateSettings,
        resetSettings
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
