# Cấu trúc MySQL của bản Java

`migrations/V001__baseline.sql` chứa cấu trúc 19 bảng hiện có, không chứa dữ liệu hội viên hoặc mật khẩu. Đây là baseline cho database mới, không phải script nâng cấp trực tiếp database cũ.

Khuyến nghị khởi tạo bằng JAR với `--setup --demo` theo `docs/SETUP.md` để có thêm roles, mutation_lock và system_settings. Nếu nhập schema thủ công, phải bổ sung các bản ghi hệ thống này trước khi dùng.

Ứng dụng Java không tự chạy DDL hoặc seed lúc khởi động. Dữ liệu phòng GYM hiện có tiếp tục được sử dụng qua cấu hình `.env`.
