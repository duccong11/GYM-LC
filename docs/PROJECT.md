# Tổng quan dự án quản lý phòng GYM

Dự án quản lý hoạt động phòng tập bằng frontend React và backend Node.js theo mô hình MVC, lưu dữ liệu trên MySQL. Tài liệu này giúp người phát triển hiểu phạm vi, actor, quy trình nghiệp vụ, cấu trúc source và cách vận hành.

## Kiến trúc tổng thể

Frontend là tầng View chạy trên trình duyệt, gồm biểu mẫu, danh sách, trang tổng quan và trạng thái phiên. Backend tiếp nhận HTTP qua Route, Controller kiểm tra yêu cầu và gọi Service, Model truy vấn MySQL. Dữ liệu trả về dạng JSON. Backend là nơi quyết định quyền truy cập và tính hợp lệ của giao dịch.

Luồng xử lý: Người dùng → View React → dịch vụ API frontend → Route → Controller → Middleware xác thực → Service nghiệp vụ → Model → MySQL → JSON → View.

MVC ở đây là MVC tách View qua API, không phải giao diện server template. Backend dùng JavaScript/TypeScript và Express, không dùng Java Spring. Backend và frontend có package.json và cấu hình TypeScript riêng; package.json gốc cung cấp lệnh chạy chung. Node cần phiên bản 22.18 trở lên hoặc 24 vì chạy TypeScript trực tiếp.

## Cấu trúc dự án

| Thư mục | Vai trò |
|---|---|
| backend/src/config | Cấu hình .env, pool MySQL |
| backend/src/routes | Ánh xạ URL và phương thức HTTP |
| backend/src/controllers | Tiếp nhận yêu cầu, điều phối và trả JSON |
| backend/src/middleware | Session, CSRF, Origin và xử lý lỗi |
| backend/src/services | Quy tắc nghiệp vụ và điều phối truy vấn |
| backend/src/models | Gateway truy vấn tham số hóa và quản lý transaction |
| backend/src/utils | Kiểu dữ liệu, validation, ngày tháng, mật khẩu, quyền |
| backend/sql | Tạo database, schema, dữ liệu minh họa |
| backend/scripts | Khởi tạo, tạo mẫu, nhập SQLite, xuất SQL |
| frontend/src/views | Trang đăng nhập và màn hình quản lý |
| frontend/src/components | Biểu mẫu và bảng quản lý dùng lại |
| frontend/src/services | Gọi HTTP API, không kết nối SQL trực tiếp |
| frontend/src/utils | Kiểu dữ liệu, định dạng hiển thị và quyền hiển thị |
| frontend/src/styles | CSS giao diện và responsive |
| docs | Tài liệu dự án và Word |
| tests | Unit, MySQL, System và E2E |
| scripts | Khởi động, build và công cụ dùng chung |

## Actor và phân quyền

Khách chưa đăng nhập chỉ xem màn hình đăng nhập. Hội viên là đối tượng được quản lý, chưa có cổng tự phục vụ hoặc tài khoản MEMBER.

| Nghiệp vụ | ADMIN | STAFF | TRAINER |
|---|---|---|---|
| Tổng quan và doanh thu | Xem | Xem | Không |
| Hội viên | Xem, thêm, sửa, lưu trữ, khôi phục | Xem, thêm, sửa, lưu trữ, khôi phục | Xem |
| Gói tập | Xem, thêm, sửa, ngừng, mở, xóa mềm | Xem | Xem |
| Đăng ký và hóa đơn | Ghi nhận, xem | Ghi nhận, xem | Chỉ nhận thông tin hạn tập; ẩn tiền và phương thức |
| Check-in và check-out | Thực hiện | Thực hiện | Thực hiện |
| Huấn luyện viên | CRUD | Xem | Xem |
| Nhân viên và tài khoản | Thêm, sửa, phân quyền, khóa, mở | Không | Không |
| Phòng tập | CRUD | Xem | Xem |
| Thiết bị | CRUD | Xem, thêm, sửa tình trạng | Xem |

Khóa tài khoản hoặc đổi mật khẩu/vai trò thu hồi các phiên tương ứng. Người dùng không được tự khóa hay tự hạ quyền. Hệ thống phải giữ ít nhất một ADMIN hoạt động. Mật khẩu chỉ lưu dạng băm PBKDF2 SHA256 với salt riêng.

## Nghiệp vụ hội viên

ADMIN hoặc STAFF nhập tên, số điện thoại, giới tính, email, ngày sinh, địa chỉ. Tên có 2–80 ký tự, số điện thoại 10 chữ số bắt đầu bằng 0 và duy nhất kể cả hồ sơ lưu trữ. Email không bắt buộc nhưng phải đúng định dạng khi nhập. Ngày sinh từ năm 1900 đến hiện tại.

Thêm hồ sơ chưa đồng nghĩa có gói tập. Gói hiện tại được suy ra từ các hóa đơn có thời hạn hiệu lực. Người quản lý có thể tìm kiếm theo tên, mã, số điện thoại; lọc trạng thái, xem chi tiết và xuất CSV. Lưu trữ hội viên là xóa mềm, giữ nguyên lịch sử; có thể khôi phục.

## Nghiệp vụ gói tập

Gói gồm tên, số ngày, giá, mô tả và trạng thái. Thời hạn 1–730 ngày, giá nguyên 1.000–100.000.000 đồng. Tạm ngừng hoặc xóa mềm chặn đăng ký mới, không làm mất quyền tập đã mua và không thay đổi hóa đơn cũ.

## Nghiệp vụ đăng ký và gia hạn

