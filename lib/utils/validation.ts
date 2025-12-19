import { z } from "zod";

export const moodSchema = z.enum(["positive", "neutral", "negative", "mixed"]);

export const createEntrySchema = z.object({
  content: z.string().min(1, "Entry content is required").max(50000, "Entry is too long"),
  mood: moodSchema.optional(),
  date: z.string().optional(),
});

export const updateEntrySchema = z.object({
  content: z.string().min(1, "Entry content is required").max(50000, "Entry is too long").optional(),
  mood: moodSchema.optional().nullable(),
});

export type CreateEntryFormData = z.infer<typeof createEntrySchema>;
export type UpdateEntryFormData = z.infer<typeof updateEntrySchema>;

