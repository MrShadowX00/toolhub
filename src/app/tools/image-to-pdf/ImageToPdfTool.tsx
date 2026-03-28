"use client";

import { useState, useRef } from "react";
import { Upload, Download, Trash2, GripVertical, Plus } from "lucide-react";

interface ImageItem {
  id: string;
  file: File;
  url: string;
}

export default function ImageToPdfTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [processing, setProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList) => {
    const newImages: ImageItem[] = [];
    Array.from(files).forEach((f) => {
      if (f.type.startsWith("image/")) {
        newImages.push({ id: crypto.randomUUID(), file: f, url: URL.createObjectURL(f) });
      }
    });
    setImages((prev) => [...prev, ...newImages]);
    setPdfUrl(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setPdfUrl(null);
  };

  const handleReorder = (fromIdx: number, toIdx: number) => {
    setImages((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    try {
      const { jsPDF } = await import("jspdf");

      const pageSizes: Record<string, [number, number]> = {
        a4: [210, 297],
        letter: [215.9, 279.4],
      };

      const loadImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((res) => {
          const img = new window.Image();
          img.onload = () => res(img);
          img.src = url;
        });

      const firstImg = await loadImage(images[0].url);
      let pdfW: number, pdfH: number;

      if (pageSize === "fit") {
        pdfW = firstImg.width * 0.264583;
        pdfH = firstImg.height * 0.264583;
      } else {
        [pdfW, pdfH] = pageSizes[pageSize];
      }

      const pdf = new jsPDF({
        orientation: pdfW > pdfH ? "landscape" : "portrait",
        unit: "mm",
        format: pageSize === "fit" ? [pdfW, pdfH] : pageSize,
      });

      for (let i = 0; i < images.length; i++) {
        if (i > 0) {
          if (pageSize === "fit") {
            const img = await loadImage(images[i].url);
            const w = img.width * 0.264583;
            const h = img.height * 0.264583;
            pdf.addPage([w, h], w > h ? "landscape" : "portrait");
            pdfW = w;
            pdfH = h;
          } else {
            pdf.addPage();
          }
        }

        const img = await loadImage(images[i].url);
        const imgRatio = img.width / img.height;
        const pageRatio = pdfW / pdfH;
        let drawW: number, drawH: number, x: number, y: number;

        if (pageSize === "fit") {
          drawW = pdfW;
          drawH = pdfH;
          x = 0;
          y = 0;
        } else if (imgRatio > pageRatio) {
          drawW = pdfW - 20;
          drawH = drawW / imgRatio;
          x = 10;
          y = (pdfH - drawH) / 2;
        } else {
          drawH = pdfH - 20;
          drawW = drawH * imgRatio;
          x = (pdfW - drawW) / 2;
          y = 10;
        }

        pdf.addImage(images[i].url, "JPEG", x, y, drawW, drawH);
      }

      const blob = pdf.output("blob");
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
        <p className="text-xs text-gray-500">🔒 Your files never leave your device. All processing happens in your browser.</p>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 py-10 transition-colors hover:border-pink-500/50 hover:bg-gray-900"
      >
        <Upload className="mb-3 h-8 w-8 text-gray-500" />
        <p className="text-sm font-medium text-white">Drop images here or click to upload</p>
        <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP — multiple files supported</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
      </div>

      {images.length > 0 && (
        <>
          {/* Image List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">{images.length} image{images.length > 1 ? "s" : ""} — drag to reorder</p>
            {images.map((img, idx) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragIdx !== null) handleReorder(dragIdx, idx); setDragIdx(null); }}
                className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-2"
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-600" />
                <img src={img.url} alt="" className="h-12 w-12 rounded object-cover" />
                <span className="flex-1 truncate text-sm text-gray-300">{img.file.name}</span>
                <button onClick={() => removeImage(img.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Page Size */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <label className="mb-3 block text-sm font-medium text-white">Page Size</label>
            <div className="flex gap-3">
              {(["a4", "letter", "fit"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setPageSize(s); setPdfUrl(null); }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    pageSize === s ? "bg-pink-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {s === "a4" ? "A4" : s === "letter" ? "Letter" : "Fit to Image"}
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={generatePdf}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700 disabled:opacity-50"
          >
            {processing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating PDF...
              </>
            ) : (
              "Generate PDF"
            )}
          </button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              download="images.pdf"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-600 bg-transparent px-6 py-3 font-medium text-pink-400 transition-colors hover:bg-pink-600/10"
            >
              <Download className="h-4 w-4" /> Download PDF
            </a>
          )}
        </>
      )}
    </div>
  );
}
