// Pokies Losses (AU) — curated dataset
//
// Compiled from Australian state gambling regulator releases. Figures are annual
// electronic gaming machine (EGM) player losses ("net gaming machine profit" /
// "metered win" / "expenditure" depending on the jurisdiction's terminology),
// rounded, for the most recent published reporting period noted in `vintage`.
// Casino EGMs are excluded — this covers pubs and clubs, the machines in
// suburbs and towns. See the About panel for sources and caveats.

export type StateCode = 'NSW' | 'VIC' | 'QLD' | 'SA' | 'ACT' | 'TAS' | 'NT' | 'WA';

export interface Lga {
  /** Local Government Area (or reporting region) name */
  name: string;
  state: StateCode;
  /** Annual EGM player losses, in AUD */
  loss: number;
  /** Number of EGMs (poker machines) in pubs and clubs */
  machines: number;
  /** Adult (18+) resident population */
  adults: number;
  /** Approximate centroid latitude */
  lat: number;
  /** Approximate centroid longitude */
  lng: number;
}

export interface StateSummary {
  state: StateCode;
  name: string;
  /** Annual EGM player losses across pubs and clubs, in AUD */
  totalLoss: number;
  /** Total EGMs in pubs and clubs */
  machines: number;
  /** Adult (18+) resident population of the state/territory */
  adults: number;
  /** Reporting period the figures relate to */
  vintage: string;
  /** Short plain-English note about how this jurisdiction reports/regulates */
  note: string;
}

// National reference — pubs-and-clubs EGM losses per adult, Australia-wide.
export const NATIONAL_PER_ADULT = 633;

export const STATE_SUMMARIES: StateSummary[] = [
  {
    state: 'NSW', name: 'New South Wales', totalLoss: 8_600_000_000, machines: 86_000,
    adults: 6_400_000, vintage: 'FY2023–24',
    note: 'By far the largest pokies market in Australia — roughly half the nation’s machines. Reported 6-monthly by Liquor & Gaming NSW.',
  },
  {
    state: 'VIC', name: 'Victoria', totalLoss: 3_100_000_000, machines: 26_000,
    adults: 5_300_000, vintage: '2024–25',
    note: 'Excludes Crown Melbourne casino. The VGCCC publishes LGA expenditure every month — the most transparent regime in the country.',
  },
  {
    state: 'QLD', name: 'Queensland', totalLoss: 2_600_000_000, machines: 46_000,
    adults: 4_300_000, vintage: 'FY2023–24',
    note: 'Second only to NSW for machine numbers. Reported quarterly by the Office of Liquor and Gaming Regulation.',
  },
  {
    state: 'SA', name: 'South Australia', totalLoss: 750_000_000, machines: 12_000,
    adults: 1_450_000, vintage: 'FY2023–24',
    note: 'Hotels and clubs only; machine numbers are capped and slowly declining.',
  },
  {
    state: 'ACT', name: 'Australian Capital Territory', totalLoss: 160_000_000, machines: 3_400,
    adults: 360_000, vintage: 'FY2023–24',
    note: 'Machines are held almost entirely by clubs; no pokies in hotels. Machine cap has been progressively reduced.',
  },
  {
    state: 'TAS', name: 'Tasmania', totalLoss: 115_000_000, machines: 2_300,
    adults: 450_000, vintage: 'FY2023–24',
    note: 'Lowest per-adult losses in the country. Moving to mandatory pre-commitment (card-based play).',
  },
  {
    state: 'NT', name: 'Northern Territory', totalLoss: 110_000_000, machines: 1_900,
    adults: 190_000, vintage: 'FY2023–24',
    note: 'Small market but high per-adult losses relative to population.',
  },
  {
    state: 'WA', name: 'Western Australia', totalLoss: 0, machines: 0,
    adults: 2_200_000, vintage: 'current',
    note: 'The national outlier: WA bans poker machines everywhere except Crown Perth casino. There are no pokies in any WA pub or club.',
  },
];

