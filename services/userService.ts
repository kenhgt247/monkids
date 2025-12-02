import { db } from "./firebase";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { User } from "../types";

// Bảng điểm
export const POINTS = {
    REGISTER: 50,
    CREATE_POST: 10,
    COMMENT: 5,
    GET_LIKE: 2
};

// Logic tính danh hiệu dựa trên điểm
export const getBadgeFromPoints = (points: number): { badge: string, type: User['badgeType'] } => {
    if (points >= 1000) return { badge: 'Chuyên gia', type: 'expert' };
    if (points >= 500) return { badge: 'Thành viên VIP', type: 'vip' };
    if (points >= 100) return { badge: 'Tích cực', type: 'contributor' };
    return { badge: 'Thành viên mới', type: 'new' };
};

// Hàm cộng điểm cho user
export const addPoints = async (userId: string, amount: number) => {
    if (!userId) return;
    
    try {
        const userRef = doc(db, "users", userId);
        
        // 1. Cộng điểm trong Database
        await updateDoc(userRef, {
            points: increment(amount)
        });

        // 2. Kiểm tra xem có cần update Badge không
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
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
    } catch (error) {
        console.error("Lỗi cộng điểm:", error);
    }
};