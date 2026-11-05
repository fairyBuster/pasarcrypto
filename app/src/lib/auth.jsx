// Session-aware auth context: who is signed in, how to sign in/out, and which
// screens may be opened without a token.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, errorText, session } from './api.js';
import { idr } from './format.js';

const AuthContext = createContext(null);

// reachable while signed out: entry, recovery, legal, marketing, and the
// notifications that belong to a signed-out flow (register result, logout)
const PUBLIC_PATHS = new Set([
  '/welcome',
  '/login',
  '/lupa-password',
  '/faq',
  '/notifikasi/keluar',
  '/notifikasi/berhasil-daftar',
  '/notifikasi/gagal-daftar',
  '/notifikasi/kata-sandi-salah',
  '/notifikasi/nomor-tidak-ada',
  // the success screen of the signed-out recovery flow
  '/notifikasi/ubah-sandi',
]);
const PUBLIC_PREFIXES = ['/landing', '/legal', '/register'];

export const isPublicPath = (pathname) =>
  PUBLIC_PATHS.has(pathname) ||
  PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const FIELD_LABELS = {
  phone: 'Nomor telepon',
  username: 'Username',
  email: 'Email',
  password: 'Kata sandi',
  password2: 'Konfirmasi kata sandi',
  new_password: 'Kata sandi baru',
  new_password_confirm: 'Konfirmasi kata sandi baru',
  old_password: 'Kata sandi lama',
  password_confirm: 'Konfirmasi kata sandi',
  referral_code: 'Kode referral',
  otp: 'Kode verifikasi',
  identifier: 'Nomor telepon',
  product_id: 'Produk',
  quantity: 'Jumlah',
  bank: 'Bank',
  account_name: 'Nama pemilik rekening',
  account_number: 'Nomor rekening',
  is_default: 'Rekening utama',
};

// the API speaks English; the screens speak Indonesian
const MESSAGES = {
  'Invalid phone number or password': 'Nomor telepon atau kata sandi salah.',
  // identifier-login takes a phone number or an email
  'Invalid phone/email or password': 'Email/nomor telepon atau kata sandi salah.',
  'This phone number is already in use.': 'Nomor telepon ini sudah didaftarkan.',
  // the live backend words the duplicate-phone failure in Indonesian
  'User dengan phone telah ada.': 'Nomor telepon ini sudah didaftarkan.',
  'This field may not be blank.': 'Wajib diisi.',
  'This field is required.': 'Wajib diisi.',
  'Invalid referral code.': 'Kode referral tidak valid.',
  "Password fields didn't match.": 'Konfirmasi kata sandi tidak sama.',
  'Password is too short.': 'Kata sandi terlalu pendek.',
  'Enter a valid email address.': 'Format email tidak valid.',
  // reset-password-otp
  'OTP not requested or expired.': 'Kode verifikasi tidak ditemukan atau sudah kedaluwarsa.',
  'OTP sedang dimatikan. Silakan hubungi admin.': 'Layanan kode verifikasi sedang nonaktif di server ini.',
  'OTP code is required.': 'Kode verifikasi wajib diisi.',
  'User dengan nomor ini tidak ditemukan.': 'Nomor ini belum terdaftar.',
  'Konfirmasi password tidak sama.': 'Konfirmasi kata sandi tidak sama.',
  'Kuantitas harus lebih dari 0.': 'Jumlah harus lebih dari 0.',
  // withdraw
  'Insufficient balance.': 'Saldo tersedia tidak cukup untuk penarikan ini.',
  'Bank account is required.': 'Rekening bank tujuan wajib dipilih.',
  'Invalid bank account.': 'Rekening bank tujuan tidak ditemukan.',
  'Withdrawal PIN not set. Please set your PIN first.': 'PIN penarikan belum diatur. Atur PIN terlebih dahulu.',
  'PIN is required for withdrawal.': 'PIN penarikan wajib diisi.',
  'PIN must be exactly 6 digits.': 'PIN penarikan harus 6 digit.',
  'Invalid PIN.': 'PIN penarikan salah.',
  // missions
  'Requirements not met or already claimed': 'Syarat misi belum terpenuhi atau hadiah sudah diklaim.',
  'Mission already claimed': 'Hadiah misi ini sudah diklaim.',
  'Mission not found or inactive': 'Misi tidak ditemukan atau sudah tidak aktif.',
  // banks — the unique constraint fires before the view's own message
  'The fields user, bank must make a unique set.': 'Rekening bank ini sudah terdaftar di akunmu.',
  'User sudah memiliki bank ini.': 'Kamu sudah memiliki rekening bank ini.',
  'Bank tidak aktif.': 'Bank ini sedang tidak aktif.',
};

