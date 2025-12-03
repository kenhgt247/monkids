import React, { useState } from 'react';
import Button from '../components/Button';
import { User } from '../types';
import { X, AlertCircle } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { POINTS, getBadgeFromPoints } from '../services/userService';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onCancel?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onCancel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hàm helper để timeout promise nếu chạy quá lâu (5 giây)
  const withTimeout = <T,>(promise: Promise<T>, ms: number = 5000): Promise<T> => {
      return Promise.race([
          promise,
          new Promise<T>((_, reject) => 
              setTimeout(() => reject(new Error("Timeout")), ms)
          )
      ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isLogin) {
            // --- ĐĂNG NHẬP ---
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            let userData: User;

            try {
                // Thử lấy profile user từ Firestore với timeout
                const userDoc = await withTimeout<DocumentSnapshot>(getDoc(doc(db, "users", firebaseUser.uid)), 3000);
                
                if (userDoc.exists()) {
                    userData = userDoc.data() as User;
                } else {
                    throw new Error("User doc not found");
                }
            } catch (err) {
                console.warn("Không tải được profile chi tiết, dùng thông tin cơ bản:", err);
                // Fallback nếu lỗi hoặc timeout
                userData = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email || '',
                    avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'U'}&background=random`,
                    badge: 'Thành viên',
                    badgeType: 'new',
                    points: 0
                };
            }
            onLogin(userData);

        } else {
            // --- ĐĂNG KÝ ---
            // 1. Tạo tài khoản Auth (Quan trọng nhất)
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // 2. Cập nhật tên hiển thị (Auth Profile)
            try {
                await updateProfile(firebaseUser, {
                    displayName: name,
                    photoURL: `https://ui-avatars.com/api/?name=${name}&background=random`
                });
            } catch (e) {
                console.warn("Lỗi update profile auth:", e);
            }

            // 3. Tạo hồ sơ người dùng trong Firestore (Dễ bị treo nếu chưa config DB)
            const initialPoints = POINTS.REGISTER;
            const { badge, type } = getBadgeFromPoints(initialPoints);

            const newUser: User = {
                id: firebaseUser.uid,
                name: name,
                email: email,
                avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${name}&background=random`,
                badge: badge,
                badgeType: type,
                points: initialPoints
            };

            try {
                // Thêm timeout cho việc tạo doc, nếu Firestore chưa bật thì sẽ không treo mãi
                await withTimeout(setDoc(doc(db, "users", firebaseUser.uid), newUser), 4000);
            } catch (firestoreErr) {
                console.error("Lỗi tạo user profile trên Firestore (Có thể do chưa bật Database):", firestoreErr);
                // Vẫn cho đăng nhập thành công dù lỗi lưu DB, App.tsx sẽ tự handle fallback
                // Thông báo nhẹ cho người dùng nếu cần thiết, hoặc bỏ qua để trải nghiệm mượt
            }
            
            onLogin(newUser);
        }
    } catch (err: any) {
        console.error("Auth Error:", err);
        let msg = "Đã có lỗi xảy ra. Vui lòng thử lại.";
        if (err.code === 'auth/email-already-in-use') msg = "Email này đã được sử dụng.";
        if (err.code === 'auth/wrong-password') msg = "Sai mật khẩu.";
        if (err.code === 'auth/user-not-found') msg = "Tài khoản không tồn tại.";
        if (err.code === 'auth/weak-password') msg = "Mật khẩu quá yếu (cần ít nhất 6 ký tự).";
        if (err.code === 'auth/network-request-failed') msg = "Lỗi kết nối mạng.";
        if (err.code === 'auth/operation-not-allowed') msg = "Chức năng đăng nhập này chưa được bật trên Firebase.";
        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 relative z-50">
        {onCancel && (
            <button 
                onClick={onCancel}
                className="absolute top-6 right-6 p-2 rounded-full bg-white text-gray-500 shadow-md hover:bg-gray-100 transition-colors z-50"
                title="Bỏ qua"
            >
                <X size={24} />
            </button>
        )}
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col md:flex-row max-w-4xl h-[600px] relative">
            
            {/* Left Side (Image/Welcome) */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary-400 to-primary-600 p-8 flex-col justify-between text-white relative overflow-hidden">
                <div className="z-10">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-500 font-bold text-xl mb-4 shadow-lg font-heading">M</div>
                    <h2 className="text-3xl font-bold mb-2 font-heading">Chào mừng đến với Mom&Kids</h2>
                    <p className="text-primary-50 opacity-90">Cộng đồng chia sẻ kinh nghiệm, kiến thức và yêu thương dành cho mẹ và bé.</p>
                </div>
                <div className="relative z-10 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    <p className="text-sm italic">"Nơi tuyệt vời để học hỏi kinh nghiệm nuôi dạy con cái. Tôi yêu cộng đồng này!"</p>
                    <div className="flex items-center mt-3">
                        <img src="https://picsum.photos/seed/u1/50/50" className="w-8 h-8 rounded-full border-2 border-white mr-2" />
                        <span className="text-xs font-bold font-heading">Mẹ Bỉm Sữa</span>
                    </div>
                </div>
                {/* Decorative Circles */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
            </div>

            {/* Right Side (Form) */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 font-heading">{isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Tham gia ngay để tích điểm và nhận quà'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center">
                        <AlertCircle size={16} className="mr-2" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Họ và tên</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                                placeholder="VD: Nguyễn Thị A"
                                required={!isLogin}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full py-3 mt-4 text-lg" disabled={loading}>
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </span>
                        ) : (isLogin ? 'Đăng nhập' : 'Đăng ký nhận +50 điểm')}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
                        <button 
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-primary-600 font-bold ml-1 hover:underline focus:outline-none"
                        >
                            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AuthPage;