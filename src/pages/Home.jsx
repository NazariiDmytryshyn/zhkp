import { Link } from 'react-router-dom';

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Home({ news, gallery }) {
  return (
    <section className="page page-home">

      {/* Hero */}
      <div className="hero">
        <span className="hero-eyebrow">Житлово-Комунальне Підприємство</span>
        <h2 className="hero-title">Сучасний сервіс<br />для вашого будинку</h2>
        <p className="hero-desc">
          Підтримка мешканців, оперативне реагування на заявки, актуальні новини
          та прозора інформація про роботи у вашому районі.
        </p>
        <div className="hero-actions">
          <Link to="/request" className="btn btn-white">Залишити заявку</Link>
          <Link to="/about" className="btn btn-outline">Дізнатися більше</Link>
        </div>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-value">50+</div>
            <div className="hero-stat-label">будинків</div>
          </div>
          <div>
            <div className="hero-stat-value">5 000+</div>
            <div className="hero-stat-label">мешканців</div>
          </div>
          <div>
            <div className="hero-stat-value">15</div>
            <div className="hero-stat-label">років досвіду</div>
          </div>
          <div>
            <div className="hero-stat-value">24/7</div>
            <div className="hero-stat-label">підтримка</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="features-grid">
        <article className="feature-card">
          <div className="feature-icon blue"><ZapIcon /></div>
          <h3>Швидкі заявки</h3>
          <p>Оформляйте проблеми легко та зручно. Ми отримуємо і обробляємо заявки миттєво та реагуємо першочергово.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon green"><BellIcon /></div>
          <h3>Актуальні новини</h3>
          <p>Всі важливі оголошення, графіки відключень та оновлення інфраструктури у зручному форматі.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon amber"><ImageIcon /></div>
          <h3>Галерея робіт</h3>
          <p>Оцінюйте результати ремонтів та стан прибудинкової території. Прозорість нашої роботи.</p>
        </article>
      </div>

      {/* News preview */}
      {news.length > 0 && (
        <section className="section-preview">
          <div className="section-header">
            <div>
              <h3>Останні новини</h3>
            </div>
            <Link to="/news">Всі новини →</Link>
          </div>
          <div className="card-grid">
            {news.slice(0, 3).map((item) => (
              <article key={item.id} className="news-card">
                {item.image && <img className="news-card-img" src={item.image} alt={item.title} />}
                <div className="news-card-body">
                  {item.createdAt && <div className="news-card-date">{formatDate(item.createdAt)}</div>}
                  <h4>{item.title}</h4>
                  <p>{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Gallery preview */}
      {gallery.length > 0 && (
        <section className="section-preview">
          <div className="section-header">
            <div>
              <h3>Останні фото</h3>
            </div>
            <Link to="/gallery">Всі фото →</Link>
          </div>
          <div className="gallery-grid">
            {gallery.slice(0, 6).map((item) => (
              <div key={item.id} className="gallery-thumb">
                <img src={item.url} alt={`Галерея ${item.id}`} />
              </div>
            ))}
          </div>
        </section>
      )}

    </section>
  );
}

export default Home;
