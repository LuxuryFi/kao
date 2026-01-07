-- Drop start_date and end_date columns from public_user table (no longer needed)
ALTER TABLE `public_user`
  DROP COLUMN `start_date`,
  DROP COLUMN `end_date`;


