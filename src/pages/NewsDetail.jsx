import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import NewsCard from '../components/NewsCard.jsx';
import { fmtNewsDate, isActiveOutage, newsBadge, outageState, outageWhen } from '../lib/news.js';
import { shortAddr } from '../lib/buildings.js';

function NewsDetail({ news, buildings, loaded }) {
  const { id } = useParams();
  const item = news.find((n) => String(n.id) === id);

  if (!item) {
    if (!loaded) return null;
    return (
      <div className="panel empty">
        <p>Новину не знайдено</p>
        <p className="t-small" style={{ margin: '4px 0 16px' }}>Можливо, її було видалено.</p>
        <Link className="nd-btn nd-btn--primary nd-btn--sm" to="/news">Усі новини</Link>
      </div>
    );
  }

  const badge = newsBadge(item);
  const active = isActiveOutage(item);
  const danger = item.severity === 'emergency';
  const linked = item.allBuildings ? [] : buildings.filter((b) => (item.buildingIds || []).includes(b.id));
  const more = news.filter((n) => n.id !== item.id && (n.category || 'ann') === (item.category || 'ann'))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{`${item.title} — ПП «Наш Дім» Тернопіль`}</title>
        <meta name="description" content={item.summary} />
        <link rel="canonical" href={`https://nash-dim.ink/news/${item.id}`} />
      </Helmet>

      <nav className="crumbs" aria-label="Шлях"><Link to="/news">Новини</Link><span>/</span><Link to={`/news?cat=${item.category || 'ann'}`}>{badge.label}</Link></nav>

      <article className="article" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="news__meta">
            <span className={badge.cls}>{badge.label}</span>
            {item.createdAt && <span className="t-small">{fmtNewsDate(item.createdAt, true)}</span>}
          </div>
          <h1 className="t-h1" style={{ overflowWrap: 'anywhere' }}>{item.title}</h1>
        </header>

        {item.category === 'out' && item.endsAt && (
          <div className={`nd-notice ${active ? (danger ? 'nd-notice--danger' : 'nd-notice--warning') : ''}`}>
            <span className="nd-notice__ico" style={active ? undefined : { background: 'var(--surface-sunken)', color: 'var(--ink-3)' }}>
              <Icon name={danger ? 'alert' : 'clock'} />
            </span>
            <div className="nd-notice__body">
              <p className="nd-notice__title">
                {!active ? 'Відключення завершено' : outageState(item) === 'now' ? (danger ? 'Аварія, бригада працює' : 'Відключення триває') : 'Заплановане відключення'}
              </p>
              <p className="nd-notice__meta">{[item.where, active ? outageWhen(item) : ''].filter(Boolean).join(' · ')}</p>
            </div>
          </div>
        )}

        {item.image && <img className="article__img" src={item.image} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}

        <div className="prose">
          <p style={{ whiteSpace: 'pre-line', color: 'var(--ink)', fontSize: 18 }}>{item.summary}</p>
          {item.content && <div className="prose" dangerouslySetInnerHTML={{ __html: item.content }} />}
        </div>

        {(item.where || linked.length > 0 || item.allBuildings) && item.category !== 'out' && (
          <p className="t-small news__where"><Icon name="pin" size="sm" />{item.allBuildings ? 'Усі будинки' : item.where || linked.map(shortAddr).join(', ')}</p>
        )}
        {linked.length > 0 && (
          <div className="nd-chips">
            {linked.slice(0, 12).map((b) => <Link key={b.id} className="nd-chip" to={`/tariffs/${b.id}`} style={{ textDecoration: 'none' }}>{shortAddr(b)}</Link>)}
          </div>
        )}

        <Link to="/news" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, textDecoration: 'none' }}>
          <Icon name="arrowLeft" size="sm" /> Усі новини
        </Link>
      </article>

      {more.length > 0 && (
        <section className="sec">
          <h2 className="t-h2" style={{ marginBottom: 24 }}>Ще {badge.label.toLowerCase() === 'аварія' ? 'про відключення' : `у розділі «${badge.label}»`}</h2>
          <div className="g3">{more.map((n) => <NewsCard key={n.id} item={n} />)}</div>
        </section>
      )}
    </>
  );
}

export default NewsDetail;
