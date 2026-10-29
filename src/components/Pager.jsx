import { useEffect, useState } from 'react';

// Сторінки + «Показати ще» (дописує наступну сторінку до поточної)
export function usePaged(items, pageSize, resetKey) {
  const [page, setPage] = useState(1);
  const [span, setSpan] = useState(1);
  useEffect(() => { setPage(1); setSpan(1); }, [resetKey]);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  const end = Math.min(items.length, (page - 1 + span) * pageSize);
  return {
    visible: items.slice(start, end),
    pages, page: page + span - 1, start, end, total: items.length,
    goTo: (p) => { setPage(p); setSpan(1); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    more: () => setSpan((s) => s + 1),
    hasMore: end < items.length,
  };
}

function pageList(current, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, 2, current - 1, current, current + 1, pages].filter((p) => p >= 1 && p <= pages));
  return [...set].sort((a, b) => a - b);
}

function Pager({ paged, pageSize, label }) {
  if (paged.total <= pageSize) return null;
  const list = pageList(paged.page, paged.pages);
  return (
    <div className="pager">
      <span className="t-small">{label(paged)}</span>
      <div className="pager__pages">
        {list.map((p, i) => (
          <span key={p} style={{ display: 'contents' }}>
            {i > 0 && p - list[i - 1] > 1 && <span className="pager__gap">…</span>}
            <button type="button" aria-current={p === paged.page ? 'page' : undefined} onClick={() => paged.goTo(p)} aria-label={`Сторінка ${p}`}>{p}</button>
          </span>
        ))}
      </div>
      {paged.hasMore
        ? <button type="button" className="nd-btn nd-btn--secondary nd-btn--sm" onClick={paged.more}>Показати ще {Math.min(pageSize, paged.total - paged.end)}</button>
        : <span />}
    </div>
  );
}

export default Pager;
