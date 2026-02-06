import "dotenv/config";
import express from "express";
import cors from "cors";

import { plan } from "./orchestrator/planner.ts";
import { execute } from "./orchestrator/executor.ts";
import { createTrace } from "./telemetry/tracer.ts";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  const { input } = req.body;

  if (!input || typeof input !== "string") {
    return res.status(400).json({
      error: "Request body must include { input: string }",
    });
  }

  const trace = createTrace();

  try {
    const steps = await plan(input, trace);
    const answer = await execute(steps, input, trace);

    res.json({
      answer,
      trace,
    });
  } catch (err) {
    // 🔴 DO NOT HIDE ERRORS — YOU NEED THEM RIGHT NOW
    console.error("AGENT ERROR:", err);

    res.status(500).json({
      error: String(err),
      trace,
    });
  }
});

const PORT = 3333;

app.listen(PORT, () => {
  console.log(`🧠 Agent API running on http://localhost:${PORT}`);
});

