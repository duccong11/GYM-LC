# Tài liệu backend quản lý phòng GYM

Backend cung cấp API xác thực, quản lý và báo cáo, thực thi quyền của actor và lưu dữ liệu MySQL. Tài liệu này dành cho người phát triển backend và người cấu hình hệ thống. Backend được tổ chức theo MVC tách View sang frontend React.

## Luồng xử lý và trách nhiệm

routes/index.ts khai báo URL. Controller tiếp nhận body, lấy phiên và điều phối transaction. Service thực thi validation và quy tắc nghiệp vụ. Model quản lý truy vấn có tham số và connection MySQL. Middleware chuẩn hóa các lỗi thành JSON và kiểm tra Origin/CSRF. View nằm ở frontend, không đặt HTML nghiệp vụ trong backend.

## Thư mục và tập tin

| Đường dẫn | Trách nhiệm |
|---|---|
| src/server.ts | Kiểm tra MySQL trước khi listen, đóng pool khi dừng |
| src/app.ts | Express, JSON giới hạn 16 KB, header và routes |
| src/config/env.ts | Đọc .env hoặc .env.test theo chế độ |
| src/config/database.ts | Pool MySQL, UTF8, UTC, dateStrings |
| src/models/database.model.ts | Statement có bind, transaction, normalize ngày tháng |
| src/models/session.model.ts | Tra session theo digest cookie và tài khoản hoạt động |
| src/models/gym.model.ts | Đọc snapshot, ẩn dữ liệu theo vai trò |
| src/controllers/auth.controller.ts | Login, logout, session, giới hạn thử sai |
| src/controllers/gym.controller.ts | Snapshot, mutation và ghi audit |
| src/controllers/resource.controller.ts | API từng tài nguyên và ánh xạ thao tác |
| src/services/gym.service.ts | Quy tắc hội viên, gói, hóa đơn, điểm danh, nhân sự và tài sản |
| src/middleware/auth.middleware.ts | Origin, CSRF, cookie và yêu cầu phiên |
| src/middleware/error.middleware.ts | Ánh xạ lỗi validation, unique, FK và lỗi hệ thống |
| src/utils | Validation, ngày Việt Nam, quyền và băm mật khẩu |
| sql | DDL và SQL mẫu để nhập qua Workbench |
| scripts | Khởi tạo, seed và migration từ SQLite |

## Cấu hình kết nối

| Biến | Ví dụ | Ý nghĩa |
|---|---|---|
| DB_HOST | 127.0.0.1 | Máy chủ MySQL |
| DB_PORT | 3306 | Cổng MySQL chính |
| DB_NAME | quan_ly_phong_gym | Tên database theo đề tài |
| DB_USER | root | Tài khoản MySQL do người vận hành cung cấp |
| DB_PASSWORD | Tự điền | Mật khẩu MySQL, không commit |
| HOST | 127.0.0.1 | Địa chỉ backend lắng nghe |
| PORT | 4000 | Cổng backend |
| FRONTEND_ORIGIN | http://localhost:3000,http://127.0.0.1:3000 | Danh sách Origin cho thao tác ghi |
| NODE_ENV | development | production bật cookie Secure |

Tài khoản MySQL khác tài khoản đăng nhập website. MySQL root là ví dụ cấu hình local; có thể dùng tài khoản riêng được cấp quyền cho database. Không đặt DB_PASSWORD trong frontend hoặc VITE_*.

## Hợp đồng API

Tất cả dữ liệu nhận/gửi là JSON. GET /api/auth trả user và csrf nếu có phiên, 401 nếu chưa đăng nhập. POST /api/auth với action login, username, password tạo cookie; action logout cần X-CSRF-Token. GET /api/health kiểm tra kết nối MySQL.

