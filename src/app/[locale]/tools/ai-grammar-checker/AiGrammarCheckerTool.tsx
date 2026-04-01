"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface GrammarIssue {
  type: "error" | "warning" | "suggestion";
  category: string;
  message: string;
  original: string;
  suggestion: string;
  position: number;
}

const COMMON_MISSPELLINGS: Record<string, string> = {
  teh: "the", recieve: "receive", occured: "occurred", seperate: "separate",
  definately: "definitely", accomodate: "accommodate", occurence: "occurrence",
  neccessary: "necessary", embarass: "embarrass", goverment: "government",
  enviroment: "environment", independant: "independent", judgement: "judgment",
  knowlege: "knowledge", millenium: "millennium", noticable: "noticeable",
  occassion: "occasion", persistant: "persistent", privelege: "privilege",
  recomend: "recommend", refered: "referred", relevent: "relevant",
  rythm: "rhythm", succesful: "successful", suprise: "surprise",
  tommorow: "tomorrow", untill: "until", wierd: "weird", wich: "which",
  alot: "a lot", arguement: "argument", begining: "beginning",
  beleive: "believe", calender: "calendar", carribean: "Caribbean",
  cemetary: "cemetery", collegue: "colleague", comming: "coming",
  commitee: "committee", completly: "completely", concious: "conscious",
  curiousity: "curiosity", dissapear: "disappear", dissapoint: "disappoint",
  existance: "existence", experiance: "experience", foriegn: "foreign",
  fourty: "forty", freind: "friend", gaurd: "guard", happend: "happened",
  harrass: "harass", immediatly: "immediately", incidently: "incidentally",
  interupt: "interrupt", irresistable: "irresistible", libary: "library",
  lisence: "license", maintainance: "maintenance", mischievious: "mischievous",
  neigbour: "neighbor", occuring: "occurring", parallell: "parallel",
  parliment: "parliament", possesion: "possession", potatos: "potatoes",
  prefered: "preferred", pronounciation: "pronunciation", publically: "publicly",
  realy: "really", resturant: "restaurant", sargent: "sergeant",
  shouldnt: "shouldn't", sincerly: "sincerely", speach: "speech",
  strenght: "strength", thier: "their", truely: "truly", tyrany: "tyranny",
  unfortunatly: "unfortunately", vaccuum: "vacuum", vegatable: "vegetable",
  wether: "whether", writting: "writing",
};

