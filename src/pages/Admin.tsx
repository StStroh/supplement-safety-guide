import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DollarSign, TrendingUp, Users, Target, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface RevenueStats {
  totalRevenue: number;
  totalFees: number;
  netProfit: number;
  availableForReinvestment: number;
  totalSubscriptions: number;
}

interface CampaignPerformance {
  id: string;
  campaign_name: string;
  influencer_name: string;
  platform: string;
  followers_count: number;
  cost_cents: number;
  signups: number;
  conversions: number;
  revenue_cents: number;
  roi: number;
  status: string;
}

export default function Admin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignPerformance[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadRevenueStats(),
        loadCampaignPerformance()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadRevenueStats = async () => {
    const { data: revenue } = await supabase
      .from('revenue_tracking')
      .select('amount_cents, stripe_fee_cents, net_profit_cents, reinvested');

    if (revenue) {
      const totalRevenue = revenue.reduce((sum, r) => sum + r.amount_cents, 0);
      const totalFees = revenue.reduce((sum, r) => sum + r.stripe_fee_cents, 0);
      const netProfit = revenue.reduce((sum, r) => sum + r.net_profit_cents, 0);
      const reinvestedProfit = revenue
        .filter(r => r.reinvested)
        .reduce((sum, r) => sum + r.net_profit_cents, 0);
      const availableForReinvestment = netProfit - reinvestedProfit;

      setRevenueStats({
        totalRevenue: totalRevenue / 100,
        totalFees: totalFees / 100,
        netProfit: netProfit / 100,
        availableForReinvestment: availableForReinvestment / 100,
        totalSubscriptions: revenue.length
      });
    }
  };

  const loadCampaignPerformance = async () => {
    const { data: campaignsData } = await supabase
      .from('influencer_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (campaignsData) {
      const performancePromises = campaignsData.map(async (campaign) => {
        const { data: referrals } = await supabase
          .from('referral_tracking')
          .select('converted_to_pro, revenue_cents')
          .eq('ref_code', campaign.ref_code);

        const signups = referrals?.length || 0;
        const conversions = referrals?.filter(r => r.converted_to_pro).length || 0;
        const revenue_cents = referrals?.reduce((sum, r) => sum + (r.revenue_cents || 0), 0) || 0;
        const roi = campaign.cost_cents > 0 ? revenue_cents / campaign.cost_cents : 0;

        return {
          id: campaign.id,
          campaign_name: campaign.campaign_name,
          influencer_name: campaign.influencer_name,
          platform: campaign.platform,
          followers_count: campaign.followers_count,
          cost_cents: campaign.cost_cents,
          signups,
          conversions,
          revenue_cents,
          roi,
          status: campaign.status
        };
      });

      const performance = await Promise.all(performancePromises);
      setCampaigns(performance.sort((a, b) => b.roi - a.roi));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const topPerformer = campaigns[0];
  const avgROI = campaigns.length > 0
    ? campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Revenue & Influencer Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Total Revenue</div>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${revenueStats?.totalRevenue.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {revenueStats?.totalSubscriptions || 0} subscriptions
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Net Profit</div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${revenueStats?.netProfit.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              After ${revenueStats?.totalFees.toFixed(2) || '0'} in fees
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Available to Reinvest</div>
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${revenueStats?.availableForReinvestment.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Ready for next campaign
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Active Campaigns</div>
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Avg ROI: {avgROI.toFixed(2)}x
            </div>
          </div>
        </div>

        {revenueStats && revenueStats.availableForReinvestment > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6 mb-8 border-2 border-green-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Next Week's Budget Recommendation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">Scale Winners (60%)</div>
                <div className="text-2xl font-bold text-green-600">
                  ${(revenueStats.availableForReinvestment * 0.6).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Hire top 10 performers again</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">Test New (30%)</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${(revenueStats.availableForReinvestment * 0.3).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">New micro-influencers</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">Reserve (10%)</div>
                <div className="text-2xl font-bold text-purple-600">
                  ${(revenueStats.availableForReinvestment * 0.1).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Emergency ad budget</div>
              </div>
            </div>
          </div>
        )}

        {topPerformer && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 mb-8 border-2 border-yellow-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3">🏆 Top Performer</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Influencer</div>
                <div className="font-bold text-gray-900">{topPerformer.influencer_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">ROI</div>
                <div className="font-bold text-green-600">{topPerformer.roi.toFixed(2)}x</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Revenue</div>
                <div className="font-bold text-gray-900">${(topPerformer.revenue_cents / 100).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Conversions</div>
                <div className="font-bold text-gray-900">{topPerformer.conversions}</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Performance</h2>

          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No campaigns yet. Create your first campaign to start tracking performance.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Campaign</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Influencer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Platform</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Cost</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Signups</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Conversions</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">ROI</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{campaign.campaign_name}</td>
                      <td className="py-3 px-4 text-sm">
                        <div>{campaign.influencer_name}</div>
                        <div className="text-xs text-gray-500">{campaign.followers_count.toLocaleString()} followers</div>
                      </td>
                      <td className="py-3 px-4 text-sm">{campaign.platform}</td>
                      <td className="py-3 px-4 text-sm text-right">${(campaign.cost_cents / 100).toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-right">{campaign.signups}</td>
                      <td className="py-3 px-4 text-sm text-right">{campaign.conversions}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold">${(campaign.revenue_cents / 100).toFixed(2)}</td>
                      <td className={`py-3 px-4 text-sm text-right font-bold ${
                        campaign.roi >= 2 ? 'text-green-600' :
                        campaign.roi >= 1 ? 'text-blue-600' :
                        'text-red-600'
                      }`}>
                        {campaign.roi.toFixed(2)}x
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="font-bold text-gray-900 mb-2">💡 Next Steps</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Scale campaigns with ROI &gt; 2x by rehiring those influencers</li>
            <li>• Pause or optimize campaigns with ROI &lt; 1.5x</li>
            <li>• Test new influencers similar to your top performers</li>
            <li>• Allocate 60% to winners, 30% to testing, 10% reserve</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
