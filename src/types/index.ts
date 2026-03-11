// Re-export types from schema
export type {
  User,
  NewUser,
  Project,
  NewProject,
  Document,
  NewDocument,
  ComplianceItem,
  NewComplianceItem,
  Alert,
  NewAlert,
  WaitlistEntry,
  NewWaitlistEntry,
  JurisdictionRuleSet,
  UserSettings,
  ExtractedDocumentData,
  JurisdictionRule,
} from "@/db/schema";

// Additional application types
export type ProjectWithHealth = {
  id: string;
  name: string;
  address: string | null;
  jurisdiction: string | null;
  projectType: "residential" | "commercial" | "adu" | "mixed_use" | "renovation";
  status: "active" | "completed" | "on_hold" | "archived";
  healthScore: number;
  healthStatus: "green" | "yellow" | "red";
  totalItems: number;
  metItems: number;
  overdueItems: number;
  pendingItems: number;
  documentCount: number;
};

export type ComplianceStatus = "pending" | "met" | "overdue" | "not_applicable";

export type AlertType =
  | "deadline_7_days"
  | "deadline_3_days"
  | "deadline_1_day"
  | "overdue"
  | "document_processed"
  | "compliance_update";

export type Plan = "starter" | "professional" | "enterprise";

export type PlanFeatures = {
  id: Plan;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  maxProjects: number;
  maxDocsPerMonth: number | null; // null = unlimited
};

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 999,
    description: "Perfect for small contractors",
    features: [
      "1 active project",
      "100 documents/month",
      "AI document processing",
      "Deadline alerts",
      "Email support",
    ],
    maxProjects: 1,
    maxDocsPerMonth: 100,
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 2499,
    description: "For growing construction firms",
    features: [
      "5 active projects",
      "Unlimited documents",
      "AI document processing",
      "Priority deadline alerts",
      "Compliance reports",
      "Priority support",
    ],
    popular: true,
    maxProjects: 5,
    maxDocsPerMonth: null,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 4999,
    description: "For large-scale operations",
    features: [
      "Unlimited projects",
      "Unlimited documents",
      "Custom compliance rules",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
    ],
    maxProjects: Infinity,
    maxDocsPerMonth: null,
  },
};
