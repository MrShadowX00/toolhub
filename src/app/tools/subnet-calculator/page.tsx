"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ui/ToolLayout";

// ── helpers ──────────────────────────────────────────────────────────

type Octets = [number, number, number, number];

function isValidOctet(v: number): boolean {
  return Number.isInteger(v) && v >= 0 && v <= 255;
}

function octetsToUint32(o: Octets): number {
  return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0;
}

function uint32ToOctets(n: number): Octets {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ];
}

function cidrToMask(cidr: number): number {
  if (cidr === 0) return 0;
  return (~0 << (32 - cidr)) >>> 0;
}

function maskToCidr(mask: number): number | null {
  let ones = 0;
  let seenZero = false;
  for (let i = 31; i >= 0; i--) {
    const bit = (mask >>> i) & 1;
    if (bit === 1) {
      if (seenZero) return null; // not contiguous
      ones++;
    } else {
      seenZero = true;
    }
  }
  return ones;
}

function formatOctets(o: Octets): string {
  return o.join(".");
}

function octetToBinary(v: number): string {
  return v.toString(2).padStart(8, "0");
}

function octetsToBinaryString(o: Octets): string {
  return o.map(octetToBinary).join(".");
}

function getIpClass(firstOctet: number): string {
  if (firstOctet >= 1 && firstOctet <= 126) return "A";
  if (firstOctet >= 128 && firstOctet <= 191) return "B";
  if (firstOctet >= 192 && firstOctet <= 223) return "C";
  if (firstOctet >= 224 && firstOctet <= 239) return "D";
  if (firstOctet >= 240 && firstOctet <= 255) return "E";
  return "N/A";
}

function usableHosts(cidr: number): number {
  if (cidr >= 31) return cidr === 32 ? 1 : 2;
  return Math.pow(2, 32 - cidr) - 2;
}

// ── types ────────────────────────────────────────────────────────────

interface SubnetResult {
  networkAddress: Octets;
  broadcastAddress: Octets;
  firstUsable: Octets;
  lastUsable: Octets;
  usableHostCount: number;
  subnetMask: Octets;
  wildcardMask: Octets;
  ipClass: string;
}

