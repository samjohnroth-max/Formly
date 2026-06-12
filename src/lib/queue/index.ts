import { Queue } from "bullmq";

// BullMQ bundles its own ioredis — pass URL string to avoid version conflicts
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
export const redisConnection = { url: redisUrl, maxRetriesPerRequest: null as null, enableReadyCheck: false };

export const LEAD_QUEUE_NAME = "lead-processing";

export const leadQueue = new Queue(LEAD_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

export interface LeadJob {
  metaLeadId: string;
  metaFormId: string;
  metaPageId: string;
  metaAdId?: string;
  metaAdSetId?: string;
  metaCampaignId?: string;
  webhookReceivedAt: string;
}
