import { stFetchJson } from "./client";
import type { STConnectionShape } from "@/types/db";

export interface STJob {
  id: number;
  status: { name: string };
  /** Estimated job value */
  total: number;
  completedOn: string | null;
  jobType: { name: string } | null;
}

export interface STInvoice {
  id: number;
  /** "Pending" | "Posted" | "Voided" | "Exported" | "Paid" */
  status: string;
  total: number;
  invoiceDate: string | null;
}

interface STPagedResponse<T> {
  data: T[];
  hasMore: boolean;
}

/** Fetches a single ServiceTitan job by ID */
export async function fetchSTJob(
  connection: STConnectionShape,
  jobId: string
): Promise<STJob | null> {
  try {
    return await stFetchJson<STJob>(
      connection,
      `/jpm/v2/tenant/${connection.tenantId}/jobs/${jobId}`
    );
  } catch {
    return null;
  }
}

/** Fetches all invoices for a ServiceTitan job */
export async function fetchJobInvoices(
  connection: STConnectionShape,
  jobId: string
): Promise<STInvoice[]> {
  try {
    const res = await stFetchJson<STPagedResponse<STInvoice>>(
      connection,
      `/jpm/v2/tenant/${connection.tenantId}/invoices?jobId=${jobId}&pageSize=50&active=true`
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}
