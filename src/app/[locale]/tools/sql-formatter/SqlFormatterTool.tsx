"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Trash2 } from "lucide-react";

const MAJOR_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
  "FULL JOIN", "FULL OUTER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN",
  "CROSS JOIN", "ON", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET",
  "UNION", "UNION ALL", "INTERSECT", "EXCEPT", "INSERT INTO", "VALUES",
  "UPDATE", "SET", "DELETE FROM", "DELETE", "CREATE TABLE", "CREATE INDEX",
  "CREATE VIEW", "ALTER TABLE", "DROP TABLE", "DROP INDEX", "DROP VIEW",
  "AND", "OR", "CASE", "WHEN", "THEN", "ELSE", "END", "AS", "IN", "NOT",
  "EXISTS", "BETWEEN", "LIKE", "IS NULL", "IS NOT NULL",
];

const TOP_LEVEL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
  "FULL JOIN", "FULL OUTER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN",
  "CROSS JOIN", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET",
  "UNION", "UNION ALL", "INTERSECT", "EXCEPT", "INSERT INTO", "VALUES",
  "UPDATE", "SET", "DELETE FROM", "DELETE", "CREATE TABLE", "CREATE INDEX",
  "CREATE VIEW", "ALTER TABLE", "DROP TABLE", "DROP INDEX", "DROP VIEW",
];

const INDENT_KEYWORDS = ["AND", "OR"];

function formatSQL(sql: string, uppercaseKeywords: boolean, indentSize: number): string {
  if (!sql.trim()) return "";

  const indent = " ".repeat(indentSize);

  // Tokenize: preserve strings, identifiers, and keywords
  const tokens: string[] = [];
  let i = 0;
  const src = sql.trim();

  while (i < src.length) {
    // Skip whitespace
    if (/\s/.test(src[i])) {
      i++;
      continue;
    }
    // Single-line comment
    if (src[i] === "-" && src[i + 1] === "-") {
      let end = src.indexOf("\n", i);
      if (end === -1) end = src.length;
      tokens.push(src.slice(i, end));
      i = end;
      continue;
    }
    // Multi-line comment
    if (src[i] === "/" && src[i + 1] === "*") {
      let end = src.indexOf("*/", i + 2);
      if (end === -1) end = src.length;
      else end += 2;
      tokens.push(src.slice(i, end));
      i = end;
      continue;
    }
    // Quoted string
    if (src[i] === "'" || src[i] === '"') {
      const quote = src[i];
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === quote) {
          if (j + 1 < src.length && src[j + 1] === quote) {
            j += 2;
          } else {
            j++;
            break;
          }
        } else {
          j++;
        }
      }
      tokens.push(src.slice(i, j));
      i = j;
      continue;
    }
    // Backtick identifier
    if (src[i] === "`") {
      let j = i + 1;
      while (j < src.length && src[j] !== "`") j++;
      tokens.push(src.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    // Parentheses and special chars
    if (src[i] === "(" || src[i] === ")" || src[i] === "," || src[i] === ";") {
      tokens.push(src[i]);
      i++;
      continue;
    }
    // Operators
    if ("<>=!".includes(src[i])) {
      let j = i;
      while (j < src.length && "<>=!".includes(src[j])) j++;
      tokens.push(src.slice(i, j));
      i = j;
      continue;
    }
    // Word or number
    let j = i;
    while (j < src.length && !/[\s(),;'"<>=!`]/.test(src[j])) j++;
    tokens.push(src.slice(i, j));
    i = j;
  }

  // Build formatted output
  const lines: string[] = [];
  let currentLine = "";
  let depth = 0;

  function pushLine(line: string) {
    if (line.trim()) lines.push(line);
  }

  function getIndent(d: number) {
    return indent.repeat(d);
  }

  function toCase(word: string) {
    return uppercaseKeywords ? word.toUpperCase() : word;
  }

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];
    const upper = token.toUpperCase();

    // Check for multi-word keywords
    let multiWord = "";
    if (t + 1 < tokens.length) {
      const twoWord = upper + " " + tokens[t + 1].toUpperCase();
      if (t + 2 < tokens.length) {
        const threeWord = twoWord + " " + tokens[t + 2].toUpperCase();
        if (TOP_LEVEL_KEYWORDS.includes(threeWord) || MAJOR_KEYWORDS.includes(threeWord)) {
          multiWord = threeWord;
        }
      }
      if (!multiWord && (TOP_LEVEL_KEYWORDS.includes(twoWord) || MAJOR_KEYWORDS.includes(twoWord))) {
        multiWord = twoWord;
      }
    }

    let keyword = "";
    let skip = 0;
    if (multiWord) {
      keyword = multiWord;
      skip = multiWord.split(" ").length - 1;
    } else if (TOP_LEVEL_KEYWORDS.includes(upper) || MAJOR_KEYWORDS.includes(upper)) {
      keyword = upper;
    }

    if (keyword && TOP_LEVEL_KEYWORDS.includes(keyword)) {
      pushLine(currentLine);
      currentLine = getIndent(depth) + toCase(keyword);
      t += skip;
    } else if (keyword && INDENT_KEYWORDS.includes(keyword)) {
      pushLine(currentLine);
      currentLine = getIndent(depth) + indent + toCase(keyword);
      t += skip;
    } else if (token === "(") {
      currentLine += " (";
      pushLine(currentLine);
      depth++;
      currentLine = getIndent(depth);
    } else if (token === ")") {
      pushLine(currentLine);
      depth = Math.max(0, depth - 1);
      currentLine = getIndent(depth) + ")";
    } else if (token === ",") {
      currentLine += ",";
      pushLine(currentLine);
      currentLine = getIndent(depth) + indent;
    } else if (token === ";") {
      currentLine += ";";
      pushLine(currentLine);
      currentLine = "";
    } else if (token.startsWith("--") || token.startsWith("/*")) {
      if (currentLine.trim()) {
        currentLine += " " + token;
      } else {
        currentLine = getIndent(depth) + token;
      }
    } else {
      // Apply uppercase to SQL keywords
      let formatted = token;
      if (uppercaseKeywords && MAJOR_KEYWORDS.includes(upper)) {
        formatted = upper;
      }
      if (currentLine.trim()) {
        currentLine += " " + formatted;
      } else {
        currentLine = getIndent(depth) + formatted;
      }
    }
  }

  pushLine(currentLine);

  return lines.join("\n");
}

export default function SqlFormatterTool() {
  const t = useTranslations("toolUi");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [uppercase, setUppercase] = useState(true);
  const [indentSize, setIndentSize] = useState(2);
  const [copied, setCopied] = useState(false);

  const format = useCallback(() => {
    const result = formatSQL(input, uppercase, indentSize);
    setOutput(result);
  }, [input, uppercase, indentSize]);

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
      {/* Options */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500"
          />
          Uppercase keywords
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Indent size:</label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>
      </div>

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">SQL Input</label>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Trash2 size={14} />
            {t("clear")}
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="SELECT id, name, email FROM users WHERE active = 1 ORDER BY name ASC"
          rows={8}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm resize-y focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Format Button */}
      <button
        onClick={format}
        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 font-medium transition-colors"
      >
        Format SQL
      </button>

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Formatted SQL</label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={12}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm resize-y focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
