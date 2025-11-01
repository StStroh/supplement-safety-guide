import { ReactNode } from 'react';
import { env } from '../lib/env';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StarterGateProps {
  children: ReactNode;
}

export function StarterGate({ children }: StarterGateProps) {
  if (env.isConfigured) {
    return <>{children}</>;
  }

  const checks = [
    {
      name: 'Supabase Database URL',
      key: 'VITE_SUPABASE_URL',
      value: env.url,
      status: env.url ? 'ok' : 'missing',
    },
    {
      name: 'Supabase Anonymous Key',
      key: 'VITE_SUPABASE_ANON_KEY',
      value: env.key,
      status: env.key ? 'ok' : 'missing',
    },
    {
      name: 'Stripe Publishable Key',
      key: 'VITE_STRIPE_PUBLISHABLE_KEY',
      value: env.stripe,
      status: env.stripe ? 'ok' : 'warn',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/logo-ssb.png"
                alt="Supplement Safety Bible"
                className="h-16 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Supplement Safety Bible
            </h1>
            <p className="text-blue-100">System Configuration Check</p>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Configuration Status
              </h2>
              <p className="text-slate-400">
                The following environment variables are required for the application to function properly.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {checks.map((check) => (
                <div
                  key={check.key}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-start gap-3"
                >
                  <div className="mt-0.5">
                    {check.status === 'ok' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {check.status === 'warn' && (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    {check.status === 'missing' && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-white">{check.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          check.status === 'ok'
                            ? 'bg-green-500/20 text-green-400'
                            : check.status === 'warn'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {check.status === 'ok'
                          ? 'CONFIGURED'
                          : check.status === 'warn'
                          ? 'OPTIONAL'
                          : 'MISSING'}
                      </span>
                    </div>
                    <code className="text-xs text-slate-400 font-mono">
                      {check.key}
                    </code>
                    {check.value && (
                      <div className="mt-2 text-xs text-slate-500 font-mono bg-slate-950/50 p-2 rounded">
                        {check.value.substring(0, 40)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Configuration Required
              </h3>
              <p className="text-sm text-blue-200 mb-3">
                To resolve this, add the missing environment variables in your Netlify dashboard:
              </p>
              <ol className="text-sm text-blue-200 space-y-1 list-decimal list-inside">
                <li>Go to Netlify Dashboard → Site Settings</li>
                <li>Navigate to Environment Variables</li>
                <li>Add the missing variables listed above</li>
                <li>Trigger a new deployment</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <a
                href="/starter.html"
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors text-center"
              >
                Starter Help Guide
              </a>
              <a
                href="https://app.netlify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-center"
              >
                Go to Netlify Dashboard
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Need help? Contact support or check the documentation.
        </p>
      </div>
    </div>
  );
}
