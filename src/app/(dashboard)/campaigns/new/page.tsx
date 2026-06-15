"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";
import { Step1MetaForm } from "@/components/campaigns/Step1MetaForm";
import { Step2Destination } from "@/components/campaigns/Step2Destination";
import { Step3FieldMapper } from "@/components/campaigns/Step3FieldMapper";
import { Step4EmailTemplate } from "@/components/campaigns/Step4EmailTemplate";
import type { WizardState } from "@/types/db";

const STEPS = [
  { label: "Meta Form", description: "Choose your ad account and form" },
  { label: "Destination", description: "Configure ServiceTitan routing" },
  { label: "Field Mapping", description: "Map form fields to ST fields" },
  { label: "Follow-up", description: "Optional follow-up email" },
];

const INITIAL: WizardState = {
  name: "",
  metaConnectionId: "",
  metaAdAccountId: "",
  metaFormId: "",
  metaFormName: "",
  stConnectionId: "",
  destinationType: "BOOKING",
  jobType: "",
  businessUnit: "",
  priority: "",
  assignedTo: "",
  followupDays: 0,
  capiEnabled: true,
  campaignTag: "",
  fieldMappings: [],
  emailTemplateId: null,
};

interface ConnectionOption {
  id: string;
  metaAccountName?: string;
  metaAccountId?: string;
  tenantName?: string;
  tenantId?: string;
}

function validateStep(step: number, state: WizardState): string | null {
  if (step === 1) {
    if (!state.name.trim()) return "Campaign name is required";
    if (!state.metaConnectionId) return "Select a Meta account";
    if (!state.metaFormId) return "Select an Instant Form";
  }
  if (step === 2) {
    if (!state.stConnectionId) return "Select a ServiceTitan tenant";
  }
  if (step === 3) {
    if (state.fieldMappings.length === 0) return "Add at least one field mapping";
    if (state.fieldMappings.some((m) => !m.metaField || !m.stField)) return "Complete all mapping rows";
  }
  return null;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(INITIAL);
  const [metaConnections, setMetaConnections] = useState<ConnectionOption[]>([]);
  const [stConnections, setSTConnections] = useState<ConnectionOption[]>([]);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/connections")
      .then((r) => r.json())
      .then((d) => {
        setMetaConnections(d.metaConnections ?? []);
        setSTConnections(d.stConnections ?? []);
      });
  }, []);

  function patch(update: Partial<WizardState>) {
    setStepError(null);
    setState((prev) => ({ ...prev, ...update }));
  }

  function next() {
    const error = validateStep(step, state);
    if (error) { setStepError(error); return; }
    setStepError(null);
    setStep((s) => Math.min(s + 1, 4));
  }

  function back() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  function submit() {
    const error = validateStep(step, state);
    if (error) { setStepError(error); return; }

    setSubmitError(null);
    startTransition(async () => {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/campaigns?created=1");
    });
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft className="size-4" /> Back to campaigns
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">New Campaign</h1>
        <p className="mt-1 text-sm text-gray-500">Connect a Meta Instant Form to ServiceTitan in 4 steps.</p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-start gap-0">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={n} className="flex flex-1 items-start">
              <div className="flex flex-col items-center">
                <div className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
                  done ? "bg-blue-600 text-white" : active ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-gray-200 text-gray-500"
                }`}>
                  {done ? <Check className="size-4" /> : n}
                </div>
                <p className={`mt-1.5 text-xs font-medium ${active ? "text-blue-600" : "text-gray-500"}`}>{s.label}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 mt-4 h-0.5 flex-1 ${done ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-900">{STEPS[step - 1].label}</h2>
          <p className="text-sm text-gray-500">{STEPS[step - 1].description}</p>
        </div>

        {step === 1 && (
          <Step1MetaForm
            state={state}
            onChange={patch}
            metaConnections={metaConnections.map((c) => ({
              id: c.id,
              metaAccountName: c.metaAccountName!,
              metaAccountId: c.metaAccountId!,
            }))}
          />
        )}
        {step === 2 && (
          <Step2Destination
            state={state}
            onChange={patch}
            stConnections={stConnections.map((c) => ({
              id: c.id,
              tenantName: c.tenantName!,
              tenantId: c.tenantId!,
            }))}
          />
        )}
        {step === 3 && <Step3FieldMapper state={state} onChange={patch} />}
        {step === 4 && <Step4EmailTemplate state={state} onChange={patch} />}

        {(stepError || submitError) && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {stepError ?? submitError}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-5 flex justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Next <ChevronRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Creating…" : "Create Campaign"}
          </button>
        )}
      </div>
    </div>
  );
}
