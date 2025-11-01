import { supabase } from './supabaseClient';

export interface SupplementInteraction {
  id: string;
  rx: string;
  supplement: string;
  risk: 'Low' | 'Moderate' | 'High';
  mechanism: string;
  clinical_note: string;
  advice: string;
  citation_title: string;
  citation_source: string;
  citation_year: number;
  created_at: string;
  updated_at: string;
}

export async function searchInteractions(
  rx: string,
  supplement: string
): Promise<SupplementInteraction[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const sb = supabase;
  const { data, error } = await sb
    .from('supplement_interactions')
    .select('*')
    .or(`rx.ilike.%${rx}%,supplement.ilike.%${supplement}%`)
    .order('risk', { ascending: false });

  if (error) {
    console.error('Error searching interactions:', error);
    throw error;
  }

  return data || [];
}

export async function getInteractionByRxAndSupplement(
  rx: string,
  supplement: string
): Promise<SupplementInteraction | null> {
  if (!supabase) throw new Error('Supabase not configured');
  const sb = supabase;
  const { data, error } = await sb
    .from('supplement_interactions')
    .select('*')
    .eq('rx', rx)
    .eq('supplement', supplement)
    .maybeSingle();

  if (error) {
    console.error('Error fetching interaction:', error);
    throw error;
  }

  return data;
}

export async function getAllInteractionsByRx(
  rx: string
): Promise<SupplementInteraction[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const sb = supabase;
  const { data, error } = await sb
    .from('supplement_interactions')
    .select('*')
    .ilike('rx', `%${rx}%`)
    .order('risk', { ascending: false });

  if (error) {
    console.error('Error fetching interactions by rx:', error);
    throw error;
  }

  return data || [];
}

export async function getAllInteractionsBySupplement(
  supplement: string
): Promise<SupplementInteraction[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const sb = supabase;
  const { data, error } = await sb
    .from('supplement_interactions')
    .select('*')
    .ilike('supplement', `%${supplement}%`)
    .order('risk', { ascending: false });

  if (error) {
    console.error('Error fetching interactions by supplement:', error);
    throw error;
  }

  return data || [];
}

export async function getAllInteractions(): Promise<SupplementInteraction[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const sb = supabase;
  const { data, error } = await sb
    .from('supplement_interactions')
    .select('*')
    .order('rx', { ascending: true })
    .order('supplement', { ascending: true });

  if (error) {
    console.error('Error fetching all interactions:', error);
    throw error;
  }

  return data || [];
}

export function getRiskColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case 'high':
      return 'text-red-600 bg-red-100 border-red-300';
    case 'moderate':
      return 'text-orange-600 bg-orange-100 border-orange-300';
    case 'low':
      return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-300';
  }
}

export function getRiskBadgeColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case 'high':
      return 'bg-red-500';
    case 'moderate':
      return 'bg-orange-500';
    case 'low':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
}
