import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PlanTier } from '../lib/plan';

interface UserPlanData {
  plan: PlanTier;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  loading: boolean;
  error: string | null;
}

export function useUserPlan(): UserPlanData {
  const [plan, setPlan] = useState<PlanTier>('starter');
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setPlan('starter');
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('plan, stripe_customer_id, stripe_subscription_id')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching user plan:', fetchError);
          setError(fetchError.message);
          setPlan('starter');
        } else if (data) {
          setPlan((data.plan as PlanTier) || 'starter');
          setStripeCustomerId(data.stripe_customer_id);
          setStripeSubscriptionId(data.stripe_subscription_id);
        } else {
          setPlan('starter');
        }
      } catch (err) {
        console.error('Error in useUserPlan:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPlan('starter');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchUserPlan();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { plan, stripeCustomerId, stripeSubscriptionId, loading, error };
}
