"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ui/ToolLayout";

type CompoundFrequency = "daily" | "monthly" | "quarterly" | "annually";

interface YearRow {
  year: number;
  balance: number;
  totalContributions: number;
  interestThisYear: number;
  totalInterest: number;
}

interface ChartPoint {
  year: number;
  compoundBalance: number;
  simpleBalance: number;
  contributionsPortion: number;
}

const frequencyMap: Record<CompoundFrequency, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CompoundInterestPage() {
  const [principal, setPrincipal] = useState<string>("10000");
  const [annualRate, setAnnualRate] = useState<string>("7");
  const [frequency, setFrequency] = useState<CompoundFrequency>("monthly");
  const [years, setYears] = useState<string>("10");
  const [monthlyContribution, setMonthlyContribution] = useState<string>("200");

  const results = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const n = frequencyMap[frequency];
    const t = parseInt(years) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;

    if (t <= 0 || t > 100) {
      return null;
    }

    // Year-by-year table
    const yearRows: YearRow[] = [];
    const chartPoints: ChartPoint[] = [
      {
        year: 0,
        compoundBalance: P,
        simpleBalance: P,
        contributionsPortion: P,
      },
    ];

    let runningBalance = P;
    let totalContributions = P;
    let totalInterest = 0;

    for (let y = 1; y <= t; y++) {
      const balanceStart = runningBalance;

      // Calculate compound interest balance for this year
      // Each compounding period within the year
      const periodsThisYear = n;
      const ratePerPeriod = r / n;

      // Contributions per compounding period
      // Monthly contribution spread across compounding periods
      const contributionPerPeriod = (PMT * 12) / n;

      let balance = balanceStart;
      for (let p = 0; p < periodsThisYear; p++) {
        balance = balance * (1 + ratePerPeriod) + contributionPerPeriod;
      }

      const yearlyContributions = PMT * 12;
      totalContributions += yearlyContributions;
      const interestThisYear = balance - balanceStart - yearlyContributions;
      totalInterest += interestThisYear;
      runningBalance = balance;

      yearRows.push({
        year: y,
        balance: runningBalance,
        totalContributions,
        interestThisYear,
        totalInterest,
      });

      // Simple interest for comparison
      const simpleBalance = P * (1 + r * y) + PMT * 12 * y;

      chartPoints.push({
        year: y,
        compoundBalance: runningBalance,
        simpleBalance,
        contributionsPortion: totalContributions,
      });
    }

    const finalAmount = runningBalance;
    const totalInterestEarned = totalInterest;

    return {
      finalAmount,
      totalInterestEarned,
      totalContributions,
      yearRows,
      chartPoints,
    };
  }, [principal, annualRate, frequency, years, monthlyContribution]);

  // SVG chart dimensions
  const chartWidth = 700;
  const chartHeight = 350;
  const padding = { top: 20, right: 20, bottom: 40, left: 80 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const chartSvg = useMemo(() => {
    if (!results || results.chartPoints.length < 2) return null;

    const points = results.chartPoints;
    const maxY = Math.max(
      ...points.map((p) => Math.max(p.compoundBalance, p.simpleBalance))
    );
    const maxX = points[points.length - 1].year;

    const scaleX = (x: number) =>
      padding.left + (x / maxX) * innerWidth;
    const scaleY = (y: number) =>
      padding.top + innerHeight - (y / maxY) * innerHeight;

    // Compound balance area path
    const compoundAreaPath =
      points.map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.year)},${scaleY(p.compoundBalance)}`).join(" ") +
      ` L${scaleX(maxX)},${scaleY(0)} L${scaleX(0)},${scaleY(0)} Z`;

    // Contributions area path
    const contributionsAreaPath =
      points.map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.year)},${scaleY(p.contributionsPortion)}`).join(" ") +
      ` L${scaleX(maxX)},${scaleY(0)} L${scaleX(0)},${scaleY(0)} Z`;

    // Simple interest line path
    const simpleLinePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.year)},${scaleY(p.simpleBalance)}`)
      .join(" ");

    // Compound interest line path (top edge)
    const compoundLinePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.year)},${scaleY(p.compoundBalance)}`)
      .join(" ");

    // Y-axis ticks
    const yTicks: number[] = [];
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      yTicks.push((maxY / tickCount) * i);
    }

    // X-axis ticks
    const xStep = Math.max(1, Math.ceil(maxX / 10));
    const xTicks: number[] = [];
    for (let i = 0; i <= maxX; i += xStep) {
      xTicks.push(i);
    }
    if (xTicks[xTicks.length - 1] !== maxX) {
      xTicks.push(maxX);
    }

    return {
      compoundAreaPath,
      contributionsAreaPath,
      simpleLinePath,
      compoundLinePath,
      yTicks,
      xTicks,
      scaleX,
      scaleY,
    };
  }, [results, innerWidth, innerHeight, padding.left, padding.top]);

  return (
    <ToolLayout
      title="Compound Interest Calculator"
      description="Calculate compound interest with regular contributions and visualize growth"
      category="Calculators"
    >
      <div className="space-y-6">
        {/* Inputs */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Input Parameters</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Principal ($)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="10000"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Annual Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="7"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Compound Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as CompoundFrequency)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Years
              </label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="10"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Monthly Contribution ($)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="200"
              />
            </div>
          </div>
        </div>

        {results && (
          <>
            {/* Summary Results */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
                <p className="text-sm font-medium text-gray-300">Final Amount</p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {formatCurrency(results.finalAmount)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
                <p className="text-sm font-medium text-gray-300">Total Interest Earned</p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">
                  {formatCurrency(results.totalInterestEarned)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
                <p className="text-sm font-medium text-gray-300">Total Contributions</p>
                <p className="mt-1 text-2xl font-bold text-orange-400">
                  {formatCurrency(results.totalContributions)}
                </p>
              </div>
            </div>

            {/* Chart */}
            {chartSvg && (
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Growth Over Time — Compound vs Simple Interest
                </h2>
                <div className="overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full min-w-[500px]"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Grid lines */}
                    {chartSvg.yTicks.map((tick) => (
                      <line
                        key={`grid-${tick}`}
                        x1={padding.left}
                        y1={chartSvg.scaleY(tick)}
                        x2={padding.left + innerWidth}
                        y2={chartSvg.scaleY(tick)}
                        stroke="#374151"
                        strokeWidth={0.5}
                      />
                    ))}

                    {/* Compound interest area (interest portion) */}
                    <path
                      d={chartSvg.compoundAreaPath}
                      fill="#065f4620"
                      stroke="none"
                    />

                    {/* Contributions area */}
                    <path
                      d={chartSvg.contributionsAreaPath}
                      fill="#f9731630"
                      stroke="none"
                    />

                    {/* Simple interest line */}
                    <path
                      d={chartSvg.simpleLinePath}
                      fill="none"
                      stroke="#9ca3af"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                    />

                    {/* Compound interest line */}
                    <path
                      d={chartSvg.compoundLinePath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth={2.5}
                    />

                    {/* Y-axis labels */}
                    {chartSvg.yTicks.map((tick) => (
                      <text
                        key={`y-${tick}`}
                        x={padding.left - 8}
                        y={chartSvg.scaleY(tick) + 4}
                        textAnchor="end"
                        fill="#9ca3af"
                        fontSize={11}
                      >
                        ${(tick / 1000).toFixed(0)}k
                      </text>
                    ))}

                    {/* X-axis labels */}
                    {chartSvg.xTicks.map((tick) => (
                      <text
                        key={`x-${tick}`}
                        x={chartSvg.scaleX(tick)}
                        y={padding.top + innerHeight + 25}
                        textAnchor="middle"
                        fill="#9ca3af"
                        fontSize={11}
                      >
                        Yr {tick}
                      </text>
                    ))}

                    {/* Axis lines */}
                    <line
                      x1={padding.left}
                      y1={padding.top}
                      x2={padding.left}
                      y2={padding.top + innerHeight}
                      stroke="#4b5563"
                      strokeWidth={1}
                    />
                    <line
                      x1={padding.left}
                      y1={padding.top + innerHeight}
                      x2={padding.left + innerWidth}
                      y2={padding.top + innerHeight}
                      stroke="#4b5563"
                      strokeWidth={1}
                    />
                  </svg>
                </div>
                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-6 rounded bg-emerald-500" />
                    <span className="text-gray-300">Compound Interest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-6 rounded border border-dashed border-gray-400 bg-transparent" />
                    <span className="text-gray-300">Simple Interest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-6 rounded bg-orange-500/30" />
                    <span className="text-gray-300">Contributions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-6 rounded bg-emerald-900/40" />
                    <span className="text-gray-300">Interest Earned</span>
                  </div>
                </div>
              </div>
            )}

            {/* Year-by-Year Table */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Year-by-Year Growth
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-left">
                      <th className="px-3 py-2 font-medium text-gray-300">Year</th>
                      <th className="px-3 py-2 font-medium text-gray-300">Balance</th>
                      <th className="px-3 py-2 font-medium text-gray-300">
                        Total Contributions
                      </th>
                      <th className="px-3 py-2 font-medium text-gray-300">
                        Interest (Year)
                      </th>
                      <th className="px-3 py-2 font-medium text-gray-300">
                        Total Interest
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.yearRows.map((row) => (
                      <tr
                        key={row.year}
                        className="border-b border-gray-800 transition-colors hover:bg-gray-800/50"
                      >
                        <td className="px-3 py-2 text-white">{row.year}</td>
                        <td className="px-3 py-2 font-medium text-emerald-400">
                          {formatCurrency(row.balance)}
                        </td>
                        <td className="px-3 py-2 text-orange-400">
                          {formatCurrency(row.totalContributions)}
                        </td>
                        <td className="px-3 py-2 text-gray-300">
                          {formatCurrency(row.interestThisYear)}
                        </td>
                        <td className="px-3 py-2 text-emerald-300">
                          {formatCurrency(row.totalInterest)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!results && (
          <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/50 py-16 text-center">
            <p className="text-gray-500">
              Enter valid parameters above to see results.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
