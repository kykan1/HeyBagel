"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createEntry as dbCreateEntry, updateEntry as dbUpdateEntry, deleteEntry as dbDeleteEntry } from "@/lib/db/queries";
import { createEntrySchema, updateEntrySchema } from "@/lib/utils/validation";
import { getTodayISO } from "@/lib/utils/date";
import { randomUUID } from "crypto";
import { actionLogger } from "@/lib/utils/logger";

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function createEntry(
  formData: FormData
): Promise<ActionResult<{ entryId: string }>> {
  return actionLogger.time("Create Entry", async () => {
    try {
      // Parse form data
      const rawData = {
        content: formData.get("content") as string,
        mood: formData.get("mood") as string | null,
        date: formData.get("date") as string | null,
      };

      // Validate
      const validatedData = createEntrySchema.parse({
        content: rawData.content,
        mood: rawData.mood || undefined,
        date: rawData.date || undefined,
      });

      // Create entry
      const entryId = randomUUID();
      const date = validatedData.date || getTodayISO();
      const userId = "default_user"; // TODO: Replace with session.user.id after auth
      
      await dbCreateEntry(
        entryId,
        validatedData.content,
        date,
        validatedData.mood ?? null,
        userId
      );

      // Revalidate home page
      revalidatePath("/");
      revalidatePath(`/entries/${entryId}`);

      actionLogger.info("Entry created successfully", { 
        entryId, 
        mood: validatedData.mood,
        contentLength: validatedData.content.length,
      });

      return { success: true, data: { entryId } };
    } catch (error) {
      if (error instanceof z.ZodError) {
        actionLogger.warn("Validation failed", { error: error.errors });
        return { success: false, error: error.errors[0].message };
      }
      
      actionLogger.error("Failed to create entry", error);
      return { success: false, error: "Failed to create entry. Please try again." };
    }
  });
}

export async function createEntryAndRedirect(formData: FormData): Promise<void> {
  const result = await createEntry(formData);
  
  if (result.success) {
    // AI processing will be triggered from the client side
    // This avoids revalidatePath errors during render phase
    redirect(`/entries/${result.data.entryId}`);
  } else {
    throw new Error(result.error);
  }
}

export async function updateEntry(
  entryId: string,
  formData: FormData
): Promise<ActionResult> {
  return actionLogger.time("Update Entry", async () => {
    try {
      const rawData = {
        content: formData.get("content") as string | null,
        mood: formData.get("mood") as string | null,
      };

      const validatedData = updateEntrySchema.parse({
        content: rawData.content || undefined,
        mood: rawData.mood === "" ? null : rawData.mood || undefined,
      });

      const userId = "default_user"; // TODO: Replace with session.user.id after auth
      const updated = await dbUpdateEntry(entryId, validatedData, userId);

      if (!updated) {
        actionLogger.warn("Entry not found for update", { entryId });
        return { success: false, error: "Entry not found" };
      }

      revalidatePath("/");
      revalidatePath(`/entries/${entryId}`);

      actionLogger.info("Entry updated successfully", { 
        entryId,
        mood: validatedData.mood,
        contentLength: validatedData.content?.length,
      });

      return { success: true, data: undefined };
    } catch (error) {
      if (error instanceof z.ZodError) {
        actionLogger.warn("Validation failed on update", { entryId, error: error.errors });
        return { success: false, error: error.errors[0].message };
      }
      
      actionLogger.error("Failed to update entry", error, { entryId });
      return { success: false, error: "Failed to update entry. Please try again." };
    }
  });
}

export async function deleteEntryAction(entryId: string): Promise<ActionResult> {
  return actionLogger.time("Delete Entry", async () => {
    try {
      const userId = "default_user"; // TODO: Replace with session.user.id after auth
      const deleted = await dbDeleteEntry(entryId, userId);

      if (!deleted) {
        actionLogger.warn("Entry not found for deletion", { entryId });
        return { success: false, error: "Entry not found" };
      }

      revalidatePath("/");

      actionLogger.info("Entry deleted successfully", { entryId });

      return { success: true, data: undefined };
    } catch (error) {
      actionLogger.error("Failed to delete entry", error, { entryId });
      return { success: false, error: "Failed to delete entry. Please try again." };
    }
  });
}

