import React, { useState, useRef } from 'react';
import { X, Image, Video, Loader2, Send } from 'lucide-react';
import Button from './Button';
import { uploadFileToStorage } from '../services/uploadService';
import { User } from '../types';

interface CreateStoryModalProps {
    currentUser: User;
    onClose: () => void;
    onPost: (fileUrl: string, type: 'image' | 'video') => Promise<void>;
}

const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ currentUser, onClose, onPost }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 50 * 1024 * 1024) { // 50MB limit for stories
                alert("File quá lớn cho Story (Max 50MB)");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setFileType(file.type.startsWith('video') ? 'video' : 'image');
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile || !fileType) return;
        setIsUploading(true);
        try {
            const url = await uploadFileToStorage(selectedFile, 'stories');
            await onPost(url, fileType);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Lỗi tải lên tin.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
            <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full z-60">
                <X size={32} />
            </button>

            <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-[80vh] max-h-[800px]">
                {/* Main Content Area - Added min-h-0 to prevent overflow issues */}
                <div className="flex-1 relative bg-black flex items-center justify-center min-h-0">
                    {!selectedFile ? (
                        <div className="text-center p-6">
                            <h3 className="text-white text-xl font-bold mb-6">Tạo tin mới</h3>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-gray-700 transition-colors border-2 border-dashed border-gray-600 group"
                            >
                                <div className="text-center group-hover:scale-105 transition-transform">
                                    <Image className="text-gray-400 mx-auto mb-1" />
                                    <span className="text-xs text-gray-400">Chọn Ảnh/Video</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*,video/*" 
                                onChange={handleFileSelect} 
                            />
                            <p className="text-gray-500 text-sm">Tin sẽ hiển thị trong 24 giờ</p>
                        </div>
                    ) : (
                        <>
                            {fileType === 'image' ? (
                                <img src={previewUrl!} className="w-full h-full object-contain" />
                            ) : (
                                <video src={previewUrl!} className="w-full h-full object-contain" controls autoPlay loop />
                            )}
                            <button 
                                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
                            >
                                Chọn lại
                            </button>
                        </>
                    )}
                </div>

                {/* Footer Button - Added z-index and shrink-0 to ensure visibility */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 shrink-0 z-20 relative">
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!selectedFile || isUploading}
                        className="w-full py-3 text-lg font-bold"
                        variant="primary"
                    >
                        {isUploading ? <><Loader2 className="animate-spin mr-2"/> Đang đăng...</> : <><Send className="mr-2"/> Chia sẻ tin</>}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateStoryModal;