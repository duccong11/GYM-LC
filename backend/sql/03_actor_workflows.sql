INSERT IGNORE INTO roles(code,name) VALUES ('MANAGER','Quản lý phòng GYM'),('MEMBER','Hội viên');
CREATE TABLE IF NOT EXISTS registrations (
 id VARCHAR(80) PRIMARY KEY, member_id VARCHAR(80) NOT NULL, plan_id VARCHAR(80) NOT NULL,
 plan_name VARCHAR(60) NOT NULL, price INT NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL,
 status VARCHAR(16) NOT NULL DEFAULT 'PENDING', created_at DATETIME(3) NOT NULL,
 FOREIGN KEY(member_id) REFERENCES members(id), FOREIGN KEY(plan_id) REFERENCES plans(id),
 CHECK(end_date>=start_date), CHECK(status IN ('PENDING','ACTIVE','CANCELLED')),
 INDEX registration_dates(member_id,start_date,end_date)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS schedules (
 id VARCHAR(80) PRIMARY KEY, member_id VARCHAR(80) NOT NULL, trainer_id VARCHAR(80) NOT NULL,
 room_id VARCHAR(80) NOT NULL, date DATE NOT NULL, start_time VARCHAR(5) NOT NULL,
 end_time VARCHAR(5) NOT NULL, note VARCHAR(500) NOT NULL DEFAULT '',
 status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE', created_at DATETIME(3) NOT NULL,
 FOREIGN KEY(member_id) REFERENCES members(id), FOREIGN KEY(trainer_id) REFERENCES trainers(id),
 FOREIGN KEY(room_id) REFERENCES rooms(id), CHECK(status IN ('ACTIVE','CANCELLED')),
 CHECK(end_time>start_time), INDEX schedule_slot(date,start_time,end_time)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS system_settings (
 id INT PRIMARY KEY, gym_name VARCHAR(100) NOT NULL, opening_hours VARCHAR(100) NOT NULL
) ENGINE=InnoDB;
INSERT IGNORE INTO system_settings VALUES(1,'GYM LC','05:00–22:00');
