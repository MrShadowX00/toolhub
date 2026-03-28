"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ui/ToolLayout";
import { Copy, Check, Upload, Hash } from "lucide-react";

// --- Pure JS MD5 implementation ---
function md5(inputStr: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function binlMD5(x: number[], len: number): number[] {
    x[len >> 5] |= 0x80 << len % 32;
    x[(((len + 64) >>> 9) << 4) + 14] = len;
    let a = 1732584193;
    let b = -271733879;
    let c = -1732584194;
    let d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d;
      const g = (k: number) => x[i + k] ?? 0;
      a=ff(a,b,c,d,g(0),7,-680876936); d=ff(d,a,b,c,g(1),12,-389564586); c=ff(c,d,a,b,g(2),17,606105819); b=ff(b,c,d,a,g(3),22,-1044525330);
      a=ff(a,b,c,d,g(4),7,-176418897); d=ff(d,a,b,c,g(5),12,1200080426); c=ff(c,d,a,b,g(6),17,-1473231341); b=ff(b,c,d,a,g(7),22,-45705983);
      a=ff(a,b,c,d,g(8),7,1770035416); d=ff(d,a,b,c,g(9),12,-1958414417); c=ff(c,d,a,b,g(10),17,-42063); b=ff(b,c,d,a,g(11),22,-1990404162);
      a=ff(a,b,c,d,g(12),7,1804603682); d=ff(d,a,b,c,g(13),12,-40341101); c=ff(c,d,a,b,g(14),17,-1502002290); b=ff(b,c,d,a,g(15),22,1236535329);
      a=gg(a,b,c,d,g(1),5,-165796510); d=gg(d,a,b,c,g(6),9,-1069501632); c=gg(c,d,a,b,g(11),14,643717713); b=gg(b,c,d,a,g(0),20,-373897302);
      a=gg(a,b,c,d,g(5),5,-701558691); d=gg(d,a,b,c,g(10),9,38016083); c=gg(c,d,a,b,g(15),14,-660478335); b=gg(b,c,d,a,g(4),20,-405537848);
      a=gg(a,b,c,d,g(9),5,568446438); d=gg(d,a,b,c,g(14),9,-1019803690); c=gg(c,d,a,b,g(3),14,-187363961); b=gg(b,c,d,a,g(8),20,1163531501);
      a=gg(a,b,c,d,g(13),5,-1444681467); d=gg(d,a,b,c,g(2),9,-51403784); c=gg(c,d,a,b,g(7),14,1735328473); b=gg(b,c,d,a,g(12),20,-1926607734);
      a=hh(a,b,c,d,g(5),4,-378558); d=hh(d,a,b,c,g(8),11,-2022574463); c=hh(c,d,a,b,g(11),16,1839030562); b=hh(b,c,d,a,g(14),23,-35309556);
      a=hh(a,b,c,d,g(1),4,-1530992060); d=hh(d,a,b,c,g(4),11,1272893353); c=hh(c,d,a,b,g(7),16,-155497632); b=hh(b,c,d,a,g(10),23,-1094730640);
      a=hh(a,b,c,d,g(13),4,681279174); d=hh(d,a,b,c,g(0),11,-358537222); c=hh(c,d,a,b,g(3),16,-722521979); b=hh(b,c,d,a,g(6),23,76029189);
      a=hh(a,b,c,d,g(9),4,-640364487); d=hh(d,a,b,c,g(12),11,-421815835); c=hh(c,d,a,b,g(15),16,530742520); b=hh(b,c,d,a,g(2),23,-995338651);
      a=ii(a,b,c,d,g(0),6,-198630844); d=ii(d,a,b,c,g(7),10,1126891415); c=ii(c,d,a,b,g(14),15,-1416354905); b=ii(b,c,d,a,g(5),21,-57434055);
      a=ii(a,b,c,d,g(12),6,1700485571); d=ii(d,a,b,c,g(3),10,-1894986606); c=ii(c,d,a,b,g(10),15,-1051523); b=ii(b,c,d,a,g(1),21,-2054922799);
      a=ii(a,b,c,d,g(8),6,1873313359); d=ii(d,a,b,c,g(15),10,-30611744); c=ii(c,d,a,b,g(6),15,-1560198380); b=ii(b,c,d,a,g(13),21,1309151649);
      a=ii(a,b,c,d,g(4),6,-145523070); d=ii(d,a,b,c,g(11),10,-1120210379); c=ii(c,d,a,b,g(2),15,718787259); b=ii(b,c,d,a,g(9),21,-343485551);
      a=safeAdd(a,olda); b=safeAdd(b,oldb); c=safeAdd(c,oldc); d=safeAdd(d,oldd);
    }
    return [a, b, c, d];
  }
  function binl2rstr(input: number[]): string {
    let output = "";
    for (let i = 0; i < input.length * 32; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
    }
    return output;
  }
  function rstr2binl(input: string): number[] {
    const output: number[] = [];
    for (let i = 0; i < input.length * 8; i += 8) {
      output[i >> 5] = (output[i >> 5] ?? 0) | (input.charCodeAt(i / 8) << i % 32);
    }
    return output;
  }
  function rstr2hex(input: string): string {
    const hexTab = "0123456789abcdef";
    let out = "";
    for (let i = 0; i < input.length; i++) {
      const x = input.charCodeAt(i);
      out += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
    }
    return out;
  }
  // Convert string to raw MD5 bytes
  const utf8 = unescape(encodeURIComponent(inputStr));
  return rstr2hex(binl2rstr(binlMD5(rstr2binl(utf8), utf8.length * 8)));
}

