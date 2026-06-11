import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/zhkpApi.js';

/* ─── Icons ─────────────────────────────────────────────── */
const Icon = {
  house:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  upload:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  grid:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  list:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  news:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v8a2 2 0 0 1-2 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  image:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 1.93 3.14L19 9a1 1 0 0 0 0 1.41l2 2a10 10 0 0 1 0 3.18l-2 2a1 1 0 0 0 0 1.41l2 1a10 10 0 0 1-1.93 3.14L17 21a1 1 0 0 0-1.41 0l-2 2a10 10 0 0 1-3.18 0l-2-2a1 1 0 0 0-1.41 0l-1 2A10 10 0 0 1 2.93 21L2 19a1 1 0 0 0-.41-1.41L0 16a10 10 0 0 1 0-3.18l2-2a1 1 0 0 0 0-1.41L0 7a10 10 0 0 1 1.93-3.14L3 5a1 1 0 0 0 1.41 0l2-2a10 10 0 0 1 3.18 0l2 2a1 1 0 0 0 1.41 0l1-2A10 10 0 0 1 17 1l1 2a1 1 0 0 0 .41 1.41L21 5a10 10 0 0 0-1.93-.07z"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  plus:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  close:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  clock:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  user:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  users:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  img_off:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  edit:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

/* ─── Helpers ────────────────────────────────────────────── */
function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_LABELS = {
  all:              'Всі',
  'Нова':           'Нові',
  'Взята в роботу': 'В роботі',
  'Виконанна':      'Виконані',
  'Відхиленна':     'Відхилені',
};

const STATUS_CSS = {
  'Нова':           'status-нова',
  'Взята в роботу': 'status-взята-в-роботу',
  'Виконанна':      'status-виконанна',
  'Відхиленна':     'status-відхиленна',
};

/* ─── Component ──────────────────────────────────────────── */
function Admin() {
  const [token, setToken]             = useState(api.getToken());
  const [user, setUser]               = useState(null);
  const [activeSection, setActive]    = useState('dashboard');

  useEffect(() => {
    if (user?.role === 'worker') setActive('requests');
  }, [user?.role]);

  /* login */
  const [loginData, setLogin]         = useState({ username: '', password: '' });
  const [loginError, setLoginError]   = useState('');

  /* data */
  const [stats, setStats]             = useState(null);
  const [requests, setRequests]       = useState([]);
  const [news, setNews]               = useState([]);
  const [gallery, setGallery]         = useState([]);
  const [admins, setAdmins]           = useState([]);

  /* forms */
  const [newsForm, setNewsForm]         = useState({ title: '', summary: '', image: '' });
  const [newsImgMode, setNewsImgMode]   = useState('url');
  const [newsImgFile, setNewsImgFile]   = useState(null);
  const [newsImgPreview, setNewsImgPreview] = useState('');
  const [photoUrl, setPhotoUrl]         = useState('');
  const [galleryMode, setGalleryMode]   = useState('url');
  const [galleryFile, setGalleryFile]   = useState(null);
  const [galleryFilePreview, setGalleryFilePreview] = useState('');
  const [logoInput, setLogoInput]       = useState('');
  const [logoPreview, setLogoPreview]   = useState('');
  const [newAdmin, setNewAdmin]         = useState({ username: '', password: '', role: 'worker' });

  /* ui */
  const [toast, setToast]             = useState(null);
  const [reqFilter, setReqFilter]     = useState('all');
  const [showNewsForm, setShowNews]   = useState(false);
  const [showPhotoForm, setShowPhoto] = useState(false);
  const [showAdminForm, setShowAdminF]= useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteValue, setNoteValue]     = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ── load profile on mount if token exists ── */
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { user: profile } = await api.fetchAdminProfile(token);
        setUser(profile);
      } catch {
        api.clearToken();
        setToken(null);
      }
    })();
  }, [token]);

  /* ── load data once user is set ── */
  const refreshData = useCallback(async () => {
    if (!user || !token) return;
    try {
      const [requestsData, siteData, statsData] = await Promise.all([
        api.getAdminRequests(token),
        api.getSite(),
        api.getStats(token),
      ]);
      setRequests(requestsData);
      setNews(siteData.news || []);
      setGallery(siteData.gallery || []);
      setLogoPreview(siteData.logo || '');
      setStats(statsData);
      if (user.role === 'superadmin') {
        const adminList = await api.getAdmins(token);
        setAdmins(adminList);
      }
    } catch (e) {
      showToast(e.message || 'Помилка завантаження даних', 'error');
    }
  }, [user, token]);

  useEffect(() => { refreshData(); }, [refreshData]);

  /* ── handlers ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { token: t, user: profile } = await api.loginAdmin(loginData);
      api.saveToken(t);
      setToken(t);
      setUser(profile);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    setToken(null);
    setUser(null);
    setStats(null);
    setRequests([]);
    setNews([]);
    setGallery([]);
    setAdmins([]);
    setActive('dashboard');
  };

  const handleSaveNote = async (id) => {
    try {
      await api.updateRequestNote(id, noteValue, token);
      await refreshData();
      setEditingNote(null);
      showToast('Нотатку збережено');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateRequestStatus(id, status, token);
      await refreshData();
      showToast('Статус заявки оновлено');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = newsForm.image;
      if (newsImgMode === 'file') {
        if (!newsImgFile) { showToast('Оберіть файл зображення', 'error'); return; }
        imageUrl = await api.uploadFile(newsImgFile, token);
      }
      await api.addNews({ ...newsForm, image: imageUrl }, token);
      setNewsForm({ title: '', summary: '', image: '' });
      setNewsImgFile(null);
      setNewsImgPreview('');
      setNewsImgMode('url');
      setShowNews(false);
      await refreshData();
      showToast('Новину успішно додано');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Видалити цю новину?')) return;
    try {
      await api.deleteNews(id, token);
      await refreshData();
      showToast('Новину видалено');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    try {
      let url = photoUrl;
      if (galleryMode === 'file') {
        if (!galleryFile) { showToast('Оберіть файл зображення', 'error'); return; }
        url = await api.uploadFile(galleryFile, token);
      }
      await api.addGalleryPhoto({ url }, token);
      setPhotoUrl('');
      setGalleryFile(null);
      setGalleryFilePreview('');
      setGalleryMode('url');
      setShowPhoto(false);
      await refreshData();
      showToast('Фото додано до галереї');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeletePhoto = async (id) => {
    if (!window.confirm('Видалити це фото?')) return;
    try {
      await api.deleteGalleryPhoto(id, token);
      await refreshData();
      showToast('Фото видалено');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleSetLogo = async (e) => {
    e.preventDefault();
    try {
      await api.setLogo(logoInput, token);
      setLogoInput('');
      await refreshData();
      showToast('Логотип оновлено');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.createAdmin(newAdmin, token);
      setNewAdmin({ username: '', password: '', role: 'viewer' });
      setShowAdminF(false);
      await refreshData();
      showToast('Адміністратора створено');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Видалити цього адміністратора?')) return;
    try {
      await api.deleteAdmin(id, token);
      await refreshData();
      showToast('Адміністратора видалено');
    } catch (e) { showToast(e.message, 'error'); }
  };

  /* ════════════════ LOGIN SCREEN ════════════════ */
  if (!user) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <div className="admin-login-logo">
            <div className="admin-login-logo-icon">{Icon.house}</div>
            <h2>ПП "Наш Дім" — Адмін</h2>
            <p>Увійдіть для керування сайтом</p>
          </div>
          <form className="admin-login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Логін</label>
              <input
                className="form-input"
                value={loginData.username}
                onChange={(e) => setLogin({ ...loginData, username: e.target.value })}
                placeholder="admin"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input
                type="password"
                className="form-input"
                value={loginData.password}
                onChange={(e) => setLogin({ ...loginData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button className="btn btn-primary" type="submit" style={{ justifyContent: 'center' }}>
              Увійти
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ════════════════ SIDEBAR ITEMS ════════════════ */
  const navItems = user.role === 'worker'
    ? [{ id: 'requests', label: 'Заявки', icon: Icon.list }]
    : [
        { id: 'dashboard', label: 'Огляд',   icon: Icon.grid },
        { id: 'requests',  label: 'Заявки',  icon: Icon.list },
        { id: 'news',      label: 'Новини',  icon: Icon.news  },
        { id: 'gallery',   label: 'Галерея', icon: Icon.image },
        ...(user.role === 'superadmin' ? [{ id: 'settings', label: 'Налаштування', icon: Icon.settings }] : []),
      ];

  const sectionTitle = navItems.find((n) => n.id === activeSection)?.label ?? '';

  /* ─── filtered requests ─── */
  const filteredRequests = reqFilter === 'all'
    ? requests
    : requests.filter((r) => r.status === reqFilter);

  /* ════════════════ DASHBOARD ════════════════ */
  const renderDashboard = () => (
    <div>
      {stats && (
        <div className="stats-grid">
          {[
            { label: 'Всього заявок',  value: stats.totalRequests,      color: 'blue',   icon: Icon.list  },
            { label: 'Нові',           value: stats.newRequests,         color: 'amber',  icon: Icon.clock },
            { label: 'В роботі',       value: stats.inProgressRequests,  color: 'cyan',   icon: Icon.clock },
            { label: 'Виконані',       value: stats.completedRequests,   color: 'green',  icon: Icon.check },
            { label: 'Відхилені',      value: stats.rejectedRequests,    color: 'red',    icon: Icon.close },
            { label: 'Новин',          value: stats.totalNews,           color: 'purple', icon: Icon.news  },
          ].map((s) => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div className="stat-value">{s.value ?? '—'}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Останні заявки</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setActive('requests')}>Всі заявки</button>
        </div>
        {requests.length === 0 ? (
          <div className="empty-state">{Icon.img_off}<p>Заявок ще немає</p></div>
        ) : (
          <div className="requests-list">
            {requests.slice(0, 5).map((r) => (
              <div key={r.id} className="request-row">
                <div className="request-row-info">
                  <div className="request-row-top">
                    <span className="request-name">{r.name}</span>
                    <span className="request-address">{r.address}</span>
                  </div>
                  <div className="request-message">{r.message}</div>
                </div>
                <div className="request-row-actions">
                  <span className={`status-tag ${STATUS_CSS[r.status]}`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════ REQUESTS ════════════════ */
  const renderRequests = () => (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="filter-tabs">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            className={`filter-tab ${reqFilter === key ? 'active' : ''}`}
            onClick={() => setReqFilter(key)}
          >
            {label}
            {key !== 'all' && (
              <span style={{ marginLeft: '0.35rem', opacity: 0.7 }}>
                ({requests.filter((r) => r.status === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>{filteredRequests.length} заявок</h3>
        </div>
        {filteredRequests.length === 0 ? (
          <div className="empty-state">{Icon.list}<p>Заявок за цим фільтром немає</p></div>
        ) : (
          <div className="requests-list">
            {filteredRequests.map((r) => (
              <div key={r.id} className="request-row">
                <div className="request-row-info">
                  <div className="request-row-top">
                    <span className="request-name">{r.name}</span>
                    <span className="request-address">{r.address}</span>
                    <span className="request-phone">{r.phone}</span>
                  </div>
                  <div className="request-message">{r.message}</div>
                  {r.createdAt && <div className="request-date">{formatDate(r.createdAt)}</div>}
                </div>
                <div className="request-row-actions">
                  <span className={`status-tag ${STATUS_CSS[r.status]}`}>{r.status}</span>
                  {user.role !== 'worker' && (
                    <div className="request-action-buttons">
                      {r.status === 'Нова' && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(r.id, 'Взята в роботу')}>
                            {Icon.clock} В роботу
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(r.id, 'Відхиленна')}>
                            {Icon.close} Відхилити
                          </button>
                        </>
                      )}
                      {r.status === 'Взята в роботу' && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(r.id, 'Виконанна')}>
                            {Icon.check} Виконано
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(r.id, 'Відхиленна')}>
                            {Icon.close} Відхилити
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="request-note-section">
                  {editingNote === r.id ? (
                    <>
                      <textarea
                        className="request-note-textarea"
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        placeholder="Введіть нотатку..."
                        autoFocus
                        rows={2}
                      />
                      <div className="request-note-actions">
                        <button className="btn btn-sm btn-success" onClick={() => handleSaveNote(r.id)}>
                          {Icon.check} Зберегти
                        </button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setEditingNote(null)}>
                          Скасувати
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      className={`request-note-btn${r.note ? ' has-note' : ''}`}
                      onClick={() => { setEditingNote(r.id); setNoteValue(r.note || ''); }}
                    >
                      {Icon.edit}
                      <span>{r.note || 'Додати нотатку'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════ NEWS ════════════════ */
  const renderNews = () => (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Новини ({news.length})</h3>
          {user.role === 'superadmin' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowNews((p) => !p)}>
              {Icon.plus} Додати новину
            </button>
          )}
        </div>

        {showNewsForm && user.role === 'superadmin' && (
          <form className="admin-add-form" onSubmit={handleAddNews}>
            <div className="form-group">
              <label className="form-label">Заголовок *</label>
              <input className="form-input" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Короткий опис *</label>
              <textarea className="form-textarea" style={{ minHeight: '90px' }} value={newsForm.summary} onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Зображення *</label>
              <div className="upload-mode-tabs">
                <button type="button" className={`upload-mode-tab ${newsImgMode === 'url' ? 'active' : ''}`} onClick={() => setNewsImgMode('url')}>URL-посилання</button>
                <button type="button" className={`upload-mode-tab ${newsImgMode === 'file' ? 'active' : ''}`} onClick={() => setNewsImgMode('file')}>З комп'ютера</button>
              </div>
              {newsImgMode === 'url' ? (
                <input className="form-input" value={newsForm.image} onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })} placeholder="https://..." />
              ) : (
                <label
                  className={`file-drop-zone ${newsImgFile ? 'has-file' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f && f.type.startsWith('image/')) { setNewsImgFile(f); setNewsImgPreview(URL.createObjectURL(f)); }
                  }}
                >
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) { setNewsImgFile(f); setNewsImgPreview(URL.createObjectURL(f)); }
                  }} />
                  {newsImgPreview
                    ? <img className="file-drop-preview" src={newsImgPreview} alt="preview" />
                    : <>{Icon.upload}<p>Клікніть або перетягніть файл</p><small>PNG, JPG, WebP до 10 МБ</small></>
                  }
                </label>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn btn-primary btn-sm" type="submit">Зберегти</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setShowNews(false); setNewsImgFile(null); setNewsImgPreview(''); setNewsImgMode('url'); }}>Скасувати</button>
            </div>
          </form>
        )}

        {news.length === 0 ? (
          <div className="empty-state">{Icon.news}<p>Новин поки що немає</p></div>
        ) : (
          <div className="news-admin-list">
            {news.map((item) => (
              <div key={item.id} className="news-admin-item">
                {item.image
                  ? <img className="news-admin-thumb" src={item.image} alt={item.title} />
                  : <div className="news-admin-thumb" style={{ background: 'var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)' }}>{Icon.image}</div>
                }
                <div>
                  <div className="news-admin-title">{item.title}</div>
                  <div className="news-admin-date">{formatDate(item.createdAt || item.id)}</div>
                </div>
                {user.role === 'superadmin' && (
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteNews(item.id)} title="Видалити">
                    {Icon.trash}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════ GALLERY ════════════════ */
  const renderGallery = () => (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Галерея ({gallery.length} фото)</h3>
          {user.role === 'superadmin' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowPhoto((p) => !p)}>
              {Icon.plus} Додати фото
            </button>
          )}
        </div>

        {showPhotoForm && user.role === 'superadmin' && (
          <form className="admin-add-form" onSubmit={handleAddPhoto}>
            <div className="form-group">
              <label className="form-label">Фотографія *</label>
              <div className="upload-mode-tabs">
                <button type="button" className={`upload-mode-tab ${galleryMode === 'url' ? 'active' : ''}`} onClick={() => setGalleryMode('url')}>URL-посилання</button>
                <button type="button" className={`upload-mode-tab ${galleryMode === 'file' ? 'active' : ''}`} onClick={() => setGalleryMode('file')}>З комп'ютера</button>
              </div>
              {galleryMode === 'url' ? (
                <>
                  <input className="form-input" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
                  {photoUrl && (
                    <img src={photoUrl} alt="Preview" style={{ maxHeight: 160, borderRadius: 'var(--radius-md)', objectFit: 'cover', maxWidth: '100%', marginTop: '0.5rem' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                </>
              ) : (
                <label
                  className={`file-drop-zone ${galleryFile ? 'has-file' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f && f.type.startsWith('image/')) { setGalleryFile(f); setGalleryFilePreview(URL.createObjectURL(f)); }
                  }}
                >
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) { setGalleryFile(f); setGalleryFilePreview(URL.createObjectURL(f)); }
                  }} />
                  {galleryFilePreview
                    ? <img className="file-drop-preview" src={galleryFilePreview} alt="preview" />
                    : <>{Icon.upload}<p>Клікніть або перетягніть файл</p><small>PNG, JPG, WebP до 10 МБ</small></>
                  }
                </label>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn btn-primary btn-sm" type="submit">Додати</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setShowPhoto(false); setGalleryFile(null); setGalleryFilePreview(''); setGalleryMode('url'); }}>Скасувати</button>
            </div>
          </form>
        )}

        {gallery.length === 0 ? (
          <div className="empty-state">{Icon.image}<p>Галерея порожня</p></div>
        ) : (
          <div className="gallery-admin-grid">
            {gallery.map((item) => (
              <div key={item.id} className="gallery-admin-item">
                <img src={item.url} alt={`Фото ${item.id}`} />
                {user.role === 'superadmin' && (
                  <button className="gallery-admin-delete" onClick={() => handleDeletePhoto(item.id)} title="Видалити">
                    {Icon.close}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════ SETTINGS ════════════════ */
  const renderSettings = () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>

      {/* Logo */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Логотип сайту</h3>
        </div>
        <div className="admin-card-body">
          <div className="logo-preview-wrap">
            <img className="logo-preview-img" src={logoPreview} alt="Поточний логотип" onError={(e) => { e.target.style.opacity = '0.3'; }} />
            <form className="logo-preview-form" onSubmit={handleSetLogo}>
              <div className="form-group">
                <label className="form-label">Новий URL логотипу</label>
                <input className="form-input" value={logoInput} onChange={(e) => setLogoInput(e.target.value)} placeholder="https://..." required />
              </div>
              <button className="btn btn-primary btn-sm" type="submit" style={{ width: 'fit-content' }}>
                Оновити логотип
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Admins */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Адміністратори ({admins.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdminF((p) => !p)}>
            {Icon.plus} Додати
          </button>
        </div>

        {showAdminForm && (
          <form className="admin-add-form" onSubmit={handleCreateAdmin}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div className="form-group">
                <label className="form-label">Логін *</label>
                <input className="form-input" value={newAdmin.username} onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Пароль *</label>
                <input type="password" className="form-input" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 240 }}>
              <label className="form-label">Роль</label>
              <select className="form-select" value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}>
                <option value="worker">Тільки перегляд заявок</option>
                <option value="viewer">Менеджер заявок</option>
                <option value="superadmin">Повний доступ</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn btn-primary btn-sm" type="submit">Створити</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowAdminF(false)}>Скасувати</button>
            </div>
          </form>
        )}

        {admins.length === 0 ? (
          <div className="empty-state">{Icon.users}<p>Адміністраторів немає</p></div>
        ) : (
          <div className="admins-list">
            {admins.map((a) => (
              <div key={a.id} className="admin-list-item">
                <div className="admin-avatar">{a.username[0].toUpperCase()}</div>
                <div className="admin-list-name">{a.username}</div>
                <span className={`admin-role-tag ${a.role}`}>
                  {a.role === 'superadmin' ? 'Суперадмін' : a.role === 'viewer' ? 'Менеджер' : 'Працівник'}
                </span>
                {a.id !== 1 && (
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteAdmin(a.id)} title="Видалити">
                    {Icon.trash}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════ MAIN LAYOUT ════════════════ */
  return (
    <div className="admin-shell">

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? ' mobile-open' : ''}`}>
        <div className="admin-brand">
          <div className="admin-brand-icon">{Icon.house}</div>
          <div className="admin-brand-text">
            <span className="admin-brand-title">ПП "Наш Дім"</span>
            <span className="admin-brand-subtitle">Адмін-панель</span>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`admin-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => { setActive(item.id); setSidebarOpen(false); }}
            >
              {item.icon}
              {item.label}
              {item.id === 'requests' && stats?.newRequests > 0 && (
                <span className="nav-badge">{stats.newRequests}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-name">{user.username}</div>
            <div className="admin-role-badge">
              {user.role === 'superadmin' ? 'Суперадмін' : user.role === 'viewer' ? 'Менеджер' : 'Працівник'}
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            {Icon.logout} Вийти
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen(v => !v)} aria-label="Меню">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            <h2>{sectionTitle}</h2>
          </div>
          <span className="admin-topbar-meta">
            {new Date().toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        <div className="admin-content">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'requests'  && renderRequests()}
          {activeSection === 'news'      && renderNews()}
          {activeSection === 'gallery'   && renderGallery()}
          {activeSection === 'settings'  && renderSettings()}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' && Icon.check}
          {toast.type === 'error'   && Icon.close}
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>{Icon.close}</button>
        </div>
      )}
    </div>
  );
}

export default Admin;
