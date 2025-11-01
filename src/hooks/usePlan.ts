import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export type Plan = 'starter' | 'pro' | 'expert';

export function usePlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan>('starter');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) {
      setPlan('starter');
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching plan:', error);
        setPlan('starter');
      } else if (data) {
        setPlan((data.plan as Plan) || 'starter');
      } else {
        setPlan('starter');
      }

      setLoading(false);
    };

    fetchPlan();
  }, [user]);

  return { plan, loading, isPro: plan === 'pro', isExpert: plan === 'expert' };
}
