import 'leaflet/dist/leaflet.css';
import './styles.css';

import { LGAS, STATE_SUMMARIES, NATIONAL_PER_ADULT } from './data/pokies';
import type { StateCode } from './data/pokies';
import {
  allMetrics, detectInsights, filterByState, nationalTotals, searchLgas, sortLgas, stateTotals,
  type LgaMetrics, type SortKey,
} from './analysis';
import { GLOSSARY, glossaryLink } from './glossary';
import { STATE_COLORS, STATE_ORDER, stateColor } from './utils/colors';
import {
  formatCurrencyCompact, formatCurrencyFull, formatNumber, intensityColor, rampPosition,
} from './utils/format';
import { renderMap, destroyMap } from './map';

type ViewId = 'overview' | 'leaderboard' | 'map' | 'percapita' | 'matrix' | 'treemap' | 'insights';

const VIEWS: Array<{ id: ViewId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'map', label: 'Map' },
  { id: 'percapita', label: 'Per-Capita' },
  { id: 'matrix', label: 'Matrix' },
  { id: 'treemap', label: 'Treemap' },
  { id: 'insights', label: 'Insights' },
];

const METRICS = allMetrics(LGAS);
const STATE_ROWS = stateTotals(STATE_SUMMARIES);
const NATIONAL = nationalTotals(STATE_SUMMARIES);

const PREF_KEY = 'au-pokies-prefs';
interface Prefs { view: ViewId; state: StateCode | 'ALL'; sortKey: SortKey; sortDir: 'asc' | 'desc'; }
function loadPrefs(): Prefs {
  const fallback: Prefs = { view: 'overview', state: 'ALL', sortKey: 'loss', sortDir: 'desc' };
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch { return fallback; }
}
function savePrefs() {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

const state: Prefs & { search: string; selected: string | null } = {
  ...loadPrefs(), search: '', selected: null,
};

// ── Helpers ──────────────────────────────────────────────────────────────
function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}
function statePill(code: StateCode): string {
  return `<span class="state-pill" style="background:${stateColor(code)}">${code}</span>`;
}
function activeRows(): LgaMetrics[] {
  return filterByState(METRICS, state.state);
}

// ── Views ────────────────────────────────────────────────────────────────
function viewOverview(): string {
  const withMachines = STATE_ROWS.filter((s) => s.machines > 0);
  const maxTotal = Math.max(...STATE_ROWS.map((s) => s.totalLoss));
  const maxPerAdult = Math.max(...withMachines.map((s) => s.perAdult));

  const totalBars = STATE_ROWS.slice().sort((a, b) => b.totalLoss - a.totalLoss).map((s) => {
    const w = maxTotal > 0 ? (s.totalLoss / maxTotal) * 100 : 0;
    return `<div class="hbar-row">
      <div class="hbar-label">${statePill(s.state)} ${esc(s.name)}</div>
      <div class="hbar-track"><div class="hbar-fill" style="width:${w}%;background:${stateColor(s.state)}"></div></div>
      <div class="hbar-value">${formatCurrencyCompact(s.totalLoss)}</div>
    </div>`;
  }).join('');

  const perAdultBars = STATE_ROWS.slice().sort((a, b) => b.perAdult - a.perAdult).map((s) => {
    const w = maxPerAdult > 0 ? (s.perAdult / maxPerAdult) * 100 : 0;
    const val = s.machines === 0 ? '$0' : `$${formatNumber(Math.round(s.perAdult))}`;
    return `<div class="hbar-row">
      <div class="hbar-label">${statePill(s.state)} ${esc(s.name)}</div>
      <div class="hbar-track"><div class="hbar-fill" style="width:${w}%;background:${stateColor(s.state)}"></div></div>
      <div class="hbar-value">${val}</div>
    </div>`;
  }).join('');

  return `
    <div class="view-head">
      <h2>Australia’s pokies bill</h2>
      <p>Every year Australians lose billions of dollars to ${glossaryLink('egm', 'poker machines')} in pubs and clubs — more per person than any other country on earth. This is where that money goes.</p>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="label">National pubs &amp; clubs losses</div><div class="value">${formatCurrencyCompact(NATIONAL.totalLoss)}</div><div class="sub">per year, ${glossaryLink('casino', 'casinos excluded')}</div></div>
      <div class="stat-card"><div class="label">${glossaryLink('per-adult', 'Loss per adult')}</div><div class="value">$${formatNumber(Math.round(NATIONAL.perAdult))}</div><div class="sub">across all adults, gambler or not</div></div>
      <div class="stat-card"><div class="label">Poker machines</div><div class="value">${formatNumber(NATIONAL.machines)}</div><div class="sub">in pubs &amp; clubs nationwide</div></div>
      <div class="stat-card"><div class="label">States with suburban pokies</div><div class="value">7 of 8</div><div class="sub">WA bans them outside its casino</div></div>
    </div>
    <div class="help-note">💡 New here? Tap any <span class="glossary-link" data-term="per-adult">underlined term<span class="gl-icon">i</span></span> for a plain-English definition, or the <strong>?</strong> button up top for where this data comes from.</div>
    <div class="panel">
      <h3>Total losses by state &amp; territory</h3>
      <div class="panel-sub">Annual ${glossaryLink('player-loss', 'player losses')} on pubs-and-clubs pokies. NSW alone is bigger than every other state combined.</div>
      ${totalBars}
    </div>
    <div class="panel">
      <h3>Losses per adult by state &amp; territory</h3>
      <div class="panel-sub">Total losses ÷ adult population. This controls for population size — and shows Western Australia’s pokies ban in stark relief.</div>
      ${perAdultBars}
    </div>`;
}

