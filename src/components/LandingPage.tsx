import { useState } from 'react';
import { Check, Sparkles, Shield, Zap, TrendingUp, Search, Crown } from 'lucide-react';
import { UrlInput } from './UrlInput';
import { AuthModal } from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface LandingPageProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
}

const PRICING_TIERS = [
  {
    name: 'Free',
    price: '$0',
    priceId: 'price_1SJjamF0amqk11yXTJS9dbRB',
    tier: 'free',
    description: 'Perfect for trying out AI optimization',
    features: [
      'Complete AI Readiness Score',
      '6 Category Analysis',
      '3 Free Analyses',
    ],
  },
  {
    name: 'Starter',
    price: '$9.99',
    priceId: 'price_1SJjbSF0amqk11yXcrXv8Jrd',
    tier: 'starter',
    description: 'Great for small businesses',
    features: [
      'Everything in Free',
      'Performance Metrics',
      'Visibility Score',
      '25 Analyses/month',
    ],
    popular: true,
  },
  {
    name: 'Professional',
    price: '$29.99',
    priceId: 'price_1SJjbvF0amqk11yXBfgGEnCj',
    tier: 'professional',
    description: 'For professionals who need more',
    features: [
      'Everything in Starter',
      'AI Assistant Chat',
      'Analysis History',
      '100 Analyses/month',
    ],
  },
  {
    name: 'Business',
    price: '$79.99',
    priceId: 'price_1SJjcTF0amqk11yXTzeAEAX6',
    tier: 'business',
    description: 'Advanced features for teams',
    features: [
      'Everything in Professional',
      'Unlimited Analyses',
      'Multi-site Dashboard',
      'API Access',
    ],
  },
  {
    name: 'Enterprise',
    price: '$199.99',
    priceId: 'price_1SJjczF0amqk11yXCpwWPEFQ',
    tier: 'enterprise',
    description: 'Custom solutions',
    features: [
      'Everything in Business',
      'White-label Solutions',
      'Custom Integrations',
      '24/7 Premium Support',
    ],
  },
];

export function LandingPage({ onAnalyze, isAnalyzing }: LandingPageProps) {
  const { user, premiumUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleGetStarted = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleUpgrade = async (priceId: string, tier: string) => {
    if (!user) {
      handleGetStarted();
      return;
    }

    if (tier === 'free') {
      return;
    }

    setLoadingTier(tier);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create checkout session');
      }

      const { url } = responseData;
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setLoadingTier(null);
    }
  };

  const isCurrentPlan = (tier: string) => {
    if (!user) return false;
    if (tier === 'free' && (!premiumUser || premiumUser?.subscription_tier === 'free')) return true;
    return premiumUser?.subscription_tier === tier;
  };

  const getButtonText = (tier: string) => {
    if (loadingTier === tier) return 'Loading...';
    if (isCurrentPlan(tier)) return 'Current Plan';
    if (tier === 'free' && !user) return 'Get Started';
    if (tier === 'free') return 'Free Forever';
    return 'Upgrade';
  };

  const isButtonDisabled = (tier: string) => {
    return loadingTier !== null || isCurrentPlan(tier) || (tier === 'free' && user !== null);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            AI Search is Here. Is Your Website Ready?
          </div>

          <h1 className="text-5xl md:text-6xl font-normal text-black mb-6 leading-tight">
            Get Found by AI Search Engines
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Analyze your website's AI readiness in seconds. Get actionable insights to improve your visibility in ChatGPT, Perplexity, and other AI search results.
          </p>

          <UrlInput onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} />

          {!user && (
            <div className="text-center mt-8">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Want to save your results?
                </h3>
                <p className="text-gray-600 mb-4">
                  Sign up for a free account to access analysis history, AI chat assistant, and premium features.
                </p>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="bg-black text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Get Started for Free
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-medium text-center text-gray-900 mb-12">
            Why AI Readiness Matters
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Increased Visibility</h3>
              <p className="text-sm text-gray-600">
                AI search engines are rapidly becoming the primary way users discover information. Don't get left behind.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Future-Proof</h3>
              <p className="text-sm text-gray-600">
                Stay ahead of the curve with optimizations that work for both traditional and AI-powered search.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Wins</h3>
              <p className="text-sm text-gray-600">
                Get actionable recommendations you can implement immediately to boost your AI search rankings.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-medium text-center text-gray-900 mb-12">
            Choose Your Plan
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.tier}
                className={`rounded-2xl p-6 relative transition-all ${
                  tier.popular
                    ? 'border-2 border-black bg-white'
                    : 'border border-gray-200 bg-white'
                } ${isCurrentPlan(tier.tier) ? 'opacity-50' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
                      POPULAR
                    </div>
                  </div>
                )}

                {isCurrentPlan(tier.tier) && (
                  <div className="absolute -top-3 right-4">
                    <div className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Current
                    </div>
                  </div>
                )}

                <h3 className="text-xl font-medium text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                <div className="mb-4">
                  <span className="text-3xl font-medium text-black">{tier.price}</span>
                  {tier.tier !== 'free' && (
                    <span className="text-sm text-gray-500">/mo</span>
                  )}
                </div>

                <button
                  onClick={() => handleUpgrade(tier.priceId, tier.tier)}
                  disabled={isButtonDisabled(tier.tier)}
                  className={`w-full py-3 px-4 rounded-lg font-medium mb-6 transition-all ${
                    tier.popular
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {getButtonText(tier.tier)}
                </button>

                <div className="space-y-2 text-sm">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center bg-gray-50 border border-gray-200 rounded-2xl p-12">
          <h2 className="text-3xl font-medium text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Analyze your website for free in under 30 seconds. No credit card required.
          </p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-black text-white font-medium py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Analyze My Website
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}
