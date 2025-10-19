import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export function CancelPage() {
  const handleRetry = () => {
    window.location.href = '/?pricing=true';
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-gray-600" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Checkout Cancelled
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Your payment was not processed. No charges were made to your account.
          </p>

          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Need help choosing a plan?
            </h2>
            <p className="text-gray-700 mb-4">
              Our team is here to help you find the perfect plan for your needs.
            </p>
            <a
              href="mailto:support@apex-analyst.com"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Contact Support
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              <RefreshCw className="mr-2 w-5 h-5" />
              Try Again
            </button>

            <button
              onClick={handleGoHome}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold border-2 border-gray-200"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Go Home
            </button>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            You can upgrade to premium anytime from your account settings
          </p>
        </div>
      </div>
    </div>
  );
}
