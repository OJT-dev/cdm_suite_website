-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "message" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeSessionId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "packageName" TEXT NOT NULL,
    "packagePrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "features" TEXT NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "source" TEXT NOT NULL,
    "interest" TEXT,
    "chatHistory" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assessmentResults" TEXT,
    "assignedToId" TEXT,
    "budget" TEXT,
    "company" TEXT,
    "customFields" TEXT,
    "lastContactedAt" DATETIME,
    "nextFollowUpAt" DATETIME,
    "notes" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'new',
    "tags" TEXT NOT NULL,
    "timeline" TEXT,
    CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lead_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_activities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lead_activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lead_sequences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "steps" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiRecommendedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lead_sequences_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "messages" TEXT NOT NULL,
    "leadCaptured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wpId" INTEGER,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "author" TEXT NOT NULL DEFAULT 'CDM Suite',
    "authorEmail" TEXT,
    "featuredImage" TEXT,
    "categories" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "audioUrl" TEXT,
    "metaDescription" TEXT,
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "structuredData" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "marketing_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "responses" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "recommendations" TEXT NOT NULL,
    "reportSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "marketing_assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive',
    "stripeCustomerId" TEXT,
    "trialEndsAt" DATETIME,
    "subscriptionEndsAt" DATETIME,
    "company" TEXT,
    "phone" TEXT,
    "industry" TEXT,
    "goals" TEXT NOT NULL DEFAULT '[]',
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME,
    "stripeSubscriptionId" TEXT,
    "affiliateCode" TEXT,
    "affiliateCommissionRate" REAL NOT NULL DEFAULT 0.20,
    "affiliateEarnings" REAL NOT NULL DEFAULT 0,
    "credits" INTEGER NOT NULL DEFAULT 1,
    "referredBy" TEXT,
    "dailyMessageCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageDate" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'client'
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "domain" TEXT,
    "description" TEXT,
    "settings" TEXT,
    "aiPrompt" TEXT,
    "template" TEXT,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "launchedAt" DATETIME,
    "auditId" TEXT,
    "businessData" TEXT,
    "customDomain" TEXT,
    "exportUrl" TEXT,
    "pages" TEXT,
    "publishedAt" DATETIME,
    "siteConfig" TEXT,
    "subdomain" TEXT,
    "actualHours" REAL NOT NULL DEFAULT 0,
    "assignedToId" TEXT,
    "dueDate" DATETIME,
    "estimatedHours" REAL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "globalStyles" TEXT,
    "navigationConfig" TEXT,
    CONSTRAINT "projects_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "website_audits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "websiteUrl" TEXT NOT NULL,
    "seoScore" INTEGER NOT NULL DEFAULT 0,
    "performanceScore" INTEGER NOT NULL DEFAULT 0,
    "mobileScore" INTEGER NOT NULL DEFAULT 0,
    "securityScore" INTEGER NOT NULL DEFAULT 0,
    "overallScore" INTEGER NOT NULL DEFAULT 0,
    "issues" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "reportSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "website_audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "referredEmail" TEXT NOT NULL,
    "referredUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "tierPurchased" TEXT,
    "commissionAmount" REAL NOT NULL DEFAULT 0,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assistant_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "messages" TEXT NOT NULL,
    "context" TEXT,
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "assistant_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "business_contexts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessName" TEXT,
    "industry" TEXT,
    "services" TEXT NOT NULL DEFAULT '[]',
    "targetAudience" TEXT,
    "goals" TEXT NOT NULL DEFAULT '[]',
    "brandColors" TEXT NOT NULL DEFAULT '[]',
    "brandVoice" TEXT,
    "keyInsights" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "business_contexts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "clientCompany" TEXT,
    "proposalNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "items" TEXT NOT NULL,
    "subtotal" REAL NOT NULL,
    "tax" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "terms" TEXT,
    "notes" TEXT,
    "dueDate" DATETIME,
    "validUntil" DATETIME,
    "stripePaymentLinkId" TEXT,
    "stripePaymentUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "sentAt" DATETIME,
    "viewedAt" DATETIME,
    "acceptedAt" DATETIME,
    "declinedAt" DATETIME,
    "paidAt" DATETIME,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "proposals_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "employeeRole" TEXT NOT NULL,
    "department" TEXT,
    "capabilities" TEXT NOT NULL,
    "weeklyCapacity" REAL NOT NULL DEFAULT 40,
    "skillSet" TEXT NOT NULL DEFAULT '[]',
    "projectsCompleted" INTEGER NOT NULL DEFAULT 0,
    "avgProjectRating" REAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "hireDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "availableForWork" BOOLEAN NOT NULL DEFAULT true,
    "avgTaskCompletionTime" REAL,
    "currentProjectCount" INTEGER NOT NULL DEFAULT 0,
    "currentWorkload" REAL NOT NULL DEFAULT 0,
    "expertiseLevel" TEXT NOT NULL DEFAULT 'intermediate',
    "maxConcurrentProjects" INTEGER NOT NULL DEFAULT 5,
    "onTimeDeliveryRate" REAL,
    CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "estimatedHours" REAL,
    "actualHours" REAL NOT NULL DEFAULT 0,
    "assignedToId" TEXT,
    "dependsOn" TEXT NOT NULL DEFAULT '[]',
    "completedAt" DATETIME,
    "dueDate" DATETIME,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiContext" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "cloudStoragePath" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "aiDescription" TEXT,
    "aiTags" TEXT NOT NULL DEFAULT '[]',
    "visibleToClient" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_files_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "time_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT,
    "hours" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "hourlyRate" REAL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "time_logs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "time_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sequences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiPrompt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "successRate" REAL,
    "activatedAt" DATETIME,
    "deactivatedAt" DATETIME,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sequences_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sequence_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sequenceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "stepType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "subject" TEXT,
    "delayAmount" INTEGER NOT NULL DEFAULT 0,
    "delayUnit" TEXT NOT NULL DEFAULT 'hours',
    "delayFrom" TEXT NOT NULL DEFAULT 'previous',
    "conditions" TEXT,
    "aiSuggested" BOOLEAN NOT NULL DEFAULT false,
    "aiReasoning" TEXT,
    "mergeTags" TEXT NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sequence_steps_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "sequences" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sequence_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sequenceId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "pausedAt" DATETIME,
    "stepsCompleted" INTEGER NOT NULL DEFAULT 0,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsOpened" INTEGER NOT NULL DEFAULT 0,
    "emailsClicked" INTEGER NOT NULL DEFAULT 0,
    "emailsReplied" INTEGER NOT NULL DEFAULT 0,
    "tasksCreated" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" DATETIME,
    "conversionType" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sequence_assignments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sequence_assignments_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "sequences" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sequence_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assignmentId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "result" TEXT,
    "messageId" TEXT,
    "emailSubject" TEXT,
    "openedAt" DATETIME,
    "clickedAt" DATETIME,
    "repliedAt" DATETIME,
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sequence_activities_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "sequence_assignments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "projectId" TEXT,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "attachments" TEXT NOT NULL DEFAULT '[]',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "important" BOOLEAN NOT NULL DEFAULT false,
    "aiSuggested" BOOLEAN NOT NULL DEFAULT false,
    "aiContext" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "messages_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "context" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "suggestionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "suggestedAction" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "rejectedReason" TEXT,
    "executedAt" DATETIME,
    "executionResult" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ai_recommendations_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workflow_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serviceType" TEXT NOT NULL,
    "serviceTier" TEXT,
    "estimatedDuration" INTEGER,
    "estimatedHours" REAL,
    "tasksTemplate" TEXT NOT NULL,
    "milestones" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "stripeSessionId" TEXT,
    "serviceName" TEXT NOT NULL,
    "serviceTier" TEXT,
    "serviceAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME,
    "expectedCompletionDate" DATETIME,
    "completedAt" DATETIME,
    "primaryAssigneeId" TEXT,
    "teamAssigned" BOOLEAN NOT NULL DEFAULT false,
    "clientNotes" TEXT,
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "workflow_instances_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "workflow_templates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workflow_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "assignedToId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "estimatedHours" REAL,
    "actualHours" REAL NOT NULL DEFAULT 0,
    "requiredSkills" TEXT NOT NULL DEFAULT '[]',
    "dependencies" TEXT NOT NULL DEFAULT '[]',
    "deliverables" TEXT,
    "completedWork" TEXT,
    "dueDate" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "visibleToClient" BOOLEAN NOT NULL DEFAULT false,
    "blockedReason" TEXT,
    "blockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "workflow_tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "workflow_tasks_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "team_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "allocatedHours" REAL,
    "actualHours" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "team_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_assignments_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow_instances" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "service_access" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "toolsAccess" TEXT NOT NULL,
    "limits" TEXT NOT NULL,
    "usageThisMonth" TEXT NOT NULL,
    "lastResetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "features" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tool_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "email" TEXT,
    "toolName" TEXT NOT NULL,
    "inputData" TEXT,
    "results" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "leadCaptured" BOOLEAN NOT NULL DEFAULT false,
    "leadId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "custom_pages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "settings" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT NOT NULL DEFAULT '[]',
    "ogImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "views" INTEGER NOT NULL DEFAULT 0,
    "requiresAuth" BOOLEAN NOT NULL DEFAULT false,
    "allowedRoles" TEXT NOT NULL DEFAULT '[]',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "parentPageId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL,
    "lastEditedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "page_revisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "settings" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "revisionNumber" INTEGER NOT NULL,
    "comment" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "page_revisions_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "custom_pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscription_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "projectsCreated" INTEGER NOT NULL DEFAULT 0,
    "auditsPerformed" INTEGER NOT NULL DEFAULT 0,
    "seoChecksPerformed" INTEGER NOT NULL DEFAULT 0,
    "aiMessagesUsed" INTEGER NOT NULL DEFAULT 0,
    "storageUsedMB" REAL NOT NULL DEFAULT 0,
    "additionalServices" TEXT,
    "baseAmount" REAL NOT NULL,
    "usageAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "billed" BOOLEAN NOT NULL DEFAULT false,
    "billedAt" DATETIME,
    "stripeInvoiceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "payment_recovery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "amountDue" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "failureReason" TEXT,
    "failureCode" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "lastEmailSentAt" DATETIME,
    "nextRetryAt" DATETIME,
    "recoveredAt" DATETIME,
    "cancelledAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "case_studies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "challenge" TEXT,
    "solution" TEXT,
    "results" JSONB,
    "testimonialQuote" TEXT,
    "testimonialAuthor" TEXT,
    "testimonialCompany" TEXT,
    "heroImage" TEXT NOT NULL,
    "additionalImages" JSONB,
    "tags" JSONB NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "folder" TEXT,
    "tags" JSONB,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "uploadedBy" TEXT NOT NULL,
    "uploadedByName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pagePath" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastEditedBy" TEXT NOT NULL,
    "lastEditedByName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_agents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "avatar" TEXT,
    "personality" TEXT NOT NULL DEFAULT 'professional',
    "tone" TEXT NOT NULL DEFAULT 'helpful',
    "systemPrompt" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "industry" TEXT,
    "trainingStatus" TEXT NOT NULL DEFAULT 'untrained',
    "knowledgeBase" TEXT,
    "canBookAppointments" BOOLEAN NOT NULL DEFAULT false,
    "canQualifyLeads" BOOLEAN NOT NULL DEFAULT false,
    "canSendEmails" BOOLEAN NOT NULL DEFAULT false,
    "canAccessCRM" BOOLEAN NOT NULL DEFAULT false,
    "canProcessPayments" BOOLEAN NOT NULL DEFAULT false,
    "customCapabilities" TEXT,
    "widgetColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "widgetPosition" TEXT NOT NULL DEFAULT 'bottom-right',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Hi! How can I help you today?',
    "placeholderText" TEXT NOT NULL DEFAULT 'Type your message...',
    "integrations" TEXT,
    "apiKeys" TEXT,
    "workflows" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "deploymentUrl" TEXT,
    "embedCode" TEXT,
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "totalLeadsCaptured" INTEGER NOT NULL DEFAULT 0,
    "totalAppointments" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" REAL,
    "satisfactionRating" REAL,
    "pricing" TEXT,
    "stripeProductId" TEXT,
    "galleryTitle" TEXT,
    "galleryDescription" TEXT,
    "galleryThumbnail" TEXT,
    "galleryCategory" TEXT,
    "galleryTags" TEXT NOT NULL DEFAULT '[]',
    "galleryOrder" INTEGER NOT NULL DEFAULT 0,
    "galleryViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "agent_knowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "processedContent" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "cloudStoragePath" TEXT,
    "websiteUrl" TEXT,
    "crawlDepth" INTEGER,
    "lastCrawledAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "embeddingModel" TEXT,
    "vectorCount" INTEGER,
    "timesReferenced" INTEGER NOT NULL DEFAULT 0,
    "lastReferencedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "agent_knowledge_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "ai_agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_integrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "credentials" TEXT,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "lastSyncAt" DATETIME,
    "errorMessage" TEXT,
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "successfulCalls" INTEGER NOT NULL DEFAULT 0,
    "failedCalls" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "agent_integrations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "ai_agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" TEXT NOT NULL,
    "triggerConditions" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastExecutedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "agent_workflows_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "ai_agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT,
    "userId" TEXT,
    "messages" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "leadCaptured" BOOLEAN NOT NULL DEFAULT false,
    "leadData" TEXT,
    "leadQuality" TEXT,
    "appointmentBooked" BOOLEAN NOT NULL DEFAULT false,
    "appointmentData" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailData" TEXT,
    "crmSynced" BOOLEAN NOT NULL DEFAULT false,
    "crmLeadId" TEXT,
    "duration" INTEGER,
    "responseTime" REAL,
    "satisfactionScore" INTEGER,
    "feedback" TEXT,
    "source" TEXT,
    "referrer" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "agent_conversations_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "ai_agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "period" TEXT NOT NULL,
    "conversations" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "avgConversationLength" REAL NOT NULL DEFAULT 0,
    "avgResponseTime" REAL NOT NULL DEFAULT 0,
    "leadsCaptured" INTEGER NOT NULL DEFAULT 0,
    "appointmentsBooked" INTEGER NOT NULL DEFAULT 0,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "crmSynced" INTEGER NOT NULL DEFAULT 0,
    "leadConversionRate" REAL NOT NULL DEFAULT 0,
    "avgSatisfactionScore" REAL NOT NULL DEFAULT 0,
    "positiveRatings" INTEGER NOT NULL DEFAULT 0,
    "negativeRatings" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "avgMessagesPerConvo" REAL NOT NULL DEFAULT 0,
    "bounceRate" REAL NOT NULL DEFAULT 0,
    "integrationCalls" INTEGER NOT NULL DEFAULT 0,
    "successfulCalls" INTEGER NOT NULL DEFAULT 0,
    "failedCalls" INTEGER NOT NULL DEFAULT 0,
    "workflowsTriggered" INTEGER NOT NULL DEFAULT 0,
    "workflowsCompleted" INTEGER NOT NULL DEFAULT 0,
    "workflowsFailed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "agent_analytics_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "ai_agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "website_gallery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "clientName" TEXT,
    "industry" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "highlightedFeatures" TEXT NOT NULL DEFAULT '[]',
    "metricsImprovement" TEXT,
    "liveUrl" TEXT,
    "demoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "project_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "versionLabel" TEXT,
    "pages" TEXT NOT NULL,
    "siteConfig" TEXT NOT NULL,
    "navigationConfig" TEXT,
    "globalStyles" TEXT,
    "changeType" TEXT,
    "changesSummary" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "project_collaborators" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canPublish" BOOLEAN NOT NULL DEFAULT false,
    "canInviteOthers" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "invitedBy" TEXT NOT NULL,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "acceptedAt" DATETIME,
    "revokedAt" DATETIME,
    "lastViewedAt" DATETIME,
    "lastEditedAt" DATETIME,
    "editCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ab_tests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pageSlug" TEXT NOT NULL,
    "variantA" TEXT NOT NULL,
    "variantB" TEXT NOT NULL,
    "trafficSplit" INTEGER NOT NULL DEFAULT 50,
    "goalType" TEXT NOT NULL,
    "goalSelector" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "variantAViews" INTEGER NOT NULL DEFAULT 0,
    "variantBViews" INTEGER NOT NULL DEFAULT 0,
    "variantAConversions" INTEGER NOT NULL DEFAULT 0,
    "variantBConversions" INTEGER NOT NULL DEFAULT 0,
    "variantAConversionRate" REAL NOT NULL DEFAULT 0,
    "variantBConversionRate" REAL NOT NULL DEFAULT 0,
    "confidence" REAL,
    "winner" TEXT,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "duration" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "price" REAL NOT NULL,
    "compareAtPrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "sku" TEXT,
    "trackInventory" BOOLEAN NOT NULL DEFAULT false,
    "inventoryCount" INTEGER NOT NULL DEFAULT 0,
    "allowBackorder" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT NOT NULL DEFAULT '[]',
    "featuredImage" TEXT,
    "category" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "requiresShipping" BOOLEAN NOT NULL DEFAULT true,
    "weight" REAL,
    "dimensions" TEXT,
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    "variants" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "views" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ecommerce_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "shippingAddress" TEXT NOT NULL,
    "billingAddress" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "subtotal" REAL NOT NULL,
    "shippingCost" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "stripePaymentIntentId" TEXT,
    "fulfillmentStatus" TEXT NOT NULL DEFAULT 'unfulfilled',
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    "customerNotes" TEXT,
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "billingPeriod" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "protectedPages" TEXT NOT NULL DEFAULT '[]',
    "features" TEXT NOT NULL DEFAULT '[]',
    "maxMembers" INTEGER,
    "currentMembers" INTEGER NOT NULL DEFAULT 0,
    "stripePriceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "membership_subscribers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membershipId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT,
    "stripeSubscriptionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "accessToken" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "subscribedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "membership_subscribers_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "memberships" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "custom_code" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "htmlCode" TEXT,
    "cssCode" TEXT,
    "jsCode" TEXT,
    "injectionPoint" TEXT NOT NULL,
    "targetPages" TEXT NOT NULL DEFAULT '[]',
    "loadCondition" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "loadOrder" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bid_proposals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposalId" TEXT,
    "bidSource" TEXT NOT NULL DEFAULT 'bidnetdirect',
    "solicitationNumber" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "bidUrl" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "issuingOrg" TEXT,
    "solicitationType" TEXT,
    "location" TEXT,
    "publicationDate" DATETIME,
    "bidIntentDeadline" DATETIME,
    "questionDeadline" DATETIME,
    "closingDate" DATETIME,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "bidDocuments" TEXT,
    "envelope1Status" TEXT NOT NULL DEFAULT 'draft',
    "envelope1Content" TEXT,
    "envelope1Documents" TEXT,
    "envelope1Notes" TEXT,
    "envelope1GeneratedAt" DATETIME,
    "envelope1GenerationPrompt" TEXT,
    "envelope2Status" TEXT NOT NULL DEFAULT 'draft',
    "envelope2Content" TEXT,
    "envelope2Pricing" TEXT,
    "envelope2Documents" TEXT,
    "envelope2Notes" TEXT,
    "envelope2GeneratedAt" DATETIME,
    "envelope2GenerationPrompt" TEXT,
    "submissionStatus" TEXT NOT NULL DEFAULT 'not_submitted',
    "envelope1SubmittedAt" DATETIME,
    "envelope2SubmittedAt" DATETIME,
    "fullySubmittedAt" DATETIME,
    "baseEmailProposal" TEXT,
    "selectedServices" TEXT,
    "aiModel" TEXT,
    "generationMetadata" TEXT,
    "createdById" TEXT NOT NULL,
    "lastEditedById" TEXT,
    "lastEditedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "preliminaryEmail" TEXT,
    "nextSteps" TEXT,
    "priceSource" TEXT,
    "pricingNotes" TEXT,
    "proposedPrice" REAL,
    "suggestedFollowUp" TEXT,
    "workflowStage" TEXT NOT NULL DEFAULT 'initial',
    "competitiveIntelligence" TEXT,
    "intelligenceGeneratedAt" DATETIME,
    "outreachRecommendations" TEXT,
    "riskAssessment" TEXT,
    "winProbabilityFactors" TEXT,
    "winProbabilityScore" REAL,
    "adoptedBudgetAnalyzedAt" DATETIME,
    "adoptedBudgetData" TEXT,
    "processingCompletedAt" DATETIME,
    "processingError" TEXT,
    "processingMessage" TEXT,
    "processingProgress" INTEGER NOT NULL DEFAULT 0,
    "processingStage" TEXT,
    "processingStartedAt" DATETIME,
    "processingStatus" TEXT NOT NULL DEFAULT 'idle',
    "generalProposalComment" TEXT,
    "hubPlanRequired" BOOLEAN NOT NULL DEFAULT false,
    "hubFeeThreshold" REAL,
    "hubIntentWaiverGenerated" BOOLEAN NOT NULL DEFAULT false,
    "hubIntentWaiverContent" TEXT,
    "businessListings" TEXT,
    "businessVerificationStatus" TEXT NOT NULL DEFAULT 'not_verified',
    "proposalTitle" TEXT,
    "coverPageContent" TEXT,
    "businessVerificationResults" TEXT,
    "businessVerificationNote" TEXT
);

