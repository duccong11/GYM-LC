# Cơ sở dữ liệu MySQL quản lý phòng GYM

Database mặc định quan_ly_phong_gym dùng MySQL 8.0.16 trở lên, InnoDB và utf8mb4. Tài liệu mô tả bảng, quan hệ, kiểu dữ liệu và cách nhập SQL. Dữ liệu được lưu tại MySQL, frontend chỉ gọi HTTP API.

## Tập tin SQL và thứ tự chạy

1. 00_create_database.sql tạo database theo tên đề tài và chọn USE.
2. 01_schema.sql tạo 13 bảng cùng PK, FK, UNIQUE, CHECK và index.
3. 02_demo_data.sql là tùy chọn minh họa, có hash mật khẩu mẫu. Không cần nhập nếu đã chuyển dữ liệu thực.

Có thể mở MySQL Workbench, chọn kết nối bằng tài khoản và mật khẩu MySQL của bạn, chạy từng file theo thứ tự. Hoặc cấu hình backend/.env rồi chạy pnpm db:setup và pnpm db:demo. Script init-db sử dụng tên DB trong .env; 00_create_database.sql là bản SQL cho tên mặc định.

## Quan hệ và ý nghĩa

| Bảng | Vai trò |
|---|---|
| roles | Danh mục ba vai trò ADMIN STAFF TRAINER |
| accounts | Nhân viên và tài khoản ứng dụng, hash mật khẩu, vai trò, trạng thái |
| members | Hồ sơ hội viên và trạng thái lưu trữ |
| plans | Giá và thời hạn gói hiện tại |
| payments | Hóa đơn đã thu tiền và thời hạn đăng ký, snapshot tên/giá |
| checkins | Lượt ra vào phòng tập và đánh dấu lịch sử thiếu giờ ra |
| sessions | Token hash, CSRF và thời điểm hết hạn phiên |
| login_attempts | Bộ đếm đăng nhập sai và cửa sổ khóa |
| trainers | Hồ sơ chuyên môn, kinh nghiệm và lịch HLV |
| rooms | Phòng tập, loại, sức chứa và trạng thái |
| equipment | Thiết bị, phòng chứa, số lượng và tình trạng |
| mutation_lock | Một dòng khóa giao dịch ghi của ứng dụng |
| audit_logs | Actor, hành động, mã đối tượng và thời điểm thay đổi |

roles một nhiều accounts; accounts một nhiều sessions và audit_logs; members một nhiều payments và checkins; plans một nhiều payments; rooms một nhiều equipment. trainers không tự liên kết accounts; hai hồ sơ quản lý độc lập.

## Quy ước dữ liệu

ID là VARCHAR 80 để giữ được cả UUID mới và ID của dữ liệu cũ. Tiền VND là INT, không lưu số thực, tối đa 100.000.000 mỗi gói/hóa đơn. Ngày nghiệp vụ là DATE; thời điểm tạo, hết phiên và check-out là DATETIME 3 lưu UTC. API chuyển thời điểm thành chuỗi ISO UTC, frontend hiển thị giờ Việt Nam.

birth_date và requested_start cho phép NULL khi không nhập. active, deleted, archived dùng 0 hoặc 1. Không dùng DELETE cứng cho hội viên, gói, phòng, thiết bị và HLV qua ứng dụng. Mật khẩu không được lưu dạng rõ. Các session cũ không nhập lại khi chuyển database.

## Các bất biến

UNIQUE phone của members và trainers giữ số điện thoại duy nhất kể cả hồ sơ lưu trữ. UNIQUE username giữ tên đăng nhập duy nhất. UNIQUE request_id chống ghi lặp hóa đơn. FK dùng RESTRICT mặc định để bảo vệ lịch sử; riêng session có ON DELETE CASCADE nếu tài khoản bị xóa trực tiếp.

checkins.open_member_id là cột sinh: có member_id nếu checkout_at NULL và legacy_closed bằng 0; ngược lại NULL. MySQL cho nhiều NULL trong UNIQUE nên có thể lưu nhiều lượt đã đóng nhưng chỉ một lượt mở mỗi hội viên. Khi nhập dữ liệu cũ thiếu giờ ra, legacy_closed bằng 1 và checkout_at NULL.

CHECK bảo vệ miền giá, ngày, trạng thái, sức chứa và số lượng. Không chồng thời hạn, giữ ADMIN hoạt động và phòng còn thiết bị được thực thi ở service trong transaction lấy khóa mutation_lock. Các ghi SQL thủ công có thể bỏ qua quy tắc service; sử dụng API để vận hành nghiệp vụ.

## Từ điển dữ liệu

### Bảng roles

```sql
CREATE TABLE roles (
 code VARCHAR(16) PRIMARY KEY, name VARCHAR(80) NOT NULL
) ENGINE=InnoDB;
```

