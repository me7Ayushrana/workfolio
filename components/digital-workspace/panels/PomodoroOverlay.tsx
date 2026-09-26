import React from 'react';
import { useProductivityStore } from '@/lib/digital-workspace/store/useProductivity';
import { Play, Pause, RotateCcw, X, Clock, Brain, Coffee } from 'lucide-react';

interface PomodoroOverlayProps {
  onClose: () => void;
}

export const PomodoroOverlay: React.FC<PomodoroOverlayProps> = ({ onClose }) => {
  const { 
    pomodoro, 
    startPomodoro, 
    pausePomodoro, 
    resetPomodoro, 
    setPomodoroType 
  } = useProductivityStore();

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getPercentage = () => {
    return ((pomodoro.totalDuration - pomodoro.duration) / pomodoro.totalDuration) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      
      {/* Modal Container */}
      <div className="w-full max-w-sm bg-aether-surface border border-aether-border/30 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-aether-border/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-aether-primary" />
            <h2 className="text-xs font-bold text-aether-primary tracking-widest uppercase">
              Focus Clock
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-aether-muted hover:text-aether-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex flex-col items-center justify-center space-y-6">
          
          {/* Mode Switchers */}
          <div className="grid grid-cols-3 gap-1 bg-black/25 p-1 rounded-lg border border-aether-border/10 w-full text-xs">
            <button
              onClick={() => setPomodoroType('focus')}
              className={`py-1.5 rounded transition-all font-semibold flex items-center justify-center gap-1 ${
                pomodoro.type === 'focus'
                  ? 'bg-aether-primary text-black'
                  : 'text-aether-muted hover:text-aether-text'
              }`}
            >
              <Brain className="w-3.5 h-3.5" /> Focus
            </button>
            <button
              onClick={() => setPomodoroType('shortBreak')}
              className={`py-1.5 rounded transition-all font-semibold flex items-center justify-center gap-1 ${
                pomodoro.type === 'shortBreak'
                  ? 'bg-aether-primary text-black'
                  : 'text-aether-muted hover:text-aether-text'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" /> Break
            </button>
            <button
              onClick={() => setPomodoroType('longBreak')}
              className={`py-1.5 rounded transition-all font-semibold flex items-center justify-center gap-1 ${
                pomodoro.type === 'longBreak'
                  ? 'bg-aether-primary text-black'
                  : 'text-aether-muted hover:text-aether-text'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" /> Long Break
            </button>
          </div>

          {/* Circular Countdown Progress Ring */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-white/5 fill-none"
                strokeWidth="6"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-aether-primary fill-none transition-all duration-300"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - getPercentage() / 100)}
                strokeLinecap="round"
              />
            </svg>

            {/* Floating Timer Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-aether-muted uppercase font-mono tracking-widest">
                {pomodoro.type === 'focus' ? 'Focus Session' : 'Relax & Rest'}
              </span>
              <span className="text-3xl font-black font-mono text-aether-text mt-1 select-all">
                {formatTimer(pomodoro.duration)}
              </span>
            </div>
          </div>

          {/* Controls Trigger Buttons */}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={pomodoro.isActive ? pausePomodoro : startPomodoro}
              className="flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 bg-aether-primary text-black hover:bg-aether-primary-hover shadow-md"
            >
              {pomodoro.isActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Timer
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Timer
                </>
              )}
            </button>
            <button
              onClick={resetPomodoro}
              className="px-3.5 py-2 rounded-lg bg-black/25 hover:bg-black/35 border border-aether-border/15 text-aether-text hover:text-aether-primary transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Instruction helper */}
          <p className="text-[10px] text-aether-muted text-center leading-normal max-w-[200px]">
            * Focus block auto-pauses active Youtube tabs upon tab switching (Smart Pause enabled).
          </p>

        </div>

      </div>

    </div>
  );
};
