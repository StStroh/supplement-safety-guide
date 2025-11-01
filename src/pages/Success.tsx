import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { getProductByPriceId } from '../stripe-config';

export const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { subscription, loading } = useSubscription();
  const [purchasedProduct, setPurchasedProduct] = useState<string | null>(null);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // If we have subscription data, find the product name
    if (subscription?.price_id) {
      const product = getProductByPriceId(subscription.price_id);
      if (product) {
        setPurchasedProduct(product.name);
      }
    }
  }, [subscription]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Processing your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
          </div>

          {purchasedProduct && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-green-800 mb-1">Plan Activated</h2>
              <p className="text-green-700">{purchasedProduct}</p>
            </div>
          )}

          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Session ID:</span>
                <br />
                <span className="font-mono text-xs break-all">{sessionId}</span>
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            
            <Link
              to="/"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@supplementsafety.com" className="text-blue-600 hover:underline">
                support@supplementsafety.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};