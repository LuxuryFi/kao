-- Create course_student table
CREATE TABLE IF NOT EXISTS `course_student` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `student_id` INT NOT NULL COMMENT 'Student ID (references public_user.id)',
  `course_id` INT NOT NULL COMMENT 'Course ID (references course.id)',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Status: 1=active, 0=inactive',
  `created_at` BIGINT NULL DEFAULT NULL COMMENT 'UNIX timestamp',
  `updated_date` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update date',
  PRIMARY KEY (`id`),
  INDEX `idx_student_id` (`student_id` ASC),
  INDEX `idx_course_id` (`course_id` ASC),
  INDEX `idx_status` (`status` ASC),
  CONSTRAINT `fk_course_student_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `public_user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_course_student_course`
    FOREIGN KEY (`course_id`)
    REFERENCES `course` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Course Students relationship table';

-- Optional: Add unique constraint to prevent duplicate enrollments
-- Uncomment if you want to ensure a student can only enroll once per course
-- ALTER TABLE `course_student` 
-- ADD UNIQUE INDEX `unique_student_course` (`student_id`, `course_id`);

