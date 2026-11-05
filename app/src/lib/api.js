// Thin client for the local Django/DRF API.
//
// Every DRF response is wrapped by SaltedBase64ReverseJSONRenderer:
//   { "data": reverse( base64(json) + SALT ) }
// so anything that is not the schema/docs has to be decoded here.

// Same-origin by default: the dev server proxies /api to Django, so the browser
// never sends a cross-origin request. Point VITE_API_BASE at a full URL when the
// frontend is served by something that has no proxy.
const BASE = import.meta.env.VITE_API_BASE || '';
const SALT = import.meta.env.VITE_API_SALT || 'KXXADFDFDF';

const ACCESS_KEY = 'pscryp.access';
const REFRESH_KEY = 'pscryp.refresh';
const USER_KEY = 'pscryp.user';

export const session = {
  get access() {
    return localStorage.getItem(ACCESS_KEY) || '';
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY) || '';
  },
  get user() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },
  save({ access, refresh, user }) {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

const decodeEnvelope = (text) => {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed.data !== 'string') return parsed;
  const reversed = [...parsed.data].reverse().join('');
  const b64 = SALT && reversed.endsWith(SALT) ? reversed.slice(0, -SALT.length) : reversed;
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
};

// DRF errors arrive as { field: ["msg"] } or { detail: "msg" }
export const errorText = (data, fallback = 'Terjadi kesalahan') => {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return String(data.detail);
  // the products endpoints report failures as { "error": "..." }
  if (data.error) return String(data.error);
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors.join(' ');
  const first = Object.entries(data)[0];
  if (!first) return fallback;
  const [field, value] = first;
  const msg = Array.isArray(value) ? value.join(' ') : String(value);
  return field === 'detail' ? msg : `${field}: ${msg}`;
};

async function send(path, { method = 'GET', body, form, token } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      // multipart uploads must let the browser set the boundary itself
      ...(form ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form || (body === undefined ? undefined : JSON.stringify(body)),
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = decodeEnvelope(text);
    } catch {
      data = { detail: text.slice(0, 200) };
    }
  }
  return { ok: res.ok, status: res.status, data };
}

let refreshing = null;

