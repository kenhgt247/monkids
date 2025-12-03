

import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Post, User, Comment, Community, Notification, Story } from './types';
import { mockGames } from './services/mockData';
import PostCard from './components/PostCard';
import KidsGamesHub from './pages/KidsGamesHub'; 
import ChatAssistant from './pages/ChatAssistant';
import { CreatePost } from './components/CreatePost';
import AuthPage from './pages/AuthPage';
import Button from './components/Button';
import CommunityCard from './components/CommunityCard';
import CreateStoryModal from './components/CreateStoryModal';
import CreateCommunityModal from './components/CreateCommunityModal';
import EditPostModal from './components/EditPostModal';
import StoryViewer from './components/StoryViewer';
import ChatSystem from './components/ChatSystem';
import AdminDashboard from './pages/AdminDashboard'; // Import Admin
import { 
  Home, MessageCircle, BookOpen, FileText, Gamepad2, Search, Menu, X, Bell, Sparkles, Plus, LogOut, LogIn, Loader2, Star, Users, ArrowLeft, Heart, Shield, Award, MapPin, Layers, HelpCircle, PenTool, UserPlus, UserCheck, MessageSquare, User as UserIcon, Settings, LayoutDashboard
} from 'lucide-react';

import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, increment, getDoc, arrayRemove, where, getDocs, limit, setDoc, deleteDoc, QuerySnapshot } from 'firebase/firestore';
import { addPoints, POINTS, createNotification } from './services/userService';
import { getOrCreateConversation } from './services/chatService';

