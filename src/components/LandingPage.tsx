import { useState } from 'react';
import { Check, Sparkles, Shield, Zap, TrendingUp, Search, Crown } from 'lucide-react';
import { UrlInput } from './UrlInput';
import { AuthModal } from './AuthModal';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
}

export function LandingPage({ onAnalyze, isAnalyzing }: LandingPageProps) {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const handleGetStarted = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
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

          {user ? (
            <UrlInput onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} />
          ) : (
            <div className="text-center">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-medium text-gray-900 mb-3">
                  Sign Up to Analyze Your Website
                </h3>
                <p className="text-gray-600 mb-6">
                  Create a free account to access AI readiness analysis and start optimizing your website for AI search engines.
                </p>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="bg-black text-white font-medium py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Get Started for Free
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-medium text-center text-gray-900 mb-12">
            Choose Your Plan
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Free</h3>
              <p className="text-sm text-gray-600 mb-4">Perfect for trying out AI optimization</p>
              <div className="mb-4">
                <span className="text-3xl font-medium text-black">$0</span>
              </div>
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Complete AI Readiness Score</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">6 Category Analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">3 Free Analyses</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-black rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full">POPULAR</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Starter</h3>
              <p className="text-sm text-gray-600 mb-4">Great for small businesses</p>
              <div className="mb-4">
                <span className="text-3xl font-medium text-black">$9.99</span>
                <span className="text-sm text-gray-500">/mo</span>
              </div>
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Everything in Free</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Performance Metrics</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Visibility Score</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">25 Analyses/month</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Professional</h3>
              <p className="text-sm text-gray-600 mb-4">For professionals who need more</p>
              <div className="mb-4">
                <span className="text-3xl font-medium text-black">$29.99</span>
                <span className="text-sm text-gray-500">/mo</span>
              </div>
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Everything in Starter</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">AI Assistant Chat</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Analysis History</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">100 Analyses/month</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Business</h3>
              <p className="text-sm text-gray-600 mb-4">Advanced features for teams</p>
              <div className="mb-4">
                <span className="text-3xl font-medium text-black">$79.99</span>
                <span className="text-sm text-gray-500">/mo</span>
              </div>
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Everything in Professional</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited Analyses</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Multi-site Dashboard</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">API Access</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Enterprise</h3>
              <p className="text-sm text-gray-600 mb-4">Custom solutions</p>
              <div className="mb-4">
                <span className="text-3xl font-medium text-black">$199.99</span>
                <span className="text-sm text-gray-500">/mo</span>
              </div>
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Everything in Business</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">White-label Solutions</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Custom Integrations</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">24/7 Premium Support</span>
                </div>
              </div>
            </div>
          </div>
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
