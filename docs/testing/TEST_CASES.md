# Bộ test case — GYM LC

Môi trường: database kiểm thử riêng ở cổng 3100. Đây là bộ bước kiểm thử thủ công; trạng thái thủ công chưa được suy diễn từ unit/API test. Kết quả tự động thực chạy xem TEST_RESULTS.md. Mỗi trường hợp dùng dữ liệu mới hoặc fixture độc lập để tránh trùng số.

<a id="TC_LOGIN_001"></a>

## TC_LOGIN_001 — Đúng tài khoản

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_LOGIN_001 |
| Tên Test Case | Đúng tài khoản |
| Module | Đăng nhập |
| Mục tiêu | Đúng tài khoản |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | admin / GymAdmin2026! |
| Các bước thực hiện | 1. Mở /login<br>2. nhập thông tin<br>3. bấm Đăng nhập |
| Expected Result | Vào tổng quan, hiện vai trò Admin |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_LOGIN_002"></a>

## TC_LOGIN_002 — Sai mật khẩu

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_LOGIN_002 |
| Tên Test Case | Sai mật khẩu |
| Module | Đăng nhập |
| Mục tiêu | Sai mật khẩu |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | admin / Wrong2026! |
| Các bước thực hiện | 1. Nhập tài khoản đúng và mật khẩu sai<br>2. bấm Đăng nhập |
| Expected Result | Hiện lỗi; không tạo phiên |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_LOGIN_003"></a>

## TC_LOGIN_003 — Username trống

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_LOGIN_003 |
| Tên Test Case | Username trống |
| Module | Đăng nhập |
| Mục tiêu | Username trống |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | username rỗng |
| Các bước thực hiện | 1. Để trống tên đăng nhập<br>2. nhập mật khẩu<br>3. gửi form |
| Expected Result | Chặn gửi hoặc API trả 400 |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_LOGIN_004"></a>

## TC_LOGIN_004 — Password trống

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_LOGIN_004 |
| Tên Test Case | Password trống |
| Module | Đăng nhập |
| Mục tiêu | Password trống |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | password rỗng |
| Các bước thực hiện | 1. Nhập username<br>2. bỏ trống password<br>3. gửi form |
| Expected Result | Chặn gửi hoặc API trả 400 |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_LOGIN_005"></a>

## TC_LOGIN_005 — Sai cả hai trường

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_LOGIN_005 |
| Tên Test Case | Sai cả hai trường |
| Module | Đăng nhập |
| Mục tiêu | Sai cả hai trường |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | unknown / Wrong2026! |
| Các bước thực hiện | 1. Nhập hai trường sai<br>2. gửi form |
| Expected Result | Lỗi chung, không tiết lộ tài khoản tồn tại |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_LOGIN_006"></a>

## TC_LOGIN_006 — Không lưu mật khẩu rõ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_LOGIN_006 |
| Tên Test Case | Không lưu mật khẩu rõ |
| Module | Đăng nhập |
| Mục tiêu | Không lưu mật khẩu rõ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Tài khoản mới |
| Các bước thực hiện | 1. Tạo tài khoản<br>2. kiểm tra dữ liệu lưu bằng công cụ test |
| Expected Result | password_hash có salt; mật khẩu rõ không xuất hiện |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_LOGIN_007"></a>

## TC_LOGIN_007 — Đăng xuất vô hiệu hóa phiên

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_LOGIN_007 |
| Tên Test Case | Đăng xuất vô hiệu hóa phiên |
| Module | Đăng nhập |
| Mục tiêu | Đăng xuất vô hiệu hóa phiên |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Phiên hợp lệ |
| Các bước thực hiện | 1. Đăng xuất<br>2. gọi lại /api/gym<br>3. truy cập /admin/users |
| Expected Result | API 401; trang chuyển về /login |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_LOGIN_008"></a>

