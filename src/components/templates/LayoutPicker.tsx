"use client";

import { Wand2, PenLine } from "lucide-react";
import type { Block } from "./renderEmail";
import type { BrandSettings } from "./renderEmail";

export type Layout = "minimal" | "bold" | "friendly" | "professional" | "modern";

function makeId() {
  return `layout-${Math.random().toString(36).slice(2)}`;
}

export function buildLayoutBlocks(layout: Layout, brand: BrandSettings): Block[] {
  const primary = brand.primaryColor ?? "#2563eb";
  const logo = brand.logoUrl ?? "";
  const company = brand.companyName ?? "{{company_name}}";
  const br = brand.buttonStyle === "pill" ? 24 : brand.buttonStyle === "square" ? 0 : 6;

  switch (layout) {
    case "minimal":
      return [
        ...(logo ? [{ id: makeId(), type: "image" as const, content: logo, alt: company, width: "160px", align: "center" as const, paddingBottom: 20 }] : []),
        { id: makeId(), type: "header", content: "Hi {{first_name}}, we received your request!", size: "h2" as const, align: "center" as const, paddingBottom: 8 },
        { id: makeId(), type: "text", content: `Thanks for reaching out to ${company}. Our team will be in touch shortly.`, align: "center" as const, paddingBottom: 24 },
        { id: makeId(), type: "button", content: "Book Your Appointment", href: "https://", align: "center" as const, bgColor: primary, borderRadius: br, paddingBottom: 24 },
        { id: makeId(), type: "divider", content: "", paddingTop: 8, paddingBottom: 8 },
        { id: makeId(), type: "text", content: "Questions? Reply to this email.", align: "center" as const, fontSize: 13, textColor: "#9ca3af" },
      ] as Block[];

    case "bold":
      return [
        ...(logo ? [{ id: makeId(), type: "image" as const, content: logo, alt: company, width: "140px", align: "left" as const, paddingBottom: 24 }] : []),
        { id: makeId(), type: "header", content: `Welcome to ${company}, {{first_name}}!`, size: "h1" as const, align: "left" as const, paddingBottom: 12 },
        { id: makeId(), type: "text", content: "You're one step closer to getting your home service needs handled. We'll reach out within 24 hours to confirm your appointment.", align: "left" as const, paddingBottom: 24 },
        { id: makeId(), type: "button", content: "Schedule Now", href: "https://", align: "left" as const, bgColor: primary, borderRadius: br, fullWidth: true, paddingBottom: 0 },
      ] as Block[];

    case "friendly":
      return [
        ...(logo ? [{ id: makeId(), type: "image" as const, content: logo, alt: company, width: "160px", align: "center" as const, paddingBottom: 24 }] : []),
        { id: makeId(), type: "header", content: "Great news, {{first_name}}! 🎉", size: "h2" as const, align: "center" as const, paddingBottom: 8 },
        { id: makeId(), type: "text", content: `We received your request for {{service_interest}} and we're excited to help! The ${company} team will be in touch soon.`, align: "center" as const, paddingBottom: 20 },
        { id: makeId(), type: "button", content: "View Your Request", href: "https://", align: "center" as const, bgColor: primary, borderRadius: br, paddingBottom: 24 },
        { id: makeId(), type: "divider", content: "", paddingTop: 0, paddingBottom: 16 },
        { id: makeId(), type: "text", content: `The ${company} Team`, align: "center" as const, fontSize: 13, textColor: "#6b7280", italic: true },
      ] as Block[];

    case "professional":
      return [
        { id: makeId(), type: "header", content: company, size: "h1" as const, align: "left" as const, paddingBottom: 4 },
        { id: makeId(), type: "divider", content: "", paddingTop: 0, paddingBottom: 20 },
        { id: makeId(), type: "text", content: "Dear {{first_name}},", align: "left" as const, paddingBottom: 12 },
        { id: makeId(), type: "text", content: `Thank you for your interest in {{service_interest}}. We have received your inquiry and a member of our team will contact you within one business day to discuss your needs and schedule a convenient appointment.`, align: "left" as const, paddingBottom: 24 },
        { id: makeId(), type: "button", content: "Confirm Your Appointment", href: "https://", align: "left" as const, bgColor: primary, borderRadius: br, paddingBottom: 24 },
        { id: makeId(), type: "divider", content: "", paddingTop: 0, paddingBottom: 16 },
        { id: makeId(), type: "text", content: `Sincerely,\nThe ${company} Team`, align: "left" as const, fontSize: 13, textColor: "#6b7280" },
      ] as Block[];

    case "modern":
      return [
        ...(logo ? [{ id: makeId(), type: "image" as const, content: logo, alt: company, width: "150px", align: "center" as const, paddingBottom: 28 }] : []),
        { id: makeId(), type: "header", content: "We've got your request, {{first_name}}.", size: "h1" as const, align: "center" as const, paddingBottom: 12 },
        { id: makeId(), type: "divider", content: "", paddingTop: 0, paddingBottom: 20 },
        { id: makeId(), type: "text", content: `${company} is reviewing your {{service_interest}} request. Expect a call within 24 hours.`, align: "center" as const, paddingBottom: 24 },
        { id: makeId(), type: "button", content: "Book Now", href: "https://", align: "center" as const, bgColor: primary, borderRadius: br, paddingBottom: 0 },
      ] as Block[];
  }
}

