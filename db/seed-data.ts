/**
 * Initial catalogue transcribed from the Sardar Travels brochures.
 *
 * - Public copy has spelling corrected; attraction names follow common usage.
 * - Anything the brochure leaves ambiguous is recorded in `verificationNotes`
 *   (admin-only) so staff can confirm it before relying on it.
 * - No prices, contact numbers, fleet details or reviews are invented:
 *   prices are null ("Request a quote"), contact details stay blank until an
 *   administrator enters them, and no testimonials are seeded.
 */
import type { FaqItem, ItineraryDay, TourCategory } from "../src/db/schema";

export type SeedDestination = {
  slug: string;
  name: string;
  region: string;
  tagline: string;
  description: string;
  image: string;
};

export const seedDestinations: SeedDestination[] = [
  {
    slug: "mysuru",
    name: "Mysuru",
    region: "Karnataka",
    tagline: "The royal city of palaces, gardens and Chamundi Hill",
    description:
      "Mysuru's illuminated palace, hilltop Chamundeshwari Temple, art galleries and markets make it one of South India's great city tours — and the starting point for most of our circuits.",
    image: "mysore-palace",
  },
  {
    slug: "srirangapatna",
    name: "Srirangapatna",
    region: "Karnataka",
    tagline: "Island fort town on the Kaveri",
    description:
      "The island town of Srirangapatna holds the Ranganathaswamy Temple and the remains of Tipu Sultan's fort, a short drive from the Krishnaraja Sagar Dam and Brindavan Gardens.",
    image: "brindavan",
  },
  {
    slug: "ooty",
    name: "Ooty",
    region: "Nilgiris, Tamil Nadu",
    tagline: "Lakes, gardens and tea country in the Nilgiris",
    description:
      "Udhagamandalam — Ooty — sits high in the Nilgiri Hills: boating on Ooty Lake, the terraced Botanical Garden, rolling tea estates and the Pykara lakes and falls.",
    image: "ooty-lake",
  },
  {
    slug: "coonoor",
    name: "Coonoor",
    region: "Nilgiris, Tamil Nadu",
    tagline: "Viewpoints, waterfalls and quiet tea gardens",
    description:
      "Below Ooty, Coonoor is known for dramatic viewpoints such as Dolphin's Nose and Lamb's Rock, Catherine Falls and the gardens of Sim's Park.",
    image: "dolphins-nose",
  },
  {
    slug: "kodaikanal",
    name: "Kodaikanal",
    region: "Palani Hills, Tamil Nadu",
    tagline: "The princess of hill stations",
    description:
      "Kodaikanal wraps around a star-shaped lake in the Palani Hills — Coaker's Walk, Pillar Rocks, pine forests and waterfalls make for a gentle, scenic stay.",
    image: "kodaikanal-lake",
  },
  {
    slug: "coorg",
    name: "Coorg (Madikeri)",
    region: "Kodagu, Karnataka",
    tagline: "Coffee hills, waterfalls and the source of the Kaveri",
    description:
      "Kodagu — Coorg — is a region of coffee estates and forested hills. Madikeri, its main town, is the base for Abbey Falls, Raja's Seat and Talakaveri.",
    image: "abbey-falls",
  },
  {
    slug: "belur-halebidu",
    name: "Belur & Halebidu",
    region: "Hassan, Karnataka",
    tagline: "Masterpieces of Hoysala temple architecture",
    description:
      "The twin temple towns of Belur and Halebidu preserve some of the finest Hoysala stone carving anywhere — the Chennakeshava and Hoysaleswara temples.",
    image: "halebidu",
  },
  {
    slug: "shravanabelagola",
    name: "Shravanabelagola",
    region: "Hassan, Karnataka",
    tagline: "The monolithic statue of Bahubali",
    description:
      "A major Jain pilgrimage centre, Shravanabelagola is crowned by the monolithic statue of Gommateshwara (Bahubali) on Vindhyagiri hill.",
    image: "shravanabelagola",
  },
  {
    slug: "bandipur",
    name: "Bandipur",
    region: "Chamarajanagar, Karnataka",
    tagline: "Forest roads between Mysuru and the Nilgiris",
    description:
      "Bandipur and the adjoining Mudumalai forests line the road from Mysuru to Ooty. Wildlife is often seen from the road, though sightings can never be guaranteed.",
    image: "bandipur",
  },
  {
    slug: "nanjangud",
    name: "Nanjangud",
    region: "Mysuru district, Karnataka",
    tagline: "Temple town on the Kapila river",
    description:
      "Nanjangud is known for its large Srikanteshwara Temple and is often combined with Bandipur and Himavad Gopalaswamy Betta.",
    image: "nanjangud",
  },
  {
    slug: "somanathapura",
    name: "Somanathapura",
    region: "Mysuru district, Karnataka",
    tagline: "A jewel of Hoysala design",
    description:
      "The star-shaped Chennakeshava Temple at Somanathapura is one of the most complete Hoysala temples, an easy drive from Mysuru.",
    image: "somanathapura",
  },
  {
    slug: "shivanasamudra",
    name: "Shivanasamudra",
    region: "Mandya & Chamarajanagar, Karnataka",
    tagline: "The twin falls of the Kaveri",
    description:
      "At Shivanasamudra the Kaveri splits into the Gaganachukki and Barachukki falls — at their fullest in and after the monsoon.",
    image: "gaganachukki",
  },
  {
    slug: "talakadu",
    name: "Talakadu",
    region: "Mysuru district, Karnataka",
    tagline: "Temples rising from the sands of the Kaveri",
    description:
      "Talakadu's temples lie among sand dunes on the banks of the Kaveri, including those associated with the Panchalinga (five lingas).",
    image: "talakadu",
  },
];

