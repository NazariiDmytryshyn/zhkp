import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Lightbox from '../components/Lightbox.jsx';

const MONTHS = ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'];

// '2026-10' → 'жовтень 2026'
export function fmtMonth(ym) {
  const m = /^(\d{4})-(\d{2})/.exec(ym || '');
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : ym || '';
}

function Gallery({ gallery }) {
  const [lbIndex, setLbIndex] = useState(null);

  return (
    <>
      <Helmet>
        <title>Галерея — ПП «Наш Дім» Тернопіль</title>
        <meta name="description" content="Фото виконаних робіт ПП «Наш Дім» у Тернополі: ремонти, благоустрій, обслуговування будинків." />
        <link rel="canonical" href="https://nash-dim.ink/gallery" />
      </Helmet>

      <h1 className="t-h1">Наші роботи</h1>
      <p className="t-lead" style={{ marginTop: 8 }}>Ремонти, благоустрій і обслуговування будинків — до і після.</p>

      {gallery.length === 0 ? (
        <div className="panel empty" style={{ marginTop: 32 }}><p>Галерея поки що порожня</p></div>
      ) : (
        <div className="g4" style={{ marginTop: 32 }}>
          {gallery.map((p, i) => (
            <div key={p.id}>
              <button type="button" className="ph-card" onClick={() => setLbIndex(i)} aria-label={`Відкрити фото${p.title ? `: ${p.title}` : ''}`}>
                <div className="ph-card__img"><img src={p.url} alt={p.title || ''} loading="lazy" /></div>
              </button>
              {p.title && <p style={{ fontWeight: 600, marginTop: 12 }}>{p.title}</p>}
              {(p.place || p.date) && <p className="t-small">{[p.place, fmtMonth(p.date)].filter(Boolean).join(' · ')}</p>}
            </div>
          ))}
        </div>
      )}

      {lbIndex !== null && (
        <Lightbox images={gallery.map((p) => p.url)} startIndex={lbIndex} onClose={() => setLbIndex(null)} />
      )}
    </>
  );
}

export default Gallery;
