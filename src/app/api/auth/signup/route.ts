import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { renderBlocksToHtml } from "@/components/templates/renderEmail";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const DEFAULT_TEMPLATES = [
  {
    name: "Lead Confirmation",
    subject: "We received your request, {{first_name}}!",
    blocks: [
      { id: "t1-b1", type: "header" as const, content: "Hi {{first_name}}, we received your request!", size: "h2" as const, align: "center" as const },
      { id: "t1-b2", type: "text" as const, content: "Thanks for reaching out to {{company_name}}! We've received your request and our team will be in touch shortly.\n\nIf you have any questions in the meantime, feel free to reply to this email.", align: "center" as const },
      { id: "t1-b3", type: "button" as const, content: "Book Your Appointment", href: "https://", align: "center" as const, bgColor: "#2563eb", borderRadius: 6 },
      { id: "t1-b4", type: "divider" as const, content: "" },
      { id: "t1-b5", type: "text" as const, content: "Best regards,\nThe {{company_name}} Team", align: "center" as const, fontSize: 13, textColor: "#6b7280", italic: true },
    ],
  },
  {
    name: "Booking Confirmed",
    subject: "Your appointment is confirmed, {{first_name}}!",
    blocks: [
      { id: "t2-b1", type: "header" as const, content: "Great news — your appointment is confirmed!", size: "h2" as const, align: "center" as const },
      { id: "t2-b2", type: "text" as const, content: "Job Number: {{job_number}}\nService: {{service_interest}}\nAppointment: {{appointment_date}}", align: "left" as const },
      { id: "t2-b3", type: "text" as const, content: "If you need to reschedule or have any questions, please don't hesitate to contact us.", align: "left" as const },
      { id: "t2-b4", type: "divider" as const, content: "" },
      { id: "t2-b5", type: "text" as const, content: "See you soon!\nThe {{company_name}} Team", align: "center" as const, fontSize: 13, textColor: "#6b7280", italic: true },
    ],
  },
  {
    name: "24hr Follow-Up",
    subject: "Still thinking it over, {{first_name}}?",
    blocks: [
      { id: "t3-b1", type: "header" as const, content: "Still thinking it over, {{first_name}}?", size: "h2" as const, align: "left" as const },
      { id: "t3-b2", type: "text" as const, content: "We noticed you recently reached out about {{service_interest}} and wanted to follow up.\n\nOur team at {{company_name}} is ready to get you scheduled at a time that works for you. We'd love to help!", align: "left" as const },
      { id: "t3-b3", type: "button" as const, content: "Schedule Now", href: "https://", align: "left" as const, bgColor: "#2563eb", borderRadius: 6 },
      { id: "t3-b4", type: "divider" as const, content: "" },
      { id: "t3-b5", type: "text" as const, content: "Best,\nThe {{company_name}} Team", align: "left" as const, fontSize: 13, textColor: "#6b7280" },
    ],
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    await db.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: { name, email, plan: "STARTER" },
      });

      await tx.user.create({
        data: {
          email,
          name,
          password: passwordHash,
          emailVerified: new Date(),
          accountId: account.id,
          role: "OWNER",
        },
      });

      // Seed default templates for every new account
      for (const tmpl of DEFAULT_TEMPLATES) {
        const htmlBody = renderBlocksToHtml(tmpl.blocks);
        await tx.emailTemplate.create({
          data: {
            accountId: account.id,
            name: tmpl.name,
            subject: tmpl.subject,
            body: htmlBody,
            blocks: tmpl.blocks,
            isDefault: true,
          },
        });
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[signup] unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
