import { Resend } from "resend";
import { db } from "@/lib/db";
import { signTrackingToken } from "@/lib/tracking/token";
import type { ProcessingContext } from "../types";

const MERGE_TAG_RE = /\{\{(\w+)\}\}/g;

function renderTemplate(
  template: string,
  vars: Record<string, string | undefined>
): string {
  return template.replace(MERGE_TAG_RE, (_, key) => vars[key] ?? "");
}

function appBaseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "https://formlyleads.com").replace(/\/$/, "");
}

function injectTrackingPixel(html: string, pixelUrl: string): string {
  const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
  if (html.includes("</body>")) {
    return html.replace("</body>", `${pixel}</body>`);
  }
  return html + pixel;
}

function wrapLinks(html: string, clickToken: string, base: string): string {
  return html.replace(/href="([^"]+)"/g, (match, url: string) => {
    if (url === "#" || url.startsWith("mailto:") || url.startsWith("tel:")) {
      return match;
    }
    const trackUrl = `${base}/api/track/click?token=${clickToken}&url=${encodeURIComponent(url)}`;
    return `href="${trackUrl}"`;
  });
}

/**
 * Sends a confirmation email to the lead using the campaign's email template.
 * Non-blocking: failure updates emailStatus=FAILED but does not throw.
 */
export async function sendEmail(ctx: ProcessingContext): Promise<void> {
  const { campaign, leadId } = ctx;
  if (!campaign || !leadId) return;
  if (!campaign.emailTemplate) return;
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

  // Resolve Reply-To: client brand settings → account owner email
  let replyTo: string | undefined;
  const metaConn = await db.metaConnection.findUnique({
    where: { id: campaign.metaConnectionId },
    select: { groupId: true },
  });
  if (metaConn?.groupId) {
    const clientBrand = await db.brandSettings.findFirst({
      where: { accountId: campaign.accountId, clientId: metaConn.groupId },
      select: { replyToEmail: true },
    });
    replyTo = clientBrand?.replyToEmail ?? undefined;
  }
  if (!replyTo) {
    const owner = await db.user.findFirst({
      where: { accountId: campaign.accountId, role: "OWNER" },
      select: { email: true },
    });
    replyTo = owner?.email ?? undefined;
  }

  // Build tracking token
  const trackingToken = signTrackingToken({
    leadId,
    templateId: campaign.emailTemplate.id,
    accountId: campaign.accountId,
  });
  const base = appBaseUrl();
  const pixelUrl = `${base}/api/track/open?token=${trackingToken}`;

  let html = renderTemplate(campaign.emailTemplate.body, vars);
  html = wrapLinks(html, trackingToken, base);
  html = injectTrackingPixel(html, pixelUrl);

  try {
    const resend = new Resend(process.env.AUTH_RESEND_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Formly <noreply@formly.app>",
      to: ctx.email,
      replyTo,
      subject: renderTemplate(campaign.emailTemplate.subject, vars),
      html,
    });

    if (error) throw new Error(error.message);

    await Promise.all([
      db.lead.update({
        where: { id: leadId },
        data: { emailStatus: "SENT", emailSentAt: new Date() },
      }),
      db.emailEvent.create({
        data: {
          accountId: campaign.accountId,
          leadId,
          templateId: campaign.emailTemplate.id,
          eventType: "SENT",
        },
      }),
    ]);
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
