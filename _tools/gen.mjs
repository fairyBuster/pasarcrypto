// Converts _stage/<screen>/ exports into one React app.
// Usage: node _tools/gen.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = 'D:/Pscryp';
const STAGE = path.join(ROOT, '_stage');
const APP = path.join(ROOT, 'app');
const IMG_OUT = path.join(APP, 'public/assets/img');
const SCR_OUT = path.join(APP, 'src/screens');

const pascal = (slug) => slug.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');

// ---------------------------------------------------------------- CSS scoping
function scopeCss(css, scope) {
  const out = [];
  let i = 0;
  const n = css.length;
  while (i < n) {
    let sel = '';
    while (i < n && css[i] !== '{' && css[i] !== '}') sel += css[i++];
    if (i >= n) { if (sel.trim()) out.push(sel); break; }
    if (css[i] === '}') { i++; out.push(sel + '}'); continue; }

    let depth = 1;
    let j = i + 1;
    let body = '';
    while (j < n && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') { depth--; if (depth === 0) break; }
      body += css[j++];
    }
    i = j + 1;
    const s = sel.trim();
    if (/^@(media|supports|container)/i.test(s)) {
      out.push(`${s}{${scopeCss(body, scope)}}`);
    } else if (/^@/.test(s)) {
      out.push(`${s}{${body}}`);
    } else if (s) {
      const scoped = s.split(',').map((one) => {
        const t = one.trim();
        if (!t) return t;
        if (/^(html|body|:root)$/.test(t)) return scope;
        if (/^(html|body|:root)\s/.test(t)) return t.replace(/^(html|body|:root)/, scope);
        if (t === '*') return `${scope} *`;
        return `${scope} ${t}`;
      }).join(',\n');
      out.push(`${scoped}{${body}}`);
    }
  }
  return out.join('\n');
}

// ---------------------------------------------------------------- HTML → JSX
function cssToObj(css) {
  const parts = [];
  for (const decl of css.split(';')) {
    const idx = decl.indexOf(':');
    if (idx < 0) continue;
    const k = decl.slice(0, idx).trim();
    const v = decl.slice(idx + 1).trim();
    if (!k || !v) continue;
    const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    parts.push(`${camel}: ${JSON.stringify(v)}`);
  }
  return `{ ${parts.join(', ')} }`;
}

const stripTags = (s) => s.replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

const norm = (s) => s.toLowerCase().replace(/[?!.:,\u2026]/g, '').replace(/\s+/g, ' ').trim();

