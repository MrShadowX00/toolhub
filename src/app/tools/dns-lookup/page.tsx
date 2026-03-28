"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import { Globe, Search, Loader2, AlertCircle, X } from "lucide-react";

const RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"] as const;
type RecordType = (typeof RECORD_TYPES)[number];

interface DnsRecord {
  type: number;
  name: string;
  data: string;
  TTL: number;
}

interface DnsResponse {
  Status: number;
  Answer?: DnsRecord[];
  Authority?: DnsRecord[];
}

interface ResultRow {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

const typeNumberToName: Record<number, string> = {
  1: "A",
  28: "AAAA",
  15: "MX",
  2: "NS",
  16: "TXT",
  5: "CNAME",
  6: "SOA",
};

function formatTTL(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default function DnsLookupPage() {
  const [domain, setDomain] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<RecordType>>(
    new Set(["A", "AAAA", "MX", "NS"])
  );
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queriedDomain, setQueriedDomain] = useState("");

  const toggleType = (type: RecordType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedTypes(new Set(RECORD_TYPES));
  const clearAll = () => setSelectedTypes(new Set());

  const handleLookup = useCallback(async () => {
    const cleaned = domain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!cleaned) {
      setError("Please enter a domain name.");
      return;
    }
    if (selectedTypes.size === 0) {
      setError("Please select at least one record type.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setQueriedDomain(cleaned);

    try {
      const types = Array.from(selectedTypes);
      const promises = types.map(async (type) => {
        const res = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleaned)}&type=${type}`,
          { headers: { Accept: "application/dns-json" } }
        );
        if (!res.ok) throw new Error(`Failed to query ${type} records`);
        return (await res.json()) as DnsResponse;
      });

      const responses = await Promise.all(promises);
      const rows: ResultRow[] = [];

      for (const response of responses) {
        const records = response.Answer || response.Authority || [];
        for (const record of records) {
          rows.push({
            type: typeNumberToName[record.type] || String(record.type),
            name: record.name,
            value: record.data,
            ttl: record.TTL,
          });
        }
      }

      if (rows.length === 0) {
        setError("No DNS records found for the selected types.");
      }

      setResults(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "DNS lookup failed.");
    } finally {
      setLoading(false);
    }
  }, [domain, selectedTypes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLookup();
  };

  return (
    <ToolLayout
      title="DNS Lookup"
      description="Look up DNS records for any domain"
      category="Network Tools"
    >
      <div className="space-y-6">
        {/* Input section */}
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
          {/* Domain input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Domain Name
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
                onClick={handleLookup}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Lookup
              </button>
            </div>
          </div>

          {/* Record type selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                Record Types
              </label>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Select All
                </button>
                <span className="text-gray-600">|</span>
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {RECORD_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                    selectedTypes.has(type)
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 border border-gray-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Lookup Failed</p>
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
                Querying DNS records for <span className="text-white font-medium">{queriedDomain}</span>...
              </p>
            </div>
          </div>
        )}

        {/* Results table */}
        {!loading && results.length > 0 && (
          <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                DNS Records for <span className="text-white">{queriedDomain}</span>
              </span>
              <span className="text-xs text-gray-500">
                {results.length} record{results.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      TTL
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {results.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-300 text-xs">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-white text-xs break-all max-w-md">
                        {row.value}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {formatTTL(row.ttl)}
                        <span className="ml-1 text-xs text-gray-600">
                          ({row.ttl.toLocaleString()}s)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
