# Actor và use case — Website quản lý phòng GYM

Cập nhật 18/09/2026, đối chiếu Nhom3_TestCaseDacTa.docx và yêu cầu tách Admin khỏi nghiệp vụ phòng tập. Đây là đặc tả triển khai cho source hiện tại; các tài liệu kiểm thử cũ cần dùng ma trận dưới đây thay cho giả định Admin làm mọi nghiệp vụ.

## 1. Actor

| Actor | Trách nhiệm | Giới hạn |
|---|---|---|
| Khách | Đăng ký tài khoản hội viên, đăng nhập | Không tự chọn quyền quản trị |
| ADMIN — Quản trị hệ thống | Tạo/sửa/khóa tài khoản; gán vai trò và liên kết hồ sơ; cấu hình tên/giờ hoạt động; đọc nhật ký | Không quản lý hội viên, gói, lịch tập, thu tiền hay báo cáo doanh thu |
| MANAGER — Quản lý | Điều hành nghiệp vụ, danh mục, xử lý hủy và báo cáo | Không quản lý tài khoản hoặc phân quyền |
| STAFF — Nhân viên | Tiếp nhận/sửa hội viên, đăng ký gói, thu tiền, xếp lịch, điểm danh, cập nhật thiết bị | Không hủy giao dịch/đăng ký/lịch; không đổi giá gói hoặc phân quyền |
| TRAINER — Huấn luyện viên | Xem lịch được giao và hội viên trong lịch đó; tra cứu gói/phòng | Chỉ đọc; không thấy doanh thu và tài khoản |
| MEMBER — Hội viên | Xem hồ sơ, đăng ký, lịch và trạng thái của chính mình; tra cứu gói | Không xem người khác, không tự ghi nhận thanh toán |

## 2. Ma trận use case

Mã ADD/EDIT/DELETE/SEARCH theo tên use case trong tài liệu. DELETE nghiệp vụ được thực hiện bằng hủy/lưu trữ để bảo toàn lịch sử.

| Use case | Actor được thực hiện | Điều kiện/phạm vi |
|---|---|---|
| AUTH-01 Đăng nhập | Mọi tài khoản hoạt động | Tên đăng nhập hoặc email và mật khẩu |
| AUTH-02 Đăng ký | Khách | Tạo MEMBER và hồ sơ mới; không chiếm hồ sơ có sẵn |
| AUTH-03 Đăng xuất | Mọi actor đăng nhập | Vô hiệu phiên tại backend |
| MEM-ADD, MEM-EDIT | Quản lý, Nhân viên | Thông tin hợp lệ, phone/email/mã không trùng |
| MEM-DELETE | Quản lý | Lưu trữ/khôi phục; xử lý lịch sắp tới trước |
| MEM-SEARCH | Quản lý, Nhân viên; HLV, Hội viên theo phạm vi | HLV chỉ hội viên được giao, MEMBER chỉ chính mình |
| USR-ADD, USR-EDIT | Admin | Gán một trong 5 vai trò; MEMBER/TRAINER phải liên kết hồ sơ |
| USR-DELETE | Admin | Khóa tài khoản và thu hồi phiên; giữ ít nhất một Admin |
| USR-SEARCH | Admin | Không trả hash mật khẩu |
| PKG-ADD, PKG-EDIT, PKG-DELETE | Quản lý | Ngừng bán/xóa mềm không thay đổi hóa đơn cũ |
| PKG-SEARCH | Quản lý, Nhân viên, HLV, Hội viên | Xem danh mục |
| REG-ADD, REG-EDIT | Quản lý, Nhân viên | Chỉ sửa đăng ký PENDING; Nhân viên không chuyển sang người khác |
| REG-DELETE | Quản lý | Xử lý thanh toán/lịch/check-in liên quan trước |
| REG-SEARCH | Quản lý, Nhân viên, Hội viên | Hội viên chỉ đăng ký của mình |
| PAY-ADD | Quản lý, Nhân viên | Thu đủ giá đã chốt; cùng request_id không thu hai lần |
| PAY-EDIT | Quản lý | Chỉ sửa phương thức; sai số tiền/thời hạn phải hủy và lập lại |
| PAY-DELETE | Quản lý | Có lý do, xử lý lịch/check-in trước; loại khỏi doanh thu |
| PAY-SEARCH | Quản lý, Nhân viên | Phiếu thu còn hiệu lực |
| TRN-ADD, TRN-EDIT, TRN-DELETE | Quản lý | Không xóa/ngừng HLV có lịch sắp tới chưa xử lý |
| TRN-SEARCH | Quản lý, Nhân viên | Danh sách HLV |
| SCH-ADD, SCH-EDIT | Quản lý, Nhân viên | Không trùng hội viên/HLV/phòng; gói còn hiệu lực |
| SCH-DELETE | Quản lý | Hủy mềm, giữ lịch sử |
| SCH-SEARCH | Quản lý, Nhân viên, HLV, Hội viên | HLV lịch được giao; hội viên lịch của mình |
| STS-VIEW, STS-SEARCH | Quản lý, Nhân viên, HLV, Hội viên theo phạm vi | Trạng thái tính từ thời hạn đăng ký đã kích hoạt |
| STS-EDIT | Quản lý | Lưu trữ/khôi phục hồ sơ; không sửa tay thành “còn hạn” |
| SRH-SEARCH | Quản lý, Nhân viên, HLV, Hội viên | Chỉ các nhóm dữ liệu đã được cấp quyền |
| RPT-VIEW, RPT-EXPORT | Quản lý | Lọc ngày, doanh thu thực thu, xuất CSV hoặc in PDF |
| SYS-CONFIG, SYS-AUDIT | Admin | Cấu hình và 200 thao tác gần nhất |
| CHECKIN/OUT | Quản lý, Nhân viên | Gói hiệu lực, một lượt mở/hội viên |
| ROOM CRUD | Quản lý | Không xóa phòng còn thiết bị/lịch chưa xử lý |
| EQUIPMENT ADD/EDIT | Quản lý, Nhân viên | Phòng hoạt động, số lượng hợp lệ |
| EQUIPMENT DELETE | Quản lý | Xóa mềm |

