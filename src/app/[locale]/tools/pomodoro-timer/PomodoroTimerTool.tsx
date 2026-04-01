"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Play, Pause, RotateCcw, Settings, X } from "lucide-react";

type Phase = "work" | "shortBreak" | "longBreak";

const PHASE_COLORS: Record<Phase, { ring: string; text: string; bg: string }> = {
  work: { ring: "stroke-indigo-500", text: "text-indigo-400", bg: "bg-indigo-600" },
  shortBreak: { ring: "stroke-green-500", text: "text-green-400", bg: "bg-green-600" },
  longBreak: { ring: "stroke-blue-500", text: "text-blue-400", bg: "bg-blue-600" },
};

const PHASE_LABELS: Record<Phase, string> = {
  work: "Work",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);

    // Second beep
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1000;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.8);
    }, 300);
  } catch {
    /* Web Audio not available */
  }
}

export default function PomodoroTimerTool() {
  const t = useTranslations("toolUi");

  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(4);

  const [phase, setPhase] = useState<Phase>("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTime = phase === "work"
    ? workDuration * 60
    : phase === "shortBreak"
    ? shortBreakDuration * 60
    : longBreakDuration * 60;

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const switchPhase = useCallback((newPhase: Phase) => {
    setPhase(newPhase);
    setIsRunning(false);
    switch (newPhase) {
      case "work":
        setTimeLeft(workDuration * 60);
        break;
      case "shortBreak":
        setTimeLeft(shortBreakDuration * 60);
        break;
      case "longBreak":
        setTimeLeft(longBreakDuration * 60);
        break;
    }
  }, [workDuration, shortBreakDuration, longBreakDuration]);

  const handleTimerComplete = useCallback(() => {
    playBeep();
    setIsRunning(false);

    if (phase === "work") {
      const newCompleted = completedSessions + 1;
      setCompletedSessions(newCompleted);
      if (newCompleted % sessionsBeforeLong === 0) {
        switchPhase("longBreak");
      } else {
        switchPhase("shortBreak");
      }
    } else {
      switchPhase("work");
    }
  }, [phase, completedSessions, sessionsBeforeLong, switchPhase]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleTimerComplete]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const handleFullReset = () => {
    setIsRunning(false);
    setPhase("work");
    setTimeLeft(workDuration * 60);
    setCompletedSessions(0);
  };

  const applySettings = () => {
    setShowSettings(false);
    handleFullReset();
  };

  const colors = PHASE_COLORS[phase];

  // SVG circle params
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const inputCls = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none";
  const labelCls = "block text-sm font-medium text-gray-400 mb-1";
  const btnCls = "bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors";

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        {/* Phase tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {(["work", "shortBreak", "longBreak"] as const).map((p) => (
            <button
              key={p}
              onClick={() => switchPhase(p)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                phase === p
                  ? `${PHASE_COLORS[p].bg} text-white`
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {PHASE_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative w-72 h-72">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
              {/* Background circle */}
              <circle
                cx="130"
                cy="130"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-800"
              />
              {/* Progress circle */}
              <circle
                cx="130"
                cy="130"
                r={radius}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={`${colors.ring} transition-all duration-1000 ease-linear`}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            {/* Time display in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-mono font-bold text-white tracking-wider">
                {formatTime(timeLeft)}
              </span>
              <span className={`text-sm font-medium mt-2 ${colors.text}`}>
                {PHASE_LABELS[phase]}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`${btnCls} px-8 py-3 text-lg`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-3 flex items-center gap-2 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-3 flex items-center gap-2 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Session counter */}
        <div className="flex justify-center gap-2 items-center">
          <span className="text-gray-400 text-sm">Sessions completed:</span>
          <div className="flex gap-1">
            {Array.from({ length: sessionsBeforeLong }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i < (completedSessions % sessionsBeforeLong)
                    ? "bg-indigo-500"
                    : "bg-gray-700"
                }`}
              />
            ))}
          </div>
          <span className="text-white font-semibold text-sm ml-1">{completedSessions}</span>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Timer Settings</h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Work Duration (min)</label>
              <input
                className={inputCls}
                type="number"
                min={1}
                max={120}
                value={workDuration}
                onChange={(e) => setWorkDuration(Math.max(1, Math.min(120, Number(e.target.value))))}
              />
            </div>
            <div>
              <label className={labelCls}>Short Break (min)</label>
              <input
                className={inputCls}
                type="number"
                min={1}
                max={30}
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(Math.max(1, Math.min(30, Number(e.target.value))))}
              />
            </div>
            <div>
              <label className={labelCls}>Long Break (min)</label>
              <input
                className={inputCls}
                type="number"
                min={1}
                max={60}
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Math.max(1, Math.min(60, Number(e.target.value))))}
              />
            </div>
            <div>
              <label className={labelCls}>Sessions before Long Break</label>
              <input
                className={inputCls}
                type="number"
                min={2}
                max={10}
                value={sessionsBeforeLong}
                onChange={(e) => setSessionsBeforeLong(Math.max(2, Math.min(10, Number(e.target.value))))}
              />
            </div>
          </div>

          <button onClick={applySettings} className={btnCls}>
            Apply & Reset Timer
          </button>
        </div>
      )}
    </div>
  );
}
