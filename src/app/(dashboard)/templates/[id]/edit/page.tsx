import { notFound } from "next/navigation";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { TemplateBuilder, type Block } from "@/components/templates/TemplateBuilder";

export default async function EditTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId) notFound();

  const template = await db.emailTemplate.findFirst({
    where: { id: params.id, accountId: user.accountId },
  });
  if (!template) notFound();

  return (
    <TemplateBuilder
      templateId={template.id}
      initialName={template.name}
      initialSubject={template.subject}
      initialBody={template.body}
      initialBlocks={template.blocks as unknown as Block[] | undefined}
    />
  );
}
