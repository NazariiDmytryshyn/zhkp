import { Link } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Lightbox from '../components/Lightbox.jsx';

/* ─── Hooks ──────────────────────────────────────────────── */
function useInView() {
  const [inView, setInView] = useState(false);
  const obsRef = useRef(null);

  const ref = useCallback((node) => {
    if (obsRef.current) { obsRef.current.disconnect(); obsRef.current = null; }
    if (!node) return;
    obsRef.current = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obsRef.current?.disconnect(); } },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );
    obsRef.current.observe(node);
  }, []);

  return [ref, inView];
}

function useCounter(target, inView, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return val;
}

/* ─── Icons ──────────────────────────────────────────────── */
const Icon = {
  zap:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  bell:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  image:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  shield:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  clock:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  users:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  star:     <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  arrow:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  wrench:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
};

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ─── Animated counter ───────────────────────────────────── */
function StatCounter({ value, suffix = '', label, inView }) {
  const count = useCounter(value, inView);
  return (
    <div className="home-stat">
      <div className="home-stat-value">{count.toLocaleString('uk-UA')}{suffix}</div>
      <div className="home-stat-label">{label}</div>
    </div>
  );
}

/* ─── Home ───────────────────────────────────────────────── */
function Home({ news, gallery, siteContent = {} }) {
  const [lbIndex, setLbIndex] = useState(null);
  const galleryUrls = gallery.slice(0, 6).map(item => item.url);

  const [statsRef, statsInView] = useInView();
  const [featRef, featInView]   = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [newsRef, newsInView]   = useInView();
  const [gallRef, gallInView]   = useInView();
  const [ctaRef, ctaInView]     = useInView();

  return (
    <div className="home-wrap">
      <Helmet>
        <title>{siteContent.companyName || 'ПП «Наш Дім»'} Тернопіль — Управляюча компанія</title>
        <meta name="description" content="Приватне підприємство «Наш Дім» — управління та обслуговування житлового фонду міста Тернопіль з 2000 року. Подати заявку онлайн, новини, тарифи, аварійні контакти." />
        <link rel="canonical" href="https://nash-dim.ink/" />
      </Helmet>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <div className="home-hero-orb home-hero-orb-1" />
          <div className="home-hero-orb home-hero-orb-2" />
          <div className="home-hero-orb home-hero-orb-3" />
          <div className="home-hero-grid" />
        </div>
        <div className="home-hero-content">
          <span className="home-hero-eyebrow">{siteContent.companyName || 'ПП «Наш Дім»'} — Тернопіль</span>
          <h1 className="home-hero-title">
            Сучасний сервіс<br />
            <span className="home-hero-title-accent">для вашого будинку</span>
          </h1>
          <p className="home-hero-desc">
            Підтримка мешканців, оперативне реагування на заявки,<br className="home-hero-br" />
            актуальні новини та прозора інформація про роботи у вашому районі.
          </p>
          <div className="home-hero-actions">
            <Link to="/request" className="btn home-btn-primary">
              Залишити заявку {Icon.arrow}
            </Link>
            <Link to="/about" className="btn home-btn-ghost">
              Про підприємство
            </Link>
          </div>
          <div className="home-hero-badges">
            <span className="home-hero-badge">{Icon.check} З {siteContent.founded || '2000'} року</span>
            <span className="home-hero-badge">{Icon.check} 24/7 аварійна служба</span>
            <span className="home-hero-badge">{Icon.check} Понад 50 будинків</span>
          </div>
        </div>
        <div className="home-hero-img-wrap">
          <img
            className="home-hero-img"
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=80"
            alt="Сучасний будинок"
          />
          <div className="home-hero-img-card home-hero-img-card-1">
            <div className="home-hero-img-card-icon">{Icon.zap}</div>
            <div>
              <div className="home-hero-img-card-val">~2 год</div>
              <div className="home-hero-img-card-lbl">час реагування</div>
            </div>
          </div>
          <div className="home-hero-img-card home-hero-img-card-2">
            <div className="home-hero-img-card-icon">{Icon.star}</div>
            <div>
              <div className="home-hero-img-card-val">4.9 / 5</div>
              <div className="home-hero-img-card-lbl">оцінка мешканців</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="home-stats-wrap" ref={statsRef}>
        <div className="home-stats">
          <StatCounter value={parseInt(siteContent.statHouses   ) || 50}   suffix="+"  label="будинків під управлінням" inView={statsInView} />
          <StatCounter value={parseInt(siteContent.statResidents) || 5000} suffix="+"  label="мешканців обслуговуємо"   inView={statsInView} />
          <StatCounter value={siteContent.founded ? new Date().getFullYear() - parseInt(siteContent.founded) : 25} suffix="" label="років на ринку" inView={statsInView} />
          <StatCounter value={parseInt(siteContent.statSatisfied) || 98}   suffix="%"  label="задоволених мешканців"     inView={statsInView} />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="home-section" ref={featRef}>
        <div className={`home-section-header anim-up${featInView ? ' visible' : ''}`}>
          <p className="home-section-eyebrow">Переваги</p>
          <h2 className="home-section-title">Чому обирають нас</h2>
          <p className="home-section-sub">Ми не просто обслуговуємо будинки — ми піклуємось про комфорт кожного мешканця</p>
        </div>
        <div className="home-features-grid">
          {[
            { icon: Icon.zap,    color: 'blue',   title: 'Швидкі заявки',      delay: 0,   text: 'Оформляйте проблеми легко та зручно. Реагуємо першочергово і тримаємо вас в курсі.' },
            { icon: Icon.shield, color: 'green',  title: 'Надійність',          delay: 100, text: 'Досвідчена команда фахівців та перевірені підрядники. Якість гарантована.' },
            { icon: Icon.bell,   color: 'amber',  title: 'Актуальні новини',    delay: 200, text: 'Всі важливі оголошення, графіки відключень та оновлення у зручному форматі.' },
            { icon: Icon.clock,  color: 'purple', title: 'Аварійна служба',     delay: 0,   text: 'Цілодобова служба реагування на аварійні ситуації — сантехніка, електрика.' },
            { icon: Icon.users,  color: 'cyan',   title: 'Для мешканців',       delay: 100, text: 'Зручний онлайн-сервіс: заявки, новини та галерея завершених робіт.' },
            { icon: Icon.image,  color: 'amber',  title: 'Прозорість',          delay: 200, text: 'Галерея виконаних робіт та звіти — ви бачите результат кожного виклику.' },
          ].map((f, i) => (
            <article
              key={i}
              className={`home-feature-card anim-up${featInView ? ' visible' : ''}`}
              style={{ transitionDelay: `${f.delay}ms` }}
            >
              <div className={`home-feature-icon feature-icon ${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="home-section home-steps-section" ref={stepsRef}>
        <div className={`home-section-header anim-up${stepsInView ? ' visible' : ''}`}>
          <p className="home-section-eyebrow">Процес</p>
          <h2 className="home-section-title">Як це працює</h2>
          <p className="home-section-sub">Три прості кроки від проблеми до рішення</p>
        </div>
        <div className="home-steps">
          {[
            { n: '01', title: 'Залишаєте заявку',    text: 'Заповніть просту форму онлайн або зателефонуйте нам. Вкажіть адресу та опис проблеми.',      icon: Icon.wrench },
            { n: '02', title: 'Ми реагуємо',         text: 'Отримуємо заявку, призначаємо фахівця та повідомляємо вас про очікуваний час приїзду.',       icon: Icon.clock  },
            { n: '03', title: 'Проблему вирішено',   text: 'Фахівець усуває несправність. Ви отримуєте підтвердження та можете оцінити якість роботи.',   icon: Icon.check  },
          ].map((s, i) => (
            <div
              key={i}
              className={`home-step anim-up${stepsInView ? ' visible' : ''}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="home-step-num">{s.n}</div>
              <div className="home-step-icon">{s.icon}</div>
              <h3>{i === 0 ? <Link to="/request">{s.title}</Link> : s.title}</h3>
              <p>{s.text}</p>
              {i < 2 && <div className="home-step-arrow">{Icon.arrow}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── News ── */}
      {news.length > 0 && (
        <section className="home-section" ref={newsRef}>
          <div className={`home-section-header anim-up${newsInView ? ' visible' : ''}`}>
            <p className="home-section-eyebrow">Новини</p>
            <h2 className="home-section-title">Останні новини</h2>
          </div>
          <div className="home-news-grid">
            {news.slice(0, 3).map((item, i) => (
              <article
                key={item.id}
                className={`home-news-card anim-up${newsInView ? ' visible' : ''}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {item.image && (
                  <div className="home-news-img-wrap">
                    <img src={item.image} alt={item.title} />
                  </div>
                )}
                <div className="home-news-body">
                  {item.createdAt && <div className="home-news-date">{formatDate(item.createdAt)}</div>}
                  <h4>{item.title}</h4>
                  <p>{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="home-section-more">
            <Link to="/news" className="btn home-btn-outline">Всі новини {Icon.arrow}</Link>
          </div>
        </section>
      )}

      {/* ── Gallery ── */}
      {gallery.length > 0 && (
        <section className="home-section" ref={gallRef}>
          <div className={`home-section-header anim-up${gallInView ? ' visible' : ''}`}>
            <p className="home-section-eyebrow">Галерея</p>
            <h2 className="home-section-title">Наші роботи</h2>
          </div>
          <div className="home-gallery-grid">
            {gallery.slice(0, 6).map((item, i) => (
              <div
                key={item.id}
                className={`home-gallery-item anim-up${gallInView ? ' visible' : ''}`}
                style={{ transitionDelay: `${i * 60}ms`, cursor: 'pointer' }}
                onClick={() => setLbIndex(i)}
              >
                <img src={item.url} alt={`Фото ${item.id}`} />
              </div>
            ))}
          </div>
          <div className="home-section-more">
            <Link to="/gallery" className="btn home-btn-outline">Вся галерея {Icon.arrow}</Link>
          </div>
        </section>
      )}

      {lbIndex !== null && (
        <Lightbox images={galleryUrls} startIndex={lbIndex} onClose={() => setLbIndex(null)} />
      )}

      {/* ── CTA ── */}
      <section className="home-cta" ref={ctaRef}>
        <div className="home-cta-orb home-cta-orb-1" />
        <div className="home-cta-orb home-cta-orb-2" />
        <div className={`home-cta-content anim-up${ctaInView ? ' visible' : ''}`}>
          <h2>Маєте проблему в будинку?</h2>
          <p>Залиште заявку онлайн — наш фахівець зв'яжеться з вами найближчим часом</p>
          <Link to="/request" className="btn home-btn-primary">
            Залишити заявку {Icon.arrow}
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Home;
