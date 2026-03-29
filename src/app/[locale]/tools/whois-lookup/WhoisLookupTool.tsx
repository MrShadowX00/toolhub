"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Loader2,
  AlertCircle,
  X,
  Globe,
  Building2,
  CalendarDays,
  Server,
  Shield,
  RefreshCw,
} from "lucide-react";

interface WhoisData {
  domain_name?: string;
  registrar?: string;
  creation_date?: string;
  expiration_date?: string;
  updated_date?: string;
  name_servers?: string[];
  status?: string[];
  registrant_name?: string;
  registrant_organization?: string;
  registrant_country?: string;
  [key: string]: unknown;
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
  color?: string;
}

function InfoCard({ icon, label, value, color = "text-white" }: InfoCardProps) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {label}
        </span>
      </div>
      <p className={`text-sm font-medium ${color} break-all`}>
        {value || "N/A"}
      </p>
    </div>
  );
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function daysUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export default function WhoisLookupTool() {
  const t = useTranslations("toolUi");
  const [domain, setDomain] = useState("");
  const [data, setData] = useState<WhoisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queriedDomain, setQueriedDomain] = useState("");

  const handleLookup = useCallback(async () => {
    const cleaned = domain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/^www\./, "");

    if (!cleaned) {
      setError(t("pleaseEnterDomain"));
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setQueriedDomain(cleaned);

    try {
      const res = await fetch(
        `https://whois.freeaiapi.xyz/?name=${encodeURIComponent(cleaned)}`
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setData(json as WhoisData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("error")
      );
    } finally {
      setLoading(false);
    }
  }, [domain, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLookup();
  };

  const expiryDays = data ? daysUntil(data.expiration_date) : null;
  const expiryColor =
    expiryDays === null
      ? "text-gray-400"
      : expiryDays > 90
        ? "text-green-400"
        : expiryDays > 30
          ? "text-yellow-400"
          : "text-red-400";

  return (
      <div className="space-y-6">
        {/* Input */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t("domainName")}
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("enterDomain")}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={handleLookup}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {t("lookup")}
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
              <p className="text-sm text-gray-400">
                {t("loading")}
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && data && (
          <div className="space-y-6">
            {/* Header */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <div className="flex items-center gap-3 mb-1">
                <Globe className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">
                  {data.domain_name || queriedDomain}
                </h2>
              </div>
              {expiryDays !== null && (
                <p className={`text-sm ${expiryColor} ml-8`}>
                  {expiryDays > 0
                    ? `${t("expiryDate")}: ${expiryDays} ${t("days")}`
                    : t("expired")}
                </p>
              )}
            </div>

            {/* Info cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                icon={<Building2 className="h-4 w-4 text-blue-400" />}
                label={t("registrar")}
                value={data.registrar}
              />
              <InfoCard
                icon={<CalendarDays className="h-4 w-4 text-green-400" />}
                label={t("createdDate")}
                value={formatDate(data.creation_date)}
                color="text-green-300"
              />
              <InfoCard
                icon={<CalendarDays className="h-4 w-4 text-yellow-400" />}
                label={t("expiryDate")}
                value={formatDate(data.expiration_date)}
                color={expiryColor}
              />
              <InfoCard
                icon={<RefreshCw className="h-4 w-4 text-purple-400" />}
                label={t("date")}
                value={formatDate(data.updated_date)}
              />
            </div>

            {/* Name servers */}
            {data.name_servers && data.name_servers.length > 0 && (
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Server className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                    {t("nameServers")}
                  </h3>
                </div>
                <div className="space-y-2">
                  {data.name_servers.map((ns, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2.5 font-mono text-sm text-white"
                    >
                      <span className="text-gray-500 text-xs">{i + 1}.</span>
                      {ns.toLowerCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            {data.status && data.status.length > 0 && (
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                    {t("status")}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.status.map((status, i) => (
                    <span
                      key={i}
                      className="inline-flex rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                    >
                      {status}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  );
}
