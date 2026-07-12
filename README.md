# Pokies Losses (AU)

**How much your community loses to poker machines — Australian electronic gaming machine losses by Local Government Area.**

🔗 **Live:** [https://au-pokies.benrichardson.dev](https://au-pokies.benrichardson.dev)

## What is this?

Australians lose more money to poker machines ("pokies") per person than any population on earth — roughly $15 billion a year in pubs and clubs alone, before you even count the casinos. Every state regulator publishes the numbers, but they're scattered across eight different portals in eight different formats, using different words for the same thing ("net gaming machine profit", "metered win", "expenditure").

Pokies Losses (AU) unifies the headline figures into one interface. You can rank every Local Government Area by total losses or by loss per adult, see where the machines cluster on a map, compare states across four measures at once, and read auto-generated insights that surface the outliers — like Fairfield in Western Sydney, or the fact that Western Australia bans suburban pokies entirely.

It's a plain-English, non-commercial civic tool. Every jargon term has a click-to-read definition, and the About panel documents exactly where each number comes from.

## Who is this for?

Residents wondering how much is lost where they live; local journalists chasing a per-capita angle; council and community-health workers building the case for machine caps; and researchers who want the national picture in one place. Works on desktop and mobile; assumes no prior knowledge of gambling regulation.

## Data Sources

| Source | What it provides | Update frequency |
|--------|-------------------|-----------------|
| Liquor & Gaming NSW | NSW net gaming machine profit & machine counts by LGA | 6-monthly |
| VGCCC (Victoria) | VIC EGM expenditure & machine counts by LGA | Monthly |
| QLD Office of Liquor and Gaming Regulation | QLD metered win & machine counts by LGA | Quarterly |
| SA Consumer & Business Services | SA net gambling revenue by LGA | Annual |
| QGSO — Australian Gambling Statistics | State totals & per-adult expenditure, all jurisdictions | Annual |

Figures are compiled from published regulator releases and rounded; casino EGMs are excluded. Reporting periods differ by state and are shown in the About panel.

## Features

- **National overview** — total and per-adult losses by state, with WA's pokies ban shown in stark relief.
- **LGA leaderboard** — sortable, searchable table ranked by total loss, per-adult loss, or machine density.
- **Interactive map** — Leaflet circles sized by total loss, coloured by per-adult intensity.
- **Per-capita dot plot** — every area against the national average of $633/adult.
- **State cross-reference matrix** — a colour-coded heatmap across four measures.
- **Treemap** — squarified composition of national losses by area and state.
- **Auto-detected insights** — per-adult outliers, machine-density extremes, and loss concentration.
- **Glossary + About** — plain-English definitions on every term and full source documentation.

## Tech Stack

- **Runtime:** Vanilla TypeScript
- **Build:** Vite 6
- **Testing:** Vitest (54 unit tests)
- **Hosting:** GitHub Pages (static, no backend)
- **Data:** Embedded, curated JSON compiled from regulator releases
- **Maps:** Leaflet + CARTO basemap tiles

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Production build
npm run build

# Preview production build
npm run preview
```

## How it works

The dataset lives in `src/data/pokies.ts` as typed arrays of LGA and state records. Pure functions in `src/utils/format.ts` and `src/analysis.ts` derive per-adult, density, ranking, and anomaly metrics — all covered by unit tests. `src/main.ts` renders seven tabbed views from that data with hand-rolled SVG/CSS charts (no charting library), plus a Leaflet map. There's no runtime data fetching, so the site loads instantly and works offline once cached.

## Responsible gambling

This site is educational and does not promote gambling. If gambling is causing harm, call the National Gambling Helpline on **1800 858 858** (free, 24/7).

## License

MIT
