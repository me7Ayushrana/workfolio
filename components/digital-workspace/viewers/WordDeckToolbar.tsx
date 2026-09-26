import React, { useState, useRef } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  Link2, Image as ImageIcon, Table as TableIcon, Code, Sigma, 
  Eye, Layout, Grid, Download, Search, FileDown, Undo, Redo, Sparkles
} from 'lucide-react';

interface WordDeckToolbarProps {
  onCommand: (command: string, value?: string) => void;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  highlightColor: string;
  lineSpacing: string;
  viewMode: 'draft' | 'print' | 'focus';
  rulerVisible: boolean;
  onViewModeChange: (mode: 'draft' | 'print' | 'focus') => void;
  onToggleRuler: () => void;
  onInsertTable: (rows: number, cols: number) => void;
  onInsertImage: (src: string) => void;
  onInsertCodeBlock: (lang: string) => void;
  onInsertMath: (latex: string) => void;
  onAddComment: () => void;
  onExport: (format: 'docx' | 'pdf' | 'md' | 'txt') => void;
  onImport: (file: File) => void;
  onToggleFindReplace: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const FONTS = [
  'Inter', 'Georgia', 'Arial', 'Times New Roman', 'Courier New', 'Calibri', 'Playfair Display', 'Comic Sans MS'
];

const FONT_SIZES = [
  '8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '72px'
];

const COLORS = [
  '#000000', '#ffffff', '#e11d48', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#4f46e5', '#9333ea', '#db2777'
];

export const WordDeckToolbar: React.FC<WordDeckToolbarProps> = ({
  onCommand,
  fontFamily,
  fontSize,
  textColor,
  highlightColor,
  lineSpacing,
  viewMode,
  rulerVisible,
  onViewModeChange,
  onToggleRuler,
  onInsertTable,
  onInsertImage,
  onInsertCodeBlock,
  onInsertMath,
  onAddComment,
  onExport,
  onImport,
  onToggleFindReplace,
  onUndo,
  onRedo
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showTableGrid, setShowTableGrid] = useState(false);
  const [tableGrid, setTableGrid] = useState({ rows: 3, cols: 3 });

  // Export As hover/click state & delay
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnterExport = () => {
    if (exportTimeoutRef.current) {
      clearTimeout(exportTimeoutRef.current);
      exportTimeoutRef.current = null;
    }
    setIsExportOpen(true);
  };

  const handleMouseLeaveExport = () => {
    exportTimeoutRef.current = setTimeout(() => {
      setIsExportOpen(false);
    }, 1200); // 1.2 second delay before closing
  };

  // Upload handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onInsertImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocxImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="flex flex-col border-b border-aether-border/10 bg-black/45 select-none z-40 sticky top-0">
      
      {/* Upper Action Bar (File / Edit commands) */}
      <div className="px-3 py-1 bg-black/25 flex items-center justify-between border-b border-white/5 text-[10px] text-aether-muted">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-aether-primary" />
            <span className="font-bold text-aether-text uppercase tracking-widest font-serif text-[9px]">WordDeck Document</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
            <button onClick={onUndo} className="p-1 hover:text-aether-text rounded hover:bg-white/5" title="Undo (Ctrl+Z)">
              <Undo className="w-3 h-3" />
            </button>
            <button onClick={onRedo} className="p-1 hover:text-aether-text rounded hover:bg-white/5" title="Redo (Ctrl+Y)">
              <Redo className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
            {/* Import Button */}
            <label className="hover:text-aether-text hover:bg-white/5 px-2 py-0.5 rounded cursor-pointer transition-colors border border-transparent hover:border-white/5 flex items-center gap-1">
              <span>Import Word (.docx)</span>
              <input type="file" accept=".docx" onChange={handleDocxImport} className="hidden" />
            </label>

            {/* Export Dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnterExport}
              onMouseLeave={handleMouseLeaveExport}
            >
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="hover:text-aether-text hover:bg-white/5 px-2 py-0.5 rounded transition-colors border border-transparent hover:border-white/5 flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Export As
              </button>
              {isExportOpen && (
                <div 
                  className="absolute left-0 mt-1 bg-[#0e0e13] border border-white/10 rounded shadow-xl py-1 w-32 z-50 text-[10px] animate-fade-in"
                  onMouseEnter={handleMouseEnterExport}
                  onMouseLeave={handleMouseLeaveExport}
                >
                  <button onClick={() => { onExport('docx'); setIsExportOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-aether-primary/10 hover:text-aether-primary transition-colors flex items-center gap-1">
                    <FileDown className="w-3 h-3" /> Word (.docx)
                  </button>
                  <button onClick={() => { onExport('pdf'); setIsExportOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-aether-primary/10 hover:text-aether-primary transition-colors flex items-center gap-1">
                    <FileDown className="w-3 h-3" /> PDF Document
                  </button>
                  <button onClick={() => { onExport('md'); setIsExportOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-aether-primary/10 hover:text-aether-primary transition-colors flex items-center gap-1">
                    <FileDown className="w-3 h-3" /> Markdown (.md)
                  </button>
                  <button onClick={() => { onExport('txt'); setIsExportOpen(false); }} className="w-full text-left px-3 py-1.5 hover:bg-aether-primary/10 hover:text-aether-primary transition-colors flex items-center gap-1">
                    <FileDown className="w-3 h-3" /> Plain Text (.txt)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={onToggleFindReplace} 
            className="px-2 py-0.5 rounded hover:text-aether-text hover:bg-white/5 flex items-center gap-1 border border-transparent hover:border-white/5"
          >
            <Search className="w-3 h-3" /> Find &amp; Replace (Ctrl+F)
          </button>
        </div>
      </div>

      {/* Main Formatting Toolbar */}
      <div className="p-1.5 flex flex-wrap items-center gap-1.5">
        
        {/* Font Family Dropdown */}
        <select 
          value={fontFamily} 
          onChange={(e) => onCommand('fontName', e.target.value)}
          className="bg-white/5 border border-white/10 hover:border-white/20 text-aether-text text-xs rounded px-1.5 py-1 focus:outline-none focus:border-aether-primary w-28 cursor-pointer"
        >
          {FONTS.map(font => (
            <option key={font} value={font} className="bg-[#121217]">{font}</option>
          ))}
        </select>

        {/* Font Size Dropdown */}
        <select 
          value={fontSize} 
          onChange={(e) => onCommand('fontSize', e.target.value)}
          className="bg-white/5 border border-white/10 hover:border-white/20 text-aether-text text-xs rounded px-1.5 py-1 focus:outline-none focus:border-aether-primary w-16 cursor-pointer"
        >
          {FONT_SIZES.map(size => (
            <option key={size} value={size} className="bg-[#121217]">{size}</option>
          ))}
        </select>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Styles (Bold, Italic, Underline, Strikethrough) */}
        <button onClick={() => onCommand('bold')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Bold (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </button>
        <button onClick={() => onCommand('italic')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Italic (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </button>
        <button onClick={() => onCommand('underline')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Underline (Ctrl+U)">
          <Underline className="w-4 h-4" />
        </button>
        <button onClick={() => onCommand('strikeThrough')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </button>
        <button onClick={() => onCommand('subscript')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Subscript">
          <Subscript className="w-4 h-4" />
        </button>
        <button onClick={() => onCommand('superscript')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Superscript">
          <Superscript className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Text Color Picker */}
        <div className="relative">
          <button 
            onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }}
            className="p-1.5 hover:bg-white/10 rounded text-aether-text flex flex-col items-center transition-colors"
            title="Text Color"
          >
            <span className="text-[10px] font-bold h-3 flex items-center leading-none">A</span>
            <div className="w-3.5 h-1.5 rounded-[1px] border border-white/10" style={{ backgroundColor: textColor || '#ffffff' }} />
          </button>
          {showColorPicker && (
            <div className="absolute top-9 left-0 bg-[#0d0d12] border border-white/10 p-2 rounded shadow-2xl z-50 flex flex-col gap-2 w-32">
              <span className="text-[9px] uppercase font-bold text-aether-muted">Text Color</span>
              <div className="grid grid-cols-5 gap-1.5">
                {COLORS.map(c => (
                  <button 
                    key={c} 
                    onClick={() => { onCommand('foreColor', c); setShowColorPicker(false); }}
                    className="w-4 h-4 rounded-full border border-white/10" 
                    style={{ backgroundColor: c }} 
                  />
                ))}
              </div>
              <input 
                type="text" 
                placeholder="#hex color" 
                defaultValue={textColor}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onCommand('foreColor', (e.target as HTMLInputElement).value);
                    setShowColorPicker(false);
                  }
                }}
                className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-aether-primary"
              />
            </div>
          )}
        </div>

        {/* Text Highlight Background Color Picker */}
        <div className="relative">
          <button 
            onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }}
            className="p-1.5 hover:bg-white/10 rounded text-aether-text flex flex-col items-center transition-colors"
            title="Text Highlight Color"
          >
            <span className="text-[10px] font-bold h-3 flex items-center leading-none">H</span>
            <div className="w-3.5 h-1.5 rounded-[1px] border border-white/10" style={{ backgroundColor: highlightColor || 'transparent' }} />
          </button>
          {showHighlightPicker && (
            <div className="absolute top-9 left-0 bg-[#0d0d12] border border-white/10 p-2 rounded shadow-2xl z-50 flex flex-col gap-2 w-32">
              <span className="text-[9px] uppercase font-bold text-aether-muted">Highlight Color</span>
              <div className="grid grid-cols-5 gap-1.5">
                {COLORS.map(c => (
                  <button 
                    key={c} 
                    onClick={() => { onCommand('hiliteColor', c); setShowHighlightPicker(false); }}
                    className="w-4 h-4 rounded-full border border-white/10" 
                    style={{ backgroundColor: c }} 
                  />
                ))}
                <button 
                  onClick={() => { onCommand('hiliteColor', 'transparent'); setShowHighlightPicker(false); }}
                  className="w-4 h-4 rounded-full border border-dashed border-white/30 text-white/50 text-[8px] flex items-center justify-center font-bold"
                >
                  X
                </button>
              </div>
              <input 
                type="text" 
                placeholder="#hex color" 
                defaultValue={highlightColor}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onCommand('hiliteColor', (e.target as HTMLInputElement).value);
                    setShowHighlightPicker(false);
                  }
                }}
                className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-aether-primary"
              />
            </div>
          )}
        </div>

        <button onClick={() => onCommand('removeFormat')} className="p-1.5 hover:bg-white/10 rounded text-aether-muted hover:text-aether-text text-xs transition-colors" title="Clear Formatting">
          Tx
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Alignment */}
        <button onClick={() => onCommand('justifyLeft')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </button>
        <button onClick={() => onCommand('justifyCenter')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </button>
        <button onClick={() => onCommand('justifyRight')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Align Right">
          <AlignRight className="w-4 h-4" />
        </button>
        <button onClick={() => onCommand('justifyFull')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Justify">
          <AlignJustify className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Line Spacing */}
        <select 
          value={lineSpacing} 
          onChange={(e) => onCommand('lineSpacing', e.target.value)}
          className="bg-white/5 border border-white/10 hover:border-white/20 text-aether-text text-xs rounded px-1 py-1 focus:outline-none focus:border-aether-primary w-14 cursor-pointer"
          title="Line Spacing"
        >
          <option value="1.0" className="bg-[#121217]">1.0</option>
          <option value="1.15" className="bg-[#121217]">1.15</option>
          <option value="1.5" className="bg-[#121217]">1.5</option>
          <option value="2.0" className="bg-[#121217]">2.0</option>
          <option value="2.5" className="bg-[#121217]">2.5</option>
        </select>

        {/* Lists */}
        <button onClick={() => onCommand('insertUnorderedList')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Bullet List">
          <List className="w-4 h-4" />
        </button>
        <button onClick={() => onCommand('insertOrderedList')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </button>
        <button onClick={() => onCommand('insertChecklist')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Checklist">
          <CheckSquare className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Insert items */}
        <button onClick={() => onCommand('createLink')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Insert Link (Ctrl+K)">
          <Link2 className="w-4 h-4" />
        </button>
        
        {/* Local Image Uploader button */}
        <label className="p-1.5 hover:bg-white/10 rounded text-aether-text cursor-pointer transition-colors" title="Insert Image">
          <ImageIcon className="w-4 h-4" />
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>

        {/* Table Grid Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowTableGrid(!showTableGrid)}
            className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          {showTableGrid && (
            <div className="absolute top-9 left-0 bg-[#0d0d12] border border-white/10 p-3 rounded shadow-2xl z-50 flex flex-col gap-2">
              <span className="text-[9px] uppercase font-bold text-aether-muted">Insert Table</span>
              <div className="flex gap-2 text-[10px]">
                <input 
                  type="number" 
                  min="1" 
                  max="15" 
                  value={tableGrid.rows}
                  onChange={(e) => setTableGrid({ ...tableGrid, rows: parseInt(e.target.value) || 1 })}
                  className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 focus:outline-none w-10 text-center" 
                />
                <span className="text-white/40">×</span>
                <input 
                  type="number" 
                  min="1" 
                  max="15" 
                  value={tableGrid.cols}
                  onChange={(e) => setTableGrid({ ...tableGrid, cols: parseInt(e.target.value) || 1 })}
                  className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 focus:outline-none w-10 text-center" 
                />
              </div>
              <button 
                onClick={() => { onInsertTable(tableGrid.rows, tableGrid.cols); setShowTableGrid(false); }}
                className="w-full py-1 bg-aether-primary hover:bg-aether-primary-hover rounded text-[10px] font-bold text-white text-center"
              >
                Insert Table
              </button>
            </div>
          )}
        </div>

        <button onClick={() => onInsertCodeBlock('javascript')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Insert Code Block">
          <Code className="w-4 h-4" />
        </button>
        <button onClick={() => {
          const latex = prompt('Enter LaTeX Equation (e.g. \\int_{a}^{b} f(x) dx):', '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}');
          if (latex) onInsertMath(latex);
        }} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Insert Math Equation">
          <Sigma className="w-4 h-4" />
        </button>
        <button onClick={() => onCommand('pageBreak')} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Insert Page Break (Ctrl+Enter)">
          <Layout className="w-4 h-4" />
        </button>
        <button onClick={onAddComment} className="p-1.5 hover:bg-white/10 rounded text-aether-text transition-colors" title="Add Comment">
          <Eye className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* View Mode Toggle */}
        <select 
          value={viewMode} 
          onChange={(e) => onViewModeChange(e.target.value as any)}
          className="bg-white/5 border border-white/10 hover:border-white/20 text-aether-text text-xs rounded px-1.5 py-1 focus:outline-none focus:border-aether-primary w-24 cursor-pointer"
          title="Page View Mode"
        >
          <option value="draft" className="bg-[#121217]">Draft Mode</option>
          <option value="print" className="bg-[#121217]">Print Layout</option>
          <option value="focus" className="bg-[#121217]">Focus Mode</option>
        </select>

        <button 
          onClick={onToggleRuler}
          className={`p-1.5 rounded transition-colors ${
            rulerVisible ? 'bg-aether-primary/10 text-aether-primary' : 'hover:bg-white/10 text-aether-text'
          }`}
          title="Toggle Ruler"
        >
          <Grid className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
