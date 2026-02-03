-- Add checkin_time and checkout_time columns to teaching_schedule table
ALTER TABLE `teaching_schedule`
ADD COLUMN `checkin_time` DATETIME NULL AFTER `status`,
ADD COLUMN `checkout_time` DATETIME NULL AFTER `checkin_time`;



