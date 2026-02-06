import { z } from "zod";

export const ReadFileSchema = z.object({
  path: z.string(),
});

export const WriteFileSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export const HttpGetSchema = z.object({
  url: z.string().url(),
});

export type ReadFileInput = z.infer<typeof ReadFileSchema>;
export type WriteFileInput = z.infer<typeof WriteFileSchema>;
export type HttpGetInput = z.infer<typeof HttpGetSchema>;

