import Link from "next/link";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Plus, FileText, Star, Edit2 } from "lucide-react";
import { TemplateDeleteButton } from "@/components/templates/TemplateDeleteButton";
import { ApplyBrandButton } from "@/components/templates/ApplyBrandButton";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 0;

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "blue" | "green" | "amber" | "purple";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400 dark:text-[#8B90A0]">{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${styles[color]}`}>
        {value}
      </span>
    </div>
  );
}

export default async function TemplatesPage() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  const [templates, brand, emailEvents] = await Promise.all([
    user?.accountId
      ? db.emailTemplate.findMany({
          where: { accountId: user.accountId },
          select: { id: true, name: true, subject: true, isDefault: true, updatedAt: true },
          orderBy: [{ isDefault: "desc" }, { name: "asc" }],
        })
      : Promise.resolve([]),
    user?.accountId
      ? db.brandSettings.findFirst({ where: { accountId: user.accountId, clientId: null } })
      : Promise.resolve(null),
    user?.accountId
      ? db.emailEvent.findMany({
          where: { accountId: user.accountId },
          select: { templateId: true, eventType: true },
        })
      : Promise.resolve([]),
  ]);

  function templateStats(templateId: string) {
    const events = emailEvents.filter((e) => e.templateId === templateId);
    const sent = events.filter((e) => e.eventType === "SENT").length;
    const opened = events.filter((e) => e.eventType === "OPENED").length;
    const clicked = events.filter(
      (e) => e.eventType === "CLICKED" || e.eventType === "BOOKING_CLICKED"
    ).length;
    const bookingClicked = events.filter((e) => e.eventType === "BOOKING_CLICKED").length;
    return {
      sent,
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : null,
      clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : null,
      bookingClickRate: sent > 0 ? Math.round((bookingClicked / sent) * 100) : null,
    };
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-[#F0F4FF]">Follow-ups</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#8B90A0]">Automated follow-up emails sent to leads from your campaigns</p>
        </div>
        <Link
          href="/templates/new"
          className="flex items-center gap-2 rounded-md bg-gray-900 dark:bg-[#3B7DD8] px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:hover:bg-[#2E6BBF]"
        >
          <Plus className="size-4" />
          New template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-[#2A2D3E] p-12 text-center">
          <FileText className="mx-auto mb-3 size-8 text-gray-300 dark:text-[#2A2D3E]" />
          <p className="text-sm text-gray-500 dark:text-[#8B90A0]">No follow-ups yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => {
            const stats = templateStats(t.id);
            return (
              <div key={t.id} className="rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] px-5 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF]">{t.name}</span>
                      {t.isDefault && (
                        <span className="flex items-center gap-0.5 rounded-full border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                          <Star className="size-2.5" /> Default
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-[#8B90A0]">{t.subject}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-[#8B90A0]">
                    Updated {formatDistanceToNow(t.updatedAt, { addSuffix: true })}
                  </span>
                  <div className="flex items-center gap-2">
                    {brand && <ApplyBrandButton templateId={t.id} />}
                    <Link
                      href={`/templates/${t.id}/edit`}
                      className="flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-[#2A2D3E] dark:text-[#8B90A0] px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:hover:bg-white/10"
                    >
                      <Edit2 className="size-3" /> Edit
                    </Link>
                    <TemplateDeleteButton id={t.id} name={t.name} />
                  </div>
                </div>
                <div
                  className="mt-3 flex items-center gap-4 border-t border-gray-100 dark:border-[#2A2D3E] pt-3"
                  title={stats.sent === 0 ? "Stats will appear after your first email is sent" : undefined}
                >
                  <StatPill label="Sent" value={stats.sent.toLocaleString()} color="blue" />
                  <StatPill
                    label="Open rate"
                    value={stats.openRate !== null ? `${stats.openRate}%` : "—"}
                    color={stats.openRate !== null && stats.openRate >= 30 ? "green" : "amber"}
                  />
                  <StatPill label="Click rate" value={stats.clickRate !== null ? `${stats.clickRate}%` : "—"} color="purple" />
                  <StatPill label="Booking clicks" value={stats.bookingClickRate !== null ? `${stats.bookingClickRate}%` : "—"} color="green" />
                  {stats.sent === 0 && (
                    <span className="ml-auto text-xs text-gray-400 dark:text-[#8B90A0] italic">
                      Stats appear after first send
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
