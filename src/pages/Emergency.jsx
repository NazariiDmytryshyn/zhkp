import { Helmet } from 'react-helmet-async';
import Icon from '../components/Icon.jsx';
import { sitePhones, telHref } from '../components/SiteLayout.jsx';

const CITY = [['101', 'Пожежна'], ['102', 'Поліція'], ['103', 'Швидка'], ['104', 'Газова служба']];

function Emergency({ emergencyContacts = [], siteContent = {} }) {
  const { sos, sosHours } = sitePhones(siteContent);
  return (
    <>
      <Helmet>
        <title>Аварійна служба — ПП «Наш Дім» Тернопіль</title>
        <meta name="description" content="Телефони аварійних служб ПП «Наш Дім» Тернопіль: сантехніка, електрика, газ." />
        <link rel="canonical" href="https://nash-dim.ink/emergency" />
      </Helmet>

      <h1 className="t-h1">Аварійна служба</h1>
      <p className="t-lead" style={{ marginTop: 8 }}>Затоплення, немає світла чи води, запах газу — телефонуйте одразу.</p>

      {sos && (
        <a className="nd-notice nd-notice--danger" href={telHref(sos)} style={{ marginTop: 24, alignItems: 'center' }}>
          <span className="nd-notice__ico"><Icon name="phone" /></span>
          <div className="nd-notice__body">
            <p className="nd-notice__title">Аварійна служба</p>
            <p className="sos-card__phone" style={{ color: 'var(--danger-ink)' }}>{sos}</p>
            {sosHours && (
              <p className="nd-notice__meta" style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                <Icon name="clock" size="sm" /> {sosHours}
              </p>
            )}
          </div>
          <span className="nd-btn nd-btn--danger nd-btn--sm">Подзвонити</span>
        </a>
      )}

      {emergencyContacts.length > 0 && (
        <div className="g2" style={{ marginTop: 24 }}>
          {emergencyContacts.map((c) => (
            <div className="panel sos-card" key={c.id}>
              <span className="nd-tile" style={{ width: 44, height: 44 }}><Icon name="phone" /></span>
              <div style={{ minWidth: 0 }}>
                <p className="t-h3">{c.name}</p>
                <a className="sos-card__phone" href={telHref(c.phone)}>{c.phone}</a>
                {c.description && <p className="ink-2" style={{ marginTop: 4 }}>{c.description}</p>}
                {c.available && <p className="t-small" style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}><Icon name="clock" size="sm" />{c.available}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="sec">
        <h2 className="t-h2" style={{ marginBottom: 16 }}>Якщо є загроза життю</h2>
        <div className="g4">
          {CITY.map(([n, label]) => (
            <a key={n} className="panel" href={`tel:${n}`} style={{ textDecoration: 'none', color: 'var(--ink)' }}>
              <p className="t-num" style={{ font: '800 32px/36px var(--font-display)', color: 'var(--danger)' }}>{n}</p>
              <p className="ink-2" style={{ marginTop: 4 }}>{label}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

export default Emergency;