export type SeedTour = {
  slug: string;
  code: string;
  title: string;
  subtitle: string;
  category: TourCategory;
  durationDays: number;
  durationNights: number;
  durationLabel: string;
  summary: string;
  overview: string;
  startPoint: string;
  departureTime: string;
  departureNotes: string;
  dropOffs?: string;
  transport?: string;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  accommodation?: string;
  importantNotes?: string;
  faqs?: FaqItem[];
  destinations: string[];
  hero: string;
  gallery: { image: string; caption: string }[];
  featured: boolean;
  published: boolean;
  verificationNotes: string;
};

/** Brochure footer: "Note: All Govt. entrance, guide, parking & toll charges extra." */
const EXTRAS_EXCLUDED = [
  "Government entrance fees, guide charges, parking and toll charges",
  "Boating, horse riding and other optional activities",
  "Meals unless listed in your quote",
  "Personal expenses and shopping",
];

/** From the brochure's Terms & Conditions. */
export const BROCHURE_CANCELLATION =
  "50% of the amount is refunded if you cancel at least 24 hours before the trip. No refund is given if you do not report in time for departure. The management reserves the right of admission and may change the programme without notice.";

/** Brochure T&C: "Pickup and drop is purely complimentary." */
const PICKUP_NOTE = "Pickup and drop are complimentary. Your pickup point and time are confirmed with your booking.";

