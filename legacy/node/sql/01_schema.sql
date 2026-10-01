-- MySQL 8.0.16+ / InnoDB / utf8mb4. Run inside the selected database.
-- Never drops existing tables. Initial schema; future changes need numbered migrations.
CREATE TABLE IF NOT EXISTS roles (
 code VARCHAR(16) PRIMARY KEY, name VARCHAR(80) NOT NULL
) ENGINE=InnoDB;
INSERT IGNORE INTO roles(code,name) VALUES ('ADMIN','Quản trị viên'),('STAFF','Nhân viên'),('TRAINER','Huấn luyện viên');
CREATE TABLE IF NOT EXISTS mutation_lock(id INT PRIMARY KEY) ENGINE=InnoDB;
INSERT IGNORE INTO mutation_lock VALUES(1);
CREATE TABLE IF NOT EXISTS accounts(
 id VARCHAR(80) PRIMARY KEY, name VARCHAR(80) NOT NULL,
 username VARCHAR(32) NOT NULL, password_hash VARCHAR(255) NOT NULL,
 phone VARCHAR(10) NOT NULL DEFAULT '', email VARCHAR(120) NOT NULL DEFAULT '',
 position VARCHAR(80) NOT NULL DEFAULT '', role VARCHAR(16) NOT NULL,
 active TINYINT NOT NULL DEFAULT 1, created_at DATETIME(3) NOT NULL,
 CONSTRAINT accounts_username_unique UNIQUE(username),
 CONSTRAINT accounts_role_fk FOREIGN KEY(role) REFERENCES roles(code),
 CONSTRAINT accounts_active_check CHECK(active IN (0,1))
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS members(
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
CREATE TABLE IF NOT EXISTS plans(
 id VARCHAR(80) PRIMARY KEY, name VARCHAR(60) NOT NULL, days INT NOT NULL,
 price INT NOT NULL, description VARCHAR(200) NOT NULL DEFAULT '',
 active TINYINT NOT NULL DEFAULT 1, deleted TINYINT NOT NULL DEFAULT 0,
 CONSTRAINT plans_days_check CHECK(days BETWEEN 1 AND 730),
 CONSTRAINT plans_price_check CHECK(price BETWEEN 1000 AND 100000000),
 CONSTRAINT plans_flags_check CHECK(active IN (0,1) AND deleted IN (0,1))
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS payments(
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
CREATE TABLE IF NOT EXISTS checkins(
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
CREATE TABLE IF NOT EXISTS sessions(
 id CHAR(64) PRIMARY KEY, account_id VARCHAR(80) NOT NULL,
 csrf CHAR(64) NOT NULL, expires_at DATETIME(3) NOT NULL,
 CONSTRAINT sessions_account_fk FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE,
 INDEX sessions_account_idx(account_id), INDEX sessions_expiry_idx(expires_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS login_attempts(
 username VARCHAR(32) PRIMARY KEY, attempts INT NOT NULL, reset_at DATETIME(3) NOT NULL,
 CONSTRAINT attempts_check CHECK(attempts>0), INDEX attempts_reset_idx(reset_at)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS trainers(
 id VARCHAR(80) PRIMARY KEY, name VARCHAR(80) NOT NULL, phone VARCHAR(10) NOT NULL,
 email VARCHAR(120) NOT NULL DEFAULT '', specialty VARCHAR(120) NOT NULL,
 experience INT NOT NULL, schedule VARCHAR(200) NOT NULL,
 active TINYINT NOT NULL DEFAULT 1, deleted TINYINT NOT NULL DEFAULT 0,
 CONSTRAINT trainers_phone_unique UNIQUE(phone),
 CONSTRAINT trainers_experience_check CHECK(experience BETWEEN 0 AND 60),
 CONSTRAINT trainers_flags_check CHECK(active IN (0,1) AND deleted IN (0,1))
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS rooms(
 id VARCHAR(80) PRIMARY KEY, name VARCHAR(80) NOT NULL, type VARCHAR(40) NOT NULL,
 capacity INT NOT NULL, description VARCHAR(200) NOT NULL DEFAULT '',
 active TINYINT NOT NULL DEFAULT 1, deleted TINYINT NOT NULL DEFAULT 0,
 CONSTRAINT rooms_capacity_check CHECK(capacity BETWEEN 1 AND 1000),
 CONSTRAINT rooms_flags_check CHECK(active IN (0,1) AND deleted IN (0,1))
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS equipment(
 id VARCHAR(80) PRIMARY KEY, name VARCHAR(80) NOT NULL, room_id VARCHAR(80) NOT NULL,
 quantity INT NOT NULL, purchased_at DATE NOT NULL, `condition` VARCHAR(30) NOT NULL,
 deleted TINYINT NOT NULL DEFAULT 0,
 CONSTRAINT equipment_room_fk FOREIGN KEY(room_id) REFERENCES rooms(id),
 CONSTRAINT equipment_quantity_check CHECK(quantity BETWEEN 1 AND 10000),
 CONSTRAINT equipment_condition_check CHECK(`condition` IN ('Tốt','Đang sử dụng','Hỏng','Đang bảo trì')),
 CONSTRAINT equipment_deleted_check CHECK(deleted IN (0,1)),
 INDEX equipment_room_idx(room_id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS audit_logs(
 id VARCHAR(80) PRIMARY KEY, actor_id VARCHAR(80) NOT NULL,
 action VARCHAR(50) NOT NULL, entity_id VARCHAR(80) NOT NULL DEFAULT '',
 created_at DATETIME(3) NOT NULL,
 CONSTRAINT audit_actor_fk FOREIGN KEY(actor_id) REFERENCES accounts(id),
 INDEX audit_actor_time_idx(actor_id,created_at)
) ENGINE=InnoDB;
