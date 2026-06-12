"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import {
  Tag, Save, ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown,
  Monitor, Smartphone, Type, AlignLeft, MousePointerClick, ImageIcon, Minus,
} from "lucide-react";

// ─── Block types ──────────────────────────────────────────────────────────────

export type BlockType = "header" | "text" | "button" | "image" | "divider";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  // button-specific
  href?: string;
  align?: "left" | "center" | "right";
  // header-specific
  size?: "h1" | "h2" | "h3";
  // image-specific
  alt?: string;
  width?: string;
}

// ─── Merge tags ───────────────────────────────────────────────────────────────

const MERGE_TAGS = [
  { tag: "first_name", color: "blue" },
  { tag: "last_name", color: "blue" },
  { tag: "phone", color: "blue" },
  { tag: "service_interest", color: "purple" },
  { tag: "company_name", color: "purple" },
  { tag: "job_number", color: "green" },
  { tag: "appointment_date", color: "green" },
  { tag: "unsubscribe_url", color: "gray" },
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
  blue: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  purple: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  gray: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
};

// ─── Block defaults ───────────────────────────────────────────────────────────

function defaultBlock(type: BlockType, uid: string): Block {
  switch (type) {
    case "header":
      return { id: uid, type, content: "Your headline here", size: "h2", align: "left" };
    case "text":
      return { id: uid, type, content: "Enter your message here. Use merge tags to personalize.", align: "left" };
    case "button":
      return { id: uid, type, content: "Click here", href: "https://", align: "center" };
    case "image":
      return { id: uid, type, content: "https://", alt: "Image", width: "100%", align: "center" };
    case "divider":
      return { id: uid, type, content: "" };
  }
}

// ─── HTML renderer ────────────────────────────────────────────────────────────

function renderBlocksToHtml(blocks: Block[]): string {
  const parts = blocks.map((b) => {
    switch (b.type) {
      case "header": {
        const tag = b.size ?? "h2";
        const fontSize = tag === "h1" ? "28px" : tag === "h2" ? "22px" : "18px";
        return `<${tag} style="font-family:sans-serif;font-size:${fontSize};font-weight:700;color:#111827;text-align:${b.align ?? "left"};margin:0 0 16px 0;">${b.content}</${tag}>`;
      }
      case "text":
        return `<p style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#374151;text-align:${b.align ?? "left"};margin:0 0 16px 0;">${b.content.replace(/\n/g, "<br>")}</p>`;
      case "button":
        return `<div style="text-align:${b.align ?? "center"};margin:0 0 24px 0;"><a href="${b.href ?? "#"}" style="display:inline-block;background:#2563eb;color:#fff;font-family:sans-serif;font-size:15px;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;">${b.content}</a></div>`;
      case "image":
        return `<div style="text-align:${b.align ?? "center"};margin:0 0 16px 0;"><img src="${b.content}" alt="${b.alt ?? ""}" style="max-width:${b.width ?? "100%"};height:auto;display:inline-block;" /></div>`;
      case "divider":
        return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />`;
    }
  });

  return `<div style="max-width:600px;margin:0 auto;padding:32px 24px;background:#ffffff;">${parts.join("\n")}</div>`;
}

function resolvePreview(text: string): string {
  return text.replace(
    /\{\{(\w+)\}\}/g,
    (_, k) => PREVIEW_DATA[k] ?? `<span style="background:#fee2e2;padding:0 2px;border-radius:2px">{{${k}}}</span>`
  );
}

// ─── Block add menu ───────────────────────────────────────────────────────────

const BLOCK_MENU: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "header",  label: "Heading",  icon: <Type className="size-4" /> },
  { type: "text",    label: "Text",     icon: <AlignLeft className="size-4" /> },
  { type: "button",  label: "Button",   icon: <MousePointerClick className="size-4" /> },
  { type: "image",   label: "Image",    icon: <ImageIcon className="size-4" /> },
  { type: "divider", label: "Divider",  icon: <Minus className="size-4" /> },
];

// ─── Preview renderer ─────────────────────────────────────────────────────────

function BlockPreview({ block }: { block: Block }) {
  const text = resolvePreview(block.content);
  switch (block.type) {
    case "header": {
      const fs = block.size === "h1" ? "text-2xl" : block.size === "h3" ? "text-lg" : "text-xl";
      const align = block.align === "center" ? "text-center" : block.align === "right" ? "text-right" : "text-left";
      return (
        <div
          className={`font-bold text-gray-900 leading-tight ${fs} ${align}`}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }
    case "text": {
      const align = block.align === "center" ? "text-center" : block.align === "right" ? "text-right" : "text-left";
      return (
        <p
          className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap ${align}`}
          dangerouslySetInnerHTML={{ __html: resolvePreview(block.content).replace(/\n/g, "<br>") }}
        />
      );
    }
    case "button": {
      const align = block.align === "left" ? "text-left" : block.align === "right" ? "text-right" : "text-center";
      return (
        <div className={align}>
          <span className="inline-block bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-md">
            {block.content || "Button"}
          </span>
        </div>
      );
    }
    case "image":
      return (
        <div className={block.align === "left" ? "text-left" : block.align === "right" ? "text-right" : "text-center"}>
          {block.content && block.content !== "https://" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.content} alt={block.alt ?? ""} style={{ maxWidth: block.width ?? "100%" }} className="inline-block" />
          ) : (
            <div className="inline-flex h-24 w-full max-w-xs items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              <ImageIcon className="size-8 text-gray-300" />
            </div>
          )}
        </div>
      );
    case "divider":
      return <hr className="border-gray-200" />;
  }
}

