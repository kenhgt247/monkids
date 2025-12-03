
import React, { useState, useRef, useEffect } from "react";
import { User, Post } from "../types";
import {
  Image,
  Video,
  FileText,
  Smile,
  Send,
  HelpCircle,
  PenTool,
  X,
  Music,
  Paperclip,
  Loader2,
  AlertCircle,
  Coins,
  Link as LinkIcon,
} from "lucide-react";
import Button from "./Button";
import { uploadFileToStorage } from "../services/uploadService";

interface CreatePostProps {
  currentUser: User;
  communityName?: string;
  initialMode?: "status" | "qna" | "blog" | "document";
  onPost: (
    content: string,
    title?: string,
    imageUrl?: string,
    videoUrl?: string,
    audioUrl?: string,
    fileUrl?: string,
    category?: Post["category"],
    downloadCost?: number,
    linkUrl?: string
  ) => void;
}

type PostMode = "status" | "qna" | "blog" | "document";

const EMOJIS = ["😊", "😂", "🥰", "😭", "😡", "👍", "❤️", "🎉", "🍎", "🍼", "🧸", "💊"];

const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";

export const CreatePost: React.FC<CreatePostProps> = ({
  currentUser,
  communityName,
  initialMode = "status",
  onPost,
}) => {
  const [mode, setMode] = useState<PostMode>(initialMode);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [downloadCost, setDownloadCost] = useState<number>(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | "audio" | "document" | null>(
    null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video" | "audio" | "document"
  ) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 100 * 1024 * 1024) {
        setUploadError("File quá lớn! Vui lòng chọn file dưới 100MB.");
        return;
      }

      setSelectedFile(file);
      setFileType(type);
      setPreviewUrl(URL.createObjectURL(file));
      setIsExpanded(true);

      if (type === "document" && mode === "status") {
        setMode("document");
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileType(null);
    setPreviewUrl(null);
    setUploadError(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) ref.current.click();
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile && !title.trim() && !linkInput.trim()) return;

    setIsUploading(true);
    setUploadError(null);

    let category: Post["category"] = "Status";
    let finalImageUrl: string | undefined;
    let finalVideoUrl: string | undefined;
    let finalAudioUrl: string | undefined;
    let finalFileUrl: string | undefined;
    let finalLinkUrl: string | undefined;

    if (mode === "blog") category = "Blog";
    if (mode === "qna") category = "QnA";
    if (mode === "document") category = "Document";
    if (fileType === "document") category = "Document";

    if (linkInput.trim()) {
      const isVideoLink = linkInput.match(
        /(youtube\.com|youtu\.be|facebook\.com.*\/videos\/|facebook\.com.*\/watch\/)/
      );
      if (isVideoLink) {
        finalVideoUrl = linkInput;
      } else {
        finalLinkUrl = linkInput;
      }
    }

    try {
      if (selectedFile && fileType) {
        const folder = fileType === "document" ? "documents" : "posts";
        const downloadUrl = await uploadFileToStorage(selectedFile, folder);

        if (fileType === "image") finalImageUrl = downloadUrl;
        if (fileType === "video") finalVideoUrl = downloadUrl;
        if (fileType === "audio") finalAudioUrl = downloadUrl;
        if (fileType === "document") finalFileUrl = downloadUrl;
      }

      onPost(
        content,
        title,
        finalImageUrl,
        finalVideoUrl,
        finalAudioUrl,
        finalFileUrl,
        category,
        downloadCost,
        finalLinkUrl
      );

      setContent("");
      setTitle("");
      setLinkInput("");
      setDownloadCost(0);
      removeFile();
      setShowEmoji(false);
      setShowLinkInput(false);
      setMode(initialMode);
      setIsExpanded(false);
    } catch (error: any) {
      console.error("Upload failed:", error);
      let msg = "Có lỗi xảy ra khi tải file.";
      if (error.code === "storage/unauthorized") {
        msg = "Lỗi quyền: Bạn chưa cấu hình Rules trong Firebase Storage.";
      } else if (error.message?.includes("Quá thời gian")) {
        msg = error.message;
      }
      setUploadError(msg);
      alert(msg);
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
    if (communityName) return `Chia sẻ với ${communityName}...`;
    if (mode === "qna") return "Đặt câu hỏi cho cộng đồng các mẹ...";
    if (mode === "blog") return "Viết nội dung chia sẻ...";
    if (mode === "document") return "Mô tả tài liệu này...";
    return `${currentUser?.name} ơi, bạn đang nghĩ gì thế?`;
  };

  const tabStyle = (isActive: boolean) =>
    `flex-1 py-4 text-sm font-bold flex items-center justify-center space-x-2 transition-all border-b-2 font-heading ${
      isActive
        ? "border-primary-500 text-primary-600"
        : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-visible relative z-10">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={e => handleFileSelect(e, "image")}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        className="hidden"
        onChange={e => handleFileSelect(e, "video")}
      />
      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*"
        className="hidden"
        onChange={e => handleFileSelect(e, "audio")}
      />
      <input
        type="file"
        ref={docInputRef}
        accept={DOCUMENT_ACCEPT}
        className="hidden"
        onChange={e => handleFileSelect(e, "document")}
      />

      {/* Top Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => switchMode("status")}
          className={tabStyle(mode === "status")}
        >
          <PenTool size={16} />{" "}
          <span className="hidden sm:inline">Tạo bài viết</span>
          <span className="sm:hidden">Bài viết</span>
        </button>
        <button
          onClick={() => switchMode("qna")}
          className={tabStyle(mode === "qna")}
        >
          <HelpCircle size={16} />{" "}
          <span className="hidden sm:inline">Hỏi đáp</span>
          <span className="sm:hidden">Hỏi đáp</span>
        </button>
        <button
          onClick={() => switchMode("blog")}
          className={tabStyle(mode === "blog")}
        >
          <FileText size={16} />{" "}
          <span className="hidden sm:inline">Góc chia sẻ</span>
          <span className="sm:hidden">Chia sẻ</span>
        </button>
        <button
          onClick={() => switchMode("document")}
          className={tabStyle(mode === "document")}
        >
          <Paperclip size={16} />{" "}
          <span className="hidden sm:inline">Tài liệu</span>
          <span className="sm:hidden">Tài liệu</span>
        </button>
      </div>

      <div className="p-4">
        {uploadError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start">
            <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" />{" "}
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
                className="w-full bg-gray-50 hover:bg-gray-100 transition-colors rounded-full py-3 px-4 cursor-pointer text-gray-500 select-none text-sm"
              >
                {getPlaceholder()}
              </div>
            )}

            {isExpanded && (
              <div className="animate-fade-in space-y-3">
                {(mode === "qna" ||
                  mode === "blog" ||
                  mode === "document" ||
                  fileType === "document") && (
                  <input
                    type="text"
                    placeholder={
                      mode === "qna"
                        ? "Tiêu đề câu hỏi..."
                        : mode === "document"
                        ? "Tên tài liệu..."
                        : "Tiêu đề bài viết..."
                    }
                    className="w-full font-bold text-lg border-b border-gray-200 focus:border-primary-500 outline-none py-2 bg-transparent font-heading"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                )}

                {mode === "document" && (
                  <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg border border-orange-100 w-fit">
                    <Coins size={18} className="text-orange-500" />
                    <span className="text-sm font-bold text-gray-700">
                      Điểm tải về:
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={downloadCost}
                      onChange={e => setDownloadCost(Number(e.target.value))}
                      className="w-20 bg-white border border-gray-300 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-xs text-gray-500">
                      {downloadCost === 0 ? "(Miễn phí)" : "điểm"}
                    </span>
                  </div>
                )}

                <textarea
                  className="w-full bg-transparent outline-none text-gray-700 min-h-[100px] text-base resize-none"
                  placeholder={getPlaceholder()}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  autoFocus
                />

                {showLinkInput && (
                  <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-200 animate-fade-in">
                    <LinkIcon size={18} className="text-gray-400 ml-2" />
                    <input
                      type="text"
                      placeholder="Dán đường dẫn YouTube, Website tại đây..."
                      className="flex-1 bg-transparent outline-none text-sm text-blue-600"
                      value={linkInput}
                      onChange={e => setLinkInput(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setShowLinkInput(false);
                        setLinkInput("");
                      }}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

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

                {selectedFile && previewUrl && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 relative animate-fade-in mt-2">
                    <button
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-sm z-10"
                    >
                      <X size={14} />
                    </button>

                    {fileType === "image" && (
                      <img
                        src={previewUrl}
                        className="max-h-60 rounded-lg object-contain w-full"
                        alt="Preview"
                      />
                    )}

                    {fileType === "video" && (
                      <video
                        src={previewUrl}
                        controls
                        className="max-h-60 rounded-lg w-full bg-black"
                      />
                    )}

                    {fileType === "audio" && (
                      <div className="flex items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                          <Music size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800 truncate">
                            {selectedFile.name}
                          </p>
                        </div>
                        <audio
                          src={previewUrl}
                          controls
                          className="ml-2 h-8 w-40"
                        />
                      </div>
                    )}

                    {fileType === "document" && (
                      <div className="flex items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
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
            <button
              onClick={() => triggerFileInput(imageInputRef)}
              className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors flex items-center space-x-1"
              disabled={isUploading}
            >
              <Image size={20} />
              <span className="text-xs font-medium hidden sm:inline">Ảnh</span>
            </button>
            <button
              onClick={() => triggerFileInput(videoInputRef)}
              className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors flex items-center space-x-1"
              disabled={isUploading}
            >
              <Video size={20} />
              <span className="text-xs font-medium hidden sm:inline">Video</span>
            </button>
            <button
              onClick={() => setShowLinkInput(!showLinkInput)}
              className="p-2 rounded-full hover:bg-blue-50 text-blue-500 transition-colors flex items-center space-x-1"
              disabled={isUploading}
            >
              <LinkIcon size={20} />
              <span className="text-xs font-medium hidden sm:inline">Link</span>
            </button>
            <button
              onClick={() => triggerFileInput(audioInputRef)}
              className="p-2 rounded-full hover:bg-purple-50 text-purple-600 transition-colors flex items-center space-x-1"
              disabled={isUploading}
            >
              <Music size={20} />
              <span className="text-xs font-medium hidden sm:inline">MP3</span>
            </button>
            <button
              onClick={() => triggerFileInput(docInputRef)}
              className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors flex items-center space-x-1"
              disabled={isUploading}
            >
              <Paperclip size={20} />
              <span className="text-xs font-medium hidden sm:inline">File</span>
            </button>
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 rounded-full hover:bg-yellow-50 text-yellow-500 transition-colors flex items-center space-x-1"
              disabled={isUploading}
            >
              <Smile size={20} />
            </button>
          </div>

          {isExpanded ? (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsExpanded(false);
                  removeFile();
                }}
                className="text-gray-500"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isUploading ||
                  (!content.trim() &&
                    !selectedFile &&
                    !title.trim() &&
                    !linkInput.trim())
                }
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Đăng
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isUploading || (!content.trim() && !selectedFile)}
              className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-6 shadow-md shadow-primary-200"
            >
              Đăng
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;