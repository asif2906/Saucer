import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  scheduledPublishWorkflow,
  schedulerReconciliationCron,
} from "@/lib/inngest/functions/publish-workflow";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scheduledPublishWorkflow, schedulerReconciliationCron],
});
