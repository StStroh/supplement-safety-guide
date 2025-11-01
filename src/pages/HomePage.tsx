import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Users, BookOpen, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Complete Guide to
              <span className="text-blue-600 block">Supplement Safety</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover safe supplement combinations, avoid dangerous interactions with prescription medications, 
              and make informed decisions about your health with our comprehensive safety database.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="px-8 py-3">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/checker">
                    <Button size="lg" className="px-8 py-3 bg-gradient-to-r from-[#00B8A9] to-[#009688] hover:from-[#009688] hover:to-[#00B8A9]">
                      Try Free Now - No Signup
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="outline" size="lg" className="px-8 py-3">
                      View Pricing
                    </Button>
                  </Link>
                </>
              )}
            </div>
            {!user && (
              <p className="text-sm text-gray-500 mt-4">
                3 free checks, no credit card required
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Supplement Safety Bible?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides evidence-based information to help you make safe and informed supplement choices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Safety First
              </h3>
              <p className="text-gray-600">
                Comprehensive database of supplement interactions with prescription medications and other supplements.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Expert Guidance
              </h3>
              <p className="text-gray-600">
                Access to nutritionist consultations and personalized health insights based on your profile.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Comprehensive Resources
              </h3>
              <p className="text-gray-600">
                Digital handbook with detailed information about safe supplement combinations and usage guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Make Informed Supplement Decisions
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Avoid Dangerous Interactions</h3>
                    <p className="text-gray-600">Check for potential interactions between supplements and prescription medications.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Personalized Recommendations</h3>
                    <p className="text-gray-600">Get tailored supplement suggestions based on your health profile and goals.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Evidence-Based Information</h3>
                    <p className="text-gray-600">Access peer-reviewed research and clinical studies supporting our recommendations.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Export Reports</h3>
                    <p className="text-gray-600">Generate PDF reports to share with your healthcare provider.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Start Your Free Trial
                </h3>
                <p className="text-gray-600 mb-6">
                  Try our Starter plan for free and perform up to 5 supplement safety checks each month.
                </p>
                {user ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/signup">
                    <Button size="lg" className="w-full">
                      Sign Up Free
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}