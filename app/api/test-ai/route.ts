import { NextResponse } from "next/server";
import { hasOpenAIKey } from "@/lib/ai/client";
import { testOpenAIConnection } from "@/lib/ai/entry-analysis";

export async function GET() {
  try {
    // Check if API key is configured
    if (!hasOpenAIKey()) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local",
        },
        { status: 500 }
      );
    }

    // Test the connection
    const isConnected = await testOpenAIConnection();

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to OpenAI. Check your API key and network connection.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OpenAI connection successful! ✅",
      note: "Check your terminal/console for the test analysis result.",
    });
  } catch (error) {
    console.error("OpenAI test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

