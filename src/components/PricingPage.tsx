import { Check, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

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
      'Prioritized Recommendations',
      '3 Free Website Analyses',
      'Basic Email Support',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$9.99',
    priceId: 'price_1SJjbSF0amqk11yXcrXv8Jrd',
    tier: 'starter',
    description: 'Great for small businesses',
    features: [
      'Everything in Free',
      'Performance Metrics & Core Web Vitals',
      'Visibility Score Tracking',
      '25 Website Analyses/month',
      'Priority Email Support',
    ],
    cta: 'Get Started',
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
      'AI Assistant Chat Support',
      'Analysis History & Tracking',
      '100 Website Analyses/month',
      'Advanced SEO Analysis',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Business',
    price: '$79.99',
    priceId: 'price_1SJjcTF0amqk11yXTzeAEAX6',
    tier: 'business',
    description: 'Advanced features for teams',
    features: [
      'Everything in Professional',
      'Unlimited Website Analyses',
      'Multi-site Dashboard',
      'Team Collaboration Tools',
      'API Access',
      'Dedicated Account Manager',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: '$199.99',
    priceId: 'price_1SJjczF0amqk11yXCpwWPEFQ',
    tier: 'enterprise',
    description: 'Custom solutions for organizations',
    features: [
      'Everything in Business',
      'White-label Solutions',
      'Custom Integrations',
      'SLA Guarantee',
      'On-premise Options',
      '24/7 Premium Support',
      'Custom Training',
    ],
    cta: 'Get Started',
    popular: false,
  },
];

export function PricingPage() {
  const { user, premiumUser } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const handleSelectPlan = async (priceId: string, tier: string) => {
    console.log('=== handleSelectPlan called ===');
    console.log('priceId:', priceId);
    console.log('tier:', tier);
    console.log('user:', user);

    if (!user) {
      console.log('No user found, showing error');
      setError('Please sign in to select a plan');
      return;
    }

    if (tier === 'free') {
      console.log('Free tier selected, ignoring');
      return;
    }

    setLoadingTier(tier);
    setError('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
      console.log('API URL:', apiUrl);

      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session retrieved:', session ? 'Yes' : 'No');
      console.log('Access token exists:', session?.access_token ? 'Yes' : 'No');

      const requestBody = { priceId };
      console.log('Request body:', requestBody);

      console.log('Making fetch request...');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('Response not OK, error data:', responseData);
        throw new Error(responseData.error || 'Failed to create checkout session');
      }

      console.log('Response data:', responseData);
      const { url } = responseData;
      console.log('Checkout URL received:', url);

      if (!url) {
        throw new Error('No checkout URL received from server');
      }

      console.log('Redirecting to:', url);
      window.location.href = url;
    } catch (err) {
      console.error('=== Checkout error ===', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoadingTier(null);
    }
  };

  const isCurrentPlan = (tier: string) => {
    if (!user) return false;
    if (tier === 'free' && (!premiumUser || premiumUser?.subscription_tier === 'free')) return true;
    return premiumUser?.subscription_tier === tier;
  };

  const getButtonText = (tier: string, defaultText: string) => {
    if (loadingTier === tier) return 'Loading...';
    if (isCurrentPlan(tier)) return 'Current Plan';
    if (tier === 'free') return 'Free Forever';
    return defaultText;
  };

  const isButtonDisabled = (tier: string) => {
    return loadingTier !== null || isCurrentPlan(tier) || (tier === 'free' && user !== null);
  };

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              Choose Your Plan
            </div>
            <h1 className="text-5xl font-normal text-black mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the plan that best fits your needs. Upgrade or downgrade at any time.
            </p>
          </div>

          {error && (
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.tier}
                className={`relative rounded-2xl p-6 border-2 transition-all ${
                  tier.popular
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${isCurrentPlan(tier.tier) ? 'ring-2 ring-black' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      POPULAR
                    </div>
                  </div>
                )}

                {isCurrentPlan(tier.tier) && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Current
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                  <div className="mb-1">
                    <span className="text-3xl font-medium text-black">{tier.price}</span>
                    {tier.tier !== 'free' && (
                      <span className="text-sm text-gray-500">/month</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPlan(tier.priceId, tier.tier)}
                  disabled={isButtonDisabled(tier.tier)}
                  className={`w-full py-3 px-4 rounded-lg font-medium mb-6 transition-all ${
                    tier.popular
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {getButtonText(tier.tier, tier.cta)}
                </button>

                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">
              All plans include a 14-day money-back guarantee
            </p>
            <p className="text-sm text-gray-500">
              Need a custom solution?{' '}
              <a href="mailto:support@apexanalyst.com" className="text-black font-medium hover:underline">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
