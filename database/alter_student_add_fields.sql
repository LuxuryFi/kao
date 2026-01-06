-- Add new fields to student table
ALTER TABLE `student`
ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'Student status: trial, active, inactive',
ADD COLUMN `trial_status` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Trial status: đã đăng ký học thử, đã đến học thử',
ADD COLUMN `description` TEXT NULL DEFAULT NULL COMMENT 'Description';

-- Add index for better query performance
ALTER TABLE `student` ADD INDEX `idx_status` (`status`);
ALTER TABLE `student` ADD INDEX `idx_trial_status` (`trial_status`);

