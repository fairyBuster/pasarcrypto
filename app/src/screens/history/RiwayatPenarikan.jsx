// riwayat-penarikan — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { dateTimeID, idr, maskAccount, maskName, trxStamp } from '../../lib/format.js';
import DateSheet, { withinRange } from '../../components/DateSheet.jsx';
import { t } from '../../lib/i18n.js';

// ten rows a page, the same slice every history screen uses
const ROWS_PER_PAGE = 10;
// the whole history is read once so the pager works on the real total
const MAX_PAGES = 25;

// the API sends the raw status, the design groups it into three badges
const STATUS_LABEL = {
  PENDING: 'Diproses',
  PROCESSING: 'Diproses',
  COMPLETED: 'Berhasil',
  REJECTED: 'Gagal',
  CANCELLED: 'Dibatalkan',
};
const STATUS_TONE = {
  PENDING: 'status-diproses',
  PROCESSING: 'status-diproses',
  COMPLETED: 'status-berhasil',
  REJECTED: 'status-gagal',
  CANCELLED: 'status-gagal',
};
// rejected and cancelled requests are refunded, so they never count as withdrawn
const REFUNDED = new Set(['REJECTED', 'CANCELLED']);

const TABS = [
  { key: 'all', label: 'Semua', statuses: null },
  { key: 'berhasil', label: 'Berhasil', statuses: ['COMPLETED'] },
  { key: 'diproses', label: 'Diproses', statuses: ['PENDING', 'PROCESSING'] },
  { key: 'gagal', label: 'Gagal', statuses: ['REJECTED', 'CANCELLED'] },
];

