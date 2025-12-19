import { NextRequest, NextResponse } from "next/server";
import { processEntryAI } from "@/actions/ai-actions";

export async function POST(request: NextRequest) {
  try {
    const { entryId } = await request.json();

    if (!entryId) {
      return NextResponse.json(
        { success: false, error: "Entry ID is required" },
        { status: 400 }
      );
    }

    // Process AI asynchronously
    const result = await processEntryAI(entryId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API error processing AI:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

