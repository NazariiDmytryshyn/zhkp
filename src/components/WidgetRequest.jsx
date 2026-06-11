import { useState } from 'react';

const initialValues = { name: '', phone: '', address: '', message: '' };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Ім'я обов'язкове";
  if (!values.phone.trim()) {
    errors.phone = "Телефон обов'язковий";
  } else {
    const cleaned = values.phone.replace(/[\s\-()]/g, '');
    if (!/^(?:\+380|0)\d{9}$/.test(cleaned)) {
      errors.phone = 'Введіть номер у форматі +380XXXXXXXXX';
    }
  }
  if (!values.address.trim()) errors.address = "Адреса обов'язкова";
  if (!values.message.trim()) {
    errors.message = "Опис проблеми обов'язковий";
  } else if (values.message.trim().length < 10) {
    errors.message = 'Мінімум 10 символів';
  }
  return errors;
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function WidgetRequest({ onSubmit }) {
  const [show, setShow] = useState(false);
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

  const handleReset = () => {
    setSubmitted(false);
    setValues(initialValues);
    setErrors({});
  };

  return (
    <div className="widget-request">
      {show && (
        <div className="widget-panel">
          <div className="widget-header">
            <h3>Швидка заявка</h3>
            <button className="widget-close" onClick={() => setShow(false)} aria-label="Закрити">
              <CloseIcon />
            </button>
          </div>

          {submitted ? (
            <div className="widget-success">
              <div className="widget-success-icon"><CheckIcon /></div>
              <h4>Заявку надіслано!</h4>
              <p>Ми зв'яжемося з вами найближчим часом.</p>
              <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={handleReset}>
                Надіслати ще
              </button>
            </div>
          ) : (
            <form className="widget-body" onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">{"Ім'я"}</label>
                <input
                  className={`form-input${errors.name ? ' has-error' : ''}`}
                  value={values.name}
                  onChange={handleChange('name')}
                  placeholder="Іван Петренко"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Телефон</label>
                <input
                  className={`form-input${errors.phone ? ' has-error' : ''}`}
                  value={values.phone}
                  onChange={handleChange('phone')}
                  placeholder="+380XXXXXXXXX"
                />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Адреса</label>
                <input
                  className={`form-input${errors.address ? ' has-error' : ''}`}
                  value={values.address}
                  onChange={handleChange('address')}
                  placeholder="вул. Шевченка, 12, кв. 34"
                />
                {errors.address && <span className="form-error">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Опис проблеми</label>
                <textarea
                  className={`form-textarea${errors.message ? ' has-error' : ''}`}
                  value={values.message}
                  onChange={handleChange('message')}
                  placeholder="Опишіть проблему..."
                  style={{ minHeight: '80px' }}
                />
                {errors.message && <span className="form-error">{errors.message}</span>}
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Надсилання...' : 'Надіслати'}
              </button>
            </form>
          )}
        </div>
      )}

      <button className="widget-btn" onClick={() => setShow((p) => !p)} aria-label="Залишити заявку">
        {show ? <CloseIcon /> : <MessageIcon />}
      </button>
    </div>
  );
}

export default WidgetRequest;
