# Selenium automation tests

Bộ kiểm thử UI dùng Selenium WebDriver và TestNG cho website GYM-LC.

## Yêu cầu

- Java 17+
- Gradle 8+
- Website đang chạy tại `http://127.0.0.1:3000`
- Database đã có dữ liệu demo (`pnpm db:demo`)
- Chrome hoặc Microsoft Edge

Selenium Manager tự tải driver tương ứng, không cần cấu hình `chromedriver` thủ công.

## Chạy

Mở **Terminal 1** tại thư mục gốc dự án và khởi động website:

```powershell
cd C:\Users\Admin\Documents\GitHub\GYM-LC
pnpm db:demo
pnpm dev
```

Giữ Terminal 1 đang chạy. Khi thấy website ở `http://127.0.0.1:3000`, mở **Terminal 2**:

```powershell
cd C:\Users\Admin\Documents\GitHub\GYM-LC\automation-tests
.\gradlew.bat test --rerun-tasks
```

Kết quả đúng là `BUILD SUCCESSFUL` và từng test có trạng thái `PASSED`.

## Chạy chậm để quan sát

Mặc định test chạy Chrome headless nên không hiện cửa sổ. Để xem từng bước, dùng Terminal 2:

```powershell
$env:HEADLESS = "false"
$env:TEST_DELAY_MS = "2000"
.\gradlew.bat test --rerun-tasks
```

`TEST_DELAY_MS=2000` nghĩa là dừng 2 giây sau mỗi thao tác chính. Có thể tăng lên `3000` hoặc `5000` nếu cần quan sát lâu hơn. Đừng đóng cửa sổ Chrome trong lúc test.

Chạy riêng flow đầy đủ:

```powershell
$env:HEADLESS = "false"
$env:TEST_DELAY_MS = "3000"
.\gradlew.bat test --tests "com.gymlc.GymFullWorkflowTest.completeMemberJourney" --rerun-tasks
```

Flow này chạy đăng ký hội viên, xem thông tin, đăng ký gói, thanh toán, check-in, check-out, gia hạn và xem báo cáo. Bước khuyến mãi được ghi là `SKIPPED` vì phiên bản hiện tại chưa có chức năng khuyến mãi.

Nếu thấy `Port 3000 is already in use`, website đã được chạy ở Terminal khác. Không chạy thêm `pnpm dev`; chỉ mở Terminal 2 và chạy test.

Chạy trên Edge ở chế độ có giao diện:

```powershell
$env:BROWSER = "edge"
$env:HEADLESS = "false"
.\gradlew.bat test --rerun-tasks
```

Có thể thay đổi địa chỉ và tài khoản kiểm thử:

```powershell
$env:BASE_URL = "http://127.0.0.1:3000"
$env:TEST_USERNAME = "manager"
$env:TEST_PASSWORD = "GymManager2026!"
.\gradlew.bat test --rerun-tasks
```
