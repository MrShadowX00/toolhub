"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Copy,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Braces,
  Minimize2,
  CheckCircle2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface ParseResult {
  ok: true;
  value: JsonValue;
  formatted: string;
  minified: string;
  charCount: number;
  keyCount: number;
}

interface ParseError {
  ok: false;
  message: string;
  line: number | null;
}

type Result = ParseResult | ParseError;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countKeys(value: JsonValue): number {
  if (value === null || typeof value !== "object") return 0;
  if (Array.isArray(value)) {
    return value.reduce<number>((sum, v) => sum + countKeys(v), 0);
  }
  const obj = value as { [key: string]: JsonValue };
  return (
    Object.keys(obj).length +
    Object.values(obj).reduce<number>((sum, v) => sum + countKeys(v), 0)
  );
}

function extractLineFromError(message: string): number | null {
  // Chrome / V8: "at position X"
  const posMatch = message.match(/at position (\d+)/);
  if (posMatch) {
    return null; // position, not line — handled separately
  }
  // Firefox / Safari: "line N"
  const lineMatch = message.match(/line (\d+)/i);
  if (lineMatch) return parseInt(lineMatch[1], 10);
  return null;
}

function positionToLine(json: string, position: number): number {
  const slice = json.slice(0, position);
  return slice.split("\n").length;
}

function parseJson(raw: string): Result {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "Input is empty.", line: null };
  }
  try {
    const value = JSON.parse(trimmed) as JsonValue;
    const formatted = JSON.stringify(value, null, 2);
    const minified = JSON.stringify(value);
    return {
      ok: true,
      value,
      formatted,
      minified,
      charCount: formatted.length,
      keyCount: countKeys(value),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Try to extract character position from V8 error
    const posMatch = msg.match(/at position (\d+)/);
    let line: number | null = extractLineFromError(msg);
    if (posMatch && line === null) {
      line = positionToLine(trimmed, parseInt(posMatch[1], 10));
    }
    return { ok: false, message: msg, line };
  }
}

// ---------------------------------------------------------------------------
// Tree view component
// ---------------------------------------------------------------------------

interface TreeNodeProps {
  keyName: string | null;
  value: JsonValue;
  depth: number;
  isLast: boolean;
}

