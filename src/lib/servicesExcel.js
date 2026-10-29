// Excel прайс-листа послуг: один рядок — одна послуга
import { SERVICE_CATEGORIES } from '../serviceCategories.js';

export const SERVICE_COLS = [
  ['category', 'Категорія'], ['group', 'Розділ'], ['title', 'Назва'],
  ['unit', 'Одиниця'], ['price', 'Ціна'], ['summary', 'Короткий опис'],
];

const ALIASES = { title: ['Найменування робіт / послуг', 'Перелік послуг', 'Послуга'], unit: ['Одиниця виміру'], price: ['Ціна, грн', 'Сума, грн.'] };

const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

// «Сантехніка» або «plumbing» → ключ категорії
export function categoryKey(v) {
  const n = norm(v);
  if (!n) return 'other';
  const c = SERVICE_CATEGORIES.find((x) => norm(x.label) === n || x.key === n);
  return c ? c.key : null;
}

// Число з Excel (1200, 1110.81) → «1 200 грн» / «1 110,81 грн»; текст лишаємо як є
export function priceText(v) {
  if (typeof v === 'number') {
    const [int, frac] = v.toFixed(2).split('.');
    return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}${frac === '00' ? '' : `,${frac}`} грн`;
  }
  return String(v ?? '').trim();
}

export function parseServicesSheet(rows) {
  const items = [];
  const errors = [];
  const headerIdx = rows.findIndex((r) => r.some((c) => norm(c) === 'назва' || ALIASES.title.map(norm).includes(norm(c))));
  if (headerIdx === -1) return { items, errors: ['Не знайдено рядок заголовків (має бути колонка «Назва»)'] };
  const header = rows[headerIdx].map((c) => norm(c));
  const colOf = {};
  SERVICE_COLS.forEach(([key, label]) => {
    const names = [label, ...(ALIASES[key] || [])].map(norm);
    const i = header.findIndex((h) => names.includes(h));
    if (i !== -1) colOf[key] = i;
  });

  rows.slice(headerIdx + 1).forEach((r, k) => {
    const row = headerIdx + k + 2;
    const get = (key) => (colOf[key] === undefined ? '' : r[colOf[key]]);
    const title = String(get('title') ?? '').trim();
    if (!title) return;
    const category = categoryKey(get('category'));
    if (!category) { errors.push(`Рядок ${row}: невідома категорія «${get('category')}» — ${SERVICE_CATEGORIES.map((c) => c.label).join(', ')}`); return; }
    items.push({
      row,
      category,
      group: String(get('group') ?? '').trim(),
      title,
      unit: String(get('unit') ?? '').trim(),
      price: priceText(get('price')),
      summary: String(get('summary') ?? '').trim(),
    });
  });
  return { items, errors };
}

export async function downloadServicesTemplate(services) {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  const label = (key) => (SERVICE_CATEGORIES.find((c) => c.key === key) || SERVICE_CATEGORIES[SERVICE_CATEGORIES.length - 1]).label;
  const header = SERVICE_COLS.map(([, l]) => l);
  const rows = services.length
    ? services.map((s) => [label(s.category), s.group || '', s.title, s.unit || '', s.price || '', s.summary || ''])
    : [['Сантехніка', 'Каналізаційні мережі', 'Прочищення сифона', 'випадок', '300 грн', '']];
  const data = [header.map((value) => ({ value, fontWeight: 'bold' })), ...rows.map((r) => r.map((value) => ({ value: String(value) })))];
  await writeExcelFile(data, { columns: [{ width: 30 }, { width: 36 }, { width: 60 }, { width: 14 }, { width: 18 }, { width: 40 }], stickyRowsCount: 1 })
    .toFile('posluhy-prais.xlsx');
}
