import React, { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabaseClient'

export function ThanksPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [hasPassword, setHasPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loggingIn, setLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordCopied, setPasswordCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('session_id')
    setSessionId(sid)

    if (sid === 'starter') {
      handleStarterFlow()
    } else if (sid) {
      fetchSessionEmail(sid)
    } else {
      setLoading(false)
      setError('No session ID found')
    }
  }, [])

  const handleStarterFlow = async () => {
    const starterEmail = localStorage.getItem('starter_email')
    const starterPassword = localStorage.getItem('starter_temp_password')

    if (!starterEmail || !starterPassword) {
      setError('Starter signup data not found. Please try again.')
      setLoading(false)
      return
    }

    setEmail(starterEmail)
    setTempPassword(starterPassword)
    setHasPassword(true)
    setLoading(false)

    setLoggingIn(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: starterEmail,
        password: starterPassword,
      })

      if (signInError) {
        console.error('Auto-login error:', signInError)
        setError('Auto-login failed. Please use the login button.')
        setLoggingIn(false)
        return
      }

      await supabase
        .from('profiles')
        .update({
          temp_password: null,
          temp_password_created_at: null
        })
        .eq('user_email', starterEmail)

      localStorage.removeItem('starter_email')
      localStorage.removeItem('starter_temp_password')

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 500)
    } catch (err) {
      console.error('Starter auto-login error:', err)
      setError('Failed to log in automatically. Please try the login button.')
      setLoggingIn(false)
    }
  }

  const fetchSessionEmail = async (sid: string) => {
    try {
      const response = await fetch(`/.netlify/functions/fetch-session-email?session_id=${sid}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.email) {
        setEmail(data.email) // Keep full email for login
        setTempPassword(data.tempPassword)
        setHasPassword(data.hasPassword)
      }
    } catch (err) {
      console.error('Error fetching session email:', err)
      setError('Failed to load session information')
    } finally {
      setLoading(false)
    }
  }

  const handleAutoLogin = async () => {
    if (!email || !tempPassword) return

    setLoggingIn(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: tempPassword,
      })

      if (error) {
        setError('Login failed: ' + error.message)
      } else {
        // Clear the temp password from database after successful login
        await supabase
          .from('profiles')
          .update({ temp_password: null })
          .eq('user_email', email)

        // Redirect to dashboard
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('Error during auto-login:', err)
      setError('Failed to log in automatically')
    } finally {
      setLoggingIn(false)
    }
  }

  const copyPassword = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword)
      setPasswordCopied(true)
      setTimeout(() => setPasswordCopied(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Supplement Safety Bible!
          </h1>

          <p className="text-gray-600 mb-6">
            Your subscription is active. Here are your login credentials:
          </p>

          {email && tempPassword && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-6 text-left">
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                <div className="bg-white px-3 py-2 rounded border border-gray-300 font-mono text-sm break-all">
                  {email}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Temporary Password</label>
                <div className="flex gap-2">
                  <div className="bg-white px-3 py-2 rounded border border-gray-300 font-mono text-sm flex-1 break-all">
                    {tempPassword}
                  </div>
                  <button
                    onClick={copyPassword}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap"
                  >
                    {passwordCopied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                💡 Save these credentials securely. You can change your password after logging in.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {passwordCopied && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                Password copied to clipboard!
              </p>
            </div>
          )}

          <div className="space-y-3">
            {tempPassword && (
              <Button
                onClick={handleAutoLogin}
                loading={loggingIn}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loggingIn ? 'Logging you in...' : 'Access Your Content Now →'}
              </Button>
            )}

            <Button
              onClick={() => window.location.href = '/login'}
              variant="outline"
              className="w-full"
            >
              Go to Login Page
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            You can use these credentials on any device to access your account.
          </p>
        </div>
      </div>
    </div>
  )
}
