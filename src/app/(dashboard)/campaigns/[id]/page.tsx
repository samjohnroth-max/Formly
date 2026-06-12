import { notFound } from "next/navigation";
import Link from "next/link";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ArrowLeft, Megaphone, Link2, Users } from "lucide-react";
import { EmailSequence } from "@/components/campaigns/EmailSequence";
import { SEQUENCE_DEFAULTS } from "@/lib/email-sequence";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 0;

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId) notFound();

  const [campaign, savedSequence, templates] = await Promise.all([
    db.campaign.findFirst({
      where: { id: params.id, accountId: user.accountId },
      include: {
        metaConnection: { select: { metaAccountName: true } },
        stConnection: { select: { tenantName: true } },
        _count: { select: { leads: true } },
      },
    }),
    db.campaignEmailSequence.findMany({
      where: { campaignId: params.id },
      include: { emailTemplate: { select: { id: true, name: true, subject: true } } },
      orderBy: { stepNumber: "asc" },
    }),
    db.emailTemplate.findMany({
      where: { accountId: user.accountId },
      select: { id: true, name: true, subject: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!campaign) notFound();

  const savedMap = Object.fromEntries(savedSequence.map((s) => [s.stepNumber, s]));
  const steps = SEQUENCE_DEFAULTS.map((def) => {
    const s = savedMap[def.stepNumber];
    return {
      stepNumber: def.stepNumber,
      triggerType: def.triggerType as string,
      triggerDelay: def.triggerDelay,
      label: def.label,
      enabled: s?.enabled ?? false,
      emailTemplateId: s?.emailTemplateId ?? null,
      emailTemplate: s?.emailTemplate ?? null,
    };
  });

  const DEST_LABEL: Record<string, string> = {
    BOOKING: "Booking",
    LEAD: "Lead",
    FOLLOWUP: "Follow-up",
  };
  const STATUS_COLOR: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700",
    PAUSED: "bg-yellow-50 text-yellow-700",
    ARCHIVED: "bg-gray-50 text-gray-500",
  };

  return (
    <div className="mx-auto max-w-3xl p-8 space-y-6">
      {/* Back */}
      <Link href="/campaigns" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="size-4" /> All campaigns
      </Link>

      {/* Campaign header */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold text-gray-900">{campaign.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[campaign.status]}`}>
                {campaign.status.charAt(0) + campaign.status.slice(1).toLowerCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500">{campaign.metaFormName}</p>
          </div>
          <span className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-500">
            {DEST_LABEL[campaign.destinationType] ?? campaign.destinationType}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Link2 className="size-4 text-gray-400" />
            <div>
              <dt className="text-xs text-gray-400">Meta account</dt>
              <dd className="font-medium text-gray-900">{campaign.metaConnection.metaAccountName}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Megaphone className="size-4 text-gray-400" />
            <div>
              <dt className="text-xs text-gray-400">ServiceTitan</dt>
              <dd className="font-medium text-gray-900">{campaign.stConnection.tenantName}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="size-4 text-gray-400" />
            <div>
              <dt className="text-xs text-gray-400">Total leads</dt>
              <dd className="font-medium text-gray-900">{campaign._count.leads.toLocaleString()}</dd>
            </div>
          </div>
        </dl>

        <p className="mt-3 text-xs text-gray-400">
          Created {formatDistanceToNow(campaign.createdAt, { addSuffix: true })}
        </p>
      </div>

      {/* Email sequence */}
      <EmailSequence
        campaignId={campaign.id}
        initialSteps={steps}
        templates={templates}
      />
    </div>
  );
}
