import React, { useState, useRef } from 'react';
import { useThemeStore } from '@/lib/digital-workspace/store/useTheme';
import type { ThemeColors } from '@/lib/digital-workspace/types';
import { 
  Sparkles, Download, Upload, Trash2, Check,
  Sliders, Palette, Type, X
} from 'lucide-react';

interface TheForgeProps {
  onClose: () => void;
}

export const TheForge: React.FC<TheForgeProps> = ({ onClose }) => {
  const { 
    themes, 
    activeThemeId, 
    customCSS, 
    setActiveTheme, 
    updateThemeColors, 
    updateThemeProps, 
    addTheme, 
    removeTheme, 
    setCustomCSS 
  } = useThemeStore();

  const activeTheme = themes.find((t) => t.id === activeThemeId) || themes[0];
  const [newThemeName, setNewThemeName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = activeTheme.colors;

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    updateThemeColors(activeTheme.id, { [key]: value });
  };

  const handlePropChange = (key: 'borderRadius' | 'fontFamily' | 'spacingDensity', value: string) => {
    updateThemeProps(activeTheme.id, { [key]: value });
  };

  // Create a custom clone theme based on active configurations
  const handleCloneTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThemeName.trim()) return;

    const id = `custom-theme-${Date.now()}`;
    const cloned = {
      ...activeTheme,
      id,
      name: newThemeName.trim(),
      isSystem: false,
    };

    addTheme(cloned);
    setActiveTheme(id);
    setNewThemeName('');
  };

  // Export current theme structure to JSON file
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      theme: activeTheme,
      customCSS
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import theme from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = JSON.parse(event.target?.result as string);
        if (payload.theme && payload.theme.name) {
          const id = `imported-theme-${Date.now()}`;
          const newTheme = {
            ...payload.theme,
            id,
            isSystem: false
          };
          addTheme(newTheme);
          setActiveTheme(id);
          if (payload.customCSS !== undefined) {
            setCustomCSS(payload.customCSS);
          }
          alert("Theme imported successfully!");
        } else {
          alert("Invalid theme JSON file schema.");
        }
      } catch (err) {
        alert("Failed to parse JSON theme file.");
      }
    };
    reader.readAsText(file);
  };

  const fonts = [
    { value: 'Outfit', label: 'Outfit (Sleek Geometric)' },
    { value: 'Inter', label: 'Inter (Neutral Clean)' },
    { value: 'JetBrains Mono', label: 'JetBrains Mono (Console Coding)' },
    { value: 'system-ui', label: 'System Sans' },
  ];

  return (
    <div className="w-80 h-full flex flex-col glass-panel border-l border-aether-border/20 select-none z-50">
      
      {/* Header */}
      <div className="p-4 border-b border-aether-border/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-aether-primary" />
          <span className="text-xs font-bold text-aether-primary tracking-widest uppercase">The Forge</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-aether-muted hover:text-aether-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        
        {/* Preset Selectors */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-bold text-aether-muted tracking-wider uppercase flex items-center gap-1">
            <Palette className="w-3 h-3" /> Select Palette Preset
          </span>
          <div className="grid grid-cols-1 gap-1">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTheme(t.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                  t.id === activeThemeId
                    ? 'bg-aether-primary/10 border border-aether-primary/30 text-aether-primary'
                    : 'bg-black/15 border border-transparent hover:bg-white/5 text-aether-text/80'
                }`}
              >
                <span>{t.name}</span>
                {t.id === activeThemeId && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Color Wheels Customizations */}
        <div className="space-y-2.5 pt-4 border-t border-aether-border/10">
          <span className="text-[9px] font-bold text-aether-muted tracking-wider uppercase flex items-center gap-1">
            <Sliders className="w-3 h-3" /> Color Palette Wheels
          </span>
          
          <div className="space-y-2">
            {[
              { key: 'bg' as keyof ThemeColors, label: 'Canvas Background' },
              { key: 'surface' as keyof ThemeColors, label: 'Tile Card Surface' },
              { key: 'primary' as keyof ThemeColors, label: 'Accent / Highlight' },
              { key: 'primaryHover' as keyof ThemeColors, label: 'Accent Hover' },
              { key: 'text' as keyof ThemeColors, label: 'Standard Body Text' },
              { key: 'muted' as keyof ThemeColors, label: 'Muted / Metadata' },
              { key: 'border' as keyof ThemeColors, label: 'Card Borders' },
              { key: 'heading' as keyof ThemeColors, label: 'Headlines Color' },
              { key: 'link' as keyof ThemeColors, label: 'Hyperlinks' },
            ].map((colorItem) => (
              <div key={colorItem.key} className="flex items-center justify-between text-xs">
                <span className="text-aether-text/80">{colorItem.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-aether-muted uppercase select-all">
                    {colors[colorItem.key] || '#000000'}
                  </span>
                  <input
                    type="color"
                    value={colors[colorItem.key] || '#000000'}
                    onChange={(e) => handleColorChange(colorItem.key, e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border border-aether-border/30 bg-transparent outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-aether-muted italic leading-normal">
            * Modifying settings will automatically clone system presets to a custom palette.
          </p>
        </div>

        {/* Complete Customization Props */}
        <div className="space-y-3.5 pt-4 border-t border-aether-border/10 text-xs">
          <span className="text-[9px] font-bold text-aether-muted tracking-wider uppercase flex items-center gap-1">
            <Type className="w-3 h-3" /> Materials & Layout
          </span>

          {/* Typography */}
          <div className="space-y-1">
            <span className="text-aether-text/80">Font Family</span>
            <select
              value={activeTheme.fontFamily}
              onChange={(e) => handlePropChange('fontFamily', e.target.value)}
              className="w-full bg-black/40 border border-aether-border/30 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-aether-primary text-aether-text"
            >
              {fonts.map((f) => (
                <option key={f.value} value={f.value} className="bg-aether-surface">
                  {f.label}
                </option>
              ))}
              <option value='"Playfair Display", Georgia, serif' className="bg-aether-surface">Playfair Display (Serif)</option>
              <option value='"Inter", sans-serif' className="bg-aether-surface">Inter (Sans-Serif)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Font Size */}
            <div className="space-y-1">
              <span className="text-aether-text/80">Body Size</span>
              <select
                value={activeTheme.fontSize || '13px'}
                onChange={(e) => updateThemeProps(activeTheme.id, { fontSize: e.target.value })}
                className="w-full bg-black/40 border border-aether-border/30 text-xs rounded px-2 py-1 focus:outline-none text-aether-text"
              >
                {['11px', '12px', '13px', '14px', '15px', '16px'].map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>

            {/* Font Weight */}
            <div className="space-y-1">
              <span className="text-aether-text/80">Font Weight</span>
              <select
                value={activeTheme.fontWeight || '400'}
                onChange={(e) => updateThemeProps(activeTheme.id, { fontWeight: e.target.value })}
                className="w-full bg-black/40 border border-aether-border/30 text-xs rounded px-2 py-1 focus:outline-none text-aether-text"
              >
                {['300', '400', '500', '600', '700'].map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-aether-text/80">Border Corner Radius</span>
              <span className="font-mono text-[10px] text-aether-muted">{activeTheme.borderRadius}</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={parseInt(activeTheme.borderRadius) || 0}
              onChange={(e) => handlePropChange('borderRadius', `${e.target.value}px`)}
              className="w-full h-1 bg-white/10 accent-aether-primary cursor-pointer"
            />
          </div>

          {/* Background Opacity */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-aether-text/80">Background Opacity</span>
              <span className="font-mono text-[10px] text-aether-muted">{Math.round((activeTheme.bgOpacity ?? 0.9) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={activeTheme.bgOpacity ?? 0.9}
              onChange={(e) => updateThemeProps(activeTheme.id, { bgOpacity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-white/10 accent-aether-primary cursor-pointer"
            />
          </div>

          {/* Blur Intensity */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-aether-text/80">Blur Material Intensity</span>
              <span className="font-mono text-[10px] text-aether-muted">{activeTheme.blurIntensity || '12px'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              value={parseInt(activeTheme.blurIntensity || '12px') || 0}
              onChange={(e) => updateThemeProps(activeTheme.id, { blurIntensity: `${e.target.value}px` })}
              className="w-full h-1 bg-white/10 accent-aether-primary cursor-pointer"
            />
          </div>

          {/* Shadow intensity presets */}
          <div className="space-y-1">
            <span className="text-aether-text/80">Shadow Intensity</span>
            <select
              value={activeTheme.shadowIntensity || '0 4px 12px rgba(0,0,0,0.1)'}
              onChange={(e) => updateThemeProps(activeTheme.id, { shadowIntensity: e.target.value })}
              className="w-full bg-black/40 border border-aether-border/30 text-xs rounded px-2.5 py-1.5 focus:outline-none text-aether-text"
            >
              <option value="none">None (Flat aesthetic)</option>
              <option value="0 2px 6px rgba(0,0,0,0.1)">Subtle (Pinterest cards)</option>
              <option value="0 4px 12px rgba(0,0,0,0.15)">Standard (Elevated UI)</option>
              <option value="0 8px 24px rgba(0,0,0,0.25)">Emphasized (Netflix feel)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Button Style */}
            <div className="space-y-1">
              <span className="text-aether-text/80">Button Styles</span>
              <select
                value={activeTheme.buttonStyle || 'editorial'}
                onChange={(e) => updateThemeProps(activeTheme.id, { buttonStyle: e.target.value as any })}
                className="w-full bg-black/40 border border-aether-border/30 text-xs rounded px-2 py-1 focus:outline-none text-aether-text"
              >
                <option value="sharp">Sharp (0px)</option>
                <option value="pill">Pill (9999px)</option>
                <option value="editorial">Editorial (Radius)</option>
              </select>
            </div>

            {/* Card Style */}
            <div className="space-y-1">
              <span className="text-aether-text/80">Card Styles</span>
              <select
                value={activeTheme.cardStyle || 'bordered'}
                onChange={(e) => updateThemeProps(activeTheme.id, { cardStyle: e.target.value as any })}
                className="w-full bg-black/40 border border-aether-border/30 text-xs rounded px-2 py-1 focus:outline-none text-aether-text"
              >
                <option value="flat">Flat</option>
                <option value="bordered">Bordered</option>
                <option value="glass">Glassmorphic</option>
              </select>
            </div>
          </div>

          {/* Spacing Density */}
          <div className="space-y-1">
            <span className="text-aether-text/80">Layout Padding Spacing</span>
            <div className="grid grid-cols-3 gap-1">
              {['compact', 'default', 'relaxed'].map((density) => (
                <button
                  key={density}
                  onClick={() => handlePropChange('spacingDensity', density)}
                  className={`py-1 rounded font-semibold text-[10px] uppercase transition-colors ${
                    activeTheme.spacingDensity === density
                      ? 'bg-aether-primary text-black'
                      : 'bg-black/20 hover:bg-black/35 text-aether-muted hover:text-aether-text'
                  }`}
                >
                  {density}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
            {/* Transition preset */}
            <div className="space-y-1">
              <span className="text-aether-text/80">Transition</span>
              <select
                value={activeTheme.transitionEffect || 'fade'}
                onChange={(e) => updateThemeProps(activeTheme.id, { transitionEffect: e.target.value as any })}
                className="w-full bg-black/40 border border-aether-border/30 text-xs rounded px-2 py-1 focus:outline-none text-aether-text"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="zoom">Zoom</option>
                <option value="slide">Slide</option>
              </select>
            </div>

            {/* Animation Speed */}
            <div className="space-y-1">
              <span className="text-aether-text/80">Speed (secs)</span>
              <select
                value={activeTheme.animationSpeed || 0.3}
                onChange={(e) => updateThemeProps(activeTheme.id, { animationSpeed: parseFloat(e.target.value) })}
                className="w-full bg-black/40 border border-aether-border/30 text-xs rounded px-2 py-1 focus:outline-none text-aether-text"
              >
                {[0.1, 0.2, 0.3, 0.5, 0.8, 1.2, 1.8].map(s => (
                  <option key={s} value={s}>{s}s</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Custom CSS Editor */}
        <div className="space-y-2.5 pt-4 border-t border-aether-border/10">
          <span className="text-[9px] font-bold text-aether-muted tracking-wider uppercase flex items-center gap-1">
            💻 Custom CSS Editor
          </span>
          <textarea
            value={customCSS}
            onChange={(e) => setCustomCSS(e.target.value)}
            placeholder="/* Write Custom CSS here... */&#10;body {&#10;  background: radial-gradient(#1e1e24, #000);&#10;}&#10;.glass-panel {&#10;  border-color: rgba(255, 255, 255, 0.2);&#10;}"
            className="w-full h-32 bg-black/45 focus:outline-none border border-aether-border/30 text-[10px] font-mono leading-relaxed p-2.5 rounded text-aether-text placeholder-aether-muted resize-none scrollbar-thin"
          />
        </div>

        {/* Theme Backup & CRUD */}
        <div className="space-y-2 pt-4 border-t border-aether-border/10 text-xs">
          <span className="text-[9px] font-bold text-aether-muted tracking-wider uppercase">
            Clones & Backups
          </span>

          {/* Clone Form */}
          <form onSubmit={handleCloneTheme} className="flex gap-1.5">
            <input
              type="text"
              required
              placeholder="Theme name..."
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              className="flex-1 bg-black/40 border border-aether-border/30 text-[11px] rounded px-2.5 py-1 focus:outline-none focus:border-aether-primary text-aether-text"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-aether-primary text-black font-semibold rounded hover:bg-aether-primary-hover transition-colors"
            >
              Clone
            </button>
          </form>

          {/* Import/Export buttons */}
          <div className="flex gap-2 pt-1.5">
            <button
              onClick={handleExport}
              className="flex-1 py-1.5 rounded bg-black/20 hover:bg-black/35 border border-aether-border/15 flex items-center justify-center gap-1 hover:text-aether-primary transition-all font-semibold"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-1.5 rounded bg-black/20 hover:bg-black/35 border border-aether-border/15 flex items-center justify-center gap-1 hover:text-aether-primary transition-all font-semibold"
            >
              <Upload className="w-3.5 h-3.5" /> Import Theme
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {/* Reset to Default Button */}
          <button
            onClick={() => {
              if (confirm("Reset theme properties and custom CSS back to original system defaults?")) {
                useThemeStore.getState().resetToDefault();
              }
            }}
            className="w-full mt-2 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-aether-text flex items-center justify-center gap-1 transition-all font-semibold"
          >
            Reset to default
          </button>

          {/* Custom Theme Delete Option */}
          {!activeTheme.isSystem && (
            <button
              onClick={() => {
                if (confirm(`Delete the custom theme "${activeTheme.name}"?`)) {
                  removeTheme(activeTheme.id);
                }
              }}
              className="w-full mt-2 py-1.5 rounded bg-red-950/20 border border-red-900/35 hover:bg-red-900/40 text-red-400 flex items-center justify-center gap-1 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Theme Customization
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
