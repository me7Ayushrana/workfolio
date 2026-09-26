import React, { useState, useRef, useEffect } from 'react';
import type { Tile } from '@/lib/digital-workspace/types';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { Music, Upload, RefreshCw, Play, Pause } from 'lucide-react';

interface LocalAudioPlayerProps {
  tile: Tile;
}

export const LocalAudioPlayer: React.FC<LocalAudioPlayerProps> = ({ tile }) => {
  const { updateTile } = useWorkspaceStore();
  const [isLoaded, setIsLoaded] = useState(!!tile.contentUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert("Only audio files are supported.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    updateTile(tile.id, { contentUrl: localUrl, title: file.name });
    setIsLoaded(true);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const resetPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    updateTile(tile.id, { contentUrl: '' });
    setIsLoaded(false);
    setIsPlaying(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-aether-surface/40">
        <Music className="w-8 h-8 text-aether-primary mb-3 stroke-1" />
        
        <div className="w-full max-w-xs flex flex-col gap-3">
          <label className="w-full flex flex-col items-center justify-center border border-dashed border-aether-border/40 hover:border-aether-primary/80 rounded-lg p-6 cursor-pointer hover:bg-white/5 transition-colors">
            <Upload className="w-6 h-6 text-aether-muted mb-2 animate-bounce" />
            <span className="text-xs text-aether-text font-medium text-center">Upload Local Audio</span>
            <span className="text-[10px] text-aether-muted mt-1 text-center">Supports MP3, WAV, OGG, AAC</span>
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-aether-surface relative group/audio">
      {/* Control bar */}
      <div className="px-3 py-1.5 bg-black/30 border-b border-aether-border/10 flex items-center justify-between text-[10px] text-aether-muted z-10">
        <span className="truncate max-w-[200px]">{tile.title}</span>
        <button
          onClick={resetPlayer}
          className="flex items-center gap-1 hover:text-aether-primary transition-colors py-0.5 px-1 rounded hover:bg-white/5"
          title="Change Audio"
        >
          <RefreshCw className="w-3 h-3" /> Replace
        </button>
      </div>

      {/* Audio Waveform visualizer area */}
      <div className="flex-1 min-h-0 bg-gradient-to-br from-aether-surface to-black/80 flex flex-col items-center justify-center p-4">
        <Music className={`w-8 h-8 text-aether-primary mb-3 stroke-1 ${isPlaying ? 'animate-pulse' : ''}`} />
        <div className="flex items-end gap-1 h-12 w-28 mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
            const animDuration = `${0.5 + Math.random() * 0.7}s`;
            const animDelay = `${bar * 0.08}s`;
            return (
              <div
                key={bar}
                style={{
                  height: isPlaying ? undefined : '6px',
                  animation: isPlaying ? 'pulse-glow 1s infinite alternate' : undefined,
                  animationDelay: isPlaying ? animDelay : undefined,
                  animationDuration: isPlaying ? animDuration : undefined,
                }}
                className="flex-1 w-1 bg-aether-primary rounded-t-full transition-all duration-300"
              />
            );
          })}
        </div>
        
        {/* Native Audio controls */}
        <div className="w-full flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-aether-primary text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
          <audio
            ref={audioRef}
            src={tile.contentUrl}
            controls
            className="flex-1 h-8 rounded bg-transparent accent-aether-primary"
          />
        </div>
      </div>
    </div>
  );
};
