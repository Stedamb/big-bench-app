-- 03_clean_notes_and_titles.sql
-- Extracts notes from the name column (e.g., *SOLO TIMBRO*) and cleans the name.

UPDATE public.stamp_locations
SET 
  notes = TRIM(
    CASE 
      WHEN notes IS NULL OR notes = '' THEN 
        CASE WHEN name ~* 'SOLO TIMBRO' THEN 'SOLO TIMBRO' ELSE 'SOLO PASSAPORTI' END
      ELSE notes || '; ' || CASE WHEN name ~* 'SOLO TIMBRO' THEN 'SOLO TIMBRO' ELSE 'SOLO PASSAPORTI' END
    END
  ),
  name = TRIM(regexp_replace(name, '\*?SOLO\s+(?:TIMBRO|PASSAPORTI)\*?', '', 'gi'))
WHERE name ~* 'SOLO\s+(?:TIMBRO|PASSAPORTI)';
