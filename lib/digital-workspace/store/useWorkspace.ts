import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tile, Workspace, TileType, BackgroundSettings } from '@/lib/digital-workspace/types';
import { useThemeStore } from './useTheme';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  zoom: number;
  panOffset: { x: number; y: number };
  
  // Navigation & Workspace CRUD
  setActiveWorkspace: (id: string) => void;
  createWorkspace: (name: string, layoutMode?: 'preset' | 'freeform') => string;
  deleteWorkspace: (id: string) => void;
  updateWorkspaceName: (id: string, name: string) => void;
  saveCurrentWorkspace: () => void;
  
  // Canvas Viewport Adjustments
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  resetCanvas: () => void;
  
  // Layout Controls
  setLayoutMode: (mode: 'preset' | 'freeform') => void;
  setPresetType: (preset: '1x1' | '1x2' | '2x2' | '1+3') => void;
  
  // Tile Operations
  addTile: (type: TileType, contentUrl?: string) => void;
  removeTile: (tileId: string) => void;
  updateTile: (tileId: string, updates: Partial<Tile>) => void;
  updateTileSettings: (tileId: string, settings: Partial<Tile['settings']>) => void;
  updateTilePosition: (tileId: string, x: number, y: number, w: number, h: number) => void;
  
  // Background Customization
  updateBgSettings: (updates: Partial<BackgroundSettings>) => void;
  updateWorkspaceTheme: (themeId: string) => void;

  // URL Share & Import
  exportWorkspaceToHash: () => string;
  importWorkspaceFromHash: (hash: string) => boolean;
}

const defaultBgSettings: BackgroundSettings = {
  type: 'video',
  imageUrl: '',
  videoId: 'AERHuUExvcw',
  videoVolume: 0,
  musicId: '',
  musicVolume: 50,
  musicPlaying: false,
  playArea: 'stage'
};

