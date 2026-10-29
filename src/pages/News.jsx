import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import NewsCard from '../components/NewsCard.jsx';
import Pager, { usePaged } from '../components/Pager.jsx';
import { NEWS_CATEGORIES, appliesTo } from '../lib/news.js';
import { useMyBuilding } from '../lib/myBuilding.js';
import { shortAddr } from '../lib/buildings.js';

const PAGE = 9;

function News({ news, buildings, loaded }) {
  const [params, setParams] = useSearchParams();
  const cat = NEWS_CATEGORIES.some((c) => c.key === params.get('cat')) ? params.get('cat') : 'all';
  const [onlyMine, setOnlyMine] = useState(false);
  const mine = useMyBuilding(buildings);
  const mineOn = onlyMine && !!mine;

  const sorted = useMemo(() => [...news].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')), [news]);
  const base = mineOn ? sorted.filter((n) => appliesTo(n, mine.id)) : sorted;
  const items = cat === 'all' ? base : base.filter((n) => (n.category || 'ann') === cat);
  const paged = usePaged(items, PAGE, `${cat}|${mineOn}`);

  const chips = [{ key: 'all', label: 'Усі', count: base.length }, ...NEWS_CATEGORIES.map((c) => ({
    key: c.key, label: c.label, count: base.filter((n) => (n.category || 'ann') === c.key).length,
  }))];

  const pick = (key) => setParams(key === 'all' ? {} : { cat: key }, { replace: true });

  return (
    <>
      <Helmet>
        <title>Новини — ПП «Наш Дім» Тернопіль</title>
        <meta name="description" content="Відключення, роботи й оголошення по будинках ПП «Наш Дім» Тернопіль." />
        <link rel="canonical" href="https://nash-dim.ink/news" />
      </Helmet>

      <h1 className="t-h1">Новини</h1>
      <p className="t-lead" style={{ marginTop: 8 }}>Відключення, роботи й оголошення по будинках.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        <div className="nd-chips">
          {chips.map((c) => (
            <button key={c.key} type="button" className="nd-chip" aria-pressed={cat === c.key} onClick={() => pick(c.key)}>
              {c.label} <span className="nd-chip__count">{c.count}</span>
            </button>
          ))}
        </div>
        {mine && (
          <button type="button" className="tgl" aria-pressed={mineOn} onClick={() => setOnlyMine((v) => !v)}>
            <i />Лише {shortAddr(mine)}
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="g3" style={{ marginTop: 24 }}>
          {paged.visible.map((n) => <NewsCard key={n.id} item={n} />)}
        </div>
      ) : loaded && (
        <div className="panel empty" style={{ marginTop: 24 }}>
          <p>{mineOn ? 'Для вашого будинку тут нічого немає' : 'Новин у цій категорії поки немає'}</p>
          {mineOn && <p className="t-small" style={{ marginTop: 4 }}>Вимкніть «Лише {shortAddr(mine)}», щоб побачити всі новини.</p>}
        </div>
      )}

      <Pager paged={paged} pageSize={PAGE} label={(p) => `Сторінка ${p.page} з ${p.pages}`} />
    </>
  );
}

export default News;
