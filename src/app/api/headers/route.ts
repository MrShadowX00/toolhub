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
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return NextResponse.json({ headers, status: res.status, url: res.url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch headers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