function viewLeaderboard(): string {
  let rows = searchLgas(activeRows(), state.search);
  rows = sortLgas(rows, state.sortKey, state.sortDir);
  const maxLoss = Math.max(1, ...rows.map((r) => r.loss));
  const arrow = (k: SortKey) => state.sortKey === k ? `<span class="arrow">${state.sortDir === 'desc' ? '▼' : '▲'}</span>` : '';

  const body = rows.map((r, i) => `
    <tr data-slug="${r.slug}">
      <td class="rank mono">${i + 1}</td>
      <td>${esc(r.name)}</td>
      <td>${statePill(r.state)}</td>
      <td class="num bar-cell"><span class="bar-fill" style="width:${(r.loss / maxLoss) * 100}%;background:${stateColor(r.state)}"></span><span class="bar-val">${formatCurrencyFull(r.loss)}</span></td>
      <td class="num">$${formatNumber(Math.round(r.perAdult))}</td>
      <td class="num">${formatNumber(r.machines)}</td>
      <td class="num">${r.machinesPer1000.toFixed(1)}</td>
    </tr>`).join('');

  return `
    <div class="view-head">
      <h2>LGA leaderboard</h2>
      <p>Every ${glossaryLink('lga', 'council area')} in the dataset, ranked. Sort by any column; click a row for a full breakdown. Per-adult loss is usually the fairest comparison.</p>
    </div>
    <div class="controls">
      <input class="search-input" id="search" type="search" placeholder="Search area or state…" value="${esc(state.search)}" aria-label="Search areas" />
      <span class="result-count">${rows.length} area${rows.length === 1 ? '' : 's'}</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th class="rank">#</th>
          <th data-sort="name">Area ${arrow('name')}</th>
          <th>State</th>
          <th class="num" data-sort="loss">Total loss/yr ${arrow('loss')}</th>
          <th class="num" data-sort="perAdult">Per adult ${arrow('perAdult')}</th>
          <th class="num" data-sort="machines">Machines ${arrow('machines')}</th>
          <th class="num" data-sort="machinesPer1000">Per 1k ${glossaryLink('density', 'adults')} ${arrow('machinesPer1000')}</th>
        </tr></thead>
        <tbody>${body || '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-tertiary)">No areas match your search.</td></tr>'}</tbody>
      </table>
    </div>`;
}