## TC_LOGIN_008 — Giới hạn đăng nhập sai

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_LOGIN_008 |
| Tên Test Case | Giới hạn đăng nhập sai |
| Module | Đăng nhập |
| Mục tiêu | Giới hạn đăng nhập sai |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | username chưa dùng; sai 6 lần |
| Các bước thực hiện | 1. Gửi 6 lần trong 15 phút với cùng username |
| Expected Result | Lần vượt giới hạn trả 429 |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_001"></a>

## TC_MEMBER_001 — Thêm hợp lệ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_001 |
| Tên Test Case | Thêm hợp lệ |
| Module | Hội viên |
| Mục tiêu | Thêm hợp lệ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Nguyễn An; 0901234567; 2000-01-01 |
| Các bước thực hiện | 1. Vào Hội viên<br>2. Thêm<br>3. nhập dữ liệu<br>4. Lưu |
| Expected Result | Tạo một hồ sơ có mã duy nhất |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_002"></a>

## TC_MEMBER_002 — Tên trống

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_002 |
| Tên Test Case | Tên trống |
| Module | Hội viên |
| Mục tiêu | Tên trống |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | name="" |
| Các bước thực hiện | 1. Mở form<br>2. để trống họ tên<br>3. Lưu |
| Expected Result | Không tạo hồ sơ; báo thiếu tên |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_003"></a>

## TC_MEMBER_003 — Email sai

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_003 |
| Tên Test Case | Email sai |
| Module | Hội viên |
| Mục tiêu | Email sai |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | abc@ |
| Các bước thực hiện | 1. Nhập hội viên với email sai<br>2. Lưu |
| Expected Result | Báo email không hợp lệ |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_004"></a>

## TC_MEMBER_004 — Điện thoại sai

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_004 |
| Tên Test Case | Điện thoại sai |
| Module | Hội viên |
| Mục tiêu | Điện thoại sai |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | 12345 |
| Các bước thực hiện | 1. Nhập số điện thoại sai<br>2. Lưu |
| Expected Result | Chặn số không đủ 10 chữ số bắt đầu 0 |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_005"></a>

## TC_MEMBER_005 — Điện thoại trùng

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_005 |
| Tên Test Case | Điện thoại trùng |
| Module | Hội viên |
| Mục tiêu | Điện thoại trùng |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Số đã có cả hồ sơ lưu trữ |
| Các bước thực hiện | 1. Tạo hội viên dùng SĐT đã tồn tại |
| Expected Result | Không tạo bản ghi thứ hai; HTTP 409 |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_006"></a>

## TC_MEMBER_006 — Ngày sinh tương lai

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_006 |
| Tên Test Case | Ngày sinh tương lai |
| Module | Hội viên |
| Mục tiêu | Ngày sinh tương lai |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | 2999-01-01 |
| Các bước thực hiện | 1. Nhập ngày sinh tương lai<br>2. Lưu |
| Expected Result | Chặn dữ liệu không hợp lệ |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_007"></a>

## TC_MEMBER_007 — Sửa hồ sơ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_007 |
| Tên Test Case | Sửa hồ sơ |
| Module | Hội viên |
| Mục tiêu | Sửa hồ sơ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Tên đã sửa; địa chỉ mới |
| Các bước thực hiện | 1. Tìm hồ sơ<br>2. Sửa<br>3. lưu và mở chi tiết |
| Expected Result | Tên/địa chỉ mới được lưu, mã không đổi |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_008"></a>

## TC_MEMBER_008 — Xóa và khôi phục

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_008 |
| Tên Test Case | Xóa và khôi phục |
| Module | Hội viên |
| Mục tiêu | Xóa và khôi phục |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Hội viên đang quản lý |
| Các bước thực hiện | 1. Xóa<br>2. xác nhận<br>3. lọc Đã lưu trữ<br>4. Khôi phục |
| Expected Result | Ẩn khỏi danh sách chính rồi khôi phục; lịch sử giữ nguyên |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_009"></a>

