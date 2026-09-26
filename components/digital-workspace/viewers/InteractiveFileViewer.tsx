import React, { useState, useEffect, useRef } from 'react';
import type { Tile } from '@/lib/digital-workspace/types';
import { useWorkspaceStore } from '@/lib/digital-workspace/store/useWorkspace';
import { 
  saveFileBlob, getFileBlob, deleteFileBlob 
} from '@/lib/digital-workspace/utils/db';
import { 
  FileText, Upload, Plus, Trash2, ArrowUp, ArrowDown, Download, Copy,
  Maximize2, Minimize2, Sidebar, Edit3, Check, Search, ZoomIn, ZoomOut, 
  FileSpreadsheet, Code, Music, HelpCircle, RefreshCw, Film, Image as ImageIcon
} from 'lucide-react';

interface InteractiveFileViewerProps {
  tile: Tile;
}

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
}

export const InteractiveFileViewer: React.FC<InteractiveFileViewerProps> = ({ tile }) => {
  const { updateTileSettings } = useWorkspaceStore();
  
  // Retrieve settings
  const files: FileItem[] = tile.settings.files || [];
  const activeFileId = tile.settings.activeFileId || '';
  
  // Local state
  const [activeUrl, setActiveUrl] = useState<string>('');
  const [activeTextContent, setActiveTextContent] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState<string>('');
  
  // Sidebar Search
  const [sidebarSearch, setSidebarSearch] = useState<string>('');

  // Inline editing
  const [isEditingText, setIsEditingText] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>('');
  
  // Zoom & Pan for Images
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // CSV / Data Table Search & Sort
  const [csvSearch, setCsvSearch] = useState<string>('');
  const [csvSort, setCsvSort] = useState<{ col: number; dir: 'asc' | 'desc' | null }>({ col: -1, dir: null });

  const activeFile = files.find(f => f.id === activeFileId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panContainerRef = useRef<HTMLDivElement>(null);

  // Load active file Blob from IndexedDB
  useEffect(() => {
    let currentUrl = '';
    const loadFile = async () => {
      if (!activeFileId) {
        setActiveUrl('');
        setActiveTextContent('');
        return;
      }

      try {
        const storageKey = `file-data-${tile.id}-${activeFileId}`;
        const blob = await getFileBlob(storageKey);
        if (blob) {
          currentUrl = URL.createObjectURL(blob);
          setActiveUrl(currentUrl);
          
          // If it is a text-based file, read content for MD/CSV/Code readers
          const textTypes = ['text/plain', 'text/csv', 'text/markdown', 'application/json', 'text/javascript', 'text/typescript', 'text/css', 'text/html', 'application/xml'];
          const isText = textTypes.some(t => blob.type.startsWith(t)) || 
                         /\.(csv|md|txt|json|js|ts|tsx|css|html|xml)$/i.test(activeFile?.name || '');
          
          if (isText) {
            const text = await blob.text();
            setActiveTextContent(text);
          } else {
            setActiveTextContent('');
          }
        } else {
          setActiveUrl('');
          setActiveTextContent('');
        }
      } catch (err) {
        console.error("Failed to load file blob from db:", err);
      }
    };

    loadFile();
    setIsEditingText(false);
    setEditText('');

    // Reset zoom and pan on file change
    setZoom(1);
    setPan({ x: 0, y: 0 });

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [activeFileId, tile.id]);

  // Handle Drag & Drop Uploads
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
    }
  };

  const uploadFiles = async (fileList: FileList) => {
    setUploadProgress(10);
    const newFiles: FileItem[] = [...files];
    let lastId = activeFileId;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileId = `file-${Date.now()}-${i}`;
      
      // Save Blob to IndexedDB
      const storageKey = `file-data-${tile.id}-${fileId}`;
      await saveFileBlob(storageKey, file);

      newFiles.push({
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadDate: new Date().toLocaleDateString()
      });

      lastId = fileId; // Set last uploaded file as active
      
      // Update progress indicator
      setUploadProgress(Math.round(((i + 1) / fileList.length) * 100));
    }

    updateTileSettings(tile.id, {
      files: newFiles,
      activeFileId: lastId
    });

    setTimeout(() => setUploadProgress(null), 800);
  };

  // Switch Active File
  const handleSelectFile = (id: string) => {
    updateTileSettings(tile.id, { activeFileId: id });
  };

  // Delete File
  const handleDeleteFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this file from browser storage?")) return;

    // Delete Blob from DB
    const storageKey = `file-data-${tile.id}-${id}`;
    await deleteFileBlob(storageKey);

    // Update store
    const nextFiles = files.filter(f => f.id !== id);
    const nextActiveId = activeFileId === id 
      ? (nextFiles.length > 0 ? nextFiles[0].id : '')
      : activeFileId;

    updateTileSettings(tile.id, {
      files: nextFiles,
      activeFileId: nextActiveId
    });
  };

  // Reorder files (Up / Down)
  const handleMoveFile = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= files.length) return;
    
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIndex];
    newFiles[targetIndex] = temp;
    
    updateTileSettings(tile.id, { files: newFiles });
  };

  // Rename File
  const handleStartRename = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameText(name);
  };

  const handleSaveRename = (id: string) => {
    if (!renameText.trim()) return;
    const nextFiles = files.map(f => f.id === id ? { ...f, name: renameText.trim() } : f);
    updateTileSettings(tile.id, { files: nextFiles });
    setRenamingId(null);
  };

  // Copy shareable file URL (Base64 or mockup share link)
  const handleShareFile = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeFile) return;

    try {
      const shareUrl = `${window.location.origin}/?file=${activeFile.name}`;
      await navigator.clipboard.writeText(shareUrl);
      alert("AetherDeck mockup share link copied to clipboard!");
    } catch (err) {
      alert("Failed to copy link to clipboard.");
    }
  };

  // Trigger browser download of native Blob
  const handleDownloadFile = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeFile || !activeUrl) return;

    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = activeUrl;
    downloadAnchor.download = activeFile.name;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Save edited text back to IndexedDB
  const handleSaveTextContent = async () => {
    if (!activeFile) return;
    try {
      const storageKey = `file-data-${tile.id}-${activeFile.id}`;
      const updatedBlob = new Blob([editText], { type: activeFile.type || 'text/plain' });
      await saveFileBlob(storageKey, updatedBlob);
      setActiveTextContent(editText);
      setIsEditingText(false);
      
      // Force reload object URL so readers get the fresh version immediately
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
      const freshUrl = URL.createObjectURL(updatedBlob);
      setActiveUrl(freshUrl);
    } catch (err) {
      console.error("Failed to save edited text to IndexedDB:", err);
      alert("Error saving file content.");
    }
  };

  // Image Panning Handlers
  const handlePanDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  };

  const handlePanUp = () => {
    setIsPanning(false);
  };

  // CSV Simple Table Parser
  const renderCsvTable = () => {
    if (!activeTextContent) return null;
    
    // Parse rows
    const rows = activeTextContent.split('\n')
      .map(line => line.split(',').map(cell => cell.replace(/^["']|["']$/g, '').trim()))
      .filter(row => row.length > 0 && row.some(cell => cell !== ''));

    if (rows.length === 0) return <div className="text-xs text-aether-muted p-4">Empty CSV file</div>;

    const headers = rows[0];
    let dataRows = rows.slice(1);

    // Apply Search Filter
    if (csvSearch) {
      const q = csvSearch.toLowerCase();
      dataRows = dataRows.filter(row => row.some(cell => cell.toLowerCase().includes(q)));
    }

    // Apply Sorting
    if (csvSort.col !== -1 && csvSort.dir) {
      const colIdx = csvSort.col;
      const isAsc = csvSort.dir === 'asc';
      dataRows.sort((a, b) => {
        const valA = a[colIdx] || '';
        const valB = b[colIdx] || '';
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        
        if (!isNaN(numA) && !isNaN(numB)) {
          return isAsc ? numA - numB : numB - numA;
        }
        return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-black/25">
        <div className="p-2 border-b border-white/5 flex items-center justify-between gap-2">
          <span className="text-[10px] text-aether-muted flex items-center gap-1 font-mono">
            <FileSpreadsheet className="w-3.5 h-3.5" /> RENDERED GRID ({dataRows.length} rows)
          </span>
          <div className="relative w-40">
            <input
              type="text"
              placeholder="Search table data..."
              value={csvSearch}
              onChange={(e) => setCsvSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] focus:outline-none focus:border-aether-primary pl-6"
            />
            <Search className="w-3 h-3 text-aether-muted absolute left-2 top-1.5" />
          </div>
        </div>
        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full text-left text-[11px] border-collapse select-text">
            <thead>
              <tr className="bg-white/5 sticky top-0 border-b border-white/10 text-[9px] uppercase tracking-wider text-aether-muted font-bold">
                {headers.map((h, i) => (
                  <th 
                    key={i} 
                    onClick={() => {
                      const isSame = csvSort.col === i;
                      const nextDir = !isSame ? 'asc' : csvSort.dir === 'asc' ? 'desc' : null;
                      setCsvSort({ col: nextDir ? i : -1, dir: nextDir });
                    }}
                    className="p-2 cursor-pointer hover:text-aether-text transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      {h}
                      {csvSort.col === i ? (csvSort.dir === 'asc' ? '▲' : '▼') : '↕'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {headers.map((_, colIdx) => (
                    <td key={colIdx} className="p-2 max-w-[150px] truncate">{row[colIdx] || ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Custom Markdown parsing and preview compiler
  const renderMarkdown = () => {
    if (!activeTextContent) return null;

    // Simple parser converting md characters to HTML
    const renderHtml = () => {
      const lines = activeTextContent.split('\n');
      return lines.map((line, idx) => {
        let text = line;
        
        // Headers
        if (text.startsWith('# ')) {
          return <h1 key={idx} className="text-lg font-bold text-aether-primary mt-3 mb-1.5 border-b border-white/5 pb-1 font-headings">{text.substring(2)}</h1>;
        }
        if (text.startsWith('## ')) {
          return <h2 key={idx} className="text-base font-bold text-aether-text mt-3 mb-1.5 font-headings">{text.substring(3)}</h2>;
        }
        if (text.startsWith('### ')) {
          return <h3 key={idx} className="text-sm font-bold text-aether-text mt-2 mb-1 font-headings">{text.substring(4)}</h3>;
        }
        
        // Bullet list
        if (text.startsWith('- ') || text.startsWith('* ')) {
          return <li key={idx} className="ml-4 text-xs list-disc leading-relaxed text-aether-text/90 select-text">{text.substring(2)}</li>;
        }

        // Bold and Italics parsing helper
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        text = text.replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded font-mono text-[10px]">$1</code>');

        if (!text.trim()) return <div key={idx} className="h-2" />;
        return <p key={idx} className="text-xs leading-relaxed text-aether-text/80 mb-2 select-text" dangerouslySetInnerHTML={{ __html: text }} />;
      });
    };

    return (
      <div className="flex-1 flex flex-col overflow-auto p-4 bg-black/20 select-text scrollbar-thin">
        {renderHtml()}
      </div>
    );
  };

  // Custom Code Syntax Highlighter
  const renderCode = () => {
    if (!activeTextContent) return null;

    // Standard regex keywords colors matching code types
    const highlightCode = (src: string) => {
      let escaped = src
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Comments
      escaped = escaped.replace(/(\/\/.*)/g, '<span class="text-gray-500 font-semibold italic">$1</span>');
      escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 font-semibold italic">$1</span>');
      
      // Keywords
      const keywords = /\b(const|let|var|function|return|import|export|class|extends|if|else|for|while|switch|case|default|break|continue|new|this|typeof|instanceof|async|await|try|catch|finally|throw|default|interface|type|public|private)\b/g;
      escaped = escaped.replace(keywords, '<span class="text-pink-500 font-bold">$1</span>');

      // Strings
      escaped = escaped.replace(/(["'])(.*?)\1/g, '<span class="text-green-400 font-medium">"$2"</span>');
      escaped = escaped.replace(/(`)([\s\S]*?)\1/g, '<span class="text-green-400 font-medium">`$2`</span>');

      // Numbers
      escaped = escaped.replace(/\b(\d+)\b/g, '<span class="text-amber-400">$1</span>');

      return escaped;
    };

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-black/35 font-mono text-[11px]">
        <div className="p-2 border-b border-white/5 bg-black/20 flex justify-between items-center">
          <span className="text-[9px] text-aether-muted flex items-center gap-1">
            <Code className="w-3.5 h-3.5" /> CODE INSPECTOR
          </span>
        </div>
        <pre className="flex-1 overflow-auto p-4 whitespace-pre-wrap select-text leading-relaxed scrollbar-thin">
          <code dangerouslySetInnerHTML={{ __html: highlightCode(activeTextContent) }} />
        </pre>
      </div>
    );
  };

  // Helper to resolve specific file icons
  const getFileIcon = (filename: string, filetype: string) => {
    const nameStr = filename.toLowerCase();
    if (nameStr.endsWith('.pdf')) return FileText;
    if (nameStr.endsWith('.csv') || nameStr.endsWith('.xlsx')) return FileSpreadsheet;
    if (nameStr.endsWith('.md')) return FileText;
    if (filetype.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif|svg|avif)$/i.test(nameStr)) return ImageIcon;
    if (filetype.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(nameStr)) return Film;
    if (filetype.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(nameStr)) return Music;
    if (/\.(js|ts|tsx|css|html|json|xml|sh)$/i.test(nameStr)) return Code;
    return FileText;
  };

  // Master Render Active View Engine
  const renderActiveViewer = () => {
    if (!activeFile || !activeUrl) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-aether-muted p-8 text-center bg-black/10">
          <HelpCircle className="w-12 h-12 mb-2 opacity-35" />
          <div className="text-xs">Select a file from the sidebar to inspect.</div>
        </div>
      );
    }

    if (isEditingText) {
      return (
        <div className="flex-1 flex flex-col min-h-0 bg-black/35 font-mono text-xs interactive-file-viewport">
          <div className="p-2 border-b border-white/5 bg-black/20 flex justify-between items-center text-[10px] text-aether-muted uppercase font-mono">
            <span>Editing file: {activeFile.name}</span>
            <span className="text-yellow-500/90 font-bold">Unsaved Changes</span>
          </div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-1 w-full h-full p-4 bg-transparent text-aether-text outline-none resize-none leading-relaxed font-mono text-xs select-text scrollbar-thin border-none"
            placeholder="Write file content here..."
          />
        </div>
      );
    }

    const { type, name } = activeFile;
    const isImage = type.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif|svg|avif)$/i.test(name);
    const isVideo = type.startsWith('video/') || /\.(mp4|webm|mov|ogg)$/i.test(name);
    const isAudio = type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(name);
    const isPdf = type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
    const isCsv = name.toLowerCase().endsWith('.csv');
    const isMarkdown = name.toLowerCase().endsWith('.md');
    const isOffice = /\.(ppt|pptx|doc|docx|xls|xlsx|odt|odp|ods)$/i.test(name);
    
    const textExtensions = /\.(txt|json|js|ts|tsx|css|html|xml|yaml|yml|sh|md)$/i;
    const isText = type.startsWith('text/') || textExtensions.test(name);

    if (isImage) {
      return (
        <div 
          ref={panContainerRef}
          onMouseDown={handlePanDown}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanUp}
          onMouseLeave={handlePanUp}
          className={`flex-1 flex items-center justify-center overflow-hidden bg-black/50 select-none relative ${
            zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
        >
          {/* Zoom Overlay Indicators */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-black/60 border border-white/10 rounded p-1">
            <button 
              onClick={() => setZoom(Math.max(1, zoom - 0.25))}
              className="p-1 hover:bg-white/10 rounded transition-colors text-aether-text"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-aether-muted w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(Math.min(5, zoom + 0.25))}
              className="p-1 hover:bg-white/10 rounded transition-colors text-aether-text"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <img 
            src={activeUrl} 
            alt={name}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isPanning ? 'none' : 'transform 0.2s ease-out',
              maxWidth: '90%',
              maxHeight: '90%'
            }}
            className="object-contain pointer-events-none"
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <video 
            src={activeUrl} 
            controls 
            autoPlay
            loop
            className="w-full h-full object-contain" 
          />
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="flex-1 bg-black/60 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-aether-primary/10 rounded-full border border-aether-primary/20 flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-aether-primary animate-pulse" />
          </div>
          <span className="text-xs font-semibold text-aether-text max-w-xs truncate mb-2">{name}</span>
          <audio src={activeUrl} controls className="w-full max-w-sm rounded" />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="flex-1 bg-black/10 flex flex-col h-full relative">
          {/* toolbar=0 hides browser PDF chrome — only content is visible */}
          <iframe 
            src={`${activeUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
            title={name} 
            className="w-full h-full border-none"
            style={{ display: 'block' }}
          />
        </div>
      );
    }

    if (isOffice) {
      // Google Docs Viewer can render Office files from a public URL.
      // Since activeUrl is a local blob URL, we must fall back to a download
      // prompt with a clear explanation, OR if the file was loaded from a public URL,
      // we can pass it to Google Docs Viewer.
      const isPublicUrl = tile.contentUrl && !tile.contentUrl.startsWith('blob:');
      
      if (isPublicUrl && tile.contentUrl) {
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(tile.contentUrl)}&embedded=true`;
        return (
          <div className="flex-1 bg-white flex flex-col h-full relative">
            <iframe
              src={viewerUrl}
              title={name}
              className="w-full h-full border-none"
              style={{ display: 'block' }}
            />
          </div>
        );
      }

      // For locally-uploaded Office files, convert to a blob URL and open via Google Docs Viewer
      // by using the Microsoft Office Online viewer which supports blob object URLs indirectly.
      // Best approach: offer a message + download, since cloud viewers can't access local blobs.
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40 text-center select-text">
          <div className="w-16 h-16 rounded-xl bg-aether-primary/10 border border-aether-primary/20 flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-8 h-8 text-aether-primary" />
          </div>
          <h3 className="text-sm font-bold text-aether-text truncate max-w-xs mb-1">{name}</h3>
          <p className="text-[11px] text-aether-muted max-w-xs leading-normal mb-2">
            Office files (.pptx, .docx, .xlsx) uploaded locally cannot be previewed in-browser.
          </p>
          <p className="text-[10px] text-aether-muted/70 max-w-xs leading-normal mb-5">
            Download the file and open it in your local Office app, or paste a public link (e.g., OneDrive/Google Drive share link) to preview it here.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadFile}
              className="px-4 py-1.5 bg-aether-primary text-black font-semibold rounded text-xs hover:bg-aether-primary-hover transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download File
            </button>
          </div>
        </div>
      );
    }

    if (isCsv) {
      return renderCsvTable();
    }

    if (isMarkdown) {
      return renderMarkdown();
    }

    if (isText) {
      return renderCode();
    }

    // Default Office documents and zip download cards
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40 text-center select-text">
        <FileText className="w-16 h-16 text-aether-muted mb-4 opacity-40" />
        <h3 className="text-xs font-bold text-aether-text truncate max-w-xs mb-1 uppercase">{name}</h3>
        <p className="text-[10px] text-aether-muted max-w-xs leading-normal mb-4">
          Preview unavailable for this format ({(type.split('/')[1] || 'generic').toUpperCase()}). Use the download option below to review.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadFile}
            className="px-4 py-1.5 bg-aether-primary text-black font-semibold rounded text-xs hover:bg-aether-primary-hover transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Download file
          </button>
        </div>
      </div>
    );
  };

  // Fullscreen styling wrapper
  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-[100] bg-[#0a0a0ab0] backdrop-blur-xl p-6 flex flex-col w-full h-full select-none"
    : "w-full h-full flex flex-col relative select-none";

  const { type: activeFileType, name: activeFileName } = activeFile || {};
  const textExtensions = /\.(txt|json|js|ts|tsx|css|html|xml|yaml|yml|sh|md|csv)$/i;
  const isTextFile = activeFile && (activeFileType?.startsWith('text/') || textExtensions.test(activeFileName || ''));

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(sidebarSearch.toLowerCase()));

  return (
    <div className={containerClasses}>
      
      {/* File Action Toolbar */}
      <div className="p-2 bg-black/35 border-b border-white/5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${isSidebarOpen ? 'text-aether-primary' : 'text-aether-muted'}`}
            title="Toggle File Manager"
          >
            <Sidebar className="w-4 h-4" />
          </button>
          
          {activeFile && (
            <div className="flex items-center gap-1.5 min-w-0">
              {renamingId === activeFile.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={renameText}
                    onChange={(e) => setRenameText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(activeFile.id)}
                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[11px] focus:outline-none focus:border-aether-primary"
                    autoFocus
                  />
                  <button 
                    onClick={() => handleSaveRename(activeFile.id)}
                    className="p-0.5 text-green-400 hover:bg-white/5 rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-aether-text truncate text-[11px]">
                    {activeFile.name}
                  </span>
                  <button 
                    onClick={(e) => handleStartRename(activeFile.id, activeFile.name, e)}
                    className="p-0.5 text-aether-muted hover:text-aether-text rounded"
                    title="Rename File"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              )}
              <span className="text-[9px] text-aether-muted font-mono flex-shrink-0">
                ({(activeFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
        </div>

        {activeFile && (
          <div className="flex items-center gap-1.5">
            {/* Inline Text Editor Save/Edit Button */}
            {isTextFile && (
              <button
                onClick={() => {
                  if (isEditingText) {
                    handleSaveTextContent();
                  } else {
                    setEditText(activeTextContent);
                    setIsEditingText(true);
                  }
                }}
                className={`px-2 py-1 rounded transition-all flex items-center gap-1 text-[10px] uppercase font-bold border ${
                  isEditingText 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 text-aether-muted hover:text-aether-text'
                }`}
                title={isEditingText ? "Save changes to storage" : "Edit file contents"}
              >
                {isEditingText ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>{isEditingText ? 'Save' : 'Edit'}</span>
              </button>
            )}

            <button
              onClick={handleShareFile}
              className="p-1 rounded hover:bg-white/10 hover:text-aether-primary text-aether-muted transition-all"
              title="Copy share link"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDownloadFile}
              className="p-1 rounded hover:bg-white/10 hover:text-aether-primary text-aether-muted transition-all"
              title="Download original file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3 bg-white/10" />
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 rounded hover:bg-white/10 hover:text-aether-primary text-aether-muted transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex min-h-0 relative">
        
        {/* Collapsible File Manager Sidebar */}
        {isSidebarOpen && (
          <div className="w-48 border-r border-white/5 bg-black/40 flex flex-col min-h-0 flex-shrink-0">
            <div className="p-2 border-b border-white/5 flex flex-col gap-1.5 flex-shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-aether-muted uppercase tracking-wider">FILES IN TILE</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 bg-aether-primary/10 border border-aether-primary/20 text-aether-primary rounded hover:bg-aether-primary/20 transition-all"
                  title="Upload file"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              {files.length > 0 && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-0.5 text-[10px] pl-6 focus:outline-none focus:border-aether-primary text-aether-text"
                  />
                  <Search className="w-3 h-3 text-aether-muted absolute left-2 top-1.5" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin relative ${
                dragActive ? 'bg-aether-primary/10 border border-dashed border-aether-primary/30' : ''
              }`}
            >
              {filteredFiles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-3 text-center text-aether-muted">
                  <Upload className="w-8 h-8 mb-2 opacity-35" />
                  <span className="text-[10px] leading-tight">
                    {files.length === 0 ? "Drag files here or click + above" : "No matching files found"}
                  </span>
                </div>
              ) : (
                filteredFiles.map((file) => {
                  const originalIndex = files.findIndex(f => f.id === file.id);
                  const isActive = file.id === activeFileId;
                  const FileIcon = getFileIcon(file.name, file.type);
                  return (
                    <div
                      key={file.id}
                      onClick={() => handleSelectFile(file.id)}
                      className={`group flex items-center justify-between p-1.5 rounded cursor-pointer transition-all border ${
                        isActive 
                          ? 'bg-aether-primary/15 border-aether-primary/30 text-aether-primary'
                          : 'hover:bg-white/5 border-transparent text-aether-text/80'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-aether-primary' : 'text-aether-muted'}`} />
                        <span className="text-[10px] truncate max-w-[100px]">{file.name}</span>
                      </div>
                      
                      {/* Sidebar Item Actions */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-1">
                        <button
                          disabled={originalIndex === 0}
                          onClick={(e) => handleMoveFile(originalIndex, 'up', e)}
                          className="p-0.5 rounded hover:bg-white/10 text-aether-muted hover:text-aether-text disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-2.5 h-2.5" />
                        </button>
                        <button
                          disabled={originalIndex === files.length - 1}
                          onClick={(e) => handleMoveFile(originalIndex, 'down', e)}
                          className="p-0.5 rounded hover:bg-white/10 text-aether-muted hover:text-aether-text disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteFile(file.id, e)}
                          className="p-0.5 rounded hover:bg-white/10 text-aether-muted hover:text-red-400"
                          title="Delete File"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Mock Upload Progress Overlay */}
              {uploadProgress !== null && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-3 text-center">
                  <RefreshCw className="w-6 h-6 text-aether-primary animate-spin mb-1.5" />
                  <span className="text-[9px] font-mono text-aether-muted uppercase">Uploading... {uploadProgress}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main interactive viewer component */}
        {renderActiveViewer()}
      </div>

    </div>
  );
};
