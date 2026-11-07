// riwayat-lainnya — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { dateTimeID, idr, trxStamp } from '../../lib/format.js';
import { readHistory, writeHistory } from '../../lib/historyCache.js';
import DateSheet, { withinRange } from '../../components/DateSheet.jsx';
import { t } from '../../lib/i18n.js';

// ten rows a page, the same slice every history screen uses
const ROWS_PER_PAGE = 10;
const MAX_PAGES = 25;

const css = `
/* riwayat-lainnya — ported from Figma export, typography re-synced */
.scr-riwayat-lainnya { background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-riwayat-lainnya *{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.scr-riwayat-lainnya .text-muted{ color: #75879c; }
.scr-riwayat-lainnya .text-value{ color: #c3cedb; }
.scr-riwayat-lainnya .text-light-muted{ color: #a9b7c8; }
.scr-riwayat-lainnya .text-blue-muted{ color: #8597ab; }
.scr-riwayat-lainnya .text-success{ color: #3ecf8e; }
.scr-riwayat-lainnya .text-white{ color: #ffffff; }
.scr-riwayat-lainnya .text-dark{ color: #0c1a2d; }
.scr-riwayat-lainnya .font-normal{ font-weight: 400; }
.scr-riwayat-lainnya .font-medium{ font-weight: 500; }
.scr-riwayat-lainnya .font-semibold{ font-weight: 600; }
.scr-riwayat-lainnya .font-bold{ font-weight: 700; }
.scr-riwayat-lainnya .text-xs{ font-size: 11px; }
.scr-riwayat-lainnya .text-sm{ font-size: 13px; }
.scr-riwayat-lainnya .text-base{ font-size: 15px; }
.scr-riwayat-lainnya .text-lg{ font-size: 18px; }
.scr-riwayat-lainnya .text-xl{ font-size: 24px; }
.scr-riwayat-lainnya .header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 16px 12px;
  }
.scr-riwayat-lainnya .icon-btn{
    background: #1f3048;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
.scr-riwayat-lainnya .header-placeholder{
    width: 40px;
    height: 40px;
  }
.scr-riwayat-lainnya .summary-container{
    display: flex;
    align-items: center;
    padding: 20px 16px;
    gap: 12px;
  }
.scr-riwayat-lainnya .summary-icon{
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #5a82bf 0%, #2c4c80 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }
.scr-riwayat-lainnya .summary-details{
    flex-grow: 1;
  }
.scr-riwayat-lainnya .mt-2{
    margin-top: 2px;
  }
.scr-riwayat-lainnya .summary-count{
    flex-shrink: 0;
  }
.scr-riwayat-lainnya .datepicker-container{
    padding: 8px 16px;
  }
.scr-riwayat-lainnya .mb-8{
    margin-bottom: 8px;
    display: block;
  }
.scr-riwayat-lainnya .date-inputs{
    display: flex;
    align-items: center;
    gap: 8px;
  }
.scr-riwayat-lainnya .date-input-box{
    flex: 1;
    background-color: #1f3048;
    border: 1px solid #2f4560;
    border-radius: 12px;
    height: 42px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 8px;
    /* the box is a button now, so the filter can actually be set */
    min-width: 0;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
  }
.scr-riwayat-lainnya .date-input-box.is-set{
    border-color: #7faae6;
    background-color: #223a5c;
  }
.scr-riwayat-lainnya .date-input-box:active{
    opacity: 0.8;
  }
.scr-riwayat-lainnya .date-text{
    display: flex;
    flex-direction: column;
  }
.scr-riwayat-lainnya .date-divider{
    width: 8px;
    height: 1.5px;
    background-color: #51657e;
  }
.scr-riwayat-lainnya .tabs-container{
    padding: 14px 16px;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }
.scr-riwayat-lainnya .tabs-container::-webkit-scrollbar{
    display: none;
  }
.scr-riwayat-lainnya .tab-btn{
    height: 30px;
    padding: 0 14px;
    border-radius: 15px;
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }
.scr-riwayat-lainnya .tab-btn.active{
    background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
  }
.scr-riwayat-lainnya .tab-btn:not(.active){
    background-color: #1f3048;
    color: #a9b7c8;
  }
.scr-riwayat-lainnya .transaction-list{
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
.scr-riwayat-lainnya .transaction-card{
    border-bottom: 1px solid rgba(201, 212, 225, 0.18);
    padding-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
.scr-riwayat-lainnya .transaction-card:last-child{
    border-bottom: none;
  }
.scr-riwayat-lainnya .tc-header{
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
.scr-riwayat-lainnya .tc-icon{
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #1f3048;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }
.scr-riwayat-lainnya .tc-title-group{
    flex-grow: 1;
    padding-top: 2px;
  }
.scr-riwayat-lainnya .mt-1{
    margin-top: 4px;
  }
.scr-riwayat-lainnya .tc-amount-group{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
.scr-riwayat-lainnya .tc-amount{
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
.scr-riwayat-lainnya .tc-status{
    background-color: rgba(62, 207, 142, 0.14);
    color: #3ecf8e;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 9px;
    font-weight: 500;
  }
.scr-riwayat-lainnya .tc-details{
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-left: 48px;
  }
.scr-riwayat-lainnya .tc-row{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
.scr-riwayat-lainnya .text-right{
    text-align: right;
    max-width: 60%;
  }
.scr-riwayat-lainnya .tc-copy-group{
    display: flex;
    align-items: center;
    gap: 6px;
  }
.scr-riwayat-lainnya .copy-icon{
    cursor: pointer;
  }
.scr-riwayat-lainnya .pagination-container{
    padding: 20px 16px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
.scr-riwayat-lainnya .pagination-controls{
    display: flex;
    align-items: center;
    gap: 8px;
  }
.scr-riwayat-lainnya .page-btn{
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
.scr-riwayat-lainnya .page-btn.nav-btn{
    background-color: rgba(31, 48, 72, 0.4);
  }
.scr-riwayat-lainnya .page-btn.active{
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
  }
.scr-riwayat-lainnya .pagination-text{
    text-align: center;
  }
/* figma re-sync */
.scr-riwayat-lainnya .text-xl.text-xl { font-size: 20px; }
.scr-riwayat-lainnya .tab-btn.tab-btn { font-size: 12px; }
.scr-riwayat-lainnya .tab-btn.tab-btn { font-weight: 600; }
.scr-riwayat-lainnya .tc-status.tc-status { font-size: 10px; }
.scr-riwayat-lainnya .tc-status.tc-status { font-weight: 600; }
.scr-riwayat-lainnya .text-value.text-value { color: #A9B7C8; }
/* the Figma frame has no loading, empty, failed or paging states */
.scr-riwayat-lainnya .list-state{ padding: 12px 0; text-align: center; font-size: 12px; line-height: 18px; color: #75879c; }
.scr-riwayat-lainnya .tc-status.processing{ background-color: rgba(201, 212, 225, 0.12); color: #c9d4e1; }
.scr-riwayat-lainnya .tc-status.failed{ background-color: rgba(242, 102, 122, 0.14); color: #f2667a; }
.scr-riwayat-lainnya .page-btn:disabled{ opacity: 0.4; cursor: default; }
.scr-riwayat-lainnya .page-btn:not(.active){ color: #a9b7c8; }
.scr-riwayat-lainnya .page-dots{ color: #75879c; font-size: 12px; padding: 0 4px; }
`;

