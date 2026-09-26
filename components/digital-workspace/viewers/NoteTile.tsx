import React from 'react';
import type { Tile } from '@/lib/digital-workspace/types';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { WordDeck } from './WordDeck';

interface NoteTileProps {
  tile: Tile;
}

export const NoteTile: React.FC<NoteTileProps> = ({ tile }) => {
  const { updateTileSettings } = useWorkspaceStore();
  
  // If noteContent is plain text (from old workspaces), wrap it in paragraphs,
  // otherwise load the rich HTML structure directly.
  let content = tile.settings.noteContent ?? '';
  if (content && !content.trim().startsWith('<') && !content.trim().startsWith('{')) {
    content = `<div><p>${content.replace(/\n/g, '<br />')}</p></div>`;
  } else if (!content) {
    content = '<div><h2>WordDeck Document</h2><p>Start writing your rich-text document here...</p></div>';
  }

  const handleSave = (html: string) => {
    updateTileSettings(tile.id, { noteContent: html });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-aether-surface">
      <WordDeck 
        initialHtml={content} 
        onSave={handleSave} 
        tileId={tile.id}
      />
    </div>
  );
};