-- CreateTable
CREATE TABLE "proposal_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "technicalContent" TEXT,
    "costContent" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bid_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bidProposalId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "generatedAt" DATETIME,
    "errorMessage" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bid_attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bidProposalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "cloudStoragePath" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bid_attachments_bidProposalId_fkey" FOREIGN KEY ("bidProposalId") REFERENCES "bid_proposals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bid_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bidProposalId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bid_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bidProposalId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "changeType" TEXT NOT NULL,
    "changeDescription" TEXT,
    "envelope1Content" TEXT,
    "envelope2Content" TEXT,
    "envelope1Status" TEXT,
    "envelope2Status" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "settingKey" TEXT NOT NULL,
    "settingValue" TEXT NOT NULL,
    "description" TEXT,
    "updatedById" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_stripeSessionId_key" ON "orders"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_assignedToId_idx" ON "leads"("assignedToId");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "lead_activities_leadId_idx" ON "lead_activities"("leadId");

-- CreateIndex
CREATE INDEX "lead_activities_createdAt_idx" ON "lead_activities"("createdAt");

-- CreateIndex
CREATE INDEX "lead_sequences_leadId_idx" ON "lead_sequences"("leadId");

-- CreateIndex
CREATE INDEX "lead_sequences_status_idx" ON "lead_sequences"("status");

