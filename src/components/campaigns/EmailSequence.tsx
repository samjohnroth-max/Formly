"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Mail, Clock, CheckCircle, Briefcase, Zap } from "lucide-react";

export interface SequenceStep {
  stepNumber: number;
  triggerType: string;
  triggerDelay: number;
  label: string;
  enabled: boolean;
  emailTemplateId: string | null;
  emailTemplate: { id: string; name: string; subject: string } | null;
}

interface Template {
  id: string;
  name: string;
  subject: string;
}

interface Props {
  campaignId: string;
  initialSteps: SequenceStep[];
  templates: Template[];
}

function triggerIcon(type: string) {
  switch (type) {
    case "IMMEDIATE":        return <Zap className="size-4 text-blue-500" />;
    case "HOURS_AFTER":      return <Clock className="size-4 text-amber-500" />;
    case "BOOKING_CONFIRMED": return <CheckCircle className="size-4 text-green-500" />;
    case "JOB_COMPLETE":     return <Briefcase className="size-4 text-purple-500" />;
    default:                 return <Mail className="size-4 text-gray-400" />;
  }
}

export function EmailSequence({ campaignId, initialSteps, templates }: Props) {
  const router = useRouter();
  const [steps, setSteps] = useState<SequenceStep[]>(initialSteps);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function setStep(stepNumber: number, patch: Partial<SequenceStep>) {
    setSteps((prev) =>
      prev.map((s) =>
        s.stepNumber === stepNumber
          ? {
              ...s,
              ...patch,
              emailTemplate:
                "emailTemplateId" in patch
                  ? templates.find((t) => t.id === patch.emailTemplateId) ?? null
                  : s.emailTemplate,
            }
          : s
      )
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/campaigns/${campaignId}/sequence`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: steps.map(({ stepNumber, enabled, emailTemplateId }) => ({ stepNumber, enabled, emailTemplateId })) }),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Email sequence</h2>
          <p className="mt-0.5 text-xs text-gray-500">Up to 5 automated emails per lead journey. Enable each step and assign a template.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          <Save className="size-3.5" />
          {saving ? "Saving…" : saved ? "Saved!" : "Save sequence"}
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {steps.map((step, i) => (
          <div key={step.stepNumber} className={`flex items-start gap-4 px-6 py-4 ${!step.enabled ? "opacity-60" : ""}`}>
            {/* Step number + connector */}
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.enabled ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}>
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="w-px flex-1 bg-gray-200" style={{ minHeight: "24px" }} />}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {triggerIcon(step.triggerType)}
                <span className="text-sm font-medium text-gray-900">{step.label}</span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <select
                  value={step.emailTemplateId ?? ""}
                  onChange={(e) => setStep(step.stepNumber, { emailTemplateId: e.target.value || null })}
                  disabled={!step.enabled}
                  className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                >
                  <option value="">— No template assigned —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                {step.emailTemplate && step.enabled && (
                  <p className="text-xs text-gray-400 truncate max-w-xs">{step.emailTemplate.subject}</p>
                )}
              </div>
            </div>

            {/* Toggle */}
            <div className="shrink-0 pt-1">
              <button
                onClick={() => setStep(step.stepNumber, { enabled: !step.enabled })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${step.enabled ? "bg-blue-600" : "bg-gray-200"}`}
                title={step.enabled ? "Disable this step" : "Enable this step"}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${step.enabled ? "translate-x-4" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
