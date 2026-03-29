"use client";

import { useState, useCallback, useRef } from "react";
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  X,
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Building2,
  CalendarDays,
  Award,
} from "lucide-react";

interface Endpoint {
  ipAddress: string;
  grade: string;
  statusMessage: string;
  details?: {
    cert?: {
      subject: string;
      issuerSubject: string;
      notBefore: number;
      notAfter: number;
      commonNames: string[];
      altNames: string[];
    };
  };
}

interface SslLabsResponse {
  host: string;
  status: string;
  statusMessage?: string;
  endpoints?: Endpoint[];
}

interface CertInfo {
  grade: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  daysRemaining: number;
  commonName: string;
  altNames: string[];
  ipAddress: string;
}

function getGradeColor(grade: string): string {
  if (!grade) return "text-gray-400";
  const g = grade.toUpperCase();
  if (g.startsWith("A")) return "text-green-400";
  if (g.startsWith("B")) return "text-yellow-400";
  if (g.startsWith("C")) return "text-orange-400";
  return "text-red-400";
}

function getGradeBg(grade: string): string {
  if (!grade) return "bg-gray-500/10 ring-gray-500/20";
  const g = grade.toUpperCase();
  if (g.startsWith("A")) return "bg-green-500/10 ring-green-500/20";
  if (g.startsWith("B")) return "bg-yellow-500/10 ring-yellow-500/20";
  if (g.startsWith("C")) return "bg-orange-500/10 ring-orange-500/20";
  return "bg-red-500/10 ring-red-500/20";
}

function getStatusColor(days: number): {
  text: string;
  bg: string;
  icon: React.ReactNode;
  label: string;
} {
  if (days <= 0) {
    return {
      text: "text-red-400",
      bg: "bg-red-500/10 border-red-500/30",
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      label: "Expired",
    };
  }
  if (days <= 30) {
    return {
      text: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/30",
      icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
      label: "Expiring Soon",
    };
  }
  return {
    text: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
    label: "Valid",
  };
}

