import { Resend } from "resend";

interface AlertParams {
  to: string;
  subject: string;
  body: string;
}

/** Sends a plain-text alert email to an account owner. Fire-and-forget. */
export async function sendDLQAlert(params: AlertParams): Promise<void> {
  if (!process.env.AUTH_RESEND_KEY) return;
  try {
    const resend = new Resend(process.env.AUTH_RESEND_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Formly <noreply@formly.app>",
      to: params.to,
      subject: params.subject,
      html: `<p>${params.body.replace(/\n/g, "<br>")}</p><hr><p style="font-size:12px;color:#888">Sent by Formly lead routing.</p>`,
    });
  } catch (err) {
    console.error("[alerts] Failed to send DLQ alert:", err);
  }
}

/** Builds and sends a dead-letter alert when a lead fails all retry attempts. */
export async function sendLeadFailureAlert(
  accountEmail: string,
  metaLeadId: string,
  error: string
): Promise<void> {
  await sendDLQAlert({
    to: accountEmail,
    subject: "Formly: Lead routing failed",
    body: [
      `A lead could not be routed after all retry attempts.`,
      ``,
      `Meta Lead ID: ${metaLeadId}`,
      `Error: ${error}`,
      ``,
      `Log in to Formly to review the lead and retry manually.`,
    ].join("\n"),
  });
}