// messages the API composes at runtime, so they can only be matched by opening
const MESSAGE_PREFIXES = [
  // the login endpoint words its rejection with or without the username part
  ['Invalid phone/email', 'Email/nomor telepon atau kata sandi salah.'],
  ['Invalid OTP code', 'Kode verifikasi salah.'],
  ['This password is too short', 'Kata sandi minimal 8 karakter.'],
  ['This password is too common', 'Kata sandi terlalu umum, pilih yang lain.'],
  ['This password is entirely numeric', 'Kata sandi tidak boleh hanya berisi angka.'],
  ['The password is too similar', 'Kata sandi terlalu mirip dengan data akunmu.'],
  // the deposit variant is longer, so it has to be tested first
  ['Insufficient Balance Deposit', 'Saldo Isi Ulang tidak cukup untuk pembelian ini.'],
  ['Insufficient Balance', 'Saldo tersedia tidak cukup untuk pembelian ini.'],
  ['Insufficient', 'Saldo tidak cukup untuk pembelian ini.'],
];

// runtime messages whose sentence has to keep the value they carry
const MESSAGE_PATTERNS = [
  // change-password re-checks the old password before saving the new one
  [/^(current|old) password is incorrect.*$/i, 'Kata sandi lama salah.'],
  // the signup serializer words the unique-phone failure more than one way
  [/^this phone number is already.*$/i, 'Nomor telepon ini sudah didaftarkan.'],
  [/^(a )?user with this phone(number)? already.*$/i, 'Nomor telepon ini sudah didaftarkan.'],
  [/^phone(number)? .*already (in use|registered|exists).*$/i, 'Nomor telepon ini sudah didaftarkan.'],
  // Indonesian spellings of the same duplicate-phone rejection
  [/^user dengan ((no(\.)?\s*)?phone|nomor)( ini)? (telah|sudah) (ada|terdaftar)\.?$/i, 'Nomor telepon ini sudah didaftarkan.'],
  [/^((no(\.)?\s*)?phone|nomor)( ini)? (telah|sudah) (ada|terdaftar)\.?$/i, 'Nomor telepon ini sudah didaftarkan.'],
  [/^Kuantitas melebihi batas pembelian (\d+)/, 'Jumlah melebihi batas pembelian (maks. $1 unit).'],
  [/^Minimum withdrawal is ([\d.]+)/, (_, value) => `Minimal penarikan ${idr(value)} IDR.`],
  [/^Maximum withdrawal is ([\d.]+)/, (_, value) => `Maksimal penarikan ${idr(value)} IDR.`],
  [/^User sudah mencapai batas maksimal (\d+) bank IDR\./, 'Kamu sudah mencapai batas maksimal $1 rekening bank IDR.'],
  [/^User sudah mencapai batas maksimal (\d+) bank non-IDR\./, 'Kamu sudah mencapai batas maksimal $1 rekening bank non-IDR.'],
];

const localize = (message) => {
  if (MESSAGES[message]) return MESSAGES[message];
  const prefix = MESSAGE_PREFIXES.find(([start]) => message.startsWith(start));
  if (prefix) return prefix[1];
  // messages that carry a value the sentence has to keep (a limit, a count)
  const pattern = MESSAGE_PATTERNS.find(([test]) => test.test(message));
  return pattern ? message.replace(pattern[0], pattern[1]) : message;
};

