import { useState } from 'react';
import { User, LogOut, Crown, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { AccountSettings } from './AccountSettings';

interface NavbarProps {
  onLogoClick?: () => void;
}

export function Navbar({ onLogoClick }: NavbarProps) {
  const { user, premiumUser, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const getTierLabel = () => {
    const tier = premiumUser?.subscription_tier || 'free';
    const tierLabels: { [key: string]: string } = {
      'free': 'Free',
      'starter': 'Starter',
      'professional': 'Professional',
      'business': 'Business',
      'enterprise': 'Enterprise',
    };
    return tierLabels[tier] || 'Free';
  };

  const isPaidTier = premiumUser?.subscription_tier && premiumUser.subscription_tier !== 'free';

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onLogoClick}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">owl</span>
              </div>
              <span className="text-xl font-medium text-gray-900">Apex Analyst</span>
            </button>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700">{user.email}</span>
                    {isPaidTier && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <div className="p-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getTierLabel()} Plan
                          </p>
                          {premiumUser && premiumUser.analysis_limit > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {premiumUser.analysis_count || 0} / {premiumUser.analysis_limit} analyses used
                            </p>
                          )}
                          {premiumUser && premiumUser.analysis_limit === -1 && (
                            <p className="text-xs text-green-600 mt-1">
                              Unlimited analyses
                            </p>
                          )}
                        </div>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowAccountSettings(true);
                          }}
                        >
                          <Settings className="w-4 h-4" />
                          Account Settings
                        </button>
                        {!isPaidTier && (
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            onClick={() => {
                              setShowUserMenu(false);
                              window.location.href = '/?pricing=true';
                            }}
                          >
                            <Crown className="w-4 h-4 text-yellow-500" />
                            Upgrade Plan
                          </button>
                        )}
                        <button
                          onClick={() => {
                            signOut();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-black text-white text-sm font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <AccountSettings
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </>
  );
}
