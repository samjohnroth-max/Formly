"use client";

import { useState } from "react";
import { LayoutPicker } from "@/components/templates/LayoutPicker";
import { TemplateBuilder } from "@/components/templates/TemplateBuilder";
import type { Block, BrandSettings } from "@/components/templates/renderEmail";

interface Props {
  brandSettings: BrandSettings;
}

export function NewTemplateFlow({ brandSettings }: Props) {
  const [preloadedBlocks, setPreloadedBlocks] = useState<Block[] | null>(null);
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <LayoutPicker
        brand={brandSettings}
        onSelect={(blocks) => { setPreloadedBlocks(blocks); setStarted(true); }}
        onScratch={() => { setPreloadedBlocks(null); setStarted(true); }}
      />
    );
  }

  return (
    <TemplateBuilder
      brandSettings={brandSettings}
      preloadedBlocks={preloadedBlocks ?? undefined}
    />
  );
}
