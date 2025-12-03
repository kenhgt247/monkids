
import React, { useState } from 'react';
import { Post } from '../types';
import Button from './Button';
import { X, Save, Loader2 } from 'lucide-react';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSave: (postId: string, newContent: string, newTitle?: string) => Promise<void>;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSave }) => {
  const [content, setContent] = useState(post.content);
  const [title, setTitle] = useState(post.title || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      await onSave(post.id, content, title);
      onClose();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Có lỗi khi lưu bài viết.");
    } finally {
      setIsSaving(false);
    }
  };

  const showTitle = post.category === 'Blog' || post.category === 'QnA' || post.category === 'Document';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800 font-heading">Chỉnh sửa bài viết</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {showTitle && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none font-bold text-lg font-heading"
                placeholder="Tiêu đề bài viết..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nội dung</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none min-h-[150px] resize-none text-base"
              placeholder="Nội dung bài viết..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Hủy</Button>
          <Button onClick={handleSave} disabled={isSaving || !content.trim()}>
            {isSaving ? <><Loader2 className="animate-spin mr-2" size={18}/> Đang lưu...</> : <><Save className="mr-2" size={18}/> Lưu thay đổi</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;