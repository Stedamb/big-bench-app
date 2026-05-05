-- Create benches table
CREATE TABLE IF NOT EXISTS public.benches (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  location TEXT NOT NULL,
  province TEXT,
  region TEXT,
  country TEXT NOT NULL DEFAULT 'IT',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  altitude_m INTEGER,
  description TEXT,
  artist TEXT,
  installed_on TEXT,
  is_official BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  source_marker_id INTEGER
);

-- Create bench_colors table
CREATE TABLE IF NOT EXISTS public.bench_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bench_id INTEGER NOT NULL REFERENCES public.benches(id) ON DELETE CASCADE,
  color_hex TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.benches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bench_colors ENABLE ROW LEVEL SECURITY;

-- Benches are publicly readable
CREATE POLICY "Benches are viewable by everyone"
  ON public.benches FOR SELECT USING (true);

-- Bench colors are publicly readable
CREATE POLICY "Bench colors are viewable by everyone"
  ON public.bench_colors FOR SELECT USING (true);

-- Seed benches
INSERT INTO public.benches (id, name, slug, location, region, country, lat, lng, altitude_m, description, artist, installed_on, is_official) VALUES
(1, 'Panchina Rossa di Clavesana', 'panchina-rossa-di-clavesana', 'Clavesana', 'Piemonte', 'IT', 44.4833, 7.9167, 450, 'La prima Big Bench, creata da Chris Bangle nel 2010. Una panchina gigante rossa che domina le colline delle Langhe con vista mozzafiato sui vigneti.', 'Chris Bangle', '2010-01-01', true),
(2, 'Panchina Viola di Monforte', 'panchina-viola-di-monforte', 'Monforte d''Alba', 'Piemonte', 'IT', 44.5833, 7.9667, 480, 'Situata tra i vigneti di Barolo, questa panchina viola offre una vista panoramica sulle colline UNESCO delle Langhe.', NULL, '2015-01-01', true),
(3, 'Panchina Gialla di Barbaresco', 'panchina-gialla-di-barbaresco', 'Barbaresco', 'Piemonte', 'IT', 44.7250, 8.0783, 300, 'Un punto panoramico eccezionale sulle vigne di Barbaresco, con la torre medievale sullo sfondo.', NULL, '2016-01-01', true),
(4, 'Panchina Azzurra del Lago', 'panchina-azzurra-del-lago', 'Lago di Garda', 'Veneto', 'IT', 45.6389, 10.7167, 200, 'Affacciata sul Lago di Garda, questa panchina azzurra riflette i colori delle acque sottostanti.', NULL, '2018-01-01', true),
(5, 'Panchina Verde di Asiago', 'panchina-verde-di-asiago', 'Asiago', 'Veneto', 'IT', 45.8756, 11.5103, 1000, 'Immersa nell''altopiano di Asiago, questa panchina verde si fonde con i prati alpini circostanti.', NULL, '2019-01-01', true),
(6, 'Panchina Arancione di Bergamo', 'panchina-arancione-di-bergamo', 'Bergamo', 'Lombardia', 'IT', 45.6983, 9.6773, 380, 'Con vista sulla pianura padana e le Alpi, questa panchina arancione cattura i tramonti più belli della Lombardia.', NULL, '2019-01-01', true),
(7, 'Panchina Blu di Trento', 'panchina-blu-di-trento', 'Trento', 'Trentino-Alto Adige', 'IT', 46.0748, 11.1217, 600, 'Posizionata sulle colline sopra Trento, questa panchina blu offre una vista spettacolare sulla valle dell''Adige.', NULL, '2020-01-01', true),
(8, 'Panchina Rosa del Monviso', 'panchina-rosa-del-monviso', 'Saluzzo', 'Piemonte', 'IT', 44.6500, 7.4833, 700, 'Ai piedi del Monviso, il Re di Pietra, questa panchina rosa celebra la maestosità delle Alpi piemontesi.', NULL, '2020-01-01', true),
(9, 'Panchina Bianca di Cortina', 'panchina-bianca-di-cortina', 'Cortina d''Ampezzo', 'Veneto', 'IT', 46.5369, 12.1356, 1200, 'Nel cuore delle Dolomiti, questa panchina bianca si mimetizza con le cime innevate circostanti.', NULL, '2021-01-01', true),
(10, 'Panchina Turchese di Finale', 'panchina-turchese-di-finale', 'Finale Ligure', 'Liguria', 'IT', 44.1692, 8.3436, 250, 'Affacciata sulla Riviera di Ponente, questa panchina turchese cattura i colori del mare ligure.', NULL, '2021-01-01', true),
(11, 'Panchina Rossa di Verona', 'panchina-rossa-di-verona', 'Sant''Ambrogio di Valpolicella', 'Veneto', 'IT', 45.5167, 10.8333, 350, 'Tra i vigneti della Valpolicella, patria dell''Amarone, questa panchina rossa domina la valle.', NULL, '2022-01-01', true),
(12, 'Panchina Lilla delle Cinque Terre', 'panchina-lilla-delle-cinque-terre', 'La Spezia', 'Liguria', 'IT', 44.1461, 9.6556, 300, 'Con vista sul Golfo dei Poeti, questa panchina lilla è un omaggio ai colori della macchia mediterranea.', NULL, '2022-01-01', true)
ON CONFLICT (id) DO NOTHING;

-- Seed bench colors
INSERT INTO public.bench_colors (bench_id, color_hex, sort_order) VALUES
(1, '#C4572A', 0),
(2, '#7C3AED', 0),
(3, '#EAB308', 0),
(4, '#3B82F6', 0),
(5, '#5B7553', 0),
(6, '#EA580C', 0),
(7, '#1D4ED8', 0),
(8, '#EC4899', 0),
(9, '#E5E7EB', 0),
(10, '#14B8A6', 0),
(11, '#C4572A', 0),
(12, '#A78BFA', 0)
ON CONFLICT DO NOTHING;
