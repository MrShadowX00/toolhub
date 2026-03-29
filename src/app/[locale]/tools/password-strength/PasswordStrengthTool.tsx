"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Eye,
  EyeOff,
  Check,
  X,
  Copy,
  RefreshCw,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
interface StrengthCheck {
  label: string;
  passed: boolean;
}

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  barColor: string;
  checks: StrengthCheck[];
  entropy: number;
  crackTime: string;
}

interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  special: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────
const COMMON_PATTERNS = [
  "password",
  "123456",
  "qwerty",
  "abc123",
  "letmein",
  "admin",
  "welcome",
  "monkey",
  "dragon",
  "master",
  "login",
  "111111",
];

const SEQUENTIAL_CHARS = [
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
];

const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
const NUMBER_CHARS = "0123456789";
const SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~";

const STRENGTH_LEVELS: { label: string; color: string; barColor: string }[] = [
  { label: "Very Weak", color: "text-red-400", barColor: "bg-red-500" },
  { label: "Weak", color: "text-orange-400", barColor: "bg-orange-500" },
  { label: "Fair", color: "text-yellow-400", barColor: "bg-yellow-500" },
  { label: "Strong", color: "text-lime-400", barColor: "bg-lime-500" },
  { label: "Very Strong", color: "text-emerald-400", barColor: "bg-emerald-500" },
];

// ─── Helpers ─────────────────────────────────────────────────────────

function hasSequentialChars(pw: string): boolean {
  const lower = pw.toLowerCase();
  for (const seq of SEQUENTIAL_CHARS) {
    for (let i = 0; i <= lower.length - 3; i++) {
      const sub = lower.slice(i, i + 3);
      if (seq.includes(sub)) return true;
      // reversed
      const rev = sub.split("").reverse().join("");
      if (seq.includes(rev)) return true;
    }
  }
  return false;
}

function hasCommonPattern(pw: string): boolean {
  const lower = pw.toLowerCase();
  return COMMON_PATTERNS.some((p) => lower.includes(p)) || hasSequentialChars(pw);
}

function computeCharsetSize(pw: string): number {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/[0-9]/.test(pw)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) size += 32;
  return size;
}

function computeEntropy(pw: string): number {
  const charsetSize = computeCharsetSize(pw);
  if (charsetSize === 0 || pw.length === 0) return 0;
  return Math.log2(Math.pow(charsetSize, pw.length));
}

function formatCrackTime(entropy: number): string {
  if (entropy === 0) return "Instant";
  // 10 billion guesses per second
  const guessesPerSec = 10_000_000_000;
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSec;

  if (seconds < 1) return "< 1 second";
  if (seconds < 60) return `${Math.floor(seconds)} seconds`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)} minutes`;

  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)} hours`;

  const days = hours / 24;
  if (days < 365) return `${Math.floor(days)} days`;

  const years = days / 365;
  if (years < 100) return `${Math.floor(years)} years`;

  const centuries = years / 100;
  if (centuries >= 1e12) return "Billions of centuries";
  if (centuries >= 1e9) return `${(centuries / 1e9).toFixed(1)} billion centuries`;
  if (centuries >= 1e6) return `${(centuries / 1e6).toFixed(1)} million centuries`;
  if (centuries >= 1e3) return `${(centuries / 1e3).toFixed(1)} thousand centuries`;
  return `${Math.floor(centuries)} centuries`;
}

