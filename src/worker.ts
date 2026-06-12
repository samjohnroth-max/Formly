/**
 * Formly BullMQ Worker Process
 *
 * Run as a separate Railway service:
 *   npm run worker
 *
 * Retry policy: 3 attempts — 5 min, 30 min, 2 hr backoff
 * After all retries: dead-letter handling (lead → FAILED, alert email)
 */

import { Worker, UnrecoverableError } from "bullmq";
import { LEAD_QUEUE_NAME, redisConnection } from "@/lib/queue";
import { processLeadJob, handleDeadLetter } from "@/lib/worker/processor";
import type { LeadJob } from "@/lib/queue";

const RETRY_DELAYS_MS = [
  5 * 60 * 1000,   // 5 min
  30 * 60 * 1000,  // 30 min
  2 * 60 * 60 * 1000, // 2 hr
];

// Tracks leadId per job for DLQ context (BullMQ jobs don't mutate data)
const jobLeadIdMap = new Map<string, string>();

const worker = new Worker<LeadJob>(
  LEAD_QUEUE_NAME,
  async (job) => {
    await processLeadJob(job);
    jobLeadIdMap.delete(job.id ?? "");
  },
  {
    connection: redisConnection,
    concurrency: 5,
    settings: {
      backoffStrategy: (attemptsMade: number) =>
        RETRY_DELAYS_MS[attemptsMade - 1] ?? RETRY_DELAYS_MS.at(-1)!,
    },
  }
);

worker.on("active", (job) => {
  console.log(`[worker] Processing job ${job.id} — lead ${job.data.metaLeadId}`);
});

worker.on("completed", (job) => {
  console.log(`[worker] Completed job ${job.id} — lead ${job.data.metaLeadId}`);
});

worker.on("failed", async (job, err) => {
  if (!job) return;

  const maxAttempts = job.opts.attempts ?? 3;
  const isUnrecoverable = err instanceof UnrecoverableError;
  const isLastAttempt = isUnrecoverable || job.attemptsMade >= maxAttempts;

  console.error(
    `[worker] Job ${job.id} failed (attempt ${job.attemptsMade}/${maxAttempts}${isUnrecoverable ? ", unrecoverable" : ""}):`,
    err.message
  );

  if (isLastAttempt) {
    const leadId = jobLeadIdMap.get(job.id ?? "");
    await handleDeadLetter(job.data.metaLeadId, leadId, err.message);
    jobLeadIdMap.delete(job.id ?? "");
  }
});

worker.on("error", (err) => {
  console.error("[worker] Worker error:", err);
});

// Graceful shutdown
async function shutdown() {
  console.log("[worker] Shutting down gracefully…");
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log(`[worker] Listening on queue "${LEAD_QUEUE_NAME}" with concurrency=5`);
