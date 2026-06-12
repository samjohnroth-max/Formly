import type { DestinationType } from "@/types/db";

/** Mirrors the FieldMapping Prisma model */
export interface FieldMappingRecord {
  metaField: string;
  stField: string;
  transform: string | null;
}

/** Mirrors the EmailTemplate Prisma model */
export interface EmailTemplateRecord {
  id: string;
  subject: string;
  body: string;
}

/** Mirrors the MetaConnection Prisma model fields needed for processing */
export interface MetaConnectionRecord {
  id: string;
  accountId: string;
  accessToken: string; // still encrypted — each step decrypts as needed
  pixelId: string | null;
  datasetId: string | null;
}

/** Mirrors the STConnection Prisma model fields needed for processing */
export interface STConnectionRecord {
  id: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  appKey: string;
  accessToken: string | null;
  tokenExpiresAt: Date | null;
}

/** Mirrors the Campaign Prisma model with all needed relations */
export interface CampaignRecord {
  id: string;
  accountId: string;
  metaConnectionId: string;
  stConnectionId: string;
  destinationType: DestinationType;
  jobType: string | null;
  businessUnit: string | null;
  priority: string | null;
  assignedTo: string | null;
  followupDays: number;
  capiEnabled: boolean;
  campaignTag: string | null;
  emailTemplateId: string | null;
  metaConnection: MetaConnectionRecord;
  stConnection: STConnectionRecord;
  fieldMappings: FieldMappingRecord[];
  emailTemplate: EmailTemplateRecord | null;
}

/** Mutable context object threaded through all 11 processing steps */
export interface ProcessingContext {
  // Populated from BullMQ job data
  metaLeadId: string;
  metaFormId: string;
  metaPageId: string;
  metaAdId?: string;
  metaAdSetId?: string;
  metaCampaignId?: string;

  // Step 2: fetchLeadData
  rawData?: Record<string, unknown>;
  fieldData?: Array<{ name: string; values: string[] }>;
  metaCreatedTime?: string;

  // Step 3: identifyCampaign + lead record creation
  campaign?: CampaignRecord;
  leadId?: string;

  // Step 4: parseFields
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  street?: string;
  zip?: string;
  city?: string;
  state?: string;
  serviceInterest?: string;
  /** All raw form Q&As keyed by Meta field name */
  formData?: Record<string, string>;

  // Step 5: geocodeZip (non-blocking)
  lat?: number;
  lng?: number;

  // Step 6: lookupSTCustomer
  stCustomerId?: string;
  stMatchedCustomer?: boolean;

  // Step 7b: createSTLocation
  stLocationId?: string;
  /** true = full street address captured; false = zip/city only or nothing */
  addressComplete?: boolean;

  // Step 2: meta campaign name resolved from Meta API
  metaCampaignName?: string;

  // Step 8: createSTRecord
  stCampaignId?: string;
  stJobId?: string;
  stLeadId?: string;
  stTaskId?: string;
}
