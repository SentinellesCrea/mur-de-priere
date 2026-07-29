import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });
dotenv.config();

const APPLY = process.argv.includes("--apply");
const VERIFY_ONLY = process.argv.includes("--verify");
const CURATED_ONLY = process.argv.includes("--curated-only");
const REPAIR_COORDINATES = process.argv.includes("--repair-coordinates");
const GEOCODE_REPAIR = process.argv.includes("--geocode");
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/PrayerWallDB";
const DB_NAME = "PrayerWallDB";
const REQUEST_DELAY_MS = 1100;
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const VERIFIED_AT = new Date("2026-07-29T00:00:00.000Z");

const momentumUrl = "https://eglisemomentum.com/contact/";
const victoryUrl = "https://eglisedelavictoire.com/eglise/";
const chapelleUrl = "https://lachapelle.me/bienvenue/";
const compassionUrl = "https://egliselacompassion.org/";
const ceevUrl = "https://www.monegliseceev.net/";
const ceafUrl = "https://ceaf.fr/index.php/eglises-membres/";

function networkChurch(networkName, campusName, values = {}) {
  return {
    name: `${networkName} — ${campusName}`,
    networkName,
    campusName,
    tradition: "Évangélique",
    denomination: values.denomination || networkName,
    aliases: values.aliases || [],
    languages: values.languages || ["Français"],
    childrenWelcome: values.childrenWelcome ?? true,
    accessibility: values.accessibility ?? false,
    ...values,
  };
}

