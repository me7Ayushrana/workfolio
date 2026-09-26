'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { useThemeStore, applyThemeToDOM } from '@/lib/digital-workspace/store/useTheme';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Stage } from './canvas/Stage';
import { TheForge } from './forge/TheForge';
import { StatsPanel } from './panels/StatsPanel';
import { PomodoroOverlay } from './panels/PomodoroOverlay';
import { BackgroundAtmosphere } from './canvas/BackgroundAtmosphere';
import { Minimize2, Layers, ArrowRight, Play, X, MonitorPlay, Image as ImageIcon, FileText, Music, Palette, Timer, Globe } from 'lucide-react';

export default function DigitalWorkspaceApp() {
  const { importWorkspaceFromHash, workspaces, setActiveWorkspace, activeWorkspaceId } = useWorkspaceStore();
  
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [forgeOpen, setForgeOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const { activeThemeId, themes, customCSS } = useThemeStore.getState();
    const themeToApply = themes.find(t => t.id === activeThemeId) || themes[1] || themes[0];
    applyThemeToDOM(themeToApply, customCSS);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Error exiting fullscreen:", err);
      });
    }
  };

  // Check URL hash for shared workspaces on mount
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#layout=')) {
        const layoutHash = hash.replace('#layout=', '');
        const success = importWorkspaceFromHash(layoutHash);
        if (success) {
          setViewMode('dashboard');
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          alert("Import failed. The shared URL link appears to be invalid or broken.");
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [importWorkspaceFromHash]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setForgeOpen(prev => !prev);
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPomodoroOpen(prev => !prev);
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setStatsOpen(prev => !prev);
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'f') {
        const activeTag = (document.activeElement?.tagName || '').toLowerCase();
        const isEditable = activeTag === 'input' || activeTag === 'textarea' || 
          (document.activeElement as HTMLElement)?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, []);

  const handleStartFree = () => {
    if (workspaces.length > 0) {
      setActiveWorkspace(workspaces[0].id);
    }
    setViewMode('dashboard');
  };

  const handleLoadDemoWS = (id: string) => {
    setActiveWorkspace(id);
    setViewMode('dashboard');
  };

  // RENDER LANDING PAGE VIEWPORT IF LANDING MODE
  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-[#07070a] text-aether-text flex flex-col font-sans select-none overflow-y-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-aether-primary/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[150px]" />
        </div>

        <nav className="h-16 w-full bg-[#07070a]/60 backdrop-blur-md border-b border-aether-border/10 px-6 sm:px-12 flex items-center justify-between z-30 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[4px] bg-aether-primary flex items-center justify-center shadow-lg shadow-aether-primary/20">
              <span className="text-white font-black text-sm tracking-tighter">WF</span>
            </div>
            <span className="font-bold text-sm tracking-wider uppercase text-aether-text font-serif">
              Workfolio Ocean
            </span>
          </div>
          <button
            onClick={handleStartFree}
            className="px-5 py-2 text-xs font-bold rounded-[4px] bg-aether-primary text-white hover:bg-aether-primary-hover hover:shadow-lg hover:shadow-aether-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch Canvas
          </button>
        </nav>

        <main className="max-w-6xl mx-auto w-full px-6 pt-12 pb-8 flex flex-col md:grid md:grid-cols-12 md:gap-16 items-center md:items-start text-left z-10">
          <div className="md:col-span-7 flex flex-col gap-6 items-start">
            <h1 className="text-5xl md:text-7xl font-bold font-serif text-aether-text leading-[1.05] tracking-tight max-w-2xl">
              Your Universe. <br />
              Your Canvas. <br />
              Your Command.
            </h1>

            <p className="text-base md:text-lg text-aether-muted max-w-xl leading-relaxed font-sans mt-2">
              Unify multiple video loops, document frames, notes, and ambient controllers on a fluid, zoomable grid. Dim background brightness, adjust layouts, and build your digital workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
              <button
                onClick={handleStartFree}
                className="px-8 py-3.5 text-sm font-bold rounded-[4px] bg-aether-primary text-white hover:bg-aether-primary-hover transition-all shadow-lg shadow-aether-primary/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Start Free Workspace <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowIntro(true)}
                className="px-8 py-3.5 text-sm font-bold rounded-[4px] border border-aether-border/30 text-aether-muted hover:text-aether-text hover:border-aether-border/60 transition-all flex items-center justify-center gap-2"
              >
                How it Works
              </button>
            </div>
          </div>

          <div className="md:col-span-5 w-full mt-12 md:mt-0 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-aether-primary/70 uppercase tracking-widest font-sans mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Workspace Presets
            </h2>
            <div className="flex flex-col gap-4">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => handleLoadDemoWS(ws.id)}
                  className="p-5 rounded-[4px] bg-aether-surface/40 backdrop-blur-sm border border-aether-border/15 hover:border-aether-primary/45 cursor-pointer text-left transition-all hover:translate-y-[-3px] shadow-lg flex flex-col group"
                >
                  {ws.thumbnailUrl && (
                    <div className="w-full h-36 overflow-hidden rounded-[2px] mb-4 bg-black/30 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      <img 
                        src={ws.thumbnailUrl} 
                        alt={ws.name} 
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                      />
                      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded text-[9px] text-white border border-white/5 font-mono">
                        <Play className="w-2.5 h-2.5 fill-current text-aether-primary" />
                        Click to Load Preset
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-aether-text font-serif group-hover:text-aether-primary transition-colors">{ws.name}</h3>
                    <span className="text-[10px] text-aether-muted font-mono bg-black/40 border border-white/5 px-2 py-0.5 rounded-[2px]">{ws.tiles.length} panels</span>
                  </div>
                  <p className="text-xs text-aether-muted mt-1 leading-relaxed">
                    {ws.id === 'study-workspace' 
                      ? 'Loads a side-by-side splitscreen with Lo-Fi background loops and study notes for focus sessions.'
                      : 'Loads twin video player panes. Perfect for tracking side-by-side tutorials or comparative watching.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="py-8 border-t border-aether-border/10 text-center text-[10px] text-aether-muted mt-auto bg-black/20">
          Workfolio Ocean Platform — Build your workspaces. Launch your canvas.
        </footer>
      </div>
    );
  }

  // RENDER CANVAS DASHBOARD VIEWPORT
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans select-none text-aether-text relative bg-transparent">
      <BackgroundAtmosphere />
      
      {!isFullscreen && (
        <Header 
          onOpenStats={() => setStatsOpen(true)}
          onOpenPomodoro={() => setPomodoroOpen(true)}
          onOpenForge={() => setForgeOpen(!forgeOpen)}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}

      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {!isFullscreen && (
          <Sidebar 
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        <Stage />

        {!isFullscreen && forgeOpen && (
          <TheForge onClose={() => setForgeOpen(false)} />
        )}
      </div>

      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed bottom-4 right-4 z-50 p-2.5 rounded-full bg-black/60 hover:bg-black/85 border border-white/15 text-aether-text hover:text-aether-primary transition-all shadow-lg hover:scale-110 active:scale-95 group flex items-center gap-1.5 cursor-pointer backdrop-blur-sm pointer-events-auto"
          title="Exit Fullscreen Mode (F)"
        >
          <Minimize2 className="w-4 h-4" />
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[100px] transition-all duration-300 overflow-hidden whitespace-nowrap">
            Exit Focus
          </span>
        </button>
      )}

      {statsOpen && (
        <StatsPanel onClose={() => setStatsOpen(false)} />
      )}

      {pomodoroOpen && (
        <PomodoroOverlay onClose={() => setPomodoroOpen(false)} />
      )}
    </div>
  );
}
