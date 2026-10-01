# Cấu trúc MVC của GYM LC

Ứng dụng dùng Express và React: Model và Controller phía máy chủ nằm trong backend; View nằm trong frontend. React dùng controller hook để điều phối dữ liệu giao diện. Không cần tạo View HTML trùng lặp trong backend.

```text
backend/src/
  routes/          URL và phương thức HTTP
  controllers/     Nhận yêu cầu, kiểm tra HTTP, trả JSON và cookie
  services/        Nghiệp vụ đăng nhập, hội viên, gói tập, lịch và khuyến mãi
  models/          Kết nối, đọc dữ liệu, phiên đăng nhập và nhật ký thao tác
  middleware/      Kiểm tra phiên, Origin, CSRF và xử lý lỗi
  config/          Cấu hình máy chủ và MySQL
  utils/           Hàm kiểm tra và xử lý dữ liệu dùng chung
frontend/src/
  models/          Kiểu dữ liệu và trạng thái dữ liệu ban đầu
  controllers/     Hook tải dữ liệu, lưu thao tác, trạng thái chờ và lỗi
  views/           Màn hình đăng nhập và giao diện quản lý
  components/      Thành phần giao diện theo nghiệp vụ
  services/        Gọi API HTTP
  utils/           Hàm tính toán và định dạng
```

## Luồng xử lý

View → controller hook → API → route → controller backend → service/model → MySQL. Kết quả quay về View để hiển thị.

- `auth.controller.ts` kiểm tra yêu cầu HTTP và cookie; `auth.service.ts` thực hiện đăng ký, đăng nhập và giới hạn thử sai. Các transaction giới hạn thử sai vẫn được commit riêng khi đăng nhập thất bại.
- `gym.controller.ts` giữ transaction của thao tác ghi; `audit.model.ts` ghi nhật ký trong cùng transaction.
- `useGymController.ts` quản lý tải dữ liệu, chống gửi trùng trong khi lưu, cập nhật thông báo và tải lại sau lưu. `GymApp.tsx` sử dụng hook này để hiển thị.
- `gym.model.ts` phía frontend định nghĩa dữ liệu snapshot và trạng thái ban đầu.

## Quy tắc khi thêm chức năng

1. Tạo thành phần giao diện trong `views` hoặc `components`.
2. Đặt gọi HTTP trong `services`; điều phối dữ liệu giao diện trong `controllers`.
3. Khai báo API trong `routes`, nhận/trả HTTP trong controller backend.
4. Đặt quy tắc nghiệp vụ trong service; ưu tiên tách truy vấn dùng lại vào model.
5. Kiểm tra quyền trên backend trước khi đọc hoặc ghi, không chỉ ẩn nút trên giao diện.

Một số service nghiệp vụ hiện vẫn chứa truy vấn SQL trong transaction. Đây là MVC có tầng service, chưa phải kiến trúc repository tách riêng toàn bộ SQL. Các component biểu mẫu vẫn giữ trạng thái giao diện cục bộ.

Cách chạy, API và cấu hình MySQL giữ nguyên. Các hàm kiểm thử trong Excel vẫn giữ nguyên tên và đường dẫn.
