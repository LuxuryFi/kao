-- Add late/early minutes columns for teaching_schedule check-in/check-out tracking
-- MySQL-compatible

ALTER TABLE teaching_schedule
  ADD COLUMN checkin_late_minutes INT NULL AFTER checkin_time,
  ADD COLUMN checkout_early_minutes INT NULL AFTER checkout_time;


