# Site Plan: Pokies Losses (AU)

## Overview
- **Name:** Pokies Losses (AU)
- **Repo name:** au-pokies
- **Tagline:** How much your community loses to poker machines — Australian electronic gaming machine losses by Local Government Area.

## Target Audience
Australian residents, journalists, council staff, community/health advocates and researchers who want to know how much money is lost to poker machines in their LGA and how their area compares per‑adult to the rest of the country. General public on desktop and mobile; low domain knowledge assumed.

## Value Proposition
Pokies loss data is published by state regulators but scattered across eight different portals in inconsistent formats. This unifies it into one interface where anyone can rank LGAs by raw and per‑adult losses, see machine density, view it on a map, and understand the stark state‑by‑state contrast (including that WA has no suburban pokies at all). Answers "how much do people lose on the pokies where I live?" in one place.

## Data Sources
| Source | URL | What it provides | Update frequency | Auth required? |
|--------|-----|-------------------|-----------------|----------------|
| Liquor & Gaming NSW – EGM data by LGA | https://www.liquorandgaming.nsw.gov.au/resources/gaming-machine-data | NSW club & hotel net gaming machine profit and machine counts by LGA | 6‑monthly | No |
| VGCCC – Gambling data | https://www.vgccc.vic.gov.au/for-community/gambling-victoria/gambling-data | VIC EGM expenditure and machine counts by LGA | Monthly | No |
| QLD OLGR – Gaming statistics | https://www.justice.qld.gov.au/initiatives/queensland-government-statisticians-office | QLD EGM metered win and machine counts by LGA | Quarterly | No |
| SA Consumer & Business Services – Gaming data | https://www.cbs.sa.gov.au/gambling | SA EGM net gambling revenue | Annual | No |
| Australian Gambling Statistics (QGSO) | https://www.qgso.qld.gov.au/statistics/theme/society/gambling/australian-gambling-statistics | State totals & per‑adult expenditure, all jurisdictions | Annual | No |

## Key Features
1. National overview — state comparison of total & per‑adult losses, with the WA "no pokies" anomaly called out.
2. LGA leaderboard — sortable/filterable table ranked by raw loss, per‑adult loss, or machine density.
3. Leaflet map — LGA centroids sized by total loss, coloured by per‑adult loss.
4. Per‑capita analysis — every LGA vs its state median and the national average.
5. Cross‑reference matrix — state × metric heatmap.
6. Treemap — composition of national losses (state → LGA).
7. Insights — auto‑detected anomalies (per‑adult outliers, extreme machine density, concentration).
8. Glossary + About modal — plain‑English explanations of EGM, net gaming profit, per‑adult loss, etc.

## Target Audience (detailed)
A mix of ordinary residents ("what happens in my suburb?"), local journalists chasing a per‑capita angle, and council/health workers building the case for machine caps. Mostly desktop but must work on phones. Emotionally charged topic (harm, disadvantage) — tone must be factual and non‑sensational, never gamified.

## Style Direction
**Tone:** civic / public‑interest, factual, calm.
**Colour palette:** light, clean, trustworthy — off‑white surfaces, deep slate text, a muted teal primary with an amber→red sequential scale for per‑adult loss intensity. Avoids casino reds/golds so it never reads as promoting gambling.
**UI density:** balanced — readable cards and tables, not a terminal.
**Dark/light theme:** light.
**Reference sites for tone:** fuelaustralia.org (clean utility), ABC News data explainers.

## Technical Architecture
- **Stack:** Vanilla TypeScript + Vite.
- **Data strategy:** embedded (curated JSON compiled from the published regulator releases; documented vintage).
- **Key libraries:** Leaflet (map). All charts hand‑rolled SVG.

## Layout
Fixed header (title, view tabs, state filter, About/? button). Main scroll area renders the active view. Sticky footer with attribution and data vintage. Panels stack < 768px; tabs become a scrollable row.

## Pages/Views
Single page, tabbed views: Overview · Leaderboard · Map · Per‑Capita · Matrix · Treemap · Insights.

## Visualization Strategy
- **Leaderboard table** (sortable/filterable) — the core answer, per‑adom & density columns.
- **State bar charts** (total & per‑adult) — the big national picture and the WA anomaly.
- **Leaflet map** — geography of harm; where machines cluster.
- **Per‑capita dot plot** — LGA vs state median vs national average; reveals disadvantage clustering.
- **State × metric matrix** — compare jurisdictions across losses, per‑adult, density, machines at a glance.
- **Treemap** — composition: what share each state/LGA is of the national total.
- **Insights cards** — auto anomaly detection (>2× median per‑adult, extreme density, concentration).
