
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Post, User, Comment, Community, Notification } from './types';
import { mockGames } from './services/mockData';
import PostCard from './components/PostCard';
import MemoryGame from './pages/MemoryGame';
import ChatAssistant from './pages/ChatAssistant';
import CreatePost from './components/CreatePost';
import AuthPage from './pages/AuthPage';
import Button from './components/Button';
import CommunityCard from './components/CommunityCard';
import { 
  Home, MessageCircle, BookOpen, FileText, Gamepad2, Search, Menu, X, Bell, Sparkles, Plus, LogOut, LogIn, Loader2, Star, Users, ArrowLeft, Heart, Shield, Award, MapPin, Layers, HelpCircle, PenTool, UserPlus, UserCheck
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
    collection, addDoc, query, orderBy, onSnapshot, 
    doc, updateDoc, arrayUnion, increment, getDoc, arrayRemove, where, getDocs, limit, setDoc 
} from 'firebase/firestore';
import { addPoints, POINTS, createNotification } from './services/userService';

// --- SEED DATA ---
const DEFAULT_COMMUNITIES: Partial<Community>[] = [
    { id: 'com_bimsua', name: 'Cộng đồng Mẹ Bỉm Sữa', description: 'Nơi chia sẻ tâm sự, kinh nghiệm chăm con mọn, bỉm sữa của các mẹ trên toàn quốc.', coverUrl: 'https://picsum.photos/seed/bimsua_cover/800/300', avatarUrl: 'https://picsum.photos/seed/bimsua_ava/100/100', memberCount: 12500, tags: ['Chăm sóc bé', 'Tâm sự'] },
    { id: 'com_andam', name: 'Ăn Dặm Không Nước Mắt', description: 'Chia sẻ thực đơn ăn dặm, phương pháp BLW, ăn dặm kiểu Nhật giúp bé ăn ngon.', coverUrl: 'https://picsum.photos/seed/andam_cover/800/300', avatarUrl: 'https://picsum.photos/seed/andam_ava/100/100', memberCount: 8400, tags: ['Dinh dưỡng', 'Nấu ăn'] },
    { id: 'com_giaoduc', name: 'Giáo Dục Sớm (EASY, Montessori)', description: 'Cùng nhau áp dụng các phương pháp giáo dục sớm để phát triển tư duy cho trẻ.', coverUrl: 'https://picsum.photos/seed/giaoduc_cover/800/300', avatarUrl: 'https://picsum.photos/seed/giaoduc_ava/100/100', memberCount: 5600, tags: ['Giáo dục', 'Kỹ năng'] },
    { id: 'com_mekun', name: 'Cộng Đồng Mẹ Kun', description: 'Hội các mẹ yêu thích sữa Kun và các hoạt động vui chơi năng động cho bé.', coverUrl: 'https://picsum.photos/seed/kun_cover/800/300', avatarUrl: 'https://picsum.photos/seed/kun_ava/100/100', memberCount: 3200, tags: ['Vui chơi', 'Sự kiện'] }
];

