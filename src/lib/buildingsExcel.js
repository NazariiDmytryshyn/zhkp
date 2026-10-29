// Excel будинків: розбір рядків аркуша у формат імпорту сервера

export const DEFAULT_PARTS = [
  'Прибирання прибудинкової території',
  'Прибирання сходових кліток',
  'Обслуговування ліфтів',
  'Освітлення місць загального користування',
  'Технічне обслуговування інженерних систем',
  'Поточний ремонт',
  'Дератизація і дезінсекція',
  'Димові й вентиляційні канали',
  'Винагорода управителю',
];

// Колонки шаблону Excel; усе праворуч від них — складові тарифу (назва в заголовку, ставка в комірці)
export const COLS = [
  ['street', 'Вулиця'], ['number', 'Будинок'], ['dp', 'Обслуговує'], ['floors', 'Поверхів'], ['flats', 'Квартир'],
  ['lifts', 'Ліфтів'], ['master', 'Майстер'], ['phone', 'Телефон дільниці'], ['from', 'Діє з'],
  ['decision', 'Рішення'], ['decisionUrl', 'Посилання на рішення'],
];

function toISODate(v) {
  // Дати з Excel приходять як північ за UTC — беремо UTC-компоненти, щоб не з'їхати на день
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return `${v.getUTCFullYear()}-${String(v.getUTCMonth() + 1).padStart(2, '0')}-${String(v.getUTCDate()).padStart(2, '0')}`;
  }
  const s = String(v ?? '').trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(s);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return s ? null : '';
}

// Старі/альтернативні заголовки колонок
const ALIASES = { dp: ['ДП'], number: ['№ буд', 'Номер'], street: ['Адреса будинку'] };

const norm = (s) => String(s ?? '').trim().toLowerCase();

export function parseSheet(rows) {
  const items = [];
  const errors = [];
  const headerIdx = rows.findIndex((r) => r.some((c) => norm(c) === 'вулиця'));
  if (headerIdx === -1) return { items, errors: ['Не знайдено рядок заголовків (має бути колонка «Вулиця»)'] };
  const header = rows[headerIdx].map((c) => String(c ?? '').trim());
  const colOf = {};
  COLS.forEach(([key, label]) => {
    const names = [label, ...(ALIASES[key] || [])].map(norm);
    const i = header.findIndex((h) => names.includes(norm(h)));
    if (i !== -1) colOf[key] = i;
  });
  if (colOf.number === undefined) return { items, errors: ['Немає колонки «Будинок»'] };
  const known = new Set(Object.values(colOf));
  const partCols = header.map((h, i) => ({ h, i })).filter(({ h, i }) => h && !known.has(i));

  rows.slice(headerIdx + 1).forEach((r, k) => {
    const rowNo = headerIdx + k + 2;
    const get = (key) => (colOf[key] === undefined ? '' : r[colOf[key]]);
    if (!String(get('street') ?? '').trim() && !String(get('number') ?? '').trim()) return;
    const item = { row: rowNo };
    ['street', 'number', 'dp', 'master', 'phone'].forEach((key) => { const v = String(get(key) ?? '').trim(); if (v) item[key] = v; });
    ['floors', 'flats', 'lifts'].forEach((key) => { const v = get(key); if (v !== '' && v !== null && v !== undefined) item[key] = v; });
    if (!item.street || !item.number) { errors.push(`Рядок ${rowNo}: немає вулиці або номера будинку`); return; }
    const from = toISODate(get('from'));
    if (from === null) { errors.push(`Рядок ${rowNo}: незрозуміла дата «${get('from')}» — пишіть 01.01.2027`); return; }
    const parts = partCols
      .map(({ h, i }) => ({ name: h, raw: r[i] }))
      .filter((p) => p.raw !== '' && p.raw !== null && p.raw !== undefined)
      .map((p) => ({ name: p.name, rate: Number(String(p.raw).replace(',', '.').replace(/\s/g, '')) }));
    const bad = parts.find((p) => !Number.isFinite(p.rate) || p.rate < 0);
    if (bad) { errors.push(`Рядок ${rowNo}: «${bad.name}» — ставка має бути числом`); return; }
    if (from && parts.length) {
      item.period = { from, decision: String(get('decision') ?? '').trim(), decisionUrl: String(get('decisionUrl') ?? '').trim(), parts };
    } else if (from && !parts.length) {
      errors.push(`Рядок ${rowNo}: є дата «Діє з», але немає жодної ставки`); return;
    }
    items.push(item);
  });
  return { items, errors };
}

