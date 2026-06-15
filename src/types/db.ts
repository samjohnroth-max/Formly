/** Mirrors Prisma enums — avoids needing generated client for type imports */
export type ConnectionStatus = "ACTIVE" | "EXPIRED" | "ERROR" | "DISCONNECTED";
export type DestinationType = "BOOKING" | "LEAD" | "FOLLOWUP" | "ESTIMATE";
export type CampaignStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";
export type RoutingStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "RETRY";

/** Minimal shape of the STConnection Prisma model used across lib/servicetitan */
export interface STConnectionShape {
  id: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  appKey: string;
  accessToken: string | null;
  tokenExpiresAt: Date | null;
}

/** Field mapping input used in wizard and campaign creation */
export interface FieldMappingInput {
  metaField: string;
  stField: string;
  transform?: string;
}

/** Full wizard state carried across all 4 steps */
export interface WizardState {
  name: string;
  metaConnectionId: string;
  metaAdAccountId: string;
  metaFormId: string;
  metaFormName: string;
  stConnectionId: string;
  destinationType: DestinationType;
  jobType: string;
  businessUnit: string;
  priority: string;
  assignedTo: string;
  followupDays: number;
  capiEnabled: boolean;
  campaignTag: string;
  fieldMappings: FieldMappingInput[];
  emailTemplateId: string | null;
}
