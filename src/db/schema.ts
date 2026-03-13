import { pgTable, text, timestamp, jsonb, uuid, pgEnum, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const planEnum = pgEnum("plan", ["starter", "professional", "enterprise"]);
export const projectStatusEnum = pgEnum("project_status", ["active", "completed", "on_hold", "archived"]);
export const projectTypeEnum = pgEnum("project_type", ["residential", "commercial", "adu", "mixed_use", "renovation"]);
export const docTypeEnum = pgEnum("doc_type", [
  "permit",
  "inspection_report",
  "certificate",
  "plan",
  "application",
  "approval",
  "notice",
  "correspondence",
  "other"
]);
export const complianceStatusEnum = pgEnum("compliance_status", ["pending", "in_progress", "met", "overdue", "not_applicable"]);
export const alertTypeEnum = pgEnum("alert_type", ["deadline_7_days", "deadline_3_days", "deadline_1_day", "overdue", "document_processed", "compliance_update"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  plan: planEnum("plan").notNull().default("starter"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"), // active, trialing, past_due, canceled, etc.
  subscriptionPeriodEnd: timestamp("subscription_period_end"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  referralCode: text("referral_code").unique(),
  referredBy: uuid("referred_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address"),
  jurisdiction: text("jurisdiction"),
  projectType: projectTypeEnum("project_type").notNull().default("residential"),
  status: projectStatusEnum("status").notNull().default("active"),
  description: text("description"),
  unitCount: integer("unit_count"),
  grossFloorArea: integer("gross_floor_area"), // sq ft — used for Article 80 threshold detection
  articleEightyTrack: text("article_eighty_track"), // "none" | "spr" | "lpr"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  storageUrl: text("storage_url").notNull(),
  docType: docTypeEnum("doc_type"),
  extractedData: jsonb("extracted_data").$type<ExtractedDocumentData>(),
  processingStatus: text("processing_status").notNull().default("pending"), // pending, processing, completed, failed
  processingError: text("processing_error"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Compliance Items table
export const complianceItems = pgTable("compliance_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").references(() => documents.id, { onDelete: "set null" }),
  requirementType: text("requirement_type").notNull(), // e.g., "building_permit", "electrical_inspection", "certificate_of_occupancy"
  description: text("description").notNull(),
  status: complianceStatusEnum("status").notNull().default("pending"),
  deadline: timestamp("deadline"),
  jurisdiction: text("jurisdiction"),
  notes: text("notes"),
  source: text("source"), // "extracted" | "manual" | "rule_based"
  ruleId: text("rule_id"), // Reference to jurisdiction rule that created this
  sourceUrl: text("source_url"),
  sourceText: text("source_text"),
  reasoning: text("reasoning"),
  submittedAt: timestamp("submitted_at"), // CLA-111: when user submitted this to the AHJ
  followUpSnoozedUntil: timestamp("follow_up_snoozed_until"), // CLA-111: snooze follow-up reminders until this date
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Compliance Item Documents junction table (CLA-108: document ↔ requirement linkage)
export const complianceItemDocuments = pgTable("compliance_item_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  complianceItemId: uuid("compliance_item_id").notNull().references(() => complianceItems.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  attachedAt: timestamp("attached_at").notNull().defaultNow(),
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  complianceItemId: uuid("compliance_item_id").references(() => complianceItems.id, { onDelete: "cascade" }),
  alertType: alertTypeEnum("alert_type").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Waitlist table
export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  company: text("company"),
  projectType: text("project_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Jurisdiction Rules table (for compliance engine)
export const jurisdictionRules = pgTable("jurisdiction_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  jurisdictionCode: text("jurisdiction_code").notNull(), // e.g., "MA", "BOSTON_MA", "GENERIC_MULTIFAMILY"
  jurisdictionName: text("jurisdiction_name").notNull(),
  projectTypes: jsonb("project_types").$type<string[]>(), // Which project types this applies to
  rules: jsonb("rules").$type<JurisdictionRule[]>().notNull(),
  source: text("source").default("curated"), // "curated" | "ai_generated"
  cachedAt: timestamp("cached_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Jurisdiction Request Queue — tracks which unknown jurisdictions users have tried
export const jurisdictionRequests = pgTable("jurisdiction_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  jurisdictionCode: text("jurisdiction_code").notNull(),
  jurisdictionName: text("jurisdiction_name").notNull(),
  requestCount: integer("request_count").default(1).notNull(),
  lastRequestedAt: timestamp("last_requested_at").defaultNow(),
  status: text("status").default("pending"), // "pending" | "in_progress" | "completed"
  createdAt: timestamp("created_at").defaultNow(),
});

// User Settings table
export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  emailAlerts: boolean("email_alerts").notNull().default(true),
  alertLeadDays: integer("alert_lead_days").notNull().default(7),
  dailyDigest: boolean("daily_digest").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  projects: many(projects),
  documents: many(documents),
  alerts: many(alerts),
  settings: one(userSettings),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
    relationName: "referrals",
  }),
  referrals: many(users, { relationName: "referrals" }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  documents: many(documents),
  complianceItems: many(complianceItems),
  alerts: many(alerts),
  permitWorkflows: many(permitWorkflows),
  complianceSnapshots: many(complianceSnapshots),
  members: many(projectMembers),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  complianceItems: many(complianceItems),
}));

export const complianceItemsRelations = relations(complianceItems, ({ one, many }) => ({
  project: one(projects, {
    fields: [complianceItems.projectId],
    references: [projects.id],
  }),
  document: one(documents, {
    fields: [complianceItems.documentId],
    references: [documents.id],
  }),
  alerts: many(alerts),
  attachedDocuments: many(complianceItemDocuments),
}));

export const complianceItemDocumentsRelations = relations(complianceItemDocuments, ({ one }) => ({
  complianceItem: one(complianceItems, {
    fields: [complianceItemDocuments.complianceItemId],
    references: [complianceItems.id],
  }),
  document: one(documents, {
    fields: [complianceItemDocuments.documentId],
    references: [documents.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [alerts.projectId],
    references: [projects.id],
  }),
  complianceItem: one(complianceItems, {
    fields: [alerts.complianceItemId],
    references: [complianceItems.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// Permit Workflow Enums
export const permitWorkflowStatusEnum = pgEnum("permit_workflow_status", [
  "not_started",
  "in_progress",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "on_hold",
]);

export const permitCategoryEnum = pgEnum("permit_category", [
  "building",
  "demolition",
  "electrical",
  "plumbing",
  "gas",
  "hvac",
  "zba_variance",
  "article_80_small",
  "article_80_large",
  "bpda_review",
  "foundation",
  "excavation",
  "certificate_of_occupancy",
  "other",
]);

// Permit Workflows table
export const permitWorkflows = pgTable("permit_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  permitCategory: permitCategoryEnum("permit_category").notNull(),
  permitName: text("permit_name").notNull(),
  jurisdiction: text("jurisdiction"),
  status: permitWorkflowStatusEnum("status").notNull().default("not_started"),
  assignedTo: text("assigned_to"),
  assignedToEmail: text("assigned_to_email"),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  dueDate: timestamp("due_date"),
  permitNumber: text("permit_number"),
  estimatedFee: integer("estimated_fee"),
  actualFee: integer("actual_fee"),
  notes: text("notes"),
  requirementsSummary: jsonb("requirements_summary").$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Compliance Snapshots table (for velocity tracking)
export const complianceSnapshots = pgTable("compliance_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  healthScore: integer("health_score").notNull(),
  totalItems: integer("total_items").notNull(),
  metItems: integer("met_items").notNull(),
  snapshotDate: timestamp("snapshot_date").notNull().defaultNow(),
});

// Permit Comments table
export const permitComments = pgTable("permit_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  permitWorkflowId: uuid("permit_workflow_id").notNull().references(() => permitWorkflows.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  commentType: text("comment_type").notNull().default("note"),
  source: text("source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Permit Workflow Relations
export const permitWorkflowsRelations = relations(permitWorkflows, ({ one, many }) => ({
  project: one(projects, {
    fields: [permitWorkflows.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [permitWorkflows.userId],
    references: [users.id],
  }),
  comments: many(permitComments),
}));

export const permitCommentsRelations = relations(permitComments, ({ one }) => ({
  permitWorkflow: one(permitWorkflows, {
    fields: [permitComments.permitWorkflowId],
    references: [permitWorkflows.id],
  }),
  user: one(users, {
    fields: [permitComments.userId],
    references: [users.id],
  }),
}));

export const complianceSnapshotsRelations = relations(complianceSnapshots, ({ one }) => ({
  project: one(projects, {
    fields: [complianceSnapshots.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [complianceSnapshots.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type ComplianceItem = typeof complianceItems.$inferSelect;
export type NewComplianceItem = typeof complianceItems.$inferInsert;
export type ComplianceItemDocument = typeof complianceItemDocuments.$inferSelect;
export type NewComplianceItemDocument = typeof complianceItemDocuments.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
export type WaitlistEntry = typeof waitlist.$inferSelect;
export type NewWaitlistEntry = typeof waitlist.$inferInsert;
export type JurisdictionRuleSet = typeof jurisdictionRules.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type PermitWorkflow = typeof permitWorkflows.$inferSelect;
export type NewPermitWorkflow = typeof permitWorkflows.$inferInsert;
export type PermitComment = typeof permitComments.$inferSelect;
export type NewPermitComment = typeof permitComments.$inferInsert;
export type ComplianceSnapshot = typeof complianceSnapshots.$inferSelect;
export type NewComplianceSnapshot = typeof complianceSnapshots.$inferInsert;

// JSON Types
export interface ExtractedDocumentData {
  documentType?: string;
  permitNumbers?: string[];
  applicationIds?: string[];
  deadlines?: Array<{
    description: string;
    date: string;
    type?: string;
  }>;
  requiredInspections?: Array<{
    name: string;
    status?: string;
    scheduledDate?: string;
  }>;
  complianceRequirements?: Array<{
    requirement: string;
    status?: string;
    notes?: string;
  }>;
  issuingJurisdiction?: string;
  conditionsOfApproval?: string[];
  projectAddress?: string;
  applicantName?: string;
  issueDate?: string;
  expirationDate?: string;
  summary?: string;
  rawText?: string;
}

export interface JurisdictionRule {
  id: string;
  requirementType: string;
  description: string;
  requiredDocuments?: string[];
  inspectionSequence?: number;
  typicalTimelineDays?: number;
  isRequired: boolean;
  notes?: string;
  feeStructure?: string;
}

// Project Members (Collaborators) table
export const projectMembers = pgTable("project_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id"), // null until invite accepted
  email: text("email").notNull(),
  role: text("role").notNull().default("viewer"), // owner | editor | viewer
  inviteStatus: text("invite_status").notNull().default("pending"), // pending | accepted | declined
  inviteToken: text("invite_token").unique(),
  invitedBy: text("invited_by").notNull(), // userId of who sent invite
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
}));

export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;

// Project Shares table (for lender/investor compliance reports)
export const projectShares = pgTable("project_shares", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  shareToken: text("share_token").notNull().unique().$defaultFn(() => crypto.randomUUID()),
  createdBy: text("created_by").notNull(),
  label: text("label"),
  expiresAt: timestamp("expires_at"),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectSharesRelations = relations(projectShares, ({ one }) => ({
  project: one(projects, {
    fields: [projectShares.projectId],
    references: [projects.id],
  }),
}));

export type ProjectShare = typeof projectShares.$inferSelect;
export type NewProjectShare = typeof projectShares.$inferInsert;

export * from "./schema-inspections";

// Soft Costs table (professional fees tied to the permit process)
export const softCosts = pgTable("soft_costs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // 'legal' | 'architectural' | 'engineering' | 'survey' | 'permit_fees' | 'consulting' | 'other'
  description: text("description").notNull(),
  vendor: text("vendor"),
  amount: integer("amount").notNull(), // cents
  paidAt: timestamp("paid_at"),
  isPaid: boolean("is_paid").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const softCostsRelations = relations(softCosts, ({ one }) => ({
  project: one(projects, {
    fields: [softCosts.projectId],
    references: [projects.id],
  }),
}));

export type SoftCost = typeof softCosts.$inferSelect;
export type NewSoftCost = typeof softCosts.$inferInsert;

// API Keys table (for enterprise integrations)
export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // User-friendly name for the key
  keyPrefix: text("key_prefix").notNull(), // First 8 chars for display (e.g., "ml_live_12345678")
  keyHash: text("key_hash").notNull(), // bcrypt hash of full key
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

// API Webhooks table
export const apiWebhooks = pgTable("api_webhooks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(), // Webhook endpoint URL
  events: jsonb("events").$type<string[]>().notNull(), // ["compliance.status_changed", "document.processed"]
  secret: text("secret").notNull(), // For HMAC signature verification
  isActive: boolean("is_active").default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiWebhooksRelations = relations(apiWebhooks, ({ one }) => ({
  user: one(users, {
    fields: [apiWebhooks.userId],
    references: [users.id],
  }),
}));

export type ApiWebhook = typeof apiWebhooks.$inferSelect;
export type NewApiWebhook = typeof apiWebhooks.$inferInsert;

// API Request Logs table (for rate limiting and analytics)
export const apiRequestLogs = pgTable("api_request_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  apiKeyId: text("api_key_id").references(() => apiKeys.id, { onDelete: "set null" }),
  method: text("method").notNull(), // GET, POST, etc.
  endpoint: text("endpoint").notNull(), // /api/v1/projects
  statusCode: integer("status_code").notNull(),
  responseTimeMs: integer("response_time_ms"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
});

export const apiRequestLogsRelations = relations(apiRequestLogs, ({ one }) => ({
  user: one(users, {
    fields: [apiRequestLogs.userId],
    references: [users.id],
  }),
  apiKey: one(apiKeys, {
    fields: [apiRequestLogs.apiKeyId],
    references: [apiKeys.id],
  }),
}));

export type ApiRequestLog = typeof apiRequestLogs.$inferSelect;
export type NewApiRequestLog = typeof apiRequestLogs.$inferInsert;

export type JurisdictionRequest = typeof jurisdictionRequests.$inferSelect;
export type NewJurisdictionRequest = typeof jurisdictionRequests.$inferInsert;

// Push Subscriptions table (for PWA push notifications)
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
