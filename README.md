# Tisora — Fashion Shop + Sapo Sync

Next.js e-commerce thời trang (layout tham chiếu EGA Style / Sapo): storefront, admin `/admin`, REST API `/api/v1`, đồng bộ Sapo.

## Stack

- Next.js 16 + TypeScript + Tailwind
- PostgreSQL + Prisma
- Auth.js (credentials)
- Sapo Admin API + Webhooks

## Chạy local

```bash
docker compose up -d
npm install
npm run db:setup
npm run dev
```

- Storefront: http://localhost:3000  
- Admin: http://localhost:3000/admin  
- Postgres Docker: port **5433**

### Tài khoản demo (sau khi seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tisora.vn | admin123 |
| Khách | khach@tisora.vn | khach123 |

---

## Deploy GitHub → Railway

### 1. Đẩy code lên GitHub

```bash
git init   # nếu chưa có
git add .
git commit -m "Initial commit: LUNARA fashion shop"
# Tạo repo trống trên GitHub, rồi:
git remote add origin https://github.com/<USER>/<REPO>.git
git branch -M main
git push -u origin main
```

### 2. Tạo project trên Railway

1. Vào [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → chọn repo vừa push
3. **Add Plugin / Database** → **PostgreSQL** (cùng project)
4. Vào service Web → **Variables**:
   - `DATABASE_URL` = reference từ Postgres (`${{Postgres.DATABASE_URL}}`)
   - `AUTH_SECRET` = chuỗi random dài (vd generate bằng `openssl rand -base64 32`)
   - `AUTH_URL` = URL public Railway (vd `https://webthoitrang-production-xxxx.up.railway.app`) — **không** dùng localhost
   - `AUTH_TRUST_HOST` = `true` (khuyến nghị trên Railway)
   - `NEXT_PUBLIC_BRAND_NAME` = `Tisora`
   - `NEXT_PUBLIC_HOTLINE` = hotline (tuỳ chọn)
   - Sapo vars để trống cũng được lúc đầu

5. **Quan trọng:** `DATABASE_URL` phải có trên service Web (Reference từ Postgres). Nếu thiếu, start sẽ fail.
6. Deploy lại nếu cần (Railway dùng `railway.toml`: build = `npm run build`, start = `npm run start` — schema sync lúc **start**, không lúc build)
7. Sau deploy thành công, **cập nhật `AUTH_URL`** đúng domain public rồi redeploy (hoặc restart)

### 3. Seed admin trên production (1 lần)

Trong Railway → service Web → **Settings** → hoặc dùng CLI:

```bash
railway run npm run db:seed
```

Hoặc mở tab **Shell** trên service và chạy `npm run db:seed`.

### 4. Kiểm tra

- Mở URL Railway → storefront
- `/admin` → đăng nhập `admin@tisora.vn` / `admin123`
- PDP demo: `/products/dam-voan-tang-ruby`
- `/admin/settings/sapo` → gắn token Sapo khi sẵn sàng
- Webhook Sapo: `https://<domain>/api/webhooks/sapo`

### Lưu ý

- Start chạy `prisma db push` — schema tự đồng bộ mỗi lần container khởi động (cần `DATABASE_URL` lúc runtime)
- Không commit file `.env` (đã nằm trong `.gitignore`)
- Spending limit: bật trên Railway để tránh phát sinh ngoài dự kiến

---

## REST API

Auth: session admin **hoặc** `Authorization: Bearer <api-key>` (tạo tại `/admin/api-keys`)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/v1/products` | List sản phẩm |
| GET | `/api/v1/products/:id` | Chi tiết |
| POST | `/api/v1/products/sync` | Sync từ Sapo |
| GET | `/api/v1/orders` | List đơn |
| POST | `/api/v1/orders` | Tạo đơn |
| POST | `/api/v1/orders/:id/push-sapo` | Đẩy lại Sapo |
| GET | `/api/v1/inventory` | Tồn kho |
| POST | `/api/v1/inventory/sync` | Sync tồn |