// turns any API error payload into a sentence the screens can show directly
export function friendlyError(data, fallback) {
  if (!data) return fallback;
  const text = errorText(data, fallback);
  // messages the API composes itself can contain a colon ("Insufficient
  // Balance Deposit. Required: Rp 40.000"), so match them before splitting
  const whole = localize(text);
  if (whole !== text) return whole;
  const cut = text.indexOf(': ');
  if (cut === -1) return whole;
  const field = text.slice(0, cut);
  const label = FIELD_LABELS[field] || field;
  const localized = localize(text.slice(cut + 2));
  // most messages already name their own field ("Kode verifikasi salah."), so
  // only prefix the label when the sentence does not mention it
  const mentionsField = label
    .toLowerCase()
    .split(' ')
    .some((word) => localized.toLowerCase().includes(word));
  return mentionsField ? localized : `${label}: ${localized}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (session.access ? session.user : null));

  // api.js dispatches this after a 401 that the refresh token could not fix
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('pscryp:auth-expired', onExpired);
    return () => window.removeEventListener('pscryp:auth-expired', onExpired);
  }, []);

  // the login body only carries the fields that screen needs; account-info is
  // the single source for the rest (username, birth date, rank, join date)
  const refreshUser = useCallback(async () => {
    if (!session.access) return null;
    const res = await api.me();
    if (!res.ok || !res.data || typeof res.data !== 'object') return null;
    session.save({ user: res.data });
    setUser(res.data);
    return res.data;
  }, []);

  // every mounted screen reads this one object, so it is hydrated once per session
  useEffect(() => {
    if (session.access) refreshUser();
  }, [refreshUser]);

  const signIn = useCallback(async (identifier, password) => {
    const res = await api.login(identifier, password);
    if (!res.ok || !res.data?.access) {
      throw new Error(friendlyError(res.data, 'Gagal masuk, coba lagi.'));
    }
    session.save(res.data);
    setUser(res.data.user || null);
    // the login payload omits username and friends, so fill them in right away
    refreshUser();
    return res.data.user || null;
  }, [refreshUser]);

  const signUp = useCallback(async (payload) => {
    const res = await api.register(payload);
    if (!res.ok) throw new Error(friendlyError(res.data, 'Pendaftaran gagal, coba lagi.'));
    return res.data;
  }, []);

  const signOut = useCallback(async () => {
    // the endpoint is IsAuthenticated, so the access token has to travel
    // before the session is wiped
    const { access, refresh } = session;
    session.clear();
    setUser(null);
    if (refresh) api.logout(refresh, access).catch(() => {});
  }, []);

  // PUT /api/auth/profile-update/ answers with the saved fields, so every
  // screen reading the session object picks the change up immediately
  const updateProfile = useCallback(async (payload) => {
    const res = await api.updateProfile(payload);
    if (!res.ok) throw new Error(friendlyError(res.data, 'Gagal menyimpan profil.'));
    const saved = res.data && typeof res.data === 'object' ? res.data : {};
    setUser((prev) => {
      const next = { ...(prev || {}), ...saved };
      session.save({ user: next });
      return next;
    });
    // the response only carries the edited fields, so pull the full account
    refreshUser();
    return saved;
  }, [refreshUser]);

  // POST /api/auth/change-password/ verifies the old password instead of an OTP,
  // so it is the only step the recovery form and the profile screen share
  const changePassword = useCallback(async (payload) => {
    const res = await api.changePassword(payload);
    if (!res.ok) throw new Error(friendlyError(res.data, 'Gagal mengubah kata sandi.'));
    return res.data;
  }, []);

  const value = useMemo(
    () => ({ user, authed: Boolean(user && session.access), signIn, signUp, signOut, changePassword, refreshUser, updateProfile }),
    [user, signIn, signUp, signOut, changePassword, refreshUser, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

// bounces to the login screen and remembers where the user was heading
export function RequireAuth({ children }) {
  const { authed } = useAuth();
  const location = useLocation();
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}
