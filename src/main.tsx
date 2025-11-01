import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StarterGate } from './components/StarterGate.tsx';
import App from './App.tsx';
import './index.css';

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <StarterGate>
        <App />
      </StarterGate>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 40px; font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626; margin-bottom: 16px;">Application Error</h1>
      <p style="color: #374151; margin-bottom: 12px;">The application failed to start.</p>
      <p style="color: #6b7280; font-size: 14px;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <h2 style="color: #111827; font-size: 18px; margin-bottom: 12px;">Required Environment Variables:</h2>
      <ul style="color: #374151; line-height: 1.8;">
        <li><code>VITE_SUPABASE_URL</code> - Your Supabase project URL</li>
        <li><code>VITE_SUPABASE_ANON_KEY</code> - Your Supabase anon public key</li>
      </ul>
      <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">Check your <code>.env</code> file and ensure both values are set correctly.</p>
    </div>
  `;
}
