// riwayat-deposit — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { dateTimeID, idr, trxStamp } from '../../lib/format.js';
import DateSheet, { withinRange } from '../../components/DateSheet.jsx';
import { t } from '../../lib/i18n.js';

// ten rows a page, the same slice every history screen uses
const ROWS_PER_PAGE = 10;
const MAX_PAGES = 25;

// this screen is one slice of the ledger: the deposit rows only
const TYPE = 'DEPOSIT';

const STATUS_LABEL = {
  PENDING: 'Diproses',
  PROCESSING: 'Diproses',
  COMPLETED: 'Berhasil',
  REJECTED: 'Gagal',
  FAILED: 'Gagal',
  CANCELLED: 'Gagal',
};
const STATUS_TONE = {
  PENDING: 'status-diproses',
  PROCESSING: 'status-diproses',
  COMPLETED: 'status-berhasil',
  REJECTED: 'status-gagal',
  FAILED: 'status-gagal',
  CANCELLED: 'status-gagal',
};

// where a deposit can land, in the wording the wallet frames use
const WALLET_LABEL = {
  BALANCE: 'Saldo Utama',
  BALANCE_CASHBACK: 'Saldo Cashback',
  BALANCE_DEPOSIT: 'Saldo Isi Ulang',
  BALANCE_HOLD: 'Saldo Ditahan',
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
/* riwayat-deposit — ported from Figma export, typography re-synced */
.scr-riwayat-deposit { background: linear-gradient(180deg, #0C1A2D 0%, #13263D 30%, #0F2036 70%, #0A1626 100%); }
.scr-riwayat-deposit *{
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
.scr-riwayat-deposit button{
    font-family: 'Inter', sans-serif;
}
.scr-riwayat-deposit #section-header{
    padding: 20px 16px 0;
    width: 100%;
}
.scr-riwayat-deposit .header-container{
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
}
.scr-riwayat-deposit .back-btn{
    background-color: #1f3048;
    border: none;
    border-radius: 20px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
}
.scr-riwayat-deposit .page-title{
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #ffffff;
    text-align: center;
}
.scr-riwayat-deposit .header-placeholder{
    width: 40px;
    height: 40px;
}
.scr-riwayat-deposit #section-summary{
    padding: 20px 16px 0;
    width: 100%;
}
.scr-riwayat-deposit .summary-card{
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}
.scr-riwayat-deposit .summary-icon{
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(135deg, #5A82BF 0%, #2C4C80 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.scr-riwayat-deposit .summary-content{
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-grow: 1;
}
.scr-riwayat-deposit .summary-label{
    font-size: 12px;
    color: #a9b7c8;
    line-height: 1.2;
}
.scr-riwayat-deposit .summary-amount{
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.4;
}
.scr-riwayat-deposit .summary-stats{
    font-size: 12px;
    color: #8597ab;
    align-self: flex-end;
    margin-bottom: 4px;
}
.scr-riwayat-deposit #section-filter{
    padding: 24px 16px 16px;
    width: 100%;
}
.scr-riwayat-deposit .filter-container{
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.scr-riwayat-deposit .filter-title{
    font-size: 12px;
    color: #a9b7c8;
}
.scr-riwayat-deposit .filter-inputs-row{
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}
.scr-riwayat-deposit .date-input-box{
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
.scr-riwayat-deposit .date-input-box.is-set{
    border-color: #7faae6;
    background-color: #223a5c;
}
.scr-riwayat-deposit .date-input-box:active{
    opacity: 0.8;
}
.scr-riwayat-deposit .date-text-group{
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.scr-riwayat-deposit .date-label{
    font-size: 10px;
    color: #75879c;
    line-height: 1.1;
}
.scr-riwayat-deposit .date-value{
    font-size: 12px;
    color: #ffffff;
    line-height: 1.2;
    margin-top: 2px;
}
.scr-riwayat-deposit .date-separator{
    width: 8px;
    height: 1.5px;
    background-color: #51657e;
    flex-shrink: 0;
}
.scr-riwayat-deposit #section-transaction-list{
    padding: 10px 16px;
    width: 100%;
}
.scr-riwayat-deposit .transaction-list-container{
    display: flex;
    flex-direction: column;
}
.scr-riwayat-deposit .transaction-card{
    display: flex;
    flex-direction: column;
    padding: 16px 0;
    border-bottom: 1px solid rgba(201, 212, 225, 0.18);
    gap: 16px;
}
.scr-riwayat-deposit .transaction-card:last-child{
    border-bottom: none;
}
.scr-riwayat-deposit .tx-main-info{
    display: flex;
    align-items: center;
    gap: 12px;
}
.scr-riwayat-deposit .tx-icon-wrapper{
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background-color: #1f3048;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.scr-riwayat-deposit .tx-title-col{
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex-grow: 1;
}
.scr-riwayat-deposit .tx-title{
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
}
.scr-riwayat-deposit .tx-datetime{
    font-size: 11px;
    color: #75879c;
}
.scr-riwayat-deposit .tx-amount-col{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}
.scr-riwayat-deposit .tx-amount{
    font-size: 14px;
    font-weight: 600;
    color: #3ecf8e;
    display: flex;
    align-items: center;
    gap: 4px;
}
.scr-riwayat-deposit .tx-currency{
    font-size: 12px;
    color: #8597ab;
    font-weight: 400;
}
.scr-riwayat-deposit .tx-status{
    font-size: 10px;
    color: #3ecf8e;
    background-color: rgba(62, 207, 142, 0.14);
    padding: 3px 7px;
    border-radius: 9px;
}
.scr-riwayat-deposit .tx-details-list{
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding-left: 48px; 
}
.scr-riwayat-deposit .tx-detail-item{
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.scr-riwayat-deposit .tx-detail-label{
    font-size: 12px;
    color: #75879c;
}
.scr-riwayat-deposit .tx-detail-value{
    font-size: 12px;
    color: #c3cedb;
    display: flex;
    align-items: center;
    gap: 5px;
}
.scr-riwayat-deposit #section-pagination{
    padding: 20px 16px 40px;
    width: 100%;
    margin-top: auto;
}
.scr-riwayat-deposit .pagination-container{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}
.scr-riwayat-deposit .pagination-nav{
    display: flex;
    align-items: center;
    gap: 6px;
}
.scr-riwayat-deposit .nav-arrow-btn{
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background-color: rgba(31, 48, 72, 0.4);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
}
.scr-riwayat-deposit .nav-arrow-btn:disabled{
    opacity: 0.4;
    cursor: default;
}
.scr-riwayat-deposit .page-number{
    min-width: 32px;
    height: 32px;
    border-radius: 16px;
    background: transparent;
    border: none;
    color: #a9b7c8;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0 8px;
}
.scr-riwayat-deposit .page-number.active{
    background: linear-gradient(180deg, #F5F8FB 0%, #C9D4E1 100%);
    color: #0c1a2d;
    font-weight: 600;
}
.scr-riwayat-deposit .page-ellipsis{
    color: #75879c;
    font-size: 13px;
    padding: 0 4px;
}
.scr-riwayat-deposit .pagination-summary-text{
    font-size: 11px;
    color: #75879c;
}
/* figma re-sync */
.scr-riwayat-deposit .page-title.page-title { font-size: 17px; }
.scr-riwayat-deposit .page-title.page-title { font-weight: 700; }
.scr-riwayat-deposit .summary-amount.summary-amount { font-size: 20px; }
.scr-riwayat-deposit .summary-amount.summary-amount { font-weight: 600; }
.scr-riwayat-deposit .summary-stats.summary-stats { font-size: 11px; }
.scr-riwayat-deposit .date-label.date-label { font-size: 9px; }
.scr-riwayat-deposit .tx-title.tx-title { font-size: 13px; }
.scr-riwayat-deposit .tx-title.tx-title { font-weight: 600; }
.scr-riwayat-deposit .tx-currency.tx-currency { font-size: 10px; }
.scr-riwayat-deposit .tx-currency.tx-currency { font-weight: 500; }
.scr-riwayat-deposit .tx-detail-label.tx-detail-label { font-size: 11px; }
.scr-riwayat-deposit .tx-detail-value.tx-detail-value { font-size: 11px; }
.scr-riwayat-deposit .page-number.page-number { font-size: 12px; }
/* the Figma frame has no loading, empty or edge states */
.scr-riwayat-deposit .tx-status.status-diproses{
    color: #c9d4e1;
    background-color: rgba(201, 212, 225, 0.12);
}
.scr-riwayat-deposit .tx-status.status-gagal{
    color: #f2667a;
    background-color: rgba(242, 102, 122, 0.14);
}
/* a deposit that has not landed yet is not money in the wallet */
.scr-riwayat-deposit .tx-amount.is-muted{
    color: #8597ab;
}
.scr-riwayat-deposit .list-state{
    padding: 12px 0;
    color: #8597ab;
    font-size: 12px;
    text-align: center;
}
.scr-riwayat-deposit .nav-arrow-btn:disabled{
    opacity: 0.4;
    cursor: default;
}
/* the receipt number keeps the frame's glyph, the button only widens the tap area */
.scr-riwayat-deposit .copy-icon-btn{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
}
.scr-riwayat-deposit .copy-icon-btn:active{
    opacity: 0.7;
}
`;

export default function RiwayatDeposit() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  // the date boxes open this sheet; an empty range means "everything"
  const [range, setRange] = useState({ from: '', to: '' });
  const [picker, setPicker] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      // the summary and the page numbers both work on the whole history, so
      // every page of the deposit ledger is read once and cached in state
      const all = [];
      let failed = null;
      for (let n = 1; n <= MAX_PAGES; n += 1) {
        const res = await api.transactions({ type: TYPE, page: n });
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
        setError(friendlyError(failed, 'Gagal memuat riwayat deposit.'));
        setStatus('error');
        return;
      }
      all.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
      setRows(all);
      setStatus('ready');
    })().catch(() => {
      if (!alive) return;
      setError('Gagal memuat riwayat deposit.');
      setStatus('error');
    });
    return () => {
      alive = false;
    };
  }, []);

  // the picked days narrow the list, the summary stays the whole account
  const filtered = rows.filter((row) => withinRange(row.created_at, range.from, range.to));
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

  // "sejak akun aktif": deposit that actually reached the wallet
  const settled = rows.filter((row) => row.status === 'COMPLETED');
  const totalDeposit = settled.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const oldest = rows.length ? rows[rows.length - 1].created_at : '';
  const newest = rows.length ? rows[0].created_at : '';
  const fromDate = oldest ? dateTimeID(oldest).slice(0, 10) : '—';
  const toDate = newest ? dateTimeID(newest).slice(0, 10) : '—';

  const firstRow = filtered.length ? (current - 1) * ROWS_PER_PAGE + 1 : 0;
  const lastRow = Math.min(current * ROWS_PER_PAGE, filtered.length);

  return (
    <div className="scr-riwayat-deposit">
      <style>{css}</style>
      <section id="section-header">
          <header className="header-container">
              <button className="back-btn" aria-label={t('Go back')} data-back="1">
                  <img src="/assets/img/2abb461b6a.svg" alt="" />
              </button>
              <h1 className="page-title">{t('Riwayat Deposit')}</h1>
              <div className="header-placeholder"></div>
          </header>
      </section>
      <section id="section-summary">
          <div className="summary-card">
              <div className="summary-icon">
                  <img src="/assets/img/b14b8156d0.svg" alt="" />
              </div>
              <div className="summary-content">
                  <span className="summary-label">{t('Total deposit · sejak akun aktif')}</span>
                  <span className="summary-amount">
                      {status === 'ready' ? `${idr(totalDeposit)} IDR` : '—'}
                  </span>
              </div>
              <div className="summary-stats">
                  {status === 'ready' ? `${settled.length} transaksi` : '—'}
              </div>
          </div>
      </section>
      <section id="section-filter">
          <div className="filter-container">
              <div className="filter-title">{t('Pilih tanggal')}</div>
              <div className="filter-inputs-row">
                  <button
                      type="button"
                      className={`date-input-box${range.from ? ' is-set' : ''}`}
                      onClick={() => setPicker('from')}
                  >
                      <img src="/assets/img/c844b1a1dc.svg" alt="" />
                      <div className="date-text-group">
                          <span className="date-label">{t('Dari')}</span>
                          <span className="date-value">{range.from || fromDate}</span>
                      </div>
                  </button>
                  <div className="date-separator"></div>
                  <button
                      type="button"
                      className={`date-input-box${range.to ? ' is-set' : ''}`}
                      onClick={() => setPicker('to')}
                  >
                      <img src="/assets/img/c844b1a1dc.svg" alt="" />
                      <div className="date-text-group">
                          <span className="date-label">{t('Sampai')}</span>
                          <span className="date-value">{range.to || toDate}</span>
                      </div>
                  </button>
              </div>
          </div>
      </section>
      <section id="section-transaction-list">
          <div className="transaction-list-container">
              {status === 'loading' && (
                  <p className="list-state">{t('Memuat riwayat deposit…')}</p>
              )}
              {status === 'error' && <p className="list-state">{error}</p>}
              {status === 'ready' && visible.length === 0 && (
                  <p className="list-state">
                      {rangeActive
                          ? 'Tidak ada deposit pada rentang tanggal ini.'
                          : 'Belum ada deposit.'}
                  </p>
              )}

              {visible.map((row) => {
                  const done = row.status === 'COMPLETED';
                  const receipt = row.trx_id || row.transaction_id || '';
                  const method = row.bank_name || row.withdrawal_service_name || '';
                  return (
                      <div className="transaction-card" key={row.id}>
                          <div className="tx-main-info">
                              <div className="tx-icon-wrapper">
                                  <img src="/assets/img/5f9f970a49.svg" alt="" />
                              </div>
                              <div className="tx-title-col">
                                  <div className="tx-title">{row.description || 'Deposit'}</div>
                                  <div className="tx-datetime">{dateTimeID(row.created_at, true)} WIB</div>
                              </div>
                              <div className="tx-amount-col">
                                  {/* money that has not landed yet is not in the wallet */}
                                  <div className={`tx-amount${done ? '' : ' is-muted'}`}>
                                      +{idr(row.amount)} <span className="tx-currency">{row.currency_code || 'IDR'}</span>
                                  </div>
                                  <div className={`tx-status ${STATUS_TONE[row.status] || 'status-diproses'}`}>
                                      {STATUS_LABEL[row.status] || row.status || '—'}
                                  </div>
                              </div>
                          </div>
                          <div className="tx-details-list">
                              <div className="tx-detail-item">
                                  <span className="tx-detail-label">{t('No. Transaksi')}</span>
                                  <span className="tx-detail-value">
                                      {trxStamp(receipt, row.created_at)}
                                      {receipt ? (
                                          <button
                                              type="button"
                                              className="copy-icon-btn"
                                              aria-label={t('Salin nomor transaksi')}
                                              data-copy={trxStamp(receipt, row.created_at)}
                                          >
                                              <img src="/assets/img/8935c67f1c.svg" alt="" />
                                          </button>
                                      ) : null}
                                  </span>
                              </div>
                              <div className="tx-detail-item">
                                  <span className="tx-detail-label">{t('Metode')}</span>
                                  <span className="tx-detail-value">{method || '—'}</span>
                              </div>
                              <div className="tx-detail-item">
                                  <span className="tx-detail-label">{t('Masuk ke')}</span>
                                  <span className="tx-detail-value">
                                      {WALLET_LABEL[row.wallet_type] || row.wallet_type || '—'}
                                  </span>
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      </section>
      {/* nothing to page through while the list is empty or failed to load */}
      {status === 'ready' && filtered.length > 0 && (
      <section id="section-pagination">
          <div className="pagination-container">
              <div className="pagination-nav">
                  <button
                      type="button"
                      className="nav-arrow-btn prev"
                      aria-label={t('Previous page')}
                      disabled={current <= 1}
                      onClick={(event) => {
                          // the shell also toggles .active on the arrows, React owns it here
                          event.stopPropagation();
                          setPage(Math.max(1, current - 1));
                          event.currentTarget.closest('.phone-scroll')?.scrollTo(0, 0);
                      }}
                  >
                      <img src="/assets/img/be233d23da.svg" alt="" />
                  </button>
                  {pageItems(current, totalPages).map((item, index) =>
                      item === '…' ? (
                          <span className="page-ellipsis" key={`dots-${index}`}>…</span>
                      ) : (
                          <button
                              key={item}
                              type="button"
                              className={`page-number${item === current ? ' active' : ''}`}
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
                      className="nav-arrow-btn next"
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
              <div className="pagination-summary-text">
                  Menampilkan {firstRow}–{lastRow} dari {filtered.length} transaksi
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
