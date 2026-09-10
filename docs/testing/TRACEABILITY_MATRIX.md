# Ma trận truy vết

| Requirement | Module | Test Case | Expected Result |
|---|---|---|---|
| REQ-LOGIN-001 | Đăng nhập | [TC_LOGIN_001](TEST_CASES.md#TC_LOGIN_001) | Vào tổng quan, hiện vai trò Admin |
| REQ-LOGIN-002 | Đăng nhập | [TC_LOGIN_002](TEST_CASES.md#TC_LOGIN_002) | Hiện lỗi; không tạo phiên |
| REQ-LOGIN-003 | Đăng nhập | [TC_LOGIN_003](TEST_CASES.md#TC_LOGIN_003) | Chặn gửi hoặc API trả 400 |
| REQ-LOGIN-004 | Đăng nhập | [TC_LOGIN_004](TEST_CASES.md#TC_LOGIN_004) | Chặn gửi hoặc API trả 400 |
| REQ-LOGIN-005 | Đăng nhập | [TC_LOGIN_005](TEST_CASES.md#TC_LOGIN_005) | Lỗi chung, không tiết lộ tài khoản tồn tại |
| REQ-LOGIN-006 | Đăng nhập | [TC_LOGIN_006](TEST_CASES.md#TC_LOGIN_006) | password_hash có salt; mật khẩu rõ không xuất hiện |
| REQ-LOGIN-007 | Đăng nhập | [TC_LOGIN_007](TEST_CASES.md#TC_LOGIN_007) | API 401; trang chuyển về /login |
| REQ-LOGIN-008 | Đăng nhập | [TC_LOGIN_008](TEST_CASES.md#TC_LOGIN_008) | Lần vượt giới hạn trả 429 |
| REQ-MEMBER-001 | Hội viên | [TC_MEMBER_001](TEST_CASES.md#TC_MEMBER_001) | Tạo một hồ sơ có mã duy nhất |
| REQ-MEMBER-002 | Hội viên | [TC_MEMBER_002](TEST_CASES.md#TC_MEMBER_002) | Không tạo hồ sơ; báo thiếu tên |
| REQ-MEMBER-003 | Hội viên | [TC_MEMBER_003](TEST_CASES.md#TC_MEMBER_003) | Báo email không hợp lệ |
| REQ-MEMBER-004 | Hội viên | [TC_MEMBER_004](TEST_CASES.md#TC_MEMBER_004) | Chặn số không đủ 10 chữ số bắt đầu 0 |
| REQ-MEMBER-005 | Hội viên | [TC_MEMBER_005](TEST_CASES.md#TC_MEMBER_005) | Không tạo bản ghi thứ hai; HTTP 409 |
| REQ-MEMBER-006 | Hội viên | [TC_MEMBER_006](TEST_CASES.md#TC_MEMBER_006) | Chặn dữ liệu không hợp lệ |
| REQ-MEMBER-007 | Hội viên | [TC_MEMBER_007](TEST_CASES.md#TC_MEMBER_007) | Tên/địa chỉ mới được lưu, mã không đổi |
| REQ-MEMBER-008 | Hội viên | [TC_MEMBER_008](TEST_CASES.md#TC_MEMBER_008) | Ẩn khỏi danh sách chính rồi khôi phục; lịch sử giữ nguyên |
| REQ-MEMBER-009 | Hội viên | [TC_MEMBER_009](TEST_CASES.md#TC_MEMBER_009) | Hiện trạng thái rỗng, không lỗi |
| REQ-MEMBER-010 | Hội viên | [TC_MEMBER_010](TEST_CASES.md#TC_MEMBER_010) | Trang chuyển đúng; tìm kiếm đưa về trang 1 |
| REQ-MEMBER-011 | Hội viên | [TC_MEMBER_011](TEST_CASES.md#TC_MEMBER_011) | Hiện mã, tên, ngày sinh, liên hệ, địa chỉ, ngày đăng ký, gói, hạn, trạng thái |
| REQ-MEMBER-012 | Hội viên | [TC_MEMBER_012](TEST_CASES.md#TC_MEMBER_012) | Xuất đúng tập lọc, tiếng Việt, không thực thi công thức đầu ô |
| REQ-PLAN-001 | Gói tập | [TC_PLAN_001](TEST_CASES.md#TC_PLAN_001) | Gói hiển thị và chọn được khi đăng ký |
| REQ-PLAN-002 | Gói tập | [TC_PLAN_002](TEST_CASES.md#TC_PLAN_002) | Giá mới áp dụng lượt mua mới; giá cũ hóa đơn giữ nguyên |
| REQ-PLAN-003 | Gói tập | [TC_PLAN_003](TEST_CASES.md#TC_PLAN_003) | Gói biến khỏi danh sách; lịch sử và hiệu lực cũ còn nguyên |
| REQ-PLAN-004 | Gói tập | [TC_PLAN_004](TEST_CASES.md#TC_PLAN_004) | Bị từ chối |
| REQ-PLAN-005 | Gói tập | [TC_PLAN_005](TEST_CASES.md#TC_PLAN_005) | Bị từ chối |
| REQ-PLAN-006 | Gói tập | [TC_PLAN_006](TEST_CASES.md#TC_PLAN_006) | Bị từ chối |
| REQ-PLAN-007 | Gói tập | [TC_PLAN_007](TEST_CASES.md#TC_PLAN_007) | Gói tạm ngưng không chọn được; mở lại chọn được |
| REQ-TRAINER-001 | HLV | [TC_TRAINER_001](TEST_CASES.md#TC_TRAINER_001) | Lưu đủ trường; kinh nghiệm 0 hợp lệ |
| REQ-TRAINER-002 | HLV | [TC_TRAINER_002](TEST_CASES.md#TC_TRAINER_002) | Chuyên môn mới hiển thị |
| REQ-TRAINER-003 | HLV | [TC_TRAINER_003](TEST_CASES.md#TC_TRAINER_003) | Không còn trong danh sách |
| REQ-TRAINER-004 | HLV | [TC_TRAINER_004](TEST_CASES.md#TC_TRAINER_004) | Bị từ chối |
| REQ-USER-001 | Nhân viên | [TC_USER_001](TEST_CASES.md#TC_USER_001) | Tài khoản tạo được, mật khẩu băm |
| REQ-USER-002 | Nhân viên | [TC_USER_002](TEST_CASES.md#TC_USER_002) | Phiên cũ bị thu hồi; API 401 |
| REQ-USER-003 | Nhân viên | [TC_USER_003](TEST_CASES.md#TC_USER_003) | Đăng nhập thành công bằng mật khẩu cũ |
| REQ-USER-004 | Nhân viên | [TC_USER_004](TEST_CASES.md#TC_USER_004) | Chỉ có chức năng được phép; phiên trước bị thu hồi |
| REQ-USER-005 | Nhân viên | [TC_USER_005](TEST_CASES.md#TC_USER_005) | Từ chối; luôn giữ ít nhất một Admin hoạt động |
| REQ-USER-006 | Nhân viên | [TC_USER_006](TEST_CASES.md#TC_USER_006) | Từ chối; yêu cầu 8–128 ký tự có chữ và số |
| REQ-ROOM-001 | Phòng tập | [TC_ROOM_001](TEST_CASES.md#TC_ROOM_001) | Các thao tác lưu đúng dữ liệu |
| REQ-ROOM-002 | Phòng tập | [TC_ROOM_002](TEST_CASES.md#TC_ROOM_002) | Bị từ chối |
| REQ-ROOM-003 | Phòng tập | [TC_ROOM_003](TEST_CASES.md#TC_ROOM_003) | Từ chối 409 và hướng dẫn di chuyển/xóa thiết bị |
| REQ-EQUIP-001 | Thiết bị | [TC_EQUIP_001](TEST_CASES.md#TC_EQUIP_001) | Lưu đủ dữ liệu |
| REQ-EQUIP-002 | Thiết bị | [TC_EQUIP_002](TEST_CASES.md#TC_EQUIP_002) | Hiển thị trong nhóm bảo trì |
| REQ-EQUIP-003 | Thiết bị | [TC_EQUIP_003](TEST_CASES.md#TC_EQUIP_003) | Ẩn khỏi danh sách |
| REQ-EQUIP-004 | Thiết bị | [TC_EQUIP_004](TEST_CASES.md#TC_EQUIP_004) | Bị từ chối |
| REQ-EQUIP-005 | Thiết bị | [TC_EQUIP_005](TEST_CASES.md#TC_EQUIP_005) | Bị từ chối |
| REQ-REG-001 | Đăng ký gói | [TC_REG_001](TEST_CASES.md#TC_REG_001) | Tạo hóa đơn, kết thúc = bắt đầu + 29 ngày |
| REQ-REG-002 | Đăng ký gói | [TC_REG_002](TEST_CASES.md#TC_REG_002) | Không tạo hóa đơn |
| REQ-REG-003 | Đăng ký gói | [TC_REG_003](TEST_CASES.md#TC_REG_003) | Không tạo hóa đơn |
| REQ-REG-004 | Đăng ký gói | [TC_REG_004](TEST_CASES.md#TC_REG_004) | Bị từ chối |
| REQ-REG-005 | Đăng ký gói | [TC_REG_005](TEST_CASES.md#TC_REG_005) | Bị từ chối |
| REQ-REG-006 | Đăng ký gói | [TC_REG_006](TEST_CASES.md#TC_REG_006) | 409; không tạo hóa đơn trùng hạn |
| REQ-REG-007 | Đăng ký gói | [TC_REG_007](TEST_CASES.md#TC_REG_007) | Bắt đầu ngày kế sau hạn cuối |
| REQ-CHECK-001 | Check-in/out | [TC_CHECK_001](TEST_CASES.md#TC_CHECK_001) | Ghi thời gian vào; nút đổi Check-out |
| REQ-CHECK-002 | Check-in/out | [TC_CHECK_002](TEST_CASES.md#TC_CHECK_002) | UI chặn; API từ chối |
| REQ-CHECK-003 | Check-in/out | [TC_CHECK_003](TEST_CASES.md#TC_CHECK_003) | 409; chỉ một lượt đang mở |
| REQ-CHECK-004 | Check-in/out | [TC_CHECK_004](TEST_CASES.md#TC_CHECK_004) | 409; không tạo lịch sử giả |
| REQ-CHECK-005 | Check-in/out | [TC_CHECK_005](TEST_CASES.md#TC_CHECK_005) | Lưu thời gian rời phòng |
| REQ-CHECK-006 | Check-in/out | [TC_CHECK_006](TEST_CASES.md#TC_CHECK_006) | Tạo lượt mới trong cùng ngày |
| REQ-PAY-001 | Thanh toán | [TC_PAY_001](TEST_CASES.md#TC_PAY_001) | Hóa đơn Đã thanh toán, có mã và hạn tập |
| REQ-PAY-002 | Thanh toán | [TC_PAY_002](TEST_CASES.md#TC_PAY_002) | Từ chối; lấy giá tin cậy từ database |
| REQ-PAY-003 | Thanh toán | [TC_PAY_003](TEST_CASES.md#TC_PAY_003) | Bị từ chối |
| REQ-PAY-004 | Thanh toán | [TC_PAY_004](TEST_CASES.md#TC_PAY_004) | Không tạo hóa đơn |
| REQ-PAY-005 | Thanh toán | [TC_PAY_005](TEST_CASES.md#TC_PAY_005) | Giống nhau tạo một hóa đơn; khác nội dung trả 409 |
| REQ-PAY-006 | Thanh toán | [TC_PAY_006](TEST_CASES.md#TC_PAY_006) | Vẫn 350000 |
| REQ-PAY-007 | Thanh toán | [TC_PAY_007](TEST_CASES.md#TC_PAY_007) | Chỉ hiển thị giao dịch thuộc bộ lọc, tính theo giờ Việt Nam |
| REQ-SEC-001 | Bảo mật | [TC_SEC_001](TEST_CASES.md#TC_SEC_001) | Trang báo không có quyền; API 403 |
| REQ-SEC-002 | Bảo mật | [TC_SEC_002](TEST_CASES.md#TC_SEC_002) | 403; không thay đổi database |
| REQ-SEC-003 | Bảo mật | [TC_SEC_003](TEST_CASES.md#TC_SEC_003) | 400; không ép object thành tên |
| REQ-DB-001 | Database | [TC_DB_001](TEST_CASES.md#TC_DB_001) | ok; không có khóa ngoại sai |
| REQ-DB-002 | Database | [TC_DB_002](TEST_CASES.md#TC_DB_002) | Số bản ghi giữ nguyên; giờ ra đánh dấu legacy, không bịa timestamp |
