import { pgTable, text, timestamp, integer, date, uuid } from "drizzle-orm/pg-core";
import { projects } from "./schema";

export const inspections = pgTable("inspections", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  inspectionType: text("inspection_type").notNull(), // building, electrical, plumbing, fire, final
  status: text("status").notNull().default("scheduled"), // scheduled, passed, failed, re_inspection, waived
  scheduledDate: date("scheduled_date"),
  completedDate: date("completed_date"),
  inspectorName: text("inspector_name"),
  notes: text("notes"),
  failureReason: text("failure_reason"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Inspection = typeof inspections.$inferSelect;
export type NewInspection = typeof inspections.$inferInsert;
