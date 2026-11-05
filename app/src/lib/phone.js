// Mirrors accounts.utils.normalize_phone() on the backend: the API stores the
// "+62..." spelling, so register / reset must POST the same string. Login is
// exact-match on the stored value, so it also retries the raw input.

export function normalizePhone(raw) {
  const value = String(raw || '').trim().replace(/[\s-]/g, '');
  if (!value) return '';
  if (value.startsWith('+')) return value;
  if (value.startsWith('62')) return `+${value}`;
  if (value.startsWith('0')) return `+62${value.slice(1)}`;
  if (value.startsWith('8')) return `+62${value}`;
  return value;
}

// normalised form first, raw input kept as a fallback
export function phoneCandidates(raw) {
  const value = String(raw || '').trim();
  const normalized = normalizePhone(value);
  // accounts store the normalized number, so try that spelling first and keep
  // what the user typed only as a fallback for older rows
  return [...new Set([normalized, value].filter(Boolean))];
}
