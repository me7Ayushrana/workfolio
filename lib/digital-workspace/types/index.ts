export type TileType = 'video' | 'pdf' | 'note' | 'image' | 'website' | 'local_video' | 'local_audio' | 'file';

export interface Tile {
  id: string;
  type: TileType;
  title: string;
  contentUrl: string;
  x: number; // percentage width (0-100) or absolute px for canvas
  y: number; // percentage height (0-100) or absolute px for canvas
  w: number; // width relative percentage (0-100)
  h: number; // height relative percentage (0-100)
  isMinimized?: boolean; // PiP mode flag
  settings: {
    volume?: number;
    muted?: boolean;
    speed?: number;
    loop?: boolean;
    quality?: string;
    noteContent?: string;
    themeColor?: string; // Per-tile background / border color
    borderStyle?: 'none' | 'solid' | 'dashed' | 'glow';
    controlBarPos?: 'bottom' | 'top' | 'hidden' | 'floating';
    audioOnly?: boolean;
    currentTime?: number;
    files?: Array<{ id: string; name: string; size: number; type: string; uploadDate: string }>;
    activeFileId?: string;
  };
}

export interface BackgroundSettings {
  type: 'color' | 'image' | 'video';
  imageUrl: string;
  videoId: string;
  videoVolume: number;
  musicId: string;
  musicVolume: number;
  musicPlaying: boolean;
  playArea?: 'screen' | 'stage';
  bgBrightness?: number; // 0–100, default 50 (maps to css brightness 0.2–1.0)
}

export interface Workspace {
  id: string;
  name: string;
  thumbnailUrl?: string;
  layoutMode: 'preset' | 'freeform';
  presetType: '1x1' | '1x2' | '2x2' | '1+3';
  tiles: Tile[];
  themeId: string;
  bgSettings?: BackgroundSettings;
  createdAt: number;
  updatedAt: number;
}

export interface ThemeColors {
  bg: string;
  surface: string;
  primary: string;
  primaryHover: string;
  text: string;
  muted: string;
  border: string;
  heading?: string;
  link?: string;
}

export interface Theme {
  id: string;
  name: string;
  isSystem: boolean;
  colors: ThemeColors;
  borderRadius: string; // e.g. '4px'
  fontFamily: string; // e.g. 'Outfit'
  spacingDensity: 'compact' | 'default' | 'relaxed';
  bgOpacity?: number; // 0 to 1
  blurIntensity?: string; // e.g. '12px'
  shadowIntensity?: string; // e.g. '0 4px 12px'
  fontSize?: string; // e.g. '14px'
  fontWeight?: string; // e.g. '400'
  buttonStyle?: 'sharp' | 'pill' | 'editorial';
  cardStyle?: 'flat' | 'bordered' | 'glass';
  animationSpeed?: number;
  transitionEffect?: 'fade' | 'slide' | 'zoom' | 'none';
  customCSS?: string;
}

export interface Bookmark {
  id: string;
  videoId: string;
  videoTitle: string;
  timestamp: number; // seconds
  note: string;
  createdAt: number;
}

export interface PomodoroState {
  isActive: boolean;
  type: 'focus' | 'shortBreak' | 'longBreak';
  duration: number; // seconds remaining
  totalDuration: number; // seconds configured
}

export interface WatchHistory {
  id: string;
  title: string;
  url: string;
  watchedAt: number;
  duration: number;
}

export interface WatchStats {
  totalTime: number; // seconds
  videoCount: number;
  categories: Record<string, number>;
  peakHours: Record<number, number>; // hour (0-23) -> counts
  streak: number;
  lastWatchedDate: string; // YYYY-MM-DD
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  themePreference: 'light' | 'dark' | 'custom';
}