const CURATED_CHURCHES = [
  networkChurch("Église Momentum", "Bordeaux", {
    address: "75 rue Édouard Herriot", city: "Lormont", postalCode: "33310",
    region: "Nouvelle-Aquitaine", country: "France", countryCode: "FR",
    serviceTimes: "Vendredi 20h ; dimanche 9h, 11h et 13h",
    source: "eglisemomentum.com", sourceId: "bordeaux", sourceUrl: "https://eglisemomentum.com/bordeaux/", website: "https://eglisemomentum.com/bordeaux/",
  }),
  networkChurch("Église Momentum", "Paris", {
    address: "Espace Charenton, 327 rue de Charenton", city: "Paris", postalCode: "75012",
    region: "Île-de-France", country: "France", countryCode: "FR",
    leaderName: "Matthieu et Laetitia Perraud", serviceTimes: "Dimanche 10h30",
    description: "Adresse annoncée pour juillet et août 2026 ; fiche à revérifier après l’été.",
    source: "eglisemomentum.com", sourceId: "paris", sourceUrl: "https://eglisemomentum.com/paris/", website: "https://eglisemomentum.com/paris/",
  }),
  networkChurch("Église Momentum", "Bruxelles", {
    address: "Dôme Eventhall, Boulevard Lambermont 1", city: "Bruxelles", postalCode: "1000",
    region: "Bruxelles-Capitale", country: "Belgique", countryCode: "BE",
    serviceTimes: "Dimanche 10h", source: "eglisemomentum.com", sourceId: "bruxelles",
    sourceUrl: "https://eglisemomentum.com/bruxelles/", website: "https://eglisemomentum.com/bruxelles/",
  }),

  networkChurch("Église de la Victoire", "Cowansville", {
    address: "809 rue Sud", city: "Cowansville", postalCode: "J2K 2Y5",
    region: "Québec", country: "Canada", countryCode: "CA", leaderName: "Joël Spinks",
    serviceTimes: "Dimanche 10h30 à 12h15", phone: "+1 877 279 0075",
    source: "eglisedelavictoire.com", sourceId: "cowansville", sourceUrl: victoryUrl, website: victoryUrl,
  }),
  networkChurch("Église de la Victoire", "La Chapelle de la Victoire Mons", {
    name: "La Chapelle de la Victoire — Mons", address: "1 boulevard André Delvaux",
    city: "Mons", postalCode: "7000", region: "Hainaut", country: "Belgique", countryCode: "BE",
    leaderName: "Daniel Jonathan Nembunzu", serviceTimes: "Dimanche 10h30",
    source: "eglisedelavictoire.com", sourceId: "mons", sourceUrl: "https://eglisedelavictoire.com/la-chapelle-de-la-victoire/", website: "https://eglisedelavictoire.com/la-chapelle-de-la-victoire/",
  }),

  ...[
    ["Pointe-Saint-Charles", "Le Bungalow, 1751 rue Richardson", "Montréal", "H3K 1G6", "9h30 et 11h30"],
    ["Cartierville", "4545 rue de Salaberry", "Montréal", "H4J 1H5", "10h"],
    ["Mile End", "Théâtre Fairmount, 5240 avenue du Parc", "Montréal", "H2V 4G7", "18h"],
    ["Gatineau", "Cinéma Starcité, 115 boulevard du Plateau", "Gatineau", "J9A 3G1", "9h45"],
  ].map(([campusName, address, city, postalCode, serviceTimes]) =>
    networkChurch("La Chapelle", campusName, {
      address, city, postalCode, region: "Québec", country: "Canada", countryCode: "CA",
      denomination: "Baptiste évangélique", phone: "+1 514 360 3727",
      serviceTimes: `Dimanche ${serviceTimes}`, source: "lachapelle.me",
      sourceId: campusName.toLowerCase().replaceAll(" ", "-"), sourceUrl: chapelleUrl, website: chapelleUrl,
    })
  ),

  ...[
    ["Limete", "2ème rue, quartier Industriel, numéro 4", "Kinshasa", "", "République démocratique du Congo", "CD", "Marcello Tunasi", "(+243) 81 506 7881", "contact@egliselacompassion.org", "https://egliselacompassion.org/extensions/limete/"],
    ["Douala", "711 rue Toyota, Bonapriso, près de la clinique IDIMED", "Douala", "", "Cameroun", "CM", "Marco Makolo", "+237 6 90 48 80 84", "douala@egliselacompassion.org", "https://egliselacompassion.org/extensions/paris-2/"],
    ["Paris", "71 rue Étienne Dolet", "Alfortville", "94140", "France", "FR", "Cospiel", "+32 486 16 35 50", "egliselacompassionparis@gmail.com", "https://egliselacompassion.org/extensions/paris/"],
    ["Bruxelles", "47 rue du Patinage", "Bruxelles", "1190", "Belgique", "BE", "Joseph Yoni Kasongo", "+32 486 16 35 50", "egliselacompassion@gmail.com", "https://egliselacompassion.org/extensions/bruxelles/"],
    ["Montréal", "920 rue Provost", "Lachine", "H8S 1M9", "Canada", "CA", "Marco Manolo", "+1 514 668 5627", "infoeglise@lacompassionmontreal.ca", "https://egliselacompassion.org/extensions/montreal/"],
    ["Lille", "64 rue des Bonnets", "Lille", "59000", "France", "FR", "Marco Manolo", "+33 7 45 15 13 37", "egliselacompassionlille@gmail.com", "https://egliselacompassion.org/extensions/lille/"],
  ].map(([campusName, address, city, postalCode, country, countryCode, leaderName, phone, email, sourceUrl]) =>
    networkChurch("Église La Compassion", campusName, {
      address, city, postalCode, country, countryCode, leaderName, phone, email,
      serviceTimes: "Mercredi 17h–19h30 ; vendredi 23h–5h ; dimanche 8h–10h30 et 11h30–14h",
      source: "egliselacompassion.org", sourceId: campusName.toLowerCase().replaceAll("é", "e"), sourceUrl, website: sourceUrl,
    })
  ),

  ...[
    ["Bordeaux", "244 avenue de Thouars", "Talence", "33400", "France", "FR", "+33 6 61 16 50 00"],
    ["Vaucluse", "Chemin de Vaucluse", "Althen-des-Paluds", "84210", "France", "FR", "+33 6 64 84 26 39"],
    ["Libourne", "12 avenue Georges Clemenceau", "Libourne", "33500", "France", "FR", "+33 7 87 27 73 27"],
    ["Toulouse", "6 bis rue Jules Raimu", "Toulouse", "31200", "France", "FR", "+33 7 49 61 31 07"],
    ["Paris", "60 avenue du Capitaine Glarner", "Saint-Ouen-sur-Seine", "93400", "France", "FR", "+33 7 80 80 77 58"],
    ["Perpignan", "Hôtel Mercure, 5 cours François Palmarole", "Perpignan", "66000", "France", "FR", "+33 6 25 28 04 22"],
    ["Libreville", "Après l’échangeur d’IAI, à côté de la clinique Bethesda", "Libreville", "", "Gabon", "GA", "+241 06 255 00 65"],
    ["Port-Gentil", "Derrière le lycée d’État Ambourouet Avaro, près de la clinique Saint-Antoine", "Port-Gentil", "", "Gabon", "GA", "+241 07 44 14 78"],
    ["Franceville", "Entrée du CIRMF, face à l’école de santé EPASS", "Franceville", "", "Gabon", "GA", "+241 65 819 827"],
    ["Mouila", "Point 9, derrière l’ancien siège d’Airtel", "Mouila", "", "Gabon", "GA", "+241 07 46 40 86"],
  ].map(([campusName, address, city, postalCode, country, countryCode, phone]) =>
    networkChurch("Centre d’Évangélisation Esprit et Vie", campusName, {
      name: `CEEV — ${campusName}`, aliases: ["CEEV", "Centre d'Évangélisation Esprit et Vie"],
      address, city, postalCode, country, countryCode, phone,
      leaderName: campusName === "Bordeaux" ? "Sosthène et Nina Mabouadi" : "",
      denomination: "Foursquare", source: "monegliseceev.net",
      sourceId: campusName.toLowerCase().replaceAll("é", "e"), sourceUrl: ceevUrl, website: ceevUrl,
    })
  ),

  networkChurch("Assemblée Chrétienne pour l’Évangélisation et le Réveil", "Paris", {
    name: "ACER Paris", aliases: ["ACER"], address: "36 avenue du Président Salvador Allende",
    city: "Montreuil", postalCode: "93100", region: "Île-de-France", country: "France", countryCode: "FR",
    leaderName: "Alain-Patrick Tsengue", phone: "+33 6 36 91 21 74", email: "eglise.acerparis@gmail.com",
    serviceTimes: "Dimanche 9h30, 11h15, 13h15, 15h15 et 17h15",
    source: "acerparis.fr", sourceId: "paris", sourceUrl: "https://www.acerparis.fr/contact/", website: "https://www.acerparis.fr/",
  }),
  networkChurch("Assemblée Chrétienne pour l’Évangélisation et le Réveil", "Montréal", {
    name: "ACER Montréal", aliases: ["ACER"], address: "998 rue Notre-Dame",
    city: "Montréal", region: "Québec", country: "Canada", countryCode: "CA",
    leaderName: "Gentil et Grace Mafoua", phone: "+1 438 528 9211", email: "contact@egliseacercanada.com",
    source: "egliseacercanada.com", sourceId: "montreal", sourceUrl: "https://egliseacercanada.com/", website: "https://egliseacercanada.com/",
  }),
  networkChurch("Assemblée Chrétienne pour l’Évangélisation et le Réveil", "Rennes", {
    name: "ACER Rennes", aliases: ["ACER"], address: "36 rue des Veyettes",
    city: "Rennes", postalCode: "35000", region: "Bretagne", country: "France", countryCode: "FR",
    source: "pagesjaunes.fr", sourceId: "62871090",
    sourceUrl: "https://www.pagesjaunes.fr/pros/62871090",
  }),
  networkChurch("Assemblée Chrétienne pour l’Évangélisation et le Réveil", "Brest", {
    name: "ACER Brest", aliases: ["ACER"], address: "18 rue du Commandant Groix",
    city: "Brest", postalCode: "29200", region: "Bretagne", country: "France", countryCode: "FR",
    phone: "+33 6 98 72 11 42", source: "pagesjaunes.fr", sourceId: "60211553",
    sourceUrl: "https://www.pagesjaunes.fr/pros/60211553",
  }),
  networkChurch("Assemblée Chrétienne pour l’Évangélisation et le Réveil", "Nantes", {
    name: "ACER Nantes", aliases: ["ACER"], address: "10 rue du Remouleur",
    city: "Saint-Herblain", postalCode: "44800", region: "Pays de la Loire", country: "France", countryCode: "FR",
    accessibility: true, source: "google-business", sourceId: "8610934739824017748",
    sourceUrl: "https://www.google.com/maps/search/ACER+Nantes+église",
    website: "https://www.instagram.com/acer_eglise_nantes",
  }),
  networkChurch("Assemblée Chrétienne pour l’Évangélisation et le Réveil", "Lyon", {
    name: "ACER Lyon", aliases: ["ACER"], address: "33 rue Louis Saillant",
    city: "Vaulx-en-Velin", postalCode: "69120", region: "Auvergne-Rhône-Alpes", country: "France", countryCode: "FR",
    email: "egliseacerlyon@gmail.com", source: "acerlyon.fr", sourceId: "lyon",
    sourceUrl: "https://www.acerlyon.fr/", website: "https://www.acerlyon.fr/",
  }),
  networkChurch("Assemblée Chrétienne pour l’Évangélisation et le Réveil", "Montpellier", {
    name: "ACER Montpellier", aliases: ["ACER"], address: "66 rue Léon Morane",
    city: "Mauguio", postalCode: "34130", region: "Occitanie", country: "France", countryCode: "FR",
    phone: "+33 6 36 91 21 74", email: "iam.acermontpellier@gmail.com",
    leaderName: "Bertin et Khessia Odanvi", serviceTimes: "Dimanche 10h15 et 13h",
    source: "acer-montpellier.com", sourceId: "montpellier",
    sourceUrl: "https://www.acer-montpellier.com/", website: "https://www.acer-montpellier.com/",
  }),
  networkChurch("Assemblée Chrétienne pour l’Évangélisation et le Réveil", "Saint-Étienne", {
    name: "ACER Saint-Étienne", aliases: ["ACER"], address: "70 rue Bergson",
    city: "Saint-Étienne", postalCode: "42000", region: "Auvergne-Rhône-Alpes", country: "France", countryCode: "FR",
    phone: "+33 6 05 74 21 74", source: "cylex-locale.fr", sourceId: "acer-saint-etienne",
    sourceUrl: "https://www.cylex-locale.fr/saint-etienne/église-évangélique/",
  }),
  networkChurch("Assemblée Chrétienne pour l’Évangélisation et le Réveil", "Martinique", {
    name: "ACER Martinique", aliases: ["ACER"], address: "Zone industrielle Cocotte Canal",
    city: "Ducos", postalCode: "97224", region: "Martinique", country: "Martinique", countryCode: "MQ",
    coordinates: { type: "Point", coordinates: [-60.9792898, 14.5711509] },
    source: "acer-local-events", sourceId: "martinique-ducos",
    sourceUrl: "https://my.weezevent.com/conference-rafraichissement-boost",
  }),
  networkChurch("Église Martin Luther King", "Grand Paris", {
    name: "Église Martin Luther King — Grand Paris", aliases: ["MLK"],
    address: "Espace Grand Paris, 1 rue Martin Luther King", city: "Créteil", postalCode: "94000",
    region: "Île-de-France", country: "France", countryCode: "FR",
    source: "eglisemlk.fr", sourceId: "grand-paris", sourceUrl: "https://eglisemlk.fr/nous-connaitre/premiere-visite/", website: "https://eglisemlk.fr/",
  }),
  networkChurch("Porte Ouverte Chrétienne", "Mulhouse", {
    name: "Porte Ouverte Chrétienne de Mulhouse", aliases: ["POC"],
    address: "62 rue de Kingersheim", city: "Mulhouse", postalCode: "68200",
    region: "Grand Est", country: "France", countryCode: "FR", leaderName: "Samuel Peterschmitt",
    phone: "+33 3 89 50 44 22", email: "contact@porte-ouverte.com",
    denomination: "Pentecôtiste", serviceTimes: "Dimanche 9h30–12h ; mardi 19h30–21h",
    source: "porte-ouverte.com", sourceId: "mulhouse", sourceUrl: "https://porte-ouverte.com/contact/", website: "https://porte-ouverte.com/",
  }),
  {
    name: "Église Bordeaux République", aliases: ["Bordeaux République"],
    address: "16 rue Edmond Labasse", city: "Bordeaux", postalCode: "33200",
    region: "Nouvelle-Aquitaine", country: "France", countryCode: "FR",
    tradition: "Évangélique", denomination: "Évangélique",
    phone: "+33 5 57 81 61 00", email: "secretariatbordeauxrepublique@gmail.com",
    serviceTimes: "Dimanche 10h ; mardi 19h30", childrenWelcome: true, accessibility: false,
    source: "eglisebordeauxrepublique.com", sourceId: "bordeaux", sourceUrl: "https://www.eglisebordeauxrepublique.com/", website: "https://www.eglisebordeauxrepublique.com/",
  },
];

