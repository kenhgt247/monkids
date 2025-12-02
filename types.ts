export interface User {
  id: string;
  name: string;
  avatar: string;
  badge?: string;
  badgeType?: 'admin' | 'expert' | 'vip' | 'contributor' | 'new';
  email?: string;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  title?: string;
  content: string;
  category: 'QnA' | 'Blog' | 'Document' | 'Game' | 'Status';
  tags: string[];
  likes: number;
  comments: Comment[];
  createdAt: string;
  imageUrl?: string; 
  fileUrl?: string; 
  videoUrl?: string; 
  isLiked?: boolean; // Track if current user liked it
}

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  type: 'memory' | 'quiz' | 'coloring';
}

export enum ViewState {
  HOME = 'HOME',
  QNA = 'QNA',
  BLOG = 'BLOG',
  DOCS = 'DOCS',
  GAMES = 'GAMES',
  AI_ASSISTANT = 'AI_ASSISTANT',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}