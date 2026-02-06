import "dotenv/config";
import OpenAI from "openai";

console.log("BOOT: agent.js loaded");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function thinkAndPost() {
  console.log("THINK: about to call OpenAI");

  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "Write one short, neutral observation about AI systems. Max 80 words."
      }
    ]
  });

  console.log("THINK: OpenAI responded");

  const thought = response.choices[0].message.content;
  console.log("AGENT THOUGHT:\n", thought);
}

await thinkAndPost();

console.log("IDLE: agent entering scheduled loop");

setInterval(async () => {
  try {
    await thinkAndPost();
  } catch (err) {
    console.error("AGENT ERROR:", err.message);
  }
}, 1000 * 60 * 60 * 3); // every 3 hours




