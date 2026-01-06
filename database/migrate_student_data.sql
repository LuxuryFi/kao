-- Migration script to migrate student data from public_user to student table
-- This script migrates users with role='student' to the new student table
-- IMPORTANT: Run this script AFTER creating the student table but BEFORE updating foreign keys

-- Insert students from public_user table where role='student'
-- Note: This assumes parent_id already exists in public_user table
INSERT INTO `student` (`name`, `age`, `phone`, `parent_id`, `created_at`, `created_by`)
SELECT 
  u.`name`,
  -- Age calculation: if you have birth_date or can calculate from other fields, use that
  -- For now, using a default age of 10 (you should update this based on your data)
  10 as `age`,
  u.`phone`,
  COALESCE(u.`parent_id`, 0) as `parent_id`, -- Use 0 if parent_id is NULL (you may need to handle this differently)
  u.`created_at`,
  u.`created_by`
FROM `public_user` u
WHERE u.`role` = 'student'
  AND NOT EXISTS (
    SELECT 1 FROM `student` s WHERE s.`name` = u.`name` AND s.`parent_id` = COALESCE(u.`parent_id`, 0)
  );

-- Update course_student table to use new student IDs
-- This maps old user_id to new student_id
UPDATE `course_student` cs
INNER JOIN `public_user` u ON cs.`student_id` = u.`id`
INNER JOIN `student` s ON s.`name` = u.`name` AND s.`parent_id` = COALESCE(u.`parent_id`, 0)
SET cs.`student_id` = s.`id`
WHERE u.`role` = 'student';

-- Update attendance table to use new student IDs
UPDATE `attendance` a
INNER JOIN `public_user` u ON a.`student_id` = u.`id`
INNER JOIN `student` s ON s.`name` = u.`name` AND s.`parent_id` = COALESCE(u.`parent_id`, 0)
SET a.`student_id` = s.`id`
WHERE u.`role` = 'student';

-- Update subscription table to use new student IDs
-- First, rename user_id to student_id if not already done
-- Then update the values
UPDATE `subscription` sub
INNER JOIN `public_user` u ON sub.`student_id` = u.`id`
INNER JOIN `student` s ON s.`name` = u.`name` AND s.`parent_id` = COALESCE(u.`parent_id`, 0)
SET sub.`student_id` = s.`id`
WHERE u.`role` = 'student';