// every kind the other history screens do not show; the endpoint filters one
// type per request, so each kind is read in turn and merged into one ledger
const TYPES = [
  'REJECT',
  'RETURN',
  'HOLD_RELEASE',
  'CREDIT',
  'DEBIT',
  'VOUCHER',
  'CASHBACK',
  'CASHBACK_DEPOSIT',
  'REDEEM',
  'TRANSFER',
  'INVESTMENTS',
  'SWAP',
];

const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'refund', label: 'Refund' },
  { key: 'adjust', label: 'Penyesuaian' },
];

// the two chips are the categories the design draws; the remaining kinds of
// this ledger stay reachable through "Semua"
const REFUND_TYPES = new Set(['REJECT', 'RETURN', 'HOLD_RELEASE']);
const ADJUST_TYPES = new Set(['CREDIT', 'DEBIT']);

const TYPE_LABEL = {
  REJECT: 'Refund',
  RETURN: 'Refund',
  HOLD_RELEASE: 'Refund',
  CREDIT: 'Penyesuaian',
  DEBIT: 'Penyesuaian',
  VOUCHER: 'Voucher',
  CASHBACK: 'Cashback',
  CASHBACK_DEPOSIT: 'Cashback',
  REDEEM: 'Penukaran hadiah',
  TRANSFER: 'Transfer',
  INVESTMENTS: 'Stake',
  SWAP: 'Tukar emas',
};

