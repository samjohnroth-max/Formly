"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import {
  Tag, Save, ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown,
  Monitor, Smartphone, Type, AlignLeft, MousePointerClick, ImageIcon,
  Minus, Send, Paintbrush, ChevronDown as Expand, Settings2,
} from "lucide-react";
import { renderBlocksToHtml } from "./renderEmail";
export type { Block, TemplateConfig, BrandSettings } from "./renderEmail";
import type { Block, TemplateConfig, BrandSettings } from "./renderEmail";

// ─── Merge tags ───────────────────────────────────────────────────────────────

const MERGE_TAGS = [
  { tag: "first_name",          color: "blue" },
  { tag: "last_name",           color: "blue" },
  { tag: "phone",               color: "blue" },
  { tag: "service_interest",    color: "purple" },
  { tag: "company_name",        color: "purple" },
  { tag: "job_number",          color: "green" },
  { tag: "appointment_date",    color: "green" },
  { tag: "unsubscribe_url",     color: "gray" },
  { tag: "brand_logo_url",      color: "orange" },
  { tag: "brand_company_name",  color: "orange" },
  { tag: "brand_primary_color", color: "orange" },
  { tag: "brand_font",          color: "orange" },
] as const;

const PREVIEW_DATA: Record<string, string> = {
  first_name: "Sarah",
  last_name: "Johnson",
  phone: "(555) 867-5309",
  service_interest: "HVAC Tune-Up",
  company_name: "Acme HVAC",
  job_number: "JOB-4821",
  appointment_date: "Tuesday, June 11 at 10:00 AM",
  unsubscribe_url: "#unsubscribe",
};

const TAG_COLOR: Record<string, string> = {
  blue:   "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  purple: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  green:  "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  gray:   "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
};

// ─── Block defaults ───────────────────────────────────────────────────────────

function defaultBlock(type: Block["type"], uid: string, brand?: BrandSettings): Block {
  switch (type) {
    case "header":
      return { id: uid, type, content: "Your headline here", size: "h2", align: "left" };
    case "text":
      return { id: uid, type, content: "Enter your message here. Use merge tags to personalize.", align: "left" };
    case "button":
      return { id: uid, type, content: "Click here", href: "https://", align: "center", bgColor: brand?.primaryColor ?? "#2563eb" };
    case "image":
      return { id: uid, type, content: "https://", alt: "Image", width: "100%", align: "center" };
    case "divider":
      return { id: uid, type, content: "" };
  }
}

// ─── Preview helpers ──────────────────────────────────────────────────────────

function resolvePreview(text: string, brand?: BrandSettings): string {
  const brandData: Record<string, string> = {
    brand_logo_url:      brand?.logoUrl      ?? "",
    brand_company_name:  brand?.companyName  ?? "Your Company",
    brand_primary_color: brand?.primaryColor ?? "#2563eb",
    brand_font:          brand?.fontFamily   ?? "Inter",
  };
  return text.replace(
    /\{\{(\w+)\}\}/g,
    (_, k) => {
      const val = PREVIEW_DATA[k] ?? brandData[k];
      return val !== undefined ? val : `<span style="background:#fee2e2;padding:0 2px;border-radius:2px">{{${k}}}</span>`;
    }
  );
}

// ─── Block add menu ───────────────────────────────────────────────────────────

const BLOCK_MENU: { type: Block["type"]; label: string; icon: React.ReactNode }[] = [
  { type: "header",  label: "Heading", icon: <Type className="size-4" /> },
  { type: "text",    label: "Text",    icon: <AlignLeft className="size-4" /> },
  { type: "button",  label: "Button",  icon: <MousePointerClick className="size-4" /> },
  { type: "image",   label: "Image",   icon: <ImageIcon className="size-4" /> },
  { type: "divider", label: "Divider", icon: <Minus className="size-4" /> },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AlignSelect({ value, onChange }: { value?: string; onChange: (v: "left" | "center" | "right") => void }) {
  return (
    <select
      value={value ?? "left"}
      onChange={(e) => onChange(e.target.value as "left" | "center" | "right")}
      className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="left">Left</option>
      <option value="center">Center</option>
      <option value="right">Right</option>
    </select>
  );
}

function ColorInput({ value, onChange, label }: { value?: string; onChange: (v: string) => void; label: string }) {
  const c = value ?? "#000000";
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={c}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border border-gray-200 p-0.5"
        title={label}
      />
      <input
        value={c}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="#000000"
      />
    </div>
  );
}

