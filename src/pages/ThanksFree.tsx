import React, { useEffect, useState } from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabaseClient'

export function ThanksFree() {
  const [email, setEmail] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [])

  const handleGoToDashboard = async () => {
    setLoggingIn(true)
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Supplement Safety Bible!
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            Your free Starter Access account is ready to use.
          </p>

          {email && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Account email:</span> {email}
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Starter Access Includes:
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span><strong>5 supplement checks</strong> per month</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span><strong>Basic interaction alerts</strong> for common supplement combinations</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span><strong>Public safety index</strong> access</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span><strong>Email support</strong> from our team</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleGoToDashboard}
            loading={loggingIn}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3 mb-4"
          >
            {loggingIn ? 'Loading...' : (
              <>
                Start Checking Supplements <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <p className="text-sm text-gray-600 mb-3">
              Want unlimited checks and advanced features?
            </p>
            <a
              href="/pricing"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View Pro and Premium plans →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
