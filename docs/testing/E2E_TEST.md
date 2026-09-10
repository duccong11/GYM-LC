# Kịch bản E2E

Chạy tự động: `pnpm test:e2e`. Dùng database `.wrangler/test-state`, cổng 3100 và trình duyệt Edge headless với profile mới. Mã thực thi: `tests/e2e/gym.spec.ts`. Không dùng database local của bài trình diễn.

## E2E-01: Đăng ký hội viên mới

- Điều kiện: Admin; SĐT mới.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Đăng nhập → Hội viên → Thêm hội viên → Nhập họ tên, SĐT, ngày sinh, địa chỉ → Lưu → Tìm kiếm.
- Kết quả mong đợi: Hồ sơ có mã mới và xuất hiện đúng dữ liệu.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

## E2E-02: Đăng ký gói và xem hóa đơn

- Điều kiện: Hội viên chưa có gói; gói hoạt động.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Đăng nhập → Thanh toán → Chọn hội viên → Chọn gói → Xác nhận đã thu tiền → Tìm hóa đơn → Xem chi tiết.
- Kết quả mong đợi: Hóa đơn có giá chính xác, thời hạn và trạng thái.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

## E2E-03: Check-in và check-out

- Điều kiện: Hội viên còn hạn.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Đăng nhập → Điểm danh → Tìm hội viên → Check-in → Check-out → Check-in lại.
- Kết quả mong đợi: Mỗi lượt có giờ vào/ra; không có hai lượt mở.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

## E2E-04: Gia hạn hội viên

- Điều kiện: Hội viên có gói đang hiệu lực.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Đăng nhập → Hội viên → Tìm → Gia hạn → Chọn gói → Để ngày trống → Xác nhận.
- Kết quả mong đợi: Gói mới bắt đầu ngày sau hạn cuối của gói cũ.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

## E2E-05: Quản lý thiết bị

- Điều kiện: Admin; phòng đang hoạt động.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Đăng nhập → Thiết bị → Thêm → Lưu → Sửa → Chuyển bảo trì → Tìm lại.
- Kết quả mong đợi: Tình trạng Đang bảo trì được lưu.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

## E2E-06: Quản lý HLV

- Điều kiện: Admin; SĐT mới.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Đăng nhập → HLV → Thêm → Nhập chuyên môn, kinh nghiệm, lịch → Lưu → Xóa → Xác nhận.
- Kết quả mong đợi: Tạo và xóa khỏi danh sách thành công.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

## E2E-07: Lưu trữ/khôi phục hội viên

- Điều kiện: Hội viên mẫu.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Đăng nhập → Hội viên → Xóa → Xác nhận → Lọc Đã lưu trữ → Khôi phục.
- Kết quả mong đợi: Giữ mã, thông tin và lịch sử.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

## E2E-08: Kiểm tra quyền HLV

- Điều kiện: coach1.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Đăng nhập HLV → Mở /admin/users trực tiếp → Gọi API tạo thanh toán.
- Kết quả mong đợi: Không thấy nội dung Admin; API trả 403.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

## E2E-09: Đăng xuất và session

- Điều kiện: Phiên đã đăng nhập.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Đăng nhập → Đăng xuất → Gọi API → Mở URL quản trị.
- Kết quả mong đợi: API 401; URL chuyển /login.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

## E2E-10: Tìm kiếm, phân trang, CSV, mobile

- Điều kiện: Ít nhất 9 hội viên.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Đăng nhập → Hội viên → Trang sau → Tìm không có kết quả → Xóa tìm kiếm → Xuất CSV → Đổi màn hình 390px.
- Kết quả mong đợi: Không lỗi trạng thái rỗng; có CSV; không tràn ngang trang.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

## E2E-11: Đăng nhập sai

- Điều kiện: Username chưa có.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Mở Login → Nhập sai username/password → Đăng nhập.
- Kết quả mong đợi: Hiện thông báo lỗi và ở lại Login.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

## E2E-12: Tổng quan

- Điều kiện: Admin; dữ liệu mẫu.
- Dữ liệu: bộ seed test; dữ liệu mới dùng tên/SĐT có mã thời gian để không trùng.
- Luồng: Đăng nhập → Tổng quan → Xem thống kê doanh thu năm → Chụp giao diện.
- Kết quả mong đợi: Không lỗi JavaScript; hiển thị thống kê từ database.
- Kết quả thực chạy: xem TEST_RESULTS.md và báo cáo HTML trong outputs/playwright-report.

