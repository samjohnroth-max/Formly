import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
export const redisConnection = {
  url: redisUrl,
  maxRetriesPerRequest: null as null,
  enableReadyCheck: false,
};

export const ST_JOBS_QUEUE_NAME = "st-job-updates";

export const stJobsQueue = new Queue(ST_JOBS_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});

/**
 * Schedules the repeatable poll job if not already registered.
 * Call once at worker startup.
 */
export async function scheduleSTJobsPoll(): Promise<void> {
  const repeatKey = "poll-all-accounts";
  const existing = await stJobsQueue.getRepeatableJobs();
  const alreadyScheduled = existing.some((j) => j.name === repeatKey);

  if (!alreadyScheduled) {
    await stJobsQueue.add(
      repeatKey,
      {},
      {
        repeat: { every: 15 * 60 * 1000 }, // 15 minutes
        jobId: repeatKey,
      }
    );
    console.log("[st-jobs] Scheduled poll every 15 minutes");
  }
}
