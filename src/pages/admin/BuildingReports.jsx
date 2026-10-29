import { useRef, useState } from 'react';
import * as api from '../../api/zhkpApi.js';
import { fmtDateShort } from '../../lib/buildings.js';

export const REPORT_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx';
// Від поточного+1 до 2015 — список для вибору року звіту
const YEARS = Array.from({ length: new Date().getFullYear() - 2013 }, (_, i) => new Date().getFullYear() + 1 - i);

function YearSelect({ value, onChange, id }) {
  return (
    <select id={id} className="form-select" value={value} onChange={(e) => onChange(e.target.value)} required>
      <option value="">— оберіть рік —</option>
      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
    </select>
  );
}

export function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

// Номер будинку з назви файлу («Героїв Крут, 6 2026.pdf» → «6»), рік у кінці відкидаємо
function houseFromFilename(name) {
  const base = name.replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim();
  const m = base.match(/(?:^|[\s,])(\d+\s*[a-zа-яіїєґ]?)(?:[\s,._-]+(?:19|20)\d{2}(?:\s*р\.?)?)?\s*$/i);
  if (!m || /^(19|20)\d{2}$/.test(m[1])) return null; // «Звіт 2026.pdf» — це рік, а не будинок
  return m[1].toLowerCase().replace(/\s/g, '').replace(/a/g, 'а');
}

/* ── Документи одного будинку (у формі редагування) ── */
export function BuildingReportsEditor({ building, token, showToast, refresh }) {
  const [year, setYear] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const reports = [...(building.reports || [])].sort((a, b) => (b.year || 0) - (a.year || 0) || b.uploadedAt.localeCompare(a.uploadedAt));

  const upload = async (file) => {
    if (!file) return;
    if (!year) { showToast('Спершу оберіть рік звіту', 'error'); if (fileRef.current) fileRef.current.value = ''; return; }
    const fileHouse = houseFromFilename(file.name);
    const ownHouse = String(building.number).toLowerCase().replace(/\s/g, '').replace(/a/g, 'а');
    if (fileHouse && fileHouse !== ownHouse && !window.confirm(
      `Файл «${file.name}» схожий на звіт будинку № ${fileHouse}, а ви редагуєте ${building.street}, ${building.number}.\n\nВсе одно завантажити сюди?`,
    )) { if (fileRef.current) fileRef.current.value = ''; return; }
    setBusy(true);
    try {
      const r = await api.uploadBuildingReport(building.id, file, year, token);
      await refresh();
      showToast(r.status === 'replaced' ? `Звіт за ${year} рік замінено новим файлом` : `Звіт за ${year} рік додано`);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const remove = async (r) => {
    if (!window.confirm(`Прибрати «${r.title}» з будинку?`)) return;
    try { await api.deleteBuildingReport(building.id, r.id, token); await refresh(); showToast('Документ прибрано'); }
    catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'grid', gap: '0.875rem' }}>
      {reports.length === 0 && <p className="form-hint" style={{ margin: 0 }}>Звітів ще немає.</p>}
      {reports.length > 0 && (
        <div className="be-reports">
          {reports.map((r) => (
            <div key={r.id} className="be-report">
              <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
              <span className="form-hint">{r.originalName} · {formatSize(r.size)} · завантажено {fmtDateShort(r.uploadedAt)}</span>
              <button type="button" className="be-icon-btn be-icon-btn--danger" onClick={() => remove(r)} aria-label={`Прибрати ${r.title}`} title="Прибрати">×</button>
            </div>
          ))}
        </div>
      )}
      <div className="be-report-add">
        <div className="form-group">
          <label className="form-label" htmlFor={`ry-${building.id}`}>Рік звіту *</label>
          <YearSelect id={`ry-${building.id}`} value={year} onChange={setYear} />
        </div>
        <label className="btn btn-primary btn-sm be-btn" style={{ cursor: year ? 'pointer' : 'not-allowed', opacity: year ? 1 : 0.5 }}>
          <input ref={fileRef} type="file" accept={REPORT_ACCEPT} style={{ display: 'none' }} disabled={busy || !year} onChange={(e) => upload(e.target.files[0])} />
          {busy ? 'Завантаження…' : '⬆ Завантажити файл'}
        </label>
      </div>
      <span className="form-hint">PDF, DOC, DOCX, XLS, XLSX. На сайті показується як «{year || 2026} рік — звіт». Звіт за той самий рік замінюється новим файлом.</span>
    </div>
  );
}