## TC_MEMBER_009 — Tìm kiếm không có kết quả

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_009 |
| Tên Test Case | Tìm kiếm không có kết quả |
| Module | Hội viên |
| Mục tiêu | Tìm kiếm không có kết quả |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | không-tồn-tại-xyz |
| Các bước thực hiện | 1. Tìm chuỗi không tồn tại |
| Expected Result | Hiện trạng thái rỗng, không lỗi |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_010"></a>

## TC_MEMBER_010 — Phân trang

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_010 |
| Tên Test Case | Phân trang |
| Module | Hội viên |
| Mục tiêu | Phân trang |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Ít nhất 9 hội viên |
| Các bước thực hiện | 1. Bấm Sau<br>2. kiểm tra Trang 2<br>3. tìm kiếm lại |
| Expected Result | Trang chuyển đúng; tìm kiếm đưa về trang 1 |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_011"></a>

## TC_MEMBER_011 — Xem đầy đủ chi tiết

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_011 |
| Tên Test Case | Xem đầy đủ chi tiết |
| Module | Hội viên |
| Mục tiêu | Xem đầy đủ chi tiết |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Hội viên có hóa đơn |
| Các bước thực hiện | 1. Bấm tên hội viên |
| Expected Result | Hiện mã, tên, ngày sinh, liên hệ, địa chỉ, ngày đăng ký, gói, hạn, trạng thái |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_MEMBER_012"></a>

## TC_MEMBER_012 — Xuất CSV

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_MEMBER_012 |
| Tên Test Case | Xuất CSV |
| Module | Hội viên |
| Mục tiêu | Xuất CSV |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Danh sách đang lọc |
| Các bước thực hiện | 1. Bấm Xuất CSV<br>2. đọc tệp |
| Expected Result | Xuất đúng tập lọc, tiếng Việt, không thực thi công thức đầu ô |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PLAN_001"></a>

## TC_PLAN_001 — Thêm hợp lệ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PLAN_001 |
| Tên Test Case | Thêm hợp lệ |
| Module | Gói tập |
| Mục tiêu | Thêm hợp lệ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | 30 ngày; 350000 đồng |
| Các bước thực hiện | 1. Admin mở Gói tập<br>2. Thêm<br>3. Lưu |
| Expected Result | Gói hiển thị và chọn được khi đăng ký |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PLAN_002"></a>

## TC_PLAN_002 — Sửa giá

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PLAN_002 |
| Tên Test Case | Sửa giá |
| Module | Gói tập |
| Mục tiêu | Sửa giá |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | 500000 đồng |
| Các bước thực hiện | 1. Sửa gói đã có giao dịch |
| Expected Result | Giá mới áp dụng lượt mua mới; giá cũ hóa đơn giữ nguyên |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PLAN_003"></a>

## TC_PLAN_003 — Xóa gói đã bán

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PLAN_003 |
| Tên Test Case | Xóa gói đã bán |
| Module | Gói tập |
| Mục tiêu | Xóa gói đã bán |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Gói có hóa đơn |
| Các bước thực hiện | 1. Xóa<br>2. xác nhận<br>3. kiểm tra hóa đơn cũ |
| Expected Result | Gói biến khỏi danh sách; lịch sử và hiệu lực cũ còn nguyên |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PLAN_004"></a>

## TC_PLAN_004 — Giá bằng 0

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PLAN_004 |
| Tên Test Case | Giá bằng 0 |
| Module | Gói tập |
| Mục tiêu | Giá bằng 0 |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | price=0 |
| Các bước thực hiện | 1. Gửi gói giá 0 |
| Expected Result | Bị từ chối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PLAN_005"></a>

## TC_PLAN_005 — Giá âm

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PLAN_005 |
| Tên Test Case | Giá âm |
| Module | Gói tập |
| Mục tiêu | Giá âm |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | price=-1 |
| Các bước thực hiện | 1. Gửi gói giá âm |
| Expected Result | Bị từ chối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PLAN_006"></a>

## TC_PLAN_006 — Tên trống

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PLAN_006 |
| Tên Test Case | Tên trống |
| Module | Gói tập |
| Mục tiêu | Tên trống |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | name="" |
| Các bước thực hiện | 1. Thêm gói không có tên |
| Expected Result | Bị từ chối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PLAN_007"></a>

