"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Clock,
  Mic,
  BarChart3,
  Hash,
  AlignLeft,
  Space,
  Type,
} from "lucide-react";

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function getStats(text: string): Stat[] {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/) : [];
  const wordCount = words.length;
  const charsWithSpaces = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed
    ? (trimmed.match(/[.!?]+(\s|$)/g) || []).length || (trimmed.length > 0 ? 1 : 0)
    : 0;
  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
    : 0;
  const readMin = Math.ceil(wordCount / 200);
  const speakMin = Math.ceil(wordCount / 130);
  const avgWordLen =
    wordCount > 0
      ? (words.reduce((sum, w) => sum + w.length, 0) / wordCount).toFixed(1)
      : "0";

  return [
    { label: "Words", value: wordCount, icon: <FileText className="h-4 w-4" /> },
    { label: "Characters (with spaces)", value: charsWithSpaces, icon: <Type className="h-4 w-4" /> },
    { label: "Characters (no spaces)", value: charsNoSpaces, icon: <Space className="h-4 w-4" /> },
    { label: "Sentences", value: sentences, icon: <AlignLeft className="h-4 w-4" /> },
    { label: "Paragraphs", value: paragraphs, icon: <Hash className="h-4 w-4" /> },
    { label: "Reading Time", value: `${readMin} min`, icon: <Clock className="h-4 w-4" /> },
    { label: "Speaking Time", value: `${speakMin} min`, icon: <Mic className="h-4 w-4" /> },
    { label: "Avg Word Length", value: avgWordLen, icon: <BarChart3 className="h-4 w-4" /> },
  ];
}

function getTopWords(text: string, n: number): { word: string; count: number }[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const words = trimmed.toLowerCase().match(/[a-z'\u00C0-\u024F]+/gi) || [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export default function WordCounterTool() {
  const [text, setText] = useState("");

  const stats = useMemo(() => getStats(text), [text]);
  const topWords = useMemo(() => getTopWords(text, 10), [text]);
  const maxCount = topWords.length > 0 ? topWords[0].count : 1;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-3 text-sm font-medium text-gray-400">Enter your text</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Start typing or paste your text here..."
          className="w-full resize-y rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm leading-relaxed text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-800 bg-gray-900 p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-gray-500">
              {s.icon}
              <span className="text-xs">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top Words */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-400">
          <BarChart3 className="h-4 w-4" />
          Top 10 Most Frequent Words
        </h3>
        {topWords.length === 0 ? (
          <p className="text-sm text-gray-600">No words to analyze yet.</p>
        ) : (
          <div className="space-y-2">
            {topWords.map((tw, i) => (
              <div key={tw.word} className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-right text-xs text-gray-500">{i + 1}</span>
                <span className="w-28 shrink-0 truncate font-mono text-sm text-white">
                  {tw.word}
                </span>
                <div className="flex-1">
                  <div
                    className="h-6 rounded bg-purple-600/30 transition-all"
                    style={{ width: `${(tw.count / maxCount) * 100}%` }}
                  >
                    <div
                      className="h-full rounded bg-purple-500"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-400">
                  {tw.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
