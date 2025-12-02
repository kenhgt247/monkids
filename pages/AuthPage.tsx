import React, { useState } from 'react';
import Button from '../components/Button';
import { User } from '../types';
import { X } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onCancel?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onCancel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate Login/Register
    const mockUser: User = {
        id: `u_${Date.now()}`,
        name: isLogin ? 'Mẹ Yêu Bé' : name || 'Thành viên mới',
        avatar: `https://picsum.photos/seed/${Date.now()}/100/100`,
        email: email,
        badge: 'Thành viên mới',
        badgeType: 'new'
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4 relative">
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
                        {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Tham gia ngay cộng đồng 10.000+ thành viên'}
                    </p>
                </div>

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

                    <Button type="submit" className="w-full py-3 mt-4 text-lg">
                        {isLogin ? 'Đăng nhập' : 'Đăng ký miễn phí'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
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