// ─── Block editor ─────────────────────────────────────────────────────────────

function BlockEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
}) {
  const inputCls = "w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="space-y-2">
      {block.type === "header" && (
        <>
          <input
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Heading text"
            className={inputCls}
          />
          <div className="flex gap-2">
            <select
              value={block.size ?? "h2"}
              onChange={(e) => onChange({ size: e.target.value as "h1" | "h2" | "h3" })}
              className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="h1">H1 — Large</option>
              <option value="h2">H2 — Medium</option>
              <option value="h3">H3 — Small</option>
            </select>
            <AlignSelect value={block.align} onChange={(v) => onChange({ align: v })} />
          </div>
        </>
      )}

      {block.type === "text" && (
        <>
          <textarea
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Enter text…"
            rows={4}
            className={`${inputCls} resize-y font-mono`}
          />
          <AlignSelect value={block.align} onChange={(v) => onChange({ align: v })} />
        </>
      )}

      {block.type === "button" && (
        <>
          <input
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Button label"
            className={inputCls}
          />
          <input
            value={block.href ?? ""}
            onChange={(e) => onChange({ href: e.target.value })}
            placeholder="URL (https://…)"
            className={inputCls}
          />
          <AlignSelect value={block.align} onChange={(v) => onChange({ align: v })} />
        </>
      )}

      {block.type === "image" && (
        <>
          <input
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Image URL (https://…)"
            className={inputCls}
          />
          <input
            value={block.alt ?? ""}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="Alt text"
            className={inputCls}
          />
          <div className="flex gap-2">
            <input
              value={block.width ?? "100%"}
              onChange={(e) => onChange({ width: e.target.value })}
              placeholder="Width (e.g. 100%)"
              className="w-24 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <AlignSelect value={block.align} onChange={(v) => onChange({ align: v })} />
          </div>
        </>
      )}

      {block.type === "divider" && (
        <p className="text-xs text-gray-400">Horizontal rule — no options</p>
      )}
    </div>
  );
}

function AlignSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: "left" | "center" | "right") => void;
}) {
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  templateId?: string;
  initialName?: string;
  initialSubject?: string;
  initialBody?: string;
  initialBlocks?: Block[];
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TemplateBuilder({
  templateId,
  initialName = "",
  initialSubject = "",
  initialBody = "",
  initialBlocks,
}: Props) {
  const router = useRouter();
  const uid = useId();
  let _counter = 0;
  function nextId() {
    return `${uid}-${++_counter}-${Date.now()}`;
  }

  const [name, setName] = useState(initialName);
  const [subject, setSubject] = useState(initialSubject);
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (initialBlocks && initialBlocks.length > 0) return initialBlocks;
    if (!initialBody) return [defaultBlock("text", "init-1")];
    // Legacy plain-text body — wrap in a single text block
    return [{ id: "init-1", type: "text", content: initialBody }];
  });

  const [activeBlockId, setActiveBlockId] = useState<string | null>(
    blocks[0]?.id ?? null
  );
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addAfterIndex, setAddAfterIndex] = useState<number>(-1);
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateBlock(id: string, patch: Partial<Block>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function removeBlock(id: string) {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      if (next.length === 0) {
        const fallback = defaultBlock("text", nextId());
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

  function addBlock(type: BlockType, afterIndex: number) {
    const block = defaultBlock(type, nextId());
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, block);
      return next;
    });
    setActiveBlockId(block.id);
    setShowAddMenu(false);
  }

  function openAddMenu(afterIndex: number) {
    setAddAfterIndex(afterIndex);
    setShowAddMenu(true);
  }

  function insertMergeTag(tag: string) {
    if (!activeBlockId) return;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== activeBlockId) return b;
        return { ...b, content: b.content + `{{${tag}}}` };
      })
    );
  }

  async function handleSave() {
    if (!name.trim() || !subject.trim() || blocks.length === 0) {
      setError("Name and subject are required, and at least one block must exist.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body = renderBlocksToHtml(blocks);
      const url = templateId ? `/api/email-templates/${templateId}` : "/api/email-templates";
      const res = await fetch(url, {
        method: templateId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          body,
          blocks,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      router.push("/dashboard/templates");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const previewHtml = renderBlocksToHtml(
    blocks.map((b) => ({
      ...b,
      content: resolvePreview(b.content),
      href: b.href ? resolvePreview(b.href) : b.href,
    }))
  );

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/templates")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="size-4" /> Templates
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
            className="w-56 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <div className="flex rounded-md border border-gray-200 bg-gray-100 p-0.5">
            <button
              onClick={() => setPreview("desktop")}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs transition-colors ${preview === "desktop" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Monitor className="size-3.5" /> Desktop
            </button>
            <button
              onClick={() => setPreview("mobile")}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs transition-colors ${preview === "mobile" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Smartphone className="size-3.5" /> Mobile
            </button>
          </div>
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

      {error && (
        <div className="shrink-0 bg-red-50 px-6 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* ── Left: editor panel ── */}
        <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-gray-50">
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
              <Tag className="size-3" /> Merge tags — appended to active block
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
                    {/* Block header */}
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        {block.type}
                      </span>
                      <div className="ml-auto flex items-center gap-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveBlock(i, -1); }}
                          disabled={i === 0}
                          className="rounded p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="size-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveBlock(i, 1); }}
                          disabled={i === blocks.length - 1}
                          className="rounded p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="size-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                          className="rounded p-0.5 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Block editor (expanded when active) */}
                    {isActive && (
                      <div className="border-t border-gray-100 px-3 pb-3 pt-2">
                        <BlockEditor
                          block={block}
                          onChange={(patch) => updateBlock(block.id, patch)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Add block button between items */}
                  <div className="relative flex justify-center py-0.5">
                    <button
                      onClick={() => openAddMenu(i)}
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-400 hover:border-blue-400 hover:text-blue-500"
                    >
                      <Plus className="size-3" />
                    </button>
                    {showAddMenu && addAfterIndex === i && (
                      <div className="absolute top-6 z-10 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        {BLOCK_MENU.map((m) => (
                          <button
                            key={m.type}
                            onClick={() => addBlock(m.type, i)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {m.icon} {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add block at end */}
            <button
              onClick={() => openAddMenu(blocks.length - 1)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-400 hover:border-blue-400 hover:text-blue-500"
            >
              <Plus className="size-3.5" /> Add block
            </button>

            {/* Add-at-end menu */}
            {showAddMenu && addAfterIndex === blocks.length - 1 && (
              <div className="rounded-lg border border-gray-200 bg-white py-1 shadow-sm">
                {BLOCK_MENU.map((m) => (
                  <button
                    key={m.type}
                    onClick={() => addBlock(m.type, blocks.length - 1)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: live preview ── */}
        <div className="flex flex-1 flex-col overflow-hidden bg-gray-100">
          {/* Email header mock */}
          <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex gap-2">
                <span className="w-16 text-right text-gray-400">From:</span>
                <span>Formly &lt;noreply@formly.app&gt;</span>
              </div>
              <div className="flex gap-2">
                <span className="w-16 text-right text-gray-400">Subject:</span>
                <span
                  className="font-medium text-gray-800"
                  dangerouslySetInnerHTML={{ __html: resolvePreview(subject) || "<em class='text-gray-300'>No subject</em>" }}
                />
              </div>
            </div>
          </div>

          {/* Preview frame */}
          <div className="flex flex-1 items-start justify-center overflow-y-auto p-6">
            <div
              className="bg-white shadow-md transition-all"
              style={{
                width: preview === "mobile" ? "375px" : "600px",
                maxWidth: "100%",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {/* Live block preview */}
              <div className="space-y-4 p-8">
                {blocks.map((block) => (
                  <BlockPreview key={block.id} block={block} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dismiss add menu on outside click */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowAddMenu(false)}
        />
      )}
    </div>
  );
}