function checkGrammar(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  // 1. Check for double spaces
  const doubleSpaceMatches = [...text.matchAll(/  +/g)];
  for (const match of doubleSpaceMatches) {
    issues.push({
      type: "warning",
      category: "Spacing",
      message: "Multiple consecutive spaces found",
      original: match[0],
      suggestion: " ",
      position: match.index || 0,
    });
  }

  // 2. Check for missing capitalization after period
  const missingCapMatches = [...text.matchAll(/[.!?]\s+[a-z]/g)];
  for (const match of missingCapMatches) {
    const lastChar = match[0].slice(-1);
    issues.push({
      type: "error",
      category: "Capitalization",
      message: "Sentence should start with a capital letter",
      original: match[0],
      suggestion: match[0].slice(0, -1) + lastChar.toUpperCase(),
      position: match.index || 0,
    });
  }

  // 3. Check for missing period at end
  const trimmed = text.trim();
  if (trimmed.length > 10 && !/[.!?]$/.test(trimmed)) {
    issues.push({
      type: "warning",
      category: "Punctuation",
      message: "Text does not end with punctuation",
      original: trimmed.slice(-20),
      suggestion: trimmed.slice(-20) + ".",
      position: trimmed.length - 1,
    });
  }

  // 4. Check for common misspellings
  const words = text.split(/\b/);
  let pos = 0;
  for (const word of words) {
    const lower = word.toLowerCase();
    if (COMMON_MISSPELLINGS[lower]) {
      issues.push({
        type: "error",
        category: "Spelling",
        message: `"${word}" is likely misspelled`,
        original: word,
        suggestion: COMMON_MISSPELLINGS[lower],
        position: pos,
      });
    }
    pos += word.length;
  }

  // 5. Check for repeated words
  const repeatedMatches = [...text.matchAll(/\b(\w+)\s+\1\b/gi)];
  for (const match of repeatedMatches) {
    issues.push({
      type: "error",
      category: "Repetition",
      message: `Repeated word: "${match[1]}"`,
      original: match[0],
      suggestion: match[1],
      position: match.index || 0,
    });
  }

  // 6. Check subject-verb agreement patterns
  const svPatterns: [RegExp, string, string][] = [
    [/\b(he|she|it)\s+are\b/gi, "Subject-verb disagreement", "is"],
    [/\b(they|we)\s+is\b/gi, "Subject-verb disagreement", "are"],
    [/\b(I)\s+is\b/gi, "Subject-verb disagreement", "am"],
    [/\b(he|she|it)\s+were\b/gi, "Subject-verb disagreement (unless subjunctive)", "was"],
    [/\b(I)\s+has\b/gi, "Subject-verb disagreement", "have"],
    [/\b(they|we|you)\s+has\b/gi, "Subject-verb disagreement", "have"],
    [/\b(he|she|it)\s+have\b/gi, "Subject-verb disagreement", "has"],
  ];

  for (const [pattern, msg, fix] of svPatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const parts = match[0].split(/\s+/);
      issues.push({
        type: "error",
        category: "Grammar",
        message: msg,
        original: match[0],
        suggestion: parts[0] + " " + fix,
        position: match.index || 0,
      });
    }
  }

  // 7. Check for "a" before vowels (should be "an")
  const aVowelMatches = [...text.matchAll(/\ba\s+([aeiou]\w*)/gi)];
  for (const match of aVowelMatches) {
    // Skip known exceptions like "a unique", "a university", "a European"
    const word = match[1].toLowerCase();
    if (word.startsWith("uni") || word.startsWith("eu") || word.startsWith("one")) continue;
    issues.push({
      type: "suggestion",
      category: "Grammar",
      message: `Consider using "an" before a word starting with a vowel`,
      original: match[0],
      suggestion: "an " + match[1],
      position: match.index || 0,
    });
  }

  // 8. Check for missing comma after introductory words
  const introWords = ["however", "moreover", "furthermore", "therefore", "meanwhile", "nevertheless", "consequently", "additionally", "finally", "unfortunately", "fortunately"];
  for (const word of introWords) {
    const regex = new RegExp(`\\b${word}\\s+(?!,)`, "gi");
    const matches = [...text.matchAll(regex)];
    for (const match of matches) {
      // Only flag if it's at the start of a sentence or after a period
      const before = text.substring(Math.max(0, (match.index || 0) - 3), match.index);
      if (/^$|[.!?]\s*$/.test(before.trim()) || match.index === 0) {
        issues.push({
          type: "suggestion",
          category: "Punctuation",
          message: `Consider adding a comma after "${word}"`,
          original: match[0].trim(),
          suggestion: word.charAt(0).toUpperCase() + word.slice(1) + ",",
          position: match.index || 0,
        });
      }
    }
  }

  // 9. Check for no space after punctuation
  const noSpaceMatches = [...text.matchAll(/[,;:][^\s\d"')\]]/g)];
  for (const match of noSpaceMatches) {
    issues.push({
      type: "warning",
      category: "Spacing",
      message: "Missing space after punctuation",
      original: match[0],
      suggestion: match[0][0] + " " + match[0][1],
      position: match.index || 0,
    });
  }

  // Sort by position
  issues.sort((a, b) => a.position - b.position);

  return issues;
}

function applyFixes(text: string, issues: GrammarIssue[]): string {
  let result = text;
  // Apply fixes in reverse order to maintain positions
  const sorted = [...issues].sort((a, b) => b.position - a.position);
  for (const issue of sorted) {
    const idx = result.indexOf(issue.original, Math.max(0, issue.position - 5));
    if (idx !== -1) {
      result = result.substring(0, idx) + issue.suggestion + result.substring(idx + issue.original.length);
    }
  }
  return result;
}

function getTypeColor(type: GrammarIssue["type"]): string {
  if (type === "error") return "text-red-400 bg-red-500/20";
  if (type === "warning") return "text-yellow-400 bg-yellow-500/20";
  return "text-blue-400 bg-blue-500/20";
}

function getTypeBorder(type: GrammarIssue["type"]): string {
  if (type === "error") return "border-red-500";
  if (type === "warning") return "border-yellow-500";
  return "border-blue-500";
}

export default function AiGrammarCheckerTool() {
  const t = useTranslations("toolUi");
  const [input, setInput] = useState("");
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [corrected, setCorrected] = useState("");
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCheck = useCallback(() => {
    const found = checkGrammar(input);
    setIssues(found);
    setCorrected(applyFixes(input, found));
    setChecked(true);
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!corrected) return;
    await navigator.clipboard.writeText(corrected);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [corrected]);

  const handleClear = useCallback(() => {
    setInput("");
    setIssues([]);
    setCorrected("");
    setChecked(false);
  }, []);

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;
  const suggestionCount = issues.filter((i) => i.type === "suggestion").length;

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
          onChange={(e) => {
            setInput(e.target.value);
            setChecked(false);
          }}
          placeholder="Type or paste your text here to check for grammar issues..."
          rows={8}
          className="w-full resize-y rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500"
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleCheck}
            disabled={!input.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Grammar
          </button>
          <button
            onClick={handleClear}
            className="rounded-lg border border-gray-700 px-4 py-2 text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
          >
            {t("clear")}
          </button>
        </div>
      </div>

      {/* Summary */}
      {checked && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{errorCount}</p>
            <p className="text-xs text-gray-500">Errors</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{warningCount}</p>
            <p className="text-xs text-gray-500">Warnings</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{suggestionCount}</p>
            <p className="text-xs text-gray-500">Suggestions</p>
          </div>
        </div>
      )}

      {/* Issues List */}
      {checked && issues.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
            Issues Found
          </h3>
          <div className="space-y-3">
            {issues.map((issue, i) => (
              <div
                key={i}
                className={`rounded-lg border-l-2 bg-gray-800/50 p-3 ${getTypeBorder(issue.type)}`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${getTypeColor(issue.type)}`}
                  >
                    {issue.type}
                  </span>
                  <span className="text-xs text-gray-500">{issue.category}</span>
                </div>
                <p className="text-sm text-gray-300">{issue.message}</p>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="rounded bg-red-500/10 px-2 py-1 text-red-400 line-through">
                    {issue.original}
                  </span>
                  <span className="text-gray-600">-&gt;</span>
                  <span className="rounded bg-green-500/10 px-2 py-1 text-green-400">
                    {issue.suggestion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No issues */}
      {checked && issues.length === 0 && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
          <p className="text-lg font-semibold text-green-400">No issues found!</p>
          <p className="mt-1 text-sm text-gray-400">Your text looks clean.</p>
        </div>
      )}

      {/* Corrected Text */}
      {checked && issues.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-400">Corrected Text</h3>
            <button
              onClick={handleCopy}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-xs text-white transition-colors hover:bg-indigo-500"
            >
              {copied ? "Copied!" : t("copy")}
            </button>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-sm leading-relaxed text-gray-300">
            {corrected}
          </div>
        </div>
      )}
    </div>
  );
}