## TC_PLAN_007 — Tạm ngưng và mở lại

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PLAN_007 |
| Tên Test Case | Tạm ngưng và mở lại |
| Module | Gói tập |
| Mục tiêu | Tạm ngưng và mở lại |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Gói đang áp dụng |
| Các bước thực hiện | 1. Tạm ngưng<br>2. xem form đăng ký<br>3. mở lại |
| Expected Result | Gói tạm ngưng không chọn được; mở lại chọn được |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_TRAINER_001"></a>

## TC_TRAINER_001 — Thêm hợp lệ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_TRAINER_001 |
| Tên Test Case | Thêm hợp lệ |
| Module | HLV |
| Mục tiêu | Thêm hợp lệ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | HLV An; 0981234567; Yoga; 0 năm; Thứ 2 |
| Các bước thực hiện | 1. Admin thêm HLV |
| Expected Result | Lưu đủ trường; kinh nghiệm 0 hợp lệ |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_TRAINER_002"></a>

## TC_TRAINER_002 — Sửa chuyên môn

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_TRAINER_002 |
| Tên Test Case | Sửa chuyên môn |
| Module | HLV |
| Mục tiêu | Sửa chuyên môn |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Yoga → Boxing |
| Các bước thực hiện | 1. Tìm HLV<br>2. sửa<br>3. lưu |
| Expected Result | Chuyên môn mới hiển thị |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_TRAINER_003"></a>

## TC_TRAINER_003 — Xóa HLV

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_TRAINER_003 |
| Tên Test Case | Xóa HLV |
| Module | HLV |
| Mục tiêu | Xóa HLV |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | HLV mẫu |
| Các bước thực hiện | 1. Xóa<br>2. xác nhận<br>3. tìm lại |
| Expected Result | Không còn trong danh sách |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_TRAINER_004"></a>

## TC_TRAINER_004 — Kinh nghiệm âm

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_TRAINER_004 |
| Tên Test Case | Kinh nghiệm âm |
| Module | HLV |
| Mục tiêu | Kinh nghiệm âm |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | experience=-1 |
| Các bước thực hiện | 1. Gửi dữ liệu HLV kinh nghiệm âm |
| Expected Result | Bị từ chối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_USER_001"></a>

## TC_USER_001 — Tạo tài khoản

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_USER_001 |
| Tên Test Case | Tạo tài khoản |
| Module | Nhân viên |
| Mục tiêu | Tạo tài khoản |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | staff-test / GymStaff2026! |
| Các bước thực hiện | 1. Admin thêm nhân viên với vai trò STAFF |
| Expected Result | Tài khoản tạo được, mật khẩu băm |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_USER_002"></a>

## TC_USER_002 — Khóa tài khoản đang đăng nhập

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_USER_002 |
| Tên Test Case | Khóa tài khoản đang đăng nhập |
| Module | Nhân viên |
| Mục tiêu | Khóa tài khoản đang đăng nhập |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Một STAFF có phiên |
| Các bước thực hiện | 1. Admin khóa<br>2. STAFF gọi API |
| Expected Result | Phiên cũ bị thu hồi; API 401 |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_USER_003"></a>

## TC_USER_003 — Mở khóa

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_USER_003 |
| Tên Test Case | Mở khóa |
| Module | Nhân viên |
| Mục tiêu | Mở khóa |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Tài khoản đã khóa |
| Các bước thực hiện | 1. Admin mở khóa<br>2. đăng nhập lại |
| Expected Result | Đăng nhập thành công bằng mật khẩu cũ |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_USER_004"></a>

## TC_USER_004 — Phân quyền

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_USER_004 |
| Tên Test Case | Phân quyền |
| Module | Nhân viên |
| Mục tiêu | Phân quyền |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | STAFF → TRAINER |
| Các bước thực hiện | 1. Admin đổi quyền<br>2. tài khoản đăng nhập lại |
| Expected Result | Chỉ có chức năng được phép; phiên trước bị thu hồi |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_USER_005"></a>

