"use client";

import { useState, useMemo, useCallback } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import {
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Replace,
  ListFilter,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RegexFlags {
  g: boolean;
  i: boolean;
  m: boolean;
  s: boolean;
}

interface MatchInfo {
  fullMatch: string;
  index: number;
  end: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string | undefined> | null;
}

interface RegexResult {
  ok: true;
  regex: RegExp;
  matches: MatchInfo[];
  highlightedHtml: string;
}

interface RegexError {
  ok: false;
  message: string;
}

type Result = RegexResult | RegexError;

// ---------------------------------------------------------------------------
// Cheat sheet data
// ---------------------------------------------------------------------------

const CHEAT_SHEET = [
  {
    group: "Anchors",
    items: [
      { pattern: "^", desc: "Start of string / line" },
      { pattern: "$", desc: "End of string / line" },
      { pattern: "\\b", desc: "Word boundary" },
      { pattern: "\\B", desc: "Non-word boundary" },
    ],
  },
  {
    group: "Character Classes",
    items: [
      { pattern: ".", desc: "Any character (except newline)" },
      { pattern: "\\d", desc: "Digit [0-9]" },
      { pattern: "\\D", desc: "Non-digit" },
      { pattern: "\\w", desc: "Word char [a-zA-Z0-9_]" },
      { pattern: "\\W", desc: "Non-word char" },
      { pattern: "\\s", desc: "Whitespace" },
      { pattern: "\\S", desc: "Non-whitespace" },
      { pattern: "[abc]", desc: "Character class" },
      { pattern: "[^abc]", desc: "Negated character class" },
      { pattern: "[a-z]", desc: "Character range" },
    ],
  },
  {
    group: "Quantifiers",
    items: [
      { pattern: "*", desc: "0 or more" },
      { pattern: "+", desc: "1 or more" },
      { pattern: "?", desc: "0 or 1 (optional)" },
      { pattern: "{n}", desc: "Exactly n times" },
      { pattern: "{n,}", desc: "n or more times" },
      { pattern: "{n,m}", desc: "Between n and m times" },
      { pattern: "*?", desc: "Lazy 0 or more" },
      { pattern: "+?", desc: "Lazy 1 or more" },
    ],
  },
  {
    group: "Groups & References",
    items: [
      { pattern: "(abc)", desc: "Capturing group" },
      { pattern: "(?:abc)", desc: "Non-capturing group" },
      { pattern: "(?<name>abc)", desc: "Named capturing group" },
      { pattern: "\\1", desc: "Backreference to group 1" },
      { pattern: "(?=abc)", desc: "Positive lookahead" },
      { pattern: "(?!abc)", desc: "Negative lookahead" },
      { pattern: "(?<=abc)", desc: "Positive lookbehind" },
      { pattern: "(?<!abc)", desc: "Negative lookbehind" },
    ],
  },
  {
    group: "Common Patterns",
    items: [
      {
        pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
        desc: "Email address",
      },
      {
        pattern: "https?:\\/\\/[^\\s/$.?#][^\\s]*",
        desc: "URL (http/https)",
      },
      {
        pattern: "\\+?[1-9]\\d{1,14}",
        desc: "Phone (E.164)",
      },
      {
        pattern: "\\d{4}-\\d{2}-\\d{2}",
        desc: "Date (YYYY-MM-DD)",
      },
      {
        pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
        desc: "IPv4 address",
      },
      {
        pattern: "#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b",
        desc: "Hex color code",
      },
      {
        pattern: "^[a-zA-Z0-9_-]{3,16}$",
        desc: "Username (3-16 chars)",
      },
      {
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
        desc: "Strong password",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHighlightedHtml(text: string, matches: MatchInfo[]): string {
  if (matches.length === 0) return escapeHtml(text);

  const parts: string[] = [];
  let cursor = 0;

  for (let i = 0; i < matches.length; i++) {
    const { index, end } = matches[i];
    if (index > cursor) {
      parts.push(escapeHtml(text.slice(cursor, index)));
    }
    const matchText = text.slice(index, end);
    parts.push(
      `<mark class="bg-yellow-400/30 text-yellow-200 rounded-sm outline outline-1 outline-yellow-400/50">${escapeHtml(matchText)}</mark>`
    );
    cursor = end;
  }

  if (cursor < text.length) {
    parts.push(escapeHtml(text.slice(cursor)));
  }

  return parts.join("");
}

function computeResult(
  pattern: string,
  flags: RegexFlags,
  testString: string
): Result | null {
  if (!pattern) return null;

  const flagStr =
    (flags.g ? "g" : "") +
    (flags.i ? "i" : "") +
    (flags.m ? "m" : "") +
    (flags.s ? "s" : "");

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flagStr || undefined);
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }

  const matches: MatchInfo[] = [];

  if (flags.g) {
    // Reset lastIndex to be safe
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    let safetyLimit = 0;
    while ((m = regex.exec(testString)) !== null && safetyLimit < 5000) {
      matches.push({
        fullMatch: m[0],
        index: m.index,
        end: m.index + m[0].length,
        groups: m.slice(1),
        namedGroups: (m.groups as Record<string, string | undefined>) ?? null,
      });
      // Guard against zero-length matches causing infinite loops
      if (m[0].length === 0) {
        regex.lastIndex++;
      }
      safetyLimit++;
    }
  } else {
    const m = regex.exec(testString);
    if (m) {
      matches.push({
        fullMatch: m[0],
        index: m.index,
        end: m.index + m[0].length,
        groups: m.slice(1),
        namedGroups: (m.groups as Record<string, string | undefined>) ?? null,
      });
    }
  }

  const highlightedHtml = buildHighlightedHtml(testString, matches);

  return { ok: true, regex, matches, highlightedHtml };
}

function computeReplacement(
  result: RegexResult,
  testString: string,
  replacement: string
): string {
  try {
    return testString.replace(result.regex, replacement);
  } catch {
    return testString;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FlagCheckboxProps {
  flag: keyof RegexFlags;
  label: string;
  title: string;
  checked: boolean;
  onChange: (flag: keyof RegexFlags, val: boolean) => void;
}

function FlagCheckbox({ flag, label, title, checked, onChange }: FlagCheckboxProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-colors select-none ${
        checked
          ? "bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500/50"
          : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200"
      }`}
      title={title}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(flag, e.target.checked)}
      />
      {label}
    </label>
  );
}

interface MatchCardProps {
  match: MatchInfo;
  index: number;
}

function MatchCard({ match, index }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasGroups =
    match.groups.length > 0 ||
    (match.namedGroups && Object.keys(match.namedGroups).length > 0);

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/60 overflow-hidden">
      <div
        className={`flex items-center gap-2 px-3 py-2 ${hasGroups ? "cursor-pointer hover:bg-gray-700/50" : ""}`}
        onClick={() => hasGroups && setExpanded((e) => !e)}
      >
        <span className="flex-shrink-0 rounded bg-indigo-600/30 px-1.5 py-0.5 text-xs font-mono text-indigo-300 ring-1 ring-indigo-500/30">
          #{index + 1}
        </span>
        <code className="flex-1 truncate text-xs font-mono text-yellow-300">
          {match.fullMatch === "" ? (
            <span className="text-gray-500 italic">empty match</span>
          ) : (
            match.fullMatch
          )}
        </code>
        <span className="flex-shrink-0 text-xs text-gray-500">
          pos {match.index}–{match.end}
        </span>
        {hasGroups && (
          <span className="flex-shrink-0 text-gray-500">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
        )}
      </div>

      {expanded && hasGroups && (
        <div className="border-t border-gray-700 px-3 py-2 space-y-1.5">
          {match.namedGroups && Object.keys(match.namedGroups).length > 0 ? (
            Object.entries(match.namedGroups).map(([name, val]) => (
              <div key={name} className="flex items-start gap-2 text-xs font-mono">
                <span className="text-purple-400 flex-shrink-0">
                  &lt;{name}&gt;
                </span>
                <span className="text-gray-300 break-all">
                  {val === undefined ? (
                    <span className="text-gray-600 italic">undefined</span>
                  ) : (
                    `"${val}"`
                  )}
                </span>
              </div>
            ))
          ) : (
            match.groups.map((g, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-mono">
                <span className="text-purple-400 flex-shrink-0">
                  group {i + 1}
                </span>
                <span className="text-gray-300 break-all">
                  {g === undefined ? (
                    <span className="text-gray-600 italic">undefined</span>
                  ) : (
                    `"${g}"`
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface CheatSheetSectionProps {
  onInsert: (pattern: string) => void;
}

function CheatSheetSection({ onInsert }: CheatSheetSectionProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-700 bg-gray-800">
        <BookOpen className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">
          Quick Reference Cheat Sheet
        </span>
      </div>
      <div className="divide-y divide-gray-700/60">
        {CHEAT_SHEET.map((section) => {
          const isOpen = openGroup === section.group;
          return (
            <div key={section.group}>
              <button
                className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-gray-800/60 transition-colors"
                onClick={() =>
                  setOpenGroup(isOpen ? null : section.group)
                }
              >
                <span className="text-sm font-medium text-gray-200">
                  {section.group}
                </span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {isOpen && (
                <div className="border-t border-gray-700/60 bg-gray-900/60 px-4 py-3">
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {section.items.map((item) => (
                      <button
                        key={item.pattern}
                        className="flex items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-gray-700/60 transition-colors group"
                        onClick={() => onInsert(item.pattern)}
                        title="Click to insert into pattern"
                      >
                        <code className="flex-shrink-0 rounded bg-gray-800 px-1.5 py-0.5 text-xs font-mono text-indigo-300 group-hover:bg-indigo-600/20 transition-colors">
                          {item.pattern}
                        </code>
                        <span className="text-xs text-gray-400 leading-5">
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<RegexFlags>({
    g: true,
    i: false,
    m: false,
    s: false,
  });
  const [testString, setTestString] = useState(
    "The quick brown fox jumps over the lazy dog.\nContact us at hello@example.com or support@toolhub.dev\nVisit https://example.com for more info."
  );
  const [replacement, setReplacement] = useState("");
  const [copiedReplace, setCopiedReplace] = useState(false);

  const result = useMemo(
    () => computeResult(pattern, flags, testString),
    [pattern, flags, testString]
  );

  const replaceResult = useMemo(() => {
    if (!result || !result.ok || !replacement) return null;
    return computeReplacement(result, testString, replacement);
  }, [result, testString, replacement]);

  const handleFlagChange = useCallback(
    (flag: keyof RegexFlags, val: boolean) => {
      setFlags((f) => ({ ...f, [flag]: val }));
    },
    []
  );

  const handleInsertPattern = useCallback((pat: string) => {
    setPattern((prev) => prev + pat);
  }, []);

  const handleCopyReplace = useCallback(() => {
    if (replaceResult === null) return;
    navigator.clipboard.writeText(replaceResult).then(() => {
      setCopiedReplace(true);
      setTimeout(() => setCopiedReplace(false), 2000);
    });
  }, [replaceResult]);

  const matchCount =
    result && result.ok ? result.matches.length : 0;
  const isError = result && !result.ok;
  const isValid = result && result.ok;

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test regular expressions with live matching"
      category="Developer Tools"
    >
      <div className="space-y-4">
        {/* Pattern input row */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700 bg-gray-800 flex-wrap">
            <span className="text-sm font-medium text-gray-300 flex-shrink-0">
              Pattern
            </span>
            {/* Flags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { flag: "g", label: "/g", title: "Global — find all matches" },
                  { flag: "i", label: "/i", title: "Case-insensitive" },
                  { flag: "m", label: "/m", title: "Multiline — ^ and $ match line boundaries" },
                  { flag: "s", label: "/s", title: "Dotall — . matches newline" },
                ] as { flag: keyof RegexFlags; label: string; title: string }[]
              ).map(({ flag, label, title }) => (
                <FlagCheckbox
                  key={flag}
                  flag={flag}
                  label={label}
                  title={title}
                  checked={flags[flag]}
                  onChange={handleFlagChange}
                />
              ))}
            </div>
            {/* Match count badge */}
            {isValid && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
                <ListFilter className="h-3.5 w-3.5" />
                {matchCount === 0 ? (
                  <span className="text-gray-500">No matches</span>
                ) : (
                  <span className="text-green-400 font-medium">
                    {matchCount} match{matchCount !== 1 ? "es" : ""}
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className="px-3 text-gray-600 font-mono text-lg select-none flex-shrink-0">
              /
            </span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern…"
              className="flex-1 bg-gray-900 text-gray-100 font-mono text-sm py-3 pr-3 focus:outline-none placeholder-gray-600"
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
            />
            <span className="px-1 text-gray-600 font-mono text-lg select-none flex-shrink-0">
              /
            </span>
            <span className="pr-3 text-indigo-400 font-mono text-sm select-none flex-shrink-0">
              {(flags.g ? "g" : "") +
                (flags.i ? "i" : "") +
                (flags.m ? "m" : "") +
                (flags.s ? "s" : "") || ""}
            </span>
          </div>
        </div>

        {/* Regex error */}
        {isError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-300">
                Invalid Regular Expression
              </p>
              <p className="mt-0.5 text-sm text-red-400 font-mono break-all">
                {(result as RegexError).message}
              </p>
            </div>
          </div>
        )}

        {/* Two-column layout: test string + match list */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Test string with live highlighting */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
              <span className="text-sm font-medium text-gray-300">
                Test String
              </span>
              <span className="text-xs text-gray-500">
                {testString.length.toLocaleString()} chars
              </span>
            </div>
            {/* Highlight overlay */}
            {isValid && matchCount > 0 ? (
              <div className="relative">
                {/* Visible highlighted layer */}
                <div
                  className="absolute inset-0 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none overflow-hidden text-transparent"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: result.highlightedHtml }}
                />
                <textarea
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  className="relative w-full bg-transparent text-gray-100/0 caret-gray-100 font-mono text-sm p-4 resize-none focus:outline-none min-h-[200px] leading-relaxed"
                  spellCheck={false}
                  style={{ caretColor: "rgb(243 244 246)" }}
                />
              </div>
            ) : (
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 resize-none focus:outline-none placeholder-gray-600 min-h-[200px] leading-relaxed"
                spellCheck={false}
                placeholder="Enter test string here…"
              />
            )}
          </div>

          {/* Match list */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700 bg-gray-800 flex-shrink-0">
              <span className="text-sm font-medium text-gray-300">
                Matches
              </span>
              {isValid && matchCount > 0 && (
                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                  {matchCount}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto max-h-[320px] p-3 space-y-2">
              {!pattern && (
                <p className="text-center text-sm text-gray-600 py-8">
                  Enter a pattern to see matches
                </p>
              )}
              {isValid && matchCount === 0 && pattern && (
                <p className="text-center text-sm text-gray-500 py-8">
                  No matches found
                </p>
              )}
              {isValid &&
                result.matches.map((match, i) => (
                  <MatchCard key={i} match={match} index={i} />
                ))}
            </div>
          </div>
        </div>

        {/* Replace section */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-700 bg-gray-800">
            <Replace className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Replace</span>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs text-gray-500">
                Replacement string{" "}
                <span className="text-gray-600">
                  (use $1, $2 or $&lt;name&gt; for groups)
                </span>
              </label>
              <input
                type="text"
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="Replacement… e.g. [$&] or $1-$2"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-gray-100 focus:border-indigo-500 focus:outline-none placeholder-gray-600"
                spellCheck={false}
              />
            </div>
            {replaceResult !== null && (
              <div className="rounded-lg border border-gray-700 bg-gray-800/60 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
                  <span className="text-xs text-gray-400 font-medium">
                    Result
                  </span>
                  <button
                    onClick={handleCopyReplace}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      copiedReplace
                        ? "bg-green-600/20 text-green-400"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                  >
                    {copiedReplace ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 text-sm font-mono text-gray-100 whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto leading-relaxed">
                  {replaceResult}
                </pre>
              </div>
            )}
            {!pattern && (
              <p className="text-xs text-gray-600">
                Enter a pattern above to enable replacement.
              </p>
            )}
            {isValid && matchCount === 0 && pattern && replacement && (
              <p className="text-xs text-gray-500">
                No matches — original string is returned unchanged.
              </p>
            )}
          </div>
        </div>

        {/* Cheat sheet */}
        <CheatSheetSection onInsert={handleInsertPattern} />
      </div>
    </ToolLayout>
  );
}
