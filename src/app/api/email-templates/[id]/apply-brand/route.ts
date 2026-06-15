import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { renderBlocksToHtml, type Block, type TemplateConfig } from "@/components/templates/renderEmail";

async function getAccountId(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { accountId: true } });
  return user?.accountId ?? null;
}

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const template = await db.emailTemplate.findFirst({ where: { id: params.id, accountId } });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const brand = await db.brandSettings.findFirst({ where: { accountId, clientId: null } });
  if (!brand) return NextResponse.json({ error: "No brand settings saved yet" }, { status: 400 });

  const blocks = (template.blocks ?? []) as unknown as Block[];
  const branded = blocks.map((b) => {
    if (b.type === "button") return { ...b, bgColor: brand.primaryColor };
    return b;
  });

  const config = (template.config ?? {}) as TemplateConfig;
  const brandedConfig: TemplateConfig = { ...config, fontFamily: brand.fontFamily };

  const body = renderBlocksToHtml(branded, brandedConfig, brand);

  await db.emailTemplate.updateMany({
    where: { id: params.id, accountId },
    data: { blocks: branded as unknown as object[], config: brandedConfig as unknown as object, body },
  });

  return NextResponse.json({ success: true });
}