const CEAF_ILE_DE_FRANCE = [
  ["Assemblée Chrétienne Fleuve de Vie", "11 rue Jean Rostand", "Combs-la-Ville", "77380", "George Aggrey", "+33 6 52 31 17 74", "Dimanche 10h"],
  ["Assemblée Évangélique Le Rocher", "36 avenue du Président Salvador Allende", "Montreuil", "93100", "Félicien Mas Miangu", "+33 9 53 64 36 11", "Vendredi 19h–21h ; dimanche 9h30–12h30"],
  ["Assemblée Évangélique Parole de Vie", "1 rue du Docteur Roux", "Choisy-le-Roi", "94600", "Guy Kanokaya", "+33 6 99 08 11 85", ""],
  ["Assemblée Évangélique Arche de Paix", "75 rue de la Briche", "Saint-Denis", "93200", "Georgine et Louis Moke", "+33 1 49 46 92 12", "Dimanche 10h"],
  ["Centre d’Évangélisation La Résurrection", "20-22 rue Jean Allemane", "Villetaneuse", "93430", "Bienvenu Pululu", "+33 6 26 85 40 08", "Dimanche 14h"],
  ["Centre d’Évangélisation Le Réveil", "52 rue Ernest Renan", "Nanterre", "92000", "Jean-Pierre Ngoy", "+33 6 20 64 87 02", "Dimanche 10h"],
  ["Centre Chrétien d’Évangélisation Amour et Vérité", "122 rue de Paris", "Montreuil", "93100", "Philippe Ndjoli", "+33 1 48 35 99 59", "Dimanche 10h"],
  ["Centre Béthel", "5 allée des Souches", "Achères", "78260", "Adama Israël Ouedraogo", "", "Dimanche 10h"],
  ["Église Évangélique Parole de Vie", "17-19 rue Gustave Eiffel", "Bondoufle", "91070", "Guy Bompolonga", "+33 1 60 77 18 07", ""],
  ["Église Évangélique Eben-Ezer", "2 rue des Cosmonautes", "Choisy-le-Roi", "94600", "Esther Shungu", "+33 1 58 42 05 76", ""],
  ["Église Cité de la Grâce", "5 rue de Montespan", "Évry-Courcouronnes", "91000", "Alain Makanda", "", ""],
  ["Église Évangélique de France — Goussainville", "26 rue Jacques Anquetil", "Goussainville", "95190", "", "", ""],
  ["Église Évangélique de France — Les Mureaux", "57 avenue de la République", "Les Mureaux", "78130", "", "", ""],
  ["Église UEESO de France", "39 rue des Deux Gares", "Mantes-la-Ville", "78711", "Roger Deheye", "", "Dimanche 10h30"],
  ["Église CCE JENES", "34 avenue du Président Salvador Allende", "Montreuil", "93100", "Daniel Biana", "", ""],
  ["Église Évangélique Les Bâtisseurs de la Cité", "6 rue du 19 Mars 1962", "Ivry-sur-Seine", "94200", "Céleste Gnassounou", "", "Dimanche 14h30"],
  ["Église Évangélique Gethsémané", "22-24 rue Jean Allemane", "Villetaneuse", "93430", "Emmanuel Manpasi", "", ""],
  ["Église Évangélique Antioche", "8 boulevard Gallieni", "Gennevilliers", "92230", "Michel Tahi", "", "Dimanche 9h–12h"],
  ["Église Gethsémané Centre Percée-Reflets", "5 avenue Condorcet", "Juvisy-sur-Orge", "91260", "Arthur Kale Libie", "", ""],
  ["Église Protestante Méthodiste John Wesley", "95 rue de l’Ouest", "Paris", "75014", "", "", "Dimanche 13h–15h ; 3e dimanche 10h30–12h"],
  ["Église Parole de Grâce", "24 rue Jules Vallès", "Pierrefitte-sur-Seine", "93380", "Jacques Maluma Ngayebi", "", "Dimanche 10h"],
  ["Firm Founders Ministries", "24 rue Léonard de Vinci", "Cesson", "77240", "", "", ""],
  ["Le Jubilé", "1 rue Étienne Dolet", "Alfortville", "94140", "", "", ""],
  ["Paris Centre Chrétien", "7 rue Pascal", "La Courneuve", "93120", "", "", ""],
  ["Phila Cité des Adorateurs", "8 rue Saint-Claude", "Pontault-Combault", "77340", "", "", "Dimanche 10h"],
  ["Vision Vie Évangélique Meaux", "16 avenue Louise Michel", "Nanteuil-lès-Meaux", "77100", "", "", ""],
].map(([name, address, city, postalCode, leaderName, phone, serviceTimes]) => ({
  name, address, city, postalCode, region: "Île-de-France", country: "France", countryCode: "FR",
  tradition: name.includes("Protestante") ? "Protestante" : "Évangélique",
  denomination: name.includes("Méthodiste") ? "Méthodiste" : "Évangélique",
  leaderName, phone, serviceTimes, languages: ["Français"], childrenWelcome: true, accessibility: false,
  source: "ceaf.fr", sourceId: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  sourceUrl: ceafUrl, website: ceafUrl,
}));

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function normalize(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ").trim().toLowerCase();
}

