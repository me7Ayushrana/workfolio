import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, ThemeColors } from '@/lib/digital-workspace/types';
import { useWorkspaceStore } from './useWorkspace';

// Pre-defined high-quality system themes
export const SYSTEM_THEMES: Theme[] = [
  {
    id: 'clean-light',
    name: 'Pinterest Light (Default)',
    isSystem: true,
    borderRadius: '4px',
    fontFamily: '"Playfair Display", Georgia, serif',
    spacingDensity: 'default',
    bgOpacity: 0.95,
    blurIntensity: '8px',
    shadowIntensity: '0 2px 8px rgba(0,0,0,0.06)',
    fontSize: '13px',
    fontWeight: '400',
    buttonStyle: 'editorial',
    cardStyle: 'bordered',
    animationSpeed: 1.0,
    transitionEffect: 'fade',
    colors: {
      bg: '#fafafa',
      surface: '#ffffff',
      primary: '#bd081c',
      primaryHover: '#e60023',
      text: '#111111',
      muted: '#555555',
      border: '#e0e0e0',
      heading: '#111111',
      link: '#bd081c',
    },
  },
  {
    id: 'neon-dark',
    name: 'Netflix Void',
    isSystem: true,
    borderRadius: '4px',
    fontFamily: '"Playfair Display", Georgia, serif',
    spacingDensity: 'default',
    bgOpacity: 0.90,
    blurIntensity: '12px',
    shadowIntensity: '0 4px 16px rgba(0,0,0,0.4)',
    fontSize: '13px',
    fontWeight: '400',
    buttonStyle: 'editorial',
    cardStyle: 'bordered',
    animationSpeed: 1.0,
    transitionEffect: 'fade',
    colors: {
      bg: '#0a0a0a',
      surface: '#141414',
      primary: '#e50914',
      primaryHover: '#ff2e3b',
      text: '#ffffff',
      muted: '#b3b3b3',
      border: '#2a2a2a',
      heading: '#ffffff',
      link: '#e50914',
    },
  },
  {
    id: 'amoled-dark',
    name: 'AMOLED Black',
    isSystem: true,
    borderRadius: '2px',
    fontFamily: 'system-ui, sans-serif',
    spacingDensity: 'compact',
    bgOpacity: 1.0,
    blurIntensity: '0px',
    shadowIntensity: 'none',
    fontSize: '12px',
    fontWeight: '400',
    buttonStyle: 'sharp',
    cardStyle: 'flat',
    animationSpeed: 0.5,
    transitionEffect: 'none',
    colors: {
      bg: '#000000',
      surface: '#000000',
      primary: '#ffffff',
      primaryHover: '#cccccc',
      text: '#e5e5e5',
      muted: '#666666',
      border: '#222222',
      heading: '#ffffff',
      link: '#ffffff',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Redux',
    isSystem: true,
    borderRadius: '4px',
    fontFamily: 'JetBrains Mono',
    spacingDensity: 'compact',
    bgOpacity: 0.85,
    blurIntensity: '10px',
    shadowIntensity: '0 0 10px rgba(57,255,20,0.3)',
    fontSize: '12px',
    fontWeight: '400',
    buttonStyle: 'sharp',
    cardStyle: 'bordered',
    animationSpeed: 0.8,
    transitionEffect: 'zoom',
    colors: {
      bg: '#0c051a',
      surface: '#180a30',
      primary: '#ff007f',
      primaryHover: '#ff55a3',
      text: '#39ff14',
      muted: '#8e7cc3',
      border: '#39ff14',
      heading: '#ff007f',
      link: '#39ff14',
    },
  },
  {
    id: 'rose-gold',
    name: 'Midnight Rose',
    isSystem: true,
    borderRadius: '4px',
    fontFamily: '"Playfair Display", Georgia, serif',
    spacingDensity: 'relaxed',
    bgOpacity: 0.90,
    blurIntensity: '16px',
    shadowIntensity: '0 8px 24px rgba(183,110,121,0.15)',
    fontSize: '14px',
    fontWeight: '400',
    buttonStyle: 'pill',
    cardStyle: 'glass',
    animationSpeed: 1.2,
    transitionEffect: 'slide',
    colors: {
      bg: '#120f12',
      surface: '#201a20',
      primary: '#b76e79',
      primaryHover: '#c98a93',
      text: '#f3e9ea',
      muted: '#9c8387',
      border: '#3c303c',
      heading: '#f3e9ea',
      link: '#b76e79',
    },
  },
  {
    id: 'emerald',
    name: 'Forest Emerald',
    isSystem: true,
    borderRadius: '4px',
    fontFamily: '"Playfair Display", Georgia, serif',
    spacingDensity: 'default',
    bgOpacity: 0.92,
    blurIntensity: '8px',
    shadowIntensity: '0 4px 12px rgba(10,16,13,0.3)',
    fontSize: '13px',
    fontWeight: '400',
    buttonStyle: 'editorial',
    cardStyle: 'bordered',
    animationSpeed: 1.0,
    transitionEffect: 'fade',
    colors: {
      bg: '#0a100d',
      surface: '#13221c',
      primary: '#2ec4b6',
      primaryHover: '#20a396',
      text: '#e1eade',
      muted: '#7fa392',
      border: '#20392e',
      heading: '#e1eade',
      link: '#2ec4b6',
    },
  },
];

interface ThemeState {
  themes: Theme[];
  activeThemeId: string;
  customCSS: string;
  addTheme: (theme: Theme) => void;
  removeTheme: (id: string) => void;
  setActiveTheme: (id: string) => void;
  updateThemeColors: (id: string, colors: Partial<ThemeColors>) => void;
  updateThemeProps: (id: string, props: Partial<Omit<Theme, 'id' | 'colors'>>) => void;
  setCustomCSS: (css: string) => void;
  resetToDefault: () => void;
}

// Apply themes to document element styles
export const applyThemeToDOM = (theme: Theme, customCSS: string) => {
  const root = document.documentElement;
  
  // Set standard theme color variables
  root.style.setProperty('--aether-bg', theme.colors.bg);
  root.style.setProperty('--aether-surface', theme.colors.surface);
  root.style.setProperty('--aether-primary', theme.colors.primary);
  root.style.setProperty('--aether-primary-hover', theme.colors.primaryHover);
  root.style.setProperty('--aether-text', theme.colors.text);
  root.style.setProperty('--aether-muted', theme.colors.muted);
  root.style.setProperty('--aether-border', theme.colors.border);
  root.style.setProperty('--aether-heading', theme.colors.heading || theme.colors.text);
  root.style.setProperty('--aether-link', theme.colors.link || theme.colors.primary);
  root.style.setProperty('--aether-radius', theme.borderRadius);
  
  // Advanced customization parameters mapping
  root.style.setProperty('--aether-bg-opacity', String(theme.bgOpacity ?? 0.9));
  root.style.setProperty('--aether-blur', theme.blurIntensity ?? '12px');
  root.style.setProperty('--aether-shadow', theme.shadowIntensity ?? '0 4px 12px rgba(0,0,0,0.1)');
  root.style.setProperty('--aether-font-size', theme.fontSize ?? '13px');
  root.style.setProperty('--aether-font-weight', theme.fontWeight ?? '400');
  root.style.setProperty('--aether-animation-speed', `${theme.animationSpeed ?? 1.0}s`);

  root.style.setProperty('--aether-font-headings', theme.fontFamily);
  root.style.setProperty('--aether-font-body', theme.fontFamily === 'JetBrains Mono' ? 'var(--font-mono)' : '"Inter", -apple-system, sans-serif');

  // Set card and button style tags directly in data attributes
  root.dataset.buttonStyle = theme.buttonStyle ?? 'editorial';
  root.dataset.cardStyle = theme.cardStyle ?? 'bordered';
  root.dataset.transitionEffect = theme.transitionEffect ?? 'fade';

  // Manage light class for conditional variants
  if (theme.id === 'clean-light' || (theme.colors.bg === '#ffffff' || theme.colors.bg === '#fafafa')) {
    root.classList.add('light');
  } else {
    root.classList.remove('light');
  }

  // Inject or update custom CSS stylesheet in head
  let styleElement = document.getElementById('aetherdeck-custom-styles') as HTMLStyleElement;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'aetherdeck-custom-styles';
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = customCSS || '';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themes: SYSTEM_THEMES,
      activeThemeId: 'clean-light',
      customCSS: '',

      addTheme: (theme) => set((state) => {
        const nextThemes = [...state.themes, theme];
        return { themes: nextThemes };
      }),

      removeTheme: (id) => set((state) => {
        // Prevent deleting system themes
        const themeToDelete = state.themes.find(t => t.id === id);
        if (themeToDelete?.isSystem) return state;

        const nextThemes = state.themes.filter((t) => t.id !== id);
        const nextActiveId = state.activeThemeId === id ? 'clean-light' : state.activeThemeId;
        
        return { 
          themes: nextThemes,
          activeThemeId: nextActiveId
        };
      }),

      setActiveTheme: (id) => set((state) => {
        // Self-healing: lookup in state.themes first, then default SYSTEM_THEMES if corrupted or missing
        const selectedTheme = state.themes.find((t) => t.id === id) || SYSTEM_THEMES.find((t) => t.id === id) || SYSTEM_THEMES[0];
        
        // Restore preset to local state themes if it was deleted or missing
        const themesUpdated = state.themes.some((t) => t.id === selectedTheme.id)
          ? state.themes
          : [...state.themes, selectedTheme];

        applyThemeToDOM(selectedTheme, state.customCSS);

        try {
          useWorkspaceStore.getState().updateWorkspaceTheme(selectedTheme.id);
        } catch (e) {}

        return { themes: themesUpdated, activeThemeId: selectedTheme.id };
      }),

      updateThemeColors: (id, newColors) => set((state) => {
        const original = state.themes.find(t => t.id === id);
        if (!original) return state;

        if (original.isSystem) {
          // Clone the system theme and append it, keeping the original intact in selection
          const newId = `${original.id}-custom-${Date.now()}`;
          const customTheme = {
            ...original,
            id: newId,
            isSystem: false,
            name: `${original.name} (Custom)`,
            colors: {
              ...original.colors,
              ...newColors
            }
          };

          if (state.activeThemeId === id) {
            setTimeout(() => {
              applyThemeToDOM(customTheme, state.customCSS);
              try {
                useWorkspaceStore.getState().updateWorkspaceTheme(newId);
              } catch (e) {}
            }, 0);
          }

          return {
            themes: [...state.themes, customTheme],
            activeThemeId: state.activeThemeId === id ? newId : state.activeThemeId
          };
        } else {
          // Modify custom theme in place
          const nextThemes = state.themes.map((theme) => {
            if (theme.id === id) {
              const updated = {
                ...theme,
                colors: {
                  ...theme.colors,
                  ...newColors
                }
              };
              if (state.activeThemeId === id) {
                setTimeout(() => applyThemeToDOM(updated, state.customCSS), 0);
              }
              return updated;
            }
            return theme;
          });
          return { themes: nextThemes };
        }
      }),

      updateThemeProps: (id, newProps) => set((state) => {
        const original = state.themes.find(t => t.id === id);
        if (!original) return state;

        if (original.isSystem) {
          // Clone the system theme and append it, keeping the original intact in selection
          const newId = `${original.id}-custom-${Date.now()}`;
          const customTheme = {
            ...original,
            id: newId,
            isSystem: false,
            name: `${original.name} (Custom)`,
            ...newProps
          };

          if (state.activeThemeId === id) {
            setTimeout(() => {
              applyThemeToDOM(customTheme, state.customCSS);
              try {
                useWorkspaceStore.getState().updateWorkspaceTheme(newId);
              } catch (e) {}
            }, 0);
          }

          return {
            themes: [...state.themes, customTheme],
            activeThemeId: state.activeThemeId === id ? newId : state.activeThemeId
          };
        } else {
          // Modify custom theme in place
          const nextThemes = state.themes.map((theme) => {
            if (theme.id === id) {
              const updated = {
                ...theme,
                ...newProps
              };
              if (state.activeThemeId === id) {
                setTimeout(() => applyThemeToDOM(updated, state.customCSS), 0);
              }
              return updated;
            }
            return theme;
          });
          return { themes: nextThemes };
        }
      }),

      setCustomCSS: (css) => set((state) => {
        const activeTheme = state.themes.find((t) => t.id === state.activeThemeId) || SYSTEM_THEMES[0];
        applyThemeToDOM(activeTheme, css);
        return { customCSS: css };
      }),

      resetToDefault: () => set(() => {
        const defaultTheme = SYSTEM_THEMES[0];
        applyThemeToDOM(defaultTheme, '');
        return {
          themes: SYSTEM_THEMES,
          activeThemeId: defaultTheme.id,
          customCSS: ''
        };
      })
    }),
    {
      name: 'aetherdeck-theme-storage',
      version: 2,
      onRehydrateStorage: () => (state) => {
        // Apply theme immediately after localStorage rehydrates
        if (state) {
          const activeTheme = state.themes.find((t) => t.id === state.activeThemeId) || SYSTEM_THEMES[0];
          applyThemeToDOM(activeTheme, state.customCSS);
        }
      }
    }
  )
);
