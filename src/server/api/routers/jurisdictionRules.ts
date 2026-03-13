import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { projects, jurisdictionRules } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { seedBostonRules } from "@/db/seeds/boston-rules";
import { seedCambridgeRules } from "@/db/seeds/cambridge-rules";
import { seedSomervilleRules } from "@/db/seeds/somerville-rules";
import { seedQuincyRules } from "@/db/seeds/quincy-rules";
import { seedNewtonRules } from "@/db/seeds/newton-rules";
import { seedWalthamRules } from "@/db/seeds/waltham-rules";
import { seedDedhamRules } from "@/db/seeds/dedham-rules";
import { seedWestwoodRules } from "@/db/seeds/westwood-rules";
import { seedNeedhamRules } from "@/db/seeds/needham-rules";
import { seedNorwoodRules } from "@/db/seeds/norwood-rules";
import { seedCantonRules } from "@/db/seeds/canton-rules";

// Supported MA jurisdiction codes
export const SUPPORTED_JURISDICTION_CODES = [
  // Boston
  "BOSTON_ISD",
  "BOSTON_BPDA",
  "BOSTON_ZBA",
  // Cambridge
  "CAMBRIDGE_ISD",
  "CAMBRIDGE_CDD",
  "CAMBRIDGE_ZBA",
  // Somerville
  "SOMERVILLE_ISD",
  "SOMERVILLE_ZBA",
  "SOMERVILLE_PLANNING",
  // Quincy
  "QUINCY_ISD",
  "QUINCY_ZBA",
  "QUINCY_COASTAL",
  // Newton
  "NEWTON_ISD",
  "NEWTON_ZBA",
  "NEWTON_PLANNING",
  // Waltham
  "WALTHAM_ISD",
  "WALTHAM_ZBA",
  "WALTHAM_PLANNING",
  // Dedham
  "DEDHAM_MA",
  // Westwood
  "WESTWOOD_MA",
  // Needham
  "NEEDHAM_MA",
  // Norwood
  "NORWOOD_MA",
  // Canton
  "CANTON_MA",
  // State-level
  "MA_GENERIC",
] as const;

export type SupportedJurisdictionCode = (typeof SUPPORTED_JURISDICTION_CODES)[number];

// ─── Required documents per permit category ────────────────────────────────────

export const PERMIT_REQUIRED_DOCS: Record<
  string,
  Array<{ id: string; label: string; keywords: string[]; critical: boolean }>