function calculateSubnet(ip: Octets, cidr: number): SubnetResult {
  const ipNum = octetsToUint32(ip);
  const mask = cidrToMask(cidr);
  const wildcard = (~mask) >>> 0;

  const network = (ipNum & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;

  let first: number;
  let last: number;
  if (cidr >= 31) {
    first = network;
    last = broadcast;
  } else {
    first = (network + 1) >>> 0;
    last = (broadcast - 1) >>> 0;
  }

  return {
    networkAddress: uint32ToOctets(network),
    broadcastAddress: uint32ToOctets(broadcast),
    firstUsable: uint32ToOctets(first),
    lastUsable: uint32ToOctets(last),
    usableHostCount: usableHosts(cidr),
    subnetMask: uint32ToOctets(mask),
    wildcardMask: uint32ToOctets(wildcard),
    ipClass: getIpClass(ip[0]),
  };
}

// ── components ───────────────────────────────────────────────────────

function ResultCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-orange-400">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="font-mono text-sm text-white">{value}</span>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────

export default function SubnetCalculatorPage() {
  const [octets, setOctets] = useState<Octets>([192, 168, 1, 0]);
  const [cidr, setCidr] = useState<number>(24);
  const [maskInput, setMaskInput] = useState<string>("255.255.255.0");
  const [errors, setErrors] = useState<string[]>([]);

  const updateCidr = useCallback(
    (newCidr: number) => {
      setCidr(newCidr);
      const maskOctets = uint32ToOctets(cidrToMask(newCidr));
      setMaskInput(formatOctets(maskOctets));
    },
    [],
  );

  const handleOctetChange = useCallback(
    (index: number, raw: string) => {
      const val = raw === "" ? 0 : parseInt(raw, 10);
      if (isNaN(val)) return;
      const clamped = Math.min(255, Math.max(0, val));
      setOctets((prev) => {
        const next = [...prev] as Octets;
        next[index] = clamped;
        return next;
      });
    },
    [],
  );

  const handleMaskChange = useCallback(
    (raw: string) => {
      setMaskInput(raw);
      const parts = raw.split(".");
      if (parts.length !== 4) return;
      const nums = parts.map((p) => parseInt(p, 10));
      if (nums.some((n) => isNaN(n) || !isValidOctet(n))) return;

      const maskNum = octetsToUint32(nums as Octets);
      const c = maskToCidr(maskNum);
      if (c !== null) {
        setCidr(c);
        setErrors([]);
      } else {
        setErrors(["Invalid subnet mask (bits must be contiguous)"]);
      }
    },
    [],
  );

  // validate
  const validationErrors: string[] = [...errors];
  if (octets.some((o) => !isValidOctet(o))) {
    validationErrors.push("Each IP octet must be between 0 and 255");
  }

  const isValid = validationErrors.length === 0;
  const result = isValid ? calculateSubnet(octets, cidr) : null;

  return (
    <ToolLayout
      title="Subnet Calculator"
      description="Calculate subnet details, network ranges, and binary representations"
      category="Calculators"
    >
      <div className="space-y-6">
        {/* ── Input Section ────────────────────────────────── */}
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-5 text-lg font-semibold text-white">Input</h2>

          {/* IP Address */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              IP Address
            </label>
            <div className="flex items-center gap-1">
              {octets.map((octet, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={octet}
                    onChange={(e) => handleOctetChange(i, e.target.value)}
                    className="w-20 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  {i < 3 && (
                    <span className="text-lg font-bold text-gray-500">.</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CIDR */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              CIDR Prefix Length: /{cidr}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={32}
                value={cidr}
                onChange={(e) => updateCidr(parseInt(e.target.value, 10))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-700 accent-orange-500"
              />
              <input
                type="number"
                min={0}
                max={32}
                value={cidr}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 0 && v <= 32) updateCidr(v);
                }}
                className="w-20 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Subnet Mask (alternative input) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Subnet Mask (alternative)
            </label>
            <input
              type="text"
              value={maskInput}
              onChange={(e) => handleMaskChange(e.target.value)}
              placeholder="255.255.255.0"
              className="w-full max-w-xs rounded-md border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 rounded-md border border-red-800 bg-red-900/30 px-4 py-3">
              {validationErrors.map((err, i) => (
                <p key={i} className="text-sm text-red-400">
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* ── Results ──────────────────────────────────────── */}
        {result && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Network Info */}
            <ResultCard title="Network Information">
              <ResultRow
                label="Network Address"
                value={formatOctets(result.networkAddress)}
              />
              <ResultRow
                label="Broadcast Address"
                value={formatOctets(result.broadcastAddress)}
              />
              <ResultRow
                label="First Usable Host"
                value={formatOctets(result.firstUsable)}
              />
              <ResultRow
                label="Last Usable Host"
                value={formatOctets(result.lastUsable)}
              />
              <ResultRow
                label="Usable Hosts"
                value={result.usableHostCount.toLocaleString()}
              />
              <ResultRow label="IP Class" value={result.ipClass} />
            </ResultCard>

            {/* Masks */}
            <ResultCard title="Subnet & Wildcard Masks">
              <ResultRow
                label="Subnet Mask"
                value={formatOctets(result.subnetMask)}
              />
              <ResultRow
                label="Wildcard Mask"
                value={formatOctets(result.wildcardMask)}
              />
              <ResultRow label="CIDR Notation" value={`/${cidr}`} />
            </ResultCard>

            {/* Binary Representations */}
            <ResultCard title="IP Address (Binary)">
              <div className="space-y-1">
                {octets.map((o, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-10 text-right font-mono text-sm text-gray-400">
                      {o}
                    </span>
                    <span className="font-mono text-sm tracking-wider text-white">
                      {octetToBinary(o)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 border-t border-gray-700 pt-2">
                <ResultRow
                  label="Full Binary"
                  value={octetsToBinaryString(octets)}
                />
              </div>
            </ResultCard>

            <ResultCard title="Subnet Mask (Binary)">
              <div className="space-y-1">
                {result.subnetMask.map((o, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-10 text-right font-mono text-sm text-gray-400">
                      {o}
                    </span>
                    <span className="font-mono text-sm tracking-wider text-white">
                      {octetToBinary(o)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 border-t border-gray-700 pt-2">
                <ResultRow
                  label="Full Binary"
                  value={octetsToBinaryString(result.subnetMask)}
                />
              </div>
            </ResultCard>

            {/* CIDR Range Summary */}
            <div className="md:col-span-2">
              <ResultCard title="CIDR Range Summary">
                <div className="rounded-md border border-gray-700 bg-gray-900 px-4 py-3">
                  <p className="font-mono text-sm text-orange-400">
                    {formatOctets(octets)}/{cidr}
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-400">
                    {formatOctets(result.networkAddress)} &ndash;{" "}
                    {formatOctets(result.broadcastAddress)} (
                    {result.usableHostCount.toLocaleString()} usable host
                    {result.usableHostCount !== 1 ? "s" : ""})
                  </p>
                </div>
              </ResultCard>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