-- CreateIndex
CREATE UNIQUE INDEX "chat_conversations_sessionId_key" ON "chat_conversations"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_wpId_key" ON "blog_posts"("wpId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_status_publishedAt_idx" ON "blog_posts"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_views_idx" ON "blog_posts"("views");

-- CreateIndex
CREATE INDEX "marketing_assessments_email_idx" ON "marketing_assessments"("email");

-- CreateIndex
CREATE INDEX "marketing_assessments_createdAt_idx" ON "marketing_assessments"("createdAt");

-- CreateIndex
CREATE INDEX "marketing_assessments_userId_idx" ON "marketing_assessments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeSubscriptionId_key" ON "users"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "users_affiliateCode_key" ON "users"("affiliateCode");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tier_idx" ON "users"("tier");

-- CreateIndex
CREATE INDEX "users_subscriptionStatus_idx" ON "users"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "users_affiliateCode_idx" ON "users"("affiliateCode");

-- CreateIndex
CREATE INDEX "users_referredBy_idx" ON "users"("referredBy");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "projects_customDomain_key" ON "projects"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "projects_subdomain_key" ON "projects"("subdomain");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_type_idx" ON "projects"("type");

-- CreateIndex
CREATE INDEX "projects_subdomain_idx" ON "projects"("subdomain");

