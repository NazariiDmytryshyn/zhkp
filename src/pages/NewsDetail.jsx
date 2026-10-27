import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

const BackLink = () => (
  <Link to="/news" className="news-detail-back">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    Всі новини
  </Link>
);

function NewsDetail({ news, loaded }) {
  const { id } = useParams();
  const item = news.find((n) => String(n.id) === id);

  if (!item) {
    if (!loaded) return null;
    return (
      <section className="page news-detail">
        <BackLink />
        <div className="empty-state">
          <p>Новину не знайдено. Можливо, її було видалено.</p>
        </div>
      </section>
    );
  }

  return (
    <article className="page news-detail">
      <Helmet>
        <title>{`${item.title} — ПП «Наш Дім» Тернопіль`}</title>
        <meta name="description" content={item.summary} />
        <link rel="canonical" href={`https://nash-dim.ink/news/${item.id}`} />
      </Helmet>

      <BackLink />

      <header className="news-detail-header">
        {item.createdAt && <div className="news-card-date">{formatDate(item.createdAt)}</div>}
        <h2>{item.title}</h2>
      </header>

      {item.image && <img className="news-detail-img" src={item.image} alt={item.title} />}

      <div className="news-detail-body">
        <p className="news-detail-summary">{item.summary}</p>
        {item.content && (
          <div className="news-detail-content" dangerouslySetInnerHTML={{ __html: item.content }} />
        )}
      </div>
    </article>
  );
}

export default NewsDetail;