// label/class → route rules
const RULES = [
  ['cls', 'back-btn', '@back'],
  ['cls', 'back-button', '@back'],
  ['cls', 'back', '@back'],
  ['cls', 'header-back', '@back'],
  ['cls', 'btn-close', '@back'],
  ['cls', 'close-btn', '@back'],
  ['cls', 'forgot-password', '/lupa-password'],
  ['cls', 'forgot-link', '/lupa-password'],
  ['cls', 'coin-row', '/pasar/detail'],
  ['cls', 'market-row', '/pasar/detail'],
  ['cls', 'asset-row', '/pasar/detail'],
  ['cls', 'coin-item', '/pasar/detail'],
  ['cls', 'product-card', '/pasar/detail'],
  ['cls', 'nav-item-center', '/pasar'],
  ['txt', 'tutup', '@back'],
  ['txt', 'back', '@back'],
  ['txt', 'mengerti', '@back'],
  ['txt', 'kembali', '@back'],
  ['txt', 'ok', '@back'],
  ['txt', 'batal', '@back'],
  ['txt', 'nanti saja', '@back'],
  ['txt', 'saya sudah bayar', '/aset'],
  ['txt', 'ya mulai holding', '/notifikasi/pembelian'],
  ['txt', 'mulai holding', '/pasar/beli/konfirmasi'],
  ['txt', 'ya tarik sekarang', '/notifikasi/penarikan'],
  ['txt', 'absen sekarang', '/notifikasi/absen'],
  ['txt', 'ya keluar', '/welcome'],
  ['txt', 'simpan rekening', '/profil/bank'],
  ['txt', 'putar sekarang', '/notifikasi/roda'],
  ['txt', 'masuk', '/login'],
  ['txt', 'login', '/login'],
  ['txt', 'daftar', '/register'],
  ['txt', 'daftar sekarang', '/register'],
  ['txt', 'register', '/register'],
  ['txt', 'lupa kata sandi', '/lupa-password'],
  ['txt', 'lupa password', '/lupa-password'],
  ['txt', 'syarat layanan', '/legal/syarat-layanan'],
  ['txt', 'syarat ketentuan', '/legal/syarat-ketentuan'],
  ['txt', 'syarat & ketentuan', '/legal/syarat-ketentuan'],
  ['txt', 'kebijakan privasi', '/legal/kebijakan-privasi'],
  ['txt', 'kebijakan privasi.', '/legal/kebijakan-privasi'],
  ['txt', 'perjanjian klien', '/legal/perjanjian-klien'],
  ['txt', 'beranda', '/home'],
  ['txt', 'home', '/home'],
  ['txt', 'pasar', '/pasar'],
  ['txt', 'feed', '/feed'],
  ['txt', 'aset', '/aset'],
  ['txt', 'aset saya', '/aset'],
  ['txt', 'akun', '/akun'],
  ['txt', 'faq', '/faq'],
  ['txt', 'pusat bantuan', '/landing/bantuan'],
  ['txt', 'bantuan', '/landing/bantuan'],
  ['txt', 'tentang kami', '/tentang-kami'],
  ['txt', 'chat cs', '/chat-cs'],
  ['txt', 'hubungi cs', '/chat-cs'],
  ['txt', 'customer service', '/chat-cs'],
  ['txt', 'fear and greed', '/fear-greed'],
  ['txt', 'misi', '/rewards/misi'],
  ['txt', 'roda keberuntungan', '/rewards/roda'],
  ['txt', 'masuk harian', '/rewards/harian'],
  ['txt', 'program referral', '/rewards/referral'],
  ['txt', 'undang teman', '/rewards/teman'],
  ['txt', 'undang', '/rewards/teman'],
  ['txt', 'bagikan', '/rewards/teman'],
  ['txt', 'portofolio', '/aset/portofolio'],
  ['txt', 'notifikasi', '/notifikasi'],
  ['txt', 'deposit', '/deposit'],
  ['txt', 'tarik', '/tarik'],
  ['txt', 'keluar', '/notifikasi/keluar'],
  ['txt', 'profil saya', '/profil'],
  ['txt', 'profil', '/profil'],
  ['txt', 'ubah kata sandi', '/profil/password'],
  ['txt', 'perangkat login', '/profil/perangkat'],
  ['txt', 'bahasa', '/profil/bahasa'],
  ['txt', 'alamat', '/profil/alamat'],
  ['txt', 'alamat pengiriman', '/profil/alamat'],
  ['txt', 'rekening bank', '/profil/bank'],
  ['txt', 'pilihan bank', '/profil/bank'],
  ['txt', 'rank', '/rank'],
  ['txt', 'riwayat misi', '/riwayat/misi'],
  ['txt', 'riwayat penarikan', '/riwayat/penarikan'],
  ['txt', 'riwayat deposit', '/riwayat/deposit'],
  ['txt', 'riwayat komisi', '/riwayat/komisi'],
  ['txt', 'riwayat keuntungan', '/riwayat/keuntungan'],
  ['txt', 'riwayat hadiah', '/riwayat/hadiah'],
  ['txt', 'riwayat absen', '/riwayat/absen'],
  ['txt', 'riwayat lainnya', '/riwayat/lainnya'],

  // class fragments — covers exports that ship icon-only buttons
  ['clssub', 'btn-back', '@back'],
  ['clssub', 'icon-back', '@back'],
  ['clssub', 'btn-isi-ulang', '/deposit'],
  ['clssub', 'isi-ulang', '/deposit'],
  ['clssub', 'history-link', '/riwayat/keuntungan'],
  ['clssub', 'btn-history', '/riwayat/keuntungan'],
  ['clssub', 'history-btn', '/riwayat/deposit'],
  ['clssub', 'btn-riwayat', '/riwayat/lainnya'],
  ['clssub', 'btn-trade', '/pasar'],
  ['clssub', 'btn-help', '/chat-cs'],
  ['clssub', 'chat-btn', '/chat-cs'],
  ['clssub', 'btn-logout', '/notifikasi/keluar'],
  ['clssub', 'add-account-btn', '/profil/bank/1'],
  ['clssub', 'btn-add-address', '/profil/alamat'],
  ['clssub', 'btn-ubah', '/profil/edit'],
  ['clssub', 'btn-save', '@back'],
  ['clssub', 'submit-btn', '@back'],
  ['clssub', 'header-search-btn', '/pasar/cari'],

  // partial labels — longest match wins, so full phrases below beat the short ones
  ['txtsub', 'riwayat holding', '/riwayat/keuntungan'],
  ['txtsub', 'riwayat pembayaran', '/riwayat/deposit'],
  ['txtsub', 'lihat produk di pasar', '/pasar'],
  ['txtsub', 'lihat misi rewards', '/rewards/misi'],
  ['txtsub', 'mulai trading', '/pasar'],
  ['txtsub', 'lihat semua materi', '/landing/materi'],
  ['txtsub', 'isi ulang', '/deposit'],
  ['txtsub', 'tambah rekening', '/profil/bank/1'],
  ['txtsub', 'tambah alamat', '/profil/alamat'],
  ['txtsub', 'simpan alamat', '@back'],
  ['txtsub', 'simpan kata sandi', '/notifikasi/ubah-sandi'],
  ['txtsub', 'atur ulang kata sandi', '/notifikasi/ubah-sandi'],
  ['txtsub', 'pilih bank', '/profil/bank'],
  ['txtsub', 'daftar gratis', '/register'],
  ['txtsub', 'mulai chat', '/chat-cs'],
  ['txtsub', 'minta bantuan', '/chat-cs'],
  ['txtsub', 'semua perangkat', '/notifikasi/keluar'],
  ['txtsub', 'tarik sekarang', '/tarik/konfirmasi'],
  ['txtsub', 'penarikan', '/tarik'],
  ['txtsub', 'deposit', '/deposit'],
  ['txtsub', 'holding', '/pasar'],
  ['txtsub', 'misi', '/rewards/misi'],
  ['txtsub', 'poster', '/rewards/poster'],
  ['txtsub', 'undang', '/rewards/teman'],
  ['txtsub', 'riwayat', '/riwayat/lainnya'],
];

// landing pages use their own nav labels
const LANDING_NAV = [
  ['materi', '/landing/materi'],
  ['hadiah', '/landing/hadiah'],
  ['holding', '/landing/holding'],
  ['bantuan', '/landing/bantuan'],
  ['tentang', '/landing/tentang'],
  ['referral', '/landing/referral'],
  ['daftar', '/register'],
  ['registrasi', '/register'],
  ['masuk', '/login'],
];

