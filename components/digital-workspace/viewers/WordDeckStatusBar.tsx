import React from 'react';
import { Check } from 'lucide-react';

interface WordDeckStatusBarProps {
  wordsCount: number;
  charsCount: number;
  readingTime: number;
  zoom: number;
  onZoomChange: (val: number) => void;
  onFitWidth: () => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
}

export const WordDeckStatusBar: React.FC<WordDeckStatusBarProps> = ({
  wordsCount,
  charsCount,
  readingTime,
  zoom,
  onZoomChange,
  onFitWidth,
  saveStatus
}) => {
  return (
    <div className="h-8 border-t border-aether-border/10 bg-black/45 px-3 py-1 flex items-center justify-between text-[10px] text-aether-muted select-none">
      
      {/* Word Count / Character Count / Reading Time info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 border-r border-white/5 pr-4">
          <span className="font-semibold text-aether-text">{wordsCount}</span> words
          <span className="text-white/10">|</span>
          <span className="font-semibold text-aether-text">{charsCount}</span> chars
        </div>
        
        <div>
          Est. Reading Time: <span className="font-semibold text-aether-text">{readingTime} min</span>
        </div>
      </div>

      {/* Saving status & Zoom Control */}
      <div className="flex items-center gap-4">
        
        {/* Save indicator */}
        <div className="flex items-center gap-1 border-r border-white/5 pr-4">
          {saveStatus === 'saved' && (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500/80 font-bold">Auto-Saved</span>
            </>
          )}
          {saveStatus === 'saving' && (
            <>
              <div className="w-2.5 h-2.5 rounded-full border-2 border-aether-primary border-t-transparent animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === 'unsaved' && (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-500/80 font-bold">Unsaved changes</span>
            </>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onFitWidth} 
            className="hover:text-aether-text hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors border border-white/5 text-[9px]"
          >
            Fit Width
          </button>
          
          <div className="flex items-center gap-1.5">
            <span className="w-8 text-right font-mono font-bold text-aether-text">{zoom}%</span>
            <input 
              type="range" 
              min="50" 
              max="200" 
              step="5"
              value={zoom} 
              onChange={(e) => onZoomChange(parseInt(e.target.value))}
              className="w-16 accent-aether-primary cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
