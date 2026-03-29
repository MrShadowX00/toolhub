"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  approximateHeartbeats: number;
  daysUntilNextBirthday: number;
  dayOfWeekBorn: string;
  wikipediaLink: string;
}

function calculateAge(birthDate: Date): AgeResult {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const birth = new Date(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  // Exact age in years, months, days
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Total days lived
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.floor(
    (today.getTime() - birth.getTime()) / msPerDay
  );
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  const approximateHeartbeats = totalMinutes * 70;

  // Next birthday countdown
  let nextBirthday = new Date(
    today.getFullYear(),
    birth.getMonth(),
    birth.getDate()
  );
  if (nextBirthday <= today) {
    nextBirthday = new Date(
      today.getFullYear() + 1,
      birth.getMonth(),
      birth.getDate()
    );
  }
  const daysUntilNextBirthday = Math.ceil(
    (nextBirthday.getTime() - today.getTime()) / msPerDay
  );

  // Day of week born
  const dayOfWeekBorn = birth.toLocaleDateString("en-US", {
    weekday: "long",
  });

  // Wikipedia link
  const monthName = birth.toLocaleDateString("en-US", { month: "long" });
  const dayOfMonth = birth.getDate();
  const wikipediaLink = `https://en.wikipedia.org/wiki/${monthName}_${dayOfMonth}`;

  return {
    years,
    months,
    days,
    totalDays,
    totalHours,
    totalMinutes,
    approximateHeartbeats,
    daysUntilNextBirthday,
    dayOfWeekBorn,
    wikipediaLink,
  };
}

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
}

function StatCard({ label, value, subtext }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {subtext && <p className="mt-1 text-xs text-gray-500">{subtext}</p>}
    </div>
  );
}

export default function AgeCalculatorTool() {
  const t = useTranslations("toolUi");
  const [dateString, setDateString] = useState("");

  const result = useMemo<AgeResult | null>(() => {
    if (!dateString) return null;
    const parsed = new Date(dateString + "T00:00:00");
    if (isNaN(parsed.getTime())) return null;
    if (parsed > new Date()) return null;
    return calculateAge(parsed);
  }, [dateString]);

  return (
      <div className="space-y-8">
        {/* Date Input */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <label
            htmlFor="dob"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            {t("dateOfBirth")}
          </label>
          <input
            id="dob"
            type="date"
            value={dateString}
            onChange={(e) => setDateString(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500 [color-scheme:dark]"
          />
        </div>

        {result && (
          <>
            {/* Primary Age Display */}
            <div className="rounded-xl border border-orange-500/30 bg-gray-900 p-6 text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-orange-400">
                {t("yourAge")}
              </p>
              <p className="mt-2 text-4xl font-bold text-white">
                <span className="text-orange-400">{result.years}</span> {t("years").toLowerCase()},{" "}
                <span className="text-orange-400">{result.months}</span> {t("months").toLowerCase()},{" "}
                <span className="text-orange-400">{result.days}</span> {t("days").toLowerCase()}
              </p>
              <p className="mt-3 text-sm text-gray-400">
                {t("youWereBornOn")}{" "}
                <span className="font-semibold text-amber-300">
                  {result.dayOfWeekBorn}
                </span>
              </p>
            </div>

            {/* Next Birthday */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 text-center">
              <p className="text-sm font-medium text-gray-400">
                {t("nextBirthdayIn")}
              </p>
              <p className="mt-1 text-3xl font-bold text-amber-400">
                {result.daysUntilNextBirthday === 365 ||
                result.daysUntilNextBirthday === 366
                  ? t("todayHappyBirthday")
                  : `${result.daysUntilNextBirthday} ${t("days").toLowerCase()}`}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                label={t("totalDaysLived")}
                value={result.totalDays.toLocaleString()}
                subtext={t("sinceYourBirthday")}
              />
              <StatCard
                label={t("totalHoursLived")}
                value={result.totalHours.toLocaleString()}
                subtext={t("approximate")}
              />
              <StatCard
                label={t("totalMinutesLived")}
                value={result.totalMinutes.toLocaleString()}
                subtext={t("approximate")}
              />
              <StatCard
                label={t("approximateHeartbeats")}
                value={result.approximateHeartbeats.toLocaleString()}
                subtext={t("basedOnHeartRate")}
              />
              <StatCard
                label={t("monthsLived")}
                value={(result.years * 12 + result.months).toLocaleString()}
              />
              <StatCard
                label={t("weeksLived")}
                value={Math.floor(result.totalDays / 7).toLocaleString()}
              />
            </div>

            {/* Wikipedia Link */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 text-center">
              <p className="text-sm text-gray-400">
                {t("curiousAboutBirthday")}
              </p>
              <a
                href={result.wikipediaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                {t("viewOnWikipedia")}
              </a>
            </div>
          </>
        )}
      </div>
  );
}