| Tài nguyên | Đọc | Ghi |
|---|---|---|
| members | GET /api/members và /:id | POST, PUT /:id, DELETE /:id; PATCH /:id/archive |
| plans | GET /api/plans và /:id | POST, PUT /:id, DELETE /:id; PATCH /:id/toggle |
| payments | GET /api/payments và /:id | POST; không PUT/DELETE |
| checkins | GET /api/checkins và /:id | POST để vào; POST /checkout để ra |
| trainers | GET /api/trainers và /:id | POST, PUT /:id, DELETE /:id |
| users | GET /api/users và /:id | POST, PUT /:id; PATCH /:id/toggle |
| rooms | GET /api/rooms và /:id | POST, PUT /:id, DELETE /:id |
| equipment | GET /api/equipment và /:id | POST, PUT /:id, DELETE /:id |

GET /api/gym trả dữ liệu tổng hợp cho màn hình hiện tại. POST /api/gym giữ tương thích action của phiên bản trước; vẫn chạy cùng service và kiểm tra quyền, không có đường bỏ qua xác thực. Xóa hội viên và gói là xóa mềm. Chức năng thêm dữ liệu minh họa thực hiện bằng script có chủ đích, không mở qua API vận hành.

Ví dụ POST /api/payments: member_id, plan_id, method, request_id và start_date tùy chọn. Không cần gửi giá; backend lấy từ plans. Nếu gửi amount thì phải khớp giá thật. Gửi cùng request_id nhưng đổi nội dung trả 409.

## Xác thực và phiên

Mật khẩu PBKDF2 SHA256 100.000 vòng với salt ngẫu nhiên. Cookie gym_session chứa token ngẫu nhiên; bảng sessions lưu SHA256 token. Cookie HttpOnly, SameSite Strict, thời hạn 8 giờ và Secure khi NODE_ENV=production. Mỗi request kiểm tra thời hạn và active của tài khoản.

Thao tác ghi phải có Origin trong danh sách và X-CSRF-Token bằng mã phiên. Login giới hạn 5 lần trong 15 phút theo username, lần vượt giới hạn trả 429. Login thành công đặt lại bộ đếm; không tiết lộ tài khoản có tồn tại khi sai mật khẩu.

## Transaction và nhất quán dữ liệu

Mỗi mutation lấy connection và beginTransaction, khóa dòng mutation_lock số 1 bằng SELECT FOR UPDATE, kiểm tra lại actor rồi chạy nghiệp vụ, ghi audit_logs và commit. Khi có lỗi, rollback toàn bộ. Khóa chung bảo vệ kiểm tra overlap, replay thanh toán, phòng có thiết bị và số lượng ADMIN.

Unique index payments_request_unique chặn mã thanh toán trùng. Unique checkins_one_open chặn nhiều lượt chưa ra. CHECK/FK bảo vệ miền dữ liệu và liên kết. Giá và tên gói trong payments là snapshot, không liên kết động khi giá thay đổi.

## Mã lỗi

| HTTP | Ý nghĩa |
|---|---|
| 200 | Thành công, mutation trả ok và id khi có |
| 400 | Dữ liệu thiếu, sai kiểu, ngày/giá không hợp lệ hoặc vi phạm CHECK/FK |
| 401 | Chưa đăng nhập, hết phiên, sai mật khẩu hoặc tài khoản khóa |
| 403 | Không có quyền, Origin hoặc CSRF sai |
| 404 | Tài nguyên không có hoặc đã xóa |
| 409 | Trùng SĐT/username, overlap, lượt mở hoặc xung đột nghiệp vụ |
| 413 | Body quá lớn |
| 415 | Body không phải JSON |
| 429 | Vượt số lần thử đăng nhập |
| 500 | Kết nối hoặc lỗi nội bộ; không trả SQL hay mật khẩu ra client |

## Mở rộng

Thêm module bằng cách tạo model/service tương ứng, khai báo routes/controller, bổ sung ma trận quyền và schema migration. SQL chỉ bind giá trị; tên bảng/column động chỉ lấy từ allowlist nội bộ. Không sửa schema đã áp dụng bằng cách dựa vào CREATE TABLE IF NOT EXISTS; thay đổi tiếp theo cần migration có phiên bản.

Frontend không được quyết định quyền cuối cùng. Khi viết một endpoint mới, phải kiểm tra quyền đọc và ghi, kiểm tra dữ liệu, transaction nếu nhiều bước và bổ sung test MySQL cho bất biến quan trọng.
