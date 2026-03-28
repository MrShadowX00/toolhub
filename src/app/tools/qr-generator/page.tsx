"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import { Download, QrCode } from "lucide-react";
import QRCode from "qrcode";

const ERROR_LEVELS = [
  { value: "L", label: "Low (7%)" },
  { value: "M", label: "Medium (15%)" },
  { value: "Q", label: "Quartile (25%)" },
  { value: "H", label: "High (30%)" },
] as const;

type ErrorLevel = "L" | "M" | "Q" | "H";

export default function QRGeneratorPage() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(300);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = useCallback(async () => {
    if (!canvasRef.current || !text.trim()) return;
    try {
      await QRCode.toCanvas(canvasRef.current, text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
    } catch {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "#ef4444";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Invalid input", size / 2, size / 2);
      }
    }
  }, [text, size, errorLevel, fgColor, bgColor]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate QR codes for any text or URL with customizable colors and sizes"
      category="Generators"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Panel */}
        <div className="space-y-5">
          {/* Text Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Text or URL
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="Enter text or URL..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Size Slider */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Size: {size}px
            </label>
            <input
              type="range"
              min={100}
              max={1000}
              step={10}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>100px</span>
              <span>1000px</span>
            </div>
          </div>

          {/* Error Correction Level */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Error Correction Level
            </label>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as ErrorLevel)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none focus:border-purple-500"
            >
              {ERROR_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Foreground Color
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Background Color
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!text.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col items-center">
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            {text.trim() ? (
              <canvas ref={canvasRef} className="max-w-full rounded" />
            ) : (
              <div
                className="flex items-center justify-center rounded bg-gray-900"
                style={{ width: size, height: size, maxWidth: "100%" }}
              >
                <div className="text-center text-gray-500">
                  <QrCode className="mx-auto mb-2 h-12 w-12" />
                  <p className="text-sm">Enter text to generate QR code</p>
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-sm text-gray-500">
            {size} x {size} pixels
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
