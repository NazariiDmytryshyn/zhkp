import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Icon from '../components/Icon.jsx';
import AddressSearch from '../components/AddressSearch.jsx';
import NewsCard from '../components/NewsCard.jsx';
import { sitePhones, telHref } from '../components/SiteLayout.jsx';
import { useMyBuilding } from '../lib/myBuilding.js';
import { shortAddr } from '../lib/buildings.js';
import { fmtNewsDate, fmtToday, newsBadge } from '../lib/news.js';
import { fmtMonth } from './Gallery.jsx';

// Блок у героблоці: 3 найсвіжіші новини — дата, мітка категорії, заголовок і короткий опис
function LatestNews({ items }) {
  return (
    <div className="today">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span className="t-h3">Останні новини</span>
        <span className="t-small">{fmtToday()}</span>
      </div>
      {items.length === 0 ? (
        <p className="ink-2">Новин поки немає.</p>
      ) : (
        <div className="today__list">
          {items.map((n) => {
            const badge = newsBadge(n);
            return (
              <Link key={n.id} to={`/news/${n.id}`} className="today__item">
                <span className="news__meta">
                  <span className={badge.cls}>{badge.label}</span>
                  {n.createdAt && <span className="t-small">{fmtNewsDate(n.createdAt)}</span>}
                </span>
                <span className="today__title">{n.title}</span>
                {n.summary && <span className="today__sub">{n.summary}</span>}
              </Link>
            );
          })}
        </div>
      )}
      <Link to="/news" style={{ fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
        Усі новини <Icon name="arrowRight" size="sm" />
      </Link>
    </div>
  );
}

function Home({ news, gallery, siteContent = {}, buildings, sections }) {
  const mine = useMyBuilding(buildings);
  const { sos, sosHours } = sitePhones(siteContent);
  const founded = parseInt(siteContent.founded, 10) || 2000;
  const houses = buildings.length || parseInt(siteContent.statHouses, 10) || 50;
  const on = (k) => sections[k] !== false;
  const sortedNews = useMemo(() => [...news].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')), [news]);
  // Перші три — у героблоці, тож нижче показуємо наступні, щоб не повторюватись
  const moreNews = sortedNews.slice(3, 6);

  return (
    <>
      <Helmet>
        <title>{siteContent.companyName || 'ПП «Наш Дім»'} Тернопіль — обслуговування будинків</title>
        <meta name="description" content="ПП «Наш Дім» — управління та обслуговування житлового фонду Тернополя з 2000 року. Тариф вашого будинку, відключення, новини і заявки онлайн." />
        <link rel="canonical" href="https://nash-dim.ink/" />
      </Helmet>

      <section className="nd-hero">
        <div className="nd-hero__main">
          <span className="t-label" style={{ color: 'var(--on-navy-muted)' }}>{siteContent.companyName || 'ПП «Наш Дім»'} · Тернопіль, з {founded} року</span>
          <h1 className="t-display" style={{ color: '#ffffff' }}>
            {siteContent.heroTitle || 'Усе про ваш будинок'} <span className="nd-hero__accent">{siteContent.heroAccent || 'в одному місці'}</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: '28px', color: 'var(--on-navy-muted)', maxWidth: 560 }}>
            {siteContent.heroDesc || 'Введіть адресу — покажемо тариф, відключення і новини саме для вашого будинку.'}
          </p>
          {on('tariffs') && buildings.length > 0 && <AddressSearch buildings={buildings} />}
          {mine && (
            <Link to={`/tariffs/${mine.id}`} style={{ color: 'var(--brand-on-navy)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <Icon name="home" size="sm" /> Мій будинок: {shortAddr(mine)} <Icon name="arrowRight" size="sm" />
            </Link>
          )}
        </div>
        {on('news') && <LatestNews items={sortedNews.slice(0, 3)} />}
      </section>

      <div className="g4" style={{ marginTop: 24 }}>
        {on('request') && (
          <Link className="qa" to="/request">
            <span className="nd-tile"><Icon name="message" size="lg" /></span>
            <span className="t-h3">Залишити заявку</span>
            <span className="ink-2">Протікає, не працює, зламалось — опишіть онлайн</span>
          </Link>
        )}
        {on('tariffs') && (
          <Link className="qa" to={mine ? `/tariffs/${mine.id}` : '/tariffs'}>
            <span className="nd-tile"><Icon name="calc" size="lg" /></span>
            <span className="t-h3">Тарифи будинку</span>
            <span className="ink-2">Ціна за м² і розрахунок на вашу квартиру</span>
          </Link>
        )}
        {on('services') && (
          <Link className="qa" to="/services">
            <span className="nd-tile"><Icon name="wrench" size="lg" /></span>
            <span className="t-h3">Послуги і ціни</span>
            <span className="ink-2">Сантехніка, електрика, догляд за зеленими насадженнями</span>
          </Link>
        )}
        {sos && (
          <a className="qa qa--sos" href={telHref(sos)}>
            <span className="nd-tile"><Icon name="phone" size="lg" /></span>
            <span className="t-h3" style={{ color: 'var(--danger-ink)' }}>Аварійна служба</span>
            <span className="t-num" style={{ color: 'var(--danger-ink)', fontWeight: 600, fontSize: 18 }}>{sos}</span>
            {sosHours && <span className="t-small" style={{ color: 'var(--danger-ink)' }}>{sosHours}</span>}
          </a>
        )}
      </div>

      <div className="stats" style={{ marginTop: 24 }}>
        <div><div className="stats__val">{houses}{buildings.length ? '' : '+'}</div><div className="t-small" style={{ marginTop: 4 }}>будинків</div></div>
        <div><div className="stats__val">{(parseInt(siteContent.statResidents, 10) || 5000).toLocaleString('uk-UA')}+</div><div className="t-small" style={{ marginTop: 4 }}>мешканців</div></div>
        <div><div className="stats__val">{new Date().getFullYear() - founded}</div><div className="t-small" style={{ marginTop: 4 }}>років роботи</div></div>
        <div><div className="stats__val">{parseInt(siteContent.statSatisfied, 10) || 98}%</div><div className="t-small" style={{ marginTop: 4 }}>задоволених мешканців</div></div>
      </div>

      {on('news') && moreNews.length > 0 && (
        <section className="sec">
          <div className="sec-head">
            <h2 className="t-h2">Ще новини</h2>
            <Link className="nd-btn nd-btn--ghost" to="/news">Усі новини <Icon name="chevronRight" /></Link>
          </div>
          <div className="g3">{moreNews.map((n) => <NewsCard key={n.id} item={n} />)}</div>
        </section>
      )}

      <section className="sec">
        <h2 className="t-h2" style={{ marginBottom: 24 }}>Як працює заявка</h2>
        <div className="g3 panel" style={{ padding: 32 }}>
          {[
            ['Залишаєте заявку', 'Онлайн або телефоном: адреса і що сталося.'],
            ['Призначаємо майстра', 'Повідомимо, коли він прийде.'],
            ['Проблему вирішено', 'Майстер виконує роботу на місці.'],
          ].map(([t, d], i) => (
            <div className="step" key={t}><b>{i + 1}</b><div><p className="t-h3">{t}</p><p className="ink-2" style={{ marginTop: 4 }}>{d}</p></div></div>
          ))}
        </div>
      </section>

      {on('gallery') && gallery.length > 0 && (
        <section className="sec">
          <div className="sec-head">
            <h2 className="t-h2">Наші роботи</h2>
            <Link className="nd-btn nd-btn--ghost" to="/gallery">Уся галерея <Icon name="chevronRight" /></Link>
          </div>
          <div className="g4">
            {gallery.slice(0, 4).map((p) => (
              <Link key={p.id} to="/gallery" style={{ color: 'inherit', textDecoration: 'none' }}>
                <div className="ph-card__img"><img src={p.url} alt={p.title || 'Фото виконаних робіт'} loading="lazy" /></div>
                {p.title && <p style={{ fontWeight: 600, marginTop: 12 }}>{p.title}</p>}
                {(p.place || p.date) && <p className="t-small">{[p.place, fmtMonth(p.date)].filter(Boolean).join(' · ')}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {on('request') && (
        <section className="sec cta">
          <div>
            <h2 className="t-h2" style={{ color: '#ffffff' }}>Проблема в будинку?</h2>
            <p style={{ marginTop: 8, fontSize: 18, lineHeight: '28px', color: 'var(--brand-soft)' }}>Залиште заявку — майстер зв'яжеться з вами.</p>
          </div>
          <Link className="nd-btn nd-btn--white nd-btn--lg" to="/request">Залишити заявку</Link>
        </section>
      )}
    </>
  );
}

export default Home;
