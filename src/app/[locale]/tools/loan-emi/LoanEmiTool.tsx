"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function LoanEmiTool() {
  const t = useTranslations("toolUi");
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(8);
  const [termValue, setTermValue] = useState<number>(5);
  const [termUnit, setTermUnit] = useState<"years" | "months">("years");

  const totalMonths = termUnit === "years" ? termValue * 12 : termValue;
  const monthlyRate = annualRate / 100 / 12;

  const emi = useMemo(() => {
    if (loanAmount <= 0 || totalMonths <= 0 || annualRate < 0) return 0;
    if (annualRate === 0) return loanAmount / totalMonths;
    const r = monthlyRate;
    const n = totalMonths;
    const factor = Math.pow(1 + r, n);
    return (loanAmount * r * factor) / (factor - 1);
  }, [loanAmount, monthlyRate, totalMonths, annualRate]);

  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  const amortization = useMemo((): AmortizationRow[] => {
    if (emi <= 0) return [];
    const rows: AmortizationRow[] = [];
    let balance = loanAmount;
    for (let m = 1; m <= totalMonths; m++) {
      const interestPortion = balance * monthlyRate;
      const principalPortion = emi - interestPortion;
      balance = Math.max(0, balance - principalPortion);
      rows.push({
        month: m,
        payment: emi,
        principal: principalPortion,
        interest: interestPortion,
        balance,
      });
    }
    return rows;
  }, [emi, loanAmount, totalMonths, monthlyRate]);

  // Pie chart calculations
  const principalPercent =
    totalPayment > 0 ? (loanAmount / totalPayment) * 100 : 50;
  const interestPercent = 100 - principalPercent;

  // SVG pie chart using stroke-dasharray technique
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const principalDash = (principalPercent / 100) * circumference;
  const interestDash = (interestPercent / 100) * circumference;

  const downloadCSV = () => {
    const headers = [
      t("month"),
      t("payment"),
      t("principal"),
      t("totalInterest"),
      t("remainingBalance"),
    ];
    const csvRows = [
      headers.join(","),
      ...amortization.map((row) =>
        [
          row.month,
          row.payment.toFixed(2),
          row.principal.toFixed(2),
          row.interest.toFixed(2),
          row.balance.toFixed(2),
        ].join(",")
      ),
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "amortization_schedule.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
      <div className="space-y-8">
        {/* Input Section */}
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">
            {t("loanDetails")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Loan Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                {t("loanAmountDollar")}
              </label>
              <input
                type="number"
                min={0}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="100000"
              />
            </div>

            {/* Interest Rate */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                {t("interestRatePerYear")}
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="8"
              />
            </div>

            {/* Loan Term */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                {t("loanTerm")}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={termValue}
                  onChange={(e) => setTermValue(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="5"
                />
                <button
                  onClick={() =>
                    setTermUnit((u) => (u === "years" ? "months" : "years"))
                  }
                  className="shrink-0 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm font-medium text-orange-400 transition-colors hover:bg-gray-700"
                >
                  {termUnit === "years" ? t("years") : t("months")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {emi > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 text-center">
                <p className="text-sm font-medium text-gray-400">
                  {t("monthlyEmi")}
                </p>
                <p className="mt-2 text-3xl font-bold text-orange-400">
                  {formatCurrency(emi)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 text-center">
                <p className="text-sm font-medium text-gray-400">
                  {t("totalPayment")}
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {formatCurrency(totalPayment)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 text-center">
                <p className="text-sm font-medium text-gray-400">
                  {t("totalInterest")}
                </p>
                <p className="mt-2 text-3xl font-bold text-red-400">
                  {formatCurrency(totalInterest)}
                </p>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
              <h2 className="mb-6 text-xl font-semibold text-white">
                {t("principalVsInterest")}
              </h2>
              <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 180 180"
                  className="shrink-0"
                >
                  {/* Interest (background circle) */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="30"
                    strokeDasharray={`${interestDash} ${circumference}`}
                    strokeDashoffset={0}
                    transform="rotate(-90 90 90)"
                  />
                  {/* Principal (foreground arc) */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="30"
                    strokeDasharray={`${principalDash} ${circumference}`}
                    strokeDashoffset={0}
                    transform={`rotate(${
                      -90 + (interestPercent / 100) * 360
                    } 90 90)`}
                  />
                </svg>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-block h-4 w-4 rounded-sm bg-orange-500" />
                    <span className="text-gray-300">
                      {t("principal")}:{" "}
                      <span className="font-semibold text-white">
                        {formatCurrency(loanAmount)}
                      </span>{" "}
                      <span className="text-gray-400">
                        ({principalPercent.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-block h-4 w-4 rounded-sm bg-red-500" />
                    <span className="text-gray-300">
                      {t("totalInterest")}:{" "}
                      <span className="font-semibold text-white">
                        {formatCurrency(totalInterest)}
                      </span>{" "}
                      <span className="text-gray-400">
                        ({interestPercent.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization Schedule */}
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {t("amortizationSchedule")}
                </h2>
                <button
                  onClick={downloadCSV}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
                >
                  {t("downloadCsv")}
                </button>
              </div>
              <div className="max-h-[500px] overflow-auto rounded-lg border border-gray-700">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-900">
                    <tr className="text-left text-gray-400">
                      <th className="px-4 py-3 font-medium">{t("month")}</th>
                      <th className="px-4 py-3 font-medium">{t("payment")}</th>
                      <th className="px-4 py-3 font-medium">{t("principal")}</th>
                      <th className="px-4 py-3 font-medium">{t("totalInterest")}</th>
                      <th className="px-4 py-3 font-medium">{t("balance")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {amortization.map((row) => (
                      <tr
                        key={row.month}
                        className="text-gray-300 transition-colors hover:bg-gray-700/50"
                      >
                        <td className="px-4 py-2.5">{row.month}</td>
                        <td className="px-4 py-2.5">
                          {formatCurrency(row.payment)}
                        </td>
                        <td className="px-4 py-2.5">
                          {formatCurrency(row.principal)}
                        </td>
                        <td className="px-4 py-2.5">
                          {formatCurrency(row.interest)}
                        </td>
                        <td className="px-4 py-2.5">
                          {formatCurrency(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
  );
}
