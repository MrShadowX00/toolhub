"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Gender = "male" | "female";
type UnitSystem = "metric" | "imperial";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";
type Goal = "maintain" | "lose" | "gain";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (office job, little exercise)",
  light: "Lightly Active (1-3 days/week)",
  moderate: "Moderately Active (3-5 days/week)",
  active: "Active (6-7 days/week)",
  veryActive: "Very Active (hard exercise daily)",
};

const GOAL_LABELS: Record<Goal, string> = {
  maintain: "Maintain Weight",
  lose: "Lose Weight (-500 cal/day)",
  gain: "Gain Weight (+500 cal/day)",
};

export default function TdeeCalculatorTool() {
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
  const [goal, setGoal] = useState<Goal>("maintain");

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
    let bmrMifflin: number;
    if (gender === "male") {
      bmrMifflin = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum + 5;
    } else {
      bmrMifflin = 10 * weightInKg + 6.25 * heightInCm - 5 * ageNum - 161;
    }

    // Harris-Benedict (revised)
    let bmrHarris: number;
    if (gender === "male") {
      bmrHarris = 88.362 + 13.397 * weightInKg + 4.799 * heightInCm - 5.677 * ageNum;
    } else {
      bmrHarris = 447.593 + 9.247 * weightInKg + 3.098 * heightInCm - 4.330 * ageNum;
    }

    const multiplier = ACTIVITY_MULTIPLIERS[activity];
    const tdeeMifflin = bmrMifflin * multiplier;
    const tdeeHarris = bmrHarris * multiplier;

    const goalOffset = goal === "lose" ? -500 : goal === "gain" ? 500 : 0;
    const targetMifflin = tdeeMifflin + goalOffset;
    const targetHarris = tdeeHarris + goalOffset;

    // Breakdown by activity for visualization
    const exerciseCals = tdeeMifflin - bmrMifflin;
    const neatCals = bmrMifflin * 0.15; // ~15% NEAT
    const tefCals = tdeeMifflin * 0.1;  // ~10% TEF
    const restBmr = bmrMifflin - neatCals;

    return {
      bmrMifflin: Math.round(bmrMifflin),
      bmrHarris: Math.round(bmrHarris),
      tdeeMifflin: Math.round(tdeeMifflin),
      tdeeHarris: Math.round(tdeeHarris),
      targetMifflin: Math.round(targetMifflin),
      targetHarris: Math.round(targetHarris),
      breakdown: {
        basalMetabolism: Math.round(restBmr),
        neat: Math.round(neatCals),
        tef: Math.round(tefCals),
        exercise: Math.round(exerciseCals),
      },
      multiplier,
    };
  }, [unit, gender, age, weightKg, weightLbs, heightCm, heightFt, heightIn, activity, goal]);

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
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

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Age</label>
            <input type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} placeholder="e.g. 25" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Weight {unit === "metric" ? "(kg)" : "(lbs)"}</label>
            <input
              type="number" min="0" step="0.1"
              value={unit === "metric" ? weightKg : weightLbs}
              onChange={(e) => (unit === "metric" ? setWeightKg(e.target.value) : setWeightLbs(e.target.value))}
              className={inputClass}
              placeholder={unit === "metric" ? "e.g. 70" : "e.g. 154"}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Height {unit === "metric" ? "(cm)" : "(ft / in)"}</label>
            {unit === "metric" ? (
              <input type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className={inputClass} placeholder="e.g. 175" />
            ) : (
              <div className="flex gap-2">
                <input type="number" min="0" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className={inputClass} placeholder="ft" />
                <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className={inputClass} placeholder="in" />
              </div>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Activity Level</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)} className={inputClass}>
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((key) => (
                <option key={key} value={key}>{ACTIVITY_LABELS[key]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Goal */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">Goal</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  goal === g
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-gray-700 bg-gray-900 text-gray-400 hover:text-white"
                }`}
              >
                {g === "maintain" ? "Maintain" : g === "lose" ? "Lose Weight" : "Gain Weight"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* TDEE Comparison */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
              Your TDEE Results
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Mifflin-St Jeor */}
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-5">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-indigo-400">Mifflin-St Jeor</p>
                <p className="text-4xl font-bold text-indigo-400">{results.tdeeMifflin.toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-500">cal/day (BMR: {results.bmrMifflin})</p>
                <div className="mt-3 rounded-md border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">
                  <p className="text-xs text-gray-400">Target ({goal})</p>
                  <p className="text-lg font-bold text-white">{results.targetMifflin.toLocaleString()} cal/day</p>
                </div>
              </div>
              {/* Harris-Benedict */}
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-5">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-purple-400">Harris-Benedict</p>
                <p className="text-4xl font-bold text-purple-400">{results.tdeeHarris.toLocaleString()}</p>
                <p className="mt-1 text-xs text-gray-500">cal/day (BMR: {results.bmrHarris})</p>
                <div className="mt-3 rounded-md border border-purple-500/20 bg-purple-500/5 px-3 py-2">
                  <p className="text-xs text-gray-400">Target ({goal})</p>
                  <p className="text-lg font-bold text-white">{results.targetHarris.toLocaleString()} cal/day</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calorie Breakdown Visual */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
              Calorie Breakdown (Mifflin-St Jeor)
            </h3>
            <div className="space-y-3">
              {[
                { label: "Basal Metabolism", value: results.breakdown.basalMetabolism, color: "bg-blue-500", textColor: "text-blue-400" },
                { label: "NEAT (Non-Exercise Activity)", value: results.breakdown.neat, color: "bg-green-500", textColor: "text-green-400" },
                { label: "TEF (Thermic Effect of Food)", value: results.breakdown.tef, color: "bg-yellow-500", textColor: "text-yellow-400" },
                { label: "Exercise Activity", value: results.breakdown.exercise, color: "bg-red-500", textColor: "text-red-400" },
              ].map((item) => {
                const pct = results.tdeeMifflin > 0 ? (item.value / results.tdeeMifflin) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-gray-300">{item.label}</span>
                      <span className={item.textColor}>{item.value} cal ({Math.round(pct)}%)</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Levels Comparison */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
              TDEE by Activity Level
            </h3>
            <div className="space-y-2">
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => {
                const tdee = Math.round(results.bmrMifflin * ACTIVITY_MULTIPLIERS[level]);
                const isActive = level === activity;
                const maxTdee = results.bmrMifflin * 1.9;
                const pct = (tdee / maxTdee) * 100;
                return (
                  <div key={level} className={`rounded-lg p-3 ${isActive ? "border border-indigo-500/30 bg-indigo-500/10" : ""}`}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className={isActive ? "font-medium text-indigo-400" : "text-gray-400"}>
                        {ACTIVITY_LABELS[level]}
                        {isActive && " (you)"}
                      </span>
                      <span className={isActive ? "font-bold text-indigo-400" : "text-gray-300"}>{tdee.toLocaleString()} cal</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isActive ? "bg-indigo-500" : "bg-gray-600"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulas */}
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-400">Formulas Used</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <p className="font-medium text-white">Mifflin-St Jeor (recommended):</p>
                <p>Men: 10W + 6.25H - 5A + 5 | Women: 10W + 6.25H - 5A - 161</p>
              </div>
              <div>
                <p className="font-medium text-white">Harris-Benedict (revised):</p>
                <p>Men: 88.362 + 13.397W + 4.799H - 5.677A</p>
                <p>Women: 447.593 + 9.247W + 3.098H - 4.330A</p>
              </div>
              <p className="text-gray-500">W = weight(kg), H = height(cm), A = age(years)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
