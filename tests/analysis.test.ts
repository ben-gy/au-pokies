import { describe, expect, it } from 'vitest';
import type { Lga, StateSummary } from '../src/data/pokies';
import {
  withMetrics, allMetrics, sortLgas, filterByState, searchLgas, detectInsights,
  stateTotals, nationalTotals,
} from '../src/analysis';

const SAMPLE: Lga[] = [
  { name: 'Fairfield', state: 'NSW', loss: 650_000_000, machines: 3_900, adults: 160_000, lat: -33.87, lng: 150.95 },
  { name: 'Brimbank', state: 'VIC', loss: 175_900_000, machines: 940, adults: 156_000, lat: -37.75, lng: 144.80 },
  { name: 'Gold Coast', state: 'QLD', loss: 400_000_000, machines: 5_000, adults: 500_000, lat: -28.02, lng: 153.40 },
  { name: 'Launceston', state: 'TAS', loss: 30_000_000, machines: 620, adults: 90_000, lat: -41.44, lng: 147.14 },
];

const STATES: StateSummary[] = [
  { state: 'NSW', name: 'New South Wales', totalLoss: 8_600_000_000, machines: 86_000, adults: 6_400_000, vintage: 'FY23-24', note: '' },
  { state: 'VIC', name: 'Victoria', totalLoss: 3_100_000_000, machines: 26_000, adults: 5_300_000, vintage: '24-25', note: '' },
  { state: 'TAS', name: 'Tasmania', totalLoss: 115_000_000, machines: 2_300, adults: 450_000, vintage: 'FY23-24', note: '' },
  { state: 'WA', name: 'Western Australia', totalLoss: 0, machines: 0, adults: 2_200_000, vintage: 'current', note: '' },
];

describe('withMetrics', () => {
  it('computes derived metrics', () => {
    const m = withMetrics(SAMPLE[0]);
    expect(m.perAdult).toBeCloseTo(4062.5, 1);
    expect(m.machinesPer1000).toBeCloseTo(24.375, 2);
    expect(m.slug).toBe('nsw-fairfield');
    expect(m.vsNational).toBeCloseTo(4062.5 / 633, 2);
  });
});

describe('sortLgas', () => {
  const rows = allMetrics(SAMPLE);
  it('sorts by loss descending', () => {
    expect(sortLgas(rows, 'loss', 'desc')[0].name).toBe('Fairfield');
  });
  it('sorts by perAdult descending (Fairfield tops)', () => {
    expect(sortLgas(rows, 'perAdult', 'desc')[0].name).toBe('Fairfield');
  });
  it('sorts by name ascending', () => {
    expect(sortLgas(rows, 'name', 'asc')[0].name).toBe('Brimbank');
  });
  it('does not mutate the input array', () => {
    const copy = rows.slice();
    sortLgas(rows, 'loss', 'asc');
    expect(rows.map((r) => r.name)).toEqual(copy.map((r) => r.name));
  });
});

describe('filterByState', () => {
  const rows = allMetrics(SAMPLE);
  it('ALL returns everything', () => expect(filterByState(rows, 'ALL')).toHaveLength(4));
  it('filters to one state', () => {
    const nsw = filterByState(rows, 'NSW');
    expect(nsw).toHaveLength(1);
    expect(nsw[0].name).toBe('Fairfield');
  });
  it('empty for a state with no rows', () => expect(filterByState(rows, 'NT')).toHaveLength(0));
});

describe('searchLgas', () => {
  const rows = allMetrics(SAMPLE);
  it('matches by name case-insensitively', () => expect(searchLgas(rows, 'brim')).toHaveLength(1));
  it('matches by state code', () => expect(searchLgas(rows, 'qld')).toHaveLength(1));
  it('empty query returns all', () => expect(searchLgas(rows, '  ')).toHaveLength(4));
  it('no match returns empty', () => expect(searchLgas(rows, 'zzz')).toHaveLength(0));
});

describe('detectInsights', () => {
  const rows = allMetrics(SAMPLE);
  const insights = detectInsights(rows, STATES);
  it('produces findings', () => expect(insights.length).toBeGreaterThan(0));
  it('flags the WA no-pokies anomaly', () => {
    expect(insights.some((i) => i.title.includes('Western Australia'))).toBe(true);
  });
  it('flags a per-adult outlier (Fairfield)', () => {
    expect(insights.some((i) => i.severity === 'alert' && i.title.includes('Fairfield'))).toBe(true);
  });
  it('returns empty for empty input', () => expect(detectInsights([], STATES)).toHaveLength(0));
});

describe('aggregates', () => {
  it('stateTotals adds per-adult', () => {
    const t = stateTotals(STATES);
    const nsw = t.find((s) => s.state === 'NSW')!;
    expect(nsw.perAdult).toBeCloseTo(8_600_000_000 / 6_400_000, 1);
  });
  it('nationalTotals sums losses and machines', () => {
    const n = nationalTotals(STATES);
    expect(n.totalLoss).toBe(8_600_000_000 + 3_100_000_000 + 115_000_000 + 0);
    expect(n.machines).toBe(86_000 + 26_000 + 2_300 + 0);
    expect(n.perAdult).toBeGreaterThan(0);
  });
  it('WA contributes zero losses', () => {
    const wa = stateTotals(STATES).find((s) => s.state === 'WA')!;
    expect(wa.perAdult).toBe(0);
  });
});
