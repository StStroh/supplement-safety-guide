import React, { useState, useEffect } from 'react';
import { Check, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/Button';
import pricingConfig from '../../config/pricing.json';

type BillingInterval = 'monthly' | 'yearly';

interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  cta_text: string | { monthly: string; yearly: string };
  features: string[];
  highlight: boolean;
}

export function DynamicPricingGrid() {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(() => {
    const saved = localStorage.getItem('billing_interval');
    return saved === 'yearly' ? 'yearly' : 'monthly';
  });
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [showStarterEmailModal, setShowStarterEmailModal] = useState(false);
  const [starterEmail, setStarterEmail] = useState('');

  useEffect(() => {
    localStorage.setItem('billing_interval', billingInterval);
  }, [billingInterval]);

  const handleStarterSignup = async () => {
    if (!starterEmail || !starterEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setLoadingPlanId('starter');

    try {
      const response = await fetch('/.netlify/functions/grant-starter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: starterEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.missing) {
          alert(`Configuration error: Missing ${data.missing.join(', ')}`);
        } else {
          alert(data.error || 'Failed to create starter account');
        }
        setLoadingPlanId(null);
        return;
      }

      console.log('✅ Starter granted:', data);
      setShowStarterEmailModal(false);
      navigate(`/thanks-free?email=${encodeURIComponent(starterEmail)}`);
    } catch (error) {
      console.error('❌ Starter signup error:', error);
      alert('Failed to create account. Please try again.');
      setLoadingPlanId(null);
    }
  };

  const handlePlanSelect = async (plan: Plan) => {
    if (plan.id === 'starter') {
      setShowStarterEmailModal(true);
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      const planName = `${plan.id}_${billingInterval === 'yearly' ? 'annual' : 'monthly'}`;

      console.log('🚀 Initiating checkout for plan:', planName);

      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName }),
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        if (data.missing) {
          alert(`Configuration error: Missing ${data.missing.join(', ')}`);
        } else {
          alert(data.error || 'Failed to create checkout session');
        }
        setLoadingPlanId(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoadingPlanId(null);
    }
  };

  const mapPriceId = (configPriceId: string): string => {
    const mapping: Record<string, string> = {
      'price_PRO_MONTHLY_LIVE': import.meta.env.VITE_PRICE_ID_PRO_MONTHLY || import.meta.env.VITE_PRICE_ID_PRO || '',
      'price_PRO_YEARLY_LIVE': import.meta.env.VITE_PRICE_ID_PRO_ANNUAL || '',
      'price_PREMIUM_MONTHLY_LIVE': import.meta.env.VITE_PRICE_ID_PREMIUM_MONTHLY || import.meta.env.VITE_PRICE_ID_PREMIUM || '',
      'price_PREMIUM_YEARLY_LIVE': import.meta.env.VITE_PRICE_ID_PREMIUM_ANNUAL || '',
      'price_GUIDE_ONETIME_LIVE': import.meta.env.VITE_PRICE_ID_GUIDE || 'price_guide_placeholder'
    };

    return mapping[configPriceId] || configPriceId;
  };

  const getPrice = (plan: Plan): number => {
    return billingInterval === 'yearly' ? plan.yearly_price : plan.monthly_price;
  };

  const getCtaText = (plan: Plan): string => {
    if (typeof plan.cta_text === 'string') {
      return plan.cta_text;
    }
    return billingInterval === 'yearly' ? plan.cta_text.yearly : plan.cta_text.monthly;
  };

  const getPriceDisplay = (plan: Plan): string => {
    const price = getPrice(plan);

    if (price === 0) {
      return 'Free';
    }

    if (plan.id === 'guide') {
      return `$${price.toFixed(2)}`;
    }

    if (billingInterval === 'yearly') {
      return `$${price.toFixed(2)}/year`;
    }

    return `$${price.toFixed(2)}/mo`;
  };

  const getRibbonText = (plan: Plan): string | null => {
    if (plan.id === 'starter') {
      return pricingConfig.ui_labels.free_ribbon;
    }
    if (plan.tagline === 'Most Popular') {
      return pricingConfig.ui_labels.most_popular;
    }
    if (plan.tagline === 'Best Value') {
      return pricingConfig.ui_labels.best_value;
    }
    if (plan.tagline === 'One-time purchase') {
      return plan.tagline;
    }
    return null;
  };

  const getRibbonColor = (plan: Plan): string => {
    if (plan.id === 'starter') return 'bg-teal-500';
    if (plan.tagline === 'Most Popular') return 'bg-blue-500';
    if (plan.tagline === 'Best Value') return 'bg-green-500';
    return 'bg-gray-700';
  };

  return (
    <div className="w-full">
      {/* Toggle */}
      <div className="flex items-center justify-center mb-12">
        <div className="bg-white rounded-full p-1 shadow-sm border border-gray-200 inline-flex">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              billingInterval === 'monthly'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            {pricingConfig.toggle_labels.monthly}
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              billingInterval === 'yearly'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            {pricingConfig.toggle_labels.yearly}
          </button>
        </div>
        {billingInterval === 'yearly' && (
          <span className="ml-3 text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            💰 Save 20%
          </span>
        )}
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {pricingConfig.plans.map((plan: Plan) => {
          const ribbonText = getRibbonText(plan);
          const ribbonColor = getRibbonColor(plan);

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border ${
                plan.highlight
                  ? 'border-blue-500 shadow-2xl scale-105 z-10'
                  : 'border-gray-200 shadow-lg'
              } bg-white p-6 flex flex-col transition-all duration-500 animate-fadeIn ${
                plan.id === 'starter' ? 'bg-gradient-to-br from-teal-50 to-white' : ''
              }`}
            >
              {ribbonText && (
                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${ribbonColor} text-white px-4 py-1 rounded-full text-xs font-bold shadow-md`}>
                  {ribbonText}
                </div>
              )}

              {plan.id === 'starter' && (
                <div className="absolute top-4 right-4">
                  <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold border border-teal-300">
                    No credit card
                  </span>
                </div>
              )}

              <div className="text-center mb-6 mt-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {getPriceDisplay(plan)}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanSelect(plan)}
                loading={loadingPlanId === plan.id}
                variant={plan.highlight ? 'primary' : 'outline'}
                className="w-full"
              >
                {getCtaText(plan)}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Guarantee Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span className="font-medium">{pricingConfig.ui_labels.guarantee}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="font-medium">{pricingConfig.ui_labels.secure_checkout}</span>
        </div>
      </div>

      {/* Starter Email Modal */}
      {showStarterEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Start Your Free Account
            </h2>
            <p className="text-gray-600 mb-6">
              Enter your email to get instant access to the Starter plan. No credit card required.
            </p>
            <input
              type="email"
              value={starterEmail}
              onChange={(e) => setStarterEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyDown={(e) => e.key === 'Enter' && handleStarterSignup()}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => setShowStarterEmailModal(false)}
                variant="outline"
                className="flex-1"
                disabled={loadingPlanId === 'starter'}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStarterSignup}
                loading={loadingPlanId === 'starter'}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Start Free
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
