"use client";

import { useState } from "react";
import {
  Camera,
  RefreshCw,
  AlertCircle,
  Download,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
} from "lucide-react";

const VIEWPORT_OPTIONS = [
  { id: "desktop", label: "Desktop", width: 1280, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "mobile", label: "Mobile", width: 375, icon: Smartphone },
] as const;

export default function WebsiteScreenshotTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );

  const handleCapture = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL");
      return;
    }

    setError("");
    setLoading(true);
    setScreenshotUrl("");

    const targetUrl = trimmed.startsWith("http")
      ? trimmed
      : `https://${trimmed}`;

    const selectedViewport = VIEWPORT_OPTIONS.find((v) => v.id === viewport);
    const width = selectedViewport?.width || 1280;

    const thumbUrl = `https://image.thum.io/get/width/${width}/${targetUrl}`;
    setScreenshotUrl(thumbUrl);
  };

  const handleDownload = async () => {
    if (!screenshotUrl) return;
    try {
      const res = await fetch(screenshotUrl);
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `screenshot-${viewport}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch {
      setError("Failed to download screenshot");
    }
  };

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
                onKeyDown={(e) => e.key === "Enter" && handleCapture()}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleCapture}
              disabled={loading && !screenshotUrl}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              Capture
            </button>
          </div>

          {/* Viewport Options */}
          <div className="mt-4">
            <p className="mb-2 text-sm text-gray-400">Viewport Size:</p>
            <div className="flex gap-2">
              {VIEWPORT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setViewport(opt.id)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      viewport === opt.id
                        ? "border-green-600 bg-green-600/20 text-green-400"
                        : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {opt.label}
                    <span className="text-xs text-gray-500">
                      {opt.width}px
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-800 bg-red-900/20 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Screenshot Result */}
        {(loading || screenshotUrl) && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Screenshot</h3>
              {screenshotUrl && !loading && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              )}
            </div>

            <div
              className={`mx-auto overflow-hidden rounded-lg border border-gray-700 bg-gray-800 ${
                viewport === "mobile"
                  ? "max-w-[375px]"
                  : viewport === "tablet"
                  ? "max-w-[768px]"
                  : "w-full"
              }`}
            >
              {loading && !screenshotUrl && (
                <div className="flex aspect-video items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-green-400" />
                </div>
              )}

              {screenshotUrl && (
                <div className="relative">
                  {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-800/80">
                      <RefreshCw className="h-8 w-8 animate-spin text-green-400" />
                    </div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screenshotUrl}
                    alt="Website screenshot"
                    className="w-full"
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      setError(
                        "Failed to capture screenshot. The URL may be invalid or the service is temporarily unavailable."
                      );
                      setScreenshotUrl("");
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
