import { useMemo, useState } from 'react';
import { NEWS_CATEGORIES } from '../../lib/news.js';
import { compareBuildings, searchBuildings, shortAddr } from '../../lib/buildings.js';

// ISO ↔ значення для <input type="datetime-local"> у місцевому часі
export const isoToLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const localToIso = (v) => (v ? new Date(v).toISOString() : '');

export const NEWS_META_DEFAULTS = { category: 'ann', severity: 'planned', startsAt: '', endsAt: '', where: '', buildingIds: [], allBuildings: false };

// Поля, які йдуть на сервер разом з новиною
export function newsMetaPayload(f) {
  const out = f.category === 'out';
  return {
    category: f.category || 'ann',
    severity: out ? f.severity || 'planned' : '',
    startsAt: out ? f.startsAt || '' : '',
    endsAt: out ? f.endsAt || '' : '',
    where: (f.where || '').trim(),
    buildingIds: f.allBuildings ? [] : f.buildingIds || [],
    allBuildings: !!f.allBuildings,
  };
}

function NewsMetaFields({ value, onChange, buildings }) {
  const [q, setQ] = useState('');
  const v = { ...NEWS_META_DEFAULTS, ...value };
  const ids = v.buildingIds || [];
  const sorted = useMemo(() => [...buildings].sort(compareBuildings), [buildings]);
  const found = useMemo(() => (q.trim() ? searchBuildings(sorted, q) : sorted).slice(0, 60), [sorted, q]);
  const selected = sorted.filter((b) => ids.includes(b.id));
  const toggle = (id) => onChange({ buildingIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] });

  return (
    <div style={{ display: 'grid', gap: '0.875rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: v.category === 'out' ? '1fr 1fr' : '1fr', gap: '0.875rem' }}>
        <div className="form-group">
          <label className="form-label">Категорія</label>
          <select className="form-select" value={v.category} onChange={(e) => onChange({ category: e.target.value })}>
            {NEWS_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        {v.category === 'out' && (
          <div className="form-group">
            <label className="form-label">Тип відключення</label>
            <select className="form-select" value={v.severity} onChange={(e) => onChange({ severity: e.target.value })}>
              <option value="planned">Планове (жовте)</option>
              <option value="emergency">Аварія (червоне)</option>
            </select>
          </div>
        )}
      </div>

      {v.category === 'out' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label">Початок</label>
              <input className="form-input" type="datetime-local" value={isoToLocal(v.startsAt)} onChange={(e) => onChange({ startsAt: localToIso(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Кінець *</label>
              <input className="form-input" type="datetime-local" value={isoToLocal(v.endsAt)} onChange={(e) => onChange({ endsAt: localToIso(e.target.value) })} required />
            </div>
          </div>
          <span className="form-hint" style={{ marginTop: '-0.5rem' }}>Поки відключення не закінчилось, воно показується в блоці «Сьогодні» на головній і на сторінках будинків.</span>
        </>
      )}

      <div className="form-group">
        <label className="form-label">Де (як побачать мешканці)</label>
        <input className="form-input" value={v.where} onChange={(e) => onChange({ where: e.target.value })} placeholder="Руська, 10–16" maxLength={120} />
      </div>

      {buildings.length > 0 && (
        <div className="form-group">
          <label className="form-label">Яких будинків стосується</label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={!!v.allBuildings} onChange={(e) => onChange({ allBuildings: e.target.checked })} /> Усіх будинків
          </label>
          {!v.allBuildings && (
            <>
              {selected.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selected.map((b) => (
                    <button type="button" key={b.id} className="btn btn-ghost btn-sm" onClick={() => toggle(b.id)} title="Прибрати">{shortAddr(b)} ×</button>
                  ))}
                </div>
              )}
              <input className="form-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Знайти будинок: Руська 12" aria-label="Знайти будинок" />
              <div style={{ maxHeight: 180, overflow: 'auto', border: '1px solid var(--slate-200)', borderRadius: 8, padding: 6, background: 'white' }}>
                {found.map((b) => (
                  <label key={b.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 6px', fontSize: '0.88rem' }}>
                    <input type="checkbox" checked={ids.includes(b.id)} onChange={() => toggle(b.id)} /> {b.street}, {b.number}
                  </label>
                ))}
                {found.length === 0 && <span className="form-hint">Нічого не знайдено</span>}
              </div>
              <span className="form-hint">Мешканці з цих будинків побачать новину з позначкою «Мій будинок» і на сторінці свого будинку.</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default NewsMetaFields;
