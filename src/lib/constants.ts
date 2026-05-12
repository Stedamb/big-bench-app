export const regionTranslation: Record<string, string> = {
  "Piedmont": "Piemonte",
  "Lombardy": "Lombardia",
  "Tuscany": "Toscana",
  "Sicily": "Sicilia",
  "Sardinia": "Sardegna",
  "Apulia": "Puglia",
  "Aosta Valley": "Valle d'Aosta",
  "Marche": "Marche",
  "Basilicata": "Basilicata",
  "Abruzzo": "Abruzzo",
  "Friuli-Venezia Giulia": "Friuli-Venezia Giulia",
  "Trentino-Alto Adige": "Trentino-Alto Adige",
  "Lazio": "Lazio",
  "Molise": "Molise",
  "Umbria": "Umbria",
  "Veneto": "Veneto",
  "Liguria": "Liguria",
  "Calabria": "Calabria",
  "Emilia-Romagna": "Emilia-Romagna",
  "Campania": "Campania",
};

export const countryTranslation: Record<string, string> = {
  "Belgium": "Belgio",
  "France": "Francia",
  "Germany": "Germania",
  "Italy": "Italia",
  "Netherlands": "Paesi Bassi",
  "Poland": "Polonia",
  "Romania": "Romania",
  "Spain": "Spagna",
  "Sweden": "Svezia",
  "UK": "Regno Unito",
  "United Kingdom": "Regno Unito",
};

export const translateRegion = (region: string | null) => {
  if (!region) return "";
  return regionTranslation[region] || region;
};

export const translateCountry = (country: string | null) => {
  if (!country) return "";
  return countryTranslation[country] || country;
};
