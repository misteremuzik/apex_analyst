import { useState } from 'react';
import { Check, Sparkles, Shield, Zap, TrendingUp, Search, Crown } from 'lucide-react';
import { UrlInput } from './UrlInput';
import { AuthModal } from './AuthModal';

interface LandingPageProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
}

export function LandingPage({ onAnalyze, isAnalyzing }: LandingPageProps) {
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

          <UrlInput onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} />
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-medium text-gray-900 mb-3">Free Tier</h3>
            <p className="text-gray-600 mb-6">Perfect for getting started with AI optimization</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Complete AI Readiness Score</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">6 Category Analysis Reports</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Prioritized Recommendations</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Free Consultation Offer</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-3xl font-medium text-black mb-1">Free</div>
              <div className="text-sm text-gray-500">No credit card required</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-black to-gray-800 border-2 border-black rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <div className="bg-yellow-400 text-black text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                PREMIUM
              </div>
            </div>

            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-3">Premium Tier</h3>
            <p className="text-gray-300 mb-6">For serious AI optimization and ongoing support</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-200">Everything in Free, plus:</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white font-medium">AI Assistant Chat Support</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-200">Analysis History & Tracking</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-200">Unlimited Website Analyses</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-200">Priority Email Support</span>
              </div>
            </div>

            <button
              onClick={handleGetStarted}
              className="w-full bg-white text-black font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors mb-4"
            >
              Get Started with Premium
            </button>

            <div className="pt-4 border-t border-gray-700">
              <div className="text-3xl font-medium text-white mb-1">Coming Soon</div>
              <div className="text-sm text-gray-400">Be the first to know when we launch</div>
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
