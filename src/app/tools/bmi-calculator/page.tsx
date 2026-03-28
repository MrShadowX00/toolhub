"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ui/ToolLayout";

type UnitSystem = "metric" | "imperial";

interface BmiCategory {
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

const BMI_CATEGORIES: BmiCategory[] = [
  {
    label: "Underweight",
    min: 0,
    max: 18.5,
    color: "text-blue-400",
    bgColor: "bg-blue-500",
    borderColor: "border-blue-500",
  },
  {
    label: "Normal",
    min: 18.5,
    max: 24.9,
    color: "text-green-400",
    bgColor: "bg-green-500",
    borderColor: "border-green-500",
  },
  {
    label: "Overweight",
    min: 25,
    max: 29.9,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-500",
  },
  {
    label: "Obese",
    min: 30,
    max: 50,
    color: "text-red-400",
    bgColor: "bg-red-500",
    borderColor: "border-red-500",
  },
];

function getCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return BMI_CATEGORIES[0];
  if (bmi < 25) return BMI_CATEGORIES[1];
  if (bmi < 30) return BMI_CATEGORIES[2];
  return BMI_CATEGORIES[3];
}

function getNeedlePosition(bmi: number): number {
  // Scale: 10 to 40, mapped to 0% - 100%
  const clamped = Math.max(10, Math.min(40, bmi));
  return ((clamped - 10) / 30) * 100;
}

function getCategoryWidth(cat: BmiCategory): number {
  const scaleMin = 10;
  const scaleMax = 40;
  const catMin = Math.max(cat.min, scaleMin);
  const catMax = Math.min(cat.max, scaleMax);
  return ((catMax - catMin) / (scaleMax - scaleMin)) * 100;
}