-- CreateIndex
CREATE INDEX "projects_customDomain_idx" ON "projects"("customDomain");

-- CreateIndex
CREATE INDEX "projects_assignedToId_idx" ON "projects"("assignedToId");

-- CreateIndex
CREATE INDEX "projects_priority_idx" ON "projects"("priority");

-- CreateIndex
CREATE INDEX "projects_dueDate_idx" ON "projects"("dueDate");

-- CreateIndex
CREATE INDEX "website_audits_email_idx" ON "website_audits"("email");

-- CreateIndex
CREATE INDEX "website_audits_userId_idx" ON "website_audits"("userId");

-- CreateIndex
CREATE INDEX "website_audits_createdAt_idx" ON "website_audits"("createdAt");

-- CreateIndex
CREATE INDEX "referrals_referrerId_idx" ON "referrals"("referrerId");

-- CreateIndex
CREATE INDEX "referrals_referredEmail_idx" ON "referrals"("referredEmail");

-- CreateIndex
CREATE INDEX "referrals_referredUserId_idx" ON "referrals"("referredUserId");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "referrals_createdAt_idx" ON "referrals"("createdAt");

-- CreateIndex
CREATE INDEX "assistant_conversations_userId_idx" ON "assistant_conversations"("userId");

-- CreateIndex
CREATE INDEX "assistant_conversations_lastMessageAt_idx" ON "assistant_conversations"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "business_contexts_userId_key" ON "business_contexts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_proposalNumber_key" ON "proposals"("proposalNumber");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_stripePaymentLinkId_key" ON "proposals"("stripePaymentLinkId");

