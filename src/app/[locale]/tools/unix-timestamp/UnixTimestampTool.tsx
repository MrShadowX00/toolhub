"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Clock } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TIMEZONES = [
  { label: "UTC", tz: "UTC" },
  { label: "Local", tz: undefined }, // uses system timezone
  { label: "EST", tz: "America/New_York" },
  { label: "PST", tz: "America/Los_Angeles" },
  { label: "GMT", tz: "Europe/London" },
  { label: "IST", tz: "Asia/Kolkata" },
  { label: "JST", tz: "Asia/Tokyo" },
  { label: "CET", tz: "Europe/Paris" },
] as const;

// Max safe Unix timestamp in seconds: 2^31 - 1 (year 2038 boundary is a
// known limit but JS Date supports up to 8640000000000 seconds from epoch)
const MAX_UNIX_S = 8640000000;
const MIN_UNIX_S = -8640000000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatInTz(
  date: Date,
  tz: string | undefined,
): string {
  try {
    return date.toLocaleString("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });
  } catch {
    return "Unsupported timezone";
  }
}

function toDatetimeLocal(date: Date): string {
  // Returns value suitable for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

function validateUnixSeconds(value: number): string | null {
  if (!Number.isFinite(value)) return "Not a finite number.";
  if (value < MIN_UNIX_S || value > MAX_UNIX_S)
    return `Timestamp out of range (${MIN_UNIX_S} – ${MAX_UNIX_S}).`;
  return null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [value]);

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        copied
          ? "bg-green-600/20 text-green-400"
          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
      }`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section: Live clock
// ---------------------------------------------------------------------------

function LiveClock({ unit }: { unit: "s" | "ms" }) {
  const [now, setNow] = useState<number>(() =>
    unit === "ms" ? Date.now() : Math.floor(Date.now() / 1000),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setNow(unit === "ms" ? Date.now() : Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [unit]);

  const display = String(now);

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-semibold text-gray-300">
          Current Unix Timestamp
        </span>
        <span className="ml-auto rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400">
          live
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-mono text-3xl font-bold text-white tracking-tight">
          {display}
        </span>
        <CopyButton value={display} />
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {unit === "ms" ? "Milliseconds" : "Seconds"} since Unix epoch
        (1970-01-01 00:00:00 UTC)
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Timezone table
// ---------------------------------------------------------------------------

function TimezoneTable({ date }: { date: Date }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
      <div className="border-b border-gray-700 bg-gray-900 px-4 py-2">
        <span className="text-sm font-semibold text-gray-300">
          Timestamp in multiple timezones
        </span>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {TIMEZONES.map(({ label, tz }, i) => (
            <tr
              key={label}
              className={i % 2 === 0 ? "bg-gray-800" : "bg-gray-900/60"}
            >
              <td className="w-16 px-4 py-2.5 font-mono text-xs font-semibold text-blue-400">
                {label}
              </td>
              <td className="px-4 py-2.5 font-mono text-gray-200">
                {formatInTz(date, tz)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Unix → Human
// ---------------------------------------------------------------------------

function UnixToHuman({ unit }: { unit: "s" | "ms" }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a timestamp.");
      setResult(null);
      return;
    }

    const raw = Number(trimmed);
    if (Number.isNaN(raw)) {
      setError("Input is not a valid number.");
      setResult(null);
      return;
    }

    const seconds = unit === "ms" ? raw / 1000 : raw;
    const validationError = validateUnixSeconds(seconds);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    const ms = unit === "ms" ? raw : raw * 1000;
    const date = new Date(ms);
    if (isNaN(date.getTime())) {
      setError("Could not construct a valid date from this timestamp.");
      setResult(null);
      return;
    }

    setError(null);
    setResult(date);
  }, [input, unit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") convert();
    },
    [convert],
  );

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-300">
        Unix Timestamp &rarr; Human Date
      </h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
            setResult(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={unit === "ms" ? "e.g. 1711584000000" : "e.g. 1711584000"}
          className="min-w-0 flex-1 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 font-mono text-sm text-gray-100 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          spellCheck={false}
        />
        <button
          onClick={convert}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 active:bg-blue-700"
        >
          Convert
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {result && !error && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-4 py-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">ISO 8601</p>
              <p className="font-mono text-sm text-gray-100">
                {result.toISOString()}
              </p>
            </div>
            <CopyButton value={result.toISOString()} />
          </div>
          <TimezoneTable date={result} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Human → Unix
// ---------------------------------------------------------------------------

function HumanToUnix({ unit }: { unit: "s" | "ms" }) {
  // Default to current local time
  const [input, setInput] = useState(() => toDatetimeLocal(new Date()));
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-convert when input or unit changes
  /* eslint-disable react-hooks/set-state-in-effect -- synchronize computed result from input */
  useEffect(() => {
    if (!input) {
      setError("Please select a date and time.");
      setResult(null);
      return;
    }

    const date = new Date(input);
    if (isNaN(date.getTime())) {
      setError("Could not parse the selected date and time.");
      setResult(null);
      return;
    }

    const ms = date.getTime();
    const seconds = ms / 1000;
    const validationError = validateUnixSeconds(seconds);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    setError(null);
    setResult(unit === "ms" ? ms : Math.floor(seconds));
  }, [input, unit]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const display = result !== null ? String(result) : "";

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-300">
        Date / Time &rarr; Unix Timestamp
      </h2>

      <input
        type="datetime-local"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        step="1"
        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none [color-scheme:dark]"
      />

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {result !== null && !error && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-4 py-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">
                Unix timestamp ({unit === "ms" ? "milliseconds" : "seconds"})
              </p>
              <p className="font-mono text-2xl font-bold text-white">
                {display}
              </p>
            </div>
            <CopyButton value={display} />
          </div>

          <TimezoneTable date={new Date(unit === "ms" ? result : result * 1000)} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Unit toggle
// ---------------------------------------------------------------------------

function UnitToggle({
  unit,
  onChange,
}: {
  unit: "s" | "ms";
  onChange: (u: "s" | "ms") => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 p-1">
      {(["s", "ms"] as const).map((u) => (
        <button
          key={u}
          onClick={() => onChange(u)}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
            unit === u
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {u === "s" ? "Seconds" : "Milliseconds"}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function UnixTimestampTool() {
  const [unit, setUnit] = useState<"s" | "ms">("s");

  return (
    <div className="space-y-6">
      {/* Unit toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Unit:</span>
        <UnitToggle unit={unit} onChange={setUnit} />
      </div>

      {/* Live clock */}
      <LiveClock unit={unit} />

      {/* Unix → Human */}
      <UnixToHuman unit={unit} />

      {/* Human → Unix */}
      <HumanToUnix unit={unit} />
    </div>
  );
}
