import type { StateCode } from '../data/pokies';

// One colour per state/territory, used consistently across every view.
export const STATE_COLORS: Record<StateCode, string> = {
  NSW: '#0f766e', // teal
  VIC: '#2563eb', // blue
  QLD: '#b45309', // maroon-amber
  SA: '#7c3aed', // violet
  ACT: '#0891b2', // cyan
  TAS: '#15803d', // green
  NT: '#c2410c', // burnt orange
  WA: '#94a3b8', // slate (no pokies)
};

export const STATE_ORDER: StateCode[] = ['NSW', 'VIC', 'QLD', 'SA', 'ACT', 'TAS', 'NT', 'WA'];

export function stateColor(state: StateCode): string {
  return STATE_COLORS[state] ?? '#64748b';
}
