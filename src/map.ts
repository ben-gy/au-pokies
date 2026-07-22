// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Ben Richardson — https://benrichardson.dev
// Additional terms under AGPL-3.0 section 7(b) apply; see ADDITIONAL-TERMS.md.
import L from 'leaflet';
import type { LgaMetrics } from './analysis';
import { intensityColor, formatCurrencyCompact, rampPosition } from './utils/format';

let map: L.Map | null = null;
let layer: L.LayerGroup | null = null;

/**
 * Render (or re-render) the Leaflet map with one circle marker per LGA.
 * Radius encodes total loss; fill colour encodes per-adult loss intensity.
 */
export function renderMap(container: HTMLElement, rows: LgaMetrics[], onSelect: (slug: string) => void): void {
  if (!map) {
    map = L.map(container, { scrollWheelZoom: false, attributionControl: true }).setView([-27.5, 134], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 12,
    }).addTo(map);
  }
  if (layer) {
    layer.remove();
    layer = null;
  }
  layer = L.layerGroup().addTo(map);

  if (rows.length === 0) return;

  const maxLoss = Math.max(...rows.map((r) => r.loss));
  const perAdultValues = rows.map((r) => r.perAdult);
  const minPa = Math.min(...perAdultValues);
  const maxPa = Math.max(...perAdultValues);

  const bounds: L.LatLngExpression[] = [];
  for (const r of rows) {
    if (!r.lat || !r.lng) continue;
    bounds.push([r.lat, r.lng]);
    const radius = 6 + Math.sqrt(r.loss / maxLoss) * 34;
    const color = intensityColor(rampPosition(r.perAdult, minPa, maxPa));
    const marker = L.circleMarker([r.lat, r.lng], {
      radius,
      color: '#16241f',
      weight: 1,
      opacity: 0.5,
      fillColor: color,
      fillOpacity: 0.82,
    });
    marker.bindTooltip(
      `<div class="map-tip"><strong>${r.name}</strong> (${r.state})<br>` +
        `${formatCurrencyCompact(r.loss)} lost/yr<br>` +
        `$${Math.round(r.perAdult).toLocaleString('en-AU')} per adult</div>`,
      { direction: 'top' },
    );
    marker.on('click', () => onSelect(r.slug));
    marker.addTo(layer);
  }
  if (bounds.length) {
    map.fitBounds(L.latLngBounds(bounds).pad(0.15));
  }
  // Leaflet needs a size recalculation when its container was hidden during layout.
  setTimeout(() => map?.invalidateSize(), 60);
}

export function destroyMap(): void {
  if (map) {
    map.remove();
    map = null;
    layer = null;
  }
}
