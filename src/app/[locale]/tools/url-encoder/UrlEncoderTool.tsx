"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, X, ArrowRightLeft } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActiveTab = "encode" | "decode";
type EncodeMode = "full" | "component";

// ---------------------------------------------------------------------------
// Core encode/decode helpers
// ---------------------------------------------------------------------------

function safeEncode(input: string, mode: EncodeMode): string {
  if (!input) return "";
  try {
    return mode === "full" ? encodeURI(input) : encodeURIComponent(input);
  } catch {
    // encodeURI/encodeURIComponent can throw on lone surrogates
    return input
      .split("")
      .map((ch) => {
        try {
          return mode === "full" ? encodeURI(ch) : encodeURIComponent(ch);
        } catch {
          return ch;
        }
      })
      .join("");
  }
}

function safeDecode(input: string, mode: EncodeMode): string {
  if (!input) return "";
  try {
    return mode === "full" ? decodeURI(input) : decodeURIComponent(input);
  } catch {
    // If the whole string fails, try decoding percent-sequences individually
    return input.replace(/%[0-9A-Fa-f]{2}/g, (seq) => {
      try {
        return mode === "full" ? decodeURI(seq) : decodeURIComponent(seq);
      } catch {
        return seq; // leave invalid sequences as-is
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Highlight helpers – mark the characters that actually changed
// ---------------------------------------------------------------------------

interface Segment {
  text: string;
  changed: boolean;
}

/**
 * Produce a list of segments comparing `original` to `transformed`.
 * A segment is "changed" if the characters in that range are different from
 * the corresponding range in the original string.
 *
 * We do a simple character-by-character diff after splitting on percent-encoded
 * sequences so that `%20` counts as one logical "changed" unit.
 */
function buildSegments(original: string, transformed: string): Segment[] {
  if (!original || !transformed) return [{ text: transformed, changed: false }];

  // Tokenise the transformed string into raw-chars and %-sequences
  const transformedTokens = tokenise(transformed);
  // Tokenise the original for comparison
  const originalTokens = tokenise(original);

  const segments: Segment[] = [];
  let origIdx = 0;

  for (const token of transformedTokens) {
    // Find what the original looked like for this token's "source"
    const origSlice = originalTokens[origIdx] ?? "";
    const changed = token !== origSlice;

    // Merge into the last segment if same changed state
    if (segments.length > 0 && segments[segments.length - 1].changed === changed) {
      segments[segments.length - 1].text += token;
    } else {
      segments.push({ text: token, changed });
    }
    origIdx++;
  }

  return segments;
}

/**
 * Split a string into an array of tokens: percent-encoded triplets (%XX) are
 * kept as single tokens; everything else is split character-by-character.
 */
function tokenise(s: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === "%" && i + 2 < s.length && /[0-9A-Fa-f]{2}/.test(s.slice(i + 1, i + 3))) {
      tokens.push(s.slice(i, i + 3));
      i += 3;
    } else {
      tokens.push(s[i]);
      i++;
    }
  }
  return tokens;
}

// ---------------------------------------------------------------------------
// Highlighted output renderer
// ---------------------------------------------------------------------------

function HighlightedOutput({ segments }: { segments: Segment[] }) {
  return (
    <span className="font-mono break-all whitespace-pre-wrap">
      {segments.map((seg, i) =>
        seg.changed ? (
          <mark
            key={i}
            className="bg-yellow-400/25 text-yellow-300 rounded-sm px-0.5"
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i} className="text-gray-100">
            {seg.text}
          </span>
        ),
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("toolUi");

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
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
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function UrlEncoderTool() {
  const t = useTranslations("toolUi");
  const [activeTab, setActiveTab] = useState<ActiveTab>("encode");
  const [encodeInput, setEncodeInput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [encodeMode, setEncodeMode] = useState<EncodeMode>("component");
  const [decodeMode, setDecodeMode] = useState<EncodeMode>("component");

  // Derived values
  const encodedOutput = safeEncode(encodeInput, encodeMode);
  const decodedOutput = safeDecode(decodeInput, decodeMode);

  const encodeSegments = buildSegments(encodeInput, encodedOutput);
  const decodeSegments = buildSegments(decodeInput, decodedOutput);

  const changedEncodeCount = encodeSegments.filter((s) => s.changed).length;
  const changedDecodeCount = decodeSegments.filter((s) => s.changed).length;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex rounded-lg bg-gray-800 p-1 w-fit">
        {(["encode", "decode"] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-5 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab === "encode" ? t("encode") : t("decode")}
          </button>
        ))}
      </div>

      {/* Encode panel */}
      {activeTab === "encode" && (
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Mode:</span>
            <div className="flex rounded-lg bg-gray-800 p-0.5">
              <button
                onClick={() => setEncodeMode("component")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  encodeMode === "component"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                encodeURIComponent
              </button>
              <button
                onClick={() => setEncodeMode("full")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  encodeMode === "full"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                encodeURI
              </button>
            </div>
            <span className="text-xs text-gray-500">
              {encodeMode === "component"
                ? "Encodes all special chars including :/?#[]@!$&'()*+,;="
                : "Preserves URL structure chars like :/?#[]@!$&'()*+,;="}
            </span>
          </div>

          {/* Input */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
              <span className="text-sm font-medium text-gray-300">{t("input")}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {encodeInput.length.toLocaleString()} {t("characters").toLowerCase()}
                </span>
                {encodeInput && (
                  <button
                    onClick={() => setEncodeInput("")}
                    className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    {t("clear")}
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={encodeInput}
              onChange={(e) => setEncodeInput(e.target.value)}
              placeholder={t("enterTextOrUrl")}
              className="w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 resize-none focus:outline-none placeholder-gray-600 min-h-[140px]"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">{t("output")}</span>
                {encodeInput && changedEncodeCount > 0 && (
                  <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 text-xs text-yellow-400">
                    {changedEncodeCount} change{changedEncodeCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {encodedOutput && (
                  <button
                    onClick={() => {
                      setDecodeInput(encodedOutput);
                      setDecodeMode(encodeMode);
                      setActiveTab("decode");
                    }}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
                    title={t("decode")}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    {t("decode")}
                  </button>
                )}
                <CopyButton text={encodedOutput} />
              </div>
            </div>
            <div className="p-4 text-sm min-h-[100px] leading-relaxed">
              {encodeInput ? (
                changedEncodeCount === 0 ? (
                  <div className="space-y-1">
                    <p className="text-gray-100 font-mono break-all whitespace-pre-wrap">
                      {encodedOutput}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {t("noChange")}
                    </p>
                  </div>
                ) : (
                  <HighlightedOutput segments={encodeSegments} />
                )
              ) : (
                <p className="text-gray-600 font-mono">{t("resultWillAppear")}</p>
              )}
            </div>
          </div>

          {/* Legend */}
          {encodeInput && changedEncodeCount > 0 && (
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <mark className="bg-yellow-400/25 text-yellow-300 rounded-sm px-1 not-italic">
                highlighted
              </mark>
              {t("encode").toLowerCase()}
            </p>
          )}
        </div>
      )}

      {/* Decode panel */}
      {activeTab === "decode" && (
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Mode:</span>
            <div className="flex rounded-lg bg-gray-800 p-0.5">
              <button
                onClick={() => setDecodeMode("component")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  decodeMode === "component"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                decodeURIComponent
              </button>
              <button
                onClick={() => setDecodeMode("full")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  decodeMode === "full"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                decodeURI
              </button>
            </div>
            <span className="text-xs text-gray-500">
              {decodeMode === "component"
                ? "Decodes all percent-encoded sequences including :/?#[]@!$&'()*+,;="
                : "Preserves URL structure sequences like %3A %2F %3F %23"}
            </span>
          </div>

          {/* Input */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
              <span className="text-sm font-medium text-gray-300">{t("input")}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {decodeInput.length.toLocaleString()} {t("characters").toLowerCase()}
                </span>
                {decodeInput && (
                  <button
                    onClick={() => setDecodeInput("")}
                    className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    {t("clear")}
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder={t("enterTextOrUrl")}
              className="w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 resize-none focus:outline-none placeholder-gray-600 min-h-[140px]"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">{t("output")}</span>
                {decodeInput && changedDecodeCount > 0 && (
                  <span className="rounded-full bg-green-400/15 px-2 py-0.5 text-xs text-green-400">
                    {changedDecodeCount} change{changedDecodeCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {decodedOutput && (
                  <button
                    onClick={() => {
                      setEncodeInput(decodedOutput);
                      setEncodeMode(decodeMode);
                      setActiveTab("encode");
                    }}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
                    title={t("encode")}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    {t("encode")}
                  </button>
                )}
                <CopyButton text={decodedOutput} />
              </div>
            </div>
            <div className="p-4 text-sm min-h-[100px] leading-relaxed">
              {decodeInput ? (
                changedDecodeCount === 0 ? (
                  <div className="space-y-1">
                    <p className="text-gray-100 font-mono break-all whitespace-pre-wrap">
                      {decodedOutput}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {t("noChange")}
                    </p>
                  </div>
                ) : (
                  <HighlightedOutput
                    segments={decodeSegments.map((s) =>
                      s.changed
                        ? { ...s }
                        : s,
                    )}
                  />
                )
              ) : (
                <p className="text-gray-600 font-mono">{t("resultWillAppear")}</p>
              )}
            </div>
          </div>

          {/* Legend */}
          {decodeInput && changedDecodeCount > 0 && (
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <mark className="bg-yellow-400/25 text-yellow-300 rounded-sm px-1 not-italic">
                highlighted
              </mark>
              {t("decode").toLowerCase()}
            </p>
          )}
        </div>
      )}

      {/* Reference card */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-300">
          {t("commonPresets")}
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 md:grid-cols-4">
          {[
            [" ", "%20"],
            ["!", "%21"],
            ['"', "%22"],
            ["#", "%23"],
            ["$", "%24"],
            ["%", "%25"],
            ["&", "%26"],
            ["'", "%27"],
            ["(", "%28"],
            [")", "%29"],
            ["+", "%2B"],
            [",", "%2C"],
            ["/", "%2F"],
            [":", "%3A"],
            [";", "%3B"],
            ["=", "%3D"],
            ["?", "%3F"],
            ["@", "%40"],
            ["[", "%5B"],
            ["]", "%5D"],
          ].map(([char, encoded]) => (
            <div
              key={char}
              className="flex items-center gap-2 text-xs font-mono"
            >
              <span className="w-6 text-center rounded bg-gray-700 px-1 py-0.5 text-gray-200">
                {char}
              </span>
              <span className="text-gray-500">→</span>
              <span className="text-indigo-400">{encoded}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
