
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDUwjqs7u1cQuup0tkrGnHOKNTaPCZtscc",
  authDomain: "mom-kids-app.firebaseapp.com",
  projectId: "mom-kids-app",
  storageBucket: "mom-kids-app.firebasestorage.app",
  messagingSenderId: "875004025224",
  appId: "1:875004025224:web:ef0cdbd42fa67ecea1023d",
  measurementId: "G-VDRPR2D7GL"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
const auth = getAuth(app); // Xác thực người dùng (Đăng nhập)
const db = getFirestore(app); // Cơ sở dữ liệu (Lưu bài viết, comment)
const storage = getStorage(app); // Lưu trữ file (Ảnh, video)
const analytics = getAnalytics(app); // Thống kê truy cập
const googleProvider = new GoogleAuthProvider(); // Đăng nhập bằng Google

export { auth, db, storage, analytics, googleProvider };
