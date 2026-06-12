"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSettingsCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Monitor },
    { value: "dark", label: "Dark", icon: Moon },
  ] as const;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-[#F0F4FF] mb-1">Appearance</h2>
      <p className="text-xs text-gray-500 dark:text-[#8B90A0] mb-4">
        Choose a theme or follow your system preference.
      </p>
      <div className="flex gap-2">
        {options.map(({ value, label, icon: Icon }) => {
          const active = mounted ? theme === value : value === "system";
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-1 flex-col items-center gap-2 rounded-lg border px-3 py-3 text-xs font-medium transition-colors ${
                active
                  ? "border-[#0F4C8F] dark:border-[#3B7DD8] bg-blue-50 dark:bg-[#3B7DD8]/10 text-[#0F4C8F] dark:text-[#3B7DD8]"
                  : "border-gray-200 dark:border-[#2A2D3E] text-gray-500 dark:text-[#8B90A0] hover:border-gray-300 dark:hover:border-[#3B7DD8]/50 hover:text-gray-700 dark:hover:text-[#F0F4FF]"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
