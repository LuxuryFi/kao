-- Add is_trial column to attendance table
ALTER TABLE `attendance`
ADD COLUMN `is_trial` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Is trial attendance (1=true if manually created as trial, 0=false if auto-created)';

-- Add index for better query performance if needed
-- ALTER TABLE `attendance` ADD INDEX `idx_is_trial` (`is_trial`);

