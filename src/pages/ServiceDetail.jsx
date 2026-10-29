import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import ServiceOrderModal from '../components/ServiceOrderModal.jsx';
import { sitePhones, telHref } from '../components/SiteLayout.jsx';
import { priceUnit, serviceCat } from '../serviceCategories.js';
import { serviceSummary } from './Services.jsx';
import { useMyBuilding } from '../lib/myBuilding.js';
import { fullAddr } from '../lib/buildings.js';

// «Безпека. Техніка проходить ТО» → жирний перший вислів + решта
function Feature({ text }) {
  const m = text.match(/^(.{2,60}?[.:])\s+(.+)$/);
  return (
    <div className="chk">
      <Icon name="check" />
      <span>{m ? <><b style={{ fontWeight: 600 }}>{m[1]}</b> {m[2]}</> : text}</span>
    </div>
  );
}

function ServiceDetail({ services, siteContent, buildings, loaded }) {
  const { id } = useParams();
  const s = services.find((x) => String(x.id) === id);
  const [ordering, setOrdering] = useState(false);
  const mine = useMyBuilding(buildings);
  // Для послуг — окремий номер з налаштувань («Телефон для замовлення послуг»)
  const { servicesPhone: phone } = sitePhones(siteContent);

  if (!s) {
    if (!loaded) return null;
    return (
      <div className="panel empty">
        <p>Послугу не знайдено</p>
        <p className="t-small" style={{ margin: '4px 0 16px' }}>Можливо, її прибрали з каталогу.</p>
        <Link className="nd-btn nd-btn--primary nd-btn--sm" to="/services">Усі послуги</Link>
      </div>
    );
  }

  const c = serviceCat(s);
  const uses = s.uses || [];
  const features = s.features || [];
  const specs = s.specs || [];
  // Схожі: спершу з того ж розділу прайсу, потім з категорії
  const sameCat = services.filter((x) => x.id !== s.id && serviceCat(x).key === c.key);
  const similar = [...sameCat.filter((x) => s.group && x.group === s.group), ...sameCat.filter((x) => !s.group || x.group !== s.group)].slice(0, 5);
  const summary = serviceSummary(s);

  return (
    <>
      <Helmet>
        <title>{`${s.title} — послуги ПП «Наш Дім» Тернопіль`}</title>
        <meta name="description" content={summary.slice(0, 160)} />
        <link rel="canonical" href={`https://nash-dim.ink/services/${s.id}`} />
      </Helmet>

      <nav className="crumbs" aria-label="Шлях">
        <Link to="/services">Послуги</Link><span>/</span>
        <Link to={`/services?category=${c.key}`}>{c.label}</Link><span>/</span>
        {s.group && <><span>{s.group}</span><span>/</span></>}
        <span>{s.title}</span>
      </nav>

      <div className="split">
        <div className="split__main" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div>
            <h1 className="t-h1" style={{ overflowWrap: 'anywhere' }}>{s.title}</h1>
            {s.summary && <p className="t-lead" style={{ marginTop: 8, maxWidth: 720 }}>{s.summary}</p>}
          </div>

          {s.image && <img className="svc-hero-img" src={s.image} alt={s.title} onError={(e) => { e.currentTarget.style.display = 'none'; }} />}

          {s.description && <div className="prose" dangerouslySetInnerHTML={{ __html: s.description }} />}

          {uses.length > 0 && (
            <section>
              <h2 className="t-h2" style={{ marginBottom: 16 }}>Для яких робіт</h2>
              <div className="g2" style={{ gap: 12 }}>
                {uses.map((u, i) => (
                  <div className="use" key={i}>
                    <span className="nd-tile"><Icon name={c.icon} /></span>
                    <div>
                      <p style={{ fontWeight: 600 }}>{u.title}</p>
                      {u.text && <p className="ink-2" style={{ fontSize: 15, lineHeight: '22px', marginTop: 2 }}>{u.text}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {features.length > 0 && (
            <section>
              <h2 className="t-h2" style={{ marginBottom: 16 }}>Чому з нами</h2>
              <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {features.map((f, i) => <Feature key={i} text={f} />)}
              </div>
            </section>
          )}
        </div>

        <aside className="split__side">
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 16, boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
              <span className="t-num" style={{ font: '700 32px/38px var(--font-display)' }}>{s.price || 'Ціна за домовленістю'}</span>
              {priceUnit(s) && <span className="ink-2" style={{ fontSize: 18 }}>/ {priceUnit(s)}</span>}
            </div>
            {!s.description && !s.summary && <p className="t-small">Остаточну вартість майстер підтверджує на місці.</p>}
            {specs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, lineHeight: '22px', color: 'var(--ink-2)' }}>
                {specs.map((sp, i) => <div className="spec" key={i}><span>{sp.label}</span><span>{sp.value}</span></div>)}
              </div>
            )}
            <button type="button" className="nd-btn nd-btn--primary nd-btn--block" onClick={() => setOrdering(true)}>Замовити послугу</button>
            {phone && <a className="nd-btn nd-btn--secondary nd-btn--block" href={telHref(phone)}><Icon name="phone" /> {phone}</a>}
          </div>

          {similar.length > 0 && (
            <div className="panel" style={{ padding: 8 }}>
              <div className="t-label" style={{ padding: '12px 12px 8px' }}>Схожі послуги</div>
              {similar.map((x) => (
                <Link key={x.id} className="side-link" to={`/services/${x.id}`}>
                  <span style={{ fontWeight: 500 }}>{x.title}</span>
                  {x.price && <span className="t-num" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{x.price}</span>}
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>

      {ordering && <ServiceOrderModal service={s} onClose={() => setOrdering(false)} initialAddress={mine ? `${fullAddr(mine)}, кв. ` : ''} />}
    </>
  );
}

export default ServiceDetail;
