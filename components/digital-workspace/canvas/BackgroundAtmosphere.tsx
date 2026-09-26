import React, { useEffect, useRef, useState } from 'react';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { getYoutubeId } from '@/lib/digital-workspace/utils/urlHelper';
import { getFileBlob } from '@/lib/digital-workspace/utils/db';

export const BackgroundAtmosphere: React.FC = () => {
  const { workspaces, activeWorkspaceId } = useWorkspaceStore();
  const activeWS = workspaces.find((w) => w.id === activeWorkspaceId);
  
  // Fallback to default settings to guarantee a background video/mood loads
  const bgSettings = activeWS?.bgSettings || {
    type: 'video',
    imageUrl: '',
    videoId: 'AERHuUExvcw',
    videoVolume: 0,
    musicId: '',
    musicVolume: 50,
    musicPlaying: false,
    playArea: 'stage',
    bgBrightness: 40
  };

  const videoPlayerRef = useRef<any>(null);
  const musicPlayerRef = useRef<any>(null);
  
  const videoContainerId = 'atmosphere-video-iframe';
  const musicContainerId = 'atmosphere-music-iframe';

  const isLocalVideo = bgSettings?.videoId?.startsWith('local-file:');
  const videoId = bgSettings?.videoId && !isLocalVideo ? getYoutubeId(bgSettings.videoId) : '';
  
  const musicId = bgSettings?.musicId ? getYoutubeId(bgSettings.musicId) : '';
  const musicPlaying = bgSettings?.musicPlaying ?? false;
  const musicVolume = bgSettings?.musicVolume ?? 50;
  // Map 5–100 range to css brightness 0.05–1.0 (default 40 → 0.4)
  const bgBrightness = bgSettings?.bgBrightness ?? 40;
  const brightnessValue = bgBrightness / 100;

  // Keep a ref to musicPlaying so YouTube callbacks always read the LIVE value
  // (callbacks close over the value at creation time — the ref avoids stale closures)
  const musicPlayingRef = useRef<boolean>(musicPlaying);
  useEffect(() => {
    musicPlayingRef.current = musicPlaying;
  }, [musicPlaying]);

  const [localImageUrl, setLocalImageUrl] = useState<string>('');
  const [localVideoUrl, setLocalVideoUrl] = useState<string>('');

  // Load local background files from IndexedDB
  useEffect(() => {
    let activeImageUrl = '';
    let activeVideoUrl = '';

    const loadLocalFiles = async () => {
      // 1. Image loading
      if (bgSettings?.type === 'image' && bgSettings.imageUrl?.startsWith('local-file:')) {
        const key = bgSettings.imageUrl.substring('local-file:'.length);
        const blob = await getFileBlob(key);
        if (blob) {
          activeImageUrl = URL.createObjectURL(blob);
          setLocalImageUrl(activeImageUrl);
        }
      } else {
        setLocalImageUrl('');
      }

      // 2. Video loading
      if (bgSettings?.type === 'video' && bgSettings.videoId?.startsWith('local-file:')) {
        const key = bgSettings.videoId.substring('local-file:'.length);
        const blob = await getFileBlob(key);
        if (blob) {
          activeVideoUrl = URL.createObjectURL(blob);
          setLocalVideoUrl(activeVideoUrl);
        }
      } else {
        setLocalVideoUrl('');
      }
    };

    loadLocalFiles();

    return () => {
      if (activeImageUrl) URL.revokeObjectURL(activeImageUrl);
      if (activeVideoUrl) URL.revokeObjectURL(activeVideoUrl);
    };
  }, [bgSettings?.imageUrl, bgSettings?.videoId, bgSettings?.type, activeWorkspaceId]);

  // Shared helper: ensure YouTube iframe API is loaded
  const ensureYTAPI = (): Promise<void> => {
    return new Promise((resolve) => {
      if ((window as any).YT && (window as any).YT.Player) {
        resolve();
        return;
      }

      // Inject script if not present
      let tag = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!tag) {
        tag = document.createElement('script');
        (tag as HTMLScriptElement).src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Poll until API is ready
      const interval = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          clearInterval(interval);
          resolve();
        }
      }, 150);
    });
  };

  // Initialize background VIDEO player (independent lifecycle)
  useEffect(() => {
    if (!videoId || bgSettings?.type !== 'video' || isLocalVideo) return;

    let destroyed = false;
    let player: any = null;

    const init = async () => {
      await ensureYTAPI();
      if (destroyed) return;

      const container = document.getElementById(videoContainerId);
      if (!container) {
        // Retry if DOM not ready yet
        setTimeout(init, 100);
        return;
      }

      try {
        player = new (window as any).YT.Player(videoContainerId, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            showinfo: 0,
            rel: 0,
            disablekb: 1,
            enablejsapi: 1,
            loop: 1,
            playlist: videoId,
            playsinline: 1,
            iv_load_policy: 3,
            origin: window.location.origin
          },
          events: {
            onReady: (e: any) => {
              e.target.mute();
              e.target.playVideo();
            },
            onStateChange: (e: any) => {
              if (e.data === (window as any).YT.PlayerState.ENDED) {
                e.target.playVideo();
              }
            }
          }
        });
        videoPlayerRef.current = player;
      } catch (err) {
        console.error("Error creating bg video player:", err);
      }
    };

    init();

    return () => {
      destroyed = true;
      try {
        if (player && typeof player.destroy === 'function') player.destroy();
      } catch (_e) {}
      videoPlayerRef.current = null;
    };
  }, [videoId, bgSettings?.type, activeWorkspaceId]);

  // Initialize background MUSIC player (independent lifecycle)
  useEffect(() => {
    if (!musicId) return;

    let destroyed = false;
    let player: any = null;

    const init = async () => {
      await ensureYTAPI();
      if (destroyed) return;

      const container = document.getElementById(musicContainerId);
      if (!container) {
        setTimeout(init, 100);
        return;
      }

      try {
        player = new (window as any).YT.Player(musicContainerId, {
          videoId: musicId,
          playerVars: {
            autoplay: musicPlayingRef.current ? 1 : 0,
            controls: 0,
            showinfo: 0,
            rel: 0,
            disablekb: 1,
            enablejsapi: 1,
            loop: 1,
            playlist: musicId,
            playsinline: 1,
            iv_load_policy: 3,
            origin: window.location.origin
          },
          events: {
            onReady: (e: any) => {
              e.target.setVolume(musicVolume);
              if (musicPlayingRef.current) {
                e.target.playVideo();
              } else {
                e.target.pauseVideo();
              }
            },
            onStateChange: (e: any) => {
              if (
                e.data === (window as any).YT.PlayerState.ENDED &&
                musicPlayingRef.current
              ) {
                e.target.playVideo();
              }
            }
          }
        });
        musicPlayerRef.current = player;
      } catch (err) {
        console.error("Error creating bg music player:", err);
      }
    };

    init();

    return () => {
      destroyed = true;
      try {
        if (player && typeof player.destroy === 'function') player.destroy();
      } catch (_e) {}
      musicPlayerRef.current = null;
    };
  }, [musicId, activeWorkspaceId]);

  // Synchronize music playing/pausing state
  // This is the authoritative source — fires whenever the UI button is clicked
  useEffect(() => {
    const player = musicPlayerRef.current;
    if (!player) return;
    try {
      // getPlayerState returns -1 (unstarted), 1 (playing), 2 (paused), 3 (buffering)
      const state = typeof player.getPlayerState === 'function' ? player.getPlayerState() : -1;
      if (musicPlaying) {
        // Only call play if not already playing or buffering
        if (state !== 1 && state !== 3) {
          player.playVideo();
        }
      } else {
        // Pause unconditionally — this is the important fix
        player.pauseVideo();
      }
    } catch (err) {
      // player might not be fully initialised yet
    }
  }, [musicPlaying]);

  // Synchronize music volume state
  useEffect(() => {
    const player = musicPlayerRef.current;
    if (player && typeof player.setVolume === 'function') {
      try {
        player.setVolume(musicVolume);
      } catch (err) {
        // player might not be fully ready
      }
    }
  }, [musicVolume]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0">
      {/* 1. Solid Color Mode */}
      {bgSettings?.type === 'color' && (
        <div className="absolute inset-0 bg-aether-bg w-full h-full" />
      )}

      {/* 2. Image Background Mode */}
      {bgSettings?.type === 'image' && (bgSettings.imageUrl || localImageUrl) && (
        <div 
          className="absolute inset-0 bg-cover bg-center w-full h-full transition-all duration-700 ease-in-out scale-[1.01]"
          style={{ 
            backgroundImage: `url(${localImageUrl || bgSettings.imageUrl})`,
            filter: `brightness(${brightnessValue})`,
            transition: 'filter 0.3s ease, transform 0.7s ease'
          }}
        />
      )}

      {/* 3. Looping Video Mode */}
      {bgSettings?.type === 'video' && (
        isLocalVideo ? (
          localVideoUrl && (
            <video 
              src={localVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none scale-105"
              style={{ filter: `brightness(${brightnessValue})`, transition: 'filter 0.3s ease' }}
            />
          )
        ) : (
          videoId && (
            <div
              className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-700 ease-in-out scale-[1.12] origin-center"
              style={{ filter: `brightness(${brightnessValue})`, transition: 'filter 0.3s ease' }}
            >
              <div id={videoContainerId} className="w-full h-full pointer-events-none" />
            </div>
          )
        )
      )}

      {/* Invisible Div to Mount Music Iframe */}
      <div className="hidden">
        <div id={musicContainerId} />
      </div>
    </div>
  );
};
