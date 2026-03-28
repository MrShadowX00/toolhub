"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import { Clock, Copy, Check } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const PRESETS: { label: string; value: string; description: string }[] = [
  { label: "@yearly",  value: "0 0 1 1 *",   description: "Once a year at midnight on Jan 1" },
  { label: "@monthly", value: "0 0 1 * *",   description: "Once a month at midnight on the 1st" },
  { label: "@weekly",  value: "0 0 * * 0",   description: "Once a week at midnight on Sunday" },
  { label: "@daily",   value: "0 0 * * *",   description: "Once a day at midnight" },
  { label: "@hourly",  value: "0 * * * *",   description: "Once an hour at the start of the hour" },
  { label: "Every 5m", value: "*/5 * * * *", description: "Every 5 minutes" },
  { label: "Weekdays", value: "0 9 * * 1-5", description: "Every weekday at 9 AM" },
  { label: "Midnight", value: "0 0 * * *",   description: "Every day at midnight" },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CronField {
  raw: string;
  label: string;
  min: number;
  max: number;
  names?: string[];
}

interface ParsedCron {
  ok: true;
  fields: {
    minute: CronField;
    hour: CronField;
    dayOfMonth: CronField;
    month: CronField;
    weekday: CronField;
  };
  description: string;
  nextTimes: Date[];
}

interface CronError {
  ok: false;
  message: string;
}

type CronResult = ParsedCron | CronError;

// ---------------------------------------------------------------------------
// Cron parsing helpers
// ---------------------------------------------------------------------------

function parseFieldValues(
  raw: string,
  min: number,
  max: number,
  names?: string[],
): number[] | null {
  const normalizedRaw = names
    ? raw.replace(/[a-zA-Z]+/g, (m) => {
        const idx = names.findIndex((n) =>
          n.toLowerCase().startsWith(m.toLowerCase()),
        );
        return idx >= 0 ? String(idx) : m;
      })
    : raw;

  const parts = normalizedRaw.split(",");
  const values = new Set<number>();

  for (const part of parts) {
    // step: */N or range/N
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    if (stepMatch) {
      const step = parseInt(stepMatch[2], 10);
      if (step <= 0) return null;
      const range = stepMatch[1];
      let rangeMin = min;
      let rangeMax = max;
      if (range !== "*") {
        const rangeParts = range.split("-");
        if (rangeParts.length !== 2) return null;
        rangeMin = parseInt(rangeParts[0], 10);
        rangeMax = parseInt(rangeParts[1], 10);
        if (isNaN(rangeMin) || isNaN(rangeMax)) return null;
      }
      for (let i = rangeMin; i <= rangeMax; i += step) values.add(i);
      continue;
    }

    if (part === "*") {
      for (let i = min; i <= max; i++) values.add(i);
      continue;
    }

    // range: N-M
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const lo = parseInt(rangeMatch[1], 10);
      const hi = parseInt(rangeMatch[2], 10);
      if (isNaN(lo) || isNaN(hi) || lo > hi) return null;
      for (let i = lo; i <= hi; i++) values.add(i);
      continue;
    }

    // single value
    const num = parseInt(part, 10);
    if (isNaN(num) || num < min || num > max) return null;
    values.add(num);
  }

  return Array.from(values).sort((a, b) => a - b);
}

function describeField(
  raw: string,
  type: "minute" | "hour" | "dayOfMonth" | "month" | "weekday",
): string {
  if (raw === "*") return "";

  if (type === "minute") {
    const stepMatch = raw.match(/^\*\/(\d+)$/);
    if (stepMatch) return `every ${stepMatch[1]} minutes`;
    const single = parseInt(raw, 10);
    if (!isNaN(single)) return `at minute ${single}`;
  }

  if (type === "hour") {
    const stepMatch = raw.match(/^\*\/(\d+)$/);
    if (stepMatch) return `every ${stepMatch[1]} hours`;
    const single = parseInt(raw, 10);
    if (!isNaN(single)) {
      const h = single % 12 || 12;
      const ampm = single < 12 ? "AM" : "PM";
      return `at ${h}:00 ${ampm}`;
    }
    const rangeMatch = raw.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) return `from hour ${rangeMatch[1]} to ${rangeMatch[2]}`;
  }

  if (type === "dayOfMonth") {
    const single = parseInt(raw, 10);
    if (!isNaN(single)) return `on day ${single} of the month`;
    const stepMatch = raw.match(/^\*\/(\d+)$/);
    if (stepMatch) return `every ${stepMatch[1]} days`;
  }

  if (type === "month") {
    const single = parseInt(raw, 10);
    if (!isNaN(single) && single >= 1 && single <= 12)
      return `in ${MONTH_NAMES[single - 1]}`;
    const rangeMatch = raw.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const lo = parseInt(rangeMatch[1], 10) - 1;
      const hi = parseInt(rangeMatch[2], 10) - 1;
      if (lo >= 0 && hi <= 11)
        return `from ${MONTH_NAMES[lo]} to ${MONTH_NAMES[hi]}`;
    }
  }

  if (type === "weekday") {
    if (raw === "1-5") return "on weekdays (Mon–Fri)";
    const single = parseInt(raw, 10);
    if (!isNaN(single) && single >= 0 && single <= 6)
      return `on ${DAY_NAMES[single]}`;
    const rangeMatch = raw.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const lo = parseInt(rangeMatch[1], 10);
      const hi = parseInt(rangeMatch[2], 10);
      if (lo >= 0 && hi <= 6)
        return `${DAY_NAMES[lo]} through ${DAY_NAMES[hi]}`;
    }
  }

  return `(${raw})`;
}

