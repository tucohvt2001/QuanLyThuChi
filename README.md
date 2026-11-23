# 💰 ThuChi 247 - Quản Lý Thu Chi Cá Nhân & Sổ Nợ (Web + Mobile PWA)

Dự án đã được phân chia thành **2 thư mục độc lập hoàn toàn**:
- **`backend/`**: RESTful API Service (Node.js, Express, Neon PostgreSQL).
- **`frontend/`**: Giao diện người dùng Web & Mobile PWA (React, Vite, Tailwind CSS, Recharts).

Bạn có thể đẩy riêng từng thư mục lên 2 GitHub Repository khác nhau để deploy độc lập, hoặc chạy đồng thời trên máy tính.

---

## 📁 Cấu trúc Thư mục Độc lập

```text
QuanLyThuChi/
├── backend/                   👉 Project Backend độc lập (Deploy Render / Railway)
│   ├── src/
│   │   ├── config/db.js       (Kết nối Neon PostgreSQL)
│   │   ├── controllers/       (Nghiệp vụ Thu chi, Sổ nợ, Bạn bè, Ví, Ngân sách)
│   │   ├── routes/            (Routes API)
│   │   └── server.js          (Express app)
│   ├── .env                   (Cấu hình PORT & DATABASE_URL)
│   ├── package.json
│   └── README.md              (Hướng dẫn deploy backend lên Render / Railway)
│
├── frontend/                  👉 Project Frontend độc lập (Deploy Vercel / Netlify)
│   ├── src/
│   │   ├── components/        (Navbar, Sidebar, BottomNav, các Modal)
│   │   ├── pages/             (Dashboard, Sổ giao dịch, Sổ nợ, Bạn bè, Ví tiền...)
│   │   └── services/api.js    (Gọi API backend thông qua VITE_API_URL)
│   ├── public/                (PWA manifest.json, sw.js)
│   ├── vercel.json            (Cấu hình định tuyến SPA cho Vercel)
│   ├── .env                   (VITE_API_URL=http://localhost:5000)
│   ├── package.json
│   └── README.md              (Hướng dẫn deploy frontend lên Vercel)
│
└── package.json               (Tùy chọn: Chạy cả 2 cùng lúc khi dev ở máy local)
```

---

## 🚀 1. Chạy thử ở máy Local (Phát triển)

Bạn có 2 lựa chọn:

### Lựa chọn A: Chạy cả 2 cùng lúc từ thư mục gốc
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

### Lựa chọn B: Mở 2 cửa sổ terminal riêng biệt
- **Terminal 1 (Backend)**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## ☁️ 2. Hướng dẫn Deploy lên Đám mây (Miễn phí)

### Bước 1: Deploy Backend lên Render hoặc Railway
1. Khởi tạo Git và đẩy riêng thư mục `backend/` lên một Repo GitHub (ví dụ: `quanlythuchi-backend`):
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit backend"
   # Đẩy lên github repo của bạn
   ```
2. Vào [Render.com](https://render.com) -> Chọn **New Web Service** -> Chọn Repo backend vừa tạo.
3. Build Command: `npm install` | Start Command: `npm start`.
4. Thêm biến môi trường:
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_jZbP5td7noue@ep-small-wave-bdytrjja-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
5. Bấm Deploy -> Bạn sẽ nhận được link API: ví dụ `https://quanlythuchi-api.onrender.com`.

---

### Bước 2: Deploy Frontend lên Vercel
1. Khởi tạo Git và đẩy riêng thư mục `frontend/` lên một Repo GitHub khác (ví dụ: `quanlythuchi-frontend`):
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit frontend"
   # Đẩy lên github repo của bạn
   ```
2. Vào [Vercel.com](https://vercel.com) -> Bấm **Add New Project** -> Chọn Repo frontend vừa tạo.
3. Framework Preset: `Vite`.
4. Thêm biến môi trường (Environment Variable):
   - `VITE_API_URL`: Điền link backend vừa deploy ở Bước 1 (ví dụ `https://quanlythuchi-api.onrender.com`).
5. Bấm **Deploy** -> Vercel sẽ cấp link web: ví dụ `https://quanlythuchi.vercel.app`.
