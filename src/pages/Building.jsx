import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { setMyBuilding, useMyBuildingId, readStored, writeStored } from '../lib/myBuilding.js';
import {
  compareBuildings, currentPeriod, fmtDateLong, fmtDateShort, fmtDelta, fmtMoney, fmtRate, fullAddr, nextPeriod,
  partDelta, plural, rateOf, shortAddr, tariffHistory, todayISO,
} from '../lib/buildings.js';
import { activeOutages, appliesTo, outageWhen, outageState } from '../lib/news.js';
import { sitePhones, telHref } from '../components/SiteLayout.jsx';

const AREA_KEY = 'nd_area';
const fileExt = (name = '') => name.split('.').pop().toUpperCase().slice(0, 4);
const fmtSize = (bytes) => (!bytes ? '' : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} КБ` : `${(bytes / (1024 * 1024)).toFixed(1)} МБ`);

function Building({ buildings, news, siteContent, loaded }) {
  const { id } = useParams();
  const b = buildings.find((x) => String(x.id) === id);
  const myId = useMyBuildingId();
  const [tab, setTab] = useState('now');
  const [area, setArea] = useState(() => readStored(AREA_KEY, '54'));
  const today = todayISO();
  const { phone } = sitePhones(siteContent);

  useEffect(() => { setTab('now'); }, [id]);
  useEffect(() => { writeStored(AREA_KEY, area); }, [area]);

  const cur = b ? currentPeriod(b, today) : null;
  const nxt = b ? nextPeriod(b, today) : null;
  const history = useMemo(() => (b ? tariffHistory(b) : []), [b]);
  const outages = useMemo(() => (b ? activeOutages(news).filter((n) => appliesTo(n, b.id)) : []), [news, b]);
  const reports = useMemo(() => [...(b?.reports || [])].sort((x, y) => (y.year || 0) - (x.year || 0) || y.uploadedAt.localeCompare(x.uploadedAt)), [b]);
  const neighbours = useMemo(() => (b
    ? buildings.filter((x) => x.street === b.street && x.id !== b.id).sort(compareBuildings).slice(0, 5)
    : []), [buildings, b]);

  if (!b) {
    if (!loaded) return null;
    return (
      <div className="panel empty">
        <p>Будинок не знайдено</p>
        <p className="t-small" style={{ margin: '4px 0 16px' }}>Можливо, адресу змінено. Знайдіть свій будинок у списку.</p>
        <Link className="nd-btn nd-btn--primary nd-btn--sm" to="/tariffs">До списку будинків</Link>
      </div>
    );
  }

  // Немає діючого тарифу, але є майбутній — показуємо майбутній
  const period = (tab === 'next' || !cur) && nxt ? nxt : cur;
  const shownTab = tab === 'hist' || tab === 'reports' ? tab : period === nxt ? 'next' : 'now';
  const rate = period ? rateOf(period) : 0;
  const areaNum = parseFloat(String(area).replace(',', '.')) || 0;
  const total = rate * areaNum;
  const isMine = myId === b.id;
  const nextDelta = cur && nxt ? rateOf(nxt) - rateOf(cur) : null;

  // На телефоні відключення показуємо над тарифом, на комп'ютері — збоку
  const outageNotices = outages.map((n) => (
    <Link key={n.id} to={`/news/${n.id}`} className={`nd-notice ${n.severity === 'emergency' ? 'nd-notice--danger' : 'nd-notice--warning'}`}>
      <span className="nd-notice__ico"><Icon name={n.severity === 'emergency' ? 'alert' : 'clock'} /></span>
      <div className="nd-notice__body">
        <p className="nd-notice__title">{n.title}</p>
        <p className="nd-notice__meta">{outageState(n) === 'now' ? 'Зараз · ' : ''}{outageWhen(n)}</p>
      </div>
    </Link>
  ));

  const tabs = [
    ...(cur ? [['now', 'Діючий', null]] : []),
    ...(nxt ? [['next', `З ${fmtDateShort(nxt.from)}`, fmtDelta(nextDelta)]] : []),
    ...(history.length ? [['hist', 'Історія', null]] : []),
    ['reports', 'Звіти', { text: String(reports.length), cls: 'neutral' }],
  ];

  const reportsList = reports.length === 0 ? (
    <div className="panel empty" style={{ marginTop: 24 }}>
      <p>Звітів по будинку поки немає</p>
      <p className="t-small" style={{ marginTop: 4 }}>Щойно звіт буде готовий, він з'явиться тут.</p>
    </div>
  ) : (
    <div className="card-box" style={{ marginTop: 24 }}>
      {reports.map((r) => (
        <a key={r.id} className="doc" href={r.url} download={r.originalName} target="_blank" rel="noopener noreferrer">
          <span className="nd-tile"><Icon name="file" /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 600, overflowWrap: 'anywhere' }}>{r.title}</span>
            <span className="t-small">{[fileExt(r.originalName || r.url), fmtSize(r.size)].filter(Boolean).join(' · ')}</span>
          </span>
          <span className="nd-btn nd-btn--secondary nd-btn--sm"><Icon name="download" size="sm" /> Завантажити</span>
        </a>
      ))}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{`Тариф ${fullAddr(b)} — ПП «Наш Дім» Тернопіль`}</title>
        <meta name="description" content={`Ціна послуги з управління будинком ${fullAddr(b)}${cur ? `: ${fmtRate(rateOf(cur))} грн/м²` : ''}. Складові тарифу, розрахунок на квартиру, історія змін.`} />
        <link rel="canonical" href={`https://nash-dim.ink/tariffs/${b.id}`} />
      </Helmet>

      <nav className="crumbs" aria-label="Шлях"><Link to="/tariffs">Тарифи</Link><span>/</span><span>{fullAddr(b)}</span></nav>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 className="t-h1">{fullAddr(b)}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {b.dp && <span className="nd-badge nd-badge--info">{b.dp}</span>}
            {b.floors ? <span className="nd-badge nd-badge--neutral">{b.floors} {plural(b.floors, ['поверх', 'поверхи', 'поверхів'])}</span> : null}
            {b.flats ? <span className="nd-badge nd-badge--neutral">{b.flats} {plural(b.flats, ['квартира', 'квартири', 'квартир'])}</span> : null}
            {b.lifts ? <span className="nd-badge nd-badge--neutral">{b.lifts} {plural(b.lifts, ['ліфт', 'ліфти', 'ліфтів'])}</span> : null}
          </div>
        </div>
        <button type="button" className="nd-btn nd-btn--secondary nd-btn--sm nd-btn--mine no-print" aria-pressed={isMine}
          onClick={() => setMyBuilding(isMine ? null : b.id)}>
          <Icon name={isMine ? 'check' : 'home'} size="sm" /> {isMine ? 'Мій будинок' : 'Це мій будинок'}
        </button>
      </div>

      <div className="split" style={{ marginTop: 32 }}>
        <div className="split__main">
          {outages.length > 0 && <div className="only-sm" style={{ flexDirection: 'column', gap: 12, marginBottom: 24 }}>{outageNotices}</div>}
          {!cur && !nxt ? (
            <>
              <div className="panel empty"><p>Тариф для цього будинку ще не внесено</p><p className="t-small" style={{ marginTop: 4 }}>Уточніть у диспетчера: {phone}</p></div>
              {reports.length > 0 && <><h2 className="t-h2" style={{ marginTop: 32 }}>Звіти</h2>{reportsList}</>}
            </>
          ) : (
            <>
              <div className="sum3">
                <div>
                  <div className="t-label">Ціна послуги з управління</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}><span className="big-num">{fmtRate(rate)}</span><span className="ink-2">грн/м²</span></div>
                  <div className="t-small" style={{ marginTop: 4 }}>{period ? (period === nxt ? `з ${fmtDateLong(period.from)}` : `діє з ${fmtDateLong(period.from)}`) : ''}</div>
                </div>
                <div>
                  <label className="t-label" htmlFor="area" style={{ display: 'block' }}>Площа квартири</label>
                  <div className="nd-input" style={{ marginTop: 8, height: 48, maxWidth: 180 }}>
                    <input id="area" inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value.replace(/[^\d.,]/g, ''))}
                      style={{ font: '700 22px/28px var(--font-text)', fontVariantNumeric: 'tabular-nums' }} />
                    <span className="ink-2" style={{ fontWeight: 500 }}>м²</span>
                  </div>
                  <div className="t-small" style={{ marginTop: 4 }}>Загальна, з квитанції</div>
                </div>
                <div className="sum3__pay">
                  <div className="t-label" style={{ color: 'var(--brand)' }}>До сплати на місяць</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}><span className="big-num">{fmtMoney(total)}</span><span className="ink-2">грн</span></div>
                  <div className="t-small ink-2" style={{ marginTop: 4 }}>{area || 0} м² × {fmtRate(rate)} грн</div>
                </div>
              </div>

              {tabs.length > 1 && (
                <div className="tabs no-print" role="tablist" style={{ marginTop: 32 }}>
                  {tabs.map(([key, label, badge]) => (
                    <button key={key} type="button" role="tab" aria-selected={shownTab === key} onClick={() => setTab(key)}>
                      {label}
                      {badge && badge.text !== '—' && <span className={`nd-badge ${badge.cls.includes('down') ? 'nd-badge--success' : badge.cls.includes('up') ? 'nd-badge--warning' : shownTab === key && key === 'reports' ? 'nd-badge--info' : 'nd-badge--neutral'}`} style={{ height: 22 }}>{badge.text}</span>}
                    </button>
                  ))}
                </div>
              )}

              {shownTab === 'reports' && reportsList}

              {(shownTab === 'now' || shownTab === 'next') && period && (
                <>
                  <div className="card-box" style={{ marginTop: 24 }}>
                    <div className="tr-head">
                      <span className="t-label ink-2">Складова тарифу</span>
                      <span className="t-label ink-2 r">грн/м²</span>
                      <span className="t-label ink-2 r hide-m">Частка</span>
                      <span className="t-label ink-2 r hide-m">За {area || 0} м²</span>
                    </div>
                    {period.parts.map((p, i) => {
                      const d = period === nxt ? partDelta(cur, nxt, p.name) : null;
                      const dd = d !== null && Math.abs(d) >= 0.005 ? fmtDelta(d) : null;
                      return (
                        <div className="tr-row" key={`${p.name}-${i}`}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                            <span className="nd-tile" style={{ width: 32, height: 32 }}>{i + 1}</span>
                            <span style={{ minWidth: 0 }}>{p.name}</span>
                          </span>
                          <span className="t-num r" style={{ fontWeight: 600, display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'baseline' }}>
                            {dd && <span className={dd.cls}>{dd.text}</span>}{fmtRate(p.rate)}
                          </span>
                          <span className="hide-m t-num r muted">{rate ? `${Math.round((p.rate / rate) * 100)}%` : '—'}</span>
                          <span className="hide-m t-num r" style={{ fontWeight: 600 }}>{fmtMoney(p.rate * areaNum)} грн</span>
                        </div>
                      );
                    })}
                    <div className="tr-row tr-row--total">
                      <span>Разом</span>
                      <span className="t-num r">{fmtRate(rate)}</span>
                      <span className="hide-m t-num r muted">100%</span>
                      <span className="hide-m t-num r">{fmtMoney(total)} грн</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16 }}>
                    <span className="t-small">
                      {period === nxt ? 'Діятиме' : 'Діє'} з {fmtDateLong(period.from)}{period.decision ? ` · ${period.decision}` : ''}
                    </span>
                    <div className="no-print" style={{ display: 'flex', gap: 8 }}>
                      {period.decisionUrl && (
                        <a className="nd-btn nd-btn--secondary nd-btn--sm" href={period.decisionUrl} target="_blank" rel="noopener noreferrer"><Icon name="download" size="sm" /> Рішення, PDF</a>
                      )}
                      <button type="button" className="nd-btn nd-btn--secondary nd-btn--sm" onClick={() => window.print()}><Icon name="print" size="sm" /> Друк</button>
                    </div>
                  </div>
                </>
              )}

              {shownTab === 'hist' && (
                <div className="card-box" style={{ marginTop: 24 }}>
                  <div className="tr-head tr-hist">
                    <span className="t-label ink-2">Період</span>
                    <span className="t-label ink-2 r">грн/м²</span>
                    <span className="t-label ink-2 r hide-m">Зміна</span>
                    <span className="t-label ink-2 r hide-m">Рішення</span>
                  </div>
                  {history.map((h) => {
                    const d = fmtDelta(h.delta);
                    return (
                      <div className="tr-row tr-hist" key={h.id}>
                        <span style={{ fontWeight: 500 }}>{h.to ? `${fmtDateShort(h.from)} – ${fmtDateShort(h.to)}` : `з ${fmtDateShort(h.from)}`}</span>
                        <span className="t-num r" style={{ fontWeight: 600 }}>{fmtRate(h.rate)}</span>
                        <span className="t-num r hide-m"><span className={d.cls}>{d.text}</span></span>
                        <span className="r hide-m">{h.decisionUrl ? <a href={h.decisionUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500 }}>PDF</a> : <span className="muted">—</span>}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <aside className="split__side no-print">
          <div className="hide-sm" style={{ display: 'contents' }}>{outageNotices}</div>

          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="t-label">Обслуговує</div>
            <div style={{ fontWeight: 600, fontSize: 18, lineHeight: '26px' }}>{b.dp || siteContent.companyName || 'ПП «Наш Дім»'}</div>
            {b.master && <div className="info-row"><Icon name="user" />Майстер дільниці: {b.master}</div>}
            <div className="info-row"><Icon name="phone" /><a href={telHref(b.phone || phone)}>{b.phone || phone}</a></div>
            <Link className="nd-btn nd-btn--primary nd-btn--block" to={`/request?address=${encodeURIComponent(`${fullAddr(b)}, кв. `)}`} style={{ marginTop: 8 }}>Залишити заявку</Link>
          </div>

          {neighbours.length > 0 && (
            <div className="panel" style={{ padding: 8 }}>
              <div className="t-label" style={{ padding: '12px 12px 8px' }}>Сусідні будинки</div>
              {neighbours.map((x) => {
                const c = currentPeriod(x, today);
                return (
                  <Link key={x.id} className="side-link" to={`/tariffs/${x.id}`}>
                    <span style={{ fontWeight: 500 }}>{shortAddr(x)}</span>
                    {c && <span className="t-num" style={{ fontWeight: 600 }}>{fmtRate(rateOf(c))} <span className="muted" style={{ fontWeight: 400 }}>грн/м²</span></span>}
                  </Link>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

export default Building;