### Bảng mutation_lock

```sql
CREATE TABLE mutation_lock (id INT PRIMARY KEY) ENGINE=InnoDB;
```

### Bảng accounts

```sql
CREATE TABLE accounts (
 id VARCHAR(80) PRIMARY KEY, name VARCHAR(80) NOT NULL,
 username VARCHAR(32) NOT NULL, password_hash VARCHAR(255) NOT NULL,
 phone VARCHAR(10) NOT NULL DEFAULT '', email VARCHAR(120) NOT NULL DEFAULT '',
 position VARCHAR(80) NOT NULL DEFAULT '', role VARCHAR(16) NOT NULL,
 active TINYINT NOT NULL DEFAULT 1, created_at DATETIME(3) NOT NULL,
 CONSTRAINT accounts_username_unique UNIQUE(username),
 CONSTRAINT accounts_role_fk FOREIGN KEY(role) REFERENCES roles(code),
 CONSTRAINT accounts_active_check CHECK(active IN (0,1))
) ENGINE=InnoDB;
```

### Bảng members

```sql
CREATE TABLE members (
 id VARCHAR(80) PRIMARY KEY, name VARCHAR(80) NOT NULL,
 phone VARCHAR(10) NOT NULL, email VARCHAR(120) NOT NULL DEFAULT '',
 gender VARCHAR(10) NOT NULL DEFAULT 'Khác', birth_date DATE NULL,
 address VARCHAR(250) NOT NULL DEFAULT '', created_at DATETIME(3) NOT NULL,
 archived TINYINT NOT NULL DEFAULT 0,
 CONSTRAINT members_phone_unique UNIQUE(phone),
 CONSTRAINT members_gender_check CHECK(gender IN ('Nam','Nữ','Khác')),
 CONSTRAINT members_archived_check CHECK(archived IN (0,1)),
 INDEX members_created_idx(created_at)
) ENGINE=InnoDB;
```

### Bảng plans

```sql
CREATE TABLE plans (
 id VARCHAR(80) PRIMARY KEY, name VARCHAR(60) NOT NULL, days INT NOT NULL,
 price INT NOT NULL, description VARCHAR(200) NOT NULL DEFAULT '',
 active TINYINT NOT NULL DEFAULT 1, deleted TINYINT NOT NULL DEFAULT 0,
 CONSTRAINT plans_days_check CHECK(days BETWEEN 1 AND 730),
 CONSTRAINT plans_price_check CHECK(price BETWEEN 1000 AND 100000000),
 CONSTRAINT plans_flags_check CHECK(active IN (0,1) AND deleted IN (0,1))
) ENGINE=InnoDB;
```

### Bảng payments

```sql
CREATE TABLE payments (
 id VARCHAR(80) PRIMARY KEY, member_id VARCHAR(80) NOT NULL, plan_id VARCHAR(80) NOT NULL,
 plan_name VARCHAR(60) NOT NULL, amount INT NOT NULL, method VARCHAR(30) NOT NULL,
 start_date DATE NOT NULL, end_date DATE NOT NULL, created_at DATETIME(3) NOT NULL,
 request_id VARCHAR(80) NOT NULL, requested_start DATE NULL,
 status VARCHAR(30) NOT NULL DEFAULT 'Đã thanh toán',
 CONSTRAINT payments_member_fk FOREIGN KEY(member_id) REFERENCES members(id),
 CONSTRAINT payments_plan_fk FOREIGN KEY(plan_id) REFERENCES plans(id),
 CONSTRAINT payments_request_unique UNIQUE(request_id),
 CONSTRAINT payments_amount_check CHECK(amount BETWEEN 1000 AND 100000000),
 CONSTRAINT payments_dates_check CHECK(end_date>=start_date),
 CONSTRAINT payments_method_check CHECK(method IN ('Tiền mặt','Chuyển khoản')),
 CONSTRAINT payments_status_check CHECK(status='Đã thanh toán'),
 INDEX payments_member_dates(member_id,start_date,end_date),
 INDEX payments_created_idx(created_at)
) ENGINE=InnoDB;
```

### Bảng checkins

```sql
CREATE TABLE checkins (
 id VARCHAR(80) PRIMARY KEY, member_id VARCHAR(80) NOT NULL, date DATE NOT NULL,
 created_at DATETIME(3) NOT NULL, checkout_at DATETIME(3) NULL,
 legacy_closed TINYINT NOT NULL DEFAULT 0,
 open_member_id VARCHAR(80) GENERATED ALWAYS AS (CASE WHEN checkout_at IS NULL AND legacy_closed=0 THEN member_id ELSE NULL END) STORED,
 CONSTRAINT checkins_member_fk FOREIGN KEY(member_id) REFERENCES members(id),
 CONSTRAINT checkins_one_open UNIQUE(open_member_id),
 CONSTRAINT checkins_legacy_check CHECK(legacy_closed IN (0,1)),
 CONSTRAINT checkins_time_check CHECK(checkout_at IS NULL OR checkout_at>=created_at),
 INDEX checkins_date_idx(date)
) ENGINE=InnoDB;
```

