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
export const complianceStatusEnum = pgEnum("compliance_status", ["pending", "met", "overdue", "not_applicable"]);
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
}

export * from "./schema-inspections";
