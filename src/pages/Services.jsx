import { useState } from 'react';
import * as api from '../api/zhkpApi.js';

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, '');
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const initialForm = { name: '', phone: '', address: '', preferredDate: '', message: '' };

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Ім'я обов'язкове";
  if (!v.phone.trim()) {
    e.phone = "Телефон обов'язковий";
  } else {
    const digits = v.phone.replace(/\D/g, '');
    if (!/^(380\d{9}|0\d{9})$/.test(digits)) e.phone = 'Формат: +380XXXXXXXXX або 0XXXXXXXXX';
  }
  if (!v.address.trim()) e.address = "Адреса обов'язкова";
  return e;
}

function ServiceRequestForm({ service, onClose }) {
  const [values, setValues] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field) => (e) => {
    setValues(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await api.submitServiceRequest({ ...values, serviceId: service.id, serviceName: service.title });
      setDone(true);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="service-form-success">
        <div className="service-form-success-icon"><CheckCircleIcon /></div>
        <h4>Заявку надіслано!</h4>
        <p>Ми зв'яжемося з вами найближчим часом та узгодимо зручний час.</p>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Закрити</button>
      </div>
    );
  }

  return (
    <form className="service-form" onSubmit={handleSubmit} noValidate>
      <h4 className="service-form-title">
        Замовити: <span>{service.title}</span>
      </h4>
      <div className="service-form-grid">
        <div className="form-group">
          <label className="form-label">{"Ім'я *"}</label>
          <input className={`form-input${errors.name ? ' has-error' : ''}`} value={values.name} onChange={set('name')} placeholder="Іван Петренко" />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Телефон *</label>
          <input className={`form-input${errors.phone ? ' has-error' : ''}`} value={values.phone} onChange={set('phone')} placeholder="+380XXXXXXXXX" />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Адреса *</label>
          <input className={`form-input${errors.address ? ' has-error' : ''}`} value={values.address} onChange={set('address')} placeholder="вул. Шевченка, 12" />
          {errors.address && <span className="form-error">{errors.address}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Бажана дата</label>
          <input type="date" className="form-input" value={values.preferredDate} onChange={set('preferredDate')} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Деталі / побажання</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: '80px' }}
          value={values.message}
          onChange={set('message')}
          placeholder="Опишіть детально що потрібно зробити..."
        />
      </div>
      {errors.submit && <div className="login-error">{errors.submit}</div>}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {loading ? 'Надсилання...' : 'Відправити заявку'}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onClose}>
          Скасувати
        </button>
      </div>
    </form>
  );
}

function ServiceCard({ service, isActive, onToggle }) {
  const [descExpanded, setDescExpanded] = useState(false);
  const plainText = stripHtml(service.description);
  const isLong = plainText.length > 130;

  return (
    <article className={`service-page-card${isActive ? ' is-active' : ''}`}>
      <div className="service-page-card-img">
        {service.image
          ? <img src={service.image} alt={service.title} />
          : <div className="service-img-placeholder" />
        }
      </div>
      <div className="service-page-card-body">
        <div className="service-page-card-top">
          <h3>{service.title}</h3>
          {service.price && <span className="service-price-badge">{service.price}</span>}
        </div>
        <div
          className={`service-page-card-desc${descExpanded ? ' expanded' : ''}`}
          dangerouslySetInnerHTML={{ __html: service.description }}
        />
        {isLong && (
          <button className="service-desc-toggle" onClick={() => setDescExpanded(p => !p)}>
            {descExpanded ? 'Згорнути ↑' : 'Далі... ↓'}
          </button>
        )}
        {service.features?.length > 0 && (
          <ul className="service-features-list">
            {service.features.map((f, i) => (
              <li key={i}><CheckIcon /><span>{f}</span></li>
            ))}
          </ul>
        )}
        <button
          className={`btn ${isActive ? 'btn-outline-danger' : 'btn-primary'} service-order-btn`}
          onClick={onToggle}
        >
          {isActive ? 'Скасувати' : 'Замовити послугу'}
        </button>
      </div>
      {isActive && (
        <div className="service-form-wrap">
          <ServiceRequestForm service={service} onClose={onToggle} />
        </div>
      )}
    </article>
  );
}

function Services({ services }) {
  const [activeId, setActiveId] = useState(null);
  const toggle = (id) => setActiveId(p => p === id ? null : id);

  return (
    <section className="page page-services">
      <div className="section-header">
        <div>
          <h2>Додаткові послуги</h2>
          <p>Окрім обслуговування будинків, ми надаємо широкий спектр додаткових послуг</p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="content-block" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--slate-500)' }}>Послуги будуть додані найближчим часом</p>
        </div>
      ) : (
        <div className="services-page-grid">
          {services.map(s => (
            <ServiceCard
              key={s.id}
              service={s}
              isActive={activeId === s.id}
              onToggle={() => toggle(s.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Services;
