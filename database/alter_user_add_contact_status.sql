-- Add contact_status field to public_user table
ALTER TABLE `public_user`
ADD COLUMN `contact_status` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Contact status';

-- Add index for better query performance if needed
-- ALTER TABLE `public_user` ADD INDEX `idx_contact_status` (`contact_status`);

