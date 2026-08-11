# Tisora — Fashion Shop + Sapo Sync

Next.js e-commerce thời trang (layout tham chiếu EGA Style / Sapo): storefront, admin `/admin`, REST API `/api/v1`, đồng bộ Sapo.

## Stack

- Next.js 16 + TypeScript + Tailwind
- PostgreSQL (Neon) + Prisma
- Auth.js (credentials)
- Deploy: **Vercel** (web) + **Neon** (DB)
- Sapo Admin API + Webhooks

## Chạy local

```bash
docker compose up -d
npm install
# .env: DATABASE_URL + DATABASE_URL_UNPOOLED trỏ localhost:5433 (có thể giống nhau)
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

## Deploy GitHub → Vercel + Neon

### 1. Tạo database Neon

1. Vào [console.neon.tech](https://console.neon.tech) → **New Project** (region Singapore nếu có)
2. Copy 2 connection strings (hoặc dùng Neon integration trên Vercel):
   - **Pooled / Transaction** → `DATABASE_URL`
   - **Direct / Unpooled** → `DATABASE_URL_UNPOOLED`
3. Cả hai nên có `?sslmode=require`

### 2. Migrate data từ Railway (nếu đang có data)

```bash
# Export Railway Postgres
pg_dump "$RAILWAY_DATABASE_URL" -Fc -f railway.dump

# Restore vào Neon (dùng DATABASE_URL_UNPOOLED)
pg_restore --clean --if-exists --no-owner --no-acl -d "$DATABASE_URL_UNPOOLED" railway.dump
```

Hoặc dùng script helper (cần `pg_dump` / `pg_restore` trên máy):

```bash
# Windows PowerShell
$env:RAILWAY_DATABASE_URL="postgresql://..."
$env:DATABASE_URL_UNPOOLED="postgresql://...neon..."
npm run db:migrate-railway-neon
```

Nếu không lấy được Railway URL: import lại catalog từ Excel vào Neon:

```bash
# .env.local đã trỏ Neon
npm run db:import-sapo
npm run db:verify
```

Verify:

```bash
npm run db:verify
```

Giữ Railway **không xóa** cho đến khi Vercel chạy ổn.

### 3. Đẩy code & kết nối Vercel

```bash
git push -u origin main
```

1. [vercel.com](https://vercel.com) → **Add New Project** → import repo GitHub
2. Framework: Next.js (auto)
3. **Environment Variables** (Production):

| Key | Giá trị |
|-----|---------|
| `DATABASE_URL` | Neon **pooled** |
| `DATABASE_URL_UNPOOLED` | Neon **direct** |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://<project>.vercel.app` (đổi sau khi có domain) |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_BRAND_NAME` | `Tisora` |
| `NEXT_PUBLIC_HOTLINE` | hotline (tuỳ chọn) |
| `SAPO_STORE_URL` / `SAPO_ACCESS_TOKEN` / `SAPO_WEBHOOK_SECRET` | copy từ Railway nếu có |

4. Deploy → mở URL Vercel
5. Cập nhật `AUTH_URL` đúng domain public rồi **Redeploy**

### 4. Seed (chỉ khi DB trống)

```bash
# Local, .env trỏ Neon
npm run db:seed-if-empty
```

Import Excel lớn + ảnh: chạy local (Vercel Hobby dễ timeout):

```bash
npm run db:import-sapo
```

### 5. Kiểm tra

- Storefront + ảnh `/api/media/...`
- `/admin` → đăng nhập
- Checkout, Sapo settings
- Webhook Sapo: `https://<domain>/api/webhooks/sapo`

### Lưu ý Vercel

- Build chạy `prisma generate && prisma db push && next build` (cần `DATABASE_URL_UNPOOLED`)
- Không seed mỗi deploy
- Ảnh binary trong Neon chiếm storage — Free ~0.5GB; monitor usage
- Không commit `.env`

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
