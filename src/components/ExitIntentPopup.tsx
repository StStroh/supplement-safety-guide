import { useState, useEffect } from 'react';
import { X, Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const POPUP_STORAGE_KEY = 'exit_popup_shown';
const POPUP_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem(POPUP_STORAGE_KEY);
    if (lastShown) {
      const timeSinceShown = Date.now() - parseInt(lastShown);
      if (timeSinceShown < POPUP_COOLDOWN_MS) {
        setHasShown(true);
        return;
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString());
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-slide-up">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00B8A9] to-[#009688] rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Wait! Special Offer
          </h2>
          <p className="text-gray-600 text-lg">
            Get 20% off your first month with Pro
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#C0F000]/10 to-[#00B8A9]/10 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-[#00B8A9]" />
            <span className="text-gray-900 font-semibold">Limited time offer</span>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[#00B8A9] font-bold">✓</span>
              <span>Unlimited supplement safety checks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00B8A9] font-bold">✓</span>
              <span>AI-powered personalized recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00B8A9] font-bold">✓</span>
              <span>Downloadable PDF reports for your doctor</span>
            </li>
          </ul>
        </div>

        <Link
          to="/pricing"
          onClick={() => setIsVisible(false)}
          className="block w-full bg-gradient-to-r from-[#00B8A9] to-[#009688] hover:from-[#009688] hover:to-[#00B8A9] text-white font-bold py-4 px-6 rounded-lg text-center transition-all shadow-lg hover:shadow-xl mb-3"
        >
          Claim 20% Off Now
        </Link>

        <button
          onClick={() => setIsVisible(false)}
          className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          No thanks, I'll pay full price
        </button>
      </div>
    </div>
  );
}
