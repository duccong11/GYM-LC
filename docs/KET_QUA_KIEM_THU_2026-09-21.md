# Kết quả kiểm thử Website quản lý phòng GYM — 21/09/2026

## Kết luận

Các luồng chính trong bộ kiểm thử hiện tại hoạt động. Chưa đủ cơ sở kết luận toàn bộ đặc tả được đáp ứng 100% hoặc bài hoàn toàn không có lỗi. Lần này kiểm thử và ghi nhận; không sửa mã nghiệp vụ.

## Kết quả thực chạy

| Hạng mục | Kết quả |
|---|---|
| Đơn vị và tích hợp MySQL/workflow | 45/45 đạt |
| API, phiên đăng nhập, CSRF, Origin, khóa tài khoản, giới hạn đăng nhập | 26/26 đạt |
| Giao diện tự động trên Edge | 12/12 đạt, 47,5 giây |
| Kiểm tra TypeScript và build Vite | Đạt |
| Lint toàn dự án | Chưa đạt: 74 chẩn đoán lỗi |

Các bài kiểm thử ghi dữ liệu vào `quan_ly_phong_gym_test` ở cổng 3307, giao diện cổng 3100/backend 4100. Không dùng database chính để tạo dữ liệu thử. Các bài kiểm thử có thể để lại dữ liệu mẫu trong database kiểm thử.

## Chức năng đã kiểm tra

- Đăng nhập, đăng xuất, tài khoản bị khóa/hết phiên, đăng ký công khai chỉ tạo MEMBER.
- Admin bị chặn nghiệp vụ; Quản lý không được cấp quyền tài khoản; HLV và Hội viên nhận dữ liệu theo phạm vi hồ sơ được liên kết.
- Thêm/sửa/lưu trữ/khôi phục hội viên; kiểm tra trùng thông tin.
- Đăng ký gói → thu tiền → kích hoạt; chống thu lặp và chồng thời hạn; gia hạn nối tiếp.
- Lịch tập: thời lượng, trùng lịch, bảo vệ HLV/phòng đang được sử dụng; hủy có kiểm tra liên quan.
- Hủy phiếu thu lưu lý do, loại khỏi doanh thu và thu hồi quyền tập; gói miễn phí không tạo doanh thu.
- Check-in/check-out, chặn lượt mở trùng, chặn hết hạn.
- Thêm/sửa thiết bị, CRUD HLV, tìm kiếm/phân trang, xuất CSV hội viên, màn hình điện thoại.
- Màn hình tổng quan không phát sinh lỗi JavaScript trong tình huống kiểm thử.

## Điểm còn tồn tại và việc cần làm

### 1. Bộ SQL rời chưa tương đương schema ứng dụng cuối cùng

Các file `sql/01_schema.sql` và `sql/03_actor_workflows.sql` chưa chứa toàn bộ cột và ràng buộc bổ sung như `accounts.member_id`, `accounts.trainer_id`, `payments.registration_id`, `payments.cancelled`, `payments.cancellation_reason`, mã nghiệp vụ `code` và giới hạn mới. Chúng được bổ sung bởi `backend/src/models/migration.model.ts`.

Người nhận cần chạy `node backend/scripts/migrate.ts` sau khi nhập SQL (backend cũng gọi migration khi khởi động). Vì vậy, hướng dẫn cũ rằng chỉ nhập lần lượt các file SQL là đủ chưa đầy đủ. Cần đóng gói SQL hoàn chỉnh hoặc ghi rõ bước migration. Các đường dẫn tương đối trong bản README sao chép sang thư mục `sql/` cũng cần sửa.

### 2. Chất lượng mã chưa sạch

Lint ghi nhận 74 chẩn đoán: `any`, ép chuỗi từ dữ liệu `unknown`, API kiểu `FormEvent` bị đánh dấu deprecated và quy tắc Next.js còn áp dụng cho React/Vite. Đây không phải 74 chức năng bị hỏng; build vẫn thành công. Chi tiết: `outputs/review-lint-20260921.txt`.

### 3. Cần chốt quy tắc lưu trữ khi hội viên đang trong phòng

Đã tái hiện trên MySQL kiểm thử: tạo hội viên, thu tiền, check-in, sau đó `member.archive` vẫn thành công. Kết quả: `archived=1`, một lượt check-in chưa đóng. Phép thử bổ sung đã rollback toàn bộ dữ liệu của nó.

Giao diện điểm danh có xét hội viên lưu trữ còn lượt mở, nên chưa kết luận đây là mất khả năng check-out. Tuy nhiên, cần chốt quy tắc nghiệp vụ: bắt buộc check-out trước khi lưu trữ, hoặc cho phép và thể hiện rõ trạng thái này. Bộ kiểm thử hiện tại chưa có tình huống hồi quy tương ứng.

## Giới hạn đánh giá

- Chưa kiểm tra tải lớn, nhiều người dùng thực tế hoặc chạy dài ngày.
- Chưa kiểm tra độc lập toàn bộ thao tác giao diện của từng vai trò; giới hạn dữ liệu đã kiểm tra ở service/API.
- Chưa kiểm tra mọi mẫu xuất/in báo cáo, cài mới trên máy khác và mọi giá trị biên trong file Word.
- Kết quả 83 kiểm tra đạt không đồng nghĩa bao phủ hết đặc tả. Cần đối chiếu từng test case Word/Excel trước khi đánh dấu tài liệu nộp bài là hoàn tất.

## Bằng chứng

- `outputs/review-unit-mysql-20260921.txt`: kết quả 45 kiểm thử.
- `outputs/system-results.json`: 26 kiểm tra API.
- `tools/tests/outputs/e2e-results.json`: kết quả 12 kiểm thử giao diện.
- `tools/tests/outputs/playwright-report/index.html`: báo cáo giao diện.
- `outputs/review-edge-20260921.mjs`: phép thử bổ sung lưu trữ/check-in, có rollback.