function buildDescription(
  minuteRaw: string,
  hourRaw: string,
  domRaw: string,
  monthRaw: string,
  weekdayRaw: string,
): string {
  if (
    minuteRaw === "*" &&
    hourRaw === "*" &&
    domRaw === "*" &&
    monthRaw === "*" &&
    weekdayRaw === "*"
  )
    return "Every minute";

  if (minuteRaw === "0" && hourRaw === "*" && domRaw === "*" && monthRaw === "*" && weekdayRaw === "*")
    return "Every hour at the start of the hour";

  if (minuteRaw === "0" && hourRaw === "0" && domRaw === "*" && monthRaw === "*" && weekdayRaw === "*")
    return "Every day at midnight";

  if (minuteRaw === "0" && hourRaw === "0" && domRaw === "*" && monthRaw === "*" && weekdayRaw === "0")
    return "Every Sunday at midnight";

  if (minuteRaw === "0" && hourRaw === "0" && domRaw === "1" && monthRaw === "*" && weekdayRaw === "*")
    return "At midnight on the 1st of every month";

  if (minuteRaw === "0" && hourRaw === "0" && domRaw === "1" && monthRaw === "1" && weekdayRaw === "*")
    return "At midnight on January 1st (yearly)";

  if (minuteRaw === "0" && hourRaw === "9" && domRaw === "*" && monthRaw === "*" && weekdayRaw === "1-5")
    return "Every weekday at 9 AM";

  if (minuteRaw === "0" && hourRaw === "9" && domRaw === "*" && monthRaw === "*" && weekdayRaw === "*")
    return "Every day at 9 AM";

  const parts: string[] = [];

  const stepMinute = minuteRaw.match(/^\*\/(\d+)$/);
  const stepHour = hourRaw.match(/^\*\/(\d+)$/);

  if (stepMinute) {
    parts.push(
      `every ${stepMinute[1]} minute${stepMinute[1] === "1" ? "" : "s"}`,
    );
  } else if (minuteRaw === "*" && stepHour) {
    parts.push(`every ${stepHour[1]} hour${stepHour[1] === "1" ? "" : "s"}`);
  } else {
    const minuteDesc = describeField(minuteRaw, "minute");
    const hourDesc = describeField(hourRaw, "hour");
    if (hourDesc && minuteRaw === "0") {
      parts.push(hourDesc);
    } else if (hourDesc && minuteDesc) {
      parts.push(`${hourDesc}, ${minuteDesc}`);
    } else if (hourDesc) {
      parts.push(hourDesc);
    } else if (minuteDesc) {
      parts.push(minuteDesc);
    } else {
      parts.push("every minute");
    }
  }

  if (weekdayRaw !== "*") {
    const wdDesc = describeField(weekdayRaw, "weekday");
    if (wdDesc) parts.push(wdDesc);
  } else if (domRaw !== "*") {
    const domDesc = describeField(domRaw, "dayOfMonth");
    if (domDesc) parts.push(domDesc);
  }

  if (monthRaw !== "*") {
    const mDesc = describeField(monthRaw, "month");
    if (mDesc) parts.push(mDesc);
  }

  return parts.length > 0
    ? parts.join(", ").replace(/^./, (c) => c.toUpperCase())
    : "Custom schedule";
}

// ---------------------------------------------------------------------------
// Next execution times calculator
// ---------------------------------------------------------------------------

