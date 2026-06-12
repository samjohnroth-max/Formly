"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "formly-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — don't show banner
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-4 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl px-5 py-3.5 max-w-2xl w-full">
        <p className="flex-1 text-xs text-gray-300 leading-relaxed">
          We use essential cookies to keep you logged in. By continuing you accept our{" "}
          <Link href="/privacy" className="text-blue-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-lg bg-[#0F4C8F] hover:bg-[#1a5fad] px-4 py-1.5 text-xs font-semibold text-white transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
