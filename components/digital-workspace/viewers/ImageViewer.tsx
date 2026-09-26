import React, { useState, useRef } from 'react';
import type { Tile } from '@/lib/digital-workspace/types';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { Image, Upload, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { resolveImageUrl } from '@/lib/digital-workspace/utils/urlHelper';

interface ImageViewerProps {
  tile: Tile;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ tile }) => {
  const { updateTile } = useWorkspaceStore();
  const [urlInput, setUrlInput] = useState(tile.contentUrl || '');
  const [isLoaded, setIsLoaded] = useState(!!tile.contentUrl);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    updateTile(tile.id, { contentUrl: urlInput, title: 'Web Image' });
    setIsLoaded(true);
  };

  const uploadImageDirect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Only Image files are supported.");
      return;
    }
    const localUrl = URL.createObjectURL(file);
    updateTile(tile.id, { contentUrl: localUrl, title: file.name });
    setIsLoaded(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImageDirect(file);
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
          uploadImageDirect(file);
        }
      }
    }
  };

  const resetViewer = () => {
    updateTile(tile.id, { contentUrl: '' });
    setIsLoaded(false);
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-aether-surface/40">
        <Image className="w-8 h-8 text-aether-primary mb-3 stroke-1" />
        
        <div className="w-full max-w-xs flex flex-col gap-3">
          <form onSubmit={handleLoadUrl} className="flex flex-col gap-1.5">
            <input
              type="text"
              placeholder="Paste Image URL (Google Images supported)..."
              value={urlInput}
              onChange={(e) => setUrlInput(resolveImageUrl(e.target.value))}
              onPaste={handlePasteImage}
              className="w-full px-3 py-1.5 text-xs rounded bg-black/40 border border-aether-border/30 text-aether-text focus:outline-none focus:border-aether-primary placeholder-aether-muted"
            />
            <button
              type="submit"
              className="w-full py-1.5 text-xs font-semibold rounded bg-aether-primary text-black hover:bg-aether-primary-hover transition-colors"
            >
              Load Image
            </button>
          </form>
          
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] bg-aether-border/20 flex-1" />
            <span className="text-[10px] text-aether-muted uppercase font-mono">OR</span>
            <span className="h-[1px] bg-aether-border/20 flex-1" />
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                uploadImageDirect(file);
              }
            }}
            className={`w-full flex flex-col items-center justify-center border border-dashed hover:border-aether-primary/80 rounded-lg p-4 cursor-pointer hover:bg-white/5 transition-colors ${
              dragActive ? 'border-aether-primary bg-aether-primary/5' : 'border-aether-border/40'
            }`}
          >
            <Upload className="w-5 h-5 text-aether-muted mb-2" />
            <span className="text-[10px] text-aether-text font-medium text-center">Drag & Drop or Choose Local Image</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-aether-surface select-none relative group/image">
      {/* Control bar */}
      <div className="px-3 py-1.5 bg-black/30 border-b border-aether-border/10 flex items-center justify-between text-[10px] text-aether-muted z-10">
        <span>Image Viewer</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFitMode(fitMode === 'contain' ? 'cover' : 'contain')}
            className="flex items-center gap-1 hover:text-aether-primary transition-colors py-0.5 px-1 rounded hover:bg-white/5"
            title="Toggle Aspect Fit"
          >
            {fitMode === 'contain' ? <ZoomIn className="w-3 h-3" /> : <ZoomOut className="w-3 h-3" />}
            {fitMode === 'contain' ? 'Cover' : 'Fit'}
          </button>
          <button
            onClick={resetViewer}
            className="flex items-center gap-1 hover:text-aether-primary transition-colors py-0.5 px-1 rounded hover:bg-white/5"
            title="Change Image"
          >
            <RefreshCw className="w-3 h-3" /> Replace
          </button>
        </div>
      </div>

      {/* Image Render */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center bg-black/60 overflow-hidden">
        <img
          src={tile.contentUrl}
          alt={tile.title}
          className={`w-full h-full object-${fitMode} transition-all duration-250`}
        />
      </div>
    </div>
  );
};