// MD5 over raw bytes (for file hashing)
function md5Bytes(bytes: Uint8Array): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const len = bytes.length;
  // Pack bytes into 32-bit little-endian words
  const x: number[] = new Array(Math.ceil((len + 9) / 64) * 16).fill(0);
  for (let i = 0; i < len; i++) {
    x[i >> 2] |= bytes[i]! << ((i % 4) * 8);
  }
  x[len >> 2] |= 0x80 << ((len % 4) * 8);
  x[(((len + 8) >> 6) << 4) + 14] = len * 8;

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d;
    const g = (k: number) => x[i + k] ?? 0;
    a=ff(a,b,c,d,g(0),7,-680876936); d=ff(d,a,b,c,g(1),12,-389564586); c=ff(c,d,a,b,g(2),17,606105819); b=ff(b,c,d,a,g(3),22,-1044525330);
    a=ff(a,b,c,d,g(4),7,-176418897); d=ff(d,a,b,c,g(5),12,1200080426); c=ff(c,d,a,b,g(6),17,-1473231341); b=ff(b,c,d,a,g(7),22,-45705983);
    a=ff(a,b,c,d,g(8),7,1770035416); d=ff(d,a,b,c,g(9),12,-1958414417); c=ff(c,d,a,b,g(10),17,-42063); b=ff(b,c,d,a,g(11),22,-1990404162);
    a=ff(a,b,c,d,g(12),7,1804603682); d=ff(d,a,b,c,g(13),12,-40341101); c=ff(c,d,a,b,g(14),17,-1502002290); b=ff(b,c,d,a,g(15),22,1236535329);
    a=gg(a,b,c,d,g(1),5,-165796510); d=gg(d,a,b,c,g(6),9,-1069501632); c=gg(c,d,a,b,g(11),14,643717713); b=gg(b,c,d,a,g(0),20,-373897302);
    a=gg(a,b,c,d,g(5),5,-701558691); d=gg(d,a,b,c,g(10),9,38016083); c=gg(c,d,a,b,g(15),14,-660478335); b=gg(b,c,d,a,g(4),20,-405537848);
    a=gg(a,b,c,d,g(9),5,568446438); d=gg(d,a,b,c,g(14),9,-1019803690); c=gg(c,d,a,b,g(3),14,-187363961); b=gg(b,c,d,a,g(8),20,1163531501);
    a=gg(a,b,c,d,g(13),5,-1444681467); d=gg(d,a,b,c,g(2),9,-51403784); c=gg(c,d,a,b,g(7),14,1735328473); b=gg(b,c,d,a,g(12),20,-1926607734);
    a=hh(a,b,c,d,g(5),4,-378558); d=hh(d,a,b,c,g(8),11,-2022574463); c=hh(c,d,a,b,g(11),16,1839030562); b=hh(b,c,d,a,g(14),23,-35309556);
    a=hh(a,b,c,d,g(1),4,-1530992060); d=hh(d,a,b,c,g(4),11,1272893353); c=hh(c,d,a,b,g(7),16,-155497632); b=hh(b,c,d,a,g(10),23,-1094730640);
    a=hh(a,b,c,d,g(13),4,681279174); d=hh(d,a,b,c,g(0),11,-358537222); c=hh(c,d,a,b,g(3),16,-722521979); b=hh(b,c,d,a,g(6),23,76029189);
    a=hh(a,b,c,d,g(9),4,-640364487); d=hh(d,a,b,c,g(12),11,-421815835); c=hh(c,d,a,b,g(15),16,530742520); b=hh(b,c,d,a,g(2),23,-995338651);
    a=ii(a,b,c,d,g(0),6,-198630844); d=ii(d,a,b,c,g(7),10,1126891415); c=ii(c,d,a,b,g(14),15,-1416354905); b=ii(b,c,d,a,g(5),21,-57434055);
    a=ii(a,b,c,d,g(12),6,1700485571); d=ii(d,a,b,c,g(3),10,-1894986606); c=ii(c,d,a,b,g(10),15,-1051523); b=ii(b,c,d,a,g(1),21,-2054922799);
    a=ii(a,b,c,d,g(8),6,1873313359); d=ii(d,a,b,c,g(15),10,-30611744); c=ii(c,d,a,b,g(6),15,-1560198380); b=ii(b,c,d,a,g(13),21,1309151649);
    a=ii(a,b,c,d,g(4),6,-145523070); d=ii(d,a,b,c,g(11),10,-1120210379); c=ii(c,d,a,b,g(2),15,718787259); b=ii(b,c,d,a,g(9),21,-343485551);
    a=safeAdd(a,olda); b=safeAdd(b,oldb); c=safeAdd(c,oldc); d=safeAdd(d,oldd);
  }
  const out = [a, b, c, d];
  const hexTab = "0123456789abcdef";
  let hex = "";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const byte = (out[i]! >> (j * 8)) & 0xff;
      hex += hexTab[(byte >> 4) & 0xf]! + hexTab[byte & 0xf]!;
    }
  }
  return hex;
}

