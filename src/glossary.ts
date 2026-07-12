// Plain-English definitions for every jargon term used in the UI.
// Rendered as click-to-reveal tooltips via .glossary-link spans.

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  egm: {
    term: 'EGM (Electronic Gaming Machine)',
    definition:
      'The official name for a poker machine ("pokie"). A coin/note-operated gambling machine found in pubs and clubs. This site counts EGMs in pubs and clubs, not the machines inside casinos.',
  },
  'player-loss': {
    term: 'Player loss',
    definition:
      'The money players put into machines minus what the machines paid back out — i.e. what gamblers actually lost. Regulators call this "net gaming machine profit", "metered win" or "expenditure" depending on the state. It is the venue and government’s revenue.',
  },
  'net-gaming-profit': {
    term: 'Net gaming machine profit',
    definition:
      'The NSW term for player loss on pokies — the amount kept by venues after paying out winnings. It equals total money lost by players.',
  },
  'per-adult': {
    term: 'Loss per adult',
    definition:
      'Total pokies losses in an area divided by the number of residents aged 18 and over. It lets you compare a small town with a big city fairly. Note: not every adult gambles, so the real loss per gambler is far higher.',
  },
  lga: {
    term: 'LGA (Local Government Area)',
    definition:
      'A council area — the local government that runs your area (e.g. City of Brimbank, Fairfield City Council). Regulators publish pokies data at this level.',
  },
  density: {
    term: 'Machine density',
    definition:
      'How saturated an area is with pokies, shown as machines per 1,000 adults (or, inverted, people per machine). Higher density is strongly linked with higher losses and gambling harm.',
  },
  'metered-win': {
    term: 'Metered win',
    definition:
      'Queensland’s term for player loss — the amount recorded by a machine’s internal meters as kept by the venue after payouts.',
  },
  'pre-commitment': {
    term: 'Pre-commitment',
    definition:
      'A harm-reduction system where a player sets binding limits on time or money before playing, often enforced with a registered card. Tasmania is moving to mandatory card-based pre-commitment.',
  },
  casino: {
    term: 'Casino EGMs excluded',
    definition:
      'This site covers pokies in pubs and clubs — the machines in ordinary suburbs and towns. Casino gaming floors (e.g. Crown, The Star) are reported separately and are not included here.',
  },
};

export function glossaryLink(key: string, label?: string): string {
  const entry = GLOSSARY[key];
  const text = label ?? entry?.term ?? key;
  return `<span class="glossary-link" data-term="${key}" role="button" tabindex="0" aria-label="Definition of ${text}">${text}<span class="gl-icon" aria-hidden="true">i</span></span>`;
}
