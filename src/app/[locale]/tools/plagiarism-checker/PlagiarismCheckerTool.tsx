"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface SentenceResult {
  text: string;
  uniquenessScore: number;
  flags: string[];
}

// Common cliche / overused phrases that reduce uniqueness
const CLICHE_PHRASES = [
  "in today's world",
  "it goes without saying",
  "at the end of the day",
  "in conclusion",
  "first and foremost",
  "last but not least",
  "needless to say",
  "as a matter of fact",
  "in the final analysis",
  "when all is said and done",
  "it is important to note",
  "it should be noted that",
  "in light of the fact",
  "for all intents and purposes",
  "by and large",
  "due to the fact that",
  "in order to",
  "on the other hand",
  "as previously mentioned",
  "it is widely known",
  "research has shown that",
  "studies have shown that",
  "experts agree that",
  "it is commonly believed",
  "throughout history",
  "since the dawn of time",
  "in this day and age",
  "plays a crucial role",
  "plays a vital role",
  "a wide range of",
];

function getNGrams(text: string, n: number): string[] {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
  const grams: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    grams.push(words.slice(i, i + n).join(" "));
  }
  return grams;
}

function analyzeSentence(sentence: string, allSentences: string[], index: number): SentenceResult {
  const flags: string[] = [];
  let score = 100;
  const lower = sentence.toLowerCase();

  // Check for cliche phrases
  for (const cliche of CLICHE_PHRASES) {
    if (lower.includes(cliche)) {
      flags.push(`Contains common phrase: "${cliche}"`);
      score -= 15;
    }
  }

  // Check for repetitive n-grams (repeated 4-grams across other sentences)
  const sentenceGrams = new Set(getNGrams(sentence, 4));
  let sharedGrams = 0;
  for (let i = 0; i < allSentences.length; i++) {
    if (i === index) continue;
    const otherGrams = getNGrams(allSentences[i], 4);
    for (const gram of otherGrams) {
      if (sentenceGrams.has(gram)) {
        sharedGrams++;
      }
    }
  }
  if (sharedGrams > 2) {
    flags.push("Contains phrases repeated elsewhere in the text");
    score -= Math.min(25, sharedGrams * 5);
  }

  // Check for overly generic sentences
  const words = sentence.split(/\s+/);
  const genericWords = new Set(["the", "a", "is", "are", "was", "were", "it", "this", "that", "be", "to", "of", "and", "in", "for"]);
  const genericRatio = words.filter((w) => genericWords.has(w.toLowerCase())).length / words.length;
  if (genericRatio > 0.5 && words.length > 5) {
    flags.push("Sentence structure is overly generic");
    score -= 10;
  }

  // Check sentence length (very short = potentially quoted)
  if (words.length < 4 && words.length > 0) {
    flags.push("Very short sentence fragment");
    score -= 5;
  }

  // Check for Wikipedia-style patterns
  if (/\b\d{4}\b/.test(sentence) && /\bwas\b|\bwere\b|\bfounded\b|\bestablished\b/.test(lower)) {
    flags.push("Appears to contain factual claims (verify source)");
    score -= 10;
  }

  // Check for direct quote patterns
  if (/[""][^""]+[""]/.test(sentence)) {
    flags.push("Contains a quoted phrase");
    score -= 5;
  }

  return {
    text: sentence,
    uniquenessScore: Math.max(0, Math.min(100, score)),
    flags,
  };
}

function analyzeText(text: string): { results: SentenceResult[]; overall: number } {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const cleaned = sentences.map((s) => s.trim()).filter((s) => s.length > 5);

  if (cleaned.length === 0) return { results: [], overall: 100 };

  const results = cleaned.map((sentence, i) => analyzeSentence(sentence, cleaned, i));
  const overall = Math.round(results.reduce((sum, r) => sum + r.uniquenessScore, 0) / results.length);

  return { results, overall };
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function getHighlightBg(score: number): string {
  if (score >= 80) return "";
  if (score >= 60) return "bg-yellow-500/10 border-l-2 border-yellow-500 pl-3";
  if (score >= 40) return "bg-orange-500/10 border-l-2 border-orange-500 pl-3";
  return "bg-red-500/10 border-l-2 border-red-500 pl-3";
}

export default function PlagiarismCheckerTool() {
  const t = useTranslations("toolUi");
  const [input, setInput] = useState("");
  const [results, setResults] = useState<SentenceResult[]>([]);
  const [overall, setOverall] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);

  const handleCheck = useCallback(() => {
    setChecking(true);
    // Simulate a brief processing delay for UX
    setTimeout(() => {
      const analysis = analyzeText(input);
      setResults(analysis.results);
      setOverall(analysis.overall);
      setChecking(false);
    }, 500);
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setResults([]);
    setOverall(null);
  }, []);

  const flaggedCount = results.filter((r) => r.flags.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Enter text to check
          </label>
          <span className="text-xs text-gray-500">
            {input.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your text here to check for potential plagiarism patterns..."
          rows={8}
          className="w-full resize-y rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500"
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleCheck}
            disabled={!input.trim() || checking}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? "Checking..." : "Check Plagiarism"}
          </button>
          <button
            onClick={handleClear}
            className="rounded-lg border border-gray-700 px-4 py-2 text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
          >
            {t("clear")}
          </button>
        </div>
      </div>

      {/* Overall Score */}
      {overall !== null && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
          <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-400">
            Uniqueness Score
          </p>
          <p className={`text-5xl font-bold ${getScoreColor(overall)}`}>
            {overall}%
          </p>
          <div className="mx-auto mt-4 h-3 max-w-md overflow-hidden rounded-full bg-gray-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getScoreBg(overall)}`}
              style={{ width: `${overall}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-800 p-3">
              <p className="text-lg font-bold text-white">{results.length}</p>
              <p className="text-xs text-gray-500">Sentences</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-3">
              <p className="text-lg font-bold text-yellow-400">{flaggedCount}</p>
              <p className="text-xs text-gray-500">Flagged</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-3">
              <p className="text-lg font-bold text-green-400">{results.length - flaggedCount}</p>
              <p className="text-xs text-gray-500">Clean</p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      {results.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
            Sentence Analysis
          </h3>
          <div className="space-y-3">
            {results.map((result, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 ${getHighlightBg(result.uniquenessScore)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-relaxed text-gray-300">{result.text}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      result.uniquenessScore >= 80
                        ? "bg-green-500/20 text-green-400"
                        : result.uniquenessScore >= 60
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {result.uniquenessScore}%
                  </span>
                </div>
                {result.flags.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.flags.map((flag, j) => (
                      <p key={j} className="text-xs text-yellow-400">
                        &#9888; {flag}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-yellow-400">
          Important Note
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="mt-0.5 text-yellow-500">&#8226;</span>
            This tool performs client-side heuristic analysis, not internet comparison
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-yellow-500">&#8226;</span>
            It detects common patterns, cliches, and structural issues
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-yellow-500">&#8226;</span>
            For full plagiarism detection, use services that compare against databases
          </li>
        </ul>
      </div>
    </div>
  );
}