> = {
  building: [
    { id: "site_plan", label: "Site Plan / Survey", keywords: ["site plan", "site map", "survey", "lot plan"], critical: true },
    { id: "architectural_drawings", label: "Architectural Drawings", keywords: ["architect", "floor plan", "elevation", "section", "architectural"], critical: true },
    { id: "structural_drawings", label: "Structural Drawings", keywords: ["structural", "beam", "column", "foundation drawing", "framing"], critical: true },
    { id: "mep_drawings", label: "MEP Drawings", keywords: ["mep", "mechanical", "electrical drawing", "plumbing drawing", "hvac drawing"], critical: true },
    { id: "deed", label: "Property Deed", keywords: ["deed", "title", "conveyance"], critical: true },
    { id: "zoning_compliance", label: "Zoning Compliance Letter", keywords: ["zoning", "compliance letter", "zoning determination"], critical: true },
    { id: "contractor_docs", label: "Contractor Documentation", keywords: ["contractor", "license", "workers comp", "insurance", "hic"], critical: false },
    { id: "cost_estimate", label: "Construction Cost Estimate", keywords: ["cost estimate", "construction cost", "budget"], critical: false },
  ],
  demolition: [
    { id: "site_plan", label: "Site Plan", keywords: ["site plan", "survey"], critical: true },
    { id: "demolition_plan", label: "Demolition Plan", keywords: ["demolition plan", "demo plan", "abatement"], critical: true },
    { id: "asbestos_survey", label: "Asbestos Survey", keywords: ["asbestos", "hazmat", "environmental survey"], critical: true },
    { id: "article_85", label: "Article 85 Landmarks Review", keywords: ["article 85", "landmarks", "demolition delay"], critical: true },
    { id: "utility_shutoffs", label: "Utility Shutoff Notices", keywords: ["utility", "shutoff", "disconnect", "gas shutoff", "electric shutoff"], critical: true },
    { id: "dep_approval", label: "DEP Hazmat Approval", keywords: ["dep", "environmental", "hazmat approval", "dep approval"], critical: true },
    { id: "contractor_docs", label: "Licensed Contractor Docs", keywords: ["contractor", "license", "workers comp"], critical: false },
    { id: "pest_control", label: "Pest Control Letter", keywords: ["pest control", "pest management", "rodent"], critical: false },
  ],
  electrical: [
    { id: "electrical_drawings", label: "Electrical Drawings", keywords: ["electrical", "wiring diagram", "panel schedule", "one-line"], critical: true },
    { id: "load_calculation", label: "Load Calculation", keywords: ["load calc", "electrical load", "demand calculation"], critical: true },
    { id: "permit_application", label: "Electrical Permit Application", keywords: ["electrical permit", "permit application"], critical: true },
    { id: "electrician_license", label: "Licensed Electrician Documentation", keywords: ["electrician", "electrical contractor", "license", "workers comp"], critical: false },
  ],
  plumbing: [
    { id: "plumbing_drawings", label: "Plumbing Drawings", keywords: ["plumbing", "pipe", "fixture", "isometric"], critical: true },
    { id: "permit_application", label: "Plumbing Permit Application", keywords: ["plumbing permit", "permit application"], critical: true },
    { id: "plumber_license", label: "Licensed Plumber Documentation", keywords: ["plumber", "plumbing contractor", "license"], critical: false },
  ],
  gas: [
    { id: "gas_drawings", label: "Gas Piping Drawings", keywords: ["gas", "piping", "natural gas", "gas line"], critical: true },
    { id: "permit_application", label: "Gas Permit Application", keywords: ["gas permit", "permit application"], critical: true },
    { id: "gasfitter_license", label: "Licensed Gas Fitter Documentation", keywords: ["gas fitter", "gasfitter", "license"], critical: false },
  ],
  hvac: [
    { id: "hvac_drawings", label: "HVAC / Mechanical Drawings", keywords: ["hvac", "mechanical", "ductwork", "ventilation", "air handling"], critical: true },
    { id: "permit_application", label: "Mechanical Permit Application", keywords: ["mechanical permit", "hvac permit", "permit application"], critical: true },
    { id: "contractor_docs", label: "HVAC Contractor Documentation", keywords: ["hvac contractor", "mechanical contractor", "license"], critical: false },
  ],
  zba_variance: [
    { id: "site_plan", label: "Site Plan / Survey", keywords: ["site plan", "survey"], critical: true },
    { id: "architectural_drawings", label: "Architectural Drawings", keywords: ["architectural", "floor plan", "elevation"], critical: true },
    { id: "deed", label: "Property Deed", keywords: ["deed", "title"], critical: true },
    { id: "zoning_analysis", label: "Zoning / Dimensional Analysis", keywords: ["zoning analysis", "dimensional analysis", "variance analysis"], critical: true },
    { id: "abutters_list", label: "Abutters List", keywords: ["abutter", "abutters list", "neighbors list", "abutter notification"], critical: true },
    { id: "hardship_statement", label: "Hardship Statement", keywords: ["hardship", "variance justification", "hardship letter"], critical: true },
    { id: "public_notice", label: "Public Notice", keywords: ["public notice", "legal notice"], critical: false },
  ],
  article_80_small: [
    { id: "project_notification_form", label: "Project Notification Form (PNF)", keywords: ["pnf", "project notification", "article 80"], critical: true },
    { id: "site_plan", label: "Site Plan", keywords: ["site plan", "survey"], critical: true },
    { id: "architectural_drawings", label: "Architectural Drawings", keywords: ["architectural", "floor plan"], critical: true },
    { id: "structural_drawings", label: "Structural Drawings", keywords: ["structural"], critical: true },
    { id: "mep_drawings", label: "MEP Drawings", keywords: ["mep", "mechanical", "electrical", "plumbing"], critical: false },
    { id: "deed", label: "Property Deed", keywords: ["deed"], critical: true },
    { id: "community_impact", label: "Community Impact Statement", keywords: ["community impact", "cis", "community benefits"], critical: true },
    { id: "transportation_plan", label: "Transportation Access Plan", keywords: ["transportation", "parking", "access plan", "tias"], critical: false },
  ],
  article_80_large: [
    { id: "project_notification_form", label: "Project Notification Form (PNF)", keywords: ["pnf", "project notification", "article 80"], critical: true },
    { id: "site_plan", label: "Site Plan", keywords: ["site plan", "survey"], critical: true },
    { id: "architectural_drawings", label: "Architectural Drawings", keywords: ["architectural", "floor plan"], critical: true },
    { id: "structural_drawings", label: "Structural Drawings", keywords: ["structural"], critical: true },
    { id: "mep_drawings", label: "MEP Drawings", keywords: ["mep", "mechanical", "electrical", "plumbing"], critical: true },
    { id: "deed", label: "Property Deed", keywords: ["deed"], critical: true },
    { id: "deir", label: "Draft Environmental Impact Report (DEIR)", keywords: ["deir", "environmental impact", "dpir", "feir"], critical: true },
    { id: "traffic_study", label: "Traffic Impact Study (TIAS)", keywords: ["traffic study", "tias", "traffic impact"], critical: true },
    { id: "shadow_analysis", label: "Shadow Analysis", keywords: ["shadow analysis", "solar analysis"], critical: false },
    { id: "wind_analysis", label: "Wind Analysis", keywords: ["wind analysis", "wind study", "pedestrian wind"], critical: false },
    { id: "inclusionary_housing", label: "Inclusionary Housing Plan (IDP)", keywords: ["idp", "inclusionary", "affordable housing plan"], critical: true },
    { id: "community_benefits", label: "Community Benefits Agreement", keywords: ["community benefits", "cba", "community agreement"], critical: true },
  ],
  bpda_review: [
    { id: "site_plan", label: "Site Plan", keywords: ["site plan"], critical: true },
    { id: "architectural_drawings", label: "Architectural Drawings", keywords: ["architectural", "floor plan", "elevation", "massing"], critical: true },
    { id: "deed", label: "Property Deed", keywords: ["deed"], critical: true },
    { id: "community_impact", label: "Community Impact Statement", keywords: ["community impact", "cis"], critical: true },
    { id: "public_notice", label: "Public Notice", keywords: ["public notice"], critical: false },
  ],
  foundation: [
    { id: "structural_drawings", label: "Structural / Foundation Drawings", keywords: ["structural", "foundation", "footing", "pile"], critical: true },
    { id: "geotechnical_report", label: "Geotechnical / Soil Report", keywords: ["geotechnical", "soil report", "boring log", "subsurface"], critical: true },
    { id: "permit_application", label: "Foundation Permit Application", keywords: ["foundation permit", "permit application"], critical: true },
  ],
  excavation: [
    { id: "site_plan", label: "Site Plan", keywords: ["site plan"], critical: true },
    { id: "excavation_plan", label: "Excavation / Shoring Plan", keywords: ["excavation", "shoring", "underpinning", "earth support"], critical: true },
    { id: "geotechnical_report", label: "Geotechnical Report", keywords: ["geotechnical", "soil report"], critical: true },
    { id: "permit_application", label: "Excavation Permit Application", keywords: ["excavation permit"], critical: true },
  ],
  certificate_of_occupancy: [
    { id: "as_built_drawings", label: "As-Built Drawings", keywords: ["as-built", "as built", "record drawings"], critical: true },
    { id: "final_inspection", label: "Final Inspection Sign-offs", keywords: ["final inspection", "co inspection", "final sign-off"], critical: true },
    { id: "utility_connections", label: "Utility Connections Documentation", keywords: ["utility connection", "meter", "service connection", "utility activation"], critical: false },
    { id: "co_application", label: "CO Application", keywords: ["certificate of occupancy", "co application", "occupancy application"], critical: true },
  ],
  other: [
    { id: "permit_application", label: "Permit Application", keywords: ["permit", "application"], critical: true },
    { id: "site_plan", label: "Site Plan", keywords: ["site plan"], critical: false },
  ],
};

