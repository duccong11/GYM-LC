# Tài liệu frontend quản lý phòng GYM

Frontend là tầng View của hệ thống MVC, cung cấp giao diện tiếng Việt cho nhân viên phòng tập. Frontend dùng React, TypeScript và Vite, gọi backend qua API JSON. Không có cấu hình tài khoản MySQL trong phần này.

## Cấu trúc mã nguồn

| Đường dẫn | Trách nhiệm |
|---|---|
| index.html | Điểm vào trình duyệt, ngôn ngữ và metadata |
| src/main.tsx | Mount React và stylesheet |
| src/App.tsx | Lấy phiên, trạng thái chờ/lỗi, chọn trang và guard vai trò |
| src/views/Login.tsx | Form đăng nhập, lỗi và khóa nút khi xử lý |
| src/views/GymApp.tsx | Điều hướng, dashboard, hội viên, gói, hóa đơn và điểm danh |
| src/components/Management.tsx | Biểu mẫu, bảng, tìm kiếm và phân trang HLV/tài khoản/phòng/thiết bị |
| src/services/auth.api.ts | Đọc session qua API |
| src/services/gym.api.ts | Ánh xạ thao tác thành URL tài nguyên và gửi CSRF |
| src/utils/gym.ts | Kiểu dữ liệu và hiển thị ngày/giá/trạng thái gói |
| src/utils/security.ts | Vai trò và quyền hiển thị, không chứa hash/token bí mật |
| src/styles/global.css | CSS chung, dialog và responsive |
| public | Tài nguyên tĩnh |
| vite.config.ts | React/Tailwind và proxy /api sang backend |

## Chạy và build

Từ thư mục gốc chạy pnpm dev:frontend. Mặc định Vite tại localhost:3000, proxy /api tới 127.0.0.1:4000. Cần backend chạy và kết nối được MySQL. pnpm build kiểm tra TypeScript hai phần rồi xuất frontend/dist.

Khi triển khai, phục vụ frontend/dist bằng web server có SPA fallback; cấu hình reverse proxy /api sang backend và HTTPS cùng origin. Không dùng Vite development server làm production server. Mở một URL trực tiếp cần trả index.html rồi React kiểm tra session và quyền. HTTP của shell SPA có thể là 200; việc bảo vệ dữ liệu thực hiện tại API 401/403.

## Luồng đăng nhập

App gọi GET /api/auth để xác định phiên. Người chưa có phiên ở trang được bảo vệ được chuyển tới /login. Form gửi POST /api/auth, backend đặt cookie HttpOnly và trả vai trò. TRAINER đi tới hội viên, ADMIN/STAFF tới tổng quan. Khi backend trả 401 trong lúc làm việc, giao diện chuyển về đăng nhập.

Đăng xuất gửi action logout kèm CSRF. Không lưu mật khẩu hoặc token phiên trong localStorage. Guard frontend giúp trải nghiệm rõ ràng, không thay thế kiểm tra quyền backend.

## Màn hình và hành vi

Tổng quan hiển thị số lượng và doanh thu từ database, biểu đồ tuần và hội viên cần gia hạn. Hội viên hỗ trợ form tạo/sửa, chi tiết, tìm theo tên/mã/SĐT, lọc trạng thái, phân trang và xuất CSV. Xóa yêu cầu xác nhận và thực hiện lưu trữ; bộ lọc lưu trữ cho phép khôi phục.

Gói tập có tạo/sửa/ngừng/mở/xóa mềm theo quyền ADMIN. Thanh toán hiển thị hội viên, gói, ngày bắt đầu tùy chọn, giá và ngày kết thúc dự kiến. Nút xác nhận chỉ dùng sau khi đã thu đủ tiền; backend tính lại để chống sửa payload.

Điểm danh tìm hội viên và hiển thị Check-in hoặc Check-out theo lượt đang mở; hội viên không có gói hiệu lực được nhắc gia hạn. Lịch sử hiển thị tối đa 50 lượt gần nhất. Các module HLV, nhân viên, phòng, thiết bị dùng biểu mẫu theo cấu hình và quyền.

## API và trạng thái giao diện

mutateRequest ánh xạ member.save sang POST /api/members hoặc PUT /api/members/:id, plan.toggle sang PATCH, checkin.checkout sang POST /api/checkins/checkout. Sau mutation thành công, giao diện tải lại snapshot từ backend.

Nếu đã lưu nhưng tải lại thất bại, giao diện báo rõ cần tải lại trước khi thao tác tiếp; tránh hiểu nhầm giao dịch chưa ghi. Có trạng thái loading, disabled khi bận, danh sách rỗng, lỗi form và toast. Khóa thao tác phía client giảm nhấp lặp; request_id và transaction backend mới là bảo đảm nhất quán.

## Quyền hiển thị

ADMIN có đầy đủ menu; STAFF không có quản lý tài khoản và không có quyền sửa gói/HLV/phòng; TRAINER không có tổng quan, doanh thu và hóa đơn. Thông tin hạn tập cần thiết cho TRAINER vẫn có trong snapshot đã ẩn tiền. Điều hướng tới URL không có quyền hiện thông báo 403; gọi API trực tiếp cũng bị kiểm soát.

## Responsive và khả năng sử dụng

Ở màn hình nhỏ, thanh điều hướng và bảng có vùng cuộn ngang riêng, trang không tràn ngang. Form có label, input type phù hợp, nút có aria-label khi chỉ hiển thị icon, dialog đóng/mở theo trạng thái. Các bảng hiển thị 8 mục mỗi trang; tìm kiếm/lọc đặt lại trang đầu.

CSV được tạo từ danh sách hội viên đã lọc, có UTF8 BOM và escape dấu ngoặc kép. Giá trị có thể bị phần mềm bảng tính hiểu thành công thức được thêm dấu nháy đơn.

## Hướng mở rộng

Có thể tách GymApp thành các view module nhỏ hơn khi chức năng tăng; giữ mọi giao tiếp HTTP trong services. Nếu chuyển sang phân trang server, gửi query/filter/page và tổng số từ backend thay vì tải mọi bản ghi. Quy tắc nghiệp vụ quan trọng phải giữ ở backend dù frontend có kiểm tra bổ sung.
