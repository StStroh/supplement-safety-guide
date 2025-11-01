import { ReactNode } from 'react';
import { useUserPlan } from '../hooks/useUserPlan';
import { hasPlan, getPlanName, PlanTier } from '../lib/plan';
import { Lock } from 'lucide-react';

interface RequirePlanProps {
  min: PlanTier;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePlan({ min, children, fallback }: RequirePlanProps) {
  const { plan, loading } = useUserPlan();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasPlan(plan, min)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-slate-700/50 p-4 rounded-full">
          <Lock className="w-8 h-8 text-blue-400" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        {getPlanName(min)} Plan Required
      </h3>
      <p className="text-slate-400 mb-6">
        This feature is available for {getPlanName(min)} and Premium members.
        <br />
        Your current plan: <span className="font-semibold text-blue-400">{getPlanName(plan)}</span>
      </p>
      <a
        href="/pricing"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Upgrade to {getPlanName(min)}
      </a>
    </div>
  );
}
