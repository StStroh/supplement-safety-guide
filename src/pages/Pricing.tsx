import React from 'react';
import { stripeProducts, getSubscriptionProducts, getOneTimeProducts } from '../stripe-config';
import { PricingCard } from '../components/PricingCard';
import { useSubscription } from '../hooks/useSubscription';
import { Loader2 } from 'lucide-react';

export const Pricing: React.FC = () => {
  const { subscription, loading } = useSubscription();
  const subscriptionProducts = getSubscriptionProducts();
  const oneTimeProducts = getOneTimeProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get access to comprehensive supplement safety information and protect your health with our evidence-based platform.
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {subscriptionProducts.map((product, index) => (
              <PricingCard
                key={product.id}
                product={product}
                isPopular={index === 1} // Professional Plan
                currentPriceId={subscription?.price_id}
              />
            ))}
          </div>
        </div>

        {/* One-time Products */}
        {oneTimeProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Digital Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {oneTimeProducts.map((product) => (
                <PricingCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Is my payment information secure?</h3>
              <p className="text-gray-600">Absolutely. We use Stripe for payment processing, which is PCI DSS compliant and trusted by millions of businesses worldwide.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">What's included in the free plan?</h3>
              <p className="text-gray-600">The Starter Access plan includes up to 5 supplement safety checks per month, basic interaction alerts, and access to our public safety index.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};