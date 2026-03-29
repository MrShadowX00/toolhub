"use client";

import { useState, useRef } from "react";
import { Upload, Download, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HeicToJpgTool() {
  const t = useTranslations("toolUi");
  const [file, setFile] = useState<File | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const convertHeic = async (f: File) => {
    setProcessing(true);
    setError(null);
    setProgress(20);
    try {
      const heic2any = (await import("heic2any")).default;
      setProgress(50);
      const blob = await heic2any({ blob: f, toType: "image/jpeg", quality: 0.92 });
      setProgress(90);
      const resultBlob = Array.isArray(blob) ? blob[0] : blob;
      setConvertedUrl(URL.createObjectURL(resultBlob));
      setConvertedSize(resultBlob.size);
      setProgress(100);
    } catch {
      setError(t("heicConvertError"));
    } finally {
      setProcessing(false);
    }
  };

  const handleFile = (f: File) => {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".heic") && !name.endsWith(".heif")) {
      setError(t("heicUploadError"));
      return;
    }
    setFile(f);
    setConvertedUrl(null);
    setError(null);
    convertHeic(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setConvertedUrl(null);
    setError(null);
    setProgress(0);
    setConvertedSize(0);
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
          <p className="text-sm font-medium text-white">{t("dropHeicOrClick")}</p>
          <p className="mt-1 text-xs text-gray-500">{t("heicHint")}</p>
          <input ref={inputRef} type="file" accept=".heic,.heif" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400 truncate">{file.name} ({formatSize(file.size)})</p>
            <button onClick={reset} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
              <Trash2 className="h-3 w-3" /> {t("remove")}
            </button>
          </div>

          {processing && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
                <span className="text-sm text-gray-400">{t("convertingHeicToJpg")}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-800">
                <div className="h-2 rounded-full bg-pink-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-900/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {convertedUrl && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{t("originalHeic")}</p>
                  <p className="text-lg font-bold text-white">{formatSize(file.size)}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{t("convertedJpg")}</p>
                  <p className="text-lg font-bold text-green-400">{formatSize(convertedSize)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
                <p className="mb-2 text-xs font-medium text-gray-400">{t("preview")}</p>
                <img src={convertedUrl} alt={t("converted")} className="mx-auto max-h-64 rounded-lg object-contain" />
              </div>

              <a
                href={convertedUrl}
                download={file.name.replace(/\.(heic|heif)$/i, ".jpg")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700"
              >
                <Download className="h-4 w-4" /> {t("downloadJpg")}
              </a>
            </>
          )}
        </>
      )}
    </div>
  );
}
