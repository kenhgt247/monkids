import React, { useState } from 'react';
import Button from '../components/Button';
import { User } from '../types';
import { X, AlertCircle } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isLogin) {
            // --- ĐĂNG NHẬP ---
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            // Lấy thông tin user từ Firestore để có điểm số & badge
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                onLogin(userData);
            } else {
                // Fallback nếu không tìm thấy doc (ít khi xảy ra)
                onLogin({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email || '',
                    avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName}&background=random`,
                    badge: 'Thành viên',
                    badgeType: 'new',
                    points: 0
                });
            }

        } else {
            // --- ĐĂNG KÝ ---
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Cập nhật tên hiển thị
            await updateProfile(firebaseUser, {
                displayName: name,
                photoURL: `https://ui-avatars.com/api/?name=${name}&background=random`
            });

            // Tạo hồ sơ người dùng trong Firestore
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

            await setDoc(doc(db, "users", firebaseUser.uid), newUser);
            
            onLogin(newUser);
        }
    } catch (err: any) {
        console.error(err);
        let msg = "Đã có lỗi xảy ra.";
        if (err.code === 'auth/email-already-in-use') msg = "Email này đã được sử dụng.";
        if (err.code === 'auth/wrong-password') msg = "Sai mật khẩu.";
        if (err.code === 'auth/user-not-found') msg = "Tài khoản không tồn tại.";
        if (err.code === 'auth/weak-password') msg = "Mật khẩu quá yếu (cần ít nhất 6 ký tự).";
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
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-500 font-bold text-xl mb-4 shadow-lg">M</div>
                    <h2 className="text-3xl font-bold mb-2">Chào mừng đến với Mom&Kids</h2>
                    <p className="text-primary-50 opacity-90">Cộng đồng chia sẻ kinh nghiệm, kiến thức và yêu thương dành cho mẹ và bé.</p>
                </div>
                <div className="relative z-10 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    <p className="text-sm italic">"Nơi tuyệt vời để học hỏi kinh nghiệm nuôi dạy con cái. Tôi yêu cộng đồng này!"</p>
                    <div className="flex items-center mt-3">
                        <img src="https://picsum.photos/seed/u1/50/50" className="w-8 h-8 rounded-full border-2 border-white mr-2" />
                        <span className="text-xs font-bold">Mẹ Bỉm Sữa</span>
                    </div>
                </div>
                {/* Decorative Circles */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
            </div>

            {/* Right Side (Form) */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">{isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}</h2>
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
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký nhận +50 điểm')}
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