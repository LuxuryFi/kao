-- Table for teaching schedules of lead / sub tutor / manager
CREATE TABLE IF NOT EXISTS `teaching_schedule` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT 'Ref to public_user.id',
  `course_id` INT NOT NULL COMMENT 'Ref to course.id',
  `date` DATE NOT NULL COMMENT 'Teaching date (YYYY-MM-DD)',
  `time` VARCHAR(10) NOT NULL COMMENT 'Teaching time (HH:mm)',
  `status` VARCHAR(50) NOT NULL DEFAULT 'UPCOMING' COMMENT 'UPCOMING | NOT_CHECKED_IN | CHECKED_IN',
  `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation date',
  `updated_date` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update date',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_course_id` (`course_id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_user_course_date` (`user_id`, `course_id`, `date`),
  CONSTRAINT `fk_teaching_schedule_user`
    FOREIGN KEY (`user_id`) REFERENCES `public_user` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_teaching_schedule_course`
    FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Teaching schedule for course staff';





