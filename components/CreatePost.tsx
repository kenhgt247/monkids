import React, { useState } from 'react';
import { User, Post } from '../types';
import { Image, Video, FileText, Smile, Send, HelpCircle, PenTool } from 'lucide-react';
import Button from './Button';

interface CreatePostProps {
  currentUser: User;
  onPost: (content: string, title?: string, imageUrl?: string, videoUrl?: string, category?: Post['category']) => void;
}

type PostMode = 'status' | 'qna' | 'blog' | 'media';

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPost }) => {
  const [mode, setMode] = useState<PostMode>('status');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (!content.trim() && !mediaUrl.trim()) return;
    
    let category: Post['category'] = 'Status';
    let finalImageUrl = undefined;
    let finalVideoUrl = undefined;

    if (mode === 'blog') category = 'Blog';
    if (mode === 'qna') category = 'QnA';
    
    // Simple naive check for video URL
    if (mediaUrl.trim()) {
         if (mediaUrl.includes('youtube') || mediaUrl.includes('youtu.be') || mediaUrl.includes('facebook') || mediaUrl.includes('tiktok')) {
            finalVideoUrl = mediaUrl;
        } else {
            finalImageUrl = mediaUrl;
        }
    }

    onPost(content, title, finalImageUrl, finalVideoUrl, category);
    
    // Reset form
    setContent('');
    setTitle('');
    setMediaUrl('');
    setMode('status');
    setIsExpanded(false);
  };

  const switchMode = (newMode: PostMode) => {
    setMode(newMode);
    setIsExpanded(true);
  };

  const getPlaceholder = () => {
      if (mode === 'qna') return "Đặt câu hỏi cho cộng đồng các mẹ...";
      if (mode === 'blog') return "Viết nội dung chia sẻ...";
      return `${currentUser.name} ơi, bạn đang nghĩ gì thế?`;
  }

  const getTitlePlaceholder = () => {
      if (mode === 'qna') return "Tiêu đề câu hỏi (Ví dụ: Bé bị ho phải làm sao?)";
      if (mode === 'blog') return "Tiêu đề bài chia sẻ";
      return "";
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      {/* Top Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button 
            onClick={() => switchMode('status')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors ${mode === 'status' ? 'bg-white text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 hover:bg-gray-100'}`}
          >
              <PenTool size={16} /> <span>Tạo bài viết</span>
          </button>
          <button 
            onClick={() => switchMode('qna')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors ${mode === 'qna' ? 'bg-white text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}
          >
              <HelpCircle size={16} /> <span>Hỏi đáp</span>
          </button>
          <button 
            onClick={() => switchMode('blog')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors ${mode === 'blog' ? 'bg-white text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:bg-gray-100'}`}
          >
              <FileText size={16} /> <span>Góc chia sẻ</span>
          </button>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
            <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-10 h-10 rounded-full border border-gray-200 object-cover mt-1"
            />
            <div className="flex-1 space-y-3">
                {!isExpanded && (
                    <div 
                        onClick={() => setIsExpanded(true)}
                        className="w-full bg-gray-100 hover:bg-gray-200 transition-colors rounded-full py-3 px-4 cursor-pointer text-gray-500 select-none"
                    >
                        {getPlaceholder()}
                    </div>
                )}

                {isExpanded && (
                    <div className="animate-fade-in space-y-3">
                        {(mode === 'qna' || mode === 'blog') && (
                            <input 
                                type="text"
                                placeholder={getTitlePlaceholder()}
                                className="w-full font-bold text-lg border-b border-gray-200 focus:border-primary-500 outline-none py-2 bg-transparent"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        )}
                        
                        <textarea 
                            className="w-full bg-transparent outline-none text-gray-700 min-h-[100px] text-base resize-none"
                            placeholder={getPlaceholder()}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            autoFocus
                        />

                        {/* Media Input (Show if typed or if button clicked) */}
                        <div className={`transition-all overflow-hidden ${mediaUrl || mode === 'media' ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-gray-50 p-2 rounded-xl border border-dashed border-gray-300 flex items-center">
                                <input 
                                    type="text"
                                    placeholder="Dán link ảnh hoặc video (YouTube, TikTok)..."
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
            <div className="flex space-x-1">
                 <button 
                    onClick={() => setMode('media')}
                    className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors flex items-center space-x-1"
                    title="Ảnh/Video"
                >
                    <Image size={20} />
                    <span className="text-xs font-medium hidden sm:inline">Ảnh/Video</span>
                 </button>
                 <button className="p-2 rounded-full hover:bg-yellow-50 text-yellow-500 transition-colors flex items-center space-x-1">
                    <Smile size={20} />
                    <span className="text-xs font-medium hidden sm:inline">Cảm xúc</span>
                 </button>
            </div>
            
            {isExpanded ? (
                 <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setIsExpanded(false); setMode('status'); }}>Hủy</Button>
                    <Button size="sm" onClick={handleSubmit} disabled={!content.trim() && !title.trim() && !mediaUrl.trim()}>
                        <Send size={16} className="mr-2" /> 
                        {mode === 'qna' ? 'Gửi câu hỏi' : 'Đăng bài'}
                    </Button>
                </div>
            ) : (
                <Button size="sm" onClick={() => setIsExpanded(true)} disabled>
                    Đăng bài
                </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;