import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import News from './pages/News.jsx';
import NewsDetail from './pages/NewsDetail.jsx';
import Gallery from './pages/Gallery.jsx';
import Request from './pages/Request.jsx';
import Services from './pages/Services.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import Tariffs from './pages/Tariffs.jsx';
import Building from './pages/Building.jsx';
import Emergency from './pages/Emergency.jsx';
import Documents from './pages/Documents.jsx';
import Admin from './pages/Admin.jsx';
import WidgetRequest from './components/WidgetRequest.jsx';
import { SiteHeader, SiteFooter } from './components/SiteLayout.jsx';
import * as api from './api/zhkpApi.js';

function App() {
  const [site, setSite] = useState({
    news: [], gallery: [], services: [], siteContent: {}, tariffs: [],
    emergencyContacts: [], documents: [], sections: {}, buildings: [],
  });
  const [siteLoaded, setSiteLoaded] = useState(false);
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    const loadSite = async () => {
      try {
        const [data, buildings] = await Promise.all([api.getSite(), api.getBuildings().catch(() => [])]);
        setSite({
          news: data.news || [],
          gallery: data.gallery || [],
          services: data.services || [],
          siteContent: data.siteContent || {},
          tariffs: data.tariffs || [],
          emergencyContacts: data.emergencyContacts || [],
          documents: data.documents || [],
          sections: data.sections || {},
          buildings: buildings || [],
        });
      } catch (error) {
        console.error('Не вдалося завантажити сайт:', error);
      } finally {
        setSiteLoaded(true);
      }
    };

    loadSite();
    // Повернулись на вкладку сайту (наприклад, після змін в адмінці) — підтягуємо свіжі дані
    const onVisible = () => { if (document.visibilityState === 'visible') loadSite(); };
    window.addEventListener('zhkp-data-updated', loadSite);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('zhkp-data-updated', loadSite);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const addRequest = async (request) => {
    await api.addRequest(request);
  };

  if (isAdminPath) {
    return (
      <div className="app-shell">
        <div className="admin-page">
          <Routes>
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    );
  }

  const { news, gallery, services, siteContent, tariffs, emergencyContacts, documents, sections, buildings } = site;
  const common = { siteContent, buildings, loaded: siteLoaded };

  return (
    <div className="pg">
      <SiteHeader siteContent={siteContent} sections={sections} documents={documents} buildings={buildings} />

      <main className="main">
        <div className="wrap">
          <Routes>
            <Route path="/" element={<Home {...common} news={news} gallery={gallery} sections={sections} />} />
            <Route path="/about" element={<About {...common} documents={documents} />} />
            <Route path="/news" element={<News {...common} news={news} />} />
            <Route path="/news/:id" element={<NewsDetail {...common} news={news} />} />
            <Route path="/gallery" element={<Gallery gallery={gallery} />} />
            <Route path="/services" element={<Services services={services} />} />
            <Route path="/services/:id" element={<ServiceDetail {...common} services={services} />} />
            <Route path="/tariffs" element={<Tariffs {...common} news={news} tariffs={tariffs} />} />
            <Route path="/tariffs/:id" element={<Building {...common} news={news} />} />
            <Route path="/emergency" element={<Emergency siteContent={siteContent} emergencyContacts={emergencyContacts} />} />
            <Route path="/documents" element={<Documents documents={documents} />} />
            <Route path="/request" element={<Request {...common} onSubmit={addRequest} />} />
          </Routes>
        </div>
      </main>

      {sections.request !== false && !location.pathname.startsWith('/request') && (
        <WidgetRequest onSubmit={addRequest} buildings={buildings} />
      )}

      <SiteFooter siteContent={siteContent} sections={sections} documents={documents} />
    </div>
  );
}

export default App;
