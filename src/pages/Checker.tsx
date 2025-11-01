import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Check, Info, ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { searchInteractions, getRiskColor, getRiskBadgeColor, type SupplementInteraction } from '../lib/interactions';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePlan } from '../hooks/usePlan';
import { useGuestSession } from '../hooks/useGuestSession';
import { supabase } from '../lib/supabaseClient';
import { UsageThresholdModal } from '../components/UsageThresholdModal';

export function Checker() {
  const { user } = useAuth();
  const { plan, isPro } = usePlan();
  const guestSession = useGuestSession();
  const navigate = useNavigate();
  const [rx, setRx] = useState('');
  const [supplement, setSupplement] = useState('');
  const [results, setResults] = useState<SupplementInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(5);
  const [showThresholdModal, setShowThresholdModal] = useState(false);

  useEffect(() => {
    const checkUsage = async () => {
      if (!user || isPro) return;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('supplement_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      setSearchCount(count || 0);
    };

    checkUsage();
  }, [user, isPro]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rx.trim() && !supplement.trim()) return;

    if (!user && !guestSession.hasChecksRemaining) {
      return;
    }

    if (!isPro && user && searchCount >= usageLimit) {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const interactions = await searchInteractions(rx, supplement);
      setResults(interactions);

      if (!user && !isPro) {
        await guestSession.incrementCheckCount();
      } else if (user && !isPro) {
        const newCount = searchCount + 1;
        setSearchCount(newCount);

        // Show modal at 4th+ check if not shown in last 24h
        if (newCount >= 4) {
          const lastShown = localStorage.getItem(`threshold_modal_${user.id}`);
          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;

          if (!lastShown || (now - parseInt(lastShown)) > twentyFourHours) {
            setShowThresholdModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const priceId = import.meta.env.VITE_PRICE_ID_PRO_MONTHLY || import.meta.env.VITE_PRICE_ID_PRO;
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

  const handleDismissModal = () => {
    if (user) {
      localStorage.setItem(`threshold_modal_${user.id}`, Date.now().toString());
    }
    setShowThresholdModal(false);
  };

  const remainingChecks = isPro ? Infinity : user ? Math.max(0, usageLimit - searchCount) : guestSession.remainingChecks;
  const isAtLimit = !isPro && ((user && searchCount >= usageLimit) || (!user && guestSession.isAtLimit));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00B8A9] to-[#009688] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg italic">Rx</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">The Supplement Safety Bible</h1>
                <p className="text-xs text-gray-500">Prescription Interaction Intelligence</p>
              </div>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Interaction Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter a prescription medication or supplement to check for known interactions
          </p>
        </div>

        {!isPro && !guestSession.loading && (
          <div className="bg-gradient-to-r from-[#00B8A9] to-[#009688] rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold mb-1">{user ? 'FREE TIER' : 'FREE TRIAL'}</div>
                <div className="text-2xl font-bold">
                  {remainingChecks} / {user ? usageLimit : guestSession.freeChecksLimit} checks remaining {user ? 'this month' : ''}
                </div>
                {!user && (
                  <p className="text-sm text-white/80 mt-2">
                    No signup required! Try {guestSession.freeChecksLimit} checks instantly.
                  </p>
                )}
              </div>
              <Link
                to="/pricing"
                className="bg-white text-[#00B8A9] hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade to Pro
              </Link>
            </div>
          </div>
        )}

        {isAtLimit ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {user ? `You've used all ${usageLimit} free checks this month` : `You've used all ${guestSession.freeChecksLimit} free trial checks`}
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              {user ? `Your free tier includes ${usageLimit} safety checks per month. You've checked all of them.` : 'Unlock unlimited checks with Pro!'}
            </p>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 mb-2">What you're missing:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-yellow-600">•</span>
                      <span>47 additional interaction details not shown in free results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-yellow-600">•</span>
                      <span>AI-powered personalized recommendations from Pippin</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-yellow-600">•</span>
                      <span>Downloadable PDF reports to share with your doctor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-yellow-600">•</span>
                      <span>Access to 200+ evidence-based supplement profiles</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <Link
              to="/pricing"
              className="inline-block bg-gradient-to-r from-[#00B8A9] to-[#009688] hover:from-[#009688] hover:to-[#00B8A9] text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Upgrade to Pro for Unlimited Checks
            </Link>
            <p className="mt-4 text-sm text-gray-500">Resets on the 1st of next month</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="rx" className="block text-sm font-semibold text-gray-700 mb-2">
                Prescription Medication
              </label>
              <input
                type="text"
                id="rx"
                value={rx}
                onChange={(e) => setRx(e.target.value)}
                placeholder="e.g., Warfarin, Lisinopril, Metformin"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#00B8A9] focus:outline-none transition-colors text-gray-900"
              />
            </div>

            <div className="text-center text-gray-500 font-medium">OR</div>

            <div>
              <label htmlFor="supplement" className="block text-sm font-semibold text-gray-700 mb-2">
                Supplement
              </label>
              <input
                type="text"
                id="supplement"
                value={supplement}
                onChange={(e) => setSupplement(e.target.value)}
                placeholder="e.g., Fish Oil, Garlic, Vitamin D"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#00B8A9] focus:outline-none transition-colors text-gray-900"
              />
              {!isPro && user && (
                <p className="text-sm text-gray-600 mt-2">
                  Need more than 5 checks?{' '}
                  <button onClick={handleUpgrade} className="text-blue-600 hover:text-blue-700 font-semibold underline">
                    Upgrade to Pro
                  </button>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!rx.trim() && !supplement.trim())}
              className="w-full bg-gradient-to-r from-[#00B8A9] to-[#009688] hover:from-[#009688] hover:to-[#00B8A9] text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Searching...' : 'Check for Interactions'}
            </button>
          </form>
        </div>
        )}

        {!isPro && user && searched && results.length > 0 && (
          <div className="bg-gradient-to-br from-[#C0F000] to-[#A8D000] rounded-2xl p-8 mb-8 border-2 border-gray-900">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-[#C0F000]" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Pro Members See 12 Additional Details
                </h3>
                <p className="text-gray-800 mb-4 leading-relaxed">
                  The results above show basic interactions. Pro members get access to:
                </p>
                <ul className="space-y-2 mb-6 text-gray-900">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0 font-bold" />
                    <span><strong>Detailed mechanism breakdowns</strong> with molecular pathways</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0 font-bold" />
                    <span><strong>Personalized risk assessment</strong> based on your profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0 font-bold" />
                    <span><strong>AI recommendations</strong> from Pippin, your safety assistant</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0 font-bold" />
                    <span><strong>Downloadable PDF report</strong> to share with your doctor</span>
                  </li>
                </ul>
                <Link
                  to="/pricing"
                  className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  Upgrade to Pro — $20/month
                </Link>
              </div>
            </div>
          </div>
        )}

        {searched && (
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No Known Interactions Found
                </h3>
                <p className="text-gray-600">
                  We didn't find any documented interactions for your search. However, always consult your healthcare provider before starting any new supplement.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-[#00B8A9] to-[#009688] rounded-2xl p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    Found {results.length} Interaction{results.length !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-white/90">
                    Review the details below and consult your healthcare provider
                  </p>
                </div>

                {results.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {interaction.rx} + {interaction.supplement}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getRiskColor(
                                interaction.risk
                              )} border`}
                            >
                              <AlertTriangle className="w-4 h-4" />
                              {interaction.risk} Risk
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-[#00B8A9]" />
                            Mechanism
                          </h4>
                          <p className="text-gray-600 pl-6">{interaction.mechanism}</p>
                        </div>

                        {interaction.clinical_note && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              Clinical Note
                            </h4>
                            <p className="text-gray-600 pl-6">{interaction.clinical_note}</p>
                          </div>
                        )}

                        <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#00B8A9]" />
                            Recommended Action
                          </h4>
                          <p className="text-gray-700">{interaction.advice}</p>
                        </div>

                        {interaction.citation_title && (
                          <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                            <p className="font-medium">Source:</p>
                            <p>
                              {interaction.citation_title} ({interaction.citation_source},{' '}
                              {interaction.citation_year})
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        <div className="mt-12 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Important Disclaimer</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                This tool is for informational purposes only and is not a substitute for professional medical advice.
                Always consult your healthcare provider before starting, stopping, or changing any medication or supplement regimen.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Usage Threshold Modal */}
      {showThresholdModal && (
        <UsageThresholdModal
          usedChecks={searchCount}
          totalChecks={usageLimit}
          onUpgrade={handleUpgrade}
          onDismiss={handleDismissModal}
        />
      )}
    </div>
  );
}
