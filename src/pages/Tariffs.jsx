import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Pager, { usePaged } from '../components/Pager.jsx';
import { useMyBuilding } from '../lib/myBuilding.js';
import {
  compareBuildings, currentPeriod, fmtDateLong, fmtDateShort, fmtDelta, fmtRate, nextPeriod,
  plural, rateOf, searchBuildings, shortAddr, streetName, todayISO,
} from '../lib/buildings.js';
import { sitePhones } from '../components/SiteLayout.jsx';

const PAGE = 25;

function rowData(b, today) {
  const cur = currentPeriod(b, today);
  const nxt = nextPeriod(b, today);
  const rate = cur ? rateOf(cur) : null;
  const next = nxt ? rateOf(nxt) : null;
  return { b, rate, next, delta: rate !== null && next !== null ? next - rate : null };
}

async function exportExcel(rows, nextDate) {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  const header = ['Вулиця', 'Будинок', 'Обслуговує', 'Поверхів', 'Квартир', 'Ліфтів', 'Тариф зараз, грн/м²'];
  if (nextDate) header.push(`З ${fmtDateShort(nextDate)}, грн/м²`);
  const data = [
    header.map((value) => ({ value, fontWeight: 'bold' })),
    ...rows.map(({ b, rate, next }) => {
      const r = [b.street, b.number, b.dp || '', b.floors ?? '', b.flats ?? '', b.lifts ?? '', rate ?? ''];
      if (nextDate) r.push(next ?? '');
      return r.map((value) => ({ value, type: typeof value === 'number' ? Number : String }));
    }),
  ];
  await writeExcelFile(data, { columns: header.map((_, i) => ({ width: i === 0 ? 28 : 16 })) }).toFile('tarify-budynkiv.xlsx');
}

