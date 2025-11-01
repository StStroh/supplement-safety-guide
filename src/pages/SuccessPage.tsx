import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { supabase } from '../lib/supabaseClient';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handlePostPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log('✅ Already logged in, redirecting to dashboard');
          setTimeout(() => navigate('/dashboard'), 2000);
          setLoading(false);
          return;
        }

        console.log('🔐 No session, attempting auto-login with Stripe session');

        const response = await fetch('/.netlify/functions/exchange-stripe-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to authenticate');
        }

        const data = await response.json();
        setEmail(data.email);

        if (data.action_link) {
          console.log('✅ Got magic link, signing in...');

          const url = new URL(data.action_link);
          const token = url.searchParams.get('token');
          const type = url.searchParams.get('type');

          if (token && type) {
            const { error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'magiclink',
            });

            if (verifyError) {
              console.error('❌ Auto-login failed:', verifyError);
              setError('Account created! Please check your email to sign in.');
              setLoading(false);
            } else {
              console.log('✅ Auto-login successful');
              setTimeout(() => navigate('/dashboard'), 1000);
            }
          } else {
            setError('Account created! Please check your email to sign in.');
            setLoading(false);
          }
        } else {
          setError('Payment received! Please check your email for login instructions.');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('❌ Post-payment error:', err);
        setError(err.message || 'Payment successful, but auto-login failed. Please check your email.');
        setLoading(false);
      }
    };

    handlePostPayment();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment and setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>

          {email && (
            <p className="text-gray-600 mb-4">
              Welcome! Your account has been created for <strong>{email}</strong>
            </p>
          )}

          <p className="text-gray-600 mb-8">
            {error || 'Your payment has been processed and your account is ready. Redirecting to dashboard...'}
          </p>

          {error && (
            <Alert type="info" className="mb-6">
              <div className="text-sm">
                {error}
              </div>
            </Alert>
          )}

          <div className="space-y-4">
            <Button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
              Sign In
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@supplementsafetybible.com" className="text-blue-600 hover:text-blue-500">
                support@supplementsafetybible.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