## TC_USER_005 — Không tự khóa Admin

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_USER_005 |
| Tên Test Case | Không tự khóa Admin |
| Module | Nhân viên |
| Mục tiêu | Không tự khóa Admin |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Admin đang dùng |
| Các bước thực hiện | 1. Admin tự khóa tài khoản |
| Expected Result | Từ chối; luôn giữ ít nhất một Admin hoạt động |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_USER_006"></a>

## TC_USER_006 — Mật khẩu yếu

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_USER_006 |
| Tên Test Case | Mật khẩu yếu |
| Module | Nhân viên |
| Mục tiêu | Mật khẩu yếu |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | 12345678 |
| Các bước thực hiện | 1. Tạo tài khoản chỉ có số |
| Expected Result | Từ chối; yêu cầu 8–128 ký tự có chữ và số |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_ROOM_001"></a>

## TC_ROOM_001 — CRUD phòng

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_ROOM_001 |
| Tên Test Case | CRUD phòng |
| Module | Phòng tập |
| Mục tiêu | CRUD phòng |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Gym A; Gym; 50 |
| Các bước thực hiện | 1. Thêm<br>2. sửa sức chứa<br>3. xem<br>4. xóa phòng không có thiết bị |
| Expected Result | Các thao tác lưu đúng dữ liệu |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_ROOM_002"></a>

## TC_ROOM_002 — Sức chứa bằng 0

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_ROOM_002 |
| Tên Test Case | Sức chứa bằng 0 |
| Module | Phòng tập |
| Mục tiêu | Sức chứa bằng 0 |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | capacity=0 |
| Các bước thực hiện | 1. Thêm phòng sức chứa 0 |
| Expected Result | Bị từ chối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_ROOM_003"></a>

## TC_ROOM_003 — Xóa phòng còn thiết bị

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_ROOM_003 |
| Tên Test Case | Xóa phòng còn thiết bị |
| Module | Phòng tập |
| Mục tiêu | Xóa phòng còn thiết bị |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Phòng có thiết bị |
| Các bước thực hiện | 1. Xóa phòng |
| Expected Result | Từ chối 409 và hướng dẫn di chuyển/xóa thiết bị |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_EQUIP_001"></a>

## TC_EQUIP_001 — Thêm hợp lệ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_EQUIP_001 |
| Tên Test Case | Thêm hợp lệ |
| Module | Thiết bị |
| Mục tiêu | Thêm hợp lệ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Máy chạy; phòng Gym; 1; 2026-01-01; Tốt |
| Các bước thực hiện | 1. Thêm thiết bị vào phòng đang hoạt động |
| Expected Result | Lưu đủ dữ liệu |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_EQUIP_002"></a>

## TC_EQUIP_002 — Chuyển bảo trì

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_EQUIP_002 |
| Tên Test Case | Chuyển bảo trì |
| Module | Thiết bị |
| Mục tiêu | Chuyển bảo trì |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Tốt → Đang bảo trì |
| Các bước thực hiện | 1. Sửa thiết bị<br>2. đổi tình trạng<br>3. lọc |
| Expected Result | Hiển thị trong nhóm bảo trì |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_EQUIP_003"></a>

## TC_EQUIP_003 — Xóa thiết bị

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_EQUIP_003 |
| Tên Test Case | Xóa thiết bị |
| Module | Thiết bị |
| Mục tiêu | Xóa thiết bị |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Thiết bị mẫu |
| Các bước thực hiện | 1. Xóa<br>2. xác nhận<br>3. tìm lại |
| Expected Result | Ẩn khỏi danh sách |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_EQUIP_004"></a>

## TC_EQUIP_004 — Tình trạng không hợp lệ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_EQUIP_004 |
| Tên Test Case | Tình trạng không hợp lệ |
| Module | Thiết bị |
| Mục tiêu | Tình trạng không hợp lệ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | condition=Không rõ |
| Các bước thực hiện | 1. Gửi API với tình trạng ngoài danh sách |
| Expected Result | Bị từ chối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_EQUIP_005"></a>

