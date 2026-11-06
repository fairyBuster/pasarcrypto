// The invitation URL a referral code resolves to. The host is never hard-coded:
// GET /api/auth/settings/ is public and reports the deployed frontend
// (frontend_url), so the same build hands out working links on the production
// domain, the origin port and any staging host alike.
import { useEffect, useState } from 'react';
import { api } from './api.js';

// "/ref/CODE" is answered by the app shell and forwarded to /register?ref=CODE
// by the router, which keeps the shared link as short as the frame draws it
const INVITE_PATH = '/ref/';

let frontendUrl = '';
let pending = null;

export const loadFrontendUrl = () => {
  if (frontendUrl) return Promise.resolve(frontendUrl);
  if (!pending) {
    pending = api
      .settings()
      .then((res) => {
        const url = res.ok && typeof res.data?.frontend_url === 'string' ? res.data.frontend_url.trim() : '';
        frontendUrl = url.replace(/\/+$/, '');
        return frontendUrl;
      })
      .catch(() => '')
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

// until the settings call lands the page itself is the best guess — on
// production that is the same host, so a link copied early still works
export const inviteLink = (code, base = '') => {
  if (!code) return '';
  const host = (base || frontendUrl || window.location.origin).replace(/\/+$/, '');
  return `${host}${INVITE_PATH}${encodeURIComponent(code)}`;
};

// every screen that shows or copies the link uses this hook, so the row repaints
// with the host the API reports instead of keeping the browser's guess
export function useInviteLink(code) {
  const [base, setBase] = useState(() => frontendUrl || window.location.origin);

  useEffect(() => {
    let alive = true;
    loadFrontendUrl().then((host) => {
      if (alive && host) setBase((current) => (current === host ? current : host));
    });
    return () => {
      alive = false;
    };
  }, []);

  return inviteLink(code, base);
}
