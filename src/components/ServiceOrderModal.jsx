import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { Field, validatePhone } from './RequestForm.jsx';
import * as api from '../api/zhkpApi.js';

const initialForm = { name: '', phone: '', address: '', preferredDate: '', message: '' };

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Ім'я обов'язкове";
  const phone = validatePhone(v.phone);
  if (phone) e.phone = phone;
  if (!v.address.trim()) e.address = "Адреса обов'язкова";
  return e;
}

function ServiceOrderModal({ service, onClose, initialAddress = '' }) {
  const [values, setValues] = useState({ ...initialForm, address: initialAddress });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

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
      await api.submitServiceRequest({ ...values, serviceId: service.id, serviceName: service.title });
      setDone(true);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const cls = (f) => `nd-input${errors[f] ? ' nd-input--error' : ''}`;

  return (
    <div className="nd-modal-backdrop" onClick={onClose}>
      <div className="nd-modal" role="dialog" aria-modal="true" aria-labelledby="svc-order-title" onClick={(e) => e.stopPropagation()}>
        <div className="nd-modal__head">
          <div>
            <p className="t-small">Замовлення послуги</p>
            <h2 className="t-h3" id="svc-order-title">{service.title}</h2>
            {service.price && <p className="t-num" style={{ fontWeight: 600, marginTop: 2 }}>{service.price}</p>}
          </div>
          <button type="button" className="nd-icon-btn" onClick={onClose} aria-label="Закрити"><Icon name="close" /></button>
        </div>
        <div className="nd-modal__body">
          {done ? (
            <div className="success-box">
              <span className="success-box__ico"><Icon name="check" size="lg" /></span>
              <p className="t-h3">Заявку надіслано</p>
              <p className="ink-2">Ми зв'яжемося з вами, щоб узгодити час і вартість.</p>
              <button type="button" className="nd-btn nd-btn--primary nd-btn--sm" onClick={onClose}>Закрити</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-grid2">
                <Field id="so-name" label="Ім'я" error={errors.name}>
                  <div className={cls('name')}><input id="so-name" value={values.name} onChange={set('name')} autoComplete="name" placeholder="Іван Петренко" /></div>
                </Field>
                <Field id="so-phone" label="Телефон" error={errors.phone}>
                  <div className={cls('phone')}><input id="so-phone" type="tel" value={values.phone} onChange={set('phone')} autoComplete="tel" placeholder="+380XXXXXXXXX" /></div>
                </Field>
                <Field id="so-address" label="Адреса" error={errors.address}>
                  <div className={cls('address')}><input id="so-address" value={values.address} onChange={set('address')} placeholder="вул. Руська, 12, кв. 34" /></div>
                </Field>
                <Field id="so-date" label="Бажана дата">
                  <div className="nd-input"><input id="so-date" type="date" value={values.preferredDate} onChange={set('preferredDate')} /></div>
                </Field>
              </div>
              <Field id="so-msg" label="Деталі">
                <textarea id="so-msg" className="nd-textarea" style={{ minHeight: 90 }} value={values.message} onChange={set('message')} placeholder="Що саме потрібно зробити" />
              </Field>
              {errors.submit && <p className="nd-field__error">{errors.submit}</p>}
              <button className="nd-btn nd-btn--primary nd-btn--block" type="submit" disabled={loading}>{loading ? 'Надсилаємо…' : 'Надіслати заявку'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServiceOrderModal;
