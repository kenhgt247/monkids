import { db } from "./firebase";
import { collection, getDocs, doc, updateDoc, getDoc, setDoc, query, orderBy, limit } from "firebase/firestore";
import { User, SystemSettings, AdminStats } from "../types";

// Lấy thống kê tổng quan
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const postsSnap = await getDocs(collection(db, "posts"));
    const comSnap = await getDocs(collection(db, "communities"));
    
    let totalPoints = 0;
    usersSnap.forEach(doc => {
      totalPoints += (doc.data().points || 0);
    });

    return {
      totalUsers: usersSnap.size,
      totalPosts: postsSnap.size,
      totalCommunities: comSnap.size,
      totalPointsDistributed: totalPoints
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return { totalUsers: 0, totalPosts: 0, totalCommunities: 0, totalPointsDistributed: 0 };
  }
};

// Lấy danh sách tất cả Users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

// Ban/Unban User
export const toggleUserBan = async (userId: string, currentStatus: boolean) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { isBanned: !currentStatus });
};

// Lấy cài đặt hệ thống
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const ref = doc(db, "system", "config");
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as SystemSettings;
  } else {
    // Default settings
    return {
      siteName: "Asking - Mom & Kids",
      description: "Cộng đồng mẹ và bé số 1 Việt Nam",
      primaryColor: "#f43f5e",
      enableAI: true,
      enableAds: false,
      maintenanceMode: false,
      contactEmail: "admin@asking.com",
      pointsPerPost: 10,
      pointsPerComment: 5
    };
  }
};

// Lưu cài đặt hệ thống
export const saveSystemSettings = async (settings: SystemSettings) => {
  await setDoc(doc(db, "system", "config"), settings);
};
