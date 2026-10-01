# Kiến trúc Java MVC của GYM LC

Backend dùng Java 17, Spring Boot MVC và JDBC kết nối MySQL. View là giao diện React hiện có, nằm trong `src/main/webapp`. Không cần chạy backend Express để sử dụng bản này.

```text
src/
  main/
    java/vn/edu/eaut/gym/
      GymApplication.java
      controller/        Nhận HTTP, trả JSON và điều hướng View
        auth/             API đăng nhập, đăng ký, đăng xuất
      service/           Quy tắc nghiệp vụ theo từng chức năng
      dao/               JDBC, transaction và nhật ký thao tác
      model/             Bản ghi dữ liệu và ngoại lệ nghiệp vụ
      filter/            Header bảo mật và giới hạn body
      config/            Đọc cấu hình môi trường
      util/              Validation, phân quyền, băm mật khẩu
      tool/              Khởi tạo database mới khi được yêu cầu
    resources/
      application.properties
      db/schema.sql
    webapp/              View React, CSS, API client, Vite
  test/java/vn/edu/eaut/gym/
db/migrations/           SQL cấu trúc MySQL hiện tại
scripts/                 Chạy ứng dụng, build và kiểm thử tích hợp
docs/                    Tài liệu
legacy/node/             Bản Node cũ để đối chiếu; không chạy mặc định
pom.xml                  Cấu hình Maven
run-dev.cmd              Chạy trên Windows
```

## Luồng xử lý

View React → API `/api/...` → Controller Java → Service → DAO/JDBC → MySQL. Controller trả JSON; View cập nhật màn hình.

| Thành phần | Trách nhiệm |
|---|---|
| AuthController / AuthService | Đăng ký, đăng nhập, đăng xuất, phiên, Origin và CSRF |
| GymController / GymService | Kiểm tra quyền, điều phối nghiệp vụ, sinh mã và audit |
| MemberService | Hội viên, gói tập, check-in/out |
| RegistrationService | Thời hạn gói, chặn trùng, hủy đăng ký |
| PaymentService | Thu tiền, mã yêu cầu chống lặp, sửa phương thức, hủy thanh toán |
| ScheduleService | Dịch vụ/HLV, thời gian, gói còn hạn và chống trùng lịch |
| CatalogService | Dịch vụ, khuyến mãi và phân công dịch vụ cho HLV |
| FacilityService | HLV, phòng và thiết bị |
| AccountService | Tài khoản, vai trò và cấu hình hệ thống |
| SnapshotService | Dữ liệu màn hình, lọc theo quyền và phạm vi hội viên/HLV |
| GymDao | Truy vấn có tham số, chuẩn hóa ngày giờ, transaction |

Service định nghĩa truy vấn nghiệp vụ; DAO thực thi JDBC trên connection gắn với transaction. Tên bảng và cột động chỉ lấy từ danh sách cố định trong code. Đây là MVC có tầng service và DAO, không dùng JPA.

## Tính nhất quán và bảo mật

- Thao tác ghi lấy khóa `mutation_lock` trong cùng transaction để kiểm tra chồng lịch/thời hạn, ghi dữ liệu và audit nhất quán.
- Session dùng cookie HttpOnly, SameSite=Strict. Thao tác ghi yêu cầu Origin hợp lệ và CSRF token.
- PBKDF2-HMAC-SHA256, 100.000 vòng, giữ định dạng mật khẩu cũ để tài khoản hiện có tiếp tục dùng được.
- Admin chỉ quản lý tài khoản và hệ thống. Manager quản lý nghiệp vụ/báo cáo; Staff thao tác tiếp nhận/thu tiền; Trainer và Member chỉ xem phạm vi của mình.
- Tiền và ngày tháng được kiểm tra lại tại backend. Frontend không quyết định quyền hay giá cần thu.

## Kiểm thử

`src/test/java` kiểm thử trực tiếp các hàm Java và hợp đồng controller. `ExcelUnitCasesTest` chứa 54 ca của 6 hàm được dùng trong Excel, không cần MySQL.

`scripts/test-api.mjs` kiểm thử API trên database riêng `quan_ly_phong_gym_java_test`; `scripts/test-ui.mjs` kiểm tra giao diện của 5 actor.

Các báo cáo doanh thu/top gói và biểu đồ vẫn được tính từ snapshot trong View React; dữ liệu đầu vào đã được backend lọc quyền.
