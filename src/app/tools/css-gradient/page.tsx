"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import { Copy, Check, Plus, Trash2 } from "lucide-react";

type GradientType = "linear" | "radial" | "conic";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface Preset {
  name: string;
  type: GradientType;
  angle: number;
  stops: { color: string; position: number }[];
}

const PRESETS: Preset[] = [
  { name: "Ocean Blue", type: "linear", angle: 135, stops: [{ color: "#667eea", position: 0 }, { color: "#764ba2", position: 100 }] },
  { name: "Sunset", type: "linear", angle: 90, stops: [{ color: "#f093fb", position: 0 }, { color: "#f5576c", position: 100 }] },
  { name: "Mint", type: "linear", angle: 135, stops: [{ color: "#4facfe", position: 0 }, { color: "#00f2fe", position: 100 }] },
  { name: "Warm Flame", type: "linear", angle: 45, stops: [{ color: "#ff9a9e", position: 0 }, { color: "#fad0c4", position: 100 }] },
  { name: "Night Sky", type: "linear", angle: 180, stops: [{ color: "#0c0d13", position: 0 }, { color: "#1a237e", position: 50 }, { color: "#4a148c", position: 100 }] },
  { name: "Peach", type: "linear", angle: 90, stops: [{ color: "#ffecd2", position: 0 }, { color: "#fcb69f", position: 100 }] },
  { name: "Emerald", type: "linear", angle: 135, stops: [{ color: "#11998e", position: 0 }, { color: "#38ef7d", position: 100 }] },
  { name: "Royal", type: "linear", angle: 135, stops: [{ color: "#6a11cb", position: 0 }, { color: "#2575fc", position: 100 }] },
  { name: "Bloody Mary", type: "linear", angle: 135, stops: [{ color: "#ff512f", position: 0 }, { color: "#dd2476", position: 100 }] },
  { name: "Cosmic", type: "linear", angle: 135, stops: [{ color: "#ff00cc", position: 0 }, { color: "#333399", position: 100 }] },
  { name: "Lush", type: "linear", angle: 135, stops: [{ color: "#56ab2f", position: 0 }, { color: "#a8e063", position: 100 }] },
  { name: "Velvet", type: "radial", angle: 0, stops: [{ color: "#DA22FF", position: 0 }, { color: "#9733EE", position: 100 }] },
  { name: "Fire", type: "linear", angle: 45, stops: [{ color: "#f12711", position: 0 }, { color: "#f5af19", position: 100 }] },
  { name: "Aurora", type: "linear", angle: 135, stops: [{ color: "#00d2ff", position: 0 }, { color: "#3a47d5", position: 50 }, { color: "#d53a9d", position: 100 }] },
  { name: "Rainbow", type: "conic", angle: 0, stops: [{ color: "#ff0000", position: 0 }, { color: "#ff8800", position: 17 }, { color: "#ffff00", position: 33 }, { color: "#00ff00", position: 50 }, { color: "#0088ff", position: 67 }, { color: "#8800ff", position: 83 }, { color: "#ff0000", position: 100 }] },
];

let nextId = 1;
function makeId() {
  return String(nextId++);
}

function makeStops(stops: { color: string; position: number }[]): ColorStop[] {
  return stops.map((s) => ({ id: makeId(), color: s.color, position: s.position }));
}

export default function CSSGradientPage() {
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>(() =>
    makeStops([
      { color: "#667eea", position: 0 },
      { color: "#764ba2", position: 100 },
    ])
  );
  const [copied, setCopied] = useState(false);

  const cssValue = useMemo(() => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops
      .map((s) => `${s.color} ${s.position}%`)
      .join(", ");

    switch (gradientType) {
      case "linear":
        return `linear-gradient(${angle}deg, ${stopsStr})`;
      case "radial":
        return `radial-gradient(circle, ${stopsStr})`;
      case "conic":
        return `conic-gradient(from ${angle}deg, ${stopsStr})`;
    }
  }, [gradientType, angle, stops]);

  const fullCSS = `background: ${cssValue};`;

  const updateStop = (id: string, updates: Partial<ColorStop>) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const addStop = () => {
    const newPos = stops.length > 0 ? Math.min(100, stops[stops.length - 1].position + 20) : 50;
    setStops((prev) => [...prev, { id: makeId(), color: "#ffffff", position: newPos }]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const applyPreset = (preset: Preset) => {
    setGradientType(preset.type);
    setAngle(preset.angle);
    setStops(makeStops(preset.stops));
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(fullCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="CSS Gradient Generator"
      description="Create beautiful CSS gradients visually with a live preview"
      category="Generators"
    >
      <div className="space-y-6">
        {/* Live Preview */}
        <div
          className="h-52 w-full rounded-xl border border-gray-700"
          style={{ background: cssValue }}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-5">
            {/* Gradient Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Gradient Type
              </label>
              <div className="flex gap-2">
                {(["linear", "radial", "conic"] as GradientType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setGradientType(t)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
                      gradientType === t
                        ? "bg-purple-600 text-white"
                        : "border border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Angle (for linear and conic) */}
            {(gradientType === "linear" || gradientType === "conic") && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Angle: {angle}&deg;
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>0&deg;</span>
                  <span>360&deg;</span>
                </div>
              </div>
            )}

            {/* Color Stops */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Color Stops
                </label>
                <button
                  onClick={addStop}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-purple-400 transition-colors hover:bg-gray-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Stop
                </button>
              </div>
              <div className="space-y-2">
                {stops.map((stop) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2"
                  >
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) =>
                        updateStop(stop.id, { color: e.target.value })
                      }
                      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) =>
                        updateStop(stop.id, { color: e.target.value })
                      }
                      className="w-20 bg-transparent text-xs text-white outline-none"
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) =>
                        updateStop(stop.id, {
                          position: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-purple-500"
                    />
                    <span className="w-10 text-right text-xs text-gray-400">
                      {stop.position}%
                    </span>
                    <button
                      onClick={() => removeStop(stop.id)}
                      disabled={stops.length <= 2}
                      className="text-gray-500 transition-colors hover:text-red-400 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CSS Output */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  CSS Output
                </label>
                <button
                  onClick={copyCSS}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy CSS
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-gray-300">
                <code>{fullCSS}</code>
              </pre>
            </div>
          </div>

          {/* Presets Gallery */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-300">
              Preset Gradients
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((preset, i) => {
                const sortedStops = [...preset.stops].sort(
                  (a, b) => a.position - b.position
                );
                const stopsStr = sortedStops
                  .map((s) => `${s.color} ${s.position}%`)
                  .join(", ");
                let bg: string;
                switch (preset.type) {
                  case "linear":
                    bg = `linear-gradient(${preset.angle}deg, ${stopsStr})`;
                    break;
                  case "radial":
                    bg = `radial-gradient(circle, ${stopsStr})`;
                    break;
                  case "conic":
                    bg = `conic-gradient(from ${preset.angle}deg, ${stopsStr})`;
                    break;
                }
                return (
                  <button
                    key={i}
                    onClick={() => applyPreset(preset)}
                    className="group relative overflow-hidden rounded-lg border border-gray-700 transition-all hover:border-purple-500 hover:ring-1 hover:ring-purple-500"
                  >
                    <div
                      className="h-20 w-full"
                      style={{ background: bg }}
                    />
                    <div className="bg-gray-800/90 px-2 py-1.5">
                      <span className="text-xs text-gray-300">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