Người thực hiện chọn hội viên đang quản lý, gói còn hoạt động và phương thức thanh toán. Có thể chọn ngày bắt đầu từ hôm nay đến 730 ngày tới. Nếu bỏ trống, hệ thống bắt đầu hôm nay hoặc ngày kế tiếp hạn cuối đang có. Ngày kết thúc bằng ngày bắt đầu cộng số ngày trừ một; cả hai đầu mút đều được tính.

Backend lấy giá từ bảng plans, không tin giá do trình duyệt gửi. Khoảng thời gian không được chồng lên giao dịch đã ghi. Mỗi yêu cầu có request_id duy nhất: gửi lại cùng nội dung trả kết quả cũ, gửi cùng mã nhưng đổi nội dung trả 409. Các yêu cầu đồng thời được tuần tự hóa trong transaction MySQL.

## Nghiệp vụ thanh toán

Hóa đơn chỉ ghi khi đã thu đủ tiền, trạng thái Đã thanh toán; phương thức Tiền mặt hoặc Chuyển khoản. Số tiền, tên gói và thời hạn được lưu tại thời điểm mua. Không sửa hoặc xóa hóa đơn qua API. Người dùng tìm mã/tên hội viên, lọc ngày và hội viên, xem chi tiết.

Hệ thống ghi nhận nghiệp vụ đã thu tiền, chưa thực hiện chuyển tiền ngân hàng, hoàn tiền, công nợ hoặc hóa đơn điện tử pháp lý. Đăng ký gói và hóa đơn hiện là một bản ghi payments; không tách đơn chờ thu.

## Nghiệp vụ điểm danh

Check-in yêu cầu hội viên chưa lưu trữ và có gói hiệu lực đúng ngày Việt Nam. Một hội viên chỉ có một lượt chưa check-out. Sau check-out có thể vào lại trong cùng ngày. Check-out vẫn được phép khi hội viên đã lưu trữ để đóng lượt còn mở. Hết hạn gói không ngăn đóng lượt đang mở.

Các lượt từ dữ liệu cũ không biết giờ ra được đánh dấu legacy_closed, không bịa thời gian. Database sử dụng cột sinh open_member_id và unique index để chặn hai lượt đang mở.

## Nghiệp vụ nhân sự và cơ sở vật chất

Hồ sơ HLV gồm liên hệ, chuyên môn, kinh nghiệm, lịch làm việc và trạng thái; lịch hiện là văn bản, không phải hệ thống xếp ca tự động. Hồ sơ HLV và tài khoản TRAINER quản lý độc lập, không tự tạo/xóa lẫn nhau.

ADMIN tạo tài khoản nhân viên, cấp vai trò và khóa/mở tài khoản; không có chức năng xóa cứng tài khoản. Phòng gồm loại, sức chứa và trạng thái. Thiết bị thuộc một phòng, có số lượng, ngày mua, tình trạng. Chỉ gắn thiết bị vào phòng còn hoạt động. Phòng còn thiết bị chưa xóa không được xóa. Tình trạng thiết bị: Tốt, Đang sử dụng, Hỏng, Đang bảo trì.

## Nghiệp vụ báo cáo

Tổng quan lấy số liệu database: hội viên đang quản lý, có gói còn hạn, hết hạn, sắp hết hạn, nhân viên, HLV, gói, lượt tập trong ngày và doanh thu ngày/tháng/năm. Doanh thu nhóm theo thời điểm thu tiền trong múi giờ Asia/Ho_Chi_Minh. Biểu đồ hiển thị lượt vào trong 7 ngày.

## Hướng dẫn khởi động

1. Cài Node.js 22.18+ hoặc 24, pnpm và MySQL 8.0.16+.
2. Chạy pnpm install ở thư mục gốc.
3. Sao chép backend/.env.example thành backend/.env. Điền DB_HOST, DB_PORT, DB_NAME, DB_USER và DB_PASSWORD.
4. Chạy pnpm db:setup để tạo schema. Tài khoản cần quyền tạo database/bảng; nếu không có, nhờ quản trị DB chạy SQL trước.
5. Chọn nhập dữ liệu cũ bằng script import-sqlite.ts hoặc tạo dữ liệu minh họa bằng pnpm db:demo. Không tạo mẫu trước khi nhập dữ liệu cũ vào MySQL rỗng.
6. Chạy pnpm dev, mở http://localhost:3000. Backend tại 127.0.0.1:4000.

Chay-GYM.cmd chạy cả hai tiến trình sau khi đã cấu hình và khởi tạo. Ctrl+C dừng máy chủ. Có thể mở hai terminal riêng bằng pnpm dev:backend và pnpm dev:frontend.

## Chuyển dữ liệu cũ

Script backend/scripts/import-sqlite.ts mở SQLite ở chế độ chỉ đọc và chỉ nhập vào database MySQL chưa có dữ liệu nghiệp vụ. Mọi INSERT nằm trong một transaction: có lỗi thì rollback. Giữ ID, hash mật khẩu, hóa đơn, hồ sơ và lượt tập; không chuyển session cũ, người dùng đăng nhập lại. Kết quả nhập lưu ở outputs/mysql-import-result.json.

## Kiểm chứng và giới hạn

Các bộ kiểm thử hiện tại sử dụng MySQL riêng và database quan_ly_phong_gym_test. Kết quả từng lần chạy xem docs/testing/TEST_RESULTS.md. Dữ liệu mẫu là tùy chọn; UI không tự chèn dữ liệu minh họa.

Phân trang hiện ở frontend, GET tổng hợp lấy toàn bộ dữ liệu phù hợp quyền; cần phân trang phía server khi quy mô lớn. Khóa ghi chung phù hợp một phòng tập nhỏ; khi tăng tải cần khóa theo hội viên và tài nguyên. Tập tin .env không đưa lên GitHub. Backend production cần HTTPS và reverse proxy /api cùng origin. Frontend build không tự chứa backend hoặc MySQL.
