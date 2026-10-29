import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import RequestForm from '../components/RequestForm.jsx';
import Icon from '../components/Icon.jsx';
import { sitePhones, telHref } from '../components/SiteLayout.jsx';
import { useMyBuilding } from '../lib/myBuilding.js';
import { fullAddr } from '../lib/buildings.js';

function Request({ onSubmit, buildings = [], siteContent = {}, loaded }) {
  const [params] = useSearchParams();
  const mine = useMyBuilding(buildings);
  const { sos, sosHours } = sitePhones(siteContent);
  const initialAddress = params.get('address') || (mine ? `${fullAddr(mine)}, кв. ` : '');

  return (
    <>
      <Helmet>
        <title>Залишити заявку — ПП «Наш Дім» Тернопіль</title>
        <meta name="description" content="Подайте заявку на обслуговування онлайн. ПП «Наш Дім» Тернопіль — швидке реагування на звернення мешканців." />
        <link rel="canonical" href="https://nash-dim.ink/request" />
      </Helmet>

      <h1 className="t-h1">Залишити заявку</h1>
      <p className="t-lead" style={{ marginTop: 8 }}>Протікає, не працює, зламалось — опишіть, і майстер зв'яжеться з вами.</p>

      <div className="split" style={{ marginTop: 32 }}>
        <div className="split__main panel" style={{ padding: 32, maxWidth: 720 }}>
          {/* key: після завантаження будинків підставляємо адресу «Мого будинку» */}
          <RequestForm key={loaded ? 'ready' : 'loading'} onSubmit={onSubmit} initialAddress={initialAddress} />
        </div>
        <aside className="split__side">
          {sos && (
            <div className="nd-notice nd-notice--danger">
              <span className="nd-notice__ico"><Icon name="phone" /></span>
              <div className="nd-notice__body">
                <p className="nd-notice__title">Аварія? Телефонуйте одразу</p>
                <p className="nd-notice__meta">Затоплення, запах газу, іскрить проводка — аварійна служба: <a href={telHref(sos)} style={{ color: 'inherit', fontWeight: 600 }}>{sos}</a></p>
                {sosHours && <p className="nd-notice__meta" style={{ marginTop: 4 }}>{sosHours}</p>}
              </div>
            </div>
          )}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p className="t-h3">Як працює заявка</p>
            {[
              ['Залишаєте заявку', 'Онлайн або телефоном: адреса і що сталося.'],
              ['Призначаємо майстра', 'Повідомимо, коли він прийде.'],
              ['Проблему вирішено', 'Майстер виконує роботу на місці.'],
            ].map(([t, d], i) => (
              <div className="step" key={t}><b>{i + 1}</b><div><p style={{ fontWeight: 600 }}>{t}</p><p className="ink-2" style={{ marginTop: 2 }}>{d}</p></div></div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}

export default Request;
