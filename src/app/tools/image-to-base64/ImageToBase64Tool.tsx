"use client";

import { useState, useRef } from "react";
import { Upload, Copy, Check, Trash2, ArrowLeftRight } from "lucide-react";

export default function ImageToBase64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState("");
  const [mimeType, setMimeType] = useState("image/png");
  const [showPrefix, setShowPrefix] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [decodePreview, setDecodePreview] = useState<string | null>(null);
  const [decodeInput, setDecodeInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setMimeType(f.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const raw = dataUrl.split(",")[1];
      setBase64(raw);
    };
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const dataUri = `data:${mimeType};base64,${base64}`;
  const htmlSnippet = `<img src="${dataUri}" alt="image" />`;
  const cssSnippet = `background-image: url('${dataUri}');`;
  const displayBase64 = showPrefix ? dataUri : base64;

  const handleDecode = () => {
    let input = decodeInput.trim();
    if (input.startsWith("data:")) {
      setDecodePreview(input);
    } else {
      setDecodePreview(`data:image/png;base64,${input}`);
    }
  };

  const reset = () => {
    setFile(null);
    setBase64("");
    setDecodeInput("");
    setDecodePreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
        <p className="text-xs text-gray-500">🔒 Your files never leave your device. All processing happens in your browser.</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("encode"); reset(); }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${mode === "encode" ? "bg-pink-600 text-white" : "bg-gray-800 text-gray-400"}`}
        >
          Image → Base64
        </button>
        <button
          onClick={() => { setMode("decode"); reset(); }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${mode === "decode" ? "bg-pink-600 text-white" : "bg-gray-800 text-gray-400"}`}
        >
          Base64 → Image
        </button>
      </div>

      {mode === "encode" ? (
        <>
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 py-16 transition-colors hover:border-pink-500/50 hover:bg-gray-900"
            >
              <Upload className="mb-3 h-10 w-10 text-gray-500" />
              <p className="text-sm font-medium text-white">Drop an image here or click to upload</p>
              <p className="mt-1 text-xs text-gray-500">Any image format</p>
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

              {/* Toggle data URI prefix */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input type="checkbox" checked={showPrefix} onChange={(e) => setShowPrefix(e.target.checked)} className="accent-pink-500" />
                  Include data URI prefix
                </label>
                <span className="text-xs text-gray-600">{displayBase64.length.toLocaleString()} characters</span>
              </div>

              {/* Base64 Output */}
              <div className="relative">
                <textarea
                  readOnly
                  value={displayBase64}
                  rows={6}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 p-4 font-mono text-xs text-gray-300 outline-none"
                />
                <button
                  onClick={() => copyText(displayBase64, "base64")}
                  className="absolute right-3 top-3 rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-600"
                >
                  {copied === "base64" ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>

              {/* HTML Snippet */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-400">HTML &lt;img&gt; tag</p>
                  <button onClick={() => copyText(htmlSnippet, "html")} className="text-xs text-pink-400 hover:text-pink-300">
                    {copied === "html" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="overflow-x-auto text-xs text-gray-500 whitespace-pre-wrap break-all">{htmlSnippet.slice(0, 200)}...</pre>
              </div>

              {/* CSS Snippet */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-400">CSS background</p>
                  <button onClick={() => copyText(cssSnippet, "css")} className="text-xs text-pink-400 hover:text-pink-300">
                    {copied === "css" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="overflow-x-auto text-xs text-gray-500 whitespace-pre-wrap break-all">{cssSnippet.slice(0, 200)}...</pre>
              </div>
            </>
          )}
        </>
      ) : (
        /* Decode Mode */
        <>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <label className="mb-2 block text-sm font-medium text-white">Paste Base64 string</label>
            <textarea
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              rows={6}
              placeholder="Paste Base64 string here (with or without data: prefix)"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 font-mono text-xs text-gray-300 outline-none placeholder:text-gray-600 focus:border-pink-500"
            />
            <button
              onClick={handleDecode}
              disabled={!decodeInput.trim()}
              className="mt-3 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50"
            >
              Preview Image
            </button>
          </div>

          {decodePreview && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-400">Preview</p>
              <img src={decodePreview} alt="Decoded" className="mx-auto max-h-64 rounded-lg object-contain" />
              <a
                href={decodePreview}
                download="decoded-image.png"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
              >
                Download Image
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