function viewMap(): string {
  return `
    <div class="view-head">
      <h2>Where the money is lost</h2>
      <p>Each circle is a ${glossaryLink('lga', 'council area')}. Size shows total losses; colour shows ${glossaryLink('per-adult', 'loss per adult')} — deeper red means a heavier per-person toll. Click a circle for detail.</p>
    </div>
    <div class="panel" style="padding:var(--space-md)">
      <div id="map"></div>
      <div class="legend">
        <span>Per-adult loss:</span>
        <span>lower</span><span class="ramp"></span><span>higher</span>
        <span style="margin-left:auto">Circle size = total annual loss</span>
      </div>
    </div>`;
}

function viewPerCapita(): string {
  const rows = sortLgas(searchLgas(activeRows(), state.search), 'perAdult', 'desc');
  const maxPa = Math.max(1, ...rows.map((r) => r.perAdult));
  const scaleMax = Math.ceil(maxPa / 1000) * 1000;
  const natPct = (NATIONAL_PER_ADULT / scaleMax) * 100;

  const dots = rows.map((r) => {
    const left = (r.perAdult / scaleMax) * 100;
    const color = intensityColor(rampPosition(r.perAdult, 0, maxPa));
    return `<div class="dp-row" data-slug="${r.slug}" title="${esc(r.name)}: $${formatNumber(Math.round(r.perAdult))}/adult">
      <div class="dp-label">${statePill(r.state)} ${esc(r.name)}</div>
      <div class="dp-track"><span class="dp-dot" style="left:${left}%;background:${color}"></span></div>
    </div>`;
  }).join('');

  return `
    <div class="view-head">
      <h2>Loss per adult</h2>
      <p>Raw totals favour big cities. This ranks areas by how much is lost <em>per resident aged 18+</em> — the measure that exposes where pokies hit hardest. The dashed line is the national average of $${formatNumber(NATIONAL_PER_ADULT)}.</p>
    </div>
    <div class="panel">
      <h3>Every area vs the national average</h3>
      <div class="panel-sub">Remember: not everyone gambles, so the loss per <em>person who actually plays</em> is many times higher than these figures.</div>
      <div class="dotplot" style="padding-top:22px">
        <div class="dp-ref" style="left:calc(170px + (100% - 170px) * ${natPct / 100})">
          <span class="dp-ref-label">national avg $${formatNumber(NATIONAL_PER_ADULT)}</span>
        </div>
        ${dots}
      </div>
    </div>`;
}

function viewMatrix(): string {
  // State x metric heatmap.
  const metrics: Array<{ key: string; label: string; get: (s: typeof STATE_ROWS[number]) => number; fmt: (v: number) => string; }> = [
    { key: 'total', label: 'Total loss/yr', get: (s) => s.totalLoss, fmt: (v) => formatCurrencyCompact(v) },
    { key: 'perAdult', label: 'Per adult', get: (s) => s.perAdult, fmt: (v) => v === 0 ? '$0' : `$${formatNumber(Math.round(v))}` },
    { key: 'machines', label: 'Machines', get: (s) => s.machines, fmt: (v) => formatNumber(v) },
    { key: 'per1000', label: 'Machines / 1k adults', get: (s) => (s.adults ? (s.machines / s.adults) * 1000 : 0), fmt: (v) => v.toFixed(1) },
  ];

  const header = `<tr><th></th>${metrics.map((m) => `<th>${esc(m.label)}</th>`).join('')}</tr>`;
  const body = STATE_ROWS.slice().sort((a, b) => b.totalLoss - a.totalLoss).map((s) => {
    const cells = metrics.map((m) => {
      const vals = STATE_ROWS.map(m.get);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const t = rampPosition(m.get(s), min, max);
      const bg = intensityColor(t);
      const dark = t > 0.55;
      return `<td class="cell" style="background:${bg};color:${dark ? '#fff' : 'var(--text-primary)'}">${m.fmt(m.get(s))}</td>`;
    }).join('');
    return `<tr><td class="cell rowhead">${statePill(s.state)} ${esc(s.name)}</td>${cells}</tr>`;
  }).join('');

  return `
    <div class="view-head">
      <h2>State cross-reference matrix</h2>
      <p>Compare every jurisdiction across four measures at once. Warmer cells are higher within each column — the fastest way to see who leads on losses, saturation and per-person harm.</p>
    </div>
    <div class="panel matrix-wrap">
      <table class="matrix">
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
      <div class="legend"><span>Colour = value within each column:</span><span>low</span><span class="ramp"></span><span>high</span></div>
    </div>`;
}

