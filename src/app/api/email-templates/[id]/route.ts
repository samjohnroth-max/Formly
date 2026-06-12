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

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId)
    return NextResponse.json({ error: "No account" }, { status: 400 });

  const template = await db.emailTemplate.findFirst({
    where: { id: params.id, accountId },
  });
  if (!template)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ template });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId)
    return NextResponse.json({ error: "No account" }, { status: 400 });

  const { name, subject, body, blocks, config } = await req.json();

  const result = await db.emailTemplate.updateMany({
    where: { id: params.id, accountId },
    data: {
      ...(name !== undefined && { name }),
      ...(subject !== undefined && { subject }),
      ...(body !== undefined && { body }),
      ...(blocks !== undefined && { blocks }),
      ...(config !== undefined && { config }),
    },
  });
  if (result.count === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const template = await db.emailTemplate.findUnique({
    where: { id: params.id },
  });
  return NextResponse.json({ template });
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId)
    return NextResponse.json({ error: "No account" }, { status: 400 });

  await db.emailTemplate.deleteMany({ where: { id: params.id, accountId } });
  return new NextResponse(null, { status: 204 });
}
