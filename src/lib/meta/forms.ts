import { META_API_BASE } from "./index";

export interface MetaForm {
  id: string;
  name: string;
  status: string;
  pageId: string;
  pageName: string;
}

interface PageLeadgenForms {
  data: Array<{ id: string; name: string; status: string }>;
}

interface MetaPage {
  id: string;
  name: string;
  leadgen_forms?: PageLeadgenForms;
}

interface MeAccountsResponse {
  data: MetaPage[];
  paging?: { cursors: { after: string }; next?: string };
}

/** Fetches all Instant Forms accessible via the token, grouped across all pages */
export async function fetchMetaForms(accessToken: string): Promise<MetaForm[]> {
  const url =
    `${META_API_BASE}/me/accounts` +
    `?fields=id,name,leadgen_forms{id,name,status}` +
    `&limit=100` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const res = await fetch(url);
  const data: MeAccountsResponse = await res.json();
  if (!res.ok) throw new Error((data as { error?: { message: string } }).error?.message ?? "Failed to fetch Meta pages");

  const forms: MetaForm[] = [];
  for (const page of data.data) {
    for (const form of page.leadgen_forms?.data ?? []) {
      forms.push({
        id: form.id,
        name: form.name,
        status: form.status,
        pageId: page.id,
        pageName: page.name,
      });
    }
  }
  return forms;
}

export interface MetaFormQuestion {
  key: string;
  type: string;
  label: string;
}

interface FormFieldsResponse {
  id: string;
  name: string;
  questions: MetaFormQuestion[];
  error?: { message: string };
}

/** Returns the question field keys for a specific form (e.g. "full_name", "phone_number") */
export async function fetchFormFields(
  formId: string,
  accessToken: string
): Promise<MetaFormQuestion[]> {
  const res = await fetch(
    `${META_API_BASE}/${formId}?fields=id,name,questions&access_token=${encodeURIComponent(accessToken)}`
  );
  const data: FormFieldsResponse = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? `Failed to fetch fields for form ${formId}`);
  return data.questions ?? [];
}
