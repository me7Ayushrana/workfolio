import React, { useRef, useState } from 'react';
import type { Tile } from '@/lib/digital-workspace/types';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { X, Move } from 'lucide-react';

interface TileWrapperProps {
  tile: Tile;
  layoutMode: 'preset' | 'freeform';
  isActive: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

export const TileWrapper: React.FC<TileWrapperProps> = ({
  tile,
  layoutMode,
  isActive,
  onSelect,
  children
}) => {
  const { updateTilePosition, removeTile, zoom } = useWorkspaceStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Position/size styles
  const style: React.CSSProperties = {
    position: layoutMode === 'freeform' ? 'absolute' : 'relative',
    left: layoutMode === 'freeform' ? `${tile.x}%` : undefined,
    top: layoutMode === 'freeform' ? `${tile.y}%` : undefined,
    width: layoutMode === 'freeform' ? `${tile.w}%` : '100%',
    height: layoutMode === 'freeform' ? `${tile.h}%` : '100%',
    zIndex: isActive ? 40 : 10,
  };

  // Custom Pointer-Event drag handler
  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (layoutMode !== 'freeform' || (e.target as HTMLElement).closest('.tile-action-btn')) return;
    
    e.preventDefault();
    onSelect();
    setIsDragging(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPercentX = tile.x;
    const startPercentY = tile.y;

    const parent = wrapperRef.current?.parentElement;
    if (!parent) return;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      // Calculate delta pixel motion and scale back by current zoom level
      const deltaX = (moveEvent.clientX - startX) / zoom;
      const deltaY = (moveEvent.clientY - startY) / zoom;

      // Convert delta pixels to percentage of parent dimensions
      const deltaPercentX = (deltaX / parentWidth) * 100;
      const deltaPercentY = (deltaY / parentHeight) * 100;

      // Allow tiles to reach all edges including right/bottom.
      // Min -5% so tiles can dock near edges; Max 95% so handle is always reachable.
      let nextX = Math.max(-5, Math.min(95, startPercentX + deltaPercentX));
      let nextY = Math.max(-5, Math.min(95, startPercentY + deltaPercentY));

      // Snap-to-grid check (e.g. snap to nearest 0.5%)
      nextX = Math.round(nextX * 2) / 2;
      nextY = Math.round(nextY * 2) / 2;

      updateTilePosition(tile.id, nextX, nextY, tile.w, tile.h);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Custom Pointer-Event resize handler
  const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();

    const startX = e.clientX;
    const startY = e.clientY;
    // Snapshot ALL tile geometry at pointer-down time so the closure
    // never reads stale/updated values from store re-renders mid-drag.
    const startPercentW = tile.w;
    const startPercentH = tile.h;
    const snapshotTileX  = tile.x;   // stable – won't change during resize
    const snapshotTileY  = tile.y;   // stable – won't change during resize

    const parent = wrapperRef.current?.parentElement;
    if (!parent) return;
    // Capture parent dimensions once at start (they don't change mid-drag)
    const parentWidth  = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      // Calculate delta pixel motion and scale back by current zoom level
      const deltaX = (moveEvent.clientX - startX) / zoom;
      const deltaY = (moveEvent.clientY - startY) / zoom;

      // Convert delta pixels to percentage of parent dimensions
      const deltaPercentW = (deltaX / parentWidth) * 100;
      const deltaPercentH = (deltaY / parentHeight) * 100;

      // Use snapshotted tile position for bounds — never reads live tile.x/y
      let nextW = Math.max(15, Math.min(100 - snapshotTileX, startPercentW + deltaPercentW));
      let nextH = Math.max(10, Math.min(100 - snapshotTileY, startPercentH + deltaPercentH));

      // Snap to nearest 0.5% for smooth but stable sizing
      nextW = Math.round(nextW * 2) / 2;
      nextH = Math.round(nextH * 2) / 2;

      updateTilePosition(tile.id, snapshotTileX, snapshotTileY, nextW, nextH);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Border glow styles based on border configuration
  const getBorderClasses = () => {
    let classes = 'border ';
    if (isActive) {
      classes += 'border-aether-primary ring-1 ring-aether-primary ';
      if (tile.settings.borderStyle === 'glow') {
        classes += 'glow-primary ';
      }
    } else {
      if (tile.settings.borderStyle === 'none') {
        classes += 'border-transparent ';
      } else if (tile.settings.borderStyle === 'dashed') {
        classes += 'border-dashed border-aether-border/60 ';
      } else if (tile.settings.borderStyle === 'glow') {
        classes += 'border-aether-border/40 hover:border-aether-border hover:glow-primary transition-all duration-300 ';
      } else {
        classes += 'border-aether-border/60 hover:border-aether-border/100 ';
      }
    }
    return classes;
  };

  return (
    <div
      ref={wrapperRef}
      style={style}
      onClick={onSelect}
      className={`flex flex-col rounded-aether bg-aether-surface overflow-hidden shadow-lg select-none transition-shadow ${getBorderClasses()} ${
        isDragging ? 'opacity-85 scale-[0.99] cursor-grabbing' : ''
      }`}
    >
      {/* Title bar / Drag Handle */}
      <div
        onPointerDown={handleDragStart}
        className={`flex items-center justify-between px-3 py-2 border-b border-aether-border/30 bg-black/25 text-xs text-aether-text font-medium select-none ${
          layoutMode === 'freeform' ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {layoutMode === 'freeform' && <Move className="w-3.5 h-3.5 text-aether-muted flex-shrink-0" />}
          <span className="truncate">{tile.title}</span>
        </div>
        
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          <button
            onClick={() => removeTile(tile.id)}
            title="Close tile"
            className="tile-action-btn p-1 rounded hover:bg-white/10 text-aether-muted hover:text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 min-h-0 relative bg-black/40">
        {children}
      </div>

      {/* Custom Resize Handle (Freeform Mode only) */}
      {layoutMode === 'freeform' && (
        <div
          onPointerDown={handleResizeStart}
          className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end group z-30"
          title="Resize tile"
        >
          <svg
            className="w-2.5 h-2.5 text-aether-muted hover:text-aether-primary transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 19H5m14 0V5" />
          </svg>
        </div>
      )}
    </div>
  );
};
