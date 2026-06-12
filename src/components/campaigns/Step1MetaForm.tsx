"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { WizardState } from "@/types/db";
import type { MetaForm } from "@/lib/meta/forms";

interface MetaConnectionOption {
  id: string;
  metaAccountName: string;
  metaAccountId: string;
}

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  metaConnections: MetaConnectionOption[];
}

export function Step1MetaForm({ state, onChange, metaConnections }: Props) {
  const [forms, setForms] = useState<MetaForm[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [formsError, setFormsError] = useState<string | null>(null);

  const multipleConnections = metaConnections.length > 1;
  const selectedConn = metaConnections.find((c) => c.id === state.metaConnectionId);

  useEffect(() => {
    if (!state.metaConnectionId) return;
    setLoadingForms(true);
    setFormsError(null);
    setForms([]);
    fetch(`/api/meta/forms?metaConnectionId=${state.metaConnectionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setForms(d.forms);
      })
      .catch((e) => setFormsError(e.message))
      .finally(() => setLoadingForms(false));
  }, [state.metaConnectionId]);

  const selectedForm = forms.find((f) => f.id === state.metaFormId);

  function formLabel(form: MetaForm) {
    const base = `${form.name} (${form.pageName})`;
    return multipleConnections && selectedConn
      ? `${selectedConn.metaAccountName} — ${base}`
      : base;
  }

  return (
    <div className="space-y-5">
      <Field label="Campaign Name" required>
        <input
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Summer HVAC Promo"
          className={inputCls}
        />
      </Field>

      <Field label="Meta Business Account" required>
        {metaConnections.length === 0 ? (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
            No Meta accounts connected.{" "}
            <a href="/connections" className="underline">
              Connect one first →
            </a>
          </p>
        ) : (
          <select
            value={state.metaConnectionId}
            onChange={(e) => {
              const conn = metaConnections.find((c) => c.id === e.target.value);
              onChange({
                metaConnectionId: e.target.value,
                metaAdAccountId: conn?.metaAccountId ?? "",
                metaFormId: "",
                metaFormName: "",
              });
            }}
            className={inputCls}
          >
            <option value="">Select account…</option>
            {metaConnections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.metaAccountName}
              </option>
            ))}
          </select>
        )}
      </Field>

      {state.metaConnectionId && (
        <Field label="Instant Form" required>
          {loadingForms ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="size-4 animate-spin" /> Fetching forms from Meta…
            </div>
          ) : formsError ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{formsError}</p>
          ) : forms.length === 0 ? (
            <p className="text-sm text-gray-500">No forms found for this account.</p>
          ) : (
            <select
              value={state.metaFormId}
              onChange={(e) => {
                const form = forms.find((f) => f.id === e.target.value);
                onChange({ metaFormId: e.target.value, metaFormName: form?.name ?? "" });
              }}
              className={inputCls}
            >
              <option value="">Select form…</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {formLabel(f)}
                </option>
              ))}
            </select>
          )}
        </Field>
      )}

      {selectedForm && (
        <div className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Form ID: <code className="font-mono">{selectedForm.id}</code> · Page: {selectedForm.pageName} · Status: {selectedForm.status}
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
