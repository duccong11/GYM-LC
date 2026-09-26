# Báo cáo doanh thu và lịch tập

## Báo cáo dành cho Quản lý

Vào **Báo cáo**, chọn khoảng ngày và **Tổng hợp theo: Ngày / Tháng / Năm**. Các nút Hôm nay, Tháng này, Năm nay đặt nhanh khoảng thời gian đến ngày hiện tại.

- Doanh thu cộng số tiền thực thu của các phiếu thu chưa hủy, theo ngày tạo thanh toán tại múi giờ Việt Nam. Bảng hiển thị cả kỳ không có doanh thu, số giao dịch và tỷ trọng.
- Tiền mặt và chuyển khoản được tổng hợp riêng. Đổi cách nhóm ngày/tháng/năm không làm đổi tổng doanh thu của cùng khoảng lọc.
- Top 3 xếp theo số lượt chọn, không theo số tiền. Mỗi đăng ký chưa hủy tính một lượt, kể cả chờ thanh toán hoặc gói miễn phí. Mua/gia hạn trực tiếp không có đăng ký tính một lượt. Thanh toán liên kết đăng ký không cộng lượt thứ hai.
- Khoảng ngày áp dụng cho ngày tạo đăng ký hoặc ngày thanh toán trực tiếp. Vì vậy lượt chọn gói và doanh thu là hai chỉ tiêu khác nhau.
- Các gói cùng số lượt được xếp theo tên rồi mã để thứ tự ổn định. Cùng mã gói chỉ tính một nhóm dù tên gói đã thay đổi; tên hiển thị lấy từ dữ liệu lịch sử đã lưu.
- Xuất CSV gồm tổng hợp doanh thu và Top 3. In / Lưu PDF dùng chức năng in của trình duyệt.

Không cho xuất khi thiếu ngày, ngày đảo thứ tự hoặc khoảng quá 3.660 ngày. Chỉ Quản lý được truy cập báo cáo theo phân quyền hiện có. Không thay đổi cấu trúc MySQL; tính toán dùng snapshot dữ liệu đã được backend phân quyền.

## Lịch tập theo HLV

Vào **Lịch tập**, mặc định hiển thị bảng tuần từ thứ hai đến chủ nhật. Mỗi hàng là một HLV; mỗi cột là một ngày. Thẻ buổi tập hiển thị giờ, hội viên, phòng và ghi chú. Ngày hiện tại có nền nổi bật; lịch hủy có nhãn và gạch ngang.

- Dùng Hôm nay, Kỳ trước/Kỳ sau, chọn ngày và chế độ Ngày/Tuần để di chuyển.
- Lọc HLV hoặc dùng tìm kiếm, khoảng ngày và trạng thái để thu hẹp lịch.
- Quản lý/Nhân viên có thể bấm **+ Thêm lịch** tại một ô để điền sẵn HLV và ngày. Chọn hội viên sẽ cập nhật HLV theo phân công, sau đó vẫn được chọn HLV khác cho buổi tập.
- Nút Sửa và Hủy trên thẻ giữ nguyên phân quyền: Quản lý được sửa/hủy, Nhân viên chỉ sửa, HLV/Hội viên chỉ đọc lịch thuộc phạm vi của mình.
- Chuyển sang **Danh sách** để dùng bảng và phân trang như trước. Trên điện thoại, kéo ngang bên trong bảng tuần để xem các ngày; toàn trang không bị tràn ngang.
- Backend tiếp tục kiểm tra gói còn hiệu lực, thời lượng 30–180 phút và lịch trùng hội viên/HLV/phòng.

## Mã nguồn và kiểm thử

- `frontend/src/components/RevenueReport.tsx`: bộ lọc, chỉ tiêu, Top 3, CSV và in.
- `frontend/src/utils/reports.ts`: tổng hợp doanh thu, múi giờ và chống đếm trùng lượt chọn.
- `frontend/src/components/ScheduleBoard.tsx`: bảng lịch theo HLV.
- `tools/tests/reports.test.mjs`: các mốc ngày Việt Nam, năm nhuận, kỳ không doanh thu, xếp hạng và dữ liệu hủy.
- `tools/tests/e2e/gym.spec.ts`: E2E-14 kiểm tra báo cáo; E2E-15 kiểm tra thêm/sửa/hủy lịch từ bảng tuần và giao diện điện thoại.

## Kết quả xác nhận 24/09/2026

- 24 unit test, 16 MySQL test, 11 workflow test và 26 kiểm tra System/API đạt.
- Lượt E2E toàn bộ: 14/15 đạt; E2E-09 bị timeout khi chờ biểu mẫu đăng nhập. Chạy lại riêng E2E-09 và E2E-15 đều đạt; không sửa ca kiểm thử hoặc tăng timeout để bỏ qua lỗi. Chưa xác định nguyên nhân chắc chắn của timeout lần đầu.
- TypeScript backend/frontend và build frontend đạt. Lint ba module mới không báo lỗi; không khẳng định lint toàn dự án đã sạch.
- Đã xem ảnh giao diện desktop và điện thoại, xác nhận toàn trang không tràn ngang. Bảng tuần và bảng doanh thu cuộn ngang bên trong trên màn hình nhỏ.
- Log: `outputs/reports-calendar-final.log`, `outputs/reports-calendar-recheck.log`. Ảnh: `outputs/revenue-report-desktop.png`, `outputs/schedule-board-desktop.png` và các bản mobile tương ứng. Dữ liệu chạy thử nằm trong database kiểm thử riêng.
