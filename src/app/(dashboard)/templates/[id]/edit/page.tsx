import { notFound } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { TemplateBuilder } from "@/components/templates/TemplateBuilder";
import type { Block, TemplateConfig } from "@/components/templates/renderEmail";

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId) notFound();

  const [template, brand] = await Promise.all([
    db.emailTemplate.findFirst({ where: { id: params.id, accountId: user.accountId } }),
    db.brandSettings.findUnique({ where: { accountId: user.accountId } }),
  ]);
  if (!template) notFound();

  const brandSettings = brand ?? {
    companyName: "",
    primaryColor: "#2563eb",
    secondaryColor: "#f3f4f6",
    logoUrl: "",
    fontFamily: "Inter",
    buttonStyle: "rounded",
    footerText: "",
  };

  return (
    <TemplateBuilder
      templateId={template.id}
      initialName={template.name}
      initialSubject={template.subject}
      initialBody={template.body}
      initialBlocks={template.blocks as unknown as Block[] | undefined}
      initialConfig={template.config as unknown as TemplateConfig | undefined}
      brandSettings={brandSettings}
    />
  );
}