function GeneralTariffs({ tariffs }) {
  if (!tariffs?.length) return null;
  const groups = tariffs.reduce((acc, t) => { (acc[t.category || 'Інше'] ||= []).push(t); return acc; }, {});
  return (
    <section className="sec">
      <h2 className="t-h2" style={{ marginBottom: 24 }}>Інші тарифи</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        {Object.entries(groups).map(([cat, items]) => (
          <div className="card-box" key={cat}>
            <div className="bl-group" style={{ borderTop: 0 }}>{cat}</div>
            {items.map((t) => (
              <div className="pl-row" key={t.id} style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                <span>{t.name}</span>
                <span className="t-num" style={{ fontWeight: 600 }}>{t.price} грн <span className="muted" style={{ fontWeight: 400 }}>/ {t.unit}</span></span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Tariffs({ buildings, tariffs, siteContent, loaded }) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [dp, setDp] = useState('all');
  const [street, setStreet] = useState('all');
  const [sort, setSort] = useState('addr');
  const [exporting, setExporting] = useState(false);
  const mine = useMyBuilding(buildings);
  const today = todayISO();
  const { sos } = sitePhones(siteContent);

  const all = useMemo(() => [...buildings].sort(compareBuildings).map((b) => rowData(b, today)), [buildings, today]);

  // Найближчий майбутній період серед усіх будинків — для оголошення і колонки «З …»
  const upcoming = useMemo(() => {
    const periods = buildings.map((b) => nextPeriod(b, today)).filter(Boolean).sort((a, z) => a.from.localeCompare(z.from));
    return periods[0] || null;
  }, [buildings, today]);

  const dps = useMemo(() => {
    const counts = {};
    buildings.forEach((b) => { if (b.dp) counts[b.dp] = (counts[b.dp] || 0) + 1; });
    return Object.entries(counts).sort(([a], [z]) => a.localeCompare(z, 'uk'));
  }, [buildings]);

  const streets = useMemo(() => [...new Set(all.map((r) => r.b.street))], [all]);

  const filtered = useMemo(() => {
    const found = new Set(searchBuildings(buildings, query).map((b) => b.id));
    let rows = all.filter((r) => found.has(r.b.id) && (dp === 'all' || r.b.dp === dp) && (street === 'all' || r.b.street === street));
    if (sort === 'asc') rows = [...rows].sort((a, z) => (a.rate ?? Infinity) - (z.rate ?? Infinity));
    if (sort === 'desc') rows = [...rows].sort((a, z) => (z.rate ?? -Infinity) - (a.rate ?? -Infinity));
    return rows;
  }, [all, buildings, query, dp, street, sort]);

  const paged = usePaged(filtered, PAGE, `${query}|${dp}|${street}|${sort}`);
  const hasNext = all.some((r) => r.next !== null);
  // Колонки без жодного значення не показуємо (наприклад, коли поверхи й ліфти ще не внесені)
  const hasDp = buildings.some((b) => b.dp);
  const hasSize = buildings.some((b) => b.floors || b.flats);
  const hasLifts = buildings.some((b) => b.lifts);
  const cols = [
    'minmax(200px, 2.2fr)', hasDp && 'minmax(130px, 1.2fr)', hasSize && 'minmax(110px, 1fr)', hasLifts && '70px',
    'minmax(110px, 1fr)', hasNext && 'minmax(150px, 1.2fr)', '28px',
  ].filter(Boolean).join(' ');
  const isFiltered = !!query.trim() || dp !== 'all' || street !== 'all';

  const onQuery = (v) => {
    setQuery(v);
    setParams(v.trim() ? { q: v } : {}, { replace: true });
  };

  // Групи за вулицею — лише при сортуванні за адресою
  const groups = [];
  paged.visible.forEach((r) => {
    const key = sort === 'addr' ? r.b.street : '';
    let g = groups[groups.length - 1];
    if (!g || g.street !== key) { g = { street: key, rows: [] }; groups.push(g); }
    g.rows.push(r);
  });
  const streetCount = (s) => filtered.filter((r) => r.b.street === s).length;

  const mineRow = mine ? rowData(mine, today) : null;

  const head = (
    <Helmet>
      <title>Тарифи на утримання будинків — ПП «Наш Дім» Тернопіль</title>
      <meta name="description" content="Ціна послуги з управління для кожного будинку ПП «Наш Дім»: розрахунок на квартиру, нові тарифи та історія змін." />
      <link rel="canonical" href="https://nash-dim.ink/tariffs" />
    </Helmet>
  );

  if (loaded && buildings.length === 0) {
    return (
      <>
        {head}
        <h1 className="t-h1">Тарифи</h1>
        <p className="t-lead" style={{ marginTop: 8 }}>Тарифи на утримання будинків з'являться тут найближчим часом.</p>
        <GeneralTariffs tariffs={tariffs} />
      </>
    );
  }


  return (
    <>
      {head}
      <h1 className="t-h1">Тарифи</h1>
      <p className="t-lead" style={{ marginTop: 8 }}>
        Ціна послуги з управління — окрема для кожного з {buildings.length} {plural(buildings.length, ['будинку', 'будинків', 'будинків'])}. Знайдіть свій.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 24, alignItems: 'stretch' }}>
        <div className="panel" style={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="nd-field__label" htmlFor="tq" style={{ fontSize: 16 }}>Адреса вашого будинку</label>
          <div className="nd-input nd-input--lg">
            <Icon name="search" size="lg" />
            <input id="tq" type="search" placeholder="Вулиця і номер, наприклад: Руська 12" value={query} onChange={(e) => onQuery(e.target.value)} />
            {query && <button type="button" className="nd-btn nd-btn--ghost nd-btn--sm" onClick={() => onQuery('')}>Очистити</button>}
          </div>
          <p className="nd-field__hint">Список нижче фільтрується одразу, поки ви друкуєте.</p>
        </div>
        {mineRow ? (
          <Link className="panel mine-card" to={`/tariffs/${mine.id}`} style={{ flex: '1 1 320px', minWidth: 0 }}>
            <span className="t-label" style={{ color: 'var(--brand)' }}>Мій будинок</span>
            <span style={{ font: '600 20px/28px var(--font-text)' }}>{mine.street}, {mine.number}</span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span className="t-num" style={{ font: '700 32px/38px var(--font-display)' }}>{fmtRate(mineRow.rate)}</span>
              <span className="ink-2">грн/м² на місяць</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--brand)', marginTop: 'auto' }}>
              Відкрити тарифи будинку <Icon name="arrowRight" />
            </span>
          </Link>
        ) : (
          <div className="panel" style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--surface-sunken)', boxShadow: 'none' }}>
            <span className="t-label">Мій будинок</span>
            <p className="ink-2">Відкрийте свій будинок у списку і натисніть «Мій будинок» — сайт запам'ятає його, і тариф та відключення будуть під рукою.</p>
          </div>
        )}
      </div>

      {upcoming && (
        <div className="nd-notice nd-notice--warning" style={{ marginTop: 24 }}>
          <span className="nd-notice__ico"><Icon name="calendar" /></span>
          <div className="nd-notice__body">
            <p className="nd-notice__title">З {fmtDateLong(upcoming.from)} діють нові тарифи</p>
            <p className="nd-notice__meta">Нові ціни вже в таблиці — колонка «З {fmtDateShort(upcoming.from)}».{upcoming.decision ? ` ${upcoming.decision}` : ''}</p>
          </div>
          {upcoming.decisionUrl && <a className="nd-notice__act" href={upcoming.decisionUrl} target="_blank" rel="noopener noreferrer">Рішення, PDF</a>}
        </div>
      )}

      <section className="sec" style={{ marginTop: 48 }}>
        <div className="sec-head">
          <div>
            <h2 className="t-h2">Усі будинки</h2>
            <p className="t-small" style={{ marginTop: 4 }}>
              {isFiltered ? `Знайдено: ${filtered.length}` : 'Натисніть рядок, щоб побачити складові тарифу і розрахунок'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select className="select" aria-label="Вулиця" value={street} onChange={(e) => setStreet(e.target.value)}>
              <option value="all">Усі вулиці</option>
              {streets.map((s) => <option key={s} value={s}>{streetName(s)}</option>)}
            </select>
            <select className="select" aria-label="Сортування" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="addr">За адресою</option>
              <option value="asc">Спершу дешевші</option>
              <option value="desc">Спершу дорожчі</option>
            </select>
            <button type="button" className="nd-btn nd-btn--secondary nd-btn--sm" disabled={exporting || !filtered.length}
              onClick={async () => { setExporting(true); try { await exportExcel(filtered, upcoming?.from); } finally { setExporting(false); } }}>
              <Icon name="download" size="sm" /> {exporting ? 'Готуємо…' : 'Excel'}
            </button>
          </div>
        </div>

        {dps.length > 1 && (
          <div className="nd-chips" style={{ marginBottom: 16 }}>
            {[['all', 'Усі', buildings.length], ...dps.map(([name, n]) => [name, name, n])].map(([key, label, n]) => (
              <button key={key} type="button" className="nd-chip" aria-pressed={dp === key} onClick={() => setDp(key)}>
                {label} <span className="nd-chip__count">{n}</span>
              </button>
            ))}
          </div>
        )}

        <div className="card-box">
          <div className="bl-head" style={{ '--bl-cols': cols }}>
            <span className="t-label ink-2">Адреса</span>
            {hasDp && <span className="t-label ink-2">Обслуговує</span>}
            {hasSize && <span className="t-label ink-2">Поверхів / кв.</span>}
            {hasLifts && <span className="t-label ink-2">Ліфти</span>}
            <span className="t-label ink-2 r">Зараз, грн/м²</span>
            {hasNext && <span className="t-label ink-2 r">З {upcoming ? fmtDateShort(upcoming.from) : 'наступного'}</span>}
            <span />
          </div>
          {groups.map((g, gi) => (
            <div key={`${g.street}-${gi}`}>
              {g.street && <div className="bl-group">{g.street} <span className="muted" style={{ fontWeight: 400 }}>· {streetCount(g.street)} {plural(streetCount(g.street), ['будинок', 'будинки', 'будинків'])}</span></div>}
              {g.rows.map(({ b, rate, next, delta }) => {
                const d = fmtDelta(delta);
                return (
                  <Link key={b.id} className="bl-row" style={{ '--bl-cols': cols }} to={`/tariffs/${b.id}`}>
                    <span style={{ fontWeight: 600 }}>
                      {shortAddr(b)}
                      {b.dp && <span className="show-m t-small">{b.dp}</span>}
                    </span>
                    {hasDp && <span className="hide-m ink-2">{b.dp || '—'}</span>}
                    {hasSize && <span className="hide-m t-num ink-2">{b.floors ?? '—'} / {b.flats ?? '—'}</span>}
                    {hasLifts && <span className="hide-m t-num ink-2">{b.lifts ? b.lifts : '—'}</span>}
                    <span className="t-num r" style={{ fontWeight: 600 }}>{fmtRate(rate)}</span>
                    {hasNext && (
                      <span className="hide-m t-num bl-next">
                        {next !== null ? <><span style={{ fontWeight: 600 }}>{fmtRate(next)}</span><span className={d.cls}>{d.text}</span></> : <span className="muted">—</span>}
                      </span>
                    )}
                    <Icon name="chevronRight" className="hide-m" style={{ color: 'var(--ink-3)' }} />
                  </Link>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && loaded && (
            <div className="empty" style={{ borderTop: '1px solid var(--line)' }}>
              <p>Будинку з такою адресою немає в нашому обслуговуванні</p>
              <p className="t-small" style={{ marginTop: 4 }}>Перевірте номер або зателефонуйте: {sos}</p>
            </div>
          )}
        </div>

        <Pager paged={paged} pageSize={PAGE} label={(p) => `Показано ${p.start + 1}–${p.end} з ${p.total}`} />
      </section>

      <GeneralTariffs tariffs={tariffs} />
    </>
  );
}

export default Tariffs;
