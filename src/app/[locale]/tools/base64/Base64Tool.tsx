"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Trash2, Upload } from "lucide-react";

type Mode = "encode" | "decode";

function encodeBase64(input: string): { result: string; error: null } | { result: null; error: string } {
  try {
    const encoded = btoa(unescape(encodeURIComponent(input)));
    return { result: encoded, error: null };
  } catch {
    return { result: null, error: "Encoding failed: input contains characters that cannot be encoded." };
  }
}

function decodeBase64(input: string): { result: string; error: null } | { result: null; error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { result: "", error: null };
  // Validate base64 characters
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(trimmed)) {
    return { result: null, error: "Invalid Base64: input contains characters outside the Base64 alphabet." };
  }
  // Base64 length must be a multiple of 4 (after padding)
  const padded = trimmed + "=".repeat((4 - (trimmed.length % 4)) % 4);
  try {
    const decoded = decodeURIComponent(escape(atob(padded)));
    return { result: decoded, error: null };
  } catch {
    return { result: null, error: "Invalid Base64: could not decode the provided string." };
  }
}

function byteCount(str: string): number {
  return new TextEncoder().encode(str).length;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Base64Tool() {
  const t = useTranslations("toolUi");
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setFileBase64(null);
    setFileName(null);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is data:<mime>;base64,<data>
      const base64 = result.split(",")[1] ?? "";
      setFileBase64(base64);
      setInput("");
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  }, []);

  const activeInput = fileBase64 !== null ? fileBase64 : input;

  const { result: outputText, error } = (() => {
    if (!activeInput.trim()) return { result: "", error: null };
    if (mode === "encode") {
      if (fileBase64 !== null) {
        // File already encoded — show raw base64
        return { result: fileBase64, error: null };
      }
      return encodeBase64(activeInput);
    } else {
      return decodeBase64(activeInput);
    }
  })();

  const inputBytes = byteCount(activeInput);
  const outputBytes = outputText ? byteCount(outputText) : 0;

  const handleCopyOutput = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  const handleCopyInput = async () => {
    if (!activeInput) return;
    await navigator.clipboard.writeText(activeInput);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setFileBase64(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const tabBase =
    "flex-1 py-2.5 text-sm font-medium transition-colors focus:outline-none";
  const tabActive =
    "bg-gray-800 text-white border-b-2 border-indigo-500";
  const tabInactive =
    "text-gray-400 hover:text-white border-b-2 border-transparent";

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex rounded-t-xl overflow-hidden border border-gray-700 border-b-0">
        <button
          onClick={() => { setMode("encode"); handleClear(); }}
          className={`${tabBase} ${mode === "encode" ? tabActive : tabInactive}`}
        >
          {t("encode")}
        </button>
        <button
          onClick={() => { setMode("decode"); handleClear(); }}
          className={`${tabBase} ${mode === "decode" ? tabActive : tabInactive}`}
        >
          {t("decode")}
        </button>
      </div>

      {/* Main card */}
      <div className="rounded-b-xl rounded-tr-xl border border-gray-700 bg-gray-900 overflow-hidden -mt-px">
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2 lg:divide-x lg:divide-gray-700">

          {/* Input panel */}
          <div className="flex flex-col p-4 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
{t("input")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{formatBytes(inputBytes)}</span>
                {mode === "encode" && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title={t("upload")}
                      className="flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 hover:border-indigo-500 hover:text-white transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {t("upload")}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </>
                )}
                <button
                  onClick={handleCopyInput}
                  disabled={!activeInput}
                  title={t("copyToClipboard")}
                  className="flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 hover:border-indigo-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {copiedInput ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={handleClear}
                  title={t("clear")}
                  className="flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 hover:border-red-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* File badge */}
            {fileName && (
              <div className="flex items-center gap-2 rounded-md border border-indigo-700/50 bg-indigo-900/30 px-3 py-1.5 text-xs text-indigo-300">
                <Upload className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
              </div>
            )}

            <textarea
              value={fileBase64 !== null ? fileBase64 : input}
              onChange={(e) => handleInputChange(e.target.value)}
              readOnly={fileBase64 !== null}
              placeholder={
                mode === "encode"
                  ? t("pasteText")
                  : t("pasteBase64")
              }
              className="h-64 w-full resize-none rounded-lg border border-gray-700 bg-gray-800 p-3 font-mono text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              spellCheck={false}
            />
          </div>

          {/* Output panel */}
          <div className="flex flex-col p-4 gap-3 border-t border-gray-700 lg:border-t-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {t("output")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{formatBytes(outputBytes)}</span>
                <button
                  onClick={handleCopyOutput}
                  disabled={!outputText}
                  className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {copiedOutput
                    ? <><Check className="h-3.5 w-3.5" /> {t("copied")}</>
                    : <><Copy className="h-3.5 w-3.5" /> {t("copy")}</>
                  }
                </button>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="rounded-lg border border-red-700/50 bg-red-900/20 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            <textarea
              readOnly
              value={outputText ?? ""}
              placeholder={error ? "" : t("resultWillAppear")}
              className="h-64 w-full resize-none rounded-lg border border-gray-700 bg-gray-800 p-3 font-mono text-sm text-gray-100 placeholder-gray-600 focus:outline-none transition-colors"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Stats footer */}
        <div className="border-t border-gray-700 bg-gray-800/50 px-4 py-2.5 flex flex-wrap gap-4 text-xs text-gray-500">
          <span>
            {t("input")}: <span className="text-gray-300">{activeInput.length} chars</span>
          </span>
          <span>
            {t("input")} {t("size").toLowerCase()}: <span className="text-gray-300">{formatBytes(inputBytes)}</span>
          </span>
          {outputText && (
            <>
              <span>
                {t("output")}: <span className="text-gray-300">{outputText.length} chars</span>
              </span>
              <span>
                {t("output")} {t("size").toLowerCase()}: <span className="text-gray-300">{formatBytes(outputBytes)}</span>
              </span>
              {mode === "encode" && inputBytes > 0 && (
                <span>
                  Overhead:{" "}
                  <span className="text-gray-300">
                    +{Math.round(((outputBytes - inputBytes) / inputBytes) * 100)}%
                  </span>
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <h3 className="mb-2 text-sm font-semibold text-white">About Base64 Encoding</h3>
          <p className="text-xs leading-relaxed text-gray-400">
            Base64 encodes binary data as ASCII text using 64 printable characters (A–Z, a–z, 0–9, +, /).
            It is commonly used to embed binary assets in JSON, XML, HTML, or email payloads
            where binary data cannot be transferred directly.
          </p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <h3 className="mb-2 text-sm font-semibold text-white">File Upload</h3>
          <p className="text-xs leading-relaxed text-gray-400">
            Switch to <span className="text-indigo-400">Encode</span> mode and click{" "}
            <span className="text-indigo-400">Upload</span> to convert any binary file — images, PDFs,
            archives — into a Base64 string. The encoded result can be used directly in{" "}
            <code className="rounded bg-gray-700 px-1 text-indigo-300">data:</code> URIs or API payloads.
          </p>
        </div>
      </div>
    </div>
  );
}
