// riwayat-hadiah — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { dateTimeID, idr, trxStamp } from '../../lib/format.js';
import DateSheet, { withinRange } from '../../components/DateSheet.jsx';
import { t } from '../../lib/i18n.js';

// ten rows a page, the same slice every history screen uses
const ROWS_PER_PAGE = 10;
const MAX_PAGES = 25;

// the design splits the gifts by what was won
const TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'saldo', label: 'Saldo' },
  { key: 'barang', label: 'Barang' },
];

const STATUS_LABEL = {
  PENDING: 'Diproses',
  PROCESSING: 'Diproses',
  COMPLETED: 'Berhasil',
  REJECTED: 'Gagal',
  FAILED: 'Gagal',
  CANCELLED: 'Gagal',
};
const STATUS_TONE = {
  PENDING: 'processing',
  PROCESSING: 'processing',
  COMPLETED: 'success',
  REJECTED: 'failed',
  FAILED: 'failed',
  CANCELLED: 'failed',
};

// a bonus lands in one of the wallets the design names
const WALLET_LABEL = {
  BALANCE: 'Saldo Tersedia',
  BALANCE_DEPOSIT: 'Saldo Isi Ulang',
  BALANCE_CASHBACK: 'Saldo Cashback',
  BALANCE_HOLD: 'Saldo Ditahan',
};

// the roulette stores the prize name in the description; a physical prize keeps
// its name there, a balance prize only repeats the amount as its name
const prizeName = (row) => String(row.description || '')
  .replace(/^Roulette prize(?: redemption)?:\s*/i, '')
  .replace(/\s*\(\d+\s*points\)$/i, '')
  .trim();

// a physical prize credits no balance, so its transaction carries a zero amount
const isItem = (row) => Number(row.amount) === 0;