export default function BmiCalculatorPage() {
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [weightKg, setWeightKg] = useState<string>("70");
  const [weightLbs, setWeightLbs] = useState<string>("154");
  const [heightCm, setHeightCm] = useState<string>("175");
  const [heightFt, setHeightFt] = useState<string>("5");
  const [heightIn, setHeightIn] = useState<string>("9");

  const bmiResult = useMemo(() => {
    let weightInKg: number;
    let heightInM: number;

    if (unit === "metric") {
      weightInKg = parseFloat(weightKg) || 0;
      heightInM = (parseFloat(heightCm) || 0) / 100;
    } else {
      weightInKg = (parseFloat(weightLbs) || 0) * 0.453592;
      const totalInches =
        (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      heightInM = totalInches * 0.0254;
    }

    if (weightInKg <= 0 || heightInM <= 0) return null;

    const bmi = weightInKg / (heightInM * heightInM);
    const category = getCategory(bmi);

    // Healthy weight range (BMI 18.5 - 24.9)
    const healthyMin = 18.5 * heightInM * heightInM;
    const healthyMax = 24.9 * heightInM * heightInM;

    return {
      bmi,
      category,
      healthyMinKg: healthyMin,
      healthyMaxKg: healthyMax,
      heightInM,
    };
  }, [unit, weightKg, weightLbs, heightCm, heightFt, heightIn]);

  const formatWeight = (kg: number): string => {
    if (unit === "metric") {
      return `${kg.toFixed(1)} kg`;
    }
    return `${(kg * 2.20462).toFixed(1)} lbs`;
  };

  return (
    <ToolLayout
      title="BMI Calculator"
      description="Calculate your Body Mass Index and find your healthy weight range"
      category="Calculators"
    >
      <div className="space-y-6">
        {/* Unit Toggle */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex rounded-lg border border-gray-700 bg-gray-800 p-1">
              <button
                onClick={() => setUnit("metric")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  unit === "metric"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Metric (kg/cm)
              </button>
              <button
                onClick={() => setUnit("imperial")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  unit === "imperial"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Imperial (lbs/ft)
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Weight */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Weight {unit === "metric" ? "(kg)" : "(lbs)"}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={unit === "metric" ? weightKg : weightLbs}
                onChange={(e) =>
                  unit === "metric"
                    ? setWeightKg(e.target.value)
                    : setWeightLbs(e.target.value)
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-lg text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500"
                placeholder={unit === "metric" ? "e.g. 70" : "e.g. 154"}
              />
            </div>

            {/* Height */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Height{" "}
                {unit === "metric" ? "(cm)" : "(ft / in)"}
              </label>
              {unit === "metric" ? (
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-lg text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500"
                  placeholder="e.g. 175"
                />
              ) : (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-lg text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500"
                      placeholder="ft"
                    />
                    <span className="mt-1 block text-center text-xs text-gray-500">
                      feet
                    </span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      step="1"
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-lg text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500"
                      placeholder="in"
                    />
                    <span className="mt-1 block text-center text-xs text-gray-500">
                      inches
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {bmiResult && (
          <div className="space-y-6">
            {/* BMI Value */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 text-center">
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-400">
                Your BMI
              </p>
              <p
                className={`text-5xl font-bold transition-all duration-300 ${bmiResult.category.color}`}
              >
                {bmiResult.bmi.toFixed(1)}
              </p>
              <p
                className={`mt-2 text-lg font-semibold ${bmiResult.category.color}`}
              >
                {bmiResult.category.label}
              </p>
            </div>

            {/* Visual Scale */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
                BMI Scale
              </h3>

              {/* Scale Bar */}
              <div className="relative mb-2">
                {/* Category bars */}
                <div className="flex h-8 overflow-hidden rounded-lg">
                  {BMI_CATEGORIES.map((cat) => (
                    <div
                      key={cat.label}
                      className={`${cat.bgColor} flex items-center justify-center text-xs font-semibold text-white transition-opacity duration-200`}
                      style={{ width: `${getCategoryWidth(cat)}%` }}
                    >
                      <span className="hidden sm:inline">{cat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Needle */}
                <div
                  className="absolute -top-1 transition-all duration-500 ease-out"
                  style={{
                    left: `${getNeedlePosition(bmiResult.bmi)}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-0.5 bg-white shadow-lg" />
                    <div className="mt-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-gray-900">
                      {bmiResult.bmi.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scale labels */}
              <div className="mt-8 flex text-xs text-gray-500">
                <div style={{ width: `${getCategoryWidth(BMI_CATEGORIES[0])}%` }} className="text-center">
                  &lt;18.5
                </div>
                <div style={{ width: `${getCategoryWidth(BMI_CATEGORIES[1])}%` }} className="text-center">
                  18.5-24.9
                </div>
                <div style={{ width: `${getCategoryWidth(BMI_CATEGORIES[2])}%` }} className="text-center">
                  25-29.9
                </div>
                <div style={{ width: `${getCategoryWidth(BMI_CATEGORIES[3])}%` }} className="text-center">
                  30+
                </div>
              </div>

              {/* Category Legend (mobile) */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
                {BMI_CATEGORIES.map((cat) => (
                  <div key={cat.label} className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${cat.bgColor}`} />
                    <span className="text-xs text-gray-400">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Healthy Weight Range */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-400">
                Healthy Weight Range for Your Height
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
                  <p className="text-xs text-gray-400">Min</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatWeight(bmiResult.healthyMinKg)}
                  </p>
                </div>
                <div className="text-gray-600">-</div>
                <div className="flex-1 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
                  <p className="text-xs text-gray-400">Max</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatWeight(bmiResult.healthyMaxKg)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-center text-sm text-gray-500">
                Based on BMI range of 18.5 - 24.9 for a height of{" "}
                {unit === "metric"
                  ? `${(bmiResult.heightInM * 100).toFixed(0)} cm`
                  : `${heightFt}'${heightIn}"`}
              </p>
            </div>
          </div>
        )}

        {/* BMI Limitations */}
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yellow-400">
            BMI Limitations
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="mt-0.5 text-yellow-500">&#8226;</span>
              BMI does not distinguish between muscle mass and fat mass. Athletes
              with high muscle mass may have a high BMI despite low body fat.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-yellow-500">&#8226;</span>
              BMI does not account for age, sex, ethnicity, or body composition
              differences that may affect health risk.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-yellow-500">&#8226;</span>
              BMI is a screening tool, not a diagnostic measure. Consult a
              healthcare professional for a complete health assessment.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-yellow-500">&#8226;</span>
              For children and teens, BMI is interpreted differently using
              age- and sex-specific percentiles.
            </li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
