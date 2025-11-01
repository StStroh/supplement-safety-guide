import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { StripeProduct } from '../stripe-config';
import { createCheckoutSession, stripePromise } from '../lib/stripe';
import { useAuth } from '../hooks/useAuth';

interface PricingCardProps {
  product: StripeProduct;
  isPopular?: boolean;
  currentPriceId?: string | null;
}

export const PricingCard: React.FC<PricingCardProps> = ({ 
  product, 
  isPopular = false,
  currentPriceId 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isCurrentPlan = currentPriceId === product.priceId;

  const handleCheckout = async () => {
    console.log('=== CHECKOUT STARTED ===');
    console.log('User:', user ? `Logged in as ${user.email}` : 'Not logged in');
    console.log('Product:', product.name);
    console.log('Price ID:', product.priceId);
    console.log('Mode:', product.mode);

    if (isCurrentPlan) {
      console.log('Already on this plan');
      return;
    }

    setLoading(true);
    try {
      let email = user?.email;

      if (!user) {
        email = prompt('Enter your email to continue:');
        if (!email || !email.includes('@')) {
          alert('Valid email is required');
          setLoading(false);
          return;
        
      }

      console.log('Calling checkout with email:', email);

   if (product.price === 0 || product.name.toLowerCase().includes('starter')) {
  // Free plan → go to the Starter page instead of login
  window.location.href = '/starter';
  return;
}
      } else {
        console.log('Paid plan detected - using Stripe checkout');

        const response = await fetch('/.netlify/functions/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: product.priceId,
            email: email,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { url } = await response.json();
        console.log('Checkout URL received:', url);

        if (url) {
          window.location.href = url;
        } else {
          throw new Error('No checkout URL received');
        }
      }
    } catch (error: any) {
      console.error('=== CHECKOUT ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      alert(`Checkout failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const getPriceDisplay = () => {
    const basePrice = formatPrice(product.price);
    if (product.mode === 'subscription' && product.price > 0) {
      return `${basePrice}/month`;
    }
    return basePrice;
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (isCurrentPlan) return 'Current Plan';
    if (product.price === 0) return 'Get Started Free';
    if (product.mode === 'payment') return 'Buy Now';
    return 'Subscribe';
  };

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
      isPopular ? 'border-blue-500 scale-105' : 'border-gray-200'
    } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Active
          </span>
        </div>
      )}

      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">{getPriceDisplay()}</span>
        </div>
        
        <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

        <button
          onClick={handleCheckout}
          disabled={loading || isCurrentPlan}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
            isCurrentPlan
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : isPopular
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isCurrentPlan && <Check className="w-4 h-4 mr-2" />}
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};