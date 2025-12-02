import React, { useState } from 'react';
import { Post, User } from '../types';
import { MessageCircle, Heart, Share2, Download, ExternalLink, Send, Shield, Zap, Award, Crown, Leaf } from 'lucide-react';
import Button from './Button';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
}

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Facebook
  if (url.includes('facebook.com') && (url.includes('/videos/') || url.includes('/watch/'))) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
  }
  return null;
};

const UserBadge = ({ user }: { user: User }) => {
    if (!user.badge) return null;

    let styles = "bg-gray-100 text-gray-600 border-gray-200";
    let Icon = Leaf;

    switch (user.badgeType) {
        case 'admin':
            styles = "bg-red-50 text-red-600 border-red-100";
            Icon = Shield;
            break;
        case 'expert':
            styles = "bg-blue-50 text-blue-600 border-blue-100";
            Icon = Zap; // Or Stethoscope if available, Zap for efficiency
            break;
        case 'vip':
            styles = "bg-purple-50 text-purple-600 border-purple-100";
            Icon = Crown;
            break;
        case 'contributor':
            styles = "bg-amber-50 text-amber-600 border-amber-100";
            Icon = Award;
            break;
        case 'new':
            styles = "bg-green-50 text-green-600 border-green-100";
            Icon = Leaf;
            break;
        default:
            // Fallback for custom badges without type
            break;
    }

    return (
        <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center border ${styles}`}>
            <Icon size={10} className="mr-1" strokeWidth={3} />
            {user.badge}
        </span>
    );
};

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isQnA = post.category === 'QnA';
  const isBlog = post.category === 'Blog';
  const embedUrl = post.videoUrl ? getEmbedUrl(post.videoUrl) : null;

  const handleSubmitComment = () => {
      if (!commentText.trim()) return;
      onComment(post.id, commentText);
      setCommentText('');
  };

  const handleInteract = (action: 'like' | 'comment') => {
      if (action === 'like') {
          onLike(post.id);
      } else {
          setShowComments(!showComments);
      }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow mb-4">
      {/* Header */}
      <div className="flex items-center mb-3">
        <div className="relative">
            <img 
            src={post.user.avatar} 
            alt={post.user.name} 
            className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-primary-50 p-0.5"
            />
             {post.user.badgeType === 'admin' && (
                <div className="absolute -bottom-1 -right-0 bg-red-500 text-white rounded-full p-0.5 border-2 border-white mr-3" title="Admin">
                    <Shield size={10} fill="currentColor" />
                </div>
            )}
        </div>
        
        <div>
          <div className="flex items-center flex-wrap">
            <h4 className="font-bold text-gray-800 text-sm hover:text-primary-600 transition-colors cursor-pointer">{post.user.name}</h4>
            <UserBadge user={post.user} />
          </div>
          <p className="text-gray-400 text-xs mt-0.5 flex items-center">
             {post.createdAt} • <span className="ml-1 font-medium text-gray-500">{post.category}</span>
          </p>
        </div>
      </div>

      {/* Title */}
      {post.title && (
          <h3 className={`font-bold text-gray-900 mb-2 leading-tight ${isQnA ? 'text-lg text-primary-600' : 'text-xl'}`}>
            {isQnA && <span className="mr-2 inline-block bg-primary-100 text-primary-600 rounded px-1.5 py-0.5 text-sm align-middle">Q</span>}
            {post.title}
          </h3>
      )}

      {/* Content */}
      <p className={`text-gray-600 mb-4 text-sm leading-relaxed whitespace-pre-line ${isBlog ? '' : 'line-clamp-5'}`}>
        {post.content}
      </p>

      {/* Media: Video */}
      {post.videoUrl && embedUrl && (
          <div className="mb-4 rounded-xl overflow-hidden w-full aspect-video bg-black shadow-sm">
              <iframe 
                src={embedUrl} 
                className="w-full h-full" 
                title="Video Content"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ border: 0 }}
              ></iframe>
          </div>
      )}
      {post.videoUrl && !embedUrl && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="truncate flex-1 mr-2 text-blue-600 text-sm">
                  <ExternalLink size={16} className="inline mr-1" />
                  <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {post.videoUrl}
                  </a>
              </div>
          </div>
      )}

      {/* Media: Image */}
      {post.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden max-h-96 w-full shadow-sm">
            <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Document Attachment */}
      {post.category === 'Document' && (
         <div className="mb-4 p-3 bg-secondary-50 rounded-lg flex items-center justify-between border border-secondary-100 group cursor-pointer hover:bg-secondary-100 transition-colors">
            <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg text-secondary-600 mr-3 shadow-sm group-hover:scale-110 transition-transform">
                    <Download size={20} />
                </div>
                <div>
                    <p className="font-bold text-secondary-800 text-sm">Tài liệu đính kèm</p>
                    <p className="text-secondary-500 text-xs">PDF • 2.4 MB</p>
                </div>
            </div>
            <button className="text-sm font-bold text-secondary-600 hover:text-secondary-700 bg-white px-3 py-1.5 rounded-full shadow-sm">Tải về</button>
         </div>
      )}

      {/* Footer: Tags & Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex space-x-2">
            {post.tags.map(tag => (
                <span key={tag} className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-[10px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer">#{tag}</span>
            ))}
        </div>
        <div className="flex items-center space-x-4 text-gray-500 text-sm">
            <button 
                onClick={() => handleInteract('like')}
                className={`flex items-center space-x-1.5 transition-colors group ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
                <div className={`p-1.5 rounded-full ${post.isLiked ? 'bg-pink-50' : 'group-hover:bg-pink-50'}`}>
                   <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} className={post.isLiked ? "animate-heartbeat" : ""} />
                </div>
                <span className="font-medium">{post.likes}</span>
            </button>
            <button 
                onClick={() => handleInteract('comment')}
                className="flex items-center space-x-1.5 hover:text-blue-500 transition-colors group"
            >
                <div className="p-1.5 rounded-full group-hover:bg-blue-50">
                    <MessageCircle size={18} />
                </div>
                <span className="font-medium">{post.comments.length}</span>
            </button>
             <button className="flex items-center space-x-1.5 hover:text-green-500 transition-colors group">
                <div className="p-1.5 rounded-full group-hover:bg-green-50">
                    <Share2 size={18} />
                </div>
            </button>
        </div>
      </div>

      {/* Comment Section */}
      {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
              {/* Existing Comments */}
              <div className="space-y-4 mb-5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {post.comments.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm italic py-2">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                  ) : (
                      post.comments.map(comment => (
                          <div key={comment.id} className="flex gap-2.5">
                              <img src={comment.user.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                              <div className="flex-1">
                                  <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 shadow-sm border border-gray-100/50">
                                      <div className="flex items-center mb-1">
                                         <p className="font-bold text-gray-800 text-xs mr-2">{comment.user.name}</p>
                                         {comment.user.badgeType === 'admin' && <Shield size={10} className="text-red-500" fill="currentColor"/>}
                                      </div>
                                      <p className="text-gray-700 text-sm">{comment.content}</p>
                                  </div>
                                  <div className="flex items-center mt-1 ml-2 space-x-3">
                                      <span className="text-gray-400 text-[10px]">{comment.createdAt}</span>
                                      <button className="text-gray-400 text-[10px] font-bold hover:text-gray-600">Thích</button>
                                      <button className="text-gray-400 text-[10px] font-bold hover:text-gray-600">Phản hồi</button>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>

              {/* Add Comment Input */}
              {currentUser ? (
                  <div className="flex gap-2 items-center">
                      <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                      <div className="flex-1 relative group">
                        <input 
                            type="text" 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                            placeholder="Viết bình luận..." 
                            className="w-full bg-gray-100 border-none rounded-full pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all"
                        />
                        <button 
                            onClick={handleSubmitComment}
                            disabled={!commentText.trim()}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-600 disabled:text-gray-300 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                      </div>
                  </div>
              ) : (
                   <div className="bg-gray-50 rounded-xl p-3 flex justify-center items-center">
                        <span className="text-sm text-gray-500 mr-3">Bạn cần đăng nhập để bình luận</span>
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-8 px-3"
                            onClick={() => onComment(post.id, '')} // This will trigger the auth check in App.tsx
                        >
                            Đăng nhập
                        </Button>
                   </div>
              )}
          </div>
      )}
    </div>
  );
};

export default PostCard;