-- CreateIndex
CREATE INDEX "proposals_leadId_idx" ON "proposals"("leadId");

-- CreateIndex
CREATE INDEX "proposals_clientEmail_idx" ON "proposals"("clientEmail");

-- CreateIndex
CREATE INDEX "proposals_status_idx" ON "proposals"("status");

-- CreateIndex
CREATE INDEX "proposals_proposalNumber_idx" ON "proposals"("proposalNumber");

-- CreateIndex
CREATE INDEX "proposals_createdById_idx" ON "proposals"("createdById");

-- CreateIndex
CREATE INDEX "proposals_dueDate_idx" ON "proposals"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE INDEX "employees_userId_idx" ON "employees"("userId");

-- CreateIndex
CREATE INDEX "employees_employeeRole_idx" ON "employees"("employeeRole");

-- CreateIndex
CREATE INDEX "employees_department_idx" ON "employees"("department");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "employees_availableForWork_idx" ON "employees"("availableForWork");

-- CreateIndex
CREATE INDEX "project_tasks_projectId_idx" ON "project_tasks"("projectId");

-- CreateIndex
CREATE INDEX "project_tasks_status_idx" ON "project_tasks"("status");

-- CreateIndex
CREATE INDEX "project_tasks_assignedToId_idx" ON "project_tasks"("assignedToId");

-- CreateIndex
CREATE INDEX "project_tasks_priority_idx" ON "project_tasks"("priority");

-- CreateIndex
CREATE INDEX "project_tasks_dueDate_idx" ON "project_tasks"("dueDate");

-- CreateIndex
CREATE INDEX "project_files_projectId_idx" ON "project_files"("projectId");

-- CreateIndex
CREATE INDEX "project_files_uploadedById_idx" ON "project_files"("uploadedById");

-- CreateIndex
CREATE INDEX "project_files_fileType_idx" ON "project_files"("fileType");

-- CreateIndex
CREATE INDEX "project_files_category_idx" ON "project_files"("category");

-- CreateIndex
CREATE INDEX "project_files_status_idx" ON "project_files"("status");

-- CreateIndex
CREATE INDEX "project_files_createdAt_idx" ON "project_files"("createdAt");

-- CreateIndex
CREATE INDEX "time_logs_employeeId_idx" ON "time_logs"("employeeId");

-- CreateIndex
CREATE INDEX "time_logs_projectId_idx" ON "time_logs"("projectId");

-- CreateIndex
CREATE INDEX "time_logs_date_idx" ON "time_logs"("date");

-- CreateIndex
CREATE INDEX "time_logs_approved_idx" ON "time_logs"("approved");

-- CreateIndex
CREATE INDEX "sequences_status_idx" ON "sequences"("status");

-- CreateIndex
CREATE INDEX "sequences_type_idx" ON "sequences"("type");

-- CreateIndex
CREATE INDEX "sequences_targetAudience_idx" ON "sequences"("targetAudience");

