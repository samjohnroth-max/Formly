import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { emailService } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true, name: true, email: true },
  });

  if (!user?.accountId) {
    return NextResponse.json({ error: "No account" }, { status: 400 });
  }

  const body = await req.json();
  const { subject, category, description } = body as {
    subject: string;
    category: string;
    description: string;
  };

  if (!subject?.trim() || !category?.trim() || !description?.trim()) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const ticket = await db.supportTicket.create({
    data: {
      accountId: user.accountId,
      userId: session.user.id,
      subject: subject.trim(),
      category: category.trim(),
      description: description.trim(),
    },
  });

  await emailService.sendRaw({
    to: "samjohnroth@gmail.com",
    subject: `[Formly Support] ${subject.trim()}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 8px;font-size:18px;color:#111827">New Support Ticket</h2>
        <p style="margin:0 0 20px;color:#6b7280;font-size:14px">Ticket ID: ${ticket.id}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#6b7280;width:120px">From</td><td style="padding:8px 0;color:#111827">${user.name ?? "Unknown"} &lt;${user.email ?? "—"}&gt;</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Category</td><td style="padding:8px 0;color:#111827">${category}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Subject</td><td style="padding:8px 0;color:#111827;font-weight:600">${subject}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb">
          <p style="margin:0;font-size:14px;color:#374151;white-space:pre-wrap">${description.trim()}</p>
        </div>
        <p style="margin-top:20px;font-size:12px;color:#9ca3af">Formly Support System</p>
      </div>
    `,
  });

  return NextResponse.json({ id: ticket.id });
}

export async function GET() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  if (!user?.accountId) {
    return NextResponse.json({ tickets: [] });
  }

  const tickets = await db.supportTicket.findMany({
    where: { accountId: user.accountId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      subject: true,
      category: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ tickets });
}
