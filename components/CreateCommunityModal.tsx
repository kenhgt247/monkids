

import React, { useState, useRef } from 'react';
import { X, Image, Upload, Loader2 } from 'lucide-react';
import Button from './Button';
import { uploadFileToStorage } from '../services/uploadService';
import { User } from '../types';

interface CreateCommunityModalProps {
    currentUser: User;
    onClose: () => void;
    onCreate: (name: string, description: string, coverUrl: string, avatarUrl: string) => Promise<void>;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ currentUser, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [isUploading, setIsUploading] = useState(false);

    const coverInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!name.trim() || !description.trim()) {
            alert("Vui lòng nhập tên và mô tả nhóm");
            return;
        }
        if (!coverFile || !avatarFile) {
            alert("Vui lòng chọn ảnh bìa và ảnh đại diện cho nhóm");
            return;
        }

        setIsUploading(true);
        try {
            const coverUrl = await uploadFileToStorage(coverFile, 'community_covers');
            const avatarUrl = await uploadFileToStorage(avatarFile, 'community_avatars');
            
            await onCreate(name, description, coverUrl, avatarUrl);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi tạo nhóm. Vui lòng thử lại.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-gray-800 font-heading">Tạo cộng đồng mới</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Cover Image Upload */}
                    <div 
                        onClick={() => coverInputRef.current?.click()}
                        className="w-full h-40 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden group"
                    >
                        {coverPreview ? (
                            <img src={coverPreview} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <Image size={32} className="mb-2"/>
                                <span className="text-sm font-bold">Tải lên ảnh bìa</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white" />
                        </div>
                    </div>
                    <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverSelect} />

                    {/* Avatar Upload - Overlapping */}
                    <div className="flex justify-center -mt-16 relative z-10 pointer-events-none">
                         <div 
                            onClick={() => avatarInputRef.current?.click()}
                            className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-md cursor-pointer relative overflow-hidden group pointer-events-auto"
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    <Image size={24} />
                                </div>
                            )}
                             <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="text-white" size={20} />
                            </div>
                         </div>
                    </div>
                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarSelect} />

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tên cộng đồng</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                placeholder="VD: Hội mẹ bỉm sữa Hà Nội..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả giới thiệu</label>
                            <textarea 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all h-24 resize-none"
                                placeholder="Giới thiệu về mục đích và hoạt động của nhóm..."
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} disabled={isUploading}>Hủy bỏ</Button>
                    <Button onClick={handleSubmit} disabled={isUploading} className="px-8">
                        {isUploading ? <><Loader2 className="animate-spin mr-2"/> Đang tạo...</> : "Tạo cộng đồng"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateCommunityModal;