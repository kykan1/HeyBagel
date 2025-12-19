import { z } from "zod";

export const moodSchema = z.enum(["positive", "neutral", "negative", "mixed"]);

// Content length constraints (matching AI requirements)
const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 10000;

export const createEntrySchema = z.object({
  content: z
    .string()
    .min(MIN_CONTENT_LENGTH, `Entry must be at least ${MIN_CONTENT_LENGTH} characters`)
    .max(MAX_CONTENT_LENGTH, `Entry must be under ${MAX_CONTENT_LENGTH} characters`)
    .refine((val) => val.trim().length >= MIN_CONTENT_LENGTH, {
      message: "Entry content cannot be just whitespace",
    }),
  mood: moodSchema.optional(),
  date: z.string().optional(),
});

export const updateEntrySchema = z.object({
  content: z
    .string()
    .min(MIN_CONTENT_LENGTH, `Entry must be at least ${MIN_CONTENT_LENGTH} characters`)
    .max(MAX_CONTENT_LENGTH, `Entry must be under ${MAX_CONTENT_LENGTH} characters`)
    .refine((val) => val.trim().length >= MIN_CONTENT_LENGTH, {
      message: "Entry content cannot be just whitespace",
    })
    .optional(),
  mood: moodSchema.optional().nullable(),
});

export type CreateEntryFormData = z.infer<typeof createEntrySchema>;
export type UpdateEntryFormData = z.infer<typeof updateEntrySchema>;