export const seedTours: SeedTour[] = [
  {
    slug: "mysuru-sightseeing-one-day",
    code: "A",
    title: "Mysuru Sightseeing",
    subtitle: "Palaces, Chamundi Hill and the royal city in a day",
    category: "sightseeing",
    durationDays: 1,
    durationNights: 0,
    durationLabel: "One day",
    summary:
      "A full day through royal Mysuru — the Jaganmohan Palace art gallery, Mysuru Zoo, Chamundi Hill and its great Nandi, then the Maharaja's Palace and St. Philomena's Cathedral.",
    overview:
      "Start at 8:00 AM with the Jaganmohan Palace Art Gallery and the Mysuru Zoo, then climb Chamundi Hill to the Chamundeshwari Temple, the Mahishasura statue and the monolithic Nandi. After a lunch break, tour the Maharaja's Palace and the Gothic spires of St. Philomena's.\n\nThe day continues to Srirangapatna — Tipu Sultan's capital city — for his fort, the place where he fell and the Ranganathaswamy Temple, before ending at the Krishnaraja Sagar Dam and Brindavan Gardens.",
    startPoint: "Mysuru",
    departureTime: "8:00 AM",
    departureNotes: PICKUP_NOTE,
    itinerary: [
      {
        day: 1,
        title: "Morning — the city and Chamundi Hill",
        stops: [
          { time: "8:00 AM", name: "Departure" },
          { name: "Jaganmohan Palace Art Gallery" },
          { name: "Mysuru Zoo & shopping" },
          { name: "Chamundi Hill & Chamundeshwari Temple" },
          { name: "Mahishasura statue" },
          { name: "Nandi (the Big Bull)" },
        ],
      },
      {
        day: 1,
        title: "Afternoon — palace and cathedral",
        stops: [{ name: "Lunch break" }, { name: "Mysuru Palace (Maharaja's Palace)" }, { name: "St. Philomena's Cathedral" }],
      },
      {
        day: 1,
        title: "Srirangapatna & Brindavan Gardens",
        summary: "Tipu Sultan's capital city.",
        stops: [
          { name: "Tipu Sultan's Fort" },
          { name: "Tipu Sultan's death place" },
          { name: "Ranganathaswamy Temple" },
          { name: "Krishnaraja Sagar (KRS) Dam" },
          { name: "Brindavan Gardens" },
        ],
      },
    ],
    inclusions: ["Sightseeing as per the itinerary"],
    exclusions: EXTRAS_EXCLUDED,
    destinations: ["mysuru", "srirangapatna"],
    hero: "mysore-palace",
    gallery: [
      { image: "mysore-palace", caption: "Mysuru Palace" },
      { image: "jaganmohan", caption: "Jaganmohan Palace" },
      { image: "chamundi", caption: "Chamundeshwari Temple, Chamundi Hill" },
      { image: "nandi", caption: "Nandi on Chamundi Hill" },
      { image: "philomena", caption: "St. Philomena's Cathedral" },
      { image: "brindavan", caption: "Brindavan Gardens" },
    ],
    featured: true,
    published: true,
    verificationNotes:
      "Brochure prints Srirangapatna ('Tippu Sultan's Capital City': Tippu Fort, Tippu's Death Place, Ranganatha Swamy Temple, KRS Dam, Brundavana Garden) on the Tour 1 panel, so it is published as part of the same day — confirm. Brochure says 'Brundavana Garden (Unlimited)': confirm what 'Unlimited' means. Spellings corrected: 'Srigangapatna'/'Tippu' → Srirangapatna/Tipu Sultan; 'Jaganmohana' → Jaganmohan; 'Status of Mahiishasura' → Mahishasura statue.",
  },
  {
    slug: "ooty-sightseeing-one-day",
    code: "B",
    title: "Ooty Sightseeing",
    subtitle: "Through the forests to the Nilgiris and back in a day",
    category: "hill-station",
    durationDays: 1,
    durationNights: 0,
    durationLabel: "One day",
    summary:
      "Drive through the Bandipur and Mudumalai forests into the Nilgiri Hills for Ooty Lake, the Botanical Garden, tea estates and time in Ooty town.",
    overview:
      "An early start takes you through the Bandipur and Mudumalai forests and up into the Nilgiri Hills, past tea estates to Ooty. Spend the day at Ooty Lake — boating and horse riding are available there — break for lunch, browse Ooty town, then walk the terraces of the Government Botanical Garden.",
    startPoint: "Mysuru",
    departureTime: "7:30 AM",
    departureNotes: PICKUP_NOTE,
    itinerary: [
      {
        day: 1,
        title: "Forests and the Nilgiri climb",
        stops: [
          { time: "7:30 AM", name: "Departure" },
          { name: "Bandipur Wildlife Sanctuary", note: "Drive through the forest; sightings are not guaranteed." },
          { name: "Mudumalai Wildlife Sanctuary", note: "Drive through the forest; sightings are not guaranteed." },
          { name: "Nilgiri Hills" },
          { name: "Tea estates" },
        ],
      },
      {
        day: 1,
        title: "A day in Ooty",
        stops: [
          { name: "Ooty Lake", note: "Boating and horse riding are optional and paid locally unless in your quote." },
          { name: "Lunch break" },
          { name: "Ooty town shopping" },
          { name: "Government Botanical Garden" },
        ],
      },
    ],
    inclusions: ["Sightseeing as per the itinerary"],
    exclusions: [...EXTRAS_EXCLUDED, "Forest safaris"],
    importantNotes:
      "Bandipur and Mudumalai are protected forests on the route. Wildlife may be seen from the road but sightings are never guaranteed, and forest-road timings are set by the authorities.",
    destinations: ["ooty", "bandipur"],
    hero: "ooty-lake",
    gallery: [
      { image: "ooty-lake", caption: "Ooty Lake" },
      { image: "nilgiri-tea", caption: "Tea estates in the Nilgiris" },
      { image: "ooty-botanical", caption: "Government Botanical Garden" },
      { image: "bandipur", caption: "Bandipur forest" },
      { image: "mudumalai", caption: "Road through Mudumalai" },
    ],
    featured: true,
    published: true,
    verificationNotes:
      "Brochure: 'Tour-2 One Day Tour, Dept 7-30 a.m.'. Confirm start point (assumed Mysuru) and return time. Boating and horse riding are listed under Ooty Lake but not as included — shown as optional. 'Madhualai' published as Mudumalai. Do not promise wildlife sightings (brochure shows elephant and tiger photos).",
  },
  {
    slug: "ooty-coonoor-filmy-chakkar",
    code: "C",
    title: "Ooty, Coonoor & Filmy Chakkar",
    subtitle: "Nilgiri lakes, viewpoints and film locations",
    category: "hill-station",
    durationDays: 3,
    durationNights: 2,
    durationLabel: "2 or 3 days",
    summary:
      "Ooty's lake and gardens, a full day of Coonoor viewpoints and Doddabetta Peak, then the film locations, dams and falls around Pykara — with accommodation.",
    overview:
      "A relaxed Nilgiris holiday based in Ooty, with accommodation included. Day one covers the lake, boat club, Botanical Garden and town. Day two heads to Coonoor's viewpoints, Dolphin's Nose, Catherine Falls, Lamb's Rock, Sim's Park and the Wellington memorials before Doddabetta Peak. The final day — the 'Filmy Chakkar' — takes in the Deer Park, 6th Mile on the old Mysuru road, School Mund and Pei Mund, the pine forest, Kamaraj Sagar Dam and, at 9th Mile, the Pykara dam, lake and waterfalls.\n\nThe tour runs as two or three days; we'll recommend the right length for your dates.",
    startPoint: "Mysuru",
    departureTime: "",
    departureNotes: `Departure time is confirmed with your booking. ${PICKUP_NOTE}`,
    itinerary: [
      {
        day: 1,
        title: "Ooty",
        overnight: "Ooty",
        stops: [
          { name: "Ooty Lake" },
          { name: "Boat Club" },
          { name: "Government Botanical Garden" },
          { name: "Ooty town shopping" },
        ],
      },
      {
        day: 2,
        title: "Coonoor & Doddabetta",
        overnight: "Ooty",
        stops: [
          { name: "Viewpoints" },
          { name: "Dolphin's Nose" },
          { name: "Catherine Falls" },
          { name: "Lamb's Rock viewpoint" },
          { name: "Sim's Park" },
          { name: "Tea estate" },
          { name: "MRC & DSSC Memorial, Wellington" },
          { name: "Doddabetta Peak" },
        ],
      },
      {
        day: 3,
        title: "Filmy Chakkar — Ooty & Pykara",
        overnight: "Ooty",
        stops: [
          { name: "Deer Park" },
          { name: "6th Mile, Old Mysuru Road" },
          { name: "Children's Park" },
          { name: "Ooty shopping" },
          { name: "Pine Forest" },
          { name: "School Mund" },
          { name: "Pei Mund" },
          { name: "Kamaraj Sagar Dam" },
          { name: "Pykara Dam", note: "At 9th Mile." },
          { name: "Pykara Lake" },
          { name: "Pykara Waterfalls" },
          { name: "Gymkhana Club", note: "Viewed from outside the golf links." },
        ],
      },
    ],
    inclusions: ["Accommodation", "Sightseeing as per the itinerary"],
    exclusions: EXTRAS_EXCLUDED,
    accommodation:
      "Accommodation is included, with night halts at Ooty. The number of nights, hotel and room arrangement are confirmed in your quote.",
    destinations: ["ooty", "coonoor"],
    hero: "nilgiri-tea",
    gallery: [
      { image: "nilgiri-tea", caption: "Nilgiri tea country" },
      { image: "dolphins-nose", caption: "Dolphin's Nose, Coonoor" },
      { image: "pykara", caption: "Pykara Falls" },
      { image: "pykara-lake", caption: "Pykara Lake" },
      { image: "ooty-lake", caption: "Ooty Lake" },
    ],
    featured: true,
    published: true,
    verificationNotes:
      "Brochure: 'Tour-3, 2 & 3 Days Tour', 'Note: Accommodation Included'. Day 3 heading repeats 'Coonoor Sight Seeing and Night Halt at Ooty' though its stops are Ooty/Pykara — published as 'Filmy Chakkar — Ooty & Pykara'; confirm. Brochure shows a night halt at Ooty on all three days — confirm number of nights, hotel category and room sharing. 'V. View' published as 'Viewpoints'; 'Cathrin Falls' → Catherine Falls; '6yth Miles' → 6th Mile; 'School Mundh, Pei Mundh' → School Mund, Pei Mund; '9th Miles Pykara' → Pykara Dam at 9th Mile. Confirm departure time and whether Day 1 includes the drive from Mysuru.",
  },
  {
    slug: "honeymoon-deluxe-mysuru-ooty-kodaikanal",
    code: "D",
    title: "Honeymoon Deluxe Package",
    subtitle: "Ooty, Coonoor and Kodaikanal in four days",
    category: "honeymoon",
    durationDays: 4,
    durationNights: 3,
    durationLabel: "Four days",
    summary:
      "A four-day hill-station escape for couples: up to Ooty from Mysuru, a day among Coonoor's viewpoints, across to Kodaikanal and a full day around its lake, forests and cliffs.",
    overview:
      "Leave Mysuru at 7:30 AM for the Nilgiris and spend the day around Ooty. The second day, from 9:30 AM to 5:00 PM, is given to Coonoor, returning to Ooty for the night. On day three you leave at 8:00 AM and cross the hills to Kodaikanal, arriving around 5:00 PM. The final day, from 9:00 AM to 4:00 PM, takes in Kodaikanal's lake, walks, viewpoints and falls before your drop to Bengaluru, Chennai, Madugiri or Coimbatore.",
    startPoint: "Mysuru",
    departureTime: "7:30 AM",
    departureNotes: `Day 1 departure from Mysuru at 7:30 AM. ${PICKUP_NOTE}`,
    dropOffs:
      "Drop to Bengaluru, Chennai (Madras), Madugiri or Coimbatore — choose yours when you enquire.",
    itinerary: [
      {
        day: 1,
        title: "Mysuru to Ooty",
        overnight: "Ooty",
        stops: [{ time: "7:30 AM", name: "Depart Mysuru" }, { name: "Ooty sightseeing" }],
      },
      {
        day: 2,
        title: "Coonoor",
        overnight: "Ooty",
        stops: [
          { time: "9:30 AM", name: "Coonoor sightseeing begins" },
          { time: "5:00 PM", name: "Return towards Ooty" },
        ],
      },
      {
        day: 3,
        title: "Ooty to Kodaikanal",
        overnight: "Kodaikanal",
        stops: [
          { time: "8:00 AM", name: "Depart Ooty" },
          { time: "≈ 5:00 PM", name: "Arrive Kodaikanal" },
        ],
      },
      {
        day: 4,
        title: "Kodaikanal",
        summary: "Sightseeing from 9:00 AM to 4:00 PM, followed by your drop.",
        stops: [
          { time: "9:00 AM", name: "Kodaikanal sightseeing begins" },
          { name: "Bryant Park" },
          { name: "Silver Cascade Falls" },
          { name: "Shembaganur" },
          { name: "Coaker's Walk" },
          { name: "Kurinji Andavar Temple" },
          { name: "Telescope House" },
          { name: "Pillar Rocks" },
          { name: "Bear Shola Falls" },
          { name: "Golf Course" },
          { name: "Pine Forest" },
          { name: "Chettiar Park" },
          { name: "Palani Hills view" },
          { name: "Moir Point" },
          { name: "Kodaikanal Lake" },
          { time: "4:00 PM", name: "Depart for drop" },
        ],
      },
    ],
    inclusions: ["Sightseeing as per the itinerary"],
    exclusions: EXTRAS_EXCLUDED,
    accommodation:
      "Overnight halts at Ooty (nights 1–2) and Kodaikanal (night 3). Whether hotels are included, and which, is confirmed in your quote.",
    destinations: ["mysuru", "ooty", "coonoor", "kodaikanal"],
    hero: "kodai-view",
    gallery: [
      { image: "kodaikanal-lake", caption: "Kodaikanal" },
      { image: "pillar-rocks", caption: "Pillar Rocks" },
      { image: "kodai-view", caption: "Palani Hills" },
      { image: "dolphins-nose", caption: "Coonoor viewpoints" },
      { image: "nilgiri-tea", caption: "Nilgiri tea estates" },
    ],
    featured: true,
    published: true,
    verificationNotes:
      "Brochure prints 'Sambaganoor' — published as Shembaganur (near Kodaikanal); confirm. 'Moier Point & Lake' published as Moir Point + Kodaikanal Lake; 'Chettyar Park' → Chettiar Park; 'Palini View' → Palani Hills view; 'Silver Cascades' → Silver Cascade Falls. Brochure doesn't say whether hotels are included in this package — confirm. Confirm whether drop to Bengaluru/Madras/Madugiri/Coimbatore costs extra.",
  },
  {
    slug: "madikeri-coorg-two-days",
    code: "E",
    title: "Madikeri & Coorg",
    subtitle: "Monastery, forests, waterfalls and the source of the Kaveri",
    category: "hill-station",
    durationDays: 2,
    durationNights: 1,
    durationLabel: "Two days",
    summary:
      "Two days by car through Coorg: the Golden Temple at Bylakuppe, Kaveri Nisargadhama, Dubare, Abbey Falls and Raja's Seat, then Bhagamandala, Talakaveri and Madikeri Fort.",
    overview:
      "Day one heads into Kodagu via the Golden Temple of the Namdroling Monastery, the bamboo groves of Kaveri Nisargadhama and the riverside forest at Dubare, before Omkareshwara Temple, Abbey Falls and sunset at Raja's Seat in Madikeri. Day two climbs to Bhagamandala and Talakaveri, the source of the Kaveri, returning via the Glass House and Madikeri Fort.",
    startPoint: "Mysuru",
    departureTime: "",
    departureNotes: `Departure time is confirmed with your booking. ${PICKUP_NOTE}`,
    transport: "By car",
    itinerary: [
      {
        day: 1,
        title: "Bylakuppe to Madikeri",
        stops: [
          { name: "Golden Temple (Namdroling Monastery), Bylakuppe" },
          { name: "Kaveri Nisargadhama" },
          { name: "Dubare Forest" },
          { name: "Omkareshwara Temple" },
          { name: "Abbey Falls" },
          { name: "Raja's Seat" },
        ],
      },
      {
        day: 2,
        title: "Bhagamandala & Talakaveri",
        stops: [
          { name: "Bhagamandala" },
          { name: "Talakaveri" },
          { name: "Glass House" },
          { name: "Madikeri Fort" },
        ],
      },
    ],
    inclusions: ["Travel by car", "Sightseeing as per the itinerary"],
    exclusions: [...EXTRAS_EXCLUDED, "Accommodation unless listed in your quote"],
    destinations: ["coorg"],
    hero: "abbey-falls",
    gallery: [
      { image: "abbey-falls", caption: "Abbey Falls" },
      { image: "namdroling", caption: "Golden Temple, Bylakuppe" },
      { image: "rajas-seat", caption: "Raja's Seat" },
      { image: "dubare", caption: "Dubare" },
      { image: "talakaveri", caption: "Talakaveri" },
      { image: "coorg", caption: "Kodagu hills" },
    ],
    featured: true,
    published: true,
    verificationNotes:
      "Brochure: '1st Day … By CAR' / '2nd Day … By CAR'. Confirm overnight location and whether accommodation is included. Confirm what 'Glass House' refers to. 'Abbi Fals' published as Abbey Falls; 'Kaveri Nisarga Dhama' → Kaveri Nisargadhama.",
  },
  {
    slug: "madikeri-coorg-sightseeing-short-trip",
    code: "E2",
    title: "Madikeri & Coorg Sightseeing",
    subtitle: "Coorg's main sights on a shorter trip",
    category: "hill-station",
    durationDays: 1,
    durationNights: 0,
    durationLabel: "Short trip",
    summary:
      "A shorter Coorg trip covering the Golden Temple at Bylakuppe, Kaveri Nisargadhama, Dubare Forest, Raja's Seat, Omkareshwara Temple and Abbey Falls.",
    overview:
      "For travellers short on time: the Golden Temple at Bylakuppe, the bamboo groves of Kaveri Nisargadhama, Dubare Forest, the views from Raja's Seat, Omkareshwara Temple and Abbey Falls. Timings are confirmed when you enquire.",
    startPoint: "Mysuru",
    departureTime: "",
    departureNotes: `Timings are confirmed on enquiry. ${PICKUP_NOTE}`,
    transport: "By car",
    itinerary: [
      {
        day: 1,
        title: "Coorg highlights",
        stops: [
          { name: "Golden Temple (Namdroling Monastery), Bylakuppe" },
          { name: "Kaveri Nisargadhama" },
          { name: "Dubare Forest" },
          { name: "Raja's Seat" },
          { name: "Omkareshwara Temple" },
          { name: "Abbey Falls" },
        ],
      },
    ],
    inclusions: ["Travel by car", "Sightseeing as per the itinerary"],
    exclusions: EXTRAS_EXCLUDED,
    destinations: ["coorg"],
    hero: "rajas-seat",
    gallery: [
      { image: "namdroling", caption: "Golden Temple, Bylakuppe" },
      { image: "abbey-falls", caption: "Abbey Falls" },
      { image: "dubare", caption: "Dubare" },
    ],
    featured: false,
    published: true,
    verificationNotes:
      "Brochure has a separate 'Madikeri/Coorg Sight Seeing' panel (Golden Tempal, Kaveri Nisarga Dama, Dubare Forest, Raja's Seat, Omkareshwara Temple, Abbi Fals) with no duration or vehicle stated — published as a short trip by car; confirm duration and timing.",
  },
  {
    slug: "belur-halebidu-shravanabelagola",
    code: "F",
    title: "Belur, Halebidu & Shravanabelagola",
    subtitle: "Special one-day trip — B.H.S. sightseeing",
    category: "heritage",
    durationDays: 1,
    durationNights: 0,
    durationLabel: "One day",
    summary:
      "The carved Hoysala temples of Belur and Halebidu and the monolithic Bahubali statue at Shravanabelagola.",
    overview:
      "Our special one-day B.H.S. trip, by car, through the Hoysala heartland. At Belur, the Chennakeshava Temple is covered in intricate friezes; at Halebidu, the twin-shrined Hoysaleswara Temple and the Shantaleshwara shrine. At Shravanabelagola, climb Vindhyagiri hill to the monolithic statue of Gommateshwara (Bahubali), listed on our brochure as 57 feet tall.",
    startPoint: "Mysuru",
    departureTime: "",
    departureNotes: `Departure time is confirmed with your booking. ${PICKUP_NOTE}`,
    itinerary: [
      {
        day: 1,
        title: "Belur",
        stops: [{ name: "Chennakeshava Temple" }, { name: "Hoysala architecture" }],
      },
      {
        day: 1,
        title: "Halebidu",
        stops: [{ name: "Hoysaleswara Temple" }, { name: "Shantaleshwara Temple" }],
      },
      {
        day: 1,
        title: "Shravanabelagola",
        stops: [
          {
            name: "Gommateshwara (Bahubali) statue",
            note: "Listed as 57 ft. Reaching the statue involves climbing several hundred rock-cut steps.",
          },
        ],
      },
    ],
    inclusions: ["Sightseeing as per the itinerary"],
    exclusions: EXTRAS_EXCLUDED,
    transport: "By car",
    destinations: ["belur-halebidu", "shravanabelagola"],
    hero: "halebidu",
    gallery: [
      { image: "halebidu", caption: "Hoysaleswara Temple, Halebidu" },
      { image: "belur", caption: "Carvings at Belur" },
      { image: "shravanabelagola", caption: "Gommateshwara, Shravanabelagola" },
    ],
    featured: true,
    published: true,
    verificationNotes:
      "Brochure: 'Special One Day Trip — B.H.S. Sight Seeing … By CAR'. Departure time not stated — confirm. 'Beluru/Halebeedu' published as Belur/Halebidu; 'Hoysleshwara and Shanthaleshwara' → Hoysaleswara and Shantaleshwara.",
  },
  {
    slug: "nanjangud-bandipur-gopalaswamy-betta",
    code: "G",
    title: "Nanjangud, Bandipur & Gopalaswamy Betta",
    subtitle: "Temple town, forest road and a hilltop shrine",
    category: "pilgrimage",
    durationDays: 1,
    durationNights: 0,
    durationLabel: "Day trip",
    summary:
      "Visit the temple town of Nanjangud, drive through Bandipur and climb to the Himavad Gopalaswamy Temple in the hills.",
    overview:
      "Begin at Nanjangud and its Srikanteshwara Temple, continue to Bandipur, then up to Himavad Gopalaswamy Betta — a hilltop temple often wrapped in mist, inside the Bandipur forest.",
    startPoint: "Mysuru",
    departureTime: "",
    departureNotes: `Departure time is confirmed with your booking. ${PICKUP_NOTE}`,
    itinerary: [
      {
        day: 1,
        title: "Nanjangud to Gopalaswamy Betta",
        stops: [
          { name: "Nanjangud" },
          { name: "Bandipur", note: "Wildlife sightings are not guaranteed." },
          { name: "Himavad Gopalaswamy Temple", note: "Hill access is controlled by the forest department." },
        ],
      },
    ],
    inclusions: ["Sightseeing as per the itinerary"],
    exclusions: [...EXTRAS_EXCLUDED, "Forest department transport fees, where applicable"],
    transport: "By car",
    destinations: ["nanjangud", "bandipur"],
    hero: "gopalaswamy",
    gallery: [
      { image: "nanjangud", caption: "Srikanteshwara Temple, Nanjangud" },
      { image: "gopalaswamy", caption: "Gopalaswamy Betta" },
      { image: "bandipur", caption: "Bandipur" },
    ],
    featured: false,
    published: true,
    verificationNotes:
      "Brochure: 'Nanjanagud, Bandipur, Himavad Gopalswamy Temple — 1st Day', followed by Somanathapura and Talakadu 'By CAR'. These may form one multi-day circuit (Day 1 = this tour) — confirm, along with timing and whether Bandipur includes a safari (not assumed). Private vehicles may be restricted on Gopalaswamy Betta — confirm current access arrangement.",
  },
  {
    slug: "somanathapura-shivanasamudra-falls",
    code: "H",
    title: "Somanathapura & Shivanasamudra Falls",
    subtitle: "A Hoysala gem and the twin falls of the Kaveri",
    category: "waterfalls",
    durationDays: 1,
    durationNights: 0,
    durationLabel: "Day trip",
    summary:
      "The star-shaped Chennakeshava Temple at Somanathapura, then the Gaganachukki and Barachukki falls at Shivanasamudra.",
    overview:
      "Explore the exquisitely carved Chennakeshava Temple at Somanathapura, then drive to Shivanasamudra where the Kaveri plunges over the Gaganachukki and Barachukki falls — most dramatic during and after the monsoon.",
    startPoint: "Mysuru",
    departureTime: "",
    departureNotes: `Departure time is confirmed with your booking. ${PICKUP_NOTE}`,
    itinerary: [
      {
        day: 1,
        title: "Temple and falls",
        stops: [
          { name: "Chennakeshava Temple, Somanathapura" },
          { name: "Shivanasamudra" },
          { name: "Gaganachukki Falls" },
          { name: "Barachukki Falls" },
        ],
      },
    ],
    inclusions: ["Sightseeing as per the itinerary"],
    exclusions: [...EXTRAS_EXCLUDED, "Coracle rides"],
    importantNotes: "Water flow at the falls varies by season; viewpoints may close in heavy rain.",
    transport: "By car",
    destinations: ["somanathapura", "shivanasamudra"],
    hero: "somanathapura",
    gallery: [
      { image: "somanathapura", caption: "Chennakeshava Temple, Somanathapura" },
      { image: "gaganachukki", caption: "Gaganachukki Falls" },
      { image: "barachukki", caption: "Barachukki Falls" },
    ],
    featured: true,
    published: true,
    verificationNotes:
      "Brochure: 'Somanathapura (Channakeshava Temple, Shivanasamudra, Gaganachukki, Barachukki)', by car. Possibly day 2 of a circuit starting with Nanjangud/Bandipur — confirm duration and timing.",
  },
  {
    slug: "talakadu-temples",
    code: "I",
    title: "Talakadu",
    subtitle: "Temples among the sands of the Kaveri",
    category: "pilgrimage",
    durationDays: 1,
    durationNights: 0,
    durationLabel: "Day trip",
    summary: "A pilgrimage visit to Talakadu, the temple town on the sandy banks of the Kaveri, for Panchalingeshwara darshan.",
    overview:
      "Talakadu's temples sit among drifting sand dunes beside the Kaveri. The visit centres on darshan at the Panchalingeshwara temples. Tell us your preferred date and we'll plan around temple timings.",
    startPoint: "Mysuru",
    departureTime: "",
    departureNotes: `Departure time is confirmed with your booking. ${PICKUP_NOTE}`,
    itinerary: [
      {
        day: 1,
        title: "Talakadu",
        stops: [{ name: "Talakadu" }, { name: "Panchalingeshwara darshan" }],
      },
    ],
    inclusions: ["Sightseeing as per the itinerary"],
    exclusions: EXTRAS_EXCLUDED,
    transport: "By car",
    destinations: ["talakadu"],
    hero: "talakadu",
    gallery: [{ image: "talakadu", caption: "Temples at Talakadu" }],
    featured: false,
    published: true,
    verificationNotes:
      "Brochure: 'Talakadu — Panchalingeswara Darshana, By CAR'. The Panchalinga Darshana festival happens only on specific occasions; confirm whether this tour runs year-round. Confirm duration, timing and whether it is combined with the Somanathapura/Nanjangud trips.",
  },
];

