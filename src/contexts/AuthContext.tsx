import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface PremiumUser {
  id: string;
  email: string;
  subscription_status: string;
  subscription_tier: 'free' | 'starter' | 'professional' | 'business' | 'enterprise' | 'premium';
  trial_ends_at: string | null;
  subscribed_at: string | null;
  cancelled_at: string | null;
  analysis_count: number;
  analysis_limit: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  premiumUser: PremiumUser | null;
  isPremium: boolean;
  isLoading: boolean;
  isFree: boolean;
  isStarter: boolean;
  isProfessional: boolean;
  isBusiness: boolean;
  isEnterprise: boolean;
  hasFeatureAccess: (feature: string) => boolean;
  canAnalyze: () => { allowed: boolean; reason?: string };
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [premiumUser, setPremiumUser] = useState<PremiumUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPremiumUser(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPremiumUser(session.user.id);
      } else {
        setPremiumUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPremiumUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('premium_users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setPremiumUser(data);
    } catch (error) {
      console.error('Error fetching premium user:', error);
      setPremiumUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPremiumUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const isPremium = premiumUser?.subscription_tier === 'premium';
  const isFree = premiumUser?.subscription_tier === 'free' || !premiumUser;
  const isStarter = premiumUser?.subscription_tier === 'starter';
  const isProfessional = premiumUser?.subscription_tier === 'professional';
  const isBusiness = premiumUser?.subscription_tier === 'business';
  const isEnterprise = premiumUser?.subscription_tier === 'enterprise';

  const hasFeatureAccess = (feature: string): boolean => {
    if (!user) return false;

    const tier = premiumUser?.subscription_tier || 'free';
    const tierHierarchy = ['free', 'starter', 'professional', 'business', 'enterprise'];
    const currentTierIndex = tierHierarchy.indexOf(tier);

    const featureRequirements: { [key: string]: number } = {
      'basic_analysis': 0,
      'performance_metrics': 1,
      'ai_chat': 2,
      'advanced_analytics': 3,
      'api_access': 3,
      'white_label': 4,
    };

    const requiredTierIndex = featureRequirements[feature] ?? 0;
    return currentTierIndex >= requiredTierIndex;
  };

  const canAnalyze = (): { allowed: boolean; reason?: string } => {
    if (!user) {
      return { allowed: false, reason: 'Please sign in to analyze websites' };
    }

    if (!premiumUser) {
      return { allowed: false, reason: 'Loading user data...' };
    }

    const analysisLimit = premiumUser.analysis_limit || 3;
    const analysisCount = premiumUser.analysis_count || 0;

    if (analysisLimit === -1) {
      return { allowed: true };
    }

    if (analysisCount >= analysisLimit) {
      return {
        allowed: false,
        reason: `You've reached your monthly limit of ${analysisLimit} analyses. Upgrade to analyze more websites.`,
      };
    }

    return { allowed: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        premiumUser,
        isPremium,
        isLoading,
        isFree,
        isStarter,
        isProfessional,
        isBusiness,
        isEnterprise,
        hasFeatureAccess,
        canAnalyze,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