// per-screen overrides win over the global rules above
const SCREEN_RULES = {
  home: [
    ['txtsub', 'fear & greed', '/fear-greed'],
    ['txtsub', 'trending', '/pasar'],
    ['txtsub', 'lucky rewards', '/rewards/roda'],
    ['txtsub', 'support', '/chat-cs'],
    ['txtsub', 'notifications', '/notifikasi'],
    ['cls', 'btn-mulai', '/rewards/referral'],
    ['clssub', 'referral-card', '/rewards/referral'],
    ['clssub', 'market-card', '/pasar/detail'],
  ],
  login: [['txt', 'masuk', '/feed']],
  'register-1': [['txt', 'selanjutnya', '/register/step-2'], ['txt', 'lanjut', '/register/step-2']],
  'register-2': [['txt', 'daftar', '/register/loading'], ['txt', 'selanjutnya', '/register/loading']],
  'deposit-metode': [['txt', 'qris', '/deposit/qris'], ['txtsub', 'qris', '/deposit/qris'], ['txtsub', 'bri', '/deposit/va'], ['txt', 'virtual account', '/deposit/va'], ['txtsub', 'virtual account', '/deposit/va'], ['txt', 'va', '/deposit/va']],
  'deposit-qris-1': [['txt', 'selanjutnya', '/deposit/qris/konfirmasi'], ['txt', 'lanjut', '/deposit/qris/konfirmasi'], ['txt', 'sudah bayar', '/deposit/qris/konfirmasi']],
  'deposit-qris-2': [['txt', 'selesai', '/aset'], ['txtsub', 'konfirmasi', '/aset'], ['txtsub', 'selesai', '/aset']],
  'deposit-va1': [['txt', 'selanjutnya', '/deposit/va/konfirmasi'], ['txt', 'lanjut', '/deposit/va/konfirmasi'], ['txt', 'sudah transfer', '/deposit/va/konfirmasi']],
  'deposit-va2': [['txt', 'selesai', '/aset'], ['txtsub', 'konfirmasi', '/aset'], ['txtsub', 'selesai', '/aset']],
  tarik: [['txt', 'tarik', '/tarik/konfirmasi'], ['txt', 'lanjut', '/tarik/konfirmasi'], ['txt', 'selanjutnya', '/tarik/konfirmasi'], ['txt', 'konfirmasi', '/tarik/konfirmasi']],
  'konfirmasi-tarik': [['txt', 'konfirmasi', '/notifikasi/penarikan'], ['txt', 'tarik', '/notifikasi/penarikan']],
  'konfirmasi-pembelian': [['txt', 'beli', '/notifikasi/pembelian'], ['txt', 'konfirmasi', '/notifikasi/pembelian']],
  'pasar-detail': [['txt', 'beli', '/pasar/beli/konfirmasi']],
  'misi-rewards': [['txt', 'klaim', '/notifikasi/misi']],
  'roda-keberuntungan': [['txt', 'putar', '/notifikasi/roda']],
  'masuk-harian': [['txt', 'absen', '/notifikasi/absen'], ['txt', 'klaim', '/notifikasi/absen']],
  'program-referral': [['txt', 'salin', '/rewards/poster'], ['txt', 'lihat semua', '/rewards/teman'], ['txt', 'poster', '/rewards/poster']],
  'profil-saya-1': [['txt', 'simpan', '/profil']],
  'profil-saya-2': [['txt', 'simpan', '/profil']],
  'ubah-kata-sandi': [['txt', 'simpan', '/notifikasi/ubah-sandi'], ['txt', 'simpan kata sandi', '/notifikasi/ubah-sandi']],
  'perangkat-login': [['txt', 'keluar', '/notifikasi/keluar']],
  'rekening-bank-1': [['txt', 'simpan', '/profil/bank'], ['txtsub', 'tambah rekening', '/profil/bank/2']],
  'rekening-bank-2': [['txt', 'simpan', '/profil/bank'], ['txtsub', 'tambah rekening', '/profil/bank/3']],
  'rekening-bank-3': [['txt', 'simpan', '/profil/bank'], ['txtsub', 'tambah rekening', '/profil/bank']],
  akun: [
    ['txt', 'keluar', '/notifikasi/keluar'],
    ['txt', 'riwayat transaksi', '/riwayat/lainnya'],
    ['txt', 'deposit', '/deposit'],
    ['txt', 'penarikan', '/tarik'],
    ['txt', 'keuntungan', '/riwayat/keuntungan'],
    ['txt', 'komisi', '/riwayat/komisi'],
    ['txt', 'absen', '/rewards/harian'],
    ['txt', 'hadiah', '/riwayat/hadiah'],
    ['txt', 'misi', '/rewards/misi'],
    ['txt', 'lainnya', '/riwayat/lainnya'],
  ],
  feed: [['txt', 'buat postingan', '/feed/create'], ['txt', 'posting', '/feed/create']],
  'popup-home': [['cls', 'channel-item', '/chat-cs']],
  'buat-postingan': [['txt', 'posting', '/feed']],
  'pilihan-bank': [['txt', 'pilih bank', '/profil/bank/1']],
  'chat-cs': [['txt', 'minta bantuan', '@back']],
  'lupa-password': [['txt', 'atur ulang kata sandi', '/notifikasi/ubah-sandi']],
  'landingpage-bantuan': [['txt', 'kirim pesan', '@back']],
  'landingpage-materi-detail': [
    ['txtsub', 'sebelumnya', '/landing/materi'],
    ['txtsub', 'selanjutnya', '/landing/materi'],
    ['txtsub', 'mengenal', '/landing/materi/detail'],
    ['txtsub', 'stablecoin', '/landing/materi/detail'],
    ['txtsub', 'blockchain', '/landing/materi/detail'],
  ],
};

