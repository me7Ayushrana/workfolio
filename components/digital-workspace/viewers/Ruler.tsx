import React from 'react';

interface RulerProps {
  zoom: number;
}

export const Ruler: React.FC<RulerProps> = ({ zoom }) => {
  // Generate ticks for 8.5 inches horizontal width (8.5 * 96px = 816px total)
  const ticks = Array.from({ length: 85 }, (_, i) => i * 0.1);

  return (
    <div className="w-full bg-[#111116] border-b border-aether-border/10 flex flex-col select-none">
      {/* Horizontal Ruler */}
      <div 
        className="h-5 w-full flex relative overflow-hidden bg-black/10 border-b border-white/5"
        style={{ paddingLeft: `${96 * (zoom / 100)}px` }} // Align with margin
      >
        {/* Indent boundaries */}
        <div 
          className="absolute inset-y-0 left-0 bg-white/5 border-r border-white/10"
          style={{ width: `${96 * (zoom / 100)}px` }}
        />
        <div 
          className="absolute inset-y-0 right-0 bg-white/5 border-l border-white/10"
          style={{ width: `${96 * (zoom / 100)}px` }}
        />

        {/* Ticks */}
        <div 
          className="flex relative h-full"
          style={{ 
            width: `${624 * (zoom / 100)}px`, // Editable text width
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'left top'
          }}
        >
          {ticks.map((val, idx) => {
            const isInch = Math.round(val * 10) % 10 === 0;
            const isHalfInch = Math.round(val * 10) % 5 === 0;
            const leftPos = idx * 9.6; // 9.6px per 0.1 inch

            return (
              <div 
                key={idx} 
                className="absolute bottom-0 flex flex-col items-center"
                style={{ left: `${leftPos}px` }}
              >
                {isInch ? (
                  <>
                    <div className="w-px h-2.5 bg-aether-muted" />
                    <span className="text-[7px] text-aether-muted font-bold font-mono mt-0.5 leading-none">
                      {Math.round(val)}
                    </span>
                  </>
                ) : isHalfInch ? (
                  <div className="w-px h-1.5 bg-aether-muted/60" />
                ) : (
                  <div className="w-px h-1 bg-aether-muted/30" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
