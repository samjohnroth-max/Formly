import { Resend } from "resend";
import { db } from "@/lib/db";
import type { ProcessingContext } from "../types";

const MERGE_TAG_RE = /\{\{(\w+)\}\}/g;

function renderTemplate(
  template: string,
  vars: Record<string, string | undefined>
): string {
  return template.replace(MERGE_TAG_RE, (_, key) => vars[key] ?? "");
}

/**
 * Sends a confirmation email to the lead using the campaign's email template.
 * Non-blocking: failure updates emailStatus=FAILED but does not throw.
 */
export async function sendEmail(ctx: ProcessingContext): Promise<void> {
  const { campaign, leadId } = ctx;
  if (!campaign || !leadId) return;
  if (!campaign.emailTemplate) return; // No template configured — skip
  if (!ctx.email) {
    await db.lead.update({ where: { id: leadId }, data: { emailStatus: "SKIPPED" } });
    return;
  }

  const vars: Record<string, string | undefined> = {
    firstName: ctx.firstName,
    lastName: ctx.lastName,
    email: ctx.email,
    phone: ctx.phone,
    zip: ctx.zip,
    city: ctx.city,
    state: ctx.state,
    campaignName: "Formly",
  };

  try {
    const resend = new Resend(process.env.AUTH_RESEND_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Formly <noreply@formly.app>",
      to: ctx.email,
      subject: renderTemplate(campaign.emailTemplate.subject, vars),
      html: renderTemplate(campaign.emailTemplate.body, vars),
    });

    if (error) throw new Error(error.message);

    await db.lead.update({
      where: { id: leadId },
      data: { emailStatus: "SENT", emailSentAt: new Date() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    console.error(`[sendEmail] lead ${leadId}:`, message);
    await db.lead.update({
      where: { id: leadId },
      data: { emailStatus: "FAILED" },
    });
    // Intentionally do not rethrow — email failure should not block lead routing
  }
}
