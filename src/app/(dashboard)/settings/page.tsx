import Link from "next/link";
import { Palette } from "lucide-react";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { SendingDomainSettings } from "./SendingDomainSettings";
import { ThemeSettingsCard } from "./ThemeSettingsCard";
import { ServiceAreaSettings } from "@/components/settings/ServiceAreaSettings";

export const revalidate = 0;

export default async function SettingsPage() {
  const session = await getRequiredSession();

  const [user, serviceArea] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, role: true, createdAt: true, accountId: true },
    }),
    (async () => {
      const u = await db.user.findUnique({ where: { id: session.user.id }, select: { accountId: true } });
      if (!u?.accountId) return null;
      return db.serviceArea.findUnique({ where: { accountId: u.accountId } });
    })(),
  ]);

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-[#F0F4FF]">Settings</h1>

      {/* Account info */}
      <div className="rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-[#F0F4FF] mb-4">Account</h2>
        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500 dark:text-[#8B90A0]">Name</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF]">{user?.name ?? "—"}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500 dark:text-[#8B90A0]">Email</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF]">{user?.email ?? "—"}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500 dark:text-[#8B90A0]">Role</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF] capitalize">
              {user?.role?.toLowerCase() ?? "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500 dark:text-[#8B90A0]">Member since</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF]">
              {user?.createdAt
                ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(user.createdAt)
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Appearance */}
      <ThemeSettingsCard />

      {/* Change password */}
      <div className="rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-[#F0F4FF] mb-1">Change password</h2>
        <p className="text-xs text-gray-500 dark:text-[#8B90A0] mb-5">You must enter your current password to set a new one.</p>
        <div className="max-w-sm">
          <ChangePasswordForm />
        </div>
      </div>

      {/* Brand */}
      <Link
        href="/settings/brand"
        className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-sm p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
      >
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-[#F0F4FF] flex items-center gap-2">
            <Palette className="size-4 text-gray-500 dark:text-[#8B90A0]" />
            Brand settings
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-[#8B90A0]">Logo, colors, fonts, and email footer for all templates.</p>
        </div>
        <span className="text-xs text-blue-600 dark:text-[#3B7DD8] group-hover:underline">Configure →</span>
      </Link>

      {/* Service area */}
      <ServiceAreaSettings initial={serviceArea} />

      {/* Email sending domain */}
      <SendingDomainSettings />
    </div>
  );
}
