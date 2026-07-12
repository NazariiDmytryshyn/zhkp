function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const g = item[key] || 'Інше';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});
}

function Tariffs({ tariffs }) {
  if (!tariffs || tariffs.length === 0) {
    return (
      <section className="page page-tariffs">
        <div className="section-header">
          <div><h2>Тарифи</h2><p>Актуальні тарифи на послуги підприємства</p></div>
        </div>
        <div className="content-block" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--slate-500)' }}>Тарифи будуть опубліковані найближчим часом</p>
        </div>
      </section>
    );
  }

  const grouped = groupBy(tariffs, 'category');

  return (
    <section className="page page-tariffs">
      <div className="section-header">
        <div><h2>Тарифи</h2><p>Актуальні тарифи на послуги підприємства</p></div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="tariff-card">
            <h3 className="tariff-category">{category}</h3>
            <table className="tariff-table">
              <thead>
                <tr>
                  <th>Послуга</th>
                  <th>Тариф</th>
                  <th>Одиниця</th>
                </tr>
              </thead>
              <tbody>
                {items.map(t => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td className="tariff-price">{t.price} грн</td>
                    <td className="tariff-unit">{t.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <p className="tariff-note">
        * Тарифи затверджені відповідно до рішень місцевих органів влади та можуть змінюватись.
        Актуальна інформація розміщується на офіційному сайті.
      </p>
    </section>
  );
}

export default Tariffs;
