# Mom & Kids Community Web App

Đây là mã nguồn cho trang web cộng đồng dành cho Mẹ và Bé. Trang web hỗ trợ đăng bài viết (blog), chia sẻ ảnh, và nhúng video từ YouTube, Facebook, TikTok.

## 🚀 1. Cách chạy thử trên máy tính (Local)

### Yêu cầu
Bạn cần máy tính đã cài đặt **Node.js**. (Tải tại: [https://nodejs.org/](https://nodejs.org/))

### Cài đặt & Chạy
1. Tải toàn bộ file về một thư mục.
2. Mở Terminal (CMD) tại thư mục đó.
3. Chạy lệnh:
   ```bash
   npm init -y
   npm install react react-dom lucide-react @google/genai parcel firebase
   ```
4. Chạy trang web:
   ```bash
   npx parcel index.html
   ```
5. Truy cập: **http://localhost:1234**

---

## 🌐 2. Đưa web lên mạng (Hosting) & Lưu dữ liệu (Database)

Để trang web chạy online và lưu được bài viết, bạn cần làm 2 bước sau:

### BƯỚC 1: Tạo Database trên Google Firebase
1. Truy cập [console.firebase.google.com](https://console.firebase.google.com/).
2. Đăng nhập Gmail và nhấn **"Create a project"** (Đặt tên là `mom-kids-app`).
3. Sau khi tạo xong, vào mục **Project Overview**, nhấn vào biểu tượng **Web (</>)**.
4. Đăng ký app, bạn sẽ nhận được một đoạn mã `firebaseConfig`.
5. **QUAN TRỌNG:** Copy các dòng trong `firebaseConfig` (apiKey, authDomain...) và dán vào file `services/firebase.ts` trong code của bạn.
6. Trong menu bên trái Firebase, chọn **Firestore Database** -> **Create Database** -> Chọn **Start in Test mode**. (Để cho phép ghi dữ liệu).
7. Chọn **Authentication** -> **Get Started** -> Bật **Google** hoặc **Email/Password** để cho phép đăng nhập.

### BƯỚC 2: Đưa web lên mạng bằng Vercel (Miễn phí)
Cách dễ nhất là thông qua GitHub.

1. **Đẩy code lên GitHub:**
   - Tạo tài khoản GitHub.
   - Tạo Repository mới.
   - Upload toàn bộ code của bạn lên đó.

2. **Kết nối Vercel:**
   - Truy cập [Vercel.com](https://vercel.com/) và đăng ký bằng GitHub.
   - Nhấn **"Add New..."** -> **Project**.
   - Chọn Repository `mom-kids-app` bạn vừa tạo.
   - Nhấn **Deploy**.

Vercel sẽ tự động cài đặt và cung cấp cho bạn một đường link (ví dụ: `mom-kids.vercel.app`). Bạn có thể gửi link này cho mọi người!

---

## 🛠 Tính năng chính
- **Bảng tin (Newsfeed):** Xem bài viết, video, ảnh.
- **Tương tác:** Like, Bình luận (Cần đăng nhập).
- **Đăng bài:** Hỗ trợ đăng Status, Blog (có tiêu đề), Video (YouTube/FB).
- **Góc Bé vui chơi:** Game lật hình, tài liệu học tập.
- **Trợ lý AI:** Chat với "Mẹ Thông Thái" (Powered by Gemini AI).

Chúc bạn thành công xây dựng cộng đồng của mình!