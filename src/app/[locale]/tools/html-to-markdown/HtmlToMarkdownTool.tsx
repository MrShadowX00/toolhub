"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Trash2 } from "lucide-react";

function htmlToMarkdown(html: string): string {
  if (!html.trim()) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const children = Array.from(el.childNodes).map(processNode).join("");

    switch (tag) {
      case "h1":
        return `\n# ${children.trim()}\n\n`;
      case "h2":
        return `\n## ${children.trim()}\n\n`;
      case "h3":
        return `\n### ${children.trim()}\n\n`;
      case "h4":
        return `\n#### ${children.trim()}\n\n`;
      case "h5":
        return `\n##### ${children.trim()}\n\n`;
      case "h6":
        return `\n###### ${children.trim()}\n\n`;
      case "p":
        return `\n${children.trim()}\n\n`;
      case "br":
        return "\n\n";
      case "strong":
      case "b":
        return `**${children.trim()}**`;
      case "em":
      case "i":
        return `*${children.trim()}*`;
      case "a": {
        const href = el.getAttribute("href") || "";
        return `[${children.trim()}](${href})`;
      }
      case "img": {
        const alt = el.getAttribute("alt") || "";
        const src = el.getAttribute("src") || "";
        return `![${alt}](${src})`;
      }
      case "code": {
        // If parent is <pre>, it's a code block
        if (el.parentElement && el.parentElement.tagName.toLowerCase() === "pre") {
          return children;
        }
        return `\`${children}\``;
      }
      case "pre": {
        const codeContent = children.trim();
        return `\n\`\`\`\n${codeContent}\n\`\`\`\n\n`;
      }
      case "blockquote": {
        const lines = children.trim().split("\n");
        return "\n" + lines.map((line) => `> ${line}`).join("\n") + "\n\n";
      }
      case "ul": {
        const items: string[] = [];
        el.querySelectorAll(":scope > li").forEach((li) => {
          items.push(`- ${processNode(li).trim()}`);
        });
        if (items.length === 0) {
          // Fallback: process children directly
          return "\n" + children + "\n";
        }
        return "\n" + items.join("\n") + "\n\n";
      }
      case "ol": {
        const items: string[] = [];
        let idx = 1;
        el.querySelectorAll(":scope > li").forEach((li) => {
          items.push(`${idx}. ${processNode(li).trim()}`);
          idx++;
        });
        if (items.length === 0) {
          return "\n" + children + "\n";
        }
        return "\n" + items.join("\n") + "\n\n";
      }
      case "li":
        return children;
      case "table": {
        return processTable(el);
      }
      case "thead":
      case "tbody":
      case "tfoot":
      case "tr":
      case "th":
      case "td":
        // Handled by processTable
        return children;
      case "hr":
        return "\n---\n\n";
      case "del":
      case "s":
        return `~~${children.trim()}~~`;
      case "div":
      case "section":
      case "article":
      case "main":
      case "header":
      case "footer":
      case "nav":
      case "span":
        return children;
      case "script":
      case "style":
        return "";
      default:
        return children;
    }
  }

  function processTable(table: HTMLElement): string {
    const rows: string[][] = [];
    const headerCells: string[] = [];

    // Extract header
    const thead = table.querySelector("thead");
    if (thead) {
      const ths = thead.querySelectorAll("th, td");
      ths.forEach((th) => {
        headerCells.push(processNode(th).trim());
      });
    }

    // Extract body rows
    const bodyRows = table.querySelectorAll("tbody tr, :scope > tr");
    bodyRows.forEach((tr) => {
      const cells: string[] = [];
      tr.querySelectorAll("td, th").forEach((td) => {
        cells.push(processNode(td).trim());
      });
      if (cells.length > 0) rows.push(cells);
    });

    // If no thead, use first row as header
    if (headerCells.length === 0 && rows.length > 0) {
      headerCells.push(...rows.shift()!);
    }

    if (headerCells.length === 0) return "";

    const colCount = Math.max(headerCells.length, ...rows.map((r) => r.length));
    const pad = (arr: string[]) => {
      while (arr.length < colCount) arr.push("");
      return arr;
    };

    const headerRow = "| " + pad(headerCells).join(" | ") + " |";
    const separator = "| " + pad(Array(colCount).fill("---")).join(" | ") + " |";
    const bodyRowsMd = rows.map((r) => "| " + pad(r).join(" | ") + " |");

    return "\n" + [headerRow, separator, ...bodyRowsMd].join("\n") + "\n\n";
  }

  const result = processNode(doc.body);

  // Clean up excessive newlines
  return result
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function HtmlToMarkdownTool() {
  const t = useTranslations("toolUi");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = useCallback(() => {
    setOutput(htmlToMarkdown(input));
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
      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">HTML Input</label>
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
          placeholder='<h1>Hello</h1><p>This is a <strong>bold</strong> paragraph with a <a href="https://example.com">link</a>.</p>'
          rows={10}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm resize-y focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Convert Button */}
      <button
        onClick={convert}
        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 font-medium transition-colors"
      >
        Convert to Markdown
      </button>

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Markdown Output</label>
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
            rows={10}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm resize-y focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
