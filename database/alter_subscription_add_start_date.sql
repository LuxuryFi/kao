-- Add start_date column to subscription table if it doesn't exist
-- This column stores the start date as UNIX timestamp (seconds) for attendance calculation

-- Check if column exists and add if not
SET @dbname = DATABASE();
SET @tablename = 'subscription';
SET @columnname = 'start_date';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BIGINT NULL DEFAULT NULL COMMENT ''Start date as UNIX timestamp (seconds)''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index for start_date if needed (optional, for performance)
-- ALTER TABLE `subscription` ADD INDEX `idx_start_date` (`start_date`);
