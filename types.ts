
export interface User {
  id: string;
  name: string;
  avatar: string;
  badge?: string;
  badgeType?: 'admin' | 'expert' | 'vip' | 'contributor' | 'new';
  email?: string;
  points?: number;
  followedCommunities?: string[]; // ID các cộng đồng đã tham gia
  followers?: string[]; // Danh sách ID người theo dõi mình
  following?: string[]; // Danh sách ID người mình đang theo dõi
  dob?: string;
  role?: 'Bố' | 'Mẹ' | 'Khác';
  gender?: 'Nam' | 'Nữ';
  coverUrl?: string;
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
  creatorId?: string; // ID người tạo
  createdAt?: number; // Thời gian tạo
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
  linkUrl?: string; // New field for websites
  likedBy?: string[];
  isLiked?: boolean;
  communityId?: string; // ID cộng đồng nếu bài viết thuộc về nhóm
  communityName?: string; // Tên cộng đồng để hiển thị
  downloadCost?: number; // Số điểm cần để tải tài liệu (0 = miễn phí)
  visibility?: 'public' | 'private'; // Trạng thái hiển thị
}

// --- STORY TYPE ---
export interface Story {
    id: string;
    userId: string;
    user: User;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    createdAt: number;
    expiresAt: number; // Thời gian hết hạn (24h)
    viewers?: string[];
}

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  type: 'memory' | 'quiz' | 'coloring';
}

// --- CHAT TYPES ---
export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: any; // Firestore timestamp
    createdAt: number;
    isRead: boolean;
    type: 'text' | 'image' | 'story_reply';
    attachmentUrl?: string; // For images or story thumbnails
}

export interface Conversation {
    id: string;
    participantIds: string[];
    participants: User[]; // Cache user info for display
    lastMessage: string;
    lastMessageTimestamp: number;
    lastSenderId: string;
    isRead: boolean;
    unreadCount: Record<string, number>; // Map userId -> count
}

export enum ViewState {
  HOME = 'HOME',
  QNA = 'QNA',
  BLOG = 'BLOG',
  DOCS = 'DOCS',
  GAMES = 'GAMES',
  AI_ASSISTANT = 'AI_ASSISTANT',
  COMMUNITIES = 'COMMUNITIES', 
  COMMUNITY_DETAIL = 'COMMUNITY_DETAIL', 
  PROFILE = 'PROFILE',
  CHAT = 'CHAT', // New view for messaging
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface Notification {
  id: string;
  toUserId: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string;
  };
  type: 'like' | 'comment' | 'system' | 'award' | 'follow' | 'post';
  content: string;
  postId?: string;
  isRead: boolean;
  createdAt: any; 
  timestamp: number;
}