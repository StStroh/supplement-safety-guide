import { AlertTriangle } from 'lucide-react';

interface ConfigurationErrorProps {
  missingVars?: string[];
}

export function ConfigurationError({ missingVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] }: ConfigurationErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">Configuration Error</h1>
            <p className="text-slate-300 leading-relaxed">
              The application cannot start because required environment variables are missing.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Missing Environment Variables</h2>
          <ul className="space-y-2">
            {missingVars.map((varName) => (
              <li key={varName} className="flex items-center gap-3 text-slate-300">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <code className="px-2 py-1 bg-slate-800 rounded text-sm font-mono text-red-400">
                  {varName}
                </code>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-3">How to Fix</h2>
          <ol className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-semibold">
                1
              </span>
              <span>Go to <strong className="text-white">Netlify Dashboard</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-semibold">
                2
              </span>
              <span>Navigate to <strong className="text-white">Site settings</strong> → <strong className="text-white">Build & deploy</strong> → <strong className="text-white">Environment</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-semibold">
                3
              </span>
              <span>Add the missing environment variables</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-sm font-semibold">
                4
              </span>
              <span>Redeploy your site</span>
            </li>
          </ol>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            Check the browser console for additional error details.
          </p>
        </div>
      </div>
    </div>
  );
}
