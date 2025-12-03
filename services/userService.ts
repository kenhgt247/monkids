

import { db } from "./firebase";
import { doc, updateDoc, increment, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { User } from "../types";

// Bảng điểm
export const POINTS = {
    REGISTER: 50,
    CREATE_POST: 10,
    COMMENT: 5,
    GET_LIKE: 2,
    SHARE: 5,       // Điểm cộng khi chia sẻ
    DOWNLOAD: -20   // Điểm trừ khi tải tài liệu
};

// Logic tính danh hiệu dựa trên điểm
export const getBadgeFromPoints = (points: number): { badge: string, type: User['badgeType'] } => {
    if (points >= 1000) return { badge: 'Chuyên gia', type: 'expert' };
    if (points >= 500) return { badge: 'Thành viên VIP', type: 'vip' };
    if (points >= 100) return { badge: 'Tích cực', type: 'contributor' };
    return { badge: 'Thành viên mới', type: 'new' };
};

// Hàm cộng/trừ điểm cho user
export const addPoints = async (userId: string, amount: number): Promise<boolean> => {
    if (!userId) return false;
    
    try {
        const userRef = doc(db, "users", userId);
        
        // Nếu là trừ điểm (amount < 0), kiểm tra xem user có đủ điểm không
        if (amount < 0) {
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data() as User;
                const currentPoints = userData.points || 0;
                if (currentPoints + amount < 0) {
                    return false; // Không đủ điểm
                }
            }
        }

        // 1. Cập nhật điểm trong Database
        await updateDoc(userRef, {
            points: increment(amount)
        });

        // 2. Kiểm tra xem có cần update Badge không
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            const currentPoints = userData.points || 0;
            const { badge, type } = getBadgeFromPoints(currentPoints);

            // Nếu badge thay đổi so với hiện tại thì cập nhật
            if (userData.badge !== badge) {
                await updateDoc(userRef, {
                    badge: badge,
                    badgeType: type
                });
            }
        }
        return true;
    } catch (error) {
        console.error("Lỗi cập nhật điểm:", error);
        return false;
    }
};

// Hàm cập nhật Role cho Admin
export const updateUserRole = async (userId: string, badgeType: User['badgeType'], badgeTitle: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        badgeType: badgeType,
        badge: badgeTitle
    });
};

// Hàm tạo thông báo
export const createNotification = async (
    toUserId: string, 
    type: 'like' | 'comment' | 'system' | 'award' | 'follow' | 'post', 
    content: string, 
    fromUser?: User,
    postId?: string
) => {
    if (!toUserId) return;
    // Không thông báo cho chính mình
    if (fromUser && fromUser.id === toUserId && type !== 'system') return;

    try {
        await addDoc(collection(db, "notifications"), {
            toUserId,
            type,
            content,
            fromUser: fromUser ? {
                id: fromUser.id,
                name: fromUser.name,
                avatar: fromUser.avatar
            } : null,
            postId: postId || null,
            isRead: false,
            createdAt: serverTimestamp(),
            timestamp: Date.now()
        });
    } catch (e) {
        console.error("Lỗi tạo thông báo:", e);
    }
}