ALTER TABLE `course`
  ADD COLUMN `end_time` VARCHAR(10) NULL DEFAULT NULL AFTER `schedule`,
  ADD COLUMN `lead_id` INT NULL DEFAULT NULL AFTER `end_time`;

CREATE INDEX `idx_course_lead` ON `course` (`lead_id`);





