/**
 * AHJ (Authority Having Jurisdiction) Contact Data
 * CLA-109: Hardcoded, curated data for Boston metro area AHJs
 */

export interface AHJData {
  name: string;
  portal?: string;
  address?: string;
  hours?: string;
  phone?: string;
  email?: string;
  emailTemplate?: string;
}

export const AHJ_DATA: Record<string, AHJData> = {
  boston: {
    name: "Boston Inspectional Services Department",
    portal: "https://www.boston.gov/departments/inspectional-services/eplan",
    address: "1010 Massachusetts Ave, Boston MA 02118",
    hours: "Mon-Fri 8:00am - 4:00pm",
    phone: "(617) 635-5300",
    email: "isd@boston.gov",
    emailTemplate: `Subject: Permit inquiry — [PROJECT ADDRESS]

Dear ISD,

I am writing regarding a permit application for [PROJECT ADDRESS]. Could you please provide a status update on our application submitted on [DATE]?

Thank you,
[YOUR NAME]`,
  },
  boston_blc: {
    name: "Boston Landmarks Commission (Article 85)",
    portal:
      "https://www.boston.gov/departments/landmarks-commission/how-file-article-85-demolition-review",
    email: "article85@boston.gov",
    emailTemplate: `Subject: Article 85 demolition review — [PROJECT ADDRESS]

Dear BLC,

I am writing to inquire about the Article 85 demolition review for [PROJECT ADDRESS] submitted on [DATE]. Please advise on next steps.

Thank you,
[YOUR NAME]`,
  },
  boston_bpda: {
    name: "Boston Planning and Development Agency (Article 80)",
    portal: "https://www.bostonplans.org/projects/development-review",
    email: "article80inquiries@boston.gov",
    emailTemplate: `Subject: Article 80 review inquiry — [PROJECT ADDRESS]

Dear BPDA,

I am reaching out regarding the Article 80 [SPR/LPR] review for [PROJECT ADDRESS]. Could you please provide an update?

Thank you,
[YOUR NAME]`,
  },
  cambridge: {
    name: "Cambridge Inspectional Services",
    portal: "https://cambridgecloud.permitportal.com",
    email: "inspection@cambridgema.gov",
    phone: "(617) 349-6100",
    emailTemplate: `Subject: Permit inquiry — [PROJECT ADDRESS]

Dear Cambridge ISD,

I am writing regarding a permit application for [PROJECT ADDRESS]. Could you please provide a status update on our application submitted on [DATE]?

Thank you,
[YOUR NAME]`,
  },
  brookline: {
    name: "Brookline Building Department",
    portal: "https://www.brooklinema.gov/175/Building",
    email: "building@brooklinema.gov",
    phone: "(617) 730-2190",
    emailTemplate: `Subject: Permit inquiry — [PROJECT ADDRESS]

Dear Brookline Building Department,

I am writing regarding a permit application for [PROJECT ADDRESS]. Could you please provide a status update on our application submitted on [DATE]?

Thank you,
[YOUR NAME]`,
  },
};

/**
 * Get relevant AHJs for a jurisdiction and compliance item types
 */
export function getRelevantAHJs(
  jurisdiction: string,
  requirementTypes: string[]
): AHJData[] {
  const normalizedJurisdiction = jurisdiction.toLowerCase();
  const results: AHJData[] = [];

  // Determine base jurisdiction
  if (normalizedJurisdiction.includes("cambridge")) {
    results.push(AHJ_DATA.cambridge);
  } else if (normalizedJurisdiction.includes("brookline")) {
    results.push(AHJ_DATA.brookline);
  } else if (normalizedJurisdiction.includes("boston")) {
    // Always include main ISD for Boston
    results.push(AHJ_DATA.boston);

    // Check for Article 85 (demolition review)
    const hasArticle85 = requirementTypes.some(
      (t) =>
        t.toLowerCase().includes("article_85") ||
        t.toLowerCase().includes("demolition") ||
        t.toLowerCase().includes("blc")
    );
    if (hasArticle85) {
      results.push(AHJ_DATA.boston_blc);
    }

    // Check for Article 80 (BPDA review)
    const hasArticle80 = requirementTypes.some(
      (t) =>
        t.toLowerCase().includes("article_80") ||
        t.toLowerCase().includes("bpda") ||
        t.toLowerCase().includes("spr") ||
        t.toLowerCase().includes("lpr")
    );
    if (hasArticle80) {
      results.push(AHJ_DATA.boston_bpda);
    }
  } else {
    // Default to Boston for unknown jurisdictions in the metro area
    results.push(AHJ_DATA.boston);
  }

  return results;
}

/**
 * Get email template with project address filled in
 */
export function getFilledEmailTemplate(
  ahjKey: string,
  projectAddress: string
): string {
  const ahj = AHJ_DATA[ahjKey];
  if (!ahj?.emailTemplate) {
    return "";
  }

  return ahj.emailTemplate.replace(/\[PROJECT ADDRESS\]/g, projectAddress || "[PROJECT ADDRESS]");
}
