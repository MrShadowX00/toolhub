"use client";

import { useState } from "react";

function formatResult(value: number): string {
  if (!isFinite(value)) return "—";
  const rounded = Math.round(value * 1e6) / 1e6;
  if (Number.isInteger(rounded)) return rounded.toString();
  return parseFloat(rounded.toFixed(4)).toString();
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs text-gray-400">{label}</label>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      />
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 rounded-lg bg-gray-900 p-3">
      <span className="text-sm text-gray-400">{label} </span>
      <span className="text-lg font-bold text-orange-400">{value}</span>
    </div>
  );
}

// 1. X is what % of Y?
function WhatPercent() {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const xn = parseFloat(x);
  const yn = parseFloat(y);
  const result =
    x !== "" && y !== "" && yn !== 0
      ? formatResult((xn / yn) * 100) + "%"
      : "—";

  return (
    <Card title="X is what % of Y?">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="X" value={x} onChange={setX} placeholder="e.g. 25" />
        <InputField label="Y" value={y} onChange={setY} placeholder="e.g. 200" />
      </div>
      <Result label="Result:" value={result} />
    </Card>
  );
}

// 2. X% of Y = ?
function PercentOf() {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const xn = parseFloat(x);
  const yn = parseFloat(y);
  const result =
    x !== "" && y !== "" ? formatResult((xn / 100) * yn) : "—";

  return (
    <Card title="X% of Y = ?">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="X (%)" value={x} onChange={setX} placeholder="e.g. 15" />
        <InputField label="Y" value={y} onChange={setY} placeholder="e.g. 200" />
      </div>
      <Result label="Result:" value={result} />
    </Card>
  );
}

// 3. X is Y% of what?
function PercentOfWhat() {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const xn = parseFloat(x);
  const yn = parseFloat(y);
  const result =
    x !== "" && y !== "" && yn !== 0
      ? formatResult((xn / yn) * 100)
      : "—";

  return (
    <Card title="X is Y% of what?">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="X" value={x} onChange={setX} placeholder="e.g. 30" />
        <InputField label="Y (%)" value={y} onChange={setY} placeholder="e.g. 25" />
      </div>
      <Result label="Base number:" value={result} />
    </Card>
  );
}

// 4. Percentage change from X to Y
function PercentChange() {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const xn = parseFloat(x);
  const yn = parseFloat(y);
  let result = "—";
  let direction = "";
  if (x !== "" && y !== "" && xn !== 0) {
    const change = ((yn - xn) / Math.abs(xn)) * 100;
    result = formatResult(Math.abs(change)) + "%";
    if (change > 0) direction = "increase";
    else if (change < 0) direction = "decrease";
    else direction = "no change";
  }

  return (
    <Card title="Percentage Change from X to Y">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="From (X)" value={x} onChange={setX} placeholder="e.g. 100" />
        <InputField label="To (Y)" value={y} onChange={setY} placeholder="e.g. 150" />
      </div>
      <div className="mt-4 rounded-lg bg-gray-900 p-3 flex items-center gap-3">
        <div>
          <span className="text-sm text-gray-400">Change: </span>
          <span className="text-lg font-bold text-orange-400">{result}</span>
        </div>
        {direction && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              direction === "increase"
                ? "bg-green-500/15 text-green-400"
                : direction === "decrease"
                  ? "bg-red-500/15 text-red-400"
                  : "bg-gray-700 text-gray-300"
            }`}
          >
            {direction === "increase"
              ? "\u2191 Increase"
              : direction === "decrease"
                ? "\u2193 Decrease"
                : "No change"}
          </span>
        )}
      </div>
    </Card>
  );
}

// 5. Add/Remove X% from Y
function AddRemovePercent() {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [mode, setMode] = useState<"add" | "subtract">("add");
  const xn = parseFloat(x);
  const yn = parseFloat(y);
  const result =
    x !== "" && y !== ""
      ? formatResult(
          mode === "add" ? yn + (xn / 100) * yn : yn - (xn / 100) * yn
        )
      : "—";

  return (
    <Card title="Add / Remove X% from Y">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode("add")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "add"
              ? "bg-orange-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Add
        </button>
        <button
          onClick={() => setMode("subtract")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "subtract"
              ? "bg-orange-500 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Subtract
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField label="X (%)" value={x} onChange={setX} placeholder="e.g. 10" />
        <InputField label="Y" value={y} onChange={setY} placeholder="e.g. 200" />
      </div>
      <Result
        label={mode === "add" ? "After adding:" : "After subtracting:"}
        value={result}
      />
    </Card>
  );
}

export default function PercentageCalculatorTool() {
  return (
      <div className="grid gap-6 md:grid-cols-2">
        <WhatPercent />
        <PercentOf />
        <PercentOfWhat />
        <PercentChange />
        <AddRemovePercent />
      </div>
  );
}
