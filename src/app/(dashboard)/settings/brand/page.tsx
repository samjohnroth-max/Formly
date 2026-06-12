import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { BrandSettingsForm } from "@/components/settings/BrandSettingsForm";

export const revalidate = 0;

export default async function BrandSettingsPage() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  const brand = user?.accountId
    ? await db.brandSettings.findUnique({ where: { accountId: user.accountId } })
    : null;

  const defaults = {
    id: null,
    companyName: "",
    primaryColor: "#2563eb",
    secondaryColor: "#f3f4f6",
    logoUrl: "",
    fontFamily: "Inter",
    buttonStyle: "rounded",
    footerText: "",
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Brand settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your brand is applied to all email templates — logo, colors, fonts, and footer.
        </p>
      </div>
      <BrandSettingsForm initial={brand ?? defaults} />
    </div>
  );
}
