export const CITIES = [
  { id: "mitrovice_jug", name: "Mitrovicë" },
  { id: "prishtine", name: "Prishtinë" },
  { id: "decani", name: "Deçan" },
  { id: "dragash", name: "Dragash" },
  { id: "drenas", name: "Drenas (Gllogoc)" },
  { id: "ferizaj", name: "Ferizaj" },
  { id: "fushe_kosove", name: "Fushë Kosovë" },
  { id: "gjakove", name: "Gjakovë" },
  { id: "gjilan", name: "Gjilan" },
  { id: "gracanice", name: "Graçanicë" },
  { id: "hani_i_elezit", name: "Hani i Elezit" },
  { id: "istog", name: "Istog" },
  { id: "junik", name: "Junik" },
  { id: "kacanik", name: "Kaçanik" },
  { id: "kamenice", name: "Kamenicë" },
  { id: "kline", name: "Klinë" },
  { id: "kllokot", name: "Kllokot" },
  { id: "leposaviq", name: "Leposaviq" },
  { id: "lipjan", name: "Lipjan" },
  { id: "malisheve", name: "Malishevë" },
  { id: "mamushe", name: "Mamushë" },
  { id: "novoberde", name: "Novobërdë" },
  { id: "obiliq", name: "Obiliq (Kastriot)" },
  { id: "partesh", name: "Partesh" },
  { id: "peje", name: "Pejë" },
  { id: "podujeve", name: "Podujevë" },
  { id: "prizren", name: "Prizren" },
  { id: "rahovec", name: "Rahovec" },
  { id: "ranillug", name: "Ranillug" },
  { id: "shterpce", name: "Shtërpcë" },
  { id: "shtime", name: "Shtime" },
  { id: "skenderaj", name: "Skënderaj" },
  { id: "suhareke", name: "Suharekë" },
  { id: "vitia", name: "Viti" },
  { id: "vushtrri", name: "Vushtrri" },
  { id: "zubin_potok", name: "Zubin Potok" },
  { id: "zvecan", name: "Zveçan" }
] as const;

export type CityId = typeof CITIES[number]["id"];

export const getCityName = (cityId: string | undefined | null) => {
  if (!cityId) return "Kosovë";
  const city = CITIES.find(c => c.id === cityId);
  return city ? city.name : cityId; 
};