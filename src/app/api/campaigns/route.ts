import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

const fieldMappingSchema = z.object({
  metaField: z.string().min(1),
  stField: z.string().min(1),
  transform: z.string().optional(),
});

const createSchema = z.object({
  name: z.string().min(1),
  metaConnectionId: z.string().min(1),
  metaAdAccountId: z.string().min(1),
  metaFormId: z.string().min(1),
  metaFormName: z.string().min(1),
  stConnectionId: z.string().min(1),
  destinationType: z.enum(["BOOKING", "LEAD", "FOLLOWUP"]),
  jobType: z.string().optional(),
  businessUnit: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().optional(),
  followupDays: z.number().int().min(0).default(0),
  capiEnabled: z.boolean().default(true),
  campaignTag: z.string().optional(),
  emailTemplateId: z.string().nullable().optional(),
  fieldMappings: z.array(fieldMappingSchema).min(1),
});

export async function GET() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { accountId: true } });
  if (!user?.accountId) return NextResponse.json({ campaigns: [] });

  const campaigns = await db.campaign.findMany({
    where: { accountId: user.accountId, status: { not: "ARCHIVED" } },
    include: {
      _count: { select: { leads: true } },
      metaConnection: { select: { metaAccountName: true } },
      stConnection: { select: { tenantName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { accountId: true } });
  if (!user?.accountId) return NextResponse.json({ error: "No account" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { fieldMappings, ...campaignData } = parsed.data;

  // Verify connections belong to this account
  const [metaConn, stConn] = await Promise.all([
    db.metaConnection.findFirst({ where: { id: campaignData.metaConnectionId, accountId: user.accountId } }),
    db.sTConnection.findFirst({ where: { id: campaignData.stConnectionId, accountId: user.accountId } }),
  ]);
  if (!metaConn || !stConn) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  const campaign = await db.campaign.create({
    data: {
      ...campaignData,
      accountId: user.accountId,
      emailTemplateId: campaignData.emailTemplateId ?? null,
      fieldMappings: {
        create: fieldMappings.map((m) => ({
          metaField: m.metaField,
          stField: m.stField,
          transform: m.transform ?? null,
        })),
      },
    },
    include: { fieldMappings: true },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
