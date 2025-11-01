import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const FREE_CHECKS_LIMIT = 3;
const SESSION_KEY = 'guest_session_token';

export function useGuestSession() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [checksUsed, setChecksUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSession();
  }, []);

  const generateToken = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const initializeSession = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured - guest sessions disabled');
        setLoading(false);
        return;
      }

      let token = localStorage.getItem(SESSION_KEY);

      if (!token) {
        token = generateToken();
        localStorage.setItem(SESSION_KEY, token);

        const { error } = await supabase
          .from('guest_sessions')
          .insert({
            session_token: token,
            checks_used: 0,
          });

        if (error) throw error;
        setChecksUsed(0);
      } else {
        const { data, error } = await supabase
          .from('guest_sessions')
          .select('checks_used')
          .eq('session_token', token)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setChecksUsed(data.checks_used || 0);
        } else {
          const { error: insertError } = await supabase
            .from('guest_sessions')
            .insert({
              session_token: token,
              checks_used: 0,
            });

          if (insertError) throw insertError;
          setChecksUsed(0);
        }
      }

      setSessionToken(token);
    } catch (error) {
      console.error('Error initializing guest session:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementCheckCount = async () => {
    if (!sessionToken || !supabase) return false;

    try {
      const newCount = checksUsed + 1;

      const { error } = await supabase
        .from('guest_sessions')
        .update({
          checks_used: newCount,
          last_check_at: new Date().toISOString(),
        })
        .eq('session_token', sessionToken);

      if (error) throw error;

      setChecksUsed(newCount);
      return true;
    } catch (error) {
      console.error('Error incrementing check count:', error);
      return false;
    }
  };

  const remainingChecks = Math.max(0, FREE_CHECKS_LIMIT - checksUsed);
  const hasChecksRemaining = remainingChecks > 0;
  const isAtLimit = checksUsed >= FREE_CHECKS_LIMIT;

  return {
    sessionToken,
    checksUsed,
    remainingChecks,
    hasChecksRemaining,
    isAtLimit,
    incrementCheckCount,
    loading,
    freeChecksLimit: FREE_CHECKS_LIMIT,
  };
}
