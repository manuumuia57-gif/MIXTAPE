import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { TimerPreset, TimerPresetId } from '../types/campus';

interface FocusTimerSectionProps {
  presets: TimerPreset[];
  activePreset: TimerPreset;
  timeLeft: number;
  isRunning: boolean;
  soundEnabled: boolean;
  focusMinutes: number;
  onSelectPreset: (id: TimerPresetId) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onToggleSound: () => void;
}

export function FocusTimerSection({
  presets,
  activePreset,
  timeLeft,
  isRunning,
  soundEnabled,
  focusMinutes,
  onSelectPreset,
  onStart,
  onPause,
  onReset,
  onToggleSound,
}: FocusTimerSectionProps) {
  const totalSeconds = activePreset.minutes * 60;
  const elapsedSeconds = Math.max(0, totalSeconds - timeLeft);
  const progressRatio = totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedClock = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Focus Timer</h1>
            <p className="mt-1 text-sm text-slate-500">
              Use 25 minutes of focused study followed by a short break.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-indigo-600" />
                <span>Chime On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-slate-400" />
                <span>Chime Off</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  activePreset.id === preset.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="my-8 flex flex-col items-center justify-center">
          <div className="relative flex h-56 w-56 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 216 216" aria-hidden="true">
              <circle
                cx="108"
                cy="108"
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
              />
              <circle
                cx="108"
                cy="108"
                r={radius}
                fill="none"
                stroke={activePreset.isFocusSession ? '#4f46e5' : '#16a34a'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                aria-live="polite"
                className="font-mono text-5xl font-bold tracking-tight text-slate-900 tabular-nums"
              >
                {formattedClock}
              </span>
              <span className="mt-2 text-xs font-medium text-slate-500">
                {isRunning
                  ? activePreset.isFocusSession
                    ? 'Focus in progress'
                    : 'Break in progress'
                  : activePreset.isFocusSession
                  ? 'Ready to study'
                  : 'Ready for break'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {!isRunning ? (
              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                <Play className="h-4 w-4" />
                <span>Start</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onPause}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-slate-900"
              >
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </button>
            )}

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-4 text-center sm:text-left">
            <p className="text-xs font-medium text-slate-500">Total Focus Minutes</p>
            <p className="mt-1 font-mono text-xl font-semibold text-slate-900 tabular-nums">
              {focusMinutes} min
            </p>
          </div>
          <div className="p-4 text-center sm:text-left">
            <p className="text-xs font-medium text-slate-500">Completed 25m Blocks</p>
            <p className="mt-1 font-mono text-xl font-semibold text-indigo-600 tabular-nums">
              {Math.floor(focusMinutes / 25)}
            </p>
          </div>
          <div className="p-4 text-center sm:text-left">
            <p className="text-xs font-medium text-slate-500">Session Rule</p>
            <p className="mt-1 text-xs text-slate-600">
              Completed focus timers automatically log minutes to your dashboard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
