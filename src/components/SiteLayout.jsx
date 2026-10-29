import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useMyBuilding } from '../lib/myBuilding.js';
import { shortAddr } from '../lib/buildings.js';

const telHref = (phone = '') => `tel:${phone.replace(/[^\d+]/g, '')}`;

export function sitePhones(siteContent = {}) {
  const phone = siteContent.phone || '+380 (352) 24-34-75';
  return { phone, sos: siteContent.emergencyPhone || phone };
}

function navItems(sections, documents) {
  return [
    { to: '/news', label: 'Новини', on: sections.news !== false },
    { to: '/tariffs', label: 'Тарифи', on: sections.tariffs !== false },
    { to: '/services', label: 'Послуги', on: sections.services !== false },
    { to: '/gallery', label: 'Галерея', on: sections.gallery !== false },
    { to: '/about', label: 'Про нас', on: sections.about !== false },
    { to: '/documents', label: 'Документи', on: sections.documents !== false && documents.length > 0, footerOnly: true },
  ].filter((i) => i.on);
}

export function SiteHeader({ siteContent = {}, sections = {}, documents = [], buildings = [] }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mine = useMyBuilding(buildings);
  const { sos } = sitePhones(siteContent);
  const items = navItems(sections, documents).filter((i) => !i.footerOnly);
  const name = siteContent.companyName || 'Наш Дім';

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const current = (to) => (location.pathname === to || location.pathname.startsWith(`${to}/`) ? 'page' : undefined);
  const link = (i) => <Link key={i.to} to={i.to} aria-current={current(i.to)}>{i.label}</Link>;

  return (
    <>
      <div className="nd-topbar">
        <div className="nd-topbar__in wrap">
          <Link className="nd-topbar__sos" to="/emergency">
            <Icon name="phone" size="sm" /> Аварійна 24/7: {sos}
          </Link>
          <span>{siteContent.hours || 'Пн–Чт 8:00–17:15, Пт 8:00–16:00'}</span>
          <span className="nd-topbar__addr">{siteContent.address || 'вул. Клима Савури, 3'}</span>
        </div>
      </div>
      <header className="nd-header">
        <div className="nd-header__in wrap">
          <Link className="nd-logo" to="/">
            <span className="nd-logo__mark"><Icon name="home" size="lg" /></span>
            <span>
              <span className="nd-logo__name">{name.replace(/^ПП\s*/, '').replace(/[«»"]/g, '')}</span>
              <span className="nd-logo__sub">{siteContent.tagline || 'Онлайн-сервіс для мешканців'}</span>
            </span>
          </Link>
          <nav className="nd-nav" aria-label="Головне меню">{items.map(link)}</nav>
          <div className="nd-header__acts">
            {sections.tariffs !== false && (mine ? (
              <span className="nd-building">
                <Link to={`/tariffs/${mine.id}`} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="home" size="sm" /> {shortAddr(mine)}
                </Link>
                <button type="button" onClick={() => navigate('/tariffs')}>Змінити</button>
              </span>
            ) : (
              <Link className="nd-btn nd-btn--secondary nd-btn--sm" to="/tariffs">
                <Icon name="pin" size="sm" /> Оберіть будинок
              </Link>
            ))}
            {sections.request !== false && (
              <Link className="nd-btn nd-btn--primary nd-btn--sm" to="/request">Залишити заявку</Link>
            )}
          </div>
          <button type="button" className="nd-burger" aria-label={open ? 'Закрити меню' : 'Відкрити меню'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <Icon name={open ? 'close' : 'menu'} size="lg" />
          </button>
        </div>
        <nav className="nd-mnav" hidden={!open} aria-label="Мобільне меню">
          <Link to="/" aria-current={location.pathname === '/' ? 'page' : undefined}>Головна</Link>
          {items.map(link)}
          {mine && <Link to={`/tariffs/${mine.id}`}>Мій будинок: {shortAddr(mine)}</Link>}
          {sections.request !== false && <Link className="nd-btn nd-btn--primary" to="/request">Залишити заявку</Link>}
        </nav>
      </header>
    </>
  );
}

export function SiteFooter({ siteContent = {}, sections = {}, documents = [] }) {
  const { phone, sos } = sitePhones(siteContent);
  const company = siteContent.companyName || 'ПП «Наш Дім»';
  const on = (k) => sections[k] !== false;
  return (
    <footer className="nd-footer">
      <div className="wrap">
        <div className="nd-footer__grid">
          <div>
            <div className="nd-footer__brand"><span className="nd-logo__mark"><Icon name="home" /></span>{company}</div>
            <p style={{ marginTop: 16, maxWidth: 360 }}>
              {siteContent.footerText || `Управління та обслуговування житлового фонду Тернополя з ${siteContent.founded || '2000'} року.`}
            </p>
          </div>
          <div>
            <div className="nd-footer__h">Мешканцям</div>
            <ul>
              {on('tariffs') && <li><Link to="/tariffs">Тарифи</Link></li>}
              {on('services') && <li><Link to="/services">Послуги</Link></li>}
              {on('news') && <li><Link to="/news">Новини</Link></li>}
              {on('emergency') && <li><Link to="/emergency">Аварійна служба</Link></li>}
              {on('request') && <li><Link to="/request">Залишити заявку</Link></li>}
            </ul>
          </div>
          <div>
            <div className="nd-footer__h">Підприємство</div>
            <ul>
              {on('about') && <li><Link to="/about">Про нас</Link></li>}
              {on('gallery') && <li><Link to="/gallery">Галерея</Link></li>}
              {on('documents') && documents.length > 0 && <li><Link to="/documents">Документи</Link></li>}
            </ul>
          </div>
          <div>
            <div className="nd-footer__h">Контакти</div>
            <ul>
              <li className="sos"><a href={telHref(sos)}>Аварійна 24/7: {sos}</a></li>
              {phone !== sos && <li><a href={telHref(phone)}>{phone}</a></li>}
              <li>{siteContent.address || 'вул. Клима Савури, 3, Тернопіль'}</li>
              {siteContent.email && <li><a href={`mailto:${siteContent.email}`}>{siteContent.email}</a></li>}
              <li>{siteContent.hours || 'Пн–Чт 8:00–17:15, Пт 8:00–16:00'}</li>
            </ul>
          </div>
        </div>
        <div className="nd-footer__base">
          <span>© {new Date().getFullYear()} {company}</span>
        </div>
      </div>
    </footer>
  );
}

export { telHref };
