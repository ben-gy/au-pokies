// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Ben Richardson — https://benrichardson.dev
// Additional terms under AGPL-3.0 section 7(b) apply; see ADDITIONAL-TERMS.md.
import type { Lga, StateCode, StateSummary } from './data/pokies';
import { NATIONAL_PER_ADULT } from './data/pokies';
import { machinesPer1000, median, perAdult, peoplePerMachine, slugify } from './utils/format';

export interface LgaMetrics extends Lga {
  slug: string;
  perAdult: number;
  machinesPer1000: number;
  peoplePerMachine: number;
  /** Ratio of this LGA's per-adult loss to the national pubs-and-clubs average. */
  vsNational: number;
}

export function withMetrics(lga: Lga): LgaMetrics {
  return {
    ...lga,
    slug: slugify(`${lga.state}-${lga.name}`),
    perAdult: perAdult(lga.loss, lga.adults),
    machinesPer1000: machinesPer1000(lga.machines, lga.adults),
    peoplePerMachine: peoplePerMachine(lga.adults, lga.machines),
    vsNational: NATIONAL_PER_ADULT > 0 ? perAdult(lga.loss, lga.adults) / NATIONAL_PER_ADULT : 0,
  };
}

export function allMetrics(lgas: Lga[]): LgaMetrics[] {
  return lgas.map(withMetrics);
}

export type SortKey = 'loss' | 'perAdult' | 'machines' | 'machinesPer1000' | 'name';

export function sortLgas(rows: LgaMetrics[], key: SortKey, dir: 'asc' | 'desc'): LgaMetrics[] {
  const sorted = rows.slice().sort((a, b) => {
    if (key === 'name') return a.name.localeCompare(b.name);
    return (a[key] as number) - (b[key] as number);
  });
  return dir === 'desc' ? sorted.reverse() : sorted;
}

export function filterByState(rows: LgaMetrics[], state: StateCode | 'ALL'): LgaMetrics[] {
  return state === 'ALL' ? rows : rows.filter((r) => r.state === state);
}

export function searchLgas(rows: LgaMetrics[], query: string): LgaMetrics[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((r) => r.name.toLowerCase().includes(q) || r.state.toLowerCase().includes(q));
}

// ── Insights / anomaly detection ────────────────────────────────────────────

export type InsightSeverity = 'alert' | 'warning' | 'info';

export interface Insight {
  severity: InsightSeverity;
  title: string;
  detail: string;
}

/**
 * Scan the dataset for statistically notable findings.
 * Pure function over the metric rows + state summaries.
 */
export function detectInsights(rows: LgaMetrics[], states: StateSummary[]): Insight[] {
  const insights: Insight[] = [];
  if (rows.length === 0) return insights;

  const perAdultValues = rows.map((r) => r.perAdult);
  const medPerAdult = median(perAdultValues);

  // 1. Per-adult outliers: more than 2x the median LGA.
  const outliers = rows
    .filter((r) => r.perAdult > medPerAdult * 2)
    .sort((a, b) => b.perAdult - a.perAdult);
  for (const o of outliers.slice(0, 4)) {
    insights.push({
      severity: 'alert',
      title: `${o.name} (${o.state}) — $${Math.round(o.perAdult).toLocaleString('en-AU')} lost per adult`,
      detail: `That is ${(o.perAdult / (medPerAdult || 1)).toFixed(1)}× the median area in this dataset and ${(o.vsNational).toFixed(1)}× the national pubs-and-clubs average.`,
    });
  }

  // 2. WA anomaly — no suburban pokies at all.
  const wa = states.find((s) => s.state === 'WA');
  if (wa && wa.machines === 0) {
    insights.push({
      severity: 'info',
      title: 'Western Australia has no suburban pokies',
      detail:
        'WA is the only state that bans poker machines outside its single casino. A WA resident cannot lose money on a pub or club pokie anywhere in the state.',
    });
  }

  // 3. Concentration — top 3 LGAs as a share of all listed losses.
  const totalListed = rows.reduce((sum, r) => sum + r.loss, 0);
  const top3 = rows.slice().sort((a, b) => b.loss - a.loss).slice(0, 3);
  const top3Share = totalListed > 0 ? top3.reduce((s, r) => s + r.loss, 0) / totalListed : 0;
  if (top3Share > 0.15) {
    insights.push({
      severity: 'warning',
      title: `Just 3 areas account for ${(top3Share * 100).toFixed(0)}% of listed losses`,
      detail: `${top3.map((r) => `${r.name} (${r.state})`).join(', ')} together lose more than a sixth of every dollar tracked here — a striking concentration in a handful of disadvantaged areas.`,
    });
  }

  // 4. Extreme machine density.
  const densest = rows.slice().sort((a, b) => b.machinesPer1000 - a.machinesPer1000)[0];
  if (densest && densest.machinesPer1000 > 0) {
    insights.push({
      severity: 'warning',
      title: `${densest.name} (${densest.state}) is the most saturated area`,
      detail: `It has ${densest.machinesPer1000.toFixed(1)} machines per 1,000 adults — one pokie for roughly every ${Math.round(densest.peoplePerMachine)} people.`,
    });
  }

  // 5. State per-adult spread.
  const stateWithMachines = states.filter((s) => s.machines > 0);
  if (stateWithMachines.length >= 2) {
    const stPer = stateWithMachines
      .map((s) => ({ s, v: perAdult(s.totalLoss, s.adults) }))
      .sort((a, b) => b.v - a.v);
    const hi = stPer[0];
    const lo = stPer[stPer.length - 1];
    insights.push({
      severity: 'info',
      title: `${hi.s.name} loses ${(hi.v / (lo.v || 1)).toFixed(1)}× more per adult than ${lo.s.name}`,
      detail: `Per adult, ${hi.s.name} residents lose about $${Math.round(hi.v).toLocaleString('en-AU')} a year versus $${Math.round(lo.v).toLocaleString('en-AU')} in ${lo.s.name} — the same machines, very different exposure.`,
    });
  }

  return insights;
}

/** Aggregate helpers for the overview view. */
export function stateTotals(states: StateSummary[]) {
  return states.map((s) => ({
    ...s,
    perAdult: perAdult(s.totalLoss, s.adults),
  }));
}

export function nationalTotals(states: StateSummary[]) {
  const totalLoss = states.reduce((s, x) => s + x.totalLoss, 0);
  const machines = states.reduce((s, x) => s + x.machines, 0);
  const adults = states.reduce((s, x) => s + x.adults, 0);
  return { totalLoss, machines, adults, perAdult: perAdult(totalLoss, adults) };
}
