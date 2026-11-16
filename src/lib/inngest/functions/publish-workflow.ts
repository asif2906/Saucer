import { inngest } from "../client";
import { PublishExecutor } from "@/lib/publishing/publish-executor";
import { PublishingService } from "@/lib/publishing/publishing.service";
import { prisma } from "@/lib/prisma";
import { PublishJobStatus } from "@prisma/client";

/**
 * Inngest persistent scheduled post workflow:
 * Wakes up at scheduled time, validates post has not been cancelled/edited,
 * and executes publishing across all platform variants.
 */
export const scheduledPublishWorkflow = inngest.createFunction(
  {
    id: "scheduled-social-publish",
    name: "Scheduled Social Broadcast Pipeline",
    retries: 3,
    triggers: [{ event: "saucer/post.scheduled" }],
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { postId, scheduledAt } = event.data;

    // Step 1: Wait until scheduled timestamp
    await step.sleepUntil("wait-for-schedule", scheduledAt);

    // Step 2: Fetch active jobs for this post
    const jobs = await step.run("fetch-pending-jobs", async () => {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          variants: {
            include: {
              jobs: {
                where: { status: PublishJobStatus.PENDING },
              },
            },
          },
        },
      });

      if (!post) return [];

      const jobIds: string[] = [];
      for (const variant of post.variants) {
        for (const job of variant.jobs) {
          jobIds.push(job.id);
        }
      }
      return jobIds;
    });

    // Step 3: Execute each variant publishing job
    const outcomes: Record<string, any> = {};
    for (const jobId of jobs) {
      const result = await step.run(`execute-job-${jobId}`, async () => {
        return PublishExecutor.executeJob(jobId);
      });
      outcomes[jobId] = result;
    }

    return { postId, executedJobs: jobs.length, outcomes };
  }
);

/**
 * Inngest scheduled reconciliation cron:
 * Runs periodically to ensure zero jobs are missed even during deployments or network interrupts.
 */
export const schedulerReconciliationCron = inngest.createFunction(
  {
    id: "scheduler-reconciliation-cron",
    name: "Scheduler Queue Reconciliation",
    triggers: [{ cron: "*/5 * * * *" }],
  },
  async ({ step }: { step: any }) => {
    const results = await step.run("reconcile-due-jobs", async () => {
      return PublishingService.runDueJobReconciliation(25);
    });

    return { reconciledCount: results.length };
  }
);
