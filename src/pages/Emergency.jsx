const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.64 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.55 2.73h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const COLORS = ['blue', 'amber', 'green', 'purple', 'cyan', 'red'];

function Emergency({ emergencyContacts }) {
  if (!emergencyContacts || emergencyContacts.length === 0) {
    return (
      <section className="page page-emergency">
        <div className="section-header">
          <div><h2>Аварійні контакти</h2><p>Телефони екстреної та аварійної служб</p></div>
        </div>
        <div className="content-block" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--slate-500)' }}>Контакти будуть додані найближчим часом</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page page-emergency">
      <div className="section-header">
        <div>
          <h2>Аварійні контакти</h2>
          <p>Телефони служб екстреної допомоги та аварійного реагування</p>
        </div>
      </div>

      <div className="emergency-grid">
        {emergencyContacts.map((c, i) => (
          <div key={c.id} className={`emergency-card emergency-card-${COLORS[i % COLORS.length]}`}>
            <div className="emergency-card-icon">
              <PhoneIcon />
            </div>
            <div className="emergency-card-body">
              <div className="emergency-card-name">{c.name}</div>
              <a className="emergency-card-phone" href={`tel:${c.phone.replace(/\s/g, '')}`}>
                {c.phone}
              </a>
              {c.description && <p className="emergency-card-desc">{c.description}</p>}
              {c.available && (
                <div className="emergency-card-hours">
                  <ClockIcon />{c.available}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="content-block emergency-note">
        <strong>У разі загрози життю</strong> — негайно телефонуйте <strong>101</strong> (пожежна),{' '}
        <strong>102</strong> (поліція), <strong>103</strong> (швидка), <strong>104</strong> (газ).
      </div>
    </section>
  );
}

export default Emergency;
