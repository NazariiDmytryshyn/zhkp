import { useState } from 'react';
import Icon from './Icon.jsx';
import RequestForm from './RequestForm.jsx';
import { useMyBuilding } from '../lib/myBuilding.js';
import { fullAddr } from '../lib/buildings.js';

function WidgetRequest({ onSubmit, buildings = [] }) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const mine = useMyBuilding(buildings);

  const close = () => { setOpen(false); setFormKey((k) => k + 1); };

  return (
    <>
      {open && (
        <div className="fab-panel" role="dialog" aria-label="Швидка заявка">
          <div className="fab-panel__head">
            <div>
              <p className="t-h3">Швидка заявка</p>
              <p className="t-small">Опишіть проблему — передзвонимо</p>
            </div>
            <button type="button" className="nd-icon-btn" onClick={close} aria-label="Закрити"><Icon name="close" /></button>
          </div>
          <div className="fab-panel__body">
            <RequestForm key={formKey} idPrefix="fab" onSubmit={onSubmit} onDone={close} initialAddress={mine ? `${fullAddr(mine)}, кв. ` : ''} />
          </div>
        </div>
      )}
      <button type="button" className="fab" onClick={() => (open ? close() : setOpen(true))} aria-label={open ? 'Закрити заявку' : 'Залишити заявку'} aria-expanded={open}>
        <Icon name={open ? 'close' : 'message'} size="lg" />
      </button>
    </>
  );
}

export default WidgetRequest;
