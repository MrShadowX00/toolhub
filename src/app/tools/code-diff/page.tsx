"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import {
  Copy,
  Check,
  Columns2,
  AlignLeft,
  Trash2,
  GitCompare,
  Info,
} from "lucide-react";
import DiffMatchPatch from "diff-match-patch";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;

type Diff = [number, string];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LineStatus = "added" | "removed" | "changed" | "equal";

interface DiffLine {
  status: LineStatus;
  leftLineNo: number | null;
  rightLineNo: number | null;
  leftContent: string | null;
  rightContent: string | null;
  // For unified view
  content: string;
  side: "left" | "right" | "both";
}

interface DiffStats {
  added: number;
  removed: number;
  changed: number;
  equal: number;
}

// ---------------------------------------------------------------------------
// Diff computation helpers
// ---------------------------------------------------------------------------

function computeLineDiff(original: string, modified: string): {
  lines: DiffLine[];
  stats: DiffStats;
} {
  const dmp = new DiffMatchPatch();

  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");

  // Use diff_linesToChars_ for line-level diff
  const { chars1, chars2, lineArray } = dmp.diff_linesToChars_(
    original,
    modified
  );
  const diffs: Diff[] = dmp.diff_main(chars1, chars2, false);
  dmp.diff_charsToLines_(diffs, lineArray);
  dmp.diff_cleanupSemantic(diffs);

  // Build left/right line arrays from diffs
  const leftLines: { content: string; status: "removed" | "equal" | "changed" }[] = [];
  const rightLines: { content: string; status: "added" | "equal" | "changed" }[] = [];

  // We'll track paired changed lines for "changed" highlighting
  const deletedSegments: string[][] = [];
  const insertedSegments: string[][] = [];

  // First pass: split diffs into lines
  for (const [op, text] of diffs) {
    const segments = text.split("\n");
    // Remove trailing empty caused by trailing \n
    const lines = segments[segments.length - 1] === "" ? segments.slice(0, -1) : segments;

    if (op === DIFF_DELETE) {
      deletedSegments.push(lines);
      for (const line of lines) {
        leftLines.push({ content: line, status: "removed" });
      }
    } else if (op === DIFF_INSERT) {
      insertedSegments.push(lines);
      for (const line of lines) {
        rightLines.push({ content: line, status: "added" });
      }
    } else {
      // EQUAL
      for (const line of lines) {
        leftLines.push({ content: line, status: "equal" });
        rightLines.push({ content: line, status: "equal" });
      }
    }
  }

  // Now interleave left/right into DiffLine array for side-by-side view
  // Re-derive from diffs directly for proper pairing
  const result: DiffLine[] = [];
  const stats: DiffStats = { added: 0, removed: 0, changed: 0, equal: 0 };

  let leftNo = 1;
  let rightNo = 1;

  // We process diffs pair-wise: DELETE followed by INSERT = changed
  let i = 0;
  while (i < diffs.length) {
    const [op, text] = diffs[i];
    const rawLines = text.split("\n");
    const lines = rawLines[rawLines.length - 1] === "" ? rawLines.slice(0, -1) : rawLines;

    if (op === DIFF_EQUAL) {
      for (const line of lines) {
        result.push({
          status: "equal",
          leftLineNo: leftNo++,
          rightLineNo: rightNo++,
          leftContent: line,
          rightContent: line,
          content: line,
          side: "both",
        });
        stats.equal++;
      }
      i++;
    } else if (op === DIFF_DELETE) {
      // Check if next op is INSERT (changed block)
      const nextOp = i + 1 < diffs.length ? diffs[i + 1][0] : null;
      if (nextOp === DIFF_INSERT) {
        const [, insertText] = diffs[i + 1];
        const insertRaw = insertText.split("\n");
        const insertLines = insertRaw[insertRaw.length - 1] === "" ? insertRaw.slice(0, -1) : insertRaw;

        const maxLen = Math.max(lines.length, insertLines.length);
        for (let j = 0; j < maxLen; j++) {
          const hasLeft = j < lines.length;
          const hasRight = j < insertLines.length;

          if (hasLeft && hasRight) {
            result.push({
              status: "changed",
              leftLineNo: leftNo++,
              rightLineNo: rightNo++,
              leftContent: lines[j],
              rightContent: insertLines[j],
              content: insertLines[j],
              side: "right",
            });
            stats.changed++;
          } else if (hasLeft) {
            result.push({
              status: "removed",
              leftLineNo: leftNo++,
              rightLineNo: null,
              leftContent: lines[j],
              rightContent: null,
              content: lines[j],
              side: "left",
            });
            stats.removed++;
          } else {
            result.push({
              status: "added",
              leftLineNo: null,
              rightLineNo: rightNo++,
              leftContent: null,
              rightContent: insertLines[j],
              content: insertLines[j],
              side: "right",
            });
            stats.added++;
          }
        }
        i += 2; // skip both DELETE and INSERT
      } else {
        // Pure DELETE
        for (const line of lines) {
          result.push({
            status: "removed",
            leftLineNo: leftNo++,
            rightLineNo: null,
            leftContent: line,
            rightContent: null,
            content: line,
            side: "left",
          });
          stats.removed++;
        }
        i++;
      }
    } else if (op === DIFF_INSERT) {
      // Pure INSERT (not preceded by DELETE)
      for (const line of lines) {
        result.push({
          status: "added",
          leftLineNo: null,
          rightLineNo: rightNo++,
          leftContent: null,
          rightContent: line,
          content: line,
          side: "right",
        });
        stats.added++;
      }
      i++;
    } else {
      i++;
    }
  }

  return { lines: result, stats };
}

