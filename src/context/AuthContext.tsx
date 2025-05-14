import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state and listen for changes
  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('auth_token');
      if (token) {
        try {
          const response = await fetch(`http://localhost:5000/api/users/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            credentials: 'include'
          });
          if (response.ok) {
            const backendUser = await response.json();
            setUser({
              id: backendUser.id,
              email: backendUser.email,
              name: backendUser.name,
              role: backendUser.role as UserRole,
              clientId: backendUser.clientId,
              phone: backendUser.phone,
              avatar_url: backendUser.avatar_url,
              notification_preferences: backendUser.notification_preferences,
              appearance_settings: backendUser.appearance_settings,
              createdAt: new Date(backendUser.created_at),
              updatedAt: new Date(backendUser.updated_at),
              lastLogin: backendUser.last_login ? new Date(backendUser.last_login) : undefined
            });
            console.log("user:", backendUser);
          } else {
            Cookies.remove('auth_token');
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          Cookies.remove('auth_token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const token = Cookies.get('auth_token');
        if (token) {
          try {
            const response = await fetch(`http://localhost:5000/api/users/me`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              credentials: 'include'
            });
            if (response.ok) {
              const backendUser = await response.json();
              setUser({
                id: backendUser.id,
                email: backendUser.email,
                name: backendUser.name,
                role: backendUser.role as UserRole,
                clientId: backendUser.clientId,
                phone: backendUser.phone,
                avatar_url: backendUser.avatar_url,
                notification_preferences: backendUser.notification_preferences,
                appearance_settings: backendUser.appearance_settings,
                createdAt: new Date(backendUser.created_at),
                updatedAt: new Date(backendUser.updated_at),
                lastLogin: backendUser.last_login ? new Date(backendUser.last_login) : undefined
              });
            } else {
              Cookies.remove('auth_token');
            }
          } catch (error) {
            console.error('Failed to fetch user data on sign-in:', error);
            Cookies.remove('auth_token');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        Cookies.remove('auth_token');
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!email || !password) throw new Error('Email and password are required');
      console.log('Sending login request:', { email, password });

      const response = await fetch(`http://localhost:5000/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const { user: backendUser, session, token } = await response.json();
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });

      // Set JWT in cookie
      Cookies.set('auth_token', token, {
        expires: 1 / 24, 
      });

      setUser({
        id: backendUser.id,
        email: backendUser.email,
        name: backendUser.name,
        role: backendUser.role as UserRole,
        clientId: backendUser.clientId,
        phone: backendUser.phone,
        avatar_url: backendUser.avatar_url,
        notification_preferences: backendUser.notification_preferences,
        appearance_settings: backendUser.appearance_settings,
        createdAt: new Date(backendUser.created_at),
        updatedAt: new Date(backendUser.updated_at),
        lastLogin: backendUser.last_login ? new Date(backendUser.last_login) : undefined
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`http://localhost:5000/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed');
      }

      await supabase.auth.signOut();
      Cookies.remove('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };    

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      forgotPassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};