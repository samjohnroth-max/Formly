"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paintbrush } from "lucide-react";

export function ApplyBrandButton({ templateId }: { templateId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      await fetch(`/api/email-templates/${templateId}/apply-brand`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Re-render this template with current brand settings"
      className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
    >
      <Paintbrush className="size-3" />
      {loading ? "Applying…" : "Apply brand"}
    </button>
  );
}
