import { stFetchJson } from "./client";
import type { STConnectionShape } from "@/types/db";

interface STPagedResponse<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  data: T[];
}

export interface STJobType {
  id: number;
  name: string;
  summary?: string;
}

export interface STBusinessUnit {
  id: number;
  name: string;
}

export async function fetchJobTypes(connection: STConnectionShape): Promise<STJobType[]> {
  const res = await stFetchJson<STPagedResponse<STJobType>>(
    connection,
    `/jpm/v2/tenant/${connection.tenantId}/job-types?pageSize=200&active=true`
  );
  return res.data;
}

export async function fetchBusinessUnits(connection: STConnectionShape): Promise<STBusinessUnit[]> {
  const res = await stFetchJson<STPagedResponse<STBusinessUnit>>(
    connection,
    `/jpm/v2/tenant/${connection.tenantId}/business-units?pageSize=200&active=true`
  );
  return res.data;
}
