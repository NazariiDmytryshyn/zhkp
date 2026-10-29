import { useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../../api/zhkpApi.js';
import Icon from '../../components/Icon.jsx';
import { DEFAULT_PARTS } from '../../lib/buildingsExcel.js';
import { fmtDateShort, fmtRate, sortedPeriods } from '../../lib/buildings.js';
import { BuildingReportsEditor } from './BuildingReports.jsx';

const emptyBuilding = { street: '', number: '', dp: '', floors: '', flats: '', lifts: '', master: '', phone: '', aliases: '', tariffs: [] };
let tempSeq = 0;
const tempId = () => `new-${++tempSeq}`;

function toForm(b) {
  return {
    ...emptyBuilding, ...b,
    floors: b.floors ?? '', flats: b.flats ?? '', lifts: b.lifts ?? '',
    aliases: (b.aliases || []).join(', '),
    // Найновіший період зверху — його найчастіше й редагують
    tariffs: sortedPeriods(b).reverse().map((p) => ({ ...p, parts: p.parts.map((x) => ({ ...x, rate: String(x.rate) })) })),
  };
}

function fromForm(f) {
  const { reports, ...rest } = f;
  return {
    ...rest,
    aliases: f.aliases.split(',').map((a) => a.trim()).filter(Boolean),
    tariffs: f.tariffs.map(({ id, ...p }) => ({
      ...(String(id).startsWith('new-') ? {} : { id }),
      ...p,
      parts: p.parts.filter((x) => x.name.trim() || String(x.rate).trim()).map((x) => ({ name: x.name.trim(), rate: String(x.rate).replace(',', '.') })),
    })),
  };
}

const num = (v) => Number(String(v).replace(',', '.')) || 0;

/* ── Документ рішення: вибрати з «Документів» або завантажити новий ── */
function DecisionDoc({ value, onChange, documents, token, showToast, refresh, label }) {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const doc = documents.find((d) => d.url === value);
  const fileName = value ? decodeURIComponent(value.split('/').pop()) : '';

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const d = await api.uploadDocument(file, label || file.name.replace(/\.[^.]+$/, ''), token);
      onChange(d.url);
      await refresh();
      showToast('Документ рішення завантажено');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  if (value) {
    return (
      <div className="be-doc">
        <Icon name="file" />
        <a href={value} target="_blank" rel="noopener noreferrer" title={doc?.name || fileName}>{doc?.name || fileName}</a>
        <button type="button" className="be-icon-btn" onClick={() => onChange('')} aria-label="Прибрати документ" title="Прибрати документ"><Icon name="close" size="sm" /></button>
      </div>
    );
  }

  return (
    <div className="be-doc-pick">
      <select className="form-select" value="" onChange={(e) => onChange(e.target.value)} aria-label="Вибрати документ рішення">
        <option value="">{documents.length ? 'Вибрати з «Документів»…' : 'Документів ще немає'}</option>
        {documents.map((d) => <option key={d.id} value={d.url}>{d.name}</option>)}
      </select>
      <label className="btn btn-ghost btn-sm be-btn" title="Завантажити PDF з комп'ютера">
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" hidden disabled={busy} onChange={(e) => upload(e.target.files[0])} />
        <Icon name="upload" size="sm" /> {busy ? 'Завантаження…' : 'Завантажити'}
      </label>
    </div>
  );
}

/* ── Один період тарифу ── */
function PeriodCard({ period, onChange, onRemove, documents, token, showToast, refresh, dupDate }) {
  const set = (patch) => onChange({ ...period, ...patch });
  const setPart = (k, patch) => set({ parts: period.parts.map((x, j) => (j === k ? { ...x, ...patch } : x)) });
  const total = period.parts.reduce((s, x) => s + num(x.rate), 0);

  return (
    <div className="be-period">
      <div className="be-period__head">
        <div className="form-group">
          <label className="form-label">Діє з *</label>
          <input className={`form-input${!period.from || dupDate ? ' has-error' : ''}`} type="date" value={period.from} onChange={(e) => set({ from: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Рішення (номер і дата)</label>
          <input className="form-input" value={period.decision} onChange={(e) => set({ decision: e.target.value })} placeholder="Рішення виконкому № 123 від 20.10.2026" />
        </div>
        <div className="form-group">
          <label className="form-label">Документ рішення</label>
          <DecisionDoc value={period.decisionUrl} onChange={(decisionUrl) => set({ decisionUrl })} documents={documents}
            token={token} showToast={showToast} refresh={refresh} label={period.decision} />
        </div>
        <button type="button" className="be-icon-btn be-icon-btn--danger" onClick={onRemove} aria-label="Видалити період" title="Видалити період">
          <TrashIcon />
        </button>
      </div>
      {dupDate && <span className="form-error">Інший період уже починається {fmtDateShort(period.from)}</span>}

      <div className="be-parts">
        <div className="be-part be-part--head"><span className="form-label">Складова тарифу</span><span className="form-label" style={{ textAlign: 'right' }}>грн/м²</span><span /></div>
        {period.parts.map((x, k) => (
          <div className="be-part" key={k}>
            <input className="form-input" value={x.name} onChange={(e) => setPart(k, { name: e.target.value })} placeholder="Назва складової" aria-label="Назва складової" />
            <input className="form-input be-rate" inputMode="decimal" value={x.rate} onChange={(e) => setPart(k, { rate: e.target.value.replace(/[^\d.,]/g, '') })} placeholder="0,00" aria-label="Ставка, грн/м²" />
            <button type="button" className="be-icon-btn" aria-label="Прибрати складову" title="Прибрати складову"
              onClick={() => set({ parts: period.parts.filter((_, j) => j !== k) })} disabled={period.parts.length === 1}>
              <Icon name="close" size="sm" />
            </button>
          </div>
        ))}
      </div>

      <div className="be-period__foot">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => set({ parts: [...period.parts, { name: '', rate: '' }] })}>+ Складова</button>
        <span>Разом: <strong>{fmtRate(total)} грн/м²</strong></span>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg className="nd-ico nd-ico--sm" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

/* ── Екран редагування будинку ── */
function BuildingEditor({ building, documents, dps, onSave, onClose, saving, token, showToast, refresh }) {
  const isNew = !building?.id;
  const [initialJson] = useState(() => JSON.stringify(toForm(building || {})));
  const [f, setF] = useState(() => toForm(building || {}));
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const dirty = JSON.stringify(f) !== initialJson;

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const dates = f.tariffs.map((t) => t.from).filter(Boolean);
  const dupDates = useMemo(() => new Set(dates.filter((d, i) => dates.indexOf(d) !== i)), [dates.join('|')]);

  const addPeriod = () => {
    const latest = f.tariffs[0];
    const parts = latest ? latest.parts.map((x) => ({ ...x })) : DEFAULT_PARTS.map((name) => ({ name, rate: '' }));
    setF((p) => ({ ...p, tariffs: [{ id: tempId(), from: '', decision: '', decisionUrl: '', parts }, ...p.tariffs] }));
  };

  const close = () => {
    if (dirty && !window.confirm('Є незбережені зміни. Вийти без збереження?')) return;
    onClose();
  };

  const submit = (e) => {
    e.preventDefault();
    if (dupDates.size) { showToast('Два періоди не можуть починатися в один день', 'error'); return; }
    onSave(fromForm(f));
  };

  const title = isNew ? 'Новий будинок' : `${building.street}, ${building.number}`;

  return (
    <form className="be" onSubmit={submit}>
      <div className="be-top">
        <button type="button" className="btn btn-ghost btn-sm" onClick={close}><Icon name="arrowLeft" size="sm" /> Усі будинки</button>
        <h2 className="be-title">{title}</h2>
      </div>

      <section className="admin-card be-card">
        <h3 className="be-card__title">Будинок</h3>
        <div className="be-grid be-grid--addr">
          <div className="form-group"><label className="form-label">Вулиця *</label><input className="form-input" value={f.street} onChange={set('street')} placeholder="вул. Руська" required /></div>
          <div className="form-group"><label className="form-label">Номер *</label><input className="form-input" value={f.number} onChange={set('number')} placeholder="12А" required /></div>
          <div className="form-group">
            <label className="form-label">Обслуговує</label>
            <input className="form-input" list="dp-list" value={f.dp} onChange={set('dp')} placeholder="ДП «Наш Дім-2»" />
            <datalist id="dp-list">{dps.map((d) => <option key={d} value={d} />)}</datalist>
          </div>
        </div>
        <div className="be-grid be-grid--info">
          <div className="form-group"><label className="form-label">Поверхів</label><input className="form-input" inputMode="numeric" value={f.floors} onChange={set('floors')} /></div>
          <div className="form-group"><label className="form-label">Квартир</label><input className="form-input" inputMode="numeric" value={f.flats} onChange={set('flats')} /></div>
          <div className="form-group"><label className="form-label">Ліфтів</label><input className="form-input" inputMode="numeric" value={f.lifts} onChange={set('lifts')} /></div>
          <div className="form-group"><label className="form-label">Майстер дільниці</label><input className="form-input" value={f.master} onChange={set('master')} placeholder="ПІБ" /></div>
          <div className="form-group"><label className="form-label">Телефон дільниці</label><input className="form-input" value={f.phone} onChange={set('phone')} placeholder="+380…" /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Інші назви для пошуку (через кому)</label>
          <input className="form-input" value={f.aliases} onChange={set('aliases')} placeholder="наприклад, стара назва вулиці: Леніна 12" />
        </div>
      </section>

      <section className="admin-card be-card">
        <div className="be-card__head">
          <h3 className="be-card__title">Тарифи ({f.tariffs.length})</h3>
          <button type="button" className="btn btn-primary btn-sm" onClick={addPeriod}>+ Новий період</button>
        </div>
        {f.tariffs.length === 0 && <p className="form-hint" style={{ margin: 0 }}>Тарифів ще немає. Натисніть «Новий період» і вкажіть дату, з якої він діє.</p>}
        {f.tariffs.map((t, i) => (
          <PeriodCard key={t.id} period={t} documents={documents} token={token} showToast={showToast} refresh={refresh}
            dupDate={!!t.from && dupDates.has(t.from)}
            onChange={(next) => setF((p) => ({ ...p, tariffs: p.tariffs.map((x, j) => (j === i ? next : x)) }))}
            onRemove={() => {
              if (!window.confirm(`Видалити період${t.from ? ` з ${fmtDateShort(t.from)}` : ''}? Зміна застосується після «Зберегти».`)) return;
              setF((p) => ({ ...p, tariffs: p.tariffs.filter((_, j) => j !== i) }));
            }} />
        ))}
      </section>

      <section className="admin-card be-card">
        <h3 className="be-card__title">Звіти</h3>
        {isNew
          ? <p className="form-hint" style={{ margin: 0 }}>Звіти можна буде додати після збереження будинку.</p>
          : <BuildingReportsEditor building={building} token={token} showToast={showToast} refresh={refresh} />}
      </section>

      <div className="be-bar">
        <span className="form-hint">{dirty ? 'Є незбережені зміни' : 'Змін немає'}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={close}>Скасувати</button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving || !dirty}>{saving ? 'Збереження…' : 'Зберегти'}</button>
      </div>
    </form>
  );
}

export default BuildingEditor;