// Check if an uploaded document matches a required doc by keywords in filename or extractedData
function docMatchesRequired(
  doc: { filename: string; docType: string | null; extractedData: Record<string, unknown> | null },
  keywords: string[]
): boolean {
  const nameLower = doc.filename.toLowerCase();
  const extractedType = ((doc.extractedData as { documentType?: string } | null)?.documentType ?? "").toLowerCase();
  return keywords.some(
    (kw) => nameLower.includes(kw) || extractedType.includes(kw)
  );
}

// ─── Router ────────────────────────────────────────────────────────────────────

export const jurisdictionRulesRouter = createTRPCRouter({
  // Get all applicable rules for a project based on jurisdiction + project type
  getRequirementsForProject: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(eq(projects.id, input.projectId), eq(projects.userId, ctx.dbUser.id)),
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      if (!project.jurisdiction) {
        return { rulesets: [], projectJurisdiction: null };
      }

      // Find rulesets that match the project jurisdiction
      const allRulesets = await ctx.db.query.jurisdictionRules.findMany();

      const matchingRulesets = allRulesets.filter((rs) => {
        const codeMatch =
          rs.jurisdictionCode === project.jurisdiction ||
          project.jurisdiction!.toUpperCase().includes(rs.jurisdictionCode) ||
          rs.jurisdictionCode.toUpperCase().includes(project.jurisdiction!.toUpperCase());
        return codeMatch;
      });

      // Filter rules by project type
      const results = matchingRulesets.map((rs) => ({
        ...rs,
        rules: rs.rules.filter(
          (rule) =>
            !rs.projectTypes ||
            rs.projectTypes.length === 0 ||
            rs.projectTypes.includes(project.projectType)
        ),
      }));

      return { rulesets: results, projectJurisdiction: project.jurisdiction };
    }),

  // Get submission checklist for a project — required docs per permit workflow
  getSubmissionChecklist: protectedProcedure
    .input(z.object({ projectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(eq(projects.id, input.projectId), eq(projects.userId, ctx.dbUser.id)),
        with: {
          documents: true,
          permitWorkflows: true,
        },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const uploadedDocs = project.documents;

      // Build a checklist per permit workflow
      const checklists = project.permitWorkflows.map((pw) => {
        const category = pw.permitCategory as string;
        const requiredDocs = PERMIT_REQUIRED_DOCS[category] ?? PERMIT_REQUIRED_DOCS.other;

        const items = requiredDocs.map((req) => {
          const matchedDoc = uploadedDocs.find((doc) =>
            docMatchesRequired(
              { filename: doc.filename, docType: doc.docType, extractedData: doc.extractedData as Record<string, unknown> | null },
              req.keywords
            )
          );

          return {
            id: req.id,
            label: req.label,
            critical: req.critical,
            status: matchedDoc ? ("uploaded" as const) : ("missing" as const),
            documentId: matchedDoc?.id,
            documentFilename: matchedDoc?.filename,
          };
        });

        const uploadedCount = items.filter((i) => i.status === "uploaded").length;
        const criticalMissing = items.filter((i) => i.critical && i.status === "missing");

        return {
          permitWorkflowId: pw.id,
          permitCategory: pw.permitCategory,
          permitName: pw.permitName,
          permitStatus: pw.status,
          items,
          uploadedCount,
          totalCount: items.length,
          criticalMissingCount: criticalMissing.length,
          readyToSubmit: criticalMissing.length === 0,
        };
      });

      // Also compute overall doc coverage
      const totalRequired = checklists.reduce((sum, c) => sum + c.totalCount, 0);
      const totalUploaded = checklists.reduce((sum, c) => sum + c.uploadedCount, 0);

      return {
        checklists,
        totalRequired,
        totalUploaded,
        overallPercent: totalRequired > 0 ? Math.round((totalUploaded / totalRequired) * 100) : 100,
      };
    }),

  // Get all jurisdiction rule sets (for dropdowns, etc.)
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.jurisdictionRules.findMany({
      columns: {
        id: true,
        jurisdictionCode: true,
        jurisdictionName: true,
        projectTypes: true,
      },
    });
  }),

  // Admin: seed Boston rules into the DB
  seedBostonRules: protectedProcedure.mutation(async () => {
    return seedBostonRules();
  }),

  // Admin: seed Cambridge rules into the DB
  seedCambridgeRules: protectedProcedure.mutation(async () => {
    return seedCambridgeRules();
  }),

  // Admin: seed Somerville rules into the DB
  seedSomervilleRules: protectedProcedure.mutation(async () => {
    return seedSomervilleRules();
  }),

  // Admin: seed Quincy rules into the DB
  seedQuincyRules: protectedProcedure.mutation(async () => {
    return seedQuincyRules();
  }),

  // Admin: seed Newton rules into the DB
  seedNewtonRules: protectedProcedure.mutation(async () => {
    return seedNewtonRules();
  }),

  // Admin: seed Waltham rules into the DB
  seedWalthamRules: protectedProcedure.mutation(async () => {
    return seedWalthamRules();
  }),

  // Admin: seed Dedham rules into the DB
  seedDedhamRules: protectedProcedure.mutation(async () => {
    return seedDedhamRules();
  }),

  // Admin: seed Westwood rules into the DB
  seedWestwoodRules: protectedProcedure.mutation(async () => {
    return seedWestwoodRules();
  }),

  // Admin: seed Needham rules into the DB
  seedNeedhamRules: protectedProcedure.mutation(async () => {
    return seedNeedhamRules();
  }),

  // Admin: seed Norwood rules into the DB
  seedNorwoodRules: protectedProcedure.mutation(async () => {
    return seedNorwoodRules();
  }),

  // Admin: seed Canton rules into the DB
  seedCantonRules: protectedProcedure.mutation(async () => {
    return seedCantonRules();
  }),

  // Admin: seed all jurisdictions at once
  seedAllRules: protectedProcedure.mutation(async () => {
    const results = await Promise.all([
      seedBostonRules(),
      seedCambridgeRules(),
      seedSomervilleRules(),
      seedQuincyRules(),
      seedNewtonRules(),
      seedWalthamRules(),
      seedDedhamRules(),
      seedWestwoodRules(),
      seedNeedhamRules(),
      seedNorwoodRules(),
      seedCantonRules(),
    ]);
    const totalSeeded = results.reduce((sum, r) => sum + r.seededCount, 0);
    const allJurisdictions = results.flatMap((r) => r.jurisdictions);
    return { seededCount: totalSeeded, jurisdictions: allJurisdictions };
  }),
});