// "1 2 3 … 6" with the current page always in the row
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
/* riwayat-penarikan — ported from Figma export, typography re-synced */
.scr-riwayat-penarikan { background: linear-gradient(180deg, #0C1A2D 0%, #13263D 30%, #0F2036 70%, #0A1626 100%); }
.scr-riwayat-penarikan *{
  box-sizing: border-box;
}
.scr-riwayat-penarikan p,
.scr-riwayat-penarikan h1,
.scr-riwayat-penarikan h2,
.scr-riwayat-penarikan h3,
.scr-riwayat-penarikan h4,
.scr-riwayat-penarikan h5,
.scr-riwayat-penarikan h6{
  margin: 0;
}
.scr-riwayat-penarikan button{
  font-family: inherit;
}
.scr-riwayat-penarikan .app-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px 0;
  }
.scr-riwayat-penarikan .back-btn{
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: #1f3048;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
.scr-riwayat-penarikan .header-title{
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }
.scr-riwayat-penarikan .header-spacer{
    width: 40px;
  }
.scr-riwayat-penarikan .summary-container{
    display: flex;
    align-items: center;
    padding: 20px 16px 0;
    gap: 12px;
  }
.scr-riwayat-penarikan .summary-icon{
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(135deg, #5982bf 0%, #2b4c80 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
.scr-riwayat-penarikan .summary-content{
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 2px;
  }
.scr-riwayat-penarikan .summary-label{
    font-size: 12px;
    color: #a9b7c8;
  }
.scr-riwayat-penarikan .summary-amount{
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
  }
.scr-riwayat-penarikan .summary-count{
    font-size: 12px;
    color: #8597ab;
    align-self: flex-end;
    margin-bottom: 4px;
  }
.scr-riwayat-penarikan .filters-container{
    padding: 24px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-riwayat-penarikan .filter-label{
    font-size: 13px;
    color: #a9b7c8;
  }
.scr-riwayat-penarikan .date-picker-row{
    display: flex;
    align-items: center;
    gap: 8px;
  }
.scr-riwayat-penarikan .date-box{
    flex: 1;
    height: 42px;
    background-color: #1f3048;
    border: 1px solid #2f4560;
    border-radius: 12px;
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
.scr-riwayat-penarikan .date-box.is-set{
    border-color: #7faae6;
    background-color: #223a5c;
  }
.scr-riwayat-penarikan .date-box:active{
    opacity: 0.8;
  }
.scr-riwayat-penarikan .date-icon{
    width: 14px;
    height: 14px;
  }
.scr-riwayat-penarikan .date-text{
    display: flex;
    flex-direction: column;
  }
.scr-riwayat-penarikan .date-title{
    font-size: 11px;
    color: #75879c;
    line-height: 1;
    margin-bottom: 2px;
  }
.scr-riwayat-penarikan .date-value{
    font-size: 13px;
    color: #ffffff;
    line-height: 1;
  }
.scr-riwayat-penarikan .date-divider{
    width: 8px;
    height: 1.5px;
    background-color: #51657e;
  }
.scr-riwayat-penarikan .status-tabs-wrapper{
    margin-top: 6px;
    margin-right: -16px; 
  }
.scr-riwayat-penarikan .status-tabs{
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-right: 16px; 
    scrollbar-width: none; 
  }
.scr-riwayat-penarikan .status-tabs::-webkit-scrollbar{
    display: none; 
  }
.scr-riwayat-penarikan .tab-btn{
    height: 30px;
    padding: 0 14px;
    border-radius: 15px;
    border: none;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }
.scr-riwayat-penarikan .tab-btn.active{
    background: linear-gradient(180deg, #F5F8FB 0%, #C9D4E1 100%);
    color: #0c1a2d;
  }
.scr-riwayat-penarikan .tab-btn:not(.active){
    background-color: #1f3048;
    color: #a9b7c8;
  }
.scr-riwayat-penarikan .transaction-list-container{
    padding: 16px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
.scr-riwayat-penarikan .transaction-card{
    border-bottom: 1px solid rgba(201, 212, 225, 0.18);
    padding-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
.scr-riwayat-penarikan .transaction-card:last-child{
    border-bottom: none;
  }
.scr-riwayat-penarikan .tc-header{
    display: flex;
    align-items: center;
    gap: 12px;
  }
.scr-riwayat-penarikan .tc-icon-wrapper{
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background-color: #1f3048;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
.scr-riwayat-penarikan .tc-icon{
    width: 16px;
    height: 16px;
  }
.scr-riwayat-penarikan .tc-title-col{
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 2px;
  }
.scr-riwayat-penarikan .tc-title{
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }
.scr-riwayat-penarikan .tc-date{
    font-size: 11px;
    color: #75879c;
  }
.scr-riwayat-penarikan .tc-amount-col{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
.scr-riwayat-penarikan .tc-amount{
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }
.scr-riwayat-penarikan .tc-currency{
    font-size: 11px;
    color: #8597ab;
    font-weight: 400;
  }
.scr-riwayat-penarikan .status-badge{
    padding: 3px 7px;
    border-radius: 9px;
    font-size: 10px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
.scr-riwayat-penarikan .status-diproses{
    background-color: rgba(201, 212, 225, 0.12);
    color: #c9d4e1;
  }
.scr-riwayat-penarikan .status-berhasil{
    background-color: rgba(62, 207, 142, 0.14);
    color: #3ecf8e;
  }
.scr-riwayat-penarikan .status-gagal{
    background-color: rgba(242, 102, 122, 0.14);
    color: #f2667a;
  }
.scr-riwayat-penarikan .tc-details{
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding-left: 48px; 
  }
.scr-riwayat-penarikan .tc-detail-row{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
.scr-riwayat-penarikan .tc-detail-label{
    font-size: 12px;
    color: #75879c;
  }
.scr-riwayat-penarikan .tc-detail-value{
    font-size: 12px;
    color: #c3cedb;
    display: flex;
    align-items: center;
  }
.scr-riwayat-penarikan .copy-icon{
    margin-left: 6px;
    width: 11px;
    height: 11px;
    cursor: pointer;
  }
.scr-riwayat-penarikan .pagination-container{
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px 32px;
    gap: 12px;
  }
.scr-riwayat-penarikan .pagination-controls{
    display: flex;
    align-items: center;
    gap: 6px;
  }
.scr-riwayat-penarikan .page-btn{
    width: 32px;
    height: 32px;
    border-radius: 16px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
  }
.scr-riwayat-penarikan .page-btn.active{
    background: linear-gradient(180deg, #F5F8FB 0%, #C9D4E1 100%);
    color: #0c1a2d;
    font-weight: 600;
  }
.scr-riwayat-penarikan .page-btn:not(.active){
    background-color: transparent;
    color: #a9b7c8;
  }
.scr-riwayat-penarikan .page-btn.nav-btn{
    background-color: rgba(31, 48, 72, 0.4);
  }
.scr-riwayat-penarikan .page-btn:disabled{
    opacity: 0.4;
    cursor: default;
  }
.scr-riwayat-penarikan .page-dots{
    color: #75879c;
    font-size: 14px;
    padding: 0 4px;
  }
.scr-riwayat-penarikan .pagination-info{
    color: #75879c;
    font-size: 12px;
  }
/* the Figma frame has no loading, empty or edge states */
.scr-riwayat-penarikan .list-state{
    padding: 12px 0;
    color: #8597ab;
    font-size: 12px;
    text-align: center;
  }
.scr-riwayat-penarikan .page-btn:disabled{
    opacity: 0.4;
    cursor: default;
  }
/* figma re-sync */
.scr-riwayat-penarikan .header-title.header-title { font-size: 17px; }
.scr-riwayat-penarikan .header-title.header-title { font-weight: 700; }
.scr-riwayat-penarikan .summary-amount.summary-amount { font-weight: 600; }
.scr-riwayat-penarikan .summary-count.summary-count { font-size: 11px; }
.scr-riwayat-penarikan .filter-label.filter-label { font-size: 12px; }
.scr-riwayat-penarikan .date-title.date-title { font-size: 9px; }
.scr-riwayat-penarikan .date-value.date-value { font-size: 12px; }
.scr-riwayat-penarikan .date-value.date-value { line-height: 15px; }
.scr-riwayat-penarikan .tab-btn.tab-btn { font-size: 12px; }
.scr-riwayat-penarikan .tab-btn.tab-btn { font-weight: 600; }
.scr-riwayat-penarikan .tc-title.tc-title { font-size: 13px; }
.scr-riwayat-penarikan .tc-currency.tc-currency { font-size: 10px; }
.scr-riwayat-penarikan .tc-currency.tc-currency { font-weight: 500; }
.scr-riwayat-penarikan .status-badge.status-badge { font-size: 12px; }
.scr-riwayat-penarikan .tc-detail-label.tc-detail-label { font-size: 11px; }
.scr-riwayat-penarikan .tc-detail-value.tc-detail-value { font-size: 11px; }
.scr-riwayat-penarikan .pagination-info.pagination-info { font-size: 11px; }
`;

export default function RiwayatPenarikan() {
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
      // the tabs and the page numbers work on the whole history, so every
      // page of the endpoint is read once and cached in state
      const all = [];
      for (let n = 1; n <= MAX_PAGES; n += 1) {
        const res = await api.withdraws(n);
        if (!res.ok) {
          if (n === 1 && alive) {
            setError(friendlyError(res.data, 'Gagal memuat riwayat penarikan.'));
            setStatus('error');
          }
          break;
        }
        const list = Array.isArray(res.data?.results) ? res.data.results : [];
        all.push(...list);
        if (!res.data?.next || list.length === 0) break;
      }
      if (!alive) return;
      setRows(all);
      setStatus((prev) => (prev === 'error' ? prev : 'ready'));
    })().catch(() => {
      if (!alive) return;
      setError('Gagal memuat riwayat penarikan.');
      setStatus('error');
    });
    return () => {
      alive = false;
    };
  }, []);

  const active = TABS.find((item) => item.key === tab) || TABS[0];
  // the tab picks the status, the date boxes pick the days; both narrow the list
  const filtered = rows.filter(
    (row) =>
      (!active.statuses || active.statuses.includes(row.status)) &&
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

  // "sejak akun aktif": everything that was not refunded back to the wallet
  const settled = rows.filter((row) => !REFUNDED.has(row.status));
  const totalWithdrawn = settled.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const oldest = rows.length ? rows[rows.length - 1].created_at : '';
  const newest = rows.length ? rows[0].created_at : '';
  const fromDate = oldest ? dateTimeID(oldest).slice(0, 10) : '—';
  const toDate = newest ? dateTimeID(newest).slice(0, 10) : '—';

  const firstRow = filtered.length ? (current - 1) * ROWS_PER_PAGE + 1 : 0;
  const lastRow = Math.min(current * ROWS_PER_PAGE, filtered.length);

  return (
    <div className="scr-riwayat-penarikan">
      <style>{css}</style>
      <section id="section-header">
        <header className="app-header">
          <button className="back-btn" aria-label={t('Go back')} data-route="/home">
            <img src="/assets/img/7861050aa5.svg" alt="Back Icon" />
          </button>
          <h1 className="header-title">{t('Riwayat Penarikan')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-summary">
        <div className="summary-container">
          <div className="summary-icon">
            <img src="/assets/img/46ad11e067.svg" alt="Withdrawal Icon" />
          </div>
          <div className="summary-content">
            <p className="summary-label">{t('Total penarikan · sejak akun aktif')}</p>
            <p className="summary-amount">{idr(totalWithdrawn)} IDR</p>
          </div>
          <div className="summary-count">
            {settled.length} transaksi
          </div>
        </div>
      </section>
      <section id="section-filters">
        <div className="filters-container">
          <p className="filter-label">{t('Pilih tanggal')}</p>
          <div className="date-picker-row">
            <button
              type="button"
              className={`date-box${range.from ? ' is-set' : ''}`}
              onClick={() => setPicker('from')}
            >
              <img src="/assets/img/c844b1a1dc.svg" alt="" className="date-icon" />
              <div className="date-text">
                <span className="date-title">{t('Dari')}</span>
                <span className="date-value">{range.from || fromDate}</span>
              </div>
            </button>
            <div className="date-divider"></div>
            <button
              type="button"
              className={`date-box${range.to ? ' is-set' : ''}`}
              onClick={() => setPicker('to')}
            >
              <img src="/assets/img/c844b1a1dc.svg" alt="" className="date-icon" />
              <div className="date-text">
                <span className="date-title">{t('Sampai')}</span>
                <span className="date-value">{range.to || toDate}</span>
              </div>
            </button>
          </div>
          <div className="status-tabs-wrapper">
            <div className="status-tabs">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`tab-btn${item.key === tab ? ' active' : ''}`}
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
          </div>
        </div>
      </section>
      <section id="section-transaction-list">
        <div className="transaction-list-container">
          {status === 'loading' && <p className="list-state">{t('Memuat riwayat penarikan…')}</p>}
          {status === 'error' && <p className="list-state">{error}</p>}
          {status === 'ready' && visible.length === 0 && (
            <p className="list-state">
              {rangeActive
                ? 'Tidak ada penarikan pada rentang tanggal ini.'
                : 'Belum ada penarikan pada filter ini.'}
            </p>
          )}
          {visible.map((row) => (
            <div className="transaction-card" key={row.id}>
              <div className="tc-header">
                <div className="tc-icon-wrapper">
                  <img src="/assets/img/53778e3c16.svg" alt="Bank Icon" className="tc-icon" />
                </div>
                <div className="tc-title-col">
                  <h3 className="tc-title">
                    Penarikan{row.bank_name ? ` ke ${row.bank_name}` : ''}
                  </h3>
                  <p className="tc-date">{dateTimeID(row.created_at, true)} WIB</p>
                </div>
                <div className="tc-amount-col">
                  <div className="tc-amount">
                    -{idr(row.amount)} <span className="tc-currency">{t('IDR')}</span>
                  </div>
                  <div className={`status-badge ${STATUS_TONE[row.status] || 'status-diproses'}`}>
                    {STATUS_LABEL[row.status] || row.status}
                  </div>
                </div>
              </div>
              <div className="tc-details">
                <div className="tc-detail-row">
                  <span className="tc-detail-label">{t('No. Transaksi')}</span>
                  <div className="tc-detail-value">
                    {trxStamp('', row.created_at)}
                    <img src="/assets/img/7d10f43a07.svg" alt="Copy" className="copy-icon" />
                  </div>
                </div>
                <div className="tc-detail-row">
                  <span className="tc-detail-label">{t('Rekening')}</span>
                  <span className="tc-detail-value">
                    {row.bank_name
                      ? `${row.bank_name} · ${maskAccount(row.bank_account_number)}`
                      : '—'}
                  </span>
                </div>
                <div className="tc-detail-row">
                  <span className="tc-detail-label">{t('Nama rekening')}</span>
                  <span className="tc-detail-value">{row.bank_account_name ? maskName(row.bank_account_name) : '—'}</span>
                </div>
                <div className="tc-detail-row">
                  <span className="tc-detail-label">{t('Biaya admin')}</span>
                  <span className="tc-detail-value">{idr(row.fee)} IDR</span>
                </div>
                {REFUNDED.has(row.status) ? (
                  <div className="tc-detail-row">
                    <span className="tc-detail-label">{t('Keterangan')}</span>
                    <span className="tc-detail-value">
                      {row.status === 'CANCELLED' ? 'Dibatalkan' : 'Ditolak'}
                    </span>
                  </div>
                ) : (
                  <div className="tc-detail-row">
                    <span className="tc-detail-label">{t('Diterima')}</span>
                    <span className="tc-detail-value">{idr(row.net_amount)} IDR</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* nothing to page through while the list is empty or failed to load */}
      {status === 'ready' && filtered.length > 0 && (
      <section id="section-pagination">
        <div className="pagination-container">
          <div className="pagination-controls">
            <button
              type="button"
              className="page-btn nav-btn"
              aria-label={t('Previous page')}
              disabled={current <= 1}
              onClick={(event) => {
                // the shell also toggles .active on .page-btn, React owns it here
                event.stopPropagation();
                setPage(Math.max(1, current - 1));
                event.currentTarget.closest('.phone-scroll')?.scrollTo(0, 0);
              }}
            >
              <img src="/assets/img/be233d23da.svg" alt="Previous" />
            </button>
            {pageItems(current, totalPages).map((item, index) =>
              item === '…' ? (
                <span className="page-dots" key={`dots-${index}`}>…</span>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={`page-btn${item === current ? ' active' : ''}`}
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
              aria-label={t('Next page')}
              disabled={current >= totalPages}
              onClick={(event) => {
                event.stopPropagation();
                setPage(Math.min(totalPages, current + 1));
                event.currentTarget.closest('.phone-scroll')?.scrollTo(0, 0);
              }}
            >
              <img src="/assets/img/f55e6b8d63.svg" alt="Next" />
            </button>
          </div>
          <p className="pagination-info">
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
