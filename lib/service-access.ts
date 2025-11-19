
// Service access configuration for different tiers

export const SERVICE_ACCESS_CONFIG = {
  free: {
    tier: 'free',
    toolsAccess: {
      seoChecker: true,
      auditTool: false,
      roiCalculator: true,
      budgetPlanner: true,
      conversionAnalyzer: false,
      emailTester: true,
    },
    limits: {
      auditsPerMonth: 1,
      seoChecksPerMonth: 3,
      projectsLimit: 1,
      aiMessagesPerDay: 5,
      storageGB: 0.5,
    },
    features: {
      prioritySupport: false,
      customReporting: false,
      apiAccess: false,
      whiteLabel: false,
      dedicatedManager: false,
    },
  },
  starter: {
    tier: 'starter',
    toolsAccess: {
      seoChecker: true,
      auditTool: true,
      roiCalculator: true,
      budgetPlanner: true,
      conversionAnalyzer: true,
      emailTester: true,
    },
    limits: {
      auditsPerMonth: 5,
      seoChecksPerMonth: 20,
      projectsLimit: 3,
      aiMessagesPerDay: 25,
      storageGB: 5,
    },
    features: {
      prioritySupport: false,
      customReporting: false,
      apiAccess: false,
      whiteLabel: false,
      dedicatedManager: false,
    },
  },
  growth: {
    tier: 'growth',
    toolsAccess: {
      seoChecker: true,
      auditTool: true,
      roiCalculator: true,
      budgetPlanner: true,
      conversionAnalyzer: true,
      emailTester: true,
    },
    limits: {
      auditsPerMonth: 15,
      seoChecksPerMonth: 100,
      projectsLimit: 10,
      aiMessagesPerDay: 100,
      storageGB: 25,
    },
    features: {
      prioritySupport: true,
      customReporting: true,
      apiAccess: false,
      whiteLabel: false,
      dedicatedManager: false,
    },
  },
  pro: {
    tier: 'pro',
    toolsAccess: {
      seoChecker: true,
      auditTool: true,
      roiCalculator: true,
      budgetPlanner: true,
      conversionAnalyzer: true,
      emailTester: true,
    },
    limits: {
      auditsPerMonth: 50,
      seoChecksPerMonth: 500,
      projectsLimit: 50,
      aiMessagesPerDay: 500,
      storageGB: 100,
    },
    features: {
      prioritySupport: true,
      customReporting: true,
      apiAccess: true,
      whiteLabel: true,
      dedicatedManager: false,
    },
  },
  enterprise: {
    tier: 'enterprise',
    toolsAccess: {
      seoChecker: true,
      auditTool: true,
      roiCalculator: true,
      budgetPlanner: true,
      conversionAnalyzer: true,
      emailTester: true,
    },
    limits: {
      auditsPerMonth: 999,
      seoChecksPerMonth: 9999,
      projectsLimit: 999,
      aiMessagesPerDay: 9999,
      storageGB: 1000,
    },
    features: {
      prioritySupport: true,
      customReporting: true,
      apiAccess: true,
      whiteLabel: true,
      dedicatedManager: true,
    },
  },
};

export function getServiceAccess(tier: string) {
  return SERVICE_ACCESS_CONFIG[tier as keyof typeof SERVICE_ACCESS_CONFIG] || SERVICE_ACCESS_CONFIG.free;
}

export function checkToolAccess(tier: string, toolName: string): boolean {
  const access = getServiceAccess(tier);
  return access.toolsAccess[toolName as keyof typeof access.toolsAccess] || false;
}

export function checkUsageLimit(
  tier: string,
  limitType: string,
  currentUsage: number
): { allowed: boolean; limit: number; remaining: number } {
  const access = getServiceAccess(tier);
  const limit = access.limits[limitType as keyof typeof access.limits] || 0;
  
  return {
    allowed: currentUsage < limit,
    limit,
    remaining: Math.max(0, limit - currentUsage),
  };
}
