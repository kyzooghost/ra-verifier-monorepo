import { NextRequest } from "next/server";

export const runtime = "edge";

// Helper function to create standard response headers
function createResponseHeaders(originalHeaders: Headers): Headers {
  const headers = new Headers({
    "Content-Type": originalHeaders.get("Content-Type") || "application/json",
    "Cache-Control": "public, s-maxage=31536000, immutable", // Cache for one year
    "CDN-Cache-Control": "public, s-maxage=31536000, immutable",
    "Vercel-CDN-Cache-Control": "public, s-maxage=31536000, immutable",
  });

  // Copy other important headers
  const contentLength = originalHeaders.get("Content-Length");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return headers;
}

// Common function to handle both GET and HEAD requests
async function handleRequest(
  checksum: string,
  method: "GET" | "HEAD",
): Promise<Response> {
  const apiPrefix = process.env.API_PREFIX;
  if (!apiPrefix) {
    throw new Error("API_PREFIX environment variable is not set");
  }

  try {
    const response = await fetch(
      `${apiPrefix}/api/attestations/raw/${checksum}`,
      {
        method,
        headers: {
          "User-Agent": "Next.js Edge Function",
        },
      },
    );

    // Forward upstream server errors with original status
    if (!response.ok) {
      return new Response(method === "GET" ? response.body : null, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "Content-Type":
            response.headers.get("Content-Type") || "application/json",
        },
      });
    }

    const headers = createResponseHeaders(response.headers);

    // Return response with or without body based on method
    return new Response(method === "GET" ? response.body : null, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error(`Proxy ${method} error:`, error);
    return new Response(
      method === "GET"
        ? JSON.stringify({ error: "Failed to fetch from upstream server" })
        : null,
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { checksum: string } },
) {
  return handleRequest(params.checksum, "GET");
}

export async function HEAD(
  _req: NextRequest,
  { params }: { params: { checksum: string } },
) {
  return handleRequest(params.checksum, "HEAD");
}
