# Kiểm thử nghiệp vụ và nâng cấp ngày 24/09/2026

## Kết quả sau sửa

Đã chạy bộ kiểm thử trên database `quan_ly_phong_gym_test`, MySQL 8.0.46 cổng 3307, frontend 3100 và backend 4100. Các thao tác tạo, sửa, thanh toán và hủy trong đợt này dùng dữ liệu kiểm thử riêng.

| Nhóm | Kết quả |
|---|---:|
| Unit: ngày tháng, trạng thái, xác thực dữ liệu, mật khẩu, phân quyền | 20/20 đạt |
| MySQL: CRUD, ràng buộc dữ liệu, giao dịch đồng thời, thu tiền và điểm danh | 16/16 đạt |
| Workflow: vai trò, phân công HLV, đăng ký, lịch, thanh toán, gói miễn phí, lưu trữ | 11/11 đạt |
| System/API: đăng nhập, phiên, CSRF, Origin, dữ liệu theo vai trò | 26/26 kiểm tra đạt |
| E2E trên Microsoft Edge: thao tác biểu mẫu và các màn hình chính | 13/13 đạt |
| TypeScript backend/frontend và build frontend | Đạt |

Tổng cộng 86 ca/kiểm tra đã đạt. Con số này gồm nhiều tầng kiểm thử, không phải tỷ lệ bao phủ toàn bộ hệ thống. Không phát hiện lỗi JavaScript trong ca E2E kiểm tra màn hình tổng quan.

## Các nghiệp vụ đã kiểm tra

- Admin chỉ quản trị; Quản lý thực hiện nghiệp vụ; Nhân viên không được hủy giao dịch hoặc quản trị tài khoản; HLV và Hội viên chỉ đọc dữ liệu trong phạm vi được cấp.
- Thêm/sửa hội viên, chọn HLV phụ trách, bỏ hoặc đổi phân công; mã và thông tin liên hệ trùng bị từ chối.
- Đăng ký chờ thanh toán chưa được check-in; thu tiền kích hoạt đăng ký; gói miễn phí kích hoạt mà không tạo doanh thu.
- Gửi lại yêu cầu thanh toán không tạo hóa đơn thứ hai; gia hạn đồng thời không chồng ngày; hóa đơn giữ giá đã chốt.
- Lịch tập kiểm tra thời lượng, gói còn hiệu lực và trùng hội viên/HLV/phòng; bảo vệ các bản ghi đang được tham chiếu.
- Check-in/check-out/vào lại; chặn hội viên hết hạn; hủy thu tiền hoặc gói miễn phí phải xử lý phiên tập liên quan.
- Thiết bị, phòng và HLV; lưu trữ/khôi phục hội viên; tìm kiếm, phân trang, xuất CSV và giao diện điện thoại.

## Thay đổi đã thực hiện

### 1. Lưu trữ hội viên đang tập

Trước sửa: tạo hội viên, kích hoạt gói, check-in rồi lưu trữ vẫn thành công; dữ liệu có `archived=1` nhưng vẫn còn một phiên tập mở.

Sau sửa: cả `member.archive` và `member.delete` trả HTTP 409 cùng thông báo **“Cần check-out trước khi lưu trữ hội viên đang tập.”**. Sau check-out mới được lưu trữ; sau khôi phục có thể check-in nếu gói còn hiệu lực. Phiên cũ đã đánh dấu `legacy_closed=1` không bị xem là phiên đang mở. Trường `archived` nếu truyền vào phải là boolean, tránh hiểu nhầm chuỗi `"false"` thành yêu cầu lưu trữ.

Đã bổ sung kiểm thử xác nhận từ chối thao tác không làm thay đổi trạng thái hội viên, lưu trữ được sau check-out và khôi phục được.

### 2. Gợi ý HLV khi tạo lịch tập

Khi chọn hội viên trong biểu mẫu lịch tập, hệ thống điền HLV phụ trách còn hoạt động. Đổi hội viên sẽ cập nhật gợi ý; hội viên chưa phân công sẽ để trống HLV để người dùng chọn. Người dùng có thể đổi HLV riêng cho buổi tập, không làm đổi phân công trên hồ sơ hội viên. Mở lại lịch đã có vẫn giữ HLV đã lưu.

E2E mới kiểm tra đủ: gợi ý HLV A, chuyển sang hội viên của HLV B, chuyển sang hội viên chưa phân công, tự chọn HLV khác, lưu lịch và mở lại để sửa.

## Kiểm tra chất lượng mã và giới hạn

Lint toàn dự án hiện báo 76 lỗi quy tắc, gồm `no-explicit-any`, `no-base-to-string`, quy tắc React/accessibility và `FormEvent` deprecated. Đợt này chưa xử lý toàn bộ nhóm lỗi lint; không kết luận dự án đã sạch mọi kiểm tra chất lượng.

Không kiểm thử tải lớn, quét bảo mật chuyên sâu, thanh toán qua cổng bên ngoài hoặc mọi trình duyệt. Database chính không dùng làm nơi tạo dữ liệu kiểm thử.

## Chạy lại

Sau khi MySQL kiểm thử hoạt động và cấu hình `backend/.env.test` đúng, mở máy chủ kiểm thử:

```powershell
node tools/scripts/dev.mjs --test
```

Trong terminal khác tại thư mục gốc dự án:

```powershell
node tools/scripts/run-tests.mjs
```

Bằng chứng local: `outputs/business-review-final.log`, `outputs/business-review-workflows.log`, `outputs/business-review-new-e2e.log`, `outputs/business-review-lint.log`. Mã kiểm thử hồi quy nằm trong `tools/tests/workflows.test.mjs` và `tools/tests/e2e/gym.spec.ts`.
