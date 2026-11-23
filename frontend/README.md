# 💻 QuanLyThuChi - Frontend Web & Mobile PWA

Ứng dụng quản lý tài chính cá nhân đa nền tảng (Web + Mobile PWA) xây dựng bằng **React 18**, **Vite**, **Tailwind CSS**, **Lucide Icons** và **Recharts**.

---

## 🛠️ Cài đặt & Chạy Local

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Cấu hình biến môi trường:
Tạo file `.env`:
```env
VITE_API_URL=http://localhost:5000
```
*(Nếu chạy cùng máy với backend qua proxy vite, có thể để trống `VITE_API_URL=`)*

### 3. Chạy giao diện ở môi trường Dev:
```bash
npm run dev
```
Giao diện sẽ chạy tại: `http://localhost:3000`

### 4. Build sản phẩm Production:
```bash
npm run build
```

---

## ☁️ Hướng dẫn Deploy lên Vercel / Netlify (Miễn phí)

### Cách Deploy trên Vercel:
1. Đẩy thư mục này lên GitHub Repository riêng (ví dụ: `quanlythuchi-frontend`).
2. Vào [Vercel.com](https://vercel.com) -> Bấm **Add New Project**.
3. Import GitHub Repo vừa tạo.
4. Cấu hình:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Mục **Environment Variables**:
   - Thêm biến `VITE_API_URL` với giá trị là đường link backend đã deploy (Ví dụ: `https://quanlythuchi-api.onrender.com`).
6. Bấm **Deploy**. Vercel sẽ tự động cấp tên miền miễn phí (Ví dụ: `https://quanlythuchi.vercel.app`).

