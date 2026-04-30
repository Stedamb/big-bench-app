import fs from 'fs';
import path from 'path';
import os from 'os';
import { createClient } from '@supabase/supabase-js';
import { Jimp } from 'jimp';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEOJSON_PATH = process.env.GEOJSON_PATH || './benches.geojson';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const raw = fs.readFileSync(GEOJSON_PATH, 'utf8');
const geojson = JSON.parse(raw);

const PROVINCE_TO_REGION = {
  AG: 'Sicily', AL: 'Piedmont', AN: 'Marche', AO: 'Aosta Valley', AP: 'Marche',
  AQ: 'Abruzzo', AR: 'Tuscany', AT: 'Piedmont', AV: 'Campania', BA: 'Apulia',
  BG: 'Lombardy', BI: 'Piedmont', BL: 'Veneto', BN: 'Campania', BO: 'Emilia-Romagna',
  BR: 'Apulia', BS: 'Lombardy', BT: 'Apulia', BZ: 'Trentino-Alto Adige',
  CA: 'Sardinia', CB: 'Molise', CE: 'Campania', CH: 'Abruzzo', CL: 'Sicily',
  CN: 'Piedmont', CO: 'Lombardy', CR: 'Lombardy', CS: 'Calabria', CT: 'Sicily',
  CZ: 'Calabria', EN: 'Sicily', FC: 'Emilia-Romagna', FE: 'Emilia-Romagna',
  FG: 'Apulia', FI: 'Tuscany', FM: 'Marche', FR: 'Lazio', GE: 'Liguria',
  GO: 'Friuli-Venezia Giulia', GR: 'Tuscany', IM: 'Liguria', IS: 'Sardinia',
  KR: 'Calabria', LC: 'Lombardy', LE: 'Apulia', LI: 'Tuscany', LO: 'Lombardy',
  LT: 'Lazio', LU: 'Tuscany', MB: 'Lombardy', MC: 'Marche', ME: 'Sicily',
  MI: 'Lombardy', MN: 'Lombardy', MO: 'Emilia-Romagna', MS: 'Tuscany',
  MT: 'Basilicata', NA: 'Campania', NO: 'Piedmont', NU: 'Sardinia', OR: 'Sardinia',
  PA: 'Sicily', PC: 'Emilia-Romagna', PD: 'Veneto', PE: 'Abruzzo', PG: 'Umbria',
  PI: 'Tuscany', PN: 'Friuli-Venezia Giulia', PO: 'Tuscany', PR: 'Emilia-Romagna',
  PT: 'Tuscany', PU: 'Marche', PV: 'Lombardy', PZ: 'Basilicata', RA: 'Emilia-Romagna',
  RC: 'Calabria', RE: 'Emilia-Romagna', RG: 'Sicily', RI: 'Lazio', RM: 'Lazio',
  RN: 'Emilia-Romagna', RO: 'Veneto', SA: 'Campania', SI: 'Tuscany', SO: 'Lombardy',
  SP: 'Liguria', SR: 'Sicily', SS: 'Sardinia', SU: 'Sardinia', SV: 'Liguria',
  TA: 'Apulia', TE: 'Abruzzo', TN: 'Trentino-Alto Adige', TO: 'Piedmont',
  TP: 'Sicily', TR: 'Umbria', TS: 'Friuli-Venezia Giulia', TV: 'Veneto',
  UD: 'Friuli-Venezia Giulia', VA: 'Lombardy', VB: 'Piedmont', VC: 'Piedmont',
  VE: 'Veneto', VI: 'Veneto', VR: 'Veneto', VT: 'Lazio', VV: 'Calabria'
};

