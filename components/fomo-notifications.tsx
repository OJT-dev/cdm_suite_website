
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, TrendingUp, Sparkles } from "lucide-react";

interface Notification {
  id: string;
  name: string;
  tool: string;
  location: string;
  timestamp: string;
}

const TOOLS = [
  "ROI Calculator",
  "SEO Checker",
  "Website Auditor",
  "Email Tester",
  "Conversion Analyzer",
  "Budget Calculator"
];

const LOCATIONS = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "Miami, FL",
  "Austin, TX",
  "Seattle, WA",
  "Denver, CO",
  "Boston, MA",
  "Portland, OR"
];

const NAMES = [
  "Michael",
  "Sarah",
  "Jennifer",
  "David",
  "Jessica",
  "James",
  "Emily",
  "Robert",
  "Lisa",
  "William",
  "Karen",
  "Daniel",
  "Amanda",
  "Thomas",
  "Melissa"
];

const generateNotification = (): Notification => {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const minutesAgo = Math.floor(Math.random() * 15) + 1;
  
  return {
    id: Date.now().toString(),
    name,
    tool,
    location,
    timestamp: minutesAgo === 1 ? "Just now" : `${minutesAgo} min ago`
  };
};

export default function FOMONotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    // Show first notification after 5 seconds
    const firstTimeout = setTimeout(() => {
      const notification = generateNotification();
      setCurrentNotification(notification);
      setNotifications(prev => [notification, ...prev]);
    }, 5000);

    return () => clearTimeout(firstTimeout);
  }, []);

  useEffect(() => {
    if (currentNotification) {
      // Hide after 6 seconds
      const hideTimeout = setTimeout(() => {
        setCurrentNotification(null);
      }, 6000);

      // Show next notification after 15-30 seconds
      const nextTimeout = setTimeout(() => {
        const notification = generateNotification();
        setCurrentNotification(notification);
        setNotifications(prev => [notification, ...prev].slice(0, 10));
      }, Math.random() * 15000 + 15000);

      return () => {
        clearTimeout(hideTimeout);
        clearTimeout(nextTimeout);
      };
    }
  }, [currentNotification]);

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-4 left-4 z-50 max-w-sm"
        >
          <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 pr-6">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 bg-gradient-to-br from-green-600 to-emerald-600 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {currentNotification.name}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Sparkles className="h-3 w-3" />
                    {currentNotification.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Just used <span className="font-semibold text-green-700">{currentNotification.tool}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  📍 {currentNotification.location}
                </p>
              </div>

              {/* Pulse indicator */}
              <div className="flex-shrink-0 relative">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="font-semibold">2,847 users</span> in last 7 days
              </div>
              <span className="text-green-700 font-semibold">🔥 Active</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
