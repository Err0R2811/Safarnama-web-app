import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/supabaseService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting initial user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Listen to auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      await authService.signUp(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};