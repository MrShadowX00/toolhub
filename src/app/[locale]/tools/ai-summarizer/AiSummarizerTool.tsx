"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type SummaryLength = "short" | "medium" | "long";

function splitSentences(text: string): string[] {
  const raw = text.match(/[^.!?]+[.!?]+/g);
  if (!raw) return [text.trim()].filter(Boolean);
  return raw.map((s) => s.trim()).filter((s) => s.length > 10);
}

function getWordFrequencies(text: string): Map<string, number> {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "to", "of", "in", "for", "on", "with", "at", "by", "from", "as",
    "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "each",
    "every", "both", "few", "more", "most", "other", "some", "such", "no",
    "not", "only", "own", "same", "so", "than", "too", "very", "just",
    "because", "but", "and", "or", "if", "while", "although", "this",
    "that", "these", "those", "i", "me", "my", "we", "our", "you", "your",
    "he", "him", "his", "she", "her", "it", "its", "they", "them", "their",
    "what", "which", "who", "whom", "this", "that", "am", "about", "up",
  ]);

  const freq = new Map<string, number>();
  const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
  for (const word of words) {
    if (word.length > 2 && !stopWords.has(word)) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }
  return freq;
}

function scoreSentence(
  sentence: string,
  wordFreq: Map<string, number>,
  position: number,
  totalSentences: number
): number {
  const words = sentence.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);

  // Word frequency score
  let freqScore = 0;
  for (const word of words) {
    freqScore += wordFreq.get(word) || 0;
  }
  freqScore = words.length > 0 ? freqScore / words.length : 0;

  // Position score: first and last sentences are more important
  let posScore = 0;
  if (position === 0) posScore = 1.5;
  else if (position === totalSentences - 1) posScore = 1.2;
  else if (position < totalSentences * 0.2) posScore = 1.0;
  else posScore = 0.5;

  // Length penalty: very short or very long sentences get penalized
  let lenScore = 1;
  if (words.length < 5) lenScore = 0.5;
  else if (words.length > 40) lenScore = 0.7;

  return freqScore * posScore * lenScore;
}

function summarizeText(text: string, length: SummaryLength): string[] {
  if (!text.trim()) return [];

  const sentences = splitSentences(text);
  if (sentences.length === 0) return [];

  const wordFreq = getWordFrequencies(text);

  // Score each sentence
  const scored = sentences.map((sentence, i) => ({
    sentence,
    score: scoreSentence(sentence, wordFreq, i, sentences.length),
    originalIndex: i,
  }));

  // Determine how many sentences to include
  let count: number;
  if (length === "short") {
    count = Math.max(1, Math.ceil(sentences.length * 0.2));
  } else if (length === "medium") {
    count = Math.max(2, Math.ceil(sentences.length * 0.4));
  } else {
    count = Math.max(3, Math.ceil(sentences.length * 0.6));
  }
  count = Math.min(count, sentences.length);

  // Sort by score, take top N, then re-sort by original position
  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.originalIndex - b.originalIndex);

  return topSentences.map((s) => s.sentence);
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export default function AiSummarizerTool() {
  const t = useTranslations("toolUi");
  const [input, setInput] = useState("");
  const [length, setLength] = useState<SummaryLength>("medium");
  const [bullets, setBullets] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleSummarize = useCallback(() => {
    setBullets(summarizeText(input, length));
  }, [input, length]);

  const handleCopy = useCallback(async () => {
    if (bullets.length === 0) return;
    const text = bullets.map((b) => `- ${b}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [bullets]);

  const handleClear = useCallback(() => {
    setInput("");
    setBullets([]);
  }, []);

  const summaryText = bullets.join(" ");

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Text to Summarize
          </label>
          <span className="text-xs text-gray-500">
            {countWords(input)} words
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a long article, essay, or any text you want to summarize..."
          rows={10}
          className="w-full resize-y rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500"
        />
      </div>

      {/* Summary Length Slider */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <label className="mb-4 block text-sm font-medium text-gray-300">
          Summary Length
        </label>
        <div className="flex items-center gap-4">
          {(["short", "medium", "long"] as SummaryLength[]).map((len) => (
            <button
              key={len}
              onClick={() => setLength(len)}
              className={`flex-1 rounded-lg border py-3 text-center text-sm font-medium capitalize transition-all ${
                length === len
                  ? "border-indigo-500 bg-indigo-600/20 text-white"
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
              }`}
            >
              {len}
              <div className="mt-1 text-xs opacity-60">
                {len === "short" ? "~20%" : len === "medium" ? "~40%" : "~60%"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSummarize}
          disabled={!input.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Summarize
        </button>
        <button
          onClick={handleClear}
          className="rounded-lg border border-gray-700 px-4 py-2 text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
        >
          {t("clear")}
        </button>
      </div>

      {/* Results */}
      {bullets.length > 0 && (
        <div className="space-y-4">
          {/* Word Count Comparison */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="text-xs text-gray-500">Original</p>
              <p className="text-2xl font-bold text-white">{countWords(input)}</p>
              <p className="text-xs text-gray-500">words</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="text-xs text-gray-500">Summary</p>
              <p className="text-2xl font-bold text-indigo-400">{countWords(summaryText)}</p>
              <p className="text-xs text-gray-500">words</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="text-xs text-gray-500">Reduced by</p>
              <p className="text-2xl font-bold text-green-400">
                {countWords(input) > 0
                  ? Math.round((1 - countWords(summaryText) / countWords(input)) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-500">smaller</p>
            </div>
          </div>

          {/* Bullet Points */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-400">Summary</h3>
              <button
                onClick={handleCopy}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs text-white transition-colors hover:bg-indigo-500"
              >
                {copied ? "Copied!" : t("copy")}
              </button>
            </div>
            <ul className="space-y-3">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-gray-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600/30 text-xs font-bold text-indigo-400">
                    {i + 1}
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
