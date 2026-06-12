import Link from "next/link";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Plus, FileText, Star, Edit2 } from "lucide-react";
import { TemplateDeleteButton } from "@/components/templates/TemplateDeleteButton";
import { ApplyBrandButton } from "@/components/templates/ApplyBrandButton";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 0;

export default async function TemplatesPage() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  const [templates, brand] = await Promise.all([
    user?.accountId
      ? db.emailTemplate.findMany({
          where: { accountId: user.accountId },
          select: { id: true, name: true, subject: true, isDefault: true, updatedAt: true },
          orderBy: [{ isDefault: "desc" }, { name: "asc" }],
        })
      : Promise.resolve([]),
    user?.accountId
      ? db.brandSettings.findUnique({ where: { accountId: user.accountId } })
      : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-[#F0F4FF]">Email Templates</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#8B90A0]">Templates used for lead notifications in campaigns</p>
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
          <p className="text-sm text-gray-500 dark:text-[#8B90A0]">No templates yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] px-5 py-4 shadow-sm">
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
          ))}
        </div>
      )}
    </div>
  );
}