interface LayoutCard {
  id: Layout;
  name: string;
  description: string;
  preview: React.ReactNode;
}

function MinimalPreview({ color }: { color: string }) {
  return (
    <div className="space-y-1.5 p-3">
      <div className="mx-auto h-3 w-14 rounded bg-gray-200" />
      <div className="h-px bg-gray-100" />
      <div className="mx-auto h-2.5 w-28 rounded bg-gray-300" />
      <div className="mx-auto h-2 w-24 rounded bg-gray-200" />
      <div className="mx-auto h-6 w-20 rounded" style={{ background: color }} />
    </div>
  );
}

function BoldPreview({ color }: { color: string }) {
  return (
    <div className="space-y-1.5 p-3">
      <div className="h-4 w-12 rounded bg-gray-200" />
      <div className="h-3 w-32 rounded bg-gray-400" />
      <div className="h-2 w-28 rounded bg-gray-200" />
      <div className="h-2 w-24 rounded bg-gray-200" />
      <div className="h-6 w-full rounded" style={{ background: color }} />
    </div>
  );
}

function FriendlyPreview({ color }: { color: string }) {
  return (
    <div className="space-y-1.5 p-3 text-center">
      <div className="mx-auto h-3 w-14 rounded bg-gray-200" />
      <div className="mx-auto h-3 w-28 rounded bg-gray-400" />
      <div className="mx-auto h-2 w-24 rounded bg-gray-200" />
      <div className="mx-auto h-6 w-20 rounded" style={{ background: color }} />
      <div className="h-px bg-gray-100" />
      <div className="mx-auto h-2 w-16 rounded bg-gray-200" />
    </div>
  );
}

function ProfessionalPreview({ color }: { color: string }) {
  return (
    <div className="space-y-1.5 p-3">
      <div className="h-4 w-20 rounded bg-gray-400" />
      <div className="h-px bg-gray-300" />
      <div className="h-2 w-12 rounded bg-gray-200" />
      <div className="h-2 w-32 rounded bg-gray-200" />
      <div className="h-2 w-28 rounded bg-gray-200" />
      <div className="h-6 w-24 rounded" style={{ background: color }} />
    </div>
  );
}

function ModernPreview({ color }: { color: string }) {
  return (
    <div className="space-y-1.5 p-3 text-center">
      <div className="mx-auto h-3 w-14 rounded bg-gray-200" />
      <div className="mx-auto h-4 w-28 rounded bg-gray-400" />
      <div className="h-px bg-gray-100" />
      <div className="mx-auto h-2 w-24 rounded bg-gray-200" />
      <div className="mx-auto h-6 w-16 rounded" style={{ background: color }} />
    </div>
  );
}

interface Props {
  brand: BrandSettings;
  onSelect: (blocks: Block[]) => void;
  onScratch: () => void;
}

export function LayoutPicker({ brand, onSelect, onScratch }: Props) {
  const primary = brand.primaryColor ?? "#2563eb";

  const layouts: LayoutCard[] = [
    { id: "minimal", name: "Minimal", description: "Clean and simple. Logo, message, single CTA.", preview: <MinimalPreview color={primary} /> },
    { id: "bold", name: "Bold", description: "Strong headline, full-width button. High impact.", preview: <BoldPreview color={primary} /> },
    { id: "friendly", name: "Friendly", description: "Warm tone with emoji, centered layout.", preview: <FriendlyPreview color={primary} /> },
    { id: "professional", name: "Professional", description: "Formal letter style for enterprise clients.", preview: <ProfessionalPreview color={primary} /> },
    { id: "modern", name: "Modern", description: "Centered, minimal text, bold statement.", preview: <ModernPreview color={primary} /> },
  ];

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      <div className="border-b border-gray-200 bg-white px-8 py-5">
        <h1 className="text-lg font-semibold text-gray-900">Choose a starting point</h1>
        <p className="mt-0.5 text-sm text-gray-500">Your brand colors and logo are applied automatically.</p>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-y-auto bg-gray-50 p-8">
        <div className="w-full max-w-4xl space-y-6">
          {/* Brand layouts */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Wand2 className="size-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Build from brand</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {layouts.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onSelect(buildLayoutBlocks(l.id, brand))}
                  className="group rounded-xl border-2 border-gray-200 bg-white text-left transition-all hover:border-blue-400 hover:shadow-md"
                >
                  <div className="rounded-t-lg border-b border-gray-100 bg-gray-50">
                    {l.preview}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-700">{l.name}</p>
                    <p className="mt-0.5 text-[10px] leading-tight text-gray-400">{l.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scratch */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <PenLine className="size-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Build from scratch</span>
            </div>
            <button
              onClick={onScratch}
              className="w-full rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-4 text-left transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-gray-700">Blank canvas</p>
              <p className="mt-0.5 text-xs text-gray-400">Start with an empty editor and build your own layout block by block.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