// clickable rows and icon controls whose behaviour lives in the class name
const CONTAINER_RE = /(list-item|menu-item|row-item|coin-row|market-row|asset-row|product-card|ranking-row|history-row|tab-item|nav-item|menu-row|setting-item|page-card|related-card|widget-card|market-card)/;
const CONTROL_RE = /(grid-item|back-btn|icon-btn|header-icon|options-btn|settings-btn|add-btn|header-btn|btn-icon|post-options-btn|share-btn|copy-btn|copy-icon)/;

// longest txtsub first so 'lihat semua materi' beats 'materi'
const ROUTES_BY_LENGTH = [
  ...RULES.filter(([kind]) => kind !== 'txtsub'),
  ...RULES.filter(([kind]) => kind === 'txtsub').sort((a, b) => b[1].length - a[1].length),
];

function matchRoute(className, text, aria, slug) {
  const cls = (className || '').toLowerCase();
  const tokens = cls.split(/\s+/).filter(Boolean);
  const t = norm(text || '');
  const a = norm(aria || '');

  // exact label beats class heuristics, class beats partial label
  const byKind = (rules, kind) => {
    for (const [k, key, to] of rules) {
      if (k !== kind) continue;
      if (kind === 'txt' && (t === key || a === key)) return to;
      if (kind === 'cls' && tokens.includes(key)) return to;
      if (kind === 'clssub' && cls.includes(key)) return to;
      if (kind === 'txtsub') {
        const hay = t.length >= a.length ? t : a;
        if (hay && hay.includes(key)) return to;
      }
    }
    return null;
  };
  const pick = (rules) =>
    byKind(rules, 'txt') || byKind(rules, 'cls') || byKind(rules, 'clssub') || byKind(rules, 'txtsub');

  const local = SCREEN_RULES[slug] || [];
  const fromLocal = pick(local);
  if (fromLocal) return fromLocal;

  if (slug.startsWith('landingpage')) {
    for (const [key, to] of LANDING_NAV) {
      if (t === key || a === key) return to;
    }
  }

  return pick(ROUTES_BY_LENGTH);
}

