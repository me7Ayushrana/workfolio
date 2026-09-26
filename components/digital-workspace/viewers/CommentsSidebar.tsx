import React, { useState } from 'react';
import type { DocComment } from '@/lib/digital-workspace/types/document';
import { MessageSquare, CheckCircle2, User } from 'lucide-react';

interface CommentsSidebarProps {
  comments: DocComment[];
  onAddComment: (text: string) => void;
  onDeleteComment: (id: string) => void;
  activeSelectionText: string;
}

export const CommentsSidebar: React.FC<CommentsSidebarProps> = ({
  comments,
  onAddComment,
  onDeleteComment,
  activeSelectionText
}) => {
  const [newCommentText, setNewCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText);
    setNewCommentText('');
  };

  return (
    <div className="w-64 border-l border-aether-border/10 bg-black/30 flex flex-col min-h-0 select-none">
      
      {/* Title */}
      <div className="px-3 py-2 bg-black/20 border-b border-aether-border/10 flex items-center gap-2 text-[10px] uppercase font-bold text-aether-primary">
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Document Comments</span>
        <span className="ml-auto bg-aether-primary/20 text-aether-primary px-1.5 py-0.2 rounded-full font-mono font-bold text-[9px]">
          {comments.length}
        </span>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scrollbar-thin">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-aether-muted text-[10px] italic">
            No comments yet. Highlight text and click comment icon to add.
          </div>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="p-3 bg-aether-surface/45 border border-aether-border/10 rounded flex flex-col gap-2 relative group hover:border-aether-primary/25 transition-all text-[11px]"
            >
              {/* Highlighted text preview */}
              {comment.highlightedText && (
                <div className="bg-amber-500/10 border-l-2 border-amber-500 pl-2 py-0.5 text-[9px] text-amber-300 italic truncate max-w-full">
                  "{comment.highlightedText}"
                </div>
              )}

              {/* Comment Header */}
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-aether-primary/10 border border-aether-primary/25 flex items-center justify-center text-aether-primary">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-aether-text truncate">{comment.author}</span>
                <span className="text-[8px] text-aether-muted font-mono ml-auto">
                  {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Comment Text */}
              <p className="text-aether-muted leading-relaxed break-words">{comment.text}</p>

              {/* Resolve/Delete Button */}
              <button 
                onClick={() => onDeleteComment(comment.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-aether-muted hover:text-green-400 hover:bg-white/5 rounded"
                title="Resolve Comment"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Section */}
      <div className="p-3 border-t border-aether-border/10 bg-black/20">
        {activeSelectionText ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="text-[9px] text-aether-muted leading-snug">
              Commenting on: <strong className="text-aether-text truncate block max-w-full italic">"{activeSelectionText}"</strong>
            </div>
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add your comment..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-aether-text focus:outline-none focus:border-aether-primary placeholder-aether-muted/50 resize-none font-sans"
            />
            <button 
              type="submit" 
              className="py-1 bg-aether-primary hover:bg-aether-primary-hover rounded text-[10px] font-bold text-white text-center transition-colors shadow-lg shadow-aether-primary/10"
            >
              Add Comment
            </button>
          </form>
        ) : (
          <div className="text-center py-2 text-aether-muted text-[10px]">
            Highlight text in document to comment on it.
          </div>
        )}
      </div>

    </div>
  );
};
