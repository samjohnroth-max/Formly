import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const DEFAULT_TEMPLATES = [
  {
    name: "Lead Confirmation",
    subject: "We received your request, {{first_name}}!",
    body: `Hi {{first_name}},

Thanks for reaching out to {{company_name}}! We've received your request and our team will be in touch shortly.

If you have any questions in the meantime, feel free to reach out to us directly.

Best regards,
The {{company_name}} Team`,
  },
  {
    name: "Booking Confirmed",
    subject: "Your appointment is confirmed, {{first_name}}!",
    body: `Hi {{first_name}},

Great news — your appointment is confirmed!

Job Number: {{job_number}}
Service: {{service_interest}}
Appointment: {{appointment_date}}

If you need to reschedule or have any questions, please don't hesitate to contact us.

See you soon!
The {{company_name}} Team`,
  },
  {
    name: "24hr Follow-Up",
    subject: "Still thinking it over, {{first_name}}?",
    body: `Hi {{first_name}},

We noticed you recently reached out about {{service_interest}} and wanted to follow up.

Our team at {{company_name}} is ready to get you scheduled at a time that works for you. We'd love to help!

Give us a call or simply reply to this email and we'll take care of the rest.

Best,
The {{company_name}} Team`,
  },
];

async function main() {
  const account = await db.account.upsert({
    where: { email: "dev@formly.app" },
    update: {},
    create: {
      email: "dev@formly.app",
      name: "Formly Dev",
      plan: "STARTER",
    },
  });

  console.log(`Using account: ${account.id}`);

  for (const template of DEFAULT_TEMPLATES) {
    await db.emailTemplate.upsert({
      where: {
        accountId_name: {
          accountId: account.id,
          name: template.name,
        },
      },
      update: { subject: template.subject, body: template.body },
      create: {
        accountId: account.id,
        name: template.name,
        subject: template.subject,
        body: template.body,
        isDefault: true,
      },
    });
    console.log(`Seeded: ${template.name}`);
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
