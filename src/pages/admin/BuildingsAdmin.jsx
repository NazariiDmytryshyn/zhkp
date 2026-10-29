import { useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../../api/zhkpApi.js';
import { COLS, DEFAULT_PARTS, parseSheet } from '../../lib/buildingsExcel.js';
import { BulkReportsUpload } from './BuildingReports.jsx';
import BuildingEditor from './BuildingEditor.jsx';
import {
  compareBuildings, currentPeriod, fmtRate, fmtDateShort, nextPeriod, normalizeAddr, rateOf, searchBuildings, shortAddr,
  sortedPeriods, todayISO,
} from '../../lib/buildings.js';

// Той самий ключ адреси, що й на сервері (addrKey)
const addrKey = (street, number) => `${normalizeAddr(street)}|${String(number).toLowerCase().replace(/[\s-]/g, '')}`;

async function downloadTemplate(buildings) {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  const partNames = [];
  buildings.forEach((b) => (b.tariffs || []).forEach((p) => p.parts.forEach((x) => { if (!partNames.includes(x.name)) partNames.push(x.name); })));
  if (!partNames.length) partNames.push(...DEFAULT_PARTS);
  const header = [...COLS.map(([, l]) => l), ...partNames];
  const rows = [];
  [...buildings].sort(compareBuildings).forEach((b) => {
    const info = [b.street, b.number, b.dp, b.floors ?? '', b.flats ?? '', b.lifts ?? '', b.master, b.phone];
    const periods = sortedPeriods(b);
    if (!periods.length) rows.push([...info, '', '', '', ...partNames.map(() => '')]);
    periods.forEach((p) => {
      rows.push([...info, fmtDateShort(p.from), p.decision, p.decisionUrl,
        ...partNames.map((n) => { const x = p.parts.find((q) => q.name === n); return x ? x.rate : ''; })]);
    });
  });
  if (!rows.length) rows.push(['вул. Руська', '12', 'Наш Дім-2', 9, 144, 2, '', '', '01.01.2026', '', '', ...partNames.map(() => '')]);
  const data = [
    header.map((value) => ({ value, fontWeight: 'bold' })),
    ...rows.map((r) => r.map((value) => ({ value: value ?? '', type: typeof value === 'number' ? Number : String }))),
  ];
  await writeExcelFile(data, { columns: header.map((h) => ({ width: Math.min(Math.max(h.length + 2, 10), 32) })), stickyRowsCount: 1 })
    .toFile(`budynky-taryfy-${todayISO()}.xlsx`);
}

/* ── Розділ ── */
function BuildingsAdmin({ buildings, documents, token, showToast, refresh, canEdit, onEditingChange }) {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);
  const today = todayISO();
  useEffect(() => { onEditingChange?.(!!editing); }, [editing, onEditingChange]);

  const dps = useMemo(() => [...new Set(buildings.map((b) => b.dp).filter(Boolean))].sort(), [buildings]);
  const list = useMemo(() => searchBuildings(buildings, q).sort(compareBuildings), [buildings, q]);

  const save = async (payload) => {
    setSaving(true);
    try {
      if (editing === 'new') await api.addBuilding(payload, token);
      else await api.updateBuilding(editing, payload, token);
      setEditing(null);
      await refresh();
      showToast('Будинок збережено');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const remove = async (b) => {
    if (!window.confirm(`Видалити будинок ${shortAddr(b)} разом з усіма його тарифами?`)) return;
    try { await api.deleteBuilding(b.id, token); await refresh(); showToast('Будинок видалено'); }
    catch (e) { showToast(e.message, 'error'); }
  };

  const onFile = async (file) => {
    if (!file) return;
    try {
      const { readSheet } = await import('read-excel-file/browser');
      const rows = await readSheet(file);
      const parsed = parseSheet(rows);
      const known = new Set(buildings.map((b) => addrKey(b.street, b.number)));
      const created = new Set(parsed.items.map((it) => addrKey(it.street, it.number)).filter((k) => !known.has(k))).size;
      setPreview({ name: file.name, ...parsed, created, periods: parsed.items.filter((it) => it.period).length });
    } catch (e) {
      showToast(`Не вдалося прочитати файл: ${e.message}`, 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const runImport = async () => {
    setImporting(true);
    try {
      const r = await api.importBuildings(preview.items, token);
      setPreview(null);
      await refresh();
      showToast(`Імпорт завершено: нових будинків ${r.created}, оновлено ${r.updated}, тарифів ${r.periods}`);
    } catch (e) {
      setPreview((p) => ({ ...p, errors: e.details?.length ? e.details : [e.message] }));
      showToast(e.message, 'error');
    } finally { setImporting(false); }
  };

  // Редагування — окремий екран: без імпорту, масового завантаження і списку інших будинків
  if (editing) {
    const current = editing === 'new' ? null : buildings.find((b) => b.id === editing);
    return (
      <BuildingEditor key={editing} building={current} documents={documents} dps={dps} saving={saving}
        onSave={save} onClose={() => setEditing(null)} token={token} showToast={showToast} refresh={refresh} />
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {canEdit && (
        <div className="admin-card">
          <div className="admin-card-header"><h3>Імпорт і експорт Excel</h3></div>
          <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gap: '0.875rem' }}>
            <p className="form-hint" style={{ margin: 0 }}>
              Один рядок — один будинок і один період тарифу. Колонки: {COLS.map(([, l]) => l).join(', ')}, далі — складові тарифу (назва в заголовку, ставка грн/м² в комірці).
              Будинки шукаються за адресою: знайдені оновлюються, нові додаються, тариф з тією ж датою «Діє з» замінюється. <b>Нічого не видаляється.</b>
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => downloadTemplate(buildings).catch((e) => showToast(e.message, 'error'))}>
                ⬇ {buildings.length ? 'Завантажити всі будинки (Excel)' : 'Завантажити шаблон'}
              </button>
              <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                <input ref={fileRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files[0])} />
                ⬆ Імпортувати з Excel
              </label>
            </div>
            {preview && (
              <div style={{ border: '1px solid var(--slate-200)', borderRadius: 12, padding: '1rem', background: 'var(--slate-50)', display: 'grid', gap: '0.5rem' }}>
                <strong>{preview.name}</strong>
                <span>Рядків: {preview.items.length} · нових будинків: {preview.created} · періодів тарифу: {preview.periods}</span>
                {preview.errors.length > 0 && (
                  <div style={{ color: 'var(--red-700)' }}>
                    <strong>Виправте у файлі і завантажте знову:</strong>
                    <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.2rem' }}>{preview.errors.slice(0, 15).map((e) => <li key={e}>{e}</li>)}</ul>
                    {preview.errors.length > 15 && <span>…і ще {preview.errors.length - 15}</span>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <button type="button" className="btn btn-primary btn-sm" disabled={importing || preview.errors.length > 0 || !preview.items.length} onClick={runImport}>
                    {importing ? 'Імпорт…' : 'Імпортувати'}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>Скасувати</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {canEdit && <BulkReportsUpload token={token} showToast={showToast} refresh={refresh} buildingsCount={buildings.length} />}

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Будинки ({buildings.length})</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="form-input" style={{ width: 220 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук за адресою" aria-label="Пошук за адресою" />
            {canEdit && <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>+ Додати будинок</button>}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="empty-state"><p>{buildings.length ? 'Нічого не знайдено' : 'Будинків ще немає. Додайте вручну або імпортуйте з Excel.'}</p></div>
        ) : (
          <div className="news-admin-list">
            {list.map((b) => (
              <div key={b.id} className="news-admin-item" style={{ gridTemplateColumns: '1fr auto auto' }}>
                <div>
                  <div className="news-admin-title">{b.street}, {b.number}</div>
                  <div className="news-admin-date">
                    {[b.dp, b.floors && `${b.floors} пов.`, b.flats && `${b.flats} кв.`, b.reports?.length && `документів: ${b.reports.length}`].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                  {(() => {
                    const c = currentPeriod(b, today); const n = nextPeriod(b, today);
                    return (
                      <>
                        <div><strong>{c ? `${fmtRate(rateOf(c))} грн/м²` : 'немає діючого'}</strong></div>
                        {n && <div style={{ color: 'var(--slate-500)' }}>з {fmtDateShort(n.from)}: {fmtRate(rateOf(n))}</div>}
                      </>
                    );
                  })()}
                </div>
                {canEdit && (
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(b.id)}>Редагувати</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(b)} aria-label={`Видалити ${shortAddr(b)}`}>Видалити</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuildingsAdmin;