## TC_EQUIP_005 — Số lượng bằng 0

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_EQUIP_005 |
| Tên Test Case | Số lượng bằng 0 |
| Module | Thiết bị |
| Mục tiêu | Số lượng bằng 0 |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | quantity=0 |
| Các bước thực hiện | 1. Gửi dữ liệu số lượng 0 |
| Expected Result | Bị từ chối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_REG_001"></a>

## TC_REG_001 — Đăng ký hợp lệ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_REG_001 |
| Tên Test Case | Đăng ký hợp lệ |
| Module | Đăng ký gói |
| Mục tiêu | Đăng ký hợp lệ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Hội viên mới; 30 ngày; ngày mai |
| Các bước thực hiện | 1. Chọn hội viên/gói/ngày<br>2. xem tổng<br>3. xác nhận thu tiền |
| Expected Result | Tạo hóa đơn, kết thúc = bắt đầu + 29 ngày |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_REG_002"></a>

## TC_REG_002 — Không chọn hội viên

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_REG_002 |
| Tên Test Case | Không chọn hội viên |
| Module | Đăng ký gói |
| Mục tiêu | Không chọn hội viên |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | member_id="" |
| Các bước thực hiện | 1. Mở thanh toán<br>2. bỏ trống hội viên<br>3. xác nhận |
| Expected Result | Không tạo hóa đơn |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_REG_003"></a>

## TC_REG_003 — Không chọn gói

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_REG_003 |
| Tên Test Case | Không chọn gói |
| Module | Đăng ký gói |
| Mục tiêu | Không chọn gói |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | plan_id="" |
| Các bước thực hiện | 1. Bỏ trống gói<br>2. xác nhận |
| Expected Result | Không tạo hóa đơn |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_REG_004"></a>

## TC_REG_004 — Ngày sai hoặc trong quá khứ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_REG_004 |
| Tên Test Case | Ngày sai hoặc trong quá khứ |
| Module | Đăng ký gói |
| Mục tiêu | Ngày sai hoặc trong quá khứ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | 2026-02-30 hoặc hôm qua |
| Các bước thực hiện | 1. Gửi đăng ký ngày không hợp lệ |
| Expected Result | Bị từ chối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_REG_005"></a>

## TC_REG_005 — Gói không hoạt động

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_REG_005 |
| Tên Test Case | Gói không hoạt động |
| Module | Đăng ký gói |
| Mục tiêu | Gói không hoạt động |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Gói tạm ngưng |
| Các bước thực hiện | 1. Gửi API đăng ký gói tạm ngưng |
| Expected Result | Bị từ chối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_REG_006"></a>

## TC_REG_006 — Khoảng thời gian trùng

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_REG_006 |
| Tên Test Case | Khoảng thời gian trùng |
| Module | Đăng ký gói |
| Mục tiêu | Khoảng thời gian trùng |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Hội viên có gói hiện tại |
| Các bước thực hiện | 1. Chọn ngày trong gói cũ<br>2. xác nhận |
| Expected Result | 409; không tạo hóa đơn trùng hạn |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_REG_007"></a>

## TC_REG_007 — Gia hạn tự động

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_REG_007 |
| Tên Test Case | Gia hạn tự động |
| Module | Đăng ký gói |
| Mục tiêu | Gia hạn tự động |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Hội viên còn hạn |
| Các bước thực hiện | 1. Gia hạn<br>2. để ngày trống<br>3. xác nhận |
| Expected Result | Bắt đầu ngày kế sau hạn cuối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_CHECK_001"></a>

## TC_CHECK_001 — Hội viên còn hạn

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_CHECK_001 |
| Tên Test Case | Hội viên còn hạn |
| Module | Check-in/out |
| Mục tiêu | Hội viên còn hạn |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Gói có hiệu lực hôm nay |
| Các bước thực hiện | 1. Tìm hội viên<br>2. Check-in |
| Expected Result | Ghi thời gian vào; nút đổi Check-out |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_CHECK_002"></a>