function searchFields(church) {
  const aliases = [...new Set([...(church.aliases || [])].filter(Boolean))];
  const tokens = (...values) => [...new Set(values.flat(Infinity)
    .flatMap((value) => normalize(value).split(" ")).filter((token) => token.length >= 2))].slice(0, 100);
  return {
    aliases,
    normalizedName: normalize(church.name),
    normalizedCity: normalize(church.city),
    normalizedPostalCode: normalize(church.postalCode),
    normalizedCountry: normalize(church.country),
    normalizedAliases: aliases.map(normalize),
    searchTokens: tokens(church.name, church.address, church.city, church.postalCode, church.country, church.region, church.tradition, church.denomination, church.networkName, church.campusName, aliases),
    locationTokens: tokens(church.address, church.city, church.postalCode, church.country, church.region),
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: "application/json", "User-Agent": "PrayerWall church directory importer", ...options.headers },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function geocode(church) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "fr");
  url.searchParams.set("q", [church.address, church.postalCode, church.city, church.country].filter(Boolean).join(", "));
  if (church.countryCode) url.searchParams.set("countrycodes", church.countryCode.toLowerCase());
  let result = (await fetchJson(url))[0];
  await wait(REQUEST_DELAY_MS);
  if (!result) {
    url.searchParams.set("q", [church.city, church.country].filter(Boolean).join(", "));
    result = (await fetchJson(url))[0];
    await wait(REQUEST_DELAY_MS);
  }
  if (!result) return null;
  return {
    coordinates: [Number(result.lon), Number(result.lat)],
    postalCode: church.postalCode || result.address?.postcode || "",
  };
}

