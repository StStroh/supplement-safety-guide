import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Checker } from './pages/Checker';
import { Success } from './pages/Success';
import { ThanksPage } from './pages/ThanksPage';
import { ThanksFree } from './pages/ThanksFree';
import { Cancel } from './pages/Cancel';
import { Signup } from './pages/Signup';
import { FreeSignupPage } from './pages/FreeSignupPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ExitIntentPopup } from './components/ExitIntentPopup';
import Help from './pages/Help';
import Admin from './pages/Admin';
import Campaigns from './pages/Campaigns';
import SetupAdmin from './pages/SetupAdmin';

function App() {
  return (
    <ErrorBoundary fallback={<div className="p-6 text-slate-200">Loading failed. Please refresh.</div>}>
      <BrowserRouter>
        <ExitIntentPopup />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checker" element={<Checker />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup-free" element={<FreeSignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/success" element={<Success />} />
          <Route path="/thanks" element={<ThanksPage />} />
          <Route path="/thanks-free" element={<ThanksFree />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/help" element={<Help />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/setup-admin" element={<ProtectedRoute><SetupAdmin /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
