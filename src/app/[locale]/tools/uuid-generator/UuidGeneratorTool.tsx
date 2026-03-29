"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Copy,
  Check,
  RefreshCw,
  Fingerprint,
  Hash,
  Shuffle,
} from "lucide-react";

type Tab = "uuid" | "ulid" | "random";

const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encodeTime(now: number, len: number): string {
  let str = "";
  let t = now;
  for (let i = len; i > 0; i--) {
    const mod = t % 32;
    str = ENCODING[mod] + str;
    t = (t - mod) / 32;
  }
  return str;
}

function encodeRandom(len: number): string {
  let str = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) {
    str += ENCODING[arr[i] % 32];
  }
  return str;
}

function generateULID(): string {
  return encodeTime(Date.now(), 10) + encodeRandom(16);
}

function generateRandomString(
  length: number,
  opts: { upper: boolean; lower: boolean; numbers: boolean; special: boolean }
): string {
  let charset = "";
  if (opts.upper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.lower) charset += "abcdefghijklmnopqrstuvwxyz";
  if (opts.numbers) charset += "0123456789";
  if (opts.special) charset += "!@#$%^&*()-_=+[]{}|;:,.<>?";
  if (!charset) charset = "abcdefghijklmnopqrstuvwxyz";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => charset[v % charset.length]).join("");
}

export default function UuidGeneratorTool() {
  const t = useTranslations("toolUi");
  const [tab, setTab] = useState<Tab>("uuid");
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const [ulids, setUlids] = useState<string[]>([]);
  const [ulidCount, setUlidCount] = useState(5);

  const [randomStrings, setRandomStrings] = useState<string[]>([]);
  const [rsCount, setRsCount] = useState(5);
  const [rsLength, setRsLength] = useState(32);
  const [rsUpper, setRsUpper] = useState(true);
  const [rsLower, setRsLower] = useState(true);
  const [rsNumbers, setRsNumbers] = useState(true);
  const [rsSpecial, setRsSpecial] = useState(false);

  const generateUUIDs = useCallback(() => {
    setUuids(Array.from({ length: count }, () => crypto.randomUUID()));
  }, [count]);

  const generateULIDs = useCallback(() => {
    setUlids(Array.from({ length: ulidCount }, () => generateULID()));
  }, [ulidCount]);

  const generateRS = useCallback(() => {
    setRandomStrings(
      Array.from({ length: rsCount }, () =>
        generateRandomString(rsLength, { upper: rsUpper, lower: rsLower, numbers: rsNumbers, special: rsSpecial })
      )
    );
  }, [rsCount, rsLength, rsUpper, rsLower, rsNumbers, rsSpecial]);

  const copyOne = async (value: string, idx: number) => {
    await navigator.clipboard.writeText(value);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const copyAll = async (items: string[]) => {
    await navigator.clipboard.writeText(items.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const currentItems = tab === "uuid" ? uuids : tab === "ulid" ? ulids : randomStrings;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "uuid", label: "UUID v4", icon: <Fingerprint className="h-4 w-4" /> },
    { id: "ulid", label: "ULID", icon: <Hash className="h-4 w-4" /> },
    { id: "random", label: t("generate"), icon: <Shuffle className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-800 bg-gray-900 p-1">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === tb.id
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {tb.icon}
            {tb.label}
          </button>
        ))}
      </div>

      {/* UUID Controls */}
      {tab === "uuid" && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">{t("count")} (1-100)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-24 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <button
              onClick={generateUUIDs}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
            >
              <RefreshCw className="h-4 w-4" />
              {t("generate")}
            </button>
            {uuids.length > 0 && (
              <button
                onClick={() => copyAll(uuids)}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700"
              >
                {copiedAll ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                {copiedAll ? t("copied") : t("copyToClipboard")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ULID Controls */}
      {tab === "ulid" && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <p className="text-xs text-gray-500">
            ULID = Universally Unique Lexicographically Sortable Identifier. 10 chars timestamp + 16 chars randomness, Crockford Base32.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">{t("count")} (1-100)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={ulidCount}
                onChange={(e) => setUlidCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-24 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <button
              onClick={generateULIDs}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
            >
              <RefreshCw className="h-4 w-4" />
              {t("generate")}
            </button>
            {ulids.length > 0 && (
              <button
                onClick={() => copyAll(ulids)}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700"
              >
                {copiedAll ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                {copiedAll ? t("copied") : t("copyToClipboard")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Random String Controls */}
      {tab === "random" && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">{t("length")}: {rsLength}</label>
              <input
                type="range"
                min={4}
                max={128}
                value={rsLength}
                onChange={(e) => setRsLength(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>4</span>
                <span>128</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">{t("count")} (1-100)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={rsCount}
                onChange={(e) => setRsCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-24 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { label: t("uppercase"), checked: rsUpper, set: setRsUpper },
              { label: t("lowercase"), checked: rsLower, set: setRsLower },
              { label: t("numbers"), checked: rsNumbers, set: setRsNumbers },
              { label: t("special"), checked: rsSpecial, set: setRsSpecial },
            ].map((opt) => (
              <label
                key={opt.label}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={(e) => opt.set(e.target.checked)}
                  className="accent-purple-500"
                />
                {opt.label}
              </label>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateRS}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
            >
              <RefreshCw className="h-4 w-4" />
              {t("generate")}
            </button>
            {randomStrings.length > 0 && (
              <button
                onClick={() => copyAll(randomStrings)}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700"
              >
                {copiedAll ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                {copiedAll ? t("copied") : t("copyToClipboard")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {currentItems.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-3 text-sm font-medium text-gray-400">
            {t("result")} ({currentItems.length})
          </h3>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {currentItems.map((item, i) => (
              <div
                key={`${tab}-${i}-${item}`}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2"
              >
                <code className="flex-1 overflow-x-auto font-mono text-sm text-green-400">
                  {item}
                </code>
                <button
                  onClick={() => copyOne(item, i)}
                  className="shrink-0 rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                  title={t("copy")}
                >
                  {copiedIdx === i ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/50 py-16">
          <Fingerprint className="mb-3 h-10 w-10 text-gray-600" />
          <p className="text-sm text-gray-500">{t("resultWillAppear")}</p>
        </div>
      )}
    </div>
  );
}
