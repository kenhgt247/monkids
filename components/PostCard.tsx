
import React, { useState } from 'react';
import { Post, User, Comment } from '../types';
import { MessageCircle, Heart, Share2, Download, ExternalLink, Send, Shield, Zap, Award, Crown, Leaf, Music, ChevronRight, FileText, Loader2, Coins } from 'lucide-react';
import Button from './Button';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onLikeComment?: (postId: string, commentId: string) => void;
  onDownload?: (post: Post) => void; // Thay đổi để nhận cả object Post
  onShare?: () => void;
  onUserClick?: (user: User) => void;
  onCommunityClick?: (communityId: string) => void;
}

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
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
            Icon = Zap;
            break;
        case 'vip':
            styles = "bg-purple-50 text-purple-600 border-purple-100";
            Icon = Crown;
            break;
        case 'contributor':
            styles = "bg-amber-50 text-amber-600 border-amber-100";
            Icon = Award;
            break;
        default:
            break;
    }

    return (
        <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center border ${styles}`}>
            <Icon size={10} className="mr-1" strokeWidth={3} />
            {user.badge}
        </span>
    );
};

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onComment, onLikeComment, onDownload, onShare, onUserClick, onCommunityClick }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const isQnA = post.category === 'QnA';
  const isBlog = post.category === 'Blog';
  
  const isUploadedVideo = post.videoUrl && (post.videoUrl.includes('firebasestorage') || post.videoUrl.endsWith('.mp4'));
  const embedUrl = !isUploadedVideo && post.videoUrl ? getEmbedUrl(post.videoUrl) : null;

  const handleSubmitComment = () => {
      if (!commentText.trim()) return;
      onComment(post.id, commentText);
      setCommentText('');
  };

  const handleShare = async () => {
    if (onShare) onShare();
    const shareData = {
        title: post.title || 'Bài viết trên Mom & Kids',
        text: post.content.substring(0, 100),
        url: window.location.href 
    };
    try {
        if (navigator.share) await navigator.share(shareData);
        else window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    } catch (err) { console.log('Error sharing:', err); }
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!post.fileUrl || !onDownload) return;
      
      setIsDownloading(true);
      try {
        await onDownload(post);
      } finally {
        setIsDownloading(false);
      }
  };

  const isCommentLiked = (comment: Comment) => currentUser && comment.likedBy?.includes(currentUser.id);

  const getFileDisplay = () => {
      if (!post.fileUrl) return { name: 'Tài liệu đính kèm', ext: 'FILE' };
      const urlLower = post.fileUrl.toLowerCase();
      let name = post.title || 'Tài liệu tải xuống';
      let ext = 'FILE';
      
      if (urlLower.includes('.pdf')) ext = 'PDF';
      else if (urlLower.includes('.doc')) ext = 'DOC';
      else if (urlLower.includes('.xls')) ext = 'XLS';
      
      return { name, ext };
  };
  const fileInfo = getFileDisplay();
  const downloadCost = post.downloadCost || 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow mb-4">
      <div className="flex items-center mb-3">
        <div className="relative cursor-pointer" onClick={() => onUserClick && onUserClick(post.user)}>
            <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-primary-50 p-0.5" />
             {post.user.badgeType === 'admin' && (
                <div className="absolute -bottom-1 -right-0 bg-red-500 text-white rounded-full p-0.5 border-2 border-white mr-3"><Shield size={10} fill="currentColor" /></div>
            )}
        </div>
        
        <div>
          <div className="flex items-center flex-wrap">
            <h4 
                className="font-bold text-gray-800 text-sm hover:text-primary-600 transition-colors cursor-pointer"
                onClick={() => onUserClick && onUserClick(post.user)}
            >
                {post.user.name}
            </h4>
            
            {post.communityName && post.communityId && (
                <div className="flex items-center text-gray-800 text-sm group">
                    <span className="mx-1 text-gray-400 text-xs"><ChevronRight size={14} strokeWidth={3} /></span>
                    <span 
                        className="font-bold hover:text-primary-600 hover:underline cursor-pointer transition-colors"
                        onClick={() => onCommunityClick && onCommunityClick(post.communityId!)}
                    >
                        {post.communityName}
                    </span>
                </div>
            )}
            <UserBadge user={post.user} />
          </div>
          <p className="text-gray-400 text-xs mt-0.5 flex items-center">
             {post.createdAt} • <span className="ml-1 font-medium text-gray-500">{post.category}</span>
          </p>
        </div>
      </div>

      {post.title && (
          <h3 className={`font-bold text-gray-900 mb-2 leading-tight ${isQnA ? 'text-lg text-primary-600' : 'text-xl'}`}>
            {isQnA && <span className="mr-2 inline-block bg-primary-100 text-primary-600 rounded px-1.5 py-0.5 text-sm align-middle">Q</span>}
            {post.title}
          </h3>
      )}

      <p className={`text-gray-600 mb-4 text-sm leading-relaxed whitespace-pre-line ${isBlog ? '' : 'line-clamp-5'}`}>
        {post.content}
      </p>

      {isUploadedVideo && (
          <div className="mb-4 rounded-xl overflow-hidden w-full bg-black shadow-sm">
              <video src={post.videoUrl} className="w-full max-h-[500px]" controls preload="metadata" />
          </div>
      )}

      {!isUploadedVideo && embedUrl && (
          <div className="mb-4 rounded-xl overflow-hidden w-full aspect-video bg-black shadow-sm">
              <iframe src={embedUrl} className="w-full h-full" title="Video Content" allowFullScreen style={{ border: 0 }}></iframe>
          </div>
      )}
      
      {post.audioUrl && (
          <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center">
               <div className="w-10 h-10 bg-white text-purple-600 rounded-full flex items-center justify-center mr-3 shadow-sm"><Music size={20} /></div>
               <div className="flex-1">
                   <p className="text-xs font-bold text-purple-700 mb-1">File ghi âm / Nhạc</p>
                   <audio src={post.audioUrl} controls className="w-full h-8" />
               </div>
          </div>
      )}

      {post.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden max-h-96 w-full shadow-sm bg-gray-50 flex items-center justify-center">
            <img src={post.imageUrl} alt="Post content" className="max-w-full max-h-96 object-contain" />
        </div>
      )}

      {(post.category === 'Document' || post.fileUrl) && (
         <div 
            className="mb-4 p-3 bg-secondary-50 rounded-lg flex items-center justify-between border border-secondary-100 group hover:bg-secondary-100 transition-colors"
         >
            <div className="flex items-center overflow-hidden">
                <div className="bg-white p-2.5 rounded-lg text-secondary-600 mr-3 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                    <FileText size={24} />
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-secondary-800 text-sm truncate pr-2">{fileInfo.name}</p>
                    <div className="flex items-center space-x-2">
                        <p className="text-secondary-500 text-xs uppercase font-bold">{fileInfo.ext}</p>
                        <span className="text-gray-300 text-xs">|</span>
                        {downloadCost === 0 ? (
                            <span className="text-green-600 text-xs font-bold bg-green-100 px-1.5 rounded">Miễn phí</span>
                        ) : (
                            <span className="text-orange-500 text-xs font-bold bg-orange-100 px-1.5 rounded flex items-center"><Coins size={10} className="mr-0.5"/> {downloadCost} điểm</span>
                        )}
                    </div>
                </div>
            </div>
            {post.fileUrl && (
                <button 
                    type="button"
                    onClick={handleDownloadClick}
                    disabled={isDownloading}
                    className="shrink-0 text-sm font-bold text-secondary-600 hover:text-secondary-700 hover:bg-white bg-white/80 px-3 py-1.5 rounded-full shadow-sm flex items-center transition-all active:scale-95 disabled:opacity-50"
                >
                    {isDownloading ? (
                        <Loader2 size={14} className="animate-spin mr-1" />
                    ) : (
                        <Download size={14} className="mr-1" />
                    )}
                    {isDownloading ? 'Đang tải...' : (downloadCost === 0 ? 'Tải về' : `Tải (-${downloadCost}đ)`)}
                </button>
            )}
         </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex space-x-2">
            {post.tags.map(tag => (
                <span key={tag} className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-[10px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer">#{tag}</span>
            ))}
        </div>
        <div className="flex items-center space-x-4 text-gray-500 text-sm">
            <button 
                onClick={() => onLike(post.id)}
                className={`flex items-center space-x-1.5 transition-colors group ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
            >
                <div className={`p-1.5 rounded-full ${post.isLiked ? 'bg-pink-50' : 'group-hover:bg-pink-50'}`}>
                   <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} className={post.isLiked ? "animate-heartbeat" : ""} />
                </div>
                <span className="font-medium">{post.likes}</span>
            </button>
            <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1.5 hover:text-blue-500 transition-colors group">
                <div className="p-1.5 rounded-full group-hover:bg-blue-50"><MessageCircle size={18} /></div>
                <span className="font-medium">{post.comments.length}</span>
            </button>
             <button onClick={handleShare} className="flex items-center space-x-1.5 hover:text-green-500 transition-colors group">
                <div className="p-1.5 rounded-full group-hover:bg-green-50"><Share2 size={18} /></div>
            </button>
        </div>
      </div>

      {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
              <div className="space-y-4 mb-5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {post.comments.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm italic py-2">Chưa có bình luận nào.</p>
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
                                      <button 
                                        onClick={() => onLikeComment && onLikeComment(post.id, comment.id)}
                                        className={`text-[10px] font-bold flex items-center space-x-1 transition-colors ${isCommentLiked(comment) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                                      >
                                          {isCommentLiked(comment) ? 'Đã thích' : 'Thích'}
                                          {(comment.likedBy?.length || 0) > 0 && (
                                              <span className="ml-0.5 flex items-center"><Heart size={8} fill="currentColor" className="ml-1"/> {comment.likedBy?.length}</span>
                                          )}
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>

              {currentUser ? (
                  <div className="flex gap-2 items-center">
                      <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                      <div className="flex-1 relative group">
                        <input 
                            type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                            placeholder="Viết bình luận..." 
                            className="w-full bg-gray-100 border-none rounded-full pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all"
                        />
                        <button onClick={handleSubmitComment} disabled={!commentText.trim()} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-600 disabled:text-gray-300 p-1.5 rounded-full hover:bg-primary-50 transition-colors">
                            <Send size={16} />
                        </button>
                      </div>
                  </div>
              ) : (
                   <div className="bg-gray-50 rounded-xl p-3 flex justify-center items-center">
                        <span className="text-sm text-gray-500 mr-3">Bạn cần đăng nhập để bình luận</span>
                        <Button size="sm" variant="outline" className="text-xs h-8 px-3" onClick={() => onComment(post.id, '')}>Đăng nhập</Button>
                   </div>
              )}
          </div>
      )}
    </div>
  );
};

export default PostCard;
