"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import ToolLayout from "@/components/ui/ToolLayout";

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
  { char: "©", name: "&copy;", number: "&#169;", description: "Copyright sign" },
  { char: "®", name: "&reg;", number: "&#174;", description: "Registered sign" },
  { char: "™", name: "&trade;", number: "&#8482;", description: "Trade mark sign" },
  { char: "€", name: "&euro;", number: "&#8364;", description: "Euro sign" },
  { char: "£", name: "&pound;", number: "&#163;", description: "Pound sign" },
  { char: "¥", name: "&yen;", number: "&#165;", description: "Yen sign" },
  { char: "¢", name: "&cent;", number: "&#162;", description: "Cent sign" },
  { char: "§", name: "&sect;", number: "&#167;", description: "Section sign" },
  { char: "¶", name: "&para;", number: "&#182;", description: "Pilcrow (paragraph) sign" },
  { char: "•", name: "&bull;", number: "&#8226;", description: "Bullet" },
  { char: "…", name: "&hellip;", number: "&#8230;", description: "Horizontal ellipsis" },
  { char: "—", name: "&mdash;", number: "&#8212;", description: "Em dash" },
  { char: "–", name: "&ndash;", number: "&#8211;", description: "En dash" },
  { char: "←", name: "&larr;", number: "&#8592;", description: "Left arrow" },
  { char: "→", name: "&rarr;", number: "&#8594;", description: "Right arrow" },
  { char: "↑", name: "&uarr;", number: "&#8593;", description: "Up arrow" },
  { char: "↓", name: "&darr;", number: "&#8595;", description: "Down arrow" },
  { char: "♠", name: "&spades;", number: "&#9824;", description: "Black spade suit" },
  { char: "♥", name: "&hearts;", number: "&#9829;", description: "Black heart suit" },
  { char: "♦", name: "&diams;", number: "&#9830;", description: "Black diamond suit" },
  { char: "♣", name: "&clubs;", number: "&#9827;", description: "Black club suit" },
];

function encodeHtmlEntities(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/\u00a0/g, "&nbsp;")
    .replace(/[^\x00-\x7E]/g, (char) => `&#${char.charCodeAt(0)};`);
}

function decodeHtmlEntities(input: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = input;
  return textarea.value;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

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
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function HtmlEntitiesPage() {
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
    { id: "encode", label: "Encode" },
    { id: "decode", label: "Decode" },
  ];

  return (
    <ToolLayout
      title="HTML Entities"
      description="Encode and decode HTML entities"
      category="Developer Tools"
    >
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
                {activeTab === "encode" ? "Plain Text Input" : "HTML Entities Input"}
              </label>
              <button
                onClick={handleClear}
                disabled={!input}
                className="flex items-center gap-1.5 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                title="Clear input"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeTab === "encode"
                  ? 'Enter text, e.g. <script>alert("xss")</script>'
                  : "Enter HTML entities, e.g. &lt;b&gt;Hello&lt;/b&gt;"
              }
              className="h-52 w-full resize-none rounded-lg border border-gray-700 bg-gray-900 p-4 font-mono text-sm text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-400">
                {activeTab === "encode" ? "HTML Entities Output" : "Decoded Text Output"}
              </label>
              <CopyButton text={output} />
            </div>
            <textarea
              value={output}
              readOnly
              placeholder={
                activeTab === "encode"
                  ? "Encoded HTML entities will appear here..."
                  : "Decoded plain text will appear here..."
              }
              className="h-52 w-full resize-none rounded-lg border border-gray-700 bg-gray-900 p-4 font-mono text-sm text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Stats */}
        {input && (
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>
              Input: <span className="text-gray-300">{input.length} chars</span>
            </span>
            {output && (
              <span>
                Output: <span className="text-gray-300">{output.length} chars</span>
              </span>
            )}
          </div>
        )}

        {/* Reference Table */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-white">Common HTML Entities Reference</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800">
                  <th className="px-4 py-3 text-left font-medium text-gray-400">Character</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400">Entity Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400">Entity Number</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400">Description</th>
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
    </ToolLayout>
  );
}
