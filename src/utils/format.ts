// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Ben Richardson — https://benrichardson.dev
// Additional terms under AGPL-3.0 section 7(b) apply; see ADDITIONAL-TERMS.md.
// Pure formatting + derived-metric helpers. Fully unit-tested.

/** Format an integer/float with locale thousands separators. */
export function formatNumber(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Compact currency: $8.6B, $175.9M, $58.0M, $0. */
export function formatCurrencyCompact(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '$0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

/** Full currency with separators: $175,900,000. */
export function formatCurrencyFull(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `$${formatNumber(Math.round(value))}`;
}

/** Per-adult dollar figure: $1,129/adult. Returns 0 for zero-population inputs. */
export function perAdult(loss: number, adults: number): number {
  if (!adults || adults <= 0) return 0;
  return loss / adults;
}

/** People per machine — lower means denser saturation. */
export function peoplePerMachine(adults: number, machines: number): number {
  if (!machines || machines <= 0) return 0;
  return adults / machines;
}

/** Machines per 1,000 adults — higher means denser saturation. */
export function machinesPer1000(machines: number, adults: number): number {
  if (!adults || adults <= 0) return 0;
  return (machines / adults) * 1000;
}

/** Median of a numeric array (returns 0 for empty). */
export function median(values: number[]): number {
  const nums = values.filter((v) => Number.isFinite(v)).slice().sort((a, b) => a - b);
  if (nums.length === 0) return 0;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
}

/**
 * Map a value within [min,max] onto a 0..1 position for a sequential colour ramp.
 * Clamped; a degenerate range (min===max) maps everything to 0.
 */
export function rampPosition(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  const t = (value - min) / (max - min);
  return Math.max(0, Math.min(1, t));
}

/**
 * Amber -> red sequential colour for per-adult intensity.
 * t in [0,1]; returns an rgb() string. Low = calm sand, high = alarm red.
 */
export function intensityColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  // Interpolate through sand -> amber -> red.
  const stops: Array<[number, [number, number, number]]> = [
    [0.0, [250, 240, 217]],
    [0.5, [245, 158, 11]],
    [1.0, [190, 24, 24]],
  ];
  let lo = stops[0];
  let hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i][0] && clamped <= stops[i + 1][0]) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const span = hi[0] - lo[0] || 1;
  const local = (clamped - lo[0]) / span;
  const ch = (a: number, b: number) => Math.round(a + (b - a) * local);
  return `rgb(${ch(lo[1][0], hi[1][0])}, ${ch(lo[1][1], hi[1][1])}, ${ch(lo[1][2], hi[1][2])})`;
}

/** Slugify a name for URL hashes and ids. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
