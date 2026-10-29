import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { SERVICE_CATEGORIES, serviceCat } from '../serviceCategories.js';
import { plural } from '../lib/buildings.js';
import { stripHtml } from '../lib/news.js';
import { readStored, writeStored } from '../lib/myBuilding.js';

export const serviceSummary = (s) => s.summary || stripHtml(s.description) || s.group || '';

const CAT_ORDER = Object.fromEntries(SERVICE_CATEGORIES.map((c, i) => [c.key, i]));

function Services({ services }) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [view, setView] = useState(() => readStored('nd_services_view', 'list'));
  const requested = params.get('category');
  const cat = SERVICE_CATEGORIES.some((c) => c.key === requested) ? requested : 'all';

  const byQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? services.filter((s) => `${s.title} ${s.group || ''} ${serviceSummary(s)}`.toLowerCase().includes(q)) : services;
  }, [services, query]);
  // Порядок: категорія → розділ (у порядку появи) → як у прайсі
  const items = useMemo(() => {
    const list = (cat === 'all' ? byQuery : byQuery.filter((s) => serviceCat(s).key === cat)).map((s, i) => ({ s, i }));
    const groupOrder = new Map();
    list.forEach(({ s }) => { const g = `${serviceCat(s).key}|${s.group || ''}`; if (!groupOrder.has(g)) groupOrder.set(g, groupOrder.size); });
    return list.sort((a, b) => (CAT_ORDER[serviceCat(a.s).key] - CAT_ORDER[serviceCat(b.s).key])
      || (groupOrder.get(`${serviceCat(a.s).key}|${a.s.group || ''}`) - groupOrder.get(`${serviceCat(b.s).key}|${b.s.group || ''}`))
      || a.i - b.i).map(({ s }) => s);
  }, [byQuery, cat]);

  // Заголовки груп у прайс-листі: «Сантехніка · Каналізаційні мережі»
  const groupLabel = (s) => [cat === 'all' ? serviceCat(s).label : '', s.group].filter(Boolean).join(' · ');

  const cats = [{ key: 'all', label: 'Усі послуги', count: byQuery.length }, ...SERVICE_CATEGORIES.map((c) => ({
    ...c, count: byQuery.filter((s) => serviceCat(s).key === c.key).length,
  }))];

  const pickCat = (key) => setParams(key === 'all' ? {} : { category: key }, { replace: true });
  const pickView = (v) => { setView(v); writeStored('nd_services_view', v); };
  const catLabel = cat === 'all' ? '' : ` · ${SERVICE_CATEGORIES.find((c) => c.key === cat).label}`;

  return (
    <>
      <Helmet>
        <title>Послуги — ПП «Наш Дім» Тернопіль</title>
        <meta name="description" content="Платні послуги ПП «Наш Дім» Тернопіль: сантехніка, електрика, догляд за зеленими насадженнями та інше." />
        <link rel="canonical" href="https://nash-dim.ink/services" />
      </Helmet>

      <h1 className="t-h1">Послуги</h1>
      <p className="t-lead" style={{ marginTop: 8 }}>Платні роботи для мешканців, ОСББ і бізнесу. Остаточну ціну майстер підтверджує на місці.</p>

      <div className="nd-input nd-input--lg" style={{ marginTop: 24, maxWidth: 760 }}>
        <Icon name="search" size="lg" />
        <input type="search" aria-label="Пошук послуги" placeholder="Що потрібно зробити? Наприклад: замінити змішувач" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="svc-layout">
        <aside className="svc-layout__side">
          <div className="t-label" style={{ padding: '0 12px 8px' }}>Категорії</div>
          <div className="cats" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cats.map((c) => (
              <button key={c.key} type="button" className="cat" aria-pressed={cat === c.key} onClick={() => pickCat(c.key)}>
                <span>{c.label}</span><span className="t-num" style={{ fontWeight: 500, opacity: 0.8 }}>{c.count}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="svc-layout__main">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <span style={{ fontWeight: 600 }}>{items.length} {plural(items.length, ['послуга', 'послуги', 'послуг'])}{catLabel}</span>
            <div className="seg" role="group" aria-label="Вигляд">
              <button type="button" aria-pressed={view === 'cards'} onClick={() => pickView('cards')}><Icon name="grid" size="sm" /> Картки</button>
              <button type="button" aria-pressed={view === 'list'} onClick={() => pickView('list')}><Icon name="list" size="sm" /> Прайс-лист</button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="panel empty">
              <p>{services.length ? 'Такої послуги в каталозі немає' : 'Послуги будуть додані найближчим часом'}</p>
              <p className="t-small" style={{ marginTop: 4 }}>Опишіть задачу в заявці — підберемо виконавця.</p>
            </div>
          ) : view === 'cards' ? (
            <div className="g2" style={{ gap: 16 }}>
              {items.map((s) => {
                const c = serviceCat(s);
                return (
                  <Link key={s.id} className="nd-service" to={`/services/${s.id}`}>
                    <span className="nd-tile"><Icon name={c.icon} /></span>
                    <div className="nd-service__body">
                      <p className="nd-service__title">{s.title}</p>
                      <p className="nd-service__desc">{serviceSummary(s)}</p>
                      <div className="nd-service__foot">
                        {s.price && <span className="nd-service__price">{s.price}{s.unit && <span className="muted" style={{ fontWeight: 400 }}> / {s.unit}</span>}</span>}
                        <span className="nd-badge nd-badge--neutral">{c.label}</span>
                      </div>
                    </div>
                    <span className="nd-service__go"><Icon name="chevronRight" /></span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="card-box">
              <div className="pl-head">
                <span className="t-label ink-2">Послуга</span>
                <span className="t-label ink-2">Одиниця</span>
                <span className="t-label ink-2 r">Ціна</span>
                <span />
              </div>
              {items.map((s, i) => {
                const g = groupLabel(s);
                const newGroup = g && (i === 0 || groupLabel(items[i - 1]) !== g);
                return (
                  <div key={s.id}>
                    {newGroup && <div className="bl-group">{g}</div>}
                    <div className="pl-row">
                      <Link to={`/services/${s.id}`}>{s.title}</Link>
                      <span className="hide-m ink-2">{s.unit || '—'}</span>
                      <span className="t-num r" style={{ fontWeight: 600 }}>
                        {s.price || 'за домовленістю'}
                        {s.unit && <span className="show-m t-small">{s.unit}</span>}
                      </span>
                      <Link className="nd-btn nd-btn--ghost nd-btn--sm hide-m" to={`/services/${s.id}`} style={{ justifySelf: 'end' }}>Замовити</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="panel" style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p className="t-h3">Не знайшли потрібне?</p>
              <p className="ink-2" style={{ marginTop: 4 }}>Опишіть, що треба зробити, — передзвонимо і назвемо ціну.</p>
            </div>
            <Link className="nd-btn nd-btn--primary" to="/request">Залишити заявку</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Services;
