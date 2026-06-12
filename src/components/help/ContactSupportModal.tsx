"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";

const CATEGORIES = [
  "Getting started",
  "Connections",
  "Campaigns",
  "Leads & routing",
  "Email templates",
  "ServiceTitan",
  "CAPI & Meta",
  "Billing",
  "Other",
];

interface Props {
  onClose: () => void;
}

export function ContactSupportModal({ onClose }: Props) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2A2D3E] px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-[#F0F4FF]">Contact Support</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-[#F0F4FF] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <CheckCircle className="size-12 text-emerald-500" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-[#F0F4FF]">Message sent</h3>
            <p className="text-sm text-gray-500 dark:text-[#8B90A0]">
              We'll get back to you within 24 hours. You can track this ticket in the support history below.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-lg bg-[#0F4C8F] dark:bg-[#3B7DD8] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-[#8B90A0] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-[#2A2D3E] bg-white dark:bg-[#0F1117] px-3 py-2 text-sm text-gray-900 dark:text-[#F0F4FF] focus:outline-none focus:ring-2 focus:ring-[#0F4C8F] dark:focus:ring-[#3B7DD8]"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-[#8B90A0] mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="Brief description of your issue"
                className="w-full rounded-lg border border-gray-300 dark:border-[#2A2D3E] bg-white dark:bg-[#0F1117] px-3 py-2 text-sm text-gray-900 dark:text-[#F0F4FF] placeholder-gray-400 dark:placeholder-[#8B90A0] focus:outline-none focus:ring-2 focus:ring-[#0F4C8F] dark:focus:ring-[#3B7DD8]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-[#8B90A0] mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                placeholder="Describe your issue in detail. Include any error messages or steps to reproduce."
                className="w-full rounded-lg border border-gray-300 dark:border-[#2A2D3E] bg-white dark:bg-[#0F1117] px-3 py-2 text-sm text-gray-900 dark:text-[#F0F4FF] placeholder-gray-400 dark:placeholder-[#8B90A0] focus:outline-none focus:ring-2 focus:ring-[#0F4C8F] dark:focus:ring-[#3B7DD8] resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 dark:border-[#2A2D3E] px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#8B90A0] hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-[#0F4C8F] dark:bg-[#3B7DD8] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {loading && <Loader2 className="size-3.5 animate-spin" />}
                Send message
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
