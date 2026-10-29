export const SERVICE_CATEGORIES = [
  { key: 'plumbing', label: 'Сантехніка', icon: 'drop' },
  { key: 'electric', label: 'Електрика', icon: 'zap' },
  { key: 'greenery', label: 'Догляд за зеленими насадженнями', icon: 'tree' },
  { key: 'other', label: 'Інше', icon: 'wrench' },
];

// Послуга без категорії вважається «Іншим»
export const serviceCat = (s) =>
  SERVICE_CATEGORIES.find((c) => c.key === s?.category) || SERVICE_CATEGORIES[SERVICE_CATEGORIES.length - 1];

export const categoryLabel = (key) => SERVICE_CATEGORIES.find((c) => c.key === key)?.label || '';
