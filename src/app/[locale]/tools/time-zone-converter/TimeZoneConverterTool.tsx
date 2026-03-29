"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Plus, X, Clock, Search, ChevronDown } from "lucide-react";

const MAX_TARGETS = 5;

function getTimezones(): string[] {
  return Intl.supportedValuesOf("timeZone");
}

function formatTzDisplay(tz: string): string {
  return tz.replace(/_/g, " ");
}

function getUtcOffset(tz: string, date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  if (!offsetPart) return "UTC+0";
  const raw = offsetPart.value;
  if (raw === "GMT") return "UTC+0";
  return raw.replace("GMT", "UTC");
}

function formatTimeInZone(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDateInZone(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function convertTime(
  dateStr: string,
  timeStr: string,
  sourceTz: string,
  targetTz: string
): { time: string; date: string } | null {
  if (!dateStr || !timeStr) return null;
  try {
    const sourceDate = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(sourceDate.getTime())) return null;

    const sourceFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: sourceTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const sourceParts = sourceFormatter.formatToParts(sourceDate);
    const getPart = (type: Intl.DateTimeFormatPartTypes): string =>
      sourceParts.find((p) => p.type === type)?.value ?? "0";

    const sourceInLocal = new Date(
      `${getPart("year")}-${getPart("month")}-${getPart("day")}T${getPart("hour")}:${getPart("minute")}:${getPart("second")}`
    );

    const diff = sourceInLocal.getTime() - sourceDate.getTime();
    const adjustedDate = new Date(sourceDate.getTime() - diff);

    return {
      time: formatTimeInZone(adjustedDate, targetTz),
      date: formatDateInZone(adjustedDate, targetTz),
    };
  } catch {
    return null;
  }
}

interface TimezoneSearchSelectProps {
  value: string;
  onChange: (tz: string) => void;
  timezones: string[];
  label: string;
}

function TimezoneSearchSelect({
  value,
  onChange,
  timezones,
  label,
}: TimezoneSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search) return timezones;
    const lower = search.toLowerCase();
    return timezones.filter((tz) =>
      formatTzDisplay(tz).toLowerCase().includes(lower)
    );
  }, [timezones, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}
      </label>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-left text-sm text-white transition-colors hover:border-orange-500/50 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
      >
        <span className="truncate">
          {value ? formatTzDisplay(value) : "Select timezone..."}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
          <div className="border-b border-gray-700 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search timezones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-900 py-1.5 pl-8 pr-3 text-sm text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">
                No timezones found
              </li>
            ) : (
              filtered.map((tz) => (
                <li key={tz}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(tz);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-orange-500/10 hover:text-orange-400 ${
                      tz === value
                        ? "bg-orange-500/10 text-orange-400"
                        : "text-gray-300"
                    }`}
                  >
                    {formatTzDisplay(tz)}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function TimeZoneConverterTool() {
  const timezones = useMemo(() => getTimezones(), []);

  const localTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  }, []);

  const [dateInput, setDateInput] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [timeInput, setTimeInput] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [sourceTz, setSourceTz] = useState(localTz);
  const [targetTzs, setTargetTzs] = useState<string[]>(["UTC"]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTarget = useCallback(() => {
    if (targetTzs.length >= MAX_TARGETS) return;
    const unused = timezones.find(
      (tz) => tz !== sourceTz && !targetTzs.includes(tz)
    );
    if (unused) {
      setTargetTzs((prev) => [...prev, unused]);
    }
  }, [targetTzs, timezones, sourceTz]);

  const removeTarget = useCallback(
    (index: number) => {
      if (targetTzs.length <= 1) return;
      setTargetTzs((prev) => prev.filter((_, i) => i !== index));
    },
    [targetTzs.length]
  );

  const updateTarget = useCallback((index: number, tz: string) => {
    setTargetTzs((prev) => prev.map((t, i) => (i === index ? tz : t)));
  }, []);

  const allZones = useMemo(
    () => [sourceTz, ...targetTzs],
    [sourceTz, targetTzs]
  );

  return (
      <div className="space-y-6">
        {/* Source Input Section */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Source Time
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Date
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Time
              </label>
              <input
                type="time"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 [color-scheme:dark]"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <TimezoneSearchSelect
                value={sourceTz}
                onChange={setSourceTz}
                timezones={timezones}
                label="Source Timezone"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{getUtcOffset(sourceTz, now)}</span>
          </div>
        </div>

        {/* Target Timezones */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Target Timezones
            </h2>
            {targetTzs.length < MAX_TARGETS && (
              <button
                type="button"
                onClick={addTarget}
                className="flex items-center gap-1.5 rounded-lg bg-orange-500/10 px-3 py-1.5 text-sm font-medium text-orange-400 transition-colors hover:bg-orange-500/20"
              >
                <Plus className="h-4 w-4" />
                Add Timezone
              </button>
            )}
          </div>

          <div className="space-y-4">
            {targetTzs.map((tz, index) => {
              const converted = convertTime(dateInput, timeInput, sourceTz, tz);
              return (
                <div
                  key={`${index}-${tz}`}
                  className="rounded-lg border border-gray-700 bg-gray-800 p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <TimezoneSearchSelect
                        value={tz}
                        onChange={(newTz) => updateTarget(index, newTz)}
                        timezones={timezones}
                        label={`Target ${index + 1}`}
                      />
                    </div>
                    {targetTzs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTarget(index)}
                        className="mt-7 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Remove timezone ${formatTzDisplay(tz)}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {converted && (
                    <div className="mt-3 rounded-lg bg-gray-900 p-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-bold text-orange-400">
                          {converted.time}
                        </span>
                        <span className="text-sm text-gray-400">
                          {getUtcOffset(tz, now)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-400">
                        {converted.date}
                      </p>
                    </div>
                  )}

                  {!converted && dateInput && timeInput && (
                    <p className="mt-3 text-sm text-gray-500">
                      Unable to convert time.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Clock Section */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Clock className="h-5 w-5 text-orange-400" />
            Live Clocks
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allZones.map((tz, index) => (
              <div
                key={`live-${index}-${tz}`}
                className="rounded-lg border border-gray-700 bg-gray-800 p-4"
              >
                <p className="truncate text-sm font-medium text-gray-300">
                  {formatTzDisplay(tz)}
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  {formatTimeInZone(now, tz)}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {formatDateInZone(now, tz)}
                  </p>
                  <span className="text-xs text-orange-400">
                    {getUtcOffset(tz, now)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
