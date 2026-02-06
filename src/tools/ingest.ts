import { v4 as uuidv4 } from "uuid";
import { getVectorStore } from "./vectorStore.ts";

export async function ingestDocuments(docs: string[]) {
  const store = await getVectorStore();

  const records = docs.map(text => ({
    id: uuidv4(),
    pageContent: text,
    metadata: { source: "manual_ingest" },
  }));

  await store.addDocuments(records);
}

