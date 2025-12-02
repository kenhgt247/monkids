import React, { useState, useEffect } from 'react';
import { ViewState, Post, User, Comment } from './types';
import { mockGames } from './services/mockData';
import PostCard from './components/PostCard';
import MemoryGame from './pages/MemoryGame';
import ChatAssistant from './pages/ChatAssistant';
import CreatePost from './components/CreatePost';
import AuthPage from './pages/AuthPage';
import Button from './components/Button';
import { 
  Home, MessageCircle, BookOpen, FileText, Gamepad2, Search, Menu, X, Bell, Sparkles, Plus, LogOut, LogIn, Loader2, Star
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
    collection, addDoc, query, orderBy, onSnapshot, 
    doc, updateDoc, arrayUnion, increment, getDoc 
} from 'firebase/firestore';
import { addPoints, POINTS } from './services/userService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Lắng nghe trạng thái đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // Khi có user đăng nhập, thử lấy profile
            try {
                const userRef = doc(db, "users", firebaseUser.uid);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    setUser(userSnap.data() as User);
                } else {
                    // Fallback
                    setUser({
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || 'User',
                        avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'U'}&background=random`,
                        email: firebaseUser.email || '',
                        points: 0,
                        badge: 'Thành viên mới',
                        badgeType: 'new'
                    });
                }
                // Tự động đóng form auth nếu đang mở
                setShowAuth(false);
            } catch (e) {
                console.error("Error fetching user profile:", e);
                // Vẫn set user cơ bản để app hoạt động
                setUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'User',
                    avatar: firebaseUser.photoURL || '',
                    email: firebaseUser.email || '',
                    points: 0,
                    badge: 'Mới',
                    badgeType: 'new'
                 });
                 setShowAuth(false);
            }
        } else {
            setUser(null);
        }
    });

    return () => unsubscribe();
  }, []);

  // 2. Lắng nghe thay đổi điểm số của User hiện tại (Realtime)
  useEffect(() => {
      if (!user?.id) return;
      
      const userRef = doc(db, "users", user.id);
      const unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
              setUser(prev => ({ ...prev, ...doc.data() } as User));
          }
      });

      return () => unsubscribe();
  }, [user?.id]);

  // 3. Tải bài viết từ Firestore (Realtime)
  useEffect(() => {
    setIsLoading(true);
    // Sử dụng snapshot để real-time update
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedPosts: Post[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Map lại trạng thái like cho user hiện tại
                isLiked: data.likedBy ? data.likedBy.includes(user?.id || '') : false
            } as Post;
        });
        setPosts(fetchedPosts);
        setIsLoading(false);
    }, (error) => {
        console.error("Error loading posts:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]); // Re-run khi user đổi để cập nhật trạng thái isLiked

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    setShowAuth(false);
  };

  const handleLogout = async () => {
      await signOut(auth);
      setCurrentView(ViewState.HOME);
  };

  const requireAuth = () => {
      if (!user) {
          setShowAuth(true);
          return false;
      }
      return true;
  };

  // --- ACTIONS WITH FIREBASE ---

  const handleCreatePost = async (content: string, title?: string, imageUrl?: string, videoUrl?: string, category: Post['category'] = 'Status') => {
    if (!user) return;

    try {
        const newPost = {
            userId: user.id,
            user: user, // Lưu snapshot user tại thời điểm đăng
            title: title || '',
            content: content,
            category: category,
            tags: category === 'QnA' ? ['Hỏi đáp'] : ['Chia sẻ'],
            likes: 0,
            likedBy: [],
            comments: [],
            createdAt: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
            timestamp: Date.now(),
            imageUrl: imageUrl || '',
            videoUrl: videoUrl || ''
        };

        // 1. Lưu bài viết
        await addDoc(collection(db, "posts"), newPost);
        
        // 2. Cộng điểm cho người đăng
        await addPoints(user.id, POINTS.CREATE_POST);

    } catch (e) {
        console.error("Error adding post: ", e);
        alert("Có lỗi khi đăng bài, vui lòng kiểm tra kết nối mạng.");
    }
  };

  const handleLike = async (postId: string) => {
    if (!requireAuth()) return;
    if (!user) return;

    try {
        const postRef = doc(db, "posts", postId);
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const isLiked = post.likedBy?.includes(user.id);

        if (isLiked) {
            // Unlike (Bỏ thích)
            await updateDoc(postRef, {
                likes: increment(-1),
                likedBy: post.likedBy?.filter(id => id !== user.id)
            });
        } else {
            // Like (Thích)
            await updateDoc(postRef, {
                likes: increment(1),
                likedBy: arrayUnion(user.id)
            });
            // Cộng điểm cho chủ bài viết (nếu không phải tự like)
            if (post.userId !== user.id) {
                await addPoints(post.userId, POINTS.GET_LIKE);
            }
        }
    } catch (e) {
        console.error("Error like: ", e);
    }
  };

  const handleComment = async (postId: string, content: string) => {
      if (!user) return;

      try {
        const newComment: Comment = {
            id: `c_${Date.now()}`,
            userId: user.id,
            user: user,
            content: content,
            createdAt: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            likedBy: []
        };

        const postRef = doc(db, "posts", postId);
        
        // 1. Update Post
        await updateDoc(postRef, {
            comments: arrayUnion(newComment)
        });

        // 2. Cộng điểm người comment
        await addPoints(user.id, POINTS.COMMENT);

      } catch (e) {
          console.error("Error comment: ", e);
      }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
      if (!requireAuth()) return;
      if (!user) return;

      try {
          const post = posts.find(p => p.id === postId);
          if (!post) return;

          // Vì comment nằm trong mảng, ta cần copy mảng, sửa item, và lưu đè lại
          // (Firestore không hỗ trợ update 1 item trong mảng dễ dàng nếu không biết chính xác object)
          const updatedComments = post.comments.map(c => {
              if (c.id === commentId) {
                  const currentLikes = c.likedBy || [];
                  const isLiked = currentLikes.includes(user.id);
                  
                  return {
                      ...c,
                      likedBy: isLiked 
                        ? currentLikes.filter(id => id !== user.id) 
                        : [...currentLikes, user.id]
                  };
              }
              return c;
          });

          const postRef = doc(db, "posts", postId);
          await updateDoc(postRef, {
              comments: updatedComments
          });
      } catch (e) {
          console.error("Error like comment: ", e);
      }
  };

  // --- RENDERERS ---

  if (showAuth) {
      return <AuthPage onLogin={handleLoginSuccess} onCancel={() => setShowAuth(false)} />;
  }

  const renderStories = () => (
    <div className="flex gap-3 mb-6 overflow-x-auto pb-4 no-scrollbar">
        {/* User Story Card */}
        {user ? (
            <div className="shrink-0 w-28 h-48 rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm border border-gray-200 bg-white hover:shadow-md transition-all">
                <img src={user.avatar} className="w-full h-3/4 object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Me" />
                <div className="absolute bottom-0 w-full h-1/4 bg-white flex flex-col items-center justify-start z-10">
                    <div className="absolute -top-4 w-8 h-8 bg-primary-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm">
                        <Plus size={16} />
                    </div>
                    <span className="text-xs font-bold text-gray-800 mt-5">Tạo tin</span>
                </div>
            </div>
        ) : (
            <div 
                onClick={() => setShowAuth(true)}
                className="shrink-0 w-28 h-48 rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm border border-dashed border-primary-300 bg-primary-50 hover:bg-primary-100 transition-all flex flex-col items-center justify-center text-center p-2"
            >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-500 mb-2 shadow-sm">
                    <LogIn size={20} />
                </div>
                <span className="text-xs font-bold text-primary-600">Đăng nhập để đăng tin</span>
            </div>
        )}
        
        {/* Mock Stories for UI fullness */}
        {[1, 2, 3, 4].map((item) => (
            <div key={item} className="shrink-0 w-28 h-48 rounded-2xl overflow-hidden relative cursor-pointer group shadow-sm hover:shadow-md transition-all">
                <img 
                    src={`https://picsum.photos/seed/story${item}/200/300`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt="Story" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
                <div className="absolute top-2 left-2 w-9 h-9 rounded-full border-2 border-primary-500 p-0.5 bg-white">
                     <img src={`https://picsum.photos/seed/user${item + 10}/100/100`} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="absolute bottom-3 left-3 text-white text-xs font-bold truncate w-20">Mẹ Bé {item}</span>
            </div>
        ))}
    </div>
  );

  const renderFeed = (filterCategory?: string) => {
      let filteredPosts = posts;
      if (filterCategory) {
          filteredPosts = posts.filter(p => p.category === filterCategory);
      }
      
      return (
        <div className="w-full">
            {currentView === ViewState.HOME && renderStories()}
            
            {user && (currentView === ViewState.HOME || currentView === ViewState.QNA || currentView === ViewState.BLOG) && (
                <CreatePost currentUser={user} onPost={handleCreatePost} />
            )}

            {!user && (currentView === ViewState.HOME) && (
                 <div className="bg-gradient-to-r from-primary-500 to-pink-500 rounded-2xl p-6 mb-6 text-white flex items-center justify-between shadow-lg shadow-primary-200">
                    <div>
                        <h3 className="font-bold text-xl mb-1">Tham gia cộng đồng Mom&Kids</h3>
                        <p className="text-primary-100 text-sm">Đăng nhập để chia sẻ, tích điểm đổi quà và lưu lại những khoảnh khắc đáng nhớ.</p>
                    </div>
                    <Button onClick={() => setShowAuth(true)} className="bg-white text-primary-600 hover:bg-gray-50 border-none shrink-0 ml-4">Đăng nhập ngay</Button>
                 </div>
            )}

            {currentView === ViewState.QNA && (
                 <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    {['Tất cả', 'Dinh dưỡng', 'Giấc ngủ', 'Bệnh lý', 'Tâm lý'].map((tag, i) => (
                        <button key={tag} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary-500 text-white shadow-md shadow-primary-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                            {tag}
                        </button>
                    ))}
                 </div>
            )}
            
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary-500 mb-2" size={32} />
                        <p className="text-gray-400 text-sm">Đang tải dữ liệu từ cộng đồng...</p>
                    </div>
                ) : filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            currentUser={user}
                            onLike={handleLike}
                            onComment={handleComment}
                            onLikeComment={handleLikeComment}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!</p>
                    </div>
                )}
            </div>
        </div>
      )
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewState.HOME: return renderFeed();
      case ViewState.QNA:
        return (
          <div className="w-full">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Hỏi đáp & Chia sẻ</h2>
             </div>
             {renderFeed('QnA')}
          </div>
        );
      case ViewState.BLOG:
        return (
          <div className="w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Góc Chia Sẻ - Blog</h2>
            {renderFeed('Blog')}
          </div>
        );
      case ViewState.DOCS:
        return (
          <div className="w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Kho Tài Liệu</h2>
            {renderFeed('Document')}
          </div>
        );
      case ViewState.GAMES:
        return (
           <div className="w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Góc Bé Vui Chơi</h2>
                <MemoryGame />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {mockGames.filter(g => g.type !== 'memory').map(game => (
                        <div key={game.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-all cursor-pointer group">
                            <img src={game.thumbnail} alt={game.title} className="w-20 h-20 rounded-xl object-cover group-hover:scale-105 transition-transform" />
                            <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-primary-600 transition-colors">{game.title}</h4>
                                <p className="text-sm text-gray-500">{game.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
           </div>
        );
      case ViewState.AI_ASSISTANT:
        return (
          <div className="w-full max-w-3xl mx-auto">
            <ChatAssistant />
          </div>
        );
      default: return <div>Nội dung không tồn tại</div>;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full p-3.5 rounded-2xl transition-all ${
        currentView === view 
          ? 'bg-primary-50 text-primary-600 font-bold shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon size={22} strokeWidth={currentView === view ? 2.5 : 2}/>
      <span className="text-base">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-['Quicksand'] text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1440px] mx-auto px-4 h-18 py-3 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentView(ViewState.HOME)}>
                <div className="w-10 h-10 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-200 group-hover:rotate-6 transition-transform">
                    MK
                </div>
                <span className="font-bold text-2xl text-gray-800 hidden sm:block tracking-tight group-hover:text-primary-600 transition-colors">
                    Mom<span className="text-primary-500">&</span>Kids
                </span>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm kinh nghiệm, tài liệu, trò chơi..." 
                    className="w-full bg-gray-100/80 border border-transparent group-focus-within:bg-white group-focus-within:border-primary-200 group-focus-within:ring-4 group-focus-within:ring-primary-50 rounded-2xl py-3 pl-12 pr-4 focus:outline-none transition-all placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
                {user && (
                    <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors">
                        <Bell size={22} />
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    </button>
                )}
                
                {user ? (
                    <>
                        <div className="flex items-center space-x-2 bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md pr-4 pl-1 py-1 rounded-full transition-all cursor-pointer group">
                            <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-gray-100 group-hover:scale-105 transition-transform object-cover" />
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-bold text-gray-700 leading-tight group-hover:text-primary-600">{user.name}</p>
                                <div className="flex items-center text-[10px] font-medium uppercase tracking-wide text-gray-500">
                                    <span className="text-primary-600 font-bold mr-1">{user.points || 0} pts</span>
                                    <span>• {user.badge}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="hidden sm:flex items-center justify-center w-10 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Đăng xuất"
                        >
                            <LogOut size={20} />
                        </button>
                    </>
                ) : (
                    <Button onClick={() => setShowAuth(true)} size="sm">
                        Đăng nhập
                    </Button>
                )}

                <button 
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 p-4 md:p-6">
        
        {/* Left Sidebar (Navigation) - Col Span 3 */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-3 xl:col-span-2 sticky top-28 h-fit space-y-2">
            <NavItem view={ViewState.HOME} icon={Home} label="Bảng tin" />
            <NavItem view={ViewState.QNA} icon={MessageCircle} label="Hỏi đáp" />
            <NavItem view={ViewState.BLOG} icon={BookOpen} label="Góc chia sẻ" />
            <NavItem view={ViewState.DOCS} icon={FileText} label="Tài liệu" />
            <NavItem view={ViewState.GAMES} icon={Gamepad2} label="Kids Games" />
            
            <div className="pt-6 mt-6 border-t border-gray-200/60">
                <button 
                  onClick={() => setCurrentView(ViewState.AI_ASSISTANT)}
                  className={`group relative flex items-center space-x-3 w-full p-4 rounded-2xl transition-all overflow-hidden ${
                    currentView === ViewState.AI_ASSISTANT
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-white border border-gray-200 text-gray-700 hover:shadow-lg hover:border-violet-200'
                  }`}
                >
                   <div className="relative z-10 flex items-center space-x-3">
                        <Sparkles size={22} className={currentView !== ViewState.AI_ASSISTANT ? 'text-violet-500' : ''} />
                        <span className="font-bold">Trợ lý AI</span>
                   </div>
                   {currentView !== ViewState.AI_ASSISTANT && (
                       <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   )}
                </button>
            </div>
        </aside>

        {/* Center Feed (Content) */}
        <main className="col-span-1 md:col-span-9 lg:col-span-6 xl:col-span-7 min-w-0">
            {renderContent()}
        </main>

        {/* Right Sidebar (Widgets) */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 sticky top-28 h-fit space-y-6">
            
            {/* Gamification Widget */}
            {user && (
                 <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-200 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Star className="text-white" size={20} fill="currentColor" />
                            </div>
                            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full uppercase">{user.badge}</span>
                        </div>
                       
                        <h4 className="font-bold text-2xl mb-1">{user.points} Điểm</h4>
                        <p className="text-orange-50 text-sm mb-4">Tích thêm {1000 - (user.points || 0)} điểm để lên hạng Chuyên Gia!</p>
                        
                        <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden">
                            <div className="bg-white h-full rounded-full" style={{ width: `${Math.min(((user.points || 0) / 1000) * 100, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
            )}

            {currentView !== ViewState.AI_ASSISTANT && (
                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <h4 className="font-bold text-xl mb-2">Cần lời khuyên gấp?</h4>
                        <p className="text-indigo-50 text-sm mb-6 leading-relaxed opacity-90">Mẹ Thông Thái AI luôn sẵn sàng trả lời mọi thắc mắc của bạn 24/7 về sức khỏe, dinh dưỡng và nuôi dạy bé.</p>
                        <Button 
                            onClick={() => setCurrentView(ViewState.AI_ASSISTANT)}
                            className="bg-white text-indigo-600 hover:bg-indigo-50 w-full font-bold shadow-lg border-none"
                        >
                            Chat ngay
                        </Button>
                    </div>
                </div>
            )}
        </aside>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl p-5 space-y-3 animate-slide-in flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <span className="font-bold text-xl text-primary-600">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
                </div>
                <NavItem view={ViewState.HOME} icon={Home} label="Bảng tin" />
                <NavItem view={ViewState.QNA} icon={MessageCircle} label="Hỏi đáp" />
                <NavItem view={ViewState.BLOG} icon={BookOpen} label="Góc chia sẻ" />
                <NavItem view={ViewState.DOCS} icon={FileText} label="Tài liệu" />
                <NavItem view={ViewState.GAMES} icon={Gamepad2} label="Kids Games" />
                <NavItem view={ViewState.AI_ASSISTANT} icon={Sparkles} label="Trợ lý AI" />
                
                <div className="mt-auto pt-6 border-t">
                    {user ? (
                        <button onClick={handleLogout} className="flex items-center space-x-3 text-red-500 font-medium p-2 hover:bg-red-50 rounded-xl w-full">
                            <LogOut size={20}/> <span>Đăng xuất</span>
                        </button>
                    ) : (
                        <button onClick={() => {setShowAuth(true); setIsMobileMenuOpen(false);}} className="flex items-center space-x-3 text-primary-500 font-medium p-2 hover:bg-primary-50 rounded-xl w-full">
                            <LogIn size={20}/> <span>Đăng nhập</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        <button onClick={() => setCurrentView(ViewState.HOME)} className={`flex flex-col items-center p-2 ${currentView === ViewState.HOME ? 'text-primary-500' : 'text-gray-400'}`}>
            <Home size={24} strokeWidth={currentView === ViewState.HOME ? 2.5 : 2} />
        </button>
         <button onClick={() => setCurrentView(ViewState.QNA)} className={`flex flex-col items-center p-2 ${currentView === ViewState.QNA ? 'text-primary-500' : 'text-gray-400'}`}>
            <MessageCircle size={24} strokeWidth={currentView === ViewState.QNA ? 2.5 : 2} />
        </button>
        <div className="relative -top-6">
             <button 
                onClick={() => setCurrentView(ViewState.AI_ASSISTANT)}
                className="w-14 h-14 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-200 border-4 border-white hover:scale-105 transition-transform"
             >
                <Sparkles size={24} fill="white" />
            </button>
        </div>
        <button onClick={() => setCurrentView(ViewState.GAMES)} className={`flex flex-col items-center p-2 ${currentView === ViewState.GAMES ? 'text-primary-500' : 'text-gray-400'}`}>
            <Gamepad2 size={24} strokeWidth={currentView === ViewState.GAMES ? 2.5 : 2} />
        </button>
         <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center p-2 text-gray-400">
            <Menu size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;