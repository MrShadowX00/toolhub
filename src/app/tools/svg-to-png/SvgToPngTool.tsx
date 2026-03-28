"use client";

import { useState, useRef } from "react";
import { Upload, Download, Trash2 } from "lucide-react";

const SCALES = [
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
  { label: "4x", value: 4 },
];

export default function SvgToPngTool() {
  const [mode, setMode] = useState<"file" | "code">("file");
  const [svgCode, setSvgCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [scale, setScale] = useState(2);
  const [customW, setCustomW] = useState(0);
  const [customH, setCustomH] = useState(0);
  const [useCustom, setUseCustom] = useState(false);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const convertSvg = (svg: string, s: number, cw?: number, ch?: number) => {
    setProcessing(true);
    setError(null);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      const w = cw && ch ? cw : img.width * s;
      const h = cw && ch ? ch : img.height * s;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) setPngUrl(URL.createObjectURL(pngBlob));
        setProcessing(false);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError("Invalid SVG. Please check the code.");
      setProcessing(false);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".svg")) {
      setError("Please upload an SVG file.");
      return;
    }
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const code = e.target?.result as string;
      setSvgCode(code);
    };
    reader.readAsText(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setSvgCode("");
    setFileName("");
    setPngUrl(null);
    setError(null);
  };

  const doConvert = () => {
    if (!svgCode.trim()) return;
    if (useCustom && customW > 0 && customH > 0) {
      convertSvg(svgCode, 1, customW, customH);
    } else {
      convertSvg(svgCode, scale);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
        <p className="text-xs text-gray-500">🔒 Your files never leave your device. All processing happens in your browser.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("file"); reset(); }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${mode === "file" ? "bg-pink-600 text-white" : "bg-gray-800 text-gray-400"}`}
        >
          Upload SVG File
        </button>
        <button
          onClick={() => { setMode("code"); reset(); }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${mode === "code" ? "bg-pink-600 text-white" : "bg-gray-800 text-gray-400"}`}
        >
          Paste SVG Code
        </button>
      </div>

      {mode === "file" && !svgCode ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 py-16 transition-colors hover:border-pink-500/50 hover:bg-gray-900"
        >
          <Upload className="mb-3 h-10 w-10 text-gray-500" />
          <p className="text-sm font-medium text-white">Drop an SVG file here or click to upload</p>
          <input ref={inputRef} type="file" accept=".svg" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      ) : mode === "code" && !svgCode ? (
        <div>
          <textarea
            value={svgCode}
            onChange={(e) => setSvgCode(e.target.value)}
            rows={8}
            placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...>'
            className="w-full rounded-xl border border-gray-700 bg-gray-800 p-4 font-mono text-xs text-gray-300 outline-none placeholder:text-gray-600 focus:border-pink-500"
          />
        </div>
      ) : null}

      {(svgCode || mode === "code") && (
        <>
          {svgCode && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{fileName || "SVG Code"}</p>
              <button onClick={reset} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          )}

          {mode === "code" && (
            <textarea
              value={svgCode}
              onChange={(e) => setSvgCode(e.target.value)}
              rows={6}
              placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...>'
              className="w-full rounded-xl border border-gray-700 bg-gray-800 p-4 font-mono text-xs text-gray-300 outline-none placeholder:text-gray-600 focus:border-pink-500"
            />
          )}

          {/* Scale options */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <label className="mb-3 block text-sm font-medium text-white">Output Size</label>
            <div className="flex gap-2 mb-4">
              {SCALES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { setScale(s.value); setUseCustom(false); }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    !useCustom && scale === s.value ? "bg-pink-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <button
                onClick={() => setUseCustom(true)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  useCustom ? "bg-pink-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Custom
              </button>
            </div>
            {useCustom && (
              <div className="flex gap-3">
                <input type="number" placeholder="Width" value={customW || ""} onChange={(e) => setCustomW(Number(e.target.value))} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-pink-500" />
                <span className="self-center text-gray-500">×</span>
                <input type="number" placeholder="Height" value={customH || ""} onChange={(e) => setCustomH(Number(e.target.value))} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-pink-500" />
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-900/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={doConvert}
            disabled={!svgCode.trim() || processing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700 disabled:opacity-50"
          >
            {processing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Converting...
              </>
            ) : (
              "Convert to PNG"
            )}
          </button>

          {pngUrl && (
            <>
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
                <p className="mb-2 text-xs font-medium text-gray-400">Preview</p>
                <img src={pngUrl} alt="PNG" className="mx-auto max-h-64 rounded-lg object-contain" />
              </div>
              <a
                href={pngUrl}
                download={`${(fileName || "image").replace(".svg", "")}.png`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-600 bg-transparent px-6 py-3 font-medium text-pink-400 transition-colors hover:bg-pink-600/10"
              >
                <Download className="h-4 w-4" /> Download PNG
              </a>
            </>
          )}
        </>
      )}
    </div>
  );
}
