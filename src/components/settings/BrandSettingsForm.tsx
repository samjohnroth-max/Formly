"use client";

import { useState, useCallback } from "react";
import { Save, RefreshCw } from "lucide-react";
import type { BrandSettings } from "@/components/templates/renderEmail";

const FONTS = ["Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Georgia", "Merriweather"];
const BUTTON_STYLES = [
  { value: "rounded", label: "Rounded" },
  { value: "square", label: "Square" },
  { value: "pill", label: "Pill" },
];

function brandPreviewHtml(brand: BrandSettings): string {
  const font = brand.fontFamily ?? "Inter";
  const stack = `'${font}',system-ui,sans-serif`;
  const primary = brand.primaryColor ?? "#2563eb";
  const br = brand.buttonStyle === "pill" ? 24 : brand.buttonStyle === "square" ? 0 : 6;
  const logo = brand.logoUrl
    ? `<div style="text-align:center;padding:0 0 20px;"><img src="${brand.logoUrl}" alt="Logo" style="max-width:160px;max-height:60px;height:auto;" /></div>`
    : "";
  const footer = brand.footerText
    ? `<p style="font-family:${stack};font-size:11px;color:#9ca3af;text-align:center;margin:24px 0 0;">${brand.footerText}</p>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:24px 16px;background:#f3f4f6;">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;padding:32px 28px;">
${logo}
<h2 style="font-family:${stack};font-size:22px;font-weight:700;color:#111827;margin:0 0 12px;">We received your request, Sarah!</h2>
<p style="font-family:${stack};font-size:15px;line-height:1.6;color:#374151;margin:0 0 20px;">Thanks for reaching out to <strong>${brand.companyName || "Your Company"}</strong>! We've received your request and our team will be in touch shortly.</p>
<div style="text-align:center;margin:0 0 20px;">
  <a href="#" style="display:inline-block;background:${primary};color:#fff;font-family:${stack};font-size:15px;font-weight:600;padding:12px 28px;border-radius:${br}px;text-decoration:none;">Book Your Appointment</a>
</div>
<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
${footer}
</div>
</body></html>`;
}

interface Props {
  initial: BrandSettings & { id?: string | null };
}

export function BrandSettingsForm({ initial }: Props) {
  const [brand, setBrand] = useState<BrandSettings>({
    companyName: initial.companyName ?? "",
    primaryColor: initial.primaryColor ?? "#2563eb",
    secondaryColor: initial.secondaryColor ?? "#f3f4f6",
    logoUrl: initial.logoUrl ?? "",
    fontFamily: initial.fontFamily ?? "Inter",
    buttonStyle: initial.buttonStyle ?? "rounded",
    footerText: initial.footerText ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = useCallback((key: keyof BrandSettings, value: string) => {
    setBrand((b) => ({ ...b, [key]: value }));
    setSaved(false);
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brand),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
    } catch {
      setError("Failed to save brand settings.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="flex gap-6 min-h-0">
      {/* Left: form */}
      <div className="w-80 shrink-0 space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Brand identity</h2>

          <div>
            <label className={labelCls}>Company name</label>
            <input className={inputCls} value={brand.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Acme HVAC" />
          </div>

          <div>
            <label className={labelCls}>Logo URL</label>
            <input className={inputCls} value={brand.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://..." />
            <p className="mt-1 text-[10px] text-gray-400">Paste a public image URL. Recommended: 320×80px PNG.</p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelCls}>Primary color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brand.primaryColor}
                  onChange={(e) => set("primaryColor", e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border border-gray-200 p-0.5"
                />
                <input className={inputCls} value={brand.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} placeholder="#2563eb" />
              </div>
            </div>
            <div className="flex-1">
              <label className={labelCls}>Secondary color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brand.secondaryColor}
                  onChange={(e) => set("secondaryColor", e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border border-gray-200 p-0.5"
                />
                <input className={inputCls} value={brand.secondaryColor} onChange={(e) => set("secondaryColor", e.target.value)} placeholder="#f3f4f6" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Primary font</label>
            <select className={inputCls} value={brand.fontFamily} onChange={(e) => set("fontFamily", e.target.value)}>
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Button style</label>
            <div className="flex gap-2">
              {BUTTON_STYLES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => set("buttonStyle", value)}
                  className={`flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors ${brand.buttonStyle === value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Email footer <span className="text-xs font-normal text-gray-400">(CAN-SPAM)</span></h2>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={brand.footerText}
            onChange={(e) => set("footerText", e.target.value)}
            placeholder="123 Main St, Springfield, IL 62701 | (555) 555-5555 | yoursite.com"
          />
          <p className="text-[10px] text-gray-400">Required by CAN-SPAM. Include your physical address and opt-out info.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save brand settings"}
        </button>
      </div>

      {/* Right: live preview */}
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <span className="text-xs font-medium text-gray-500">Live preview — Lead Confirmation template</span>
            <span className="text-[10px] text-gray-400">Updates as you type</span>
          </div>
          <iframe
            key={JSON.stringify(brand)}
            srcDoc={brandPreviewHtml(brand)}
            title="Brand preview"
            className="w-full border-none"
            style={{ height: "520px" }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
