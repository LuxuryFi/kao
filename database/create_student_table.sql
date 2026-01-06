-- Create student table
CREATE TABLE IF NOT EXISTS `student` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL COMMENT 'Student name',
  `age` INT NOT NULL COMMENT 'Student age',
  `phone` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Phone number',
  `parent_id` INT NOT NULL COMMENT 'Parent user ID (references public_user.id)',
  `created_at` BIGINT NULL DEFAULT NULL COMMENT 'UNIX timestamp',
  `updated_date` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update date',
  `created_by` VARCHAR(256) NULL DEFAULT NULL COMMENT 'Created by username',
  `updated_by` VARCHAR(256) NULL DEFAULT NULL COMMENT 'Updated by username',
  PRIMARY KEY (`id`),
  INDEX `idx_parent_id` (`parent_id` ASC),
  INDEX `idx_name` (`name` ASC),
  CONSTRAINT `fk_student_parent`
    FOREIGN KEY (`parent_id`)
    REFERENCES `public_user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Student information table';

