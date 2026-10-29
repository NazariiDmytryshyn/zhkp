import { useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { searchBuildings, shortAddr, compareBuildings } from '../lib/buildings.js';

// Пошук будинку з підказками; Enter або «Показати» відкриває будинок (або список тарифів з пошуком)
function AddressSearch({ buildings, buttonLabel = 'Показати' }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const listId = useId();

  const matches = useMemo(
    () => (q.trim() ? searchBuildings(buildings, q).sort(compareBuildings).slice(0, 8) : []),
    [buildings, q],
  );

  const go = (b) => {
    if (b) navigate(`/tariffs/${b.id}`);
    else if (matches.length === 1) navigate(`/tariffs/${matches[0].id}`);
    else navigate(q.trim() ? `/tariffs?q=${encodeURIComponent(q.trim())}` : '/tariffs');
  };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, matches.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Escape') setOpen(false);
  };

  const showMenu = open && q.trim().length > 0;

  return (
    <form className="nd-hero__search" role="search" onSubmit={(e) => { e.preventDefault(); go(showMenu ? matches[active] : null); }}>
      <div className="nd-address">
        <div className="nd-input nd-input--lg">
          <Icon name="search" size="lg" />
          <input
            type="search"
            aria-label="Адреса будинку"
            placeholder="Вулиця і номер будинку"
            value={q}
            role="combobox"
            aria-expanded={showMenu}
            aria-controls={listId}
            aria-autocomplete="list"
            onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={onKey}
          />
        </div>
        {showMenu && (
          <div className="nd-address__menu" id={listId} role="listbox">
            {matches.length === 0 ? (
              <div className="nd-address__none">Такої адреси немає серед наших будинків</div>
            ) : matches.map((b, i) => (
              <button
                type="button" key={b.id} role="option" aria-selected={i === active}
                className="nd-address__opt" onMouseDown={(e) => e.preventDefault()} onClick={() => go(b)}
              >
                <Icon name="home" />
                <span>
                  <span className="nd-address__main">{shortAddr(b)}</span>
                  {b.dp && <span className="nd-address__sub">{b.dp}</span>}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="nd-btn nd-btn--primary nd-btn--lg" type="submit">{buttonLabel}</button>
    </form>
  );
}

export default AddressSearch;
