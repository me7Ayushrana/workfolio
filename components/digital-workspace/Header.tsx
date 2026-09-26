import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { useThemeStore } from '@/lib/digital-workspace/store/useTheme';
import { useProductivityStore } from '@/lib/digital-workspace/store/useProductivity';
import { 
  Monitor, LayoutGrid, Share2, Play, Pause, 
  RotateCcw, Sparkles, BarChart2, Check, Edit2, Sun, Moon, Timer,
  Maximize2, Minimize2
} from 'lucide-react';

interface HeaderProps {
  onOpenStats: () => void;
  onOpenPomodoro: () => void;
  onOpenForge: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenStats, 
  onOpenPomodoro, 
  onOpenForge,
  onToggleFullscreen,
  isFullscreen
}) => {
  const { 
    workspaces, 
    activeWorkspaceId, 
    setLayoutMode, 
    setPresetType, 
    updateWorkspaceName,
    exportWorkspaceToHash
  } = useWorkspaceStore();

  const { activeThemeId, setActiveTheme, themes } = useThemeStore();
  const { pomodoro, startPomodoro, pausePomodoro, resetPomodoro, tickPomodoro } = useProductivityStore();
  
  const activeWS = workspaces.find((w) => w.id === activeWorkspaceId);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(activeWS?.name || '');
  const [shareCopied, setShareCopied] = useState(false);

  // Sync workspace name input
  useEffect(() => {
    if (activeWS) {
      setNameInput(activeWS.name);
    }
  }, [activeWS?.id]);

  // Pomodoro clock tick interval
  useEffect(() => {
    let interval: number | null = null;
    if (pomodoro.isActive) {
      interval = window.setInterval(() => {
        tickPomodoro();
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoro.isActive]);

  const handleSaveName = () => {
    if (activeWS && nameInput.trim()) {
      updateWorkspaceName(activeWS.id, nameInput.trim());
      setIsEditingName(false);
    }
  };

  const handleShare = () => {
    const hash = exportWorkspaceToHash();
    if (!hash) return;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}#layout=${hash}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  const handleThemeToggle = () => {
    const activeTheme = themes.find(t => t.id === activeThemeId) || themes[0];
    const isLight = activeTheme.id === 'clean-light' || 
                    activeTheme.colors.bg.toLowerCase() === '#ffffff' || 
                    activeTheme.colors.bg.toLowerCase() === '#fafafa';
    setActiveTheme(isLight ? 'neon-dark' : 'clean-light');
  };

  // Format Pomodoro Time MM:SS
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="h-16 w-full glass-panel border-b border-aether-border/20 px-6 flex items-center justify-between select-none z-50">
      
      {/* Left Area: Logo & Workspace Name */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-aether-primary to-aether-primary-hover flex items-center justify-center shadow-lg shadow-aether-primary/20">
            <span className="text-black font-black text-sm tracking-tighter">WF</span>
          </div>
          <span className="font-bold text-sm text-aether-text tracking-wider hidden sm:inline">
            WORKFOLIO OCEAN
          </span>
        </div>

        <div className="h-6 w-[1px] bg-aether-border/20 hidden sm:block" />

        {/* Dynamic Edit Workspace Title */}
        {activeWS && (
          <div className="flex items-center gap-2 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="bg-black/40 border border-aether-primary/40 text-xs rounded px-2 py-1 text-aether-text focus:outline-none focus:border-aether-primary max-w-[150px] sm:max-w-xs"
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-1 text-aether-primary">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0 group/name">
                <h1 className="text-xs sm:text-sm font-semibold text-aether-text truncate">
                  {activeWS.name}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="opacity-0 group-hover/name:opacity-100 p-1 text-aether-muted hover:text-aether-primary transition-opacity"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center Area: Layout Managers */}
      {activeWS && (
        <div className="hidden lg:flex items-center gap-4 bg-black/20 px-3 py-1 rounded-lg border border-aether-border/10 text-xs">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLayoutMode('preset')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                activeWS.layoutMode === 'preset'
                  ? 'bg-aether-primary text-black font-semibold'
                  : 'text-aether-muted hover:text-aether-text'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid Presets
            </button>
            <button
              onClick={() => setLayoutMode('freeform')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                activeWS.layoutMode === 'freeform'
                  ? 'bg-aether-primary text-black font-semibold'
                  : 'text-aether-muted hover:text-aether-text'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Free Canvas
            </button>
          </div>

          {/* Grid Preset Selectors */}
          {activeWS.layoutMode === 'preset' && (
            <>
              <div className="w-[1px] h-4 bg-aether-border/20" />
              <div className="flex items-center gap-1">
                {['1x1', '1x2', '2x2', '1+3'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setPresetType(preset as any)}
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] transition-colors ${
                      activeWS.presetType === preset
                        ? 'text-aether-primary bg-aether-primary/10 border border-aether-primary/20'
                        : 'text-aether-muted hover:text-aether-text'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Right Area: Tools, Themes, Pomodoro, Share */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Pomodoro Tracker Clock */}
        <div className="flex items-center bg-black/30 border border-aether-border/10 rounded-lg px-2 sm:px-3 py-1 gap-2 text-xs">
          <button
            onClick={onOpenPomodoro}
            className={`font-mono font-bold tracking-wider hover:text-aether-primary transition-colors ${
              pomodoro.isActive ? 'text-aether-primary animate-pulse' : 'text-aether-text'
            }`}
            title="Pomodoro Timer"
          >
            <span className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" />
              {formatTimer(pomodoro.duration)}
            </span>
          </button>
          <div className="w-[1px] h-3 bg-aether-border/20" />
          <button
            onClick={pomodoro.isActive ? pausePomodoro : startPomodoro}
            className="text-aether-muted hover:text-aether-primary transition-colors"
          >
            {pomodoro.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          </button>
          <button
            onClick={resetPomodoro}
            className="text-aether-muted hover:text-aether-primary transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Open Stats Modal button */}
        <button
          onClick={onOpenStats}
          className="p-2 rounded bg-black/20 hover:bg-black/30 border border-aether-border/10 text-aether-muted hover:text-aether-text transition-colors"
          title="Watch Statistics"
        >
          <BarChart2 className="w-4 h-4" />
        </button>

        {/* Theme customization button */}
        <button
          onClick={onOpenForge}
          className="p-2 rounded bg-black/20 hover:bg-black/30 border border-aether-border/10 text-aether-muted hover:text-aether-text transition-colors"
          title="The Forge (Theme Builder)"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Toggle Theme (Sun/Moon) */}
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded bg-black/20 hover:bg-black/30 border border-aether-border/10 text-aether-muted hover:text-aether-text transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {activeThemeId === 'clean-light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Fullscreen Workspace Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded bg-black/20 hover:bg-black/30 border border-aether-border/10 text-aether-muted hover:text-aether-text transition-colors"
          title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Share Workspace Button */}
        {activeWS && (
          <button
            onClick={handleShare}
            className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all shadow-md ${
              shareCopied
                ? 'bg-green-500 text-white'
                : 'bg-aether-primary text-black hover:bg-aether-primary-hover shadow-aether-primary/10'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{shareCopied ? 'Copied!' : 'Share'}</span>
          </button>
        )}
      </div>

    </header>
  );
};
