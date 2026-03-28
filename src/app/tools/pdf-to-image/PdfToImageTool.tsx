"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Download, Trash2, Image as ImageIcon } from "lucide-react";

export default function PdfToImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setFile(f);
    setPages([]);
    setError(null);
    setProcessing(true);
    setProgress(0);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const pageImages: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        pageImages.push(canvas.toDataURL("image/png"));
        setProgress(Math.round((i / totalPages) * 100));
      }

      setPages(pageImages);
    } catch {
      setError("Failed to process PDF. The file may be corrupted or password-protected.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const downloadAll = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (let i = 0; i < pages.length; i++) {
      const data = pages[i].split(",")[1];
      zip.file(`page-${i + 1}.png`, data, { base64: true });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.replace(".pdf", "")}-pages.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPage = (dataUrl: string, idx: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `page-${idx + 1}.png`;
    a.click();
  };

  const reset = () => {
    setFile(null);
    setPages([]);
    setError(null);
    setProgress(0);
  };

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
          <p className="text-sm font-medium text-white">Drop a PDF file here or click to upload</p>
          <p className="mt-1 text-xs text-gray-500">Each page will be converted to PNG</p>
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400 truncate">{file.name}</p>
            <button onClick={reset} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>

          {processing && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
                <span className="text-sm text-gray-400">Processing pages... {progress}%</span>
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

          {pages.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white font-medium">{pages.length} page{pages.length > 1 ? "s" : ""} extracted</p>
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-1 rounded-lg bg-pink-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-pink-700"
                >
                  <Download className="h-3 w-3" /> Download All (ZIP)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {pages.map((page, idx) => (
                  <div key={idx} className="group relative rounded-xl border border-gray-800 bg-gray-900/50 p-2">
                    <img src={page} alt={`Page ${idx + 1}`} className="w-full rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => downloadPage(page, idx)}
                        className="rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        <Download className="mr-1 inline h-3 w-3" /> Page {idx + 1}
                      </button>
                    </div>
                    <p className="mt-1 text-center text-xs text-gray-500">Page {idx + 1}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