## TC_CHECK_002 — Hội viên hết hạn

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_CHECK_002 |
| Tên Test Case | Hội viên hết hạn |
| Module | Check-in/out |
| Mục tiêu | Hội viên hết hạn |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Gói kết thúc hôm qua |
| Các bước thực hiện | 1. Tìm và gọi check-in |
| Expected Result | UI chặn; API từ chối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_CHECK_003"></a>

## TC_CHECK_003 — Hai lần chưa check-out

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_CHECK_003 |
| Tên Test Case | Hai lần chưa check-out |
| Module | Check-in/out |
| Mục tiêu | Hai lần chưa check-out |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Hội viên đang trong phòng |
| Các bước thực hiện | 1. Gửi check-in lần hai |
| Expected Result | 409; chỉ một lượt đang mở |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_CHECK_004"></a>

## TC_CHECK_004 — Check-out chưa check-in

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_CHECK_004 |
| Tên Test Case | Check-out chưa check-in |
| Module | Check-in/out |
| Mục tiêu | Check-out chưa check-in |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Chưa có lượt mở |
| Các bước thực hiện | 1. Gửi check-out |
| Expected Result | 409; không tạo lịch sử giả |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_CHECK_005"></a>

## TC_CHECK_005 — Check-out hợp lệ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_CHECK_005 |
| Tên Test Case | Check-out hợp lệ |
| Module | Check-in/out |
| Mục tiêu | Check-out hợp lệ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Có lượt mở |
| Các bước thực hiện | 1. Bấm Check-out |
| Expected Result | Lưu thời gian rời phòng |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_CHECK_006"></a>

## TC_CHECK_006 — Vào lại cùng ngày

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_CHECK_006 |
| Tên Test Case | Vào lại cùng ngày |
| Module | Check-in/out |
| Mục tiêu | Vào lại cùng ngày |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Vừa check-out |
| Các bước thực hiện | 1. Bấm Check-in lần nữa |
| Expected Result | Tạo lượt mới trong cùng ngày |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PAY_001"></a>

## TC_PAY_001 — Giao dịch hợp lệ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PAY_001 |
| Tên Test Case | Giao dịch hợp lệ |
| Module | Thanh toán |
| Mục tiêu | Giao dịch hợp lệ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | 350000; Tiền mặt |
| Các bước thực hiện | 1. Chọn hội viên/gói<br>2. xác nhận đủ tiền |
| Expected Result | Hóa đơn Đã thanh toán, có mã và hạn tập |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PAY_002"></a>

## TC_PAY_002 — Sửa số tiền ở API

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PAY_002 |
| Tên Test Case | Sửa số tiền ở API |
| Module | Thanh toán |
| Mục tiêu | Sửa số tiền ở API |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | amount=1 thay 350000 |
| Các bước thực hiện | 1. Gửi yêu cầu bị sửa amount |
| Expected Result | Từ chối; lấy giá tin cậy từ database |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PAY_003"></a>

## TC_PAY_003 — Không chọn hội viên

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PAY_003 |
| Tên Test Case | Không chọn hội viên |
| Module | Thanh toán |
| Mục tiêu | Không chọn hội viên |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | member_id="" |
| Các bước thực hiện | 1. Gửi yêu cầu thiếu hội viên |
| Expected Result | Bị từ chối |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PAY_004"></a>

## TC_PAY_004 — Không chọn phương thức

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PAY_004 |
| Tên Test Case | Không chọn phương thức |
| Module | Thanh toán |
| Mục tiêu | Không chọn phương thức |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | method="" |
| Các bước thực hiện | 1. Bỏ trống phương thức<br>2. xác nhận |
| Expected Result | Không tạo hóa đơn |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PAY_005"></a>

