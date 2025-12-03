
import React, { useState, useRef, useEffect } from 'react';
import { Post, User, Comment } from '../types';
import { MessageCircle, Heart, Share2, Download, ExternalLink, Send, Shield, Zap, Award, Crown, Leaf, Music, ChevronRight, FileText, Loader2, Coins, Link as LinkIcon, Check, Sparkles, Wand2, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Lock } from 'lucide-react';
import Button from './Button';
import { analyzePostWithAI, generateCommentSuggestion } from '../services/openaiService';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onLikeComment?: (postId: string, commentId: string) => void;
  onDownload?: (post: Post) => void;
  onShare?: () => void;
  onUserClick?: (user: User) => void;
  onCommunityClick?: (communityId: string) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onToggleVisibility?: (postId: string, currentVisibility: 'public' | 'private') => void;
}

// Icon Zalo tự vẽ
const ZaloIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="48" height="48" rx="10" fill="#0068FF"/>
    <path d="M14 14H34V18L18 34H34V38H14V34L30 18H14V14Z" fill="white"/>
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const XIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M4 4l11.733 16h4.444L8.444 4H4z"></path><path d="M4 20l6.768-6.768m2.46-2.46L20 4"></path></svg>
);

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  // Hỗ trợ cả YouTube Shorts
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/);
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
        case 'admin': styles = "bg-red-50 text-red-600 border-red-100"; Icon = Shield; break;
        case 'expert': styles = "bg-blue-50 text-blue-600 border-blue-100"; Icon = Zap; break;
        case 'vip': styles = "bg-purple-50 text-purple-600 border-purple-100"; Icon = Crown; break;
        case 'contributor': styles = "bg-amber-50 text-amber-600 border-amber-100"; Icon = Award; break;
        default: break;
    }

    return (
        <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center border ${styles}`}>
            <Icon size={10} className="mr-1" strokeWidth={3} />
            {user.badge}
        </span>
    );
};

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onComment, onLikeComment, onDownload, onShare, onUserClick, onCommunityClick, onDelete, onEdit, onToggleVisibility }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Share Menu States
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // AI States
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingComment, setIsGeneratingComment] = useState(false);

  const isQnA = post.category === 'QnA';
  const isBlog = post.category === 'Blog';
  const isUploadedVideo = post.videoUrl && (post.videoUrl.includes('firebasestorage') || post.videoUrl.endsWith('.mp4'));
  const embedUrl = !isUploadedVideo && post.videoUrl ? getEmbedUrl(post.videoUrl) : null;
  const isOwner = currentUser?.id === post.userId;
  const isPrivate = post.visibility === 'private';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
            setShowShareMenu(false);
        }
        if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
            setShowActionMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmitComment = () => {
      if (!commentText.trim()) return;
      onComment(post.id, commentText);
      setCommentText('');
  };

  const handleShareClick = (platform: 'facebook' | 'zalo' | 'twitter' | 'copy') => {
    const url = window.location.href; 
    const text = encodeURIComponent(post.title || post.content.substring(0, 100));
    const urlEncoded = encodeURIComponent(url);

    switch (platform) {
        case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}`, '_blank'); break;
        case 'zalo': window.open(`https://zalo.me/share/?url=${urlEncoded}`, '_blank'); break;
        case 'twitter': window.open(`https://twitter.com/intent/tweet?url=${urlEncoded}&text=${text}`, '_blank'); break;
        case 'copy':
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
    }
    if (onShare) onShare();
    setShowShareMenu(false);
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!post.fileUrl || !onDownload) return;
      setIsDownloading(true);
      try { await onDownload(post); } finally { setIsDownloading(false); }
  };

  // AI Actions
  const handleAskAI = async () => {
      if (aiAnalysis) { setAiAnalysis(null); return; } // Toggle off
      setIsAnalyzing(true);
      const advice = await analyzePostWithAI(post.content);
      setAiAnalysis(advice);
      setIsAnalyzing(false);
  };

  const handleMagicComment = async () => {
      if (!currentUser) return;
      setIsGeneratingComment(true);
      const suggestion = await generateCommentSuggestion(post.content);
      setCommentText(suggestion);
      setIsGeneratingComment(false);
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
      else if (urlLower.includes('.ppt')) ext = 'PPT';
      return { name, ext };
  };
  const fileInfo = getFileDisplay();
  const downloadCost = post.downloadCost || 0;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 mb-4 font-sans relative ${isPrivate ? 'bg-gray-50' : ''}`}>
      {isPrivate && (
          <div className="absolute top-4 right-12 text-gray-400 bg-gray-200/50 px-2 py-1 rounded-full text-xs font-bold flex items-center">
              <Lock size={12} className="mr-1" /> Chỉ mình tôi
          </div>
      )}

      {/* Owner Action Menu */}
      {isOwner && (
          <div className="absolute top-4 right-4" ref={actionMenuRef}>
              <button onClick={() => setShowActionMenu(!showActionMenu)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                  <MoreHorizontal size={20} />
              </button>
              {showActionMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 p-1 min-w-[160px] z-20 animate-pop-in flex flex-col">
                      <button 
                        onClick={() => { onEdit && onEdit(post); setShowActionMenu(false); }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                          <Edit size={16} /> <span>Chỉnh sửa</span>
                      </button>
                      <button 
                        onClick={() => { onToggleVisibility && onToggleVisibility(post.id, post.visibility || 'public'); setShowActionMenu(false); }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                          {isPrivate ? <><Eye size={16} /> <span>Công khai</span></> : <><EyeOff size={16} /> <span>Chỉ mình tôi</span></>}
                      </button>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button 
                        onClick={() => { onDelete && onDelete(post.id); setShowActionMenu(false); }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-bold"
                      >
                          <Trash2 size={16} /> <span>Xóa bài viết</span>
                      </button>
                  </div>
              )}
          </div>
      )}

      <div className="flex items-center mb-3 pr-8">
        <div className="relative cursor-pointer" onClick={() => onUserClick && onUserClick(post.user)}>
            <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-primary-50 p-0.5 hover:scale-105 transition-transform" />
             {post.user.badgeType === 'admin' && (
                <div className="absolute -bottom-1 -right-0 bg-red-500 text-white rounded-full p-0.5 border-2 border-white mr-3"><Shield size={10} fill="currentColor" /></div>
            )}
        </div>
        
        <div>
          <div className="flex items-center flex-wrap">
            <h4 className="font-bold text-gray-800 text-sm hover:text-primary-600 transition-colors cursor-pointer font-heading" onClick={() => onUserClick && onUserClick(post.user)}>
                {post.user.name}
            </h4>
            {post.communityName && post.communityId && (
                <div className="flex items-center text-gray-800 text-sm group">
                    <span className="mx-1 text-gray-400 text-xs"><ChevronRight size={14} strokeWidth={3} /></span>
                    <span className="font-bold hover:text-primary-600 hover:underline cursor-pointer transition-colors font-heading" onClick={() => onCommunityClick && onCommunityClick(post.communityId!)}>
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
          <h3 className={`font-bold text-gray-900 mb-2 leading-tight font-heading ${isQnA ? 'text-lg text-primary-600' : 'text-xl'}`}>
            {isQnA && <span className="mr-2 inline-block bg-primary-100 text-primary-600 rounded px-1.5 py-0.5 text-sm align-middle font-heading">Q</span>}
            {post.title}
          </h3>
      )}

      <p className={`text-gray-600 mb-4 text-sm leading-relaxed whitespace-pre-line ${isBlog ? '' : 'line-clamp-5'}`}>
        {post.content}
      </p>

      {/* Media Rendering */}
      {isUploadedVideo && (
          <div className="mb-4 rounded-xl overflow-hidden w-full bg-black shadow-sm">
              <video src={post.videoUrl} className="w-full max-h-[500px]" controls preload="metadata" />
          </div>
      )}
      {!isUploadedVideo && embedUrl && (
          <div className="mb-4 rounded-xl overflow-hidden w-full aspect-video bg-black shadow-sm">
              <iframe 
                src={embedUrl} 
                className="w-full h-full" 
                title="Video Content" 
                allowFullScreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                style={{ border: 0 }}
              ></iframe>
          </div>
      )}
      {post.audioUrl && (
          <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center">
               <div className="w-10 h-10 bg-white text-purple-600 rounded-full flex items-center justify-center mr-3 shadow-sm animate-pulse"><Music size={20} /></div>
               <div className="flex-1">
                   <p className="text-xs font-bold text-purple-700 mb-1 font-heading">File ghi âm / Nhạc</p>
                   <audio src={post.audioUrl} controls className="w-full h-8" />
               </div>
          </div>
      )}
      {post.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden max-h-96 w-full shadow-sm bg-gray-50 flex items-center justify-center cursor-pointer" onClick={() => window.open(post.imageUrl, '_blank')}>
            <img src={post.imageUrl} alt="Post content" className="max-w-full max-h-96 object-contain hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      {post.linkUrl && !embedUrl && (
          <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="block mb-4 group no-underline">
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:bg-gray-100 transition-colors flex items-center">
                  <div className="h-full bg-gray-200 w-24 flex items-center justify-center shrink-0 self-stretch">
                      <LinkIcon className="text-gray-400 group-hover:text-blue-500 transition-colors" size={24} />
                  </div>
                  <div className="p-3 overflow-hidden">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">{(() => { try { return new URL(post.linkUrl).hostname.replace('www.', ''); } catch { return 'Link'; } })()}</p>
                      <p className="font-bold text-blue-600 text-sm truncate font-heading group-hover:underline">{post.linkUrl}</p>
                  </div>
              </div>
          </a>
      )}

      {(post.category === 'Document' || post.fileUrl) && (
         <div className="mb-4 p-3 bg-secondary-50 rounded-lg flex items-center justify-between border border-secondary-100 group hover:bg-secondary-100 transition-colors">
            <div className="flex items-center overflow-hidden">
                <div className="bg-white p-2.5 rounded-lg text-secondary-600 mr-3 shadow-sm group-hover:scale-110 transition-transform shrink-0"><FileText size={24} /></div>
                <div className="min-w-0">
                    <p className="font-bold text-secondary-800 text-sm truncate pr-2 font-heading">{fileInfo.name}</p>
                    <div className="flex items-center space-x-2">
                        <p className="text-secondary-500 text-xs uppercase font-bold">{fileInfo.ext}</p>
                        <span className="text-gray-300 text-xs">|</span>
                        {downloadCost === 0 ? <span className="text-green-600 text-xs font-bold bg-green-100 px-1.5 rounded">Miễn phí</span> : <span className="text-orange-500 text-xs font-bold bg-orange-100 px-1.5 rounded flex items-center"><Coins size={10} className="mr-0.5"/> {downloadCost} điểm</span>}
                    </div>
                </div>
            </div>
            {post.fileUrl && (
                <button type="button" onClick={handleDownloadClick} disabled={isDownloading} className="shrink-0 text-sm font-bold text-secondary-600 hover:text-secondary-700 hover:bg-white bg-white/80 px-3 py-1.5 rounded-full shadow-sm flex items-center transition-all active:scale-95 disabled:opacity-50 font-heading">
                    {isDownloading ? <Loader2 size={14} className="animate-spin mr-1" /> : <Download size={14} className="mr-1" />}
                    {isDownloading ? 'Đang tải...' : (downloadCost === 0 ? 'Tải về' : `Tải (-${downloadCost}đ)`)}
                </button>
            )}
         </div>
      )}
      
      {/* AI Analysis Result */}
      {aiAnalysis && (
          <div className="mb-4 bg-violet-50 rounded-xl p-4 border border-violet-100 relative animate-pop-in">
              <div className="absolute -top-3 left-4 bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-sm">
                  <Sparkles size={10} className="mr-1" /> Lời khuyên từ AI
              </div>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">{aiAnalysis}</p>
          </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-50 relative">
        <div className="flex space-x-2">
            {post.tags.map(tag => (
                <span key={tag} className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-[10px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer hover:scale-105 inline-block">#{tag}</span>
            ))}
        </div>
        <div className="flex items-center space-x-3 text-gray-500 text-sm">
            {/* Ask AI Button */}
            <button 
                onClick={handleAskAI}
                className={`flex items-center p-2 rounded-full transition-all active:scale-90 ${isAnalyzing ? 'bg-violet-100 text-violet-600' : 'hover:bg-violet-50 hover:text-violet-600'}`}
                title="Hỏi AI về bài viết này"
                disabled={isAnalyzing}
            >
                {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span className="hidden sm:inline ml-1 font-medium text-xs">AI</span>
            </button>

            <button onClick={() => onLike(post.id)} className={`flex items-center space-x-1.5 transition-colors group active:scale-95 ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}>
                <div className={`p-1.5 rounded-full transition-transform ${post.isLiked ? 'bg-pink-50 scale-110' : 'group-hover:bg-pink-50 group-hover:scale-110'}`}>
                   <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} className={post.isLiked ? "animate-heartbeat" : ""} />
                </div>
                <span className="font-medium">{post.likes}</span>
            </button>
            <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1.5 hover:text-blue-500 transition-colors group active:scale-95">
                <div className="p-1.5 rounded-full group-hover:bg-blue-50 group-hover:scale-110 transition-transform"><MessageCircle size={18} /></div>
                <span className="font-medium">{post.comments.length}</span>
            </button>
             
            {/* Share Button & Menu */}
            <div className="relative" ref={shareMenuRef}>
                <button onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center space-x-1.5 hover:text-green-500 transition-colors group active:scale-95">
                    <div className="p-1.5 rounded-full group-hover:bg-green-50 group-hover:scale-110 transition-transform"><Share2 size={18} /></div>
                </button>
                {showShareMenu && (
                    <div className="absolute right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[180px] z-20 animate-pop-in flex flex-col space-y-1 origin-bottom-right">
                        <button onClick={() => handleShareClick('facebook')} className="flex items-center space-x-3 w-full p-2 hover:bg-blue-50 rounded-lg text-left text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"><FacebookIcon /> <span>Facebook</span></button>
                        <button onClick={() => handleShareClick('zalo')} className="flex items-center space-x-3 w-full p-2 hover:bg-blue-50 rounded-lg text-left text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"><ZaloIcon /> <span>Zalo</span></button>
                        <button onClick={() => handleShareClick('twitter')} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-100 rounded-lg text-left text-sm font-medium text-gray-700 hover:text-black transition-colors"><XIcon /> <span>X (Twitter)</span></button>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button onClick={() => handleShareClick('copy')} className="flex items-center space-x-3 w-full p-2 hover:bg-gray-100 rounded-lg text-left text-sm font-medium text-gray-700 transition-colors">
                            {copied ? <Check size={18} className="text-green-500" /> : <LinkIcon size={18} className="text-gray-500" />} <span>{copied ? 'Đã sao chép!' : 'Sao chép link'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in-up">
              <div className="space-y-4 mb-5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {post.comments.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm italic py-2">Chưa có bình luận nào.</p>
                  ) : (
                      post.comments.map(comment => (
                          <div key={comment.id} className="flex gap-2.5 animate-fade-in">
                              <img src={comment.user.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                              <div className="flex-1">
                                  <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 shadow-sm border border-gray-100/50">
                                      <div className="flex items-center mb-1">
                                         <p className="font-bold text-gray-800 text-xs mr-2 font-heading">{comment.user.name}</p>
                                         {comment.user.badgeType === 'admin' && <Shield size={10} className="text-red-500" fill="currentColor"/>}
                                      </div>
                                      <p className="text-gray-700 text-sm">{comment.content}</p>
                                  </div>
                                  <div className="flex items-center mt-1 ml-2 space-x-3">
                                      <span className="text-gray-400 text-[10px]">{comment.createdAt}</span>
                                      <button onClick={() => onLikeComment && onLikeComment(post.id, comment.id)} className={`text-[10px] font-bold flex items-center space-x-1 transition-colors active:scale-95 ${isCommentLiked(comment) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}>
                                          {isCommentLiked(comment) ? 'Đã thích' : 'Thích'}
                                          {(comment.likedBy?.length || 0) > 0 && <span className="ml-0.5 flex items-center"><Heart size={8} fill="currentColor" className="ml-1"/> {comment.likedBy?.length}</span>}
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
                            className="w-full bg-gray-100 border-none rounded-full pl-4 pr-16 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all"
                        />
                        {/* Magic Comment Button */}
                        <button 
                            onClick={handleMagicComment}
                            disabled={isGeneratingComment}
                            className="absolute right-9 top-1/2 transform -translate-y-1/2 text-violet-500 hover:text-violet-600 p-1.5 rounded-full hover:bg-violet-50 transition-colors active:scale-90"
                            title="AI gợi ý bình luận"
                        >
                            {isGeneratingComment ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        </button>
                        <button onClick={handleSubmitComment} disabled={!commentText.trim()} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-600 disabled:text-gray-300 p-1.5 rounded-full hover:bg-primary-50 transition-colors active:scale-90">
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