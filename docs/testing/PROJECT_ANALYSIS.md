# Phân tích phiên bản trước chuyển MVC

Tài liệu này lưu phân tích bản D1 cũ. Kiến trúc hiện hành xem [Tổng quan](../PROJECT.md), [Backend](../../backend/README.md), [Frontend](../../frontend/README.md) và [MySQL](../../backend/sql/README.md).

# Phân tích trước và sau nâng cấp

## Công nghệ giữ nguyên
React 19.2.6, TypeScript 5.9, Vinext 1.0.0-beta.5 trên Vite 8, Cloudflare Workers, D1/SQLite và Drizzle migrations. Có bộ thành phần shadcn/Base UI, Lucide và Recharts; giao diện nghiệp vụ gốc sử dụng CSS và SVG riêng. Không chuyển sang Java hoặc tạo project thay thế.

## Phạm vi rà soát
Đã kiểm kê cây source, đọc nghiệp vụ app/lib/db, route, schema, migrations, tests và cấu hình. Bộ components/ui là thư viện UI dựng sẵn: đã quét import/export và điểm nhạy cảm; thành phần chart tạo CSS từ config nhưng không nhận dữ liệu người dùng tại website này. node_modules, dist, cache, Git và bản sao SQLite là dependency/artifact, không được coi là mã nghiệp vụ cần viết lại. Kiểm tra TypeScript bao gồm cả components/ui.

## Hiện trạng ban đầu
- 5 khu vực UI: tổng quan, hội viên, gói, thanh toán, điểm danh.
- Một API /api/gym cho toàn bộ đọc/ghi, chưa có đăng nhập ứng dụng.
- 4 bảng: members, plans, payments, checkins.
- Có SĐT duy nhất, gia hạn tự động, điểm danh 1 lần/ngày, CSV, lưu trữ/khôi phục.
- Chưa có quản lý nhân sự, phòng, thiết bị, check-out, phân trang, hóa đơn chi tiết, bộ lọc thời gian.
- Chưa có session và bảo vệ URL theo vai trò. Bản Sites dự kiến dựa vào lớp truy cập riêng tư nền tảng nhưng xuất bản trước đây thất bại; bản local không có lớp này.
- Doanh thu lọc bằng tháng UTC; request_id không đối chiếu payload; API test ghi lên database bài trình diễn.

## Kiến trúc sau bổ sung
- app/protected.tsx: bảo vệ trang bằng session và permissions; /admin/users bảo vệ trực tiếp.
- app/login và app/api/auth: đăng nhập, đăng xuất, hạn phiên 8 giờ, giới hạn 5 lần thử/15 phút theo username, cookie HttpOnly/SameSite=Strict/Secure khi HTTPS.
- lib/security.ts: PBKDF2-SHA256 100.000 vòng, salt riêng, kiểm tra hash và ma trận quyền. Số vòng chọn để tương thích Web Crypto của Workers; không phải cam kết chứng nhận bảo mật.
- lib/service.ts: dịch vụ nghiệp vụ có thể gọi từ D1 hoặc adapter SQLite trong test.
- lib/validation.ts: validation kiểu, liên hệ, ngày, tài khoản, phòng, thiết bị.
- app/management.tsx: UI CRUD dùng chung cho HLV, tài khoản, phòng, thiết bị.
- 10 bảng: thêm accounts, sessions, login_attempts, trainers, rooms, equipment; bổ sung trường và index vào 4 bảng gốc.
- tests: unit, integration SQLite trong bộ nhớ, system HTTP, E2E Edge.

## Bảo toàn dữ liệu
Migration 0000 giữ nguyên. Migration 0001 chỉ tạo bảng/thêm cột, thay ràng buộc điểm danh. Cột checkout_at mặc định legacy cho lịch sử cũ, hiển thị chưa ghi giờ ra; lượt mới ghi NULL khi đang tập. scripts/setup.mjs dùng SQLite backup trước nâng cấp và kiểm tra integrity/foreign_key. Chạy lại migration không lặp ALTER TABLE nhờ nhật ký _gym_migrations.
Dữ liệu mẫu có tiền tố demo-v2; INSERT OR IGNORE không ghi đè mã/username/SĐT có sẵn. Database trình diễn hiện có thêm 15 hội viên nên tổng có thể vượt 20 do giữ dữ liệu cũ. Database test mới có đúng 15 hội viên, 5 gói, 5 nhân viên/quản trị, 5 HLV, 4 phòng và 10 thiết bị.

## Quyết định nghiệp vụ
- Xóa hội viên là lưu trữ có khôi phục; xóa gói/HLV/phòng/thiết bị là xóa mềm. Đây là hành vi có chủ ý để bảo toàn lịch sử.
- Nhân viên thao tác hội viên, đăng ký, thanh toán, check-in/out và cập nhật thiết bị. Admin quản trị danh mục/tài khoản. HLV chỉ xem nghiệp vụ được phép và check-in/out; không nhận doanh thu hoặc danh sách tài khoản.
- Hồ sơ HLV và tài khoản TRAINER được quản lý độc lập; khóa quyền đăng nhập phải thao tác trong Nhân viên.
- Gói bán theo số ngày; tên 1/3/6/12 tháng trong dữ liệu mẫu tương ứng 30/90/180/365 ngày, không tự đổi theo tháng lịch.
- Chỉ ghi hóa đơn đã thu đủ tiền. Chưa tích hợp ngân hàng, thanh toán online hoặc hoàn tiền.
- Cho phép chọn ngày bắt đầu từ hôm nay đến 730 ngày tới; cấm trùng khoảng ngày, cả hai đầu mút được tính.
- Cho phép nhiều buổi một ngày sau khi check-out; ràng buộc database giữ tối đa một buổi mở.

## Phạm vi cần lưu ý khi dùng thực tế
Giao diện phân trang phía client; API đọc toàn bộ dataset theo quyền, phù hợp bài tập và dữ liệu vừa. Chưa làm kiểm thử tải quy mô lớn. Không có reset mật khẩu qua email; Admin đặt lại mật khẩu trong form. Không tự xuất bản lại Site cũ khi yêu cầu chỉ chỉnh project local. Tài khoản mẫu chỉ phục vụ học tập và phải đổi mật khẩu trước dùng ngoài lớp học.
