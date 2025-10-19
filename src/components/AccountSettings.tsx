import { useState } from 'react';
import { X, Crown, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSettings({ isOpen, onClose }: AccountSettingsProps) {
  const { premiumUser, refreshPremiumUser } = useAuth();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState(false);

  if (!isOpen) return null;

  const isPaidTier = premiumUser?.subscription_tier && premiumUser.subscription_tier !== 'free';

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

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setCancelError('');

    try {
      if (!premiumUser?.id) {
        throw new Error('User not found');
      }

      const { error } = await supabase
        .from('premium_users')
        .update({
          subscription_status: 'cancelled',
          subscription_tier: 'free',
          cancelled_at: new Date().toISOString(),
          stripe_subscription_id: null,
          stripe_price_id: null,
          analysis_limit: 3,
        })
        .eq('id', premiumUser.id);

      if (error) throw error;

      setCancelSuccess(true);
      await refreshPremiumUser();

      setTimeout(() => {
        setShowCancelConfirm(false);
        onClose();
        setCancelSuccess(false);
      }, 2000);
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Plan</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {isPaidTier && <Crown className="w-5 h-5 text-yellow-500" />}
                  <span className="font-medium text-gray-900">{getTierLabel()} Plan</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {premiumUser?.email}
                </p>
                {premiumUser && premiumUser.analysis_limit === -1 && (
                  <p className="text-sm text-green-600">
                    Unlimited analyses per month
                  </p>
                )}
                {premiumUser && premiumUser.analysis_limit > 0 && (
                  <p className="text-sm text-gray-600">
                    {premiumUser.analysis_count || 0} / {premiumUser.analysis_limit} analyses used this month
                  </p>
                )}
                {premiumUser?.subscription_status && (
                  <p className="text-xs text-gray-500 mt-2 capitalize">
                    Status: {premiumUser.subscription_status}
                  </p>
                )}
              </div>
            </div>

            {isPaidTier && !showCancelConfirm && !cancelSuccess && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Subscription Actions</h3>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            )}

            {showCancelConfirm && !cancelSuccess && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">
                      Cancel Subscription?
                    </h4>
                    <p className="text-sm text-red-700 mb-3">
                      Your account will be downgraded to the Free plan. You'll lose access to premium features and be limited to 3 analyses per month.
                    </p>
                    {cancelError && (
                      <p className="text-sm text-red-700 mb-3 font-medium">
                        Error: {cancelError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                        Yes, Cancel Subscription
                      </button>
                      <button
                        onClick={() => {
                          setShowCancelConfirm(false);
                          setCancelError('');
                        }}
                        disabled={isCancelling}
                        className="bg-white hover:bg-gray-50 disabled:bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Keep Subscription
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {cancelSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">
                      Subscription Cancelled
                    </h4>
                    <p className="text-sm text-green-700">
                      Your account has been downgraded to the Free plan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isPaidTier && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Upgrade</h3>
                <button
                  onClick={() => {
                    window.location.href = '/?pricing=true';
                  }}
                  className="w-full bg-black hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 text-yellow-500" />
                  View Premium Plans
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
