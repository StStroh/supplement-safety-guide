import React from 'react';
import { X, TrendingUp } from 'lucide-react';
import { Button } from './ui/Button';

interface UsageThresholdModalProps {
  usedChecks: number;
  totalChecks: number;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function UsageThresholdModal({ usedChecks, totalChecks, onUpgrade, onDismiss }: UsageThresholdModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost out of free checks</h2>
          <p className="text-gray-600">
            You've used <strong>{usedChecks} of {totalChecks} checks</strong>. Get unlimited checks, family plan, and PDF reports with Pro.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Upgrade to Pro
          </Button>
          <Button
            onClick={onDismiss}
            variant="outline"
            className="w-full"
          >
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
