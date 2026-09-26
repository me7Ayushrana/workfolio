import React, { useState } from 'react';
import type { Tile } from '@/lib/digital-workspace/types';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { FileText, Upload, RefreshCw } from 'lucide-react';

interface PDFViewerProps {
  tile: Tile;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ tile }) => {
  const { updateTile } = useWorkspaceStore();
  const [urlInput, setUrlInput] = useState(tile.contentUrl || '');
  const [isLoaded, setIsLoaded] = useState(!!tile.contentUrl);

  const handleLoadUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    updateTile(tile.id, { contentUrl: urlInput, title: urlInput.split('/').pop() || 'PDF Document' });
    setIsLoaded(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Only PDF files are supported.");
      return;
    }

    // Generate local Object URL for the uploaded PDF
    const localUrl = URL.createObjectURL(file);
    updateTile(tile.id, { contentUrl: localUrl, title: file.name });
    setIsLoaded(true);
  };

  const resetViewer = () => {
    updateTile(tile.id, { contentUrl: '' });
    setIsLoaded(false);
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-aether-surface/40">
        <FileText className="w-8 h-8 text-aether-primary mb-3 stroke-1" />
        
        {/* Upload Form */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          <form onSubmit={handleLoadUrl} className="flex flex-col gap-1.5">
            <input
              type="text"
              placeholder="Paste PDF Document Link..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded bg-black/40 border border-aether-border/30 text-aether-text focus:outline-none focus:border-aether-primary placeholder-aether-muted"
            />
            <button
              type="submit"
              className="w-full py-1.5 text-xs font-semibold rounded bg-aether-primary text-black hover:bg-aether-primary-hover transition-colors"
            >
              Load Document
            </button>
          </form>
          
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] bg-aether-border/20 flex-1" />
            <span className="text-[10px] text-aether-muted uppercase font-mono">OR</span>
            <span className="h-[1px] bg-aether-border/20 flex-1" />
          </div>

          <label className="w-full flex flex-col items-center justify-center border border-dashed border-aether-border/40 hover:border-aether-primary/80 rounded-lg p-4 cursor-pointer hover:bg-white/5 transition-colors">
            <Upload className="w-5 h-5 text-aether-muted mb-2" />
            <span className="text-[10px] text-aether-text font-medium text-center">Drag & Drop or Choose Local PDF</span>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-aether-surface">
      {/* PDF Tool bar */}
      <div className="px-3 py-2 bg-black/40 border-b border-aether-border/10 flex items-center justify-between text-xs text-aether-muted">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-aether-primary" />
          <span className="font-semibold text-aether-text truncate max-w-[200px]">{tile.title || 'PDF Document'}</span>
        </div>
        <button
          onClick={resetViewer}
          className="flex items-center gap-1 hover:text-aether-primary transition-colors py-1 px-2 rounded hover:bg-white/5 border border-white/5 text-[10px] uppercase font-bold"
          title="Change Document"
        >
          <RefreshCw className="w-3 h-3" /> Change File
        </button>
      </div>

      {/* Frame Embed — toolbar=0 hides the browser native PDF chrome (hash, zoom, page counter) */}
      <div className="flex-1 min-h-0 relative bg-black/10">
        {tile.contentUrl && (
          <iframe 
            src={`${tile.contentUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="w-full h-full border-none"
            title={tile.title}
            style={{ display: 'block' }}
          />
        )}
      </div>
    </div>
  );
};
