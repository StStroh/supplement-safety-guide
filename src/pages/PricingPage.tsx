import React from 'react';
import { Clock, Users, Zap } from 'lucide-react';
import { DynamicPricingGrid } from '../components/pricing/DynamicPricingGrid';

export function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Live Stats Banner */}
        <div className="bg-gradient-to-r from-[#00B8A9] to-[#009688] rounded-2xl p-6 mb-12 text-white">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <div className="text-3xl font-bold">2,847</div>
                <div className="text-sm text-white/80">Active users today</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-8 h-8" />
              <div>
                <div className="text-3xl font-bold">12,394</div>
                <div className="text-sm text-white/80">Checks performed this week</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Clock className="w-8 h-8" />
              <div>
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-sm text-white/80">Average rating (1,293 reviews)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our <strong>free Starter plan</strong> - no credit card required. Upgrade anytime for unlimited access.
          </p>
        </div>

        {/* Dynamic Pricing Grid */}
        <DynamicPricingGrid />

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access to your plan features until the end of your current billing period.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is the Starter plan really free?
              </h3>
              <p className="text-gray-600">
                Yes! Our Starter plan is completely free forever with no credit card required. It includes up to 5 supplement safety checks per month, basic interaction alerts, and access to our public safety index. Sign up instantly and start checking right away.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                What's included in the nutritionist consultation?
              </h3>
              <p className="text-gray-600">
                Expert plan subscribers get access to one-on-one consultations with certified nutritionists who can provide personalized supplement recommendations based on your health goals and current medications.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                What is the Digital Guide?
              </h3>
              <p className="text-gray-600">
                The Supplement Safety Bible Digital Edition is a one-time purchase that gives you lifetime access to doctor-ready interaction notes, printable checklists, and offline-ready PDFs. Perfect for those who want comprehensive reference materials without a subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
