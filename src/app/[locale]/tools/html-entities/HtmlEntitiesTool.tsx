"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Trash2 } from "lucide-react";

type Tab = "encode" | "decode";

interface EntityRow {
  char: string;
  name: string;
  number: string;
  description: string;
}

const COMMON_ENTITIES: EntityRow[] = [
  { char: "&", name: "&amp;", number: "&#38;", description: "Ampersand" },
  { char: "<", name: "&lt;", number: "&#60;", description: "Less than" },
  { char: ">", name: "&gt;", number: "&#62;", description: "Greater than" },
  { char: '"', name: "&quot;", number: "&#34;", description: "Double quotation mark" },
  { char: "'", name: "&apos;", number: "&#39;", description: "Single quotation mark (apostrophe)" },
  { char: "\u00a0", name: "&nbsp;", number: "&#160;", description: "Non-breaking space" },
  { char: "\u00a9", name: "&copy;", number: "&#169;", description: "Copyright sign" },
  { char: "\u00ae", name: "&reg;", number: "&#174;", description: "Registered sign" },
  { char: "\u2122", name: "&trade;", number: "&#8482;", description: "Trade mark sign" },
  { char: "\u20ac", name: "&euro;", number: "&#8364;", description: "Euro sign" },
  { char: "\u00a3", name: "&pound;", number: "&#163;", description: "Pound sign" },
  { char: "\u00a5", name: "&yen;", number: "&#165;", description: "Yen sign" },
  { char: "\u00a2", name: "&cent;", number: "&#162;", description: "Cent sign" },
  { char: "\u00a7", name: "&sect;", number: "&#167;", description: "Section sign" },
  { char: "\u00b6", name: "&para;", number: "&#182;", description: "Pilcrow (paragraph) sign" },
  { char: "\u2022", name: "&bull;", number: "&#8226;", description: "Bullet" },
  { char: "\u2026", name: "&hellip;", number: "&#8230;", description: "Horizontal ellipsis" },
  { char: "\u2014", name: "&mdash;", number: "&#8212;", description: "Em dash" },
  { char: "\u2013", name: "&ndash;", number: "&#8211;", description: "En dash" },
  { char: "\u2190", name: "&larr;", number: "&#8592;", description: "Left arrow" },
  { char: "\u2192", name: "&rarr;", number: "&#8594;", description: "Right arrow" },
  { char: "\u2191", name: "&uarr;", number: "&#8593;", description: "Up arrow" },
  { char: "\u2193", name: "&darr;", number: "&#8595;", description: "Down arrow" },
  { char: "\u2660", name: "&spades;", number: "&#9824;", description: "Black spade suit" },
  { char: "\u2665", name: "&hearts;", number: "&#9829;", description: "Black heart suit" },
  { char: "\u2666", name: "&diams;", number: "&#9830;", description: "Black diamond suit" },
  { char: "\u2663", name: "&clubs;", number: "&#9827;", description: "Black club suit" },
];

function encodeHtmlEntities(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/\u00a0/g, "&nbsp;")
    .replace(/[^\x00-\x7E]/gu, (char) => `&#${char.codePointAt(0)};`);
}

function decodeHtmlEntities(input: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = input;
  return textarea.value;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("toolUi");

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silent fail
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="flex items-center gap-1.5 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      title={t("copyToClipboard")}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? t("copied") : t("copy")}
    </button>
  );
}

export default function HtmlEntitiesTool() {
  const t = useTranslations("toolUi");
  const [activeTab, setActiveTab] = useState<Tab>("encode");
  const [input, setInput] = useState("");

  const output =
    input.trim() === ""
      ? ""
      : activeTab === "encode"
        ? encodeHtmlEntities(input)
        : decodeHtmlEntities(input);

  const handleClear = () => {
    setInput("");
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "encode", label: t("encode") },
    { id: "decode", label: t("decode") },
  ];

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border border-gray-700 bg-gray-800 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setInput("");
            }}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input / Output panels */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-400">
              {t("input")}
            </label>
            <button
              onClick={handleClear}
              disabled={!input}
              className="flex items-center gap-1.5 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              title={t("clear")}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("clear")}
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("enterHtmlEntities")}
            className="h-52 w-full resize-none rounded-lg border border-gray-700 bg-gray-900 p-4 font-mono text-sm text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-400">
              {t("output")}
            </label>
            <CopyButton text={output} />
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={t("resultWillAppear")}
            className="h-52 w-full resize-none rounded-lg border border-gray-700 bg-gray-900 p-4 font-mono text-sm text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Stats */}
      {input && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>
            {t("input")}: <span className="text-gray-300">{input.length} {t("characters").toLowerCase()}</span>
          </span>
          {output && (
            <span>
              {t("output")}: <span className="text-gray-300">{output.length} {t("characters").toLowerCase()}</span>
            </span>
          )}
        </div>
      )}

      {/* Reference Table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">{t("commonPresets")}</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800">
                <th className="px-4 py-3 text-left font-medium text-gray-400">{t("value")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">{t("name")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">{t("type")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">{t("info")}</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_ENTITIES.map((row, i) => (
                <tr
                  key={row.name}
                  className={`border-b border-gray-700/50 transition-colors hover:bg-gray-800/60 ${
                    i % 2 === 0 ? "bg-gray-900" : "bg-gray-800/30"
                  }`}
                >
                  <td className="px-4 py-3 text-center font-mono text-base text-gray-100">
                    {row.char === "\u00a0" ? (
                      <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400">space</span>
                    ) : (
                      row.char
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-blue-400">{row.name}</td>
                  <td className="px-4 py-3 font-mono text-purple-400">{row.number}</td>
                  <td className="px-4 py-3 text-gray-400">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
