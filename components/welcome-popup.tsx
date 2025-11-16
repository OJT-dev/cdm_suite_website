

'use client';

import { useState, useEffect } from 'react';
import { X, Gift, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('welcome_popup_seen');
    
    if (!hasSeenPopup) {
      // Show popup after 8 seconds (give users time to read the page)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('welcome_popup_seen', 'true');
  };

  const handleGetAudit = () => {
    handleClose();
    router.push('/auditor');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Gift className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to CDM Suite! 🎉</h2>
          </div>
          <p className="text-blue-100">Get Your FREE Website Audit (Worth $500)</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-gray-900 font-semibold">Instant SEO & performance analysis</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-gray-900 font-semibold">Personalized recommendations to boost conversions</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-gray-900 font-semibold">Mobile & security score included</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3" />
              </div>
              <p className="text-gray-900 font-semibold">Results delivered instantly - No waiting!</p>
            </div>
          </div>

          <Button
            onClick={handleGetAudit}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6"
          >
            Get My Free Audit Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <button 
            onClick={handleClose}
            className="w-full mt-3 text-sm text-gray-900 hover:text-gray-700 font-bold transition-colors"
          >
            No thanks, I'll check it out later
          </button>

          <p className="text-xs text-gray-900 font-bold text-center mt-4">
            Takes less than 60 seconds. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