function decodeHtml(str = '') {
  return str
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripTags(str = '') {
  return decodeHtml(str)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function slugify(str = '') {
  return decodeHtml(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseMessage(message = '') {
  const decoded = decodeHtml(message);
  const numberedMatch = decoded.match(/<strong>\s*n\.\s*(\d+)\s+([^<]+)<\/strong>/i);
  const titleMatch = decoded.match(/<strong>\s*([^<]+)<\/strong>/i);
  const coordMatch = decoded.match(/<br>\s*([0-9.\-]+)\s*,?\s*([0-9.\-]+)\s*<br>/i);

  const benchNumber = numberedMatch ? Number(numberedMatch[1]) : null;
  const title = numberedMatch
    ? numberedMatch[2].trim()
    : titleMatch
      ? titleMatch[1].trim()
      : 'Unknown';

  return {
    benchNumber,
    title,
    latFromMessage: coordMatch ? Number(coordMatch[1]) : null,
    lngFromMessage: coordMatch ? Number(coordMatch[2]) : null,
    plainDescription: stripTags(message)
  };
}

function parseImageMeta(iconImage = '') {
  const filename = iconImage.split('/').pop() || '';
  const clean = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '').toLowerCase();

  if (clean.includes('z.benches-under-construction-icon')) {
    return { filename, province: null, isWipIcon: true };
  }

  const parts = clean.split('-');
  let province = null;

  if (parts.length >= 2) {
    const maybeProvince = parts[parts.length - 2];
    if (/^[a-z]{2}$/i.test(maybeProvince)) {
      province = maybeProvince.toUpperCase();
    }
  }

  return { filename, province, isWipIcon: false };
}

function inferCountry(iconImage = '', province = null) {
  const s = iconImage.toLowerCase();
  if (s.includes('-scotland-uk-') || province === 'UK') return 'United Kingdom';
  if (s.includes('-netherlands-')) return 'Netherlands';
  return 'Italy';
}

function inferRegion(country, province) {
  if (country !== 'Italy' || !province) return null;
  return PROVINCE_TO_REGION[province] || null;
}

function chooseLatLng(coords, parsed) {
  const lng = Array.isArray(coords) ? Number(coords[0]) : null;
  const lat = Array.isArray(coords) ? Number(coords[1]) : null;

  return {
    lat: Number.isFinite(lat) ? lat : parsed.latFromMessage,
    lng: Number.isFinite(lng) ? lng : parsed.lngFromMessage
  };
}

function dedupeBy(rows, key) {
  const map = new Map();

  for (const row of rows) {
    const value = row[key];
    if (value === null || value === undefined) continue;

    if (!map.has(value)) {
      map.set(value, row);
      continue;
    }

    const prev = map.get(value);
    const merged = { ...prev };

    for (const [k, v] of Object.entries(row)) {
      const isEmptyPrev =
        prev[k] === null ||
        prev[k] === undefined ||
        prev[k] === '' ||
        (Array.isArray(prev[k]) && prev[k].length === 0);

      if (isEmptyPrev && v !== null && v !== undefined && v !== '') {
        merged[k] = v;
      }
    }

    map.set(value, merged);
  }

  return [...map.values()];
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

function colorDistance(a, b) {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) +
    Math.pow(a.g - b.g, 2) +
    Math.pow(a.b - b.b, 2)
  );
}

function nearestColorName({ r, g, b }) {
  const palette = [
    { name: 'white', hex: '#ffffff', rgb: { r: 255, g: 255, b: 255 } },
    { name: 'black', hex: '#000000', rgb: { r: 0, g: 0, b: 0 } },
    { name: 'gray', hex: '#808080', rgb: { r: 128, g: 128, b: 128 } },
    { name: 'red', hex: '#ff0000', rgb: { r: 255, g: 0, b: 0 } },
    { name: 'orange', hex: '#ffa500', rgb: { r: 255, g: 165, b: 0 } },
    { name: 'yellow', hex: '#ffff00', rgb: { r: 255, g: 255, b: 0 } },
    { name: 'green', hex: '#008000', rgb: { r: 0, g: 128, b: 0 } },
    { name: 'blue', hex: '#0000ff', rgb: { r: 0, g: 0, b: 255 } },
    { name: 'purple', hex: '#800080', rgb: { r: 128, g: 0, b: 128 } },
    { name: 'pink', hex: '#ffc0cb', rgb: { r: 255, g: 192, b: 203 } },
    { name: 'brown', hex: '#8b4513', rgb: { r: 139, g: 69, b: 19 } }
  ];

  let best = palette[0];
  let bestDist = Infinity;

  for (const p of palette) {
    const d = colorDistance({ r, g, b }, p.rgb);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }

  return best.name;
}

async function downloadTempFile(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${url} (${res.status})`);

  const arr = await res.arrayBuffer();
  const tempFile = path.join(os.tmpdir(), `bench-${Date.now()}-${Math.random().toString(36).slice(2)}.png`);
  fs.writeFileSync(tempFile, Buffer.from(arr));
  return tempFile;
}

async function extractBenchColors(imageUrl) {
  const tempPath = await downloadTempFile(imageUrl);
  try {
    const img = await Jimp.read(tempPath);
    const { width, height, data } = img.bitmap;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.42;

    const leftPixels = [];
    const rightPixels = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > radius) continue;

        const idx = (width * y + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        if (a < 200) continue;

        const isVeryDark = r < 70 && g < 70 && b < 70;
        const isVeryLight = r > 245 && g > 245 && b > 245;

        if (isVeryDark || isVeryLight) continue;

        const pixel = { r, g, b };

        if (x < cx) leftPixels.push(pixel);
        else rightPixels.push(pixel);
      }
    }

    function average(pixels) {
      if (!pixels.length) return null;
      const sum = pixels.reduce(
        (acc, p) => {
          acc.r += p.r;
          acc.g += p.g;
          acc.b += p.b;
          return acc;
        },
        { r: 0, g: 0, b: 0 }
      );

      return {
        r: Math.round(sum.r / pixels.length),
        g: Math.round(sum.g / pixels.length),
        b: Math.round(sum.b / pixels.length)
      };
    }

    const left = average(leftPixels);
    const right = average(rightPixels);

    const colors = [];
    if (left) {
      colors.push({
        color_name: nearestColorName(left),
        color_hex: rgbToHex(left),
        sort_order: 0
      });
    }
    if (right) {
      const rightHex = rgbToHex(right);
      if (!colors.find(c => c.color_hex.toLowerCase() === rightHex.toLowerCase())) {
        colors.push({
          color_name: nearestColorName(right),
          color_hex: rightHex,
          sort_order: colors.length
        });
      }
    }

    return colors;
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

async function upsertInChunks(table, rows, onConflict, size = 500) {
  if (!rows.length) {
    console.log(`Skipping ${table}, no rows to import.`);
    return;
  }

  const batches = chunk(rows, size);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const { error } = await supabase.from(table).upsert(batch, { onConflict });

    if (error) {
      console.error(`Error in ${table} batch ${i + 1}/${batches.length}:`, error);
      process.exit(1);
    }

    console.log(`${table}: imported batch ${i + 1}/${batches.length} (${batch.length} rows)`);
  }
}

const officialRowsRaw = [];
const wipRowsRaw = [];

for (const feature of geojson.features || []) {
  const props = feature.properties || {};
  const coords = feature.geometry?.coordinates || [null, null];
  const message = props.message || '';
  const iconImage = props.iconImage || '';
  const sourceMarkerId = props.id ? Number(props.id) : null;

  const parsed = parseMessage(message);
  const imageMeta = parseImageMeta(iconImage);
  const country = inferCountry(iconImage, imageMeta.province);
  const region = inferRegion(country, imageMeta.province);
  const { lat, lng } = chooseLatLng(coords, parsed);

  const imageUrl = iconImage
    ? `https://bigbenchcommunityproject.org${iconImage}`
    : null;

  const isWip = imageMeta.isWipIcon || (!parsed.benchNumber && !!sourceMarkerId);

  const baseRow = {
    name: parsed.title,
    slug: parsed.benchNumber
      ? `${parsed.benchNumber}-${slugify(parsed.title)}`
      : sourceMarkerId
        ? `wip-${sourceMarkerId}-${slugify(parsed.title)}`
        : slugify(parsed.title),
    location: imageMeta.province ? `${parsed.title}, ${imageMeta.province}` : parsed.title,
    province: imageMeta.province,
    region,
    country,
    lat,
    lng,
    description: parsed.plainDescription,
    image_url: imageUrl,
    source_url: 'https://bigbenchcommunityproject.org/it/le-panchine-giganti',
    updated_at: new Date().toISOString()
  };

  if (isWip) {
    if (!sourceMarkerId || !lat || !lng) continue;
    wipRowsRaw.push({
      source_marker_id: sourceMarkerId,
      ...baseRow,
      notes: null
    });
  } else {
    if (!parsed.benchNumber || !lat || !lng) continue;
    officialRowsRaw.push({
      id: parsed.benchNumber,
      ...baseRow,
      altitude_m: null,
      artist: null,
      installed_on: null,
      is_official: true,
      colors: [],
      source_marker_id: sourceMarkerId
    });
  }
}

const officialRows = dedupeBy(officialRowsRaw, 'id');
const wipRows = dedupeBy(wipRowsRaw, 'source_marker_id');

async function buildBenchColors(rows) {
  const result = [];
  for (const row of rows) {
    if (!row.image_url) continue;

    try {
      const colors = await extractBenchColors(row.image_url);

      row.colors = colors.map(c => c.color_hex);

      for (const color of colors) {
        result.push({
          bench_id: row.id,
          color_name: color.color_name,
          color_hex: color.color_hex,
          sort_order: color.sort_order
        });
      }

      console.log(`Extracted ${colors.length} colors for bench ${row.id}`);
    } catch (err) {
      console.warn(`Failed color extraction for bench ${row.id}: ${err.message}`);
    }
  }

  const unique = [];
  const seen = new Set();

  for (const row of result) {
    const key = `${row.bench_id}|${row.color_name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }

  return unique;
}

async function migrate() {
  console.log(`Official benches parsed: ${officialRows.length}`);
  console.log(`WIP benches parsed: ${wipRows.length}`);

  const benchColors = await buildBenchColors(officialRows);
  console.log(`Bench colors extracted: ${benchColors.length}`);

  await upsertInChunks('benches', officialRows, 'id');
  await upsertInChunks('bench_wip', wipRows, 'source_marker_id');
  await upsertInChunks('bench_colors', benchColors, 'bench_id,color_name');

  console.log('Migration completed successfully.');
}

migrate().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
