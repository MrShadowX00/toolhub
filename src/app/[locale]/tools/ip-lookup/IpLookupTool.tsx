"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Loader2,
  AlertCircle,
  X,
  MapPin,
  Globe,
  Building2,
  Clock,
  Crosshair,
  Wifi,
  Navigation,
} from "lucide-react";

interface IpData {
  ip: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_code: string;
  country_name: string;
  continent_code: string;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  languages: string;
  asn: string;
  org: string;
  error?: boolean;
  reason?: string;
}

function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return "";
  const offset = 127397;
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => c.charCodeAt(0) + offset)
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}

function InfoCard({ icon, label, value, mono = false }: InfoCardProps) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {label}
        </span>
      </div>
      <p
        className={`text-sm font-medium text-white break-all ${mono ? "font-mono" : ""}`}
      >
        {value || "N/A"}
      </p>
    </div>
  );
}

export default function IpLookupTool() {
  const t = useTranslations("toolUi");
  const [ip, setIp] = useState("");
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoDetect, setIsAutoDetect] = useState(false);

  const fetchIpData = useCallback(
    async (targetIp?: string) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const url = targetIp
          ? `https://ipapi.co/${encodeURIComponent(targetIp)}/json/`
          : "https://ipapi.co/json/";

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const json = (await res.json()) as IpData;
        if (json.error) {
          throw new Error(json.reason || t("invalidInput"));
        }

        setData(json);
        if (!targetIp) {
          setIp(json.ip);
          setIsAutoDetect(true);
        } else {
          setIsAutoDetect(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const handleLookup = () => {
    const cleaned = ip.trim();
    if (!cleaned) {
      setError(t("pleaseEnterIp"));
      return;
    }
    fetchIpData(cleaned);
  };

  const handleAutoDetect = () => {
    fetchIpData();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLookup();
  };

  const flag = data ? countryCodeToFlag(data.country_code) : "";

  return (
      <div className="space-y-6">
        {/* Input */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t("ipAddress")}
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="8.8.8.8 or 2001:4860:4860::8888"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={handleLookup}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && !isAutoDetect ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {t("lookup")}
            </button>
            <button
              onClick={handleAutoDetect}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-100 transition-colors hover:bg-gray-600 active:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && isAutoDetect ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crosshair className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{t("autoDetect")}</span>
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
            {/* IP header */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
                  <MapPin className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="font-mono text-lg font-bold text-white">
                    {data.ip}
                  </p>
                  <p className="text-sm text-gray-400">
                    {flag && <span className="mr-1 text-base">{flag}</span>}
                    {[data.city, data.region, data.country_name]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard
                icon={<MapPin className="h-4 w-4 text-red-400" />}
                label={t("country")}
                value={`${flag} ${data.country_name || data.country}`}
              />
              <InfoCard
                icon={<Navigation className="h-4 w-4 text-orange-400" />}
                label={t("region")}
                value={data.region}
              />
              <InfoCard
                icon={<Building2 className="h-4 w-4 text-blue-400" />}
                label={t("city")}
                value={data.city}
              />
              <InfoCard
                icon={<Wifi className="h-4 w-4 text-green-400" />}
                label={t("isp")}
                value={data.org}
              />
              <InfoCard
                icon={<Clock className="h-4 w-4 text-purple-400" />}
                label={t("timezone")}
                value={`${data.timezone}${data.utc_offset ? ` (UTC${data.utc_offset})` : ""}`}
              />
              <InfoCard
                icon={<Globe className="h-4 w-4 text-cyan-400" />}
                label={t("location")}
                value={`${data.latitude}, ${data.longitude}`}
                mono
              />
            </div>

            {/* Additional info */}
            <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
                <span className="text-sm font-medium text-gray-300">
                  {t("info")}
                </span>
              </div>
              <div className="divide-y divide-gray-800">
                {[
                  { label: "ASN", value: data.asn },
                  { label: "Postal Code", value: data.postal },
                  { label: "Country Code", value: data.country_code },
                  { label: "Continent", value: data.continent_code },
                  { label: "Calling Code", value: data.country_calling_code },
                  { label: "Currency", value: data.currency },
                  { label: "Languages", value: data.languages },
                ]
                  .filter((row) => row.value)
                  .map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-sm text-gray-400">{row.label}</span>
                      <span className="text-sm font-medium text-white font-mono">
                        {row.value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
