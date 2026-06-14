// ============================================================================
// Wuwa Archive — Upload Log API Route
// Extract Convene URL from Client.log file
// ============================================================================

import { NextRequest, NextResponse } from "next/server";

// === REGEX PATTERNS ===

/**
 * Pattern to match Convene URLs in log files
 */
const LOG_URL_REGEX = /https:\/\/aki-gm-resources(-oversea)?\.aki-game\.(net|com)\/aki\/gacha\/index\.html#\/record\?[^\s"']+/g;

/**
 * Maximum file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// === ROUTE HANDLER ===

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("logFile") as File | null;

    // Check if file exists
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "NO_FILE",
          message: "No file provided. Please select a Client.log file.",
        },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "FILE_TOO_LARGE",
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
          maxSize: "5MB",
        },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Find all convene URLs
    const matches = content.match(LOG_URL_REGEX);

    if (!matches || matches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "URL_NOT_FOUND",
          message:
            "Convene URL not found in log file. Please make sure you opened the Convene History in-game before capturing the log.",
        },
        { status: 400 }
      );
    }

    // Get the last URL (most recent)
    const conveneUrl = matches[matches.length - 1];

    return NextResponse.json({
      success: true,
      conveneUrl,
      message:
        "URL successfully extracted. Use the /parse endpoint to fetch the pull data.",
      urlCount: matches.length,
    });
  } catch (error) {
    console.error("Upload log error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "UNKNOWN_ERROR",
        message: "An unexpected error occurred while processing the file.",
      },
      { status: 500 }
    );
  }
}

// === GET METHOD (for documentation) ===

export async function GET() {
  return NextResponse.json(
    {
      description: "Upload Client.log file to extract Convene URL",
      method: "POST",
      contentType: "multipart/form-data",
      fields: {
        logFile: "The Client.log file to upload",
      },
      response: {
        success: true,
        conveneUrl: "The extracted Convene URL",
        urlCount: "Number of URLs found in the file",
      },
      errors: {
        NO_FILE: "No file was provided",
        FILE_TOO_LARGE: "File exceeds 5MB limit",
        URL_NOT_FOUND: "No Convene URL found in the log file",
      },
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