function coordinatesFor(element) {
  const point = element.center || element;
  return [Number(point.lon), Number(point.lat)];
}

function firstTag(tags, keys) {
  for (const key of keys) if (tags[key]?.trim()) return tags[key].trim();
  return "";
}

function classifyOsm(tags) {
  const label = `${tags.name || ""} ${tags.denomination || ""}`.toLowerCase();
  if (label.includes("orthodox")) return { tradition: "Orthodoxe", denomination: "Orthodoxe" };
  if (/baptist/.test(label)) return { tradition: "Évangélique", denomination: "Baptiste" };
  if (/pentecost|assemblies_of_god/.test(label)) return { tradition: "Évangélique", denomination: "Pentecôtiste" };
  if (/evangelical|évangéli|evangeli/.test(label)) return { tradition: "Évangélique", denomination: "Évangélique" };
  if (/lutheran|luthér|methodist|méthod|reformed|réform|protestant|adventist|adventiste/.test(label)) {
    return { tradition: "Protestante", denomination: "Protestante" };
  }
  return { tradition: "Autre", denomination: "Chrétienne" };
}

function shouldImportOsm(tags = {}) {
  const denomination = String(tags.denomination || "").toLowerCase();
  const label = `${tags.name || ""} ${denomination}`.toLowerCase();
  if (!tags.name || /jehovah|latter.day|mormon/.test(label)) return false;
  if (/catholic|roman_catholic/.test(denomination)) return false;
  return /orthodox|protestant|evangelical|évangéli|evangeli|baptist|baptiste|pentecost|assemblies_of_god|assemblée de dieu|assemblee de dieu|reformed|réformée|reformee|lutheran|luthér|methodist|méthod|adventist|adventiste|eglise chretienne|église chrétienne|centre chrétien|centre chretien|temple protestant/.test(label);
}

