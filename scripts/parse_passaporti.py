import csv
import json
import re
import os

csv_path = os.path.join(os.path.dirname(__file__), "passaporti_output.csv")
output_path = os.path.join(os.path.dirname(__file__), "stamp_locations.json")

# Step 1: Read CSV and group continuation rows
rows = []
with open(csv_path, "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        rows.append(row)

# Step 2: Group rows into bench entries
bench_entries = []
current_bench_num = None
current_bench_name = None
current_lines = []

for row in rows:
    col0 = (row[0].strip() if len(row) > 0 else "")
    col1 = (row[1].strip() if len(row) > 1 else "")
    col2 = (row[2] if len(row) > 2 else "")

    is_continuation = (col0 == "" and col1 == "")

    if is_continuation:
        if col2:
            current_lines.append(col2)
    else:
        if current_bench_num is not None:
            bench_entries.append({
                "bench_num": current_bench_num,
                "bench_name": current_bench_name,
                "text": "\n".join(current_lines)
            })
        current_bench_num = col0
        current_bench_name = col1
        current_lines = [col2] if col2 else []

if current_bench_num is not None:
    bench_entries.append({
        "bench_num": current_bench_num,
        "bench_name": current_bench_name,
        "text": "\n".join(current_lines)
    })

print(f"Grouped {len(bench_entries)} bench entries")

# Step 3: Parse each bench into individual locations
def parse_bench_locations(text):
    if not text or not text.strip():
        return []

    lines = text.split("\n")
    lines = [l.strip() for l in lines if l.strip()]
    if not lines:
        return []

    # Find location boundaries
    # A new location starts with a line that looks like a business name
    addr_re = re.compile(
        r'^(?:Via|Piazza|P\.zza|Localit[àa]|Loc\.|Reg\.|Contrada|Strada|Vocabolo|'
        r'Frazione|Fraz\.|Corso|Viale|P\.le|Largo|Borgata|Borgo|C\.so|Regione|'
        r'Cascina|C/da|c\.da|Piazzale|Piazzetta|Vicolo|SP\d|SS\s)',
        re.IGNORECASE
    )
    phone_re = re.compile(r'^(?:Tel|tel|T\.|Phone|Fax)', re.IGNORECASE)
    email_re = re.compile(r'^(?:email|E-mail|e-mail)\s*:', re.IGNORECASE)
    ref_re = re.compile(r'^Referente\s*:', re.IGNORECASE)
    web_re = re.compile(r'^web\s*:', re.IGNORECASE)

    # Hours continuation patterns - these are NOT new locations
    hours_cont_re = re.compile(
        r'^(?:alle|e dalle|dalle|dal|da|e|lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica|'
        r'\d{1,2}[:\.]?\d{0,2}\s|Chiuso|Aperto|Orario|Orari|sempre|tutti|Periodo|'
        r'Invernale|Estivo|Feriali|Festivi|nella|presso|su\s|previa|'
        r'sabato|domenica|il\s+(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica))',
        re.IGNORECASE
    )

    location_starts = []
    for i, line in enumerate(lines):
        # Skip address/phone/email/ref lines
        if addr_re.match(line) or phone_re.match(line) or email_re.match(line) or ref_re.match(line) or web_re.match(line):
            continue

        # Skip hours continuation lines
        if hours_cont_re.match(line):
            continue

        # Skip lines that are clearly part of pipe-separated data (phone+hours on one line)
        if re.match(r'^[\d\s\.\-\+\(\)]{6,30}\s*\|', line):
            continue

        # Check if this looks like a business name
        if len(line) > 3 and len(line) < 120:
            # Business names: ALL CAPS, or start with capital, or have business keywords
            is_name = False
            if re.match(r'^[A-ZÀ-Ý][A-ZÀ-Ý\s\'\.\-\&]+$', line):
                is_name = True
            elif re.search(
                r'(?:BAR|RISTORANTE|HOTEL|ALBERGO|AGRITURISMO|TRATTORIA|OSTERIA|'
                r'PIZZERIA|GELATERIA|PANETTERIA|PASTICCERIA|ALIMENTARI|TABACCHERIA|'
                r'MACELLERIA|FARMACIA|LIBRERIA|CARTOLERIA|FERRAMENTA|MERCERIA|'
                r'CANTINA|ENOTECA|VINERIA|COMUNE|MUNICIPIO|UFFICIO|PRO\s*LOCO|'
                r'CIRCOLO|ASSOCIAZIONE|RIFUGIO|LOCANDA|CAMPING|B&B|CAF[EÉ]|'
                r'SUPERMERCATO|MARKET|EDICOLA|BOTTEGA|NEGOZIO|FATTORIA|TENUTA|'
                r'MUSEO|PARCO|GROTTO|PROFUMERIA|BOMBONIERE|STUDIO|PALESTRA|'
                r'BIRRA|CIOCCO|SNACK|WINE|CASEIFICIO|PARRUCCHIERA|GIOIELLERIA|'
                r'IMMOBILIARE|CENTRO|OREFICERIA|FIORE|ACCONCIAT|BABY|FERRAMENTA|'
                r'MAXISCONTO|ALIMENTARI|MACELLERIA|DOLCI|BAR\s|RISTORO|'
                r'AZ(?:\.|\s)(?:\s*AGR|IENDA)|CASCINA|TENUTA|FATTORIA|'
                r'BISCOTTIFICIO|PIZZA|OSTERIA|TRATTORIA|RISTORANTE|'
                r'LA\s+|IL\s+|LE\s+|LO\s+|CAFF[EÉ]|CAF[EÉ]|'
                r'RIFUGIO|LOCANDA|CAMPING|CAMPEGGIO|OSTELLO)',
                line, re.IGNORECASE
            ):
                is_name = True
            elif re.match(r'^[A-ZÀ-Ý]', line) and not re.match(r'^[A-ZÀ-Ý]{1,2}\s+\d', line):
                # Starts with capital but not ALL CAPS - check if it has business keywords
                if re.search(
                    r'(?:Bar|Ristorante|Hotel|Albergo|Agriturismo|Trattoria|Osteria|'
                    r'Pizzeria|Gelateria|Panetteria|Pasticceria|Alimentari|Tabaccheria|'
                    r'Macelleria|Farmacia|Libreria|Cartoleria|Ferramenta|Merceria|'
                    r'Cantina|Enoteca|Vineria|Comune|Municipio|Ufficio|Pro\s*Loco|'
                    r'Circolo|Associazione|Rifugio|Locanda|Camping|B&B|Caffè|'
                    r'Supermercato|Market|Edicola|Bottega|Negozio|Fattoria|Tenuta|'
                    r'Museo|Parco|Grotto|Profumeria|Bomboniere|Studio|Palestra|'
                    r'Birra|Ciocco|Snack|Wine|Caseificio|Parrucchiera|Gioielleria|'
                    r'Immobiliare|Centro|Oreficeria|Fiore|Acconciat|Baby|Ferramenta|'
                    r'Maxisconto|Alimentari|Macelleria|Dolci|Ristoro)',
                    line, re.IGNORECASE
                ):
                    is_name = True

            if is_name:
                location_starts.append(i)

    if not location_starts:
        return [{"name": lines[0], "lines": lines}]

    # Build location blocks
    locations = []
    for idx, start in enumerate(location_starts):
        end = location_starts[idx + 1] if idx + 1 < len(location_starts) else len(lines)
        block_lines = lines[start:end]
        locations.append({
            "name": block_lines[0],
            "lines": block_lines
        })

    return locations

def extract_fields(name, lines):
    full_text = " ".join(lines)

    # Extract phone
    phone = ""
    phone_matches = re.findall(
        r'(?:Tel\.?\s*:?\s*|tel\.?\s*:?\s*|T\.\s*|Phone\s*:?\s*)([\d\s\.\-\+\(\)]{6,30})',
        full_text, re.IGNORECASE
    )
    if phone_matches:
        phone = phone_matches[0].strip()
        phone = re.sub(r'\s+', ' ', phone).strip()
        if len(phone) > 50:
            phone = phone[:50]

    # Extract email
    email = ""
    email_match = re.search(r'[\w\.\-\+]+@[\w\.\-]+\.\w{2,}', full_text)
    if email_match:
        email = email_match.group(0).strip().rstrip('.,;:')

    # Extract address - from lines after name that start with address keywords
    address = ""
    for line in lines[1:5]:
        addr_match = re.match(
            r'((?:Via|Piazza|P\.zza|Localit[àa]|Loc\.|Reg\.|Contrada|Strada|Vocabolo|'
            r'Frazione|Fraz\.|Corso|Viale|P\.le|Largo|Borgata|Borgo|C\.so|Regione|'
            r'Cascina|C/da|c\.da|Piazzale|Piazzetta|Vicolo|Presso|Strada|SP\d|SS\s)\s+.+?)'
            r'(?:\s*\|\s*(?:Tel|tel|T\.|Phone|Aperto|Orario|Chiuso|@|E-mail|email).*$)',
            line, re.IGNORECASE
        )
        if addr_match:
            address = addr_match.group(1).strip()
            break
        # Also try without pipe separator
        addr_match2 = re.match(
            r'((?:Via|Piazza|P\.zza|Localit[àa]|Loc\.|Reg\.|Contrada|Strada|Vocabolo|'
            r'Frazione|Fraz\.|Corso|Viale|P\.le|Largo|Borgata|Borgo|C\.so|Regione|'
            r'Cascina|C/da|c\.da|Piazzale|Piazzetta|Vicolo|Presso|Strada|SP\d|SS\s)\s+.+)',
            line, re.IGNORECASE
        )
        if addr_match2:
            addr_text = addr_match2.group(1).strip()
            # Clean: remove trailing phone/hours
            addr_text = re.sub(r'\s*\|?\s*(?:Tel|tel|T\.|Phone|Aperto|Orario|Chiuso|@|E-mail|email).*$', '', addr_text, flags=re.IGNORECASE).strip()
            # Remove trailing city/province info that's duplicated
            addr_text = re.sub(r'\s*[-–]\s*\d{5}\s+\w+.*$', '', addr_text).strip() if re.search(r'\d{5}', addr_text) else addr_text
            if addr_text and len(addr_text) > 5:
                address = addr_text[:300]
                break

    # Extract opening hours - look for time patterns and day names
    opening_hours = ""
    hours_parts = []
    for line in lines:
        # Skip the name line and address line
        if line == lines[0]:
            continue
        if address and line.startswith(address[:20]):
            continue

        # Look for hours patterns
        if re.search(
            r'(?:Aperto|Orario|Orari|Apertura|dal\s+(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)|'
            r'tutti\s+i\s+giorni|sempre\s+aperto|Chiuso|Chiusura|Giorno\s+di\s+chiusura|'
            r'Feriali|Festivi|Periodo\s+di\s+chiusura|Invernale|Estivo|'
            r'\d{1,2}[:\.]?\d{0,2}\s*[-–]\s*\d{1,2}[:\.]?\d{0,2})',
            line, re.IGNORECASE
        ):
            # Clean the line: remove pipe-separated fields that are addresses/phones
            cleaned = line
            cleaned = re.sub(r'\s*\|\s*(?:Tel|tel|T\.|Phone|@|E-mail|email)\s*:?.*$', '', cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r'\s*\|\s*(?:Via|Piazza|Localit|Loc\.|Reg\.|Frazione|Fraz\.).*$', '', cleaned, flags=re.IGNORECASE)
            if cleaned.strip():
                hours_parts.append(cleaned.strip())

    if hours_parts:
        opening_hours = " ".join(hours_parts)
        opening_hours = re.sub(r'\s+', ' ', opening_hours).strip()
        if len(opening_hours) > 500:
            opening_hours = opening_hours[:500]

    # Extract notes
    notes = ""
    note_parts = []
    note_patterns = [
        (r'CHIAMARE\s+PRIMA', "CHIAMARE PRIMA"),
        (r'TELEFONARE\s+PRIMA', "TELEFONARE PRIMA"),
        (r'SOLO\s+TIMBRO', "SOLO TIMBRO"),
        (r'SOLO\s+PASSAPORTI', "SOLO PASSAPORTI"),
        (r'NO\s+PASSAPORTI', "NO PASSAPORTI"),
    ]
    for pattern, label in note_patterns:
        if re.search(pattern, full_text, re.IGNORECASE):
            note_parts.append(label)
    notes = "; ".join(note_parts)

    # Detect location type
    location_type = ""
    type_keywords = {
        "bar": r'\bBAR\b|CAF[EÉ]|CAFF[EÉ]|SNACK',
        "ristorante": r'\bRISTORANTE\b|TRATTORIA|OSTERIA|PIZZERIA|GASTRONOMIA',
        "albergo": r'\bHOTEL\b|ALBERGO|LOCANDA|B&B|RELAI[S]',
        "agriturismo": r'\bAGRITURISMO\b|AZ\.\s*AGR|AZIENDA\s+AGR|FATTORIA|TENUTA|CASCINA',
        "negozio": r'ALIMENTARI|TABACCHERIA|MACELLERIA|FARMACIA|LIBRERIA|CARTOLERIA|FERRAMENTA|MERCERIA|PROFUMERIA|NEGOZIO|BOTTEGA|SUPERMERCATO|MARKET|EDICOLA|PANETTERIA|PASTICCERIA|GELATERIA|FIORE|BOMBONIERE|GIOIELLERIA|OREFICERIA|ACCONCIAT|FERRAMENTA|MAXISCONTO|BABY',
        "cantina": r'CANTINA|ENOTECA|VINERIA',
        "ufficio": r'COMUNE|MUNICIPIO|UFFICIO|PRO\s*LOCO|INFOPOINT|INFO\s*POINT',
        "circolo": r'CIRCOLO|ASSOCIAZIONE|PROLOCO',
        "rifugio": r'RIFUGIO|CAMPING|CAMPEGGIO|OSTELLO',
        "attrazione": r'MUSEO|PARCO|GROTTA|CASTELLO|IMMOBILIARE',
    }
    for ttype, pattern in type_keywords.items():
        if re.search(pattern, full_text, re.IGNORECASE):
            location_type = ttype
            break

    # Clean name
    clean_name = name.strip()
    clean_name = re.sub(r'\s+', ' ', clean_name)
    clean_name = re.sub(r'\s*[\|–\-]\s*$', '', clean_name).strip()
    if len(clean_name) > 200:
        clean_name = clean_name[:200]

    return {
        "name": clean_name,
        "address": address,
        "phone": phone,
        "email": email,
        "opening_hours": opening_hours,
        "notes": notes,
        "location_type": location_type
    }

# Step 4: Process all bench entries
all_locations = []
skipped = 0
for entry in bench_entries:
    bench_num = entry["bench_num"]
    text = entry["text"]

    if not text or not text.strip():
        skipped += 1
        continue

    raw_locations = parse_bench_locations(text)

    for loc in raw_locations:
        fields = extract_fields(loc["name"], loc["lines"])
        if fields["name"] and len(fields["name"]) > 2:
            all_locations.append({
                "bench_num": bench_num,
                **fields
            })

# Step 5: Deduplicate
seen = set()
deduped = []
for loc in all_locations:
    key = (loc["bench_num"], loc["name"])
    if key not in seen:
        seen.add(key)
        deduped.append(loc)

# Step 6: Filter out garbage entries
filtered = []
for loc in deduped:
    name = loc["name"]
    # Skip entries that are clearly not business names
    if re.match(r'^(?:email|E-mail|Referente|web|Tel|Aperto|Orario|Chiuso|Giorno|Dal |da |tutti|sempre)', name, re.IGNORECASE):
        continue
    if re.match(r'^[A-ZÀ-Ý]{1,2}\s+\d', name):  # Like "SP 43A"
        continue
    if len(name) < 4:
        continue
    # Skip hours/address continuation fragments
    if re.match(r'^(?:alle|e dalle|dalle|dal |da \d|e \d|\d{1,2}[:\.]\d{2}|Chiuso|Aperto|Orario|Orari|sempre|tutti|Periodo|Invernale|Estivo|Feriali|Festivi)', name, re.IGNORECASE):
        continue
    # Skip lines that are mostly numbers/punctuation
    if re.match(r'^[\d\s\.\-\+\(\)\|]+$', name):
        continue
    # Skip lines that look like address fragments
    if re.match(r'^(?:P\.zza|Piazzale|Piazzetta)\s', name, re.IGNORECASE):
        continue
    filtered.append(loc)

# Step 7: Output
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(filtered, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(all_locations)} raw locations")
print(f"After dedup: {len(deduped)}")
print(f"After filter: {len(filtered)}")
print(f"Skipped {skipped} entries with no data")

bench_count = len(set(loc["bench_num"] for loc in filtered))
print(f"Locations span {bench_count} unique benches")

# Stats
types = {}
for loc in filtered:
    t = loc.get("location_type") or "unknown"
    types[t] = types.get(t, 0) + 1
print("\nLocation types:")
for t, count in sorted(types.items(), key=lambda x: -x[1]):
    print(f"  {t}: {count}")

has_phone = sum(1 for l in filtered if l["phone"])
has_email = sum(1 for l in filtered if l["email"])
has_hours = sum(1 for l in filtered if l["opening_hours"])
has_addr = sum(1 for l in filtered if l["address"])
print(f"\nData completeness:")
print(f"  With address: {has_addr}/{len(filtered)}")
print(f"  With phone: {has_phone}/{len(filtered)}")
print(f"  With email: {has_email}/{len(filtered)}")
print(f"  With hours: {has_hours}/{len(filtered)}")

# Samples
for bn in ["5", "7", "33", "1"]:
    print(f"\n--- Bench {bn} ---")
    for loc in filtered:
        if loc["bench_num"] == bn:
            print(json.dumps(loc, ensure_ascii=False, indent=2))
