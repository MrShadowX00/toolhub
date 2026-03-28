"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import { Download, AlertCircle, BarChart3 } from "lucide-react";
import JsBarcode from "jsbarcode";

const FORMATS = [
  { value: "CODE128", label: "CODE128", placeholder: "Any text" },
  { value: "EAN13", label: "EAN-13", placeholder: "12 or 13 digits (e.g. 5901234123457)" },
  { value: "EAN8", label: "EAN-8", placeholder: "7 or 8 digits (e.g. 96385074)" },
  { value: "UPC", label: "UPC-A", placeholder: "11 or 12 digits (e.g. 123456789012)" },
  { value: "CODE39", label: "CODE39", placeholder: "A-Z, 0-9, -.$/+% space" },
  { value: "ITF14", label: "ITF-14", placeholder: "13 or 14 digits" },
] as const;

type FormatType = (typeof FORMATS)[number]["value"];

export default function BarcodeGeneratorPage() {
  const [value, setValue] = useState("Hello World");
  const [format, setFormat] = useState<FormatType>("CODE128");
  const [lineWidth, setLineWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const generateBarcode = useCallback(() => {
    if (!svgRef.current || !value.trim()) {
      setError(null);
      return;
    }
    try {
      JsBarcode(svgRef.current, value, {
        format,
        width: lineWidth,
        height,
        displayValue,
        background: "#1f2937",
        lineColor: "#ffffff",
        margin: 10,
        fontSize: 14,
        fontOptions: "",
        textMargin: 6,
        font: "monospace",
      });
      setError(null);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid input for selected format"
      );
    }
  }, [value, format, lineWidth, height, displayValue]);

  useEffect(() => {
    generateBarcode();
  }, [generateBarcode]);

  const handleDownload = () => {
    if (!svgRef.current || error) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `barcode-${format.toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  };

  const currentFormat = FORMATS.find((f) => f.value === format);

  return (
    <ToolLayout
      title="Barcode Generator"
      description="Generate barcodes in multiple formats including CODE128, EAN, UPC, and more"
      category="Generators"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Panel */}
        <div className="space-y-5">
          {/* Value Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Barcode Value
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={currentFormat?.placeholder}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Format Selector */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Barcode Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as FormatType)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white outline-none focus:border-purple-500"
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {currentFormat?.placeholder}
            </p>
          </div>

          {/* Line Width */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Bar Width: {lineWidth}
            </label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.5}
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>1 (thin)</span>
              <span>4 (thick)</span>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Height: {height}px
            </label>
            <input
              type="range"
              min={50}
              max={200}
              step={10}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>50px</span>
              <span>200px</span>
            </div>
          </div>

          {/* Display Value Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-4 py-3">
            <span className="text-sm text-gray-300">Show text under barcode</span>
            <button
              onClick={() => setDisplayValue(!displayValue)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                displayValue ? "bg-purple-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  displayValue ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-800 bg-red-900/30 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!value.trim() || !!error}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col items-center">
          <div className="w-full overflow-auto rounded-xl border border-gray-700 bg-gray-800 p-6">
            {value.trim() && !error ? (
              <div className="flex justify-center">
                <svg ref={svgRef} />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="mx-auto mb-2 h-12 w-12" />
                  <p className="text-sm">
                    {error ? "Fix errors to see preview" : "Enter a value to generate barcode"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