function toJsx(html, slug) {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/\sclass=/g, ' className=');
  s = s.replace(/\sfor=/g, ' htmlFor=');
  s = s.replace(/\sstyle="([^"]*)"/g, (_, css) => ` style={${cssToObj(css)}}`);

  // inject data-route / data-back on interactive elements
  const inject = (m, tag, attrs, inner) => {
    const clsM = attrs.match(/className="([^"]*)"/);
    const ariaM = attrs.match(/aria-label="([^"]*)"/);
    // icon-only buttons carry the meaning in the image alt text
    const altM = inner.match(/alt="([^"]*)"/i);
    const label = [ariaM && ariaM[1], altM && altM[1]].filter(Boolean).join(' ');
    const to = matchRoute(clsM ? clsM[1] : '', stripTags(inner), label, slug);
    if (!to) return m;
    if (to === '@back') return `<${tag}${attrs} data-back="1">${inner}</${tag}>`;
    return `<${tag}${attrs} data-route="${to}">${inner}</${tag}>`;
  };
  s = s.replace(/<(a|button)\b((?:"[^"]*"|'[^']*'|[^>])*)>([\s\S]*?)<\/\1>/gi, inject);

  // whole-row containers: attribute goes on the opening tag, label decides the route
  s = s.replace(/<(div|li|article|span)\b((?:"[^"]*"|'[^']*'|[^>])*)>/gi, (m, tag, attrs, offset) => {
    const clsM = attrs.match(/className="([^"]*)"/);
    if (!clsM) return m;
    if (!CONTAINER_RE.test(clsM[1]) && !CONTROL_RE.test(clsM[1])) return m;
    if (/data-(route|back)=/.test(attrs)) return m;
    const win = s.slice(offset + m.length, offset + m.length + 400);
    // icon tiles keep their label in .item-label; the first child </div> often closes an icon wrapper
    const itemLabelM = win.match(/item-label"[^>]*>([^<]*)</i);
    const shortLabel = stripTags(win.split(/<\/div>/)[0] || '');
    const label = itemLabelM
      ? stripTags(itemLabelM[1])
      : shortLabel.length > 1 ? shortLabel : stripTags(win).slice(0, 160);
    const altM = win.match(/alt="([^"]*)"/i);
    const to = matchRoute(clsM[1], label, altM ? altM[1] : '', slug);
    if (!to) return m;
    if (to === '@back') return `<${tag}${attrs} data-back="1">`;
    return `<${tag}${attrs} data-route="${to}">`;
  });

  // void elements
  s = s.replace(/<(img|br|hr|input|source)((?:"[^"]*"|'[^']*'|[^>])*?)\/?>/gi,
    (m, tag, attrs) => `<${tag}${attrs.replace(/\s+$/, '')} />`);

  // escape stray braces in text nodes so JSX stays valid
  s = s.replace(/>([^<]*)</g, (m, txt) => '>' + txt.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;') + '<');

  return s.trim();
}

// ---------------------------------------------------------------- asset merge
fs.mkdirSync(IMG_OUT, { recursive: true });
fs.mkdirSync(SCR_OUT, { recursive: true });

const assetDb = new Map(); // sha1 → filename
const assetBytes = new Map();
const perScreenMap = new Map(); // slug → Map(origRel → /assets/img/name)

const screens = fs.readdirSync(STAGE)
  .filter((d) => fs.statSync(path.join(STAGE, d)).isDirectory())
  .sort();

let copied = 0;
for (const slug of screens) {
  const imgDir = path.join(STAGE, slug, 'images');
  const map = new Map();
  perScreenMap.set(slug, map);
  if (!fs.existsSync(imgDir)) continue;
  for (const file of fs.readdirSync(imgDir)) {
    if (file === 'screenshot.png') continue;
    const full = path.join(imgDir, file);
    const buf = fs.readFileSync(full);
    const hash = crypto.createHash('sha1').update(buf).digest('hex');
    let name = assetDb.get(hash);
    if (!name) {
      const ext = path.extname(file);
      name = hash.slice(0, 10) + ext;
      assetDb.set(hash, name);
      assetBytes.set(name, buf);
      fs.writeFileSync(path.join(IMG_OUT, name), buf);
      copied++;
    }
    map.set(file, `/assets/img/${name}`);
  }
}

// ---------------------------------------------------------------- per screen
const SCR_OUT_ROOT = SCR_OUT;
if (fs.existsSync(SCR_OUT_ROOT)) fs.rmSync(SCR_OUT_ROOT, { recursive: true, force: true });

// feature folders
const GROUP = {
  home: 'home',
  'welcome-page': 'auth', 'register-1': 'auth', 'register-2': 'auth', 'loading-register': 'auth',
  login: 'auth', 'lupa-password': 'auth',
  pasar: 'market', 'pasar-detail': 'market', pencarian: 'market', 'konfirmasi-pembelian': 'market', 'fear-and-greed': 'market',
  'deposit-metode': 'wallet', 'deposit-qris-1': 'wallet', 'deposit-qris-2': 'wallet',
  'deposit-va1': 'wallet', 'deposit-va2': 'wallet', tarik: 'wallet', 'konfirmasi-tarik': 'wallet',
  'aset-saya': 'wallet', 'aset-kosong': 'wallet', portofolio: 'wallet',
  'misi-rewards': 'rewards', 'roda-keberuntungan': 'rewards', 'masuk-harian': 'rewards',
  'program-referral': 'rewards', 'poster-undangan': 'rewards', 'teman-diundang': 'rewards',
  feed: 'feed', 'buat-postingan': 'feed', 'popup-home': 'feed',
  akun: 'profile', 'profil-saya-1': 'profile', 'profil-saya-2': 'profile', 'alamat-pengiriman': 'profile',
  'pilihan-bank': 'profile', 'rekening-bank-1': 'profile', 'rekening-bank-2': 'profile', 'rekening-bank-3': 'profile',
  'ubah-kata-sandi': 'profile', 'perangkat-login': 'profile', bahasa: 'profile', rank: 'profile', 'tentang-kami': 'profile',
  'riwayat-penarikan': 'history', 'riwayat-misi': 'history', 'riwayat-lainnya': 'history', 'riwayat-komisi': 'history',
  'riwayat-keuntungan': 'history', 'riwayat-hadiah': 'history', 'riwayat-deposit': 'history', 'riwayat-absen': 'history',
  'syarat-layanan': 'legal', 'syarat-ketentuan': 'legal', 'kebijakan-privasi': 'legal', 'perjanjian-klien': 'legal',
  'landingpage-1': 'landing', landingpage2: 'landing', 'landingpage-bantuan': 'landing', 'landingpage-hadiah': 'landing',
  'landingpage-holding': 'landing', 'landingpage-materi': 'landing', 'landingpage-materi-detail': 'landing',
  'landingpage-referral': 'landing', 'landingpage-tentang': 'landing',
  'menu-notif': 'notifications', 'notifikasi-berhasil-daftar': 'notifications', 'notifikasi-gagal-daftar': 'notifications',
  'notifikasi-nomor-tdk-ada': 'notifications', 'notifikasi-kata-sandi-salah': 'notifications',
  'notif-saldo-tdk-ckup': 'notifications', 'notifikasi-universal': 'notifications', 'notifikasi-misi': 'notifications',
  'notifikasi-roda': 'notifications', 'notifikasi-absen': 'notifications', 'notifikasi-penarikan': 'notifications',
  'notifikasi-keluar': 'notifications', 'notifikasi-brhasil-ubah-sandi': 'notifications',
  'notifikasi-berhasil-pembelian': 'notifications',
  faq: 'support', 'chat-cs': 'support',
};

const FIXES = JSON.parse(fs.readFileSync(path.join(ROOT, '_tools/figma-fixes.json'), 'utf8'));

// ── shared shells ───────────────────────────────────────────────────────────
// Screens listed here render through a component in app/src/components instead
// of carrying a private copy of the shell markup.
const NAV_SLUGS = new Set(['home', 'akun', 'aset-kosong', 'aset-saya', 'feed', 'pasar']);
const POPUP_SLUGS = new Set([
  'notifikasi-absen', 'notifikasi-berhasil-daftar', 'notifikasi-berhasil-pembelian',
  'notifikasi-brhasil-ubah-sandi', 'notifikasi-gagal-daftar', 'notifikasi-kata-sandi-salah',
  'notifikasi-keluar', 'notifikasi-misi', 'notifikasi-nomor-tdk-ada', 'notifikasi-penarikan',
  'notifikasi-roda', 'notifikasi-universal', 'notif-saldo-tdk-ckup',
]);
const SHEET_SLUGS = new Set(['popup-home']);

// Vertical rhythm nudges measured against the Figma frame — the export stacks
// sections with guessed paddings, so each block is pulled back onto the y of
// its first text node. Values are px deltas, re-measured after every change.
const LAYOUT_FIXES = {
  'pasar-detail': [
    ['#section-chart .chart-graphic', 'height', '117px'],
    ['#section-details .details-grid', 'padding-top', '21px'],
    ['#section-progress .progress-container', 'padding-top', '14px'],
    ['#section-input .input-section-container', 'margin-top', '45px'],
    ['#section-notes .notes-container', 'padding-top', '6px'],
    ['#section-orderbook .orderbook-container', 'padding-top', '35px'],
    ['#section-footer .footer-container', 'margin-top', '0'],
    ['#section-footer .footer-container', 'padding-bottom', '47px'],
  ],
};

const plain = (s) => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const imgList = (s) => [...s.matchAll(/<img([^>]*)>/g)].map((m) => ({
  src: (m[1].match(/src="([^"]+)"/) || [])[1] || '',
  alt: (m[1].match(/alt="([^"]*)"/) || [])[1] || '',
}));
const buttonsOf = (s) => [...s.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)].map((m) => ({
  label: plain(m[2]),
  to: (m[1].match(/data-route="([^"]+)"/) || [])[1] || '',
  cls: (m[1].match(/className="([^"]*)"/) || [])[1] || '',
}));
const stripNav = (s) => s
  .replace(/<section[^>]*id="section-bottom-nav"[\s\S]*?<\/section>\s*/i, '')
  .replace(/<nav[^>]*bottom-nav[\s\S]*?<\/nav>\s*/i, '');
const stripNavCss = (s) => s.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel) =>
  /#section-bottom-nav|\.bottom-nav|\.nav-item|\.center-icon-bg/.test(sel) ? '' : m);

