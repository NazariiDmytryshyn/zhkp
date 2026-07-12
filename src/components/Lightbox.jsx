import { useState, useEffect } from 'react';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

function Lightbox({ images, startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  setCurrent(p => (p - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setCurrent(p => (p + 1) % images.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  const prev = (e) => { e.stopPropagation(); setCurrent(p => (p - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setCurrent(p => (p + 1) % images.length); };

  return (
    <div className="lb-backdrop" onClick={onClose}>
      <button className="lb-close" onClick={onClose}><CloseIcon /></button>

      {images.length > 1 && (
        <>
          <button className="lb-arrow lb-prev" onClick={prev}><ChevronLeft /></button>
          <button className="lb-arrow lb-next" onClick={next}><ChevronRight /></button>
        </>
      )}

      <div className="lb-img-wrap" onClick={e => e.stopPropagation()}>
        <img className="lb-img" src={images[current]} alt={`Фото ${current + 1}`} />
      </div>

      {images.length > 1 && (
        <div className="lb-counter">{current + 1} / {images.length}</div>
      )}
    </div>
  );
}

export default Lightbox;
