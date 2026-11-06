// riwayat-misi — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { dateTimeID, idr, trxStamp } from '../../lib/format.js';
import { readHistory, writeHistory } from '../../lib/historyCache.js';
import DateSheet, { withinRange } from '../../components/DateSheet.jsx';
import { t } from '../../lib/i18n.js';

// ten rows a page, the same slice every history screen uses
const ROWS_PER_PAGE = 10;
// a claim books one MISSIONS credit in the ledger; the whole history is read
// once so the summary and the pager both work on the real total
const MAX_PAGES = 25;

// a mission reward lands in one of the wallets the design names
const WALLET_LABEL = {
  BALANCE: 'Saldo Tersedia',
  BALANCE_DEPOSIT: 'Saldo Isi Ulang',
  BALANCE_CASHBACK: 'Saldo Cashback',
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
/* riwayat-misi — ported from Figma export, typography re-synced */
.scr-riwayat-misi body::before{
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at top left, rgba(78, 108, 142, 0.4) 0%, transparent 60%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%);
  z-index: -1;
}
.scr-riwayat-misi section{
  width: 100%;
  box-sizing: border-box;
}
.scr-riwayat-misi *{
  box-sizing: border-box;
}
.scr-riwayat-misi #section-header{
  padding-top: 20px;
}
.scr-riwayat-misi .app-header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.scr-riwayat-misi .btn-back{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}
.scr-riwayat-misi .page-title{
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.scr-riwayat-misi .header-spacer{
  width: 40px;
}
.scr-riwayat-misi #section-summary{
  padding: 20px 16px 0;
}
.scr-riwayat-misi .summary-card{
  display: flex;
  align-items: center;
  gap: 12px;
}
.scr-riwayat-misi .summary-icon{
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background: linear-gradient(135deg, #5982bf 0%, #2b4c80 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.scr-riwayat-misi .summary-info{
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-riwayat-misi .summary-label{
  color: #a9b7c8;
  font-size: 12px;
  margin: 0;
}
.scr-riwayat-misi .summary-value{
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.scr-riwayat-misi .summary-badge{
  color: #8597ab;
  font-size: 12px;
}
.scr-riwayat-misi #section-filter{
  padding: 20px 16px 10px;
}
.scr-riwayat-misi .filter-title{
  color: #a9b7c8;
  font-size: 12px;
  margin: 0 0 8px 0;
}
.scr-riwayat-misi .date-range{
  display: flex;
  align-items: center;
  gap: 8px;
}
.scr-riwayat-misi .date-input{
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
.scr-riwayat-misi .date-input.is-set{
  border-color: #7faae6;
  background-color: #223a5c;
}
.scr-riwayat-misi .date-input:active{
  opacity: 0.8;
}
.scr-riwayat-misi .date-text{
  display: flex;
  flex-direction: column;
}
.scr-riwayat-misi .date-label{
  color: #75879c;
  font-size: 10px;
}
.scr-riwayat-misi .date-value{
  color: #ffffff;
  font-size: 12px;
}
.scr-riwayat-misi .date-divider{
  width: 8px;
  height: 1.5px;
  background-color: #51657e;
}
.scr-riwayat-misi #section-mission-list{
  padding: 0 16px;
}
.scr-riwayat-misi .mission-list{
  display: flex;
  flex-direction: column;
}
.scr-riwayat-misi .mission-item{
  padding: 16px 0;
  border-bottom: 1px solid rgba(201, 212, 225, 0.18);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scr-riwayat-misi .mission-item:last-child{
  border-bottom: none;
}
.scr-riwayat-misi .mission-header{
  display: flex;
  align-items: center;
  gap: 12px;
}
.scr-riwayat-misi .mission-icon{
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #1f3048;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.scr-riwayat-misi .mission-title-group{
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-riwayat-misi .mission-title{
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}
.scr-riwayat-misi .mission-date{
  color: #75879c;
  font-size: 11px;
  margin: 0;
}
.scr-riwayat-misi .mission-status-group{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.scr-riwayat-misi .mission-amount{
  color: #3ecf8e;
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}
.scr-riwayat-misi .currency{
  color: #8597ab;
  font-size: 10px;
  font-weight: 400;
}
.scr-riwayat-misi .status-badge{
  background-color: rgba(62, 207, 142, 0.14);
  color: #3ecf8e;
  font-size: 10px;
  padding: 3px 7px;
  border-radius: 9px;
}
.scr-riwayat-misi .mission-details{
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 48px;
}
.scr-riwayat-misi .detail-row{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.scr-riwayat-misi .detail-label{
  color: #75879c;
  font-size: 12px;
}
.scr-riwayat-misi .detail-value{
  color: #c3cedb;
  font-size: 12px;
  display: flex;
  align-items: center;
}
/* a mission description can run long, so the target keeps its own column and
   wraps instead of pushing the row past the frame */
.scr-riwayat-misi .detail-value-text{
  display: block;
  max-width: 62%;
  text-align: right;
  line-height: 1.45;
}
.scr-riwayat-misi .copy-icon{
  width: 11px;
  height: 11px;
  margin-left: 5px;
  cursor: pointer;
}
.scr-riwayat-misi #section-pagination{
  padding: 24px 16px 40px;
}
.scr-riwayat-misi .pagination-container{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.scr-riwayat-misi .pagination-controls{
  display: flex;
  align-items: center;
  gap: 6px;
}
.scr-riwayat-misi .page-nav-btn{
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
/* the Figma frame has no empty, ellipsis or disabled-arrow states */
.scr-riwayat-misi .page-nav-btn:disabled{
  opacity: 0.4;
  cursor: default;
}
.scr-riwayat-misi .page-dots{
  color: #75879c;
  font-size: 12px;
  padding: 0 4px;
}
.scr-riwayat-misi .list-state{
  padding: 12px 0;
  text-align: center;
  font-size: 12px;
  line-height: 18px;
  color: #8597ab;
}
.scr-riwayat-misi .page-number{
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}
.scr-riwayat-misi .page-number.active{
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e0 100%);
  color: #0c1a2d;
}
.scr-riwayat-misi .pagination-text{
  color: #75879c;
  font-size: 12px;
  margin: 0;
}
/* figma re-sync */
.scr-riwayat-misi .page-title.page-title { font-size: 17px; }
.scr-riwayat-misi .page-title.page-title { font-weight: 700; }
.scr-riwayat-misi .summary-value.summary-value { font-size: 20px; }
.scr-riwayat-misi .summary-value.summary-value { font-weight: 600; }
.scr-riwayat-misi .summary-badge.summary-badge { font-size: 11px; }
.scr-riwayat-misi .date-label.date-label { font-size: 9px; }
.scr-riwayat-misi .mission-title.mission-title { font-size: 13px; }
.scr-riwayat-misi .currency.currency { font-weight: 500; }
.scr-riwayat-misi .detail-label.detail-label { font-size: 11px; }
.scr-riwayat-misi .detail-value.detail-value { font-size: 11px; }
.scr-riwayat-misi .pagination-text.pagination-text { font-size: 11px; }
`;

export default function RiwayatMisi() {
  // the rows this screen painted last render immediately; the API call below
  // replaces them in the background
  const [rows, setRows] = useState(() => readHistory('misi')?.rows || []);
  const [status, setStatus] = useState(() => (readHistory('misi') ? 'ready' : 'loading'));
  const [error, setError] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [picker, setPicker] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      // a claim credits the wallet through one MISSIONS transaction, the same
      // rows the rewards screen totals
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
      for (let n = 1; n <= MAX_PAGES; n += 1) {
        const res = await api.transactions({ type: 'MISSIONS', status: 'COMPLETED', page: n });
        if (!res.ok) {
          failed = failed || res.data;
          break;
        }
        const list = Array.isArray(res.data?.results) ? res.data.results : [];
        all.push(...list);
        paint();
        if (!res.data?.next || list.length === 0) break;
      }
      if (!alive) return;
      // a failed page only sinks the screen when nothing at all came back;
      // with rows on screen the rest of the pages are simply skipped
      if (all.length === 0 && failed) {
        if (!readHistory('misi')) {
          setError(friendlyError(failed, 'Gagal memuat riwayat misi.'));
          setStatus('error');
        }
        return;
      }
      writeHistory('misi', { rows: sorted() });
      paint();
    })().catch(() => {
      if (!alive || readHistory('misi')) return;
      setError('Gagal memuat riwayat misi.');
      setStatus('error');
    });
    return () => {
      alive = false;
    };
  }, []);

  // the date boxes narrow the claims; an empty range means "everything"
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

  // the headline is the whole history, the boxes only narrow the list below
  const totalReward = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const oldest = rows.length ? rows[rows.length - 1].created_at : '';
  const newest = rows.length ? rows[0].created_at : '';
  const fromDate = oldest ? dateTimeID(oldest).slice(0, 10) : '—';
  const toDate = newest ? dateTimeID(newest).slice(0, 10) : '—';
  const firstRow = filtered.length ? (current - 1) * ROWS_PER_PAGE + 1 : 0;
  const lastRow = Math.min(current * ROWS_PER_PAGE, filtered.length);

  return (
    <div className="scr-riwayat-misi">
      <style>{css}</style>
      <section id="section-header">
        <header className="app-header">
          <button className="btn-back" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/7861050aa5.svg" alt="" />
          </button>
          <h1 className="page-title">{t('Riwayat Misi')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <img src="/assets/img/8fcf609633.svg" alt="" />
          </div>
          <div className="summary-info">
            <p className="summary-label">{t('Total hadiah misi · sejak akun aktif')}</p>
            <p className="summary-value">{status === 'ready' ? `${idr(totalReward)} IDR` : '—'}</p>
          </div>
          <div className="summary-badge">{status === 'ready' ? `${rows.length} misi` : '—'}</div>
        </div>
      </section>
      <section id="section-filter">
        <div className="filter-container">
          <p className="filter-title">{t('Pilih tanggal')}</p>
          <div className="date-range">
            <button
              type="button"
              className={`date-input${range.from ? ' is-set' : ''}`}
              onClick={() => setPicker('from')}
            >
              <img src="/assets/img/c844b1a1dc.svg" alt="" />
              <div className="date-text">
                <span className="date-label">{t('Dari')}</span>
                <span className="date-value">{range.from || fromDate}</span>
              </div>
            </button>
            <div className="date-divider"></div>
            <button
              type="button"
              className={`date-input${range.to ? ' is-set' : ''}`}
              onClick={() => setPicker('to')}
            >
              <img src="/assets/img/c844b1a1dc.svg" alt="" />
              <div className="date-text">
                <span className="date-label">{t('Sampai')}</span>
                <span className="date-value">{range.to || toDate}</span>
              </div>
            </button>
          </div>
        </div>
      </section>
      <section id="section-mission-list">
        <div className="mission-list">
            {status === 'error' && <p className="list-state">{error}</p>}
            {status === 'ready' && visible.length === 0 && (
              <p className="list-state">
                {rangeActive
                  ? 'Tidak ada misi pada rentang tanggal ini.'
                  : 'Belum ada misi.'}
              </p>
            )}
            {status === 'ready' && visible.map((row) => (
              <article className="mission-item" key={row.id}>
                <div className="mission-header">
                  <div className="mission-icon">
                    <img src="/assets/img/466f8f2fc7.svg" alt="" />
                  </div>
                  <div className="mission-title-group">
                    <h2 className="mission-title">{t('Menyelesaikan misi')}</h2>
                    <p className="mission-date">{dateTimeID(row.created_at, true)} WIB</p>
                  </div>
                  <div className="mission-status-group">
                    <p className="mission-amount">+{idr(row.amount)} <span className="currency">{t('IDR')}</span></p>
                    <span className="status-badge">{t('Berhasil')}</span>
                  </div>
                </div>
                <div className="mission-details">
                  <div className="detail-row">
                    <span className="detail-label">{t('Target diselesaikan')}</span>
                    <span className="detail-value detail-value-text">
                      {String(row.description || '').trim() || '—'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('Jenis hadiah')}</span>
                    <span className="detail-value">{t('Bonus saldo')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('Masuk ke')}</span>
                    <span className="detail-value">{WALLET_LABEL[row.wallet_type] || 'Saldo Tersedia'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('No. Transaksi')}</span>
                    <span className="detail-value">{trxStamp(row.transaction_id, row.created_at)} <img src="/assets/img/eaeec8e3f8.svg" alt="Copy" className="copy-icon" /></span>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>
      {/* nothing to page through while the list is empty */}
      {filtered.length > 0 && (
      <section id="section-pagination">
        <div className="pagination-container">
          <div className="pagination-controls">
            <button
              type="button"
              className="page-nav-btn"
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
                  className={item === current ? 'page-number active' : 'page-number'}
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
              className="page-nav-btn"
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
          <p className="pagination-text">
            Menampilkan {firstRow}–{lastRow} dari {filtered.length} misi
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
