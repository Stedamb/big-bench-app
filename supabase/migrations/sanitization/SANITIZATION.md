# Sanitization Summary - Stamp Locations Data

This document summarizes the steps taken to clean and sanitize the `stamp_locations` database table.

## 1. Problem Identification
The raw data imported from `scripts/stamp_locations.json` contained several quality issues caused by inconsistent parsing of the source PDF:
- **Title Noise:** Business names included pipe-separated fragments containing opening hours, phone numbers, and notes (e.g., `*SOLO TIMBRO*`).
- **Parsing Artifacts:** Many rows were fragments (continuation lines) incorrectly identified as business entities, violating database integrity constraints.
- **Misaligned Data:** Opening hours and contact information were frequently found in the wrong fields or mixed with business titles.

## 2. Sanitization Strategy
I have implemented a 4-step SQL sanitization process to clean the `public.stamp_locations` table.

### Step 1: Row Cleanup (`01_remove_invalid_rows.sql`)
- Removed rows that were clearly parsing fragments (lines starting with hour keywords like "alle", "lunedì", etc.).
- Removed extremely short rows (< 4 characters) and noise lines that were misidentified as businesses.

### Step 2: Title & Hours Extraction (`02_extract_opening_hours.sql`)
- Identified patterns where the `name` column contained pipe-separated opening hours.
- Moved these segments from `name` into the `opening_hours` column.

### Step 3: Note Extraction (`03_clean_notes_and_titles.sql`)
- Extracted administrative notes (e.g., "SOLO TIMBRO", "SOLO PASSAPORTI") from the business names.
- Moved these notes to the `notes` column and cleaned the `name` field.

### Step 4: Formatting Refinement (`04_fix_opening_hours_format.sql`)
- Cleaned the `opening_hours` column of leading garbage (phone numbers that were accidentally merged) and trailing punctuation.

## 3. Implementation
The SQL scripts to perform these actions are located in `supabase/migrations/sanitization/`. They are designed to be idempotent and can be reviewed before execution in the Supabase SQL Editor.
