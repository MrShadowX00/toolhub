"use client";

import { useState, useRef } from "react";
import { Upload, Download, Trash2, ArrowRight } from "lucide-react";

const FORMATS = ["image/png", "image/jpeg", "image/webp"] as const;
const FORMAT_LABELS: Record<string, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/webp": "WebP",
};

export default function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("image/png");
  const [quality, setQuality] = useState(90);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const convert = (imageFile: File, fmt: string, q: number) => {
    setProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        if (fmt === "image/jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setConvertedUrl(URL.createObjectURL(blob));
              setConvertedSize(blob.size);
            }
            setProcessing(false);
          },
          fmt,
          q / 100
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  };

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    convert(f, outputFormat, quality);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setConvertedUrl(null);
    setConvertedSize(0);
  };

  const ext = FORMAT_LABELS[outputFormat]?.toLowerCase() || "png";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
        <p className="text-xs text-gray-500">🔒 Your files never leave your device. All processing happens in your browser.</p>
      </div>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 py-16 transition-colors hover:border-pink-500/50 hover:bg-gray-900"
        >
          <Upload className="mb-3 h-10 w-10 text-gray-500" />
          <p className="text-sm font-medium text-white">Drop an image here or click to upload</p>
          <p className="mt-1 text-xs text-gray-500">Supports JPG, PNG, WebP, GIF, BMP</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="rounded bg-gray-800 px-2 py-1 font-mono text-white">{file.type.split("/")[1].toUpperCase()}</span>
              <ArrowRight className="h-4 w-4" />
              <span className="rounded bg-pink-600 px-2 py-1 font-mono text-white">{FORMAT_LABELS[outputFormat]}</span>
            </div>
            <button onClick={reset} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>

          {/* Output Format */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <label className="mb-3 block text-sm font-medium text-white">Output Format</label>
            <div className="flex gap-3">
              {FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => { setOutputFormat(fmt); convert(file, fmt, quality); }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    outputFormat === fmt
                      ? "bg-pink-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {FORMAT_LABELS[fmt]}
                </button>
              ))}
            </div>

            {outputFormat !== "image/png" && (
              <div className="mt-4">
                <label className="mb-2 block text-sm text-gray-400">Quality: {quality}%</label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => { setQuality(Number(e.target.value)); convert(file, outputFormat, Number(e.target.value)); }}
                  className="w-full accent-pink-500"
                />
              </div>
            )}
          </div>

          {/* Size Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Original ({file.type.split("/")[1].toUpperCase()})</p>
              <p className="text-lg font-bold text-white">{formatSize(file.size)}</p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Converted ({FORMAT_LABELS[outputFormat]})</p>
              <p className="text-lg font-bold text-green-400">{formatSize(convertedSize)}</p>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-400">Preview</p>
              <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-lg object-contain" />
            </div>
          )}

          {/* Download */}
          {convertedUrl && !processing && (
            <a
              href={convertedUrl}
              download={`converted.${ext}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700"
            >
              <Download className="h-4 w-4" /> Download {FORMAT_LABELS[outputFormat]}
            </a>
          )}

          {processing && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
              <span className="text-sm text-gray-400">Converting...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
