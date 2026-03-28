import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    const base = new URL(targetUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ToolHub/1.0; +https://toolhub.dev)",
      },
    });
    clearTimeout(timeout);

    const html = await res.text();
    const linkRegex = /href=["']([^"'#]*?)["']/gi;
    const urls = new Set<string>();
    urls.add(targetUrl);

    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      try {
        const href = match[1].trim();
        if (!href || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
        const resolved = new URL(href, targetUrl);
        if (resolved.hostname === base.hostname) {
          resolved.hash = "";
          resolved.search = "";
          urls.add(resolved.href);
        }
      } catch {
        // skip invalid URLs
      }
    }

    const sortedUrls = Array.from(urls).sort();
    const today = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const u of sortedUrls) {
      xml += `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
    }
    xml += `</urlset>`;

    return NextResponse.json({ urls: sortedUrls, xml });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to crawl URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