-- CreateIndex
CREATE INDEX "sequences_aiGenerated_idx" ON "sequences"("aiGenerated");

-- CreateIndex
CREATE INDEX "sequences_approvedById_idx" ON "sequences"("approvedById");

-- CreateIndex
CREATE INDEX "sequence_steps_sequenceId_idx" ON "sequence_steps"("sequenceId");

-- CreateIndex
CREATE INDEX "sequence_steps_order_idx" ON "sequence_steps"("order");

-- CreateIndex
CREATE INDEX "sequence_steps_stepType_idx" ON "sequence_steps"("stepType");

-- CreateIndex
CREATE INDEX "sequence_assignments_sequenceId_idx" ON "sequence_assignments"("sequenceId");

-- CreateIndex
CREATE INDEX "sequence_assignments_leadId_idx" ON "sequence_assignments"("leadId");

-- CreateIndex
CREATE INDEX "sequence_assignments_status_idx" ON "sequence_assignments"("status");

-- CreateIndex
CREATE INDEX "sequence_assignments_assignedBy_idx" ON "sequence_assignments"("assignedBy");

-- CreateIndex
CREATE INDEX "sequence_assignments_startedAt_idx" ON "sequence_assignments"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sequence_assignments_sequenceId_leadId_key" ON "sequence_assignments"("sequenceId", "leadId");

-- CreateIndex
CREATE INDEX "sequence_activities_assignmentId_idx" ON "sequence_activities"("assignmentId");

-- CreateIndex
CREATE INDEX "sequence_activities_actionType_idx" ON "sequence_activities"("actionType");

-- CreateIndex
CREATE INDEX "sequence_activities_timestamp_idx" ON "sequence_activities"("timestamp");

