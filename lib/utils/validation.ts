/**
 * Validation Schemas
 * 
 * Zod schemas for form validation and type inference.
 * Ensures data integrity at both client and server boundaries.
 */

import { z } from "zod";

/**
 * Mood options for journal entries
 */
export const moodSchema = z.enum(["positive", "neutral", "negative", "mixed"]);

/**
 * Content length constraints
 * - Minimum: 10 characters (meaningful AI analysis)
 * - Maximum: 10,000 characters (token limit + cost control)
 */
const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 10000;

/**
 * Schema for creating new journal entries
 * Validates content length and optional mood/date fields
 */
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

/**
 * Schema for updating existing journal entries
 * All fields are optional to support partial updates
 */
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

