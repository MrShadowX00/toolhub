"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, RotateCcw } from "lucide-react";

const TAILWIND_CSS_MAP: Record<string, string> = {
  // Spacing
  "p-0": "padding: 0;", "p-1": "padding: 0.25rem;", "p-2": "padding: 0.5rem;",
  "p-3": "padding: 0.75rem;", "p-4": "padding: 1rem;", "p-5": "padding: 1.25rem;",
  "p-6": "padding: 1.5rem;", "p-8": "padding: 2rem;", "p-10": "padding: 2.5rem;",
  "px-1": "padding-left: 0.25rem; padding-right: 0.25rem;",
  "px-2": "padding-left: 0.5rem; padding-right: 0.5rem;",
  "px-3": "padding-left: 0.75rem; padding-right: 0.75rem;",
  "px-4": "padding-left: 1rem; padding-right: 1rem;",
  "px-6": "padding-left: 1.5rem; padding-right: 1.5rem;",
  "px-8": "padding-left: 2rem; padding-right: 2rem;",
  "py-1": "padding-top: 0.25rem; padding-bottom: 0.25rem;",
  "py-2": "padding-top: 0.5rem; padding-bottom: 0.5rem;",
  "py-3": "padding-top: 0.75rem; padding-bottom: 0.75rem;",
  "py-4": "padding-top: 1rem; padding-bottom: 1rem;",
  "m-0": "margin: 0;", "m-1": "margin: 0.25rem;", "m-2": "margin: 0.5rem;",
  "m-3": "margin: 0.75rem;", "m-4": "margin: 1rem;", "m-auto": "margin: auto;",
  "mx-auto": "margin-left: auto; margin-right: auto;",
  "mt-2": "margin-top: 0.5rem;", "mt-4": "margin-top: 1rem;",
  "mb-2": "margin-bottom: 0.5rem;", "mb-4": "margin-bottom: 1rem;",
  // Width/Height
  "w-full": "width: 100%;", "w-auto": "width: auto;", "w-1/2": "width: 50%;",
  "w-1/3": "width: 33.333%;", "w-2/3": "width: 66.667%;",
  "h-full": "height: 100%;", "h-auto": "height: auto;", "h-screen": "height: 100vh;",
  "min-h-screen": "min-height: 100vh;", "max-w-md": "max-width: 28rem;",
  "max-w-lg": "max-width: 32rem;", "max-w-xl": "max-width: 36rem;",
  // Display
  "block": "display: block;", "inline-block": "display: inline-block;",
  "inline": "display: inline;", "flex": "display: flex;", "grid": "display: grid;",
  "hidden": "display: none;",
  // Flex
  "flex-row": "flex-direction: row;", "flex-col": "flex-direction: column;",
  "flex-wrap": "flex-wrap: wrap;", "flex-1": "flex: 1 1 0%;",
  "items-center": "align-items: center;", "items-start": "align-items: flex-start;",
  "items-end": "align-items: flex-end;",
  "justify-center": "justify-content: center;", "justify-between": "justify-content: space-between;",
  "justify-start": "justify-content: flex-start;", "justify-end": "justify-content: flex-end;",
  "gap-1": "gap: 0.25rem;", "gap-2": "gap: 0.5rem;", "gap-3": "gap: 0.75rem;",
  "gap-4": "gap: 1rem;", "gap-6": "gap: 1.5rem;", "gap-8": "gap: 2rem;",
  // Grid
  "grid-cols-1": "grid-template-columns: repeat(1, minmax(0, 1fr));",
  "grid-cols-2": "grid-template-columns: repeat(2, minmax(0, 1fr));",
  "grid-cols-3": "grid-template-columns: repeat(3, minmax(0, 1fr));",
  "grid-cols-4": "grid-template-columns: repeat(4, minmax(0, 1fr));",
  // Text
  "text-xs": "font-size: 0.75rem; line-height: 1rem;",
  "text-sm": "font-size: 0.875rem; line-height: 1.25rem;",
  "text-base": "font-size: 1rem; line-height: 1.5rem;",
  "text-lg": "font-size: 1.125rem; line-height: 1.75rem;",
  "text-xl": "font-size: 1.25rem; line-height: 1.75rem;",
  "text-2xl": "font-size: 1.5rem; line-height: 2rem;",
  "text-3xl": "font-size: 1.875rem; line-height: 2.25rem;",
  "text-4xl": "font-size: 2.25rem; line-height: 2.5rem;",
  "text-center": "text-align: center;", "text-left": "text-align: left;",
  "text-right": "text-align: right;",
  "font-bold": "font-weight: 700;", "font-semibold": "font-weight: 600;",
  "font-medium": "font-weight: 500;", "font-normal": "font-weight: 400;",
  "font-light": "font-weight: 300;",
  "italic": "font-style: italic;", "underline": "text-decoration: underline;",
  "uppercase": "text-transform: uppercase;", "lowercase": "text-transform: lowercase;",
  "capitalize": "text-transform: capitalize;",
  "truncate": "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;",
  // Colors
  "text-white": "color: #ffffff;", "text-black": "color: #000000;",
  "text-gray-400": "color: #9ca3af;", "text-gray-500": "color: #6b7280;",
  "text-gray-600": "color: #4b5563;", "text-gray-700": "color: #374151;",
  "text-red-500": "color: #ef4444;", "text-green-500": "color: #22c55e;",
  "text-blue-500": "color: #3b82f6;", "text-indigo-500": "color: #6366f1;",
  "text-yellow-500": "color: #eab308;",
  // Background
  "bg-white": "background-color: #ffffff;", "bg-black": "background-color: #000000;",
  "bg-gray-100": "background-color: #f3f4f6;", "bg-gray-200": "background-color: #e5e7eb;",
  "bg-gray-800": "background-color: #1f2937;", "bg-gray-900": "background-color: #111827;",
  "bg-red-500": "background-color: #ef4444;", "bg-green-500": "background-color: #22c55e;",
  "bg-blue-500": "background-color: #3b82f6;", "bg-blue-600": "background-color: #2563eb;",
  "bg-indigo-500": "background-color: #6366f1;", "bg-indigo-600": "background-color: #4f46e5;",
  "bg-yellow-500": "background-color: #eab308;", "bg-purple-500": "background-color: #a855f7;",
  "bg-pink-500": "background-color: #ec4899;",
  // Border
  "border": "border-width: 1px;", "border-2": "border-width: 2px;",
  "border-0": "border-width: 0;",
  "border-gray-200": "border-color: #e5e7eb;", "border-gray-300": "border-color: #d1d5db;",
  "border-gray-700": "border-color: #374151;", "border-gray-800": "border-color: #1f2937;",
  // Border radius
  "rounded": "border-radius: 0.25rem;", "rounded-md": "border-radius: 0.375rem;",
  "rounded-lg": "border-radius: 0.5rem;", "rounded-xl": "border-radius: 0.75rem;",
  "rounded-2xl": "border-radius: 1rem;", "rounded-full": "border-radius: 9999px;",
  "rounded-none": "border-radius: 0;",
  // Shadow
  "shadow": "box-shadow: 0 1px 3px rgba(0,0,0,0.1);",
  "shadow-md": "box-shadow: 0 4px 6px rgba(0,0,0,0.1);",
  "shadow-lg": "box-shadow: 0 10px 15px rgba(0,0,0,0.1);",
  "shadow-xl": "box-shadow: 0 20px 25px rgba(0,0,0,0.1);",
  "shadow-none": "box-shadow: none;",
  // Position
  "relative": "position: relative;", "absolute": "position: absolute;",
  "fixed": "position: fixed;", "sticky": "position: sticky;",
  // Overflow
  "overflow-hidden": "overflow: hidden;", "overflow-auto": "overflow: auto;",
  "overflow-scroll": "overflow: scroll;",
  // Opacity
  "opacity-0": "opacity: 0;", "opacity-50": "opacity: 0.5;",
  "opacity-75": "opacity: 0.75;", "opacity-100": "opacity: 1;",
  // Transition
  "transition": "transition: all 150ms cubic-bezier(0.4,0,0.2,1);",
  "transition-colors": "transition: color, background-color, border-color 150ms;",
  "duration-200": "transition-duration: 200ms;", "duration-300": "transition-duration: 300ms;",
  // Cursor
  "cursor-pointer": "cursor: pointer;", "cursor-not-allowed": "cursor: not-allowed;",
  // Whitespace
  "whitespace-nowrap": "white-space: nowrap;",
  "whitespace-pre": "white-space: pre;",
};

