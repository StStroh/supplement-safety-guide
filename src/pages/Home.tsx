import { useState } from 'react';
import { AlertTriangle, Check, Sparkles, FileText, Clock, Database, BookOpen } from 'lucide-react';
import { PricingCard } from '../components/PricingCard';
import { Link } from 'react-router-dom';
import { getSubscriptionProducts } from '../stripe-config';

export function Home() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const subscriptionProducts = getSubscriptionProducts();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00B8A9] to-[#009688] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg italic">Rx</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">The Supplement Safety Bible</h1>
                <p className="text-xs text-gray-500">Prescription Interaction Intelligence</p>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <section className="relative bg-gradient-to-br from-gray-900 via-[#00B8A9] to-[#009688] text-white overflow-hidden py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C0F000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-8 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>83% of users mix supplements without checking interactions</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Stop Mixing<br />
              <span className="text-[#C0F000]">Blindly</span>
            </h2>

            <p className="text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Check supplement-prescription drug interactions in seconds.<br />
              <span className="text-[#C0F000] font-semibold">Free tier available — no credit card required.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/checker"
                className="bg-white text-[#00B8A9] hover:bg-gray-100 px-10 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Check My Combo
              </Link>
              <a
                href="#database"
                className="bg-[#C0F000] text-gray-900 hover:bg-[#A8D000] px-10 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Browse 200+ Supplements
              </a>
            </div>

            <p className="mt-6 text-sm text-white/70">Join 10,000+ users who trust us with their supplement safety</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border-2 border-red-400 rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Example: Warfarin + Fish Oil</h3>
                <p className="text-lg text-white/90 mb-4">
                  Both Warfarin and Fish Oil have blood-thinning properties. Combined use may increase bleeding risk. Consult your doctor before combining.
                </p>
                <div className="bg-red-500/20 border border-red-400 rounded-lg px-4 py-3">
                  <p className="font-semibold">Increased bleeding risk detected</p>
                </div>
              </div>
            </div>
            <p className="text-center text-white/80 text-sm">
              This is just one example. <span className="font-bold text-[#C0F000]">Check your specific combination now.</span>
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Mix Safely
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From instant checking to detailed reports — The Supplement Safety Bible gives you professional-grade tools to protect your health.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-[#00B8A9]/10 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-[#00B8A9]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Interaction Checker</h3>
              <p className="text-gray-600 mb-4">Get your interaction report in under 3 seconds</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#00B8A9] mt-0.5 flex-shrink-0" />
                  <span>50,000+ interaction patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#00B8A9] mt-0.5 flex-shrink-0" />
                  <span>Actionable advice for every interaction level</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-[#00B8A9]/10 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-[#00B8A9]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Detailed Safety Reports</h3>
              <p className="text-gray-600 mb-4">Comprehensive analysis of every combination</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#00B8A9] mt-0.5 flex-shrink-0" />
                  <span>Every interaction reviewed by licensed pharmacists</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#00B8A9] mt-0.5 flex-shrink-0" />
                  <span>Download and share with your doctor</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#C0F000] to-[#A8D000] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">NEW: AI-Powered Assistant</h3>
              <p className="text-gray-800 mb-4 font-medium">Meet Pippin — Your Personal Safety Expert</p>
              <ul className="space-y-2 text-sm text-gray-900">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gray-900 mt-0.5 flex-shrink-0 font-bold" />
                  <span>Instant, Personalized Answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gray-900 mt-0.5 flex-shrink-0 font-bold" />
                  <span>Reviewed by licensed pharmacists</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="database" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#C0F000] text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <BookOpen className="w-4 h-4" />
              <span>NEW: Complete Supplement Library</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              200+ Evidence-Based Supplement Profiles
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Not just an interaction checker — get complete, doctor-reviewed profiles for every major supplement on the market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-[#00B8A9] to-[#009688] rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">What's in Each Profile:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Evidence Rating</strong> — From A (strong) to F (avoid)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Dosing Guidelines</strong> — Backed by clinical research
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Safety Warnings</strong> — Drug interactions & contraindications
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>What Actually Works</strong> — Real benefits vs. marketing hype
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Profiles:</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900">Creatine</div>
                      <div className="text-sm text-gray-600">Evidence: A (Strong)</div>
                    </div>
                    <div className="text-gray-400 font-bold">→</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900">Vitamin D</div>
                      <div className="text-sm text-gray-600">Evidence: A (Strong)</div>
                    </div>
                    <div className="text-gray-400 font-bold">→</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900">Ashwagandha</div>
                      <div className="text-sm text-gray-600">Evidence: B (Moderate)</div>
                    </div>
                    <div className="text-gray-400 font-bold">→</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900">Turmeric/Curcumin</div>
                      <div className="text-sm text-gray-600">Evidence: B (Moderate)</div>
                    </div>
                    <div className="text-gray-400 font-bold">→</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center text-gray-500 font-bold">
                Coming Soon: Browse all 200+ profiles →
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Pro & Premium members get full access</h3>
            <p className="text-xl text-gray-300 mb-6">
              Search any supplement, read complete profiles, and get personalized recommendations.
            </p>
            <a href="#pricing" className="inline-block bg-[#C0F000] hover:bg-[#A8D000] text-gray-900 px-10 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all">
              See Plans & Pricing
            </a>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Real Stories From Real People
            </h2>
            <p className="text-xl text-gray-600">See how we've helped thousands avoid dangerous interactions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-[#00B8A9] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#00B8A9] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  MC
                </div>
                <div>
                  <div className="font-bold text-gray-900">Maria Chen</div>
                  <div className="text-sm text-gray-500">Verified User</div>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-[#C0F000] text-3xl">★★★★★</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "This caught my dad's dangerous interaction before his surgery. He was taking ginkgo with his blood thinner. The checker flagged it immediately. His doctor confirmed this could have caused serious bleeding complications."
              </p>
              <div className="inline-block bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                Prevented Major Complication
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-[#00B8A9] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#00B8A9] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  JR
                </div>
                <div>
                  <div className="font-bold text-gray-900">James Rodriguez</div>
                  <div className="text-sm text-gray-500">Professional Plan</div>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-[#C0F000] text-3xl">★★★★★</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "I've been a personal trainer for 15 years. This database has become essential for advising my clients. The interaction checker saved one client from a St. John's wort + SSRI combination that would've been dangerous."
              </p>
              <div className="inline-block bg-[#00B8A9]/10 text-[#00B8A9] px-3 py-1 rounded-full text-xs font-bold">
                Professional User
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-[#00B8A9] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#00B8A9] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  SK
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sarah Kim, RN</div>
                  <div className="text-sm text-gray-500">Premium Plan</div>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-[#C0F000] text-3xl">★★★★★</span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                "As a nurse practitioner, I use this daily in my clinic. The PDF reports are professional enough to share with physicians, and the interaction database is more comprehensive than what we have in our EMR system."
              </p>
              <div className="inline-block bg-[#00B8A9]/10 text-[#00B8A9] px-3 py-1 rounded-full text-xs font-bold">
                Healthcare Professional
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
              <Clock className="w-4 h-4" />
              <span>Founding Member Pricing — Lock in 40% off for life</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              From casual users to professionals — find the plan that fits your health goals.
            </h2>
            <p className="text-lg text-gray-600">
              Early adopter pricing ends when we hit 1,000 members. <span className="font-bold text-red-500">847 spots remaining.</span>
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual <span className="text-[#00B8A9] text-sm ml-1">(Save 25%)</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {subscriptionProducts.map((product, index) => (
              <PricingCard
                key={product.id}
                product={product}
                isPopular={product.name === 'Professional Plan'}
              />
            ))}
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            Not medical advice • Always consult your doctor
          </p>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C0F000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-[#C0F000] text-gray-900 px-6 py-3 rounded-full font-bold text-lg mb-6">
              <span className="text-gray-900 font-bold text-xl italic">Rx</span>
              <span>Powered by Certified Nutra Labs</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Backed by Science.
              <span className="block text-[#C0F000]">Trusted by Thousands.</span>
            </h2>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're not just another supplement blog. The Supplement Safety Bible is built on peer-reviewed research, verified by medical professionals, and updated continuously with the latest clinical findings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-[#00B8A9] rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Doctor-Reviewed</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Every interaction in our database is reviewed and validated by a team of licensed pharmacists, nutritionists, and physicians.
              </p>
              <div className="flex items-center gap-2 text-[#C0F000] font-semibold text-sm">
                <Check className="w-5 h-5" />
                <span>Verified by 12+ medical professionals</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-[#00B8A9] rounded-full flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Updated Weekly</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                New research emerges constantly. Our database is refreshed every week with the latest clinical studies and FDA safety alerts.
              </p>
              <div className="flex items-center gap-2 text-[#C0F000] font-semibold text-sm">
                <Clock className="w-5 h-5" />
                <span>Last update: 3 days ago</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-[#00B8A9] rounded-full flex items-center justify-center mb-6">
                <span className="text-white font-bold text-2xl italic">Rx</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Certified Research Partner</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Powered by Certified Nutra Labs, a recognized authority in supplement testing and safety analysis since 2018.
              </p>
              <div className="flex items-center gap-2 text-[#C0F000] font-semibold text-sm">
                <Database className="w-5 h-5" />
                <span>50,000+ interactions mapped</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#00B8A9] to-[#009688] rounded-2xl p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">50K+</div>
                <div className="text-sm text-white/80">Interactions Analyzed</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">200+</div>
                <div className="text-sm text-white/80">Supplements Tracked</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">1M+</div>
                <div className="text-sm text-white/80">Safety Checks Run</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">12+</div>
                <div className="text-sm text-white/80">Medical Reviewers</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-lg text-gray-300 mb-6">Join thousands who've stopped guessing and started knowing.</p>
            <Link
              to="/checker"
              className="inline-block bg-[#C0F000] hover:bg-[#A8D000] text-gray-900 px-10 py-4 text-lg font-bold rounded-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Start Your Safety Check
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00B8A9] to-[#009688] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm italic">Rx</span>
            </div>
            <span className="text-lg font-bold">The Supplement Safety Bible</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            support@supplementsafetybible.com
          </p>
          <p className="text-gray-500 text-xs">
            © 2025 The Supplement Safety Bible. All rights reserved. • Secure payments via Stripe
          </p>
        </div>
      </footer>
    </div>
  );
}