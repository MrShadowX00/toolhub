"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Loader2,
  AlertCircle,
  X,
  Globe,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";

const SECURITY_HEADERS: Record<string, string> = {
  "content-security-policy": "Controls resources the browser is allowed to load.",
  "x-frame-options": "Prevents clickjacking by controlling iframe embedding.",
  "strict-transport-security": "Forces HTTPS connections.",
  "x-content-type-options": "Prevents MIME-type sniffing.",
  "x-xss-protection": "Enables browser XSS filtering.",
  "referrer-policy": "Controls how much referrer information is sent.",
  "permissions-policy": "Controls browser feature access.",
  "cross-origin-opener-policy": "Isolates browsing context from cross-origin documents.",
  "cross-origin-resource-policy": "Controls cross-origin resource sharing.",
  "cross-origin-embedder-policy": "Controls cross-origin embedding.",
};

interface HeadersResult {
  headers: Record<string, string>;
  status: number;
  url: string;
}

export default function HttpHeadersTool() {
  const t = useTranslations("toolUi");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<HeadersResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCheck = useCallback(async () => {
    const cleaned = url.trim();
    if (!cleaned) {
      setError(t("pleaseEnterUrl"));
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/headers?url=${encodeURIComponent(cleaned)}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setResult(data as HeadersResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("error")
      );
    } finally {
      setLoading(false);
    }
  }, [url, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };

  const handleCopy = () => {
    if (!result) return;
    const text = Object.entries(result.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Split headers into security and other
  const securityHeaderKeys = Object.keys(SECURITY_HEADERS);
  const presentSecurity = result
    ? Object.keys(result.headers).filter((h) =>
        securityHeaderKeys.includes(h.toLowerCase())
      )
    : [];
  const missingSecurity = result
    ? securityHeaderKeys.filter(
        (sh) =>
          !Object.keys(result.headers).some(
            (h) => h.toLowerCase() === sh
          )
      )
    : [];

  return (
      <div className="space-y-6">
        {/* Input */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t("url")}
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("enterUrl")}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={handleCheck}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {t("check")}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">{t("error")}</p>
              <p className="mt-1 text-sm text-red-400">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center rounded-xl border border-gray-800 bg-gray-900/50 py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
              <p className="text-sm text-gray-400">{t("loading")}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <div className="space-y-6">
            {/* Response info bar */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3">
              <span
                className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
                  result.status < 300
                    ? "bg-green-500/10 text-green-400 ring-green-500/20"
                    : result.status < 400
                      ? "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20"
                      : "bg-red-500/10 text-red-400 ring-red-500/20"
                }`}
              >
                {result.status}
              </span>
              <span className="text-sm font-mono text-gray-300 truncate flex-1">
                {result.url}
              </span>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  copied
                    ? "bg-green-600/20 text-green-400"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {t("copied")}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    {t("copy")}
                  </>
                )}
              </button>
            </div>

            {/* Security headers audit */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 bg-gray-800 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-gray-300">
                  {t("responseHeaders")}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  {presentSecurity.length}/{securityHeaderKeys.length}
                </span>
              </div>
              <div className="p-4 space-y-2">
                {/* Present security headers */}
                {presentSecurity.map((header) => {
                  const key = header.toLowerCase();
                  return (
                    <div
                      key={header}
                      className="flex items-start gap-3 rounded-lg bg-green-500/5 border border-green-500/10 px-4 py-3"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white">
                            {header}
                          </span>
                          <span className="inline-flex rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-400">
                            {t("success")}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {SECURITY_HEADERS[key]}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Missing security headers */}
                {missingSecurity.map((header) => (
                  <div
                    key={header}
                    className="flex items-start gap-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 px-4 py-3"
                  >
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-300">
                          {header}
                        </span>
                        <span className="inline-flex rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-400">
                          {t("warning")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {SECURITY_HEADERS[header]}
                      </p>
                    </div>
                    <ShieldAlert className="h-4 w-4 text-yellow-500/50 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* All headers table */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
                <span className="text-sm font-medium text-gray-300">
                  {t("responseHeaders")}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  ({Object.keys(result.headers).length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 w-1/3">
                        {t("header")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {t("value")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {Object.entries(result.headers)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([key, value]) => {
                        const isSecurityHeader = securityHeaderKeys.includes(
                          key.toLowerCase()
                        );
                        return (
                          <tr
                            key={key}
                            className="hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-gray-300 font-medium">
                                  {key}
                                </span>
                                {isSecurityHeader && (
                                  <span className="inline-flex rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                                    Security
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-white break-all">
                              {value}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
