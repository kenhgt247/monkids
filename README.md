# Mom & Kids Community Web App

Đây là mã nguồn cho trang web cộng đồng dành cho Mẹ và Bé. Trang web hỗ trợ đăng bài viết (blog), chia sẻ ảnh, và nhúng video từ YouTube, Facebook, TikTok.

## 🚀 1. Cách chạy thử trên máy tính (Local)

### Yêu cầu
Bạn cần máy tính đã cài đặt **Node.js**. (Tải tại: [https://nodejs.org/](https://nodejs.org/))

### Cài đặt thư viện
1. Tải toàn bộ file về một thư mục.
2. Mở Terminal (CMD) tại thư mục đó.
3. Chạy lệnh cài đặt:
   ```bash
   npm init -y
   npm install react react-dom lucide-react @google/genai parcel firebase vite-plugin-pwa
   npm install -g vercel
   ```

### ⚠️ QUAN TRỌNG: Cách chạy để có API Chat GPT
Bạn **KHÔNG ĐƯỢC** dùng lệnh `parcel index.html` nếu muốn test tính năng Chat AI. Bạn phải dùng **Vercel CLI**.

1. Tạo file `.env.local` ở thư mục gốc, điền Key của bạn vào:
   ```env
   OPENAI_API_KEY=sk-proj-xxxx...
   ```
2. Chạy dự án bằng lệnh:
   ```bash
   vercel dev
   ```
   *(Nếu nó hỏi link project, cứ nhấn Enter/Yes liên tục).*
3. Truy cập: **http://localhost:3000** (Không phải 1234).

---

## 📱 4. Cài đặt PWA (App trên điện thoại)

Trang web đã được cấu hình PWA để có thể cài đặt như App.

### Bước 1: Tạo Icon cho App
Hệ thống cần 2 file ảnh PNG trong thư mục `public` (ngang hàng `index.html`) để làm icon trên điện thoại:
1. `public/pwa-192x192.png` (Kích thước 192x192 px)
2. `public/pwa-512x512.png` (Kích thước 512x512 px)

*Mẹo: Bạn có thể dùng trang https://favicon.io/favicon-converter/ để tạo nhanh từ logo của bạn.*

### Bước 2: Build & Deploy
Sau khi đưa lên Vercel, khi truy cập bằng điện thoại (Chrome/Safari), bạn sẽ thấy gợi ý "Add to Home Screen" (Thêm vào màn hình chính). Nhấn vào đó để cài App.

---

## 🌐 2. Đưa web lên mạng (Hosting) & Cấu hình API

Để tính năng Chat AI hoạt động khi đưa lên mạng, bạn cần cấu hình trên Vercel:

### BƯỚC 1: Đẩy code lên GitHub
1. Tạo tài khoản GitHub.
2. Tạo Repository mới.
3. Upload toàn bộ code lên đó.

### BƯỚC 2: Deploy lên Vercel
1. Truy cập [Vercel.com](https://vercel.com/) và đăng ký bằng GitHub.
2. Nhấn **"Add New..."** -> **Project**.
3. Chọn Repository `mom-kids-app` bạn vừa tạo.
4. Nhấn **Deploy**.

### BƯỚC 3: Cấu hình API Key (BẮT BUỘC)
Nếu không làm bước này, Chat AI sẽ báo lỗi "Missing API Key".

1. Tại trang quản lý project trên Vercel, vào tab **Settings**.
2. Chọn menu **Environment Variables** (bên trái).
3. Thêm biến mới:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-xxxxxxxx...` (Dán key OpenAI của bạn vào)
4. Nhấn **Save**.
5. **QUAN TRỌNG:** Vào tab **Deployments**, chọn cái trên cùng, nhấn nút **3 chấm (...)** -> **Redeploy** để áp dụng Key mới.

---

## 👑 3. Hướng dẫn Quản trị viên (Admin Dashboard)

Hệ thống có một trang quản trị chuyên nghiệp dành riêng cho Admin để quản lý người dùng, nội dung và cài đặt hệ thống.

### Cách 1: Tự thăng cấp mình thành Admin (Lần đầu tiên)
Vì hệ thống mới chưa có Admin, bạn cần can thiệp vào Database để cấp quyền cho chính mình:

1. Đăng nhập vào Website bằng tài khoản của bạn.
2. Truy cập [Firebase Console](https://console.firebase.google.com/).
3. Vào mục **Firestore Database** (bên trái).
4. Chọn collection **users**.
5. Tìm Document có chứa email của bạn.
6. Sửa trường `badgeType` thành giá trị: `'admin'`.
7. (Tùy chọn) Sửa trường `badge` thành `'Quản trị viên'`.
8. Quay lại trang web và tải lại trang (F5).

### Cách 2: Truy cập trang Admin
Sau khi đã có quyền Admin:
1. Rê chuột vào **Avatar** của bạn ở góc phải trên cùng (Header).
2. Trong menu thả xuống, nhấn vào nút **"Admin Panel"** (Màu tím).

### Các tính năng trong Admin Dashboard:
- **Tổng quan:** Xem thống kê User, Bài viết, Cộng đồng.
- **Người dùng:** 
  - Xem danh sách tất cả thành viên.
  - **Khóa tài khoản (Ban):** Chặn người dùng vi phạm.
  - **Thăng chức:** Chuyển người dùng thường thành Admin, Chuyên gia (Expert), VIP ngay trên giao diện.
- **Nội dung:** Xem và xóa nhanh các bài viết vi phạm.
- **Cài đặt:** 
  - Đổi tên trang web, mô tả SEO.
  - Đổi màu chủ đạo.
  - Bật/tắt Chat AI.
  - Cấu hình điểm thưởng (Ví dụ: Tăng điểm khi đăng bài).

---

## 🛠 Tính năng chính khác
- **Bảng tin (Newsfeed):** Xem bài viết, video, ảnh.
- **Tương tác:** Like, Bình luận, Chia sẻ, Theo dõi.
- **Cộng đồng:** Tạo nhóm, tham gia nhóm.
- **Góc Bé vui chơi:** Game lật hình, tài liệu học tập.
- **Trợ lý AI:** Chat với "Mẹ Thông Thái", Phân tích bài viết, Gợi ý bình luận (Powered by OpenAI).