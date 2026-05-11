-- 01_remove_invalid_rows.sql
-- Removes records that are fragments, noise, or clearly invalid entries.

DELETE FROM public.stamp_locations 
WHERE name ~* '^(?:alle|e dalle|dalle|dal |da |e |lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica|i giorni|tutti i|Chiuso|Aperto|Orario|Orari|Periodo|Invernale|Estivo|Feriali|Festivi)'
OR name ~* '^[0-9]{1,2}[:.][0-9]{2}'
OR name ~* '^[\d\s\.]{7,}\s*\|'
OR name ~* '^[A-ZÀ-Ý]{1,2}\s+\d' 
OR length(name) < 4;
