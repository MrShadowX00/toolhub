"use client";

import { useState, useRef } from "react";
import { Upload, Download, Trash2, Lock, Unlock } from "lucide-react";
import { useTranslations } from "next-intl";

const PRESETS = [
  { label: "HD", w: 1280, h: 720 },
  { label: "Full HD", w: 1920, h: 1080 },
  { label: "4K", w: 3840, h: 2160 },
  { label: "Square", w: 1000, h: 1000 },
  { label: "Instagram", w: 1080, h: 1080 },
  { label: "Twitter", w: 1200, h: 628 },
  { label: "Facebook", w: 1200, h: 630 },
];

export default function ImageResizerTool() {
  const t = useTranslations("toolUi");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resize = (imgSrc: string, w: number, h: number) => {
    setProcessing(true);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const mimeType = file?.type && ["image/jpeg", "image/webp", "image/png"].includes(file.type)
        ? file.type
        : "image/png";
      const quality = mimeType === "image/png" ? undefined : 0.92;
      canvas.toBlob((blob) => {
        if (blob) setResizedUrl(URL.createObjectURL(blob));
        setProcessing(false);
      }, mimeType, quality);
    };
    img.src = imgSrc;
  };

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new window.Image();
    img.onload = () => {
      setOrigW(img.width);
      setOrigH(img.height);
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = url;
    setResizedUrl(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const updateWidth = (w: number) => {
    setWidth(w);
    if (lockAspect && origW > 0) setHeight(Math.round((w / origW) * origH));
    setResizedUrl(null);
  };

  const updateHeight = (h: number) => {
    setHeight(h);
    if (lockAspect && origH > 0) setWidth(Math.round((h / origH) * origW));
    setResizedUrl(null);
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setLockAspect(false);
    setResizedUrl(null);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResizedUrl(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
        <p className="text-xs text-gray-500">{t("privacyNotice")}</p>
      </div>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 py-16 transition-colors hover:border-pink-500/50 hover:bg-gray-900"
        >
          <Upload className="mb-3 h-10 w-10 text-gray-500" />
          <p className="text-sm font-medium text-white">{t("dropImageOrClick")}</p>
          <p className="mt-1 text-xs text-gray-500">{t("supportsJpgPngWebp")}</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <button onClick={reset} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
              <Trash2 className="h-3 w-3" /> {t("remove")}
            </button>
          </div>

          {/* Dimensions */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <p className="mb-1 text-xs text-gray-500">{t("originalDimensions", { width: origW, height: origH })}</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">{t("width")}</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => updateWidth(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-pink-500"
                />
              </div>
              <button onClick={() => setLockAspect(!lockAspect)} className="mt-5 rounded-lg bg-gray-800 p-2 text-gray-400 hover:text-white">
                {lockAspect ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </button>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-400">{t("height")}</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => updateHeight(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <label className="mb-3 block text-sm font-medium text-white">{t("presetSizes")}</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.w, p.h)}
                  className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-pink-600 hover:text-white"
                >
                  {p.label} ({p.w}×{p.h})
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-400">{t("preview")}</p>
              <img src={preview} alt={t("preview")} className="mx-auto max-h-64 rounded-lg object-contain" />
            </div>
          )}

          {/* Resize Button */}
          <button
            onClick={() => preview && resize(preview, width, height)}
            disabled={processing || width <= 0 || height <= 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700 disabled:opacity-50"
          >
            {processing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t("resizing")}
              </>
            ) : (
              <>{t("resizeTo", { width, height })}</>
            )}
          </button>

          {/* Download */}
          {resizedUrl && (
            <a
              href={resizedUrl}
              download={`resized-${width}x${height}-${file.name}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-600 bg-transparent px-6 py-3 font-medium text-pink-400 transition-colors hover:bg-pink-600/10"
            >
              <Download className="h-4 w-4" /> {t("downloadResizedImage")}
            </a>
          )}
        </>
      )}
    </div>
  );
}
