import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/db";
import { jurisdictionRules } from "@/db/schema";
import type { JurisdictionRule } from "@/db/schema";
import { eq } from "drizzle-orm";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { jurisdiction, projectType, permitCategory } = body as {
    jurisdiction?: string;
    projectType?: string;
    permitCategory?: string;
  };

  if (!jurisdiction || !projectType || !permitCategory) {
    return NextResponse.json(
      { error: "jurisdiction, projectType, and permitCategory are required" },
      { status: 400 }
    );
  }

  // Cache key — check if we've researched this combo before
  const cacheCode = `AI_${jurisdiction.toUpperCase()}_${projectType}_${permitCategory}`;

  const cached = await db.query.jurisdictionRules.findFirst({
    where: eq(jurisdictionRules.jurisdictionCode, cacheCode),
  });

  if (cached) {
    return NextResponse.json({
      requirements: cached.rules,
      sourceUrls: [],
      lastUpdated: cached.updatedAt.toISOString(),
      cached: true,
    });
  }

  // Call Claude to research requirements
  const prompt = `You are a Massachusetts construction permit expert. Research and list the comprehensive permit requirements for the following:

- Jurisdiction: ${jurisdiction}
- Project Type: ${projectType}
- Permit Category: ${permitCategory}

Return a JSON array of requirement objects. Each object must have:
- id: unique snake_case identifier (e.g., "boston_isd_building_001")
- requirementType: snake_case type identifier
- description: clear one-sentence description of the requirement
- requiredDocuments: array of document name strings (e.g., ["site_plan", "architectural_drawings"])
- typicalTimelineDays: estimated number of days to fulfill (integer, 0 if instantaneous)
- isRequired: true if always required, false if conditional
- notes: 1-2 sentences of important notes, caveats, or contact information

Focus on actual Massachusetts and local regulations. Be specific and accurate. Return only valid JSON — no markdown, no explanation, just the JSON array.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "[]";

    let requirements: JurisdictionRule[] = [];
    try {
      // Strip any markdown code fences if present
      const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
      const parsed = JSON.parse(cleaned) as JurisdictionRule[];
      requirements = parsed.map((r, idx) => ({
        ...r,
        id: r.id || `${cacheCode}_${idx}`,
        isRequired: r.isRequired ?? true,
      }));
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response", requirements: [] },
        { status: 500 }
      );
    }

    // Cache result in jurisdictionRules table
    if (requirements.length > 0) {
      await db.insert(jurisdictionRules).values({
        jurisdictionCode: cacheCode,
        jurisdictionName: `${jurisdiction} — ${permitCategory} (AI Research)`,
        projectTypes: [projectType],
        rules: requirements,
      });
    }

    return NextResponse.json({
      requirements,
      sourceUrls: [],
      lastUpdated: new Date().toISOString(),
      cached: false,
    });
  } catch (err) {
    console.error("Research requirements error:", err);
    return NextResponse.json(
      { error: "AI research failed. Please try again." },
      { status: 500 }
    );
  }
}
