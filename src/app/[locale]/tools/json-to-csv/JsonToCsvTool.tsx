"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Download, Trash2 } from "lucide-react";

type Delimiter = "," | ";" | "\t";

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      result[fullKey] = JSON.stringify(value);
    } else if (value === null || value === undefined) {
      result[fullKey] = "";
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

function escapeCSVField(field: string, delimiter: string): string {
  if (field.includes(delimiter) || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function jsonToCsv(
  jsonStr: string,
  delimiter: Delimiter,
  includeHeaders: boolean
): { csv: string; error: null } | { csv: null; error: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    let data: Record<string, unknown>[];

    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return { csv: null, error: "JSON array is empty." };
      data = parsed;
    } else if (typeof parsed === "object" && parsed !== null) {
      data = [parsed];
    } else {
      return { csv: null, error: "JSON must be an array of objects or a single object." };
    }

    // Flatten all objects and collect all headers
    const flatRows = data.map((item) => {
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        return { __primitive__: String(item) };
      }
      return flattenObject(item as Record<string, unknown>);
    });

    const headerSet = new Set<string>();
    for (const row of flatRows) {
      for (const key of Object.keys(row)) {
        headerSet.add(key);
      }
    }
    const headers = Array.from(headerSet);

    const lines: string[] = [];
    if (includeHeaders) {
      lines.push(headers.map((h) => escapeCSVField(h, delimiter)).join(delimiter));
    }

    for (const row of flatRows) {
      const values = headers.map((h) => escapeCSVField(row[h] ?? "", delimiter));
      lines.push(values.join(delimiter));
    }

    return { csv: lines.join("\n"), error: null };
  } catch (e) {
    return { csv: null, error: `Invalid JSON: ${(e as Error).message}` };
  }
}

export default function JsonToCsvTool() {
  const t = useTranslations("toolUi");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [copied, setCopied] = useState(false);

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    const result = jsonToCsv(input, delimiter, includeHeaders);
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setOutput(result.csv ?? "");
      setError("");
    }
  }, [input, delimiter, includeHeaders]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const ext = delimiter === "\t" ? "tsv" : "csv";
    const blob = new Blob([output], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, delimiter]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
  }, []);

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Delimiter:</label>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value as Delimiter)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm"
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value={"\t"}>Tab</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={includeHeaders}
            onChange={(e) => setIncludeHeaders(e.target.checked)}
            className="rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500"
          />
          Include headers
        </label>
      </div>

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">JSON Input</label>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Trash2 size={14} />
            {t("clear")}
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
          rows={10}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm resize-y focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Convert Button */}
      <button
        onClick={convert}
        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 font-medium transition-colors"
      >
        Convert to CSV
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">CSV Output</label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t("copied") : t("copy")}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Download size={14} />
                {t("download")}
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            rows={10}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm resize-y focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