// --- MOCK STORIES FOR UI ---
const STORIES = [
    { id: 1, name: 'Mẹ Bé 1', img: 'https://picsum.photos/seed/story1/200/300', avatar: 'https://picsum.photos/seed/u5/50/50' },
    { id: 2, name: 'Mẹ Bé 2', img: 'https://picsum.photos/seed/story2/200/300', avatar: 'https://picsum.photos/seed/u6/50/50' },
    { id: 3, name: 'Mẹ Bé 3', img: 'https://picsum.photos/seed/story3/200/300', avatar: 'https://picsum.photos/seed/u7/50/50' },
    { id: 4, name: 'Mẹ Bé 4', img: 'https://picsum.photos/seed/story4/200/300', avatar: 'https://picsum.photos/seed/u8/50/50' },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedFilter, setFeedFilter] = useState<string>('All');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Refs for click outside
  const notificationRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  
  // Profile State
  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null);

  // Seed Communities
  useEffect(() => {
      const seedCommunities = async () => {
          const comRef = collection(db, 'communities');
          const snapshot = await getDocs(query(comRef, limit(1)));
          if (snapshot.empty) {
              for (const com of DEFAULT_COMMUNITIES) {
                  if (com.id) await setDoc(doc(db, 'communities', com.id), { ...com, members: [], memberCount: com.memberCount });
              }
          }
      };
      seedCommunities();
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            try {
                const userRef = doc(db, "users", firebaseUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) setUser(userSnap.data() as User);
                else {
                     // Auto create if not exists
                     const newUser: User = {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || 'User',
                        avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'U'}&background=random`,
                        email: firebaseUser.email || '',
                        points: 0,
                        badge: 'Thành viên mới',
                        badgeType: 'new',
                        followedCommunities: [],
                        followers: [],
                        following: []
                    };
                    await setDoc(userRef, newUser);
                    setUser(newUser);
                }
                setShowAuth(false);
            } catch (e) {
                console.error("Error fetching user profile:", e);
                setUser({ id: firebaseUser.uid, name: firebaseUser.displayName || 'User', avatar: firebaseUser.photoURL || '', email: firebaseUser.email || '', points: 0, badge: 'Mới', badgeType: 'new', followedCommunities: [], followers: [], following: [] });
                setShowAuth(false);
            }
        } else {
            setUser(null);
        }
    });
    return () => unsubscribe();
  }, []);

  // Sync User Data
  useEffect(() => {
      if (!user?.id) return;
      const unsubscribe = onSnapshot(doc(db, "users", user.id), (doc) => {
          if (doc.exists()) setUser(prev => ({ ...prev, ...doc.data() } as User));
      });
      return () => unsubscribe();
  }, [user?.id]);

  // Notifications
  useEffect(() => {
      if (!user?.id) { setNotifications([]); return; }
      const q = query(collection(db, "notifications"), where("toUserId", "==", user.id), limit(20));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
          notifs.sort((a, b) => b.timestamp - a.timestamp);
          setNotifications(notifs);
          setUnreadCount(notifs.filter(n => !n.isRead).length);
      });
      return () => unsubscribe();
  }, [user?.id]);

  // Click Outside to Close Notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showNotifications &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Communities
  useEffect(() => {
      const unsubscribe = onSnapshot(query(collection(db, "communities")), (snapshot) => {
          setCommunities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community)));
      });
      return () => unsubscribe();
  }, []);

  // Posts
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(query(collection(db, "posts"), orderBy("timestamp", "desc")), (snapshot) => {
        let fetchedPosts: Post[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data, isLiked: data.likedBy ? data.likedBy.includes(user?.id || '') : false } as Post;
        });

        if (currentView === ViewState.COMMUNITY_DETAIL && activeCommunity) {
            fetchedPosts = fetchedPosts.filter(p => p.communityId === activeCommunity.id);
        }
        if (currentView === ViewState.PROFILE && viewProfileUser) {
            fetchedPosts = fetchedPosts.filter(p => p.userId === viewProfileUser.id);
        }

        setPosts(fetchedPosts);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user?.id, currentView, activeCommunity, viewProfileUser]); 

  // --- ACTIONS ---

  const handleLoginSuccess = (u: User) => { setUser(u); setShowAuth(false); };
  const handleLogout = async () => { await signOut(auth); setCurrentView(ViewState.HOME); setNotifications([]); };
  const requireAuth = () => { if (!user) { setShowAuth(true); return false; } return true; };

  const handleCreatePost = async (content: string, title?: string, imageUrl?: string, videoUrl?: string, audioUrl?: string, fileUrl?: string, category: Post['category'] = 'Status', downloadCost: number = 0) => {
    if (!user) return;
    try {
        const newPost: any = {
            userId: user.id, user: user, title: title || '', content: content, category: category,
            tags: category === 'QnA' ? ['Hỏi đáp'] : category === 'Document' ? ['Tài liệu'] : ['Chia sẻ'],
            likes: 0, likedBy: [], comments: [],
            createdAt: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
            timestamp: Date.now(), imageUrl: imageUrl || '', videoUrl: videoUrl || '', audioUrl: audioUrl || '', fileUrl: fileUrl || '',
            downloadCost: category === 'Document' ? downloadCost : 0
        };
        if (currentView === ViewState.COMMUNITY_DETAIL && activeCommunity) {
            newPost.communityId = activeCommunity.id;
            newPost.communityName = activeCommunity.name;
            newPost.tags.push(activeCommunity.name);
        }
        await addDoc(collection(db, "posts"), newPost);
        await addPoints(user.id, POINTS.CREATE_POST);
    } catch (e) { alert("Có lỗi khi đăng bài."); }
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
            await updateDoc(postRef, { likes: increment(-1), likedBy: arrayRemove(user.id) });
        } else {
            await updateDoc(postRef, { likes: increment(1), likedBy: arrayUnion(user.id) });
            if (post.userId !== user.id) {
                await addPoints(post.userId, POINTS.GET_LIKE);
                await createNotification(post.userId, 'like', 'đã thích bài viết của bạn', user, postId);
            }
        }
    } catch (e) { console.error(e); }
  };

  const handleComment = async (postId: string, content: string) => {
      if (!user) { if(!requireAuth()) return; return; }
      try {
        const newComment: Comment = { id: `c_${Date.now()}`, userId: user.id, user: user, content: content, createdAt: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' }), likedBy: [] };
        await updateDoc(doc(db, "posts", postId), { comments: arrayUnion(newComment) });
        const post = posts.find(p => p.id === postId);
        if (post && post.userId !== user.id) {
            await addPoints(user.id, POINTS.COMMENT);
            await createNotification(post.userId, 'comment', 'đã bình luận về bài viết của bạn', user, postId);
        }
      } catch (e) { console.error(e); }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
      if (!requireAuth() || !user) return;
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      const updatedComments = post.comments.map(c => {
          if (c.id === commentId) {
              const currentLikes = c.likedBy || [];
              const isLiked = currentLikes.includes(user.id);
              return { ...c, likedBy: isLiked ? currentLikes.filter(id => id !== user.id) : [...currentLikes, user.id] };
          }
          return c;
      });
      await updateDoc(doc(db, "posts", postId), { comments: updatedComments });
  };

  const handleSharePost = async () => {
      if (!requireAuth() || !user) return;
      await addPoints(user.id, POINTS.SHARE);
      alert(`Đã chia sẻ thành công! +${POINTS.SHARE} điểm.`);
  };

  const handleDownload = async (post: Post) => {
      if (!requireAuth() || !user || !post.fileUrl) return;
      
      const cost = post.downloadCost !== undefined ? post.downloadCost : 0;
      
      // Kiểm tra điểm nếu phí > 0
      if (cost > 0) {
          if (user.id === post.userId) {
              // Chủ bài viết tải miễn phí
          } else {
              if ((user.points || 0) < cost) { 
                  alert(`Bạn cần ${cost} điểm để tải tài liệu này.`); 
                  return; 
              }
              
              if (!window.confirm(`Tài liệu này tốn ${cost} điểm. Bạn có chắc chắn muốn tải không?`)) {
                  return;
              }

              // Trừ điểm người tải
              const deductSuccess = await addPoints(user.id, -cost);
              if (!deductSuccess) {
                  alert("Không đủ điểm hoặc lỗi hệ thống.");
                  return;
              }
              
              // Cộng điểm cho người đăng
              await addPoints(post.userId, cost);
              await createNotification(post.userId, 'award', `đã tải tài liệu của bạn (+${cost} điểm)`, user, post.id);
          }
      }

      // Logic tải file mạnh mẽ hơn bằng Blob
      try {
          const response = await fetch(post.fileUrl);
          if (!response.ok) throw new Error("Network response was not ok");
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          // Lấy tên file từ URL hoặc title
          let filename = post.title ? `${post.title}.pdf` : 'downloaded_file';
          // Cố gắng đoán đuôi file
          if (post.fileUrl.includes('.doc')) filename = filename.replace('.pdf', '.doc');
          if (post.fileUrl.includes('.docx')) filename = filename.replace('.pdf', '.docx');
          
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
      } catch (err) {
          console.error("Download failed via Blob, trying fallback", err);
          // Fallback mở tab mới nếu fetch bị CORS chặn (thường xảy ra với link ngoài)
          window.open(post.fileUrl, '_blank');
      }
  };

  const handleFollowUser = async (targetUserId: string) => {
      if (!requireAuth() || !user) return;
      const isFollowing = user.following?.includes(targetUserId);

      // Optimistic update
      setUser(prev => {
          if(!prev) return null;
          const currentFollowing = prev.following || [];
          return {
              ...prev,
              following: isFollowing ? currentFollowing.filter(id => id !== targetUserId) : [...currentFollowing, targetUserId]
          }
      });
      
      // Update view profile user if viewing
      if (viewProfileUser && viewProfileUser.id === targetUserId) {
          setViewProfileUser(prev => {
              if(!prev) return null;
              const currentFollowers = prev.followers || [];
              return {
                  ...prev,
                  followers: isFollowing ? currentFollowers.filter(id => id !== user.id) : [...currentFollowers, user.id]
              }
          })
      }

      try {
          const myRef = doc(db, "users", user.id);
          const targetRef = doc(db, "users", targetUserId);

          if (isFollowing) {
              await updateDoc(myRef, { following: arrayRemove(targetUserId) });
              await updateDoc(targetRef, { followers: arrayRemove(user.id) });
          } else {
              await updateDoc(myRef, { following: arrayUnion(targetUserId) });
              await updateDoc(targetRef, { followers: arrayUnion(user.id) });
              await createNotification(targetUserId, 'follow', 'đã bắt đầu theo dõi bạn', user);
          }
      } catch (e) {
          console.error(e);
      }
  }

  const handleJoinCommunity = async (communityId: string) => {
      if (!requireAuth() || !user) return;

      // Optimistic Update
      setUser(prev => prev ? ({...prev, followedCommunities: [...(prev.followedCommunities || []), communityId]}) : null);

      try {
          await Promise.all([
             updateDoc(doc(db, "communities", communityId), { members: arrayUnion(user.id), memberCount: increment(1) }),
             updateDoc(doc(db, "users", user.id), { followedCommunities: arrayUnion(communityId) })
          ]);
          await createNotification(user.id, 'system', 'Bạn đã tham gia nhóm thành công!');
      } catch (e) { 
          console.error(e); 
      }
  };

  const handleLeaveCommunity = async (communityId: string) => {
      if (!requireAuth() || !user) return;
      
      setUser(prev => prev ? ({...prev, followedCommunities: (prev.followedCommunities || []).filter(id => id !== communityId)}) : null);

      try {
          await Promise.all([
            updateDoc(doc(db, "communities", communityId), { members: arrayRemove(user.id), memberCount: increment(-1) }),
            updateDoc(doc(db, "users", user.id), { followedCommunities: arrayRemove(communityId) })
          ]);
      } catch (e) { console.error(e); }
  };

  const goToCommunity = (communityId: string) => {
      const com = communities.find(c => c.id === communityId);
      if (com) {
        setActiveCommunity(com);
        setCurrentView(ViewState.COMMUNITY_DETAIL);
        window.scrollTo(0,0);
      }
  };

  const goToProfile = async (targetUser: User) => {
      // Fetch latest user data to ensure follow counts are accurate
      try {
        const userDoc = await getDoc(doc(db, "users", targetUser.id));
        if (userDoc.exists()) {
            setViewProfileUser(userDoc.data() as User);
        } else {
            setViewProfileUser(targetUser);
        }
      } catch (e) {
          setViewProfileUser(targetUser);
      }
      setCurrentView(ViewState.PROFILE);
      window.scrollTo(0,0);
  }

  // --- RENDERERS ---

  if (showAuth) return <AuthPage onLogin={handleLoginSuccess} onCancel={() => setShowAuth(false)} />;

  const renderFeed = (filterCategory?: string) => {
      let filteredPosts = posts;
      let matchedCommunities: Community[] = [];
      
      if (filterCategory) filteredPosts = posts.filter(p => p.category === filterCategory);
      else if (currentView === ViewState.HOME && feedFilter !== 'All' && !searchTerm) {
          filteredPosts = filteredPosts.filter(p => p.category === feedFilter);
      }
      
      const term = searchTerm.toLowerCase().trim();
      if (term) {
          filteredPosts = filteredPosts.filter(p => 
              p.content.toLowerCase().includes(term) || p.title?.toLowerCase().includes(term) ||
              p.user.name.toLowerCase().includes(term) || p.tags.some(tag => tag.toLowerCase().includes(term))
          );
          matchedCommunities = communities.filter(c => c.name.toLowerCase().includes(term));
      }

      return (
        <div className="w-full animate-fade-in">
            {/* --- STORY REEL (Only on Home & No Search) --- */}
            {currentView === ViewState.HOME && !searchTerm && (
                <div className="flex space-x-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Create Story */}
                    <div className="flex-shrink-0 w-28 h-40 bg-sky-200 rounded-2xl relative flex flex-col items-center justify-center cursor-pointer overflow-hidden group shadow-sm">
                        {user ? (
                             <img src={user.avatar} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"/>
                        ) : <div className="absolute inset-0 bg-sky-200"></div>}
                        <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-white text-primary-500 flex items-center justify-center mb-1 shadow-md group-hover:scale-110 transition-transform"><Plus size={20} strokeWidth={3} /></div>
                            <span className="text-xs font-bold text-gray-800">Tạo tin</span>
                        </div>
                    </div>
                    {/* Mock Stories */}
                    {STORIES.map(story => (
                        <div key={story.id} className="flex-shrink-0 w-28 h-40 bg-gray-200 rounded-2xl relative overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow">
                            <img src={story.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute top-2 left-2 p-0.5 rounded-full border-2 border-primary-500">
                                <img src={story.avatar} className="w-8 h-8 rounded-full border-2 border-white" />
                            </div>
                            <span className="absolute bottom-3 left-2 text-xs font-bold text-white shadow-black">{story.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {term && matchedCommunities.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Cộng đồng phù hợp</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matchedCommunities.map(com => (
                            <CommunityCard key={com.id} community={com} isJoined={user?.followedCommunities?.includes(com.id) || false} onJoin={handleJoinCommunity} onLeave={handleLeaveCommunity} onClick={() => goToCommunity(com.id)} />
                        ))}
                    </div>
                </div>
            )}
            
            {user && !searchTerm && currentView === ViewState.HOME && feedFilter === 'All' && (
                <CreatePost currentUser={user} onPost={handleCreatePost} />
            )}

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20"><Loader2 className="animate-spin text-primary-500 mb-2" size={32} /><p className="text-gray-400 text-sm">Đang tải dữ liệu...</p></div>
                ) : filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                        <PostCard 
                            key={post.id} post={post} currentUser={user}
                            onLike={handleLike} onComment={handleComment} onLikeComment={handleLikeComment} onDownload={handleDownload} onShare={handleSharePost}
                            onUserClick={goToProfile} onCommunityClick={goToCommunity}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                        {searchTerm ? <><Search size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-bold">Không tìm thấy kết quả</p></> : <p className="text-gray-500">Chưa có bài viết nào.</p>}
                    </div>
                )}
            </div>
        </div>
      )
  }

  const renderProfile = () => {
      if (!viewProfileUser) return null;
      const isMe = user?.id === viewProfileUser.id;
      const isFollowing = user?.following?.includes(viewProfileUser.id);

      return (
          <div className="w-full animate-fade-in">
               <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">
                    <div className="h-40 bg-gradient-to-r from-primary-200 to-pink-200 relative">
                         <button onClick={() => setCurrentView(ViewState.HOME)} className="absolute top-4 left-4 bg-white/30 backdrop-blur-md p-2 rounded-full hover:bg-white/50 transition-colors"><ArrowLeft size={24} className="text-gray-800"/></button>
                    </div>
                    <div className="px-6 pb-6 relative">
                        <div className="flex flex-col items-center -mt-16 mb-4">
                            <img src={viewProfileUser.avatar} className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white" />
                            <h1 className="text-2xl font-bold text-gray-900 mt-2 flex items-center">
                                {viewProfileUser.name}
                                {viewProfileUser.badgeType === 'admin' && <Shield size={18} className="text-red-500 ml-2" fill="currentColor"/>}
                            </h1>
                            <div className="flex items-center space-x-2 mt-1 mb-4">
                                <span className={`px-3 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200`}>
                                    {viewProfileUser.badge}
                                </span>
                            </div>

                            {!isMe && user && (
                                <button 
                                    onClick={() => handleFollowUser(viewProfileUser.id)}
                                    className={`flex items-center space-x-2 px-6 py-2 rounded-full font-bold transition-all shadow-sm ${
                                        isFollowing 
                                        ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500' 
                                        : 'bg-primary-500 text-white hover:bg-primary-600'
                                    }`}
                                >
                                    {isFollowing ? (
                                        <><UserCheck size={18} /> <span>Đang theo dõi</span></>
                                    ) : (
                                        <><UserPlus size={18} /> <span>Theo dõi</span></>
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-800">{viewProfileUser.points || 0}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">Điểm</div>
                            </div>
                            <div className="text-center border-l border-gray-100">
                                <div className="text-lg font-bold text-gray-800">{viewProfileUser.followers?.length || 0}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">Người theo dõi</div>
                            </div>
                            <div className="text-center border-l border-gray-100">
                                <div className="text-lg font-bold text-gray-800">{viewProfileUser.following?.length || 0}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">Đang theo dõi</div>
                            </div>
                        </div>
                    </div>
               </div>
               
               <h3 className="font-bold text-lg text-gray-700 mb-4 ml-2">Bài viết của {isMe ? 'tôi' : viewProfileUser.name}</h3>
               {renderFeed()}
          </div>
      )
  }

  const renderCommunityDetail = () => {
      if (!activeCommunity) return null;
      const isJoined = user?.followedCommunities?.includes(activeCommunity.id) || false;
      return (
          <div className="w-full animate-fade-in">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
                  <div className="h-48 md:h-64 relative">
                      <img src={activeCommunity.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <button onClick={() => setCurrentView(ViewState.COMMUNITIES)} className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors"><ArrowLeft size={24} /></button>
                  </div>
                  <div className="px-6 pb-6 pt-0 relative">
                      <div className="flex flex-col md:flex-row items-start md:items-end -mt-10 mb-4">
                          <img src={activeCommunity.avatarUrl} className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white mr-4 object-cover" alt="Avatar" />
                          <div className="flex-1 mt-2 md:mt-0">
                              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{activeCommunity.name}</h1>
                              <div className="flex items-center text-gray-500 text-sm space-x-4">
                                  <span className="flex items-center"><Users size={16} className="mr-1"/> {activeCommunity.memberCount} thành viên</span>
                              </div>
                          </div>
                          <div className="mt-4 md:mt-0 w-full md:w-auto">
                              {isJoined ? (
                                  <div className="flex gap-2">
                                      <Button variant="outline" className="flex-1 md:flex-none border-gray-300 flex items-center" onClick={() => handleLeaveCommunity(activeCommunity.id)}><LogOut size={16} className="mr-2"/> Rời nhóm</Button>
                                  </div>
                              ) : (
                                  <Button className="w-full md:w-auto flex items-center justify-center" onClick={() => handleJoinCommunity(activeCommunity.id)}><Plus size={16} className="mr-2" /> Tham gia nhóm</Button>
                              )}
                          </div>
                      </div>
                      <p className="text-gray-600 border-t border-gray-100 pt-4">{activeCommunity.description}</p>
                  </div>
              </div>
              
              {/* --- ĐĂNG BÀI TRONG NHÓM --- */}
              {isJoined && user && (
                  <CreatePost 
                    currentUser={user} 
                    onPost={handleCreatePost} 
                    communityName={activeCommunity.name} 
                  />
              )}

              {renderFeed()}
          </div>
      );
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewState.HOME: return renderFeed();
      case ViewState.QNA: return <div className="w-full"><h2 className="text-2xl font-bold text-gray-800 mb-6">Hỏi đáp</h2>{renderFeed('QnA')}</div>;
      case ViewState.BLOG: return <div className="w-full"><h2 className="text-2xl font-bold text-gray-800 mb-6">Góc chia sẻ</h2>{renderFeed('Blog')}</div>;
      case ViewState.DOCS: return <div className="w-full"><h2 className="text-2xl font-bold text-gray-800 mb-6">Tài liệu</h2>{renderFeed('Document')}</div>;
      case ViewState.GAMES: return <div className="w-full"><h2 className="text-2xl font-bold text-gray-800 mb-6">Góc Bé Vui Chơi</h2><MemoryGame /><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">{mockGames.filter(g => g.type !== 'memory').map(game => (<div key={game.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-all cursor-pointer group"><img src={game.thumbnail} className="w-20 h-20 rounded-xl object-cover" /><div><h4 className="font-bold text-gray-800 group-hover:text-primary-600">{game.title}</h4><p className="text-sm text-gray-500">{game.description}</p></div></div>))}</div></div>;
      case ViewState.COMMUNITIES: return <div className="w-full"><h2 className="text-2xl font-bold text-gray-800 mb-6">Khám phá Cộng đồng</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{communities.map(com => (<CommunityCard key={com.id} community={com} isJoined={user?.followedCommunities?.includes(com.id) || false} onJoin={handleJoinCommunity} onLeave={handleLeaveCommunity} onClick={() => goToCommunity(com.id)} />))}</div></div>;
      case ViewState.COMMUNITY_DETAIL: return renderCommunityDetail();
      case ViewState.PROFILE: return renderProfile();
      case ViewState.AI_ASSISTANT: return <div className="w-full max-w-3xl mx-auto"><ChatAssistant /></div>;
      default: return <div>Nội dung không tồn tại</div>;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: any; label: string }) => (
    <button onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); setActiveCommunity(null); setSearchTerm(''); }} className={`flex items-center space-x-3 w-full p-3.5 rounded-2xl transition-all ${currentView === view ? 'bg-primary-50 text-primary-600 font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><Icon size={22} strokeWidth={currentView === view ? 2.5 : 2}/><span className="text-base">{label}</span></button>
  );

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-['Quicksand'] text-gray-800">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1440px] mx-auto px-4 h-18 py-3 flex items-center justify-between">
            {/* UPDATED LOGO */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentView(ViewState.HOME)}>
                <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-pink-200 group-hover:rotate-12 transition-transform duration-300 border-2 border-white/20">A</div>
                <span className="font-bold text-2xl text-gray-800 hidden sm:block tracking-tight group-hover:text-primary-600 transition-colors">Asking</span>
            </div>
            <div className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input type="text" placeholder="Tìm kiếm kinh nghiệm, tài liệu, cộng đồng..." className="w-full bg-gray-100/80 border border-transparent group-focus-within:bg-white group-focus-within:border-primary-200 group-focus-within:ring-4 group-focus-within:ring-primary-50 rounded-2xl py-3 pl-12 pr-4 focus:outline-none transition-all placeholder-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
                {user && (
                    <div className="relative">
                        <button 
                            ref={bellRef}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors relative ${showNotifications ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`} 
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={22} fill={showNotifications ? "currentColor" : "none"} />
                            {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                        </button>
                        {showNotifications && (
                            <div 
                                ref={notificationRef}
                                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right"
                            >
                                <div className="p-3 border-b border-gray-50 flex justify-between items-center"><h3 className="font-bold text-gray-700">Thông báo</h3>{unreadCount > 0 && <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold">Mới</span>}</div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <p className="p-4 text-center text-gray-400 text-sm">Chưa có thông báo nào</p>
                                    ) : (
                                        notifications.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`} 
                                                onClick={() => { updateDoc(doc(db, "notifications", notif.id), { isRead: true }); setShowNotifications(false); }}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    {notif.fromUser ? (
                                                        <img src={notif.fromUser.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center"><Bell size={16}/></div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-800 leading-snug">
                                                            <span className="font-bold text-gray-900">{notif.fromUser?.name || 'Hệ thống'}</span> {notif.content}
                                                        </p>
                                                        <p className="text-xs text-primary-500 font-semibold mt-1">vừa xong</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {user ? (
                    <>
                        <div className="flex items-center space-x-2 bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md pr-4 pl-1 py-1 rounded-full transition-all cursor-pointer group" onClick={() => goToProfile(user)}>
                            <img src={user.avatar} className="w-9 h-9 rounded-full border border-gray-100 group-hover:scale-105 transition-transform object-cover" />
                            <div className="hidden lg:block text-left"><p className="text-sm font-bold text-gray-700 leading-tight group-hover:text-primary-600">{user.name}</p><div className="flex items-center text-[10px] font-medium uppercase tracking-wide text-gray-500"><span className="text-primary-600 font-bold mr-1">{user.points || 0} PTS</span><span>• {user.badge}</span></div></div>
                        </div>
                        <button onClick={handleLogout} className="hidden sm:flex items-center justify-center w-10 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><LogOut size={20} /></button>
                    </>
                ) : <Button onClick={() => setShowAuth(true)} size="sm">Đăng nhập</Button>}
                <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X /> : <Menu />}</button>
            </div>
        </div>
      </header>
      <div className="flex-1 max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 p-4 md:p-6">
        {/* SIDEBAR LEFT */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-3 xl:col-span-2 sticky top-28 h-fit space-y-2">
            <NavItem view={ViewState.HOME} icon={Home} label="Bảng tin" />
            <NavItem view={ViewState.COMMUNITIES} icon={Users} label="Cộng đồng" />
            <NavItem view={ViewState.QNA} icon={MessageCircle} label="Hỏi đáp" />
            <NavItem view={ViewState.BLOG} icon={BookOpen} label="Góc chia sẻ" />
            <NavItem view={ViewState.DOCS} icon={FileText} label="Tài liệu" />
            <NavItem view={ViewState.GAMES} icon={Gamepad2} label="Kids Games" />
            {user?.followedCommunities?.length ? (
                <div className="pt-6 mt-6 border-t border-gray-200/60"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Nhóm của bạn</h3><div className="space-y-1">{communities.filter(c => user.followedCommunities?.includes(c.id)).map(com => (<button key={com.id} onClick={() => goToCommunity(com.id)} className="flex items-center space-x-3 w-full p-2 rounded-xl hover:bg-gray-100 transition-colors text-left group"><img src={com.avatarUrl} className="w-8 h-8 rounded-lg object-cover border border-gray-200 group-hover:border-primary-200" /><span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 truncate">{com.name}</span></button>))}</div></div>
            ) : null}
            <div className="pt-6 mt-6 border-t border-gray-200/60">
                <button onClick={() => setCurrentView(ViewState.AI_ASSISTANT)} className={`group relative flex items-center space-x-3 w-full p-4 rounded-2xl transition-all overflow-hidden ${currentView === ViewState.AI_ASSISTANT ? 'bg-white border border-violet-200 text-violet-600 shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:shadow-lg hover:border-violet-200'}`}><div className="relative z-10 flex items-center space-x-3"><Sparkles size={22} className={currentView !== ViewState.AI_ASSISTANT ? 'text-violet-500' : ''} /><span className="font-bold">Trợ lý AI</span></div></button>
            </div>
        </aside>

        {/* MAIN FEED */}
        <main className="col-span-1 md:col-span-9 lg:col-span-6 xl:col-span-7 min-w-0">{renderContent()}</main>

        {/* SIDEBAR RIGHT */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 sticky top-28 h-fit space-y-6">
            {user && (
                 <div className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-200 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><Star className="text-white" size={20} fill="currentColor" /></div>
                            <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">{user.badge}</span>
                        </div>
                        <h4 className="font-bold text-3xl mb-1">{user.points} Điểm</h4>
                        <p className="text-orange-50 text-sm mb-5 font-medium">Tích thêm {1000 - (user.points || 0)} điểm để lên hạng Chuyên Gia!</p>
                        <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden"><div className="bg-white h-full rounded-full" style={{ width: `${Math.min(((user.points || 0) / 1000) * 100, 100)}%` }}></div></div>
                    </div>
                </div>
            )}
            {currentView !== ViewState.AI_ASSISTANT && (
                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4"><Sparkles className="text-white" size={20} /></div>
                        <h4 className="font-bold text-xl mb-2">Cần lời khuyên gấp?</h4>
                        <p className="text-indigo-50 text-sm mb-6 leading-relaxed opacity-90">Mẹ Thông Thái AI luôn sẵn sàng trả lời mọi thắc mắc của bạn 24/7 về sức khỏe, dinh dưỡng và nuôi dạy bé.</p>
                        <Button onClick={() => setCurrentView(ViewState.AI_ASSISTANT)} className="bg-white text-indigo-600 hover:bg-indigo-50 w-full font-bold shadow-lg border-none h-12 rounded-full">Chat ngay</Button>
                    </div>
                </div>
            )}
        </aside>
      </div>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl p-5 space-y-3 animate-slide-in flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b pb-4"><span className="font-bold text-xl text-primary-600">Menu</span><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button></div>
                <NavItem view={ViewState.HOME} icon={Home} label="Bảng tin" />
                <NavItem view={ViewState.COMMUNITIES} icon={Users} label="Cộng đồng" />
                <NavItem view={ViewState.QNA} icon={MessageCircle} label="Hỏi đáp" />
                <NavItem view={ViewState.BLOG} icon={BookOpen} label="Góc chia sẻ" />
                <NavItem view={ViewState.DOCS} icon={FileText} label="Tài liệu" />
                <NavItem view={ViewState.GAMES} icon={Gamepad2} label="Kids Games" />
                <NavItem view={ViewState.AI_ASSISTANT} icon={Sparkles} label="Trợ lý AI" />
                <div className="mt-auto pt-6 border-t">{user ? <button onClick={handleLogout} className="flex items-center space-x-3 text-red-500 font-medium p-2 hover:bg-red-50 rounded-xl w-full"><LogOut size={20}/> <span>Đăng xuất</span></button> : <button onClick={() => {setShowAuth(true); setIsMobileMenuOpen(false);}} className="flex items-center space-x-3 text-primary-500 font-medium p-2 hover:bg-primary-50 rounded-xl w-full"><LogIn size={20}/> <span>Đăng nhập</span></button>}</div>
            </div>
        </div>
      )}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        <button onClick={() => setCurrentView(ViewState.HOME)} className={`flex flex-col items-center p-2 ${currentView === ViewState.HOME ? 'text-primary-500' : 'text-gray-400'}`}><Home size={24} strokeWidth={currentView === ViewState.HOME ? 2.5 : 2} /></button>
        <button onClick={() => setCurrentView(ViewState.COMMUNITIES)} className={`flex flex-col items-center p-2 ${currentView === ViewState.COMMUNITIES ? 'text-primary-500' : 'text-gray-400'}`}><Users size={24} strokeWidth={currentView === ViewState.COMMUNITIES ? 2.5 : 2} /></button>
        <div className="relative -top-6"><button onClick={() => setCurrentView(ViewState.AI_ASSISTANT)} className="w-14 h-14 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-200 border-4 border-white hover:scale-105 transition-transform"><Sparkles size={24} fill="white" /></button></div>
        <button onClick={() => setCurrentView(ViewState.GAMES)} className={`flex flex-col items-center p-2 ${currentView === ViewState.GAMES ? 'text-primary-500' : 'text-gray-400'}`}><Gamepad2 size={24} strokeWidth={currentView === ViewState.GAMES ? 2.5 : 2} /></button>
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center p-2 text-gray-400"><Menu size={24} /></button>
      </div>
    </div>
  );
};

export default App;
