"use client";

import { useState, useRef } from "react";
import { Upload, Download, Trash2 } from "lucide-react";

export default function BackgroundRemoverTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processImage = async (f: File) => {
    setProcessing(true);
    setError(null);
    setProgress("Loading AI model...");

    try {
      const { pipeline, env } = await import("@huggingface/transformers");
      env.allowLocalModels = false;

      setProgress("Initializing segmentation model...");
      const segmenter = await pipeline("image-segmentation", "Xenova/modnet", {
        device: "wasm",
      });

      setProgress("Removing background...");
      const imageUrl = URL.createObjectURL(f);
      const results = await segmenter(imageUrl);
      URL.revokeObjectURL(imageUrl);

      if (results && Array.isArray(results) && results.length > 0) {
        const mask = results[0];
        if (mask && mask.mask) {
          // The mask is a RawImage, convert it to a canvas-based result
          const img = new window.Image();
          const imgLoaded = new Promise<void>((res) => { img.onload = () => res(); });
          img.src = URL.createObjectURL(f);
          await imgLoaded;

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);

          // Get the mask as image data
          const maskImg = new window.Image();
          const maskLoaded = new Promise<void>((res) => { maskImg.onload = () => res(); });
          const maskBlob = await mask.mask.toBlob();
          maskImg.src = URL.createObjectURL(maskBlob);
          await maskLoaded;

          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = img.width;
          maskCanvas.height = img.height;
          const maskCtx = maskCanvas.getContext("2d")!;
          maskCtx.drawImage(maskImg, 0, 0, img.width, img.height);

          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const maskData = maskCtx.getImageData(0, 0, img.width, img.height);

          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i + 3] = maskData.data[i]; // Use mask R channel as alpha
          }

          ctx.putImageData(imageData, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) setResultUrl(URL.createObjectURL(blob));
            setProcessing(false);
          }, "image/png");
          return;
        }
      }

      // Fallback: simple canvas-based approach
      setProgress("Using fallback method...");
      const img = new window.Image();
      const imgLoaded = new Promise<void>((res) => { img.onload = () => res(); });
      img.src = URL.createObjectURL(f);
      await imgLoaded;

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) setResultUrl(URL.createObjectURL(blob));
        setProcessing(false);
      }, "image/png");
    } catch (err) {
      console.error(err);
      setError("Background removal failed. This feature requires a modern browser with WebAssembly support. Try a simpler image or a different browser.");
      setProcessing(false);
    }
  };

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl(null);
    processImage(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setError(null);
    setProgress("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
        <p className="text-xs text-gray-500">🔒 Your files never leave your device. AI model runs entirely in your browser.</p>
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
          <p className="mt-1 text-xs text-gray-500">Best with photos of people or objects</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
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
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
                <div>
                  <p className="text-sm text-white">Processing...</p>
                  <p className="text-xs text-gray-500">{progress}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-600">First run downloads the AI model (~30MB). Subsequent runs are faster.</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-900/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Before/After */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-400">Original</p>
              {preview && <img src={preview} alt="Original" className="w-full rounded-lg object-contain max-h-64" />}
            </div>
            <div className="rounded-xl border border-gray-800 p-3" style={{ background: "repeating-conic-gradient(#374151 0% 25%, #1f2937 0% 50%) 50% / 20px 20px" }}>
              <p className="mb-2 text-xs font-medium text-gray-400">Result</p>
              {resultUrl ? (
                <img src={resultUrl} alt="Result" className="w-full rounded-lg object-contain max-h-64" />
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <span className="text-sm text-gray-500">{processing ? "Processing..." : "Result will appear here"}</span>
                </div>
              )}
            </div>
          </div>

          {resultUrl && (
            <a
              href={resultUrl}
              download={`no-bg-${file.name.replace(/\.[^.]+$/, "")}.png`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700"
            >
              <Download className="h-4 w-4" /> Download Transparent PNG
            </a>
          )}
        </>
      )}
    </div>
  );
}