async function fetchIleDeFranceOsm() {
  const query = `[out:json][timeout:180];
area["ISO3166-2"="FR-IDF"]["boundary"="administrative"]->.idf;
nwr["amenity"="place_of_worship"]["religion"="christian"](area.idf);
out center tags;`;
  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const url = new URL(endpoint);
      url.searchParams.set("data", query);
      const payload = await fetchJson(url);
      if (payload.elements) return payload.elements.filter((element) => shouldImportOsm(element.tags));
    } catch (error) {
      lastError = error;
      console.warn(`Overpass indisponible (${endpoint}) : ${error.message}`);
    }
  }
  throw lastError || new Error("Aucune donnée OpenStreetMap reçue.");
}

async function fetchOsmElementsByIds(sourceIds) {
  const idsByType = { node: [], way: [], relation: [] };
  for (const sourceId of sourceIds) {
    const [type, id] = String(sourceId).split("/");
    if (idsByType[type] && /^\d+$/.test(id || "")) idsByType[type].push(id);
  }
  const statements = [
    idsByType.node.length ? `node(id:${idsByType.node.join(",")});` : "",
    idsByType.way.length ? `way(id:${idsByType.way.join(",")});` : "",
    idsByType.relation.length ? `rel(id:${idsByType.relation.join(",")});` : "",
  ].filter(Boolean).join("");
  const query = `[out:json][timeout:90];(${statements});out center tags;`;
  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const url = new URL(endpoint);
      url.searchParams.set("data", query);
      const payload = await fetchJson(url);
      if (payload.elements) return payload.elements;
    } catch (error) {
      lastError = error;
      console.warn(`Réparation Overpass indisponible (${endpoint}) : ${error.message}`);
    }
  }
  throw lastError || new Error("Aucun élément OpenStreetMap reçu.");
}

async function reverseAddress(coordinates) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", coordinates[1]);
  url.searchParams.set("lon", coordinates[0]);
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "fr");
  const result = await fetchJson(url);
  await wait(REQUEST_DELAY_MS);
  const details = result.address || {};
  return {
    address: [details.house_number, details.road || details.pedestrian || details.square].filter(Boolean).join(" ") || result.name || "Adresse à vérifier",
    city: details.city || details.town || details.village || details.municipality || "Île-de-France",
    postalCode: details.postcode || "",
  };
}