// the card title names where the gift came from; the trx id carries the source
const giftSource = (row) => {
  const id = String(row.trx_id || '');
  const description = String(row.description || '');
  if (id.startsWith('RLT-') || /^Roulette prize/i.test(description)) return 'Roda Keberuntungan';
  if (id.startsWith('REG-') || /registration bonus/i.test(description)) return 'Bonus Pendaftaran';
  return 'Bonus';
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

const css = `
/* riwayat-hadiah — ported from Figma export, typography re-synced */
.scr-riwayat-hadiah { background: linear-gradient(180deg, var(--bg-main-start) 0%, var(--bg-main-mid1) 30%, var(--bg-main-mid2) 70%, var(--bg-main-end) 100%); }
.scr-riwayat-hadiah{
  --bg-main-start: #0c1a2d;
  --bg-main-mid1: #13263d;
  --bg-main-mid2: #0f2036;
  --bg-main-end: #0a1626;
  --bg-surface: #1f3048;
  
  --text-primary: #ffffff;
  --text-secondary: #a9b7c8;
  --text-muted: #75879c;
  --text-value: #c3cedb;
  --text-dark: #0c1a2d;
  
  --accent-green: #3ecf8e;
  --accent-yellow: #ffd77a;
  
  --border-color: rgba(201, 212, 225, 0.18);
  --border-input: #2f4560;
  
  --bg-success-light: rgba(62, 207, 142, 0.14);
  --bg-processing-light: rgba(201, 212, 225, 0.12);
  --text-processing: #c9d4e1;
}
.scr-riwayat-hadiah{
  padding: 0;
  font-family: 'Inter', sans-serif;
  width: 100%;
  min-height: 100cqh;
  background: linear-gradient(180deg, var(--bg-main-start) 0%, var(--bg-main-mid1) 30%, var(--bg-main-mid2) 70%, var(--bg-main-end) 100%);
  color: var(--text-primary);
  overflow-x: hidden;
}
.scr-riwayat-hadiah button{
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
}
.scr-riwayat-hadiah .text-primary{ color: var(--text-primary); }
.scr-riwayat-hadiah .text-secondary{ color: var(--text-secondary); }
.scr-riwayat-hadiah .text-muted{ color: var(--text-muted); }
.scr-riwayat-hadiah .text-value{ color: var(--text-value); }
.scr-riwayat-hadiah .text-green{ color: var(--accent-green); }
.scr-riwayat-hadiah .text-yellow{ color: var(--accent-yellow); }
.scr-riwayat-hadiah .font-bold{ font-weight: 700; }
.scr-riwayat-hadiah .font-medium{ font-weight: 500; }
.scr-riwayat-hadiah .font-normal{ font-weight: 400; }
.scr-riwayat-hadiah .text-xs{ font-size: 10px; line-height: 1.2; }
.scr-riwayat-hadiah .text-sm{ font-size: 12px; line-height: 1.4; }
.scr-riwayat-hadiah .text-base{ font-size: 14px; line-height: 1.5; }
.scr-riwayat-hadiah .text-lg{ font-size: 16px; line-height: 1.5; }
.scr-riwayat-hadiah .text-xl{ font-size: 20px; line-height: 1.2; }
.scr-riwayat-hadiah .app-header{
    display: flex;
    align-items: center;
    padding: 20px 16px 10px;
    gap: 12px;
  }
.scr-riwayat-hadiah .back-btn{
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: var(--bg-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
.scr-riwayat-hadiah .header-title{
    margin: 0;
    flex: 1;
    text-align: center;
  }
.scr-riwayat-hadiah .header-spacer{
    width: 40px;
    flex-shrink: 0;
  }
.scr-riwayat-hadiah #section-summary{
    padding: 14px 16px 0;
  }
.scr-riwayat-hadiah .summary-container{
    display: flex;
    align-items: center;
    gap: 12px;
  }
.scr-riwayat-hadiah .summary-icon-wrapper{
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(135deg, #5a82bf 0%, #2c4c80 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
.scr-riwayat-hadiah .summary-content{
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
  }
.scr-riwayat-hadiah .summary-text{
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
.scr-riwayat-hadiah #section-filters{
    padding: 16px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
.scr-riwayat-hadiah .date-filter-wrapper{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-riwayat-hadiah .date-inputs-container{
    display: flex;
    align-items: center;
    gap: 8px;
  }
.scr-riwayat-hadiah .date-input-box{
    flex: 1;
    background-color: var(--bg-surface);
    border: 1px solid var(--border-input);
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
.scr-riwayat-hadiah .date-input-box.is-set{
    border-color: #7faae6;
    background-color: #223a5c;
  }
.scr-riwayat-hadiah .date-input-box:active{
    opacity: 0.8;
  }
.scr-riwayat-hadiah .date-input-text{
    display: flex;
    flex-direction: column;
  }
.scr-riwayat-hadiah .date-divider{
    width: 8px;
    height: 2px;
    background-color: #51657e;
  }
.scr-riwayat-hadiah .category-filter-wrapper{
    display: flex;
    gap: 8px;
  }
.scr-riwayat-hadiah .cat-pill{
    height: 30px;
    padding: 0 14px;
    border-radius: 15px;
    background-color: var(--bg-surface);
    display: flex;
    align-items: center;
    justify-content: center;
  }
.scr-riwayat-hadiah .cat-pill.active{
    background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
    color: var(--text-dark);
  }
.scr-riwayat-hadiah #section-history-list{
    padding: 16px 16px 0;
  }
.scr-riwayat-hadiah .history-list-container{
    display: flex;
    flex-direction: column;
  }
.scr-riwayat-hadiah .history-card{
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color);
  }
.scr-riwayat-hadiah .history-card:last-child{
    border-bottom: none;
  }
.scr-riwayat-hadiah .card-header{
    display: flex;
    align-items: center;
    gap: 12px;
  }
.scr-riwayat-hadiah .card-icon{
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background-color: var(--bg-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
.scr-riwayat-hadiah .card-title-area{
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }
.scr-riwayat-hadiah .card-title-area h3{
    margin: 0;
  }
.scr-riwayat-hadiah .card-status-area{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
.scr-riwayat-hadiah .status-pill{
    padding: 3px 7px;
    border-radius: 9px;
    font-weight: 500;
  }
.scr-riwayat-hadiah .status-pill.success{
    background-color: var(--bg-success-light);
    color: var(--accent-green);
  }
.scr-riwayat-hadiah .status-pill.processing{
    background-color: var(--bg-processing-light);
    color: var(--text-processing);
  }
.scr-riwayat-hadiah .card-details{
    margin: 0;
    padding: 0 0 0 48px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
.scr-riwayat-hadiah .detail-row{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
.scr-riwayat-hadiah .detail-row dt{
    color: var(--text-muted);
    font-size: 12px;
    margin: 0;
  }
.scr-riwayat-hadiah .detail-row dd{
    color: var(--text-value);
    font-size: 12px;
    margin: 0;
    text-align: right;
    display: flex;
    align-items: center;
    gap: 4px;
  }
.scr-riwayat-hadiah #section-pagination{
    padding: 24px 16px 32px;
  }
.scr-riwayat-hadiah .pagination-container{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
.scr-riwayat-hadiah .pagination-controls{
    display: flex;
    align-items: center;
    gap: 6px;
  }
.scr-riwayat-hadiah .page-btn{
    width: 32px;
    height: 32px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
.scr-riwayat-hadiah .page-btn.active{
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: var(--text-dark);
  }
.scr-riwayat-hadiah .page-btn:not(.active){
    color: var(--text-secondary);
  }
.scr-riwayat-hadiah .page-btn.nav-btn{
    background-color: var(--bg-surface);
  }
.scr-riwayat-hadiah .page-btn.nav-btn.disabled{
    opacity: 0.4;
    cursor: default;
  }
/* figma re-sync */
.scr-riwayat-hadiah .text-xs.text-xs { font-size: 11px; }
.scr-riwayat-hadiah .text-xs.text-xs { line-height: 13px; }
.scr-riwayat-hadiah .text-xl.text-xl { line-height: 26px; }
.scr-riwayat-hadiah .text-sm.text-sm { line-height: 15px; }
.scr-riwayat-hadiah .text-base.text-base { font-size: 13px; }
.scr-riwayat-hadiah .text-base.text-base { line-height: 18px; }
.scr-riwayat-hadiah .status-pill.status-pill { font-weight: 600; }
/* the Figma frame has no loading, empty, failed or ellipsis states */
.scr-riwayat-hadiah .list-state{ padding: 12px 0; text-align: center; font-size: 12px; line-height: 18px; color: var(--text-muted); }
.scr-riwayat-hadiah .status-pill.failed{ background-color: rgba(242, 102, 122, 0.14); color: #f2667a; }
.scr-riwayat-hadiah .page-btn:disabled{ opacity: 0.4; cursor: default; }
.scr-riwayat-hadiah .page-dots{ color: var(--text-muted); font-size: 12px; padding: 0 4px; }
.scr-riwayat-hadiah .detail-copy{ display: flex; align-items: center; gap: 4px; }
.scr-riwayat-hadiah .copy-icon{ width: 11px; height: 11px; cursor: pointer; }
`;

export default function RiwayatHadiah() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  // the date boxes open this sheet; an empty range means "everything"
  const [range, setRange] = useState({ from: '', to: '' });
  const [picker, setPicker] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      // the chips split the whole history, so every page of BONUS rows is read
      // once and filtered in memory
      const all = [];
      let failed = null;
      for (let n = 1; n <= MAX_PAGES; n += 1) {
        const res = await api.transactions({ type: 'BONUS', page: n });
        if (!res.ok) {
          failed = failed || res.data;
          break;
        }
        const list = Array.isArray(res.data?.results) ? res.data.results : [];
        all.push(...list);
        if (!res.data?.next || list.length === 0) break;
      }
      if (!alive) return;
      // a failed page only sinks the screen when nothing at all came back
      if (all.length === 0 && failed) {
        setError(friendlyError(failed, 'Gagal memuat riwayat hadiah.'));
        setStatus('error');
        return;
      }
      setRows(all);
      setStatus('ready');
    })().catch(() => {
      if (!alive) return;
      setError('Gagal memuat riwayat hadiah.');
      setStatus('error');
    });
    return () => {
      alive = false;
    };
  }, []);

  // the chips pick the gift kind, the date boxes pick the days
  const filtered = rows.filter(
    (row) =>
      (tab === 'saldo' ? !isItem(row) : tab === 'barang' ? isItem(row) : true) &&
      withinRange(row.created_at, range.from, range.to)
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

  // "sejak akun aktif": only the gifts that actually credited a balance count
  const settled = rows.filter((row) => row.status === 'COMPLETED' && !isItem(row));
  const totalGift = settled.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const oldest = rows.length ? rows[rows.length - 1].created_at : '';
  const newest = rows.length ? rows[0].created_at : '';
  const fromDate = oldest ? dateTimeID(oldest).slice(0, 10) : '—';
  const toDate = newest ? dateTimeID(newest).slice(0, 10) : '—';

  const firstRow = filtered.length ? (current - 1) * ROWS_PER_PAGE + 1 : 0;
  const lastRow = Math.min(current * ROWS_PER_PAGE, filtered.length);

  return (
    <div className="scr-riwayat-hadiah">
      <style>{css}</style>
      <section id="section-header">
        <header className="app-header">
          <button className="back-btn" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/2abb461b6a.svg" alt="" />
          </button>
          <h1 className="header-title text-lg font-bold text-primary">{t('Riwayat Hadiah')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-summary">
        <div className="summary-container">
          <div className="summary-icon-wrapper">
            <img src="/assets/img/235f98fcca.svg" alt="" />
          </div>
          <div className="summary-content">
            <div className="summary-text">
              <span className="text-xs text-secondary">{t('Total hadiah saldo · sejak akun aktif')}</span>
              <strong className="text-xl text-primary font-bold">
                {status === 'ready' ? `${idr(totalGift)} IDR` : '—'}
              </strong>
            </div>
            <span className="text-xs text-muted">{status === 'ready' ? `${rows.length} hadiah` : ''}</span>
          </div>
        </div>
      </section>
      <section id="section-filters">
        <div className="date-filter-wrapper">
          <label className="text-xs text-secondary">{t('Pilih tanggal')}</label>
          <div className="date-inputs-container">
            <button
              type="button"
              className={`date-input-box${range.from ? ' is-set' : ''}`}
              onClick={() => setPicker('from')}
            >
              <img src="/assets/img/c844b1a1dc.svg" alt="" />
              <div className="date-input-text">
                <span className="text-xs text-muted">{t('Dari')}</span>
                <span className="text-sm text-primary">{range.from || fromDate}</span>
              </div>
            </button>
            <div className="date-divider"></div>
            <button
              type="button"
              className={`date-input-box${range.to ? ' is-set' : ''}`}
              onClick={() => setPicker('to')}
            >
              <img src="/assets/img/c844b1a1dc.svg" alt="" />
              <div className="date-input-text">
                <span className="text-xs text-muted">{t('Sampai')}</span>
                <span className="text-sm text-primary">{range.to || toDate}</span>
              </div>
            </button>
          </div>
        </div>
        <div className="category-filter-wrapper">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`cat-pill text-sm ${item.key === tab ? 'active font-bold' : 'text-secondary'}`}
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
      </section>
      <section id="section-history-list">
        <div className="history-list-container">
          {status === 'loading' && <div className="list-state">{t('Memuat riwayat hadiah…')}</div>}
          {status === 'error' && <div className="list-state">{error}</div>}
          {status === 'ready' && visible.length === 0 && (
            <div className="list-state">
              {rangeActive
                ? 'Tidak ada hadiah pada rentang tanggal ini.'
                : 'Belum ada hadiah pada filter ini.'}
            </div>
          )}

          {visible.map((row) => {
            const item = isItem(row);
            const name = prizeName(row);
            const source = giftSource(row);
            return (
              <article className="history-card" key={row.id}>
                <div className="card-header">
                  <div className="card-icon">
                    <img src={item ? '/assets/img/0acc0ea159.svg' : '/assets/img/31678f5d13.svg'} alt="" />
                  </div>
                  <div className="card-title-area">
                    <h3 className="text-base text-primary font-bold">{source}</h3>
                    <span className="text-xs text-muted">{dateTimeID(row.created_at, true)} WIB</span>
                  </div>
                  <div className="card-status-area">
                    {item ? (
                      <div className="text-base text-yellow font-bold">{t('Hadiah barang')}</div>
                    ) : (
                      <div className="text-base text-green font-bold">
                        +{idr(row.amount)} <span className="text-xs text-muted font-normal">{t('IDR')}</span>
                      </div>
                    )}
                    <div className={`status-pill ${STATUS_TONE[row.status] || 'processing'} text-xs`}>
                      {STATUS_LABEL[row.status] || row.status}
                    </div>
                  </div>
                </div>
                <dl className="card-details">
                  <div className="detail-row">
                    <dt>{t('Hadiah')}</dt>
                    <dd>{item ? (name || '—') : `${idr(row.amount)} IDR`}</dd>
                  </div>
                  <div className="detail-row">
                    <dt>{t('Jenis hadiah')}</dt>
                    <dd>{item ? 'Barang' : 'Bonus saldo'}</dd>
                  </div>
                  {source === 'Bonus' && row.description && (
                    <div className="detail-row">
                      <dt>{t('Keterangan')}</dt>
                      <dd>{row.description}</dd>
                    </div>
                  )}
                  {!item && WALLET_LABEL[row.wallet_type] && (
                    <div className="detail-row">
                      <dt>{t('Masuk ke')}</dt>
                      <dd>{WALLET_LABEL[row.wallet_type]}</dd>
                    </div>
                  )}
                  <div className="detail-row">
                    <dt>{t('No. Transaksi')}</dt>
                    <dd>
                      <div className="detail-copy">
                        {trxStamp(row.trx_id, row.created_at)}
                        <img src="/assets/img/33e81f59de.svg" alt="Copy" className="copy-icon" />
                      </div>
                    </dd>
                  </div>
                </dl>
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
                className={`page-btn nav-btn${current <= 1 ? ' disabled' : ''}`}
                aria-label={t('Previous page')}
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
                    className={item === current ? 'page-btn active text-sm font-bold' : 'page-btn text-sm text-secondary'}
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
                className={`page-btn nav-btn${current >= totalPages ? ' disabled' : ''}`}
                aria-label={t('Next page')}
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
          <div className="pagination-text text-xs text-muted">
            Menampilkan {firstRow}–{lastRow} dari {filtered.length} hadiah
          </div>
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
