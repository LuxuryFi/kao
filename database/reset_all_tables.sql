-- =========================
-- 1. Bảng public_user
-- =========================
CREATE TABLE IF NOT EXISTS `public_user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` CHAR(256) NOT NULL,
  `address` CHAR(256) NOT NULL DEFAULT 'public',
  `email` CHAR(256) NOT NULL DEFAULT '',
  `reset_password_token` CHAR(256) NOT NULL DEFAULT '',
  `url` CHAR(256) NOT NULL DEFAULT '',
  `role` CHAR(256) NOT NULL DEFAULT '',
  `reset_password_expire` CHAR(256) NOT NULL DEFAULT 'public',
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `status` BOOLEAN NULL DEFAULT 1,
  `status_reason` INT NULL,
  `gender` BOOLEAN NULL,
  `refreshToken` VARCHAR(255) NULL,
  `created_at` BIGINT NULL DEFAULT UNIX_TIMESTAMP(),
  `parent_id` INT NULL,
  `phone` TEXT NULL,
  `contact_status` VARCHAR(100) NULL,
  `updated_date` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `created_by` VARCHAR(256) NULL,
  `updated_by` VARCHAR(256) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_public_user_parent_id` (`parent_id`),
  KEY `idx_public_user_role` (`role`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 2. Bảng student
-- =========================
CREATE TABLE IF NOT EXISTS `student` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  `age` INT NOT NULL,
  `phone` VARCHAR(50) NULL,
  `parent_id` INT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `trial_status` VARCHAR(50) NULL,
  `description` TEXT NULL,
  `created_at` BIGINT NULL DEFAULT UNIX_TIMESTAMP(),
  `updated_date` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `created_by` VARCHAR(256) NULL,
  `updated_by` VARCHAR(256) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_student_parent_id` (`parent_id`),
  KEY `idx_student_name` (`name`),
  CONSTRAINT `fk_student_parent`
    FOREIGN KEY (`parent_id`)
    REFERENCES `public_user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 3. Bảng court
-- =========================
CREATE TABLE IF NOT EXISTS `court` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  `address` VARCHAR(256) NOT NULL,
  `city` VARCHAR(128) NOT NULL,
  `description` TEXT NULL,
  `district` VARCHAR(128) NOT NULL,
  `created_at` BIGINT NULL,
  `updated_date` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `created_by` VARCHAR(256) NULL,
  `updated_by` VARCHAR(256) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 4. Bảng course
-- =========================
CREATE TABLE IF NOT EXISTS `course` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course_name` VARCHAR(256) NOT NULL,
  `summary` TEXT NULL,
  `schedule` TEXT NOT NULL,
  `created_at` BIGINT NULL,
  `court_id` INT NOT NULL,
  `status` BOOLEAN NOT NULL DEFAULT 1,
  `updated_date` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `created_by` VARCHAR(256) NULL,
  `updated_by` VARCHAR(256) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_course_court_id` (`court_id`),
  KEY `idx_course_status` (`status`),
  CONSTRAINT `fk_course_court`
    FOREIGN KEY (`court_id`)
    REFERENCES `court` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 5. Bảng package
-- =========================
CREATE TABLE IF NOT EXISTS `package` (
  `package_id` INT NOT NULL AUTO_INCREMENT,
  `package_name` VARCHAR(256) NOT NULL,
  `quantity` INT NOT NULL,
  `price` FLOAT NOT NULL,
  `summary` VARCHAR(512) NOT NULL,
  `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` VARCHAR(256) NULL,
  `updated_by` VARCHAR(256) NULL,
  PRIMARY KEY (`package_id`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 6. Bảng subscription
-- =========================
CREATE TABLE IF NOT EXISTS `subscription` (
  `subscription_id` INT NOT NULL AUTO_INCREMENT,
  `student_id` INT NOT NULL,
  `package_id` INT NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `status_reason` VARCHAR(255) NULL,
  `quantity` INT NOT NULL,
  `start_date` BIGINT NULL,
  `created_at` BIGINT NULL DEFAULT UNIX_TIMESTAMP(),
  `updated_at` BIGINT NULL,
  `deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`subscription_id`),
  KEY `idx_subscription_student_id` (`student_id`),
  KEY `idx_subscription_package_id` (`package_id`),
  CONSTRAINT `fk_subscription_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `student` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_subscription_package`
    FOREIGN KEY (`package_id`)
    REFERENCES `package` (`package_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 7. Bảng course_student
-- =========================
CREATE TABLE IF NOT EXISTS `course_student` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `student_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` BIGINT NULL DEFAULT UNIX_TIMESTAMP(),
  `updated_date` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `created_by` VARCHAR(256) NULL,
  `updated_by` VARCHAR(256) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_course_student_student_id` (`student_id`),
  KEY `idx_course_student_course_id` (`course_id`),
  KEY `idx_course_student_status` (`status`),
  CONSTRAINT `fk_course_student_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `student` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_course_student_course`
    FOREIGN KEY (`course_id`)
    REFERENCES `course` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 8. Bảng attendance
-- =========================
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `student_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `time` VARCHAR(10) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'NOT_CHECKED_IN',
  `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  `is_trial` BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_attendance_student_id` (`student_id`),
  KEY `idx_attendance_course_id` (`course_id`),
  KEY `idx_attendance_date` (`date`),
  KEY `idx_attendance_status` (`status`),
  KEY `idx_attendance_student_course_date` (`student_id`, `course_id`, `date`),
  CONSTRAINT `fk_attendance_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `student` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_attendance_course`
    FOREIGN KEY (`course_id`)
    REFERENCES `course` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Unique constraint để tránh điểm danh trùng
ALTER TABLE `attendance`
  ADD UNIQUE KEY `unique_student_course_date_time` (`student_id`, `course_id`, `date`, `time`);