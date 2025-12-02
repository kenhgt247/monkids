export interface User {
  id: string;
  name: string;
  avatar: string;
  badge?: string;
  badgeType?: 'admin' | 'expert' | 'vip' | 'contributor' | 'new';
  email?: string;
  points?: number;
  followedCommunities?: string[]; // ID các cộng đồng đã tham gia
}

export interface Community {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  avatarUrl: string;
  memberCount: number;
  members: string[]; // Danh sách ID thành viên
  tags: string[];
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
  likedBy?: string[];
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
  timestamp?: number;
  imageUrl?: string; 
  fileUrl?: string; 
  videoUrl?: string; 
  audioUrl?: string;
  likedBy?: string[];
  isLiked?: boolean;
  communityId?: string; // ID cộng đồng nếu bài viết thuộc về nhóm
  communityName?: string; // Tên cộng đồng để hiển thị
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
  COMMUNITIES = 'COMMUNITIES', // Danh sách tất cả cộng đồng
  COMMUNITY_DETAIL = 'COMMUNITY_DETAIL', // Xem chi tiết 1 cộng đồng
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}