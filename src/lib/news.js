// Категорії новин і відключення.
// Відключення: category 'out', severity 'emergency' | 'planned', startsAt / endsAt (ISO),
// where — текст адрес, buildingIds — будинки, allBuildings — стосується всіх.

export const NEWS_CATEGORIES = [
  { key: 'out',  label: 'Відключення', badge: 'nd-badge nd-badge--warning', tile: 'tile--out',  icon: 'drop' },
  { key: 'work', label: 'Роботи',      badge: 'nd-badge nd-badge--success', tile: 'tile--work', icon: 'image' },
  { key: 'ann',  label: 'Оголошення',  badge: 'nd-badge nd-badge--neutral', tile: 'tile--ann',  icon: 'info' },
  { key: 'tar',  label: 'Тарифи',      badge: 'nd-badge nd-badge--info',    tile: 'tile--tar',  icon: 'calendar' },
];

export const newsCat = (n) => NEWS_CATEGORIES.find((c) => c.key === n?.category) || NEWS_CATEGORIES[2];

export function newsBadge(n) {
  if (n.category === 'out' && n.severity === 'emergency') return { label: 'Аварія', cls: 'nd-badge nd-badge--danger', tile: 'tile--sos', icon: 'alert' };
  const c = newsCat(n);
  return { label: c.label, cls: c.badge, tile: c.tile, icon: c.icon };
}

export const appliesTo = (n, buildingId) =>
  !!buildingId && (n.allBuildings || (n.buildingIds || []).includes(buildingId));

const ts = (iso) => (iso ? new Date(iso).getTime() : NaN);

// Відключення, що ще не закінчилось
export function isActiveOutage(n, now = Date.now()) {
  if (n.category !== 'out' || !n.endsAt) return false;
  return ts(n.endsAt) >= now;
}

export function outageState(n, now = Date.now()) {
  const start = ts(n.startsAt);
  return !Number.isNaN(start) && start > now ? 'soon' : 'now';
}

// Активні відключення: спершу аварії, що тривають, далі за часом початку
export function activeOutages(news, now = Date.now()) {
  return news.filter((n) => isActiveOutage(n, now)).sort((a, b) => {
    const rank = (x) => (outageState(x, now) === 'now' ? 0 : 1) * 2 + (x.severity === 'emergency' ? 0 : 1);
    return rank(a) - rank(b) || (ts(a.startsAt) || 0) - (ts(b.startsAt) || 0);
  });
}

const WEEKDAYS = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
const hm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const dayLabel = (d) => `${WEEKDAYS[d.getDay()][0].toUpperCase()}${WEEKDAYS[d.getDay()][1]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
const sameDay = (a, b) => a.toDateString() === b.toDateString();

// «до 14:00» для тих, що тривають сьогодні; «Чт, 30 жовтня, 09:00–17:00» для запланованих
export function outageWhen(n, now = Date.now()) {
  if (!n.endsAt) return '';
  const end = new Date(n.endsAt);
  const start = n.startsAt ? new Date(n.startsAt) : null;
  if (outageState(n, now) === 'now') {
    return sameDay(end, new Date(now)) ? `до ${hm(end)}` : `до ${dayLabel(end)}, ${hm(end)}`;
  }
  if (start && sameDay(start, end)) return `${dayLabel(start)}, ${hm(start)}–${hm(end)}`;
  return `${start ? `${dayLabel(start)}, ${hm(start)}` : ''} – ${dayLabel(end)}, ${hm(end)}`;
}

export function fmtNewsDate(iso, withYear = false) {
  if (!iso) return '';
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${withYear || !sameYear ? ` ${d.getFullYear()}` : ''}`;
}

export function fmtToday(now = new Date()) {
  return `${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;
}

export const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
