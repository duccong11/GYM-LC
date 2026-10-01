# Cài đặt và chạy Java MVC

## 1. Môi trường

- JDK 17 và Maven có trong PATH: `java -version`, `mvn -version`.
- Node.js 22+ để biên dịch/chạy View: `node -v`.
- MySQL 8, database mặc định `quan_ly_phong_gym`.

Tại thư mục dự án chạy `npm install`. Sao chép `.env.example` thành `.env` nếu chưa có, rồi điền DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD. Không commit `.env`.

## 2. Dữ liệu hiện có

Bản Java dùng schema MySQL và định dạng mật khẩu của bản Node đã chuyển. Không seed, xóa hay tái tạo dữ liệu khi khởi động bình thường.

Nếu bạn đang dùng database hiện tại, chạy ngay `run-dev.cmd`. Trên PowerShell dùng `.\run-dev.cmd`.

## 3. Máy mới chưa có database

Build trước: `npm run build`. Sau đó:

```powershell
java -jar target/gym-lc-1.0.0.jar --setup --demo
```

Lệnh chỉ chấp nhận database chưa có bảng. Tài khoản MySQL cần quyền tạo database/bảng. Nó dùng `src/main/resources/db/schema.sql`, tương ứng `db/migrations/V001__baseline.sql`.

`--demo` tạo dữ liệu mẫu nhỏ và các tài khoản sau, chỉ dùng để học/kiểm thử:

| Vai trò | Tài khoản | Mật khẩu demo |
|---|---|---|
| Admin | admin | GymAdmin2026! |
| Quản lý | manager | GymManager2026! |
| Nhân viên | staff1 | GymStaff2026! |
| HLV | coach1 | GymCoach2026! |
| Hội viên | member1 | GymMember2026! |

Không có `--demo` thì công cụ chỉ tạo cấu trúc, role, khóa transaction và cấu hình phòng tập; chưa có tài khoản đăng nhập.

## 4. Hai cách chạy

**Phát triển:** `.\run-dev.cmd` → frontend http://localhost:3000, Java API http://127.0.0.1:4000. Cần Node và Maven.

**Chạy bản đóng gói:** `npm run build`, rồi `java -jar target/gym-lc-1.0.0.jar` → http://localhost:4000. Sau khi đã build, máy chạy chỉ cần Java và MySQL. FRONTEND_ORIGIN cần bao gồm URL bạn mở.

Nếu cổng đã có tiến trình sử dụng, dừng đúng terminal đang chạy trước khi chạy lại; script không tự tắt tiến trình không thuộc ứng dụng.

## 5. Kiểm thử riêng

Unit test: `mvn test` (không cần MySQL).

Kiểm thử tích hợp dùng database cố định `quan_ly_phong_gym_java_test` và cổng 4100. Các lệnh sau tạo lại **database kiểm thử**, không thực hiện trên database chính:

```powershell
node scripts/reset-java-test.mjs --reset
node scripts/test-server.mjs --setup --demo
node scripts/test-server.mjs
```

Mở terminal khác:

```powershell
node scripts/test-api.mjs
node scripts/test-ui.mjs
```

UI test cần Microsoft Edge. Kết quả lưu trong `outputs/java-migration/`.

## 6. Đưa lên Git

Commit `src`, `db`, `scripts`, `docs`, `pom.xml`, package manifest/lock và file chạy. Không commit `.env`, `target`, `node_modules` hoặc SQL dump có dữ liệu cá nhân. Source Node cũ được lưu trong `legacy` để đối chiếu; có thể lưu riêng sau khi nghiệm thu Java.