// --- SHA via Web Crypto ---
async function shaDigest(algorithm: string, data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- Types ---
type HashResults = {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
};

type CopiedKey = keyof HashResults | null;

const HASH_LABELS: { key: keyof HashResults; label: string; bits: string }[] = [
  { key: "md5", label: "MD5", bits: "128-bit" },
  { key: "sha1", label: "SHA-1", bits: "160-bit" },
  { key: "sha256", label: "SHA-256", bits: "256-bit" },
  { key: "sha512", label: "SHA-512", bits: "512-bit" },
];

const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB chunks

export default function HashGeneratorPage() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<HashResults | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<CopiedKey>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileProgress, setFileProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"text" | "file">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hash text with debounce
  const hashText = useCallback(async (text: string) => {
    if (!text) {
      setResults(null);
      setError(null);
      return;
    }
    setIsComputing(true);
    setError(null);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const [sha1, sha256, sha512] = await Promise.all([
        shaDigest("SHA-1", data.buffer as ArrayBuffer),
        shaDigest("SHA-256", data.buffer as ArrayBuffer),
        shaDigest("SHA-512", data.buffer as ArrayBuffer),
      ]);
      const md5Hash = md5(text);
      setResults({ md5: md5Hash, sha1, sha256, sha512 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compute hashes.");
      setResults(null);
    } finally {
      setIsComputing(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== "text") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      hashText(inputText);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputText, mode, hashText]);

  // Hash file with chunked FileReader for progress
  const hashFile = useCallback(async (file: File) => {
    setIsComputing(true);
    setError(null);
    setResults(null);
    setFileProgress(0);

    try {
      const fileSize = file.size;

      if (fileSize === 0) {
        throw new Error("The selected file is empty.");
      }

      let offset = 0;
      const chunks: Uint8Array[] = [];

      await new Promise<void>((resolve, reject) => {
        function readNextChunk() {
          const slice = file.slice(offset, offset + CHUNK_SIZE);
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result instanceof ArrayBuffer) {
              chunks.push(new Uint8Array(e.target.result));
            }
            offset += CHUNK_SIZE;
            const progress = Math.min(99, Math.round((offset / fileSize) * 100));
            setFileProgress(progress);
            if (offset < fileSize) {
              readNextChunk();
            } else {
              resolve();
            }
          };
          reader.onerror = () => reject(new Error("Failed to read file."));
          reader.readAsArrayBuffer(slice);
        }
        readNextChunk();
      });

      // Combine all chunks
      const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0);
      const combined = new Uint8Array(totalLength);
      let pos = 0;
      for (const chunk of chunks) {
        combined.set(chunk, pos);
        pos += chunk.byteLength;
      }

      setFileProgress(100);

      // Compute all hashes
      const [sha1, sha256, sha512] = await Promise.all([
        shaDigest("SHA-1", combined.buffer),
        shaDigest("SHA-256", combined.buffer),
        shaDigest("SHA-512", combined.buffer),
      ]);
      const md5Hash = md5Bytes(combined);

      setResults({ md5: md5Hash, sha1, sha256, sha512 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to hash file.");
      setResults(null);
    } finally {
      setIsComputing(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setMode("file");
    hashFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setFileName(file.name);
    setMode("file");
    hashFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleCopy = async (key: keyof HashResults, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for restricted clipboard environments
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleModeSwitch = (newMode: "text" | "file") => {
    setMode(newMode);
    setResults(null);
    setError(null);
    setFileName(null);
    setFileProgress(0);
    setInputText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClear = () => {
    setInputText("");
    setResults(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate MD5, SHA1, SHA256 hashes"
      category="Developer Tools"
    >
      <div className="space-y-6">
        {/* Mode tabs */}
        <div className="flex rounded-lg border border-gray-700 bg-gray-800 p-1 w-fit gap-1">
          <button
            onClick={() => handleModeSwitch("text")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "text"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Hash className="h-4 w-4" />
            Text Input
          </button>
          <button
            onClick={() => handleModeSwitch("file")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "file"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Upload className="h-4 w-4" />
            File Upload
          </button>
        </div>

        {/* Input area */}
        {mode === "text" ? (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Input Text
              </label>
              {inputText && (
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste text to hash..."
              rows={5}
              className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 font-mono text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <p className="text-xs text-gray-600">
              {inputText.length.toLocaleString()} character
              {inputText.length !== 1 ? "s" : ""}
            </p>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="rounded-xl border-2 border-dashed border-gray-700 bg-gray-800 p-8 text-center transition-colors hover:border-blue-500/50 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-4">
                <Upload className="h-8 w-8 text-blue-400" />
              </div>
              {fileName ? (
                <>
                  <p className="font-medium text-white break-all">{fileName}</p>
                  <p className="text-sm text-gray-500">Click or drop to replace</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-300">
                    Drop a file here or click to browse
                  </p>
                  <p className="text-sm text-gray-600">
                    Any file type — hashed entirely in your browser
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* File progress bar */}
        {mode === "file" && isComputing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Reading file...</span>
              <span>{fileProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-150"
                style={{ width: `${fileProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-700/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Computing indicator (text mode) */}
        {isComputing && mode === "text" && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
            Computing hashes...
          </div>
        )}

        {/* Hash results */}
        {results && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Hash Results
            </h2>
            <div className="space-y-3">
              {HASH_LABELS.map(({ key, label, bits }) => (
                <div
                  key={key}
                  className="group rounded-xl border border-gray-700 bg-gray-800 p-4 transition-colors hover:border-gray-600"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-400">
                        {label}
                      </span>
                      <span className="rounded bg-gray-700 px-1.5 py-0.5 text-xs text-gray-500">
                        {bits}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(key, results[key])}
                      title={`Copy ${label} hash`}
                      className="flex items-center gap-1.5 rounded-md border border-gray-600 bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-300 transition-all hover:border-blue-500 hover:bg-blue-600 hover:text-white active:scale-95"
                    >
                      {copiedKey === key ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-green-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="break-all rounded-lg bg-gray-900 px-3 py-2 font-mono text-sm text-gray-100 select-all">
                    {results[key]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!results && !isComputing && !error && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/50 py-16">
            <div className="mb-4 rounded-full bg-blue-500/10 p-4">
              <Hash className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-sm text-gray-500">
              {mode === "text"
                ? "Start typing to generate hashes instantly"
                : "Upload a file to compute its hashes"}
            </p>
          </div>
        )}

        {/* Info section */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">About these algorithms</h3>
          <dl className="space-y-2 text-sm">
            {[
              {
                term: "MD5",
                def: "128-bit hash. Fast but cryptographically broken — suitable for checksums only, not security.",
              },
              {
                term: "SHA-1",
                def: "160-bit hash. Deprecated for cryptographic use; still common for Git object IDs and checksums.",
              },
              {
                term: "SHA-256",
                def: "256-bit hash from the SHA-2 family. Widely used and considered secure for most applications.",
              },
              {
                term: "SHA-512",
                def: "512-bit hash from the SHA-2 family. Higher security margin; often faster than SHA-256 on 64-bit CPUs.",
              },
            ].map(({ term, def }) => (
              <div key={term} className="flex gap-3">
                <dt className="w-16 shrink-0 font-mono text-xs font-semibold text-blue-400 mt-0.5">
                  {term}
                </dt>
                <dd className="text-gray-500">{def}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-gray-600 border-t border-gray-700 pt-3">
            All hashing runs entirely in your browser. No data is sent to any server.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