const QUICK_CLASSES = [
  { label: "Container", classes: "max-w-xl mx-auto p-6" },
  { label: "Card", classes: "bg-gray-800 rounded-lg p-6 shadow-lg" },
  { label: "Button", classes: "bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold" },
  { label: "Badge", classes: "bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold" },
  { label: "Alert", classes: "bg-red-500 text-white p-4 rounded-lg font-medium" },
  { label: "Centered", classes: "flex items-center justify-center min-h-screen" },
  { label: "Grid 3-col", classes: "grid grid-cols-3 gap-4" },
  { label: "Flex Row", classes: "flex flex-row items-center gap-4" },
];

function classesToCss(classes: string): string {
  const list = classes.trim().split(/\s+/).filter(Boolean);
  const cssLines: string[] = [];
  const unknown: string[] = [];

  for (const cls of list) {
    // Strip pseudo-class prefixes like hover:, focus:, sm:, md:, lg: for lookup
    const base = cls.replace(/^(hover|focus|active|sm|md|lg|xl|2xl|dark|group-hover):/, "");
    if (TAILWIND_CSS_MAP[base]) {
      cssLines.push(`  ${TAILWIND_CSS_MAP[base]}`);
    } else {
      unknown.push(cls);
    }
  }

  let result = ".element {\n" + cssLines.join("\n") + "\n}";
  if (unknown.length > 0) {
    result += `\n\n/* Unmapped classes: ${unknown.join(", ")} */`;
  }
  return result;
}

