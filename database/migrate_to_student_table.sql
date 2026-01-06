-- Migration script to update foreign keys from public_user to student table
-- This script should be run after creating the student table and migrating data

-- Step 1: Update course_student table foreign key
-- Drop old foreign key
ALTER TABLE `course_student`
  DROP FOREIGN KEY `fk_course_student_student`;

-- Update foreign key to reference student table
ALTER TABLE `course_student`
  ADD CONSTRAINT `fk_course_student_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `student` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Step 2: Update attendance table foreign key
-- Drop old foreign key
ALTER TABLE `attendance`
  DROP FOREIGN KEY `fk_attendance_student`;

-- Update foreign key to reference student table
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `student` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Step 3: Update subscription table
-- Rename user_id column to student_id
ALTER TABLE `subscription`
  CHANGE COLUMN `user_id` `student_id` INT NOT NULL COMMENT 'Student ID (references student.id)';

-- Drop old foreign key if exists (may not exist)
-- ALTER TABLE `subscription`
--   DROP FOREIGN KEY `fk_subscription_user`;

-- Add new foreign key to reference student table
ALTER TABLE `subscription`
  ADD CONSTRAINT `fk_subscription_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `student` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

