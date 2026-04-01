"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, RefreshCw, Shield } from "lucide-react";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const SIMILAR = "0OlI1";

interface StrengthResult {
  label: string;
  color: string;
  bgColor: string;
  percent: number;
}

function calcStrength(password: string): StrengthResult {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
  const entropy = password.length * Math.log2(poolSize || 1);

  if (entropy < 28) return { label: "Weak", color: "text-red-400", bgColor: "bg-red-500", percent: 20 };
  if (entropy < 36) return { label: "Fair", color: "text-orange-400", bgColor: "bg-orange-500", percent: 40 };
  if (entropy < 60) return { label: "Medium", color: "text-yellow-400", bgColor: "bg-yellow-500", percent: 60 };
  if (entropy < 80) return { label: "Strong", color: "text-green-400", bgColor: "bg-green-500", percent: 80 };
  return { label: "Very Strong", color: "text-emerald-400", bgColor: "bg-emerald-500", percent: 100 };
}

function calcEntropy(length: number, poolSize: number): number {
  return Math.round(length * Math.log2(poolSize || 1));
}

export default function PasswordGeneratorTool() {
  const t = useTranslations("toolUi");

  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generatePassword = useCallback((): string => {
    let charset = "";
    if (useUpper) charset += UPPER;
    if (useLower) charset += LOWER;
    if (useDigits) charset += DIGITS;
    if (useSymbols) charset += SYMBOLS;

    if (!charset) charset = LOWER; // fallback

    if (excludeSimilar) {
      charset = charset.split("").filter((c) => !SIMILAR.includes(c)).join("");
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (n) => charset[n % charset.length]).join("");
  }, [length, useUpper, useLower, useDigits, useSymbols, excludeSimilar]);

  const generateAll = useCallback(() => {
    setPasswords(Array.from({ length: 5 }, () => generatePassword()));
    setCopiedIdx(null);
  }, [generatePassword]);

  useEffect(() => {
    generateAll();
  }, [generateAll]);

  const handleCopy = async (pw: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(pw);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  // Pool size calculation
  let poolSize = 0;
  if (useUpper) poolSize += excludeSimilar ? UPPER.split("").filter((c) => !SIMILAR.includes(c)).length : 26;
  if (useLower) poolSize += excludeSimilar ? LOWER.split("").filter((c) => !SIMILAR.includes(c)).length : 26;
  if (useDigits) poolSize += excludeSimilar ? DIGITS.split("").filter((c) => !SIMILAR.includes(c)).length : 10;
  if (useSymbols) poolSize += SYMBOLS.length;
  if (poolSize === 0) poolSize = 26;

  const entropy = calcEntropy(length, poolSize);
  const mainStrength = passwords[0] ? calcStrength(passwords[0]) : null;

  const inputCls = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none";
  const labelCls = "block text-sm font-medium text-gray-400 mb-1";
  const btnCls = "bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors";

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-5">
        <h3 className="text-lg font-semibold text-white">Settings</h3>

        {/* Length slider */}
        <div>
          <label className={labelCls}>Password Length: <span className="text-white font-semibold">{length}</span></label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">8</span>
            <input
              type="range"
              min={8}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs text-gray-500">128</span>
            <input
              type="number"
              min={8}
              max={128}
              value={length}
              onChange={(e) => setLength(Math.max(8, Math.min(128, Number(e.target.value))))}
              className="w-16 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white text-center text-sm"
            />
          </div>
        </div>

        {/* Character type toggles */}
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Uppercase (A-Z)", checked: useUpper, set: setUseUpper },
            { label: "Lowercase (a-z)", checked: useLower, set: setUseLower },
            { label: "Numbers (0-9)", checked: useDigits, set: setUseDigits },
            { label: "Symbols (!@#$...)", checked: useSymbols, set: setUseSymbols },
            { label: "Exclude similar (0,O,l,1,I)", checked: excludeSimilar, set: setExcludeSimilar },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={opt.checked}
                onChange={(e) => opt.set(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-300">{opt.label}</span>
            </label>
          ))}
        </div>

        {/* Info bar */}
        <div className="flex items-center gap-4 flex-wrap text-sm">
          <span className="text-gray-400">
            <Shield size={14} className="inline mr-1" />
            Entropy: <span className="text-white font-semibold">{entropy} bits</span>
          </span>
          <span className="text-gray-400">
            Pool size: <span className="text-white font-semibold">{poolSize}</span> characters
          </span>
        </div>

        <button onClick={generateAll} className={btnCls}>
          <RefreshCw size={16} /> Generate Passwords
        </button>
      </div>

      {/* Passwords */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Generated Passwords</h3>

        {/* Strength meter for first password */}
        {mainStrength && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Strength</span>
              <span className={mainStrength.color}>{mainStrength.label}</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${mainStrength.bgColor}`}
                style={{ width: `${mainStrength.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Password list */}
        <div className="space-y-2">
          {passwords.map((pw, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg p-3">
              <code className="flex-1 text-sm text-gray-200 font-mono break-all select-all">{pw}</code>
              <button
                onClick={() => handleCopy(pw, idx)}
                className="shrink-0 text-gray-400 hover:text-white transition-colors p-1"
                title="Copy"
              >
                {copiedIdx === idx ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
