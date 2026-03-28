"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check, FileText } from "lucide-react";

const DEFAULT_MARKDOWN = `# Markdown Preview

Welcome to the **Markdown Preview** tool. Start editing on the left to see live changes.

## Features

- **Bold**, *italic*, ~~strikethrough~~
- [Links](https://example.com)
- Inline \`code\` and code blocks

### Code Block

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return { message: \`Welcome, \${name}\` };
}

greet("World");
\`\`\`

### Table

| Feature       | Status |
|---------------|--------|
| GFM Tables    | Yes    |
| Checkboxes    | Yes    |
| Strikethrough | Yes    |
| Syntax Highlight | Yes |

### Task List

- [x] Markdown parsing
- [x] GFM support
- [x] Syntax highlighting
- [ ] Export to PDF

### Blockquote

> The best way to predict the future is to invent it.
> -- Alan Kay

### Ordered List

1. First item
2. Second item
3. Third item

---

That's it! Edit this text to see the preview update in real time.
`;

const highlightCSS = `
/* GitHub Dark theme for highlight.js */
.hljs{color:#c9d1d9;background:#161b22}
.hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#ff7b72}
.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#d2a8ff}
.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable{color:#79c0ff}
.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#a5d6ff}
.hljs-built_in,.hljs-symbol{color:#ffa657}
.hljs-code,.hljs-comment,.hljs-formula{color:#8b949e}
.hljs-name,.hljs-quote,.hljs-selector-pseudo,.hljs-selector-tag{color:#7ee787}
.hljs-subst{color:#c9d1d9}
.hljs-section{color:#1f6feb;font-weight:700}
.hljs-bullet{color:#f2cc60}
.hljs-emphasis{color:#c9d1d9;font-style:italic}
.hljs-strong{color:#c9d1d9;font-weight:700}
.hljs-addition{color:#aff5b4;background-color:#033a16}
.hljs-deletion{color:#ffdcd7;background-color:#67060c}
`;

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const wordCount = useMemo(() => {
    const trimmed = markdown.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [markdown]);

  const handleCopyHTML = useCallback(async () => {
    if (!previewRef.current) return;
    await navigator.clipboard.writeText(previewRef.current.innerHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <ToolLayout
      title="Markdown Preview"
      description="Preview Markdown with live rendering, GFM support, and syntax highlighting"
      category="Generators"
    >
      <style dangerouslySetInnerHTML={{ __html: highlightCSS }} />
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              {wordCount} words
            </span>
            <span>{markdown.length} chars</span>
          </div>
          <button
            onClick={handleCopyHTML}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-700"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied HTML" : "Copy HTML"}
          </button>
        </div>

        {/* Split Pane */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Editor */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Editor
            </h3>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              spellCheck={false}
              className="h-[600px] w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-mono text-sm leading-relaxed text-gray-300 placeholder-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="Type your Markdown here..."
            />
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Preview
            </h3>
            <div
              ref={previewRef}
              className="prose-invert-custom h-[600px] overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 px-6 py-4"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="mb-4 mt-6 border-b border-gray-700 pb-2 text-2xl font-bold text-white">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-3 mt-5 border-b border-gray-700/50 pb-1 text-xl font-semibold text-white">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-2 mt-4 text-lg font-semibold text-white">{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="mb-2 mt-3 text-base font-semibold text-white">{children}</h4>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 leading-relaxed text-gray-300">{children}</p>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-purple-400 underline decoration-purple-400/30 hover:decoration-purple-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-3 ml-5 list-disc space-y-1 text-gray-300">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-3 ml-5 list-decimal space-y-1 text-gray-300">{children}</ol>
                  ),
                  li: ({ children }) => <li className="text-gray-300">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="my-3 border-l-4 border-purple-500 bg-gray-900/50 py-1 pl-4 italic text-gray-400">
                      {children}
                    </blockquote>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="rounded bg-gray-700 px-1.5 py-0.5 text-sm text-pink-300">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className={`${className || ""} text-sm`} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="my-3 overflow-x-auto rounded-lg border border-gray-700 bg-[#161b22] p-4 text-sm">
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className="my-3 overflow-x-auto">
                      <table className="w-full border-collapse text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="border-b border-gray-600 bg-gray-900/50">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-2 text-left font-semibold text-gray-300">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="border-t border-gray-700/50 px-3 py-2 text-gray-400">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="my-6 border-gray-700" />,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                  del: ({ children }) => (
                    <del className="text-gray-500 line-through">{children}</del>
                  ),
                  input: ({ checked, ...props }) => (
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mr-2 accent-purple-500"
                      {...props}
                    />
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
