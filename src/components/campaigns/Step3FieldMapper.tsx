"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { WizardState, FieldMappingInput } from "@/types/db";
import type { MetaFormQuestion } from "@/lib/meta/forms";

// Default mappings applied when a known field is detected in the form
const SMART_DEFAULTS: Record<string, string> = {
  full_name: "customer.name",
  phone_number: "customer.phone",
  email: "customer.email",
  zip_code: "location.zip",
  city: "location.city",
  state: "location.state",
  street_address: "location.street",
  address: "location.street",
  first_name: "customer.firstName",
  last_name: "customer.lastName",
};

const ST_FIELD_OPTIONS = [
  "customer.name",
  "customer.firstName",
  "customer.lastName",
  "customer.phone",
  "customer.email",
  "location.street",
  "location.city",
  "location.state",
  "location.zip",
  "job.notes",
  "custom",
];

const TRANSFORMS = ["", "phone_format", "uppercase", "lowercase", "split_name"];

interface Props {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
}

export function Step3FieldMapper({ state, onChange }: Props) {
  const [questions, setQuestions] = useState<MetaFormQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!state.metaFormId || !state.metaConnectionId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/meta/form-fields?formId=${state.metaFormId}&metaConnectionId=${state.metaConnectionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        const qs: MetaFormQuestion[] = d.fields;
        setQuestions(qs);

        // Only auto-populate if we haven't initialized mappings yet
        if (!initialized && state.fieldMappings.length === 0) {
          const defaults: FieldMappingInput[] = qs
            .filter((q) => SMART_DEFAULTS[q.key])
            .map((q) => ({ metaField: q.key, stField: SMART_DEFAULTS[q.key] }));
          onChange({ fieldMappings: defaults.length > 0 ? defaults : [{ metaField: "", stField: "" }] });
          setInitialized(true);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.metaFormId, state.metaConnectionId]);

  function updateMapping(index: number, patch: Partial<FieldMappingInput>) {
    const updated = state.fieldMappings.map((m, i) => (i === index ? { ...m, ...patch } : m));
    onChange({ fieldMappings: updated });
  }

  function addRow() {
    onChange({ fieldMappings: [...state.fieldMappings, { metaField: "", stField: "" }] });
  }

  function removeRow(index: number) {
    onChange({ fieldMappings: state.fieldMappings.filter((_, i) => i !== index) });
  }

  const metaFieldOptions = questions.map((q) => q.key);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="size-4 animate-spin" /> Loading form fields…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>;
  }

  const hasAddressField = state.fieldMappings.some((m) => m.stField === "location.street");

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Map each Meta form field to a ServiceTitan field. Smart defaults have been pre-filled for recognized fields.
      </p>

      {!hasAddressField && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
          <span className="mt-0.5 text-amber-500">💡</span>
          <p className="text-xs text-amber-800">
            <strong>Tip:</strong> Adding a street address field to your Meta form improves job creation in ServiceTitan — the dispatcher will have a verified service address ready without needing to call the customer first.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Meta Field</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">ServiceTitan Field</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Transform</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {state.fieldMappings.map((mapping, i) => (
              <tr key={i} className="bg-white">
                <td className="px-4 py-2">
                  {metaFieldOptions.length > 0 ? (
                    <select
                      value={mapping.metaField}
                      onChange={(e) => updateMapping(i, { metaField: e.target.value })}
                      className={cellInputCls}
                    >
                      <option value="">Select field…</option>
                      {metaFieldOptions.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={mapping.metaField}
                      onChange={(e) => updateMapping(i, { metaField: e.target.value })}
                      placeholder="e.g. full_name"
                      className={cellInputCls}
                    />
                  )}
                </td>
                <td className="px-4 py-2">
                  {mapping.stField && !ST_FIELD_OPTIONS.includes(mapping.stField) ? (
                    <input
                      value={mapping.stField}
                      onChange={(e) => updateMapping(i, { stField: e.target.value })}
                      className={cellInputCls}
                    />
                  ) : (
                    <select
                      value={mapping.stField}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          updateMapping(i, { stField: "" });
                        } else {
                          updateMapping(i, { stField: e.target.value });
                        }
                      }}
                      className={cellInputCls}
                    >
                      <option value="">Select field…</option>
                      {ST_FIELD_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-4 py-2">
                  <select
                    value={mapping.transform ?? ""}
                    onChange={(e) => updateMapping(i, { transform: e.target.value || undefined })}
                    className={cellInputCls}
                  >
                    <option value="">None</option>
                    {TRANSFORMS.filter(Boolean).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    disabled={state.fieldMappings.length === 1}
                    className="rounded p-1 text-gray-400 hover:text-red-500 disabled:opacity-30"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <Plus className="size-4" /> Add mapping
      </button>

      {questions.length > 0 && (
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500 mb-1.5">Available form fields</p>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q) => (
              <span key={q.key} className="inline-flex items-center rounded bg-white border border-gray-200 px-2 py-0.5 text-xs font-mono text-gray-700">
                {q.key}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const cellInputCls = "w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";
