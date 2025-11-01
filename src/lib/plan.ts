export type PlanTier = 'starter' | 'pro' | 'premium';

const planOrder: Record<PlanTier, number> = {
  starter: 0,
  pro: 1,
  premium: 2,
};

export const hasPlan = (userPlan: PlanTier, requiredPlan: PlanTier): boolean => {
  return planOrder[userPlan] >= planOrder[requiredPlan];
};

export const getPlanName = (plan: PlanTier): string => {
  const names: Record<PlanTier, string> = {
    starter: 'Starter',
    pro: 'Pro',
    premium: 'Premium',
  };
  return names[plan];
};

export const getPlanFeatures = (plan: PlanTier): string[] => {
  const features: Record<PlanTier, string[]> = {
    starter: [
      '5 supplement checks per month',
      'Basic interaction warnings',
      'Email support',
    ],
    pro: [
      '50 supplement checks per month',
      'Advanced interaction analysis',
      'PDF reports',
      'Priority email support',
    ],
    premium: [
      'Unlimited supplement checks',
      'Complete interaction database',
      'Unlimited PDF reports',
      'Custom recommendations',
      '24/7 priority support',
    ],
  };
  return features[plan];
};
