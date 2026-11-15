import { useEffect, useRef } from 'react';
import {
  Flame,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AmbientSoundType,
  FocusSessionRecord,
  TimerModeId,
} from '../types/campus';

interface FocusTimerSectionProps {
  mode: TimerModeId;
  customMinutes: number;
  subject: string;
  timeLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  hasStarted: boolean;
  soundChime: boolean;
  ambientSound: AmbientSoundType;
  fullscreenMode: boolean;
  focusMinutes: number;
  streakDays: number;
  history: FocusSessionRecord[];
  onSelectMode: (mode: TimerModeId) => void;
  onChangeCustomMinutes: (minutes: number) => void;
  onChangeSubject: (subject: string) => void;
  onStartOrResume: () => void;
  onPause: () => void;
  onReset: () => void;
  onToggleChime: () => void;
  onChangeAmbientSound: (sound: AmbientSoundType) => void;
  onToggleFullscreen: () => void;
}

const MODE_TABS: Array<{ id: TimerModeId; label: string; mins?: number }> = [
  { id: 'pomodoro', label: '25m Pomodoro', mins: 25 },
  { id: 'short-break', label: '5m Short Break', mins: 5 },
  { id: 'long-break', label: '15m Long Break', mins: 15 },
  { id: 'custom', label: 'Custom' },
];

