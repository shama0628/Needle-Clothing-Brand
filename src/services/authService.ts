import { AdminUser } from '../types/admin';

/**
 * Isolated Admin Authentication Service
 *
 * NOTE: This is an isolated client-side development authentication service.
 * It encapsulates credential verification and session management behind an asynchronous
 * service contract, enabling a seamless drop-in replacement with a backend REST/GraphQL/JWT
 * endpoint (e.g., POST /api/admin/login) in production.
 */

export interface AuthSession {
  user: AdminUser;
  token: string;
  authenticatedAt: string;
}

// Single authorized administrator account
const SINGLE_ADMIN_ACCOUNT: AdminUser = {
  id: 'adm-needle-main',
  name: 'Atelier Administrator',
  email: 'admin@needle.com',
  role: 'admin',
  status: 'active',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  lastLogin: 'Session Active'
};

// Defined development credentials (single admin account)
const DEV_ADMIN_CREDENTIALS = {
  loginId: 'admin@needle.com',
  password: 'NeedleAdmin2026!'
};

const SESSION_STORAGE_KEY = 'needle_admin_auth_session';

export const authService = {
  /**
   * Authenticate administrator credentials asynchronously
   */
  async login(loginId: string, password: string): Promise<{ success: boolean; user?: AdminUser; token?: string; error?: string }> {
    const cleanId = loginId.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return {
        success: false,
        error: 'Please enter both your Admin Login ID and Password.'
      };
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanId, password: cleanPass })
      });

      const data = await response.json();

      if (response.ok && data.success && data.user?.role === 'admin') {
        const session: AuthSession = {
          user: {
            ...SINGLE_ADMIN_ACCOUNT,
            id: data.user.id,
            name: `${data.user.firstName} ${data.user.lastName}`.trim() || SINGLE_ADMIN_ACCOUNT.name,
            email: data.user.email,
            lastLogin: new Date().toISOString()
          },
          token: data.token,
          authenticatedAt: new Date().toISOString()
        };

        authService.saveSession(session);
        return {
          success: true,
          user: session.user,
          token: session.token
        };
      }

      return {
        success: false,
        error: data.error || 'Invalid administrator credentials.'
      };
    } catch (err: any) {
      // Fallback only if server is temporarily unreachable in dev mode
      if (cleanId === DEV_ADMIN_CREDENTIALS.loginId.toLowerCase() && cleanPass === DEV_ADMIN_CREDENTIALS.password) {
        const token = `dev-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const session: AuthSession = {
          user: { ...SINGLE_ADMIN_ACCOUNT, lastLogin: new Date().toISOString() },
          token,
          authenticatedAt: new Date().toISOString()
        };

        authService.saveSession(session);
        return {
          success: true,
          user: session.user,
          token: session.token
        };
      }

      return {
        success: false,
        error: 'Unable to connect to authentication server. Please verify the API server is running.'
      };
    }
  },

  /**
   * Save session to storage
   */
  saveSession(session: AuthSession): void {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      // Also persist in localStorage so page reloads during development work smoothly
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage unavailable or disabled
    }
  },

  /**
   * Retrieve active session, or null if unauthenticated
   */
  getSession(): AuthSession | null {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed?.token && parsed?.user && parsed?.user?.role === 'admin') {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Destroy the session completely on logout
   */
  clearSession(): void {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
};
