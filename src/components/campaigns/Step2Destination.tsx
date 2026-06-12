"use client";

import { useEffect, useState } from "react";
import { Loader2, Briefcase, UserCheck, Phone } from "lucide-react";
import type { WizardState, DestinationType } from "@/types/db";
import type { STJobType, STBusinessUnit } from "@/lib/servicetitan/catalog";

interface STConnectionOption {
  id: string;
  tenantName: string;
  tenantId: string;
}

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  stConnections: STConnectionOption[];
}

const PRIORITIES = ["Low", "Normal", "High", "Urgent"];

const DESTINATION_OPTIONS: Array<{
  value: DestinationType;
  label: string;
  description: string;
  icon: typeof Briefcase;
}> = [
  { value: "BOOKING", label: "Booking", description: "Creates a job in ServiceTitan with job type, business unit, and optional assignment.", icon: Briefcase },
  { value: "LEAD", label: "Lead", description: "Creates a lead record with a CSR assignment and optional follow-up days.", icon: UserCheck },
  { value: "FOLLOWUP", label: "Follow-up", description: "Looks up customer by phone/email. Adds a task if match found, falls back to Lead if not.", icon: Phone },
];

export function Step2Destination({ state, onChange, stConnections }: Props) {
  const [jobTypes, setJobTypes] = useState<STJobType[]>([]);
  const [businessUnits, setBusinessUnits] = useState<STBusinessUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.stConnectionId || state.destinationType !== "BOOKING") return;
    setLoading(true);
    setFetchError(null);
    const id = state.stConnectionId;
    Promise.all([
      fetch(`/api/st/job-types?stConnectionId=${id}`).then((r) => r.json()),
      fetch(`/api/st/business-units?stConnectionId=${id}`).then((r) => r.json()),
    ])
      .then(([jt, bu]) => {
        if (jt.error) throw new Error(jt.error);
        if (bu.error) throw new Error(bu.error);
        setJobTypes(jt.jobTypes);
        setBusinessUnits(bu.businessUnits);
      })
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, [state.stConnectionId, state.destinationType]);

  return (
    <div className="space-y-6">
      {/* ST Connection */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ServiceTitan Tenant <span className="text-red-500">*</span>
        </label>
        {stConnections.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
            No ServiceTitan tenants connected.{" "}
            <a href="/connections" className="underline">Connect one first →</a>
          </p>
        ) : (
          <select
            value={state.stConnectionId}
            onChange={(e) => onChange({ stConnectionId: e.target.value, jobType: "", businessUnit: "" })}
            className={inputCls}
          >
            <option value="">Select tenant…</option>
            {stConnections.map((c) => (
              <option key={c.id} value={c.id}>{c.tenantName} (Tenant {c.tenantId})</option>
            ))}
          </select>
        )}
      </div>

      {/* Destination Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Destination Type <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {DESTINATION_OPTIONS.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ destinationType: value })}
              className={`w-full flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                state.destinationType === value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`mt-0.5 rounded-md p-1.5 ${state.destinationType === value ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* BOOKING sub-fields */}
      {state.destinationType === "BOOKING" && state.stConnectionId && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Booking Configuration</p>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="size-4 animate-spin" /> Loading job types…
            </div>
          )}
          {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}
          {!loading && (
            <div className="grid grid-cols-2 gap-4">
              <SubField label="Job Type">
                <select value={state.jobType} onChange={(e) => onChange({ jobType: e.target.value })} className={inputCls}>
                  <option value="">Any</option>
                  {jobTypes.map((j) => <option key={j.id} value={String(j.id)}>{j.name}</option>)}
                </select>
              </SubField>
              <SubField label="Business Unit">
                <select value={state.businessUnit} onChange={(e) => onChange({ businessUnit: e.target.value })} className={inputCls}>
                  <option value="">Any</option>
                  {businessUnits.map((b) => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
                </select>
              </SubField>
              <SubField label="Priority">
                <select value={state.priority} onChange={(e) => onChange({ priority: e.target.value })} className={inputCls}>
                  <option value="">Default</option>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </SubField>
              <SubField label="Assign To (Employee ID)">
                <input value={state.assignedTo} onChange={(e) => onChange({ assignedTo: e.target.value })} placeholder="ST employee ID" className={inputCls} />
              </SubField>
            </div>
          )}
        </div>
      )}

      {/* LEAD sub-fields */}
      {state.destinationType === "LEAD" && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Lead Configuration</p>
          <div className="grid grid-cols-2 gap-4">
            <SubField label="Assign To CSR (Employee ID)">
              <input value={state.assignedTo} onChange={(e) => onChange({ assignedTo: e.target.value })} placeholder="ST employee ID" className={inputCls} />
            </SubField>
            <SubField label="Follow-up After (days)">
              <input
                type="number"
                min={0}
                max={365}
                value={state.followupDays}
                onChange={(e) => onChange({ followupDays: parseInt(e.target.value) || 0 })}
                className={inputCls}
              />
            </SubField>
          </div>
        </div>
      )}

      {/* CAPI toggle */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
        <div>
          <p className="text-sm font-medium text-gray-900">Meta Conversions API</p>
          <p className="text-xs text-gray-500">Send lead events back to Meta for attribution</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ capiEnabled: !state.capiEnabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${state.capiEnabled ? "bg-blue-600" : "bg-gray-200"}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${state.capiEnabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      {/* ST campaign tag */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ServiceTitan campaign tag{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={state.campaignTag}
          onChange={(e) => onChange({ campaignTag: e.target.value })}
          placeholder="Leave blank to use Meta campaign name automatically"
          className={inputCls}
        />
        <p className="mt-1 text-xs text-gray-500">
          Every job, lead, and task created by Formly will be tagged to this
          campaign in ServiceTitan for revenue attribution reports. If left blank,
          the name of the originating Meta ad campaign is used automatically.
        </p>
      </div>
    </div>
  );
}

function SubField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
