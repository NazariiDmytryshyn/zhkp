import { Helmet } from 'react-helmet-async';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fileExt(url) {
  return (url || '').split('.').pop().toUpperCase().slice(0, 4);
}

const extColors = { PDF: 'red', DOC: 'blue', DOCX: 'blue', XLS: 'green', XLSX: 'green' };

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

function Documents({ documents }) {
  if (!documents || documents.length === 0) return null;

  return (
    <section className="page page-documents">
      <Helmet>
        <title>Документи — ПП «Наш Дім» Тернопіль</title>
        <meta name="description" content="Нормативні та інформаційні документи ПП «Наш Дім» Тернопіль для завантаження." />
        <link rel="canonical" href="https://nash-dim.ink/documents" />
      </Helmet>
      <div className="section-header">
        <div><h2>Документи</h2><p>Нормативні та інформаційні документи підприємства</p></div>
      </div>

      <div className="documents-list">
        {documents.map(doc => {
          const ext = fileExt(doc.url);
          const color = extColors[ext] || 'blue';
          return (
            <a
              key={doc.id}
              className="document-item"
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <div className={`document-ext document-ext-${color}`}>{ext}</div>
              <div className="document-info">
                <div className="document-name">{doc.name}</div>
                <div className="document-meta">
                  {doc.uploadedAt && <span>{formatDate(doc.uploadedAt)}</span>}
                  {doc.size ? <span>{formatSize(doc.size)}</span> : null}
                </div>
              </div>
              <div className="document-download"><DownloadIcon /></div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export default Documents;
