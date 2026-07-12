import { describe, expect, it } from 'vitest';
import {
  formatNumber, formatCurrencyCompact, formatCurrencyFull, perAdult, peoplePerMachine,
  machinesPer1000, median, rampPosition, intensityColor, slugify,
} from '../src/utils/format';

describe('formatNumber', () => {
  it('adds thousands separators', () => expect(formatNumber(1234567)).toBe('1,234,567'));
  it('handles zero', () => expect(formatNumber(0)).toBe('0'));
  it('handles negatives', () => expect(formatNumber(-1234)).toBe('-1,234'));
  it('respects decimals', () => expect(formatNumber(1234.5, 1)).toBe('1,234.5'));
  it('returns em dash for non-finite', () => expect(formatNumber(Infinity)).toBe('—'));
});

describe('formatCurrencyCompact', () => {
  it('formats billions', () => expect(formatCurrencyCompact(8_600_000_000)).toBe('$8.6B'));
  it('formats millions', () => expect(formatCurrencyCompact(175_900_000)).toBe('$175.9M'));
  it('formats thousands', () => expect(formatCurrencyCompact(12_500)).toBe('$12.5K'));
  it('formats small values', () => expect(formatCurrencyCompact(420)).toBe('$420'));
  it('handles zero explicitly', () => expect(formatCurrencyCompact(0)).toBe('$0'));
  it('handles negatives', () => expect(formatCurrencyCompact(-2_000_000)).toBe('-$2.0M'));
});

describe('formatCurrencyFull', () => {
  it('formats with separators and rounds', () => expect(formatCurrencyFull(175_900_000)).toBe('$175,900,000'));
  it('rounds fractional cents', () => expect(formatCurrencyFull(1234.6)).toBe('$1,235'));
});

describe('perAdult', () => {
  it('divides loss by adults', () => expect(perAdult(175_900_000, 156_000)).toBeCloseTo(1127.56, 1));
  it('returns 0 when adults is zero', () => expect(perAdult(100, 0)).toBe(0));
  it('returns 0 when adults is negative', () => expect(perAdult(100, -5)).toBe(0));
});

describe('density helpers', () => {
  it('peoplePerMachine divides adults by machines', () => expect(peoplePerMachine(160_000, 3_900)).toBeCloseTo(41.03, 1));
  it('peoplePerMachine guards zero machines', () => expect(peoplePerMachine(100, 0)).toBe(0));
  it('machinesPer1000 scales correctly', () => expect(machinesPer1000(3_900, 160_000)).toBeCloseTo(24.375, 2));
  it('machinesPer1000 guards zero adults', () => expect(machinesPer1000(10, 0)).toBe(0));
});

describe('median', () => {
  it('odd-length', () => expect(median([3, 1, 2])).toBe(2));
  it('even-length averages the middle two', () => expect(median([1, 2, 3, 4])).toBe(2.5));
  it('empty returns 0', () => expect(median([])).toBe(0));
  it('ignores non-finite values', () => expect(median([1, 2, NaN, 3])).toBe(2));
});

describe('rampPosition', () => {
  it('maps midpoint to 0.5', () => expect(rampPosition(5, 0, 10)).toBe(0.5));
  it('clamps below min', () => expect(rampPosition(-5, 0, 10)).toBe(0));
  it('clamps above max', () => expect(rampPosition(15, 0, 10)).toBe(1));
  it('degenerate range maps to 0', () => expect(rampPosition(5, 5, 5)).toBe(0));
});

describe('intensityColor', () => {
  it('returns an rgb string', () => expect(intensityColor(0.5)).toMatch(/^rgb\(\d+, \d+, \d+\)$/));
  it('low end is sandy (high red+green, low-ish blue)', () => expect(intensityColor(0)).toBe('rgb(250, 240, 217)'));
  it('high end is deep red', () => expect(intensityColor(1)).toBe('rgb(190, 24, 24)'));
  it('clamps out-of-range input', () => expect(intensityColor(2)).toBe(intensityColor(1)));
});

describe('slugify', () => {
  it('kebab-cases and strips punctuation', () => expect(slugify('Canterbury-Bankstown')).toBe('canterbury-bankstown'));
  it('handles spaces and parens', () => expect(slugify('Canberra (ACT clubs)')).toBe('canberra-act-clubs'));
  it('trims leading/trailing separators', () => expect(slugify('  Hume  ')).toBe('hume'));
});
