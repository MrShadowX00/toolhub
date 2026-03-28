"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import { Upload, Copy, Check, ImageIcon } from "lucide-react";

interface ColorInfo {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  count: number;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function colorDistance(
  a: [number, number, number],
  b: [number, number, number]
): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

function extractColors(imageData: ImageData, numColors: number): ColorInfo[] {
  const pixels: [number, number, number][] = [];
  const data = imageData.data;

  // Sample pixels (skip for performance)
  const step = Math.max(1, Math.floor(data.length / 4 / 10000));
  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;
    pixels.push([r, g, b]);
  }

  if (pixels.length === 0) return [];

  // K-means++ initialization
  const centroids: [number, number, number][] = [];
  centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);

  for (let c = 1; c < numColors; c++) {
    const distances = pixels.map((p) => {
      const minDist = Math.min(
        ...centroids.map((cent) => colorDistance(p, cent))
      );
      return minDist * minDist;
    });
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalDist;
    let idx = 0;
    for (let i = 0; i < distances.length; i++) {
      rand -= distances[i];
      if (rand <= 0) {
        idx = i;
        break;
      }
    }
    centroids.push(pixels[idx]);
  }

  // K-means iterations
  for (let iter = 0; iter < 20; iter++) {
    const clusters: [number, number, number][][] = Array.from(
      { length: numColors },
      () => []
    );

    for (const pixel of pixels) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let c = 0; c < centroids.length; c++) {
        const dist = colorDistance(pixel, centroids[c]);
        if (dist < minDist) {
          minDist = dist;
          minIdx = c;
        }
      }
      clusters[minIdx].push(pixel);
    }

    let converged = true;
    for (let c = 0; c < numColors; c++) {
      if (clusters[c].length === 0) continue;
      const newCentroid: [number, number, number] = [0, 0, 0];
      for (const p of clusters[c]) {
        newCentroid[0] += p[0];
        newCentroid[1] += p[1];
        newCentroid[2] += p[2];
      }
      newCentroid[0] = Math.round(newCentroid[0] / clusters[c].length);
      newCentroid[1] = Math.round(newCentroid[1] / clusters[c].length);
      newCentroid[2] = Math.round(newCentroid[2] / clusters[c].length);

      if (colorDistance(centroids[c], newCentroid) > 1) {
        converged = false;
      }
      centroids[c] = newCentroid;
    }

    if (converged) break;
  }

  // Count assignments
  const counts = new Array(numColors).fill(0);
  for (const pixel of pixels) {
    let minDist = Infinity;
    let minIdx = 0;
    for (let c = 0; c < centroids.length; c++) {
      const dist = colorDistance(pixel, centroids[c]);
      if (dist < minDist) {
        minDist = dist;
        minIdx = c;
      }
    }
    counts[minIdx]++;
  }

  return centroids
    .map((c, i) => ({
      hex: rgbToHex(c[0], c[1], c[2]),
      rgb: c as [number, number, number],
      hsl: rgbToHsl(c[0], c[1], c[2]),
      count: counts[i],
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

function getHarmonyColors(
  h: number,
  s: number,
  l: number
): { name: string; colors: string[] }[] {
  return [
    {
      name: "Complementary",
      colors: [hslToHex(h, s, l), hslToHex((h + 180) % 360, s, l)],
    },
    {
      name: "Triadic",
      colors: [
        hslToHex(h, s, l),
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
      ],
    },
    {
      name: "Analogous",
      colors: [
        hslToHex((h - 30 + 360) % 360, s, l),
        hslToHex(h, s, l),
        hslToHex((h + 30) % 360, s, l),
      ],
    },
    {
      name: "Split Complementary",
      colors: [
        hslToHex(h, s, l),
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
      ],
    },
    {
      name: "Tetradic",
      colors: [
        hslToHex(h, s, l),
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
      ],
    },
  ];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-700 hover:text-white"
      title="Copy"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

export default function ColorPalettePage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [harmonies, setHarmonies] = useState<
    { name: string; colors: string[] }[]
  >([]);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback((src: string) => {
    setExtracting(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 400;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setExtracting(false);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const extracted = extractColors(imageData, 8);
      setColors(extracted);

      if (extracted.length > 0) {
        const [h, s, l] = extracted[0].hsl;
        setHarmonies(getHarmonyColors(h, s, l));
      } else {
        setHarmonies([]);
      }
      setExtracting(false);
    };
    img.onerror = () => setExtracting(false);
    img.src = src;
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageSrc(result);
      processImage(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <ToolLayout
      title="Color Palette Extractor"
      description="Extract dominant colors from images and generate harmonious palettes"
      category="Generators"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/50 py-12 transition-colors hover:border-purple-500/50"
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Uploaded"
              className="mb-3 max-h-48 rounded-lg object-contain"
            />
          ) : (
            <Upload className="mb-3 h-10 w-10 text-gray-500" />
          )}
          <p className="text-sm text-gray-400">
            {imageSrc ? "Click to upload a different image" : "Click to upload an image"}
          </p>
          <p className="mt-1 text-xs text-gray-500">PNG, JPG, WebP, etc.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {extracting && (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            <span className="ml-3 text-sm text-gray-400">
              Extracting colors...
            </span>
          </div>
        )}

        {/* Dominant Colors */}
        {colors.length > 0 && !extracting && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">
              Dominant Colors
            </h3>
            {/* Palette bar */}
            <div className="mb-4 flex h-16 overflow-hidden rounded-xl">
              {colors.map((c, i) => {
                const totalCount = colors.reduce((sum, cl) => sum + cl.count, 0);
                const width = Math.max((c.count / totalCount) * 100, 5);
                return (
                  <div
                    key={i}
                    style={{ backgroundColor: c.hex, width: `${width}%` }}
                    className="transition-all"
                    title={c.hex}
                  />
                );
              })}
            </div>
            {/* Color Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {colors.map((c, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800"
                >
                  <div
                    className="h-20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="space-y-1.5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white">
                        {c.hex.toUpperCase()}
                      </span>
                      <CopyButton text={c.hex} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        rgb({c.rgb.join(", ")})
                      </span>
                      <CopyButton text={`rgb(${c.rgb.join(", ")})`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        hsl({c.hsl[0]}, {c.hsl[1]}%, {c.hsl[2]}%)
                      </span>
                      <CopyButton
                        text={`hsl(${c.hsl[0]}, ${c.hsl[1]}%, ${c.hsl[2]}%)`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Harmony Palettes */}
        {harmonies.length > 0 && !extracting && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">
              Color Harmonies
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Based on the dominant color{" "}
              <span
                className="inline-block h-3 w-3 rounded-sm align-middle"
                style={{ backgroundColor: colors[0]?.hex }}
              />{" "}
              <span className="font-mono text-xs">
                {colors[0]?.hex.toUpperCase()}
              </span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {harmonies.map((harmony) => (
                <div
                  key={harmony.name}
                  className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800"
                >
                  <div className="flex h-16">
                    {harmony.colors.map((color, j) => (
                      <div
                        key={j}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="p-3">
                    <h4 className="mb-2 text-sm font-medium text-white">
                      {harmony.name}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {harmony.colors.map((color, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-1 rounded bg-gray-900 px-2 py-1"
                        >
                          <div
                            className="h-3 w-3 rounded-sm"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-mono text-xs text-gray-300">
                            {color.toUpperCase()}
                          </span>
                          <CopyButton text={color} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!imageSrc && !extracting && (
          <div className="flex flex-col items-center py-12 text-center">
            <ImageIcon className="mb-3 h-16 w-16 text-gray-700" />
            <p className="text-gray-500">
              Upload an image to extract its color palette
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
