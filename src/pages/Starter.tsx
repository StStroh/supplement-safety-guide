import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Starter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    if (!supabase) {
      setErr('Supabase is not configured. Please contact support.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { plan: 'starter' },
      },
    });

    setLoading(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  if (sent)
    return (
      <div className="max-w-md mx-auto p-8">
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p>We sent you a secure link to access your Starter plan.</p>
      </div>
    );

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Get Starter Access</h1>
      <p className="text-gray-600 mb-6">
        No password needed. We’ll email you a secure sign-in link.
      </p>
      <form onSubmit={handleSend} className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded px-4 py-2"
        >
          {loading ? 'Sending…' : 'Send me the link'}
        </button>
      </form>
      {err && <p className="text-red-600 mt-4">{err}</p>}
    </div>
  );
}