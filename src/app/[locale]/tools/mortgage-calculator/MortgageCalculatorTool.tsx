"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface AmortizationRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

interface PaymentBreakdown {
  principalAndInterest: number;
  tax: number;
  insurance: number;
  hoa: number;
  total: number;
}

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fmtFull = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function PieChart({
  breakdown,
  labels,
}: {
  breakdown: PaymentBreakdown;
  labels: { principalAndInterest: string; propertyTax: string; insurance: string; hoa: string; perMonth: string };
}) {
  const segments: { label: string; value: number; color: string }[] = [
    { label: labels.principalAndInterest, value: breakdown.principalAndInterest, color: "#f97316" },
    { label: labels.propertyTax, value: breakdown.tax, color: "#3b82f6" },
    { label: labels.insurance, value: breakdown.insurance, color: "#10b981" },
    { label: labels.hoa, value: breakdown.hoa, color: "#8b5cf6" },
  ].filter((s) => s.value > 0);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  const cx = 100;
  const cy = 100;
  const r = 80;

  let cumulativeAngle = -90;
  const paths = segments.map((segment) => {
    const fraction = segment.value / total;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const d =
      fraction >= 0.9999
        ? `M ${cx - r},${cy} A ${r},${r} 0 1,1 ${cx + r},${cy} A ${r},${r} 0 1,1 ${cx - r},${cy}`
        : `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;

    return (
      <path key={segment.label} d={d} fill={segment.color} stroke="#1f2937" strokeWidth="1" />
    );
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 200" className="h-48 w-48">
        {paths}
        <circle cx={cx} cy={cy} r={40} fill="#111827" />
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
        >
          {fmt.format(total)}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" fontSize="8">
          {labels.perMonth}
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MortgageCalculatorTool() {
  const t = useTranslations("toolUi");
  const [homePrice, setHomePrice] = useState<number>(400000);
  const [downPaymentValue, setDownPaymentValue] = useState<number>(20);
  const [downPaymentMode, setDownPaymentMode] = useState<"percent" | "dollar">("percent");
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [propertyTaxYear, setPropertyTaxYear] = useState<number>(4800);
  const [hoaMonth, setHoaMonth] = useState<number>(0);
  const [insuranceYear, setInsuranceYear] = useState<number>(1500);

  const downPaymentDollars = useMemo(() => {
    return downPaymentMode === "percent"
      ? (homePrice * downPaymentValue) / 100
      : downPaymentValue;
  }, [homePrice, downPaymentValue, downPaymentMode]);

  const loanAmount = useMemo(() => {
    return Math.max(0, homePrice - downPaymentDollars);
  }, [homePrice, downPaymentDollars]);

  const monthlyPayment = useMemo((): PaymentBreakdown => {
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    let principalAndInterest = 0;
    if (loanAmount > 0 && monthlyRate > 0) {
      principalAndInterest =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else if (loanAmount > 0 && monthlyRate === 0) {
      principalAndInterest = loanAmount / numPayments;
    }

    const tax = propertyTaxYear / 12;
    const insurance = insuranceYear / 12;
    const hoa = hoaMonth;

    return {
      principalAndInterest,
      tax,
      insurance,
      hoa,
      total: principalAndInterest + tax + insurance + hoa,
    };
  }, [loanAmount, interestRate, loanTerm, propertyTaxYear, insuranceYear, hoaMonth]);

  const totalInterest = useMemo(() => {
    const totalPaid = monthlyPayment.principalAndInterest * loanTerm * 12;
    return Math.max(0, totalPaid - loanAmount);
  }, [monthlyPayment.principalAndInterest, loanTerm, loanAmount]);

  const amortization = useMemo((): AmortizationRow[] => {
    const rows: AmortizationRow[] = [];
    const monthlyRate = interestRate / 100 / 12;
    let balance = loanAmount;

    for (let year = 1; year <= loanTerm; year++) {
      let yearPrincipal = 0;
      let yearInterest = 0;

      for (let month = 0; month < 12; month++) {
        if (balance <= 0) break;
        const interestPayment = balance * monthlyRate;
        const principalPayment = Math.min(
          monthlyPayment.principalAndInterest - interestPayment,
          balance
        );
        yearPrincipal += principalPayment;
        yearInterest += interestPayment;
        balance -= principalPayment;
      }

      rows.push({
        year,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        remainingBalance: Math.max(0, balance),
      });
    }

    return rows;
  }, [loanAmount, interestRate, loanTerm, monthlyPayment.principalAndInterest]);

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500";

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-300";

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-6 rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white">{t("loanDetails")}</h2>

          <div>
            <label className={labelClass}>{t("homePrice")}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                className={inputClass + " pl-7"}
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("downPayment")}</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                {downPaymentMode === "dollar" && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                )}
                <input
                  type="number"
                  className={inputClass + (downPaymentMode === "dollar" ? " pl-7" : "")}
                  value={downPaymentValue}
                  onChange={(e) => setDownPaymentValue(Number(e.target.value))}
                  min={0}
                />
                {downPaymentMode === "percent" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    %
                  </span>
                )}
              </div>
              <div className="flex overflow-hidden rounded-lg border border-gray-700">
                <button
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    downPaymentMode === "percent"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setDownPaymentMode("percent")}
                >
                  %
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    downPaymentMode === "dollar"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setDownPaymentMode("dollar")}
                >
                  $
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {t("downPaymentLabel")} {fmt.format(downPaymentDollars)} (
              {homePrice > 0 ? ((downPaymentDollars / homePrice) * 100).toFixed(1) : "0"}%)
            </p>
          </div>

          <div>
            <label className={labelClass}>{t("loanTerm")}</label>
            <div className="flex gap-2">
              {[15, 20, 30].map((term) => (
                <button
                  key={term}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    loanTerm === term
                      ? "border-orange-500 bg-orange-500/10 text-orange-400"
                      : "border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setLoanTerm(term)}
                >
                  {t("yearsUnit", { count: term })}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("interestRatePercent")}</label>
            <div className="relative">
              <input
                type="number"
                className={inputClass}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                min={0}
                max={30}
                step={0.125}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>{t("propertyTaxYear")}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  className={inputClass + " pl-7"}
                  value={propertyTaxYear}
                  onChange={(e) => setPropertyTaxYear(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t("hoaMonth")}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  className={inputClass + " pl-7"}
                  value={hoaMonth}
                  onChange={(e) => setHoaMonth(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>{t("insuranceYear")}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  className={inputClass + " pl-7"}
                  value={insuranceYear}
                  onChange={(e) => setInsuranceYear(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Monthly Payment Summary */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">{t("monthlyPayment")}</h2>
            <div className="mb-6 text-center">
              <span className="text-4xl font-bold text-orange-400">
                {fmtFull.format(monthlyPayment.total)}
              </span>
              <span className="text-gray-400"> {t("perMonth")}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
                  <span className="text-sm text-gray-300">{t("principalAndInterest")}</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {fmtFull.format(monthlyPayment.principalAndInterest)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-300">{t("propertyTax")}</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {fmtFull.format(monthlyPayment.tax)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-300">{t("insurance")}</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {fmtFull.format(monthlyPayment.insurance)}
                </span>
              </div>
              {monthlyPayment.hoa > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-violet-500" />
                    <span className="text-sm text-gray-300">{t("hoa")}</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {fmtFull.format(monthlyPayment.hoa)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">{t("paymentBreakdown")}</h2>
            <PieChart
              breakdown={monthlyPayment}
              labels={{
                principalAndInterest: t("principalAndInterest"),
                propertyTax: t("propertyTax"),
                insurance: t("insurance"),
                hoa: t("hoa"),
                perMonth: t("perMonth"),
              }}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
              <p className="text-sm text-gray-400">{t("loanAmount")}</p>
              <p className="mt-1 text-xl font-bold text-white">{fmt.format(loanAmount)}</p>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
              <p className="text-sm text-gray-400">{t("totalInterest")}</p>
              <p className="mt-1 text-xl font-bold text-orange-400">
                {fmt.format(totalInterest)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
              <p className="text-sm text-gray-400">{t("totalCost")}</p>
              <p className="mt-1 text-xl font-bold text-white">
                {fmt.format(loanAmount + totalInterest)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
              <p className="text-sm text-gray-400">{t("payoffDate")}</p>
              <p className="mt-1 text-xl font-bold text-white">
                {new Date(
                  new Date().getFullYear() + loanTerm,
                  new Date().getMonth()
                ).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule */}
      <div className="mt-8 rounded-xl border border-gray-700 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">{t("amortizationSchedule")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="px-4 py-3 font-medium text-gray-400">{t("year")}</th>
                <th className="px-4 py-3 text-right font-medium text-gray-400">
                  {t("principalPaid")}
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-400">
                  {t("interestPaid")}
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-400">
                  {t("remainingBalance")}
                </th>
              </tr>
            </thead>
            <tbody>
              {amortization.map((row) => {
                const principalPercent =
                  row.principalPaid + row.interestPaid > 0
                    ? (row.principalPaid / (row.principalPaid + row.interestPaid)) * 100
                    : 0;
                return (
                  <tr
                    key={row.year}
                    className="border-b border-gray-800 transition-colors hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 text-white">{row.year}</td>
                    <td className="px-4 py-3 text-right text-emerald-400">
                      {fmt.format(row.principalPaid)}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-400">
                      {fmt.format(row.interestPaid)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-gray-700 sm:block">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{ width: `${principalPercent}%` }}
                          />
                        </div>
                        <span className="text-white">{fmt.format(row.remainingBalance)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
