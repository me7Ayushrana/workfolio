import React, { useState } from 'react';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import type { TileType } from '@/lib/digital-workspace/types';
import { 
  Folder, Plus, Trash2, Film, FileText, Globe, 
  Image, Music, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { 
    workspaces, 
    activeWorkspaceId, 
    setActiveWorkspace, 
    createWorkspace, 
    deleteWorkspace,
    addTile
  } = useWorkspaceStore();

  const [newWSName, setNewWSName] = useState('');

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWSName.trim()) return;
    createWorkspace(newWSName.trim());
    setNewWSName('');
  };

  const contentTypes: { type: TileType; label: string; icon: any; desc: string }[] = [
    { type: 'video', label: 'YouTube Video', icon: Film, desc: 'Paste a video URL' },
    { type: 'pdf', label: 'PDF Document', icon: FileText, desc: 'Local file or URL' },
    { type: 'note', label: 'Markdown Notes', icon: FileText, desc: 'Clean markdown editor' },
    { type: 'image', label: 'Image Canvas', icon: Image, desc: 'Web image or upload' },
    { type: 'website', label: 'Website Embed', icon: Globe, desc: 'Wrap links in iframe' },
    { type: 'local_video', label: 'Local Video', icon: Film, desc: 'Play MP4/WebM files' },
    { type: 'local_audio', label: 'Local Audio', icon: Music, desc: 'Visualized sound wave' },
    { type: 'file', label: 'Interactive File', icon: FileText, desc: 'PDF, CSV, Code, Markdown...' },
  ];

  return (
    <div 
      className={`h-full flex flex-col glass-panel border-r border-aether-border/20 transition-all duration-300 relative select-none ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Collapse/Expand Toggle Handle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-aether-surface border border-aether-border/30 flex items-center justify-center text-aether-text hover:text-aether-primary shadow-md hover:scale-105 transition-all z-50 cursor-pointer"
      >
        {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {/* Sidebar Header */}
      <div className={`p-4 border-b border-aether-border/10 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen ? (
          <>
            <span className="text-xs font-bold text-aether-primary tracking-widest uppercase">Workspaces</span>
            <span className="text-[10px] text-aether-muted font-mono">{workspaces.length} active</span>
          </>
        ) : (
          <Folder className="w-5 h-5 text-aether-primary" />
        )}
      </div>

      {/* Workspaces List Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1.5 scrollbar-thin">
        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspaceId;
          return (
            <div
              key={ws.id}
              onClick={() => setActiveWorkspace(ws.id)}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                isActive 
                  ? 'bg-aether-primary/15 border border-aether-primary/30 text-aether-primary' 
                  : 'hover:bg-white/5 border border-transparent text-aether-text/80'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Folder className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-aether-primary' : 'text-aether-muted'}`} />
                {isOpen && <span className="text-xs truncate font-medium">{ws.name}</span>}
              </div>

              {isOpen && workspaces.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this workspace layout?")) {
                      deleteWorkspace(ws.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-aether-muted hover:text-red-400 transition-all"
                  title="Delete Workspace"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Create Workspace Panel Form */}
        {isOpen && (
          <form onSubmit={handleCreateWorkspace} className="mt-4 pt-4 border-t border-aether-border/10">
            <div className="relative">
              <input
                type="text"
                required
                maxLength={30}
                placeholder="New Workspace Name..."
                value={newWSName}
                onChange={(e) => setNewWSName(e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 text-xs rounded bg-black/40 border border-aether-border/30 text-aether-text placeholder-aether-muted focus:outline-none focus:border-aether-primary"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 p-1 hover:bg-white/10 text-aether-primary rounded"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bottom Area: Add Tiles Catalogs */}
      <div className="p-3 border-t border-aether-border/10 flex flex-col gap-2 bg-black/15">
        {isOpen ? (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-aether-muted tracking-wider uppercase px-1">
              Add Content
            </span>
            <div className="grid grid-cols-1 gap-1">
              {contentTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => addTile(item.type)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs text-aether-text hover:bg-white/5 border border-transparent hover:border-aether-border/20 transition-all"
                  >
                    <Icon className="w-4 h-4 text-aether-primary flex-shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold truncate">{item.label}</div>
                      <div className="text-[9px] text-aether-muted truncate leading-none mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {contentTypes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => addTile(item.type)}
                  className="p-2 rounded-lg hover:bg-white/5 text-aether-muted hover:text-aether-primary transition-all"
                  title={`Add ${item.label}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
