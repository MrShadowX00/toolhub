import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ToolHub/1.0; +https://toolhub.dev)",
      },
    });
    clearTimeout(timeout);

    const html = await res.text();

    const getMeta = (property: string): string => {
      const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
      }
      return "";
    };

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);

    const data = {
      title: getMeta("og:title") || titleMatch?.[1] || "",
      description: getMeta("og:description") || getMeta("description") || "",
      image: getMeta("og:image") || "",
      type: getMeta("og:type") || "website",
      siteName: getMeta("og:site_name") || "",
      url: getMeta("og:url") || targetUrl,
      twitterCard: getMeta("twitter:card") || "",
      twitterTitle: getMeta("twitter:title") || "",
      twitterDescription: getMeta("twitter:description") || "",
      twitterImage: getMeta("twitter:image") || "",
    };

    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
