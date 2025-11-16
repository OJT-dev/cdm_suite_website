

'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let exitIntentTriggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse is leaving from the top of the viewport
      if (e.clientY <= 0 && !exitIntentTriggered) {
        const hasSeenExitPopup = localStorage.getItem('exit_popup_seen');
        
        if (!hasSeenExitPopup) {
          exitIntentTriggered = true;
          setIsVisible(true);
        }
      }
    };

    // Add event listener
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('exit_popup_seen', 'true');
  };

  const handleGetAudit = () => {
    handleClose();
    router.push('/auditor');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 hover:bg-gray-100 rounded-full p-2 transition-colors"
          aria-label="Close popup"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Wait! Before You Go...</h2>
          <p className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold mb-6">
            See How Your Website Performs in 60 Seconds!
          </p>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 text-left">
            <p className="text-gray-700 mb-4 font-medium">
              Our FREE Website Auditor analyzes:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>SEO performance & keyword opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Page speed & user experience issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Mobile responsiveness & security gaps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Personalized action plan to increase conversions</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleGetAudit}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-6 text-lg"
          >
            Analyze My Website Now - FREE!
          </Button>

          <button 
            onClick={handleClose}
            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Maybe later
          </button>

          <p className="text-xs text-gray-500 mt-4">
            ⚡ Over 1,000 businesses have improved their websites with our auditor
          </p>
        </div>
      </div>
    </div>
  );
}
