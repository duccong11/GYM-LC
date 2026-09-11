# Website quản lý phòng GYM

Frontend React và backend Express TypeScript theo MVC, cơ sở dữ liệu **MySQL 8.0.16+**. Source đang dùng nằm trong hai thư mục **backend** và **frontend**.

## Chạy bằng VS Code

Mở thư mục dự án, mở Terminal ở thư mục gốc:

```powershell
pnpm install
Copy-Item backend/.env.example backend/.env
```

Nếu đã có backend/.env thì giữ file đó. Điền tài khoản và mật khẩu MySQL trong file này:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=quan_ly_phong_gym
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
```

Sau đó:

```powershell
pnpm db:setup
pnpm db:demo
pnpm dev
```

- Website: http://localhost:3000
- Backend: http://127.0.0.1:4000/api/health
- Node cần 22.18+ hoặc 24. MySQL phải đang chạy.
- Lần sau nhấp đúp Chay-GYM.cmd hoặc chạy pnpm dev.
- Dừng bằng Ctrl+C. Có thể chạy riêng pnpm dev:backend và pnpm dev:frontend.
- Tài khoản MySQL khác tài khoản đăng nhập website. Không đưa .env lên GitHub.

## Đăng nhập minh họa

Sau khi chạy db:demo hoặc nhập dữ liệu cũ:

| Vai trò | Tài khoản | Mật khẩu minh họa |
|---|---|---|
| ADMIN | admin | GymAdmin2026! |
| STAFF | staff1 đến staff4 | GymStaff2026! |
| TRAINER | coach1 đến coach4 | GymCoach2026! |

coach5 bị khóa trong dữ liệu minh họa. Mật khẩu lưu dạng PBKDF2 có salt. Dữ liệu mẫu là tùy chọn, không tự thêm khi mở website.

## SQL đầy đủ

[backend/sql](backend/sql/README.md) có:
- 00_create_database.sql: tạo database theo tên đề tài.
- 01_schema.sql: 13 bảng, khóa chính/ngoại, CHECK và index.
- 02_demo_data.sql: toàn bộ dữ liệu minh họa, chỉ nhập nếu cần.

Có thể chạy trực tiếp bằng MySQL Workbench hoặc dùng các script. Muốn dùng tài khoản khác root, điền DB_USER và DB_PASSWORD tương ứng. Tài khoản khởi tạo cần quyền tạo schema; tài khoản vận hành chỉ cần quyền CRUD trên database.

## Giữ dữ liệu từ phiên bản cũ

Đã có script nhập SQLite sang MySQL mà không sửa SQLite. **Chạy trên MySQL rỗng, trước db:demo**:

```powershell
node backend/scripts/import-sqlite.ts "duong_dan_den_database_cu.sqlite"
```

Toàn bộ INSERT chạy trong transaction, có lỗi sẽ rollback. Giữ ID và dữ liệu nghiệp vụ; không chuyển session cũ. Bản mã D1 trước chuyển đổi được lưu local ở outputs/legacy-d1 và lịch sử Git; nó không thuộc đường chạy hiện tại.

## Tài liệu

- [Tổng quan dự án và từng nghiệp vụ](docs/PROJECT.md)
- [Backend MVC và API](backend/README.md)
- [Frontend và các màn hình](frontend/README.md)
- [Schema và kết nối MySQL](backend/sql/README.md)
- [Bốn tài liệu Word](docs/word)
- [Hồ sơ kiểm thử](docs/KIEM_THU.md)

## Kiểm tra

```powershell
pnpm test
pnpm build
```

Để chạy MySQL/System/E2E, tạo backend/.env.test từ backend/.env.test.example và điền kết nối đến DB kiểm thử riêng:

```powershell
pnpm db:test
node tools/scripts/dev.mjs --test
# Terminal khác:
pnpm test:mysql
pnpm test:system
pnpm test:e2e
```

Cổng kiểm thử frontend 3100, backend 4100; DB quan_ly_phong_gym_test. Bộ E2E sử dụng Microsoft Edge. Không dùng kết quả D1 cũ làm kết quả MySQL; xem [kết quả thực chạy](docs/testing/TEST_RESULTS.md).

## Triển khai

pnpm build xuất frontend/dist và kiểm tra TypeScript backend. Backend chạy Node với MySQL; frontend cần SPA fallback và proxy /api cùng origin. HTTPS và NODE_ENV=production bật cookie Secure. Phiên bản MVC/MySQL này không còn dùng môi trường D1/Workers của bản cũ.

# Cấu trúc thư mục thực tế

backend và frontend chứa code ứng dụng. docs chứa tài liệu. tools/scripts và tools/tests chứa công cụ chạy và kiểm thử. outputs giữ kết quả kiểm chứng và bản sao dữ liệu cũ; không phải source chạy chính. node_modules là thư viện cần để chạy. Các cache .next, .vinext, .pnpm-store và bản dist của nền tảng cũ đã được xóa thực tế. Dữ liệu SQLite gốc được giữ tại outputs/backups/d1-local.
