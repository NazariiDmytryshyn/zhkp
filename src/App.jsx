import { useMemo, useState, useEffect } from 'react';
import { NavLink, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import News from './pages/News.jsx';
import Gallery from './pages/Gallery.jsx';
import Request from './pages/Request.jsx';
import Services from './pages/Services.jsx';
import Tariffs from './pages/Tariffs.jsx';
import Emergency from './pages/Emergency.jsx';
import Documents from './pages/Documents.jsx';
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
  const [services, setServices] = useState([]);
  const [siteContent, setSiteContent] = useState({});
  const [tariffs, setTariffs] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [sections, setSections] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const loadSite = async () => {
      try {
        const site = await api.getSite();
        setNews(site.news || []);
        setGallery(site.gallery || []);
        setServices(site.services || []);
        setSiteContent(site.siteContent || {});
        setTariffs(site.tariffs || []);
        setEmergencyContacts(site.emergencyContacts || []);
        setDocuments(site.documents || []);
        setSections(site.sections || {});
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
              <div className="brand-icon brand-icon-img"><img src='/Gemini_Generated_Image_hg1bcohg1bcohg1b.png' alt="Логотип" /></div>
              <div className="brand-text">
                <h1>{siteContent.companyName || 'ПП "Наш Дім"'}</h1>
                <p>Онлайн сервіс підтримки мешканців</p>
              </div>
            </Link>
            <button className="hamburger" onClick={() => setMobileOpen(v => !v)} aria-label="Меню">
              {mobileOpen
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              }
            </button>
            <nav className={`main-nav${mobileOpen ? ' mobile-open' : ''}`}>
              <NavLink {...activeLink} to="/" onClick={() => setMobileOpen(false)}>Головна</NavLink>
              {sections.about     !== false && <NavLink {...activeLink} to="/about"     onClick={() => setMobileOpen(false)}>Про нас</NavLink>}
              {sections.news      !== false && <NavLink {...activeLink} to="/news"      onClick={() => setMobileOpen(false)}>Новини</NavLink>}
              {sections.gallery   !== false && <NavLink {...activeLink} to="/gallery"   onClick={() => setMobileOpen(false)}>Галерея</NavLink>}
              {sections.services  !== false && <NavLink {...activeLink} to="/services"  onClick={() => setMobileOpen(false)}>Послуги</NavLink>}
              {sections.tariffs   !== false && <NavLink {...activeLink} to="/tariffs"   onClick={() => setMobileOpen(false)}>Тарифи</NavLink>}
              {sections.emergency !== false && <NavLink {...activeLink} to="/emergency" onClick={() => setMobileOpen(false)}>Аварійна</NavLink>}
              {sections.documents !== false && documents.length > 0 && <NavLink {...activeLink} to="/documents" onClick={() => setMobileOpen(false)}>Документи</NavLink>}
              {sections.request   !== false && <NavLink {...activeLink} to="/request"   onClick={() => setMobileOpen(false)}>Залишити заявку</NavLink>}
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
            <Route path="/" element={<Home news={news} gallery={gallery} siteContent={siteContent} />} />
            <Route path="/about" element={<About siteContent={siteContent} />} />
            <Route path="/news" element={<News news={news} />} />
            <Route path="/gallery" element={<Gallery gallery={gallery} />} />
            <Route path="/services" element={<Services services={services} />} />
            <Route path="/tariffs" element={<Tariffs tariffs={tariffs} />} />
            <Route path="/emergency" element={<Emergency emergencyContacts={emergencyContacts} />} />
            <Route path="/documents" element={<Documents documents={documents} />} />
            <Route path="/request" element={<Request onSubmit={addRequest} />} />
          </Routes>
        </main>
      )}

      {!isAdminPath && !location.pathname.startsWith('/request') && <WidgetRequest onSubmit={addRequest} />}

      {!isAdminPath && (
        <footer className="layout-footer">
          <div className="footer-inner">
            <div className="footer-about">
              <div className="footer-logo">
                <div className="footer-logo-icon"><HouseIcon /></div>
                <span className="footer-logo-text">{siteContent.companyName || 'ПП "Наш Дім"'}</span>
              </div>
              <p>{siteContent.tagline || 'Приватне підприємство "Наш Дім" — управління та обслуговування житлового фонду міста Тернопіль з 2000 року. Швидке реагування на заявки мешканців, прозорість та якість.'}</p>
            </div>

            <div className="footer-section">
              <h4>Навігація</h4>
              <ul className="footer-links">
                <li><Link to="/">Головна</Link></li>
                {sections.about     !== false && <li><Link to="/about">Про нас</Link></li>}
                {sections.news      !== false && <li><Link to="/news">Новини</Link></li>}
                {sections.gallery   !== false && <li><Link to="/gallery">Галерея</Link></li>}
                {sections.tariffs   !== false && <li><Link to="/tariffs">Тарифи</Link></li>}
                {sections.emergency !== false && <li><Link to="/emergency">Аварійна</Link></li>}
                {sections.documents !== false && documents.length > 0 && <li><Link to="/documents">Документи</Link></li>}
                {sections.request   !== false && <li><Link to="/request">Залишити заявку</Link></li>}
              </ul>
            </div>

            <div className="footer-section">
              <h4>Контакти</h4>
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {siteContent.address || 'вул. Клима Савури, 3, м. Тернопіль'}
                </div>
                <div className="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.64 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.55 2.73h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/></svg>
                  {siteContent.phone || '+380 (352) 24-34-75'}
                </div>
                <div className="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {siteContent.email || 'info@nashdim-te.at.ua'}
                </div>
                <div className="footer-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {siteContent.hours || 'Пн–Чт: 8:00–17:15, Пт: 8:00–16:00'}
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {siteContent.companyName || 'ПП "Наш Дім"'}. Всі права захищені.</span>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
