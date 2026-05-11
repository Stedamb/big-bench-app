-- 02_extract_opening_hours.sql
-- Moves opening hours incorrectly stored in the name column to the opening_hours column.

UPDATE public.stamp_locations
SET 
  opening_hours = TRIM(
    CASE 
      WHEN opening_hours IS NULL OR opening_hours = '' THEN split_part(name, '|', 2)
      ELSE opening_hours || ' | ' || split_part(name, '|', 2)
    END
  ),
  name = TRIM(split_part(name, '|', 1))
WHERE name LIKE '%|%' 
  AND (name ~* 'Aperto|Chiuso|Orario|[\d:]{4,}' OR split_part(name, '|', 2) ~* 'Aperto|Chiuso|Orario');
