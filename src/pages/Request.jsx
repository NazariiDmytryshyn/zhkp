import { useState } from 'react';
import { Link } from 'react-router-dom';

const initialValues = { name: '', phone: '', address: '', message: '' };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Ім'я обов'язкове";
  if (!values.phone.trim()) {
    errors.phone = "Телефон обов'язковий";
  } else {
    const cleaned = values.phone.replace(/[\s\-()]/g, '');
    if (!/^(?:\+380|0)\d{9}$/.test(cleaned)) {
      errors.phone = 'Введіть номер у форматі +380XXXXXXXXX або 0XXXXXXXXX';
    }
  }
  if (!values.address.trim()) errors.address = "Адреса обов'язкова";
  if (!values.message.trim()) {
    errors.message = "Опис проблеми обов'язковий";
  } else if (values.message.trim().length < 10) {
    errors.message = 'Опис має бути щонайменше 10 символів';
  }
  return errors;
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function Request({ onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setLoading(true);
    await onSubmit(values);
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="page page-request">
        <div className="request-success">
          <div className="request-success-icon"><CheckCircleIcon /></div>
          <h3>Заявку надіслано!</h3>
          <p>Ми зв'яжемося з вами найближчим часом та вирішимо вашу проблему.</p>
          <Link to="/" className="btn btn-primary">На головну</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page page-request">
      <div className="section-header">
        <div>
          <h2>Заявка на обслуговування</h2>
          <p>Опишіть проблему і ми візьмемося за неї першочергово.</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label">{"Ім'я *"}</label>
          <input
            className={`form-input${errors.name ? ' has-error' : ''}`}
            value={values.name}
            onChange={handleChange('name')}
            placeholder="Іван Петренко"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Номер телефону *</label>
          <input
            className={`form-input${errors.phone ? ' has-error' : ''}`}
            value={values.phone}
            onChange={handleChange('phone')}
            placeholder="+380XXXXXXXXX"
          />
          {errors.phone
            ? <span className="form-error">{errors.phone}</span>
            : <span className="form-hint">Формат: +380XXXXXXXXX або 0XXXXXXXXX</span>
          }
        </div>

        <div className="form-group">
          <label className="form-label">Адреса *</label>
          <input
            className={`form-input${errors.address ? ' has-error' : ''}`}
            value={values.address}
            onChange={handleChange('address')}
            placeholder="вул. Шевченка, 12, кв. 34"
          />
          {errors.address && <span className="form-error">{errors.address}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Опис проблеми *</label>
          <textarea
            className={`form-textarea${errors.message ? ' has-error' : ''}`}
            value={values.message}
            onChange={handleChange('message')}
            placeholder="Опишіть детально вашу проблему..."
          />
          {errors.message && <span className="form-error">{errors.message}</span>}
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Надсилання...' : 'Відправити заявку'}
        </button>
      </form>
    </section>
  );
}

export default Request;
