"use client";

import { useState } from "react";
import Link from "next/link";
import { X, AlertTriangle } from "lucide-react";
import { useDemo } from "./DemoContext";

export function DemoBanner() {
  const isDemo = useDemo();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemo || dismissed) return null;

  return (
    <div className="flex shrink-0 items-center justify-between gap-4 bg-amber-400 px-4 py-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0 text-amber-900" />
        <p className="text-xs font-medium text-amber-900">
          You&apos;re viewing a demo account with sample data. Nothing you do here affects real accounts.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/signup"
          className="rounded-full bg-amber-900 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-800 transition-colors"
        >
          Sign up free →
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-amber-900 hover:text-amber-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function DemoBlockedToast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-gray-900 px-4 py-3 shadow-xl border border-gray-700 animate-in slide-in-from-bottom-2 fade-in">
      <p className="text-sm font-medium text-white">This action is disabled in demo mode.</p>
      <p className="text-xs text-gray-400 mt-0.5">
        <Link href="/signup" className="underline hover:text-white">Sign up free</Link> to use your own account.
      </p>
    </div>
  );
}