function viewTreemap(): string {
  // Composition of national losses: biggest listed LGAs sized by loss, coloured by state.
  const rows = sortLgas(searchLgas(activeRows(), ''), 'loss', 'desc').slice(0, 28);
  const total = rows.reduce((s, r) => s + r.loss, 0) || 1;
  // Lay out in an aspect-corrected space (~2.6:1, matching the pixel container),
  // then emit percentages so cells read as squares rather than columns.
  const AW = 260, AH = 100;
  const cells = squarify(rows.map((r) => ({ value: r.loss, row: r })), AW, AH).map((c) => ({
    ...c, x: (c.x / AW) * 100, y: (c.y / AH) * 100, w: (c.w / AW) * 100, h: (c.h / AH) * 100,
  }));
  const html = cells.map(({ x, y, w, h, item }) => {
    const r = item.row;
    const showLabel = w > 7 && h > 11;
    return `<div class="tm-cell" data-slug="${r.slug}" title="${esc(r.name)} (${r.state}): ${formatCurrencyFull(r.loss)}"
      style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;background:${stateColor(r.state)}">
      ${showLabel ? `<div class="tm-name">${esc(r.name)}</div><div class="tm-val">${formatCurrencyCompact(r.loss)}</div>` : ''}
    </div>`;
  }).join('');

  const legend = STATE_ORDER.filter((c) => rows.some((r) => r.state === c)).map((c) =>
    `<span style="display:inline-flex;align-items:center;gap:5px"><span style="width:11px;height:11px;border-radius:3px;background:${STATE_COLORS[c]}"></span>${c}</span>`).join('');

  return `
    <div class="view-head">
      <h2>Composition of losses</h2>
      <p>The ${rows.length} biggest ${glossaryLink('lga', 'council areas')} in the dataset, each rectangle sized by annual loss and coloured by state. Together they show how concentrated the money is.</p>
    </div>
    <div class="panel">
      <div class="treemap" style="height:62vh;min-height:420px">${html}</div>
      <div class="legend" style="margin-top:var(--space-md)">${legend}<span style="margin-left:auto">Total shown: ${formatCurrencyCompact(total)}/yr</span></div>
    </div>`;
}

function viewInsights(): string {
  const insights = detectInsights(activeRows(), STATE_SUMMARIES);
  const cards = insights.map((i) => `
    <div class="insight-card ${i.severity}">
      <div class="sev">${i.severity}</div>
      <h4>${esc(i.title)}</h4>
      <p>${esc(i.detail)}</p>
    </div>`).join('');
  return `
    <div class="view-head">
      <h2>Auto-detected insights</h2>
      <p>These findings are generated automatically by scanning the data for outliers, concentration and extreme machine density${state.state === 'ALL' ? '' : ` in ${state.state}`}.</p>
    </div>
    <div class="insight-grid">${cards || '<p>No notable findings for this selection.</p>'}</div>`;
}

