import React, { useState, useRef } from 'react';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { 
  Music, Volume2, Play, Pause, Image as ImageIcon, Video, Sliders, Settings, X, Check, Upload, Sun
} from 'lucide-react';
import { saveFileBlob } from '@/lib/digital-workspace/utils/db';
import { resolveImageUrl } from '@/lib/digital-workspace/utils/urlHelper';

export const AtmosphereController: React.FC = () => {
  const { workspaces, activeWorkspaceId, updateBgSettings } = useWorkspaceStore();
  const activeWS = workspaces.find((w) => w.id === activeWorkspaceId);
  
  if (!activeWS) return null;

  const bgSettings = activeWS.bgSettings || {
    type: 'color',
    imageUrl: '',
    videoId: '',
    videoVolume: 0,
    musicId: '',
    musicVolume: 50,
    musicPlaying: false
  };

  const [isOpen, setIsOpen] = useState(false);
  const [imgInput, setImgInput] = useState(bgSettings.imageUrl || '');
  const [videoInput, setVideoInput] = useState(bgSettings.videoId || '');
  const [musicInput, setMusicInput] = useState(bgSettings.musicId || '');

  const [dragActiveImage, setDragActiveImage] = useState(false);
  const [dragActiveVideo, setDragActiveVideo] = useState(false);

  const imageFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

  const uploadImageDirect = async (file: File) => {
    const storageKey = `bg-image-${activeWorkspaceId}`;
    await saveFileBlob(storageKey, file);
    const localUrl = `local-file:${storageKey}`;
    setImgInput(localUrl);
    updateBgSettings({ imageUrl: localUrl });
  };

  const uploadVideoDirect = async (file: File) => {
    const storageKey = `bg-video-${activeWorkspaceId}`;
    await saveFileBlob(storageKey, file);
    const localUrl = `local-file:${storageKey}`;
    setVideoInput(localUrl);
    updateBgSettings({ videoId: localUrl });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadImageDirect(file);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadVideoDirect(file);
  };

  const handlePasteImage = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          await uploadImageDirect(file);
        }
      }
    }
  };

  const handlePasteVideo = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('video') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          await uploadVideoDirect(file);
        }
      }
    }
  };

  const handleSaveSettings = () => {
    updateBgSettings({
      imageUrl: imgInput.trim(),
      videoId: videoInput.trim(),
      musicId: musicInput.trim()
    });
  };

  const toggleMusicPlay = () => {
    updateBgSettings({ musicPlaying: !bgSettings.musicPlaying });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBgSettings({ musicVolume: parseInt(e.target.value) });
  };

  const handleTypeChange = (type: 'color' | 'image' | 'video') => {
    updateBgSettings({ type });
  };

  return (
    <div className="absolute bottom-6 right-6 z-40 font-sans">
      {/* Floating Compact Bar / Toggle */}
      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-aether-border/20 rounded-full p-1.5 shadow-2xl hover:border-aether-primary/40 transition-all select-none">
        
        {/* Play/Pause background track shortcut button */}
        {bgSettings.musicId && (
          <button
            onClick={toggleMusicPlay}
            className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
              bgSettings.musicPlaying 
                ? 'bg-aether-primary text-black animate-pulse shadow-md shadow-aether-primary/20' 
                : 'bg-white/5 text-aether-text hover:bg-white/10'
            }`}
            title={bgSettings.musicPlaying ? "Pause Ambient Audio" : "Play Ambient Audio"}
          >
            {bgSettings.musicPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
        )}

        {/* Visual Waveform Bounce when audio active */}
        {bgSettings.musicPlaying && bgSettings.musicId && (
          <div className="flex items-end gap-0.5 h-4 px-1 w-6">
            {[1, 2, 3].map((bar) => (
              <div
                key={bar}
                style={{
                  animation: `soundwave ${0.4 + bar * 0.15}s ease-in-out infinite alternate`
                }}
                className="w-[3px] bg-aether-primary rounded-t-full"
              />
            ))}
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-1.5 text-[10px] font-semibold tracking-wider rounded-full flex items-center gap-1.5 transition-all uppercase ${
            isOpen ? 'bg-aether-primary text-black' : 'text-aether-text hover:bg-white/5'
          }`}
        >
          {isOpen ? <X className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
          <span>Atmosphere</span>
        </button>
      </div>

      {/* Expanded Control Box Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-black/85 backdrop-blur-lg border border-aether-border/30 rounded-xl p-5 shadow-2xl animate-fade-in flex flex-col gap-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] font-bold text-aether-primary tracking-widest uppercase">
              Atmosphere & Background Mood
            </span>
            <button onClick={() => setIsOpen(false)} className="text-aether-muted hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Background Mode Toggles */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-aether-muted uppercase tracking-wider">
              Background Type
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { type: 'color' as const, label: 'Color', icon: Sliders },
                { type: 'image' as const, label: 'Image', icon: ImageIcon },
                { type: 'video' as const, label: 'Video', icon: Video }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = bgSettings.type === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleTypeChange(item.type)}
                    className={`py-1.5 px-2 rounded-lg flex flex-col items-center gap-1 text-[10px] uppercase font-bold transition-all border ${
                      isSelected
                        ? 'bg-aether-primary/10 border-aether-primary text-aether-primary'
                        : 'bg-white/5 border-transparent hover:bg-white/10 text-aether-muted hover:text-aether-text'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Inputs */}
          {bgSettings.type === 'image' && (
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActiveImage(true); }}
              onDragLeave={() => setDragActiveImage(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragActiveImage(false);
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith('image/')) {
                  await uploadImageDirect(file);
                }
              }}
              className={`flex flex-col gap-1.5 p-2 rounded border transition-all ${
                dragActiveImage ? 'border-dashed border-aether-primary bg-aether-primary/5' : 'border-transparent'
              }`}
            >
              <span className="text-[9px] font-bold text-aether-muted uppercase">Background Image</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste direct link (Google Images supported) or drop file here..."
                  value={imgInput.startsWith('local-file:') ? 'Uploaded Local Storage File' : imgInput}
                  onChange={(e) => setImgInput(resolveImageUrl(e.target.value))}
                  onPaste={handlePasteImage}
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-aether-primary placeholder-aether-muted/50"
                />
                <button
                  onClick={() => imageFileRef.current?.click()}
                  className="px-3 py-1 bg-white/10 hover:bg-white/15 rounded text-[10px] font-bold flex items-center gap-1 border border-white/5 transition-colors"
                >
                  <Upload className="w-3 h-3" /> Upload
                </button>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {bgSettings.type === 'video' && (
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActiveVideo(true); }}
              onDragLeave={() => setDragActiveVideo(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragActiveVideo(false);
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith('video/')) {
                  await uploadVideoDirect(file);
                }
              }}
              className={`flex flex-col gap-1.5 p-2 rounded border transition-all ${
                dragActiveVideo ? 'border-dashed border-aether-primary bg-aether-primary/5' : 'border-transparent'
              }`}
            >
              <span className="text-[9px] font-bold text-aether-muted uppercase">Background Video</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste YouTube link or drop local video file..."
                  value={videoInput.startsWith('local-file:') ? 'Uploaded Local Storage File' : videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  onPaste={handlePasteVideo}
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-aether-primary placeholder-aether-muted/50"
                />
                <button
                  onClick={() => videoFileRef.current?.click()}
                  className="px-3 py-1 bg-white/10 hover:bg-white/15 rounded text-[10px] font-bold flex items-center gap-1 border border-white/5 transition-colors"
                >
                  <Upload className="w-3 h-3" /> Upload
                </button>
                <input
                  ref={videoFileRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Ambient Music Inputs */}
          <div className="flex flex-col gap-2.5 border-t border-white/10 pt-3">
            <span className="text-[9px] font-bold text-aether-primary uppercase tracking-wider flex items-center gap-1">
              <Music className="w-3.5 h-3.5" /> Ambient YouTube Audio
            </span>
            
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-aether-muted uppercase">Music URL / ID</span>
              <input
                type="text"
                placeholder="Paste YouTube Lofi/Music URL..."
                value={musicInput}
                onChange={(e) => setMusicInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-aether-primary"
              />
            </div>

            {bgSettings.musicId && (
              <div className="flex items-center justify-between gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                <button
                  onClick={toggleMusicPlay}
                  className="px-3 py-1 bg-aether-primary text-black font-semibold rounded hover:brightness-110 active:scale-95 transition-all text-[10px] uppercase"
                >
                  {bgSettings.musicPlaying ? 'Pause Audio' : 'Play Audio'}
                </button>
                <div className="flex-1 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-aether-muted" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bgSettings.musicVolume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-white/10 accent-aether-primary cursor-pointer rounded-lg appearance-none"
                  />
                  <span className="font-mono text-[9px] text-aether-muted w-6 text-right">
                    {bgSettings.musicVolume}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Background Brightness (image & video only) */}
          {(bgSettings.type === 'image' || bgSettings.type === 'video') && (
            <div className="flex flex-col gap-1.5 border-t border-white/10 pt-3">
              <span className="text-[9px] font-bold text-aether-muted uppercase tracking-wider flex items-center gap-1">
                <Sun className="w-3.5 h-3.5" /> Background Brightness
              </span>
              <div className="flex items-center gap-2">
                <Sun className="w-3 h-3 text-aether-muted opacity-40" />
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={bgSettings.bgBrightness ?? 40}
                  onChange={(e) => updateBgSettings({ bgBrightness: parseInt(e.target.value) })}
                  className="flex-1 h-1 bg-white/10 accent-aether-primary cursor-pointer rounded-lg appearance-none"
                />
                <Sun className="w-3.5 h-3.5 text-yellow-300 opacity-70" />
                <span className="font-mono text-[9px] text-aether-muted w-7 text-right">
                  {bgSettings.bgBrightness ?? 40}%
                </span>
              </div>
              <p className="text-[9px] text-aether-muted/60 leading-tight">
                Dim the background so content tiles stand out clearly.
              </p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            className="w-full py-2 bg-aether-primary text-black font-bold uppercase rounded-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-1"
          >
            <Check className="w-4 h-4" /> Save Atmosphere Settings
          </button>
        </div>
      )}
    </div>
  );
};
