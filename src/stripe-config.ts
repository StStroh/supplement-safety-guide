export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_starter',
    priceId: 'price_1SJJL4LSpIuKqlsUgNBSE8ZV',
    name: 'Starter Access',
    description: 'Try the Supplement Safety Bible for free. Perform up to 5 supplement safety checks each month, see basic interaction alerts, and access our public safety index.',
    price: 0.00,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_professional',
    priceId: 'price_1SJJQtLSpIuKqlsUhZdEPJ3L',
    name: 'Professional Plan',
    description: 'Unlimited supplement safety checks, personalized health insights, and PDF export reports.',
    price: 9.99,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_premium',
    priceId: 'price_1SJJXgLSpIuKqlsUa5rP1xbE',
    name: 'Premium Plan',
    description: 'Premium access with AI-powered supplement insights, family plan, and nutritionist consultation.',
    price: 29.99,
    currency: 'usd',
    mode: 'subscription'
  },
  {
    id: 'prod_TDphio9gu8aSKg',
    priceId: 'price_1SHO23LyITsx0KtLXLvpXbuR',
    name: 'Supplement Safety Bible – Digital Edition',
    description: 'A comprehensive digital handbook detailing safe supplement combinations and interactions with prescription medications.',
    price: 4.99,
    currency: 'usd',
    mode: 'payment'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getSubscriptionProducts = (): StripeProduct[] => {
  return stripeProducts.filter(product => product.mode === 'subscription');
};

export const getOneTimeProducts = (): StripeProduct[] => {
  return stripeProducts.filter(product => product.mode === 'payment');
};