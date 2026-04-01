"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type Tone = "formal" | "casual" | "academic" | "creative";

const SYNONYM_MAP: Record<string, Record<Tone, string>> = {
  good: { formal: "excellent", casual: "great", academic: "commendable", creative: "splendid" },
  bad: { formal: "unsatisfactory", casual: "awful", academic: "inadequate", creative: "dreadful" },
  big: { formal: "substantial", casual: "huge", academic: "significant", creative: "massive" },
  small: { formal: "minimal", casual: "tiny", academic: "negligible", creative: "minuscule" },
  important: { formal: "significant", casual: "key", academic: "pivotal", creative: "vital" },
  help: { formal: "assist", casual: "give a hand", academic: "facilitate", creative: "lend support" },
  use: { formal: "employ", casual: "go with", academic: "utilize", creative: "wield" },
  make: { formal: "produce", casual: "put together", academic: "construct", creative: "craft" },
  get: { formal: "obtain", casual: "grab", academic: "acquire", creative: "secure" },
  show: { formal: "demonstrate", casual: "point out", academic: "illustrate", creative: "reveal" },
  think: { formal: "consider", casual: "figure", academic: "hypothesize", creative: "envision" },
  very: { formal: "highly", casual: "super", academic: "exceedingly", creative: "remarkably" },
  many: { formal: "numerous", casual: "a ton of", academic: "a multitude of", creative: "countless" },
  fast: { formal: "rapid", casual: "quick", academic: "expeditious", creative: "lightning-fast" },
  hard: { formal: "challenging", casual: "tough", academic: "arduous", creative: "grueling" },
  easy: { formal: "straightforward", casual: "simple", academic: "uncomplicated", creative: "effortless" },
  start: { formal: "commence", casual: "kick off", academic: "initiate", creative: "launch" },
  end: { formal: "conclude", casual: "wrap up", academic: "terminate", creative: "culminate" },
  need: { formal: "require", casual: "gotta have", academic: "necessitate", creative: "demand" },
  change: { formal: "modify", casual: "switch up", academic: "alter", creative: "transform" },
  problem: { formal: "issue", casual: "snag", academic: "predicament", creative: "conundrum" },
  answer: { formal: "response", casual: "reply", academic: "resolution", creative: "solution" },
  said: { formal: "stated", casual: "mentioned", academic: "asserted", creative: "declared" },
  look: { formal: "examine", casual: "check out", academic: "observe", creative: "gaze upon" },
  give: { formal: "provide", casual: "hand over", academic: "furnish", creative: "bestow" },
  keep: { formal: "maintain", casual: "hold onto", academic: "preserve", creative: "safeguard" },
};

const TONE_STARTERS: Record<Tone, string[]> = {
  formal: ["In essence,", "To elaborate,", "It should be noted that", "Accordingly,"],
  casual: ["So basically,", "Here's the thing -", "Look,", "The way I see it,"],
  academic: ["Research suggests that", "It can be observed that", "Evidence indicates", "Analysis reveals that"],
  creative: ["Picture this:", "Imagine a world where", "Here's the fascinating part -", "What's remarkable is"],
};

function paraphraseText(input: string, tone: Tone): string {
  if (!input.trim()) return "";

  const sentences = input.match(/[^.!?]+[.!?]+/g) || [input];
  const result: string[] = [];

  for (let i = 0; i < sentences.length; i++) {
    let sentence = sentences[i].trim();

    // Synonym replacement based on tone
    for (const [word, replacements] of Object.entries(SYNONYM_MAP)) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      sentence = sentence.replace(regex, (match) => {
        const replacement = replacements[tone];
        // Preserve original capitalization
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    }

    // Restructure: occasionally move clauses
    if (sentence.includes(", ") && sentence.length > 60 && i % 3 === 0) {
      const parts = sentence.split(", ");
      if (parts.length === 2) {
        const p2 = parts[1].trim();
        const p1 = parts[0].trim().toLowerCase();
        sentence = p2.replace(/[.!?]$/, "") + ", " + p1 + sentence.slice(-1);
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
      }
    }

    // Add tone-specific starters to some sentences
    if (i > 0 && i % 3 === 1) {
      const starters = TONE_STARTERS[tone];
      const starter = starters[i % starters.length];
      const lower = sentence.charAt(0).toLowerCase() + sentence.slice(1);
      sentence = starter + " " + lower;
    }

    // Tone-specific adjustments
    if (tone === "casual") {
      sentence = sentence.replace(/\bdo not\b/g, "don't");
      sentence = sentence.replace(/\bcannot\b/g, "can't");
      sentence = sentence.replace(/\bwill not\b/g, "won't");
      sentence = sentence.replace(/\bshould not\b/g, "shouldn't");
      sentence = sentence.replace(/\bit is\b/g, "it's");
      sentence = sentence.replace(/\bthey are\b/g, "they're");
    } else if (tone === "formal") {
      sentence = sentence.replace(/\bdon't\b/g, "do not");
      sentence = sentence.replace(/\bcan't\b/g, "cannot");
      sentence = sentence.replace(/\bwon't\b/g, "will not");
      sentence = sentence.replace(/\bshouldn't\b/g, "should not");
      sentence = sentence.replace(/\bit's\b/gi, "it is");
      sentence = sentence.replace(/\bthey're\b/gi, "they are");
    } else if (tone === "academic") {
      sentence = sentence.replace(/\ba lot\b/g, "substantially");
      sentence = sentence.replace(/\bkind of\b/g, "somewhat");
      sentence = sentence.replace(/\bthings\b/g, "elements");
    }

    result.push(sentence);
  }

  return result.join(" ").replace(/\s+/g, " ").trim();
}

export default function AiParaphraserTool() {
  const t = useTranslations("toolUi");
  const [input, setInput] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleParaphrase = useCallback(() => {
    setOutput(paraphraseText(input, tone));
  }, [input, tone]);

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

  const tones: { value: Tone; label: string; desc: string }[] = [
    { value: "formal", label: "Formal", desc: "Professional and polished" },
    { value: "casual", label: "Casual", desc: "Relaxed and conversational" },
    { value: "academic", label: "Academic", desc: "Scholarly and precise" },
    { value: "creative", label: "Creative", desc: "Vivid and expressive" },
  ];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <label className="mb-3 block text-sm font-medium text-gray-300">
          Enter text to paraphrase
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste your text here..."
          rows={6}
          className="w-full resize-y rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500"
        />
        <div className="mt-2 text-right text-xs text-gray-500">
          {input.split(/\s+/).filter(Boolean).length} words | {input.length} characters
        </div>
      </div>

      {/* Tone Selection */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <label className="mb-3 block text-sm font-medium text-gray-300">
          Select Tone
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tones.map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`rounded-lg border p-3 text-left transition-all ${
                tone === t.value
                  ? "border-indigo-500 bg-indigo-600/20 text-white"
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
              }`}
            >
              <div className="text-sm font-medium">{t.label}</div>
              <div className="mt-1 text-xs opacity-70">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleParaphrase}
          disabled={!input.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Paraphrase
        </button>
        <button
          onClick={handleClear}
          className="rounded-lg border border-gray-700 px-4 py-2 text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
        >
          {t("clear")}
        </button>
      </div>

      {/* Output Section */}
      {output && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-400">
              Paraphrased Result ({tone})
            </h3>
            <span className="text-xs text-gray-500">
              {output.split(/\s+/).filter(Boolean).length} words
            </span>
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
      )}
    </div>
  );
}