// Initial default workspace setup
const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'study-workspace',
    name: 'Study Lounge',
    thumbnailUrl: '/study_lounge.png',
    layoutMode: 'preset',
    presetType: '1x2',
    themeId: 'neon-dark',
    bgSettings: defaultBgSettings,
    tiles: [
      {
        id: 'tile-study-1',
        type: 'video',
        title: 'Lo-Fi Chill Beats',
        contentUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
        x: 0,
        y: 0,
        w: 50,
        h: 100,
        settings: { volume: 50, speed: 1, borderStyle: 'glow' }
      },
      {
        id: 'tile-study-2',
        type: 'note',
        title: 'Study Notes',
        contentUrl: '',
        x: 50,
        y: 0,
        w: 50,
        h: 100,
        settings: { noteContent: '# Focus Notes\n- Study session started.\n- Write down core definitions here...' }
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'compare-workspace',
    name: 'A/B Watch Space',
    thumbnailUrl: '/watch_space.png',
    layoutMode: 'preset',
    presetType: '1x2',
    themeId: 'neon-dark',
    bgSettings: defaultBgSettings,
    tiles: [
      {
        id: 'tile-compare-1',
        type: 'video',
        title: 'Video A',
        contentUrl: 'https://www.youtube.com/watch?v=F3z1y3t8kU8',
        x: 0,
        y: 0,
        w: 50,
        h: 100,
        settings: { volume: 40, speed: 1, borderStyle: 'solid' }
      },
      {
        id: 'tile-compare-2',
        type: 'video',
        title: 'Video B',
        contentUrl: 'https://www.youtube.com/watch?v=F3z1y3t8kU8',
        x: 50,
        y: 0,
        w: 50,
        h: 100,
        settings: { volume: 0, speed: 1, muted: true, borderStyle: 'solid' }
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

// Helper to rearrange tiles according to preset grids (0-100 scale)
const applyPresetPositions = (tiles: Tile[], preset: '1x1' | '1x2' | '2x2' | '1+3'): Tile[] => {
  const result = [...tiles];
  if (result.length === 0) return result;

  switch (preset) {
    case '1x1':
      result[0] = { ...result[0], x: 0, y: 0, w: 100, h: 100 };
      for (let i = 1; i < result.length; i++) {
        result[i] = { ...result[i], x: 20 * i, y: 20 * i, w: 30, h: 30 }; // Overflow goes floating
      }
      break;
    case '1x2':
      if (result.length >= 1) result[0] = { ...result[0], x: 0, y: 0, w: 50, h: 100 };
      if (result.length >= 2) result[1] = { ...result[1], x: 50, y: 0, w: 50, h: 100 };
      for (let i = 2; i < result.length; i++) {
        result[i] = { ...result[i], x: 10 + 10 * i, y: 10 + 10 * i, w: 30, h: 30 };
      }
      break;
    case '2x2':
      if (result.length >= 1) result[0] = { ...result[0], x: 0, y: 0, w: 50, h: 50 };
      if (result.length >= 2) result[1] = { ...result[1], x: 50, y: 0, w: 50, h: 50 };
      if (result.length >= 3) result[2] = { ...result[2], x: 0, y: 50, w: 50, h: 50 };
      if (result.length >= 4) result[3] = { ...result[3], x: 50, y: 50, w: 50, h: 50 };
      for (let i = 4; i < result.length; i++) {
        result[i] = { ...result[i], x: 10 + 10 * i, y: 10 + 10 * i, w: 30, h: 30 };
      }
      break;
    case '1+3':
      if (result.length >= 1) result[0] = { ...result[0], x: 0, y: 0, w: 60, h: 100 };
      if (result.length >= 2) result[1] = { ...result[1], x: 60, y: 0, w: 40, h: 33.3 };
      if (result.length >= 3) result[2] = { ...result[2], x: 60, y: 33.3, w: 40, h: 33.3 };
      if (result.length >= 4) result[3] = { ...result[3], x: 60, y: 66.6, w: 40, h: 33.4 };
      for (let i = 4; i < result.length; i++) {
        result[i] = { ...result[i], x: 10 + 10 * i, y: 10 + 10 * i, w: 30, h: 30 };
      }
      break;
  }
  return result;
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: DEFAULT_WORKSPACES,
      activeWorkspaceId: 'study-workspace',
      zoom: 1.0,
      panOffset: { x: 0, y: 0 },

      setActiveWorkspace: (id) => {
        set({ activeWorkspaceId: id, zoom: 1.0, panOffset: { x: 0, y: 0 } });
        const ws = get().workspaces.find((w) => w.id === id);
        if (ws && ws.themeId) {
          try {
            useThemeStore.getState().setActiveTheme(ws.themeId);
          } catch (e) {}
        }
      },

      createWorkspace: (name, layoutMode = 'preset') => {
        const id = `workspace-${Date.now()}`;
        const newWS: Workspace = {
          id,
          name,
          layoutMode,
          presetType: '1x2',
          themeId: 'neon-dark',
          bgSettings: defaultBgSettings,
          tiles: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        set((state) => ({
          workspaces: [...state.workspaces, newWS],
          activeWorkspaceId: id,
          zoom: 1.0,
          panOffset: { x: 0, y: 0 }
        }));
        return id;
      },

      deleteWorkspace: (id) => set((state) => {
        const remaining = state.workspaces.filter((w) => w.id !== id);
        let nextActive = state.activeWorkspaceId;
        if (state.activeWorkspaceId === id) {
          nextActive = remaining[0]?.id || '';
        }
        return {
          workspaces: remaining,
          activeWorkspaceId: nextActive
        };
      }),

      updateWorkspaceName: (id, name) => set((state) => ({
        workspaces: state.workspaces.map((w) => w.id === id ? { ...w, name, updatedAt: Date.now() } : w)
      })),

      saveCurrentWorkspace: () => {}, // Handled by persist reactively, kept for API matching

      setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(1.5, zoom)) }),
      
      setPanOffset: (panOffset) => set({ panOffset }),

      resetCanvas: () => set({ zoom: 1.0, panOffset: { x: 0, y: 0 } }),

      setLayoutMode: (mode) => set((state) => {
        const updated = state.workspaces.map((w) => {
          if (w.id === state.activeWorkspaceId) {
            let nextTiles = w.tiles;
            if (mode === 'preset') {
              nextTiles = applyPresetPositions(w.tiles, w.presetType);
            }
            return {
              ...w,
              layoutMode: mode,
              tiles: nextTiles,
              updatedAt: Date.now()
            };
          }
          return w;
        });
        return { workspaces: updated };
      }),

      setPresetType: (preset) => set((state) => {
        const updated = state.workspaces.map((w) => {
          if (w.id === state.activeWorkspaceId) {
            return {
              ...w,
              presetType: preset,
              tiles: applyPresetPositions(w.tiles, preset),
              updatedAt: Date.now()
            };
          }
          return w;
        });
        return { workspaces: updated };
      }),

      addTile: (type, contentUrl = '') => set((state) => {
        const activeWS = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
        if (!activeWS) return {};

        // Enforce maximum 4 videos limit (Phase performance target)
        if (type === 'video' && activeWS.tiles.filter(t => t.type === 'video').length >= 4) {
          alert("Maximum of 4 video tiles allowed simultaneously for system performance.");
          return {};
        }

        const tileId = `tile-${Date.now()}`;
        let title = `New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        
        if (type === 'video' && contentUrl) {
          title = 'YouTube Video';
        }

        const newTile: Tile = {
          id: tileId,
          type,
          title,
          contentUrl,
          x: 25,
          y: 25,
          w: 40,
          h: 40,
          settings: {
            volume: 50,
            speed: 1,
            loop: false,
            borderStyle: 'solid',
            controlBarPos: 'bottom'
          }
        };

        const nextTiles = [...activeWS.tiles, newTile];
        const resolvedTiles = activeWS.layoutMode === 'preset'
          ? applyPresetPositions(nextTiles, activeWS.presetType)
          : nextTiles;

        return {
          workspaces: state.workspaces.map((w) =>
            w.id === state.activeWorkspaceId ? { ...w, tiles: resolvedTiles, updatedAt: Date.now() } : w
          )
        };
      }),

      removeTile: (tileId) => set((state) => {
        const activeWS = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
        if (!activeWS) return {};

        const nextTiles = activeWS.tiles.filter((t) => t.id !== tileId);
        const resolvedTiles = activeWS.layoutMode === 'preset'
          ? applyPresetPositions(nextTiles, activeWS.presetType)
          : nextTiles;

        return {
          workspaces: state.workspaces.map((w) =>
            w.id === state.activeWorkspaceId ? { ...w, tiles: resolvedTiles, updatedAt: Date.now() } : w
          )
        };
      }),

      updateTile: (tileId, updates) => set((state) => {
        const activeWS = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
        if (!activeWS) return {};

        return {
          workspaces: state.workspaces.map((w) =>
            w.id === state.activeWorkspaceId ? {
              ...w,
              tiles: w.tiles.map((t) => t.id === tileId ? { ...t, ...updates } : t),
              updatedAt: Date.now()
            } : w
          )
        };
      }),

      updateTileSettings: (tileId, settings) => set((state) => {
        const activeWS = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
        if (!activeWS) return {};

        return {
          workspaces: state.workspaces.map((w) =>
            w.id === state.activeWorkspaceId ? {
              ...w,
              tiles: w.tiles.map((t) => t.id === tileId ? {
                ...t,
                settings: { ...t.settings, ...settings }
              } : t),
              updatedAt: Date.now()
            } : w
          )
        };
      }),

      updateTilePosition: (tileId, x, y, newW, newH) => set((state) => {
        const activeWS = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
        if (!activeWS) return {};

        return {
          workspaces: state.workspaces.map((w) =>
            w.id === state.activeWorkspaceId ? {
              ...w,
              tiles: w.tiles.map((t) => t.id === tileId ? { ...t, x, y, w: newW, h: newH } : t),
              updatedAt: Date.now()
            } : w
          )
        };
      }),

      exportWorkspaceToHash: () => {
        const activeWS = get().workspaces.find((w) => w.id === get().activeWorkspaceId);
        if (!activeWS) return '';
        
        try {
          // Serialize workspace structure
          const data = JSON.stringify({
            name: activeWS.name,
            layoutMode: activeWS.layoutMode,
            presetType: activeWS.presetType,
            tiles: activeWS.tiles.map(t => ({
              type: t.type,
              title: t.title,
              contentUrl: t.contentUrl,
              x: t.x,
              y: t.y,
              w: t.w,
              h: t.h,
              settings: {
                volume: t.settings.volume,
                speed: t.settings.speed,
                loop: t.settings.loop,
                borderStyle: t.settings.borderStyle,
                controlBarPos: t.settings.controlBarPos,
                noteContent: t.settings.noteContent
              }
            }))
          });
          
          // Encode to Base64 (web-safe)
          return btoa(unescape(encodeURIComponent(data)));
        } catch (e) {
          console.error("Failed to export workspace hash", e);
          return '';
        }
      },

      importWorkspaceFromHash: (hash) => {
        try {
          // Decode from Base64
          const decodedStr = decodeURIComponent(escape(atob(hash)));
          const payload = JSON.parse(decodedStr);
          
          if (!payload.tiles || !Array.isArray(payload.tiles)) return false;

          const wsId = `import-${Date.now()}`;
          const newWS: Workspace = {
            id: wsId,
            name: `🔗 Shared: ${payload.name || 'Workspace'}`,
            layoutMode: payload.layoutMode || 'freeform',
            presetType: payload.presetType || '1x2',
            themeId: 'neon-dark',
            bgSettings: defaultBgSettings,
            tiles: payload.tiles.map((t: any, index: number) => ({
              id: `import-tile-${index}-${Date.now()}`,
              type: t.type,
              title: t.title || 'Imported Tile',
              contentUrl: t.contentUrl || '',
              x: typeof t.x === 'number' ? t.x : 25,
              y: typeof t.y === 'number' ? t.y : 25,
              w: typeof t.w === 'number' ? t.w : 40,
              h: typeof t.h === 'number' ? t.h : 40,
              settings: t.settings || {}
            })),
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          set((state) => ({
            workspaces: [...state.workspaces, newWS],
            activeWorkspaceId: wsId,
            zoom: 1.0,
            panOffset: { x: 0, y: 0 }
          }));

          return true;
        } catch (e) {
          console.error("Failed to import workspace hash", e);
          return false;
        }
      },

      updateBgSettings: (updates) => set((state) => {
        const nextWorkspaces = state.workspaces.map((ws) => {
          if (ws.id === state.activeWorkspaceId) {
            return {
              ...ws,
              bgSettings: {
                ...ws.bgSettings || defaultBgSettings,
                ...updates
              }
            };
          }
          return ws;
        });
        return { workspaces: nextWorkspaces };
      }),

      updateWorkspaceTheme: (themeId) => set((state) => {
        const nextWorkspaces = state.workspaces.map((ws) => {
          if (ws.id === state.activeWorkspaceId) {
            return {
              ...ws,
              themeId,
              updatedAt: Date.now()
            };
          }
          return ws;
        });
        return { workspaces: nextWorkspaces };
      })
    }),
    {
      name: 'aetherdeck-workspace-storage',
      version: 8,
      migrate: (persistedState: any, fromVersion: number) => {
        // Migration for v6 and below
        if (fromVersion < 7 && persistedState?.workspaces) {
          persistedState.workspaces = persistedState.workspaces.map((ws: any) => {
            const existing = ws.bgSettings || {};
            const hadCustomVideo = existing.videoId && existing.videoId.trim().length > 0 && existing.videoId !== 'AERHuUExvcw';
            return {
              ...ws,
              bgSettings: {
                ...defaultBgSettings,
                ...existing,
                // Always force video mode unless user had explicitly set a custom video
                type: hadCustomVideo ? (existing.type || 'video') : 'video',
                videoId: hadCustomVideo ? existing.videoId : 'AERHuUExvcw',
                // playArea kept for type compat but the area guard is removed
                playArea: 'stage',
              }
            };
          });
        }
        // Migration for v7 and below: ensure all workspaces have bgSettings
        if (fromVersion < 8 && persistedState?.workspaces) {
          persistedState.workspaces = persistedState.workspaces.map((ws: any) => {
            return {
              ...ws,
              bgSettings: {
                ...defaultBgSettings,
                ...(ws.bgSettings || {})
              }
            };
          });
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          setTimeout(() => {
            const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
            if (ws && ws.themeId) {
              try {
                useThemeStore.getState().setActiveTheme(ws.themeId);
              } catch (e) {}
            }
          }, 50);
        }
      }
    }
  )
);