function JsonTreeNode({ keyName, value, depth, isLast }: TreeNodeProps) {
  const [collapsed, setCollapsed] = useState(depth > 2);

  const isObject =
    value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const entries: [string, JsonValue][] = isObject
    ? Object.entries(value as { [k: string]: JsonValue })
    : isArray
      ? (value as JsonValue[]).map((v, i) => [String(i), v])
      : [];

  const openBrace = isArray ? "[" : "{";
  const closeBrace = isArray ? "]" : "}";
  const count = entries.length;

  const labelColor = depth === 0 ? "text-gray-300" : "text-indigo-300";
  const trailingComma = !isLast ? (
    <span className="text-gray-500">,</span>
  ) : null;

  if (!isExpandable) {
    let valueNode: React.ReactNode;
    if (value === null) {
      valueNode = <span className="text-pink-400">null</span>;
    } else if (typeof value === "boolean") {
      valueNode = (
        <span className="text-orange-400">{value ? "true" : "false"}</span>
      );
    } else if (typeof value === "number") {
      valueNode = <span className="text-green-400">{value}</span>;
    } else {
      valueNode = (
        <span className="text-amber-300">
          &quot;{String(value)}&quot;
        </span>
      );
    }

    return (
      <div
        className="flex items-baseline gap-1 py-0.5 font-mono text-sm leading-relaxed"
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {keyName !== null && (
          <>
            <span className={labelColor}>&quot;{keyName}&quot;</span>
            <span className="text-gray-500">:</span>
          </>
        )}
        {valueNode}
        {trailingComma}
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : `${depth * 16}px` }}>
      <div
        className="flex cursor-pointer select-none items-center gap-1 py-0.5 font-mono text-sm leading-relaxed hover:bg-gray-800/60 rounded"
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="text-gray-500 w-4 flex-shrink-0">
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </span>
        {keyName !== null && (
          <>
            <span className={labelColor}>&quot;{keyName}&quot;</span>
            <span className="text-gray-500">:</span>
          </>
        )}
        <span className="text-gray-400">{openBrace}</span>
        {collapsed && (
          <>
            <span className="text-gray-500 text-xs">
              {count} {isArray ? "item" : "key"}
              {count !== 1 ? "s" : ""}
            </span>
            <span className="text-gray-400">{closeBrace}</span>
          </>
        )}
        {!collapsed && count === 0 && (
          <span className="text-gray-400">{closeBrace}</span>
        )}
        {trailingComma}
      </div>

      {!collapsed && count > 0 && (
        <>
          {entries.map(([k, v], i) => (
            <JsonTreeNode
              key={k}
              keyName={isArray ? null : k}
              value={v}
              depth={depth + 1}
              isLast={i === entries.length - 1}
            />
          ))}
          <div
            className="py-0.5 font-mono text-sm text-gray-400"
            style={{ paddingLeft: `${(depth + 1) * 16}px` }}
          >
            {closeBrace}
            {trailingComma}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error display with line numbers
// ---------------------------------------------------------------------------

interface ErrorPanelProps {
  message: string;
  line: number | null;
  rawInput: string;
}

function ErrorPanel({ message, line, rawInput }: ErrorPanelProps) {
  const t = useTranslations("toolUi");
  const lines = rawInput.split("\n");
  // Show a window of 3 lines around the error line (1-indexed)
  const errorLine = line ?? null;
  const windowStart = errorLine ? Math.max(0, errorLine - 3) : 0;
  const windowEnd = errorLine ? Math.min(lines.length, errorLine + 2) : 0;
  const snippet = lines.slice(windowStart, windowEnd);

  return (
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-300">{t("invalidJson")}</p>
          <p className="mt-0.5 text-sm text-red-400 font-mono break-all">
            {message}
          </p>
          {errorLine && (
            <p className="mt-1 text-xs text-red-500">
              Error near line {errorLine}
            </p>
          )}
        </div>
      </div>

      {snippet.length > 0 && (
        <div className="rounded bg-gray-900 border border-gray-700 overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <tbody>
              {snippet.map((lineContent, i) => {
                const lineNum = windowStart + i + 1;
                const isErrorLine = lineNum === errorLine;
                return (
                  <tr
                    key={lineNum}
                    className={
                      isErrorLine ? "bg-red-500/20" : "bg-transparent"
                    }
                  >
                    <td className="w-10 select-none px-3 py-0.5 text-right text-gray-600 border-r border-gray-700">
                      {lineNum}
                    </td>
                    <td
                      className={`px-3 py-0.5 ${isErrorLine ? "text-red-300" : "text-gray-400"}`}
                    >
                      {lineContent || " "}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type ActiveView = "formatted" | "minified" | "tree";

export default function JsonFormatterTool() {
  const t = useTranslations("toolUi");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("formatted");
  const [copied, setCopied] = useState(false);

  // Run parse whenever the user explicitly clicks a button
  const runFormat = useCallback(() => {
    setResult(parseJson(input));
    setActiveView("formatted");
  }, [input]);

  const runMinify = useCallback(() => {
    setResult(parseJson(input));
    setActiveView("minified");
  }, [input]);

  const runValidate = useCallback(() => {
    setResult(parseJson(input));
    // Keep the last active view but show validation banner
  }, [input]);

  const handleCopy = useCallback(() => {
    if (!result || !result.ok) return;
    const text =
      activeView === "minified" ? result.minified : result.formatted;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result, activeView]);

  const outputText =
    result && result.ok
      ? activeView === "minified"
        ? result.minified
        : result.formatted
      : "";

  const isValid = result?.ok === true;
  const isError = result?.ok === false;

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
          <span className="text-sm font-medium text-gray-300">
            {t("rawInput")}
          </span>
          <span className="text-xs text-gray-500">
            {input.length.toLocaleString()} chars
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            // Clear stale result when input changes
            setResult(null);
          }}
          placeholder={t("pasteJson")}
          className="w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 resize-none focus:outline-none placeholder-gray-600 min-h-[220px]"
          spellCheck={false}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={runFormat}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          <Braces className="h-4 w-4" />
          {t("format")}
        </button>
        <button
          onClick={runMinify}
          className="flex items-center gap-2 rounded-lg bg-gray-700 hover:bg-gray-600 active:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 transition-colors"
        >
          <Minimize2 className="h-4 w-4" />
          {t("minify")}
        </button>
        <button
          onClick={runValidate}
          className="flex items-center gap-2 rounded-lg bg-gray-700 hover:bg-gray-600 active:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 transition-colors"
        >
          <CheckCircle2 className="h-4 w-4" />
          {t("validate")}
        </button>
      </div>

      {/* Validation banner (only when validate was the last action) */}
      {result && result.ok && activeView !== "tree" && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
          <span className="text-sm text-green-300 font-medium">
            {t("validJson")}
          </span>
          <span className="ml-auto text-xs text-gray-500">
            {result.charCount.toLocaleString()} chars &middot;{" "}
            {result.keyCount.toLocaleString()} key
            {result.keyCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Error panel */}
      {isError && (
        <ErrorPanel
          message={(result as ParseError).message}
          line={(result as ParseError).line}
          rawInput={input}
        />
      )}

      {/* Output section */}
      {isValid && (
        <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
          {/* Output toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800 flex-wrap gap-2">
            {/* View tabs */}
            <div className="flex gap-1 rounded-lg bg-gray-900 p-0.5">
              {(
                [
                  { view: "formatted" as ActiveView, labelKey: "formatted" },
                  { view: "minified" as ActiveView, labelKey: "minified" },
                  { view: "tree" as ActiveView, labelKey: "treeView" },
                ]
              ).map(({ view, labelKey }) => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      activeView === view
                        ? "bg-indigo-600 text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {t(labelKey)}
                  </button>
                ),
              )}
            </div>

            {/* Stats + copy */}
            <div className="flex items-center gap-3">
              {activeView !== "tree" && (
                <span className="text-xs text-gray-500">
                  {(result as ParseResult).charCount.toLocaleString()} chars
                  &middot;{" "}
                  {(result as ParseResult).keyCount.toLocaleString()} key
                  {(result as ParseResult).keyCount !== 1 ? "s" : ""}
                </span>
              )}
              {activeView !== "tree" && (
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    copied
                      ? "bg-green-600/20 text-green-400"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      {t("copy")}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Output body */}
          {activeView === "tree" ? (
            <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto">
              <JsonTreeNode
                keyName={null}
                value={(result as ParseResult).value}
                depth={0}
                isLast={true}
              />
            </div>
          ) : (
            <pre className="p-4 text-sm font-mono text-gray-100 overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed whitespace-pre">
              {outputText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
