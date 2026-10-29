import { useRef, useState } from 'react';
import * as api from '../../api/zhkpApi.js';
import { downloadServicesTemplate, parseServicesSheet } from '../../lib/servicesExcel.js';

// Той самий ключ, що й на сервері: назва без регістру й зайвих пробілів + категорія
const svcKey = (s) => `${s.category || 'other'}|${String(s.title).trim().toLowerCase().replace(/\s+/g, ' ')}`;

function ServicesExcel({ services, token, showToast, refresh }) {
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const onFile = async (file) => {
    if (!file) return;
    try {
      const { readSheet } = await import('read-excel-file/browser');
      const parsed = parseServicesSheet(await readSheet(file));
      const known = new Set(services.map(svcKey));
      setPreview({ name: file.name, ...parsed, created: parsed.items.filter((it) => !known.has(svcKey(it))).length });
    } catch (e) {
      showToast(`Не вдалося прочитати файл: ${e.message}`, 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const runImport = async () => {
    setImporting(true);
    try {
      const r = await api.importServices(preview.items, token);
      setPreview(null);
      await refresh();
      showToast(`Імпорт завершено: нових послуг ${r.created}, оновлено ${r.updated}`);
    } catch (e) {
      setPreview((p) => ({ ...p, errors: e.details?.length ? e.details : [e.message] }));
      showToast(e.message, 'error');
    } finally { setImporting(false); }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header"><h3>Імпорт і експорт прайс-листа (Excel)</h3></div>
      <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gap: '0.875rem' }}>
        <p className="form-hint" style={{ margin: 0 }}>
          Один рядок — одна послуга. Колонки: Категорія (Сантехніка, Електрика, Догляд за зеленими насадженнями, Інше), Розділ, Назва, Одиниця, Ціна, Короткий опис.
          Послуга шукається за назвою в межах категорії: знайдена оновлюється, нова додається. Опис, фото й переваги, внесені вручну, не зачіпаються. <b>Нічого не видаляється.</b>
        </p>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => downloadServicesTemplate(services).catch((e) => showToast(e.message, 'error'))}>
            ⬇ {services.length ? 'Завантажити всі послуги (Excel)' : 'Завантажити шаблон'}
          </button>
          <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
            <input ref={fileRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files[0])} />
            ⬆ Імпортувати з Excel
          </label>
        </div>
        {preview && (
          <div style={{ border: '1px solid var(--slate-200)', borderRadius: 12, padding: '1rem', background: 'var(--slate-50)', display: 'grid', gap: '0.5rem' }}>
            <strong>{preview.name}</strong>
            <span>Послуг у файлі: {preview.items.length} · нових: {preview.created} · оновиться: {preview.items.length - preview.created}</span>
            {preview.errors.length > 0 && (
              <div style={{ color: 'var(--red-700)' }}>
                <strong>Виправте у файлі і завантажте знову:</strong>
                <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.2rem' }}>{preview.errors.slice(0, 15).map((e) => <li key={e}>{e}</li>)}</ul>
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
  );
}

export default ServicesExcel;
