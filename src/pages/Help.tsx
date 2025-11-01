import { AlertCircle, CheckCircle, HelpCircle, ExternalLink } from 'lucide-react';

export default function Help() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-[#00B8A9] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Troubleshooting</h1>
          <p className="text-lg text-gray-600">Common issues and how to resolve them</p>
        </div>

        <div className="space-y-8">
          {/* Stripe Payment Issues */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-red-100">
            <div className="flex items-start mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Not Working?</h2>
                <p className="text-gray-600 mb-4">
                  If you see "Failed to start checkout" or payments aren't processing, here's what to check:
                </p>
              </div>
            </div>

            <div className="space-y-6 ml-9">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Environment Variables</h3>
                <p className="text-gray-600 mb-3">Make sure these are set in Netlify:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">STRIPE_SECRET_KEY</code> - Your live secret key (sk_live_...)</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY</code> - Your live publishable key (pk_live_...)</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">VITE_PRICE_ID_STARTER</code> - Starter plan price ID</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">VITE_PRICE_ID_PRO</code> - Professional plan price ID</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">VITE_PRICE_ID_PREMIUM</code> - Premium plan price ID</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Check Netlify Function</h3>
                <p className="text-gray-600 mb-3">
                  The payment function should be deployed at:
                </p>
                <code className="block bg-gray-100 px-4 py-2 rounded text-sm">
                  /.netlify/functions/create-checkout-session
                </code>
                <p className="text-gray-600 mt-2">
                  Check Netlify Dashboard → Functions to see if it's deployed.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Stripe Dashboard</h3>
                <p className="text-gray-600 mb-2">
                  Verify in your Stripe Dashboard:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>You're in LIVE mode (not test mode)</li>
                  <li>Your products have active prices</li>
                  <li>The price IDs match your environment variables</li>
                </ul>
                <a
                  href="https://dashboard.stripe.com/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#00B8A9] hover:text-[#009688] mt-2"
                >
                  Open Stripe Dashboard
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Browser Console</h3>
                <p className="text-gray-600 mb-2">
                  Open DevTools (F12) and check:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Console tab for any red error messages</li>
                  <li>Network tab for the checkout POST request</li>
                  <li>Look for the response body with error details</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Success Indicators */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-green-100">
            <div className="flex items-start mb-4">
              <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Know It's Working</h2>
                <p className="text-gray-600 mb-4">
                  When everything is configured correctly:
                </p>
              </div>
            </div>

            <ul className="list-disc list-inside space-y-3 text-gray-700 ml-9">
              <li>Clicking "Get Started" shows "Processing..." for 1-2 seconds</li>
              <li>You're redirected to checkout.stripe.com</li>
              <li>The Stripe checkout page shows the correct product and price</li>
              <li>After payment, you're redirected back to /success</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-[#00B8A9] to-[#009688] rounded-lg shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
            <p className="mb-4">
              If you've checked everything above and payments still aren't working, please contact support with:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>The exact error message you see</li>
              <li>A screenshot of your Netlify environment variables (hide the actual keys)</li>
              <li>A screenshot of the browser console errors</li>
              <li>The URL where you're testing</li>
            </ul>
            <a
              href="mailto:support@supplementsafetybible.com"
              className="inline-block bg-white text-[#00B8A9] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </a>
          </div>

          {/* Deployment Checklist */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pre-Launch Checklist</h2>
            <div className="space-y-3">
              <label className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3" />
                <span className="text-gray-700">All environment variables set in Netlify</span>
              </label>
              <label className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3" />
                <span className="text-gray-700">Using LIVE Stripe keys (not test mode)</span>
              </label>
              <label className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3" />
                <span className="text-gray-700">Price IDs verified in Stripe Dashboard</span>
              </label>
              <label className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3" />
                <span className="text-gray-700">Netlify function deployed successfully</span>
              </label>
              <label className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3" />
                <span className="text-gray-700">Tested checkout flow end-to-end</span>
              </label>
              <label className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3" />
                <span className="text-gray-700">Success and Cancel pages working</span>
              </label>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
