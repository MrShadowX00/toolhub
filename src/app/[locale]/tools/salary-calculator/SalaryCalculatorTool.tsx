"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Period = "hourly" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

const PERIOD_LABELS: Record<Period, string> = {
  hourly: "Hourly",
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export default function SalaryCalculatorTool() {
  const t = useTranslations("toolUi");
  const [amount, setAmount] = useState("50000");
  const [period, setPeriod] = useState<Period>("yearly");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [taxRate, setTaxRate] = useState("0");

  const results = useMemo(() => {
    const salary = parseFloat(amount) || 0;
    if (salary <= 0) return null;

    const hpw = parseFloat(hoursPerWeek) || 40;
    const wpy = parseFloat(weeksPerYear) || 52;
    const tax = parseFloat(taxRate) || 0;

    const hoursPerYear = hpw * wpy;
    const workDaysPerWeek = hpw / 8; // assume 8h days
    const workDaysPerYear = workDaysPerWeek * wpy;

    // Convert input to yearly first
    let yearly: number;
    switch (period) {
      case "hourly":
        yearly = salary * hoursPerYear;
        break;
      case "daily":
        yearly = salary * workDaysPerYear;
        break;
      case "weekly":
        yearly = salary * wpy;
        break;
      case "biweekly":
        yearly = salary * (wpy / 2);
        break;
      case "monthly":
        yearly = salary * 12;
        break;
      case "yearly":
      default:
        yearly = salary;
        break;
    }

    // Convert yearly to all periods
    const conversions: Record<Period, number> = {
      hourly: yearly / hoursPerYear,
      daily: yearly / workDaysPerYear,
      weekly: yearly / wpy,
      biweekly: yearly / (wpy / 2),
      monthly: yearly / 12,
      yearly: yearly,
    };

    // After tax
    const taxMultiplier = 1 - tax / 100;
    const afterTax: Record<Period, number> = {
      hourly: conversions.hourly * taxMultiplier,
      daily: conversions.daily * taxMultiplier,
      weekly: conversions.weekly * taxMultiplier,
      biweekly: conversions.biweekly * taxMultiplier,
      monthly: conversions.monthly * taxMultiplier,
      yearly: conversions.yearly * taxMultiplier,
    };

    return { conversions, afterTax, taxAmount: yearly * (tax / 100) };
  }, [amount, period, hoursPerWeek, weeksPerYear, taxRate]);

  const formatCurrency = (value: number): string => {
    return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Salary Amount */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Salary Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              placeholder="e.g. 50000"
            />
          </div>

          {/* Pay Period */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Pay Period</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className={inputClass}>
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
              ))}
            </select>
          </div>

          {/* Hours Per Week */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Hours Per Week</label>
            <input
              type="number"
              min="1"
              max="168"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              className={inputClass}
              placeholder="40"
            />
          </div>

          {/* Weeks Per Year */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Weeks Per Year</label>
            <input
              type="number"
              min="1"
              max="52"
              value={weeksPerYear}
              onChange={(e) => setWeeksPerYear(e.target.value)}
              className={inputClass}
              placeholder="52"
            />
          </div>

          {/* Tax Rate */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Tax Rate (%) <span className="text-gray-500">- optional</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className={inputClass}
              placeholder="e.g. 25"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results && (
        <div className="space-y-6">
          {/* Conversion Table */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Period</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-400">Gross Pay</th>
                    {parseFloat(taxRate) > 0 && (
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-400">After Tax</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => {
                    const isInput = p === period;
                    return (
                      <tr
                        key={p}
                        className={`border-b border-gray-800/50 transition-colors ${
                          isInput ? "bg-indigo-500/10" : "hover:bg-gray-800/30"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${isInput ? "text-indigo-400" : "text-gray-300"}`}>
                            {PERIOD_LABELS[p]}
                            {isInput && <span className="ml-2 text-xs text-indigo-500">(input)</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-semibold ${isInput ? "text-indigo-400" : "text-white"}`}>
                            {formatCurrency(results.conversions[p])}
                          </span>
                        </td>
                        {parseFloat(taxRate) > 0 && (
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-semibold text-green-400">
                              {formatCurrency(results.afterTax[p])}
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 text-center">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-indigo-400">Annual Gross</p>
              <p className="text-2xl font-bold text-indigo-400">{formatCurrency(results.conversions.yearly)}</p>
            </div>
            {parseFloat(taxRate) > 0 && (
              <>
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-center">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-red-400">Annual Tax ({taxRate}%)</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(results.taxAmount)}</p>
                </div>
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-green-400">Annual Net</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(results.afterTax.yearly)}</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">Quick Stats</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3">
                <span className="text-sm text-gray-400">Per Hour</span>
                <span className="text-sm font-semibold text-white">{formatCurrency(results.conversions.hourly)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3">
                <span className="text-sm text-gray-400">Per Day</span>
                <span className="text-sm font-semibold text-white">{formatCurrency(results.conversions.daily)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3">
                <span className="text-sm text-gray-400">Per Month</span>
                <span className="text-sm font-semibold text-white">{formatCurrency(results.conversions.monthly)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3">
                <span className="text-sm text-gray-400">Per Year</span>
                <span className="text-sm font-semibold text-white">{formatCurrency(results.conversions.yearly)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
