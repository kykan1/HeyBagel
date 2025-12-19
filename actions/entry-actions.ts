"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createEntry as dbCreateEntry, updateEntry as dbUpdateEntry, deleteEntry as dbDeleteEntry } from "@/lib/db/queries";
import { createEntrySchema, updateEntrySchema } from "@/lib/utils/validation";
import { getTodayISO } from "@/lib/utils/date";
import { randomUUID } from "crypto";

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function createEntry(
  formData: FormData
): Promise<ActionResult<{ entryId: string }>> {
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
    
    await dbCreateEntry(
      entryId,
      validatedData.content,
      date,
      validatedData.mood ?? null
    );

    // Revalidate home page
    revalidatePath("/");
    revalidatePath(`/entries/${entryId}`);

    return { success: true, data: { entryId } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    
    console.error("Error creating entry:", error);
    return { success: false, error: "Failed to create entry. Please try again." };
  }
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
  try {
    const rawData = {
      content: formData.get("content") as string | null,
      mood: formData.get("mood") as string | null,
    };

    const validatedData = updateEntrySchema.parse({
      content: rawData.content || undefined,
      mood: rawData.mood === "" ? null : rawData.mood || undefined,
    });

    const updated = await dbUpdateEntry(entryId, validatedData);

    if (!updated) {
      return { success: false, error: "Entry not found" };
    }

    revalidatePath("/");
    revalidatePath(`/entries/${entryId}`);

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    
    console.error("Error updating entry:", error);
    return { success: false, error: "Failed to update entry. Please try again." };
  }
}

export async function deleteEntryAction(entryId: string): Promise<ActionResult> {
  try {
    const deleted = await dbDeleteEntry(entryId);

    if (!deleted) {
      return { success: false, error: "Entry not found" };
    }

    revalidatePath("/");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting entry:", error);
    return { success: false, error: "Failed to delete entry. Please try again." };
  }
}

