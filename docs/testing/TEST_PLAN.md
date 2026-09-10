# Kế hoạch kiểm thử

## Phạm vi
Đăng nhập, phân quyền, hội viên, gói tập, đăng ký/gia hạn, thanh toán, điểm danh, HLV, nhân viên, phòng và thiết bị; tính hợp lệ dữ liệu, dữ liệu cũ và bố cục điện thoại.

## Môi trường
Windows, Node 24.19.0 (mức tối thiểu dự án 22.18), React/Vite, Express, MySQL 8.0, Microsoft Edge qua Playwright. Múi giờ nghiệp vụ Asia/Ho_Chi_Minh. DB kiểm thử tách khỏi DB chính; cổng 3100 tách cổng 3000.

## Các mức kiểm thử
- Unit: tính hạn, trạng thái gói, ngày Việt Nam, ràng buộc dữ liệu và mật khẩu.
- Integration: service thực thi trên MySQL thật; khóa ngoại, CRUD, quyền, giao dịch lặp, check-in đồng thời, bảo toàn dữ liệu cũ.
- System: HTTP thật qua Express; cookie, session, CSRF, Origin, đăng nhập sai, khóa tài khoản, API và truy cập URL.
- E2E: Edge thực hiện thao tác biểu mẫu, hóa đơn, gia hạn, điểm danh, CRUD, phân quyền, CSV, điện thoại.

## Tiêu chí
Các bộ tự động phải đạt; TypeScript và build phải thành công. Lỗi làm mất dữ liệu, vượt quyền hoặc sai thanh toán phải sửa và chạy lại. Test thủ công chưa thực thi không được ghi Pass. Screenshot cung cấp bằng chứng bố cục, không thay thế kiểm thử chức năng.

## Cách chạy và bằng chứng
Theo README. Báo cáo hệ thống: outputs/system-results.json. Playwright: outputs/playwright-report/index.html và JSON theo playwright.config.ts. Ảnh dashboard/mobile nằm trong outputs. Các lần chạy bổ sung dữ liệu riêng để tránh phụ thuộc thứ tự và không thay đổi DB chính.

## Ngoài phạm vi
Thanh toán ngân hàng thực, tải lớn, kiểm thử xâm nhập chuyên sâu, gửi email/SMS và triển khai Internet. Chưa xác nhận tương thích mọi trình duyệt; E2E hiện dùng Edge.