const CARD_TITLE = {
  REJECT: 'Refund penarikan',
  RETURN: 'Pengembalian dana',
  HOLD_RELEASE: 'Pelepasan saldo ditahan',
  CREDIT: 'Penyesuaian saldo',
  DEBIT: 'Penyesuaian saldo',
  VOUCHER: 'Klaim voucher',
  CASHBACK: 'Cashback pembelian',
  CASHBACK_DEPOSIT: 'Cashback deposit',
  REDEEM: 'Penukaran hadiah',
  TRANSFER: 'Transfer saldo',
  INVESTMENTS: 'Mulai stake',
  SWAP: 'Tukar emas',
};

const WALLET_LABEL = {
  BALANCE: 'Saldo Tersedia',
  BALANCE_DEPOSIT: 'Saldo Isi Ulang',
  BALANCE_HOLD: 'Saldo Ditahan',
  BALANCE_CASHBACK: 'Saldo Cashback',
};

const STATUS_LABEL = {
  PENDING: 'Diproses',
  PROCESSING: 'Diproses',
  COMPLETED: 'Berhasil',
  REJECTED: 'Gagal',
  FAILED: 'Gagal',
  CANCELLED: 'Dibatalkan',
};
const STATUS_TONE = {
  PENDING: 'processing',
  PROCESSING: 'processing',
  COMPLETED: '',
  REJECTED: 'failed',
  FAILED: 'failed',
  CANCELLED: 'failed',
};

// the ledger stores amounts unsigned; the type says which way the money went
const OUT_TYPES = new Set(['DEBIT', 'INVESTMENTS', 'SWAP']);
const isOutflow = (row) => OUT_TYPES.has(row.type)
  || (row.type === 'TRANSFER' && /\(OUT\)/i.test(String(row.description || '')));

const WALLET_KEY = {
  balance: 'Saldo Tersedia',
  balance_deposit: 'Saldo Isi Ulang',
  balance_hold: 'Saldo Ditahan',
  balance_cashback: 'Saldo Cashback',
};
const walletName = (value) => WALLET_KEY[String(value || '').toLowerCase()] || value;

// the ledger writes its lines in backend English; the card names the event in
// Indonesian, borrowing the product, voucher or prize name when it has one
const describe = (row) => {
  const text = String(row.description || '').trim();
  switch (row.type) {
    case 'REJECT':
      return 'Penarikan ditolak, dana dikembalikan';
    case 'RETURN':
      return /swap/i.test(text) ? 'Refund tukar emas yang dibatalkan' : 'Pengembalian modal investasi';
    case 'HOLD_RELEASE':
      return 'Profit ditahan dilepas saat jatuh tempo';
    case 'CREDIT':
      return 'Penambahan saldo oleh sistem';
    case 'DEBIT':
      return 'Pengurangan saldo oleh admin';
    case 'VOUCHER': {
      const code = text.replace(/^Voucher claim\s*/i, '').trim();
      return code ? `Klaim voucher ${code}` : 'Klaim voucher';
    }
    case 'CASHBACK':
      return row.product_name ? `Cashback pembelian ${row.product_name}` : 'Cashback pembelian';
    case 'CASHBACK_DEPOSIT':
      return 'Cashback dari deposit';
    case 'REDEEM':
      return row.redeem_prize_name ? `Penukaran hadiah ${row.redeem_prize_name}` : 'Penukaran hadiah';
    case 'TRANSFER': {
      const match = text.match(/dari\s+(\w+)\s+ke\s+(\w+)/i);
      const out = /\(OUT\)/i.test(text) ? ' (keluar)' : '';
      return match
        ? `Transfer dari ${walletName(match[1])} ke ${walletName(match[2])}${out}`
        : 'Perpindahan saldo antar dompet';
    }
    case 'INVESTMENTS':
      return row.product_name ? `Pembelian ${row.product_name}` : 'Pembelian investasi';
    case 'SWAP':
      return text
        .replace(/balance_hold/gi, 'Saldo Ditahan')
        .replace(/balance_deposit/gi, 'Saldo Isi Ulang') || 'Tukar emas';
    default:
      return text || '—';
  }
};

