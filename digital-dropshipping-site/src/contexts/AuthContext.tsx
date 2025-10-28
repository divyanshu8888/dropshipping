import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isFreelancer: () => boolean;
  isClient: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  console.log('AuthProvider - Rendering with user:', user);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      console.log('AuthProvider - Initializing auth...');
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('AuthProvider - Restored user from localStorage:', parsedUser);
            setUser(parsedUser);
          } catch (err) {
            console.error('AuthProvider - Error parsing stored user:', err);
            localStorage.removeItem('user');
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Verify session with server in background
  useEffect(() => {
    const verifySession = async () => {
      if (typeof window === 'undefined' || !user) return;

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-data': JSON.stringify(user)
          }
        });

        if (!response.ok) {
          console.log('AuthProvider - Session invalid, logging out');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (err) {
        console.error('AuthProvider - Session verification error:', err);
      }
    };

    // Verify session after 2 seconds
    const timeoutId = setTimeout(verifySession, 2000);
    return () => clearTimeout(timeoutId);
  }, [user]);

  const login = async (email: string, password: string) => {
    console.log('AuthProvider - Login called for:', email);
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('AuthProvider - Login response:', data);

      if (response.ok && data.user) {
        console.log('AuthProvider - Login successful, setting user:', data.user);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Update state
        setUser(data.user);
        
        console.log('AuthProvider - User state updated, redirecting...');
        
        // Redirect based on role
        setTimeout(() => {
          if (data.user.role === 'ADMIN' || data.user.role === 'TEAM_MEMBER') {
            router.push('/admin');
          } else if (data.user.role === 'FREELANCER') {
            router.push('/freelancers/dashboard');
          } else {
            router.push('/client-dashboard');
          }
        }, 100);
        
        setLoading(false);
        return { success: true };
      } else {
        setError(data.error || 'Login failed');
        setLoading(false);
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('AuthProvider - Login error:', err);
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    console.log('AuthProvider - Logout called');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    setUser(null);
    router.push('/login');
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isFreelancer = () => {
    return user?.role === 'FREELANCER';
  };

  const isClient = () => {
    return user?.role === 'CLIENT';
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAdmin,
    isFreelancer,
    isClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

