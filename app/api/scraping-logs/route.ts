import { NextRequest, NextResponse } from "next/server";

const endpoint = "http://localhost:8000/api/v1/scraping-logs";

export async function GET(request: NextRequest) {
  try {
    
    // Forward the request to the actual API
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API responded with status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating weekly goal:", error);
    return NextResponse.json(
      { error: "Failed to create weekly goal" },
      { status: 500 }
    );
  }
}
