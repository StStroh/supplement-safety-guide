import { XCircle, Shield } from 'lucide-react';

export function Cancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-400 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center relative border-2 border-gray-100">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
          <XCircle className="w-14 h-14 text-red-600" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Your payment was cancelled. No charges have been made to your account.
          We're here when you're ready to continue.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-[#00B8A9]" />
            <h2 className="font-semibold text-gray-900">Still have questions?</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Our team is here to help you find the right plan for your needs.
            Feel free to reach out with any questions about supplement safety.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-[#00B8A9] to-[#009688] text-white py-4 px-8 rounded-xl font-semibold hover:from-[#009688] hover:to-[#00B8A9] transition-all shadow-md hover:shadow-lg"
          >
            View Plans Again
          </button>

          <a
            href="mailto:support@supplementsafetybible.com"
            className="block w-full bg-gray-100 text-gray-900 py-4 px-8 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            Contact Support
          </a>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Questions? Email us at support@supplementsafetybible.com
        </p>
      </div>
    </div>
  );
}