export const LGAS: Lga[] = [
  // ── New South Wales (Liquor & Gaming NSW, net gaming machine profit by LGA) ──
  { name: 'Fairfield', state: 'NSW', loss: 650_000_000, machines: 3_900, adults: 160_000, lat: -33.87, lng: 150.95 },
  { name: 'Canterbury-Bankstown', state: 'NSW', loss: 640_000_000, machines: 4_050, adults: 280_000, lat: -33.92, lng: 151.03 },
  { name: 'Cumberland', state: 'NSW', loss: 400_000_000, machines: 2_400, adults: 180_000, lat: -33.83, lng: 150.98 },
  { name: 'Blacktown', state: 'NSW', loss: 360_000_000, machines: 2_900, adults: 290_000, lat: -33.77, lng: 150.91 },
  { name: 'Liverpool', state: 'NSW', loss: 300_000_000, machines: 2_100, adults: 180_000, lat: -33.92, lng: 150.92 },
  { name: 'Penrith', state: 'NSW', loss: 285_000_000, machines: 2_300, adults: 175_000, lat: -33.75, lng: 150.69 },
  { name: 'Central Coast', state: 'NSW', loss: 265_000_000, machines: 3_400, adults: 270_000, lat: -33.30, lng: 151.35 },
  { name: 'Sydney', state: 'NSW', loss: 235_000_000, machines: 1_900, adults: 205_000, lat: -33.87, lng: 151.21 },
  { name: 'Georges River', state: 'NSW', loss: 220_000_000, machines: 1_700, adults: 135_000, lat: -33.97, lng: 151.10 },
  { name: 'Parramatta', state: 'NSW', loss: 210_000_000, machines: 1_800, adults: 205_000, lat: -33.81, lng: 151.00 },
  { name: 'Bayside', state: 'NSW', loss: 185_000_000, machines: 1_450, adults: 145_000, lat: -33.95, lng: 151.14 },
  { name: 'Campbelltown', state: 'NSW', loss: 175_000_000, machines: 1_550, adults: 145_000, lat: -34.07, lng: 150.81 },
  { name: 'Inner West', state: 'NSW', loss: 155_000_000, machines: 1_300, adults: 160_000, lat: -33.89, lng: 151.14 },
  { name: 'Newcastle', state: 'NSW', loss: 150_000_000, machines: 1_950, adults: 135_000, lat: -32.93, lng: 151.78 },
  { name: 'Wollongong', state: 'NSW', loss: 150_000_000, machines: 2_000, adults: 175_000, lat: -34.42, lng: 150.89 },

  // ── Victoria (VGCCC monthly EGM expenditure by LGA) ──
  { name: 'Brimbank', state: 'VIC', loss: 175_900_000, machines: 940, adults: 156_000, lat: -37.75, lng: 144.80 },
  { name: 'Casey', state: 'VIC', loss: 132_000_000, machines: 1_000, adults: 255_000, lat: -38.05, lng: 145.30 },
  { name: 'Hume', state: 'VIC', loss: 130_000_000, machines: 900, adults: 185_000, lat: -37.60, lng: 144.85 },
  { name: 'Greater Dandenong', state: 'VIC', loss: 120_000_000, machines: 950, adults: 130_000, lat: -37.98, lng: 145.22 },
  { name: 'Whittlesea', state: 'VIC', loss: 110_000_000, machines: 820, adults: 185_000, lat: -37.51, lng: 145.10 },
  { name: 'Wyndham', state: 'VIC', loss: 100_000_000, machines: 760, adults: 215_000, lat: -37.90, lng: 144.66 },
  { name: 'Greater Geelong', state: 'VIC', loss: 97_000_000, machines: 1_200, adults: 215_000, lat: -38.15, lng: 144.36 },
  { name: 'Monash', state: 'VIC', loss: 95_000_000, machines: 900, adults: 160_000, lat: -37.89, lng: 145.13 },
  { name: 'Kingston', state: 'VIC', loss: 90_000_000, machines: 900, adults: 130_000, lat: -37.98, lng: 145.08 },
  { name: 'Darebin', state: 'VIC', loss: 85_000_000, machines: 800, adults: 130_000, lat: -37.74, lng: 145.00 },
  { name: 'Frankston', state: 'VIC', loss: 82_000_000, machines: 850, adults: 110_000, lat: -38.14, lng: 145.12 },
  { name: 'Melton', state: 'VIC', loss: 78_000_000, machines: 620, adults: 130_000, lat: -37.68, lng: 144.58 },

  // ── Queensland (OLGR EGM metered win by LGA) ──
  { name: 'Gold Coast', state: 'QLD', loss: 400_000_000, machines: 5_000, adults: 500_000, lat: -28.02, lng: 153.40 },
  { name: 'Brisbane', state: 'QLD', loss: 380_000_000, machines: 5_500, adults: 950_000, lat: -27.47, lng: 153.02 },
  { name: 'Moreton Bay', state: 'QLD', loss: 220_000_000, machines: 3_000, adults: 380_000, lat: -27.23, lng: 152.92 },
  { name: 'Sunshine Coast', state: 'QLD', loss: 145_000_000, machines: 2_200, adults: 290_000, lat: -26.65, lng: 153.07 },
  { name: 'Logan', state: 'QLD', loss: 150_000_000, machines: 2_000, adults: 260_000, lat: -27.64, lng: 153.11 },
  { name: 'Townsville', state: 'QLD', loss: 130_000_000, machines: 1_900, adults: 155_000, lat: -19.26, lng: 146.82 },
  { name: 'Cairns', state: 'QLD', loss: 120_000_000, machines: 1_700, adults: 145_000, lat: -16.92, lng: 145.77 },
  { name: 'Ipswich', state: 'QLD', loss: 110_000_000, machines: 1_500, adults: 185_000, lat: -27.61, lng: 152.76 },
  { name: 'Toowoomba', state: 'QLD', loss: 90_000_000, machines: 1_500, adults: 135_000, lat: -27.56, lng: 151.95 },

  // ── South Australia (CBS gaming net gambling revenue by LGA) ──
  { name: 'Onkaparinga', state: 'SA', loss: 58_000_000, machines: 900, adults: 140_000, lat: -35.13, lng: 138.52 },
  { name: 'Charles Sturt', state: 'SA', loss: 55_000_000, machines: 850, adults: 95_000, lat: -34.88, lng: 138.52 },
  { name: 'Port Adelaide Enfield', state: 'SA', loss: 52_000_000, machines: 820, adults: 100_000, lat: -34.83, lng: 138.55 },
  { name: 'Salisbury', state: 'SA', loss: 48_000_000, machines: 750, adults: 115_000, lat: -34.76, lng: 138.64 },
  { name: 'Playford', state: 'SA', loss: 42_000_000, machines: 620, adults: 75_000, lat: -34.66, lng: 138.69 },
  { name: 'Adelaide', state: 'SA', loss: 38_000_000, machines: 520, adults: 22_000, lat: -34.93, lng: 138.60 },

  // ── ACT / TAS / NT (reported at territory / city region level) ──
  { name: 'Canberra (ACT clubs)', state: 'ACT', loss: 160_000_000, machines: 3_400, adults: 360_000, lat: -35.28, lng: 149.13 },
  { name: 'Greater Hobart', state: 'TAS', loss: 55_000_000, machines: 1_050, adults: 190_000, lat: -42.88, lng: 147.33 },
  { name: 'Launceston', state: 'TAS', loss: 30_000_000, machines: 620, adults: 90_000, lat: -41.44, lng: 147.14 },
  { name: 'Darwin', state: 'NT', loss: 70_000_000, machines: 1_150, adults: 110_000, lat: -12.46, lng: 130.84 },
  { name: 'Alice Springs', state: 'NT', loss: 22_000_000, machines: 420, adults: 22_000, lat: -23.70, lng: 133.88 },
];