## 3. Luồng nghiệp vụ và ngoại lệ

### Đăng ký → thanh toán → lịch tập
1. Nhân viên/Quản lý tạo hội viên và đăng ký gói; hệ thống chốt tên, giá, thời hạn.
2. Gói có phí: đăng ký PENDING, chưa được vào tập. Thu tiền tại Thanh toán, chọn đăng ký đang chờ → ACTIVE.
3. Gói giá 0: ACTIVE ngay, không lập phiếu thu, không cộng doanh thu.
4. Tạo lịch trong thời hạn có hiệu lực. Thời lượng 30–180 phút; lịch sát nhau được phép, giao nhau bị chặn.
5. HLV chỉ thấy lịch được phân công; hội viên chỉ thấy lịch của chính mình.
6. Hủy phiếu thu cần lý do; phải hủy lịch liên quan và check-out trước. Đăng ký chuyển CANCELLED, không còn quyền vào tập.

### Ngoại lệ dùng khi sửa test case
- E1: Thiếu trường bắt buộc hoặc sai kiểu/định dạng/miền giá trị → 400, không ghi dữ liệu.
- E2: Trùng mã, trùng liên hệ, chồng thời hạn hoặc trùng lịch → 409.
- E3: Chưa đăng nhập/phiên hết hạn → 401; sai quyền/CSRF/Origin → 403.
- E4: Không tìm thấy bản ghi trong phạm vi actor → 404.
- E5: Trạng thái hoặc dữ liệu liên quan không cho phép sửa/hủy → 409.
Các nhãn E1–E5 là quy ước đối chiếu tài liệu; API trả HTTP status và thông báo tiếng Việt, không dùng một mã E chung cho mọi use case.

## 4. Miền dữ liệu đã triển khai

- Mã nghiệp vụ: chữ không dấu và số, không khoảng trắng; gói 3–20, các mã hội viên/HLV/đăng ký/phiếu thu/lịch 5–20 ký tự; duy nhất trong từng bảng. Tự gợi ý mã trên form.
- UUID/ID cũ giữ làm khóa liên kết; mã nghiệp vụ là cột code riêng.
- Họ tên 2–100; tên gói 3–100; SĐT 10–11 chữ số bắt đầu 0; email tối đa 100.
- Username mới 5–30; mật khẩu mới 8–64 ký tự gồm chữ và số. Đăng nhập vẫn chấp nhận mật khẩu cũ tối đa 128 để tương thích tài khoản trước migration.
- Gói: 1–730 ngày; giá nguyên 0–100.000.000 VND. Phiếu thu có phí 1–100.000.000 VND, đúng giá đăng ký.
- Ngày bắt đầu đăng ký: hôm nay đến 730 ngày tới; ngày kết thúc tính theo số ngày của gói, gồm cả ngày đầu.
- Lịch: ngày không ở quá khứ; giờ HH:mm; thời lượng 30–180 phút.
- Báo cáo: nếu nhập cả hai mốc thì tối đa 366 ngày, ngày đầu không sau ngày cuối.
- Trạng thái: PENDING/ACTIVE/CANCELLED của đăng ký; trạng thái hội viên suy ra theo ngày và cờ lưu trữ.
- Xóa mềm và hủy giữ lịch sử; khóa tài khoản thu hồi các phiên đang hoạt động.

