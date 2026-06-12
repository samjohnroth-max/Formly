// Shared email rendering — no "use client", safe to import from API routes.

export interface Block {
  id: string;
  type: "header" | "text" | "button" | "image" | "divider";
  content: string;
  href?: string;
  align?: "left" | "center" | "right";
  size?: "h1" | "h2" | "h3";
  alt?: string;
  width?: string;
  // Rich text
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textColor?: string;
  // Button
  bgColor?: string;
  borderRadius?: number;
  fullWidth?: boolean;
  // Universal padding
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

export interface TemplateConfig {
  fromName?: string;
  replyTo?: string;
  bgColor?: string;
  maxWidth?: number;
  fontFamily?: string;
}

export interface BrandSettings {
  companyName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  fontFamily?: string;
  buttonStyle?: string;
  footerText?: string;
}

function buttonRadius(brand?: BrandSettings, blockRadius?: number): number {
  if (blockRadius !== undefined) return blockRadius;
  const style = brand?.buttonStyle ?? "rounded";
  if (style === "pill") return 24;
  if (style === "square") return 0;
  return 6;
}

export function renderBlocksToHtml(
  blocks: Block[],
  config?: TemplateConfig,
  brand?: BrandSettings
): string {
  const font = config?.fontFamily ?? brand?.fontFamily ?? "Inter";
  const fontStack = `'${font}',system-ui,sans-serif`;
  const emailBg = config?.bgColor ?? "#f3f4f6";
  const maxWidth = config?.maxWidth ?? 600;

  const parts = blocks.map((b) => {
    const pt = b.paddingTop ?? 0;
    const pb = b.paddingBottom ?? 16;
    const pl = b.paddingLeft ?? 0;
    const pr = b.paddingRight ?? 0;
    const pad = `padding:${pt}px ${pr}px ${pb}px ${pl}px`;

    switch (b.type) {
      case "header": {
        const tag = b.size ?? "h2";
        const fs = b.fontSize ?? (tag === "h1" ? 28 : tag === "h2" ? 22 : 18);
        const color = b.textColor ?? "#111827";
        return `<${tag} style="font-family:${fontStack};font-size:${fs}px;font-weight:700;color:${color};text-align:${b.align ?? "left"};margin:0;${pad};">${b.content}</${tag}>`;
      }
      case "text": {
        const fs = b.fontSize ?? 15;
        const color = b.textColor ?? "#374151";
        const fw = b.bold ? "700" : "400";
        const fi = b.italic ? "italic" : "normal";
        const td = b.underline ? "underline" : "none";
        return `<p style="font-family:${fontStack};font-size:${fs}px;line-height:1.6;color:${color};text-align:${b.align ?? "left"};font-weight:${fw};font-style:${fi};text-decoration:${td};margin:0;${pad};">${b.content.replace(/\n/g, "<br>")}</p>`;
      }
      case "button": {
        const bg = b.bgColor ?? brand?.primaryColor ?? "#2563eb";
        const fg = b.textColor ?? "#ffffff";
        const br = buttonRadius(brand, b.borderRadius);
        const fullW = b.fullWidth ? "width:100%;box-sizing:border-box;text-align:center;" : "";
        const display = b.fullWidth ? "block" : "inline-block";
        return `<div style="text-align:${b.align ?? "center"};${pad};"><a href="${b.href ?? "#"}" style="display:${display};background:${bg};color:${fg};font-family:${fontStack};font-size:15px;font-weight:600;padding:12px 28px;border-radius:${br}px;text-decoration:none;${fullW}">${b.content}</a></div>`;
      }
      case "image":
        return `<div style="text-align:${b.align ?? "center"};${pad};"><img src="${b.content}" alt="${b.alt ?? ""}" style="max-width:${b.width ?? "100%"};height:auto;display:inline-block;" /></div>`;
      case "divider":
        return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:0;${pad};" />`;
    }
  });

  const footer = brand?.footerText
    ? `<p style="font-family:${fontStack};font-size:11px;color:#9ca3af;text-align:center;margin:24px 0 0;">${brand.footerText}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Email Preview</title>
</head>
<body style="margin:0;padding:32px 16px;background:${emailBg};">
<div style="max-width:${maxWidth}px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;padding:32px 24px;">
${parts.join("\n")}
${footer}
</div>
</body>
</html>`;
}
