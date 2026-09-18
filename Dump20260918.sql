-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: quan_ly_phong_gym
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES ('1f0baf75-342d-4e6b-8fea-fd52ebdcde5e','cong culi','cong','pbkdf2:100000:dec0f0bfaf66a15a13cc16fa1a260defc1c2b158a0b1c3c6ab319d528a8c4fc4:2d09f772117024951f14c66b5535b0f96cd91fe38572d23407c039e5fed5e4e8','0987654321','cong@gmail.com','tay sai so 1','STAFF',1,'2026-09-11 00:40:45.831',NULL,NULL),('demo-v2-coach-user-0','Nguyễn Mạnh Hùng','coach1','pbkdf2:100000:a1fffea0f3acdac301109f1d7f762a8099d8067f45f666ad892beca6bb1dbd9e:53d7b166a3c3b1bcbd9931c2a46d28a83ac49c7c7d03818c09109e6c0cf3f1b7','0922000000','coach0@example.com','Huấn luyện viên','TRAINER',1,'2026-09-10 08:28:56.319',NULL,NULL),('demo-v2-coach-user-1','Trần Thùy Dung','coach2','pbkdf2:100000:94f0ae5c17cd1c4a20bb585202dbd44c5bff0d692df2ab1abd0c3e120c7e3383:f27a7ed1de567fa497f8e6926d1f008681c5f73b58cf118fc8874df0a559f7e9','0922000001','coach1@example.com','Huấn luyện viên','TRAINER',1,'2026-09-10 08:28:56.319',NULL,NULL),('demo-v2-coach-user-2','Phạm Gia Huy','coach3','pbkdf2:100000:2dd57dbf11445ae1383c0259b2e73cb7fb31e090526beb7440313176c57401f1:dc1c0c8d11014260263ee449b90d2e8a263a40c431bc8a5d476d383d54871e1c','0922000002','coach2@example.com','Huấn luyện viên','TRAINER',1,'2026-09-10 08:28:56.319',NULL,NULL),('demo-v2-coach-user-3','Võ Thanh Trúc','coach4','pbkdf2:100000:9ac7719973cbd2d0c24dcc5d3e4e2b3f46e7c661c0fec0be356c22ace97a3ba4:8fe066c317ee0c9ca39768701f9357feb15ab9199afdbde46dc0187958f5227c','0922000003','coach3@example.com','Huấn luyện viên','TRAINER',1,'2026-09-10 08:28:56.319',NULL,NULL),('demo-v2-coach-user-4','Lê Tuấn Anh','coach5','pbkdf2:100000:c5bf42f15aba1c14114955bc9b3ebe0e6fe8aa6e93c632ce6f32131253706244:ec7761fd1e7406e05e6e4eccfe05b2769bf36b62198d7c6afcbd638f6b0a4f61','0922000004','coach4@example.com','Huấn luyện viên','TRAINER',0,'2026-09-10 08:28:56.319',NULL,NULL),('demo-v2-user-0','Quản trị GYM','admin','pbkdf2:100000:42e5371a237a4b4eaf817039dafc8e42dadc4a945189d9c7e8b17217b67020a3:0adc3719284b2e74a0f0840deaac652ab543f88cc2d0e79c35d836996d081cd6','0911000000','admin@example.com','Quản lý','ADMIN',1,'2026-09-10 08:28:56.319',NULL,NULL),('demo-v2-user-1','Nguyễn Hồng Nhung','staff1','pbkdf2:100000:80ab4aa3e720636f99a36918d6b87e4d6059be919c08891a7a69655c4c1eabe7:eea86deead87301c54196d15b7e75a308e13d686c03447854f7315e115eea174','0911000001','staff1@example.com','Lễ tân','STAFF',1,'2026-09-10 08:28:56.319',NULL,NULL),('demo-v2-user-2','Trần Quốc Bảo','staff2','pbkdf2:100000:2166a60b207d06a4a1a3f0961070c0e81e2980eac3ce53e4624f5a1a099ee267:2a205ff834ec5a30a6f81e97252ad6f868cdca1ade73c879ffada958a5392e7f','0911000002','staff2@example.com','Lễ tân','STAFF',1,'2026-09-10 08:28:56.319',NULL,NULL),('demo-v2-user-3','Lê Ngọc Mai','staff3','pbkdf2:100000:9096e8dc6a95145397f8135f246e346e3aca9d00c10e3bf1e37744cf16625abd:c21bbf1bc5a440880f41edee2db79f7522f683a1aac1d53e89438385a93ff897','0911000003','staff3@example.com','Lễ tân','STAFF',1,'2026-09-10 08:28:56.319',NULL,NULL),('demo-v2-user-4','Võ Minh Long','staff4','pbkdf2:100000:2f9cfdc36afff6f65dcf053debfc87d5d723b5977ca368764a74d8da61940ee1:a51d32d1f74face163af1f074fce572849c06ffb22ff3207a0c66d0a5070eaa3','0911000004','staff4@example.com','Lễ tân','STAFF',1,'2026-09-10 08:28:56.319',NULL,NULL);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(80) NOT NULL,
  `actor_id` varchar(80) NOT NULL,
  `action` varchar(50) NOT NULL,
  `entity_id` varchar(80) NOT NULL DEFAULT '',
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_actor_time_idx` (`actor_id`,`created_at`),
  CONSTRAINT `audit_actor_fk` FOREIGN KEY (`actor_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES ('122bbd58-9d3c-4102-92f2-d6a62357ef81','demo-v2-user-0','user.save','1f0baf75-342d-4e6b-8fea-fd52ebdcde5e','2026-09-11 00:40:45.892'),('12dc54cf-df9b-43b0-a65a-81c094fefe66','demo-v2-user-0','payment.create','62c4953e-91a3-4ad5-b6a7-713bcc5f0f1a','2026-09-11 00:37:09.595'),('378ed682-b1af-48ea-a8c4-b569f0671752','demo-v2-user-0','room.save','92f2b5aa-e6e9-4ffd-8a23-4be1af38c841','2026-09-11 00:41:32.038'),('3ace710b-75e9-47f3-a0f2-8f21d2bc6ac8','demo-v2-user-0','trainer.save','feb15acd-838d-4c97-a1da-e884bced381f','2026-09-11 00:39:06.380'),('3f7c279f-bca3-431a-a281-9eea086b2006','demo-v2-user-0','equipment.save','9315e3ef-8b74-46bb-b06a-720b0a16656b','2026-09-11 00:42:22.437'),('5aca7510-6e1c-46e5-b5ba-4f0afcbf2f64','demo-v2-user-0','checkin.create','f2511ac9-e247-43c0-ab91-76ccf56d0723','2026-09-11 00:37:44.329'),('63cadb4c-8aac-47c9-a793-7b1c290f773c','demo-v2-user-0','plan.toggle','demo-v2-plan-06','2026-09-11 00:33:46.527'),('98832f8d-04f0-4836-8e17-9e672d9bf4b5','demo-v2-user-0','member.save','329b85cb-58e5-4bb9-a715-15c1a3d3c033','2026-09-11 00:35:45.707');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkins`
--

DROP TABLE IF EXISTS `checkins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checkins` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkins`
--