// ── Simple squarified treemap layout ───────────────────────────────────────
interface TmItem { value: number; row: LgaMetrics; }
interface TmRect { x: number; y: number; w: number; h: number; item: TmItem; }
function squarify(items: TmItem[], width: number, height: number): TmRect[] {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const scaled = items.map((i) => ({ item: i, area: (i.value / total) * width * height }));
  const rects: TmRect[] = [];
  let x = 0, y = 0, w = width, h = height;
  let i = 0;
  while (i < scaled.length) {
    const vertical = w >= h;
    const side = vertical ? h : w;
    // Greedily take a row of cells that keeps aspect ratios reasonable.
    let rowItems = [scaled[i]];
    let best = worstRatio(rowItems, side);
    let j = i + 1;
    while (j < scaled.length) {
      const trial = rowItems.concat(scaled[j]);
      const ratio = worstRatio(trial, side);
      // worstRatio is negated (higher = squarer). Keep adding while the row
      // stays as square or squarer; stop once adding would make it worse.
      if (ratio < best) break;
      rowItems = trial; best = ratio; j++;
    }
    const rowArea = rowItems.reduce((s, r) => s + r.area, 0);
    const thickness = rowArea / side;
    let offset = 0;
    for (const r of rowItems) {
      const cellSide = r.area / (thickness || 1);
      if (vertical) rects.push({ x, y: y + offset, w: thickness, h: cellSide, item: r.item });
      else rects.push({ x: x + offset, y, w: cellSide, h: thickness, item: r.item });
      offset += cellSide;
    }
    if (vertical) { x += thickness; w -= thickness; } else { y += thickness; h -= thickness; }
    i = j;
  }
  return rects;
}
function worstRatio(row: Array<{ area: number }>, side: number): number {
  const sum = row.reduce((s, r) => s + r.area, 0);
  const thickness = sum / side;
  let worst = 0;
  for (const r of row) {
    const cellSide = r.area / (thickness || 1);
    const ratio = Math.max(thickness / cellSide, cellSide / thickness);
    worst = Math.max(worst, ratio);
  }
  return -worst; // negated so "greater is better"
}

