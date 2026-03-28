"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ui/ToolLayout";

interface DateDifference {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  businessDays: number;
}

interface AddSubtractResult {
  resultDate: Date;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getToday(): string {
  return formatDate(new Date());
}

function getDefaultEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return formatDate(d);
}

function countBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const s = new Date(start);
  const e = new Date(end);

  if (s > e) {
    return countBusinessDays(e, s);
  }

  const current = new Date(s);
  while (current <= e) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function calcDifference(startStr: string, endStr: string): DateDifference | null {
  if (!startStr || !endStr) return null;

  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  const earlier = start <= end ? start : end;
  const later = start <= end ? end : start;

  // Calculate years, months, days breakdown
  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();
  let days = later.getDate() - earlier.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(later.getFullYear(), later.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Total calculations
  const diffMs = later.getTime() - earlier.getTime();
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  const totalSeconds = totalMinutes * 60;

  const businessDays = countBusinessDays(earlier, later);

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalHours,
    totalMinutes,
    totalSeconds,
    businessDays,
  };
}

function calcAddSubtract(
  dateStr: string,
  daysCount: number,
  mode: "add" | "subtract"
): AddSubtractResult | null {
  if (!dateStr || isNaN(daysCount)) return null;

  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return null;

  const result = new Date(date);
  if (mode === "add") {
    result.setDate(result.getDate() + daysCount);
  } else {
    result.setDate(result.getDate() - daysCount);
  }

  return { resultDate: result };
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-orange-400">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export default function DateDifferencePage() {
  const [startDate, setStartDate] = useState<string>(getToday);
  const [endDate, setEndDate] = useState<string>(getDefaultEnd);
  const [showBusinessDays, setShowBusinessDays] = useState<boolean>(false);

  const [addSubDate, setAddSubDate] = useState<string>(getToday);
  const [daysToAddSub, setDaysToAddSub] = useState<number>(0);
  const [addSubMode, setAddSubMode] = useState<"add" | "subtract">("add");

  const diff = useMemo(
    () => calcDifference(startDate, endDate),
    [startDate, endDate]
  );

  const addSubResult = useMemo(
    () => calcAddSubtract(addSubDate, daysToAddSub, addSubMode),
    [addSubDate, daysToAddSub, addSubMode]
  );

  return (
    <ToolLayout
      title="Date Difference Calculator"
      description="Calculate the difference between two dates in various units"
      category="Calculators"
    >
      <div className="space-y-8">
        {/* Date Inputs */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Select Dates
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="start-date"
                className="mb-1 block text-sm font-medium text-gray-300"
              >
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="mb-1 block text-sm font-medium text-gray-300"
              >
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              id="business-days"
              type="checkbox"
              checked={showBusinessDays}
              onChange={(e) => setShowBusinessDays(e.target.checked)}
              className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-orange-500 accent-orange-500 focus:ring-orange-500"
            />
            <label
              htmlFor="business-days"
              className="text-sm text-gray-300"
            >
              Show business days (exclude weekends)
            </label>
          </div>
        </div>

        {/* Readable Difference */}
        {diff && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-6">
            <p className="text-center text-xl font-semibold text-white">
              {diff.years > 0 && (
                <span>
                  {diff.years} {diff.years === 1 ? "year" : "years"}
                  {diff.months > 0 || diff.days > 0 ? ", " : ""}
                </span>
              )}
              {diff.months > 0 && (
                <span>
                  {diff.months} {diff.months === 1 ? "month" : "months"}
                  {diff.days > 0 ? ", " : ""}
                </span>
              )}
              <span>
                {diff.days} {diff.days === 1 ? "day" : "days"}
              </span>
            </p>
            {showBusinessDays && (
              <p className="mt-2 text-center text-sm text-orange-400">
                {diff.businessDays.toLocaleString()} business days (excluding
                weekends)
              </p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        {diff && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Total in Each Unit
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Years"
                value={diff.years}
                sub={`${diff.months} months, ${diff.days} days remaining`}
              />
              <StatCard
                label="Total Months"
                value={diff.years * 12 + diff.months}
                sub={`${diff.days} days remaining`}
              />
              <StatCard
                label="Total Weeks"
                value={diff.totalWeeks}
                sub={`${diff.totalDays % 7} days remaining`}
              />
              <StatCard label="Total Days" value={diff.totalDays} />
              <StatCard label="Total Hours" value={diff.totalHours} />
              <StatCard label="Total Minutes" value={diff.totalMinutes} />
              <StatCard label="Total Seconds" value={diff.totalSeconds} />
              {showBusinessDays && (
                <StatCard
                  label="Business Days"
                  value={diff.businessDays}
                  sub="Excludes Sat & Sun"
                />
              )}
            </div>
          </div>
        )}

        {/* Add/Subtract Section */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Add / Subtract Days from a Date
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="addsub-date"
                className="mb-1 block text-sm font-medium text-gray-300"
              >
                Date
              </label>
              <input
                id="addsub-date"
                type="date"
                value={addSubDate}
                onChange={(e) => setAddSubDate(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label
                htmlFor="addsub-days"
                className="mb-1 block text-sm font-medium text-gray-300"
              >
                Number of Days
              </label>
              <input
                id="addsub-days"
                type="number"
                min={0}
                value={daysToAddSub}
                onChange={(e) =>
                  setDaysToAddSub(parseInt(e.target.value, 10) || 0)
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Operation
              </label>
              <div className="flex overflow-hidden rounded-lg border border-gray-700">
                <button
                  type="button"
                  onClick={() => setAddSubMode("add")}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    addSubMode === "add"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-900 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setAddSubMode("subtract")}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    addSubMode === "subtract"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-900 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Subtract
                </button>
              </div>
            </div>
          </div>

          {addSubResult && (
            <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900 p-4 text-center">
              <p className="text-sm text-gray-400">Resulting Date</p>
              <p className="mt-1 text-2xl font-bold text-orange-400">
                {addSubResult.resultDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {formatDate(addSubResult.resultDate)}
              </p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
