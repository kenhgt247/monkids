import React, { useState, useEffect } from 'react';
import { User, Post, Community, Game, SystemSettings, AdminStats } from '../types';
import { getAdminStats, getAllUsers, toggleUserBan, getSystemSettings, saveSystemSettings } from '../services/adminService';
import { updateUserRole } from '../services/userService';
import { db } from '../services/firebase';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import Button from '../components/Button';
import { 
    LayoutDashboard, Users, FileText, Gamepad2, Settings, 
    LogOut, Search, Trash2, Shield, AlertTriangle, Check, 
    X, Save, Loader2, RefreshCw, Eye, Lock
} from 'lucide-react';

interface AdminDashboardProps {
    currentUser: User;
    onClose: () => void;
}

type AdminTab = 'overview' | 'users' | 'content' | 'games' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onClose }) => {
    const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Content State
    const [posts, setPosts] = useState<Post[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const s = await getAdminStats();
        setStats(s);
    };

    const loadUsers = async () => {
        setIsLoading(true);
        const u = await getAllUsers();
        setUsers(u);
        setIsLoading(false);
    };

    const loadContent = async () => {
        setIsLoading(true);
        const pSnap = await getDocs(collection(db, "posts"));
        setPosts(pSnap.docs.map(d => ({id: d.id, ...d.data()} as Post)));
        
        const cSnap = await getDocs(collection(db, "communities"));
        setCommunities(cSnap.docs.map(d => ({id: d.id, ...d.data()} as Community)));
        setIsLoading(false);
    };

    const loadGames = async () => {
        setIsLoading(true);
        // In a real app, games would be in Firestore. Here we check DB or Mock
        // For Admin demo, let's assume we pull from a 'games' collection or use mock
        // We'll simulate fetching from mockData if DB is empty
        const gSnap = await getDocs(collection(db, "games"));
        if (!gSnap.empty) {
            setGames(gSnap.docs.map(d => ({id: d.id, ...d.data()} as Game)));
        } else {
             // If DB empty, we might want to seed it from mockData in App.tsx, 
             // but here let's just show empty or manual add
             setGames([]); 
        }
        setIsLoading(false);
    };

    const loadSettings = async () => {
        setIsLoading(true);
        const s = await getSystemSettings();
        setSettings(s);
        setIsLoading(false);
    };

    useEffect(() => {
        if (currentTab === 'users') loadUsers();
        if (currentTab === 'content') loadContent();
        if (currentTab === 'games') loadGames();
        if (currentTab === 'settings') loadSettings();
    }, [currentTab]);

    // --- ACTIONS ---

    const handleBanUser = async (userId: string, currentBan: boolean) => {
        if (!confirm(`Bạn có chắc chắn muốn ${currentBan ? 'mở khóa' : 'khóa'} tài khoản này?`)) return;
        await toggleUserBan(userId, currentBan);
        loadUsers(); // Refresh
    };

    const handleChangeRole = async (userId: string, newRole: User['badgeType']) => {
        let badgeTitle = 'Thành viên';
        if (newRole === 'admin') badgeTitle = 'Quản trị viên';
        if (newRole === 'expert') badgeTitle = 'Chuyên gia';
        if (newRole === 'vip') badgeTitle = 'Thành viên VIP';
        
        await updateUserRole(userId, newRole, badgeTitle);
        loadUsers();
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Xóa bài viết này vĩnh viễn?")) return;
        await deleteDoc(doc(db, "posts", postId));
        loadContent();
    };

    const handleSaveSettings = async () => {
        if (!settings) return;
        setIsLoading(true);
        await saveSystemSettings(settings);
        alert("Đã lưu cài đặt hệ thống!");
        setIsLoading(false);
    };

    // --- RENDERERS ---

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-bold">Tổng thành viên</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalUsers || 0}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24}/></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-bold">Bài viết & Blog</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalPosts || 0}</h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><FileText size={24}/></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-bold">Cộng đồng</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalCommunities || 0}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users size={24}/></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-bold">Điểm đã cấp</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalPointsDistributed || 0}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Shield size={24}/></div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg font-heading">Quản lý người dùng</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Tìm kiếm..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"/>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Vai trò</th>
                            <th className="px-6 py-3">Điểm</th>
                            <th className="px-6 py-3">Trạng thái</th>
                            <th className="px-6 py-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 flex items-center">
                                    <img src={u.avatar} className="w-8 h-8 rounded-full mr-3"/>
                                    <div>
                                        <div className="font-bold text-gray-800">{u.name}</div>
                                        <div className="text-xs text-gray-400">{u.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={u.badgeType || 'new'} 
                                        onChange={(e) => handleChangeRole(u.id, e.target.value as any)}
                                        className="border-none bg-transparent font-medium text-gray-700 focus:ring-0 cursor-pointer"
                                    >
                                        <option value="new">Thành viên</option>
                                        <option value="vip">VIP</option>
                                        <option value="expert">Chuyên gia</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 font-bold text-orange-500">{u.points}</td>
                                <td className="px-6 py-4">
                                    {u.isBanned ? (
                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">Banned</span>
                                    ) : (
                                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">Active</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button size="sm" variant={u.isBanned ? "primary" : "outline"} onClick={() => handleBanUser(u.id, !!u.isBanned)} className="text-xs">
                                        {u.isBanned ? "Mở khóa" : "Khóa"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderContent = () => (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-lg font-heading">Bài viết mới nhất</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Tiêu đề / Nội dung</th>
                                <th className="px-6 py-3">Tác giả</th>
                                <th className="px-6 py-3">Danh mục</th>
                                <th className="px-6 py-3">Ngày đăng</th>
                                <th className="px-6 py-3 text-right">Xóa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {posts.slice(0, 10).map(p => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 max-w-xs truncate" title={p.content}>{p.title || p.content}</td>
                                    <td className="px-6 py-4">{p.user.name}</td>
                                    <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{p.category}</span></td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">{p.createdAt}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDeletePost(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    );

    const renderSettings = () => {
        if (!settings) return <div className="p-10 text-center"><Loader2 className="animate-spin inline"/></div>;
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in max-w-3xl">
                <h3 className="font-bold text-xl font-heading mb-6 flex items-center"><Settings className="mr-2"/> Cấu hình hệ thống</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tên Website</label>
                        <input type="text" value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả (SEO)</label>
                        <textarea value={settings.description} onChange={(e) => setSettings({...settings, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 h-20"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Màu chủ đạo</label>
                             <div className="flex items-center space-x-2">
                                <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({...settings, primaryColor: e.target.value})} className="h-10 w-20 rounded cursor-pointer"/>
                                <span className="text-gray-500 text-sm">{settings.primaryColor}</span>
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Email liên hệ</label>
                             <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2"/>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="font-bold text-gray-800 mb-4">Tính năng & API</h4>
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" checked={settings.enableAI} onChange={(e) => setSettings({...settings, enableAI: e.target.checked})} className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"/>
                                <span className="text-gray-700 font-medium">Bật Chat AI & OpenAI Features</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" checked={settings.enableAds} onChange={(e) => setSettings({...settings, enableAds: e.target.checked})} className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"/>
                                <span className="text-gray-700 font-medium">Hiển thị Quảng cáo</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} className="w-5 h-5 text-red-500 rounded focus:ring-red-500"/>
                                <span className="text-red-600 font-bold">Chế độ bảo trì (Chỉ Admin truy cập được)</span>
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                         <h4 className="font-bold text-gray-800 mb-4">Cấu hình điểm thưởng</h4>
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Điểm / Bài viết</label>
                                <input type="number" value={settings.pointsPerPost} onChange={(e) => setSettings({...settings, pointsPerPost: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2"/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Điểm / Bình luận</label>
                                <input type="number" value={settings.pointsPerComment} onChange={(e) => setSettings({...settings, pointsPerComment: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-2"/>
                            </div>
                         </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSaveSettings} disabled={isLoading} className="px-8">
                            {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>} Lưu cấu hình
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN LAYOUT ---

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-slate-800 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center font-bold text-white mr-3 font-heading">A</div>
                    <div>
                        <h2 className="font-bold font-heading text-lg">Admin Panel</h2>
                        <p className="text-xs text-slate-400">Asking System v2.0</p>
                    </div>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => setCurrentTab('overview')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${currentTab === 'overview' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <LayoutDashboard size={20}/> <span className="font-bold">Tổng quan</span>
                    </button>
                    <button onClick={() => setCurrentTab('users')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${currentTab === 'users' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Users size={20}/> <span className="font-bold">Người dùng</span>
                    </button>
                    <button onClick={() => setCurrentTab('content')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${currentTab === 'content' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <FileText size={20}/> <span className="font-bold">Nội dung</span>
                    </button>
                    <button onClick={() => setCurrentTab('games')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${currentTab === 'games' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Gamepad2 size={20}/> <span className="font-bold">Games Hub</span>
                    </button>
                    <button onClick={() => setCurrentTab('settings')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${currentTab === 'settings' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Settings size={20}/> <span className="font-bold">Cài đặt</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={onClose} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-slate-800 transition-colors">
                        <LogOut size={20}/> <span className="font-bold">Thoát Admin</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-10">
                    <h2 className="font-bold text-xl text-gray-800 font-heading capitalize">{currentTab === 'overview' ? 'Tổng quan hệ thống' : currentTab === 'users' ? 'Quản lý thành viên' : currentTab}</h2>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="font-bold text-gray-800 text-sm">{currentUser.name}</div>
                            <div className="text-xs text-primary-500 font-bold uppercase">Super Admin</div>
                        </div>
                        <img src={currentUser.avatar} className="w-10 h-10 rounded-full border border-gray-200"/>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {currentTab === 'overview' && renderOverview()}
                    {currentTab === 'users' && renderUsers()}
                    {currentTab === 'content' && renderContent()}
                    {currentTab === 'games' && <div className="text-center p-20 text-gray-400">Tính năng quản lý Game đang phát triển...</div>}
                    {currentTab === 'settings' && renderSettings()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;