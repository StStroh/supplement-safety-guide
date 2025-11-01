import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { Plus, Edit2, Trash2, Copy, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface Campaign {
  id: string;
  campaign_name: string;
  influencer_name: string;
  platform: string;
  content_type: string;
  followers_count: number;
  cost_cents: number;
  ref_code: string;
  status: string;
  notes: string;
  created_at: string;
}

export default function Campaigns() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [copiedRef, setCopiedRef] = useState('');

  const [formData, setFormData] = useState({
    campaign_name: '',
    influencer_name: '',
    platform: 'TikTok',
    content_type: 'Influencer Post',
    followers_count: 0,
    cost_cents: 0,
    ref_code: '',
    notes: ''
  });

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
        await loadCampaigns();
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    const { data, error } = await supabase
      .from('influencer_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading campaigns:', error);
    } else if (data) {
      setCampaigns(data);
    }
  };

  const generateRefCode = () => {
    const random = Math.random().toString(36).substring(2, 8);
    return `ref_${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const campaignData = {
      ...formData,
      ref_code: formData.ref_code || generateRefCode()
    };

    if (editingCampaign) {
      const { error } = await supabase
        .from('influencer_campaigns')
        .update(campaignData)
        .eq('id', editingCampaign.id);

      if (error) {
        alert('Error updating campaign: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('influencer_campaigns')
        .insert([campaignData]);

      if (error) {
        alert('Error creating campaign: ' + error.message);
        return;
      }
    }

    resetForm();
    await loadCampaigns();
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      campaign_name: campaign.campaign_name,
      influencer_name: campaign.influencer_name,
      platform: campaign.platform,
      content_type: campaign.content_type,
      followers_count: campaign.followers_count,
      cost_cents: campaign.cost_cents,
      ref_code: campaign.ref_code,
      notes: campaign.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    const { error } = await supabase
      .from('influencer_campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting campaign: ' + error.message);
    } else {
      await loadCampaigns();
    }
  };

  const handleStatusToggle = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';

    const { error } = await supabase
      .from('influencer_campaigns')
      .update({ status: newStatus })
      .eq('id', campaign.id);

    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      await loadCampaigns();
    }
  };

  const resetForm = () => {
    setFormData({
      campaign_name: '',
      influencer_name: '',
      platform: 'TikTok',
      content_type: 'Influencer Post',
      followers_count: 0,
      cost_cents: 0,
      ref_code: '',
      notes: ''
    });
    setEditingCampaign(null);
    setShowForm(false);
  };

  const copyRefLink = (refCode: string) => {
    const link = `${window.location.origin}/?ref=${refCode}`;
    navigator.clipboard.writeText(link);
    setCopiedRef(refCode);
    setTimeout(() => setCopiedRef(''), 2000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Campaign Manager</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Q1 2024 Health Influencer Campaign"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Influencer Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.influencer_name}
                  onChange={(e) => setFormData({ ...formData, influencer_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@healthyguru123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="UGC">UGC</option>
                  <option value="Influencer Post">Influencer Post</option>
                  <option value="Affiliate">Affiliate</option>
                  <option value="Paid Ad">Paid Ad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Followers Count
                </label>
                <input
                  type="number"
                  required
                  value={formData.followers_count}
                  onChange={(e) => setFormData({ ...formData, followers_count: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost ($)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.cost_cents / 100}
                  onChange={(e) => setFormData({ ...formData, cost_cents: Math.round(parseFloat(e.target.value) * 100) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="150.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code (optional)
                </label>
                <input
                  type="text"
                  value={formData.ref_code}
                  onChange={(e) => setFormData({ ...formData, ref_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Campaign notes, deliverables, etc."
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Campaign</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Platform</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">Followers</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">Cost</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Ref Code</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500">
                      No campaigns yet. Create your first one!
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{campaign.campaign_name}</div>
                        <div className="text-sm text-gray-500">{campaign.influencer_name}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{campaign.platform}</td>
                      <td className="py-4 px-6 text-gray-700">{campaign.content_type}</td>
                      <td className="py-4 px-6 text-right text-gray-700">{campaign.followers_count.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-900">${(campaign.cost_cents / 100).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{campaign.ref_code}</code>
                          <button
                            onClick={() => copyRefLink(campaign.ref_code)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Copy referral link"
                          >
                            {copiedRef === campaign.ref_code ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={`/?ref=${campaign.ref_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="Open referral link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleStatusToggle(campaign)}
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                            campaign.status === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {campaign.status}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(campaign)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
