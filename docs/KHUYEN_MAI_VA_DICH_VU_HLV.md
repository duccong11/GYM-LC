# Khuyến mãi lễ/Tết và phân công dịch vụ

- Quản lý được thêm, sửa, ngừng và lưu trữ khuyến mãi. Nhân viên chỉ xem và áp dụng tự động khi đăng ký/thu tiền. Admin không quản lý nghiệp vụ này.
- Khuyến mãi gồm tên, ngày bắt đầu, ngày kết thúc (bao gồm hai đầu), mức giảm nguyên 1–100% và trạng thái. Ngày xét là ngày lập/sửa đăng ký theo giờ Việt Nam, không phải ngày bắt đầu tập. Lễ âm lịch nhập ngày dương lịch tương ứng mỗi năm.
- Áp dụng toàn bộ gói tập; trùng ngày chọn mức giảm cao nhất, không cộng dồn. Số tiền sau giảm làm tròn đến đồng. Giảm 100% kích hoạt qua Đăng ký gói, không tạo phiếu thu 0 đồng.
- Đăng ký lưu giá gốc, phần trăm, tên chương trình và giá sau giảm. Sửa đăng ký chờ thanh toán sẽ báo giá lại. Sửa/ngừng chương trình không đổi đăng ký đã chốt; thu tiền dùng giá đăng ký. Báo cáo doanh thu dùng tiền thực thu.
- Thêm/sửa HLV: tích ít nhất một dịch vụ thay cho nhập Chuyên môn. Có thể chọn nhiều dịch vụ. Không bỏ dịch vụ còn lịch sắp tới. Không phân công mới dịch vụ ngừng hoạt động.
- Thêm/sửa dịch vụ không thay đổi liên kết HLV. Danh sách HLV của dịch vụ chỉ để xem. Chọn dịch vụ trong lịch tiếp tục lọc theo liên kết này.

## Cơ sở dữ liệu và kiểm tra

Khởi động backend tự chạy migration: bảng `promotions`, cột `original_price`, `discount_percent`, `promotion_name` trên `registrations`. Không xóa dữ liệu cũ. SQL tạo bảng: `backend/sql/05_promotions.sql` (bản chia sẻ trong `sql/05_promotions.sql`). Các cột đăng ký được thêm có kiểm tra tồn tại trong migration Node.

Kiểm thử đơn vị: `node --test tools/tests/holiday.test.mjs`.
Kiểm thử tích hợp: `node tools/scripts/test-holiday-local.mjs` tạo schema `quan_ly_phong_gym_test` riêng bằng cấu hình kết nối local; dữ liệu nghiệp vụ của bài test được rollback. Không chạy trên database chính.