export const seedFaqs: { question: string; answer: string; topic: string; showOnHome: boolean }[] = [
  {
    topic: "booking",
    showOnHome: true,
    question: "How do I book a tour?",
    answer:
      "Choose a tour or service and send an enquiry with your dates and group size. You'll get a reference number straight away. We then check availability and send you a quote. Your booking is only confirmed once you accept the quote and we confirm it with you.",
  },
  {
    topic: "booking",
    showOnHome: true,
    question: "Why don't all tours show a price?",
    answer:
      "Prices depend on your vehicle, group size, dates and any hotels. Where a fixed price is set it's shown on the tour; otherwise use “Request a quote” and we'll send an exact price.",
  },
  {
    topic: "booking",
    showOnHome: true,
    question: "Can I change the itinerary or departure time?",
    answer:
      "Tell us what you'd like in your enquiry — extra stops, a slower pace or a different start time — and we'll reflect what's possible in your quote.",
  },
  {
    topic: "booking",
    showOnHome: true,
    question: "Are entry tickets, guides, parking and tolls included?",
    answer:
      "No. Government entrance fees, guide charges, parking and toll charges are extra. Boating, horse riding and similar activities are optional and paid at the venue, unless your quote says otherwise.",
  },
  {
    topic: "booking",
    showOnHome: true,
    question: "What is your cancellation policy?",
    answer:
      "If you cancel at least 24 hours before the trip, 50% of the amount is refunded. No refund is given if you do not report in time for departure.",
  },
  {
    topic: "booking",
    showOnHome: false,
    question: "Is pickup and drop included?",
    answer: "Yes — pickup and drop are provided as a complimentary service. Your pickup point and time are confirmed with your booking.",
  },
  {
    topic: "booking",
    showOnHome: false,
    question: "How can I check on my enquiry?",
    answer:
      "Use the “Track enquiry” page with your reference number and the email or phone number you used. You'll see its status and any quote we've sent.",
  },
  {
    topic: "wildlife",
    showOnHome: true,
    question: "Will we see wildlife in Bandipur or Mudumalai?",
    answer:
      "The Mysuru–Ooty road passes through both forests and animals are sometimes seen from the road, but sightings can never be guaranteed. Forest safaris are separate and not included unless listed in your quote.",
  },
  {
    topic: "hotel",
    showOnHome: false,
    question: "Can you book hotels for us?",
    answer:
      "Yes — we handle hotel reservations in Mysuru, Ooty and Kodaikanal. Send your dates, rooms and budget, and we'll come back with options before anything is booked.",
  },
];

