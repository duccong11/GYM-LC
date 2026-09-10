# Báo cáo lỗi

Các lỗi dưới đây được ghi nhận khi đọc source hoặc chạy kiểm thử. Kết quả “trước sửa” mô tả phiên bản tại lúc phát hiện; không cố ý để lại lỗi trong bản bàn giao. Các chức năng mới còn thiếu ban đầu được liệt kê trong PROJECT_ANALYSIS, không giả lập thành lỗi chạy thực tế.

## BUG-01 — Truy cập dữ liệu local không cần đăng nhập

| Trường | Nội dung |
|---|---|
| Mã lỗi | BUG-01 |
| Mức độ | Cao |
| Ưu tiên | P1 |
| Điều kiện | Bản source ban đầu; máy chủ local đang chạy. |
| Bước tái hiện | Gửi GET /api/gym khi chưa đăng nhập; thử POST thay đổi dữ liệu. |
| Mong đợi | Yêu cầu phiên hợp lệ và kiểm tra quyền. |
| Thực tế trước sửa | API ban đầu chưa có xác thực ứng dụng. |
| Cách sửa | Thêm tài khoản, session, guard trang/API, CSRF. |
| Trạng thái / kiểm tra lại | Đã sửa; System xác nhận 401/403, E2E-08/09. |
| Ảnh minh chứng | Không đính kèm ảnh lỗi riêng; lỗi source/API đối chiếu mã và test. BUG-07 có ảnh người dùng gửi trong hội thoại. Báo cáo E2E cuối chỉ lưu lần chạy mới nhất. |

## BUG-02 — Mã yêu cầu thanh toán dùng lại với nội dung khác

| Trường | Nội dung |
|---|---|
| Mã lỗi | BUG-02 |
| Mức độ | Cao |
| Ưu tiên | P1 |
| Điều kiện | Có một thanh toán với request_id đã sử dụng. |
| Bước tái hiện | Gửi lại request_id nhưng đổi hội viên, gói hoặc phương thức. |
| Mong đợi | Từ chối 409, không trả thành công cho giao dịch khác. |
| Thực tế trước sửa | Nhánh chống trùng cũ chưa đối chiếu đầy đủ payload. |
| Cách sửa | So khớp dữ liệu giao dịch và xử lý truy cập đồng thời. |
| Trạng thái / kiểm tra lại | Đã sửa; integration kiểm tra replay giống/khác payload. |
| Ảnh minh chứng | Không đính kèm ảnh lỗi riêng; lỗi source/API đối chiếu mã và test. BUG-07 có ảnh người dùng gửi trong hội thoại. Báo cáo E2E cuối chỉ lưu lần chạy mới nhất. |

## BUG-03 — Kiểu dữ liệu không phải chuỗi bị ép thành chuỗi

| Trường | Nội dung |
|---|---|
| Mã lỗi | BUG-03 |
| Mức độ | Vừa |
| Ưu tiên | P2 |
| Điều kiện | Gọi API trực tiếp, bỏ qua ràng buộc HTML. |
| Bước tái hiện | Gửi object thay cho tên hoặc các trường văn bản. |
| Mong đợi | Trả lỗi dữ liệu 400. |
| Thực tế trước sửa | Validation cũ có đường ép String cho dữ liệu đầu vào. |
| Cách sửa | Thêm bộ xác thực kiểu nghiêm ngặt trước nghiệp vụ. |
| Trạng thái / kiểm tra lại | Đã sửa; unit validation và integration dữ liệu sai kiểu. |
| Ảnh minh chứng | Không đính kèm ảnh lỗi riêng; lỗi source/API đối chiếu mã và test. BUG-07 có ảnh người dùng gửi trong hội thoại. Báo cáo E2E cuối chỉ lưu lần chạy mới nhất. |

## BUG-04 — Doanh thu theo tháng lệch ở ranh giới giờ Việt Nam

| Trường | Nội dung |
|---|---|
| Mã lỗi | BUG-04 |
| Mức độ | Vừa |
| Ưu tiên | P2 |
| Điều kiện | Giao dịch tạo cuối tháng UTC nhưng đã sang tháng mới tại Việt Nam. |
| Bước tái hiện | So tháng của created_at UTC với tháng nghiệp vụ Việt Nam. |
| Mong đợi | Tính doanh thu theo ngày/tháng/năm Việt Nam. |
| Thực tế trước sửa | Cách nhóm chuỗi timestamp UTC không theo ngày Việt Nam. |
| Cách sửa | Chuyển thời điểm sang todayVN trước khi nhóm doanh thu. |
| Trạng thái / kiểm tra lại | Đã sửa; unit ngày Việt Nam; dashboard dùng cùng hàm. |
| Ảnh minh chứng | Không đính kèm ảnh lỗi riêng; lỗi source/API đối chiếu mã và test. BUG-07 có ảnh người dùng gửi trong hội thoại. Báo cáo E2E cuối chỉ lưu lần chạy mới nhất. |

