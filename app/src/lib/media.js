// API media fields come back root-relative (/media/...); the dev/preview proxy
// serves them from the same origin, but a bundled app (Capacitor) has no proxy,
// so the API host must be prefixed. Absolute, data:, blob: and local /assets/
// paths pass through untouched.
export const mediaUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (/^https?:\/\//i.test(url)) {
    // the API builds absolute media URLs from the upstream request, which
    // arrives as plain http behind the TLS proxy; the page is https, so an
    // http image would be blocked as mixed content — upgrade the scheme
    return url.startsWith('http://') ? url.replace(/^http:/i, 'https:') : url;
  }
  if (!url.startsWith('/media/')) return url;
  return `${import.meta.env.VITE_API_BASE || ''}${url}`;
};
