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
   npm install react react-dom lucide-react @google/genai parcel firebase
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

## 🛠 Tính năng chính
- **Bảng tin (Newsfeed):** Xem bài viết, video, ảnh.
- **Tương tác:** Like, Bình luận, Chia sẻ, Theo dõi.
- **Cộng đồng:** Tạo nhóm, tham gia nhóm.
- **Góc Bé vui chơi:** Game lật hình, tài liệu học tập.
- **Trợ lý AI:** Chat với "Mẹ Thông Thái", Phân tích bài viết, Gợi ý bình luận (Powered by OpenAI).
