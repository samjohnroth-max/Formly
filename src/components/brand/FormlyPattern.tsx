"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  color?: string;
  opacity?: number;
  spacing?: number;
}

export function FormlyPattern({
  className,
  color = "currentColor",
  opacity = 0.04,
  spacing = 40,
}: Props) {
  const uid = useId();
  const id = `fp-${uid.replace(/:/g, "")}`;

  // Mini 2x2 grid mark centered in the spacing cell
  // Each square: 6×6, gap 2, total mark 14×14, centered in `spacing`
  const s = spacing;
  const markSize = Math.round(s * 0.35); // ~14 at spacing=40
  const squareSize = Math.floor((markSize - 2) / 2); // ~6
  const gap = markSize - squareSize * 2; // remaining gap
  const start = Math.round((s - markSize) / 2);

  const tlx = start;
  const tly = start;
  const trx = start + squareSize + gap;
  const blx = start;
  const bly = start + squareSize + gap;
  const brx = start + squareSize + gap;
  const bry = start + squareSize + gap;

  const rx = Math.max(1, Math.round(squareSize * 0.28));

  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <pattern
          id={id}
          x="0"
          y="0"
          width={s}
          height={s}
          patternUnits="userSpaceOnUse"
        >
          <rect x={tlx} y={tly} width={squareSize} height={squareSize} rx={rx} fill={color} fillOpacity={opacity} />
          <rect x={trx} y={tly} width={squareSize} height={squareSize} rx={rx} fill={color} fillOpacity={opacity * 0.45} />
          <rect x={blx} y={bly} width={squareSize} height={squareSize} rx={rx} fill={color} fillOpacity={opacity * 0.45} />
          <rect x={brx} y={bry} width={squareSize} height={squareSize} rx={rx} fill={color} fillOpacity={opacity * 0.45} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