export default function SslCheckerTool() {
  const [domain, setDomain] = useState("");
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [queriedDomain, setQueriedDomain] = useState("");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = () => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  const handleCheck = useCallback(async () => {
    const cleaned = domain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "");

    if (!cleaned) {
      setError("Please enter a domain name.");
      return;
    }

    cleanup();
    setLoading(true);
    setError(null);
    setCertInfo(null);
    setQueriedDomain(cleaned);
    setStatusMsg("Starting SSL analysis...");

    const poll = async (startNew: boolean) => {
      try {
        const params = new URLSearchParams({
          host: cleaned,
          all: "done",
        });
        if (startNew) {
          params.set("startNew", "on");
        }

        const res = await fetch(
          `https://api.ssllabs.com/api/v3/analyze?${params.toString()}`
        );
        if (!res.ok) throw new Error(`SSL Labs returned ${res.status}`);

        const data = (await res.json()) as SslLabsResponse;

        if (data.status === "ERROR") {
          throw new Error(data.statusMessage || "SSL Labs analysis failed.");
        }

        if (data.status === "READY" && data.endpoints && data.endpoints.length > 0) {
          const ep = data.endpoints[0];
          const cert = ep.details?.cert;

          const now = Date.now();
          const validTo = cert ? new Date(cert.notBefore) : new Date();
          const expiresAt = cert ? new Date(cert.notAfter) : new Date();
          const daysRemaining = Math.ceil(
            (expiresAt.getTime() - now) / (1000 * 60 * 60 * 24)
          );

          setCertInfo({
            grade: ep.grade || "N/A",
            issuer: cert?.issuerSubject || "Unknown",
            validFrom: validTo,
            validTo: expiresAt,
            daysRemaining,
            commonName: cert?.commonNames?.[0] || cleaned,
            altNames: cert?.altNames || [],
            ipAddress: ep.ipAddress,
          });
          setLoading(false);
          setStatusMsg("");
          return;
        }

        // Still in progress
        const progressMsgs: Record<string, string> = {
          DNS: "Resolving DNS...",
          IN_PROGRESS: "Analyzing SSL configuration...",
        };
        setStatusMsg(
          progressMsgs[data.status] || `Status: ${data.status}...`
        );

        pollRef.current = setTimeout(() => poll(false), 5000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "SSL check failed.");
        setLoading(false);
        setStatusMsg("");
      }
    };

    poll(true);
  }, [domain]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };

  const status = certInfo ? getStatusColor(certInfo.daysRemaining) : null;

  return (
      <div className="space-y-6">
        {/* Input */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Domain or URL
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="example.com"
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
              Check SSL
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            SSL Labs analysis may take 1-2 minutes for a full scan.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Check Failed</p>
              <p className="mt-1 text-sm text-red-400">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                cleanup();
              }}
              className="text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Loading / polling */}
        {loading && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                <div className="relative rounded-full bg-indigo-500/10 p-4">
                  <ShieldCheck className="h-8 w-8 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">
                  Analyzing {queriedDomain}
                </p>
                <p className="mt-1 text-sm text-gray-400">{statusMsg}</p>
              </div>
              {/* Progress bar animation */}
              <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]"
                  style={{
                    width: "40%",
                    animation: "indeterminate 1.5s ease-in-out infinite",
                  }}
                />
              </div>
              <style jsx>{`
                @keyframes indeterminate {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(350%); }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && certInfo && status && (
          <div className="space-y-6">
            {/* Status banner */}
            <div className={`flex items-center gap-3 rounded-xl border p-4 ${status.bg}`}>
              {status.icon}
              <div>
                <p className={`text-sm font-semibold ${status.text}`}>
                  {status.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {certInfo.daysRemaining > 0
                    ? `Certificate expires in ${certInfo.daysRemaining} days`
                    : "Certificate has expired"}
                </p>
              </div>
              {/* Grade badge */}
              <div className="ml-auto">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-xl ${getGradeBg(certInfo.grade)} ring-1 ring-inset`}
                >
                  <span className={`text-2xl font-bold ${getGradeColor(certInfo.grade)}`}>
                    {certInfo.grade}
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate details grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Common Name
                  </span>
                </div>
                <p className="text-sm font-medium text-white break-all">
                  {certInfo.commonName}
                </p>
              </div>

              <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Issuer
                  </span>
                </div>
                <p className="text-sm font-medium text-white break-all">
                  {certInfo.issuer}
                </p>
              </div>

              <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Valid From
                  </span>
                </div>
                <p className="text-sm font-medium text-green-300">
                  {certInfo.validFrom.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Expires
                  </span>
                </div>
                <p className={`text-sm font-medium ${status.text}`}>
                  {certInfo.validTo.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Days Remaining
                  </span>
                </div>
                <p className={`text-2xl font-bold ${status.text}`}>
                  {certInfo.daysRemaining > 0 ? certInfo.daysRemaining : 0}
                </p>
              </div>

              <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    IP Address
                  </span>
                </div>
                <p className="text-sm font-medium font-mono text-white">
                  {certInfo.ipAddress}
                </p>
              </div>
            </div>

            {/* Alt Names */}
            {certInfo.altNames.length > 0 && (
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-3">
                  Subject Alternative Names ({certInfo.altNames.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {certInfo.altNames.slice(0, 20).map((name, i) => (
                    <span
                      key={i}
                      className="inline-flex rounded-md bg-gray-800 px-2.5 py-1 text-xs font-mono text-gray-300 ring-1 ring-inset ring-gray-700"
                    >
                      {name}
                    </span>
                  ))}
                  {certInfo.altNames.length > 20 && (
                    <span className="inline-flex rounded-md bg-gray-800 px-2.5 py-1 text-xs text-gray-500 ring-1 ring-inset ring-gray-700">
                      +{certInfo.altNames.length - 20} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  );
}
