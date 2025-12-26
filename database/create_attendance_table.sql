-- Create attendance table
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `student_id` INT NOT NULL COMMENT 'Student ID (references public_user.id)',
  `course_id` INT NOT NULL COMMENT 'Course ID (references course.id)',
  `date` DATE NOT NULL COMMENT 'Date of attendance (YYYY-MM-DD format)',
  `time` VARCHAR(10) NOT NULL COMMENT 'Time of attendance (HH:mm format)',
  `status` VARCHAR(50) NOT NULL DEFAULT 'NOT_CHECKED_IN' COMMENT 'Attendance status: ABSENT_NO_REASON, ABSENT_WITH_REASON, NOT_CHECKED_IN, CHECKED_IN',
  `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation date',
  `updated_date` DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update date',
  PRIMARY KEY (`id`),
  INDEX `idx_student_id` (`student_id` ASC),
  INDEX `idx_course_id` (`course_id` ASC),
  INDEX `idx_date` (`date` ASC),
  INDEX `idx_status` (`status` ASC),
  INDEX `idx_student_course_date` (`student_id`, `course_id`, `date`),
  CONSTRAINT `fk_attendance_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `public_user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_attendance_course`
    FOREIGN KEY (`course_id`)
    REFERENCES `course` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Attendance records for students in courses';

-- Add unique constraint to prevent duplicate attendance records for same student, course, date, and time
ALTER TABLE `attendance`
ADD UNIQUE INDEX `unique_student_course_date_time` (`student_id`, `course_id`, `date`, `time`);