## 5. Cấu trúc MVC và nơi sửa quyền

- backend/src/routes: khai báo endpoint.
- backend/src/controllers: nhận request, xác thực, gọi nghiệp vụ, trả response.
- backend/src/services/gym.service.ts: nghiệp vụ danh mục, tài khoản, thu tiền/điểm danh.
- backend/src/services/workflow.service.ts: đăng ký, lịch tập, hủy/sửa thanh toán, cấu hình.
- backend/src/models: truy vấn MySQL, transaction, snapshot lọc theo actor, migration.
- backend/src/utils/security.ts: ma trận quyền backend, mặc định từ chối.
- frontend/src/utils/security.ts: quyền giao diện tương ứng; backend vẫn kiểm soát mọi request.
- frontend/src/components/Workflows.tsx: đăng ký/lịch/thu tiền/báo cáo/hệ thống/tra cứu.
- frontend/src/components/Management.tsx: tài khoản, HLV, phòng và thiết bị.
- frontend/src/views/GymApp.tsx: hội viên, gói, tổng quan, điểm danh.
- tools/tests/workflows.test.mjs: kiểm thử actor, phạm vi dữ liệu và liên kết nghiệp vụ.

## 6. Chạy và nâng cấp

Giữ nguyên backend/.env. Chạy tại thư mục dự án:

```powershell
node backend/scripts/migrate.ts
node tools/scripts/dev.mjs
```

Hoặc nhấp Chay-GYM.cmd. Website http://localhost:3000, backend cổng 4000.
Migration bổ sung bảng/cột/khóa ngoại và chuyển phiếu thu cũ thành đăng ký ACTIVE; không xóa database, không đổi mật khẩu hiện có. Tài khoản MySQL thực hiện migration cần quyền CREATE/ALTER/INDEX và CRUD. Backend hiện kiểm tra migration khi khởi động.

Dữ liệu mẫu là tùy chọn: `node tools/scripts/db.mjs --demo`. Lệnh bổ sung tài khoản `manager / GymManager2026!` trên dữ liệu demo; Admin vẫn `admin / GymAdmin2026!`. Không tự đổi tài khoản đang tồn tại. Với dữ liệu riêng, Admin tạo tài khoản vai trò Quản lý trong màn hình Tài khoản và phân quyền.

Tạo hồ sơ HLV/hội viên bằng Quản lý/Nhân viên theo quyền, sau đó Admin nhập mã hoặc ID hồ sơ khi cấp tài khoản tương ứng. Tài khoản cũ chưa liên kết sẽ không nhận dữ liệu cá nhân cho đến khi Admin liên kết.

Kiểm thử dùng backend/.env.test và database quan_ly_phong_gym_test riêng:
```powershell
node --test tools/tests/gym.test.mjs tools/tests/validation.test.mjs tools/tests/mysql.test.mjs tools/tests/workflows.test.mjs
node tools/scripts/build.mjs
```

## 7. Kết quả xác minh 18/09/2026

- 45/45 kiểm thử đơn vị và tích hợp MySQL/API đạt.
- 12 tình huống giao diện: 11 đạt ở lần chạy toàn bộ; tình huống đăng ký–thu tiền được sửa nhãn chọn và chạy lại đạt.
- TypeScript và build frontend đạt.
- Lint toàn dự án chưa sạch: còn các lỗi quy tắc kiểu dữ liệu (any, stringify unknown, FormEvent) và cấu hình Next.js cũ trong dự án React/Vite. Không coi kết quả lint là PASS.
- File Word/Excel kiểm thử cũ không được tự đánh dấu lại PASS theo phiên bản mới; dùng ma trận actor trong tài liệu này để cập nhật khi nộp.
