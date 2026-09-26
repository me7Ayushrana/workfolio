import React, { useState } from 'react';
import type { Tile } from '@/lib/digital-workspace/types';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { getDomainName } from '@/lib/digital-workspace/utils/urlHelper';

interface WebsiteEmbedProps {
  tile: Tile;
}

export const WebsiteEmbed: React.FC<WebsiteEmbedProps> = ({ tile }) => {
  const { updateTile } = useWorkspaceStore();
  const [urlInput, setUrlInput] = useState(tile.contentUrl || '');
  const [isLoaded, setIsLoaded] = useState(!!tile.contentUrl);
  const [iframeKey, setIframeKey] = useState(0);

  const handleLoadUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    
    // Ensure protocol is included
    let targetUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    updateTile(tile.id, { contentUrl: targetUrl, title: getDomainName(targetUrl) });
    setIsLoaded(true);
  };

  const handleReload = () => {
    setIframeKey(prev => prev + 1);
  };

  const resetViewer = () => {
    updateTile(tile.id, { contentUrl: '' });
    setIsLoaded(false);
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-aether-surface/40 text-center">
        <Globe className="w-8 h-8 text-aether-primary mb-3 stroke-1" />
        
        <form onSubmit={handleLoadUrl} className="w-full max-w-xs flex flex-col gap-2">
          <input
            type="text"
            placeholder="Paste URL (e.g. wikipedia.org)..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded bg-black/40 border border-aether-border/30 text-aether-text focus:outline-none focus:border-aether-primary placeholder-aether-muted"
          />
          <button
            type="submit"
            className="w-full py-1.5 text-xs font-semibold rounded bg-aether-primary text-black hover:bg-aether-primary-hover transition-colors"
          >
            Embed Website
          </button>
        </form>

        <div className="mt-4 max-w-[240px] flex gap-1.5 p-2 rounded bg-yellow-500/5 border border-yellow-500/20 text-[10px] text-yellow-500/80 text-left leading-normal">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Note: Many sites (e.g. Google, YouTube, GitHub) disable iframe embedding via X-Frame-Options policies.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-aether-surface select-none relative">
      {/* Control bar */}
      <div className="px-3 py-1.5 bg-black/30 border-b border-aether-border/10 flex items-center justify-between text-[10px] text-aether-muted z-10">
        <span className="truncate max-w-[150px]">{tile.title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            className="flex items-center gap-1 hover:text-aether-primary transition-colors py-0.5 px-1 rounded hover:bg-white/5"
            title="Reload Embed"
          >
            <RefreshCw className="w-3 h-3" /> Reload
          </button>
          <button
            onClick={resetViewer}
            className="flex items-center gap-1 hover:text-aether-primary transition-colors py-0.5 px-1 rounded hover:bg-white/5"
            title="Change URL"
          >
            Replace
          </button>
        </div>
      </div>

      {/* Frame Embed */}
      <div className="flex-1 min-h-0 relative bg-white">
        <iframe
          key={iframeKey}
          src={tile.contentUrl}
          title={tile.title}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
};
