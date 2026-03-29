"use client";

import { useState } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  Server,
} from "lucide-react";

const COMMON_PORTS = [
  { port: 80, label: "HTTP" },
  { port: 443, label: "HTTPS" },
  { port: 22, label: "SSH" },
  { port: 3306, label: "MySQL" },
  { port: 5432, label: "PostgreSQL" },
  { port: 6379, label: "Redis" },
  { port: 27017, label: "MongoDB" },
  { port: 8080, label: "Alt HTTP" },
  { port: 3000, label: "Dev" },
  { port: 8443, label: "HTTPS Alt" },
];

type CheckResult = "open" | "closed" | "timeout" | "browser-limited" | null;

export default function PortCheckerTool() {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckResult>(null);
  const [checkedHost, setCheckedHost] = useState("");
  const [checkedPort, setCheckedPort] = useState("");

  const isHttpPort = (p: number) =>
    [80, 443, 8080, 8443, 3000].includes(p);

  const handleCheck = async () => {
    const trimmedHost = host.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const portNum = parseInt(port, 10);

    if (!trimmedHost) {
      setError("Please enter a hostname");
      return;
    }
    if (!portNum || portNum < 1 || portNum > 65535) {
      setError("Please enter a valid port (1-65535)");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCheckedHost(trimmedHost);
    setCheckedPort(port);

    if (!isHttpPort(portNum)) {
      setResult("browser-limited");
      setLoading(false);
      return;
    }

    try {
      const protocol = [443, 8443].includes(portNum) ? "https" : "http";
      const targetUrl = `${protocol}://${trimmedHost}:${portNum}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        await fetch(targetUrl, {
          mode: "no-cors",
          signal: controller.signal,
        });
        clearTimeout(timeout);
        setResult("open");
      } catch (err) {
        clearTimeout(timeout);
        if (err instanceof DOMException && err.name === "AbortError") {
          setResult("timeout");
        } else {
          setResult("closed");
        }
      }
    } catch {
      setResult("closed");
    } finally {
      setLoading(false);
    }
  };

  const resultConfig = {
    open: {
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-900/20 border-green-800",
      label: "Port is Open",
      desc: "The port appears to be accepting connections.",
    },
    closed: {
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-900/20 border-red-800",
      label: "Port is Closed",
      desc: "The port is not accepting connections or is blocked.",
    },
    timeout: {
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-900/20 border-yellow-800",
      label: "Connection Timed Out",
      desc: "The port did not respond within 5 seconds. It may be filtered or the host is unreachable.",
    },
    "browser-limited": {
      icon: Info,
      color: "text-blue-400",
      bg: "bg-blue-900/20 border-blue-800",
      label: "Browser Limitation",
      desc: "This port uses a non-HTTP protocol. Browsers cannot perform raw TCP connections. Use a command-line tool like nmap, nc, or telnet for accurate results.",
    },
  };

  return (
      <div className="space-y-6">
        {/* Input */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_160px_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Host
              </label>
              <div className="relative">
                <Server className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                  placeholder="e.g. example.com"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Port
              </label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                placeholder="80"
                min={1}
                max={65535}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCheck}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? "Checking..." : "Check"}
              </button>
            </div>
          </div>

          {/* Common Ports */}
          <div className="mt-4">
            <p className="mb-2 text-sm text-gray-400">Common Ports:</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_PORTS.map((p) => (
                <button
                  key={p.port}
                  onClick={() => setPort(String(p.port))}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    port === String(p.port)
                      ? "border-green-600 bg-green-600/20 text-green-400"
                      : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                  }`}
                >
                  {p.port}{" "}
                  <span className="text-gray-500">({p.label})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-800 bg-red-900/20 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className={`flex items-start gap-4 rounded-xl border p-6 ${resultConfig[result].bg}`}
          >
            {(() => {
              const Icon = resultConfig[result].icon;
              return (
                <Icon
                  className={`mt-0.5 h-6 w-6 shrink-0 ${resultConfig[result].color}`}
                />
              );
            })()}
            <div>
              <h3
                className={`text-lg font-semibold ${resultConfig[result].color}`}
              >
                {resultConfig[result].label}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {checkedHost}:{checkedPort}
              </p>
              <p className="mt-2 text-sm text-gray-300">
                {resultConfig[result].desc}
              </p>
            </div>
          </div>
        )}

        {/* Info section */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-3 text-sm font-semibold text-white">
            About Port Checking
          </h3>
          <p className="text-sm leading-relaxed text-gray-400">
            This tool attempts to connect to the specified host and port from
            your browser. Due to browser security restrictions, only HTTP/HTTPS
            ports can be reliably checked. For non-HTTP ports (SSH, MySQL,
            etc.), use command-line tools like{" "}
            <code className="rounded bg-gray-800 px-1.5 py-0.5 text-green-400">
              nmap -p PORT HOST
            </code>{" "}
            or{" "}
            <code className="rounded bg-gray-800 px-1.5 py-0.5 text-green-400">
              nc -zv HOST PORT
            </code>{" "}
            for accurate results.
          </p>
        </div>
      </div>
  );
}
