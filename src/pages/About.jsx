import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';

const values = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    color: "blue",
    title: "Прозорість",
    text: "Усі важливі оголошення та графіки робіт публікуються на сайті. Ви завжди знаєте, що відбувається у вашому дворі.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    color: "amber",
    title: "Оперативність",
    text: "Реагуємо на заявки в найкоротші терміни. Наша команда готова виїхати та вирішити вашу проблему швидко.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "green",
    title: "Команда",
    text: "У нас працюють кваліфіковані спеціалісти з технічного обслуговування, ремонту та благоустрою.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    color: "purple",
    title: "Якість",
    text: "Використовуємо якісні матеріали та перевірені технології. Результат нашої роботи — ваш комфорт.",
  },
];

const services = [
  {
    color: "blue",
    label: "Технічне обслуговування",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    color: "cyan",
    label: "Водопостачання",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    color: "amber",
    label: "Електрика",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    color: "green",
    label: "Прибирання та благоустрій",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    color: "purple",
    label: "Ремонт фасадів",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18" />
      </svg>
    ),
  },
  {
    color: "blue",
    label: "Каналізація",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

const defaultContacts = [
  {
    color: "blue",
    label: "Адреса",
    value: "вул. Клима Савури, 3, м. Тернопіль, 46022",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    color: "green",
    label: "Телефон",
    value: "+380 (352) 24-34-75",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.64 13.5 19.79 19.79 0 0 1 1.57 4.83a2 2 0 0 1 1.97-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z" />
      </svg>
    ),
  },
  {
    color: "amber",
    label: "Email",
    value: "info@nashdim-te.at.ua",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    color: "purple",
    label: "Режим роботи",
    value: "Пн–Чт: 8:00–17:15, Пт: 8:00–16:00",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

function About({ siteContent = {} }) {
  const contacts = [
    {
      color: "blue",
      label: "Адреса",
      value: siteContent.address || defaultContacts[0].value,
      icon: defaultContacts[0].icon,
    },
    {
      color: "green",
      label: "Телефон",
      value: siteContent.phone || defaultContacts[1].value,
      icon: defaultContacts[1].icon,
    },
    {
      color: "amber",
      label: "Email",
      value: siteContent.email || defaultContacts[2].value,
      icon: defaultContacts[2].icon,
    },
    {
      color: "purple",
      label: "Режим роботи",
      value: siteContent.hours || defaultContacts[3].value,
      icon: defaultContacts[3].icon,
    },
  ];

  return (
    <section className="page page-about">
      <Helmet>
        <title>Про нас — ПП «Наш Дім» Тернопіль</title>
        <meta name="description" content="Приватне підприємство «Наш Дім» — управління житловим фондом Тернополя з 2000 року. Керівник, місія, контакти, дочірні підприємства." />
        <link rel="canonical" href="https://nash-dim.ink/about" />
      </Helmet>
      <div className="section-header">
        <div>
          <h2>Про наше підприємство</h2>
          <p>Обслуговування житлового фонду міста Тернопіль {siteContent.founded ? `з ${siteContent.founded} року` : 'з 2000 року'}</p>
        </div>
      </div>

      <div className="content-block">
        {siteContent.aboutText ? (
          <p>{siteContent.aboutText}</p>
        ) : (
          <p>
            Приватне підприємство "Наш Дім" — житлово-комунальне підприємство міста Тернопіль,
            зареєстроване у 2000 році. Підприємство забезпечує технічне обслуговування та
            управління житловим фондом, утримання будинків та прибудинкових територій.
            {siteContent.director ? ` Керівник: ${siteContent.director}.` : ' Керівник: Дмитришин Анатолій Євгенович.'}
          </p>
        )}
        {siteContent.aboutText2 ? (
          <p>{siteContent.aboutText2}</p>
        ) : (
          <p>
            Ми обслуговуємо житловий фонд через дочірні підприємства ДП "Наш Дім-2" та
            ДП "Наш Дім-3". Наша мета — швидко реагувати на заявки мешканців,
            підтримувати будівлі та прибудинкову територію в належному стані,
            надавати прозору інформацію про заплановані та виконані роботи.
          </p>
        )}
      </div>

      {/* Values */}
      <div>
        <h3 style={{ margin: "0 0 1.25rem", fontSize: "1.15rem" }}>
          Наші цінності
        </h3>
        <div className="values-grid">
          {values.map((v) => (
            <article key={v.title} className="value-card">
              <div className={`feature-icon ${v.color}`}>{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <h3 style={{ margin: "0 0 1.25rem", fontSize: "1.15rem" }}>
          Наші послуги
        </h3>
        <div className="services-grid">
          {services.map((s) => (
            <div key={s.label} className="service-card">
              <div className={`service-icon feature-icon ${s.color}`}>
                {s.icon}
              </div>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <div>
        <h3 style={{ margin: "0 0 1.25rem", fontSize: "1.15rem" }}>
          Контактна інформація
        </h3>
        <div className="contact-info-grid">
          {contacts.map((c) => (
            <div key={c.label} className="contact-card">
              <div className={`contact-card-icon feature-icon ${c.color}`}>
                {c.icon}
              </div>
              <div className="contact-card-label">{c.label}</div>
              <div className="contact-card-value">{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className="content-block"
        style={{ textAlign: "center", padding: "2.5rem" }}
      >
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.3rem" }}>
          Маєте проблему у будинку?
        </h3>
        <p style={{ margin: "0 0 1.5rem", color: "var(--slate-500)" }}>
          Залишіть заявку — ми зв'яжемося з вами та вирішимо питання в
          найкоротші терміни.
        </p>
        <Link to="/request" className="btn btn-primary">
          Залишити заявку
        </Link>
      </div>
    </section>
  );
}

export default About;
