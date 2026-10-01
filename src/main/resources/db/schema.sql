-- GYM LC Java MVC: schema only, exported from the current MySQL database.
-- Import only into an empty database. Does not include user passwords or records.
SET FOREIGN_KEY_CHECKS=0;
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` varchar(80) NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(32) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(11) NOT NULL,
  `email` varchar(120) NOT NULL DEFAULT '',
  `position` varchar(80) NOT NULL DEFAULT '',
  `role` varchar(16) NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL,
  `member_id` varchar(80) DEFAULT NULL,
  `trainer_id` varchar(80) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_username_unique` (`username`),
  UNIQUE KEY `member_id` (`member_id`),
  UNIQUE KEY `trainer_id` (`trainer_id`),
  KEY `accounts_role_fk` (`role`),
  CONSTRAINT `accounts_member_link_fk` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `accounts_role_fk` FOREIGN KEY (`role`) REFERENCES `roles` (`code`),
  CONSTRAINT `accounts_trainer_link_fk` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`),
  CONSTRAINT `accounts_active_check` CHECK ((`active` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` varchar(80) NOT NULL,
  `actor_id` varchar(80) NOT NULL,
  `action` varchar(50) NOT NULL,
  `entity_id` varchar(80) NOT NULL DEFAULT '',
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_actor_time_idx` (`actor_id`,`created_at`),
  CONSTRAINT `audit_actor_fk` FOREIGN KEY (`actor_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `checkins` (
  `id` varchar(80) NOT NULL,
  `member_id` varchar(80) NOT NULL,
  `date` date NOT NULL,
  `created_at` datetime(3) NOT NULL,
  `checkout_at` datetime(3) DEFAULT NULL,
  `legacy_closed` tinyint NOT NULL DEFAULT '0',
  `open_member_id` varchar(80) GENERATED ALWAYS AS ((case when ((`checkout_at` is null) and (`legacy_closed` = 0)) then `member_id` else NULL end)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `checkins_one_open` (`open_member_id`),
  KEY `checkins_member_fk` (`member_id`),
  KEY `checkins_date_idx` (`date`),
  CONSTRAINT `checkins_member_fk` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `checkins_legacy_check` CHECK ((`legacy_closed` in (0,1))),
  CONSTRAINT `checkins_time_check` CHECK (((`checkout_at` is null) or (`checkout_at` >= `created_at`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `equipment` (
  `id` varchar(80) NOT NULL,
  `name` varchar(80) NOT NULL,
  `room_id` varchar(80) NOT NULL,
  `quantity` int NOT NULL,
  `purchased_at` date NOT NULL,
  `condition` varchar(30) NOT NULL,
  `deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `equipment_room_idx` (`room_id`),
  CONSTRAINT `equipment_room_fk` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `equipment_condition_check` CHECK ((`condition` in (_utf8mb4'Tốt',_utf8mb4'Đang sử dụng',_utf8mb4'Hỏng',_utf8mb4'Đang bảo trì'))),
  CONSTRAINT `equipment_deleted_check` CHECK ((`deleted` in (0,1))),
  CONSTRAINT `equipment_quantity_check` CHECK ((`quantity` between 1 and 10000))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `login_attempts` (
  `username` varchar(100) NOT NULL,
  `attempts` int NOT NULL,
  `reset_at` datetime(3) NOT NULL,
  PRIMARY KEY (`username`),
  KEY `attempts_reset_idx` (`reset_at`),
  CONSTRAINT `attempts_check` CHECK ((`attempts` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `members` (
  `id` varchar(80) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(11) NOT NULL,
  `email` varchar(120) NOT NULL DEFAULT '',
  `gender` varchar(10) NOT NULL DEFAULT 'Khác',
  `birth_date` date DEFAULT NULL,
  `address` varchar(250) NOT NULL DEFAULT '',
  `created_at` datetime(3) NOT NULL,
  `archived` tinyint NOT NULL DEFAULT '0',
  `code` varchar(20) DEFAULT NULL,
  `trainer_id` varchar(80) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `members_phone_unique` (`phone`),
  UNIQUE KEY `code` (`code`),
  KEY `members_created_idx` (`created_at`),
  KEY `members_trainer_fk` (`trainer_id`),
  CONSTRAINT `members_trainer_fk` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`),
  CONSTRAINT `members_archived_check` CHECK ((`archived` in (0,1))),
  CONSTRAINT `members_gender_check` CHECK ((`gender` in (_utf8mb4'Nam',_utf8mb4'Nữ',_utf8mb4'Khác')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `mutation_lock` (
  `id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `payments` (
  `id` varchar(80) NOT NULL,
  `member_id` varchar(80) NOT NULL,
  `plan_id` varchar(80) NOT NULL,
  `plan_name` varchar(100) NOT NULL,
  `amount` int NOT NULL,
  `method` varchar(30) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` datetime(3) NOT NULL,
  `request_id` varchar(80) NOT NULL,
  `requested_start` date DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Đã thanh toán',
  `cancellation_reason` varchar(500) DEFAULT NULL,
  `cancelled` tinyint NOT NULL DEFAULT '0',
  `registration_id` varchar(80) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_request_unique` (`request_id`),
  UNIQUE KEY `code` (`code`),
  KEY `payments_plan_fk` (`plan_id`),
  KEY `payments_member_dates` (`member_id`,`start_date`,`end_date`),
  KEY `payments_created_idx` (`created_at`),
  KEY `payments_registration_fk` (`registration_id`),
  CONSTRAINT `payments_member_fk` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `payments_plan_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `payments_registration_fk` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`),
  CONSTRAINT `payments_amount_check` CHECK ((`amount` between 1 and 100000000)),
  CONSTRAINT `payments_dates_check` CHECK ((`end_date` >= `start_date`)),
  CONSTRAINT `payments_method_check` CHECK ((`method` in (_utf8mb4'Tiền mặt',_utf8mb4'Chuyển khoản'))),
  CONSTRAINT `payments_status_check` CHECK ((`status` = _utf8mb4'Đã thanh toán'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `plans` (
  `id` varchar(80) NOT NULL,
  `name` varchar(100) NOT NULL,
  `days` int NOT NULL,
  `price` int NOT NULL,
  `description` varchar(200) NOT NULL DEFAULT '',
  `active` tinyint NOT NULL DEFAULT '1',
  `deleted` tinyint NOT NULL DEFAULT '0',
  `code` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  CONSTRAINT `plans_days_check` CHECK ((`days` between 1 and 730)),
  CONSTRAINT `plans_flags_check` CHECK (((`active` in (0,1)) and (`deleted` in (0,1)))),
  CONSTRAINT `plans_price_check` CHECK ((`price` between 0 and 100000000))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `promotions` (
  `id` varchar(80) NOT NULL,
  `name` varchar(100) NOT NULL,
  `percent` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  `deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  CONSTRAINT `promotions_chk_1` CHECK ((`percent` between 1 and 100)),
  CONSTRAINT `promotions_chk_2` CHECK ((`end_date` >= `start_date`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `registrations` (
  `id` varchar(80) NOT NULL,
  `member_id` varchar(80) NOT NULL,
  `plan_id` varchar(80) NOT NULL,
  `plan_name` varchar(100) NOT NULL,
  `price` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(16) NOT NULL DEFAULT 'PENDING',
  `created_at` datetime(3) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `original_price` int DEFAULT NULL,
  `discount_percent` int NOT NULL DEFAULT '0',
  `promotion_name` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `plan_id` (`plan_id`),
  KEY `registration_dates` (`member_id`,`start_date`,`end_date`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `registrations_chk_1` CHECK ((`end_date` >= `start_date`)),
  CONSTRAINT `registrations_chk_2` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'ACTIVE',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `roles` (
  `code` varchar(16) NOT NULL,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` varchar(80) NOT NULL,
  `name` varchar(80) NOT NULL,
  `type` varchar(40) NOT NULL,
  `capacity` int NOT NULL,
  `description` varchar(200) NOT NULL DEFAULT '',
  `active` tinyint NOT NULL DEFAULT '1',
  `deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  CONSTRAINT `rooms_capacity_check` CHECK ((`capacity` between 1 and 1000)),
  CONSTRAINT `rooms_flags_check` CHECK (((`active` in (0,1)) and (`deleted` in (0,1))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `schedules` (
  `id` varchar(80) NOT NULL,
  `member_id` varchar(80) NOT NULL,
  `trainer_id` varchar(80) NOT NULL,
  `room_id` varchar(80) NOT NULL,
  `date` date NOT NULL,
  `start_time` varchar(5) NOT NULL,
  `end_time` varchar(5) NOT NULL,
  `note` varchar(500) NOT NULL DEFAULT '',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `service_id` varchar(80) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `member_id` (`member_id`),
  KEY `trainer_id` (`trainer_id`),
  KEY `room_id` (`room_id`),
  KEY `schedule_slot` (`date`,`start_time`,`end_time`),
  KEY `schedules_service_fk` (`service_id`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`),
  CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `schedules_service_fk` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  CONSTRAINT `schedules_chk_1` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'CANCELLED'))),
  CONSTRAINT `schedules_chk_2` CHECK ((`end_time` > `start_time`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `services` (
  `id` varchar(80) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) NOT NULL DEFAULT '',
  `active` tinyint NOT NULL DEFAULT '1',
  `deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  CONSTRAINT `services_chk_1` CHECK ((`active` in (0,1))),
  CONSTRAINT `services_chk_2` CHECK ((`deleted` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` char(64) NOT NULL,
  `account_id` varchar(80) NOT NULL,
  `csrf` char(64) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_account_idx` (`account_id`),
  KEY `sessions_expiry_idx` (`expires_at`),
  CONSTRAINT `sessions_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` int NOT NULL,
  `gym_name` varchar(100) NOT NULL,
  `opening_hours` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `trainer_services` (
  `trainer_id` varchar(80) NOT NULL,
  `service_id` varchar(80) NOT NULL,
  PRIMARY KEY (`trainer_id`,`service_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `trainer_services_ibfk_1` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`),
  CONSTRAINT `trainer_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `trainers` (
  `id` varchar(80) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(11) NOT NULL,
  `email` varchar(120) NOT NULL DEFAULT '',
  `specialty` varchar(120) NOT NULL,
  `experience` int NOT NULL,
  `schedule` varchar(200) NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  `deleted` tinyint NOT NULL DEFAULT '0',
  `code` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trainers_phone_unique` (`phone`),
  UNIQUE KEY `code` (`code`),
  CONSTRAINT `trainers_experience_check` CHECK ((`experience` between 0 and 60)),
  CONSTRAINT `trainers_flags_check` CHECK (((`active` in (0,1)) and (`deleted` in (0,1))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS=1;
