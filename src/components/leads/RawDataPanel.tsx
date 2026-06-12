"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  data: Record<string, unknown>;
}

export function RawDataPanel({ data }: Props) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  function copy() {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={copy}
        className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
      >
        {copied ? <><Check className="size-3" /> Copied</> : <><Copy className="size-3" /> Copy</>}
      </button>
      <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 pt-10 text-xs leading-relaxed text-green-400 font-mono">
        {json}
      </pre>
    </div>
  );
}
