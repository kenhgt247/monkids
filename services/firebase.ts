
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

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
const auth = getAuth(app); 
const db = getFirestore(app);
const storage = getStorage(app); 
const googleProvider = new GoogleAuthProvider();

// Xử lý Analytics an toàn (Tránh crash nếu trình duyệt chặn)
let analytics;
isSupported().then(yes => {
  if (yes) {
    analytics = getAnalytics(app);
  }
}).catch(err => {
  console.warn("Firebase Analytics not supported in this environment", err);
});

export { auth, db, storage, analytics, googleProvider };