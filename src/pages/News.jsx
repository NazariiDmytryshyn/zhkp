import { Helmet } from 'react-helmet-async';

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

function News({ news }) {
  return (
    <section className="page page-news">
      <Helmet>
        <title>Новини — ПП «Наш Дім» Тернопіль</title>
        <meta name="description" content="Останні новини та оголошення ПП «Наш Дім» Тернопіль. Інформація про планові роботи, відключення, події." />
        <link rel="canonical" href="https://nash-dim.ink/news" />
      </Helmet>
      <div className="section-header">
        <div>
          <h2>Новини</h2>
          <p>Останні повідомлення про роботу ЖКП, графіки відключень та оновлення.</p>
        </div>
      </div>

      {news.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v8a2 2 0 0 1-2 2z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>Новин поки що немає.</p>
        </div>
      ) : (
        <div className="card-grid">
          {news.map((item) => (
            <article key={item.id} className="news-card">
              {item.image && (
                <img className="news-card-img" src={item.image} alt={item.title} />
              )}
              <div className="news-card-body">
                {item.createdAt && (
                  <div className="news-card-date">{formatDate(item.createdAt)}</div>
                )}
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default News;
