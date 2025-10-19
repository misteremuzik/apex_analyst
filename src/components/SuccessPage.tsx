import { CheckCircle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function SuccessPage() {
  const { premiumUser, refreshPremiumUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refreshPremiumUser();
      setLoading(false);
    };

    checkSubscription();
  }, [refreshPremiumUser]);

  const handleContinue = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to Premium!
          </h1>

          {loading ? (
            <div className="mb-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-gray-600">
                Setting up your premium account...
              </p>
            </div>
          ) : (
            <>
              <p className="text-xl text-gray-600 mb-8">
                Your subscription to{' '}
                <span className="font-semibold text-emerald-600 capitalize">
                  {premiumUser?.subscription_tier || 'Premium'}
                </span>{' '}
                is now active!
              </p>

              <div className="bg-emerald-50 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  What's next?
                </h2>
                <ul className="text-left space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Access all premium features immediately</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Analyze unlimited websites with advanced metrics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Get AI-powered insights and recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Priority support from our team</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          <button
            onClick={handleContinue}
            disabled={loading}
            className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Analyzing
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>

          <p className="mt-6 text-sm text-gray-500">
            A confirmation email has been sent to your inbox
          </p>
        </div>
      </div>
    </div>
  );
}
