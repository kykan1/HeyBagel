import { NextRequest, NextResponse } from "next/server";
import { deleteEntryAction } from "@/actions/entry-actions";

/**
 * DELETE /api/entries/[id]
 * Deletes a journal entry by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteEntryAction(id);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("API error deleting entry:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to delete entry" 
      },
      { status: 500 }
    );
  }
}


