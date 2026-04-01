"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Download, Trash2, Plus, X } from "lucide-react";

interface Rule {
  id: string;
  userAgent: string;
  type: "Allow" | "Disallow";
  path: string;
}

const AI_BOTS = ["GPTBot", "Google-Extended", "CCBot", "ChatGPT-User", "anthropic-ai", "ClaudeBot", "Bytespider", "cohere-ai"];

const COMMON_PATHS = ["/admin", "/api", "/private", "/wp-admin", "/cgi-bin", "/tmp", "/.env"];

let ruleCounter = 0;
function newId() {
  return `rule-${++ruleCounter}`;
}

function generateRobotsTxt(rules: Rule[], sitemapUrl: string): string {
  // Group rules by user-agent
  const grouped: Record<string, { allows: string[]; disallows: string[] }> = {};

  for (const rule of rules) {
    const agent = rule.userAgent.trim() || "*";
    if (!grouped[agent]) grouped[agent] = { allows: [], disallows: [] };
    if (rule.type === "Allow") {
      grouped[agent].allows.push(rule.path);
    } else {
      grouped[agent].disallows.push(rule.path);
    }
  }

  const lines: string[] = [];

  for (const [agent, { allows, disallows }] of Object.entries(grouped)) {
    lines.push(`User-agent: ${agent}`);
    for (const path of disallows) {
      lines.push(`Disallow: ${path}`);
    }
    for (const path of allows) {
      lines.push(`Allow: ${path}`);
    }
    lines.push("");
  }

  if (sitemapUrl.trim()) {
    lines.push(`Sitemap: ${sitemapUrl.trim()}`);
    lines.push("");
  }

  return lines.join("\n").trim();
}

export default function RobotsTxtGeneratorTool() {
  const t = useTranslations("toolUi");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [rules, setRules] = useState<Rule[]>([
    { id: newId(), userAgent: "*", type: "Allow", path: "/" },
  ]);
  const [copied, setCopied] = useState(false);

  const output = generateRobotsTxt(rules, sitemapUrl);

  const addRule = useCallback(() => {
    setRules((prev) => [...prev, { id: newId(), userAgent: "*", type: "Disallow", path: "/" }]);
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRule = useCallback((id: string, field: keyof Rule, value: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }, []);

  const applyPreset = useCallback((preset: "allow-all" | "block-all" | "block-ai") => {
    if (preset === "allow-all") {
      setRules([{ id: newId(), userAgent: "*", type: "Allow", path: "/" }]);
    } else if (preset === "block-all") {
      setRules([{ id: newId(), userAgent: "*", type: "Disallow", path: "/" }]);
    } else if (preset === "block-ai") {
      const aiRules: Rule[] = AI_BOTS.map((bot) => ({
        id: newId(),
        userAgent: bot,
        type: "Disallow" as const,
        path: "/",
      }));
      setRules([
        { id: newId(), userAgent: "*", type: "Allow", path: "/" },
        ...aiRules,
      ]);
    }
  }, []);

  const addCommonPath = useCallback((path: string) => {
    setRules((prev) => [...prev, { id: newId(), userAgent: "*", type: "Disallow", path }]);
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleClear = useCallback(() => {
    setRules([{ id: newId(), userAgent: "*", type: "Allow", path: "/" }]);
    setSitemapUrl("");
  }, []);

  return (
    <div className="space-y-6">
      {/* Sitemap URL */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Sitemap URL</label>
        <input
          type="text"
          value={sitemapUrl}
          onChange={(e) => setSitemapUrl(e.target.value)}
          placeholder="https://example.com/sitemap.xml"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Presets */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Presets</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset("allow-all")}
            className="bg-gray-900/50 border border-gray-800 hover:border-green-500 text-gray-400 hover:text-green-400 rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            Allow All
          </button>
          <button
            onClick={() => applyPreset("block-all")}
            className="bg-gray-900/50 border border-gray-800 hover:border-red-500 text-gray-400 hover:text-red-400 rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            Block All
          </button>
          <button
            onClick={() => applyPreset("block-ai")}
            className="bg-gray-900/50 border border-gray-800 hover:border-yellow-500 text-gray-400 hover:text-yellow-400 rounded-lg px-3 py-1.5 text-sm transition-colors"
          >
            Block AI Bots
          </button>
        </div>
      </div>

      {/* Common Paths */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Quick Block Paths</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_PATHS.map((path) => (
            <button
              key={path}
              onClick={() => addCommonPath(path)}
              className="bg-gray-900/50 border border-gray-800 hover:border-indigo-500 text-gray-400 hover:text-white rounded-lg px-3 py-1.5 text-xs font-mono transition-colors"
            >
              {path}
            </button>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">Rules</label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Trash2 size={14} />
              {t("clear")}
            </button>
            <button
              onClick={addRule}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-1.5 text-sm transition-colors"
            >
              <Plus size={14} />
              Add Rule
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-2">
              <input
                type="text"
                value={rule.userAgent}
                onChange={(e) => updateRule(rule.id, "userAgent", e.target.value)}
                placeholder="User-agent"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
              <select
                value={rule.type}
                onChange={(e) => updateRule(rule.id, "type", e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="Allow">Allow</option>
                <option value="Disallow">Disallow</option>
              </select>
              <input
                type="text"
                value={rule.path}
                onChange={(e) => updateRule(rule.id, "path", e.target.value)}
                placeholder="/path"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => removeRule(rule.id)}
                className="text-gray-500 hover:text-red-400 transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Generated robots.txt</label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t("copied") : t("copy")}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Download size={14} />
              {t("download")}
            </button>
          </div>
        </div>
        <textarea
          value={output}
          readOnly
          rows={10}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm resize-y focus:outline-none"
        />
      </div>
    </div>
  );
}
