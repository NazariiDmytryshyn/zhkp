import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../api/zhkpApi.js';
import RichEditor from '../components/RichEditor.jsx';
import { io } from 'socket.io-client';

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
  briefcase:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  bell:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  layout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  tag:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  phone:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.64 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.55 2.73h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/></svg>,
  file:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
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
  const [services, setServices]         = useState([]);
  const [serviceReqs, setServiceReqs]   = useState([]);
  const [sections, setSections]         = useState({});
  const [tariffs, setTariffs]           = useState([]);
  const [emergencyContacts, setEC]      = useState([]);
  const [documents, setDocuments]       = useState([]);

  /* tariffs */
  const [showTariffForm, setShowTariffF]  = useState(false);
  const [tariffForm, setTariffForm]       = useState({ category: '', name: '', price: '', unit: '' });
  const [editTariffId, setEditTariffId]   = useState(null);
  const [editTariffForm, setEditTariffF]  = useState({});

  /* emergency contacts */
  const [showECForm, setShowECForm]       = useState(false);
  const [ecForm, setECForm]               = useState({ name: '', phone: '', description: '', available: '' });
  const [editECId, setEditECId]           = useState(null);
  const [editECForm, setEditECFormV]      = useState({});

  /* documents */
  const [docFile, setDocFile]             = useState(null);
  const [docName, setDocName]             = useState('');
  const [docUploading, setDocUploading]   = useState(false);

  /* services ui */
  const [serviceTab, setServiceTab]       = useState('catalog');
  const [showServiceForm, setShowSvcF]    = useState(false);
  const [svcForm, setSvcForm]             = useState({ title: '', description: '', price: '', image: '', features: '' });
  const [editSvcId, setEditSvcId]         = useState(null);
  const [editSvcForm, setEditSvcForm]     = useState({});
  const [srFilter, setSrFilter]           = useState('all');
  const [editingSrNote, setEditSrNote]    = useState(null);
  const [srNoteValue, setSrNoteValue]     = useState('');

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
  const [logoMode, setLogoMode]         = useState('url');
  const [logoFile, setLogoFile]         = useState(null);
  const [logoFilePreview, setLogoFilePreview] = useState('');
  const [siteContent, setSiteContent]   = useState({});
  const [scForm, setScForm]             = useState({});
  const [scSaving, setScSaving]         = useState(false);
  const [newAdmin, setNewAdmin]         = useState({ username: '', password: '', role: 'worker' });

  /* ui */
  const [toasts, setToasts]           = useState([]);
  const [reqFilter, setReqFilter]     = useState('all');
  const [showNewsForm, setShowNews]   = useState(false);
  const [showPhotoForm, setShowPhoto] = useState(false);
  const [showAdminForm, setShowAdminF]= useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteValue, setNoteValue]     = useState('');

  const socketRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

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

  /* ── socket: real-time notifications ── */
  useEffect(() => {
    if (!user) return;
    const socket = io();
    socketRef.current = socket;

    socket.on('new-request', (req) => {
      setRequests(prev => prev.some(r => r.id === req.id) ? prev : [req, ...prev]);
      setStats(prev => prev ? { ...prev, totalRequests: prev.totalRequests + 1, newRequests: prev.newRequests + 1 } : prev);
      showToast(`Нова заявка: ${req.name} (${req.address})`, 'socket');
    });

    socket.on('new-service-request', (sr) => {
      setServiceReqs(prev => prev.some(r => r.id === sr.id) ? prev : [sr, ...prev]);
      showToast(`Нова заявка на послугу «${sr.serviceName}»`, 'socket');
    });

    return () => socket.disconnect();
  }, [user, showToast]);

  /* ── load data once user is set ── */
  const refreshData = useCallback(async () => {
    if (!user || !token) return;
    try {
      const [requestsData, siteData, statsData, srData] = await Promise.all([
        api.getAdminRequests(token),
        api.getSite(),
        api.getStats(token),
        api.getServiceRequests(token),
      ]);
      setRequests(requestsData);
      setNews(siteData.news || []);
      setGallery(siteData.gallery || []);
      setServices(siteData.services || []);
      setSections(siteData.sections || {});
      setTariffs(siteData.tariffs || []);
      setEC(siteData.emergencyContacts || []);
      setDocuments(siteData.documents || []);
      setLogoPreview(siteData.logo || '');
      const sc = siteData.siteContent || {};
      setSiteContent(sc);
      setScForm(sc);
      setStats(statsData);
      setServiceReqs(srData || []);
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

  /* ── service handlers ── */
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const features = svcForm.features.split('\n').map(f => f.trim()).filter(Boolean);
      await api.addService({ ...svcForm, features }, token);
      setSvcForm({ title: '', description: '', price: '', image: '', features: '' });
      setShowSvcF(false);
      await refreshData();
      showToast('Послугу додано');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdateService = async (e, id) => {
    e.preventDefault();
    try {
      const features = editSvcForm.features.split('\n').map(f => f.trim()).filter(Boolean);
      await api.updateService(id, { ...editSvcForm, features }, token);
      setEditSvcId(null);
      await refreshData();
      showToast('Послугу оновлено');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Видалити цю послугу?')) return;
    try {
      await api.deleteService(id, token);
      await refreshData();
      showToast('Послугу видалено');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleSrStatus = async (id, status) => {
    try {
      await api.updateServiceRequestStatus(id, status, token);
      await refreshData();
      showToast('Статус оновлено');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleSaveSrNote = async (id) => {
    try {
      await api.updateServiceRequestNote(id, srNoteValue, token);
      await refreshData();
      setEditSrNote(null);
      showToast('Нотатку збережено');
    } catch (err) { showToast(err.message, 'error'); }
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
      let url = logoInput;
      if (logoMode === 'file') {
        if (!logoFile) { showToast('Оберіть файл логотипу', 'error'); return; }
        url = await api.uploadFile(logoFile, token);
      }
      await api.setLogo(url, token);
      setLogoInput('');
      setLogoFile(null);
      setLogoFilePreview('');
      setLogoMode('url');
      await refreshData();
      showToast('Логотип оновлено');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleSaveSiteContent = async (e) => {
    e.preventDefault();
    setScSaving(true);
    try {
      await api.updateSiteContent(scForm, token);
      setSiteContent(scForm);
      showToast('Контент сайту збережено');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setScSaving(false); }
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
        { id: 'dashboard', label: 'Огляд',    icon: Icon.grid },
        { id: 'requests',  label: 'Заявки',   icon: Icon.list },
        { id: 'services',  label: 'Послуги',  icon: Icon.briefcase },
        { id: 'news',      label: 'Новини',   icon: Icon.news  },
        { id: 'gallery',   label: 'Галерея',  icon: Icon.image },
        { id: 'tariffs',   label: 'Тарифи',   icon: Icon.tag   },
        { id: 'emergency', label: 'Аварійна',   icon: Icon.phone },
        { id: 'documents', label: 'Документи', icon: Icon.file  },
        ...(user.role === 'superadmin' ? [
          { id: 'sections', label: 'Розділи',       icon: Icon.layout   },
          { id: 'users',    label: 'Користувачі',  icon: Icon.users    },
          { id: 'settings', label: 'Налаштування', icon: Icon.settings },
        ] : []),
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

  /* ════════════════ SERVICES ════════════════ */
  const filteredSr = srFilter === 'all' ? serviceReqs : serviceReqs.filter(r => r.status === srFilter);

  const renderServices = () => (
    <div style={{ display: 'grid', gap: '1.25rem' }}>

      {/* Sub-tabs */}
      <div className="filter-tabs">
        <button className={`filter-tab ${serviceTab === 'catalog' ? 'active' : ''}`} onClick={() => setServiceTab('catalog')}>
          Каталог послуг ({services.length})
        </button>
        <button className={`filter-tab ${serviceTab === 'requests' ? 'active' : ''}`} onClick={() => setServiceTab('requests')}>
          Заявки ({serviceReqs.length})
          {serviceReqs.filter(r => r.status === 'Нова').length > 0 && (
            <span style={{ marginLeft: '0.35rem', opacity: 0.7 }}>
              ({serviceReqs.filter(r => r.status === 'Нова').length} нових)
            </span>
          )}
        </button>
      </div>

      {/* ── CATALOG ── */}
      {serviceTab === 'catalog' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Список послуг</h3>
            {user.role === 'superadmin' && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowSvcF(p => !p)}>
                {Icon.plus} Додати послугу
              </button>
            )}
          </div>

          {showServiceForm && user.role === 'superadmin' && (
            <form className="admin-add-form" onSubmit={handleAddService}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="form-group">
                  <label className="form-label">Назва *</label>
                  <input className="form-input" value={svcForm.title} onChange={e => setSvcForm({ ...svcForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ціна</label>
                  <input className="form-input" value={svcForm.price} onChange={e => setSvcForm({ ...svcForm, price: e.target.value })} placeholder="від 500 грн/год" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Опис *</label>
                <RichEditor key="add-svc" value={svcForm.description} onChange={html => setSvcForm(p => ({ ...p, description: html }))} />
              </div>
              <div className="form-group">
                <label className="form-label">URL зображення</label>
                <input className="form-input" value={svcForm.image} onChange={e => setSvcForm({ ...svcForm, image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">Переваги (кожна з нового рядка)</label>
                <textarea className="form-textarea" style={{ minHeight: '90px' }} value={svcForm.features} onChange={e => setSvcForm({ ...svcForm, features: e.target.value })} placeholder={"Висота до 18 м\nОператор у вартості\nВиїзд по місту"} />
              </div>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button className="btn btn-primary btn-sm" type="submit">Зберегти</button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowSvcF(false)}>Скасувати</button>
              </div>
            </form>
          )}

          {services.length === 0 ? (
            <div className="empty-state">{Icon.briefcase}<p>Послуг ще немає</p></div>
          ) : (
            <div className="service-admin-list">
              {services.map(s => (
                <div key={s.id}>
                  {editSvcId === s.id ? (
                    <form className="admin-add-form" style={{ borderTop: '1px solid var(--slate-100)', padding: '1.25rem 1.5rem' }} onSubmit={e => handleUpdateService(e, s.id)}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                        <div className="form-group">
                          <label className="form-label">Назва *</label>
                          <input className="form-input" value={editSvcForm.title} onChange={e => setEditSvcForm({ ...editSvcForm, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Ціна</label>
                          <input className="form-input" value={editSvcForm.price} onChange={e => setEditSvcForm({ ...editSvcForm, price: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Опис *</label>
                        <RichEditor key={`edit-${s.id}`} value={editSvcForm.description} onChange={html => setEditSvcForm(p => ({ ...p, description: html }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">URL зображення</label>
                        <input className="form-input" value={editSvcForm.image} onChange={e => setEditSvcForm({ ...editSvcForm, image: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Переваги (кожна з нового рядка)</label>
                        <textarea className="form-textarea" style={{ minHeight: '90px' }} value={editSvcForm.features} onChange={e => setEditSvcForm({ ...editSvcForm, features: e.target.value })} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.625rem' }}>
                        <button className="btn btn-primary btn-sm" type="submit">Зберегти</button>
                        <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditSvcId(null)}>Скасувати</button>
                      </div>
                    </form>
                  ) : (
                    <div className="service-admin-item">
                      {s.image
                        ? <img className="service-admin-thumb" src={s.image} alt={s.title} />
                        : <div className="service-admin-thumb" style={{ background: 'var(--blue-100)' }} />
                      }
                      <div className="service-admin-info">
                        <div className="service-admin-title">{s.title}</div>
                        <div className="service-admin-price">{s.price || '—'}</div>
                      </div>
                      {user.role === 'superadmin' && (
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditSvcId(s.id); setEditSvcForm({ ...s, features: s.features?.join('\n') || '' }); }} title="Редагувати">
                            {Icon.edit}
                          </button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteService(s.id)} title="Видалити">
                            {Icon.trash}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SERVICE REQUESTS ── */}
      {serviceTab === 'requests' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="filter-tabs">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <button key={key} className={`filter-tab ${srFilter === key ? 'active' : ''}`} onClick={() => setSrFilter(key)}>
                {label}
                {key !== 'all' && (
                  <span style={{ marginLeft: '0.35rem', opacity: 0.7 }}>
                    ({serviceReqs.filter(r => r.status === key).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h3>{filteredSr.length} заявок</h3>
            </div>
            {filteredSr.length === 0 ? (
              <div className="empty-state">{Icon.briefcase}<p>Заявок за цим фільтром немає</p></div>
            ) : (
              <div className="requests-list">
                {filteredSr.map(r => (
                  <div key={r.id} className="request-row">
                    <div className="request-row-info">
                      <div className="request-row-top">
                        <span className="request-name">{r.name}</span>
                        <span className="request-address">{r.address}</span>
                        <span className="request-phone">{r.phone}</span>
                      </div>
                      <div className="request-message">
                        <strong style={{ color: 'var(--blue-700)', marginRight: '0.5rem' }}>{r.serviceName}</strong>
                        {r.message}
                      </div>
                      {r.preferredDate && (
                        <div className="request-date">Бажана дата: {new Date(r.preferredDate).toLocaleDateString('uk-UA')}</div>
                      )}
                      {r.createdAt && <div className="request-date">{formatDate(r.createdAt)}</div>}
                    </div>
                    <div className="request-row-actions">
                      <span className={`status-tag ${STATUS_CSS[r.status]}`}>{r.status}</span>
                      {user.role !== 'worker' && (
                        <div className="request-action-buttons">
                          {r.status === 'Нова' && (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => handleSrStatus(r.id, 'Взята в роботу')}>{Icon.clock} В роботу</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleSrStatus(r.id, 'Відхиленна')}>{Icon.close} Відхилити</button>
                            </>
                          )}
                          {r.status === 'Взята в роботу' && (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => handleSrStatus(r.id, 'Виконанна')}>{Icon.check} Виконано</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleSrStatus(r.id, 'Відхиленна')}>{Icon.close} Відхилити</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="request-note-section">
                      {editingSrNote === r.id ? (
                        <>
                          <textarea className="request-note-textarea" value={srNoteValue} onChange={e => setSrNoteValue(e.target.value)} placeholder="Нотатка..." autoFocus rows={2} />
                          <div className="request-note-actions">
                            <button className="btn btn-sm btn-success" onClick={() => handleSaveSrNote(r.id)}>{Icon.check} Зберегти</button>
                            <button className="btn btn-sm btn-ghost" onClick={() => setEditSrNote(null)}>Скасувати</button>
                          </div>
                        </>
                      ) : (
                        <button className={`request-note-btn${r.note ? ' has-note' : ''}`} onClick={() => { setEditSrNote(r.id); setSrNoteValue(r.note || ''); }}>
                          {Icon.edit}<span>{r.note || 'Додати нотатку'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  /* ════════════════ SECTIONS ════════════════ */
  const SECTION_META = [
    { key: 'about',     label: 'Про нас',           desc: 'Інформація про підприємство' },
    { key: 'news',      label: 'Новини',             desc: 'Стрічка новин та оголошень' },
    { key: 'gallery',   label: 'Галерея',            desc: 'Фотогалерея' },
    { key: 'services',  label: 'Послуги',            desc: 'Перелік послуг' },
    { key: 'tariffs',   label: 'Тарифи',             desc: 'Таблиця тарифів' },
    { key: 'emergency', label: 'Аварійна',           desc: 'Контакти аварійних служб' },
    { key: 'documents', label: 'Документи',          desc: 'Нормативні документи' },
    { key: 'request',   label: 'Залишити заявку',    desc: 'Форма для заявок мешканців' },
  ];

  const handleSectionToggle = async (key, value) => {
    const next = { ...sections, [key]: value };
    setSections(next);
    try {
      await api.updateSections(next, token);
      showToast(value ? `«${SECTION_META.find(s => s.key === key)?.label}» увімкнено` : `«${SECTION_META.find(s => s.key === key)?.label}» приховано`);
    } catch (err) {
      setSections(sections);
      showToast(err.message, 'error');
    }
  };

  const renderSections = () => (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3>Розділи сайту</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', margin: '0.25rem 0 0' }}>
              Вимкнені розділи зникають з навігації для відвідувачів
            </p>
          </div>
        </div>
        <div className="section-flags-list">
          {SECTION_META.map(s => {
            const enabled = sections[s.key] !== false;
            return (
              <div key={s.key} className={`section-flag-row ${enabled ? 'enabled' : 'disabled'}`}>
                <div className="section-flag-info">
                  <span className="section-flag-label">{s.label}</span>
                  <span className="section-flag-desc">{s.desc}</span>
                </div>
                <button
                  className={`section-toggle ${enabled ? 'on' : 'off'}`}
                  onClick={() => handleSectionToggle(s.key, !enabled)}
                  aria-label={enabled ? 'Вимкнути' : 'Увімкнути'}
                >
                  <span className="section-toggle-knob" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ════════════════ TARIFFS ════════════════ */
  const handleAddTariff = async (e) => {
    e.preventDefault();
    try {
      await api.addTariff(tariffForm, token);
      setTariffForm({ category: '', name: '', price: '', unit: '' });
      setShowTariffF(false);
      await refreshData();
      showToast('Тариф додано');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdateTariff = async (e, id) => {
    e.preventDefault();
    try {
      await api.updateTariff(id, editTariffForm, token);
      setEditTariffId(null);
      await refreshData();
      showToast('Тариф оновлено');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteTariff = async (id) => {
    if (!window.confirm('Видалити цей тариф?')) return;
    try {
      await api.deleteTariff(id, token);
      await refreshData();
      showToast('Тариф видалено');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const renderTariffs = () => {
    const categories = [...new Set(tariffs.map(t => t.category || 'Інше'))];
    return (
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Тарифи ({tariffs.length})</h3>
            {user.role === 'superadmin' && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowTariffF(p => !p)}>
                {Icon.plus} Додати тариф
              </button>
            )}
          </div>

          {showTariffForm && user.role === 'superadmin' && (
            <form className="admin-add-form" onSubmit={handleAddTariff}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="form-group">
                  <label className="form-label">Категорія *</label>
                  <input className="form-input" value={tariffForm.category} onChange={e => setTariffForm(p => ({ ...p, category: e.target.value }))} placeholder="Водопостачання" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Назва послуги *</label>
                  <input className="form-input" value={tariffForm.name} onChange={e => setTariffForm(p => ({ ...p, name: e.target.value }))} placeholder="Холодна вода" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ціна (грн) *</label>
                  <input className="form-input" value={tariffForm.price} onChange={e => setTariffForm(p => ({ ...p, price: e.target.value }))} placeholder="42.50" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Одиниця *</label>
                  <input className="form-input" value={tariffForm.unit} onChange={e => setTariffForm(p => ({ ...p, unit: e.target.value }))} placeholder="м³" required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button className="btn btn-primary btn-sm" type="submit">Зберегти</button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowTariffF(false)}>Скасувати</button>
              </div>
            </form>
          )}

          {tariffs.length === 0 ? (
            <div className="empty-state">{Icon.tag}<p>Тарифів ще немає</p></div>
          ) : (
            categories.map(cat => (
              <div key={cat}>
                <div className="tariff-admin-category">{cat}</div>
                {tariffs.filter(t => (t.category || 'Інше') === cat).map(t => (
                  <div key={t.id}>
                    {editTariffId === t.id ? (
                      <form className="admin-add-form" style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--slate-100)' }} onSubmit={e => handleUpdateTariff(e, t.id)}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                          <div className="form-group">
                            <label className="form-label">Категорія</label>
                            <input className="form-input" value={editTariffForm.category} onChange={e => setEditTariffF(p => ({ ...p, category: e.target.value }))} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Назва</label>
                            <input className="form-input" value={editTariffForm.name} onChange={e => setEditTariffF(p => ({ ...p, name: e.target.value }))} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Ціна (грн)</label>
                            <input className="form-input" value={editTariffForm.price} onChange={e => setEditTariffF(p => ({ ...p, price: e.target.value }))} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Одиниця</label>
                            <input className="form-input" value={editTariffForm.unit} onChange={e => setEditTariffF(p => ({ ...p, unit: e.target.value }))} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.625rem' }}>
                          <button className="btn btn-primary btn-sm" type="submit">Зберегти</button>
                          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditTariffId(null)}>Скасувати</button>
                        </div>
                      </form>
                    ) : (
                      <div className="tariff-admin-row">
                        <span className="tariff-admin-name">{t.name}</span>
                        <span className="tariff-admin-price">{t.price} грн / {t.unit}</span>
                        {user.role === 'superadmin' && (
                          <div style={{ display: 'flex', gap: '0.375rem', marginLeft: 'auto' }}>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditTariffId(t.id); setEditTariffF({ ...t }); }}>{Icon.edit}</button>
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteTariff(t.id)}>{Icon.trash}</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  /* ════════════════ EMERGENCY CONTACTS ════════════════ */
  const handleAddEC = async (e) => {
    e.preventDefault();
    try {
      await api.addEmergencyContact(ecForm, token);
      setECForm({ name: '', phone: '', description: '', available: '' });
      setShowECForm(false);
      await refreshData();
      showToast('Контакт додано');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleUpdateEC = async (e, id) => {
    e.preventDefault();
    try {
      await api.updateEmergencyContact(id, editECForm, token);
      setEditECId(null);
      await refreshData();
      showToast('Контакт оновлено');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteEC = async (id) => {
    if (!window.confirm('Видалити цей контакт?')) return;
    try {
      await api.deleteEmergencyContact(id, token);
      await refreshData();
      showToast('Контакт видалено');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const renderEmergency = () => (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Аварійна ({emergencyContacts.length})</h3>
          {user.role === 'superadmin' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowECForm(p => !p)}>
              {Icon.plus} Додати контакт
            </button>
          )}
        </div>

        {showECForm && user.role === 'superadmin' && (
          <form className="admin-add-form" onSubmit={handleAddEC}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div className="form-group">
                <label className="form-label">Назва служби *</label>
                <input className="form-input" value={ecForm.name} onChange={e => setECForm(p => ({ ...p, name: e.target.value }))} placeholder="Аварійна служба" required />
              </div>
              <div className="form-group">
                <label className="form-label">Телефон *</label>
                <input className="form-input" value={ecForm.phone} onChange={e => setECForm(p => ({ ...p, phone: e.target.value }))} placeholder="+380 (352) 24-00-00" required />
              </div>
              <div className="form-group">
                <label className="form-label">Опис</label>
                <input className="form-input" value={ecForm.description} onChange={e => setECForm(p => ({ ...p, description: e.target.value }))} placeholder="Аварії сантехніки та електрики" />
              </div>
              <div className="form-group">
                <label className="form-label">Режим роботи</label>
                <input className="form-input" value={ecForm.available} onChange={e => setECForm(p => ({ ...p, available: e.target.value }))} placeholder="24/7" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn btn-primary btn-sm" type="submit">Зберегти</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowECForm(false)}>Скасувати</button>
            </div>
          </form>
        )}

        {emergencyContacts.length === 0 ? (
          <div className="empty-state">{Icon.phone}<p>Контактів ще немає</p></div>
        ) : (
          <div style={{ display: 'grid', gap: 0 }}>
            {emergencyContacts.map(c => (
              <div key={c.id}>
                {editECId === c.id ? (
                  <form className="admin-add-form" style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--slate-100)' }} onSubmit={e => handleUpdateEC(e, c.id)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                      <div className="form-group"><label className="form-label">Назва</label><input className="form-input" value={editECForm.name} onChange={e => setEditECFormV(p => ({ ...p, name: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Телефон</label><input className="form-input" value={editECForm.phone} onChange={e => setEditECFormV(p => ({ ...p, phone: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Опис</label><input className="form-input" value={editECForm.description} onChange={e => setEditECFormV(p => ({ ...p, description: e.target.value }))} /></div>
                      <div className="form-group"><label className="form-label">Режим роботи</label><input className="form-input" value={editECForm.available} onChange={e => setEditECFormV(p => ({ ...p, available: e.target.value }))} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.625rem' }}>
                      <button className="btn btn-primary btn-sm" type="submit">Зберегти</button>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditECId(null)}>Скасувати</button>
                    </div>
                  </form>
                ) : (
                  <div className="ec-admin-row">
                    <div className="ec-admin-info">
                      <span className="ec-admin-name">{c.name}</span>
                      <a className="ec-admin-phone" href={`tel:${c.phone}`}>{c.phone}</a>
                      {c.available && <span className="ec-admin-hours">{c.available}</span>}
                    </div>
                    {c.description && <span className="ec-admin-desc">{c.description}</span>}
                    {user.role === 'superadmin' && (
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditECId(c.id); setEditECFormV({ ...c }); }}>{Icon.edit}</button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteEC(c.id)}>{Icon.trash}</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════ DOCUMENTS ════════════════ */
  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docFile) { showToast('Оберіть файл', 'error'); return; }
    setDocUploading(true);
    try {
      await api.uploadDocument(docFile, docName || docFile.name, token);
      setDocFile(null);
      setDocName('');
      await refreshData();
      showToast('Документ завантажено');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setDocUploading(false); }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Видалити цей документ?')) return;
    try {
      await api.deleteDocument(id, token);
      await refreshData();
      showToast('Документ видалено');
    } catch (err) { showToast(err.message, 'error'); }
  };

  function formatDocSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  }

  const renderDocuments = () => (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Документи ({documents.length})</h3>
        </div>

        {user.role === 'superadmin' && (
          <form className="admin-add-form" onSubmit={handleUploadDoc}>
            <div className="form-group">
              <label className="form-label">Назва документу (необов'язково)</label>
              <input className="form-input" value={docName} onChange={e => setDocName(e.target.value)} placeholder="Договір управління 2026" />
            </div>
            <div className="form-group">
              <label className="form-label">Файл *</label>
              <label className={`file-drop-zone ${docFile ? 'has-file' : ''}`}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setDocFile(f); }}
              >
                <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) setDocFile(f); }} />
                {docFile
                  ? <><strong style={{ color: 'var(--blue-700)' }}>{docFile.name}</strong><small>{formatDocSize(docFile.size)}</small></>
                  : <>{Icon.upload}<p>Клікніть або перетягніть файл</p><small>PDF, DOC, DOCX, XLS, XLSX до 20 МБ</small></>
                }
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn btn-primary btn-sm" type="submit" disabled={docUploading}>
                {docUploading ? 'Завантаження...' : <>{Icon.upload} Завантажити</>}
              </button>
              {docFile && <button className="btn btn-ghost btn-sm" type="button" onClick={() => setDocFile(null)}>Скасувати</button>}
            </div>
          </form>
        )}

        {documents.length === 0 ? (
          <div className="empty-state">{Icon.file}<p>Документів ще немає</p></div>
        ) : (
          <div className="doc-admin-list">
            {documents.map(doc => (
              <div key={doc.id} className="doc-admin-item">
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-admin-link">
                  <div className="doc-admin-icon">{Icon.file}</div>
                  <div className="doc-admin-info">
                    <span className="doc-admin-name">{doc.name}</span>
                    <span className="doc-admin-meta">
                      {doc.originalName && doc.originalName !== doc.name && <span>{doc.originalName} · </span>}
                      {formatDocSize(doc.size)}
                    </span>
                  </div>
                </a>
                {user.role === 'superadmin' && (
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteDoc(doc.id)}>{Icon.trash}</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════ USERS ════════════════ */
  const renderUsers = () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
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
            {logoPreview && (
              <img className="logo-preview-img" src={logoPreview} alt="Поточний логотип" onError={(e) => { e.target.style.opacity = '0.3'; }} />
            )}
            <form className="logo-preview-form" onSubmit={handleSetLogo}>
              <div className="upload-mode-tabs">
                <button type="button" className={`upload-mode-tab ${logoMode === 'url' ? 'active' : ''}`} onClick={() => setLogoMode('url')}>URL-посилання</button>
                <button type="button" className={`upload-mode-tab ${logoMode === 'file' ? 'active' : ''}`} onClick={() => setLogoMode('file')}>З комп'ютера</button>
              </div>
              {logoMode === 'url' ? (
                <div className="form-group">
                  <input className="form-input" value={logoInput} onChange={(e) => setLogoInput(e.target.value)} placeholder="https://..." required />
                </div>
              ) : (
                <label
                  className={`file-drop-zone ${logoFile ? 'has-file' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f && f.type.startsWith('image/')) { setLogoFile(f); setLogoFilePreview(URL.createObjectURL(f)); }
                  }}
                >
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) { setLogoFile(f); setLogoFilePreview(URL.createObjectURL(f)); }
                  }} />
                  {logoFilePreview
                    ? <img className="file-drop-preview" src={logoFilePreview} alt="preview" />
                    : <>{Icon.upload}<p>Клікніть або перетягніть файл</p><small>PNG, JPG, SVG до 10 МБ</small></>
                  }
                </label>
              )}
              <button className="btn btn-primary btn-sm" type="submit" style={{ width: 'fit-content' }}>
                Оновити логотип
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* General Info */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Загальна інформація</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>Відображається скрізь на сайті</span>
        </div>
        <form className="admin-add-form" onSubmit={handleSaveSiteContent}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label">Назва підприємства</label>
              <input className="form-input" value={scForm.companyName || ''} onChange={e => setScForm(p => ({ ...p, companyName: e.target.value }))} placeholder='ПП "Наш Дім"' />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Хедер, футер, заголовок герою</span>
            </div>
            <div className="form-group">
              <label className="form-label">Рік заснування</label>
              <input className="form-input" value={scForm.founded || ''} onChange={e => setScForm(p => ({ ...p, founded: e.target.value }))} placeholder="2000" />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Бейдж на головній і сторінці «Про нас»</span>
            </div>
            <div className="form-group">
              <label className="form-label">Керівник</label>
              <input className="form-input" value={scForm.director || ''} onChange={e => setScForm(p => ({ ...p, director: e.target.value }))} placeholder="Дмитришин Анатолій Євгенович" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Опис у футері</label>
            <textarea className="form-textarea" style={{ minHeight: '70px' }} value={scForm.tagline || ''} onChange={e => setScForm(p => ({ ...p, tagline: e.target.value }))} placeholder="Коротке описання підприємства для футеру..." />
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={scSaving} style={{ width: 'fit-content' }}>
            {scSaving ? 'Збереження...' : 'Зберегти'}
          </button>
        </form>
      </div>

      {/* Contacts */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Контактні дані</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>Футер і сторінка «Про нас»</span>
        </div>
        <form className="admin-add-form" onSubmit={handleSaveSiteContent}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label">Адреса</label>
              <input className="form-input" value={scForm.address || ''} onChange={e => setScForm(p => ({ ...p, address: e.target.value }))} placeholder="вул. Клима Савури, 3, м. Тернопіль" />
            </div>
            <div className="form-group">
              <label className="form-label">Телефон</label>
              <input className="form-input" value={scForm.phone || ''} onChange={e => setScForm(p => ({ ...p, phone: e.target.value }))} placeholder="+380 (352) 24-34-75" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={scForm.email || ''} onChange={e => setScForm(p => ({ ...p, email: e.target.value }))} placeholder="info@nashdim-te.at.ua" />
            </div>
            <div className="form-group">
              <label className="form-label">Режим роботи</label>
              <input className="form-input" value={scForm.hours || ''} onChange={e => setScForm(p => ({ ...p, hours: e.target.value }))} placeholder="Пн–Чт: 8:00–17:15, Пт: 8:00–16:00" />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={scSaving} style={{ width: 'fit-content' }}>
            {scSaving ? 'Збереження...' : 'Зберегти'}
          </button>
        </form>
      </div>

      {/* About page */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Сторінка «Про нас»</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>Текст розділу «Про підприємство»</span>
        </div>
        <form className="admin-add-form" onSubmit={handleSaveSiteContent}>
          <div className="form-group">
            <label className="form-label">Перший абзац</label>
            <textarea className="form-textarea" style={{ minHeight: '100px' }} value={scForm.aboutText || ''} onChange={e => setScForm(p => ({ ...p, aboutText: e.target.value }))} placeholder="Головний опис підприємства..." />
          </div>
          <div className="form-group">
            <label className="form-label">Другий абзац</label>
            <textarea className="form-textarea" style={{ minHeight: '100px' }} value={scForm.aboutText2 || ''} onChange={e => setScForm(p => ({ ...p, aboutText2: e.target.value }))} placeholder="Додаткова інформація..." />
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={scSaving} style={{ width: 'fit-content' }}>
            {scSaving ? 'Збереження...' : 'Зберегти'}
          </button>
        </form>
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
          {activeSection === 'services'  && renderServices()}
          {activeSection === 'news'      && renderNews()}
          {activeSection === 'gallery'   && renderGallery()}
          {activeSection === 'sections'  && renderSections()}
          {activeSection === 'tariffs'   && renderTariffs()}
          {activeSection === 'emergency' && renderEmergency()}
          {activeSection === 'documents' && renderDocuments()}
          {activeSection === 'users'     && renderUsers()}
          {activeSection === 'settings'  && renderSettings()}
        </div>
      </div>

      {/* Toasts */}
      <div className="admin-toasts">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && Icon.check}
            {t.type === 'error'   && Icon.close}
            {t.type === 'socket'  && Icon.bell}
            <span>{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>{Icon.close}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;
