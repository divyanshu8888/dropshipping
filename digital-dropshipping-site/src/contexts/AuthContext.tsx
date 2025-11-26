import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const CLIENT_SESSION_FLAG = 'auth_session_initialized';

const isFreshClientSession = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const sessionSeen = sessionStorage.getItem(CLIENT_SESSION_FLAG);

  if (!sessionSeen) {
    sessionStorage.setItem(CLIENT_SESSION_FLAG, 'true');
    return true;
  }

  return false;
};

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
  verified: boolean;
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
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  // Initialize user from localStorage on mount
  useEffect(() => {
    let active = true;
    const hydrateUser = () => {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      try {
        return JSON.parse(raw) as User;
      } catch (error) {
        localStorage.removeItem('user');
        return null;
      }
    };

    const initialize = async () => {
      let cachedUser = hydrateUser();
      const shouldResetClientSession = isFreshClientSession() && cachedUser?.role === 'CLIENT';

      if (shouldResetClientSession) {
        localStorage.removeItem('user');
        cachedUser = null;
      }

      if (active) {
        setUser(cachedUser);
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: cachedUser })
        });

        if (!response.ok) {
          if (active) {
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          const payload = await response.json();
          if (payload?.user && active) {
            setUser(payload.user);
            localStorage.setItem('user', JSON.stringify(payload.user));
          }
        }
      } catch (verifyError) {
        console.error('AuthProvider - verify error:', verifyError);
      } finally {
        if (active) {
          setVerified(true);
          setLoading(false);
        }
      }
    };

    initialize();
    return () => {
      active = false;
    };
  }, []);

  // Verify session with server in background
  useEffect(() => {
    if (!verified || !user) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user })
        });

        if (!response.ok) {
          localStorage.removeItem('user');
          setUser(null);
        } else {
          const payload = await response.json();
          if (payload?.user) {
            setUser(payload.user);
            localStorage.setItem('user', JSON.stringify(payload.user));
          }
        }
      } catch (intervalError) {
        console.error('AuthProvider - periodic verify error:', intervalError);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [verified, user]);

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
            router.push('/clients/dashboard');
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
    verified,
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

