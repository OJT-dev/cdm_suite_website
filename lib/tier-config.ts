
// Premium SaaS pricing: Professional DIY tools positioned between entry-level and full professional services
export const TIER_CONFIG = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "1 free DIY website (first project)",
      "AI website generator",
      "Basic templates",
      "Community support",
    ],
    limits: {
      projects: 1, // One free project
      creditsPerMonth: 0,
      analyticsAccess: false,
      builderAccess: true,
      adsAccess: false,
      supportLevel: "community",
    },
  },
  starter: {
    name: "Starter",
    price: 199,
    priceRange: "$199",
    features: [
      "5 website credits/month",
      "AI website builder with advanced features",
      "Professional templates & customization",
      "Email support within 24hrs",
      "Export code capability",
      "Basic SEO optimization",
    ],
    limits: {
      projects: 15,
      creditsPerMonth: 5,
      analyticsAccess: true,
      builderAccess: true,
      adsAccess: false,
      supportLevel: "email",
    },
  },
  growth: {
    name: "Growth",
    price: 499,
    priceRange: "$499",
    features: [
      "15 website credits/month",
      "Priority AI processing",
      "Premium templates & advanced editor",
      "Advanced analytics dashboard",
      "Priority email support (12hr response)",
      "Custom domain integration",
      "Team collaboration (up to 3 users)",
    ],
    limits: {
      projects: 50,
      creditsPerMonth: 15,
      analyticsAccess: true,
      builderAccess: true,
      adsAccess: true,
      supportLevel: "priority",
    },
  },
  pro: {
    name: "Pro",
    price: 999,
    priceRange: "$999",
    features: [
      "40 website credits/month",
      "All premium features",
      "Advanced customization & white-label",
      "Full analytics & reporting suite",
      "Priority support + live chat (4hr response)",
      "API access",
      "Team collaboration (unlimited users)",
      "Monthly strategy consultation",
    ],
    limits: {
      projects: -1, // unlimited
      creditsPerMonth: 40,
      analyticsAccess: true,
      builderAccess: true,
      adsAccess: true,
      supportLevel: "24/7",
    },
  },
  // Removed enterprise tier from SaaS - enterprise clients go straight to professional services
};

export function getTierConfig(tier: string) {
  return TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.free;
}

export function canAccessFeature(
  userTier: string,
  feature: keyof typeof TIER_CONFIG.free.limits
) {
  const config = getTierConfig(userTier);
  return config.limits[feature];
}

export function getTierHierarchy() {
  return ["free", "starter", "growth", "pro"];
}

export function isUpgrade(fromTier: string, toTier: string) {
  const hierarchy = getTierHierarchy();
  return hierarchy.indexOf(toTier) > hierarchy.indexOf(fromTier);
}
