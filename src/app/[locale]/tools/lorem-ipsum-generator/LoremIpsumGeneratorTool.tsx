"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, RefreshCw } from "lucide-react";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
  "accusamus", "iusto", "odio", "dignissimos", "ducimus", "blanditiis",
  "praesentium", "voluptatum", "deleniti", "atque", "corrupti", "quos", "dolores",
  "quas", "molestias", "excepturi", "obcaecati", "cupiditate", "provident",
  "similique", "optio", "cumque", "nihil", "impedit", "quo", "minus", "quod",
  "maxime", "placeat", "facere", "possimus", "omnis", "voluptas", "assumenda",
  "repellendus", "temporibus", "autem", "quibusdam", "officiis", "debitis",
  "aut", "rerum", "necessitatibus", "saepe", "eveniet", "voluptates",
  "repudiandae", "recusandae", "itaque", "earum", "hic", "tenetur", "sapiente",
  "delectus", "reiciendis", "voluptatibus", "maiores", "alias", "consequatur",
  "perferendis", "doloribus", "asperiores", "repellat", "nemo", "ipsam",
  "perspiciatis", "unde", "fugit", "inventore", "veritatis", "quasi",
  "architecto", "beatae", "vitae", "dicta", "explicabo", "aspernatur",
  "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab",
  "illo", "ratione", "harum",
];

const CLASSIC_START = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";

type GenerateType = "paragraphs" | "sentences" | "words";

function randomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateSentence(minWords: number, maxWords: number): string {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const words: string[] = [];
  for (let i = 0; i < count; i++) words.push(randomWord());
  words[0] = capitalize(words[0]);
  // Add commas for natural flow
  if (count > 6) {
    const commaPos = 3 + Math.floor(Math.random() * (count - 5));
    words[commaPos] = words[commaPos] + ",";
  }
  return words.join(" ") + ".";
}

function generateParagraph(wordsPerParagraph: number): string {
  const sentences: string[] = [];
  let wordCount = 0;
  while (wordCount < wordsPerParagraph) {
    const remaining = wordsPerParagraph - wordCount;
    const sentenceLen = Math.min(remaining, 8 + Math.floor(Math.random() * 10));
    if (sentenceLen < 3) break;
    sentences.push(generateSentence(sentenceLen, sentenceLen));
    wordCount += sentenceLen;
  }
  return sentences.join(" ");
}

export default function LoremIpsumGeneratorTool() {
  const t = useTranslations("toolUi");

  const [count, setCount] = useState(3);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(60);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [genType, setGenType] = useState<GenerateType>("paragraphs");
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(0);

  const output = useMemo(() => {
    // Use seed to force regeneration
    void seed;

    if (genType === "words") {
      const words: string[] = [];
      if (startWithLorem) {
        words.push("Lorem", "ipsum", "dolor", "sit", "amet");
      }
      while (words.length < count) {
        words.push(randomWord());
      }
      return words.slice(0, count).join(" ");
    }

    if (genType === "sentences") {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        if (i === 0 && startWithLorem) {
          sentences.push(CLASSIC_START.trim());
        } else {
          sentences.push(generateSentence(8, 16));
        }
      }
      return sentences.join(" ");
    }

    // paragraphs
    const paragraphs: string[] = [];
    for (let i = 0; i < count; i++) {
      if (i === 0 && startWithLorem) {
        const rest = generateParagraph(Math.max(0, wordsPerParagraph - 8));
        paragraphs.push(CLASSIC_START + rest);
      } else {
        paragraphs.push(generateParagraph(wordsPerParagraph));
      }
    }
    return paragraphs.join("\n\n");
  }, [count, wordsPerParagraph, startWithLorem, genType, seed]);

  const wordCount = output.split(/\s+/).filter(Boolean).length;
  const charCount = output.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const inputCls = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none";
  const labelCls = "block text-sm font-medium text-gray-400 mb-1";
  const btnCls = "bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors";

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Settings</h3>

        {/* Generate type */}
        <div>
          <label className={labelCls}>Generate Type</label>
          <div className="flex gap-2">
            {(["paragraphs", "sentences", "words"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setGenType(type)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  genType === type
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>
              Number of {genType} ({genType === "words" ? "1-500" : "1-20"})
            </label>
            <input
              className={inputCls}
              type="number"
              min={1}
              max={genType === "words" ? 500 : 20}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(genType === "words" ? 500 : 20, Number(e.target.value))))}
            />
          </div>
          {genType === "paragraphs" && (
            <div>
              <label className={labelCls}>Words per Paragraph</label>
              <input
                className={inputCls}
                type="number"
                min={10}
                max={200}
                value={wordsPerParagraph}
                onChange={(e) => setWordsPerParagraph(Math.max(10, Math.min(200, Number(e.target.value))))}
              />
            </div>
          )}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-300">Start with &quot;Lorem ipsum...&quot;</span>
            </label>
          </div>
        </div>

        <button onClick={() => setSeed((s) => s + 1)} className={btnCls}>
          <RefreshCw size={16} /> Regenerate
        </button>
      </div>

      {/* Output */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-white">Generated Text</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{wordCount} words &middot; {charCount} characters</span>
            <button onClick={handleCopy} className={btnCls}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-300 text-sm leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap">
          {output}
        </div>
      </div>
    </div>
  );
}
