"use client";

import { useState, useCallback } from "react";
import { Copy, Check, AlertTriangle, CheckCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signatureHex: string;
}

interface DecodeSuccess {
  ok: true;
  parts: JwtParts;
}

interface DecodeError {
  ok: false;
  message: string;
}

type DecodeResult = DecodeSuccess | DecodeError;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function base64UrlDecode(str: string): string {
  // Convert base64url to standard base64
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Pad with "=" to make length a multiple of 4
  while (b64.length % 4 !== 0) {
    b64 += "=";
  }
  return atob(b64);
}

function base64UrlToHex(str: string): string {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) {
    b64 += "=";
  }
  try {
    const binary = atob(b64);
    return Array.from(binary)
      .map((ch) => ch.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return str; // fallback: return raw if atob fails
  }
}

function decodeJwt(token: string): DecodeResult {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, message: "Input is empty." };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      ok: false,
      message: `Invalid JWT: expected 3 parts separated by dots, got ${parts.length}.`,
    };
  }

  const [headerB64, payloadB64, sigB64] = parts;

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    header = JSON.parse(base64UrlDecode(headerB64)) as Record<string, unknown>;
  } catch {
    return { ok: false, message: "Invalid JWT: header is not valid base64url JSON." };
  }

  try {
    payload = JSON.parse(base64UrlDecode(payloadB64)) as Record<string, unknown>;
  } catch {
    return { ok: false, message: "Invalid JWT: payload is not valid base64url JSON." };
  }

  const signatureHex = base64UrlToHex(sigB64);

  return { ok: true, parts: { header, payload, signatureHex } };
}

function formatTimestamp(value: unknown): string | null {
  if (typeof value !== "number") return null;
  try {
    return new Date(value * 1000).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "long",
    });
  } catch {
    return null;
  }
}

function getExpiryStatus(payload: Record<string, unknown>): "expired" | "valid" | "none" {
  if (typeof payload.exp !== "number") return "none";
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp < nowSec ? "expired" : "valid";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface CopyButtonProps {
  text: string;
  label?: string;
}

function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        copied
          ? "bg-green-600/20 text-green-400"
          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
      }`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}

interface SectionPanelProps {
  title: string;
  badge?: React.ReactNode;
  content: string;
  mono?: boolean;
  accentClass?: string;
}

function SectionPanel({
  title,
  badge,
  content,
  accentClass = "border-gray-700",
}: SectionPanelProps) {
  return (
    <div className={`rounded-xl border bg-gray-900 overflow-hidden ${accentClass}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">{title}</span>
          {badge}
        </div>
        <CopyButton text={content} />
      </div>
      <pre className="p-4 text-sm font-mono text-gray-100 overflow-x-auto leading-relaxed whitespace-pre">
        {content}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timestamp annotations
// ---------------------------------------------------------------------------

const TIMESTAMP_CLAIMS = ["iat", "exp", "nbf"] as const;
type TimestampClaim = (typeof TIMESTAMP_CLAIMS)[number];

const CLAIM_LABELS: Record<TimestampClaim, string> = {
  iat: "Issued At",
  exp: "Expires",
  nbf: "Not Before",
};

interface TimestampRowsProps {
  payload: Record<string, unknown>;
  expiryStatus: "expired" | "valid" | "none";
}

function TimestampRows({ payload, expiryStatus }: TimestampRowsProps) {
  const rows = TIMESTAMP_CLAIMS.flatMap((claim) => {
    const human = formatTimestamp(payload[claim]);
    if (!human) return [];
    return [{ claim, human }];
  });

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
        <span className="text-sm font-medium text-gray-300">Time Claims</span>
        {expiryStatus !== "none" && (
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${
              expiryStatus === "expired"
                ? "bg-red-500/15 text-red-400"
                : "bg-green-500/15 text-green-400"
            }`}
          >
            {expiryStatus === "expired" ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5" />
                Expired
              </>
            ) : (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Valid
              </>
            )}
          </span>
        )}
      </div>
      <div className="divide-y divide-gray-800">
        {rows.map(({ claim, human }) => (
          <div key={claim} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {CLAIM_LABELS[claim]}
              </span>
              <span className="ml-2 text-xs text-gray-500 font-mono">
                ({claim})
              </span>
            </div>
            <span
              className={`text-sm font-mono ${
                claim === "exp" && expiryStatus === "expired"
                  ? "text-red-400"
                  : claim === "exp" && expiryStatus === "valid"
                    ? "text-green-400"
                    : "text-gray-200"
              }`}
            >
              {human}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function JwtDecoderTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DecodeResult | null>(null);

  const handleDecode = useCallback(() => {
    setResult(decodeJwt(input));
  }, [input]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      setResult(null);
    },
    [],
  );

  const expiryStatus =
    result?.ok ? getExpiryStatus(result.parts.payload) : "none";

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
          <span className="text-sm font-medium text-gray-300">JWT Token</span>
          <span className="text-xs text-gray-500">
            {input.length.toLocaleString()} chars
          </span>
        </div>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Paste your JWT token here, e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
          className="w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 resize-none focus:outline-none placeholder-gray-600 min-h-[120px]"
          spellCheck={false}
        />
      </div>

      {/* Action button */}
      <div>
        <button
          onClick={handleDecode}
          disabled={!input.trim()}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-medium text-white transition-colors"
        >
          Decode
        </button>
      </div>

      {/* Error */}
      {result && !result.ok && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300">Invalid JWT</p>
            <p className="mt-0.5 text-sm text-red-400 font-mono break-all">
              {result.message}
            </p>
          </div>
        </div>
      )}

      {/* Decoded sections */}
      {result?.ok && (
        <div className="space-y-4">
          {/* Expiry / Time Claims */}
          <TimestampRows
            payload={result.parts.payload}
            expiryStatus={expiryStatus}
          />

          {/* Header */}
          <SectionPanel
            title="Header"
            content={JSON.stringify(result.parts.header, null, 2)}
          />

          {/* Payload */}
          <SectionPanel
            title="Payload"
            badge={
              expiryStatus !== "none" ? (
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    expiryStatus === "expired"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-green-500/15 text-green-400"
                  }`}
                >
                  {expiryStatus === "expired" ? (
                    <>
                      <AlertTriangle className="h-3 w-3" />
                      Expired
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Valid
                    </>
                  )}
                </span>
              ) : undefined
            }
            content={JSON.stringify(result.parts.payload, null, 2)}
            accentClass={
              expiryStatus === "expired"
                ? "border-red-500/40"
                : expiryStatus === "valid"
                  ? "border-green-500/30"
                  : "border-gray-700"
            }
          />

          {/* Signature */}
          <SectionPanel
            title="Signature (hex)"
            content={result.parts.signatureHex}
          />
        </div>
      )}
    </div>
  );
}
