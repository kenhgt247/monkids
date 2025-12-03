import { db } from "./firebase";
import { 
    collection, addDoc, query, where, orderBy, onSnapshot, 
    doc, updateDoc, serverTimestamp, getDocs, setDoc, getDoc 
} from "firebase/firestore";
import { User, Message, Conversation } from "../types";

// 1. Tìm hoặc tạo cuộc hội thoại giữa 2 người
export const getOrCreateConversation = async (currentUser: User, targetUser: User): Promise<string> => {
    // Cách đơn giản: ID = sort(uid1, uid2).join('_') để đảm bảo duy nhất
    const ids = [currentUser.id, targetUser.id].sort();
    const conversationId = `${ids[0]}_${ids[1]}`;
    
    const convRef = doc(db, "conversations", conversationId);
    const convSnap = await getDoc(convRef);

    if (!convSnap.exists()) {
        const newConv: Conversation = {
            id: conversationId,
            participantIds: ids,
            participants: [currentUser, targetUser], // Cache thông tin user để hiển thị nhanh
            lastMessage: "Bắt đầu cuộc trò chuyện",
            lastMessageTimestamp: Date.now(),
            lastSenderId: "",
            isRead: true,
            unreadCount: { [currentUser.id]: 0, [targetUser.id]: 0 }
        };
        await setDoc(convRef, newConv);
    }
    
    return conversationId;
};

// 2. Gửi tin nhắn
export const sendMessage = async (conversationId: string, senderId: string, content: string, type: Message['type'] = 'text', attachmentUrl?: string) => {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    
    await addDoc(messagesRef, {
        senderId,
        content,
        timestamp: serverTimestamp(),
        createdAt: Date.now(),
        isRead: false,
        type,
        attachmentUrl: attachmentUrl || null
    });

    // Cập nhật thông tin cuộc hội thoại
    const convRef = doc(db, "conversations", conversationId);
    
    // Logic cập nhật unread count phức tạp hơn, ở đây làm đơn giản:
    // Lấy doc hiện tại để biết unread count cũ
    const convSnap = await getDoc(convRef);
    const currentData = convSnap.data() as Conversation;
    const participants = currentData.participantIds;
    const receiverId = participants.find(p => p !== senderId);

    const newUnreadCount = { ...currentData.unreadCount };
    if (receiverId) {
        newUnreadCount[receiverId] = (newUnreadCount[receiverId] || 0) + 1;
    }

    await updateDoc(convRef, {
        lastMessage: type === 'image' ? '[Hình ảnh]' : type === 'story_reply' ? '[Phản hồi tin]' : content,
        lastMessageTimestamp: Date.now(),
        lastSenderId: senderId,
        unreadCount: newUnreadCount
    });
};

// 3. Đánh dấu đã đọc
export const markConversationAsRead = async (conversationId: string, userId: string) => {
    const convRef = doc(db, "conversations", conversationId);
    const convSnap = await getDoc(convRef);
    if (!convSnap.exists()) return;
    
    const currentData = convSnap.data() as Conversation;
    const newUnreadCount = { ...currentData.unreadCount, [userId]: 0 };

    await updateDoc(convRef, {
        unreadCount: newUnreadCount
    });
};