import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { BrandSettingsForm } from "@/components/settings/BrandSettingsForm";

export const revalidate = 0;

interface PageProps {
  searchParams: { client?: string };
}

export default async function BrandSettingsPage({ searchParams }: PageProps) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  const accountId = user?.accountId;
  if (!accountId) return null;

  const rawClientParam = searchParams.client;
  const clientId = rawClientParam && rawClientParam !== "default" ? rawClientParam : null;

  const [clients, brand] = await Promise.all([
    db.client.findMany({
      where: { accountId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.brandSettings.findFirst({ where: { accountId, clientId } }),
  ]);

  const defaults = {
    id: null,
    clientId: null,
    companyName: "",
    primaryColor: "#2563eb",
    secondaryColor: "#f3f4f6",
    logoUrl: "",
    fontFamily: "Inter",
    buttonStyle: "rounded",
    footerText: "",
    replyToEmail: "",
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Brand settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure branding per client. The default profile applies to all clients that don&apos;t have their own brand settings.
        </p>
      </div>
      <BrandSettingsForm
        initial={brand
          ? { ...brand, replyToEmail: brand.replyToEmail ?? "" }
          : defaults
        }
        clients={clients}
        activeClientId={clientId}
      />
    </div>
  );
}
