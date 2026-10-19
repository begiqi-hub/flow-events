// lib/demo-data.ts

export const DEMO_LISTINGS = [
  { 
    id: "1", 
    hallId: "demo-1", 
    hall: { name: "Grand Palace", capacity: 400, image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Prishtinë", name: "Grand Palace Events", phone: "+383 44 ******" }, 
    type: "Dasma",
    description: "Një sallë luksoze në qendër të Prishtinës, e dizajnuar posaçërisht për dasma dhe evente të mëdha me një ambient elegant dhe modern.",
    gallery: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop"
    ],
    amenities: ["Parkim Falas", "Klimatizim", "Wi-Fi"],
    status: "PUBLISHED"
  },
  { 
    id: "2", 
    hallId: "demo-2", 
    hall: { name: "Elegance Royal", capacity: 250, image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Prizren", name: "Elegance Royal", phone: "+383 44 ******" }, 
    type: "Fejesa",
    description: "Ambient intim dhe mbretëror i përsosur për fejesa dhe ceremoni familjare në zemër të Prizrenit.",
    gallery: ["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop"],
    amenities: ["Klimatizim", "Parkim"],
    status: "PUBLISHED"
  },
  { 
    id: "3", 
    hallId: "demo-3", 
    hall: { name: "Diamond Hall", capacity: 500, image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Gjakovë", name: "Diamond Hall Center", phone: "+383 45 ******" }, 
    type: "Dasma",
    description: "Hapësirë madhështore me ndriçim spektakolar, ideale për dasma masive dhe evente ekskluzive.",
    gallery: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop"],
    amenities: ["Klimatizim", "Parkim i madh", "Dekor Premium"],
    status: "PUBLISHED"
  },
  { 
    id: "4", 
    hallId: "demo-4", 
    hall: { name: "Garden Event", capacity: 150, image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Mitrovicë", name: "Garden Event Group", phone: "+383 49 ******" }, 
    type: "Evente familjare",
    description: "Sallë e rrethuar me gjelbërim, e përshtatshme për ahengje të ngushta familjare dhe evente në natyrë.",
    gallery: ["https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800&auto=format&fit=crop"],
    amenities: ["Kënd Lojërash", "Tarracë", "Klimatizim"],
    status: "PUBLISHED"
  },
  { 
    id: "5", 
    hallId: "demo-5", 
    hall: { name: "Premium Resort", capacity: 350, image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Pejë", name: "Premium Resort", phone: "+383 44 ******" }, 
    type: "Dasma",
    description: "Resort premium me pamje nga malet e Pejës, ku luksi ndërthuret me natyrën për një dasmë të paharrueshme.",
    gallery: ["https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800&auto=format&fit=crop"],
    amenities: ["Pishinë", "Akomodim", "Parkim"],
    status: "PUBLISHED"
  },
  { 
    id: "6", 
    hallId: "demo-6", 
    hall: { name: "Crystal Venue", capacity: 200, image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Gjilan", name: "Crystal Venue", phone: "+383 45 ******" }, 
    type: "Ditëlindje",
    description: "Sallë me dizajn kristalor dhe modern, e përkryer për ditëlindje, jubile dhe festa rinore.",
    gallery: ["https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=800&auto=format&fit=crop"],
    amenities: ["Ndriçim LED", "Sistem Zërimi", "Wi-Fi"],
    status: "PUBLISHED"
  },
  { 
    id: "7", 
    hallId: "demo-7", 
    hall: { name: "Imperial Palace", capacity: 600, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Ferizaj", name: "Imperial Events", phone: "+383 49 ******" }, 
    type: "Dasma",
    description: "Një nga sallat më të mëdha dhe më prestigjioze në regjion, e ndërtuar për evente perandorake.",
    gallery: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop"],
    amenities: ["VIP Area", "Parkim Nëntokësor", "Klimatizim Qendror"],
    status: "PUBLISHED"
  },
  { 
    id: "8", 
    hallId: "demo-8", 
    hall: { name: "Lakeview Events", capacity: 180, image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Vushtrri", name: "Lakeview Complex", phone: "+383 44 ******" }, 
    type: "Fejesa",
    description: "Ambient romantik me pamje panoramike, ideal për të festuar dashurinë tuaj me miqtë dhe familjen.",
    gallery: ["https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop"],
    amenities: ["Pamje nga Liqeni", "Klimatizim", "Muzikë Live"],
    status: "PUBLISHED"
  },
  { 
    id: "9", 
    hallId: "demo-9", 
    hall: { name: "Sky Event Hall", capacity: 300, image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Prishtinë", name: "Sky Group", phone: "+383 45 ******" }, 
    type: "Event Biznesi",
    description: "Sallë profesionale konferencash dhe eventesh korporative me pajisjet më të fundit teknologjike.",
    gallery: ["https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800&auto=format&fit=crop"],
    amenities: ["Projektor", "Sistem Konferencash", "Coffee Break Area"],
    status: "PUBLISHED"
  },
  { 
    id: "10", 
    hallId: "demo-10", 
    hall: { name: "Golden Restaurant", capacity: 120, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Prizren", name: "Golden Foods", phone: "+383 49 ******" }, 
    type: "Ditëlindje",
    description: "Restorant komod dhe i ngrohtë me ushqim të shkëlqyer për të festuar ditëlindjet dhe ahengjet intime.",
    gallery: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop"],
    amenities: ["Menu Tradicionale", "Klimatizim", "Parkim"],
    status: "PUBLISHED"
  },
  { 
    id: "11", 
    hallId: "demo-11", 
    hall: { name: "Luxury Tent", capacity: 280, image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Gjakovë", name: "Luxury Tents", phone: "+383 44 ******" }, 
    type: "Evente familjare",
    description: "Një përvojë unike e festimit në tenda luksoze me dekor të kuruar deri në detajet më të vogla.",
    gallery: ["https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop"],
    amenities: ["Open Air", "Klimatizim Mobil", "Dekor Unik"],
    status: "PUBLISHED"
  },
  { 
    id: "12", 
    hallId: "demo-12", 
    hall: { name: "Classic Ballroom", capacity: 450, image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Mitrovicë", name: "Classic Events", phone: "+383 45 ******" }, 
    type: "Dasma",
    description: "Sallë klasike vallëzimi me arkitekturë tradicionale dhe elegancë të pashoqe për ditën tuaj më të rëndësishme.",
    gallery: ["https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=800&auto=format&fit=crop"],
    amenities: ["Parkim i madh", "Garderobë", "Klimatizim"],
    status: "PUBLISHED"
  },
  { 
    id: "13", 
    hallId: "demo-13", 
    hall: { name: "Boutique Venue", capacity: 90, image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop" }, 
    business: { city: "Pejë", name: "Boutique Events", phone: "+383 49 ******" }, 
    type: "Fejesa",
    description: "Hapësirë e vogël, e ngrohtë dhe ekskluzive për ata që dëshirojnë një ceremoni të mbyllur dhe plot stil.",
    gallery: ["https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop"],
    amenities: ["Muzikë", "Wi-Fi", "Klimatizim"],
    status: "PUBLISHED"
  }
];