const DEFAULT_COMMUNITIES: Partial<Community>[] = [
    { id: 'com_bimsua', name: 'Cộng đồng Mẹ Bỉm Sữa', description: 'Nơi chia sẻ tâm sự, kinh nghiệm chăm con mọn, bỉm sữa của các mẹ trên toàn quốc.', coverUrl: 'https://picsum.photos/seed/bimsua_cover/800/300', avatarUrl: 'https://picsum.photos/seed/bimsua_ava/100/100', memberCount: 12500, tags: ['Chăm sóc bé', 'Tâm sự'] },
    { id: 'com_andam', name: 'Ăn Dặm Không Nước Mắt', description: 'Chia sẻ thực đơn ăn dặm, phương pháp BLW, ăn dặm kiểu Nhật giúp bé ăn ngon.', coverUrl: 'https://picsum.photos/seed/andam_cover/800/300', avatarUrl: 'https://picsum.photos/seed/andam_ava/100/100', memberCount: 8400, tags: ['Dinh dưỡng', 'Nấu ăn'] },
    { id: 'com_giaoduc', name: 'Giáo Dục Sớm (EASY, Montessori)', description: 'Cùng nhau áp dụng các phương pháp giáo dục sớm để phát triển tư duy cho trẻ.', coverUrl: 'https://picsum.photos/seed/giaoduc_cover/800/300', avatarUrl: 'https://picsum.photos/seed/giaoduc_ava/100/100', memberCount: 5600, tags: ['Giáo dục', 'Kỹ năng'] },
    { id: 'com_mekun', name: 'Cộng Đồng Mẹ Kun', description: 'Hội các mẹ yêu thích sữa Kun và các hoạt động vui chơi năng động cho bé.', coverUrl: 'https://picsum.photos/seed/kun_cover/800/300', avatarUrl: 'https://picsum.photos/seed/kun_ava/100/100', memberCount: 3200, tags: ['Vui chơi', 'Sự kiện'] }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedFilter, setFeedFilter] = useState<string>('All');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  
  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null);
  const [stories, setStories] = useState<{ user: User, stories: Story[] }[]>([]);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [viewingStoryUserIdx, setViewingStoryUserIdx] = useState<number | null>(null);
  const [chatTargetConvId, setChatTargetConvId] = useState<string | null>(null);

  // Edit Post State
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Auto-seed communities
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

  // Auth Listener & User Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            try {
                const userRef = doc(db, "users", firebaseUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) setUser(userSnap.data() as User);
                else {
                     const newUser: User = { id: firebaseUser.uid, name: firebaseUser.displayName || 'User', avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'U'}&background=random`, email: firebaseUser.email || '', points: 0, badge: 'Thành viên mới', badgeType: 'new', followedCommunities: [], followers: [], following: [] };
                    await setDoc(userRef, newUser);
                    setUser(newUser);
                }
                setShowAuth(false);
            } catch (e) {
                setUser({ id: firebaseUser.uid, name: firebaseUser.displayName || 'User', avatar: firebaseUser.photoURL || '', email: firebaseUser.email || '', points: 0, badge: 'Mới', badgeType: 'new', followedCommunities: [], followers: [], following: [] });
                setShowAuth(false);
            }
        } else { setUser(null); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!user?.id) return;
      const unsubscribe = onSnapshot(doc(db, "users", user.id), (docSnap) => {
          if (docSnap.exists()) setUser(prev => ({ ...(prev || {}), ...(docSnap.data() || {}) } as User));
      });
      return () => unsubscribe();
  }, [user?.id]);

  // Notifications
  useEffect(() => {
      if (!user?.id) { setNotifications([]); return; }
      const q = query(collection(db, "notifications"), where("toUserId", "==", user.id), limit(20));
      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
          const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
          // Client-side sort to fix index issues
          notifs.sort((a, b) => b.timestamp - a.timestamp);
          setNotifications(notifs);
          setUnreadCount(notifs.filter(n => !n.isRead).length);
      });
      return () => unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications && notificationRef.current && !notificationRef.current.contains(event.target as Node) && bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [showNotifications]);

  // Communities & Posts
  useEffect(() => {
      const unsubscribe = onSnapshot(query(collection(db, "communities")), (snapshot: QuerySnapshot) => {
          setCommunities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community)));
      });
      return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(query(collection(db, "posts"), orderBy("timestamp", "desc")), (snapshot: QuerySnapshot) => {
        let fetchedPosts: Post[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data, isLiked: data.likedBy ? data.likedBy.includes(user?.id || '') : false } as Post;
        });
        if (currentView === ViewState.COMMUNITY_DETAIL && activeCommunity) fetchedPosts = fetchedPosts.filter(p => p.communityId === activeCommunity.id);
        if (currentView === ViewState.PROFILE && viewProfileUser) fetchedPosts = fetchedPosts.filter(p => p.userId === viewProfileUser.id);
        setPosts(fetchedPosts);
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user?.id, currentView, activeCommunity, viewProfileUser]); 

  // Stories
  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
        const now = Date.now();
        const rawStories: Story[] = [];
        snapshot.forEach(doc => {
            const data = doc.data() as Story;
            if (data.expiresAt > now) rawStories.push({ id: doc.id, ...data });
        });
        const groupedMap = new Map<string, { user: User, stories: Story[] }>();
        rawStories.forEach(s => {
            if (!groupedMap.has(s.userId)) groupedMap.set(s.userId, { user: s.user, stories: [] });
            groupedMap.get(s.userId)?.stories.push(s);
        });
        groupedMap.forEach(group => group.stories.sort((a, b) => a.createdAt - b.createdAt));
        setStories(Array.from(groupedMap.values()));
    });
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleCreateStory = async (url: string, type: 'image' | 'video') => {
      if (!user) return;
      const now = Date.now();
      await addDoc(collection(db, "stories"), { userId: user.id, user: user, mediaUrl: url, mediaType: type, createdAt: now, expiresAt: now + (24 * 60 * 60 * 1000), viewers: [] });
  };
  const handleLoginSuccess = (u: User) => { setUser(u); setShowAuth(false); };
  const handleLogout = async () => { await signOut(auth); setCurrentView(ViewState.HOME); setNotifications([]); };
  const requireAuth = () => { if (!user) { setShowAuth(true); return false; } return true; };

  const handleCreatePost = async (content: string, title?: string, imageUrl?: string, videoUrl?: string, audioUrl?: string, fileUrl?: string, category: Post['category'] = 'Status', downloadCost: number = 0, linkUrl?: string) => {
    if (!user) return;
    try {
        const newPost: any = {
            userId: user.id, user: user, title: title || '', content: content, category: category,
            tags: category === 'QnA' ? ['Hỏi đáp'] : category === 'Document' ? ['Tài liệu'] : ['Chia sẻ'],
            likes: 0, likedBy: [], comments: [], createdAt: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
            timestamp: Date.now(), imageUrl: imageUrl || '', videoUrl: videoUrl || '', audioUrl: audioUrl || '', fileUrl: fileUrl || '', linkUrl: linkUrl || '', downloadCost: category === 'Document' ? downloadCost : 0,
            visibility: 'public'
        };
        if (currentView === ViewState.COMMUNITY_DETAIL && activeCommunity) {
            newPost.communityId = activeCommunity.id;
            newPost.communityName = activeCommunity.name;
            newPost.tags.push(activeCommunity.name);
        }
        const docRef = await addDoc(collection(db, "posts"), newPost);
        await addPoints(user.id, POINTS.CREATE_POST);
        
        // Notify community members
        if (currentView === ViewState.COMMUNITY_DETAIL && activeCommunity && activeCommunity.members) {
             // Basic implementation: Notify first 50 members to avoid spamming quota in this demo
             activeCommunity.members
                .filter(mid => mid !== user.id)
                .slice(0, 50)
                .forEach(memberId => {
                    createNotification(memberId, 'post', `đã đăng bài viết mới trong ${activeCommunity.name}`, user, docRef.id);
                });
        }

    } catch (e) { alert("Có lỗi khi đăng bài."); console.error(e); }
  };

  const handleLike = async (postId: string) => {
    if (!requireAuth() || !user) return;
    try {
        const postRef = doc(db, "posts", postId);
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        const isLiked = post.likedBy?.includes(user.id);
        if (isLiked) await updateDoc(postRef, { likes: increment(-1), likedBy: arrayRemove(user.id) });
        else {
            await updateDoc(postRef, { likes: increment(1), likedBy: arrayUnion(user.id) });
            if (post.userId !== user.id) { await addPoints(post.userId, POINTS.GET_LIKE); await createNotification(post.userId, 'like', 'đã thích bài viết của bạn', user, postId); }
        }
    } catch (e) { console.error(e); }
  };

  const handleComment = async (postId: string, content: string) => {
      if (!user) { if(!requireAuth()) return; return; }
      try {
        await updateDoc(doc(db, "posts", postId), { comments: arrayUnion({ id: `c_${Date.now()}`, userId: user.id, user: user, content: content, createdAt: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' }), likedBy: [] }) });
        const post = posts.find(p => p.id === postId);
        if (post && post.userId !== user.id) { await addPoints(user.id, POINTS.COMMENT); await createNotification(post.userId, 'comment', 'đã bình luận về bài viết của bạn', user, postId); }
      } catch (e) { console.error(e); }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
      if (!requireAuth() || !user) return;
      const post = posts.find(p => p.id === postId); if (!post) return;
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

  const handleSharePost = async () => { if (!requireAuth() || !user) return; await addPoints(user.id, POINTS.SHARE); alert(`Đã chia sẻ thành công! +${POINTS.SHARE} điểm.`); };
  
  const handleDownload = async (post: Post) => {
      if (!requireAuth() || !user || !post.fileUrl) return;
      const cost = post.downloadCost || 0;
      if (cost > 0 && user.id !== post.userId) {
          if ((user.points || 0) < cost) { alert(`Bạn cần ${cost} điểm để tải tài liệu này.`); return; }
          if (!window.confirm(`Tài liệu này tốn ${cost} điểm. Bạn có chắc chắn muốn tải không?`)) return;
          if (!(await addPoints(user.id, -cost))) { alert("Không đủ điểm hoặc lỗi hệ thống."); return; }
          await addPoints(post.userId, cost); await createNotification(post.userId, 'award', `đã tải tài liệu của bạn (+${cost} điểm)`, user, post.id);
      }
      try {
          const response = await fetch(post.fileUrl); if (!response.ok) throw new Error();
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url;
          let filename = post.title ? `${post.title}.pdf` : 'downloaded_file';
          if (post.fileUrl.includes('.doc')) filename = filename.replace('.pdf', '.doc');
          a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
      } catch (err) { window.open(post.fileUrl, '_blank'); }
  };

  const handleFollowUser = async (targetUserId: string) => {
      if (!requireAuth() || !user) return;
      const isFollowing = user.following?.includes(targetUserId);
      try {
          const myRef = doc(db, "users", user.id); const targetRef = doc(db, "users", targetUserId);
          if (isFollowing) { await updateDoc(myRef, { following: arrayRemove(targetUserId) }); await updateDoc(targetRef, { followers: arrayRemove(user.id) }); }
          else { await updateDoc(myRef, { following: arrayUnion(targetUserId) }); await updateDoc(targetRef, { followers: arrayUnion(user.id) }); await createNotification(targetUserId, 'follow', 'đã bắt đầu theo dõi bạn', user); }
      } catch (e) { console.error(e); }
  }

  const handleJoinCommunity = async (communityId: string) => {
      if (!requireAuth() || !user) return;
      try { await Promise.all([ updateDoc(doc(db, "communities", communityId), { members: arrayUnion(user.id), memberCount: increment(1) }), updateDoc(doc(db, "users", user.id), { followedCommunities: arrayUnion(communityId) }) ]); await createNotification(user.id, 'system', 'Bạn đã tham gia nhóm thành công!'); } catch (e) {}
  };
  const handleLeaveCommunity = async (communityId: string) => {
      if (!requireAuth() || !user) return;
      try { await Promise.all([ updateDoc(doc(db, "communities", communityId), { members: arrayRemove(user.id), memberCount: increment(-1) }), updateDoc(doc(db, "users", user.id), { followedCommunities: arrayRemove(communityId) }) ]); } catch (e) {}
  };

  const handleCheckCreateCommunity = () => {
      if (!requireAuth() || !user) return;
      if ((user.points || 0) < 100) {
          alert(`Bạn cần ít nhất 100 điểm để tạo cộng đồng riêng. Hiện tại bạn có ${user.points} điểm. Hãy tích cực hoạt động thêm nhé!`);
          return;
      }
      setShowCreateCommunityModal(true);
  };

  const handleCreateCommunity = async (name: string, description: string, coverUrl: string, avatarUrl: string) => {
      if (!user) return;
      try {
          const newCom: any = {
              name, description, coverUrl, avatarUrl,
              memberCount: 1,
              members: [user.id],
              tags: [],
              creatorId: user.id,
              createdAt: Date.now()
          };
          const docRef = await addDoc(collection(db, "communities"), newCom);
          // Tự động tham gia
          await updateDoc(doc(db, "users", user.id), { followedCommunities: arrayUnion(docRef.id) });
          alert("Tạo cộng đồng thành công!");
      } catch (e) {
          console.error(e);
          alert("Lỗi khi tạo cộng đồng");
      }
  };
  
  const handleNotificationClick = async (notif: Notification) => {
      if (!user) return;
      try {
          // Mark as read
          await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
          // Navigate
          if (notif.type === 'follow' && notif.fromUser) {
              // Fetch full user profile to view
              const userRef = doc(db, "users", notif.fromUser.id);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) goToProfile(userSnap.data() as User);
          } else if (notif.postId) {
              // Just scroll to top of feed (simplification)
              setCurrentView(ViewState.HOME);
              window.scrollTo(0, 0);
          }
      } catch(e) { console.error(e); }
      setShowNotifications(false);
  }

  // --- ACTIONS CHO CHỦ BÀI VIẾT ---
  const handleDeletePost = async (postId: string) => {
      if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
      try {
          await deleteDoc(doc(db, "posts", postId));
          alert("Đã xóa bài viết.");
      } catch (e) {
          console.error(e);
          alert("Có lỗi xảy ra khi xóa bài.");
      }
  };

  const handleEditPost = async (postId: string, newContent: string, newTitle?: string) => {
      try {
          const updates: any = { content: newContent };
          if (newTitle) updates.title = newTitle;
          
          await updateDoc(doc(db, "posts", postId), updates);
          alert("Đã cập nhật bài viết.");
      } catch (e) {
          console.error(e);
          alert("Có lỗi xảy ra khi sửa bài.");
      }
  };

  const handleToggleVisibility = async (postId: string, currentVisibility: 'public' | 'private') => {
      const newVisibility = currentVisibility === 'public' ? 'private' : 'public';
      const msg = newVisibility === 'private' ? "Đã chuyển sang chế độ riêng tư." : "Đã công khai bài viết.";
      try {
          await updateDoc(doc(db, "posts", postId), { visibility: newVisibility });
          alert(msg);
      } catch (e) {
          console.error(e);
          alert("Có lỗi xảy ra.");
      }
  };


  const goToCommunity = (id: string) => { const com = communities.find(c => c.id === id); if (com) { setActiveCommunity(com); setCurrentView(ViewState.COMMUNITY_DETAIL); window.scrollTo(0,0); } };
  const goToProfile = (u: User) => { setViewProfileUser(u); setCurrentView(ViewState.PROFILE); window.scrollTo(0,0); };
  const startChat = async (targetUser: User) => { if (!requireAuth() || !user || user.id === targetUser.id) return; setChatTargetConvId(await getOrCreateConversation(user, targetUser)); setCurrentView(ViewState.CHAT); }

  if (showAuth) return <AuthPage onLogin={handleLoginSuccess} onCancel={() => setShowAuth(false)} />;

  // --- ADMIN VIEW ---
  if (currentView === ViewState.ADMIN && user) {
      return <AdminDashboard currentUser={user} onClose={() => setCurrentView(ViewState.HOME)} />;
  }

  const renderFeed = () => {
      let filteredPosts = posts;

      // Filter by visibility (Ẩn bài private của người khác)
      filteredPosts = filteredPosts.filter(p => p.visibility !== 'private' || (user && p.userId === user.id));

      if (currentView === ViewState.HOME && feedFilter !== 'All' && !searchTerm) filteredPosts = filteredPosts.filter(p => p.category === feedFilter);
      // Filter specific views (QnA, Blog, Document)
      if (currentView === ViewState.QNA) filteredPosts = filteredPosts.filter(p => p.category === 'QnA');
      if (currentView === ViewState.BLOG) filteredPosts = filteredPosts.filter(p => p.category === 'Blog');
      if (currentView === ViewState.DOCS) filteredPosts = filteredPosts.filter(p => p.category === 'Document');

      if (searchTerm) filteredPosts = filteredPosts.filter(p => p.content.toLowerCase().includes(searchTerm.toLowerCase()) || p.title?.toLowerCase().includes(searchTerm.toLowerCase()));

      return (
        <div className="w-full animate-fade-in pb-20 lg:pb-0">
            {currentView === ViewState.HOME && !searchTerm && (
                <div className="flex space-x-4 mb-8 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    <div className="flex-shrink-0 w-28 h-40 bg-sky-100 rounded-2xl relative flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-sky-300 snap-center" onClick={() => { if(requireAuth()) setIsCreatingStory(true); }}>
                        <div className="w-10 h-10 rounded-full bg-white text-primary-500 flex items-center justify-center mb-2 shadow-md"><Plus size={24} strokeWidth={3} /></div>
                        <span className="text-xs font-bold text-gray-800 bg-white/50 px-2 py-0.5 rounded-full font-heading">Tạo tin</span>
                    </div>
                    {stories.map((group, idx) => (
                        <div key={group.user.id} className="flex-shrink-0 w-28 h-40 bg-gray-200 rounded-2xl relative overflow-hidden cursor-pointer shadow-sm snap-center" onClick={() => setViewingStoryUserIdx(idx)}>
                            <img src={group.stories[0].mediaType === 'image' ? group.stories[0].mediaUrl : group.user.avatar} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute top-2 left-2 p-0.5 rounded-full border-2 border-primary-500 bg-white"><img src={group.user.avatar} className="w-8 h-8 rounded-full" /></div>
                            <span className="absolute bottom-3 left-2 right-2 text-xs font-bold text-white truncate font-heading">{group.user.name}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {user && !searchTerm && (
                (currentView === ViewState.HOME) || 
                currentView === ViewState.QNA || 
                currentView === ViewState.BLOG || 
                currentView === ViewState.DOCS
            ) && (
                <CreatePost 
                    currentUser={user} 
                    onPost={handleCreatePost} 
                    initialMode={
                        currentView === ViewState.QNA ? 'qna' : 
                        currentView === ViewState.BLOG ? 'blog' : 
                        currentView === ViewState.DOCS ? 'document' : 
                        'status'
                    } 
                />
            )}

            {!searchTerm && currentView === ViewState.HOME && (
                <div className="flex space-x-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                    {['All', 'Status', 'Blog', 'QnA', 'Document'].map(cat => ( <button key={cat} onClick={() => setFeedFilter(cat)} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors font-heading ${feedFilter === cat ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>{cat === 'All' ? 'Tất cả' : cat === 'QnA' ? 'Hỏi đáp' : cat === 'Document' ? 'Tài liệu' : cat}</button> ))}
                </div>
            )}

            <div className="space-y-6">
                {isLoading ? <div className="flex flex-col items-center py-20"><Loader2 className="animate-spin text-primary-500" size={32} /></div> : filteredPosts.length > 0 ? filteredPosts.map(post => 
                    <PostCard 
                        key={post.id} 
                        post={post} 
                        currentUser={user} 
                        onLike={handleLike} 
                        onComment={handleComment} 
                        onLikeComment={handleLikeComment} 
                        onDownload={handleDownload} 
                        onShare={handleSharePost} 
                        onUserClick={goToProfile} 
                        onCommunityClick={goToCommunity}
                        onDelete={handleDeletePost}
                        onEdit={(p) => setEditingPost(p)}
                        onToggleVisibility={handleToggleVisibility}
                    />) 
                    : <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300"><p className="text-gray-500">Chưa có bài viết nào.</p></div>}
            </div>
        </div>
      )
  }

  const renderProfile = () => {
      if (!viewProfileUser) return null;
      const isMe = user?.id === viewProfileUser.id;
      const isFollowing = user?.following?.includes(viewProfileUser.id);
      return (
          <div className="w-full animate-fade-in pb-20 lg:pb-0">
               <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">
                    <div className="h-40 bg-gradient-to-r from-primary-200 to-pink-200 relative"><button onClick={() => setCurrentView(ViewState.HOME)} className="absolute top-4 left-4 bg-white/30 backdrop-blur-md p-2 rounded-full"><ArrowLeft size={24} className="text-gray-800"/></button></div>
                    <div className="px-6 pb-6 relative">
                        <div className="flex flex-col items-center -mt-16 mb-4">
                            <img src={viewProfileUser.avatar} className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white" />
                            <h1 className="text-2xl font-bold text-gray-900 mt-2 font-heading">{viewProfileUser.name} {viewProfileUser.badgeType === 'admin' && <Shield size={18} className="text-red-500 ml-2 inline"/>}</h1>
                            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 font-heading mt-1 mb-4">{viewProfileUser.badge}</span>
                            <div className="flex gap-2">
                                {!isMe && user && ( <>
                                    <button onClick={() => handleFollowUser(viewProfileUser.id)} className={`flex items-center space-x-2 px-6 py-2 rounded-full font-bold transition-all shadow-sm font-heading ${isFollowing ? 'bg-gray-100 text-gray-700' : 'bg-primary-500 text-white'}`}>{isFollowing ? <><UserCheck size={18} /> <span>Đang theo dõi</span></> : <><UserPlus size={18} /> <span>Theo dõi</span></>}</button>
                                    <button onClick={() => startChat(viewProfileUser)} className="flex items-center space-x-2 px-6 py-2 rounded-full font-bold transition-all shadow-sm font-heading bg-violet-100 text-violet-600"><MessageCircle size={18} /> <span>Nhắn tin</span></button>
                                </> )}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 text-center">
                            <div><div className="text-lg font-bold font-heading">{viewProfileUser.points || 0}</div><div className="text-xs text-gray-400 font-bold">Điểm</div></div>
                            <div className="border-l border-gray-100"><div className="text-lg font-bold font-heading">{viewProfileUser.followers?.length || 0}</div><div className="text-xs text-gray-400 font-bold">Người theo dõi</div></div>
                            <div className="border-l border-gray-100"><div className="text-lg font-bold font-heading">{viewProfileUser.following?.length || 0}</div><div className="text-xs text-gray-400 font-bold">Đang theo dõi</div></div>
                        </div>
                    </div>
               </div>
               <h3 className="font-bold text-lg text-gray-700 mb-4 ml-2 font-heading">Bài viết</h3>
               {renderFeed()}
          </div>
      )
  }

  const renderCommunityDetail = () => {
      if (!activeCommunity) return null;
      const isJoined = user?.followedCommunities?.includes(activeCommunity.id) || false;
      return (
          <div className="w-full animate-fade-in pb-20 lg:pb-0">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
                  <div className="h-48 md:h-64 relative">
                      <img src={activeCommunity.coverUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <button onClick={() => setCurrentView(ViewState.COMMUNITIES)} className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white"><ArrowLeft size={24} /></button>
                  </div>
                  <div className="px-6 pb-6 pt-0 relative">
                      <div className="flex flex-col md:flex-row items-start md:items-end -mt-10 mb-4">
                            <img src={activeCommunity.avatarUrl} className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white object-cover" />
                            <div className="mt-4 md:mt-0 md:ml-4 flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-1 font-heading">{activeCommunity.name}</h1>
                                <div className="flex items-center text-gray-500 text-sm"><Users size={16} className="mr-1" /> {activeCommunity.memberCount} thành viên</div>
                            </div>
                            <div className="mt-4 md:mt-0"><Button onClick={() => isJoined ? handleLeaveCommunity(activeCommunity.id) : handleJoinCommunity(activeCommunity.id)} variant={isJoined ? "outline" : "primary"}>{isJoined ? 'Đã tham gia' : 'Tham gia nhóm'}</Button></div>
                      </div>
                      <p className="text-gray-600 mb-4">{activeCommunity.description}</p>
                  </div>
              </div>
              {isJoined && user && <div className="mb-6"><CreatePost currentUser={user} communityName={activeCommunity.name} onPost={handleCreatePost} /></div>}
              <h3 className="font-bold text-lg text-gray-700 mb-4 ml-2 font-heading">Bài viết trong nhóm</h3>
              {renderFeed()}
          </div>
      );
  }

  const navItems = [
    { view: ViewState.HOME, label: 'Bảng tin', icon: Home },
    { view: ViewState.COMMUNITIES, label: 'Cộng đồng', icon: Users },
    { view: ViewState.QNA, label: 'Hỏi đáp', icon: HelpCircle },
    { view: ViewState.BLOG, label: 'Góc chia sẻ', icon: PenTool },
    { view: ViewState.DOCS, label: 'Tài liệu', icon: FileText },
    { view: ViewState.GAMES, label: 'Kids Games', icon: Gamepad2 },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans text-gray-800">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center" onClick={() => setCurrentView(ViewState.HOME)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg mr-2 font-heading shadow-md shadow-primary-200">A</div>
            <span className="font-bold text-xl text-gray-800 font-heading">Asking</span>
        </div>
        <div className="flex items-center space-x-3 relative" ref={notificationRef}>
            {user && (
                 <button onClick={() => setCurrentView(ViewState.CHAT)} className="p-2 relative">
                     <MessageCircle size={24} className="text-gray-600"/>
                 </button>
            )}
            <button ref={bellRef} onClick={() => setShowNotifications(!showNotifications)} className="p-2 relative"><Bell size={24} className="text-gray-600" />{unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}</button>
            {showNotifications && (
               <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right">
                   <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center"><h3 className="font-bold text-gray-700 font-heading text-sm">Thông báo</h3>{unreadCount > 0 && <button className="text-[10px] text-primary-600 font-bold hover:underline">Đã đọc hết</button>}</div>
                   <div className="max-h-60 overflow-y-auto custom-scrollbar">
                       {notifications.length === 0 ? <div className="p-4 text-center text-gray-400 text-xs">Chưa có thông báo</div> : notifications.map(notif => (
                           <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`p-3 border-b border-gray-50 hover:bg-gray-50 flex items-start space-x-2 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                               {notif.fromUser ? <img src={notif.fromUser.avatar} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-500"><Bell size={14}/></div>}
                               <div className="flex-1 min-w-0"><p className="text-xs text-gray-800 line-clamp-2">{notif.fromUser && <span className="font-bold mr-1">{notif.fromUser.name}</span>}{notif.content}</p><span className="text-[10px] text-gray-400 block mt-0.5">Vừa xong</span></div>
                           </div>
                       ))}
                   </div>
               </div>
           )}
        </div>
      </div>

      {isCreatingStory && user && <CreateStoryModal currentUser={user} onClose={() => setIsCreatingStory(false)} onPost={handleCreateStory} />}
      {viewingStoryUserIdx !== null && <StoryViewer groupedStories={stories} initialUserIndex={viewingStoryUserIdx} currentUser={user || undefined} onClose={() => setViewingStoryUserIdx(null)} />}
      
      {/* Create Community Modal */}
      {showCreateCommunityModal && user && (
          <CreateCommunityModal 
            currentUser={user} 
            onClose={() => setShowCreateCommunityModal(false)} 
            onCreate={handleCreateCommunity} 
          />
      )}

      {/* Edit Post Modal */}
      {editingPost && (
          <EditPostModal 
            post={editingPost}
            onClose={() => setEditingPost(null)}
            onSave={handleEditPost}
          />
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start relative z-10">
        
        {/* Left Sidebar (Desktop) */}
        <div className="hidden lg:block w-64 shrink-0 sticky top-6 max-h-[calc(100vh-48px)] overflow-y-auto custom-scrollbar">
            <div className="flex items-center mb-8 px-2 cursor-pointer" onClick={() => setCurrentView(ViewState.HOME)}>
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl mr-3 font-heading shadow-lg shadow-primary-200">A</div>
                 <span className="font-bold text-2xl text-gray-800 font-heading tracking-tight">Asking</span>
            </div>
            
            <nav className="space-y-1 mb-8">
                {navItems.map(item => (
                    <button key={item.view} onClick={() => { setCurrentView(item.view); setSearchTerm(''); setFeedFilter('All'); window.scrollTo(0,0); }} className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all font-heading ${currentView === item.view ? 'bg-white text-primary-600 shadow-sm font-bold border border-gray-100' : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'}`}><item.icon size={20} strokeWidth={currentView === item.view ? 2.5 : 2} /> <span>{item.label}</span></button>
                ))}
            </nav>

            <div className="px-4 mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 px-2 tracking-wider">Nhóm của bạn</h3>
                <div className="space-y-1">
                    {user?.followedCommunities && user.followedCommunities.length > 0 ? (communities.filter(c => user.followedCommunities?.includes(c.id)).map(com => ( <button key={com.id} onClick={() => goToCommunity(com.id)} className="flex items-center space-x-2 w-full px-2 py-2 rounded-lg hover:bg-white text-gray-600 text-sm transition-colors group"><img src={com.avatarUrl} className="w-6 h-6 rounded-md object-cover" /><span className="truncate group-hover:text-primary-600 font-medium">{com.name}</span></button> ))) : (<p className="text-xs text-gray-400 px-2 italic">Bạn chưa tham gia nhóm nào</p>)}
                </div>
            </div>

            <div className="px-4">
                 <div className="bg-gradient-to-br from-primary-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg shadow-primary-200 relative overflow-hidden group cursor-pointer" onClick={() => setCurrentView(ViewState.AI_ASSISTANT)}>
                      <div className="absolute top-0 right-0 p-3 opacity-20"><Sparkles size={60} /></div>
                      <h4 className="font-bold text-lg mb-1 font-heading relative z-10">Trợ lý AI</h4>
                      <p className="text-primary-100 text-xs mb-3 relative z-10">Hỏi đáp mọi lúc mọi nơi</p>
                      <button className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/30 transition-colors relative z-10 !text-white border border-white/40">Chat ngay</button>
                 </div>
            </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 min-w-0">
             {/* Desktop Header */}
             <div className="hidden lg:flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 sticky top-4 z-30 shadow-sm">
                  <div className="flex-1 max-w-lg relative group">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                      <input type="text" placeholder="Tìm kiếm kinh nghiệm, tài liệu, cộng đồng..." className="w-full bg-gray-50 border-transparent focus:bg-white border focus:border-primary-200 rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>

                  <div className="flex items-center space-x-4 ml-4 relative" ref={notificationRef}>
                       {/* Chat Button Moved Here */}
                       <button onClick={() => setCurrentView(ViewState.CHAT)} className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors relative" title="Tin nhắn">
                           <MessageCircle size={20} />
                       </button>

                       <button ref={bellRef} onClick={() => setShowNotifications(!showNotifications)} className={`p-2.5 rounded-xl transition-colors relative ${showNotifications ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                           <Bell size={20} />
                           {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                       </button>

                       {/* Notification Dropdown */}
                       {showNotifications && (
                           <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right ring-1 ring-black ring-opacity-5">
                               <div className="p-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center"><h3 className="font-bold text-gray-700 font-heading">Thông báo</h3>{unreadCount > 0 && <button className="text-xs text-primary-600 font-bold hover:underline">Đã đọc tất cả</button>}</div>
                               <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                   {notifications.length === 0 ? <div className="p-6 text-center text-gray-400 text-sm">Chưa có thông báo nào</div> : notifications.map(notif => (
                                       <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start space-x-3 cursor-pointer ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                                           {notif.fromUser ? <img src={notif.fromUser.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200" /> : <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500"><Bell size={20}/></div>}
                                           <div className="flex-1"><p className="text-sm text-gray-800 leading-snug">{notif.fromUser && <span className="font-bold font-heading mr-1">{notif.fromUser.name}</span>}{notif.content}</p><span className="text-[10px] text-gray-400 font-medium mt-1 block">Vừa xong</span></div>
                                           {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )}
                       
                       {user ? (
                           <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 cursor-pointer group relative" onClick={() => goToProfile(user)}>
                               <div className="text-right hidden xl:block"><p className="text-sm font-bold text-gray-800 font-heading group-hover:text-primary-600 transition-colors">{user.name}</p><div className="flex items-center justify-end text-xs text-orange-500 font-bold"><span className="mr-1">{user.points} PTS</span> • <span className="ml-1 text-gray-400 uppercase">{user.badge}</span></div></div>
                               <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:scale-105 transition-transform object-cover" />
                               
                               {/* Desktop User Menu Dropdown */}
                               <div className="hidden group-hover:block absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                                   <div className="p-2 space-y-1">
                                       {user.badgeType === 'admin' && (
                                           <button onClick={(e) => { e.stopPropagation(); setCurrentView(ViewState.ADMIN); }} className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg flex items-center font-bold"><LayoutDashboard size={16} className="mr-2"/> Admin Panel</button>
                                       )}
                                       <button onClick={(e) => { e.stopPropagation(); goToProfile(user); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center font-medium"><UserIcon size={16} className="mr-2"/> Trang cá nhân</button>
                                       <button onClick={(e) => { e.stopPropagation(); setCurrentView(ViewState.CHAT); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center font-medium"><MessageCircle size={16} className="mr-2"/> Tin nhắn</button>
                                       <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center font-bold"><LogOut size={16} className="mr-2"/> Đăng xuất</button>
                                   </div>
                               </div>
                           </div>
                       ) : ( <Button size="sm" onClick={() => setShowAuth(true)} className="ml-2 shadow-none">Đăng nhập</Button> )}
                  </div>
             </div>

             {/* Dynamic Content */}
             {currentView === ViewState.CHAT ? (
                 user ? <ChatSystem currentUser={user} initialConversationId={chatTargetConvId} onClose={() => setCurrentView(ViewState.HOME)} /> : <div className="p-10 text-center"><p className="text-gray-500 mb-4">Vui lòng đăng nhập để nhắn tin</p><Button onClick={() => setShowAuth(true)}>Đăng nhập ngay</Button></div>
             ) : (
                 <>
                    {/* Updated: Use KidsGamesHub instead of MemoryGame */}
                    {currentView === ViewState.GAMES && <KidsGamesHub />}
                    {currentView === ViewState.AI_ASSISTANT && <ChatAssistant />}
                    {currentView === ViewState.COMMUNITIES && (
                         <div className="animate-fade-in">
                             <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-gray-800 font-heading">Khám phá cộng đồng</h2><Button onClick={handleCheckCreateCommunity} variant="outline" size="sm">Tạo nhóm mới</Button></div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{communities.map(com => ( <CommunityCard key={com.id} community={com} isJoined={user?.followedCommunities?.includes(com.id) || false} onJoin={handleJoinCommunity} onLeave={handleLeaveCommunity} onClick={() => goToCommunity(com.id)} /> ))}</div>
                         </div>
                    )}
                    {(currentView === ViewState.HOME || currentView === ViewState.QNA || currentView === ViewState.BLOG || currentView === ViewState.DOCS) && renderFeed()}
                    {currentView === ViewState.COMMUNITY_DETAIL && renderCommunityDetail()}
                    {currentView === ViewState.PROFILE && renderProfile()}
                 </>
             )}
        </div>

        {/* Right Sidebar (Desktop) */}
        {/* Hide right sidebar when chatting */}
        {currentView !== ViewState.CHAT && (
            <div className="hidden lg:block w-80 shrink-0 space-y-6">
                <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Award size={100} /></div>
                    <div className="flex items-center mb-4 relative z-10"><div className="p-2 bg-white/20 rounded-full mr-3 backdrop-blur-sm"><Star fill="white" size={20} /></div><span className="font-bold text-sm tracking-wide bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm uppercase">{user ? user.badge : 'Khách'}</span></div>
                    <div className="mb-4 relative z-10"><span className="text-5xl font-bold font-heading block mb-1">{user ? user.points : 0}</span><span className="text-orange-100 text-sm font-medium">Điểm tích lũy</span></div>
                    <div className="w-full bg-black/10 rounded-full h-1.5 mb-2 overflow-hidden"><div className="bg-white h-full rounded-full" style={{ width: '40%' }}></div></div>
                    <p className="text-xs text-orange-100 relative z-10">Tích thêm {1000 - (user?.points || 0)} điểm để lên hạng Chuyên Gia!</p>
                </div>
                <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-3xl p-1 shadow-lg">
                    <div className="bg-white rounded-[20px] p-5">
                        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 mb-4 mx-auto"><Sparkles size={24} /></div>
                        <h3 className="text-center font-bold text-gray-800 text-lg mb-2 font-heading">Cần lời khuyên gấp?</h3>
                        <p className="text-center text-gray-500 text-sm mb-4 leading-relaxed">Mẹ Thông Thái AI luôn sẵn sàng trả lời mọi thắc mắc của bạn 24/7 về sức khỏe, dinh dưỡng và nuôi dạy bé.</p>
                        <Button onClick={() => setCurrentView(ViewState.AI_ASSISTANT)} className="w-full !bg-violet-100 hover:!bg-violet-200 !text-indigo-600 shadow-none font-bold">Chat ngay</Button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center px-2 py-2 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] safe-area-bottom">
          <button onClick={() => setCurrentView(ViewState.HOME)} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${currentView === ViewState.HOME ? 'text-primary-600' : 'text-gray-400'}`}>
              <Home size={24} strokeWidth={currentView === ViewState.HOME ? 2.5 : 2} />
              <span className="text-[10px] font-bold mt-1">Trang chủ</span>
          </button>
          <button onClick={() => setCurrentView(ViewState.COMMUNITIES)} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${currentView === ViewState.COMMUNITIES ? 'text-primary-600' : 'text-gray-400'}`}>
              <Users size={24} strokeWidth={currentView === ViewState.COMMUNITIES ? 2.5 : 2} />
              <span className="text-[10px] font-bold mt-1">Cộng đồng</span>
          </button>
          <div className="relative -top-5">
              <button 
                onClick={() => { if(requireAuth()) setIsCreatingStory(true); }}
                className="w-14 h-14 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-200 hover:scale-105 transition-transform"
              >
                  <Plus size={32} />
              </button>
          </div>
          {/* Replaced Chat with Games on Mobile Nav */}
          <button onClick={() => setCurrentView(ViewState.GAMES)} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${currentView === ViewState.GAMES ? 'text-primary-600' : 'text-gray-400'}`}>
              <Gamepad2 size={24} strokeWidth={currentView === ViewState.GAMES ? 2.5 : 2} />
              <span className="text-[10px] font-bold mt-1">Games</span>
          </button>
          <button onClick={() => user ? goToProfile(user) : setShowAuth(true)} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${currentView === ViewState.PROFILE ? 'text-primary-600' : 'text-gray-400'}`}>
              {user ? <img src={user.avatar} className={`w-6 h-6 rounded-full object-cover border-2 ${currentView === ViewState.PROFILE ? 'border-primary-500' : 'border-transparent'}`} /> : <UserIcon size={24} />}
              <span className="text-[10px] font-bold mt-1">Cá nhân</span>
          </button>
      </div>

    </div>
  );
};
export default App;