function PaddingControls({ block, onChange }: { block: Block; onChange: (p: Partial<Block>) => void }) {
  const [open, setOpen] = useState(false);
  const hasPad = block.paddingTop ?? block.paddingBottom ?? block.paddingLeft ?? block.paddingRight;
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
      >
        <Expand className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
        Padding{hasPad ? " (custom)" : ""}
      </button>
      {open && (
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          {(["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] as const).map((key) => (
            <label key={key} className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-400 capitalize">{key.replace("padding", "")}</span>
              <input
                type="number"
                min={0}
                value={block[key] ?? ""}
                onChange={(e) => onChange({ [key]: e.target.value === "" ? undefined : Number(e.target.value) })}
                className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="px"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function BlockEditor({ block, onChange, brand }: { block: Block; onChange: (patch: Partial<Block>) => void; brand?: BrandSettings }) {
  const inputCls = "w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";
  const btnToggle = (active?: boolean) =>
    `rounded border px-2 py-1 text-xs font-semibold transition-colors ${active ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`;

  return (
    <div className="space-y-2.5">
      {block.type === "header" && (
        <>
          <input value={block.content} onChange={(e) => onChange({ content: e.target.value })} placeholder="Heading text" className={inputCls} />
          <div className="flex flex-wrap gap-1.5">
            <select
              value={block.size ?? "h2"}
              onChange={(e) => onChange({ size: e.target.value as "h1" | "h2" | "h3" })}
              className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="h1">H1 — 28px</option>
              <option value="h2">H2 — 22px</option>
              <option value="h3">H3 — 18px</option>
            </select>
            <input
              type="number"
              value={block.fontSize ?? ""}
              onChange={(e) => onChange({ fontSize: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="px"
              className="w-16 rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none"
              title="Font size override"
            />
            <AlignSelect value={block.align} onChange={(v) => onChange({ align: v })} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Color</span>
            <ColorInput value={block.textColor ?? "#111827"} onChange={(v) => onChange({ textColor: v })} label="Text color" />
          </div>
        </>
      )}

      {block.type === "text" && (
        <>
          <textarea value={block.content} onChange={(e) => onChange({ content: e.target.value })} placeholder="Enter text…" rows={4} className={`${inputCls} resize-y font-mono`} />
          <div className="flex flex-wrap items-center gap-1.5">
            <select
              value={block.fontSize ?? 15}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
              className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[12, 13, 14, 15, 16, 18, 20, 24].map((s) => <option key={s} value={s}>{s}px</option>)}
            </select>
            <button onClick={() => onChange({ bold: !block.bold })} className={btnToggle(block.bold)} title="Bold">B</button>
            <button onClick={() => onChange({ italic: !block.italic })} className={`${btnToggle(block.italic)} italic`} title="Italic">I</button>
            <button onClick={() => onChange({ underline: !block.underline })} className={`${btnToggle(block.underline)} underline`} title="Underline">U</button>
            <AlignSelect value={block.align} onChange={(v) => onChange({ align: v })} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Color</span>
            <ColorInput value={block.textColor ?? "#374151"} onChange={(v) => onChange({ textColor: v })} label="Text color" />
          </div>
        </>
      )}

      {block.type === "button" && (
        <>
          <input value={block.content} onChange={(e) => onChange({ content: e.target.value })} placeholder="Button label" className={inputCls} />
          <input value={block.href ?? ""} onChange={(e) => onChange({ href: e.target.value })} placeholder="URL (https://…)" className={inputCls} />
          <div className="flex flex-wrap items-center gap-1.5">
            <AlignSelect value={block.align} onChange={(v) => onChange({ align: v })} />
            <button onClick={() => onChange({ fullWidth: !block.fullWidth })} className={btnToggle(block.fullWidth)}>Full width</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-gray-400">Background</span>
              <ColorInput value={block.bgColor ?? brand?.primaryColor ?? "#2563eb"} onChange={(v) => onChange({ bgColor: v })} label="Button background" />
            </div>
            <div>
              <span className="text-xs text-gray-400">Text color</span>
              <ColorInput value={block.textColor ?? "#ffffff"} onChange={(v) => onChange({ textColor: v })} label="Button text" />
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-400">Border radius</span>
            <div className="mt-1 flex gap-1.5">
              {[{ v: 0, l: "Square" }, { v: 6, l: "Rounded" }, { v: 24, l: "Pill" }].map(({ v, l }) => (
                <button key={v} onClick={() => onChange({ borderRadius: v })} className={btnToggle((block.borderRadius ?? 6) === v)}>{l}</button>
              ))}
            </div>
          </div>
        </>
      )}

      {block.type === "image" && (
        <>
          <input value={block.content} onChange={(e) => onChange({ content: e.target.value })} placeholder="Image URL (https://…)" className={inputCls} />
          <input value={block.alt ?? ""} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Alt text" className={inputCls} />
          <div className="flex gap-2">
            <input value={block.width ?? "100%"} onChange={(e) => onChange({ width: e.target.value })} placeholder="Width (e.g. 100%)" className="w-24 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <AlignSelect value={block.align} onChange={(v) => onChange({ align: v })} />
          </div>
        </>
      )}

      {block.type === "divider" && (
        <p className="text-xs text-gray-400">Horizontal rule — no options</p>
      )}

      {block.type !== "divider" && (
        <PaddingControls block={block} onChange={onChange} />
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  templateId?: string;
  initialName?: string;
  initialSubject?: string;
  initialBody?: string;
  initialBlocks?: Block[];
  initialConfig?: TemplateConfig;
  brandSettings?: BrandSettings;
  preloadedBlocks?: Block[];
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TemplateBuilder({
  templateId,
  initialName = "",
  initialSubject = "",
  initialBody = "",
  initialBlocks,
  initialConfig,
  brandSettings,
  preloadedBlocks,
}: Props) {
  const router = useRouter();
  const uid = useId();
  let _counter = 0;
  function nextId() { return `${uid}-${++_counter}-${Date.now()}`; }

  const [name, setName] = useState(initialName);
  const [subject, setSubject] = useState(initialSubject);
  const [config, setConfig] = useState<TemplateConfig>(initialConfig ?? {
    fromName: brandSettings?.companyName ?? "",
    replyTo: "",
    bgColor: "#f3f4f6",
    maxWidth: 600,
    fontFamily: brandSettings?.fontFamily ?? "Inter",
  });
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (preloadedBlocks && preloadedBlocks.length > 0) return preloadedBlocks;
    if (initialBlocks && initialBlocks.length > 0) return initialBlocks;
    if (!initialBody) return [defaultBlock("text", "init-1", brandSettings)];
    return [{ id: "init-1", type: "text", content: initialBody }];
  });

  const [activeBlockId, setActiveBlockId] = useState<string | null>(blocks[0]?.id ?? null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addAfterIndex, setAddAfterIndex] = useState<number>(-1);
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showGlobal, setShowGlobal] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function updateConfig(patch: Partial<TemplateConfig>) {
    setConfig((c) => ({ ...c, ...patch }));
  }

  function updateBlock(id: string, patch: Partial<Block>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function removeBlock(id: string) {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      if (next.length === 0) {
        const fallback = defaultBlock("text", nextId(), brandSettings);
        setActiveBlockId(fallback.id);
        return [fallback];
      }
      if (activeBlockId === id) setActiveBlockId(next[0].id);
      return next;
    });
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  }

  function addBlock(type: Block["type"], afterIndex: number) {
    const block = defaultBlock(type, nextId(), brandSettings);
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, block);
      return next;
    });
    setActiveBlockId(block.id);
    setShowAddMenu(false);
  }

  function insertMergeTag(tag: string) {
    if (!activeBlockId) return;
    setBlocks((prev) =>
      prev.map((b) => (b.id === activeBlockId ? { ...b, content: b.content + `{{${tag}}}` } : b))
    );
  }

  function applyBrandLocally() {
    if (!brandSettings) return;
    setBlocks((prev) =>
      prev.map((b) => b.type === "button" ? { ...b, bgColor: brandSettings.primaryColor } : b)
    );
    updateConfig({ fontFamily: brandSettings.fontFamily });
    showToast("Brand applied");
  }

  async function handleSave() {
    if (!name.trim() || !subject.trim() || blocks.length === 0) {
      setError("Name and subject are required, and at least one block must exist.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body = renderBlocksToHtml(blocks, config, brandSettings);
      const url = templateId ? `/api/email-templates/${templateId}` : "/api/email-templates";
      const res = await fetch(url, {
        method: templateId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), subject: subject.trim(), body, blocks, config }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      router.push("/templates");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTest() {
    setSending(true);
    try {
      const res = await fetch("/api/email-templates/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks, subject, config }),
      });
      if (!res.ok) throw new Error("Failed to send");
      showToast("Test email sent to your inbox");
    } catch {
      showToast("Failed to send test email");
    } finally {
      setSending(false);
    }
  }

  async function handleApplyBrand() {
    if (!templateId) { applyBrandLocally(); return; }
    setApplying(true);
    try {
      const res = await fetch(`/api/email-templates/${templateId}/apply-brand`, { method: "POST" });
      if (!res.ok) throw new Error();
      applyBrandLocally();
    } catch {
      showToast("Could not apply brand — save brand settings first.");
    } finally {
      setApplying(false);
    }
  }

  // Resolve brand tokens for preview
  const previewBlocks = blocks.map((b) => ({
    ...b,
    content: resolvePreview(b.content, brandSettings),
    href: b.href ? resolvePreview(b.href, brandSettings) : b.href,
  }));
  const previewHtml = renderBlocksToHtml(previewBlocks, config, brandSettings);

  const FONTS = ["Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Georgia", "Merriweather"];

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/templates")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="size-4" /> Templates
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
            className="w-52 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-gray-200 bg-gray-100 p-0.5">
            <button onClick={() => setPreview("desktop")} className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs transition-colors ${preview === "desktop" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              <Monitor className="size-3.5" /> Desktop
            </button>
            <button onClick={() => setPreview("mobile")} className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs transition-colors ${preview === "mobile" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              <Smartphone className="size-3.5" /> Mobile
            </button>
          </div>
          {brandSettings && (
            <button
              onClick={handleApplyBrand}
              disabled={applying}
              title="Apply brand colors and font to this template"
              className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <Paintbrush className="size-3.5" />
              {applying ? "Applying…" : "Apply brand"}
            </button>
          )}
          <button
            onClick={handleSendTest}
            disabled={sending}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <Send className="size-3.5" />
            {sending ? "Sending…" : "Send test"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <Save className="size-3.5" />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && <div className="shrink-0 bg-red-50 px-6 py-2 text-sm text-red-700">{error}</div>}
      {toast && <div className="shrink-0 bg-gray-900 px-6 py-2 text-sm text-white">{toast}</div>}

      <div className="flex min-h-0 flex-1">
        {/* ── Left: editor panel ── */}
        <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-gray-50">

          {/* Global styles */}
          <div className="border-b border-gray-200 bg-white">
            <button
              onClick={() => setShowGlobal((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-3 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              <span className="flex items-center gap-1.5"><Settings2 className="size-3.5" /> Global styles</span>
              <Expand className={`size-3.5 transition-transform ${showGlobal ? "rotate-180" : ""}`} />
            </button>
            {showGlobal && (
              <div className="space-y-3 px-4 pb-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Font family</label>
                  <select
                    value={config.fontFamily ?? "Inter"}
                    onChange={(e) => updateConfig({ fontFamily: e.target.value })}
                    className="w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Email background</label>
                  <ColorInput value={config.bgColor ?? "#f3f4f6"} onChange={(v) => updateConfig({ bgColor: v })} label="Background color" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Max width (px)</label>
                  <input
                    type="number"
                    value={config.maxWidth ?? 600}
                    onChange={(e) => updateConfig({ maxWidth: Number(e.target.value) })}
                    className="w-24 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* From / Reply-to */}
          <div className="border-b border-gray-200 bg-white px-4 py-3 space-y-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">From name</label>
              <input
                value={config.fromName ?? ""}
                onChange={(e) => updateConfig({ fromName: e.target.value })}
                placeholder={brandSettings?.companyName || "Your Company"}
                className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Reply-to</label>
              <input
                value={config.replyTo ?? ""}
                onChange={(e) => updateConfig({ replyTo: e.target.value })}
                placeholder="hello@yourcompany.com"
                className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="border-b border-gray-200 bg-white px-4 py-3">
            <label className="mb-1 block text-xs font-medium text-gray-500">Subject line</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. We received your request, {{first_name}}!"
              className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Merge tags */}
          <div className="border-b border-gray-200 bg-white px-4 py-3">
            <div className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-500">
              <Tag className="size-3" /> Merge tags
            </div>
            <div className="flex flex-wrap gap-1">
              {MERGE_TAGS.map(({ tag, color }) => (
                <button
                  key={tag}
                  onClick={() => insertMergeTag(tag)}
                  className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium transition-colors ${TAG_COLOR[color]}`}
                >
                  {`{{${tag}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Blocks list */}
          <div className="flex-1 space-y-1 overflow-y-auto p-3">
            {blocks.map((block, i) => {
              const isActive = activeBlockId === block.id;
              return (
                <div key={block.id}>
                  <div
                    onClick={() => setActiveBlockId(block.id)}
                    className={`rounded-lg border bg-white transition-shadow ${isActive ? "border-blue-400 shadow-sm ring-1 ring-blue-200" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{block.type}</span>
                      <div className="ml-auto flex items-center gap-0.5">
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(i, -1); }} disabled={i === 0} className="rounded p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp className="size-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(i, 1); }} disabled={i === blocks.length - 1} className="rounded p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown className="size-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} className="rounded p-0.5 text-gray-400 hover:text-red-500"><Trash2 className="size-3" /></button>
                      </div>
                    </div>
                    {isActive && (
                      <div className="border-t border-gray-100 px-3 pb-3 pt-2">
                        <BlockEditor block={block} onChange={(patch) => updateBlock(block.id, patch)} brand={brandSettings} />
                      </div>
                    )}
                  </div>

                  <div className="relative flex justify-center py-0.5">
                    <button
                      onClick={() => { setAddAfterIndex(i); setShowAddMenu(true); }}
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-400 hover:border-blue-400 hover:text-blue-500"
                    >
                      <Plus className="size-3" />
                    </button>
                    {showAddMenu && addAfterIndex === i && (
                      <div className="absolute top-6 z-10 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        {BLOCK_MENU.map((m) => (
                          <button key={m.type} onClick={() => addBlock(m.type, i)} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                            {m.icon} {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => { setAddAfterIndex(blocks.length - 1); setShowAddMenu(true); }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-400 hover:border-blue-400 hover:text-blue-500"
            >
              <Plus className="size-3.5" /> Add block
            </button>

            {showAddMenu && addAfterIndex === blocks.length - 1 && (
              <div className="rounded-lg border border-gray-200 bg-white py-1 shadow-sm">
                {BLOCK_MENU.map((m) => (
                  <button key={m.type} onClick={() => addBlock(m.type, blocks.length - 1)} className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: live preview (real HTML iframe) ── */}
        <div className="flex flex-1 flex-col overflow-hidden bg-gray-100">
          <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex gap-2">
                <span className="w-16 text-right text-gray-400">From:</span>
                <span>{config.fromName || brandSettings?.companyName || "Formly"} &lt;noreply@formly.app&gt;</span>
              </div>
              <div className="flex gap-2">
                <span className="w-16 text-right text-gray-400">Subject:</span>
                <span className="font-medium text-gray-800" dangerouslySetInnerHTML={{ __html: resolvePreview(subject, brandSettings) || "<em class='text-gray-300'>No subject</em>" }} />
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-start justify-center overflow-y-auto p-6">
            <div
              className="bg-white shadow-md transition-all"
              style={{ width: preview === "mobile" ? "375px" : "660px", maxWidth: "100%", borderRadius: "8px", overflow: "hidden" }}
            >
              <iframe
                srcDoc={previewHtml}
                title="Email preview"
                className="w-full border-none"
                style={{ height: "700px", display: "block" }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>

      {showAddMenu && <div className="fixed inset-0 z-0" onClick={() => setShowAddMenu(false)} />}
    </div>
  );
}