// "Dikembalikan ke" is the wording the design uses on a refund card
const walletLine = (row) => {
  if (REFUND_TYPES.has(row.type)) return 'Dikembalikan ke';
  return isOutflow(row) ? 'Dipotong dari' : 'Masuk ke';
};

// "1 2 3 … 8" with the current page always in the row
const pageItems = (current, total) => {
  if (total <= 1) return [1];
  const wanted = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((n) => {
    if (out.length && n - out[out.length - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
};

export default function RiwayatLainnya() {
  // the rows this screen painted last render immediately; the API call below
  // replaces them in the background
  const [rows, setRows] = useState(() => readHistory('lainnya')?.rows || []);
  const [status, setStatus] = useState(() => (readHistory('lainnya') ? 'ready' : 'loading'));
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  // the date boxes open this sheet; an empty range means "everything"
  const [range, setRange] = useState({ from: '', to: '' });
  const [picker, setPicker] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      // the chips and the page numbers work on the whole ledger, so every page
      // of every remaining kind is read once and cached in state
      const all = [];
      let failed = null;
      const sorted = () => [...all].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
      // each page is painted the moment it lands, so the list starts filling up
      // while the older pages are still being read
      const paint = () => {
        if (!alive) return;
        setRows(sorted());
        setStatus('ready');
      };
      for (const type of TYPES) {
        for (let n = 1; n <= MAX_PAGES; n += 1) {
          const res = await api.transactions({ type, page: n });
          if (!res.ok) {
            failed = failed || res.data;
            break;
          }
          const list = Array.isArray(res.data?.results) ? res.data.results : [];
          all.push(...list);
          paint();
          if (!res.data?.next || list.length === 0) break;
        }
      }
      if (!alive) return;

      // a failed page only sinks the screen when nothing at all came back;
      // with rows on screen the rest of the pages are simply skipped
      if (all.length === 0 && failed) {
        if (!readHistory('lainnya')) {
          setError(friendlyError(failed, 'Gagal memuat riwayat lainnya.'));
          setStatus('error');
        }
        return;
      }

      writeHistory('lainnya', { rows: sorted() });
      paint();
    })().catch(() => {
      if (!alive || readHistory('lainnya')) return;
      setError('Gagal memuat riwayat lainnya.');
      setStatus('error');
    });
    return () => {
      alive = false;
    };
  }, []);

  // the chips pick the kind, the date boxes pick the days
  const filtered = rows.filter(
    (row) =>
      (tab === 'refund'
        ? REFUND_TYPES.has(row.type)
        : tab === 'adjust'
          ? ADJUST_TYPES.has(row.type)
          : true) && withinRange(row.created_at, range.from, range.to)
  );
  const rangeActive = Boolean(range.from || range.to);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * ROWS_PER_PAGE, current * ROWS_PER_PAGE);

  // picking a start past the end (or the reverse) drags the other end along,
  // otherwise the range would silently match nothing
  const pickDate = (day) => {
    setRange((prev) => {
      const next = { ...prev, [picker === 'to' ? 'to' : 'from']: day };
      if (next.from && next.to && next.from > next.to) {
        if (picker === 'to') next.from = day;
        else next.to = day;
      }
      return next;
    });
    setPage(1);
    setPicker('');
  };

  // "sejak akun aktif": the card totals the value that actually settled, the
  // same way the other history screens sum their rows. A signed net turns
  // negative as soon as debits outnumber credits, so the summary keeps the
  // transaction volume instead; pending rows stay in the list, not the number
  const settled = rows.filter((row) => row.status === 'COMPLETED');
  const totalOther = settled.reduce((sum, row) => sum + Math.abs(Number(row.amount) || 0), 0);

  const oldest = rows.length ? rows[rows.length - 1].created_at : '';
  const newest = rows.length ? rows[0].created_at : '';
  const fromDate = oldest ? dateTimeID(oldest).slice(0, 10) : '—';
  const toDate = newest ? dateTimeID(newest).slice(0, 10) : '—';

  const firstRow = filtered.length ? (current - 1) * ROWS_PER_PAGE + 1 : 0;
  const lastRow = Math.min(current * ROWS_PER_PAGE, filtered.length);

  return (
    <div className="scr-riwayat-lainnya">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="icon-btn back-btn" aria-label={t('Back')} data-back="1">
            <img src="/assets/img/e4afe024ef.svg" alt="Back" />
          </button>
          <h1 className="header-title text-base font-semibold">{t('Riwayat Lainnya')}</h1>
          <div className="header-placeholder"></div>
        </header>
      </section>
      <section id="section-summary">
        <div className="summary-container">
          <div className="summary-icon">
            <img src="/assets/img/a904b1b8da.svg" alt="Summary Icon" />
          </div>
          <div className="summary-details">
            <p className="text-light-muted text-xs">{t('Total transaksi lainnya · sejak akun aktif')}</p>
            <p className="text-xl font-bold mt-2">{status === 'ready' ? `${idr(totalOther)} IDR` : '—'}</p>
          </div>
          <div className="summary-count">
            <span className="text-blue-muted text-xs">{status === 'ready' ? `${rows.length} transaksi` : ''}</span>
          </div>
        </div>
      </section>
      <section id="section-datepicker">
        <div className="datepicker-container">
          <label className="text-light-muted text-xs mb-8">{t('Pilih tanggal')}</label>
          <div className="date-inputs">
            <button
              type="button"
              className={`date-input-box${range.from ? ' is-set' : ''}`}
              onClick={() => setPicker('from')}
            >
              <img src="/assets/img/c844b1a1dc.svg" alt="" />
              <div className="date-text">
                <span className="text-muted text-xs">{t('Dari')}</span>
                <span className="text-white text-sm font-medium">{range.from || fromDate}</span>
              </div>
            </button>
            <div className="date-divider"></div>
            <button
              type="button"
              className={`date-input-box${range.to ? ' is-set' : ''}`}
              onClick={() => setPicker('to')}
            >
              <img src="/assets/img/c844b1a1dc.svg" alt="" />
              <div className="date-text">
                <span className="text-muted text-xs">{t('Sampai')}</span>
                <span className="text-white text-sm font-medium">{range.to || toDate}</span>
              </div>
            </button>
          </div>
        </div>
      </section>
      {/* <section id="section-tabs">
        <div className="tabs-container">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === tab ? 'tab-btn active' : 'tab-btn'}
              onClick={(event) => {
                event.stopPropagation();
                setTab(item.key);
                setPage(1);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section> */}
      <section id="section-transaction-list">
        <div className="transaction-list">
          
          
          {status === 'error' && <div className="list-state">{error}</div>}
          {status === 'ready' && visible.length === 0 && (
            <div className="list-state">
              {rangeActive
                ? 'Tidak ada transaksi pada rentang tanggal ini.'
                : 'Belum ada transaksi pada filter ini.'}
            </div>
          )}

          {visible.map((row) => {
            const out = isOutflow(row);
            const tone = STATUS_TONE[row.status] || '';
            return (
              <article className="transaction-card" key={row.id}>
                <div className="tc-header">
                  <div className="tc-icon">
                    <img src="/assets/img/849e64958e.svg" alt="" />
                  </div>
                  <div className="tc-title-group">
                    <h3 className="text-white text-sm font-semibold">{CARD_TITLE[row.type] || 'Transaksi'}</h3>
                    <p className="text-muted text-xs mt-1">{dateTimeID(row.created_at, true)} WIB</p>
                  </div>
                  <div className="tc-amount-group">
                    <div className={`tc-amount text-sm font-semibold ${out ? 'text-white' : 'text-success'}`}>
                      {out ? '-' : '+'}{idr(row.amount)} <span className="text-blue-muted text-xs font-normal">{t('IDR')}</span>
                    </div>
                    <div className={`tc-status ${tone}`.trim()}>{STATUS_LABEL[row.status] || row.status}</div>
                  </div>
                </div>
                <div className="tc-details">
                  <div className="tc-row">
                    <span className="text-muted text-xs">{t('Jenis')}</span>
                    <span className="text-value text-xs">{TYPE_LABEL[row.type] || row.type}</span>
                  </div>
                  <div className="tc-row">
                    <span className="text-muted text-xs">{t('Keterangan')}</span>
                    <span className="text-value text-xs text-right">{describe(row)}</span>
                  </div>
                  {WALLET_LABEL[row.wallet_type] && (
                    <div className="tc-row">
                      <span className="text-muted text-xs">{walletLine(row)}</span>
                      <span className="text-value text-xs">{WALLET_LABEL[row.wallet_type]}</span>
                    </div>
                  )}
                  <div className="tc-row">
                    <span className="text-muted text-xs">{t('No. Transaksi')}</span>
                    <div className="tc-copy-group">
                      <span className="text-value text-xs">{trxStamp(row.trx_id, row.created_at)}</span>
                      <img src="/assets/img/eaeec8e3f8.svg" alt="Copy" className="copy-icon" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
      
          

      
          

      
          

      
        </div>
      </section>
      {/* nothing to page through while the list is empty or failed to load */}
      {status === 'ready' && filtered.length > 0 && (
      <section id="section-pagination">
        <div className="pagination-container">
          {filtered.length > 0 && (
            <div className="pagination-controls">
              <button
                type="button"
                className="page-btn nav-btn"
                aria-label={t('Previous')}
                disabled={current <= 1}
                onClick={(event) => {
                  event.stopPropagation();
                  setPage(Math.max(1, current - 1));
                  event.currentTarget.closest('.phone-scroll')?.scrollTo(0, 0);
                }}
              >
                <img src="/assets/img/be233d23da.svg" alt="" />
              </button>
              {pageItems(current, totalPages).map((item, index) =>
                item === '…' ? (
                  <span className="page-dots" key={`dots-${index}`}>…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={item === current ? 'page-btn active' : 'page-btn'}
                    onClick={(event) => {
                      event.stopPropagation();
                      setPage(item);
                      event.currentTarget.closest('.phone-scroll')?.scrollTo(0, 0);
                    }}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                className="page-btn nav-btn"
                aria-label={t('Next')}
                disabled={current >= totalPages}
                onClick={(event) => {
                  event.stopPropagation();
                  setPage(Math.min(totalPages, current + 1));
                  event.currentTarget.closest('.phone-scroll')?.scrollTo(0, 0);
                }}
              >
                <img src="/assets/img/f55e6b8d63.svg" alt="" />
              </button>
            </div>
          )}
          <p className="pagination-text text-muted text-xs">
            Menampilkan {firstRow}–{lastRow} dari {filtered.length} transaksi
          </p>
        </div>
      </section>
      )}
      <DateSheet
        open={picker !== ''}
        title={picker === 'to' ? 'Pilih tanggal akhir' : 'Pilih tanggal mulai'}
        value={picker === 'to' ? range.to : range.from}
        fallback={newest}
        onPick={pickDate}
        onClear={() => {
          setRange({ from: '', to: '' });
          setPage(1);
          setPicker('');
        }}
        onClose={() => setPicker('')}
      />
    </div>
  );
}
