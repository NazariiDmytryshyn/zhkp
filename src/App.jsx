import { useMemo, useState, useEffect } from 'react';
import { NavLink, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import News from './pages/News.jsx';
import Gallery from './pages/Gallery.jsx';
import Request from './pages/Request.jsx';
import Admin from './pages/Admin.jsx';
import WidgetRequest from './components/WidgetRequest.jsx';
import * as api from './api/zhkpApi.js';

function HouseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function App() {
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    const loadSite = async () => {
      try {
        const site = await api.getSite();
        setNews(site.news || []);
        setGallery(site.gallery || []);
      } catch (error) {
        console.error('Не вдалося завантажити сайт:', error);
      }
    };

    loadSite();
    window.addEventListener('zhkp-data-updated', loadSite);
    return () => window.removeEventListener('zhkp-data-updated', loadSite);
  }, []);

  const activeLink = useMemo(
    () => ({ className: ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link') }),
    []
  );

  const addRequest = async (request) => {
    try {
      await api.addRequest(request);
    } catch (error) {
      console.error('Не вдалося надіслати заявку:', error);
    }
  };

  return (
    <div className="app-shell">
      {!isAdminPath && (
        <header className="layout-header">
          <div className="header-inner">
            <Link to="/" className="brand">
              <div className="brand-icon"><HouseIcon /></div>
              <div className="brand-text">
                <h1>ПП "Наш Дім"</h1>
                <p>Онлайн сервіс підтримки мешканців</p>
              </div>
            </Link>
            <nav className="main-nav">
              <NavLink {...activeLink} to="/">Головна</NavLink>
              <NavLink {...activeLink} to="/about">Про нас</NavLink>
              <NavLink {...activeLink} to="/news">Новини</NavLink>
              <NavLink {...activeLink} to="/gallery">Галерея</NavLink>
              <NavLink {...activeLink} to="/request">Залишити заявку</NavLink>
            </nav>
          </div>
        </header>
      )}

      {isAdminPath ? (
        <div className="admin-page">
          <Routes>
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      ) : (
        <main className="layout-main">
          <Routes>
            <Route path="/" element={<Home news={news} gallery={gallery} />} />
            <Route path="/about" element={<About />} />
            <Route path="/news" element={<News news={news} />} />
            <Route path="/gallery" element={<Gallery gallery={gallery} />} />
            <Route path="/request" element={<Request onSubmit={addRequest} />} />
          </Routes>
        </main>
      )}

      {!isAdminPath && <WidgetRequest onSubmit={addRequest} />}

      {!isAdminPath && (
        <footer className="layout-footer">
          <div className="footer-inner">
            <div className="footer-about">
              <div className="footer-logo">
                <div className="footer-logo-icon"><HouseIcon /></div>
                <span className="footer-logo-text">ЖЕКП Сервіс</span>
              </div>
              <p>Ми забезпечуємо комфорт та якісне обслуговування будинків у вашому районі. Швидке реагування на заявки, актуальні новини та прозорість роботи.</p>
            </div>

            <div className="footer-section">
              <h4>Навігація</h4>
              <ul className="footer-links">
                <li><Link to="/">Головна</Link></li>
                <li><Link to="/about">Про нас</Link></li>
                <li><Link to="/news">Новини</Link></li>
                <li><Link to="/gallery">Галерея</Link></li>
                <li><Link to="/request">Залишити заявку</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Контакти</h4>
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  вул. Соборна, 24, м. Бровари
                </div>
                <div className="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.64 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.55 2.73h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/></svg>
                  (04594) 6-23-45
                </div>
                <div className="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  zhkp@brovary.gov.ua
                </div>
                <div className="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Пн–Пт: 8:00–17:00
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 ЖЕКП Сервіс. Всі права захищені.</span>
            <Link to="/admin" style={{ color: 'inherit', opacity: 0.4, fontSize: '0.8rem' }}>Адміністратор</Link>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