export const seedPages: {
  slug: string;
  title: string;
  intro: string;
  body: string;
  published: boolean;
  showInFooter: boolean;
}[] = [
  {
    slug: "about",
    title: "About Sardar Travels",
    intro: "Tours, vehicle hire and hotel reservations across Mysuru, the Nilgiris, Kodaikanal and Coorg.",
    body: `Sardar Travels plans sightseeing tours, hill-station holidays, heritage and pilgrimage circuits, vehicle hire and hotel reservations across southern Karnataka and the Tamil Nadu hills.

## What we arrange

- One-day sightseeing tours of Mysuru and Ooty
- Multi-day holidays to Ooty, Coonoor, Kodaikanal and Coorg
- Heritage and temple circuits — Belur, Halebidu, Shravanabelagola, Somanathapura and Talakadu
- All kinds of vehicles for hire, and hotel reservations in Mysuru, Ooty and Kodaikanal

## Our story

*Administrators: replace this section with the company's own history, licences and team before publishing this page.*`,
    published: false,
    showInFooter: true,
  },
  {
    slug: "booking-terms",
    title: "Booking terms",
    intro: "How enquiries, quotes and confirmations work.",
    body: `## Enquiries are not bookings

When you send an enquiry through this website you receive a reference number. This confirms we have received your request — it is **not** a confirmed booking.

## Quotes

We will check availability and send a quote showing the price and what is included. Government entrance fees, guide charges, parking and toll charges are extra, as are optional activities and anything else not listed in the quote.

## Confirmation

Your booking is confirmed only when you accept the quote and we confirm it with you directly.

## Cancellation and refunds

- 50% of the amount is refunded if you cancel at least 24 hours before the trip.
- No refund is given if you do not report in time for departure.

## Pickup and drop

Pickup and drop are provided as a complimentary service.

## Changes to the programme

The management reserves the right of admission and the right to change the programme without notice — for example because of weather, road or forest closures, or temple timings. We will always try to offer a suitable alternative.

## Responsibility

Sardar Travels is not responsible for delays or inconvenience during the journey caused by vehicle breakdown or other reasons beyond its control, or for the loss of passengers' luggage.`,
    published: true,
    showInFooter: true,
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    intro: "How we handle the details you share with us.",
    body: `## What we collect

When you send an enquiry we store the details you provide — your name, email address, phone number, travel dates and requirements — so that we can respond, prepare a quote and arrange your trip.

## How we use it

Your details are used only to handle your enquiry and booking. They are visible only to authorised Sardar Travels staff. We do not sell your information.

## Security

Enquiry data is held in a secured database and accessed through an authenticated staff dashboard. We keep a one-way hashed form of your IP address only to prevent spam.

## Cookies and analytics

We only use analytics cookies if you accept them in the cookie notice. They give us anonymous statistics (such as which pages are visited) and are never used to identify you. Declining has no effect on how the site works.

## Your choices

To see, correct or delete the information we hold about you, contact us using the details on our contact page.`,
    published: true,
    showInFooter: true,
  },
];

