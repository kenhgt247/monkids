import { Post, User, Game, Comment } from '../types';

export const currentUserMock: User = {
  id: 'u1',
  name: 'Mẹ Bỉm Sữa',
  avatar: 'https://picsum.photos/seed/user1/100/100',
  badge: 'Thành viên VIP',
  badgeType: 'vip',
  email: 'mebimsua@example.com'
};

const users: Record<string, User> = {
  'u1': currentUserMock,
  'u2': { id: 'u2', name: 'Bố Gấu', avatar: 'https://picsum.photos/seed/user2/100/100', badge: 'Quản trị viên', badgeType: 'admin' },
  'u3': { id: 'u3', name: 'Mẹ Mèo', avatar: 'https://picsum.photos/seed/user3/100/100', badge: 'Thành viên tích cực', badgeType: 'contributor' },
  'u4': { id: 'u4', name: 'Bác Sĩ Lan', avatar: 'https://picsum.photos/seed/user4/100/100', badge: 'Chuyên gia y tế', badgeType: 'expert' },
};

const createComment = (id: string, userId: string, content: string, time: string): Comment => ({
  id,
  userId,
  user: users[userId],
  content,
  createdAt: time
});

export const mockPosts: Post[] = [
  {
    id: 'p0',
    userId: 'u2',
    user: users['u2'],
    title: 'Nhạc thiếu nhi vui nhộn cho bé ăn ngon miệng',
    content: 'Mấy hôm nay bé nhà mình biếng ăn quá, mở bài này lên là bé nhảy nhót ăn thun thút luôn. Các mẹ thử xem nhé!',
    category: 'Status',
    tags: ['Giải trí', 'Nhạc thiếu nhi'],
    likes: 342,
    comments: [
        createComment('c1', 'u3', 'Ôi bài này bé nhà mình cũng thích mê!', '10 phút trước'),
        createComment('c2', 'u1', 'Cảm ơn bố Gấu đã chia sẻ nhé.', '5 phút trước')
    ],
    createdAt: '30 phút trước',
    videoUrl: 'https://www.youtube.com/watch?v=FjHGZ2H57q0',
    isLiked: false
  },
  {
    id: 'p1',
    userId: 'u2',
    user: users['u2'],
    title: 'Bé 6 tháng tuổi bắt đầu ăn dặm như thế nào cho đúng?',
    content: 'Chào các mẹ, bé nhà mình được 6 tháng rồi. Mình đang phân vân giữa ăn dặm kiểu Nhật và BLW. Mọi người cho mình xin ý kiến với ạ?',
    category: 'QnA',
    tags: ['Dinh dưỡng', 'Ăn dặm', 'Sức khỏe'],
    likes: 24,
    comments: [
         createComment('c3', 'u4', 'Chào bạn, ở tháng thứ 6 bạn nên bắt đầu với cháo loãng rây tỷ lệ 1:10 nhé.', '1 giờ trước')
    ],
    createdAt: '2 giờ trước',
    isLiked: true
  },
  {
    id: 'p2',
    userId: 'u3',
    user: users['u3'],
    title: '5 Trò chơi phát triển tư duy cho bé 3 tuổi tại nhà',
    content: 'Không cần đồ chơi đắt tiền, các mẹ có thể tự làm các trò chơi này từ bìa carton. Hôm nay mình sẽ hướng dẫn chi tiết cách làm nhà bìa cho bé...',
    category: 'Blog',
    tags: ['Giáo dục sớm', 'Trò chơi'],
    likes: 156,
    comments: [],
    createdAt: '1 ngày trước',
    imageUrl: 'https://picsum.photos/seed/kidsplay/600/300',
    isLiked: false
  },
  {
    id: 'p3',
    userId: 'u1',
    user: users['u1'],
    title: 'Tổng hợp tài liệu Flashcard chủ đề Động vật',
    content: 'Mình vừa sưu tầm được bộ flashcard rất đẹp, in ra giấy bìa cứng cho bé học rất tốt.',
    category: 'Document',
    tags: ['Tài liệu', 'Flashcard'],
    likes: 89,
    comments: [],
    createdAt: '2 ngày trước',
    isLiked: false
  }
];

export const mockGames: Game[] = [
  { id: 'g1', title: 'Lật Hình', description: 'Rèn luyện trí nhớ', thumbnail: 'https://picsum.photos/seed/game1/100/100', type: 'memory' },
  { id: 'g2', title: 'Tô Màu', description: 'Phát triển sáng tạo', thumbnail: 'https://picsum.photos/seed/game2/100/100', type: 'coloring' },
  { id: 'g3', title: 'Đố Vui', description: 'Học hỏi kiến thức', thumbnail: 'https://picsum.photos/seed/game3/100/100', type: 'quiz' },
];