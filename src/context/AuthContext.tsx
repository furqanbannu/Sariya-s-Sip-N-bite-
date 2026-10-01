import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken } from '../services/apiService';

export type UserRole = 'owner' | 'admin' | 'manager' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  twoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  canAccessSection: (section: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sariya_admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('sariya_admin_token');
      if (storedToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          setToken(storedToken);
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          setAuthToken(null);
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }

    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setToken(res.token);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Section-based authorization check matching the prompt specifications
  const canAccessSection = (section: string): boolean => {
    if (!user) return false;

    // Owner has full access to every single section
    if (user.role === 'owner') return true;

    // Admin has access to all operational sections (excluding staff management)
    if (user.role === 'admin') {
      return section !== 'Staff Management';
    }

    // Manager has access to orders, reservations, menu, customers, reports
    if (user.role === 'manager') {
      const managerSections = [
        'Dashboard Overview',
        'Orders',
        'Reservations',
        'Menu Management',
        'Categories',
        'Products',
        'Prices',
        'Pizza Sizes',
        'Add-ons',
        'Offers & Discounts',
        'Customers',
        'Tables',
        'Reviews',
        'Reports & Analytics',
        'Notifications',
      ];
      return managerSections.includes(section);
    }

    // Staff has access to orders, reservations, limited menu access, and tables
    if (user.role === 'staff') {
      const staffSections = [
        'Dashboard Overview',
        'Orders',
        'Reservations',
        'Tables',
        'Menu Management',
        'Products',
        'Notifications',
      ];
      return staffSections.includes(section);
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasRole,
        canAccessSection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
