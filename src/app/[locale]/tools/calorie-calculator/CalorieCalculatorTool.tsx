"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Gender = "male" | "female";
type UnitSystem = "metric" | "imperial";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Lightly Active (1-3 days/week)",
  moderate: "Moderately Active (3-5 days/week)",
  active: "Active (6-7 days/week)",
  veryActive: "Very Active (hard exercise daily)",
};

export default function CalorieCalculatorTool() {
  const t = useTranslations("toolUi");
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("25");
  const [weightKg, setWeightKg] = useState("70");
  const [weightLbs, setWeightLbs] = useState("154");
  const [heightCm, setHeightCm] = useState("175");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("9");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");

  const results = useMemo(() => {
    const ageNum = parseFloat(age) || 0;
    if (ageNum <= 0) return null;

    let weightInKg: number;
    let heightInCm: number;

    if (unit === "metric") {
      weightInKg = parseFloat(weightKg) || 0;
      heightInCm = parseFloat(heightCm) || 0;
    } else {
      weightInKg = (parseFloat(weightLbs) || 0) * 0.453592;
      const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      heightInCm = totalInches * 2.54;
    }

    if (weightInKg <= 0 || heightInCm <= 0) return null;

    // Mifflin-St Jeor
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum - 161;
    }

    const tdee = bmr * ACTIVITY_MULTIPLIERS[activity];
    const weightLoss = tdee - 500;
    const weightGain = tdee + 500;

    // Macros for maintenance (balanced: 30% protein, 40% carbs, 30% fat)
    const proteinCals = tdee * 0.3;
    const carbsCals = tdee * 0.4;
    const fatCals = tdee * 0.3;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      weightLoss: Math.round(weightLoss),
      weightGain: Math.round(weightGain),
      macros: {
        protein: Math.round(proteinCals / 4), // 4 cal per gram
        carbs: Math.round(carbsCals / 4),     // 4 cal per gram
        fat: Math.round(fatCals / 9),         // 9 cal per gram
      },
    };
  }, [unit, gender, age, weightKg, weightLbs, heightCm, heightFt, heightIn, activity]);

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";

  return (
    <div className="space-y-6">
      {/* Unit & Gender Toggle */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          {/* Unit Toggle */}
          <div className="inline-flex rounded-lg border border-gray-700 bg-gray-900 p-1">
            <button
              onClick={() => setUnit("metric")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                unit === "metric" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Metric
            </button>
            <button
              onClick={() => setUnit("imperial")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                unit === "imperial" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Imperial
            </button>
          </div>

          {/* Gender Toggle */}
          <div className="inline-flex rounded-lg border border-gray-700 bg-gray-900 p-1">
            <button
              onClick={() => setGender("male")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                gender === "male" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender("female")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                gender === "female" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Female
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Age */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Age</label>
            <input
              type="number"
              min="1"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={inputClass}
              placeholder="e.g. 25"
            />
          </div>

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
              onChange={(e) => (unit === "metric" ? setWeightKg(e.target.value) : setWeightLbs(e.target.value))}
              className={inputClass}
              placeholder={unit === "metric" ? "e.g. 70" : "e.g. 154"}
            />
          </div>

          {/* Height */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Height {unit === "metric" ? "(cm)" : "(ft / in)"}
            </label>
            {unit === "metric" ? (
              <input
                type="number"
                min="0"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className={inputClass}
                placeholder="e.g. 175"
              />
            ) : (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  className={inputClass}
                  placeholder="ft"
                />
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  className={inputClass}
                  placeholder="in"
                />
              </div>
            )}
          </div>

          {/* Activity Level */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Activity Level</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              className={inputClass}
            >
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((key) => (
                <option key={key} value={key}>
                  {ACTIVITY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Calorie Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 text-center">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">BMR</p>
              <p className="text-3xl font-bold text-white">{results.bmr.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500">cal/day</p>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 text-center">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-indigo-400">Maintenance</p>
              <p className="text-3xl font-bold text-indigo-400">{results.tdee.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500">cal/day</p>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-green-400">Weight Loss</p>
              <p className="text-3xl font-bold text-green-400">{results.weightLoss.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500">cal/day (-500)</p>
            </div>
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-5 text-center">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-orange-400">Weight Gain</p>
              <p className="text-3xl font-bold text-orange-400">{results.weightGain.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500">cal/day (+500)</p>
            </div>
          </div>

          {/* Macros Breakdown */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
              Daily Macros (Maintenance)
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-center">
                <p className="text-xs text-gray-400">Protein (30%)</p>
                <p className="text-2xl font-bold text-blue-400">{results.macros.protein}g</p>
                <p className="text-xs text-gray-500">{Math.round(results.macros.protein * 4)} cal</p>
              </div>
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
                <p className="text-xs text-gray-400">Carbs (40%)</p>
                <p className="text-2xl font-bold text-yellow-400">{results.macros.carbs}g</p>
                <p className="text-xs text-gray-500">{Math.round(results.macros.carbs * 4)} cal</p>
              </div>
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
                <p className="text-xs text-gray-400">Fat (30%)</p>
                <p className="text-2xl font-bold text-red-400">{results.macros.fat}g</p>
                <p className="text-xs text-gray-500">{Math.round(results.macros.fat * 9)} cal</p>
              </div>
            </div>

            {/* Macros bar */}
            <div className="mt-4 flex h-4 overflow-hidden rounded-full">
              <div className="bg-blue-500" style={{ width: "30%" }} />
              <div className="bg-yellow-500" style={{ width: "40%" }} />
              <div className="bg-red-500" style={{ width: "30%" }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Protein 30%</span>
              <span>Carbs 40%</span>
              <span>Fat 30%</span>
            </div>
          </div>

          {/* Formula Info */}
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-400">
              Mifflin-St Jeor Formula
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <span className="font-medium text-white">Men:</span> BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age + 5
              </p>
              <p>
                <span className="font-medium text-white">Women:</span> BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age - 161
              </p>
              <p className="mt-3 text-gray-400">
                TDEE = BMR x Activity Multiplier ({ACTIVITY_MULTIPLIERS[activity]})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
