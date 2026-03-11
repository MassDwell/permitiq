import { createCallerFactory, createTRPCRouter } from "./trpc";
import { projectsRouter } from "./routers/projects";
import { documentsRouter } from "./routers/documents";
import { complianceRouter } from "./routers/compliance";
import { alertsRouter } from "./routers/alerts";
import { settingsRouter } from "./routers/settings";
import { waitlistRouter } from "./routers/waitlist";
import { billingRouter } from "./routers/billing";

export const appRouter = createTRPCRouter({
  projects: projectsRouter,
  documents: documentsRouter,
  compliance: complianceRouter,
  alerts: alertsRouter,
  settings: settingsRouter,
  waitlist: waitlistRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
