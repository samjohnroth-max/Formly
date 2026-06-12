import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { emailService } from "@/lib/email";
import { renderBlocksToHtml, type Block, type TemplateConfig } from "@/components/templates/renderEmail";

export async function POST(req: Request) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, accountId: true },
  });
  if (!user?.email) return NextResponse.json({ error: "No email on account" }, { status: 400 });

  const { blocks, subject, config } = await req.json() as {
    blocks: Block[];
    subject: string;
    config?: TemplateConfig;
  };

  const brand = user.accountId
    ? await db.brandSettings.findUnique({ where: { accountId: user.accountId } })
    : null;

  const html = renderBlocksToHtml(blocks, config, brand ?? undefined);

  await emailService.sendRaw({
    to: user.email,
    subject: `[Test] ${subject || "Email preview"}`,
    html,
  });

  return NextResponse.json({ sent: true });
}
