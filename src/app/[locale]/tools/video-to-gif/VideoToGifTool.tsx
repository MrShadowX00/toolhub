"use client";

import { useState, useRef } from "react";
import { Upload, Download, Trash2, Play } from "lucide-react";

export default function VideoToGifTool() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [gifSize, setGifSize] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("video/")) {
      setError("Please upload a video file.");
      return;
    }
    setFile(f);
    setError(null);
    setGifUrl(null);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const onVideoLoaded = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setEndTime(Math.min(5, dur));
    }
  };

  const convertToGif = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setProgress("Loading FFmpeg...");

    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile, toBlobURL } = await import("@ffmpeg/util");

      const ffmpeg = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setProgress("Processing video...");
      const inputName = "input" + (file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")) : ".mp4");
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setProgress("Converting to GIF...");
      await ffmpeg.exec([
        "-i", inputName,
        "-ss", String(startTime),
        "-t", String(endTime - startTime),
        "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        "-loop", "0",
        "output.gif",
      ]);

      const data = await ffmpeg.readFile("output.gif");
      const blob = new Blob([data as BlobPart], { type: "image/gif" });
      setGifUrl(URL.createObjectURL(blob));
      setGifSize(blob.size);
      setProgress("");
    } catch (err) {
      console.error(err);
      setError("GIF conversion failed. This feature requires a modern browser with SharedArrayBuffer support. Try Chrome or Edge with cross-origin isolation.");
    } finally {
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const reset = () => {
    setFile(null);
    setVideoUrl(null);
    setGifUrl(null);
    setError(null);
    setProgress("");
    setGifSize(0);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
        <p className="text-xs text-gray-500">🔒 Your files never leave your device. All processing happens in your browser using FFmpeg WebAssembly.</p>
      </div>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 py-16 transition-colors hover:border-pink-500/50 hover:bg-gray-900"
        >
          <Upload className="mb-3 h-10 w-10 text-gray-500" />
          <p className="text-sm font-medium text-white">Drop a video file here or click to upload</p>
          <p className="mt-1 text-xs text-gray-500">Supports MP4, WebM, MOV</p>
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400 truncate">{file.name} ({formatSize(file.size)})</p>
            <button onClick={reset} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>

          {/* Video Preview */}
          {videoUrl && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                onLoadedMetadata={onVideoLoaded}
                className="w-full rounded-lg max-h-64"
              />
            </div>
          )}

          {/* Settings */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-4">
            <h3 className="text-sm font-medium text-white">GIF Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Start Time (s)</label>
                <input
                  type="number"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">End Time (s)</label>
                <input
                  type="number"
                  min={0}
                  max={duration}
                  step={0.1}
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-400">FPS: {fps}</label>
                <input type="range" min={1} max={15} value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-full accent-pink-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Width (px)</label>
                <input
                  type="number"
                  min={100}
                  max={1920}
                  step={10}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {duration > 0 && (
              <p className="text-xs text-gray-600">Duration: {(endTime - startTime).toFixed(1)}s of {duration.toFixed(1)}s total</p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-900/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={convertToGif}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700 disabled:opacity-50"
          >
            {processing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {progress || "Processing..."}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Convert to GIF
              </>
            )}
          </button>

          {gifUrl && (
            <>
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-400">GIF Preview</p>
                  <p className="text-xs text-gray-500">{formatSize(gifSize)}</p>
                </div>
                <img src={gifUrl} alt="GIF" className="w-full rounded-lg" />
              </div>
              <a
                href={gifUrl}
                download={`${file.name.replace(/\.[^.]+$/, "")}.gif`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-600 bg-transparent px-6 py-3 font-medium text-pink-400 transition-colors hover:bg-pink-600/10"
              >
                <Download className="h-4 w-4" /> Download GIF
              </a>
            </>
          )}
        </>
      )}
    </div>
  );
}