## TC_PAY_005 — Gửi lặp mã yêu cầu

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PAY_005 |
| Tên Test Case | Gửi lặp mã yêu cầu |
| Module | Thanh toán |
| Mục tiêu | Gửi lặp mã yêu cầu |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Cùng request_id |
| Các bước thực hiện | 1. Gửi hai yêu cầu giống nhau<br>2. gửi lại nội dung khác |
| Expected Result | Giống nhau tạo một hóa đơn; khác nội dung trả 409 |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PAY_006"></a>

## TC_PAY_006 — Giá lịch sử bất biến

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PAY_006 |
| Tên Test Case | Giá lịch sử bất biến |
| Module | Thanh toán |
| Mục tiêu | Giá lịch sử bất biến |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Hóa đơn cũ 350000 |
| Các bước thực hiện | 1. Sửa gói 900000<br>2. xem hóa đơn cũ |
| Expected Result | Vẫn 350000 |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_PAY_007"></a>

## TC_PAY_007 — Lọc ngày và hội viên

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_PAY_007 |
| Tên Test Case | Lọc ngày và hội viên |
| Module | Thanh toán |
| Mục tiêu | Lọc ngày và hội viên |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Khoảng ngày + một hội viên |
| Các bước thực hiện | 1. Chọn bộ lọc<br>2. kiểm tra danh sách và tổng |
| Expected Result | Chỉ hiển thị giao dịch thuộc bộ lọc, tính theo giờ Việt Nam |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_SEC_001"></a>

## TC_SEC_001 — Chặn URL và API Admin

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_SEC_001 |
| Tên Test Case | Chặn URL và API Admin |
| Module | Bảo mật |
| Mục tiêu | Chặn URL và API Admin |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | STAFF/TRAINER |
| Các bước thực hiện | 1. Mở /admin/users<br>2. gọi user.save |
| Expected Result | Trang báo không có quyền; API 403 |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_SEC_002"></a>

## TC_SEC_002 — CSRF sai

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_SEC_002 |
| Tên Test Case | CSRF sai |
| Module | Bảo mật |
| Mục tiêu | CSRF sai |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Phiên hợp lệ; token sai |
| Các bước thực hiện | 1. Gửi POST với token hoặc Origin không hợp lệ |
| Expected Result | 403; không thay đổi database |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_SEC_003"></a>

## TC_SEC_003 — Chặn dữ liệu sai kiểu

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_SEC_003 |
| Tên Test Case | Chặn dữ liệu sai kiểu |
| Module | Bảo mật |
| Mục tiêu | Chặn dữ liệu sai kiểu |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | name là object |
| Các bước thực hiện | 1. Gửi member.save với name object |
| Expected Result | 400; không ép object thành tên |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_DB_001"></a>

## TC_DB_001 — Toàn vẹn dữ liệu

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_DB_001 |
| Tên Test Case | Toàn vẹn dữ liệu |
| Module | Database |
| Mục tiêu | Toàn vẹn dữ liệu |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | SQLite sau migration |
| Các bước thực hiện | 1. Chạy integrity_check và foreign_key_check |
| Expected Result | ok; không có khóa ngoại sai |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

<a id="TC_DB_002"></a>

## TC_DB_002 — Giữ lịch sử cũ

| Trường | Nội dung |
|---|---|
| Test Case ID | TC_DB_002 |
| Tên Test Case | Giữ lịch sử cũ |
| Module | Database |
| Mục tiêu | Giữ lịch sử cũ |
| Preconditions | Đã khởi tạo dữ liệu test; đăng nhập Admin trừ trường hợp đăng nhập hoặc quyền được chỉ rõ. Các bản ghi nêu trong dữ liệu phải tồn tại. |
| Test Data | Hai lượt cũ cùng hội viên khác ngày |
| Các bước thực hiện | 1. Sao lưu<br>2. chạy migration mới |
| Expected Result | Số bản ghi giữ nguyên; giờ ra đánh dấu legacy, không bịa timestamp |
| Actual Result | Chưa thực hiện thủ công theo đầy đủ các bước này. Kết quả kiểm tra tự động có liên quan nằm trong TEST_RESULTS.md. |
| Status | Not Run (thủ công) |

