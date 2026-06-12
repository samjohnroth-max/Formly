import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { SendingDomainSettings } from "./SendingDomainSettings";

export const revalidate = 0;

export default async function SettingsPage() {
  const session = await getRequiredSession();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-2xl p-8 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Settings</h1>

      {/* Account info */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Account</h2>
        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500">Name</dt>
            <dd className="text-sm font-medium text-gray-900">{user?.name ?? "—"}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="text-sm font-medium text-gray-900">{user?.email ?? "—"}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500">Role</dt>
            <dd className="text-sm font-medium text-gray-900 capitalize">
              {user?.role?.toLowerCase() ?? "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500">Member since</dt>
            <dd className="text-sm font-medium text-gray-900">
              {user?.createdAt
                ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(user.createdAt)
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Change password */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Change password</h2>
        <p className="text-xs text-gray-500 mb-5">You must enter your current password to set a new one.</p>
        <div className="max-w-sm">
          <ChangePasswordForm />
        </div>
      </div>

      {/* Email sending domain */}
      <SendingDomainSettings />
    </div>
  );
}
