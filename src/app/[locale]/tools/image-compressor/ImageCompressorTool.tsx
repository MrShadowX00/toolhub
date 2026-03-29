"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Download, Trash2 } from "lucide-react";

export default function ImageCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const compress = useCallback(
    (imageFile: File, q: number) => {
      setProcessing(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);

          const mimeType =
            imageFile.type === "image/webp" ? "image/webp" : "image/jpeg";
          canvas.toBlob(
            (blob) => {
              if (blob) {
                setCompressedUrl(URL.createObjectURL(blob));
                setCompressedSize(blob.size);
              }
              setProcessing(false);
            },
            mimeType,
            q / 100
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageFile);
    },
    []
  );

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setOriginalSize(f.size);
    setPreview(URL.createObjectURL(f));
    compress(f, quality);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleQualityChange = (q: number) => {
    setQuality(q);
    if (file) compress(file, q);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setCompressedUrl(null);
    setOriginalSize(0);
    setCompressedSize(0);
  };

  const savings = originalSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : "0";

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
          <p className="mt-1 text-xs text-gray-500">Supports JPG, PNG, WebP</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <>
          {/* Quality Slider */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white">Quality: {quality}%</label>
              <button onClick={reset} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => handleQualityChange(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>1% (smallest)</span>
              <span>100% (best quality)</span>
            </div>
          </div>

          {/* Size Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Original</p>
              <p className="text-lg font-bold text-white">{formatSize(originalSize)}</p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Compressed</p>
              <p className="text-lg font-bold text-green-400">{formatSize(compressedSize)}</p>
              {Number(savings) > 0 && (
                <p className="text-xs text-green-500 mt-1">-{savings}% smaller</p>
              )}
            </div>
          </div>

          {/* Before/After Preview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-400">Original</p>
              {preview && <img src={preview} alt="Original" className="w-full rounded-lg object-contain max-h-64" />}
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-400">Compressed</p>
              {compressedUrl && <img src={compressedUrl} alt="Compressed" className="w-full rounded-lg object-contain max-h-64" />}
            </div>
          </div>

          {/* Download */}
          {compressedUrl && !processing && (
            <a
              href={compressedUrl}
              download={`compressed-${file.name}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700"
            >
              <Download className="h-4 w-4" /> Download Compressed Image
            </a>
          )}

          {processing && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
              <span className="text-sm text-gray-400">Compressing...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