function analyzePassword(pw: string): StrengthResult {
  const checks: StrengthCheck[] = [
    { label: "At least 8 characters", passed: pw.length >= 8 },
    { label: "Contains uppercase letters", passed: /[A-Z]/.test(pw) },
    { label: "Contains lowercase letters", passed: /[a-z]/.test(pw) },
    { label: "Contains numbers", passed: /[0-9]/.test(pw) },
    { label: "Contains special characters", passed: /[^a-zA-Z0-9]/.test(pw) },
    { label: "No common patterns", passed: pw.length > 0 ? !hasCommonPattern(pw) : false },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const entropy = computeEntropy(pw);
  const crackTime = formatCrackTime(entropy);

  let score: number;
  if (pw.length === 0) score = 0;
  else if (passedCount <= 1) score = 0;
  else if (passedCount <= 2) score = 1;
  else if (passedCount <= 3) score = 2;
  else if (passedCount <= 4) score = 3;
  else score = 4;

  // Override: short passwords are never strong
  if (pw.length > 0 && pw.length < 8 && score > 2) score = 2;

  const level = STRENGTH_LEVELS[score];

  return {
    score,
    label: pw.length === 0 ? "" : level.label,
    color: level.color,
    barColor: level.barColor,
    checks,
    entropy,
    crackTime,
  };
}

function generateSecurePassword(options: GeneratorOptions): string {
  let charset = "";
  if (options.uppercase) charset += UPPERCASE_CHARS;
  if (options.lowercase) charset += LOWERCASE_CHARS;
  if (options.numbers) charset += NUMBER_CHARS;
  if (options.special) charset += SPECIAL_CHARS;

  if (charset.length === 0) return "";

  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  let password = "";
  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
}

// ─── Component ───────────────────────────────────────────────────────

export default function PasswordStrengthTool() {
  // Checker state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Generator state
  const [genOptions, setGenOptions] = useState<GeneratorOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true,
  });
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const strength = useMemo(() => analyzePassword(password), [password]);

  const handleGenerate = useCallback(() => {
    const pw = generateSecurePassword(genOptions);
    setGeneratedPassword(pw);
    setCopied(false);
  }, [genOptions]);

  const handleCopy = useCallback(async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, [generatedPassword]);

  return (
      <div className="space-y-8">
        {/* ── Password Checker ─────────────────────────────────── */}
        <section className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Check Password Strength
          </h2>

          {/* Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password to check..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Strength Meter */}
          {password.length > 0 && (
            <div className="mt-5 space-y-4">
              {/* Bar */}
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className={strength.color}>{strength.label}</span>
                  <span className="text-gray-400">
                    Entropy: {strength.entropy.toFixed(1)} bits
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        i <= strength.score
                          ? strength.barColor
                          : "bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Crack Time */}
              <div className="rounded-lg bg-gray-800 px-4 py-3">
                <p className="text-sm text-gray-400">
                  Estimated time to crack (10B guesses/sec):{" "}
                  <span className="font-semibold text-white">
                    {strength.crackTime}
                  </span>
                </p>
              </div>

              {/* Individual Checks */}
              <div className="grid gap-2 sm:grid-cols-2">
                {strength.checks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    {check.passed ? (
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <X className="h-4 w-4 shrink-0 text-red-400" />
                    )}
                    <span
                      className={
                        check.passed ? "text-gray-300" : "text-gray-500"
                      }
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Password Generator ───────────────────────────────── */}
        <section className="rounded-xl border border-gray-700 bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Generate Secure Password
          </h2>

          {/* Length slider */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <label htmlFor="pw-length" className="text-gray-300">
                Length
              </label>
              <span className="font-mono text-white">{genOptions.length}</span>
            </div>
            <input
              id="pw-length"
              type="range"
              min={8}
              max={128}
              value={genOptions.length}
              onChange={(e) =>
                setGenOptions((o) => ({
                  ...o,
                  length: Number(e.target.value),
                }))
              }
              className="w-full accent-blue-500"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>8</span>
              <span>128</span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            {(
              [
                ["uppercase", "Include uppercase"],
                ["lowercase", "Include lowercase"],
                ["numbers", "Include numbers"],
                ["special", "Include special characters"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={genOptions[key]}
                  onChange={(e) =>
                    setGenOptions((o) => ({ ...o, [key]: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 accent-blue-500"
                />
                {label}
              </label>
            ))}
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              !genOptions.uppercase &&
              !genOptions.lowercase &&
              !genOptions.numbers &&
              !genOptions.special
            }
            className="mb-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-4 w-4" />
            Generate Password
          </button>

          {/* Generated password display */}
          {generatedPassword && (
            <div className="relative rounded-lg border border-gray-700 bg-gray-800 p-4">
              <p className="break-all font-mono text-sm leading-relaxed text-emerald-300">
                {generatedPassword}
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-3 top-3 rounded-md border border-gray-600 bg-gray-700 p-1.5 text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
                aria-label="Copy to clipboard"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </section>
      </div>
  );
}