export const seedBusRoutes: { operator: string; destination: string }[] = [
  ...["Mumbai", "Pune", "Kolhapur", "Shivamogga", "Hubballi", "Dharwad", "Belagavi"].map((d) => ({
    operator: "VRL Travels",
    destination: d,
  })),
  ...["Mangaluru", "Udupi", "Manipal", "Kundapura", "Moodbidri", "Karkala", "Murudeshwara"].map((d) => ({
    operator: "Sugama Motors",
    destination: d,
  })),
];

/** Image keys used for site-wide imagery. */
export const seedHeroImages = ["mysore-palace", "nilgiri-tea", "abbey-falls", "kodai-view"];
export const seedImageAlts: Record<string, string> = {
  "mysore-palace": "Mysuru Palace with its domes against a blue sky",
  chamundi: "Gopuram of the Chamundeshwari Temple on Chamundi Hill",
  nandi: "The monolithic Nandi statue on Chamundi Hill",
  philomena: "Gothic spires of St. Philomena's Cathedral, Mysuru",
  brindavan: "Lawns and flower beds at Brindavan Gardens",
  jaganmohan: "Facade of Jaganmohan Palace, Mysuru",
  "mysore-zoo": "Giraffe at Mysuru Zoo",
  srirangapatna: "Gardens at Srirangapatna",
  "ooty-lake": "Boats moored on Ooty Lake",
  "nilgiri-tea": "Rolling tea estates in the Nilgiri Hills",
  "ooty-botanical": "Terraced paths of the Government Botanical Garden, Ooty",
  bandipur: "Spotted deer grazing in Bandipur forest",
  mudumalai: "Road winding through the Mudumalai forest",
  "dolphins-nose": "Visitors at the Dolphin's Nose viewpoint above the clouds, Coonoor",
  pykara: "Pykara Falls cascading through forest",
  "pykara-lake": "Pykara Lake surrounded by pine forest",
  "kodaikanal-lake": "Kodaikanal town and lake from the hills",
  "pillar-rocks": "The granite Pillar Rocks, Kodaikanal",
  "kodai-view": "Layered ridges of the Palani Hills near Kodaikanal",
  "abbey-falls": "Abbey Falls tumbling over dark rock, Coorg",
  "rajas-seat": "Valley view from Raja's Seat, Madikeri",
  namdroling: "Golden Buddha statues inside the Namdroling Monastery",
  dubare: "Elephant with mahout at Dubare",
  talakaveri: "Temple shrine at Talakaveri",
  coorg: "Green hills and forest in Kodagu",
  belur: "Intricately carved friezes at Belur",
  halebidu: "The Hoysaleswara Temple at Halebidu",
  shravanabelagola: "The Gommateshwara statue at Shravanabelagola",
  nanjangud: "Gopuram of the Srikanteshwara Temple, Nanjangud",
  gopalaswamy: "Grassy hilltop at Gopalaswamy Betta",
  somanathapura: "The Chennakeshava Temple at Somanathapura",
  gaganachukki: "Gaganachukki Falls at Shivanasamudra",
  barachukki: "Water cascading at Barachukki Falls",
  talakadu: "Stone temple at Talakadu",
  "karnataka-highway": "A quiet tree-lined highway in Karnataka",
};
