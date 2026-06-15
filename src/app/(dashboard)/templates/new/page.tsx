import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NewTemplateFlow } from "./NewTemplateFlow";

export default async function NewTemplatePage() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  const brand = user?.accountId
    ? await db.brandSettings.findFirst({ where: { accountId: user.accountId, clientId: null } })
    : null;

  const brandSettings = brand ?? {
    companyName: "",
    primaryColor: "#2563eb",
    secondaryColor: "#f3f4f6",
    logoUrl: "",
    fontFamily: "Inter",
    buttonStyle: "rounded",
    footerText: "",
  };

  return <NewTemplateFlow brandSettings={brandSettings} />;
}
