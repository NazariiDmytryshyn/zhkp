// Будинки і тарифи: періоди тарифу, суми, пошук за адресою.
// Період тарифу: { id, from: 'YYYY-MM-DD', decision, decisionUrl, parts: [{ name, rate }] }.
// Період діє від `from` до дня перед `from` наступного періоду.

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Ціни затверджують з точністю до 4 знаків (7,8020 грн/м²) — рахуємо без округлення до копійок
const round4 = (n) => Math.round(n * 10000) / 10000;

export const rateOf = (period) => round4((period?.parts || []).reduce((s, p) => s + (Number(p.rate) || 0), 0));

export const sortedPeriods = (b) => [...(b?.tariffs || [])].sort((a, z) => a.from.localeCompare(z.from));

export function currentPeriod(b, today = todayISO()) {
  const past = sortedPeriods(b).filter((p) => p.from <= today);
  return past[past.length - 1] || null;
}

export function nextPeriod(b, today = todayISO()) {
  return sortedPeriods(b).find((p) => p.from > today) || null;
}

const dayBefore = (iso) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

// Історія від найновішого: діапазон дат, ставка і зміна до попереднього періоду
export function tariffHistory(b) {
  const list = sortedPeriods(b);
  return list.map((p, i) => {
    const prev = list[i - 1];
    const following = list[i + 1];
    const rate = rateOf(p);
    return {
      ...p,
      rate,
      to: following ? dayBefore(following.from) : null,
      delta: prev ? round4(rate - rateOf(prev)) : null,
    };
  }).reverse();
}

// Ставка кожної складової наступного періоду проти діючого (за назвою)
export function partDelta(current, next, name) {
  const a = current?.parts.find((p) => p.name === name);
  const b = next?.parts.find((p) => p.name === name);
  if (!a || !b) return null;
  return round4(Number(b.rate) - Number(a.rate));
}

/* ── Формат ── */
export function fmtMoney(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  const [int, frac] = Number(n).toFixed(2).split('.');
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')},${frac}`;
}

// Ставка грн/м²: до 4 знаків, але не менше 2 (7,45 · 7,802 · 7,8017)
export function fmtRate(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  const [int, frac] = Number(n).toFixed(4).split('.');
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F')},${frac.replace(/0{1,2}$/, '')}`;
}

export function fmtDelta(d) {
  if (d === null || d === undefined) return { text: '—', cls: 'nd-delta nd-delta--same' };
  if (Math.abs(d) < 0.00005) return { text: 'без змін', cls: 'nd-delta nd-delta--same' };
  return d > 0
    ? { text: `+${fmtRate(d)}`, cls: 'nd-delta nd-delta--up' }
    : { text: `−${fmtRate(-d)}`, cls: 'nd-delta nd-delta--down' };
}

const MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

export function fmtDateLong(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function fmtDateShort(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

export function plural(n, [one, few, many]) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

/* ── Адреси ── */
const STREET_PREFIX = /^(вул\.?|вулиця|просп\.?|проспект|бульв\.?|бульвар|пров\.?|провулок|пл\.?|площа)\s+/i;

export const streetName = (street = '') => street.replace(STREET_PREFIX, '').trim();
export const shortAddr = (b) => `${streetName(b.street)}, ${b.number}`;
export const fullAddr = (b) => `${b.street}, ${b.number}`;

const PREFIX_WORDS = new Set(['вул', 'вулиця', 'просп', 'проспект', 'бульв', 'бульвар', 'пров', 'провулок', 'пл', 'площа']);

// \b у JS не розуміє кирилицю, тому відкидаємо префікси як окремі слова
export function normalizeAddr(s = '') {
  return s.toLowerCase()
    .replace(/[’ʼ'`-]/g, '')
    .replace(/[.,№#/\\]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !PREFIX_WORDS.has(w))
    .join(' ');
}

const haystack = (b) => normalizeAddr(`${b.street} ${b.number} ${(b.aliases || []).join(' ')}`);

export function searchBuildings(buildings, query) {
  const words = normalizeAddr(query).split(' ').filter(Boolean);
  if (!words.length) return buildings;
  return buildings.filter((b) => {
    const hay = haystack(b);
    return words.every((w) => hay.includes(w));
  });
}

// Природне сортування номерів: 5 < 9 < 11 < 11А
const numKey = (n = '') => {
  const m = String(n).match(/^(\d+)(.*)$/);
  return m ? [Number(m[1]), m[2]] : [Infinity, String(n)];
};

export function compareBuildings(a, b) {
  const s = streetName(a.street).localeCompare(streetName(b.street), 'uk');
  if (s) return s;
  const [an, as] = numKey(a.number);
  const [bn, bs] = numKey(b.number);
  return an - bn || as.localeCompare(bs, 'uk');
}
