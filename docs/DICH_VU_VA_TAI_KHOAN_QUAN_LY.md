# Quản lý, dịch vụ và đăng ký lịch tập

## Tài khoản và phân quyền

Tài khoản `quanly` có vai trò `MANAGER`: quản lý hội viên, gói tập, dịch vụ, HLV, phòng, lịch tập, thanh toán và báo cáo. ADMIN vẫn chỉ quản lý tài khoản/phân quyền/hệ thống. STAFF đọc danh mục dịch vụ và tạo/sửa lịch nhưng không được sửa danh mục hay phân công HLV.

Lệnh thiết lập: `npm run db:services`. Lệnh này thêm dữ liệu còn thiếu, không đặt lại mật khẩu tài khoản đã có. Mật khẩu ngẫu nhiên của tài khoản mới được lưu trong `outputs/tai-khoan-quan-ly.txt` (không đưa lên Git).

Thiết lập lần đầu thêm 3 dịch vụ Gym, Yoga, Boxing và 6 HLV mẫu, mỗi dịch vụ 2 người. Các hồ sơ mẫu có tên bắt đầu bằng “HLV”; số điện thoại được sinh để minh họa. Quản lý cần sửa thông tin liên hệ/chuyên môn theo nhân sự thực tế tại mục Huấn luyện viên. Chạy lại lệnh không khôi phục những phân công người dùng đã chủ động thay đổi.

## Quản lý dịch vụ

Vào **Dịch vụ → Thêm dịch vụ**. Nhập tên, mô tả, trạng thái và tích chọn các HLV. Một HLV có thể dạy nhiều dịch vụ; một dịch vụ có thể có nhiều HLV.

- Tên từ 2–100 ký tự, duy nhất; mô tả tối đa 500 ký tự.
- Chỉ gán HLV đang hoạt động.
- Không ngừng/xóa dịch vụ hoặc bỏ HLV đang có lịch còn hiệu lực từ hôm nay trở đi.
- Xóa là lưu trữ mềm; lịch sử lịch tập được giữ nguyên.

## Đăng ký theo dịch vụ và thời gian

Vào **Lịch tập → Thêm lịch tập**: chọn hội viên, dịch vụ, ngày, giờ bắt đầu/kết thúc, HLV và phòng.

Danh sách HLV chỉ bao gồm người được gán cho dịch vụ và không trùng lịch đang hoạt động. Phòng cũng được lọc theo khoảng giờ trống. Khi đổi dịch vụ hoặc thời gian, phải chọn lại HLV/phòng để tránh giữ lựa chọn không còn phù hợp. Nếu thêm từ ô lịch của HLV chỉ dạy một dịch vụ, dịch vụ đó được điền sẵn.

Backend kiểm tra lại tất cả điều kiện, kể cả khi gửi trực tiếp qua API: hội viên có gói đã kích hoạt còn hiệu lực, dịch vụ/HLV/phòng đang hoạt động, HLV thuộc dịch vụ, thời lượng 30–180 phút và không trùng hội viên/HLV/phòng. Hai buổi nối tiếp (09:00–10:00 và 10:00–11:00) được phép. Lịch cũ chưa có dịch vụ vẫn hiển thị; khi sửa cần chọn dịch vụ.

Thông tin lịch làm việc dạng chữ của HLV hiện là mô tả. Bộ lọc giờ trống căn cứ các lịch đã đăng ký, không tự diễn giải mô tả này thành ca làm việc.

## Báo cáo

Tài khoản quản lý mở **Báo cáo** để chọn khoảng ngày và tổng hợp theo ngày/tháng/năm. Doanh thu tính phiếu thu chưa hủy theo ngày Việt Nam, có tách tiền mặt/chuyển khoản, xuất CSV và in.

Top 3 gói sử dụng nhiều nhất đếm đăng ký `ACTIVE` (bao gồm gói miễn phí) và phiếu thu trực tiếp chưa gắn đăng ký. Loại đăng ký chờ thanh toán/đã hủy; không đếm hai lần một đăng ký và phiếu thu của nó. Mỗi lần gia hạn là một lượt; đây là số lượt đăng ký sử dụng gói, không phải số lần check-in. Kỳ thống kê dùng ngày tạo đăng ký/phiếu thu trực tiếp.

## Cơ sở dữ liệu và mã nguồn

`backend/sql/04_services.sql` (bản chia sẻ: `sql/04_services.sql`) tạo bảng `services` và `trainer_services`. Migration khi khởi động backend thêm `schedules.service_id` và khóa ngoại, giữ nguyên lịch cũ với giá trị NULL. Không cần xóa hoặc import lại database hiện tại.

Logic nghiệp vụ nằm tại `backend/src/services/catalog.service.ts` và `workflow.service.ts`; giao diện tại `Services.tsx`, `Workflows.tsx`, `RevenueReport.tsx`. API danh mục: `/api/services`, thao tác `service.save`/`service.delete` dùng chung kiểm tra quyền và transaction.

Kiểm tra tự động: `npm run test:services`, `npm run test:workflows`, `npm test`; E2E-13 đến E2E-16 kiểm tra báo cáo, lịch, dịch vụ và lọc HLV. Các kiểm tra có ghi dữ liệu chỉ chạy trên database `_test`.
