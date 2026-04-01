"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check } from "lucide-react";

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function getComplementary(hsl: HSL): string {
  return hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
}

function getAnalogous(hsl: HSL): string[] {
  return [
    hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
  ];
}

function getTriadic(hsl: HSL): string[] {
  return [
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ];
}

export default function ColorPickerTool() {
  const t = useTranslations("toolUi");

  const [hex, setHex] = useState("#6366f1");
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const complementary = getComplementary(hsl);
  const analogous = getAnalogous(hsl);
  const triadic = getTriadic(hsl);

  const hexStr = hex.toUpperCase();
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const handleColorChange = useCallback((newHex: string) => {
    setHex(newHex);
    setRecentColors((prev) => {
      const updated = [newHex, ...prev.filter((c) => c !== newHex)];
      return updated.slice(0, 12);
    });
  }, []);

  const handleHexInput = (val: string) => {
    // Allow typing by always updating
    if (!val.startsWith("#")) val = "#" + val;
    if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
      if (val.length === 7) {
        handleColorChange(val);
      }
    }
  };

  const copyText = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const textColor = hsl.l > 55 ? "#000000" : "#ffffff";

  const inputCls = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none";
  const labelCls = "block text-sm font-medium text-gray-400 mb-1";
  const btnCls = "bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors";

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyText(text, field)}
      className="shrink-0 text-gray-400 hover:text-white transition-colors p-1"
    >
      {copiedField === field ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
    </button>
  );

  const ColorSwatch = ({ color, label, onClick }: { color: string; label?: string; onClick?: () => void }) => (
    <button
      onClick={onClick || (() => handleColorChange(color))}
      className="flex flex-col items-center gap-1 group"
    >
      <div
        className="w-12 h-12 rounded-lg border border-gray-700 cursor-pointer group-hover:scale-110 transition-transform shadow-lg"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-500 font-mono">{color.toUpperCase()}</span>
      {label && <span className="text-xs text-gray-600">{label}</span>}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Picker and Preview */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-5">
          <h3 className="text-lg font-semibold text-white">Pick a Color</h3>

          {/* Color input */}
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={hex}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-700 bg-transparent"
            />
            <div className="flex-1 space-y-2">
              <label className={labelCls}>HEX</label>
              <input
                className={inputCls}
                value={hex}
                onChange={(e) => handleHexInput(e.target.value)}
                maxLength={7}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Large preview swatch */}
          <div
            className="w-full h-32 rounded-xl flex items-center justify-center text-lg font-semibold border border-gray-700"
            style={{ backgroundColor: hex, color: textColor }}
          >
            {hexStr}
          </div>

          {/* Color values */}
          <div className="space-y-2">
            {[
              { label: "HEX", value: hexStr, field: "hex" },
              { label: "RGB", value: rgbStr, field: "rgb" },
              { label: "HSL", value: hslStr, field: "hsl" },
            ].map((item) => (
              <div key={item.field} className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg p-2">
                <span className="text-xs text-gray-500 font-semibold w-10 shrink-0">{item.label}</span>
                <code className="flex-1 text-sm text-gray-200 font-mono">{item.value}</code>
                <CopyBtn text={item.value} field={item.field} />
              </div>
            ))}
          </div>

          {/* RGB Sliders */}
          <div className="space-y-2">
            <label className={labelCls}>RGB Sliders</label>
            {[
              { label: "R", value: rgb.r, color: "red" },
              { label: "G", value: rgb.g, color: "green" },
              { label: "B", value: rgb.b, color: "blue" },
            ].map((ch) => (
              <div key={ch.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-4 font-semibold">{ch.label}</span>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={ch.value}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const newRgb = { ...rgb, [ch.label.toLowerCase()]: val };
                    const newHex = `#${newRgb.r.toString(16).padStart(2, "0")}${newRgb.g.toString(16).padStart(2, "0")}${newRgb.b.toString(16).padStart(2, "0")}`;
                    handleColorChange(newHex);
                  }}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-xs text-gray-400 w-8 text-right font-mono">{ch.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Color harmonies and Recent */}
        <div className="space-y-6">
          {/* Complementary */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Color Harmonies</h3>

            <div>
              <label className={labelCls}>Complementary</label>
              <div className="flex gap-3">
                <ColorSwatch color={hex} />
                <ColorSwatch color={complementary} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Analogous</label>
              <div className="flex gap-3">
                <ColorSwatch color={analogous[0]} />
                <ColorSwatch color={hex} />
                <ColorSwatch color={analogous[1]} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Triadic</label>
              <div className="flex gap-3">
                <ColorSwatch color={hex} />
                <ColorSwatch color={triadic[0]} />
                <ColorSwatch color={triadic[1]} />
              </div>
            </div>

            {/* Shades */}
            <div>
              <label className={labelCls}>Shades</label>
              <div className="flex gap-1">
                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((l) => {
                  const shadeHex = hslToHex(hsl.h, hsl.s, l);
                  return (
                    <button
                      key={l}
                      onClick={() => handleColorChange(shadeHex)}
                      className="flex-1 h-10 rounded cursor-pointer hover:scale-y-125 transition-transform"
                      style={{ backgroundColor: shadeHex }}
                      title={shadeHex.toUpperCase()}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Colors */}
          {recentColors.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-white">Recent Colors</h3>
              <div className="flex flex-wrap gap-2">
                {recentColors.map((c, i) => (
                  <button
                    key={`${c}-${i}`}
                    onClick={() => handleColorChange(c)}
                    className="w-10 h-10 rounded-lg border border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c.toUpperCase()}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
