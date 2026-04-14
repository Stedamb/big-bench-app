export interface BigBench {
  id: number;
  name: string;
  number: number;
  color: string;
  location: string;
  region: string;
  lat: number;
  lng: number;
  altitude: number;
  description: string;
  artist?: string;
  installed: string;
  photos: string[];
}

export const bigBenches: BigBench[] = [
  {
    id: 1, number: 1, name: "Panchina Rossa di Clavesana",
    color: "Rossa", location: "Clavesana", region: "Piemonte",
    lat: 44.4833, lng: 7.9167, altitude: 450,
    description: "La prima Big Bench, creata da Chris Bangle nel 2010. Una panchina gigante rossa che domina le colline delle Langhe con vista mozzafiato sui vigneti.",
    artist: "Chris Bangle", installed: "2010",
    photos: []
  },
  {
    id: 2, number: 2, name: "Panchina Viola di Monforte",
    color: "Viola", location: "Monforte d'Alba", region: "Piemonte",
    lat: 44.5833, lng: 7.9667, altitude: 480,
    description: "Situata tra i vigneti di Barolo, questa panchina viola offre una vista panoramica sulle colline UNESCO delle Langhe.",
    installed: "2015",
    photos: []
  },
  {
    id: 3, number: 3, name: "Panchina Gialla di Barbaresco",
    color: "Gialla", location: "Barbaresco", region: "Piemonte",
    lat: 44.7250, lng: 8.0783, altitude: 300,
    description: "Un punto panoramico eccezionale sulle vigne di Barbaresco, con la torre medievale sullo sfondo.",
    installed: "2016",
    photos: []
  },
  {
    id: 4, number: 10, name: "Panchina Azzurra del Lago",
    color: "Azzurra", location: "Lago di Garda", region: "Veneto",
    lat: 45.6389, lng: 10.7167, altitude: 200,
    description: "Affacciata sul Lago di Garda, questa panchina azzurra riflette i colori delle acque sottostanti.",
    installed: "2018",
    photos: []
  },
  {
    id: 5, number: 15, name: "Panchina Verde di Asiago",
    color: "Verde", location: "Asiago", region: "Veneto",
    lat: 45.8756, lng: 11.5103, altitude: 1000,
    description: "Immersa nell'altopiano di Asiago, questa panchina verde si fonde con i prati alpini circostanti.",
    installed: "2019",
    photos: []
  },
  {
    id: 6, number: 20, name: "Panchina Arancione di Bergamo",
    color: "Arancione", location: "Bergamo", region: "Lombardia",
    lat: 45.6983, lng: 9.6773, altitude: 380,
    description: "Con vista sulla pianura padana e le Alpi, questa panchina arancione cattura i tramonti più belli della Lombardia.",
    installed: "2019",
    photos: []
  },
  {
    id: 7, number: 25, name: "Panchina Blu di Trento",
    color: "Blu", location: "Trento", region: "Trentino-Alto Adige",
    lat: 46.0748, lng: 11.1217, altitude: 600,
    description: "Posizionata sulle colline sopra Trento, questa panchina blu offre una vista spettacolare sulla valle dell'Adige.",
    installed: "2020",
    photos: []
  },
  {
    id: 8, number: 30, name: "Panchina Rosa del Monviso",
    color: "Rosa", location: "Saluzzo", region: "Piemonte",
    lat: 44.6500, lng: 7.4833, altitude: 700,
    description: "Ai piedi del Monviso, il Re di Pietra, questa panchina rosa celebra la maestosità delle Alpi piemontesi.",
    installed: "2020",
    photos: []
  },
  {
    id: 9, number: 35, name: "Panchina Bianca di Cortina",
    color: "Bianca", location: "Cortina d'Ampezzo", region: "Veneto",
    lat: 46.5369, lng: 12.1356, altitude: 1200,
    description: "Nel cuore delle Dolomiti, questa panchina bianca si mimetizza con le cime innevate circostanti.",
    installed: "2021",
    photos: []
  },
  {
    id: 10, number: 40, name: "Panchina Turchese di Finale",
    color: "Turchese", location: "Finale Ligure", region: "Liguria",
    lat: 44.1692, lng: 8.3436, altitude: 250,
    description: "Affacciata sulla Riviera di Ponente, questa panchina turchese cattura i colori del mare ligure.",
    installed: "2021",
    photos: []
  },
  {
    id: 11, number: 50, name: "Panchina Rossa di Verona",
    color: "Rossa", location: "Sant'Ambrogio di Valpolicella", region: "Veneto",
    lat: 45.5167, lng: 10.8333, altitude: 350,
    description: "Tra i vigneti della Valpolicella, patria dell'Amarone, questa panchina rossa domina la valle.",
    installed: "2022",
    photos: []
  },
  {
    id: 12, number: 55, name: "Panchina Lilla delle Cinque Terre",
    color: "Lilla", location: "La Spezia", region: "Liguria",
    lat: 44.1461, lng: 9.6556, altitude: 300,
    description: "Con vista sul Golfo dei Poeti, questa panchina lilla è un omaggio ai colori della macchia mediterranea.",
    installed: "2022",
    photos: []
  },
];

export const benchColorMap: Record<string, string> = {
  "Rossa": "#C4572A",
  "Viola": "#7C3AED",
  "Gialla": "#EAB308",
  "Azzurra": "#3B82F6",
  "Verde": "#5B7553",
  "Arancione": "#EA580C",
  "Blu": "#1D4ED8",
  "Rosa": "#EC4899",
  "Bianca": "#E5E7EB",
  "Turchese": "#14B8A6",
  "Lilla": "#A78BFA",
};
