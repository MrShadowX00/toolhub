"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

const AI_PATTERNS: [RegExp, string][] = [
  [/\bIt is worth noting that\b/gi, "Notably,"],
  [/\bIt's worth noting that\b/gi, "Notably,"],
  [/\bIn conclusion\b/gi, "To wrap up"],
  [/\bFurthermore\b/gi, "Also"],
  [/\bMoreover\b/gi, "On top of that"],
  [/\bAdditionally\b/gi, "Plus"],
  [/\bConsequently\b/gi, "So"],
  [/\bNevertheless\b/gi, "Still"],
  [/\bIn today's digital age\b/gi, "These days"],
  [/\bIn today's world\b/gi, "Nowadays"],
  [/\bIt is important to note that\b/gi, "Keep in mind,"],
  [/\bIt is essential to\b/gi, "You really need to"],
  [/\bIn order to\b/gi, "To"],
  [/\bDue to the fact that\b/gi, "Because"],
  [/\bAt the end of the day\b/gi, "Ultimately"],
  [/\bA wide range of\b/gi, "Many"],
  [/\bA plethora of\b/gi, "Lots of"],
  [/\bUtilize\b/gi, "Use"],
  [/\bLeverage\b/gi, "Use"],
  [/\bFacilitate\b/gi, "Help with"],
  [/\bEnhance\b/gi, "Improve"],
  [/\bOptimize\b/gi, "Improve"],
  [/\bImplement\b/gi, "Set up"],
  [/\bDelve into\b/gi, "Look into"],
  [/\bdelve\b/gi, "dig"],
  [/\bThat being said\b/gi, "That said"],
  [/\bWith that being said\b/gi, "That said"],
  [/\bIn the realm of\b/gi, "In"],
  [/\bIt is crucial to\b/gi, "It matters to"],
  [/\bStreamline\b/gi, "Simplify"],
  [/\bRobust\b/gi, "Strong"],
  [/\bSeamless\b/gi, "Smooth"],
  [/\bCutting-edge\b/gi, "Modern"],
  [/\bState-of-the-art\b/gi, "Latest"],
  [/\bHowever, it is important to\b/gi, "But you should"],
  [/\bThis comprehensive guide\b/gi, "This guide"],
  [/\bcomprehensive\b/gi, "thorough"],
  [/\bThere are several\b/gi, "There are a few"],
  [/\bplays a crucial role\b/gi, "really matters"],
  [/\bplays a vital role\b/gi, "is really important"],
];

const FILLER_INSERTIONS = [
  "honestly,",
  "to be fair,",
  "in my experience,",
  "from what I can tell,",
  "I think",
  "really",
  "actually",
  "basically",
];

function humanizeText(input: string): string {
  if (!input.trim()) return "";

  let text = input;

  // Step 1: Replace common AI patterns
  for (const [pattern, replacement] of AI_PATTERNS) {
    text = text.replace(pattern, replacement);
  }

  // Step 2: Split into sentences and process
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const processed: string[] = [];

  for (let i = 0; i < sentences.length; i++) {
    let sentence = sentences[i].trim();

    // Step 3: Vary sentence structure - occasionally split long sentences
    if (sentence.length > 120 && sentence.includes(",")) {
      const commaIdx = sentence.indexOf(",", Math.floor(sentence.length * 0.3));
      if (commaIdx > 0 && commaIdx < sentence.length - 20) {
        const part1 = sentence.substring(0, commaIdx).trim();
        const part2 = sentence.substring(commaIdx + 1).trim();
        const cap2 = part2.charAt(0).toUpperCase() + part2.slice(1);
        sentence = part1 + ". " + cap2;
      }
    }

    // Step 4: Add occasional filler words (every 3-5 sentences)
    if (i > 0 && i % 4 === 0 && sentence.length > 30) {
      const filler = FILLER_INSERTIONS[i % FILLER_INSERTIONS.length];
      const words = sentence.split(" ");
      if (words.length > 4) {
        const insertAt = Math.min(2, words.length - 1);
        words.splice(insertAt, 0, filler);
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        sentence = words.join(" ");
      }
    }

    // Step 5: Replace some passive constructions
    sentence = sentence.replace(/\bis being\b/g, "is");
    sentence = sentence.replace(/\bhas been shown to be\b/g, "turns out to be");
    sentence = sentence.replace(/\bcan be seen as\b/g, "looks like");

    // Step 6: Contract where possible
    sentence = sentence.replace(/\bdo not\b/g, "don't");
    sentence = sentence.replace(/\bDo not\b/g, "Don't");
    sentence = sentence.replace(/\bcannot\b/g, "can't");
    sentence = sentence.replace(/\bCannot\b/g, "Can't");
    sentence = sentence.replace(/\bwill not\b/g, "won't");
    sentence = sentence.replace(/\bWill not\b/g, "Won't");
    sentence = sentence.replace(/\bit is\b/g, "it's");
    sentence = sentence.replace(/\bIt is\b/g, "It's");
    sentence = sentence.replace(/\bthey are\b/g, "they're");
    sentence = sentence.replace(/\bThey are\b/g, "They're");
    sentence = sentence.replace(/\bwe are\b/g, "we're");
    sentence = sentence.replace(/\bWe are\b/g, "We're");
    sentence = sentence.replace(/\byou are\b/g, "you're");
    sentence = sentence.replace(/\bYou are\b/g, "You're");

    processed.push(sentence);
  }

  return processed.join(" ").replace(/\s+/g, " ").trim();
}

export default function AiHumanizerTool() {
  const t = useTranslations("toolUi");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleHumanize = useCallback(() => {
    setOutput(humanizeText(input));
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            AI-Generated Text
          </label>
          <span className="text-xs text-gray-500">
            {input.length} characters
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your AI-generated text here..."
          rows={8}
          className="w-full resize-y rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500"
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleHumanize}
            disabled={!input.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Humanize Text
          </button>
          <button
            onClick={handleClear}
            className="rounded-lg border border-gray-700 px-4 py-2 text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
          >
            {t("clear")}
          </button>
        </div>
      </div>

      {/* Side by Side Comparison */}
      {output && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Original */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-red-400">Original (AI)</h3>
              <span className="text-xs text-gray-500">{input.length} chars</span>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-sm leading-relaxed text-gray-300">
              {input}
            </div>
          </div>

          {/* Humanized */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-400">Humanized</h3>
              <span className="text-xs text-gray-500">{output.length} chars</span>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-sm leading-relaxed text-gray-300">
              {output}
            </div>
            <button
              onClick={handleCopy}
              className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-500"
            >
              {copied ? "Copied!" : t("copy")}
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-400">
          How It Works
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="mt-0.5 text-indigo-500">&#8226;</span>
            Replaces common AI phrases and patterns with natural alternatives
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-indigo-500">&#8226;</span>
            Adds contractions to make text sound more conversational
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-indigo-500">&#8226;</span>
            Varies sentence length and structure for a more human rhythm
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 text-indigo-500">&#8226;</span>
            Inserts natural filler words and transitions sparingly
          </li>
        </ul>
      </div>
    </div>
  );
}