function getNextExecutions(
  minuteVals: number[],
  hourVals: number[],
  domVals: number[],
  monthVals: number[],
  weekdayVals: number[],
  count: number,
): Date[] {
  const results: Date[] = [];
  const now = new Date();
  const cursor = new Date(now);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const limit = new Date(now);
  limit.setFullYear(limit.getFullYear() + 4);

  while (results.length < count && cursor < limit) {
    const mo  = cursor.getMonth() + 1;
    const dom = cursor.getDate();
    const dow = cursor.getDay();
    const hr  = cursor.getHours();
    const min = cursor.getMinutes();

    if (!monthVals.includes(mo)) {
      cursor.setDate(1);
      cursor.setHours(0, 0, 0, 0);
      cursor.setMonth(cursor.getMonth() + 1);
      continue;
    }

    // Standard cron: if both DOM and DOW are non-wildcard, match either (OR)
    const allDom = domVals.length === 31;
    const allDow = weekdayVals.length === 7;
    const dayMatch =
      allDom && allDow ? true
      : allDom          ? weekdayVals.includes(dow)
      : allDow          ? domVals.includes(dom)
      :                   domVals.includes(dom) || weekdayVals.includes(dow);

    if (!dayMatch) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
      continue;
    }

    if (!hourVals.includes(hr)) {
      const nextHour = hourVals.find((h) => h > hr);
      if (nextHour !== undefined) {
        cursor.setHours(nextHour, 0, 0, 0);
      } else {
        cursor.setDate(cursor.getDate() + 1);
        cursor.setHours(0, 0, 0, 0);
      }
      continue;
    }

    if (!minuteVals.includes(min)) {
      const nextMin = minuteVals.find((m) => m > min);
      if (nextMin !== undefined) {
        cursor.setMinutes(nextMin, 0, 0);
      } else {
        const nextHour = hourVals.find((h) => h > hr);
        if (nextHour !== undefined) {
          cursor.setHours(nextHour, 0, 0, 0);
        } else {
          cursor.setDate(cursor.getDate() + 1);
          cursor.setHours(0, 0, 0, 0);
        }
      }
      continue;
    }

    results.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1, 0, 0);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Top-level parse
// ---------------------------------------------------------------------------

