import React from 'react';
import { Crown, Clock, AlertCircle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { getProductByPriceId } from '../stripe-config';

export const SubscriptionStatus: React.FC = () => {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </div>
    );
  }

  if (!subscription || !subscription.price_id) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
        <AlertCircle className="w-4 h-4 text-blue-600 mr-2" />
        <span className="text-sm font-medium text-blue-800">No Active Plan</span>
      </div>
    );
  }

  const product = getProductByPriceId(subscription.price_id);
  const isActive = subscription.subscription_status === 'active';
  const isPastDue = subscription.subscription_status === 'past_due';
  const isCanceled = subscription.subscription_status === 'canceled';

  const getStatusColor = () => {
    if (isActive) return 'green';
    if (isPastDue) return 'yellow';
    if (isCanceled) return 'red';
    return 'gray';
  };

  const getStatusIcon = () => {
    if (isActive) return <Crown className="w-4 h-4" />;
    if (isPastDue) return <Clock className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const statusColor = getStatusColor();

  return (
    <div className={`bg-${statusColor}-50 border border-${statusColor}-200 rounded-lg p-3 flex items-center`}>
      <div className={`text-${statusColor}-600 mr-2`}>
        {getStatusIcon()}
      </div>
      <div>
        <span className={`text-sm font-medium text-${statusColor}-800`}>
          {product?.name || 'Unknown Plan'}
        </span>
        {isPastDue && (
          <p className={`text-xs text-${statusColor}-700 mt-1`}>
            Payment overdue
          </p>
        )}
        {isCanceled && (
          <p className={`text-xs text-${statusColor}-700 mt-1`}>
            Canceled
          </p>
        )}
      </div>
    </div>
  );
};