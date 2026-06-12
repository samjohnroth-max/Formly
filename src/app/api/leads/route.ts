import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  const { searchParams } = req.nextUrl;
  const campaignId = searchParams.get("campaignId");
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 50;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId) return NextResponse.json({ leads: [], total: 0 });

  const where = {
    accountId: user.accountId,
    ...(campaignId ? { campaignId } : {}),
    ...(status ? { routingStatus: status as never } : {}),
  };

  const [leads, total] = await Promise.all([
    db.lead.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        routingStatus: true,
        emailStatus: true,
        capiStatus: true,
        stMatchedCustomer: true,
        stCustomerId: true,
        stJobId: true,
        stLeadId: true,
        createdAt: true,
        campaign: {
          select: { name: true, destinationType: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.lead.count({ where }),
  ]);

  return NextResponse.json({ leads, total, page, pageSize });
}
