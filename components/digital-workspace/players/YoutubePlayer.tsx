import React, { useRef, useState, useEffect } from 'react';
import type { Tile } from '@/lib/digital-workspace/types';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { useProductivityStore } from '@/lib/digital-workspace/store/useProductivity';
import { getYoutubeId, formatTime } from '@/lib/digital-workspace/utils/urlHelper';
import { 
  Play, Pause, Volume2, VolumeX, RotateCcw, 
  Bookmark, Music, Film, ChevronDown, Check, Maximize, Minimize
} from 'lucide-react';

// Load YouTube API globally once
let ytApiPromise: Promise<void> | null = null;
const loadYoutubeIframeAPI = (): Promise<void> => {
  if (ytApiPromise) return ytApiPromise;
  
  ytApiPromise = new Promise((resolve) => {
    if ((window as any).YT && (window as any).YT.Player) {
      resolve();
      return;
    }
    
    // Create global script tag
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    
    // Bind global callback
    (window as any).onYouTubeIframeAPIReady = () => {
      resolve();
    };
  });
  
  return ytApiPromise;
};

interface YoutubePlayerProps {
  tile: Tile;
}

export const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ tile }) => {
  const { updateTileSettings, updateTile } = useWorkspaceStore();
  const { addBookmark, trackWatchSeconds, addHistoryLog } = useProductivityStore();
  
  const playerRef = useRef<any>(null);
  const shadowHostRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const privacyShieldRef = useRef<HTMLDivElement>(null);
  const titleBlockerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  const progressIntervalRef = useRef<number | null>(null);
  const trackingIntervalRef = useRef<number | null>(null);
  const titleBlockerTimeoutRef = useRef<number | null>(null);
  
  // Keep up-to-date refs of state to prevent keydown listener recreation overhead
  const isPlayingRef = useRef<boolean>(false);
  const volumeRef = useRef<number>(tile.settings.volume ?? 50);
  const isMutedRef = useRef<boolean>(tile.settings.muted ?? false);
  const speedRef = useRef<number>(tile.settings.speed ?? 1);
  const isLoopingRef = useRef<boolean>(tile.settings.loop ?? false);
  const isAudioOnlyRef = useRef<boolean>(tile.settings.audioOnly ?? false);
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(tile.settings.volume ?? 50);
  const [isMuted, setIsMuted] = useState(tile.settings.muted ?? false);
  const [speed, setSpeed] = useState(tile.settings.speed ?? 1);
  const [isLooping, setIsLooping] = useState(tile.settings.loop ?? false);
  const [isAudioOnly, setIsAudioOnly] = useState(tile.settings.audioOnly ?? false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [bookmarkText, setBookmarkText] = useState('');
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimerRef = useRef<number | null>(null);
  
  const [videoUrlInput, setVideoUrlInput] = useState(tile.contentUrl || '');
  const [isValidVideo, setIsValidVideo] = useState(!!getYoutubeId(tile.contentUrl));

  const videoId = getYoutubeId(tile.contentUrl);

  // Sync state variables to their respective refs
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { isLoopingRef.current = isLooping; }, [isLooping]);
  useEffect(() => { isAudioOnlyRef.current = isAudioOnly; }, [isAudioOnly]);
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  // Synchronize Fullscreen Element Detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls: show on activity, hide after 2.5s when playing
  const showControlsTemporarily = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) window.clearTimeout(hideControlsTimerRef.current);
    if (isPlayingRef.current) {
      hideControlsTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  // Cleanup hide timer on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) window.clearTimeout(hideControlsTimerRef.current);
    };
  }, []);

  // When video pauses, always show controls back
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideControlsTimerRef.current) window.clearTimeout(hideControlsTimerRef.current);
    } else {
      // Start hide timer when playback begins
      if (hideControlsTimerRef.current) window.clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  // Title Blocker trigger handler
  const triggerTitleBlocker = () => {
    if (!titleBlockerRef.current) return;
    
    // Make visible instantly
    titleBlockerRef.current.style.transition = 'none';
    titleBlockerRef.current.style.opacity = '1';
    
    // Clear existing transition timeout
    if (titleBlockerTimeoutRef.current) {
      window.clearTimeout(titleBlockerTimeoutRef.current);
    }

    // Force reflow
    void titleBlockerRef.current.offsetHeight;

    // Set transition back and trigger fade-out after delay
    titleBlockerTimeoutRef.current = window.setTimeout(() => {
      if (titleBlockerRef.current) {
        titleBlockerRef.current.style.transition = 'opacity 0.6s ease-in-out';
        titleBlockerRef.current.style.opacity = '0';
      }
    }, 3200);
  };

  // Initialize YT Player inside Closed Shadow DOM
  useEffect(() => {
    if (!videoId || !shadowHostRef.current) return;

    let destroyed = false;

    // Setup Shadow DOM
    if (!shadowRootRef.current) {
      shadowRootRef.current = shadowHostRef.current.attachShadow({ mode: 'closed' });
    }

    const shadowRoot = shadowRootRef.current;
    shadowRoot.innerHTML = ''; // Clean previous DOM trees

    // Insert Shadow-root CSS rules for visual masking & point block
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        background: #000;
      }
      .crop-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .yt-iframe-target {
        position: absolute;
        top: -60px;
        left: 0;
        width: 100%;
        height: calc(100% + 120px);
        pointer-events: none; /* Block click/hovers */
        border: none;
      }
    `;
    shadowRoot.appendChild(styleTag);

    // Create mount wrapper and target element
    const wrapper = document.createElement('div');
    wrapper.className = 'crop-wrapper';
    const playerTarget = document.createElement('div');
    playerTarget.className = 'yt-iframe-target';
    
    wrapper.appendChild(playerTarget);
    shadowRoot.appendChild(wrapper);

    // Initialize API Player
    loadYoutubeIframeAPI().then(() => {
      if (destroyed) return;
      
      try {
        playerRef.current = new (window as any).YT.Player(playerTarget, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            showinfo: 0,
            rel: 0,
            disablekb: 1,
            enablejsapi: 1,
            iv_load_policy: 3,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              if (destroyed) return;
              const player = event.target;
              
              // Set volume and explicitly unmute (YouTube has separate mute state from volume)
              if (isMutedRef.current) {
                player.mute();
              } else {
                player.unMute();
                player.setVolume(volumeRef.current);
              }
              player.setPlaybackRate(speedRef.current);
              setDuration(player.getDuration());
              // Auto-play the video
              player.playVideo();
              
              const videoData = player.getVideoData();
              if (videoData && videoData.title) {
                updateTile(tile.id, { title: videoData.title });
                addHistoryLog(videoData.title, tile.contentUrl, player.getDuration());
              }
            },
            onStateChange: (event: any) => {
              if (destroyed) return;
              const state = event.data;
              
              // Direct DOM reference toggles for synchronous Privacy Shield
              if (privacyShieldRef.current) {
                // YT.PlayerState.PLAYING = 1
                if (state === 1) {
                  privacyShieldRef.current.style.opacity = '0';
                  privacyShieldRef.current.style.pointerEvents = 'none';
                  setIsPlaying(true);
                } else {
                  // Buffer/Pause/Ended states
                  privacyShieldRef.current.style.opacity = '1';
                  privacyShieldRef.current.style.pointerEvents = 'auto';
                  setIsPlaying(false);
                }
              }

              if (state === 0 && isLoopingRef.current) {
                playerRef.current.playVideo();
              }
            }
          }
        });
      } catch (err) {
        console.error("Error creating YouTube player instance:", err);
      }
    });

    return () => {
      destroyed = true;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
      playerRef.current = null;
    };
  }, [videoId]);

  // Sync seek and watch metrics loops
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = window.setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 250);

      trackingIntervalRef.current = window.setInterval(() => {
        const cat = isAudioOnlyRef.current ? 'Music / Lofi' : 'Entertainment';
        trackWatchSeconds(1, cat);
      }, 1000);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, [isPlaying]);

  // Global Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) {
        return;
      }

      if (!playerRef.current) return;

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyJ':
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'KeyL':
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(5);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-5);
          break;
        default:
          // Numeric Keys 0-9 for percentage seek
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            const pct = parseInt(e.key) / 10;
            seekToPercentage(pct);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (titleBlockerTimeoutRef.current) {
        window.clearTimeout(titleBlockerTimeoutRef.current);
      }
    };
  }, []);

  // Relative Seek Command
  const seekRelative = (seconds: number) => {
    if (!playerRef.current) return;
    const nextTime = Math.max(0, Math.min(durationRef.current, currentTimeRef.current + seconds));
    playerRef.current.seekTo(nextTime, true);
    setCurrentTime(nextTime);
    triggerTitleBlocker();
  };

  // Percentage Seek Command
  const seekToPercentage = (pct: number) => {
    if (!playerRef.current) return;
    const nextTime = durationRef.current * pct;
    playerRef.current.seekTo(nextTime, true);
    setCurrentTime(nextTime);
    triggerTitleBlocker();
  };

  // Adjust Volume Command
  const adjustVolume = (delta: number) => {
    if (!playerRef.current) return;
    const nextVolume = Math.max(0, Math.min(100, volumeRef.current + delta));
    setVolume(nextVolume);
    updateTileSettings(tile.id, { volume: nextVolume });
    playerRef.current.setVolume(nextVolume);
    if (isMutedRef.current && nextVolume > 0) {
      setIsMuted(false);
      updateTileSettings(tile.id, { muted: false });
      playerRef.current.unMute();
    }
  };

  // Playback Control Triggers
  const togglePlay = () => {
    if (!playerRef.current) return;
    let currentState = -1;
    if (typeof playerRef.current.getPlayerState === 'function') {
      try {
        currentState = playerRef.current.getPlayerState();
      } catch (e) {}
    }
    
    // YT.PlayerState.PLAYING = 1
    if (currentState === 1 || isPlayingRef.current) {
      if (typeof playerRef.current.pauseVideo === 'function') {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {}
      }
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      if (typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.playVideo();
        } catch (e) {}
      }
      setIsPlaying(true);
      isPlayingRef.current = true;
      triggerTitleBlocker();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const seekTo = parseFloat(e.target.value);
    playerRef.current.seekTo(seekTo, true);
    setCurrentTime(seekTo);
    triggerTitleBlocker();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    updateTileSettings(tile.id, { volume: v });
    if (playerRef.current) {
      playerRef.current.setVolume(v);
      if (isMuted && v > 0) {
        setIsMuted(false);
        updateTileSettings(tile.id, { muted: false });
        playerRef.current.unMute();
      }
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    updateTileSettings(tile.id, { muted: nextMute });
    if (nextMute) {
      playerRef.current.mute();
    } else {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
    }
  };

  const changeSpeed = (rate: number) => {
    setSpeed(rate);
    updateTileSettings(tile.id, { speed: rate });
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate);
    }
    setShowSpeedMenu(false);
  };

  const toggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    updateTileSettings(tile.id, { loop: nextLoop });
  };

  const toggleAudioOnly = () => {
    const nextAudioOnly = !isAudioOnly;
    setIsAudioOnly(nextAudioOnly);
    updateTileSettings(tile.id, { audioOnly: nextAudioOnly });
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmarkText.trim()) return;
    addBookmark(videoId || '', tile.title, currentTime, bookmarkText);
    setBookmarkText('');
    setShowBookmarkForm(false);
  };

  const handleLoadVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const id = getYoutubeId(videoUrlInput);
    if (id) {
      updateTile(tile.id, { contentUrl: videoUrlInput, title: 'Loading Video...' });
      setIsValidVideo(true);
    } else {
      alert("Invalid YouTube URL. Please verify the URL layout.");
    }
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  if (!isValidVideo) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-aether-surface/40">
        <Film className="w-8 h-8 text-aether-primary mb-3 stroke-1" />
        <form onSubmit={handleLoadVideo} className="w-full max-w-xs flex flex-col gap-2">
          <input
            type="text"
            placeholder="Paste YouTube Link..."
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded bg-black/40 border border-aether-border/30 text-aether-text focus:outline-none focus:border-aether-primary placeholder-aether-muted font-sans"
          />
          <button
            type="submit"
            className="w-full py-1.5 text-xs font-semibold rounded bg-aether-primary text-black hover:bg-aether-primary-hover transition-colors font-sans"
          >
            Load Video
          </button>
        </form>
      </div>
    );
  }

  return (
    <div 
      ref={playerContainerRef}
      className="w-full h-full flex flex-col relative group/player select-none bg-black overflow-hidden"
      onMouseMove={showControlsTemporarily}
      onMouseEnter={showControlsTemporarily}
      onMouseLeave={() => {
        if (hideControlsTimerRef.current) window.clearTimeout(hideControlsTimerRef.current);
        setShowControls(false);
      }}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {/* 1. Closed Shadow DOM Boundary Host Element */}
      <div 
        ref={shadowHostRef} 
        className={`flex-1 min-h-0 relative ${isAudioOnly ? 'hidden' : 'block'}`}
      />

      {/* 2. Synchronous DOM Privacy Shield Blocker */}
      <div 
        ref={privacyShieldRef}
        className="absolute inset-0 bg-black transition-opacity duration-300 z-10 pointer-events-none"
        style={{ opacity: 1 }}
      />

      {/* 3. Native Title Blocker Gradient overlay */}
      <div 
        ref={titleBlockerRef} 
        className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/90 to-transparent pointer-events-none transition-opacity duration-500 opacity-0 z-20"
      />

      {/* Play/Pause Center Indicator */}
      <div 
        onClick={togglePlay}
        className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer bg-transparent"
      >
        {!isPlaying && (
          <div className="w-14 h-14 bg-black/75 rounded-full border border-white/10 flex items-center justify-center hover:scale-105 hover:bg-black/90 transition-all shadow-2xl">
            <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
          </div>
        )}
      </div>

      {/* Audio Waveform Mode overlay */}
      {isAudioOnly && (
        <div className="absolute inset-0 bg-gradient-to-br from-aether-surface to-black/80 flex flex-col items-center justify-center p-4 z-20">
          <Music className="w-10 h-10 text-aether-primary mb-4 stroke-1 animate-pulse" />
          <div className="flex items-center gap-1.5 h-16 w-32">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => {
              const animDelay = `${bar * 0.1}s`;
              return (
                <div
                  key={bar}
                  className={`flex-1 w-1.5 rounded-full bg-aether-primary ${
                    isPlaying ? 'animate-bounce' : 'h-2'
                  }`}
                  style={{
                    animationDelay: animDelay,
                    animationDuration: `${0.6 + Math.random() * 0.8}s`,
                    height: isPlaying ? undefined : '8px',
                    animation: isPlaying ? 'pulse-glow 1s infinite alternate' : undefined,
                  }}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-aether-primary font-mono mt-4 tracking-wider uppercase">
            Audio Only Stream Active
          </span>
        </div>
      )}

      {/* Custom Control Bar Overlay - auto-hides when playing */}
      <div
        className="flex flex-col bg-black/90 border-t border-aether-border/20 px-3 py-2 text-aether-text gap-2 select-none z-30 font-sans transition-all duration-300"
        style={{
          opacity: showControls ? 1 : 0,
          transform: showControls ? 'translateY(0)' : 'translateY(100%)',
          pointerEvents: showControls ? 'auto' : 'none',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        
        {/* Top Seek Progress Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-aether-muted">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 rounded bg-white/10 accent-aether-primary cursor-pointer focus:outline-none"
          />
          <span className="text-[10px] font-mono text-aether-muted">{formatTime(duration)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1 rounded hover:bg-white/10 text-aether-text hover:text-aether-primary transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Mute & Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1 rounded hover:bg-white/10 text-aether-text hover:text-aether-primary transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-12 h-1 rounded bg-white/10 accent-aether-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Waveform Toggle */}
            <button
              onClick={toggleAudioOnly}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                isAudioOnly ? 'text-aether-primary bg-aether-primary/10' : 'text-aether-muted hover:text-aether-text'
              }`}
              title={isAudioOnly ? "Switch to Video" : "Switch to Audio Waveform"}
            >
              {isAudioOnly ? <Film className="w-4 h-4" /> : <Music className="w-4 h-4" />}
            </button>

            {/* Bookmark button */}
            <button
              onClick={() => setShowBookmarkForm(!showBookmarkForm)}
              className="p-1.5 rounded hover:bg-white/10 text-aether-muted hover:text-aether-text transition-colors"
              title="Bookmark timestamp"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Loop Toggle */}
            <button
              onClick={toggleLoop}
              className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                isLooping ? 'text-aether-primary bg-aether-primary/10' : 'text-aether-muted hover:text-aether-text'
              }`}
              title="Loop video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed selection */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-mono hover:bg-white/10 hover:border-white/20 transition-colors"
              >
                {speed}x <ChevronDown className="w-2.5 h-2.5" />
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-1 bg-aether-surface border border-aether-border/30 rounded shadow-xl py-1 w-20 z-50 text-[10px] font-mono">
                  {speedOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => changeSpeed(opt)}
                      className="w-full text-left px-2 py-1 hover:bg-white/10 flex items-center justify-between"
                    >
                      {opt}x {speed === opt && <Check className="w-3 h-3 text-aether-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-[1px] h-3 bg-white/10 mx-1" />

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded hover:bg-white/10 text-aether-muted hover:text-aether-text transition-colors animate-fade-in"
              title="Fullscreen Mode"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bookmark Popup Form */}
      {showBookmarkForm && (
        <form 
          onSubmit={handleAddBookmark}
          className="absolute bottom-[52px] inset-x-3 bg-aether-surface/95 border border-aether-border p-2 rounded-lg shadow-xl z-50 flex gap-2"
        >
          <input
            type="text"
            required
            placeholder="Add note at current time..."
            value={bookmarkText}
            onChange={(e) => setBookmarkText(e.target.value)}
            className="flex-1 bg-black/45 border border-aether-border/30 text-xs px-2.5 py-1 rounded text-aether-text placeholder-aether-muted focus:outline-none focus:border-aether-primary font-sans"
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-aether-primary text-black font-semibold text-xs rounded hover:bg-aether-primary-hover transition-colors font-sans"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setShowBookmarkForm(false)}
            className="px-2 py-1 bg-white/10 text-xs rounded hover:bg-white/20 transition-colors font-sans"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};
