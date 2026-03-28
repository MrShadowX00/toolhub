"use client";

import { useState } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import {
  Search,
  Calendar,
  Clock,
  RefreshCw,
  Building2,
  AlertCircle,
} from "lucide-react";

interface WhoisData {
  creation_date?: string;
  updated_date?: string;
  expiration_date?: string;
  registrar?: string;
  domain_name?: string;
}

interface AgeBreakdown {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

function calculateAge(creationDate: string): AgeBreakdown {
  const created = new Date(creationDate);
  const now = new Date();

  const totalDays = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );

  let years = now.getFullYear() - created.getFullYear();
  let months = now.getMonth() - created.getMonth();
  let days = now.getDate() - created.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days, totalDays };
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function DomainAgePage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
  const [age, setAge] = useState<AgeBreakdown | null>(null);

  const handleLookup = async () => {
    const cleaned = domain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    if (!cleaned) {
      setError("Please enter a domain name");
      return;
    }

    setLoading(true);
    setError("");
    setWhoisData(null);
    setAge(null);

    try {
      const res = await fetch(
        `https://whois.freeaiapi.xyz/?name=${encodeURIComponent(cleaned)}`
      );
      if (!res.ok) throw new Error("Failed to fetch WHOIS data");
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setWhoisData(data);

      const creationDate =
        data.creation_date ||
        data.creationDate ||
        data.created ||
        data.create_date;
      if (creationDate) {
        const dateStr = Array.isArray(creationDate)
          ? creationDate[0]
          : creationDate;
        setAge(calculateAge(dateStr));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to lookup domain"
      );
    } finally {
      setLoading(false);
    }
  };

  const creationDate =
    whoisData?.creation_date;
  const updatedDate =
    whoisData?.updated_date;
  const expirationDate =
    whoisData?.expiration_date;
  const registrar = whoisData?.registrar;

  const progressPercent = age
    ? Math.min((age.totalDays / (365.25 * 30)) * 100, 100)
    : 0;

  return (
    <ToolLayout
      title="Domain Age Checker"
      description="Check when a domain was registered and calculate its age"
      category="Network Tools"
    >
      <div className="space-y-6">
        {/* Input */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Domain Name
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                placeholder="e.g. google.com"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleLookup}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? "Checking..." : "Check Age"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-800 bg-red-900/20 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {age && whoisData && (
          <div className="space-y-6">
            {/* Age Card */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Domain Age
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-gray-800 p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {age.years}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">Years</div>
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {age.months}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">Months</div>
                </div>
                <div className="rounded-lg bg-gray-800 p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {age.days}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">Days</div>
                </div>
              </div>
              <p className="mt-3 text-center text-sm text-gray-500">
                Total: {age.totalDays.toLocaleString()} days
              </p>

              {/* Visual timeline bar */}
              <div className="mt-5">
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>{formatDate(creationDate)}</span>
                  <span>Today</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-xs text-gray-600">
                  Timeline (max 30 years)
                </p>
              </div>
            </div>

            {/* Details Card */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                WHOIS Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-gray-800 p-4">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">
                      Created Date
                    </div>
                    <div className="text-white">
                      {formatDate(creationDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-gray-800 p-4">
                  <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">
                      Updated Date
                    </div>
                    <div className="text-white">
                      {formatDate(updatedDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-gray-800 p-4">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">
                      Expires Date
                    </div>
                    <div className="text-white">
                      {formatDate(expirationDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-gray-800 p-4">
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-400">
                      Registrar
                    </div>
                    <div className="text-white">
                      {registrar || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
