# Luồng nghiệp vụ kiểm thử

Các khối Mermaid có thể dán vào Mermaid Live Editor hoặc tính năng chèn Mermaid của draw.io.

## 1. Đăng nhập

```mermaid
flowchart TD
A["Mở trang đăng nhập"] --> B["Nhập username và password"]
B --> C{"Đủ trường, đúng kiểu?"}
C -- Không --> X["Thông báo lỗi"]
C -- Có --> D{"Vượt giới hạn thử?"}
D -- Có --> Y["429: chờ 15 phút"]
D -- Không --> E{"Mật khẩu đúng, tài khoản mở?"}
E -- Không --> X
E -- Có --> F["Tạo session, cookie HttpOnly, CSRF"]
F --> G["Trang được phép theo vai trò"]
G --> H["Đăng xuất"]
H --> I["Xóa session và cookie"]
```

## 2. Quản lý hội viên

```mermaid
flowchart TD
A["Đăng nhập Admin hoặc nhân viên"] --> B["Danh sách, tìm kiếm, lọc, phân trang"]
B --> C["Thêm hoặc sửa"]
C --> D{"Tên, SĐT, email, ngày sinh hợp lệ?"}
D -- Không --> E["Hiển thị lỗi, giữ dữ liệu form"]
D -- Có --> F{"SĐT duy nhất?"}
F -- Không --> E
F -- Có --> G["Lưu database"]
G --> B
B --> H["Xóa / lưu trữ"]
H --> I{"Xác nhận?"}
I -- Không --> B
I -- Có --> J["Đánh dấu lưu trữ, giữ lịch sử"]
J --> K["Lọc Đã lưu trữ"]
K --> L["Khôi phục"]
L --> B
```

## 3. Đăng ký gói tập

```mermaid
flowchart TD
A["Chọn hội viên và gói"] --> B{"Hội viên và gói đang hoạt động?"}
B -- Không --> X["Báo lỗi"]
B -- Có --> C["Chọn ngày bắt đầu hoặc tự gia hạn"]
C --> D{"Ngày đúng, không quá khứ?"}
D -- Không --> X
D -- Có --> E["Tính hạn: bắt đầu + thời hạn - 1"]
E --> F["Hiển thị tổng tiền từ database"]
F --> G["Xác nhận đã nhận tiền"]
G --> H{"Kiểm tra trùng khoảng ngày tại thời điểm ghi"}
H -- Trùng --> X
H -- Không --> I["Lưu hóa đơn và hiệu lực gói nguyên tử"]
I --> J["Cập nhật danh sách, dashboard"]
```

## 4. Check-in/out

```mermaid
flowchart TD
A["Tìm hội viên"] --> B{"Có lượt chưa check-out?"}
B -- Có --> C["Cho phép check-out"]
C --> D["Lưu giờ rời phòng"]
B -- Không --> E{"Hội viên còn hạn và không lưu trữ?"}
E -- Không --> F["Từ chối, cần gia hạn"]
E -- Có --> G["Check-in"]
G --> H{"Ràng buộc một lượt mở duy nhất"}
H -- Trùng --> I["409: đã ở trong phòng"]
H -- Hợp lệ --> J["Lưu giờ vào, giờ ra NULL"]
J --> A
D --> A
```

## 5. Thanh toán

```mermaid
flowchart TD
A["Nhân viên chọn gói và hội viên"] --> B["Chọn phương thức đã thu"]
B --> C{"Số tiền bằng giá trong database?"}
C -- Không --> X["Từ chối"]
C -- Có --> D{"Mã yêu cầu đã dùng?"}
D -- Có --> E{"Nội dung giống nhau?"}
E -- Không --> X
E -- Có --> F["Trả lại hóa đơn cũ"]
D -- Không --> G{"Ngày hiệu lực không trùng?"}
G -- Không --> X
G -- Có --> H["INSERT hóa đơn và thời hạn"]
H --> I["Xem chi tiết, lọc ngày/hội viên"]
I --> J["Thống kê theo giờ Việt Nam"]
```

## 6. Quản lý thiết bị

```mermaid
flowchart TD
A["Danh sách thiết bị"] --> B["Thêm hoặc sửa"]
B --> C{"Vai trò được phép?"}
C -- Không --> X["403"]
C -- Có --> D{"Phòng hoạt động, số lượng dương, ngày mua hợp lệ?"}
D -- Không --> E["Thông báo validation"]
D -- Có --> F["Chọn Tốt / Đang sử dụng / Hỏng / Bảo trì"]
F --> G["Lưu database"]
G --> A
A --> H["Admin chọn xóa"]
H --> I{"Xác nhận?"}
I -- Có --> J["Xóa mềm"]
I -- Không --> A
J --> A
```

## 7. Quản lý HLV

```mermaid
flowchart TD
A["Xem / tìm / lọc HLV"] --> B{"Admin?"}
B -- Không --> C["Chỉ xem"]
B -- Có --> D["Thêm hoặc sửa"]
D --> E{"Liên hệ, chuyên môn, kinh nghiệm, lịch hợp lệ?"}
E -- Không --> F["Hiển thị lỗi"]
E -- Có --> G["Lưu database"]
G --> A
B -- Có --> H["Xóa HLV"]
H --> I{"Xác nhận?"}
I -- Có --> J["Đánh dấu xóa"]
I -- Không --> A
J --> A
```

