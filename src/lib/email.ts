import { Resend } from "resend";

const FROM_ADDRESS = "MeritLayer <noreply@meritlayer.ai>";

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? "");

function baseLayout(content: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: #080D1A; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <span style="color: #14B8A6; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">MeritLayer</span>
      </div>
      <!-- Body -->
      <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        ${content}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          You're receiving this email because you have an account with MeritLayer.
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #14B8A6;">Manage preferences</a>
        </p>
      </div>
    </div>
  `;
}

function ctaButton(label: string, url: string, color = "#14B8A6"): string {
  return `
    <a href="${url}" style="display: inline-block; background: ${color}; color: ${color === "#14B8A6" ? "#080D1A" : "#ffffff"}; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px;">
      ${label}
    </a>
  `;
}

/**
 * Send a welcome email after a new project is created.
 */
export async function sendProjectCreatedEmail({
  to,
  userName,
  projectName,
  projectId,
}: {
  to: string;
  userName: string | null;
  projectName: string;
  projectId: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const greeting = userName ? `Hi ${userName.split(" ")[0]},` : "Hi there,";
  const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}`;

  const html = baseLayout(`
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Your project is ready 🎉</h2>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
      ${greeting} <strong>${projectName}</strong> has been created successfully.
      Upload your first permit document to let our AI extract compliance requirements and deadlines automatically.
    </p>
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #374151; font-weight: 600;">Next steps:</p>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 2;">
        <li>Upload a building permit, inspection report, or other permit documents</li>
        <li>Review AI-extracted compliance requirements</li>
        <li>Set up deadline alerts so nothing slips through the cracks</li>
      </ul>
    </div>
    ${ctaButton("Open Project", projectUrl)}
  `);

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `Project created: ${projectName}`,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send project created email:", err);
  }
}

/**
 * Send an email when a document finishes processing.
 */
export async function sendDocumentProcessedEmail({
  to,
  userName,
  projectName,
  projectId,
  documentName,
  extractedCount,
}: {
  to: string;
  userName: string | null;
  projectName: string;
  projectId: string;
  documentName: string;
  extractedCount: number;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const greeting = userName ? `Hi ${userName.split(" ")[0]},` : "Hi there,";
  const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}`;

  const html = baseLayout(`
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Your document is ready ✅</h2>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
      ${greeting} <strong>${documentName}</strong> has been processed for <strong>${projectName}</strong>.
    </p>
    ${
      extractedCount > 0
        ? `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
             <p style="margin: 0; color: #15803d; font-weight: 600;">
               🎯 ${extractedCount} compliance requirement${extractedCount === 1 ? "" : "s"} extracted
             </p>
             <p style="margin: 8px 0 0; color: #4b5563; font-size: 14px;">
               Review the extracted items and mark them as you complete each one.
             </p>
           </div>`
        : `<div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;">
             <p style="margin: 0; color: #92400e; font-size: 14px;">
               No compliance items were automatically extracted. You can add them manually from the project page.
             </p>
           </div>`
    }
    ${ctaButton("View Project", projectUrl)}
  `);

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `Document processed: ${documentName}`,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send document processed email:", err);
  }
}

/**
 * Send a deadline approaching alert email (7-day window).
 */
export async function sendDeadlineAlertEmail({
  to,
  userName,
  projectName,
  projectId,
  requirementDescription,
  deadline,
  daysUntil,
}: {
  to: string;
  userName: string | null;
  projectName: string;
  projectId: string;
  requirementDescription: string;
  deadline: Date;
  daysUntil: number;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const greeting = userName ? `Hi ${userName.split(" ")[0]},` : "Hi there,";
  const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}`;
  const urgency = daysUntil <= 1 ? "🚨 Due tomorrow" : daysUntil <= 3 ? "⚠️ Due in 3 days" : "📅 Upcoming deadline";

  const html = baseLayout(`
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px;">${urgency}</h2>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
      ${greeting} A compliance deadline is approaching for <strong>${projectName}</strong>.
    </p>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #1f2937; font-weight: 600;">${requirementDescription}</p>
      <p style="margin: 8px 0 0; color: #dc2626; font-size: 14px; font-weight: 600;">
        Due: ${deadline.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        ${daysUntil > 0 ? ` (${daysUntil} day${daysUntil === 1 ? "" : "s"} away)` : " (Today!)"}
      </p>
    </div>
    ${ctaButton("Take Action Now", projectUrl, "#dc2626")}
  `);

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `${urgency}: ${requirementDescription}`,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send deadline alert email:", err);
  }
}

/**
 * Send a team invite email with the invite link.
 */
export async function sendTeamInviteEmail({
  to,
  inviterName,
  projectName,
  role,
  token,
}: {
  to: string;
  inviterName: string;
  projectName: string;
  role: "editor" | "viewer";
  token: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const inviteUrl = `https://meritlayer.ai/invite/${token}`;
  const roleLabel = role === "editor" ? "Editor" : "Viewer";
  const roleDesc =
    role === "editor"
      ? "You can upload documents and update compliance records."
      : "You have read-only access to the project.";

  const html = baseLayout(`
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px;">You've been invited to collaborate</h2>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
      <strong>${inviterName}</strong> has invited you to collaborate on <strong>${projectName}</strong> on MeritLayer.
    </p>
    <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #0f766e; font-weight: 600;">Your role: ${roleLabel}</p>
      <p style="margin: 6px 0 0; color: #4b5563; font-size: 14px;">${roleDesc}</p>
    </div>
    ${ctaButton("Accept Invitation", inviteUrl)}
    <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">
      Or copy this link: <a href="${inviteUrl}" style="color: #14B8A6;">${inviteUrl}</a>
    </p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `You have been invited to collaborate on ${projectName} - MeritLayer`,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send team invite email:", err);
  }
}

/**
 * Send an overdue compliance item email.
 */
export async function sendOverdueAlertEmail({
  to,
  userName,
  projectName,
  projectId,
  requirementDescription,
}: {
  to: string;
  userName: string | null;
  projectName: string;
  projectId: string;
  requirementDescription: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const greeting = userName ? `Hi ${userName.split(" ")[0]},` : "Hi there,";
  const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}`;

  const html = baseLayout(`
    <h2 style="color: #dc2626; font-size: 22px; font-weight: 700; margin: 0 0 8px;">🔴 Compliance Item Overdue</h2>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
      ${greeting} A compliance requirement for <strong>${projectName}</strong> is now overdue.
    </p>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #1f2937; font-weight: 600;">${requirementDescription}</p>
      <p style="margin: 8px 0 0; color: #dc2626; font-size: 14px; font-weight: 600;">Status: OVERDUE</p>
    </div>
    <p style="color: #4b5563; font-size: 14px;">Address this immediately to avoid compliance issues.</p>
    ${ctaButton("Take Action Now", projectUrl, "#dc2626")}
  `);

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `OVERDUE: ${requirementDescription} — ${projectName}`,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send overdue alert email:", err);
  }
}