async function osmChurch(element, existing = null) {
  const tags = element.tags || {};
  const coordinates = coordinatesFor(element);
  let address = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ") || existing?.address || "";
  let city = tags["addr:city"] || existing?.city || "";
  let postalCode = tags["addr:postcode"] || existing?.postalCode || "";
  if (!address || !city) {
    const reverse = await reverseAddress(coordinates);
    address ||= reverse.address;
    city ||= reverse.city;
    postalCode ||= reverse.postalCode;
  }
  const sourceId = `${element.type}/${element.id}`;
  return {
    name: tags.name.trim(), address, city, postalCode, region: "Île-de-France",
    country: "France", countryCode: "FR", ...classifyOsm(tags),
    email: firstTag(tags, ["contact:email", "email"]), phone: firstTag(tags, ["contact:phone", "phone"]),
    website: firstTag(tags, ["contact:website", "website"]), serviceTimes: tags.service_times || "",
    languages: [], childrenWelcome: false, accessibility: tags.wheelchair === "yes",
    coordinates: { type: "Point", coordinates },
    source: "openstreetmap", sourceId, sourceUrl: `https://www.openstreetmap.org/${sourceId}`,
  };
}

function distanceKm(a, b) {
  if (!a?.length || !b?.length) return Infinity;
  const rad = (value) => Number(value) * Math.PI / 180;
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(b[0] - a[0]);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function duplicateOf(church, existing) {
  const sameSource = existing.source === church.source && existing.sourceId === church.sourceId;
  if (sameSource) return true;
  const sameCity = normalize(existing.city) === normalize(church.city);
  const sameName = normalize(existing.name) === normalize(church.name);
  const sameAddress = normalize(existing.address) === normalize(church.address);
  const nearby = distanceKm(existing.coordinates?.coordinates, church.coordinates?.coordinates) < 0.08;
  return sameCity && (sameName || (sameAddress && nearby));
}

function prepare(church) {
  return {
    ...church,
    ...searchFields(church),
    isValidated: true, status: "validated", submittedBy: "admin",
    validatedAt: VERIFIED_AT, lastVerifiedAt: VERIFIED_AT, verificationStatus: "verified",
    management: { status: "unmanaged", managers: [] },
  };
}

async function upsertChurch(collection, existingChurches, church) {
  const duplicate = existingChurches.find((item) => duplicateOf(church, item));
  const now = new Date();
  if (duplicate) {
    await collection.updateOne({ _id: duplicate._id }, { $set: { ...church, updatedAt: now } });
    Object.assign(duplicate, church);
    return "updated";
  }
  const result = await collection.insertOne({ ...church, createdAt: now, updatedAt: now });
  existingChurches.push({ ...church, _id: result.insertedId });
  return "inserted";
}

async function verify(collection) {
  const sources = ["eglisemomentum.com", "eglisedelavictoire.com", "lachapelle.me", "egliselacompassion.org", "monegliseceev.net", "acerparis.fr", "egliseacercanada.com", "eglisemlk.fr", "porte-ouverte.com", "eglisebordeauxrepublique.com", "ceaf.fr", "openstreetmap"];
  const [total, byNetwork, idf, missingCoordinates, aliases, duplicateSourceIds] = await Promise.all([
    collection.countDocuments({ source: { $in: sources } }),
    collection.aggregate([
      { $match: { networkName: { $exists: true, $ne: "" } } },
      { $group: { _id: "$networkName", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).toArray(),
    collection.countDocuments({ region: "Île-de-France", status: "validated" }),
    collection.countDocuments({ source: { $in: sources }, "coordinates.coordinates.1": { $exists: false } }),
    Promise.all(["icc", "acer", "ceev", "mlk", "poc"].map(async (alias) => ({
      alias,
      count: await collection.countDocuments({ normalizedAliases: alias }),
    }))),
    collection.aggregate([
      { $match: { sourceId: { $type: "string" } } },
      { $group: { _id: { source: "$source", sourceId: "$sourceId" }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: "count" },
    ]).toArray(),
  ]);
  console.log(JSON.stringify({
    totalInSelectedSources: total,
    validatedIleDeFrance: idf,
    missingCoordinates,
    duplicateSourceIds: duplicateSourceIds[0]?.count || 0,
    aliases,
    byNetwork,
  }, null, 2));
}

async function main() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  const collection = mongoose.connection.collection("churches");
  if (VERIFY_ONLY) {
    await verify(collection);
    return;
  }

  if (REPAIR_COORDINATES) {
    const missing = await collection.find({
      source: "openstreetmap",
      "coordinates.coordinates.1": { $exists: false },
    }).toArray();
    let repaired = 0;
    for (let index = 0; index < missing.length; index += 100) {
      const batch = missing.slice(index, index + 100);
      try {
        if (GEOCODE_REPAIR) throw new Error("mode géocodage demandé");
        const elements = await fetchOsmElementsByIds(batch.map((item) => item.sourceId));
        for (const element of elements) {
          const sourceId = `${element.type}/${element.id}`;
          const coordinates = coordinatesFor(element);
          if (!coordinates.every(Number.isFinite)) continue;
          const result = await collection.updateOne(
            { source: "openstreetmap", sourceId },
            { $set: { coordinates: { type: "Point", coordinates }, updatedAt: new Date() } }
          );
          repaired += result.modifiedCount;
        }
      } catch (error) {
        console.warn(`Overpass indisponible, géocodage des adresses du lot : ${error.message}`);
        for (const [offset, church] of batch.entries()) {
          const location = await geocode(church);
          if (location) {
            const result = await collection.updateOne(
              { _id: church._id },
              { $set: { coordinates: { type: "Point", coordinates: location.coordinates }, updatedAt: new Date() } }
            );
            repaired += result.modifiedCount;
          }
          if ((offset + 1) % 10 === 0) {
            console.log(`${index + offset + 1}/${missing.length} coordonnées réparées par adresse…`);
          }
        }
      }
      console.log(`${Math.min(index + 100, missing.length)}/${missing.length} coordonnées examinées…`);
    }
    console.log(`${repaired} fiches OpenStreetMap réparées.`);
    await verify(collection);
    return;
  }

  const existingChurches = await collection.find({}).toArray();
  const curated = [...CURATED_CHURCHES, ...CEAF_ILE_DE_FRANCE];
  console.log(`${curated.length} fiches officielles préparées.`);
  const ready = [];
  const skipped = [];
  for (const [index, item] of curated.entries()) {
    const existing = existingChurches.find((church) =>
      (church.source === item.source && church.sourceId === item.sourceId) ||
      (normalize(church.name) === normalize(item.name) && normalize(church.city) === normalize(item.city))
    );
    const location = item.coordinates?.coordinates?.length === 2
      ? { coordinates: item.coordinates.coordinates, postalCode: item.postalCode }
      : existing?.coordinates?.coordinates?.length === 2
      ? { coordinates: existing.coordinates.coordinates, postalCode: existing.postalCode || item.postalCode }
      : await geocode(item);
    if (!location) {
      skipped.push(`${item.name} (${item.city})`);
      continue;
    }
    ready.push(prepare({
      ...item,
      postalCode: item.postalCode || location.postalCode,
      coordinates: { type: "Point", coordinates: location.coordinates },
    }));
    console.log(`[${index + 1}/${curated.length}] ${item.name} — ${item.city}`);
  }

  if (!CURATED_ONLY) {
    const elements = await fetchIleDeFranceOsm();
    console.log(`${elements.length} lieux protestants, évangéliques ou orthodoxes retenus dans OpenStreetMap pour l’Île-de-France.`);
    for (const [index, element] of elements.entries()) {
      const sourceId = `${element.type}/${element.id}`;
      const existing = existingChurches.find((church) => church.source === "openstreetmap" && church.sourceId === sourceId);
      if (existing?.coordinates?.coordinates?.length === 2) {
        ready.push(prepare({ ...existing, lastVerifiedAt: VERIFIED_AT, verificationStatus: "verified" }));
      } else {
        ready.push(prepare(await osmChurch(element, existing)));
      }
      if ((index + 1) % 25 === 0) console.log(`${index + 1}/${elements.length} fiches OpenStreetMap préparées…`);
    }
  }

  if (!APPLY) {
    console.log(`Simulation terminée : ${ready.length} prêtes, ${skipped.length} ignorées. Ajoutez --apply pour écrire.`);
    if (skipped.length) console.log(`À vérifier : ${skipped.join("; ")}`);
    return;
  }

  let inserted = 0;
  let updated = 0;
  for (const church of ready) {
    const result = await upsertChurch(collection, existingChurches, church);
    if (result === "inserted") inserted += 1;
    else updated += 1;
  }
  await collection.createIndex({ coordinates: "2dsphere" });
  await collection.createIndex({ source: 1, sourceId: 1 }, {
    unique: true, partialFilterExpression: { sourceId: { $type: "string" } },
  });
  console.log(`Import terminé : ${inserted} ajoutées, ${updated} mises à jour, ${skipped.length} ignorées.`);
  if (skipped.length) console.log(`À vérifier : ${skipped.join("; ")}`);
  await verify(collection);
}

main()
  .catch((error) => {
    console.error("Échec de l’import prioritaire :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
