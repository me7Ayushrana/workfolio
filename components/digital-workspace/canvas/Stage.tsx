import React, { useRef, useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { TileWrapper } from './TileWrapper';
import { YoutubePlayer } from '../players/YoutubePlayer';
import { PDFViewer } from '../viewers/PDFViewer';
import { NoteTile } from '../viewers/NoteTile';
import { ImageViewer } from '../viewers/ImageViewer';
import { WebsiteEmbed } from '../viewers/WebsiteEmbed';
import { LocalVideoPlayer } from '../players/LocalVideoPlayer';
import { LocalAudioPlayer } from '../players/LocalAudioPlayer';
import { InteractiveFileViewer } from '../viewers/InteractiveFileViewer';
import { ZoomIn, ZoomOut, RotateCcw, MonitorPlay, FileText, Keyboard, X } from 'lucide-react';
import { AtmosphereController } from './AtmosphereController';

export const Stage: React.FC = () => {
  const { 
    workspaces, 
    activeWorkspaceId, 
    zoom, 
    setZoom, 
    panOffset, 
    setPanOffset, 
    resetCanvas,
    addTile
  } = useWorkspaceStore();

  const activeWS = workspaces.find((w) => w.id === activeWorkspaceId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const shortcutPanelRef = useRef<HTMLDivElement>(null);
  const shortcutBtnRef = useRef<HTMLButtonElement>(null);

  // Click-outside to dismiss shortcut panel
  useEffect(() => {
    if (!showShortcuts) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        shortcutPanelRef.current && !shortcutPanelRef.current.contains(e.target as Node) &&
        shortcutBtnRef.current && !shortcutBtnRef.current.contains(e.target as Node)
      ) {
        setShowShortcuts(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShortcuts]);

  // Keyboard detection for spacebar panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement === document.body) {
        setSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Panning pointer events
  const handlePanStart = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only pan if clicking canvas background OR pressing spacebar
    const isBackground = e.target === containerRef.current || (e.target as HTMLElement).classList.contains('grid-bg');
    if (!isBackground && !spacePressed) return;

    e.preventDefault();
    setIsPanning(true);
    const startX = e.clientX - panOffset.x;
    const startY = e.clientY - panOffset.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setPanOffset({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handlePointerUp = () => {
      setIsPanning(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Zooming with Wheel event (requires Ctrl key or general scroll depending on settings)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (activeWS?.layoutMode !== 'freeform') return; // Zoom/Pan only for freeform
    
    // Zoom on wheel scroll + Ctrl / Command
    if (e.ctrlKey || e.metaKey || spacePressed) {
      e.preventDefault();
      const zoomFactor = 0.05;
      const nextZoom = e.deltaY < 0 ? zoom + zoomFactor : zoom - zoomFactor;
      setZoom(nextZoom);
    }
  };

  if (!activeWS) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-aether-muted p-8">
        <MonitorPlay className="w-16 h-16 mb-4 opacity-30 stroke-1" />
        <h2 className="text-xl font-medium text-aether-text mb-2">No Workspace Active</h2>
        <p className="text-sm">Select or create a workspace from the sidebar to begin.</p>
      </div>
    );
  }

  const renderTileContent = (tile: any) => {
    switch (tile.type) {
      case 'video':
        return <YoutubePlayer tile={tile} />;
      case 'pdf':
        return <PDFViewer tile={tile} />;
      case 'note':
        return <NoteTile tile={tile} />;
      case 'image':
        return <ImageViewer tile={tile} />;
      case 'website':
        return <WebsiteEmbed tile={tile} />;
      case 'local_video':
        return <LocalVideoPlayer tile={tile} />;
      case 'local_audio':
        return <LocalAudioPlayer tile={tile} />;
      case 'file':
        return <InteractiveFileViewer tile={tile} />;
      default:
        return <div className="p-4 text-center text-xs">Unsupported tile format</div>;
    }
  };

  // Presets styling generator
  const getPresetGridClass = () => {
    if (activeWS.presetType === '1x1') return 'grid grid-cols-1 grid-rows-1';
    if (activeWS.presetType === '1x2') return 'grid grid-cols-2 grid-rows-1';
    if (activeWS.presetType === '2x2') return 'grid grid-cols-2 grid-rows-2';
    if (activeWS.presetType === '1+3') return 'relative'; // Manual layout for 1+3 grid
    return '';
  };

  const isPresetLayout = activeWS.layoutMode === 'preset';

  return (
    <div 
      className="flex-1 relative flex flex-col overflow-hidden bg-transparent"
      onWheel={handleWheel}
    >


      {/* Floating Atmosphere panel controls */}
      <AtmosphereController />

      {/* Zoom and Pan Controls Overlay (Freeform only) */}
      {!isPresetLayout && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-md border border-aether-border/30 rounded-lg p-1.5 z-50 text-xs">
          <button
            onClick={() => setZoom(zoom - 0.1)}
            className="p-1.5 rounded hover:bg-white/10 text-aether-text transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 text-aether-muted font-mono font-bold w-12 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 0.1)}
            className="p-1.5 rounded hover:bg-white/10 text-aether-text transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-aether-border/30 mx-1" />
          <button
            onClick={resetCanvas}
            className="p-1.5 rounded hover:bg-white/10 text-aether-text transition-colors"
            title="Reset Canvas Viewport"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Canvas Viewport stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePanStart}
        className={`flex-1 w-full h-full relative overflow-hidden select-none outline-none ${
          isPanning ? 'cursor-grabbing' : spacePressed ? 'cursor-grab' : 'cursor-default'
        }`}
      >
        {/* Repeating grid background (Freeform only) */}
        {!isPresetLayout && (
          <div 
            className="absolute inset-0 pointer-events-none grid-bg transition-opacity duration-300"
            style={{
              opacity: 0.12,
              backgroundImage: 'radial-gradient(var(--aether-primary) 1px, transparent 1px)',
              backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            }}
          />
        )}

        {/* Empty Canvas State */}
        {activeWS.tiles.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10 pointer-events-none">
            <div className="bg-aether-surface/40 backdrop-blur-md border border-aether-border/20 rounded-xl p-8 max-w-sm pointer-events-auto shadow-xl">
              <FileText className="w-12 h-12 text-aether-primary mx-auto mb-4 stroke-1" />
              <h3 className="text-base font-semibold text-aether-text mb-1">Canvas is Empty</h3>
              <p className="text-xs text-aether-muted mb-4">
                Add content to start building your universe. Select Youtube video, PDF viewer, or markdown notes.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => addTile('video', 'https://www.youtube.com/watch?v=jfKfPfyJRdk')}
                  className="px-3 py-1.5 rounded-lg bg-aether-primary/10 border border-aether-primary/30 text-aether-primary text-xs hover:bg-aether-primary/20 transition-all font-medium"
                >
                  + Add Sample Video
                </button>
                <button
                  onClick={() => addTile('note')}
                  className="px-3 py-1.5 rounded-lg bg-aether-surface border border-aether-border/30 text-aether-text text-xs hover:bg-white/5 transition-all font-medium"
                >
                  + Add Notes Block
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tiles Container */}
        <div
          className={`w-full h-full p-4 ${isPresetLayout ? getPresetGridClass() : ''} gap-4`}
          style={
            !isPresetLayout
              ? {
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                }
              : undefined
          }
        >
          {/* Preset 1+3 Manual grid arrangement override */}
          {isPresetLayout && activeWS.presetType === '1+3' ? (
            <div className="w-full h-full relative flex gap-4">
              {/* Main Column */}
              {activeWS.tiles[0] && (
                <div className="w-[60%] h-full">
                  <TileWrapper
                    tile={activeWS.tiles[0]}
                    layoutMode="preset"
                    isActive={activeTileId === activeWS.tiles[0].id}
                    onSelect={() => setActiveTileId(activeWS.tiles[0].id)}
                  >
                    {renderTileContent(activeWS.tiles[0])}
                  </TileWrapper>
                </div>
              )}
              {/* Stacked Column */}
              <div className="w-[40%] h-full flex flex-col gap-4">
                {activeWS.tiles.slice(1, 4).map((tile) => (
                  <div key={tile.id} className="flex-1 min-h-0">
                    <TileWrapper
                      tile={tile}
                      layoutMode="preset"
                      isActive={activeTileId === tile.id}
                      onSelect={() => setActiveTileId(tile.id)}
                    >
                      {renderTileContent(tile)}
                    </TileWrapper>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // standard layout mapping (freeform / 1x1 / 1x2 / 2x2 grid cell columns)
            activeWS.tiles.map((tile) => (
              <TileWrapper
                key={tile.id}
                tile={tile}
                layoutMode={activeWS.layoutMode}
                isActive={activeTileId === tile.id}
                onSelect={() => setActiveTileId(tile.id)}
              >
                {renderTileContent(tile)}
              </TileWrapper>
            ))
          )}
        </div>
      </div>
      
      {/* Dynamic space-to-pan status bar */}
      {spacePressed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-aether-muted pointer-events-none flex items-center gap-1.5 border border-white/5 z-40">
          <span className="w-1.5 h-1.5 rounded-full bg-aether-primary animate-pulse" />
          Hold &amp; Drag mouse to pan canvas
        </div>
      )}

      {/* Keyboard Shortcuts Toggle Button (bottom-left) */}
      <div className="absolute bottom-5 left-5 z-40 flex flex-col items-start gap-2">
        {/* Floating panel - appears above the button when toggled */}
        {showShortcuts && (
          <div
            ref={shortcutPanelRef}
            className="bg-black/75 backdrop-blur-md px-4 py-3 rounded-xl border border-aether-border/20 text-[11px] text-aether-muted select-none font-sans shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-aether-text/60">Keyboard Shortcuts</span>
              <button
                onClick={() => setShowShortcuts(false)}
                className="ml-4 p-0.5 rounded hover:bg-white/10 text-aether-muted hover:text-aether-text transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <kbd className="font-mono text-aether-primary font-bold bg-aether-primary/10 px-1.5 py-0.5 rounded text-[10px]">Ctrl+F</kbd>
                <span>Theme Forge</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="font-mono text-aether-primary font-bold bg-aether-primary/10 px-1.5 py-0.5 rounded text-[10px]">Ctrl+P</kbd>
                <span>Pomodoro Timer</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="font-mono text-aether-primary font-bold bg-aether-primary/10 px-1.5 py-0.5 rounded text-[10px]">Ctrl+S</kbd>
                <span>Watch Stats</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="font-mono text-aether-primary font-bold bg-aether-primary/10 px-1.5 py-0.5 rounded text-[10px]">F</kbd>
                <span>Fullscreen / Focus Mode</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="font-mono text-aether-primary font-bold bg-aether-primary/10 px-1.5 py-0.5 rounded text-[10px]">Space+Drag</kbd>
                <span>Pan Canvas</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="font-mono text-aether-primary font-bold bg-aether-primary/10 px-1.5 py-0.5 rounded text-[10px]">Scroll</kbd>
                <span>Zoom In / Out</span>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard icon toggle button */}
        <button
          ref={shortcutBtnRef}
          onClick={() => setShowShortcuts(prev => !prev)}
          className={`p-2 rounded-full border transition-all duration-200 shadow-md backdrop-blur-md ${
            showShortcuts
              ? 'bg-aether-primary/20 border-aether-primary text-aether-primary'
              : 'bg-black/50 border-aether-border/20 text-aether-muted hover:text-aether-text hover:border-aether-border/50'
          }`}
          title="Keyboard shortcuts"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