LOCK TABLES `checkins` WRITE;
/*!40000 ALTER TABLE `checkins` DISABLE KEYS */;
INSERT INTO `checkins` (`id`, `member_id`, `date`, `created_at`, `checkout_at`, `legacy_closed`) VALUES ('7d4c04d4-24d4-4d9f-b02a-c8165dfee041','7ec07697-8b77-4163-b6fc-de0b297e974f','2026-09-08','2026-09-08 16:45:56.729',NULL,1),('demo-v2-checkin-2','demo-v2-member-2','2026-09-09','2026-09-09 02:00:00.000','2026-09-09 03:00:00.000',0),('demo-v2-checkin-3','demo-v2-member-3','2026-09-09','2026-09-09 02:00:00.000','2026-09-09 03:00:00.000',0),('demo-v2-checkin-4','demo-v2-member-4','2026-09-09','2026-09-09 02:00:00.000','2026-09-09 03:00:00.000',0),('demo-v2-checkin-5','demo-v2-member-5','2026-09-09','2026-09-09 02:00:00.000','2026-09-09 03:00:00.000',0),('demo-v2-checkin-6','demo-v2-member-6','2026-09-09','2026-09-09 02:00:00.000','2026-09-09 03:00:00.000',0),('demo-v2-checkin-7','demo-v2-member-7','2026-09-09','2026-09-09 02:00:00.000','2026-09-09 03:00:00.000',0),('f2511ac9-e247-43c0-ab91-76ccf56d0723','sample-member-0','2026-09-11','2026-09-11 00:37:44.319',NULL,0),('sample-checkin-0-0','sample-member-0','2026-09-08','2026-09-08 01:30:00.000',NULL,1),('sample-checkin-0-1','sample-member-0','2026-09-07','2026-09-07 01:30:00.000',NULL,1),('sample-checkin-1-0','sample-member-1','2026-09-08','2026-09-08 02:30:00.000',NULL,1),('sample-checkin-1-1','sample-member-1','2026-09-07','2026-09-07 02:30:00.000',NULL,1),('sample-checkin-1-2','sample-member-1','2026-09-06','2026-09-06 02:30:00.000',NULL,1),('sample-checkin-2-0','sample-member-2','2026-09-08','2026-09-08 03:30:00.000',NULL,1),('sample-checkin-2-1','sample-member-2','2026-09-07','2026-09-07 03:30:00.000',NULL,1),('sample-checkin-2-2','sample-member-2','2026-09-06','2026-09-06 03:30:00.000',NULL,1),('sample-checkin-2-3','sample-member-2','2026-09-05','2026-09-05 03:30:00.000',NULL,1),('sample-checkin-3-0','sample-member-3','2026-09-08','2026-09-08 04:30:00.000',NULL,1),('sample-checkin-3-1','sample-member-3','2026-09-07','2026-09-07 04:30:00.000',NULL,1),('sample-checkin-3-2','sample-member-3','2026-09-06','2026-09-06 04:30:00.000',NULL,1),('sample-checkin-3-3','sample-member-3','2026-09-05','2026-09-05 04:30:00.000',NULL,1),('sample-checkin-3-4','sample-member-3','2026-09-04','2026-09-04 04:30:00.000',NULL,1);
/*!40000 ALTER TABLE `checkins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment`
--

DROP TABLE IF EXISTS `equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment`
--

LOCK TABLES `equipment` WRITE;
/*!40000 ALTER TABLE `equipment` DISABLE KEYS */;
INSERT INTO `equipment` VALUES ('9315e3ef-8b74-46bb-b06a-720b0a16656b','long dam nhau','92f2b5aa-e6e9-4ffd-8a23-4be1af38c841',1,'2026-06-08','Tốt',0),('demo-v2-equipment-0','Máy chạy bộ','demo-v2-room-0',1,'2026-07-12','Tốt',0),('demo-v2-equipment-1','Xe đạp tập','demo-v2-room-1',2,'2026-07-11','Đang sử dụng',0),('demo-v2-equipment-2','Tạ đơn','demo-v2-room-2',3,'2026-07-10','Hỏng',0),('demo-v2-equipment-3','Ghế đẩy ngực','demo-v2-room-3',4,'2026-07-09','Đang bảo trì',0),('demo-v2-equipment-4','Thảm yoga','demo-v2-room-0',5,'2026-07-08','Tốt',0),('demo-v2-equipment-5','Bóng tập','demo-v2-room-1',6,'2026-07-07','Đang sử dụng',0),('demo-v2-equipment-6','Bao cát','demo-v2-room-2',7,'2026-07-06','Hỏng',0),('demo-v2-equipment-7','Găng boxing','demo-v2-room-3',8,'2026-07-05','Đang bảo trì',0),('demo-v2-equipment-8','Dây nhảy','demo-v2-room-0',9,'2026-07-04','Tốt',0),('demo-v2-equipment-9','Máy kéo xô','demo-v2-room-1',10,'2026-07-03','Đang sử dụng',0);
/*!40000 ALTER TABLE `equipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_attempts` (
  `username` varchar(100) NOT NULL,
  `attempts` int NOT NULL,
  `reset_at` datetime(3) NOT NULL,
  PRIMARY KEY (`username`),
  KEY `attempts_reset_idx` (`reset_at`),
  CONSTRAINT `attempts_check` CHECK ((`attempts` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
INSERT INTO `login_attempts` VALUES ('cong@gmail.com',2,'2026-09-11 00:57:38.254'),('staff1 đến staff4',1,'2026-09-11 00:58:10.557');
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `members_phone_unique` (`phone`),
  UNIQUE KEY `code` (`code`),
  KEY `members_created_idx` (`created_at`),
  CONSTRAINT `members_archived_check` CHECK ((`archived` in (0,1))),
  CONSTRAINT `members_gender_check` CHECK ((`gender` in (_utf8mb4'Nam',_utf8mb4'Nữ',_utf8mb4'Khác')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES ('329b85cb-58e5-4bb9-a715-15c1a3d3c033','bao long l','0987654321','blong1211@gmail.com','Nam','2005-12-11','thai binh','2026-09-11 00:35:45.700',0,'HV8974AF2D357925D6'),('7ec07697-8b77-4163-b6fc-de0b297e974f','Hội viên kiểm thử 85956242','0985956242','qa@example.com','Khác',NULL,'','2026-09-08 16:45:56.328',1,'HVA9477F11A0D096E0'),('demo-v2-member-0','Nguyễn Bảo An','0933000000','member0@example.com','Nữ','2000-01-01','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HVB17C790C5E5DBD4C'),('demo-v2-member-1','Trần Minh Châu','0933000001','member1@example.com','Nam','2000-01-02','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HVEDA0304433BE2BF9'),('demo-v2-member-10','Dương Đức Long','0933000010','member10@example.com','Nữ','2000-01-11','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HV0C7B45EA259F69C4'),('demo-v2-member-11','Lý Ngọc Diệp','0933000011','member11@example.com','Nam','2000-01-12','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HV8617F197277C1E47'),('demo-v2-member-12','Mai Tuấn Kiệt','0933000012','member12@example.com','Nữ','2000-01-13','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HV0D2E0D22A5CAF14D'),('demo-v2-member-13','Cao Thùy Trang','0933000013','member13@example.com','Nam','2000-01-14','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HV8260361C13D0D7C7'),('demo-v2-member-14','Vũ Hải Nam','0933000014','member14@example.com','Nữ','2000-01-15','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HV733DA6B85441DBDC'),('demo-v2-member-2','Lê Hoàng Duy','0933000002','member2@example.com','Nữ','2000-01-03','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HVEF1838E1B6064631'),('demo-v2-member-3','Phạm Ngọc Hân','0933000003','member3@example.com','Nam','2000-01-04','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HV314DD258B14B5714'),('demo-v2-member-4','Võ Khánh Linh','0933000004','member4@example.com','Nữ','2000-01-05','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HVB198EA0E5E8733B3'),('demo-v2-member-5','Đặng Gia Minh','0933000005','member5@example.com','Nam','2000-01-06','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HV100BDFB932701957'),('demo-v2-member-6','Bùi Thanh Phong','0933000006','member6@example.com','Nữ','2000-01-07','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HV67DD0B175D267363'),('demo-v2-member-7','Đỗ Quỳnh Anh','0933000007','member7@example.com','Nam','2000-01-08','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HV4E2DE068E687CD45'),('demo-v2-member-8','Hồ Quốc Huy','0933000008','member8@example.com','Nữ','2000-01-09','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HV80257A5A289A83C2'),('demo-v2-member-9','Ngô Phương Thảo','0933000009','member9@example.com','Nam','2000-01-10','Hồ sơ mẫu kiểm thử','2026-08-21 02:00:00.000',0,'HV5EE550FE93298CA3'),('sample-member-0','Nguyễn Minh Anh','0900000000','','Nữ',NULL,'','2026-09-08 03:00:00.000',0,'HV6D57669472CC36BA'),('sample-member-1','Trần Hoàng Nam','0900000001','','Nam',NULL,'','2026-09-05 03:00:00.000',0,'HV88ED279CC42AB813'),('sample-member-2','Lê Thảo Vy','0900000002','','Nữ',NULL,'','2026-09-02 03:00:00.000',0,'HV198B544409FE0F9A'),('sample-member-3','Phạm Đức Huy','0900000003','','Nam',NULL,'','2026-08-30 03:00:00.000',0,'HVDBB2193C759292FA'),('sample-member-4','Võ Ngọc Linh','0900000004','','Nữ',NULL,'','2026-08-27 03:00:00.000',0,'HV7D8C25A41560665F'),('sample-member-5','Đặng Tuấn Kiệt','0900000005','','Nam',NULL,'','2026-08-24 03:00:00.000',0,'HV68B778BB03DDF8A3'),('sample-member-6','Bùi Thanh Hà','0900000006','','Nữ',NULL,'','2026-08-21 03:00:00.000',0,'HV6C3E600FADD13AC0'),('sample-member-7','Đỗ Hải Đăng','0900000007','','Nam',NULL,'','2026-08-18 03:00:00.000',0,'HVB64FB2C99CF9220E');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mutation_lock`
--

DROP TABLE IF EXISTS `mutation_lock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mutation_lock` (
  `id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mutation_lock`
--

LOCK TABLES `mutation_lock` WRITE;
/*!40000 ALTER TABLE `mutation_lock` DISABLE KEYS */;
INSERT INTO `mutation_lock` VALUES (1);
/*!40000 ALTER TABLE `mutation_lock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES ('0d48a4b5-5d61-4d2a-93e8-186b59781a25','7ec07697-8b77-4163-b6fc-de0b297e974f','a939af8f-93d2-4ad8-9274-10394e1f31f9','Gói kiểm thử 85956242',350000,'Tiền mặt','2026-09-08','2026-10-07','2026-09-08 16:45:56.531','ec7abd5b-9743-4c0e-a956-098d02d92aa2',NULL,'Đã thanh toán',NULL,0,'0d48a4b5-5d61-4d2a-93e8-186b59781a25','TTD164D9DFAAEB9F63'),('1812666b-5e0c-4553-9fe3-d2b16430e3ce','7ec07697-8b77-4163-b6fc-de0b297e974f','a939af8f-93d2-4ad8-9274-10394e1f31f9','Gói kiểm thử 85956242',350000,'Chuyển khoản','2026-10-08','2026-11-06','2026-09-08 16:45:56.839','6252e320-0b5e-4684-98e2-366d3654fab6',NULL,'Đã thanh toán',NULL,0,'1812666b-5e0c-4553-9fe3-d2b16430e3ce','TT64511BF6A83F383D'),('62c4953e-91a3-4ad5-b6a7-713bcc5f0f1a','329b85cb-58e5-4bb9-a715-15c1a3d3c033','sample-pro','GYM Premium',1600000,'Tiền mặt','2026-11-09','2027-05-07','2026-09-11 00:37:09.576','e3181912-2f90-4cea-913b-0827169b372c','2026-11-09','Đã thanh toán',NULL,0,'62c4953e-91a3-4ad5-b6a7-713bcc5f0f1a','TT15AB942D45949A2B'),('demo-v2-payment-0','demo-v2-member-0','demo-v2-plan-01','Gói 1 tháng',350000,'Chuyển khoản','2026-08-09','2026-09-07','2026-09-07 03:00:00.000','demo-v2-request-0','2026-08-09','Đã thanh toán',NULL,0,'demo-v2-payment-0','TTB18DF4DC86187094'),('demo-v2-payment-1','demo-v2-member-1','demo-v2-plan-03','Gói 3 tháng',900000,'Tiền mặt','2026-06-10','2026-09-07','2026-09-07 03:00:00.000','demo-v2-request-1','2026-06-10','Đã thanh toán',NULL,0,'demo-v2-payment-1','TT4952084F0DD92A6F'),('demo-v2-payment-10','demo-v2-member-10','demo-v2-plan-06','Gói 6 tháng',1600000,'Chuyển khoản','2026-09-05','2027-03-03','2026-09-07 03:00:00.000','demo-v2-request-10','2026-09-05','Đã thanh toán',NULL,0,'demo-v2-payment-10','TT03327A4C190B241B'),('demo-v2-payment-11','demo-v2-member-11','demo-v2-plan-12','Gói 12 tháng',3000000,'Tiền mặt','2025-09-11','2026-09-10','2026-09-07 03:00:00.000','demo-v2-request-11','2025-09-11','Đã thanh toán',NULL,0,'demo-v2-payment-11','TTC93CEDA1B14A753A'),('demo-v2-payment-12','demo-v2-member-12','demo-v2-plan-01','Gói 1 tháng',350000,'Chuyển khoản','2026-09-12','2026-10-11','2026-09-07 03:00:00.000','demo-v2-request-12','2026-09-12','Đã thanh toán',NULL,0,'demo-v2-payment-12','TTA83F674A98D0D990'),('demo-v2-payment-2','demo-v2-member-2','demo-v2-plan-06','Gói 6 tháng',1600000,'Chuyển khoản','2026-09-05','2027-03-03','2026-09-07 03:00:00.000','demo-v2-request-2','2026-09-05','Đã thanh toán',NULL,0,'demo-v2-payment-2','TTAEEED51F450E9B1A'),('demo-v2-payment-3','demo-v2-member-3','demo-v2-plan-12','Gói 12 tháng',3000000,'Tiền mặt','2026-09-05','2027-09-04','2026-09-07 03:00:00.000','demo-v2-request-3','2026-09-05','Đã thanh toán',NULL,0,'demo-v2-payment-3','TT7D82AFB06E8F5C34'),('demo-v2-payment-4','demo-v2-member-4','demo-v2-plan-01','Gói 1 tháng',350000,'Chuyển khoản','2026-09-05','2026-10-04','2026-09-07 03:00:00.000','demo-v2-request-4','2026-09-05','Đã thanh toán',NULL,0,'demo-v2-payment-4','TT5DB79CD58B8D04DB'),('demo-v2-payment-5','demo-v2-member-5','demo-v2-plan-03','Gói 3 tháng',900000,'Tiền mặt','2026-09-05','2026-12-03','2026-09-07 03:00:00.000','demo-v2-request-5','2026-09-05','Đã thanh toán',NULL,0,'demo-v2-payment-5','TT97F6FE792CEF7AD9'),('demo-v2-payment-6','demo-v2-member-6','demo-v2-plan-06','Gói 6 tháng',1600000,'Chuyển khoản','2026-09-05','2027-03-03','2026-09-07 03:00:00.000','demo-v2-request-6','2026-09-05','Đã thanh toán',NULL,0,'demo-v2-payment-6','TTFF41E5D191FE627D'),('demo-v2-payment-7','demo-v2-member-7','demo-v2-plan-12','Gói 12 tháng',3000000,'Tiền mặt','2026-09-05','2027-09-04','2026-09-07 03:00:00.000','demo-v2-request-7','2026-09-05','Đã thanh toán',NULL,0,'demo-v2-payment-7','TTF36BD4DCC56623FD'),('demo-v2-payment-8','demo-v2-member-8','demo-v2-plan-01','Gói 1 tháng',350000,'Chuyển khoản','2026-09-05','2026-10-04','2026-09-07 03:00:00.000','demo-v2-request-8','2026-09-05','Đã thanh toán',NULL,0,'demo-v2-payment-8','TTAEDB395ED07AD3BC'),('demo-v2-payment-9','demo-v2-member-9','demo-v2-plan-03','Gói 3 tháng',900000,'Tiền mặt','2026-09-05','2026-12-03','2026-09-07 03:00:00.000','demo-v2-request-9','2026-09-05','Đã thanh toán',NULL,0,'demo-v2-payment-9','TT91B9E6F26F01E993'),('sample-payment-0','sample-member-0','sample-basic','GYM Cơ bản',350000,'Chuyển khoản','2026-08-30','2026-09-28','2026-09-08 03:00:00.000','sample-request-0',NULL,'Đã thanh toán',NULL,0,'sample-payment-0','TT49A3DC429847309A'),('sample-payment-1','sample-member-1','sample-plus','GYM Plus',900000,'Tiền mặt','2026-07-08','2026-10-05','2026-09-05 03:00:00.000','sample-request-1',NULL,'Đã thanh toán',NULL,0,'sample-payment-1','TT5DBE00AD9EB71E35'),('sample-payment-2','sample-member-2','sample-pro','GYM Premium',1600000,'Chuyển khoản','2026-04-16','2026-10-12','2026-09-02 03:00:00.000','sample-request-2',NULL,'Đã thanh toán',NULL,0,'sample-payment-2','TT5CEB091844ABAFE9'),('sample-payment-3','sample-member-3','sample-basic','GYM Cơ bản',350000,'Tiền mặt','2026-09-20','2026-10-19','2026-08-30 03:00:00.000','sample-request-3',NULL,'Đã thanh toán',NULL,0,'sample-payment-3','TT9000ABA25A96FC35'),('sample-payment-4','sample-member-4','sample-plus','GYM Plus',900000,'Chuyển khoản','2026-06-15','2026-09-12','2026-08-27 03:00:00.000','sample-request-4',NULL,'Đã thanh toán',NULL,0,'sample-payment-4','TTC0FEF0568AC2D5B0'),('sample-payment-5','sample-member-5','sample-pro','GYM Premium',1600000,'Tiền mặt','2026-05-07','2026-11-02','2026-08-24 03:00:00.000','sample-request-5',NULL,'Đã thanh toán',NULL,0,'sample-payment-5','TTB2F11046B0520C6F'),('sample-payment-6','sample-member-6','sample-basic','GYM Cơ bản',350000,'Chuyển khoản','2026-08-07','2026-09-05','2026-08-21 03:00:00.000','sample-request-6',NULL,'Đã thanh toán',NULL,0,'sample-payment-6','TT0D429353C33C2AA9');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES ('a939af8f-93d2-4ad8-9274-10394e1f31f9','Gói đã sửa',60,500000,'',0,0,'GT00DE4981FAE9D3A5'),('demo-v2-plan-01','Gói 1 tháng',30,350000,'Dữ liệu mẫu kiểm thử · Tập tự do',1,0,'GT83BD9B3818B00370'),('demo-v2-plan-03','Gói 3 tháng',90,900000,'Dữ liệu mẫu kiểm thử · Tập tự do',1,0,'GT6AD2D0D2920FBB8B'),('demo-v2-plan-06','Gói 6 tháng',180,1600000,'Dữ liệu mẫu kiểm thử · Tập tự do',0,0,'GT476BF142FC4AFEDB'),('demo-v2-plan-12','Gói 12 tháng',365,3000000,'Dữ liệu mẫu kiểm thử · Tập tự do',1,0,'GT3A38432D96677B3E'),('demo-v2-plan-day','Gói trải nghiệm',1,50000,'Dữ liệu mẫu kiểm thử · Tập tự do',1,0,'GTCDDF92B245D2910F'),('sample-basic','GYM Cơ bản',30,350000,'Tập tự do · Toàn bộ khu vực gym',1,0,'GTC02533E41E7E5688'),('sample-plus','GYM Plus',90,900000,'Tập tự do · Tư vấn lịch tập',1,0,'GT0A84D1E3332B3A37'),('sample-pro','GYM Premium',180,1600000,'Tập tự do · Đánh giá thể lực định kỳ',1,0,'GT5BB3BFEB5696A42B');
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `plan_id` (`plan_id`),
  KEY `registration_dates` (`member_id`,`start_date`,`end_date`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`),
  CONSTRAINT `registrations_chk_1` CHECK ((`end_date` >= `start_date`)),
  CONSTRAINT `registrations_chk_2` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'ACTIVE',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES ('0d48a4b5-5d61-4d2a-93e8-186b59781a25','7ec07697-8b77-4163-b6fc-de0b297e974f','a939af8f-93d2-4ad8-9274-10394e1f31f9','Gói kiểm thử 85956242',350000,'2026-09-08','2026-10-07','ACTIVE','2026-09-08 16:45:56.531','DKD164D9DFAAEB9F63'),('1812666b-5e0c-4553-9fe3-d2b16430e3ce','7ec07697-8b77-4163-b6fc-de0b297e974f','a939af8f-93d2-4ad8-9274-10394e1f31f9','Gói kiểm thử 85956242',350000,'2026-10-08','2026-11-06','ACTIVE','2026-09-08 16:45:56.839','DK64511BF6A83F383D'),('62c4953e-91a3-4ad5-b6a7-713bcc5f0f1a','329b85cb-58e5-4bb9-a715-15c1a3d3c033','sample-pro','GYM Premium',1600000,'2026-11-09','2027-05-07','ACTIVE','2026-09-11 00:37:09.576','DK15AB942D45949A2B'),('demo-v2-payment-0','demo-v2-member-0','demo-v2-plan-01','Gói 1 tháng',350000,'2026-08-09','2026-09-07','ACTIVE','2026-09-07 03:00:00.000','DKB18DF4DC86187094'),('demo-v2-payment-1','demo-v2-member-1','demo-v2-plan-03','Gói 3 tháng',900000,'2026-06-10','2026-09-07','ACTIVE','2026-09-07 03:00:00.000','DK4952084F0DD92A6F'),('demo-v2-payment-10','demo-v2-member-10','demo-v2-plan-06','Gói 6 tháng',1600000,'2026-09-05','2027-03-03','ACTIVE','2026-09-07 03:00:00.000','DK03327A4C190B241B'),('demo-v2-payment-11','demo-v2-member-11','demo-v2-plan-12','Gói 12 tháng',3000000,'2025-09-11','2026-09-10','ACTIVE','2026-09-07 03:00:00.000','DKC93CEDA1B14A753A'),('demo-v2-payment-12','demo-v2-member-12','demo-v2-plan-01','Gói 1 tháng',350000,'2026-09-12','2026-10-11','ACTIVE','2026-09-07 03:00:00.000','DKA83F674A98D0D990'),('demo-v2-payment-2','demo-v2-member-2','demo-v2-plan-06','Gói 6 tháng',1600000,'2026-09-05','2027-03-03','ACTIVE','2026-09-07 03:00:00.000','DKAEEED51F450E9B1A'),('demo-v2-payment-3','demo-v2-member-3','demo-v2-plan-12','Gói 12 tháng',3000000,'2026-09-05','2027-09-04','ACTIVE','2026-09-07 03:00:00.000','DK7D82AFB06E8F5C34'),('demo-v2-payment-4','demo-v2-member-4','demo-v2-plan-01','Gói 1 tháng',350000,'2026-09-05','2026-10-04','ACTIVE','2026-09-07 03:00:00.000','DK5DB79CD58B8D04DB'),('demo-v2-payment-5','demo-v2-member-5','demo-v2-plan-03','Gói 3 tháng',900000,'2026-09-05','2026-12-03','ACTIVE','2026-09-07 03:00:00.000','DK97F6FE792CEF7AD9'),('demo-v2-payment-6','demo-v2-member-6','demo-v2-plan-06','Gói 6 tháng',1600000,'2026-09-05','2027-03-03','ACTIVE','2026-09-07 03:00:00.000','DKFF41E5D191FE627D'),('demo-v2-payment-7','demo-v2-member-7','demo-v2-plan-12','Gói 12 tháng',3000000,'2026-09-05','2027-09-04','ACTIVE','2026-09-07 03:00:00.000','DKF36BD4DCC56623FD'),('demo-v2-payment-8','demo-v2-member-8','demo-v2-plan-01','Gói 1 tháng',350000,'2026-09-05','2026-10-04','ACTIVE','2026-09-07 03:00:00.000','DKAEDB395ED07AD3BC'),('demo-v2-payment-9','demo-v2-member-9','demo-v2-plan-03','Gói 3 tháng',900000,'2026-09-05','2026-12-03','ACTIVE','2026-09-07 03:00:00.000','DK91B9E6F26F01E993'),('sample-payment-0','sample-member-0','sample-basic','GYM Cơ bản',350000,'2026-08-30','2026-09-28','ACTIVE','2026-09-08 03:00:00.000','DK49A3DC429847309A'),('sample-payment-1','sample-member-1','sample-plus','GYM Plus',900000,'2026-07-08','2026-10-05','ACTIVE','2026-09-05 03:00:00.000','DK5DBE00AD9EB71E35'),('sample-payment-2','sample-member-2','sample-pro','GYM Premium',1600000,'2026-04-16','2026-10-12','ACTIVE','2026-09-02 03:00:00.000','DK5CEB091844ABAFE9'),('sample-payment-3','sample-member-3','sample-basic','GYM Cơ bản',350000,'2026-09-20','2026-10-19','ACTIVE','2026-08-30 03:00:00.000','DK9000ABA25A96FC35'),('sample-payment-4','sample-member-4','sample-plus','GYM Plus',900000,'2026-06-15','2026-09-12','ACTIVE','2026-08-27 03:00:00.000','DKC0FEF0568AC2D5B0'),('sample-payment-5','sample-member-5','sample-pro','GYM Premium',1600000,'2026-05-07','2026-11-02','ACTIVE','2026-08-24 03:00:00.000','DKB2F11046B0520C6F'),('sample-payment-6','sample-member-6','sample-basic','GYM Cơ bản',350000,'2026-08-07','2026-09-05','ACTIVE','2026-08-21 03:00:00.000','DK0D429353C33C2AA9');
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `code` varchar(16) NOT NULL,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('ADMIN','Quản trị viên'),('MANAGER','Quản lý phòng GYM'),('MEMBER','Hội viên'),('STAFF','Nhân viên'),('TRAINER','Huấn luyện viên');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES ('92f2b5aa-e6e9-4ffd-8a23-4be1af38c841','dam nhau den chet','Khác',2,'cay vao day',1,0),('demo-v2-room-0','Phòng Gym','Gym',50,'Phòng mẫu phục vụ kiểm thử',1,0),('demo-v2-room-1','Phòng Yoga','Yoga',20,'Phòng mẫu phục vụ kiểm thử',1,0),('demo-v2-room-2','Phòng Boxing','Boxing',15,'Phòng mẫu phục vụ kiểm thử',1,0),('demo-v2-room-3','Phòng Aerobic','Aerobic',30,'Phòng mẫu phục vụ kiểm thử',1,0);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `member_id` (`member_id`),
  KEY `trainer_id` (`trainer_id`),
  KEY `room_id` (`room_id`),
  KEY `schedule_slot` (`date`,`start_time`,`end_time`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
  CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`),
  CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `schedules_chk_1` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'CANCELLED'))),
  CONSTRAINT `schedules_chk_2` CHECK ((`end_time` > `start_time`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` char(64) NOT NULL,
  `account_id` varchar(80) NOT NULL,
  `csrf` char(64) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_account_idx` (`account_id`),
  KEY `sessions_expiry_idx` (`expires_at`),
  CONSTRAINT `sessions_account_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL,
  `gym_name` varchar(100) NOT NULL,
  `opening_hours` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'GYM LC','05:00–22:00');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainers`
--

DROP TABLE IF EXISTS `trainers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainers` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainers`
--

LOCK TABLES `trainers` WRITE;
/*!40000 ALTER TABLE `trainers` DISABLE KEYS */;
INSERT INTO `trainers` VALUES ('demo-v2-trainer-0','Nguyễn Mạnh Hùng','0922000000','coach0@example.com','Thể hình',0,'Thứ 2–Thứ 7, 07:00–16:00',1,0,'HLVDA8BB99A23F52F6C'),('demo-v2-trainer-1','Trần Thùy Dung','0922000001','coach1@example.com','Yoga',2,'Thứ 2–Thứ 7, 07:00–16:00',1,0,'HLV3B4494BF37DB99EE'),('demo-v2-trainer-2','Phạm Gia Huy','0922000002','coach2@example.com','Boxing',4,'Thứ 2–Thứ 7, 07:00–16:00',1,0,'HLV0E4200DDBAB69319'),('demo-v2-trainer-3','Võ Thanh Trúc','0922000003','coach3@example.com','Aerobic',6,'Thứ 2–Thứ 7, 07:00–16:00',1,0,'HLVA02CA31288B47523'),('demo-v2-trainer-4','Lê Tuấn Anh','0922000004','coach4@example.com','Phục hồi',8,'Thứ 2–Thứ 7, 07:00–16:00',0,0,'HLV37058823FDE4BE58'),('feb15acd-838d-4c97-a1da-e884bced381f','chu linh','0987654321','linh@gmail.com','tang can',1,'full',1,0,'HLV24949EBA20137B11');
/*!40000 ALTER TABLE `trainers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'quan_ly_phong_gym'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-18 18:52:09
