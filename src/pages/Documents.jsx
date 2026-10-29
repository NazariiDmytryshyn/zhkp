import { Helmet } from 'react-helmet-async';
import Icon from '../components/Icon.jsx';
import { fmtDateShort } from '../lib/buildings.js';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

const ext = (url = '') => url.split('.').pop().toUpperCase().slice(0, 4);

function Documents({ documents = [] }) {
  const docs = [...documents].sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
  return (
    <>
      <Helmet>
        <title>Документи — ПП «Наш Дім» Тернопіль</title>
        <meta name="description" content="Рішення про тарифи, звіти, договори та інші документи ПП «Наш Дім» Тернопіль." />
        <link rel="canonical" href="https://nash-dim.ink/documents" />
      </Helmet>

      <h1 className="t-h1">Документи</h1>
      <p className="t-lead" style={{ marginTop: 8 }}>Рішення про тарифи, звіти, договори.</p>

      {docs.length === 0 ? (
        <div className="panel empty" style={{ marginTop: 32 }}><p>Документів поки немає</p></div>
      ) : (
        <div className="card-box" style={{ marginTop: 32, maxWidth: 880 }}>
          {docs.map((d) => (
            <a key={d.id} className="doc" href={d.url} target="_blank" rel="noopener noreferrer">
              <span className="nd-tile"><Icon name="file" /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 500, overflowWrap: 'anywhere' }}>{d.name}</span>
                <span className="t-small">{[ext(d.url), d.uploadedAt && fmtDateShort(d.uploadedAt), formatSize(d.size)].filter(Boolean).join(' · ')}</span>
              </span>
              <Icon name="download" style={{ color: 'var(--brand)' }} />
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export default Documents;
