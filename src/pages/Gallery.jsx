import { useState } from 'react';
import Lightbox from '../components/Lightbox.jsx';

function Gallery({ gallery }) {
  const [lbIndex, setLbIndex] = useState(null);
  const urls = gallery.map(item => item.url);

  return (
    <section className="page page-gallery">
      <div className="section-header">
        <div>
          <h2>Галерея</h2>
          <p>Огляньте приклади благоустрою та ремонтів у нашому районі.</p>
        </div>
      </div>

      {gallery.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <p>Галерея поки що порожня.</p>
        </div>
      ) : (
        <div className="gallery-grid gallery-full">
          {gallery.map((item, i) => (
            <div key={item.id} className="gallery-thumb" onClick={() => setLbIndex(i)}>
              <img src={item.url} alt={`Фото ${item.id}`} loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {lbIndex !== null && (
        <Lightbox images={urls} startIndex={lbIndex} onClose={() => setLbIndex(null)} />
      )}
    </section>
  );
}

export default Gallery;