-- CreateIndex
CREATE INDEX "messages_threadId_idx" ON "messages"("threadId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_receiverId_idx" ON "messages"("receiverId");

-- CreateIndex
CREATE INDEX "messages_projectId_idx" ON "messages"("projectId");

-- CreateIndex
CREATE INDEX "messages_read_idx" ON "messages"("read");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE INDEX "ai_recommendations_context_idx" ON "ai_recommendations"("context");

-- CreateIndex
CREATE INDEX "ai_recommendations_entityType_idx" ON "ai_recommendations"("entityType");

-- CreateIndex
CREATE INDEX "ai_recommendations_entityId_idx" ON "ai_recommendations"("entityId");

-- CreateIndex
CREATE INDEX "ai_recommendations_status_idx" ON "ai_recommendations"("status");

-- CreateIndex
CREATE INDEX "ai_recommendations_priority_idx" ON "ai_recommendations"("priority");

-- CreateIndex
CREATE INDEX "ai_recommendations_approvedById_idx" ON "ai_recommendations"("approvedById");

-- CreateIndex
CREATE INDEX "ai_recommendations_createdAt_idx" ON "ai_recommendations"("createdAt");

-- CreateIndex
CREATE INDEX "ai_recommendations_expiresAt_idx" ON "ai_recommendations"("expiresAt");

-- CreateIndex
CREATE INDEX "workflow_templates_serviceType_idx" ON "workflow_templates"("serviceType");

-- CreateIndex
CREATE INDEX "workflow_templates_serviceTier_idx" ON "workflow_templates"("serviceTier");

-- CreateIndex
CREATE INDEX "workflow_templates_active_idx" ON "workflow_templates"("active");

-- CreateIndex
CREATE INDEX "workflow_instances_templateId_idx" ON "workflow_instances"("templateId");

-- CreateIndex
CREATE INDEX "workflow_instances_userId_idx" ON "workflow_instances"("userId");

-- CreateIndex
CREATE INDEX "workflow_instances_status_idx" ON "workflow_instances"("status");

-- CreateIndex
CREATE INDEX "workflow_instances_orderId_idx" ON "workflow_instances"("orderId");

-- CreateIndex
CREATE INDEX "workflow_instances_stripeSessionId_idx" ON "workflow_instances"("stripeSessionId");

-- CreateIndex
CREATE INDEX "workflow_tasks_workflowId_idx" ON "workflow_tasks"("workflowId");

-- CreateIndex
CREATE INDEX "workflow_tasks_assignedToId_idx" ON "workflow_tasks"("assignedToId");

-- CreateIndex
CREATE INDEX "workflow_tasks_status_idx" ON "workflow_tasks"("status");

-- CreateIndex
CREATE INDEX "workflow_tasks_dueDate_idx" ON "workflow_tasks"("dueDate");

-- CreateIndex
CREATE INDEX "team_assignments_workflowId_idx" ON "team_assignments"("workflowId");

-- CreateIndex
CREATE INDEX "team_assignments_employeeId_idx" ON "team_assignments"("employeeId");

-- CreateIndex
CREATE INDEX "team_assignments_status_idx" ON "team_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "team_assignments_workflowId_employeeId_key" ON "team_assignments"("workflowId", "employeeId");

-- CreateIndex
CREATE INDEX "service_access_userId_idx" ON "service_access"("userId");

-- CreateIndex
CREATE INDEX "service_access_tier_idx" ON "service_access"("tier");

-- CreateIndex
CREATE INDEX "tool_usage_userId_idx" ON "tool_usage"("userId");

-- CreateIndex
CREATE INDEX "tool_usage_email_idx" ON "tool_usage"("email");

-- CreateIndex
CREATE INDEX "tool_usage_toolName_idx" ON "tool_usage"("toolName");

-- CreateIndex
CREATE INDEX "tool_usage_createdAt_idx" ON "tool_usage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "custom_pages_slug_key" ON "custom_pages"("slug");

-- CreateIndex
CREATE INDEX "custom_pages_slug_idx" ON "custom_pages"("slug");

-- CreateIndex
CREATE INDEX "custom_pages_status_idx" ON "custom_pages"("status");

-- CreateIndex
CREATE INDEX "custom_pages_publishedAt_idx" ON "custom_pages"("publishedAt");

-- CreateIndex
CREATE INDEX "custom_pages_createdById_idx" ON "custom_pages"("createdById");

-- CreateIndex
CREATE INDEX "custom_pages_isTemplate_idx" ON "custom_pages"("isTemplate");

-- CreateIndex
CREATE INDEX "page_revisions_pageId_idx" ON "page_revisions"("pageId");

-- CreateIndex
CREATE INDEX "page_revisions_createdAt_idx" ON "page_revisions"("createdAt");

-- CreateIndex
CREATE INDEX "subscription_usage_subscriptionId_idx" ON "subscription_usage"("subscriptionId");

-- CreateIndex
CREATE INDEX "subscription_usage_periodStart_idx" ON "subscription_usage"("periodStart");

-- CreateIndex
CREATE INDEX "subscription_usage_billed_idx" ON "subscription_usage"("billed");

-- CreateIndex
CREATE INDEX "payment_recovery_userId_idx" ON "payment_recovery"("userId");

-- CreateIndex
CREATE INDEX "payment_recovery_subscriptionId_idx" ON "payment_recovery"("subscriptionId");

-- CreateIndex
CREATE INDEX "payment_recovery_status_idx" ON "payment_recovery"("status");

-- CreateIndex
CREATE INDEX "payment_recovery_nextRetryAt_idx" ON "payment_recovery"("nextRetryAt");

-- CreateIndex
CREATE UNIQUE INDEX "case_studies_slug_key" ON "case_studies"("slug");

-- CreateIndex
CREATE INDEX "case_studies_slug_idx" ON "case_studies"("slug");

-- CreateIndex
CREATE INDEX "case_studies_status_idx" ON "case_studies"("status");

-- CreateIndex
CREATE INDEX "case_studies_category_idx" ON "case_studies"("category");

-- CreateIndex
CREATE INDEX "media_assets_fileName_idx" ON "media_assets"("fileName");

-- CreateIndex
CREATE INDEX "media_assets_folder_idx" ON "media_assets"("folder");

-- CreateIndex
CREATE INDEX "media_assets_uploadedBy_idx" ON "media_assets"("uploadedBy");

-- CreateIndex
CREATE INDEX "page_sections_pagePath_idx" ON "page_sections"("pagePath");

-- CreateIndex
CREATE UNIQUE INDEX "page_sections_pagePath_sectionKey_key" ON "page_sections"("pagePath", "sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "ai_agents_slug_key" ON "ai_agents"("slug");

-- CreateIndex
CREATE INDEX "ai_agents_userId_idx" ON "ai_agents"("userId");

-- CreateIndex
CREATE INDEX "ai_agents_slug_idx" ON "ai_agents"("slug");

-- CreateIndex
CREATE INDEX "ai_agents_status_idx" ON "ai_agents"("status");

-- CreateIndex
CREATE INDEX "ai_agents_agentType_idx" ON "ai_agents"("agentType");

-- CreateIndex
CREATE INDEX "ai_agents_isPublic_idx" ON "ai_agents"("isPublic");

-- CreateIndex
CREATE INDEX "agent_knowledge_agentId_idx" ON "agent_knowledge"("agentId");

-- CreateIndex
CREATE INDEX "agent_knowledge_status_idx" ON "agent_knowledge"("status");

-- CreateIndex
CREATE INDEX "agent_knowledge_sourceType_idx" ON "agent_knowledge"("sourceType");

-- CreateIndex
CREATE INDEX "agent_integrations_agentId_idx" ON "agent_integrations"("agentId");

-- CreateIndex
CREATE INDEX "agent_integrations_serviceType_idx" ON "agent_integrations"("serviceType");

-- CreateIndex
CREATE INDEX "agent_integrations_status_idx" ON "agent_integrations"("status");

-- CreateIndex
CREATE INDEX "agent_workflows_agentId_idx" ON "agent_workflows"("agentId");

-- CreateIndex
CREATE INDEX "agent_workflows_status_idx" ON "agent_workflows"("status");

-- CreateIndex
CREATE INDEX "agent_workflows_priority_idx" ON "agent_workflows"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "agent_conversations_sessionId_key" ON "agent_conversations"("sessionId");

-- CreateIndex
CREATE INDEX "agent_conversations_agentId_idx" ON "agent_conversations"("agentId");

-- CreateIndex
CREATE INDEX "agent_conversations_sessionId_idx" ON "agent_conversations"("sessionId");

-- CreateIndex
CREATE INDEX "agent_conversations_leadCaptured_idx" ON "agent_conversations"("leadCaptured");

-- CreateIndex
CREATE INDEX "agent_conversations_startedAt_idx" ON "agent_conversations"("startedAt");

-- CreateIndex
CREATE INDEX "agent_analytics_agentId_idx" ON "agent_analytics"("agentId");

-- CreateIndex
CREATE INDEX "agent_analytics_date_idx" ON "agent_analytics"("date");

-- CreateIndex
CREATE INDEX "agent_analytics_period_idx" ON "agent_analytics"("period");

-- CreateIndex
CREATE UNIQUE INDEX "agent_analytics_agentId_date_period_key" ON "agent_analytics"("agentId", "date", "period");

-- CreateIndex
CREATE UNIQUE INDEX "website_gallery_projectId_key" ON "website_gallery"("projectId");

-- CreateIndex
CREATE INDEX "website_gallery_category_idx" ON "website_gallery"("category");

-- CreateIndex
CREATE INDEX "website_gallery_status_idx" ON "website_gallery"("status");

-- CreateIndex
CREATE INDEX "website_gallery_isPublic_idx" ON "website_gallery"("isPublic");

-- CreateIndex
CREATE INDEX "website_gallery_isFeatured_idx" ON "website_gallery"("isFeatured");

-- CreateIndex
CREATE INDEX "website_gallery_sortOrder_idx" ON "website_gallery"("sortOrder");

-- CreateIndex
CREATE INDEX "project_versions_projectId_idx" ON "project_versions"("projectId");

-- CreateIndex
CREATE INDEX "project_versions_versionNumber_idx" ON "project_versions"("versionNumber");

-- CreateIndex
CREATE INDEX "project_versions_createdAt_idx" ON "project_versions"("createdAt");

-- CreateIndex
CREATE INDEX "project_collaborators_projectId_idx" ON "project_collaborators"("projectId");

-- CreateIndex
CREATE INDEX "project_collaborators_userId_idx" ON "project_collaborators"("userId");

-- CreateIndex
CREATE INDEX "project_collaborators_status_idx" ON "project_collaborators"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_collaborators_projectId_userId_key" ON "project_collaborators"("projectId", "userId");

-- CreateIndex
CREATE INDEX "ab_tests_projectId_idx" ON "ab_tests"("projectId");

-- CreateIndex
CREATE INDEX "ab_tests_status_idx" ON "ab_tests"("status");

-- CreateIndex
CREATE INDEX "ab_tests_startedAt_idx" ON "ab_tests"("startedAt");

-- CreateIndex
CREATE INDEX "products_projectId_idx" ON "products"("projectId");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE UNIQUE INDEX "products_projectId_slug_key" ON "products"("projectId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ecommerce_orders_orderNumber_key" ON "ecommerce_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "ecommerce_orders_projectId_idx" ON "ecommerce_orders"("projectId");

-- CreateIndex
CREATE INDEX "ecommerce_orders_orderNumber_idx" ON "ecommerce_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "ecommerce_orders_customerEmail_idx" ON "ecommerce_orders"("customerEmail");

-- CreateIndex
CREATE INDEX "ecommerce_orders_paymentStatus_idx" ON "ecommerce_orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "ecommerce_orders_fulfillmentStatus_idx" ON "ecommerce_orders"("fulfillmentStatus");

-- CreateIndex
CREATE INDEX "memberships_projectId_idx" ON "memberships"("projectId");

-- CreateIndex
CREATE INDEX "memberships_status_idx" ON "memberships"("status");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_projectId_slug_key" ON "memberships"("projectId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "membership_subscribers_accessToken_key" ON "membership_subscribers"("accessToken");

-- CreateIndex
CREATE INDEX "membership_subscribers_membershipId_idx" ON "membership_subscribers"("membershipId");

-- CreateIndex
CREATE INDEX "membership_subscribers_email_idx" ON "membership_subscribers"("email");

-- CreateIndex
CREATE INDEX "membership_subscribers_userId_idx" ON "membership_subscribers"("userId");

-- CreateIndex
CREATE INDEX "membership_subscribers_status_idx" ON "membership_subscribers"("status");

-- CreateIndex
CREATE INDEX "custom_code_projectId_idx" ON "custom_code"("projectId");

-- CreateIndex
CREATE INDEX "custom_code_status_idx" ON "custom_code"("status");

-- CreateIndex
CREATE INDEX "custom_code_injectionPoint_idx" ON "custom_code"("injectionPoint");

-- CreateIndex
CREATE UNIQUE INDEX "bid_proposals_proposalId_key" ON "bid_proposals"("proposalId");

-- CreateIndex
CREATE INDEX "bid_proposals_createdById_idx" ON "bid_proposals"("createdById");

-- CreateIndex
CREATE INDEX "bid_proposals_solicitationNumber_idx" ON "bid_proposals"("solicitationNumber");

-- CreateIndex
CREATE INDEX "bid_proposals_submissionStatus_idx" ON "bid_proposals"("submissionStatus");

-- CreateIndex
CREATE INDEX "bid_proposals_closingDate_idx" ON "bid_proposals"("closingDate");

-- CreateIndex
CREATE INDEX "proposal_templates_createdById_idx" ON "proposal_templates"("createdById");

-- CreateIndex
CREATE INDEX "proposal_templates_category_idx" ON "proposal_templates"("category");

-- CreateIndex
CREATE INDEX "proposal_templates_isPublic_idx" ON "proposal_templates"("isPublic");

-- CreateIndex
CREATE INDEX "bid_documents_bidProposalId_idx" ON "bid_documents"("bidProposalId");

-- CreateIndex
CREATE INDEX "bid_documents_documentType_idx" ON "bid_documents"("documentType");

-- CreateIndex
CREATE INDEX "bid_attachments_bidProposalId_idx" ON "bid_attachments"("bidProposalId");

-- CreateIndex
CREATE INDEX "bid_attachments_uploadedById_idx" ON "bid_attachments"("uploadedById");

-- CreateIndex
CREATE INDEX "bid_comments_bidProposalId_idx" ON "bid_comments"("bidProposalId");

-- CreateIndex
CREATE INDEX "bid_comments_createdById_idx" ON "bid_comments"("createdById");

-- CreateIndex
CREATE INDEX "bid_comments_parentCommentId_idx" ON "bid_comments"("parentCommentId");

-- CreateIndex
CREATE INDEX "bid_versions_bidProposalId_idx" ON "bid_versions"("bidProposalId");

-- CreateIndex
CREATE INDEX "bid_versions_createdById_idx" ON "bid_versions"("createdById");

-- CreateIndex
CREATE INDEX "bid_versions_versionNumber_idx" ON "bid_versions"("versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "bid_versions_bidProposalId_versionNumber_key" ON "bid_versions"("bidProposalId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_settingKey_key" ON "system_settings"("settingKey");

-- CreateIndex
CREATE INDEX "system_settings_settingKey_idx" ON "system_settings"("settingKey");

