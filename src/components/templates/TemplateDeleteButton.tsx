"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function TemplateDeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    setPending(true);
    try {
      await fetch(`/api/email-templates/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      <Trash2 className="size-3" />
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
