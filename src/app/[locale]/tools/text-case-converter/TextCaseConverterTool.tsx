"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Type } from "lucide-react";

function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function toSentenceCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}

function toCamelCase(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

function toPascalCase(s: string): string {
  const camel = toCamelCase(s);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s\-]+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}

function toKebabCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
}

function toScreamingSnake(s: string): string {
  return toSnakeCase(s).toUpperCase();
}

function toDotCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1.$2")
    .replace(/[\s_\-]+/g, ".")
    .replace(/[^a-zA-Z0-9.]/g, "")
    .toLowerCase();
}

const conversions: { key: string; fn: (s: string) => string }[] = [
  { key: "uppercase2", fn: (s) => s.toUpperCase() },
  { key: "lowercase2", fn: (s) => s.toLowerCase() },
  { key: "titleCase", fn: toTitleCase },
  { key: "sentenceCase", fn: toSentenceCase },
  { key: "camelCase", fn: toCamelCase },
  { key: "pascalCase", fn: toPascalCase },
  { key: "snakeCase", fn: toSnakeCase },
  { key: "kebabCase", fn: toKebabCase },
  { key: "constantCase", fn: toScreamingSnake },
  { key: "dotCase", fn: toDotCase },
];

export default function TextCaseConverterTool() {
  const t = useTranslations("toolUi");
  const [input, setInput] = useState("The Quick Brown Fox Jumps Over The Lazy Dog");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const results = useMemo(
    () => conversions.map((c) => ({ label: t(c.key as Parameters<typeof t>[0]), value: c.fn(input) })),
    [input, t]
  );

  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  const chars = input.length;

  const handleCopy = async (value: string, idx: number) => {
    await navigator.clipboard.writeText(value);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Type className="h-4 w-4" />
            {t("enterText")}
          </h3>
          <div className="flex gap-3 text-xs text-gray-500">
            <span>{chars} {t("characters")}</span>
            <span>{words} {t("words")}</span>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder={t("pasteText")}
          className="w-full resize-y rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Conversions Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((r, i) => (
          <div
            key={r.label}
            className="group rounded-xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">{r.label}</span>
              <button
                onClick={() => handleCopy(r.value, i)}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-white"
              >
                {copiedIdx === i ? (
                  <>
                    <Check className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">{t("copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    {t("copy")}
                  </>
                )}
              </button>
            </div>
            <p className="min-h-[2.5rem] break-all rounded-lg border border-gray-800 bg-gray-800/50 px-3 py-2 font-mono text-sm text-white">
              {r.value || <span className="text-gray-600">...</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
