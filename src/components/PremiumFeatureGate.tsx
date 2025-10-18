import { ReactNode, useState } from 'react';
import { Crown, Lock, Info } from 'lucide-react';
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
  const [showDetails, setShowDetails] = useState(false);

  if (isPremium) {
    return <>{children}</>;
  }

  if (!showTeaser) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none select-none opacity-40 grayscale">
          {children}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="font-medium">Premium Feature</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDetails(true)}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Info className="w-4 h-4" />
                Learn More
              </button>
              {user ? (
                <button
                  onClick={() => {
                    alert('Premium subscriptions coming soon! We\'ll notify you when they\'re available.');
                  }}
                  className="bg-black text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                  <Crown className="w-4 h-4 text-yellow-400" />
                  Upgrade to Premium
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-black text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
                  <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  AEO Visibility Score & Metrics
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  Performance metrics & Core Web Vitals
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  AI Assistant with expert guidance
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  Unlimited website analyses
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  Analysis history & tracking
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
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
                <Crown className="w-5 h-5 text-yellow-400" />
                Upgrade to Premium
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowDetails(false);
                  setShowAuthModal(true);
                }}
                className="w-full bg-black text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Sign In to Continue
              </button>
            )}

            <button
              onClick={() => setShowDetails(false)}
              className="w-full mt-3 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

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
