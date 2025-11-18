
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, TrendingUp, Zap, Target, Award } from 'lucide-react';

interface LoadingAnimationProps {
  toolName: string;
  messages?: string[];
  duration?: number;
}

export default function LoadingAnimation({ 
  toolName, 
  messages,
  duration = 5000 
}: LoadingAnimationProps) {
  const defaultMessages = [
    { text: "🔍 Scanning your data...", icon: Sparkles },
    { text: "📊 Analyzing metrics...", icon: TrendingUp },
    { text: "⚡ Optimizing results...", icon: Zap },
    { text: "🎯 Generating insights...", icon: Target },
    { text: "✨ Almost there...", icon: Award }
  ];

  const displayMessages = messages || defaultMessages.map(m => m.text);
  const messageInterval = duration / displayMessages.length;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/95 via-charcoal/95 to-accent/95 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Animated Logo/Icon */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center shadow-xl"
          >
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>

          {/* Main Heading */}
          <h3 className="text-2xl md:text-3xl font-bold text-charcoal mb-4">
            Analyzing Your {toolName}...
          </h3>

          {/* FOMO Subtitle */}
          <p className="text-base md:text-lg text-gray-600 mb-8">
            🔥 <span className="font-semibold">167 businesses</span> used this tool in the last 24 hours
          </p>

          {/* Progress Bar */}
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent via-secondary to-accent bg-[length:200%_100%] animate-shimmer"
            />
          </div>

          {/* Rotating Messages */}
          <div className="h-16 md:h-20 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {defaultMessages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      delay: (messageInterval * index) / 1000,
                      duration: 0.5 
                    }
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute flex items-center gap-3 text-gray-700 text-base md:text-lg font-medium"
                  style={{
                    animationDelay: `${(messageInterval * index) / 1000}s`,
                    animationDuration: `${messageInterval / 1000}s`,
                    animationIterationCount: 1,
                    animationFillMode: 'both',
                    animationName: index < displayMessages.length - 1 ? 'fadeInOut' : 'fadeIn'
                  }}
                >
                  <msg.icon className="w-5 h-5 md:w-6 md:h-6 text-accent animate-pulse" />
                  <span>{msg.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl md:text-2xl font-bold text-accent">50K+</div>
                <div className="text-xs md:text-sm text-gray-500">Audits</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-secondary">4.9★</div>
                <div className="text-xs md:text-sm text-gray-500">Rating</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-accent">98%</div>
                <div className="text-xs md:text-sm text-gray-500">Satisfied</div>
              </div>
            </div>
          </div>

          {/* Small Print */}
          <p className="mt-6 text-xs md:text-sm text-gray-400">
            ⚡ This usually takes less than 5 seconds
          </p>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(20px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
