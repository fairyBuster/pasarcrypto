// Display helpers for the market screens. The API sends money as strings
// ("20000.00"), so every number is formatted for an Indonesian reader.

const whole = new Intl.NumberFormat('id-ID');
const decimal = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const idr = (value) => whole.format(Math.round(Number(value) || 0));

// "Robot 2" -> "R2", used by the round coin badge
export const initials = (name) =>
  String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || '')
    .join('')
    .toUpperCase() || '?';

// a fixed profit is a rupiah amount per day, a percentage one is a rate
// (the rupiah figure carries the Rp prefix so it never reads as a percent)
export const rateValue = (product) =>
  product?.profit_type === 'fixed'
    ? `Rp ${idr(product.profit_rate)}`
    : `${decimal.format(Number(product?.profit_rate) || 0)}%`;

export const rateLabel = (product) =>
  product?.profit_type === 'fixed' ? 'Profit / Hari' : 'Est. APR';

// the home card quotes one APR per product, so a fixed daily profit is expressed
// as a share of the price the way AsetSaya measures a holding
export const ratePercent = (product) => {
  const rate = Number(product?.profit_rate) || 0;
  if (product?.profit_type !== 'fixed') return `${decimal.format(rate)}%`;
  const price = Number(product?.price) || 0;
  return `${decimal.format(price > 0 ? (rate / price) * 100 : 0)}%`;
};

// the frames show a 24h volume the API does not send; it is seeded by the hour
// and the product id so it stays put and rolls over on the hour
export const volumeFor = (hour, id) => {
  const seed = Math.sin((hour + 1) * (Number(id) + 3) * 0.618) * 10000;
  return 12.5 + (seed - Math.floor(seed)) * 4;
};

export const volumeText = (hour, id) =>
  `${volumeFor(hour, id).toFixed(1).replace('.', ',')} Jt USDT`;

// the admin fills a product by setting stock to 5000, so the percentage is the
// remaining stock against that ceiling; unlimited stock reads as 100%
export const STOCK_FULL = 5000;
export const quotaPercent = (product) => {
  if (!product?.stock_enabled) return 100;
  const stock = Number(product.stock);
  if (!Number.isFinite(stock) || stock <= 0) return 0;
  return Math.min(100, Math.floor((stock / STOCK_FULL) * 100));
};

// the API quotes one USD in rupiah (`rate_to_main`), so the rupiah totals are
// printed as their USDT equivalent at that live rate
export const usdtApprox = (value, rate) => {
  const price = Number(rate) || 0;
  if (!(price > 0)) return '—';
  return `≈ ${decimal.format((Number(value) || 0) / price)} USDT`;
};

// profit earned by one unit in one day
export const dailyProfit = (product) => {
  if (!product) return 0;
  const rate = Number(product.profit_rate) || 0;
  return product.profit_type === 'fixed' ? rate : (Number(product.price) || 0) * (rate / 100);
};

// what one order actually pays per day: a fixed rate is stored once per order,
// a percentage rate scales with the number of units
export const orderDailyProfit = (product, quantity) =>
  product?.profit_type === 'fixed' ? dailyProfit(product) : dailyProfit(product) * quantity;

// the API sends the account number in full, the design masks its middle
export const maskAccount = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '—';
  return digits.length >= 8
    ? `${digits.slice(0, 4)} **** ${digits.slice(-4)}`
    : `**** ${digits.slice(-4)}`;
};

// the design masks names the same way a card number is masked
export const maskName = (value) => {
  const name = String(value || '').trim();
  if (!name) return '—';
  if (name.length <= 4) return `${name.slice(0, 1)}****`;
  return `${name.slice(0, 2)}****${name.slice(-2)}`;
};

// phones arrive as +62..., the design shows the local 08... form with the
// middle hidden
export const maskPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '').replace(/^62/, '0');
  if (!digits) return '—';
  return digits.length >= 8
    ? `${digits.slice(0, 4)} **** ${digits.slice(-4)}`
    : `**** ${digits.slice(-4)}`;
};

// the design keeps the first two characters of the local part and the domain
export const maskEmail = (value) => {
  const email = String(value || '').trim();
  if (!email) return '—';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.slice(0, 2)}****@${domain}`;
};

export const dateID = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};

// the API sends Jakarta wall time ("2026-10-30 12:38:08", no offset), so the
// parts are reformatted as-is instead of being shifted by the browser zone;
// the stamp reads year-month-day hour:minute(:second) so it sorts as it reads
export const dateTimeID = (value, withSeconds = false) => {
  const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return '—';
  const clock = withSeconds && m[6] ? `${m[4]}:${m[5]}:${m[6]}` : `${m[4]}:${m[5]}`;
  return `${m[1]}-${m[2]}-${m[3]} ${clock}`;
};

// "No. Transaksi" reads as one compact 14-digit stamp (tahunbulantanggaljamdetik):
// a real trx id already embeds it, otherwise the row's own timestamp supplies it
export const trxStamp = (value, fallbackDate) => {
  const stamp = String(value || '').match(/(\d{14})/);
  if (stamp) return stamp[1];
  const d = String(fallbackDate || '').match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  return d ? `${d[1]}${d[2]}${d[3]}${d[4]}${d[5]}${d[6] || '00'}` : '—';
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// Jakarta wall clock for any Date or timestamp; every date the app prints is WIB
export const wibParts = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(date)
    .reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  const month = Number(parts.month);
  return {
    day: Number(parts.day),
    month,
    year: Number(parts.year),
    hour: parts.hour,
    minute: parts.minute,
    monthShort: MONTHS_SHORT[month - 1],
  };
};

// the wording the screens print ("31 Okt 2026, 17:59"), always in Jakarta time
// so the browser zone never shifts a receipt
export const dateTimeWIB = (value = new Date()) => {
  const { day, monthShort, year, hour, minute } = wibParts(value);
  return `${day} ${monthShort} ${year}, ${hour}:${minute}`;
};

// the API sends no reading time, and a plain words/200 estimate rounds every
// short article to "1 menit"; the extra minutes are seeded from the row so the
// spread stays put instead of reshuffling on every repaint
export const readMinutes = (item) => {
  const words = String(item?.body || '').trim().split(/\s+/).filter(Boolean).length;
  const estimate = Math.max(1, Math.round(words / 200));
  const seed = String(item?.id ?? item?.title ?? '');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 100003;
  return Math.max(estimate, 2 + (hash % 6));
};
