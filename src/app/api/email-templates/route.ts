import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

async function getAccountId(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { accountId: true },
  });
  return user?.accountId ?? null;
}

export async function GET() {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ templates: [] });

  const templates = await db.emailTemplate.findMany({
    where: { accountId },
    select: { id: true, name: true, subject: true, isDefault: true, updatedAt: true },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId)
    return NextResponse.json({ error: "No account" }, { status: 400 });

  const { name, subject, body, blocks } = await req.json();
  if (!name?.trim() || !subject?.trim() || !body?.trim())
    return NextResponse.json(
      { error: "name, subject, and body are required" },
      { status: 400 }
    );

  const template = await db.emailTemplate.create({
    data: {
      accountId,
      name: name.trim(),
      subject: subject.trim(),
      body: body.trim(),
      ...(blocks !== undefined && { blocks }),
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
