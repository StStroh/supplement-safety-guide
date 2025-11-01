import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Download, CreditCard, TrendingUp, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/Button';

interface ProfileData {
  email: string;
  sub_status: string;
  plan: string;
  current_period_end: string | null;
  checks_remaining: number;
  stripe_customer_id?: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
        return;
      }

      await fetchProfile(session.access_token);
    } catch (err) {
      console.error('Auth check failed:', err);
      navigate('/login');
    }
  };

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('/.netlify/functions/get-profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const response = await fetch('/.netlify/functions/generate-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryText: 'Thank you for using Supplement Safety Bible. This report contains important safety guidelines for supplement use.'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'supplement-safety-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const response = await fetch('/.netlify/functions/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (err) {
      console.error('Error opening billing portal:', err);
      alert('Failed to open billing portal. Please try again.');
      setManagingBilling(false);
    }
  };

  const handleUpgrade = async (priceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          email: profile?.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (err) {
      console.error('Error creating checkout:', err);
      alert('Failed to start upgrade process. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load profile data'}</p>
          <Button onClick={() => navigate('/login')}>Return to Login</Button>
        </div>
      </div>
    );
  }

  const isActive = profile.sub_status === 'active';
  const isPro = profile.plan === 'professional' || profile.plan === 'pro';
  const isPremium = profile.plan === 'premium' || profile.plan === 'enterprise';
  const isStarter = profile.plan === 'starter';
  const checksUnlimited = isPro || isPremium;
  const needsUpgrade = isStarter && profile.checks_remaining === 0;

  const planDisplay = profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1);
  const statusColor = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const statusText = profile.sub_status.charAt(0).toUpperCase() + profile.sub_status.slice(1);

  const renewalDate = profile.current_period_end
    ? new Date(profile.current_period_end).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Free Plan Upgrade Banner */}
        {isStarter && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1">You're on the Free plan (5 checks/month)</h3>
                <p className="text-blue-50">Upgrade to Pro for unlimited checks and PDF export.</p>
              </div>
              <Button
                onClick={() => handleUpgrade(import.meta.env.VITE_PRICE_ID_PRO_MONTHLY || import.meta.env.VITE_PRICE_ID_PRO)}
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Welcome/Plan Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome Back</h2>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                {statusText}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="text-xl font-bold text-gray-900">{planDisplay}</p>
              </div>

              {profile.current_period_end && (
                <div>
                  <p className="text-sm text-gray-500">Renews On</p>
                  <p className="text-sm font-medium text-gray-900">{renewalDate}</p>
                </div>
              )}

              {!isActive && (
                <Button
                  onClick={handleManageBilling}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700"
                >
                  Fix Payment Issue
                </Button>
              )}
            </div>
          </div>

          {/* Checks Counter */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Interaction Checks</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Checks Remaining This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  {checksUnlimited ? 'Unlimited' : profile.checks_remaining}
                </p>
              </div>

              {needsUpgrade && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    You've used all your checks for this month
                  </p>
                  <p className="text-xs text-yellow-700">
                    Upgrade to Professional for unlimited checks
                  </p>
                </div>
              )}

              {!checksUnlimited && !needsUpgrade && (
                <p className="text-xs text-gray-500">
                  Resets on {renewalDate}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Open Interaction Checker
              </Button>

              <Button
                onClick={handleDownloadPdf}
                loading={downloadingPdf}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Safety Report (PDF)
              </Button>
            </div>
          </div>

          {/* Manage Subscription */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Subscription</h2>

            <div className="space-y-3">
              {(isPro || isPremium) && (
                <Button
                  onClick={handleManageBilling}
                  loading={managingBilling}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Manage Billing
                </Button>
              )}

              {isStarter && (
                <>
                  <Button
                    onClick={() => handleUpgrade(import.meta.env.VITE_PRICE_ID_PRO_MONTHLY)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Upgrade to Professional ($9.99/mo)
                  </Button>

                  <Button
                    onClick={() => handleUpgrade(import.meta.env.VITE_PRICE_ID_PREMIUM_MONTHLY)}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Go Premium ($49.99/mo)
                  </Button>
                </>
              )}

              {isPro && (
                <Button
                  onClick={() => handleUpgrade(import.meta.env.VITE_PRICE_ID_PREMIUM_MONTHLY)}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Upgrade to Premium ($49.99/mo)
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
