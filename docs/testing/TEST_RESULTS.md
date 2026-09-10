# Kết quả kiểm thử bản MVC và MySQL

Ngày 10/09/2026. Windows, Node 24.19.0, MySQL Community Server 8.0.46, React/Vite, Express và Microsoft Edge.

| Hạng mục | Kết quả thực chạy |
|---|---|
| Unit trên backend mới | 20/20 đạt |
| Tích hợp MySQL thật | 16/16 đạt |
| System HTTP xác thực và phân quyền | 26/26 kiểm tra đạt |
| E2E sau chuyển API tài nguyên | 12/12 đạt trong 29 giây |
| TypeScript backend và frontend | Đạt |
| Build frontend | Đạt |
| DDL và dữ liệu minh họa MySQL | Đã thực thi thành công |
| Import SQLite sang MySQL riêng | Đạt, giữ 10 tài khoản, 24 hội viên, 9 gói, 5 HLV, 4 phòng, 10 thiết bị, 22 hóa đơn, 21 lượt tập |
| Kết nối MySQL chính cổng 3306 | Chờ người dùng điền DB_PASSWORD; chưa xác nhận |

Bằng chứng nằm ở outputs/e2e-results.json, outputs/playwright-report/index.html, outputs/system-results.json và outputs/mysql-import-result.json. Thư mục outputs chứa dữ liệu kiểm chứng local, không commit database hay bản sao dữ liệu thật.

MySQL kiểm thử riêng chạy cổng 3307 tại outputs/mysql-test-server, không thay đổi dịch vụ MySQL80 ở cổng 3306. Cấu hình kiểm thử nằm trong backend/.env.test, không commit. Chỉ cấu hình lại file này nếu chạy kiểm thử trên máy khác.

Các ca thủ công trong TEST_CASES.md chưa chạy thủ công; không được suy từ kết quả tự động thành Pass toàn bộ. Báo cáo D1 cũ đã được thay bằng kết quả trên. Chưa kiểm thử tải lớn, nhiều trình duyệt hoặc production.
