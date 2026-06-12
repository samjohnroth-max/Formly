import { db } from "@/lib/db";
import type { ProcessingContext } from "../types";

const TRANSFORMS: Record<string, (v: string) => string> = {
  uppercase: (v) => v.toUpperCase(),
  lowercase: (v) => v.toLowerCase(),
  phone_format: (v) => {
    const digits = v.replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return v;
  },
  split_name: (v) => v.split(" ")[0] ?? v, // returns first name
};

function applyTransform(value: string, transform: string | null): string {
  if (!transform) return value;
  return TRANSFORMS[transform]?.(value) ?? value;
}

function getField(
  fieldData: Array<{ name: string; values: string[] }>,
  name: string
): string | undefined {
  return fieldData.find((f) => f.name === name)?.values[0];
}

/**
 * Applies FieldMappings to extract structured fields from the raw Meta field_data.
 * Handles the split_name transform by splitting full_name into first/last.
 */
export async function parseFields(ctx: ProcessingContext): Promise<void> {
  const { campaign, fieldData = [] } = ctx;
  if (!campaign || !ctx.leadId) return;

  // Build a map of stField → raw value using the campaign's field mappings
  const mapped: Record<string, string> = {};
  for (const mapping of campaign.fieldMappings) {
    const raw = getField(fieldData, mapping.metaField);
    if (raw !== undefined) {
      mapped[mapping.stField] = applyTransform(raw, mapping.transform);
    }
  }

  // Special-case: split_name on customer.name into firstName/lastName
  let firstName: string | undefined = mapped["customer.firstName"] ?? undefined;
  let lastName: string | undefined = mapped["customer.lastName"] ?? undefined;

  if (!firstName && !lastName && mapped["customer.name"]) {
    const parts = mapped["customer.name"].trim().split(/\s+/);
    firstName = parts[0] ?? undefined;
    lastName = parts.slice(1).join(" ") || undefined;
  }

  ctx.firstName = firstName ?? undefined;
  ctx.lastName = lastName ?? undefined;
  ctx.email = mapped["customer.email"] ?? undefined;
  ctx.phone = mapped["customer.phone"] ?? undefined;
  // Accept both "location.street" (current) and "location.address" (legacy field name)
  ctx.street = mapped["location.street"] ?? mapped["location.address"] ?? undefined;
  ctx.zip = mapped["location.zip"] ?? undefined;
  ctx.city = mapped["location.city"] ?? undefined;
  ctx.state = mapped["location.state"] ?? undefined;
  ctx.serviceInterest = mapped["job.notes"] ?? undefined;

  // Collect all raw form Q&As for notes and the lead detail page
  const formData: Record<string, string> = {};
  for (const f of fieldData) {
    if (f.values[0] !== undefined) {
      formData[f.name] = f.values[0];
    }
  }
  ctx.formData = formData;

  await db.lead.update({
    where: { id: ctx.leadId },
    data: {
      firstName: ctx.firstName ?? null,
      lastName: ctx.lastName ?? null,
      email: ctx.email ?? null,
      phone: ctx.phone ?? null,
      street: ctx.street ?? null,
      zip: ctx.zip ?? null,
      city: ctx.city ?? null,
      state: ctx.state ?? null,
      serviceInterest: ctx.serviceInterest ?? null,
      formData,
    },
  });
}
