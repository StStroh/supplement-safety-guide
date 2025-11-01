import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../../lib/supabaseClient'

interface LivePrice {
  priceId: string
  productName: string
  amount: number
  currency: string
  interval: string
}

interface PricingCardProps {
  price: LivePrice
  featured?: boolean
  billingInterval: string
}

export function PricingCard({ price, featured = false, billingInterval }: PricingCardProps) {
  const { user } = useAuth()
  const { subscription, getCurrentPlan } = useSubscription()
  const [loading, setLoading] = useState(false)

  const guestSessionToken = typeof window !== 'undefined' ? localStorage.getItem('guest_session_token') : null

  const currentPlan = getCurrentPlan()
  const isCurrentPlan = currentPlan?.priceId === price.priceId

  const handleCheckout = async () => {
    console.info('Event: checkout_started', { priceId: price.priceId, plan_type: billingInterval })
    setLoading(true)

    try {
      const isStarterPlan = price.amount === 0 ||
                           price.productName.toLowerCase().includes('starter') ||
                           price.priceId === 'free_starter_plan';

      if (isStarterPlan) {
        console.info('Starter plan detected - using grant-starter flow');

        let email = user?.email;
        if (!email) {
          email = prompt('Enter your email to get started:');
          if (!email || !email.includes('@')) {
            alert('Valid email is required');
            setLoading(false);
            return;
          }
        }

        const response = await fetch('/.netlify/functions/grant-starter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Starter signup successful:', data);

        if (data.ok) {
          localStorage.setItem('starter_email', data.email);
          localStorage.setItem('starter_temp_password', data.tempPassword);
          window.location.href = '/thanks?session_id=starter';
        } else {
          throw new Error('Failed to create starter account');
        }
        return;
      }

      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: price.priceId,
          guestSessionToken: guestSessionToken,
        }),
      })

      const data = await response.json()

      if (data.error) {
        console.error('Checkout error:', data.error)
        alert(`Checkout failed: ${data.error}`)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (isCurrentPlan) {
      return 'Current Plan'
    }
    const isStarterPlan = price.amount === 0 ||
                         price.productName.toLowerCase().includes('starter') ||
                         price.priceId === 'free_starter_plan';
    if (isStarterPlan) {
      return 'Get Started Free'
    }
    return 'Subscribe Now'
  }

  const isStarterPlan = price.amount === 0 ||
                       price.productName.toLowerCase().includes('starter') ||
                       price.priceId === 'free_starter_plan';

  const features = getFeatures(price.productName)

  return (
    <div className={`relative rounded-2xl border ${
      featured
        ? 'border-blue-500 shadow-2xl scale-105'
        : 'border-gray-200 shadow-lg'
    } bg-white p-8`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      {isStarterPlan && (
        <div className="absolute top-4 left-4">
          <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold border border-teal-300">
            No credit card required
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {price.productName}
        </h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900">
            ${price.amount.toFixed(2)}
          </span>
          {price.interval !== 'one_time' && (
            <span className="text-gray-500 ml-1">/{price.interval}</span>
          )}
        </div>
        <p className="text-gray-600 mb-6">
          {getDescription(price.productName)}
        </p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={handleCheckout}
        loading={loading}
        disabled={isCurrentPlan}
        variant={featured ? 'primary' : 'outline'}
        className="w-full mb-3"
      >
        {getButtonText()}
      </Button>

      <p className="text-xs text-center text-gray-500">
        30-day money-back guarantee. Cancel anytime.
      </p>
    </div>
  )
}

function getDescription(planName: string): string {
  if (planName.toLowerCase().includes('starter')) {
    return 'Try the Supplement Safety Bible for free. Perform up to 5 supplement safety checks each month, see basic interaction alerts, and access our public safety index.'
  } else if (planName.toLowerCase().includes('professional') || planName.toLowerCase().includes('pro')) {
    return 'Unlimited supplement safety checks, personalized health insights, and PDF export reports.'
  } else if (planName.toLowerCase().includes('premium') || planName.toLowerCase().includes('expert')) {
    return 'Premium access with AI-powered supplement insights, family plan, and nutritionist consultation.'
  }
  return 'Advanced supplement safety and interaction checking.'
}

function getFeatures(planName: string): string[] {
  if (planName.toLowerCase().includes('starter')) {
    return [
      'Up to 5 supplement checks per month',
      'Basic interaction alerts',
      'Access to public safety index',
      'Email support'
    ]
  } else if (planName.toLowerCase().includes('professional') || planName.toLowerCase().includes('pro')) {
    return [
      'Unlimited supplement safety checks',
      'Personalized health insights',
      'PDF export reports',
      'Priority email support',
      'Advanced interaction database'
    ]
  } else if (planName.toLowerCase().includes('premium') || planName.toLowerCase().includes('expert')) {
    return [
      'Everything in Professional',
      'AI-powered supplement insights',
      'Family plan (up to 4 members)',
      'Nutritionist consultation',
      'Phone support',
      'Custom health recommendations'
    ]
  }
  return [
    'Advanced supplement safety features',
    'Comprehensive interaction checking',
    'Expert support'
  ]
}