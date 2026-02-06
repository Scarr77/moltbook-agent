import * as dotenv from "dotenv";
dotenv.config();

import { startTrace, summarize } from "./telemetry/tracer.ts";
import { plan } from "./orchestrator/planner.ts";
import { execute } from "./orchestrator/executor.ts";
import { ingestDocuments } from "./tools/ingest.ts";

async function bootstrap() {
  // Seed memory (temporary)
  await ingestDocuments([
    "moltbook-agent is an internal AI orchestration engine designed to handle ambiguous business questions using agents, memory, and planning.",
    "The system separates tools, agents, orchestration, and telemetry to mirror enterprise AI platforms.",
    "Moltbook-agent is designed to be wrapped and published to agent networks like Moltbook after internal validation.",
  ]);

  const input = "Explain the value of moltbook-agent to a sales leader";

  // 🔹 CREATE TRACE ONCE
  const trace = startTrace();

  // 🔹 PASS TRACE EVERYWHERE
  const planSteps = await plan(input, trace);
  const result = await execute(planSteps, input, trace);

  console.log(result);
  console.log("\nTRACE:");
  console.log(JSON.stringify(summarize(trace), null, 2));
}

bootstrap().catch((err) => {
  if (err instanceof Error) console.error(err.message);
  else console.error(String(err));
  process.exit(1);
});





