import React, { useRef, useState, useEffect, useCallback } from 'react';
import { WordDeckToolbar } from './WordDeckToolbar';
import { WordDeckStatusBar } from './WordDeckStatusBar';
import { Ruler } from './Ruler';
import { CommentsSidebar } from './CommentsSidebar';
import type { DocComment } from '@/lib/digital-workspace/types/document';
import { exportToDocx } from '@/lib/digital-workspace/utils/docxExporter';
import { importDocxFile } from '@/lib/digital-workspace/utils/docxImporter';
import { X, MessageSquare, Bold, Italic, Undo2, Redo2, Save, Minimize2 } from 'lucide-react';

interface WordDeckProps {
  initialHtml: string;
  onSave: (html: string) => void;
  tileId: string;
}

export const WordDeck: React.FC<WordDeckProps> = ({ initialHtml, onSave }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Settings & view states
  const [html, setHtml] = useState(initialHtml || '<div><p>Start writing your document...</p></div>');
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<'draft' | 'print' | 'focus'>('print');
  const [rulerVisible, setRulerVisible] = useState(true);
  const [comments, setComments] = useState<DocComment[]>([]);
  const [activeSelectionText, setActiveSelectionText] = useState('');

  // Comments sidebar toggle
  const [showComments, setShowComments] = useState(false);

  // Focus mode hover bar
  const [focusBarVisible, setFocusBarVisible] = useState(false);
  const focusBarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Undo/Redo history stack
  const [history, setHistory] = useState<string[]>([initialHtml || '<div><p>Start writing your document...</p></div>']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Status Bar Metrics
  const [wordsCount, setWordsCount] = useState(0);
  const [charsCount, setCharsCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Find & Replace State
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Styles states for Toolbar active checks
  const [activeFont, setActiveFont] = useState('Inter');
  const [activeFontSize, setActiveFontSize] = useState('14px');
  const [activeTextColor, setActiveTextColor] = useState('#000000');
  const [activeHighlightColor, setActiveHighlightColor] = useState('transparent');
  const [activeLineSpacing, setActiveLineSpacing] = useState('1.15');

  // Load KaTeX dynamically for LaTeX equation rendering
  useEffect(() => {
    // CSS Link
    let link = document.querySelector('link[href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"]');
    if (!link) {
      link = document.createElement('link');
      (link as HTMLLinkElement).rel = 'stylesheet';
      (link as HTMLLinkElement).href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      document.head.appendChild(link);
    }

    // JS Script
    let script = document.querySelector('script[src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"]');
    if (!script) {
      script = document.createElement('script');
      (script as HTMLScriptElement).src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      (script as HTMLScriptElement).onload = () => {
        renderAllMath();
      };
      document.head.appendChild(script);
    } else {
      renderAllMath();
    }
  }, [html]);

  const renderAllMath = () => {
    if (!(window as any).katex) return;
    setTimeout(() => {
      const mathNodes = editorRef.current?.querySelectorAll('.math-node');
      mathNodes?.forEach((node: any) => {
        const latex = node.getAttribute('data-latex') || '';
        try {
          (window as any).katex.render(latex, node, {
            throwOnError: false,
            displayMode: false
          });
        } catch (e) {
          node.innerText = latex;
        }
      });
    }, 100);
  };

  // Setup initial loading
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
      updateStats();
    }
  }, []);

  // Escape key listener to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewMode === 'focus') {
        setViewMode('print');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  // Push history state when entering focus mode & handle browser back
  useEffect(() => {
    if (viewMode === 'focus') {
      window.history.pushState({ focusMode: true }, '');
    }

    const handlePopState = (_e: PopStateEvent) => {
      if (viewMode === 'focus') {
        setViewMode('print');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewMode]);

  // Auto-hide focus bar after 2s of no interaction
  const showFocusBar = useCallback(() => {
    setFocusBarVisible(true);
    if (focusBarTimeoutRef.current) clearTimeout(focusBarTimeoutRef.current);
    focusBarTimeoutRef.current = setTimeout(() => setFocusBarVisible(false), 2000);
  }, []);

  // Sync / Auto-Save logic (30 second debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (saveStatus === 'unsaved') {
        setSaveStatus('saving');
        onSave(html);
        setTimeout(() => setSaveStatus('saved'), 500);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [html, saveStatus]);

  // Command executor for toolbar
  const handleCommand = (command: string, value: string = '') => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    setSaveStatus('unsaved');

    if (command === 'lineSpacing') {
      setActiveLineSpacing(value);
      // Apply style to selection parent block
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let parentEl = selection.getRangeAt(0).commonAncestorContainer as HTMLElement;
        if (parentEl.nodeType === Node.TEXT_NODE) {
          parentEl = parentEl.parentElement as HTMLElement;
        }
        const block = parentEl.closest('p, div, li, blockquote, h1, h2, h3') as HTMLElement;
        if (block) {
          block.style.lineHeight = value;
        }
      }
      saveToHistory(editorRef.current.innerHTML);
      return;
    }

    if (command === 'pageBreak') {
      const hr = document.createElement('hr');
      hr.className = 'page-break my-8 border-t border-dashed border-gray-400/50 print:hidden';
      hr.style.pageBreakAfter = 'always';
      hr.style.height = '1px';
      hr.setAttribute('contenteditable', 'false');
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(hr);
        // Insert empty block after hr for typing
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        hr.parentNode?.insertBefore(p, hr.nextSibling);
        
        // Move selection to new block
        range.setStart(p, 0);
        range.setEnd(p, 0);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      saveToHistory(editorRef.current.innerHTML);
      return;
    }

    if (command === 'insertChecklist') {
      // checklist item tag
      const li = document.createElement('li');
      li.className = 'flex items-start gap-2 my-1';
      li.innerHTML = '<input type="checkbox" class="mt-1 accent-aether-primary" /> <span>Checklist Item</span>';
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(li);
      }
      saveToHistory(editorRef.current.innerHTML);
      return;
    }

    // Execute standard command
    document.execCommand(command, false, value);
    
    // Read and update active styling
    if (command === 'fontName') setActiveFont(value);
    if (command === 'fontSize') setActiveFontSize(value);
    if (command === 'foreColor') setActiveTextColor(value);
    if (command === 'hiliteColor') setActiveHighlightColor(value);

    saveToHistory(editorRef.current.innerHTML);
  };

  const handleInsertTable = (rows: number, cols: number) => {
    if (!editorRef.current) return;
    
    let tableHtml = '<table class="w-full border-collapse my-3 border border-gray-300 text-xs text-black bg-white select-text" border="1">';
    tableHtml += '<tbody>';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        tableHtml += '<td class="border border-gray-300 p-2 min-w-[50px]">Cell</td>';
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';

    const div = document.createElement('div');
    div.innerHTML = tableHtml;
    const tableEl = div.firstChild as HTMLElement;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(tableEl);
    }
    saveToHistory(editorRef.current.innerHTML);
  };

  const handleInsertImage = (src: string) => {
    if (!editorRef.current) return;
    
    const img = document.createElement('img');
    img.src = src;
    img.className = 'my-4 rounded shadow-md max-w-full cursor-pointer hover:ring-2 hover:ring-aether-primary transition-all';
    img.style.width = '80%';
    img.style.display = 'block';
    img.style.marginLeft = 'auto';
    img.style.marginRight = 'auto';

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(img);
    }
    saveToHistory(editorRef.current.innerHTML);
  };

  const handleInsertCodeBlock = (lang: string) => {
    if (!editorRef.current) return;
    const pre = document.createElement('pre');
    pre.className = 'bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-xs overflow-x-auto my-3 select-text border border-white/5';
    pre.setAttribute('data-lang', lang);
    pre.innerHTML = `<code class="font-mono text-xs">console.log("Write ${lang} code here...");</code>`;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(pre);
      
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      pre.parentNode?.insertBefore(p, pre.nextSibling);
    }
    saveToHistory(editorRef.current.innerHTML);
  };

  const handleInsertMath = (latex: string) => {
    if (!editorRef.current) return;
    const span = document.createElement('span');
    span.className = 'math-node py-0.5 px-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-600 rounded font-mono select-none inline-block my-1';
    span.setAttribute('data-latex', latex);
    span.setAttribute('contenteditable', 'false');
    span.innerText = latex;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(span);
    }
    saveToHistory(editorRef.current.innerHTML);
    renderAllMath();
  };

  // Undo/Redo logic
  const saveToHistory = (newHtml: string) => {
    const cleanHtml = newHtml;
    setHtml(cleanHtml);
    
    // Truncate stack if we had undone states
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(cleanHtml);
    
    // Cap at 50 steps
    if (nextHistory.length > 50) {
      nextHistory.shift();
    }
    
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    updateStats();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      const prevHtml = history[nextIdx];
      setHtml(prevHtml);
      if (editorRef.current) {
        editorRef.current.innerHTML = prevHtml;
      }
      updateStats();
      setSaveStatus('unsaved');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const nextHtml = history[nextIdx];
      setHtml(nextHtml);
      if (editorRef.current) {
        editorRef.current.innerHTML = nextHtml;
      }
      updateStats();
      setSaveStatus('unsaved');
    }
  };

  // Update statistics
  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    
    // Words
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordsCount(words);
    
    // Characters
    setCharsCount(text.length);
    
    // Reading time (assume 200 WPM)
    setReadingTime(Math.max(1, Math.round(words / 200)));
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newHtml = (e.target as HTMLDivElement).innerHTML;
    setHtml(newHtml);
    setSaveStatus('unsaved');
    updateStats();
  };

  const handleEditorSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setActiveSelectionText(selection.toString().trim());
    } else {
      setActiveSelectionText('');
    }
  };

  // Comments Actions
  const handleAddComment = (text: string) => {
    if (!activeSelectionText) return;
    
    const newComment: DocComment = {
      id: `comment-${Date.now()}`,
      author: 'Ayush Rana',
      text,
      timestamp: Date.now(),
      highlightedText: activeSelectionText
    };

    setComments([...comments, newComment]);
    
    // Wrap highlighted text inside a yellow background comment class
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = 'bg-amber-400/25 border-b border-dashed border-amber-500/80 cursor-help select-text';
      span.setAttribute('data-comment-id', newComment.id);
      range.surroundContents(span);
    }
    
    if (editorRef.current) {
      saveToHistory(editorRef.current.innerHTML);
    }
    setActiveSelectionText('');
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
    
    // Un-highlight comment node
    const commentNodes = editorRef.current?.querySelectorAll(`[data-comment-id="${id}"]`);
    commentNodes?.forEach((node) => {
      const parent = node.parentNode;
      if (parent) {
        while (node.firstChild) {
          parent.insertBefore(node.firstChild, node);
        }
        parent.removeChild(node);
      }
    });

    if (editorRef.current) {
      saveToHistory(editorRef.current.innerHTML);
    }
  };

  // Import Action
  const handleImport = async (file: File) => {
    try {
      setSaveStatus('saving');
      const parsedHtml = await importDocxFile(file);
      setHtml(parsedHtml);
      if (editorRef.current) {
        editorRef.current.innerHTML = parsedHtml;
      }
      saveToHistory(parsedHtml);
      setSaveStatus('saved');
    } catch (e) {
      alert("Failed to parse Word document. Please ensure it's a valid .docx file.");
      setSaveStatus('unsaved');
    }
  };

  // Export actions
  const handleExport = async (format: 'docx' | 'pdf' | 'md' | 'txt') => {
    const title = 'WordDeck Document';
    
    if (format === 'docx') {
      const blob = await exportToDocx(html, title);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title} - Workfolio.docx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    if (format === 'txt') {
      const text = editorRef.current?.innerText || '';
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    if (format === 'md') {
      // Simple custom HTML-to-Markdown conversion
      let md = editorRef.current?.innerHTML || '';
      md = md
        .replace(/<h1>(.*?)<\/h1>/gim, '# $1\n')
        .replace(/<h2>(.*?)<\/h2>/gim, '## $1\n')
        .replace(/<h3>(.*?)<\/h3>/gim, '### $1\n')
        .replace(/<p>(.*?)<\/p>/gim, '$1\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<b>(.*?)<\/b>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<i>(.*?)<\/i>/g, '*$1*')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/&nbsp;/g, ' ')
        .replace(/<[^>]*>/g, ''); // Strip remaining tags
      
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }

    if (format === 'pdf') {
      // Trigger a clean browser print layout of only the document
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body {
                  font-family: 'Inter', system-ui, sans-serif;
                  color: black;
                  background: white;
                  padding: 2in;
                }
                .page-break {
                  page-break-after: always;
                  border: none !important;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 15px 0;
                }
                table td, table th {
                  border: 1px solid #ccc;
                  padding: 8px;
                }
                pre {
                  background: #f4f4f4;
                  padding: 10px;
                  border-radius: 5px;
                  font-family: monospace;
                }
              </style>
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
            </head>
            <body>
              ${html}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // Find & Replace actions
  const handleFind = () => {
    if (!findText) return;
    const bodyText = editorRef.current?.innerHTML || '';
    
    // Standard text replacement highlight (simple wrapper tag)
    const regex = new RegExp(`(${findText})`, 'gi');
    const highlighted = bodyText.replace(regex, '<mark class="bg-yellow-300 text-black">$1</mark>');
    
    if (editorRef.current) {
      editorRef.current.innerHTML = highlighted;
    }
  };

  const handleReplace = () => {
    if (!findText || !editorRef.current) return;
    const bodyText = editorRef.current.innerHTML;
    
    // Replace all occurrences
    const regex = new RegExp(findText, 'gi');
    const replaced = bodyText.replace(regex, replaceText);
    
    editorRef.current.innerHTML = replaced;
    saveToHistory(replaced);
    setShowFindReplace(false);
  };

  const handleZoomChange = (val: number) => {
    setZoom(val);
  };

  const handleFitWidth = () => {
    setZoom(100);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d0d12] text-aether-text overflow-hidden select-text border border-white/5 rounded-lg">

      {/* Focus Mode: Mouse-move detection zone at top edge */}
      {viewMode === 'focus' && (
        <div 
          className="fixed top-0 left-0 right-0 h-8 z-[49]"
          onMouseEnter={showFocusBar}
        />
      )}

      {/* Focus Mode: Translucent hover bar */}
      {viewMode === 'focus' && (
        <div 
          className={`fixed top-0 left-0 right-0 z-50 flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-xl border-b border-white/10 transition-all duration-300 ${
            focusBarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
          onMouseEnter={() => { setFocusBarVisible(true); if (focusBarTimeoutRef.current) clearTimeout(focusBarTimeoutRef.current); }}
          onMouseLeave={() => { focusBarTimeoutRef.current = setTimeout(() => setFocusBarVisible(false), 2000); }}
        >
          <button onClick={() => handleCommand('bold')} className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
          <button onClick={() => handleCommand('italic')} className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-white/10" />
          <select 
            value={activeFontSize} 
            onChange={(e) => handleCommand('fontSize', e.target.value)} 
            className="bg-white/10 border border-white/10 rounded px-1.5 py-1 text-[11px] text-white/80 focus:outline-none cursor-pointer"
          >
            {['10px','12px','14px','16px','18px','20px','24px','28px','32px'].map(s => <option key={s} value={s} className="bg-gray-900 text-white">{s}</option>)}
          </select>
          <input type="color" value={activeTextColor} onChange={(e) => handleCommand('foreColor', e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" title="Text Color" />
          <input type="color" value={activeHighlightColor === 'transparent' ? '#ffff00' : activeHighlightColor} onChange={(e) => handleCommand('hiliteColor', e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" title="Highlight" />
          <div className="w-px h-5 bg-white/10" />
          <button onClick={handleUndo} className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white transition-colors" title="Undo"><Undo2 className="w-4 h-4" /></button>
          <button onClick={handleRedo} className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white transition-colors" title="Redo"><Redo2 className="w-4 h-4" /></button>
          <div className="flex-1" />
          <button 
            onClick={() => { onSave(html); setSaveStatus('saved'); }} 
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/15 rounded text-[11px] text-white/80 hover:text-white font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button 
            onClick={() => setViewMode('print')} 
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/15 rounded text-[11px] text-white/80 hover:text-white font-medium transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" /> Exit Focus
          </button>
        </div>
      )}
      
      {/* 1. Ribbon Formatting Toolbar (hide if focus mode) */}
      {viewMode !== 'focus' && (
        <WordDeckToolbar 
          onCommand={handleCommand}
          fontFamily={activeFont}
          fontSize={activeFontSize}
          textColor={activeTextColor}
          highlightColor={activeHighlightColor}
          lineSpacing={activeLineSpacing}
          viewMode={viewMode}
          rulerVisible={rulerVisible}
          onViewModeChange={setViewMode}
          onToggleRuler={() => setRulerVisible(!rulerVisible)}
          onInsertTable={handleInsertTable}
          onInsertImage={handleInsertImage}
          onInsertCodeBlock={handleInsertCodeBlock}
          onInsertMath={handleInsertMath}
          onAddComment={() => handleAddComment(prompt('Enter Comment text:') || '')}
          onExport={handleExport}
          onImport={handleImport}
          onToggleFindReplace={() => setShowFindReplace(!showFindReplace)}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      )}

      {/* 2. Horizontal Margin Ruler (hide if focus mode or disabled) */}
      {viewMode !== 'focus' && rulerVisible && (
        <Ruler zoom={zoom} />
      )}

      {/* 3. Find & Replace Overlay bar */}
      {showFindReplace && (
        <div className="bg-black/40 border-b border-white/5 p-2 flex items-center gap-3 text-xs z-30 select-none">
          <input 
            type="text" 
            placeholder="Find text..." 
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-aether-primary w-40"
          />
          <input 
            type="text" 
            placeholder="Replace with..." 
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-aether-primary w-40"
          />
          <button onClick={handleFind} className="px-2 py-1 bg-white/10 hover:bg-white/15 border border-white/5 rounded text-[10px] font-bold">Find</button>
          <button onClick={handleReplace} className="px-2 py-1 bg-aether-primary hover:bg-aether-primary-hover rounded text-[10px] font-bold text-white">Replace</button>
          <button onClick={() => setShowFindReplace(false)} className="ml-auto p-1 hover:bg-white/5 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Main Document Workspace Canvas */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden bg-[#07070a] select-text">
        
        {/* Scrollable sheet container */}
        <div className={`flex-1 overflow-auto p-6 flex flex-col items-center select-text scrollbar-thin transition-all duration-300 ease-in-out ${showComments && viewMode !== 'focus' ? 'mr-0' : ''}`}>
          <div 
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className={`transition-transform select-text ${
              viewMode === 'print' 
                ? 'w-[816px] min-h-[1056px] bg-white text-black p-[96px] shadow-2xl relative border border-gray-300 outline-none my-2'
                : 'w-full h-full bg-transparent text-aether-text p-4 outline-none max-w-4xl'
            }`}
          >
            {/* Print Header */}
            {viewMode === 'print' && (
              <div className="absolute top-8 left-[96px] right-[96px] border-b border-gray-200 pb-1 text-[9px] text-gray-400 select-none flex justify-between uppercase tracking-wider font-mono">
                <span>Workfolio Document</span>
                <span>WordDeck v1.0</span>
              </div>
            )}

            {/* Core contenteditable area */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              onSelect={handleEditorSelection}
              className="w-full h-full min-h-[150px] outline-none select-text break-words pr-2"
              style={{
                fontFamily: activeFont,
                fontSize: activeFontSize,
                lineHeight: activeLineSpacing,
              }}
            />

            {/* Print Footer */}
            {viewMode === 'print' && (
              <div className="absolute bottom-8 left-[96px] right-[96px] border-t border-gray-200 pt-1 text-[9px] text-gray-400 select-none flex justify-between font-mono">
                <span>Created on AetherDeck</span>
                <span>Page 1</span>
              </div>
            )}
          </div>
        </div>

        {/* 5. Comments toggle button */}
        {viewMode !== 'focus' && (
          <button
            onClick={() => setShowComments(!showComments)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-l-lg transition-all duration-200 ${
              showComments 
                ? 'bg-aether-primary/20 text-aether-primary border border-r-0 border-aether-primary/30' 
                : 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 border border-r-0 border-white/10'
            }`}
            title={showComments ? 'Hide Comments' : 'Show Comments'}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}

        {/* 5b. Google Docs comments sidebar - slide-out drawer */}
        {viewMode !== 'focus' && (
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showComments ? 'w-[280px] min-w-[280px]' : 'w-0 min-w-0'}`}>
            <div className="w-[280px]">
              <CommentsSidebar 
                comments={comments}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                activeSelectionText={activeSelectionText}
              />
            </div>
          </div>
        )}

      </div>

      {/* 6. Status Bar info (hide if focus mode) */}
      {viewMode !== 'focus' && (
        <WordDeckStatusBar 
          wordsCount={wordsCount}
          charsCount={charsCount}
          readingTime={readingTime}
          zoom={zoom}
          onZoomChange={handleZoomChange}
          onFitWidth={handleFitWidth}
          saveStatus={saveStatus}
        />
      )}

    </div>
  );
};
