import { Resend } from "resend";

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailProvider {
  send(options: SendOptions): Promise<{ id?: string }>;
}

class ResendEmailProvider implements EmailProvider {
  private client: Resend;

  constructor() {
    this.client = new Resend(process.env.AUTH_RESEND_KEY!);
  }

  async send(options: SendOptions): Promise<{ id?: string }> {
    const from =
      options.from ?? process.env.EMAIL_FROM ?? "Formly <noreply@formly.app>";
    const result = await this.client.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    if (result.error) throw new Error(result.error.message);
    return { id: result.data?.id };
  }
}

export class EmailService {
  private provider: EmailProvider;

  constructor(provider?: EmailProvider) {
    this.provider = provider ?? new ResendEmailProvider();
  }

  renderTemplate(template: string, vars: Record<string, string>): string {
    return template.replace(
      /\{\{(\w+)\}\}/g,
      (_, key) => vars[key] ?? `{{${key}}}`
    );
  }

  async send(options: {
    to: string;
    subject: string;
    body: string;
    vars?: Record<string, string>;
    from?: string;
  }): Promise<{ id?: string }> {
    const vars = options.vars ?? {};
    const html = this.renderTemplate(options.body, vars).replace(
      /\n/g,
      "<br>"
    );

    return this.provider.send({
      to: options.to,
      subject: this.renderTemplate(options.subject, vars),
      html,
      from: options.from,
    });
  }
}

export const emailService = new EmailService();