// ---------------------------------------------------------------------------
// Inline character diff for changed lines
// ---------------------------------------------------------------------------

function InlineCharDiff({
  original,
  modified,
  side,
}: {
  original: string;
  modified: string;
  side: "left" | "right";
}) {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(original, modified);
  dmp.diff_cleanupSemantic(diffs);

  return (
    <span className="font-mono text-sm">
      {diffs.map(([op, text], idx) => {
        if (op === DIFF_EQUAL) {
          return <span key={idx}>{text}</span>;
        }
        if (op === DIFF_DELETE && side === "left") {
          return (
            <span key={idx} className="bg-red-500/40 rounded-sm">
              {text}
            </span>
          );
        }
        if (op === DIFF_INSERT && side === "right") {
          return (
            <span key={idx} className="bg-green-500/40 rounded-sm">
              {text}
            </span>
          );
        }
        return null;
      })}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Line number cell
// ---------------------------------------------------------------------------

function LineNo({ n }: { n: number | null }) {
  return (
    <td className="w-10 min-w-[2.5rem] select-none px-2 py-0.5 text-right text-xs text-gray-600 border-r border-gray-700 font-mono align-top">
      {n ?? ""}
    </td>
  );
}

// ---------------------------------------------------------------------------
// Status badge colors
// ---------------------------------------------------------------------------

function rowBg(status: LineStatus, side?: "left" | "right" | "both") {
  if (status === "equal") return "";
  if (status === "added") return "bg-green-500/10";
  if (status === "removed") return "bg-red-500/10";
  if (status === "changed") {
    if (side === "left") return "bg-yellow-500/10";
    if (side === "right") return "bg-yellow-500/10";
    return "bg-yellow-500/10";
  }
  return "";
}

function emptyRowBg(status: LineStatus) {
  if (status === "removed") return "bg-red-500/5";
  if (status === "added") return "bg-green-500/5";
  if (status === "changed") return "bg-yellow-500/5";
  return "";
}

// ---------------------------------------------------------------------------
// Side-by-side diff table
// ---------------------------------------------------------------------------

function SideBySideView({ lines }: { lines: DiffLine[] }) {
  if (lines.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm font-mono min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800 text-xs text-gray-400">
            <th className="w-10 px-2 py-1.5 text-right font-medium">#</th>
            <th className="px-3 py-1.5 text-left font-medium border-r border-gray-700 w-1/2">
              Original
            </th>
            <th className="w-10 px-2 py-1.5 text-right font-medium">#</th>
            <th className="px-3 py-1.5 text-left font-medium w-1/2">
              Modified
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => {
            const isChanged = line.status === "changed";
            const isRemoved = line.status === "removed";
            const isAdded = line.status === "added";

            // Left cell
            let leftBg = "";
            let rightBg = "";
            if (line.status === "equal") {
              leftBg = "";
              rightBg = "";
            } else if (isRemoved) {
              leftBg = "bg-red-500/15";
              rightBg = emptyRowBg("removed");
            } else if (isAdded) {
              leftBg = emptyRowBg("added");
              rightBg = "bg-green-500/15";
            } else if (isChanged) {
              leftBg = "bg-yellow-500/10";
              rightBg = "bg-yellow-500/10";
            }

            return (
              <tr key={idx} className="border-b border-gray-800/60">
                {/* Left side */}
                <LineNo n={line.leftLineNo} />
                <td
                  className={`px-3 py-0.5 align-top border-r border-gray-700 ${leftBg}`}
                >
                  {line.leftContent !== null ? (
                    isChanged && line.rightContent !== null ? (
                      <InlineCharDiff
                        original={line.leftContent}
                        modified={line.rightContent}
                        side="left"
                      />
                    ) : (
                      <span
                        className={
                          isRemoved ? "text-red-300" : "text-gray-200"
                        }
                      >
                        {line.leftContent || " "}
                      </span>
                    )
                  ) : (
                    <span className="text-gray-700 select-none">&nbsp;</span>
                  )}
                </td>

                {/* Right side */}
                <LineNo n={line.rightLineNo} />
                <td className={`px-3 py-0.5 align-top ${rightBg}`}>
                  {line.rightContent !== null ? (
                    isChanged && line.leftContent !== null ? (
                      <InlineCharDiff
                        original={line.leftContent}
                        modified={line.rightContent}
                        side="right"
                      />
                    ) : (
                      <span
                        className={
                          isAdded ? "text-green-300" : "text-gray-200"
                        }
                      >
                        {line.rightContent || " "}
                      </span>
                    )
                  ) : (
                    <span className="text-gray-700 select-none">&nbsp;</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Unified diff view
// ---------------------------------------------------------------------------

function UnifiedView({ lines }: { lines: DiffLine[] }) {
  if (lines.length === 0) return null;

  const unifiedLines: {
    leftNo: number | null;
    rightNo: number | null;
    prefix: string;
    content: string;
    bg: string;
    textColor: string;
    originalLine?: string;
    modifiedLine?: string;
    status: LineStatus;
  }[] = [];

  for (const line of lines) {
    if (line.status === "equal") {
      unifiedLines.push({
        leftNo: line.leftLineNo,
        rightNo: line.rightLineNo,
        prefix: " ",
        content: line.leftContent ?? "",
        bg: "",
        textColor: "text-gray-300",
        status: "equal",
      });
    } else if (line.status === "removed") {
      unifiedLines.push({
        leftNo: line.leftLineNo,
        rightNo: null,
        prefix: "-",
        content: line.leftContent ?? "",
        bg: "bg-red-500/15",
        textColor: "text-red-300",
        status: "removed",
      });
    } else if (line.status === "added") {
      unifiedLines.push({
        leftNo: null,
        rightNo: line.rightLineNo,
        prefix: "+",
        content: line.rightContent ?? "",
        bg: "bg-green-500/15",
        textColor: "text-green-300",
        status: "added",
      });
    } else if (line.status === "changed") {
      // Show removed then added
      unifiedLines.push({
        leftNo: line.leftLineNo,
        rightNo: null,
        prefix: "-",
        content: line.leftContent ?? "",
        bg: "bg-yellow-500/10",
        textColor: "text-yellow-200",
        originalLine: line.leftContent ?? "",
        modifiedLine: line.rightContent ?? "",
        status: "changed",
      });
      unifiedLines.push({
        leftNo: null,
        rightNo: line.rightLineNo,
        prefix: "+",
        content: line.rightContent ?? "",
        bg: "bg-yellow-500/10",
        textColor: "text-yellow-200",
        originalLine: line.leftContent ?? "",
        modifiedLine: line.rightContent ?? "",
        status: "changed",
      });
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm font-mono">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800 text-xs text-gray-400">
            <th className="w-10 px-2 py-1.5 text-right font-medium">Orig</th>
            <th className="w-10 px-2 py-1.5 text-right font-medium border-r border-gray-700">
              Mod
            </th>
            <th className="w-6 px-1 py-1.5 text-center font-medium"></th>
            <th className="px-3 py-1.5 text-left font-medium">Content</th>
          </tr>
        </thead>
        <tbody>
          {unifiedLines.map((row, idx) => (
            <tr
              key={idx}
              className={`border-b border-gray-800/60 ${row.bg}`}
            >
              <td className="w-10 min-w-[2.5rem] select-none px-2 py-0.5 text-right text-xs text-gray-600 font-mono align-top">
                {row.leftNo ?? ""}
              </td>
              <td className="w-10 min-w-[2.5rem] select-none px-2 py-0.5 text-right text-xs text-gray-600 border-r border-gray-700 font-mono align-top">
                {row.rightNo ?? ""}
              </td>
              <td
                className={`w-6 px-1 py-0.5 text-center font-bold select-none align-top ${
                  row.prefix === "+"
                    ? "text-green-500"
                    : row.prefix === "-"
                      ? "text-red-500"
                      : "text-gray-700"
                }`}
              >
                {row.prefix}
              </td>
              <td className={`px-3 py-0.5 align-top ${row.textColor}`}>
                {row.status === "changed" &&
                row.originalLine !== undefined &&
                row.modifiedLine !== undefined ? (
                  <InlineCharDiff
                    original={row.originalLine}
                    modified={row.modifiedLine}
                    side={row.prefix === "-" ? "left" : "right"}
                  />
                ) : (
                  row.content || " "
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------

function StatsBar({ stats }: { stats: DiffStats }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <span className="flex items-center gap-1.5 text-green-400">
        <span className="h-2 w-2 rounded-full bg-green-400" />
        {stats.added} added
      </span>
      <span className="flex items-center gap-1.5 text-red-400">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        {stats.removed} removed
      </span>
      <span className="flex items-center gap-1.5 text-yellow-400">
        <span className="h-2 w-2 rounded-full bg-yellow-400" />
        {stats.changed} changed
      </span>
      <span className="flex items-center gap-1.5 text-gray-500">
        <span className="h-2 w-2 rounded-full bg-gray-600" />
        {stats.equal} equal
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
        copied
          ? "bg-green-600/20 text-green-400"
          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
      }`}
      title={`Copy ${label}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type ViewMode = "side-by-side" | "unified";

const PLACEHOLDER_ORIGINAL = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const result = greet("World");`;

const PLACEHOLDER_MODIFIED = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return name.length > 0;
}

const result = greet("World", "Hi");
console.log(result);`;

export default function CodeDiffPage() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");

  const { lines, stats } = useMemo(() => {
    if (!original && !modified) {
      return { lines: [], stats: { added: 0, removed: 0, changed: 0, equal: 0 } };
    }
    return computeLineDiff(original, modified);
  }, [original, modified]);

  const isEmpty = !original && !modified;
  const isIdentical =
    !isEmpty &&
    stats.added === 0 &&
    stats.removed === 0 &&
    stats.changed === 0;

  const totalChanges = stats.added + stats.removed + stats.changed;

  return (
    <ToolLayout
      title="Code Diff"
      description="Compare two code blocks side by side"
      category="Developer Tools"
    >
      <div className="space-y-4">
        {/* Input panels */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Original */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
              <span className="text-sm font-medium text-gray-300">
                Original
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {original.split("\n").length} lines
                </span>
                {original && (
                  <button
                    onClick={() => setOriginal("")}
                    className="rounded p-1 text-gray-500 hover:text-gray-300 transition-colors"
                    title="Clear"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder={PLACEHOLDER_ORIGINAL}
              className="w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 resize-none focus:outline-none placeholder-gray-700 min-h-[240px]"
              spellCheck={false}
            />
          </div>

          {/* Modified */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
              <span className="text-sm font-medium text-gray-300">
                Modified
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {modified.split("\n").length} lines
                </span>
                {modified && (
                  <button
                    onClick={() => setModified("")}
                    className="rounded p-1 text-gray-500 hover:text-gray-300 transition-colors"
                    title="Clear"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              placeholder={PLACEHOLDER_MODIFIED}
              className="w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 resize-none focus:outline-none placeholder-gray-700 min-h-[240px]"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/50 py-16">
            <div className="mb-4 rounded-full bg-blue-500/10 p-4">
              <GitCompare className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Paste code in both editors
            </h3>
            <p className="mt-1.5 max-w-sm text-center text-sm text-gray-500">
              Differences will appear automatically as you type.
            </p>
          </div>
        )}

        {/* Identical notice */}
        {isIdentical && (
          <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
            <Info className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-sm font-medium text-green-300">
              The two inputs are identical — no differences found.
            </p>
          </div>
        )}

        {/* Diff results */}
        {!isEmpty && !isIdentical && (
          <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700 bg-gray-800 flex-wrap gap-3">
              {/* Stats */}
              <StatsBar stats={stats} />

              {/* Right controls */}
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex rounded-lg bg-gray-900 p-0.5">
                  <button
                    onClick={() => setViewMode("side-by-side")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      viewMode === "side-by-side"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <Columns2 className="h-3.5 w-3.5" />
                    Side by side
                  </button>
                  <button
                    onClick={() => setViewMode("unified")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      viewMode === "unified"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <AlignLeft className="h-3.5 w-3.5" />
                    Unified
                  </button>
                </div>

                {/* Copy buttons */}
                <CopyButton text={original} label="Original" />
                <CopyButton text={modified} label="Modified" />
              </div>
            </div>

            {/* Diff body */}
            <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
              {viewMode === "side-by-side" ? (
                <SideBySideView lines={lines} />
              ) : (
                <UnifiedView lines={lines} />
              )}
            </div>

            {/* Footer summary */}
            <div className="border-t border-gray-700 bg-gray-800/50 px-4 py-2 text-xs text-gray-500">
              {totalChanges} change{totalChanges !== 1 ? "s" : ""} across{" "}
              {lines.length} line{lines.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        {/* Legend */}
        {!isEmpty && !isIdentical && (
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-xs text-gray-400">
            <span className="font-medium text-gray-300">Legend:</span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded-sm bg-green-500/20 border border-green-500/30" />
              Added
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded-sm bg-red-500/20 border border-red-500/30" />
              Removed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded-sm bg-yellow-500/20 border border-yellow-500/30" />
              Changed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline font-mono bg-green-500/30 rounded-sm px-0.5">
                chars
              </span>
              Inline character diff
            </span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