// ── Drill-down detail (hash-linked) ─────────────────────────────────────────
function renderDetail(slug: string): string {
  const r = METRICS.find((m) => m.slug === slug);
  if (!r) return '';
  const st = STATE_ROWS.find((s) => s.state === r.state)!;
  const stateMedianPa = median(activeRowsFor(r.state).map((x) => x.perAdult));
  const vsStateAvg = st.perAdult > 0 ? r.perAdult / st.perAdult : 0;
  const stat = (label: string, value: string, sub = '') =>
    `<div class="stat-card"><div class="label">${label}</div><div class="value">${value}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
  return `
    <div class="modal-backdrop open" id="detail-backdrop">
      <div class="modal">
        <button class="icon-btn close-btn" id="detail-close" aria-label="Close">✕</button>
        <h2>${statePill(r.state)} ${esc(r.name)}</h2>
        <p>${esc(st.name)} · figures for ${esc(st.vintage)}</p>
        <div class="stat-grid" style="margin-top:var(--space-lg)">
          ${stat('Total loss / year', formatCurrencyFull(r.loss))}
          ${stat('Per adult', `$${formatNumber(Math.round(r.perAdult))}`, `${r.vsNational.toFixed(1)}× national avg`)}
          ${stat('Poker machines', formatNumber(r.machines))}
          ${stat('Machines / 1k adults', r.machinesPer1000.toFixed(1), `1 per ${formatNumber(Math.round(r.peoplePerMachine))} people`)}
        </div>
        <h3>How it compares</h3>
        <ul>
          <li><strong>${vsStateAvg >= 1 ? `${vsStateAvg.toFixed(1)}× higher` : `${(vsStateAvg * 100).toFixed(0)}%`}</strong> of the ${esc(st.name)} per-adult average ($${formatNumber(Math.round(st.perAdult))}).</li>
          <li>State median area here loses <strong>$${formatNumber(Math.round(stateMedianPa))}</strong> per adult; this area is ${r.perAdult >= stateMedianPa ? 'above' : 'below'} that.</li>
          <li>Adult population: <strong>${formatNumber(r.adults)}</strong>.</li>
        </ul>
      </div>
    </div>`;
}
function activeRowsFor(st: StateCode): LgaMetrics[] {
  return METRICS.filter((m) => m.state === st);
}
function median(values: number[]): number {
  const nums = values.filter((v) => Number.isFinite(v)).slice().sort((a, b) => a - b);
  if (!nums.length) return 0;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

// ── About modal ─────────────────────────────────────────────────────────────
function aboutModal(): string {
  const sources = STATE_SUMMARIES.map((s) =>
    `<tr><td>${statePill(s.state)}</td><td>${esc(s.name)}</td><td>${esc(s.vintage)}</td></tr>`).join('');
  return `
    <div class="modal-backdrop" id="about-backdrop">
      <div class="modal">
        <button class="icon-btn close-btn" id="about-close" aria-label="Close">✕</button>
        <h2>About Pokies Losses (AU)</h2>
        <p>Poker machines — “pokies”, officially ${glossaryLink('egm', 'Electronic Gaming Machines')} — are the single largest form of gambling loss in Australia. Every state regulator publishes ${glossaryLink('player-loss', 'player-loss')} data, but in eight different formats across eight different portals. This site brings the headline figures together so anyone can see how their area compares.</p>
        <h3>What the numbers mean</h3>
        <p>Figures are annual player losses on ${glossaryLink('egm', 'pokies')} in <strong>pubs and clubs</strong>. ${glossaryLink('casino', 'Casino gaming floors are excluded')} because they are regulated and reported separately. “${glossaryLink('per-adult', 'Loss per adult')}” divides losses by the resident population aged 18+, so it counts everyone — not just people who gamble. The loss for someone who actually plays is far higher.</p>
        <h3>Data sources &amp; reporting period</h3>
        <table>
          <thead><tr><th></th><th>Jurisdiction</th><th>Period</th></tr></thead>
          <tbody>${sources}</tbody>
        </table>
        <p style="font-size:0.8rem">Sourced from Liquor &amp; Gaming NSW, the Victorian Gambling and Casino Control Commission (VGCCC), the QLD Office of Liquor and Gaming Regulation, SA Consumer &amp; Business Services, and the Queensland Government Statistician’s Office <em>Australian Gambling Statistics</em>.</p>
        <h3>Caveats</h3>
        <ul>
          <li>Figures are compiled from published regulator releases and rounded. Reporting periods differ by state (shown above), so cross-state comparisons are indicative.</li>
          <li>Only a representative set of the highest-loss LGAs is shown per state, plus every state total. Western Australia has no suburban pokies at all.</li>
          <li>This site is an educational, non-commercial tool. It does not promote gambling. If gambling is causing harm, call the National Gambling Helpline on <strong>1800 858 858</strong> (free, 24/7).</li>
        </ul>
      </div>
    </div>`;
}

// ── Shell + rendering ───────────────────────────────────────────────────────
function renderView(): string {
  switch (state.view) {
    case 'overview': return viewOverview();
    case 'leaderboard': return viewLeaderboard();
    case 'map': return viewMap();
    case 'percapita': return viewPerCapita();
    case 'matrix': return viewMatrix();
    case 'treemap': return viewTreemap();
    case 'insights': return viewInsights();
  }
}

function render() {
  const app = document.getElementById('app')!;
  const stateOptions = ['ALL', ...STATE_ORDER].map((code) =>
    `<option value="${code}"${state.state === code ? ' selected' : ''}>${code === 'ALL' ? 'All states' : code}</option>`).join('');

  app.innerHTML = `
    <header class="site-header">
      <div class="header-top">
        <div class="brand">
          <img src="/favicon.svg" alt="" />
          <div class="brand-text">
            <h1>Pokies Losses (AU)</h1>
            <p>Poker machine losses by Local Government Area</p>
          </div>
        </div>
        <div class="header-spacer"></div>
        <label class="state-filter">Filter
          <select id="state-select" aria-label="Filter by state">${stateOptions}</select>
        </label>
        <button class="icon-btn" id="about-btn" aria-label="About this site" title="About &amp; data sources">?</button>
      </div>
      <nav class="tabs" role="tablist">
        ${VIEWS.map((v) => `<button class="tab${state.view === v.id ? ' active' : ''}" data-view="${v.id}" role="tab" aria-selected="${state.view === v.id}">${v.label}</button>`).join('')}
      </nav>
    </header>
    <main class="main-content">${renderView()}</main>
    <footer class="site-footer">
      <div class="footer-inner">
        <span>Data compiled from state gambling regulators · casino EGMs excluded · figures rounded. Not affiliated with any gambling operator.</span>
        <span>Gambling help: <strong>1800 858 858</strong> · Built by <a href="https://benrichardson.dev/">benrichardson.dev</a> · <a href="https://hub.benrichardson.dev" target="_blank" rel="noopener">more tools &amp; sites</a></span>
      </div>
    </footer>
    ${aboutModal()}
    ${state.selected ? renderDetail(state.selected) : ''}
    <div id="glossary-tip" role="tooltip"></div>`;

  if (state.view === 'map') {
    const el = document.getElementById('map');
    if (el) renderMap(el, searchLgas(activeRows(), state.search), (slug) => { state.selected = slug; render(); });
  } else {
    destroyMap();
  }

  wireEvents();
}

// ── Events ──────────────────────────────────────────────────────────────────
let searchDebounce: number | undefined;
function wireEvents() {
  document.querySelectorAll<HTMLButtonElement>('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view as ViewId;
      state.selected = null;
      savePrefs();
      render();
    });
  });

  const stateSelect = document.getElementById('state-select') as HTMLSelectElement | null;
  stateSelect?.addEventListener('change', () => {
    state.state = stateSelect.value as StateCode | 'ALL';
    savePrefs();
    render();
  });

  document.getElementById('about-btn')?.addEventListener('click', () => openModal('about-backdrop'));
  document.getElementById('about-close')?.addEventListener('click', () => closeModal('about-backdrop'));
  document.getElementById('about-backdrop')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'about-backdrop') closeModal('about-backdrop');
  });

  // Detail panel
  document.getElementById('detail-close')?.addEventListener('click', () => { state.selected = null; render(); });
  document.getElementById('detail-backdrop')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'detail-backdrop') { state.selected = null; render(); }
  });

  // Sort headers
  document.querySelectorAll<HTMLElement>('th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort as SortKey;
      if (state.sortKey === key) state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc';
      else { state.sortKey = key; state.sortDir = key === 'name' ? 'asc' : 'desc'; }
      savePrefs();
      render();
    });
  });

  // Row / cell drill-down
  document.querySelectorAll<HTMLElement>('tr[data-slug], .dp-row[data-slug], .tm-cell[data-slug]').forEach((row) => {
    row.addEventListener('click', () => { state.selected = row.dataset.slug!; render(); });
  });

  // Search
  const search = document.getElementById('search') as HTMLInputElement | null;
  search?.addEventListener('input', () => {
    window.clearTimeout(searchDebounce);
    searchDebounce = window.setTimeout(() => {
      state.search = search.value;
      const pos = search.selectionStart;
      render();
      const again = document.getElementById('search') as HTMLInputElement | null;
      if (again) { again.focus(); if (pos != null) again.setSelectionRange(pos, pos); }
    }, 250);
  });

  wireGlossary();
}

function openModal(id: string) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id: string) { document.getElementById(id)?.classList.remove('open'); }

function wireGlossary() {
  const tip = document.getElementById('glossary-tip')!;
  const show = (el: HTMLElement) => {
    const key = el.dataset.term!;
    const entry = GLOSSARY[key];
    if (!entry) return;
    tip.innerHTML = `<strong>${esc(entry.term)}</strong>${esc(entry.definition)}`;
    tip.style.display = 'block';
    const rect = el.getBoundingClientRect();
    const tw = Math.min(300, window.innerWidth - 24);
    let left = rect.left;
    if (left + tw > window.innerWidth - 12) left = window.innerWidth - tw - 12;
    tip.style.left = `${Math.max(12, left)}px`;
    const top = rect.bottom + 8;
    tip.style.top = `${top + tip.offsetHeight > window.innerHeight ? rect.top - tip.offsetHeight - 8 : top}px`;
  };
  const hide = () => { tip.style.display = 'none'; };

  document.querySelectorAll<HTMLElement>('.glossary-link').forEach((el) => {
    el.addEventListener('click', (e) => { e.stopPropagation(); show(el); });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(el); } });
  });
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.glossary-link') && !(e.target as HTMLElement).closest('#glossary-tip')) hide();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state.selected) { state.selected = null; render(); return; }
    closeModal('about-backdrop');
    const tip = document.getElementById('glossary-tip'); if (tip) tip.style.display = 'none';
  }
});

render();
