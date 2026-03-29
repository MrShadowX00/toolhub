"use client";

import { useState, useRef, useCallback } from "react";
import {
  Download,
  Upload,
  Type,
  ImageIcon,
  Copy,
  Check,
} from "lucide-react";
import JSZip from "jszip";

const SIZES = [16, 32, 48, 64, 128, 256];

type Mode = "upload" | "text";

interface FaviconPreview {
  size: number;
  dataUrl: string;
}

export default function FaviconGeneratorTool() {
  const [mode, setMode] = useState<Mode>("text");
  const [letter, setLetter] = useState("T");
  const [bgColor, setBgColor] = useState("#6366f1");
  const [textColor, setTextColor] = useState("#ffffff");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [previews, setPreviews] = useState<FaviconPreview[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFromText = useCallback(
    (char: string, bg: string, fg: string) => {
      if (!char.trim()) {
        setPreviews([]);
        return;
      }
      const results: FaviconPreview[] = [];
      for (const size of SIZES) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // Rounded rect background
        ctx.fillStyle = bg;
        const radius = size * 0.15;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();

        // Text
        ctx.fillStyle = fg;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fontSize = size * 0.6;
        ctx.font = `bold ${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        ctx.fillText(char.charAt(0), size / 2, size / 2 + size * 0.03);

        results.push({ size, dataUrl: canvas.toDataURL("image/png") });
      }
      setPreviews(results);
    },
    []
  );

  const generateFromImage = useCallback((imgSrc: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const results: FaviconPreview[] = [];
      for (const size of SIZES) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        ctx.drawImage(img, 0, 0, size, size);
        results.push({ size, dataUrl: canvas.toDataURL("image/png") });
      }
      setPreviews(results);
    };
    img.src = imgSrc;
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setUploadedImage(result);
      generateFromImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    setGenerating(true);
    if (mode === "text") {
      generateFromText(letter, bgColor, textColor);
    } else if (uploadedImage) {
      generateFromImage(uploadedImage);
    }
    setGenerating(false);
  };

  const handleDownloadZip = async () => {
    if (previews.length === 0) return;
    const zip = new JSZip();
    for (const preview of previews) {
      const base64 = preview.dataUrl.split(",")[1];
      zip.file(`favicon-${preview.size}x${preview.size}.png`, base64, {
        base64: true,
      });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.download = "favicons.zip";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const htmlSnippet = SIZES.map(
    (s) =>
      `<link rel="icon" type="image/png" sizes="${s}x${s}" href="/favicon-${s}x${s}.png">`
  ).join("\n");

  const copySnippet = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("text")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            mode === "text"
              ? "bg-purple-600 text-white"
              : "border border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          <Type className="h-4 w-4" />
          Letter / Emoji
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            mode === "upload"
              ? "bg-purple-600 text-white"
              : "border border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload Image
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="space-y-5">
          {mode === "text" ? (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Letter or Emoji
                </label>
                <input
                  type="text"
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  maxLength={2}
                  placeholder="T"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-center text-2xl text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Upload Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 py-10 transition-colors hover:border-purple-500/50"
              >
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="mb-2 h-24 w-24 rounded object-cover"
                  />
                ) : (
                  <ImageIcon className="mb-2 h-10 w-10 text-gray-500" />
                )}
                <p className="text-sm text-gray-400">
                  {uploadedImage
                    ? "Click to change image"
                    : "Click to upload an image"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, SVG recommended
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={
              generating ||
              (mode === "text" && !letter.trim()) ||
              (mode === "upload" && !uploadedImage)
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            Generate Favicons
          </button>
        </div>

        {/* Previews */}
        <div>
          {previews.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300">
                Generated Sizes
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {previews.map((p) => (
                  <div
                    key={p.size}
                    className="flex flex-col items-center rounded-lg border border-gray-700 bg-gray-800 p-3"
                  >
                    <div
                      className="mb-2 flex items-center justify-center rounded bg-gray-900"
                      style={{ width: 64, height: 64 }}
                    >
                      <img
                        src={p.dataUrl}
                        alt={`${p.size}x${p.size}`}
                        style={{
                          width: Math.min(p.size, 64),
                          height: Math.min(p.size, 64),
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {p.size}x{p.size}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleDownloadZip}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                Download as ZIP
              </button>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-gray-700 bg-gray-800 p-6">
              <div className="text-center text-gray-500">
                <ImageIcon className="mx-auto mb-2 h-12 w-12" />
                <p className="text-sm">
                  Configure and generate to see previews
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HTML Snippet */}
      {previews.length > 0 && (
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">
              HTML Snippet
            </h3>
            <button
              onClick={copySnippet}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            >
              {copiedSnippet ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-300">
            <code>{htmlSnippet}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
