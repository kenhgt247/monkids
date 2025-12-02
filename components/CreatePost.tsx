
import React, { useState, useRef } from 'react';
import { User, Post } from '../types';
import { Image, Video, FileText, Smile, Send, HelpCircle, PenTool, X, Music, Paperclip, Loader2, AlertCircle } from 'lucide-react';
import Button from './Button';
import { uploadFileToStorage } from '../services/uploadService';

interface CreatePostProps {
  currentUser: User;
  onPost: (content: string, title?: string, imageUrl?: string, videoUrl?: string, audioUrl?: string, category?: Post['category']) => void;
}

type PostMode = 'status' | 'qna' | 'blog';

const EMOJIS = ['😊', '😂', '🥰', '😭', '😡', '👍', '❤️', '🎉', '🍎', '🍼', '🧸', '💊'];

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPost }) => {
  const [mode, setMode] = useState<PostMode>('status');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  
  // State quản lý file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Refs cho input file ẩn
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Kiểm tra kích thước file (Ví dụ: giới hạn 20MB)
        if (file.size > 20 * 1024 * 1024) {
            setUploadError("File quá lớn! Vui lòng chọn file dưới 20MB.");
            return;
        }

        setSelectedFile(file);
        setFileType(type);
        setPreviewUrl(URL.createObjectURL(file));
        setIsExpanded(true);
    }
  };

  const removeFile = () => {
      setSelectedFile(null);
      setFileType(null);
      setPreviewUrl(null);
      setUploadError(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile) return;
    
    setIsUploading(true);
    setUploadError(null);

    let category: Post['category'] = 'Status';
    let finalImageUrl = undefined;
    let finalVideoUrl = undefined;
    let finalAudioUrl = undefined;

    if (mode === 'blog') category = 'Blog';
    if (mode === 'qna') category = 'QnA';
    
    try {
        // Xử lý upload file nếu có
        if (selectedFile && fileType) {
            const downloadUrl = await uploadFileToStorage(selectedFile, 'posts');
            if (fileType === 'image') finalImageUrl = downloadUrl;
            if (fileType === 'video') finalVideoUrl = downloadUrl;
            if (fileType === 'audio') finalAudioUrl = downloadUrl;
        }

        onPost(content, title, finalImageUrl, finalVideoUrl, finalAudioUrl, category);
        
        // Reset form
        setContent('');
        setTitle('');
        removeFile();
        setShowEmoji(false);
        setMode('status');
        setIsExpanded(false);
    } catch (error: any) {
        console.error("Upload failed:", error);
        let msg = "Có lỗi xảy ra khi tải file.";
        
        // Bắt các lỗi phổ biến của Firebase Storage
        if (error.code === 'storage/unauthorized') {
            msg = "Lỗi quyền truy cập: Bạn chưa cấu hình 'Rules' trong Firebase Storage (hoặc chưa đăng nhập).";
        } else if (error.code === 'storage/canceled') {
            msg = "Đã hủy tải lên.";
        } else if (error.code === 'storage/unknown') {
            msg = "Lỗi không xác định. Vui lòng kiểm tra lại cấu hình Firebase.";
        }

        setUploadError(msg);
        alert(msg); // Hiển thị popup để người dùng chắc chắn thấy
    } finally {
        setIsUploading(false);
    }
  };

  const switchMode = (newMode: PostMode) => {
    setMode(newMode);
    setIsExpanded(true);
  };

  const addEmoji = (emoji: string) => {
      setContent(prev => prev + emoji);
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-visible relative z-10">
      {/* Hidden File Inputs */}
      <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
      <input type="file" ref={videoInputRef} accept="video/mp4,video/quicktime" className="hidden" onChange={(e) => handleFileSelect(e, 'video')} />
      <input type="file" ref={audioInputRef} accept="audio/mp3,audio/mpeg,audio/wav" className="hidden" onChange={(e) => handleFileSelect(e, 'audio')} />

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
        {uploadError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start">
                <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" /> 
                <span>{uploadError}</span>
            </div>
        )}

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

                        {/* Emoji Picker */}
                        {showEmoji && (
                            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100 animate-fade-in">
                                {EMOJIS.map(e => (
                                    <button 
                                        key={e} 
                                        onClick={() => addEmoji(e)}
                                        className="text-xl hover:bg-gray-200 p-1.5 rounded-lg transition-colors"
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* File Preview Area */}
                        {selectedFile && previewUrl && (
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 relative animate-fade-in mt-2">
                                <button 
                                    onClick={removeFile}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-sm z-10"
                                >
                                    <X size={14} />
                                </button>

                                {fileType === 'image' && (
                                    <img src={previewUrl} className="max-h-60 rounded-lg object-contain w-full bg-black/5" alt="Preview"/>
                                )}

                                {fileType === 'video' && (
                                    <video src={previewUrl} controls className="max-h-60 rounded-lg w-full bg-black" />
                                )}

                                {fileType === 'audio' && (
                                    <div className="flex items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                                            <Music size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-gray-800 truncate">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <audio src={previewUrl} controls className="ml-2 h-8 w-40" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
            <div className="flex space-x-1">
                 {/* Image Upload Button */}
                 <button 
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors flex items-center space-x-1"
                    title="Tải ảnh"
                    disabled={isUploading}
                >
                    <Image size={20} />
                    <span className="text-xs font-medium hidden sm:inline">Ảnh</span>
                 </button>

                 {/* Video Upload Button */}
                 <button 
                    onClick={() => videoInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors flex items-center space-x-1"
                    title="Tải video MP4"
                    disabled={isUploading}
                >
                    <Video size={20} />
                    <span className="text-xs font-medium hidden sm:inline">Video</span>
                 </button>

                 {/* Audio Upload Button */}
                 <button 
                    onClick={() => audioInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-purple-50 text-purple-600 transition-colors flex items-center space-x-1"
                    title="Tải nhạc MP3"
                    disabled={isUploading}
                >
                    <Music size={20} />
                    <span className="text-xs font-medium hidden sm:inline">MP3</span>
                 </button>

                 {/* Emoji Button */}
                 <button 
                    onClick={() => setShowEmoji(!showEmoji)}
                    className={`p-2 rounded-full transition-colors flex items-center space-x-1 ${showEmoji ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-yellow-50 text-yellow-500'}`}
                    disabled={isUploading}
                >
                    <Smile size={20} />
                    <span className="text-xs font-medium hidden sm:inline">Cảm xúc</span>
                 </button>
            </div>
            
            {isExpanded ? (
                 <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setIsExpanded(false); setMode('status'); removeFile(); }} disabled={isUploading}>Hủy</Button>
                    <Button size="sm" onClick={handleSubmit} disabled={(!content.trim() && !title.trim() && !selectedFile) || isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" /> Đang tải lên...
                            </>
                        ) : (
                            <>
                                <Send size={16} className="mr-2" /> 
                                {mode === 'qna' ? 'Gửi câu hỏi' : 'Đăng bài'}
                            </>
                        )}
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
