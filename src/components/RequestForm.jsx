import { useState } from 'react';
import Icon from './Icon.jsx';

export function validatePhone(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (!cleaned) return "Телефон обов'язковий";
  if (!/^(?:\+380|380|0)\d{9}$/.test(cleaned)) return 'Формат: +380XXXXXXXXX або 0XXXXXXXXX';
  return '';
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email) {
  const e = email.trim();
  if (!e) return "Email обов'язковий";
  if (!EMAIL_RE.test(e)) return 'Перевірте email, наприклад: ivan@gmail.com';
  return '';
}

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Ім'я обов'язкове";
  const phone = validatePhone(v.phone);
  if (phone) e.phone = phone;
  const email = validateEmail(v.email);
  if (email) e.email = email;
  if (!v.address.trim()) e.address = "Адреса обов'язкова";
  if (!v.message.trim()) e.message = "Опишіть, що сталося";
  else if (v.message.trim().length < 10) e.message = 'Опишіть трохи детальніше — щонайменше 10 символів';
  return e;
}

export function Field({ id, label, error, hint, children }) {
  return (
    <div className="nd-field">
      <label className="nd-field__label" htmlFor={id}>{label}</label>
      {children}
      {error ? <span className="nd-field__error" id={`${id}-err`}>{error}</span> : hint ? <span className="nd-field__hint">{hint}</span> : null}
    </div>
  );
}

function RequestForm({ onSubmit, initialAddress = '', idPrefix = 'rq', onDone }) {
  const [values, setValues] = useState({ name: '', phone: '', email: '', address: initialAddress, message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field) => (e) => {
    setValues((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await onSubmit({ ...values, name: values.name.trim(), email: values.email.trim(), address: values.address.trim(), message: values.message.trim() });
      setDone(true);
    } catch (err) {
      setErrors({ submit: err.message || 'Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте.' });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="success-box">
        <span className="success-box__ico"><Icon name="check" size="lg" /></span>
        <p className="t-h3">Заявку надіслано</p>
        <p className="ink-2">Майстер зв'яжеться з вами найближчим часом.</p>
        {onDone && <button type="button" className="nd-btn nd-btn--secondary nd-btn--sm" onClick={onDone}>Закрити</button>}
      </div>
    );
  }

  const inputCls = (f) => `nd-input${errors[f] ? ' nd-input--error' : ''}`;
  const id = (f) => `${idPrefix}-${f}`;

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field id={id('name')} label="Ім'я" error={errors.name}>
        <div className={inputCls('name')}><input id={id('name')} value={values.name} onChange={set('name')} autoComplete="name" placeholder="Іван Петренко" /></div>
      </Field>
      <Field id={id('phone')} label="Телефон" error={errors.phone} hint="Передзвонимо на цей номер">
        <div className={inputCls('phone')}><input id={id('phone')} type="tel" inputMode="tel" value={values.phone} onChange={set('phone')} autoComplete="tel" placeholder="+380XXXXXXXXX" /></div>
      </Field>
      <Field id={id('email')} label="Email" error={errors.email} hint="Щоб зв'язатися з вами щодо заявки">
        <div className={inputCls('email')}><input id={id('email')} type="email" inputMode="email" value={values.email} onChange={set('email')} autoComplete="email" placeholder="ivan@gmail.com" /></div>
      </Field>
      <Field id={id('address')} label="Адреса" error={errors.address}>
        <div className={inputCls('address')}><input id={id('address')} value={values.address} onChange={set('address')} autoComplete="street-address" placeholder="вул. Руська, 12, кв. 34" /></div>
      </Field>
      <Field id={id('message')} label="Що сталося" error={errors.message}>
        <textarea id={id('message')} className={`nd-textarea${errors.message ? ' nd-input--error' : ''}`} value={values.message} onChange={set('message')} placeholder="Протікає кран у ванній, вода капає постійно" />
      </Field>
      {errors.submit && <div className="nd-notice nd-notice--danger nd-notice--compact"><div className="nd-notice__body"><p className="nd-notice__meta">{errors.submit}</p></div></div>}
      <button className="nd-btn nd-btn--primary nd-btn--block" type="submit" disabled={loading}>
        {loading ? 'Надсилаємо…' : 'Надіслати заявку'}
      </button>
    </form>
  );
}

export default RequestForm;
