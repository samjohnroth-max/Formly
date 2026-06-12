"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  className?: string;
}

export function Tooltip({ content, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        className="flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-[#8B90A0] dark:hover:text-[#F0F4FF] transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="size-3.5" />
      </button>
      {visible && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] px-3 py-2.5 shadow-lg">
          <p className="text-xs leading-relaxed text-gray-600 dark:text-[#8B90A0]">{content}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-200 dark:border-t-[#2A2D3E]" />
        </div>
      )}
    </div>
  );
}
