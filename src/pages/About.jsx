import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { sitePhones, telHref } from '../components/SiteLayout.jsx';
import { fmtDateShort, plural } from '../lib/buildings.js';

const PRINCIPLES = [
  ['megaphone', 'Прозорість', 'Графіки робіт, тарифи й оголошення — на сайті.'],
  ['zap', 'Оперативність', 'Реагуємо на заявки в найкоротші терміни.'],
  ['users', 'Команда', 'Кваліфіковані майстри з обслуговування і ремонту.'],
  ['check', 'Якість', 'Перевірені матеріали й технології.'],
];

// «ДП «Наш Дім-2»» і «ДП Наш дім 2» вважаємо однією назвою
const norm = (s = '') => s.toLowerCase().replace(/[«»"'\s-]/g, '');
const ext = (url = '') => url.split('.').pop().toUpperCase().slice(0, 4);

function About({ siteContent = {}, buildings = [], documents = [] }) {
  const { phone } = sitePhones(siteContent);
  const founded = siteContent.founded || '2000';
  const houses = buildings.length || siteContent.statHouses;
  const subs = (siteContent.subsidiaries || []).filter((s) => s.name);
  const countFor = (name) => buildings.filter((b) => b.dp && norm(b.dp) === norm(name)).length;
  const docs = [...documents].sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || '')).slice(0, 5);

  return (
    <>
      <Helmet>
        <title>Про підприємство — ПП «Наш Дім» Тернопіль</title>
        <meta name="description" content={`ПП «Наш Дім» — житлово-комунальне підприємство Тернополя з ${founded} року. Дочірні підприємства, документи, контакти.`} />
        <link rel="canonical" href="https://nash-dim.ink/about" />
      </Helmet>

      <h1 className="t-h1">Про підприємство</h1>
      <p className="t-lead" style={{ marginTop: 8 }}>Обслуговуємо житловий фонд Тернополя з {founded} року.</p>

      <div className="split" style={{ marginTop: 32 }}>
        <div className="split__main panel" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16, fontSize: 17, lineHeight: '28px', color: 'var(--ink-2)' }}>
          <p style={{ whiteSpace: 'pre-line' }}>{siteContent.aboutText || 'ПП «Наш Дім» — житлово-комунальне підприємство Тернополя. Забезпечуємо технічне обслуговування й управління житловим фондом, утримання будинків і прибудинкових територій.'}</p>
          {siteContent.aboutText2 && <p style={{ whiteSpace: 'pre-line' }}>{siteContent.aboutText2}</p>}
        </div>
        <div className="split__side panel">
          <div className="fact"><span className="muted">Засновано</span><span style={{ fontWeight: 600 }}>{founded} рік</span></div>
          {siteContent.director && <div className="fact"><span className="muted">Керівник</span><span style={{ fontWeight: 600, textAlign: 'right' }}>{siteContent.director}</span></div>}
          {houses && <div className="fact"><span className="muted">Будинків</span><span className="t-num" style={{ fontWeight: 600 }}>{houses}{buildings.length ? '' : '+'}</span></div>}
          {siteContent.statResidents && <div className="fact"><span className="muted">Мешканців</span><span className="t-num" style={{ fontWeight: 600 }}>{Number(siteContent.statResidents).toLocaleString('uk-UA')}+</span></div>}
        </div>
      </div>

      {subs.length > 0 && (
        <section className="sec">
          <h2 className="t-h2" style={{ marginBottom: 24 }}>Дочірні підприємства</h2>
          <div className="g2">
            {subs.map((s) => {
              const n = countFor(s.name);
              return (
                <div className="panel" key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span className="t-h3">{s.name}</span>
                    {n > 0 && <span className="nd-badge nd-badge--info">{n} {plural(n, ['будинок', 'будинки', 'будинків'])}</span>}
                  </div>
                  {s.address && <div className="ct ink-2"><Icon name="pin" />{s.address}</div>}
                  {s.phone && <div className="ct ink-2"><Icon name="phone" /><a href={telHref(s.phone)}>{s.phone}</a></div>}
                  <Link to="/tariffs" style={{ fontWeight: 600, textDecoration: 'none' }}>Будинки і тарифи →</Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="sec">
        <h2 className="t-h2" style={{ marginBottom: 24 }}>Наші принципи</h2>
        <div className="g4">
          {PRINCIPLES.map(([icon, title, text]) => (
            <div className="panel" key={title} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="nd-tile"><Icon name={icon} /></span>
              <p className="t-h3">{title}</p>
              <p className="ink-2">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sec">
        <div className="split">
          {docs.length > 0 && (
            <div className="split__main">
              <div className="sec-head" style={{ marginBottom: 24 }}>
                <h2 className="t-h2">Документи</h2>
                {documents.length > docs.length && <Link className="nd-btn nd-btn--ghost" to="/documents">Усі документи <Icon name="chevronRight" /></Link>}
              </div>
              <div className="card-box">
                {docs.map((d) => (
                  <a key={d.id} className="doc" href={d.url} target="_blank" rel="noopener noreferrer">
                    <span className="nd-tile"><Icon name="file" /></span>
                    <span style={{ flex: 1, fontWeight: 500, minWidth: 0, overflowWrap: 'anywhere' }}>{d.name}</span>
                    <span className="t-small">{ext(d.url)}{d.uploadedAt ? ` · ${fmtDateShort(d.uploadedAt)}` : ''}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="split__side" style={docs.length ? undefined : { maxWidth: 560 }}>
            <h2 className="t-h2">Контакти</h2>
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="ct"><span className="nd-tile"><Icon name="pin" /></span><div><p className="t-small">Адреса</p><p style={{ fontWeight: 600 }}>{siteContent.address || 'вул. Клима Савури, 3, Тернопіль'}</p></div></div>
              <div className="ct"><span className="nd-tile"><Icon name="phone" /></span><div><p className="t-small">Телефон</p><a className="t-num" style={{ fontWeight: 600, textDecoration: 'none' }} href={telHref(phone)}>{phone}</a></div></div>
              {siteContent.email && <div className="ct"><span className="nd-tile"><Icon name="mail" /></span><div><p className="t-small">Email</p><a style={{ fontWeight: 600, textDecoration: 'none' }} href={`mailto:${siteContent.email}`}>{siteContent.email}</a></div></div>}
              <div className="ct"><span className="nd-tile"><Icon name="clock" /></span><div><p className="t-small">Режим роботи</p><p style={{ fontWeight: 600 }}>{siteContent.hours || 'Пн–Чт 8:00–17:15, Пт 8:00–16:00'}</p></div></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
