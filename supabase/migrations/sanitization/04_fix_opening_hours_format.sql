-- 04_fix_opening_hours_format.sql
-- Cleans up opening_hours column by removing trailing garbage or leading phone numbers.

UPDATE public.stamp_locations
SET opening_hours = TRIM(regexp_replace(opening_hours, '^[\d\s\.]{7,}\s*\|\s*', ''))
WHERE opening_hours ~ '^[\d\s\.]{7,}\s*\|';

UPDATE public.stamp_locations
SET opening_hours = TRIM(regexp_replace(opening_hours, '\s*[-–]\s*$', ''))
WHERE opening_hours ~ '\s*[-–]\s*$';
