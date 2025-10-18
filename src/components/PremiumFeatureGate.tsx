import { ReactNode, useState } from 'react';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface PremiumFeatureGateProps {
  children: ReactNode;
  featureName?: string;
  description?: string;
  showTeaser?: boolean;
}

export function PremiumFeatureGate({
  children,
  featureName = 'Premium Feature',
  description = 'Upgrade to premium to unlock this feature',
  showTeaser = true,
}: PremiumFeatureGateProps) {
  const { user, isPremium } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isPremium) {
    return <>{children}</>;
  }

  if (!showTeaser) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white border-2 border-black rounded-2xl p-8 max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center">
                <Crown className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <h3 className="text-2xl font-medium text-center text-gray-900 mb-2">
              {featureName}
            </h3>
            <p className="text-center text-gray-600 mb-6">{description}</p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">Premium includes:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="w-4 h-4 text-black flex-shrink-0" />
                  Performance metrics & Core Web Vitals
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="w-4 h-4 text-black flex-shrink-0" />
                  AI Assistant with expert guidance
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="w-4 h-4 text-black flex-shrink-0" />
                  Unlimited website analyses
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="w-4 h-4 text-black flex-shrink-0" />
                  Analysis history & tracking
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="w-4 h-4 text-black flex-shrink-0" />
                  Priority support
                </li>
              </ul>
            </div>

            {user ? (
              <button
                className="w-full bg-black text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  alert('Premium subscriptions coming soon! We\'ll notify you when they\'re available.');
                }}
              >
                <Crown className="w-5 h-5" />
                Upgrade to Premium
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-black text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Sign In to Unlock
              </button>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              Premium features coming soon
            </p>
          </div>
        </div>

        <div className="pointer-events-none blur-sm opacity-50">{children}</div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signup"
      />
    </>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-black text-white text-xs font-medium px-2 py-1 rounded">
      <Crown className="w-3 h-3 text-yellow-400" />
      PREMIUM
    </span>
  );
}
