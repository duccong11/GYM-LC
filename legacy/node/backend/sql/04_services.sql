CREATE TABLE IF NOT EXISTS services (
 id VARCHAR(80) PRIMARY KEY,
 name VARCHAR(100) NOT NULL UNIQUE,
 description VARCHAR(500) NOT NULL DEFAULT '',
 active TINYINT NOT NULL DEFAULT 1,
 deleted TINYINT NOT NULL DEFAULT 0,
 CHECK(active IN (0,1)), CHECK(deleted IN (0,1))
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS trainer_services (
 trainer_id VARCHAR(80) NOT NULL,
 service_id VARCHAR(80) NOT NULL,
 PRIMARY KEY(trainer_id,service_id),
 FOREIGN KEY(trainer_id) REFERENCES trainers(id),
 FOREIGN KEY(service_id) REFERENCES services(id)
) ENGINE=InnoDB;
