import { Inngest } from "inngest";

// Inngest Client Configuration for Saucer
// Serverless event-driven background workflow engine with zero permanently running daemon
export const inngest = new Inngest({
  id: "saucer-publishing-engine",
  name: "Saucer Social Publishing Engine",
  eventKey: process.env.INNGEST_EVENT_KEY,
  signingKey: process.env.INNGEST_SIGNING_KEY || "signkey-test-saucer-inngest-default",
});