function parseCron(expression: string): CronResult {
  const trimmed = expression.trim();
  if (!trimmed) return { ok: false, message: "Enter a cron expression." };

  const parts = trimmed.split(/\s+/);
  if (parts.length !== 5) {
    return {
      ok: false,
      message: `Expected 5 fields (minute hour day month weekday), got ${parts.length}.`,
    };
  }

  const [minuteRaw, hourRaw, domRaw, monthRaw, weekdayRaw] = parts;

  const minuteVals = parseFieldValues(minuteRaw, 0, 59);
  if (!minuteVals)
    return { ok: false, message: `Invalid minute field: "${minuteRaw}".` };

  const hourVals = parseFieldValues(hourRaw, 0, 23);
  if (!hourVals)
    return { ok: false, message: `Invalid hour field: "${hourRaw}".` };

  const domVals = parseFieldValues(domRaw, 1, 31);
  if (!domVals)
    return {
      ok: false,
      message: `Invalid day-of-month field: "${domRaw}".`,
    };

  const monthVals = parseFieldValues(monthRaw, 1, 12, MONTH_NAMES);
  if (!monthVals)
    return { ok: false, message: `Invalid month field: "${monthRaw}".` };

  const weekdayVals = parseFieldValues(weekdayRaw, 0, 6, DAY_NAMES);
  if (!weekdayVals)
    return { ok: false, message: `Invalid weekday field: "${weekdayRaw}".` };

  const description = buildDescription(
    minuteRaw,
    hourRaw,
    domRaw,
    monthRaw,
    weekdayRaw,
  );
  const nextTimes = getNextExecutions(
    minuteVals,
    hourVals,
    domVals,
    monthVals,
    weekdayVals,
    10,
  );

  return {
    ok: true,
    fields: {
      minute:     { raw: minuteRaw,  label: "Minute",  min: 0, max: 59 },
      hour:       { raw: hourRaw,    label: "Hour",    min: 0, max: 23 },
      dayOfMonth: { raw: domRaw,     label: "Day",     min: 1, max: 31 },
      month:      { raw: monthRaw,   label: "Month",   min: 1, max: 12, names: MONTH_NAMES },
      weekday:    { raw: weekdayRaw, label: "Weekday", min: 0, max: 6,  names: DAY_NAMES },
    },
    description,
    nextTimes,
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatDate(d: Date): string {
  return d.toLocaleString("en-US", {
    weekday: "short",
    year:    "numeric",
    month:   "short",
    day:     "2-digit",
    hour:    "2-digit",
    minute:  "2-digit",
    second:  "2-digit",
    hour12:  false,
  });
}

function relativeTime(d: Date): string {
  const diffMs  = d.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffMin < 1)  return "in less than a minute";
  if (diffMin < 60) return `in ${diffMin} minute${diffMin !== 1 ? "s" : ""}`;
  if (diffHr < 24)  return `in ${diffHr} hour${diffHr !== 1 ? "s" : ""}`;
  if (diffDay < 30) return `in ${diffDay} day${diffDay !== 1 ? "s" : ""}`;
  const diffMo = Math.round(diffDay / 30);
  if (diffMo < 12)  return `in ${diffMo} month${diffMo !== 1 ? "s" : ""}`;
  const diffYr = Math.round(diffDay / 365);
  return `in ${diffYr} year${diffYr !== 1 ? "s" : ""}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FIELD_ORDER = [
  "minute",
  "hour",
  "dayOfMonth",
  "month",
  "weekday",
] as const;

export default function CronParserPage() {
  const [expression, setExpression] = useState("* * * * *");
  const [copied, setCopied] = useState(false);

  const result: CronResult = parseCron(expression);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(expression);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }, [expression]);

  return (
    <ToolLayout
      title="Cron Parser"
      description="Parse and explain cron expressions"
      category="Developer Tools"
    >
      <div className="space-y-6">

        {/* ── Expression input ── */}
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          <label className="mb-3 block text-sm font-medium text-gray-300">
            Cron Expression
          </label>

          {/* Positional labels */}
          <div className="mb-1 grid grid-cols-5 gap-2 px-1">
            {["Minute", "Hour", "Day", "Month", "Weekday"].map((lbl) => (
              <div
                key={lbl}
                className="text-center text-xs font-medium text-gray-500"
              >
                {lbl}
              </div>
            ))}
          </div>

          {/* Input + copy button */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              spellCheck={false}
              className="flex-1 rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 font-mono text-lg tracking-widest text-white placeholder-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="* * * * *"
            />
            <button
              onClick={handleCopy}
              title="Copy expression"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-600 bg-gray-700 text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* ── Presets ── */}
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          <p className="mb-3 text-sm font-medium text-gray-300">
            Common Presets
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setExpression(p.value)}
                title={p.description}
                className={`rounded-lg border px-3 py-1.5 text-sm font-mono transition-colors ${
                  expression === p.value
                    ? "border-blue-500 bg-blue-900/40 text-blue-300"
                    : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error state ── */}
        {!result.ok && (
          <div className="rounded-xl border border-red-700 bg-red-900/20 p-5">
            <p className="text-sm font-semibold text-red-400">
              Invalid expression
            </p>
            <p className="mt-1 text-sm text-red-300">{result.message}</p>
          </div>
        )}

        {/* ── Valid result ── */}
        {result.ok && (
          <>
            {/* Human-readable description */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-700/50 bg-blue-900/20 p-5">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-blue-400">
                  Human-readable description
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {result.description}
                </p>
              </div>
            </div>

            {/* Field breakdown */}
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
              <p className="mb-4 text-sm font-medium text-gray-300">
                Field Breakdown
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {FIELD_ORDER.map((key) => {
                  const f = result.fields[key];
                  return (
                    <div
                      key={key}
                      className="rounded-lg border border-gray-600 bg-gray-900 p-3 text-center"
                    >
                      <p className="mb-1 text-xs font-medium text-gray-500">
                        {f.label}
                      </p>
                      <p className="font-mono text-2xl font-bold text-white">
                        {f.raw}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {f.raw === "*"
                          ? `any (${f.min}–${f.max})`
                          : `range ${f.min}–${f.max}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next 10 executions */}
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
              <p className="mb-4 text-sm font-medium text-gray-300">
                Next 10 Execution Times
              </p>
              {result.nextTimes.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No execution times found within the next 4 years.
                </p>
              ) : (
                <ol className="space-y-2">
                  {result.nextTimes.map((t, i) => (
                    <li
                      key={i}
                      className="flex flex-col items-start justify-between gap-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 sm:flex-row sm:items-center"
                    >
                      <span className="font-mono text-sm text-white">
                        <span className="mr-2 text-gray-500">#{i + 1}</span>
                        {formatDate(t)}
                      </span>
                      <span className="shrink-0 text-xs text-gray-500">
                        {relativeTime(t)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
