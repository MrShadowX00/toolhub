"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  Copy,
  Check,
  ImageIcon,
} from "lucide-react";

const presets = [
  { label: "800 x 400", w: 800, h: 400 },
  { label: "1200 x 630", w: 1200, h: 630 },
  { label: "1920 x 1080", w: 1920, h: 1080 },
  { label: "400 x 400", w: 400, h: 400 },
  { label: "300 x 250", w: 300, h: 250 },
];

export default function PlaceholderImageTool() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  const [bgColor, setBgColor] = useState("#374151");
  const [textColor, setTextColor] = useState("#9CA3AF");
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const displayText = text || `${width}\u00D7${height}`;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayText, width / 2, height / 2);
  }, [width, height, bgColor, textColor, fontSize, displayText]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `placeholder-${width}x${height}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const placeholderUrl = `https://placehold.co/${width}x${height}/${bgColor.replace("#", "")}/${textColor.replace("#", "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(placeholderUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-3 text-sm font-medium text-gray-400">Presets</h3>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => { setWidth(p.w); setHeight(p.h); }}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                width === p.w && height === p.h
                  ? "border-purple-500 bg-purple-500/20 text-purple-300"
                  : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-400">Dimensions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Math.max(1, Math.min(4096, Number(e.target.value) || 1)))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Math.max(1, Math.min(4096, Number(e.target.value) || 1)))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Text (optional)</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`${width}\u00D7${height}`}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Font Size: {fontSize}px</label>
            <input
              type="range"
              min={10}
              max={200}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-400">Colors</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-gray-700 bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-gray-700 bg-transparent"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <ImageIcon className="h-4 w-4" />
            Live Preview
          </h3>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
        </div>
        <div className="flex justify-center overflow-auto rounded-lg border border-gray-800 bg-gray-950 p-4">
          <canvas
            ref={canvasRef}
            style={{ maxWidth: "100%", height: "auto" }}
            className="rounded"
          />
        </div>
      </div>

      {/* URL */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-3 text-sm font-medium text-gray-400">Placeholder URL</h3>
        <div className="flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-green-400">
            {placeholderUrl}
          </code>
          <button
            onClick={handleCopyUrl}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
