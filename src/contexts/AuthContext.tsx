import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.info('Initializing auth state', 'AuthProvider');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error('Failed to get initial session', 'AuthProvider', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          logger.info(`User session restored: ${session.user.email}`, 'AuthProvider');
        } else {
          logger.debug('No active session found', 'AuthProvider');
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      logger.info(`Auth state changed: ${_event}`, 'AuthProvider', {
        event: _event,
        userId: session?.user?.id,
        email: session?.user?.email,
      });

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      logger.debug('Cleaning up auth listener', 'AuthProvider');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    logger.info(`Sign up attempt for: ${email}`, 'AuthProvider');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      logger.error(`Sign up failed for ${email}`, 'AuthProvider', error);
    } else {
      logger.info(`Sign up successful for ${email}`, 'AuthProvider', {
        userId: data.user?.id,
        needsConfirmation: !data.session,
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    logger.info(`Sign in attempt for: ${email}`, 'AuthProvider');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error(`Sign in failed for ${email}`, 'AuthProvider', error);
    } else {
      logger.info(`Sign in successful for ${email}`, 'AuthProvider', {
        userId: data.user?.id,
      });
    }

    return { error };
  };

  const signOut = async () => {
    const userEmail = user?.email;
    logger.info(`Sign out attempt for: ${userEmail}`, 'AuthProvider');

    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error(`Sign out failed for ${userEmail}`, 'AuthProvider', error);
    } else {
      logger.info(`Sign out successful for ${userEmail}`, 'AuthProvider');
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