export function FocusTimerSection({
  mode,
  customMinutes,
  subject,
  timeLeft,
  totalSeconds,
  isRunning,
  hasStarted,
  soundChime,
  ambientSound,
  fullscreenMode,
  focusMinutes,
  streakDays,
  history,
  onSelectMode,
  onChangeCustomMinutes,
  onChangeSubject,
  onStartOrResume,
  onPause,
  onReset,
  onToggleChime,
  onChangeAmbientSound,
  onToggleFullscreen,
}: FocusTimerSectionProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Original procedural Web Audio API ambient generator (no external copyrighted audio)
  useEffect(() => {
    const stopAmbient = () => {
      try {
        sourceNodeRef.current?.stop();
        sourceNodeRef.current?.disconnect();
      } catch {
        // ignore
      }
      sourceNodeRef.current = null;
    };

    if (ambientSound === 'off' || !isRunning) {
      stopAmbient();
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (ambientSound === 'brown-noise') {
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 2.2;
        } else if (ambientSound === 'rain') {
          lastOut = (lastOut + 0.08 * white) / 1.08;
          data[i] = lastOut * 1.1;
        } else {
          // soft campus hum
          lastOut = (lastOut + 0.04 * white) / 1.04;
          data[i] = lastOut * 0.9 + Math.sin((i / ctx.sampleRate) * 2 * Math.PI * 110) * 0.015;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = ambientSound === 'rain' ? 1400 : 480;

      const gain = ctx.createGain();
      gain.gain.value = 0.08;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      sourceNodeRef.current = source;
    } catch {
      // ignore Web Audio errors
    }

    return stopAmbient;
  }, [ambientSound, isRunning]);

  const elapsed = Math.max(0, totalSeconds - timeLeft);
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const clockStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const radius = 104;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const timerStage = (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-[#0F172A] ${
        fullscreenMode
          ? 'fixed inset-0 z-50 flex flex-col justify-between rounded-none border-0 bg-[#101B35] text-white'
          : ''
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h1 className={`font-display text-xl font-bold ${fullscreenMode ? 'text-white' : 'text-[#101B35] dark:text-white'}`}>
            {fullscreenMode ? 'Deep Work Mode (Distraction-Free)' : 'Focus Timer & Deep Work Mode'}
          </h1>
          <p className={`mt-1 text-xs ${fullscreenMode ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
            Stay locked into single-task study blocks with automatic minute &amp; streak logging.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleChime}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              fullscreenMode
                ? 'border-white/20 text-white hover:bg-white/10'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {soundChime ? <Volume2 className="h-3.5 w-3.5 text-[#3867F4]" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{soundChime ? 'Chime On' : 'Chime Off'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              fullscreenMode
                ? 'border-white/20 text-white hover:bg-white/10'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {fullscreenMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>{fullscreenMode ? 'Exit Full-Screen' : 'Deep Work Full-Screen'}</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher & Custom Settings */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {MODE_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectMode(t.id)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === t.id
                  ? 'bg-white text-[#101B35] shadow-xs dark:bg-[#0F172A] dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          <input
            type="text"
            value={subject}
            onChange={(e) => onChangeSubject(e.target.value)}
            placeholder="Focus subject (e.g., Linear Algebra)"
            aria-label="Focus session subject"
            className={`w-60 rounded-lg border px-3 py-2 text-xs focus:border-[#3867F4] focus:outline-none ${
              fullscreenMode
                ? 'border-white/20 bg-white/10 text-white placeholder:text-slate-300'
                : 'border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
            }`}
          />

          {mode === 'custom' && (
            <div className="flex items-center gap-2">
              <label htmlFor="custom-mins" className={fullscreenMode ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}>
                Minutes:
              </label>
              <input
                id="custom-mins"
                type="number"
                min={1}
                max={120}
                value={customMinutes}
                onChange={(e) => onChangeCustomMinutes(Math.max(1, Math.min(120, Number(e.target.value))))}
                className="w-20 rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          )}

          <select
            value={ambientSound}
            onChange={(e) => onChangeAmbientSound(e.target.value as AmbientSoundType)}
            aria-label="Ambient focus sound"
            className={`rounded-lg border px-3 py-2 text-xs ${
              fullscreenMode
                ? 'border-white/20 bg-[#101B35] text-white'
                : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            <option value="off">Ambient Sound: Off</option>
            <option value="rain">Ambient: Synthesized Soft Rain</option>
            <option value="brown-noise">Ambient: Deep Brown Noise</option>
            <option value="campus-hum">Ambient: Warm Study Hum</option>
          </select>
        </div>
      </div>

      {/* Circular Countdown */}
      <div className="my-8 flex flex-col items-center justify-center">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 240 240" aria-hidden="true">
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke={fullscreenMode ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}
              strokeWidth="10"
            />
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke={mode === 'short-break' || mode === 'long-break' ? '#22C55E' : '#3867F4'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              aria-live="polite"
              className={`font-mono text-5xl font-bold tracking-tight tabular-nums ${
                fullscreenMode ? 'text-white' : 'text-[#101B35] dark:text-white'
              }`}
            >
              {clockStr}
            </span>
            <span className={`mt-2 text-xs font-medium ${fullscreenMode ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
              {isRunning ? 'Focus Active' : hasStarted ? 'Paused' : 'Ready'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {!isRunning ? (
            <button
              type="button"
              onClick={onStartOrResume}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3867F4] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2952d6] transition-colors whitespace-nowrap"
            >
              <Play className="h-4 w-4" />
              <span>{hasStarted && timeLeft < totalSeconds ? 'Resume' : 'Start Session'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors whitespace-nowrap"
            >
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
              fullscreenMode
                ? 'border-white/25 text-white hover:bg-white/10'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Metrics Footer */}
      <div
        className={`grid grid-cols-1 divide-y rounded-xl border sm:grid-cols-3 sm:divide-x sm:divide-y-0 ${
          fullscreenMode
            ? 'divide-white/10 border-white/15 bg-white/5'
            : 'divide-slate-200 border-slate-200 bg-slate-50 dark:divide-slate-800 dark:border-slate-800 dark:bg-[#101B35]'
        }`}
      >
        <div className="p-4">
          <p className={`text-xs ${fullscreenMode ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
            Total Focus Time
          </p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums">{focusMinutes} min</p>
        </div>
        <div className="p-4">
          <p className={`text-xs ${fullscreenMode ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
            Completed Sessions
          </p>
          <p className="mt-1 font-mono text-xl font-bold tabular-nums">{history.length}</p>
        </div>
        <div className="p-4">
          <p className={`text-xs ${fullscreenMode ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
            Daily Focus Streak
          </p>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-xl font-bold text-[#F59E0B] tabular-nums">
            <Flame className="h-5 w-5" />
            <span>{streakDays} days</span>
          </p>
        </div>
      </div>
    </div>
  );

  if (fullscreenMode) {
    return timerStage;
  }

  return (
    <div className="space-y-6">
      {timerStage}

      {/* Focus Session History */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <h2 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
          Focus Session History
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Recent deep work logs (includes seeded sample records &amp; your completed timers)
        </p>

        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No focus sessions logged yet. Start your first timer above.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {history.slice(0, 10).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {item.subject}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.mode} · {new Date(item.completedAt).toLocaleString()}
                    {item.isDemo ? ' · Sample' : ''}
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-[#3867F4] tabular-nums">
                  +{item.durationMinutes} min
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
