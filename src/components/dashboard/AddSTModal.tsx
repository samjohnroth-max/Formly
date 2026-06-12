"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const schema = z.object({
  tenantId: z.string().min(1, "Required"),
  tenantName: z.string().min(1, "Required"),
  clientId: z.string().min(1, "Required"),
  clientSecret: z.string().min(1, "Required"),
  appKey: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

interface AddSTModalProps {
  onClose: () => void;
  groupId?: string; // Formly client group to assign this connection to
}

export function AddSTModal({ onClose, groupId }: AddSTModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const res = await fetch("/api/integrations/servicetitan/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, groupId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong");
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Add ServiceTitan Connection</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
            <X className="size-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <Field label="Tenant Name" error={errors.tenantName?.message}>
            <input {...register("tenantName")} placeholder="e.g. Acme HVAC" className={inputCls(!!errors.tenantName)} />
          </Field>
          <Field label="Tenant ID" error={errors.tenantId?.message}>
            <input {...register("tenantId")} placeholder="e.g. 1234567" className={inputCls(!!errors.tenantId)} />
          </Field>
          <Field label="Client ID" error={errors.clientId?.message}>
            <input {...register("clientId")} className={inputCls(!!errors.clientId)} />
          </Field>
          <Field label="Client Secret" error={errors.clientSecret?.message}>
            <div className="relative">
              <input
                {...register("clientSecret")}
                type={showSecret ? "text" : "password"}
                className={cn(inputCls(!!errors.clientSecret), "pr-9")}
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>
          <Field label="App Key" error={errors.appKey?.message}>
            <input {...register("appKey")} className={inputCls(!!errors.appKey)} />
          </Field>

          {serverError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Connecting…" : "Connect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500",
    hasError ? "border-red-300 bg-red-50" : "border-gray-300"
  );
}
