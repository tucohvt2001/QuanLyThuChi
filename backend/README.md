# 🚀 QuanLyThuChi - Backend API Service

Service Backend RESTful API xây dựng bằng Node.js & Express kết nối cơ sở dữ liệu đám mây **Neon PostgreSQL**.

---

## 🛠️ Cài đặt & Chạy Local

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Cấu hình biến môi trường:
Tạo file `.env` (hoặc sao chép từ `.env.example`):
```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_jZbP5td7noue@ep-small-wave-bdytrjja-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=development
```

### 3. Migration cơ sở dữ liệu:
```bash
npm run migrate:all
```

### 4. Khởi chạy server:
```bash
# Môi trường phát triển (Hot reload)
npm run dev

# Môi trường production
npm start
```
* API Server: `http://localhost:5000`
* 📖 **Swagger API Docs**: `http://localhost:5000/api/docs` (hoặc `/docs`)

---

## 📖 Swagger API Documentation
Truy cập đường dẫn `/api/docs` trên trình duyệt để kiểm tra trực quan và chạy thử tất cả các endpoints:
- **`GET /api/health`**: Kiểm tra server và Neon DB.
- **`GET /api/dashboard/summary`**: Dữ liệu tài chính, tài sản ròng.
- **`CRUD /api/transactions`**: Thu chi và luân chuyển ví.
- **`CRUD /api/debts`**: Sổ vay nợ & thanh toán nợ.
- **`CRUD /api/friends`**: Danh bạ bạn bè & đối tác.
- **`CRUD /api/accounts`**: Tài khoản & ví tiền.
- **`CRUD /api/categories`**: Danh mục thu chi.
- **`CRUD /api/budgets`**: Ngân sách hàng tháng.

---

## ☁️ Hướng dẫn Deploy lên Render / Railway (Miễn phí)

### Cách Deploy trên Render.com:
1. Đẩy thư mục này lên GitHub Repository riêng (ví dụ: `quanlythuchi-backend`).
2. Vào [Render.com](https://render.com) -> Bấm **New** -> Chọn **Web Service**.
3. Kết nối với repo vừa tạo.
4. Cấu hình các thông số:
   - **Name**: `quanlythuchi-api`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Thêm các biến môi trường tại mục **Environment Variables**:
   - `DATABASE_URL`: *(Link Neon PostgreSQL của bạn)*
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
6. Bấm **Deploy Web Service**. Sau khi hoàn tất, Render sẽ cấp cho bạn một đường link API (Ví dụ: `https://quanlythuchi-api.onrender.com`).

