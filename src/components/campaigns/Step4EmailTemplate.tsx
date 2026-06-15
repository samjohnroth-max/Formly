"use client";

import { useEffect, useState } from "react";
import { Mail, SkipForward, Loader2 } from "lucide-react";
import type { WizardState } from "@/types/db";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  isDefault: boolean;
}

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}

export function Step4EmailTemplate({ state, onChange }: Props) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/email-templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Optionally send a follow-up email to every lead. You can skip this and configure it later.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="size-4 animate-spin" /> Loading follow-ups…
        </div>
      ) : (
        <div className="space-y-2">
          {/* Skip option */}
          <TemplateOption
            selected={state.emailTemplateId === null}
            onSelect={() => onChange({ emailTemplateId: null })}
            icon={<SkipForward className="size-5 text-gray-400" />}
            title="Skip — no email"
            subtitle="Don't send an email for leads from this campaign"
          />

          {templates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
              <p className="text-sm text-gray-500">No follow-ups yet.</p>
              <a href="/templates/new" className="mt-1 block text-sm text-blue-600 hover:underline">
                Create a follow-up →
              </a>
            </div>
          ) : (
            templates.map((t) => (
              <TemplateOption
                key={t.id}
                selected={state.emailTemplateId === t.id}
                onSelect={() => onChange({ emailTemplateId: t.id })}
                icon={<Mail className="size-5 text-blue-500" />}
                title={t.name}
                subtitle={`Subject: ${t.subject}`}
                badge={t.isDefault ? "Default" : undefined}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TemplateOption({
  selected,
  onSelect,
  icon,
  title,
  subtitle,
  badge,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
        selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
          {title}
          {badge && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{badge}</span>
          )}
        </p>
        <p className="truncate text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <div className={`size-4 rounded-full border-2 shrink-0 ${selected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
        {selected && <span className="block size-2 m-0.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}
