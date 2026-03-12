import Anthropic from "@anthropic-ai/sdk";
import PDFParser from "pdf2json";
import { ExtractedDocumentData } from "@/db/schema";

async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new (PDFParser as any)(null, 1);
    parser.on("pdfParser_dataReady", () => {
      resolve(parser.getRawTextContent());
    });
    parser.on("pdfParser_dataError", (err: unknown) => {
      reject(new Error(String(err)));
    });
    parser.parseBuffer(buffer);
  });
}

const MAX_PDF_BASE64_BYTES = 8 * 1024 * 1024; // ~6MB PDF = ~8MB base64, Claude's soft limit before page count issues

const getAnthropic = () => new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const EXTRACTION_PROMPT = `You are an expert construction document analyzer specializing in permit compliance and regulatory requirements.

Analyze the following document and extract structured information. Be thorough and accurate.

Extract the following information if present:
1. Document Type (permit, inspection_report, certificate, plan, application, approval, notice, correspondence, or other)
2. Permit Numbers or Application IDs
3. All Deadlines and Expiration Dates (with descriptions)
4. Required Inspections (name, status if mentioned, scheduled dates)
5. Compliance Requirements and Conditions
6. Issuing Jurisdiction (city, county, state)
7. Conditions of Approval
8. Project Address
9. Applicant/Owner Name
10. Issue Date
11. Expiration Date
12. Brief Summary of the document

Return your analysis as a JSON object with this exact structure:
{
  "documentType": "permit" | "inspection_report" | "certificate" | "plan" | "application" | "approval" | "notice" | "correspondence" | "other",
  "permitNumbers": ["string array of permit/application numbers"],
  "applicationIds": ["string array of application IDs"],
  "deadlines": [
    {
      "description": "what the deadline is for",
      "date": "YYYY-MM-DD format",
      "type": "optional type like 'expiration', 'inspection', 'submission'"
    }
  ],
  "requiredInspections": [
    {
      "name": "inspection name",
      "status": "scheduled" | "passed" | "failed" | "pending" | null,
      "scheduledDate": "YYYY-MM-DD or null"
    }
  ],
  "complianceRequirements": [
    {
      "requirement": "description of requirement",
      "status": "met" | "pending" | null,
      "notes": "any additional notes"
    }
  ],
  "issuingJurisdiction": "city/county/state name",
  "conditionsOfApproval": ["array of condition strings"],
  "projectAddress": "full address if found",
  "applicantName": "name if found",
  "issueDate": "YYYY-MM-DD or null",
  "expirationDate": "YYYY-MM-DD or null",
  "summary": "2-3 sentence summary of the document"
}

Only include fields where you found relevant information. Use null for missing dates.
Be conservative - only extract information you're confident about.`;

export async function processDocumentWithAI(
  storageUrl: string,
  filename: string
): Promise<ExtractedDocumentData> {
  // Determine if it's a PDF or image
  const extension = filename.toLowerCase().split(".").pop();
  const isPdf = extension === "pdf";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "");

  try {
    let response;

    if (isPdf) {
      // Fetch the PDF
      const pdfResponse = await fetch(storageUrl);
      const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
      const base64Pdf = pdfBuffer.toString("base64");

      // If PDF is small enough, send natively; otherwise extract text first
      if (base64Pdf.length <= MAX_PDF_BASE64_BYTES) {
        response = await getAnthropic().messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64Pdf,
                  },
                },
                {
                  type: "text",
                  text: EXTRACTION_PROMPT,
                },
              ],
            },
          ],
        });
      } else {
        // Large PDF — extract text and send as plain text (truncated to ~100k chars)
        const rawText = await extractPdfText(pdfBuffer);
        const extractedText = rawText.slice(0, 100000);
        response = await getAnthropic().messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: `${EXTRACTION_PROMPT}\n\n---\nDOCUMENT TEXT:\n${extractedText}`,
            },
          ],
        });
      }

    } else if (isImage) {
      // For images, fetch and encode as base64
      const imageResponse = await fetch(storageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString("base64");

      const mediaType = extension === "png"
        ? "image/png"
        : extension === "gif"
          ? "image/gif"
          : extension === "webp"
            ? "image/webp"
            : "image/jpeg";

      response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
      });
    } else {
      // For other file types, try to process as text
      const textResponse = await fetch(storageUrl);
      const text = await textResponse.text();

      response = await getAnthropic().messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `${EXTRACTION_PROMPT}\n\nDocument content:\n${text}`,
          },
        ],
      });
    }

    // Extract JSON from response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse JSON from the response - it might be wrapped in markdown code blocks
    let jsonText = content.text;
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const extractedData = JSON.parse(jsonText.trim()) as ExtractedDocumentData;

    return extractedData;
  } catch (error) {
    console.error("Error processing document with AI:", error);

    // Return minimal data on error
    return {
      documentType: "other",
      summary: `Failed to process document: ${filename}. Please try again or contact support.`,
    };
  }
}

// Haiku model for quick triage and alerts
export async function generateAlertMessage(
  complianceItem: {
    description: string;
    deadline: Date | null;
    requirementType: string;
  },
  projectName: string,
  daysUntilDue: number
): Promise<string> {
  try {
    const response = await getAnthropic().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Generate a brief, professional alert message for a construction compliance deadline.

Project: ${projectName}
Requirement: ${complianceItem.description}
Type: ${complianceItem.requirementType}
Days until due: ${daysUntilDue}
Deadline: ${complianceItem.deadline?.toLocaleDateString() || "Not set"}

Keep it under 2 sentences. Be direct and actionable. Don't use emojis.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }

    return `Deadline alert: ${complianceItem.description} is due in ${daysUntilDue} days for project ${projectName}.`;
  } catch (error) {
    console.error("Error generating alert message:", error);
    return `Deadline alert: ${complianceItem.description} is due in ${daysUntilDue} days for project ${projectName}.`;
  }
}