async function refreshAccess() {
  if (!session.refresh) return '';
  if (!refreshing) {
    refreshing = send('/api/auth/jwt/refresh/', {
      method: 'POST',
      body: { refresh: session.refresh },
    })
      .then((r) => {
        if (!r.ok || !r.data?.access) return '';
        // ROTATE_REFRESH_TOKENS is on, so keep the new refresh if one comes back
        session.save({ access: r.data.access, refresh: r.data.refresh || session.refresh });
        return r.data.access;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

// authenticated call with a single transparent refresh on 401
export async function request(path, options = {}) {
  let res = await send(path, { ...options, token: session.access });
  if (res.status === 401 && session.refresh) {
    const fresh = await refreshAccess();
    if (fresh) res = await send(path, { ...options, token: fresh });
  }
  if (res.status === 401) {
    session.clear();
    window.dispatchEvent(new Event('pscryp:auth-expired'));
  }
  return res;
}

export const api = {
  // one endpoint takes either form: anything containing '@' is treated as an
  // email, everything else as a phone number
  login: (identifier, password) =>
    send('/api/auth/jwt/identifier-login/', { method: 'POST', body: { identifier, password } }),
  register: (payload) => send('/api/auth/register/', { method: 'POST', body: payload }),
  resetPassword: (payload) => send('/api/auth/reset-password-otp/', { method: 'POST', body: payload }),
  requestOtp: (phone) => send('/api/auth/request-otp/', { method: 'POST', body: { phone } }),
  logout: (refresh, token) =>
    send('/api/auth/jwt/logout/', { method: 'POST', body: { refresh }, token }),
  me: () => request('/api/auth/account-info/'),
  // password change — verifies the old password instead of an OTP, so the
  // recovery screen calls it signed out with the phone in the body
  changePassword: (payload) =>
    request('/api/auth/change-password/', { method: 'POST', body: payload }),
  // profile — email is not editable, the rest arrives as a full PUT body
  updateProfile: (payload) =>
    request('/api/auth/profile-update/', { method: 'PUT', body: payload }),
  // profile photo — multipart upload, the browser sets the boundary itself
  uploadProfilePhoto: (form) =>
    request('/api/auth/profile-photo/', { method: 'POST', form }),
  // shipping address — the list is paginated, one record per saved address
  addresses: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    ).toString();
    return request(`/api/auth/address/${query ? `?${query}` : ''}`);
  },
  createAddress: (payload) => request('/api/auth/address/', { method: 'POST', body: payload }),
  updateAddress: (id, payload) =>
    request(`/api/auth/address/${id}/`, { method: 'PUT', body: payload }),
  // support — the FAQ list is public and arrives as a bare array
  faqs: () => request('/api/support/faqs/'),
  // support chat — one thread per account, oldest message first
  supportChat: () => request('/api/support/chat/messages/'),
  supportChatSend: (message) =>
    request('/api/support/chat/send/', { method: 'POST', body: { message } }),
  // news — published articles for the landing education grid
  news: () => request('/api/news/'),
  newsDetail: (id) => request(`/api/news/${id}/`),
  // members below the current account, used to name commission sources and to
  // count the active friends shown on the rewards screen
  downlines: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    ).toString();
    return request(`/api/auth/downline-list/${query ? `?${query}` : ''}`);
  },
  // invited friends — the overview carries the per-level member lists with rank
  // and referral code, the stats endpoint carries the counts for the tab row
  downlineOverview: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    ).toString();
    return request(`/api/auth/downline-overview/${query ? `?${query}` : ''}`);
  },
  downlineStats: () => request('/api/auth/downline-stats/'),
  // rank — the level list also carries the user's own progress per requirement
  rankLevels: () => request('/api/auth/rank-levels/'),
  rankStatus: () => request('/api/auth/rank-status/'),
  // feed — reviews are readable by anyone, likes and posting need a session
  reviews: () => request('/api/reviews/'),
  likeReview: (id, liked) =>
    request(`/api/reviews/${id}/like/`, { method: liked ? 'DELETE' : 'POST' }),
  createReview: (form) => request('/api/reviews/', { method: 'POST', form }),
  // products — every one of these needs a session
  products: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    ).toString();
    return request(`/api/products/${query ? `?${query}` : ''}`);
  },
  product: (id) => request(`/api/products/${id}/`),
  purchase: (payload) => request('/api/products/purchase/', { method: 'POST', body: payload }),
  // the endpoint answers with a bare array, not a paginated object
  investments: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    ).toString();
    return request(`/api/investments/${query ? `?${query}` : ''}`);
  },
  investment: (id) => request(`/api/investments/${id}/`),
  // today's income breakdown, used by the total-asset headline
  todayStats: () => request('/api/auth/balance-statistics/today/'),
  // lifetime totals: deposits, commissions and every credit category
  allTimeStats: () => request('/api/auth/balance-statistics/all-time/'),
  // withdraw — settings and the bank catalogue are public, the rest needs a session
  withdrawSettings: () => send('/api/withdraw/settings/'),
  bankList: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    ).toString();
    return send(`/api/banks/${query ? `?${query}` : ''}`);
  },
  userBanks: () => request('/api/banks/user/'),
  addUserBank: (payload) => request('/api/banks/user/', { method: 'POST', body: payload }),
  // the detail PATCH only moves the default flag; the account itself stays as is
  setDefaultBank: (id) =>
    request(`/api/banks/user/${id}/`, { method: 'PATCH', body: { is_default: true } }),
  withdrawPinStatus: () => request('/api/auth/withdraw-pin/'),
  withdraw: (payload) => request('/api/withdraw/', { method: 'POST', body: payload }),
  // paginated: { count, next, previous, results }
  withdraws: (page = 1) => request(`/api/withdraw/?page=${page}`),
  transactions: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    ).toString();
    return request(`/api/transactions/${query ? `?${query}` : ''}`);
  },
  // attendance — the streak block, the monthly calendar and the daily claim
  attendanceStreak: () => request('/api/attendance/logs/streak/'),
  attendanceCalendar: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    ).toString();
    return request(`/api/attendance/logs/calendar/${query ? `?${query}` : ''}`);
  },
  // paginated: { count, next, previous, results }
  attendanceLogs: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    ).toString();
    return request(`/api/attendance/logs/${query ? `?${query}` : ''}`);
  },
  attendanceSettings: () => request('/api/attendance/settings/active/'),
  attendanceClaim: () => request('/api/attendance/logs/claim/', { method: 'POST', body: {} }),
  // missions — the list carries the user's own progress, the claim credits a wallet
  missions: () => request('/api/missions/'),
  missionClaim: (missionId, times = 1) =>
    request('/api/missions/claim/', { method: 'POST', body: { mission_id: missionId, times } }),
  // roulette — the status carries the ticket balance and the spin catalogue,
  // while a spin answers with the prize that was actually drawn
  rouletteStatus: () => request('/api/roulette/status/'),
  rouletteSpin: () => request('/api/roulette/spin/', { method: 'POST', body: {} }),
};

// SSE — EventSource cannot attach the bearer header, so SupportChat opens the
// stream through fetch() and re-reads the thread whenever a data frame arrives
export const SUPPORT_CHAT_STREAM = `${BASE}/api/support/chat/stream/`;