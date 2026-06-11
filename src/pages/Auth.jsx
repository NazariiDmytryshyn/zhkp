import { useState } from 'react';

function Auth({ adminUser, onRegister, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Вкажіть логін та пароль.');
      return;
    }

    if (adminUser) {
      const ok = onLogin({ username, password });
      if (!ok) {
        setError('Невірний логін або пароль.');
      }
    } else {
      onRegister({ username, password });
    }
  };

  return (
    <section className="page page-auth">
      <div className="section-header">
        <h2>{adminUser ? 'Вхід для адміністратора' : 'Реєстрація адміністратора'}</h2>
        <p>{adminUser ? 'Введіть дані свого облікового запису.' : 'Створіть простий обліковий запис адміністратора для доступу до адмінки.'}</p>
      </div>
      <div className="auth-card">
        <form onSubmit={handleSubmit} className="form-card compact-form">
          <label>
            Логін
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
          </label>
          <label>
            Пароль
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button">{adminUser ? 'Увійти' : 'Зареєструвати'}</button>
        </form>
      </div>
    </section>
  );
}

export default Auth;