### Bảng sessions

```sql
CREATE TABLE sessions (
 id CHAR(64) PRIMARY KEY, account_id VARCHAR(80) NOT NULL,
 csrf CHAR(64) NOT NULL, expires_at DATETIME(3) NOT NULL,
 CONSTRAINT sessions_account_fk FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE,
 INDEX sessions_account_idx(account_id), INDEX sessions_expiry_idx(expires_at)
) ENGINE=InnoDB;
```

### Bảng login_attempts

```sql
CREATE TABLE login_attempts (
 username VARCHAR(32) PRIMARY KEY, attempts INT NOT NULL, reset_at DATETIME(3) NOT NULL,
 CONSTRAINT attempts_check CHECK(attempts>0), INDEX attempts_reset_idx(reset_at)
) ENGINE=InnoDB;
```

### Bảng trainers

```sql
CREATE TABLE trainers (
 id VARCHAR(80) PRIMARY KEY, name VARCHAR(80) NOT NULL, phone VARCHAR(10) NOT NULL,
 email VARCHAR(120) NOT NULL DEFAULT '', specialty VARCHAR(120) NOT NULL,
 experience INT NOT NULL, schedule VARCHAR(200) NOT NULL,
 active TINYINT NOT NULL DEFAULT 1, deleted TINYINT NOT NULL DEFAULT 0,
 CONSTRAINT trainers_phone_unique UNIQUE(phone),
 CONSTRAINT trainers_experience_check CHECK(experience BETWEEN 0 AND 60),
 CONSTRAINT trainers_flags_check CHECK(active IN (0,1) AND deleted IN (0,1))
) ENGINE=InnoDB;
```

### Bảng rooms

```sql
CREATE TABLE rooms (
 id VARCHAR(80) PRIMARY KEY, name VARCHAR(80) NOT NULL, type VARCHAR(40) NOT NULL,
 capacity INT NOT NULL, description VARCHAR(200) NOT NULL DEFAULT '',
 active TINYINT NOT NULL DEFAULT 1, deleted TINYINT NOT NULL DEFAULT 0,
 CONSTRAINT rooms_capacity_check CHECK(capacity BETWEEN 1 AND 1000),
 CONSTRAINT rooms_flags_check CHECK(active IN (0,1) AND deleted IN (0,1))
) ENGINE=InnoDB;
```

### Bảng equipment

```sql
CREATE TABLE equipment (
 id VARCHAR(80) PRIMARY KEY, name VARCHAR(80) NOT NULL, room_id VARCHAR(80) NOT NULL,
 quantity INT NOT NULL, purchased_at DATE NOT NULL, `condition` VARCHAR(30) NOT NULL,
 deleted TINYINT NOT NULL DEFAULT 0,
 CONSTRAINT equipment_room_fk FOREIGN KEY(room_id) REFERENCES rooms(id),
 CONSTRAINT equipment_quantity_check CHECK(quantity BETWEEN 1 AND 10000),
 CONSTRAINT equipment_condition_check CHECK(`condition` IN ('Tốt','Đang sử dụng','Hỏng','Đang bảo trì')),
 CONSTRAINT equipment_deleted_check CHECK(deleted IN (0,1)),
 INDEX equipment_room_idx(room_id)
) ENGINE=InnoDB;
```

### Bảng audit_logs

```sql
CREATE TABLE audit_logs (
 id VARCHAR(80) PRIMARY KEY, actor_id VARCHAR(80) NOT NULL,
 action VARCHAR(50) NOT NULL, entity_id VARCHAR(80) NOT NULL DEFAULT '',
 created_at DATETIME(3) NOT NULL,
 CONSTRAINT audit_actor_fk FOREIGN KEY(actor_id) REFERENCES accounts(id),
 INDEX audit_actor_time_idx(actor_id,created_at)
) ENGINE=InnoDB;
```

## Sao lưu và quyền kết nối

Dùng MySQL Workbench Data Export hoặc mysqldump với tùy chọn -p để nhập mật khẩu tương tác; không ghi mật khẩu trực tiếp vào lệnh. Khôi phục vào database mới và kiểm tra số bản ghi trước khi đổi DB_NAME. File .env và bản xuất dữ liệu thật phải giữ ngoài Git.

Tài khoản khởi tạo cần CREATE database/table. Tài khoản chạy ứng dụng cần SELECT INSERT UPDATE DELETE trên schema; không cần quyền quản trị toàn server. Cấu hình sai mật khẩu trả lỗi kết nối, không có cơ chế tự thay mật khẩu hoặc truy cập database khác.
