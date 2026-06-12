/**
 * Formly ST Job Updates Worker
 *
 * Polls ServiceTitan every 15 minutes for job completions and invoice
 * finalizations, then fires Meta CAPI Purchase events for revenue attribution.
 *
 * Run as a separate Railway service:
 *   npm run worker:st-jobs
 */

import { Worker } from "bullmq";
import { ST_JOBS_QUEUE_NAME, redisConnection, scheduleSTJobsPoll } from "@/lib/queue/st-jobs";
import { processPollJob } from "@/lib/worker/st-jobs/processor";

const worker = new Worker(ST_JOBS_QUEUE_NAME, processPollJob, {
  connection: redisConnection,
  concurrency: 1, // One poll at a time to avoid ST rate limits
});

worker.on("active", (job) => {
  console.log(`[st-jobs] Starting poll run ${job.id}`);
});

worker.on("completed", (job) => {
  console.log(`[st-jobs] Poll run ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[st-jobs] Poll run ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[st-jobs] Worker error:", err);
});

// Schedule the 15-minute repeatable job at startup
scheduleSTJobsPoll().catch(console.error);

async function shutdown() {
  console.log("[st-jobs] Shutting down gracefully…");
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log(`[st-jobs] Listening on queue "${ST_JOBS_QUEUE_NAME}"`);