/* ── Масове завантаження: файл «Героїв Крут 5.pdf» іде в будинок Героїв Крут, 5 ── */
export function BulkReportsUpload({ token, showToast, refresh, buildingsCount }) {
  const [year, setYear] = useState('');
  const [progress, setProgress] = useState(null); // { done, total }
  const [result, setResult] = useState(null); // { uploaded: [], skipped: [] }
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  const run = async (fileList) => {
    const files = [...fileList];
    if (!files.length) return;
    if (!year) { showToast('Спершу оберіть рік, за який завантажуються звіти', 'error'); if (fileRef.current) fileRef.current.value = ''; return; }
    const uploaded = [];
    const skipped = [];
    setResult(null);
    setProgress({ done: 0, total: files.length });
    // По 3 файли паралельно, кожен окремим запитом
    let next = 0;
    const worker = async () => {
      while (next < files.length) {
        const file = files[next++];
        try {
          const r = await api.bulkUploadReport(file, year, token);
          uploaded.push(...r.uploaded);
          skipped.push(...r.skipped);
        } catch (e) {
          skipped.push({ file: file.name, reason: e.message });
        }
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    setProgress(null);
    setResult({ uploaded, skipped });
    if (fileRef.current) fileRef.current.value = '';
    await refresh();
    if (skipped.length) showToast(`Завантажено ${uploaded.length}, пропущено ${skipped.length} — подивіться список нижче`, 'error');
    else showToast(`Усі ${uploaded.length} файлів розкладено по будинках`);
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header"><h3>Звіти: масове завантаження</h3></div>
      <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gap: '0.875rem' }}>
        <p className="form-hint" style={{ margin: 0 }}>
          Назвіть кожен файл адресою будинку — наприклад, <b>«Героїв Крут 5.pdf»</b> чи <b>«вул. Клима Савури, 3.pdf»</b> (регістр не важливий) — оберіть рік і виберіть усі файли разом.
          Кожен файл потрапить у свій будинок, а до назви файлу додасться рік: «Героїв Крут 5 {year || 2026}.pdf». Файли, для яких будинок не знайдено, буде пропущено з поясненням.
        </p>
        <div className="form-group" style={{ maxWidth: 260 }}>
          <label className="form-label" htmlFor="bulk-year">За який рік звіти *</label>
          <YearSelect id="bulk-year" value={year} onChange={setYear} />
          <span className="form-hint">На сайті: «{year || 2026} рік — звіт». Звіт будинку за цей рік, якщо вже є, буде замінено.</span>
        </div>
        <label
          className={`file-drop-zone ${drag ? 'has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (!progress) run(e.dataTransfer.files); }}
          style={{ opacity: progress ? 0.6 : 1 }}
        >
          <input ref={fileRef} type="file" multiple accept={REPORT_ACCEPT} style={{ display: 'none' }} disabled={!!progress || !buildingsCount || !year} onChange={(e) => run(e.target.files)} />
          <p>{progress ? `Завантаження… ${progress.done} з ${progress.total}` : year ? `Клікніть або перетягніть сюди файли за ${year} рік` : 'Спершу оберіть рік вище'}</p>
          <small>{buildingsCount ? 'PDF, DOC, DOCX, XLS, XLSX · до 15 МБ кожен' : 'Спершу додайте будинки'}</small>
        </label>
        {progress && (
          <div style={{ height: 6, background: 'var(--slate-100)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(progress.done / progress.total) * 100}%`, background: 'var(--blue-600)', transition: 'width .2s' }} />
          </div>
        )}
        {result && (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {result.skipped.length > 0 && (
              <div style={{ border: '1px solid var(--red-100)', background: '#fff5f5', borderRadius: 12, padding: '0.875rem 1rem', color: 'var(--red-700)' }}>
                <strong>Пропущено {result.skipped.length} — виправте назву файлу і завантажте його ще раз:</strong>
                <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', display: 'grid', gap: 4 }}>
                  {result.skipped.map((s, i) => <li key={`${s.file}-${i}`}><b>{s.file}</b> — {s.reason}</li>)}
                </ul>
              </div>
            )}
            {result.uploaded.length > 0 && (
              <details style={{ border: '1px solid var(--slate-200)', borderRadius: 12, padding: '0.75rem 1rem', background: 'var(--slate-50)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--green-700)' }}>
                  Завантажено {result.uploaded.length} (з них замінено {result.uploaded.filter((u) => u.status === 'replaced').length})
                </summary>
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', display: 'grid', gap: 2, fontSize: '0.85rem' }}>
                  {result.uploaded.map((u, i) => <li key={`${u.file}-${i}`}>{u.file} → {u.building}{u.status === 'replaced' ? ' (замінено)' : ''}</li>)}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
