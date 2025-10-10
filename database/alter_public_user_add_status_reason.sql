-- Add status_reason column to public_user table
ALTER TABLE `public_user`
ADD COLUMN `status_reason` INT NULL DEFAULT NULL COMMENT 'Status reason code'
AFTER `status`;

-- Optional: Add index if you plan to filter by status_reason frequently
-- ALTER TABLE `public_user` ADD INDEX `idx_status_reason` (`status_reason` ASC);

-- Optional: If you want to set a default value for existing rows
-- UPDATE `public_user` SET `status_reason` = 0 WHERE `status_reason` IS NULL;