export default function TailwindPlaygroundTool() {
  const t = useTranslations("toolUi");
  const [classes, setClasses] = useState("bg-blue-500 text-white p-4 rounded-lg text-center font-bold text-xl");
  const [htmlContent, setHtmlContent] = useState("Hello, Tailwind!");
  const [copied, setCopied] = useState(false);

  const css = classesToCss(classes);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [css]);

  const handleReset = useCallback(() => {
    setClasses("bg-blue-500 text-white p-4 rounded-lg text-center font-bold text-xl");
    setHtmlContent("Hello, Tailwind!");
  }, []);

  return (
    <div className="space-y-6">
      {/* Class Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Tailwind Classes</label>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
        <input
          type="text"
          value={classes}
          onChange={(e) => setClasses(e.target.value)}
          placeholder="bg-blue-500 text-white p-4 rounded-lg"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Quick Class Suggestions */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {QUICK_CLASSES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setClasses(preset.classes)}
              className="bg-gray-900/50 border border-gray-800 hover:border-indigo-500 text-gray-400 hover:text-white rounded-lg px-3 py-1.5 text-xs font-mono transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* HTML Content */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">HTML Content</label>
        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          placeholder="Content inside the div..."
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm resize-y focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Live Preview */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Live Preview</label>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
          <div
            className={classes}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>

      {/* Generated CSS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Approximate CSS</label>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
        <textarea
          value={css}
          readOnly
          rows={8}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm resize-y focus:outline-none"
        />
      </div>
    </div>
  );
}
