-- Table for course staff (lead / sub tutor / manager)
CREATE TABLE IF NOT EXISTS `course_staff` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course_id` INT NOT NULL COMMENT 'Ref to course.id',
  `user_id` INT NOT NULL COMMENT 'Ref to public_user.id',
  `role` VARCHAR(20) NOT NULL COMMENT 'LEAD | SUB_TUTOR | MANAGER',
  `created_at` BIGINT NULL DEFAULT NULL COMMENT 'UNIX timestamp',
  `updated_date` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
  `created_by` VARCHAR(256) NULL DEFAULT NULL COMMENT 'Created by username',
  `updated_by` VARCHAR(256) NULL DEFAULT NULL COMMENT 'Updated by username',
  PRIMARY KEY (`id`),
  INDEX `idx_course_id` (`course_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_role` (`role`),
  CONSTRAINT `fk_course_staff_course`
    FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_course_staff_user`
    FOREIGN KEY (`user_id`) REFERENCES `public_user` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Course staff (lead / sub tutor / manager)';





