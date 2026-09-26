export interface DocComment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  highlightedText: string;
}

export interface DocumentState {
  html: string;
  zoom: number; // 50 to 200
  viewMode: 'draft' | 'print' | 'focus';
  rulerVisible: boolean;
  comments: DocComment[];
}
