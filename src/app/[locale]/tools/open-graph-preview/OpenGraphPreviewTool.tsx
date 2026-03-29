"use client";

import { useState } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Globe,
  MessageCircle,
  Link2,
} from "lucide-react";

interface OgData {
  title: string;
  description: string;
  image: string;
  type: string;
  siteName: string;
  url: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

export default function OpenGraphPreviewTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<OgData | null>(null);

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(
        `/api/og-preview?url=${encodeURIComponent(trimmed)}`
      );
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch Open Graph data"
      );
    } finally {
      setLoading(false);
    }
  };

  const getHostname = (rawUrl: string): string => {
    try {
      return new URL(rawUrl).hostname;
    } catch {
      return rawUrl;
    }
  };

  const metaTags = data
    ? [
        { property: "og:title", content: data.title },
        { property: "og:description", content: data.description },
        { property: "og:image", content: data.image },
        { property: "og:type", content: data.type },
        { property: "og:site_name", content: data.siteName },
        { property: "og:url", content: data.url },
        { property: "twitter:card", content: data.twitterCard },
        { property: "twitter:title", content: data.twitterTitle },
        { property: "twitter:description", content: data.twitterDescription },
        { property: "twitter:image", content: data.twitterImage },
      ]
    : [];

  return (
      <div className="space-y-6">
        {/* Input */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Website URL
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleFetch}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? "Fetching..." : "Preview"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-800 bg-red-900/20 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Preview Cards */}
        {data && (
          <div className="space-y-6">
            {/* Facebook Preview */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-white">
                  Facebook Preview
                </h3>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
                {data.image && (
                  <div className="aspect-[1.91/1] w-full overflow-hidden bg-gray-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.image}
                      alt="OG Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="text-xs uppercase text-gray-500">
                    {data.siteName || getHostname(data.url)}
                  </div>
                  <div className="mt-1 font-semibold leading-snug text-white">
                    {data.title || "No title found"}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm text-gray-400">
                    {data.description || "No description found"}
                  </div>
                </div>
              </div>
            </div>

            {/* Twitter Preview */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-sky-400" />
                <h3 className="text-lg font-semibold text-white">
                  Twitter / X Preview
                </h3>
              </div>
              <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800">
                {(data.twitterImage || data.image) && (
                  <div className="aspect-[2/1] w-full overflow-hidden bg-gray-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.twitterImage || data.image}
                      alt="Twitter Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="font-semibold leading-snug text-white">
                    {data.twitterTitle || data.title || "No title"}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm text-gray-400">
                    {data.twitterDescription ||
                      data.description ||
                      "No description"}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <ExternalLink className="h-3 w-3" />
                    {getHostname(data.url)}
                  </div>
                </div>
              </div>
            </div>

            {/* LinkedIn Preview */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  LinkedIn Preview
                </h3>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
                {data.image && (
                  <div className="aspect-[1.91/1] w-full overflow-hidden bg-gray-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.image}
                      alt="LinkedIn Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="font-semibold leading-snug text-white">
                    {data.title || "No title found"}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {getHostname(data.url)}
                  </div>
                </div>
              </div>
            </div>

            {/* Raw Meta Tags */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Raw Meta Tags
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-2 text-left font-medium text-gray-400">
                        Property
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-400">
                        Content
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {metaTags.map((tag) => (
                      <tr
                        key={tag.property}
                        className="border-b border-gray-800"
                      >
                        <td className="px-4 py-2 font-mono text-sm text-green-400">
                          {tag.property}
                        </td>
                        <td className="max-w-md truncate px-4 py-2 text-gray-300">
                          {tag.content || (
                            <span className="text-gray-600">Not set</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
