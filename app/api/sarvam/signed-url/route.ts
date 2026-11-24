import { NextRequest, NextResponse } from "next/server";

const ORG_ID = process.env.SARVAM_ORG_ID || "01a20eae-91a4-79c7-afd3-30198a599673";
const WORKSPACE_ID = process.env.SARVAM_WORKSPACE_ID || "01a20eae-91ac-7601-a783-5461dd894cb2";
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("app_id");
  const userIdentifier = searchParams.get("user_identifier");
  const interactionType = searchParams.get("interaction_type");

  if (!appId) {
    return NextResponse.json(
      { error: "app_id query parameter is required" },
      { status: 400 }
    );
  }

  const url = new URL(
    `https://apps.sarvam.ai/api/app-runtime/orgs/${ORG_ID}/workspaces/${WORKSPACE_ID}/apps/${appId}/url`
  );

  if (interactionType) {
    url.searchParams.set("interaction_type", interactionType);
  }

  try {
    if (!SARVAM_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": SARVAM_API_KEY,
      } as HeadersInit,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Sarvam API error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: `Failed to get signed URL: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Add user identifier params to the signed URL if provided
    if (userIdentifier && data.url) {
      const signedUrl = new URL(data.url);
      signedUrl.searchParams.set("user_identifier", userIdentifier);
      signedUrl.searchParams.set("user_identifier_type", "custom");
      return NextResponse.json({
        url: signedUrl.toString(),
        reference_id: data.reference_id,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching signed URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
