import { useEffect, useState } from 'react';

// «Мій будинок» — вибір мешканця зберігається лише в його браузері
const KEY = 'nd_my_building';
const EVENT = 'nd-my-building';

function read() {
  try { return Number(window.localStorage.getItem(KEY)) || null; } catch { return null; }
}

export function setMyBuilding(id) {
  try {
    if (id) window.localStorage.setItem(KEY, String(id));
    else window.localStorage.removeItem(KEY);
  } catch { /* приватний режим — просто не запам'ятовуємо */ }
  window.dispatchEvent(new Event(EVENT));
}

export function useMyBuildingId() {
  const [id, setId] = useState(read);
  useEffect(() => {
    const sync = () => setId(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return id;
}

export function useMyBuilding(buildings) {
  const id = useMyBuildingId();
  return buildings.find((b) => b.id === id) || null;
}

export function readStored(key, fallback) {
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

export function writeStored(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
}
