
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
    isLiked: false,
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // Link PDF mẫu để test nút tải về
  }
];

// Danh sách 10 Game cho bé 2-6 tuổi
export const mockGames: Game[] = [
  { 
    id: 'game_memory', 
    title: 'Lật Hình Siêu Trí Nhớ', 
    description: 'Rèn luyện trí nhớ cho bé qua các hình ảnh con vật ngộ nghĩnh.', 
    thumbnail: 'https://img.freepik.com/free-vector/hand-drawn-memory-game-cards_23-2150146036.jpg', 
    type: 'memory',
    color: 'bg-blue-100 text-blue-600'
  },
  { 
    id: 'game_color', 
    title: 'Bong Bóng Màu Sắc', 
    description: 'Học nhận biết màu sắc qua việc đập vỡ các quả bóng bay.', 
    thumbnail: 'https://img.freepik.com/free-vector/balloons-background-concept_23-2148525389.jpg', 
    type: 'quiz',
    color: 'bg-red-100 text-red-600'
  },
  { 
    id: 'game_english_fruit', 
    title: 'Tiếng Anh Hoa Quả', 
    description: 'Học từ vựng tiếng Anh chủ đề trái cây: Apple, Banana...', 
    thumbnail: 'https://img.freepik.com/free-vector/fruit-set-collection-vector_53876-43572.jpg', 
    type: 'quiz',
    color: 'bg-green-100 text-green-600'
  },
  { 
    id: 'game_counting', 
    title: 'Bé Tập Đếm Số', 
    description: 'Đếm số lượng con vật và chọn đáp án đúng. Toán học cơ bản.', 
    thumbnail: 'https://img.freepik.com/free-vector/counting-numbers-with-animals_23-2148866952.jpg', 
    type: 'quiz',
    color: 'bg-yellow-100 text-yellow-600'
  },
  { 
    id: 'game_animal_sound', 
    title: 'Ai Kêu Thế Nhỉ?', 
    description: 'Nghe tiếng kêu và đoán xem đó là con vật nào.', 
    thumbnail: 'https://img.freepik.com/free-vector/farm-animals-set_1308-28987.jpg', 
    type: 'quiz',
    color: 'bg-orange-100 text-orange-600'
  },
  { 
    id: 'game_vietnamese', 
    title: 'Bảng Chữ Cái Việt', 
    description: 'Làm quen với mặt chữ cái Tiếng Việt A, Ă, Â, B, C...', 
    thumbnail: 'https://img.freepik.com/free-vector/colorful-alphabet-collection_23-2148858682.jpg', 
    type: 'quiz',
    color: 'bg-purple-100 text-purple-600'
  },
  { 
    id: 'game_piano', 
    title: 'Nhạc Sĩ Nhí', 
    description: 'Chơi đàn Piano với các nốt nhạc Do Re Mi vui nhộn.', 
    thumbnail: 'https://img.freepik.com/free-vector/colorful-piano-keys-background_23-2147631777.jpg', 
    type: 'coloring', // Using 'coloring' type as generic interactive
    color: 'bg-pink-100 text-pink-600'
  },
  { 
    id: 'game_math', 
    title: 'Toán Vui Nhộn', 
    description: 'Phép cộng đơn giản trong phạm vi 10 cho bé 5-6 tuổi.', 
    thumbnail: 'https://img.freepik.com/free-vector/math-worksheet-template_1308-28498.jpg', 
    type: 'quiz',
    color: 'bg-teal-100 text-teal-600'
  },
  { 
    id: 'game_shapes', 
    title: 'Hình Học Quanh Ta', 
    description: 'Nhận biết hình tròn, hình vuông, tam giác.', 
    thumbnail: 'https://img.freepik.com/free-vector/geometric-shapes-cartoon-characters_23-2148854467.jpg', 
    type: 'quiz',
    color: 'bg-indigo-100 text-indigo-600'
  },
  { 
    id: 'game_shadow', 
    title: 'Tìm Bóng Đồ Vật', 
    description: 'Ghép đồ vật với cái bóng của nó. Rèn luyện quan sát.', 
    thumbnail: 'https://img.freepik.com/free-vector/find-correct-shadow-educational-game-kids_1308-111109.jpg', 
    type: 'quiz',
    color: 'bg-gray-100 text-gray-600'
  }
];
