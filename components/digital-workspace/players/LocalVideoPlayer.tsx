import React, { useState, useRef } from 'react';
import type { Tile } from '@/lib/digital-workspace/types';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { Film, Upload, RefreshCw } from 'lucide-react';

interface LocalVideoPlayerProps {
  tile: Tile;
}

export const LocalVideoPlayer: React.FC<LocalVideoPlayerProps> = ({ tile }) => {
  const { updateTile } = useWorkspaceStore();
  const [isLoaded, setIsLoaded] = useState(!!tile.contentUrl);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert("Only video files are supported.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    updateTile(tile.id, { contentUrl: localUrl, title: file.name });
    setIsLoaded(true);
  };

  const resetPlayer = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    updateTile(tile.id, { contentUrl: '' });
    setIsLoaded(false);
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-aether-surface/40">
        <Film className="w-8 h-8 text-aether-primary mb-3 stroke-1" />
        
        <div className="w-full max-w-xs flex flex-col gap-3">
          <label className="w-full flex flex-col items-center justify-center border border-dashed border-aether-border/40 hover:border-aether-primary/80 rounded-lg p-6 cursor-pointer hover:bg-white/5 transition-colors">
            <Upload className="w-6 h-6 text-aether-muted mb-2 animate-bounce" />
            <span className="text-xs text-aether-text font-medium text-center">Upload Local Video</span>
            <span className="text-[10px] text-aether-muted mt-1 text-center">Supports MP4, WebM, OGV</span>
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-aether-surface relative group/video">
      {/* Control bar */}
      <div className="px-3 py-1.5 bg-black/30 border-b border-aether-border/10 flex items-center justify-between text-[10px] text-aether-muted z-10">
        <span className="truncate max-w-[200px]">{tile.title}</span>
        <button
          onClick={resetPlayer}
          className="flex items-center gap-1 hover:text-aether-primary transition-colors py-0.5 px-1 rounded hover:bg-white/5"
          title="Change Video"
        >
          <RefreshCw className="w-3 h-3" /> Replace
        </button>
      </div>

      {/* Video element */}
      <div className="flex-1 min-h-0 relative bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={tile.contentUrl}
          controls
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};
