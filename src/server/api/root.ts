import { createCallerFactory, createTRPCRouter } from "./trpc";
import { adminRouter } from "./routers/admin";
import { projectsRouter } from "./routers/projects";
import { documentsRouter } from "./routers/documents";
import { complianceRouter } from "./routers/compliance";
import { alertsRouter } from "./routers/alerts";
import { settingsRouter } from "./routers/settings";
import { waitlistRouter } from "./routers/waitlist";
import { billingRouter } from "./routers/billing";
import { permitWorkflowsRouter } from "./routers/permitWorkflows";
import { jurisdictionRulesRouter } from "./routers/jurisdictionRules";
import { inspectionsRouter } from "./routers/inspections";
import { collaboratorsRouter } from "./routers/collaborators";
import { sharesRouter } from "./routers/shares";
import { softCostsRouter } from "./routers/soft-costs";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  projects: projectsRouter,
  documents: documentsRouter,
  compliance: complianceRouter,
  alerts: alertsRouter,
  settings: settingsRouter,
  waitlist: waitlistRouter,
  billing: billingRouter,
  permitWorkflows: permitWorkflowsRouter,
  jurisdictionRules: jurisdictionRulesRouter,
  inspections: inspectionsRouter,
  collaborators: collaboratorsRouter,
  shares: sharesRouter,
  softCosts: softCostsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
