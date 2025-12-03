

import React, { useState, useEffect, useRef } from 'react';
import { User, Conversation, Message } from '../types';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, limit, QuerySnapshot } from 'firebase/firestore';
import { sendMessage, markConversationAsRead } from '../services/chatService';
import { generateChatSuggestions } from '../services/openaiService';
import { uploadFileToStorage } from '../services/uploadService';
import { Send, Image, MoreVertical, Search, Sparkles, ArrowLeft, Loader2, Smile, X } from 'lucide-react';

interface ChatSystemProps {
    currentUser: User;
    initialConversationId?: string | null;
    onClose: () => void;
}

const COMMON_EMOJIS = ['😊', '😂', '🥰', '😭', '😡', '👍', '❤️', '🎉', '🍎', '🍼', '🧸', '💊', '👋', '🙏', '🌹', '✨'];
const STICKERS = ['🐱', '🐶', '🦊', '🐼', '🐨', '🐷', '🦄', '🐣']; // Giả lập sticker bằng emoji to

const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser, initialConversationId, onClose }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    
    // Media & Emoji States
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Load danh sách hội thoại
    useEffect(() => {
        // Fix lỗi Index: Bỏ orderBy ở query, chuyển sang sort ở client
        const q = query(
            collection(db, "conversations"),
            where("participantIds", "array-contains", currentUser.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
            const convs = snapshot.docs.map(doc => doc.data() as Conversation);
            // Sắp xếp tin nhắn mới nhất lên đầu
            convs.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
            setConversations(convs);
        });

        return () => unsubscribe();
    }, [currentUser.id]);

    // 2. Load tin nhắn của hội thoại đang mở
    useEffect(() => {
        if (!activeConvId) return;

        // Mark as read
        markConversationAsRead(activeConvId, currentUser.id);

        const q = query(
            collection(db, "conversations", activeConvId, "messages"),
            orderBy("createdAt", "asc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, async (snapshot: QuerySnapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            
            // AI Suggestion Logic
            if (msgs.length > 0) {
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg.senderId !== currentUser.id) {
                    setIsLoadingSuggestions(true);
                    const suggs = await generateChatSuggestions([lastMsg.content], 'reply');
                    setSuggestions(suggs);
                    setIsLoadingSuggestions(false);
                } else {
                    setSuggestions([]);
                }
            } else {
                 // New conversation -> Ice breakers
                 setIsLoadingSuggestions(true);
                 const suggs = await generateChatSuggestions([], 'starter');
                 setSuggestions(suggs);
                 setIsLoadingSuggestions(false);
            }
        });

        return () => unsubscribe();
    }, [activeConvId, currentUser.id]);

    // Auto scroll bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showEmojiPicker]);

    const handleSendMessage = async (text: string = input, type: Message['type'] = 'text', attachmentUrl?: string) => {
        if (!activeConvId) return;
        if (type === 'text' && !text.trim()) return;
        
        await sendMessage(activeConvId, currentUser.id, text, type, attachmentUrl);
        
        if (type === 'text') {
            setInput('');
            setSuggestions([]); 
            setShowEmojiPicker(false);
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && activeConvId) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                alert("Ảnh quá lớn (Max 10MB)");
                return;
            }

            setIsUploading(true);
            try {
                const url = await uploadFileToStorage(file, 'chat_images');
                await handleSendMessage('Đã gửi một ảnh', 'image', url);
            } catch (error) {
                console.error("Lỗi gửi ảnh:", error);
                alert("Không thể gửi ảnh. Vui lòng thử lại.");
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const addEmoji = (emoji: string) => {
        setInput(prev => prev + emoji);
    };

    const sendSticker = (sticker: string) => {
        handleSendMessage(sticker, 'text'); // Gửi sticker như tin nhắn text nhưng chỉ chứa emoji
        setShowEmojiPicker(false);
    };

    const activeConversation = conversations.find(c => c.id === activeConvId);
    const otherUser = activeConversation?.participants.find(p => p.id !== currentUser.id);

    // Dynamic height calculation for mobile to avoid covering input
    // 100dvh - 130px (Approx Header 60px + BottomNav 70px)
    return (
        <div className="flex h-[calc(100dvh-130px)] lg:h-[calc(100vh-80px)] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Sidebar List */}
            <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="font-bold text-lg font-heading">Tin nhắn</h2>
                    <div className="p-2 bg-gray-50 rounded-full"><Search size={18} className="text-gray-400"/></div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">Chưa có tin nhắn nào. Hãy bắt chuyện với các mẹ khác!</div>
                    ) : (
                        conversations.map(conv => {
                            const other = conv.participants.find(p => p.id !== currentUser.id) || conv.participants[0];
                            const isUnread = (conv.unreadCount?.[currentUser.id] || 0) > 0;
                            return (
                                <div 
                                    key={conv.id} 
                                    onClick={() => setActiveConvId(conv.id)}
                                    className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors ${activeConvId === conv.id ? 'bg-primary-50' : ''}`}
                                >
                                    <div className="relative">
                                        <img src={other.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                        {isUnread && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`text-sm truncate font-heading ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{other.name}</h4>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        <p className={`text-xs truncate ${isUnread ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                                            {conv.lastSenderId === currentUser.id ? 'Bạn: ' : ''}{conv.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {activeConvId && otherUser ? (
                <div className={`flex-1 flex flex-col w-full ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-3 border-b border-gray-50 flex items-center justify-between bg-white z-10 shadow-sm">
                        <div className="flex items-center">
                            <button onClick={() => setActiveConvId(null)} className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
                            <img src={otherUser.avatar} className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-100" />
                            <div>
                                <h3 className="font-bold text-gray-800 font-heading">{otherUser.name}</h3>
                                <div className="flex items-center text-xs text-green-500"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div> Đang hoạt động</div>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical size={20} className="text-gray-400"/></button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfbf7]">
                        {messages.map((msg, index) => {
                            const isMe = msg.senderId === currentUser.id;
                            const isSticker = STICKERS.includes(msg.content) && msg.type === 'text';

                            return (
                                <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {!isMe && <img src={otherUser.avatar} className="w-8 h-8 rounded-full self-end mb-1 mr-2" />}
                                    
                                    {msg.type === 'image' ? (
                                        <div className="max-w-[70%]">
                                            <img src={msg.attachmentUrl} className="rounded-2xl shadow-sm border border-gray-200 max-h-60 object-cover" />
                                        </div>
                                    ) : (
                                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            isSticker ? 'bg-transparent shadow-none !p-0 text-6xl' : 
                                            isMe ? 'bg-primary-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                        }`}>
                                            {msg.type === 'story_reply' && msg.attachmentUrl && (
                                                <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                                                    <div className="bg-black/20 text-[10px] px-2 py-1 font-bold text-white/80">Phản hồi tin</div>
                                                    <img src={msg.attachmentUrl} className="w-full h-32 object-cover opacity-80" />
                                                </div>
                                            )}
                                            {msg.content}
                                            {!isSticker && (
                                                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* AI Suggestions */}
                    {(suggestions.length > 0 || isLoadingSuggestions) && (
                        <div className="px-4 py-2 bg-white border-t border-gray-50 overflow-x-auto whitespace-nowrap scrollbar-hide flex items-center space-x-2">
                            <Sparkles size={16} className="text-violet-500 shrink-0 animate-pulse" />
                            {isLoadingSuggestions ? (
                                <span className="text-xs text-gray-400 italic">AI đang nghĩ gợi ý...</span>
                            ) : (
                                suggestions.map((sugg, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleSendMessage(sugg)}
                                        className="inline-block px-3 py-1 bg-violet-50 text-violet-600 text-xs font-medium rounded-full border border-violet-100 hover:bg-violet-100 transition-colors"
                                    >
                                        {sugg}
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div className="border-t border-gray-100 bg-gray-50 p-3 h-48 overflow-y-auto animate-slide-in">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Cảm xúc & Stickers</span>
                                <button onClick={() => setShowEmojiPicker(false)}><X size={16} className="text-gray-400"/></button>
                            </div>
                            <div className="grid grid-cols-8 gap-2 mb-4">
                                {COMMON_EMOJIS.map(emoji => (
                                    <button key={emoji} onClick={() => addEmoji(emoji)} className="text-2xl hover:bg-gray-200 rounded p-1 transition-colors">{emoji}</button>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                                <span className="text-xs font-bold text-gray-400 mb-2 block">STICKERS</span>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {STICKERS.map(sticker => (
                                        <button key={sticker} onClick={() => sendSticker(sticker)} className="text-4xl hover:scale-110 transition-transform">{sticker}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageSelect} 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()} 
                            disabled={isUploading}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full hover:text-blue-500 transition-colors"
                        >
                            {isUploading ? <Loader2 size={20} className="animate-spin text-blue-500"/> : <Image size={20}/>}
                        </button>
                        <button 
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                            className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:bg-gray-100 hover:text-yellow-500'}`}
                        >
                            <Smile size={20}/>
                        </button>
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Nhập tin nhắn..." 
                                className="w-full bg-gray-100 border-none rounded-full pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => handleSendMessage()} 
                            disabled={!input.trim()}
                            className="p-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary-500 transition-colors shadow-md shadow-primary-200"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center flex-col text-gray-300">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Search size={40} /></div>
                    <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
            )}
        </div>
    );
};

export default ChatSystem;
