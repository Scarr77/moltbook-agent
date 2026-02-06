import { getVectorStore } from "./vectorStore.ts";


export async function retrieveContext(query: string) {
  const store = await getVectorStore();
  const results = await store.similaritySearch(query, 4);

  return results.map(r => r.pageContent).join("\n---\n");
}