## BUG-05 — Form đăng nhập có thể gửi mật khẩu lên query trước hydration

| Trường | Nội dung |
|---|---|
| Mã lỗi | BUG-05 |
| Mức độ | Cao |
| Ưu tiên | P1 |
| Điều kiện | Trang đăng nhập chưa gắn sự kiện React; phát hiện khi E2E chạy và Vite reload. |
| Bước tái hiện | Nhập dữ liệu demo và submit trước khi hydration hoàn tất. |
| Mong đợi | Không đưa mật khẩu vào URL. |
| Thực tế trước sửa | Form mặc định GET, thao tác sớm có thể sinh URL chứa trường mật khẩu demo. |
| Cách sửa | Đặt method POST và vô hiệu nút cho đến khi hydration sẵn sàng. |
| Trạng thái / kiểm tra lại | Đã sửa; E2E-01 và các kịch bản đăng nhập chạy lại thành công. |
| Ảnh minh chứng | Không đính kèm ảnh lỗi riêng; lỗi source/API đối chiếu mã và test. BUG-07 có ảnh người dùng gửi trong hội thoại. Báo cáo E2E cuối chỉ lưu lần chạy mới nhất. |

## BUG-06 — Vite tải lại trang khi báo cáo kiểm thử thay đổi

| Trường | Nội dung |
|---|---|
| Mã lỗi | BUG-06 |
| Mức độ | Vừa |
| Ưu tiên | P2 |
| Điều kiện | Chạy E2E và ghi HTML/trace trong outputs khi dev server hoạt động. |
| Bước tái hiện | Tạo báo cáo kiểm thử, theo dõi trang đang đăng nhập. |
| Mong đợi | Ghi báo cáo không làm tải lại ứng dụng. |
| Thực tế trước sửa | Watcher theo dõi artifacts khiến reload trong lúc thao tác. |
| Cách sửa | Bỏ theo dõi outputs/docs/tests/.wrangler; giới hạn nguồn quét Tailwind. |
| Trạng thái / kiểm tra lại | Đã sửa; các lượt chạy E2E tiếp theo không gặp vòng reload này. |
| Ảnh minh chứng | Không đính kèm ảnh lỗi riêng; lỗi source/API đối chiếu mã và test. BUG-07 có ảnh người dùng gửi trong hội thoại. Báo cáo E2E cuối chỉ lưu lần chạy mới nhất. |

## BUG-07 — Lệnh node không chạy trong Terminal VS Code của người dùng

| Trường | Nội dung |
|---|---|
| Mã lỗi | BUG-07 |
| Mức độ | Vừa |
| Ưu tiên | P2 |
| Điều kiện | Terminal chưa có Node trong PATH; ảnh lỗi do người dùng cung cấp. |
| Bước tái hiện | Chạy node node_modules/vinext/dist/cli.js dev. |
| Mong đợi | Khởi động được hoặc có hướng dẫn runtime rõ ràng. |
| Thực tế trước sửa | PowerShell báo node is not recognized. |
| Cách sửa | Thêm Chay-GYM.cmd và start.ps1 tìm Node/PATH hoặc runtime dự phòng. |
| Trạng thái / kiểm tra lại | Đã cung cấp cách khắc phục; runtime Node của môi trường chạy được. Chưa xác nhận Terminal VS Code mới của người dùng. |
| Ảnh minh chứng | Không đính kèm ảnh lỗi riêng; lỗi source/API đối chiếu mã và test. BUG-07 có ảnh người dùng gửi trong hội thoại. Báo cáo E2E cuối chỉ lưu lần chạy mới nhất. |

## TEST-01 — Bộ định vị hộp chọn không khớp label trong E2E

| Trường | Nội dung |
|---|---|
| Mã lỗi | TEST-01 |
| Mức độ | Thấp |
| Ưu tiên | P3 |
| Điều kiện | Biểu mẫu thanh toán/thiết bị mở đúng. |
| Bước tái hiện | Dùng getByLabel exact để tìm select lồng trong label có option. |
| Mong đợi | Chọn hội viên/gói/phòng và tiếp tục kịch bản. |
| Thực tế trước sửa | Timeout dù combobox hiển thị trong snapshot truy cập. |
| Cách sửa | Dùng getByRole combobox với tên truy cập thực tế. |
| Trạng thái / kiểm tra lại | Lỗi mã kiểm thử, không phải lỗi nghiệp vụ; đã sửa và chạy lại. |
| Ảnh minh chứng | Không đính kèm ảnh lỗi riêng; lỗi source/API đối chiếu mã và test. BUG-07 có ảnh người dùng gửi trong hội thoại. Báo cáo E2E cuối chỉ lưu lần chạy mới nhất. |