const built = [];
for (const slug of screens) {
  const htmlPath = path.join(STAGE, slug, 'index.html');
  if (!fs.existsSync(htmlPath)) continue;
  const raw = fs.readFileSync(htmlPath, 'utf8');
  const styleM = raw.match(/<style id="sections-styles">([\s\S]*?)<\/style>/i);
  const bodyM = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyM) { console.warn('no body:', slug); continue; }

  let css = styleM ? styleM[1] : '';
  let body = bodyM[1];

  // newer exports ship the reset/utilities in global.css
  const globalCssPath = path.join(STAGE, slug, 'global.css');
  const globalCss = fs.existsSync(globalCssPath) ? fs.readFileSync(globalCssPath, 'utf8') : '';
  if (globalCss) css = globalCss + '\n' + css;
  // the body rule is dropped below, so keep its page background on the screen root
  const bodyBg = globalCss.match(/body\s*\{[^}]*?background:\s*([^;]+);/);

  // flattened layers come out as <img style="height:100%">; a 1px gridline
  // stretched to the group height smears, so flat assets keep their ratio
  body = body.replace(/<img\b[^>]*>/g, (tag) => {
    const src = (tag.match(/src="images\/([^"]+)"/) || [])[1];
    const st = (tag.match(/style="([^"]*)"/) || [])[1];
    if (!src || !st || !/height:\s*100%/.test(st) || !/object-fit:\s*fill/.test(st)) return tag;
    let head = '';
    try {
      head = fs.readFileSync(path.join(STAGE, slug, 'images', src), 'utf8').slice(0, 300);
    } catch {
      return tag;
    }
    const w = Number((head.match(/\bwidth="([\d.]+)"/) || [])[1]);
    const h = Number((head.match(/\bheight="([\d.]+)"/) || [])[1]);
    if (!w || !h || h / w > 0.15) return tag;
    return tag.replace(st, st.replace(/height:\s*100%/g, 'height: auto'));
  });

  // rewrite asset refs
  const map = perScreenMap.get(slug);
  for (const [orig, dest] of map) {
    const re = new RegExp('images/' + orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    css = css.replace(re, dest);
    body = body.replace(re, dest);
  }
  // drop screenshot.png leftovers
  css = css.replace(/\/assets\/img\/[^"')]*screenshot[^"')]*/g, '');

  // vh → container height units (phone frame is a size container)
  css = css.replace(/(\d*\.?\d+)vh/g, (_, num) => (num === '100' ? '100cqh' : `${num}cqh`));

  // body/html rules belong to the global stylesheet
  css = css.replace(/(^|})\s*(html|body)([^{]*)\{[^}]*\}/g, '$1');

  // comments would otherwise be absorbed into the first scoped selector
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // the tab bar and popup shells live in components/, drop their rules here
  if (NAV_SLUGS.has(slug)) css = stripNavCss(css);

  // some exports wrap every section in its own .app-container, so a
  // min-height/background on that class would stretch each block to a full
  // viewport; keep one page shell on the root and flatten the copies
  const acCount = (body.match(/class="app-container"/g) || []).length;
  const acM = css.match(/\.app-container\s*\{([^}]*)\}/);
  let acHoist = '';
  if (acCount > 1 && acM) {
    const decl = (prop) => {
      const m = acM[1].match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+);`));
      return m ? m[1].trim() : '';
    };
    const minH = decl('min-height');
    const bg = decl('background') || decl('background-color');
    const fg = decl('color');
    if (minH || bg) {
      acHoist = [
        `.scr-${slug} {${minH ? ` min-height: ${minH};` : ''} width: 100%; max-width: 412px; margin: 0 auto;${bg ? ` background: ${bg};` : ''}${fg ? ` color: ${fg};` : ''} }`,
        `.scr-${slug} section > .app-container { min-height: 0; background: none; }`,
      ].join('\n');
    }
  }

  const scope = `.scr-${slug}`;
  const fixRules = FIXES[slug] || [];
  // doubled class keeps these above the scoped rules from the export
  const fixCss = fixRules
    .map((r) => `.scr-${slug} .${r.cls}.${r.cls} { ${r.prop}: ${r.to}; }`)
    .join('\n');
  const layoutCss = (LAYOUT_FIXES[slug] || [])
    .map(([sel, prop, val]) => `.scr-${slug} ${sel} { ${prop}: ${val}; }`)
    .join('\n');
  const scopedCss = [
    `/* ${slug} — ported from Figma export, typography re-synced */`,
    bodyBg ? `.scr-${slug} { background: ${bodyBg[1].trim()}; }` : '',
    scopeCss(css, scope),
    acHoist,
    fixCss ? `/* figma re-sync */\n${fixCss}` : '',
    layoutCss ? `/* vertical rhythm */\n${layoutCss}` : '',
  ].filter(Boolean).join('\n');

  // CSS lives inline in the component: template literals need these two escaped
  const inlineCss = scopedCss.replace(/`/g, '').replace(/\$\{/g, '\\${');

  const jsxFull = toJsx(body, slug);
  const jsxBody = NAV_SLUGS.has(slug) ? stripNav(jsxFull) : jsxFull;
  const comp = pascal(slug);
  const group = GROUP[slug] || 'misc';
  const dir = path.join(SCR_OUT_ROOT, group);
  fs.mkdirSync(dir, { recursive: true });

  let file;
  if (POPUP_SLUGS.has(slug)) {
    // notification screens keep only their copy — the modal shell is shared
    const imgs = imgList(jsxFull).filter((i) => i.src);
    const icon = (imgs.find((i) => /icon|success|alert|warning|exit|reward/i.test(i.alt)) || imgs[0] || {}).src || '';
    const titleM = jsxFull.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    const bodyM = jsxFull.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    const buttons = buttonsOf(jsxFull);
    const layout = buttons.length > 1 || buttons.some((b) => /btn-primary/.test(b.cls))
      ? 'confirm'
      : 'info';
    const actions = buttons.map((b) => (b.to ? { label: b.label, to: b.to } : { label: b.label }));
    file = `// ${slug} — content only, the shell is components/NotificationPopup.jsx
import NotificationPopup from '../../components/NotificationPopup.jsx';

export default function ${comp}() {
  return (
    <NotificationPopup
      layout="${layout}"
${icon ? `      icon="${icon}"\n` : ''}      title=${JSON.stringify(plain(titleM ? titleM[1] : ''))}
      body=${JSON.stringify(bodyM ? bodyM[1].replace(/\s+/g, ' ').trim() : '')}
      actions={${JSON.stringify(actions)}}
    />
  );
}
`;
  } else if (SHEET_SLUGS.has(slug)) {
    // the channel popup keeps only its content — the sheet is shared
    const imgs = imgList(jsxFull).filter((i) => i.src);
    const hero = (imgs.find((i) => /banner|hero/i.test(i.alt)) || imgs[0] || {}).src || '';
    const titleM = jsxFull.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    const descM = jsxFull.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    const channels = [...jsxFull.matchAll(/<a[^>]*class(?:Name)?="[^"]*channel-item[^"]*"[\s\S]*?<\/a>/g)].map((m) => ({
      name: plain((m[0].match(/channel-name"[^>]*>([\s\S]*?)<\//) || [])[1] || ''),
      label: plain((m[0].match(/channel-label"[^>]*>([\s\S]*?)<\//) || [])[1] || 'Saluran'),
      icon: (m[0].match(/<img[^>]*src="([^"]+)"/) || [])[1] || '',
    }));
    const dismiss = buttonsOf(jsxFull).map((b) => b.label)[0] || 'Nanti saja';
    const title = (titleM ? titleM[1] : '').replace(/<br\s*\/?>/gi, '<br />').replace(/\s+/g, ' ').trim();
    file = `// ${slug} — content only, the shell is components/ChannelSheet.jsx
import ChannelSheet from '../../components/ChannelSheet.jsx';

export default function ${comp}() {
  return (
    <ChannelSheet
      image="${hero}"
      title=${JSON.stringify(title)}
      description=${JSON.stringify(plain(descM ? descM[1] : ''))}
      dismissLabel=${JSON.stringify(dismiss)}
      channels={${JSON.stringify(channels)}}
    />
  );
}
`;
  } else {
    const navImport = NAV_SLUGS.has(slug) ? "import BottomNav from '../../components/BottomNav.jsx';\n" : '';
    const navTag = NAV_SLUGS.has(slug) ? '      <BottomNav />\n' : '';
    file = `// ${slug} — ported from the Figma export, typography re-synced to Figma
${navImport}const css = \`
${inlineCss}
\`;

export default function ${comp}() {
  return (
    <div className="scr-${slug}">
      <style>{css}</style>
${jsxBody.split('\n').map((l) => '      ' + l).join('\n')}
${navTag}    </div>
  );
}
`;
  }

  // loading screen has no buttons in the design — advance to the app shell
  if (slug === 'loading-register') {
    file = `import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
` + file.replace(
      '  return (',
      `  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => navigate('/feed'), 2200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (`
    );
  }
  fs.writeFileSync(path.join(dir, `${comp}.jsx`), file);
  built.push({ slug, comp, group });
}

// ---------------------------------------------------------------- route table
const ROUTE_MAP = {
  'welcome-page': '/welcome',
  home: '/home',
  'register-1': '/register',
  'register-2': '/register/step-2',
  'loading-register': '/register/loading',
  login: '/login',
  'lupa-password': '/lupa-password',
  'syarat-layanan': '/legal/syarat-layanan',
  'syarat-ketentuan': '/legal/syarat-ketentuan',
  'kebijakan-privasi': '/legal/kebijakan-privasi',
  'perjanjian-klien': '/legal/perjanjian-klien',
  feed: '/feed',
  'buat-postingan': '/feed/create',
  'popup-home': '/popup-home',
  pasar: '/pasar',
  'pasar-detail': '/pasar/detail',
  pencarian: '/pasar/cari',
  'konfirmasi-pembelian': '/pasar/beli/konfirmasi',
  'fear-and-greed': '/fear-greed',
  'aset-saya': '/aset',
  'aset-kosong': '/aset/kosong',
  portofolio: '/aset/portofolio',
  'deposit-metode': '/deposit',
  'deposit-qris-1': '/deposit/qris',
  'deposit-qris-2': '/deposit/qris/konfirmasi',
  'deposit-va1': '/deposit/va',
  'deposit-va2': '/deposit/va/konfirmasi',
  tarik: '/tarik',
  'konfirmasi-tarik': '/tarik/konfirmasi',
  'misi-rewards': '/rewards/misi',
  'roda-keberuntungan': '/rewards/roda',
  'masuk-harian': '/rewards/harian',
  'program-referral': '/rewards/referral',
  'poster-undangan': '/rewards/poster',
  'teman-diundang': '/rewards/teman',
  akun: '/akun',
  'profil-saya-1': '/profil',
  'profil-saya-2': '/profil/edit',
  'alamat-pengiriman': '/profil/alamat',
  'pilihan-bank': '/profil/bank',
  'rekening-bank-1': '/profil/bank/1',
  'rekening-bank-2': '/profil/bank/2',
  'rekening-bank-3': '/profil/bank/3',
  'ubah-kata-sandi': '/profil/password',
  'perangkat-login': '/profil/perangkat',
  bahasa: '/profil/bahasa',
  'tentang-kami': '/tentang-kami',
  rank: '/rank',
  'riwayat-penarikan': '/riwayat/penarikan',
  'riwayat-misi': '/riwayat/misi',
  'riwayat-lainnya': '/riwayat/lainnya',
  'riwayat-komisi': '/riwayat/komisi',
  'riwayat-keuntungan': '/riwayat/keuntungan',
  'riwayat-hadiah': '/riwayat/hadiah',
  'riwayat-deposit': '/riwayat/deposit',
  'riwayat-absen': '/riwayat/absen',
  faq: '/faq',
  'chat-cs': '/chat-cs',
  'menu-notif': '/notifikasi',
  'notifikasi-berhasil-daftar': '/notifikasi/berhasil-daftar',
  'notifikasi-gagal-daftar': '/notifikasi/gagal-daftar',
  'notifikasi-nomor-tdk-ada': '/notifikasi/nomor-tidak-ada',
  'notifikasi-kata-sandi-salah': '/notifikasi/kata-sandi-salah',
  'notif-saldo-tdk-ckup': '/notifikasi/saldo-kurang',
  'notifikasi-universal': '/notifikasi/universal',
  'notifikasi-misi': '/notifikasi/misi',
  'notifikasi-roda': '/notifikasi/roda',
  'notifikasi-absen': '/notifikasi/absen',
  'notifikasi-penarikan': '/notifikasi/penarikan',
  'notifikasi-keluar': '/notifikasi/keluar',
  'notifikasi-brhasil-ubah-sandi': '/notifikasi/ubah-sandi',
  'notifikasi-berhasil-pembelian': '/notifikasi/pembelian',
  'landingpage-1': '/landing',
  landingpage2: '/landing/v2',
  'landingpage-bantuan': '/landing/bantuan',
  'landingpage-hadiah': '/landing/hadiah',
  'landingpage-holding': '/landing/holding',
  'landingpage-materi': '/landing/materi',
  'landingpage-materi-detail': '/landing/materi/detail',
  'landingpage-referral': '/landing/referral',
  'landingpage-tentang': '/landing/tentang',
};

const routes = built.map((b) => ({ path: ROUTE_MAP[b.slug] || '/' + b.slug, slug: b.slug, comp: b.comp, group: b.group }));
const missing = built.filter((b) => !ROUTE_MAP[b.slug]).map((b) => b.slug);
const unused = Object.keys(ROUTE_MAP).filter((s) => !built.find((b) => b.slug === s));

fs.writeFileSync(path.join(APP, 'src/screen-map.js'),
  `// generated by _tools/gen.mjs — do not edit by hand\nexport const ROUTES = ${JSON.stringify(routes, null, 2)};\n`);

console.log('screens built:', built.length);
console.log('assets unique:', assetDb.size, 'written:', copied);
console.log('assets total MB:', (Array.from(assetBytes.values()).reduce((a, b) => a + b.length, 0) / 1048576).toFixed(1));
if (missing.length) console.log('NO ROUTE:', missing.join(', '));
if (unused.length) console.log('ROUTE WITHOUT SCREEN:', unused.join(', '));
