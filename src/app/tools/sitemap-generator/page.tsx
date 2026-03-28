"use client";

import { useState } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import {
  Search,
  RefreshCw,
  AlertCircle,
  Download,
  Copy,
  Check,
  ExternalLink,
  FileCode,
  Link2,
} from "lucide-react";

interface SitemapData {
  urls: string[];
  xml: string;
}

export default function SitemapGeneratorPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<SitemapData | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
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
        `/api/sitemap?url=${encodeURIComponent(trimmed)}`
      );
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate sitemap"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([data.xml], { type: "application/xml" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "sitemap.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <ToolLayout
      title="Sitemap Generator"
      description="Generate an XML sitemap by crawling a website"
      category="Network Tools"
    >
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
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? "Crawling..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-green-400" />
            <p className="mt-3 text-gray-400">
              Crawling website and discovering pages...
            </p>
            <p className="mt-1 text-sm text-gray-600">
              This may take a few seconds
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-800 bg-red-900/20 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* URL Count & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-2">
                  <Link2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {data.urls.length}
                  </div>
                  <div className="text-sm text-gray-400">URLs found</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied!" : "Copy XML"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  Download sitemap.xml
                </button>
              </div>
            </div>

            {/* URL List */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Link2 className="h-5 w-5 text-green-400" />
                Discovered URLs
              </h3>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {data.urls.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                  >
                    <span className="w-8 shrink-0 text-right text-gray-600">
                      {i + 1}.
                    </span>
                    <a
                      href={u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 truncate text-blue-400 hover:underline"
                    >
                      {u}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* XML Output */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <FileCode className="h-5 w-5 text-green-400" />
                Generated XML
              </h3>
              <div className="relative">
                <pre className="max-h-96 overflow-auto rounded-lg bg-gray-950 p-4 text-sm text-gray-300">
                  <code>{data.xml}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
