// riwayat-absen — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { dateTimeID, idr } from '../../lib/format.js';
import { readHistory, writeHistory } from '../../lib/historyCache.js';
import DateSheet, { withinRange } from '../../components/DateSheet.jsx';
import { t } from '../../lib/i18n.js';

// ten rows a page, the same slice every history screen uses
const ROWS_PER_PAGE = 10;
// the streak is short, but the whole log is read once so the summary and the
// pager both work on the real total
const MAX_PAGES = 25;

// the attendance settings name the wallet the bonus lands in
const WALLET_LABEL = {
  balance: 'Saldo Tersedia',
  balance_deposit: 'Saldo Isi Ulang',
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
/* riwayat-absen — ported from Figma export, typography re-synced */
.scr-riwayat-absen{
  --bg-dark: #0c1a2d;
  --bg-card: #1f3048;
  --text-primary: #ffffff;
  --text-secondary: #a9b7c8;
  --text-tertiary: #75879c;
  --text-muted: #8597ab;
  --text-light: #c3cedb;
  --accent-green: #3ecf8e;
  --accent-green-bg: rgba(62, 207, 142, 0.14);
  --border-color: #2f4560;
  --divider-color: rgba(201, 212, 225, 0.18);
}
.scr-riwayat-absen *{
  box-sizing: border-box;
}
.scr-riwayat-absen h1,
.scr-riwayat-absen h2,
.scr-riwayat-absen h3,
.scr-riwayat-absen h4,
.scr-riwayat-absen h5,
.scr-riwayat-absen h6,
.scr-riwayat-absen p{
  margin: 0;
}
.scr-riwayat-absen .app-section{
  width: 100%;
  display: flex;
  justify-content: center;
}
.scr-riwayat-absen .app-container{
  width: 100%;
  background: radial-gradient(100% 100% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%);
  background-attachment: fixed;
  background-color: var(--bg-dark);
}
.scr-riwayat-absen .icon-btn{
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-card);
  border-radius: 50%;
  cursor: pointer;
}
.scr-riwayat-absen .header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 0;
  gap: 12px;
}
.scr-riwayat-absen .back-btn{
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}
.scr-riwayat-absen .header-title-container{
  flex: 1;
  display: flex;
  justify-content: center;
}
.scr-riwayat-absen .header-title{
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}
.scr-riwayat-absen .header-spacer{
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}
.scr-riwayat-absen .summary-container{
  padding: 20px 16px 0;
}
.scr-riwayat-absen .summary-card{
  display: flex;
  align-items: center;
  gap: 12px;
}
.scr-riwayat-absen .summary-icon{
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background: linear-gradient(135deg, #5982bf 0%, #2b4c80 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.scr-riwayat-absen .summary-info{
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-riwayat-absen .summary-label{
  font-size: 12px;
  color: var(--text-secondary);
}
.scr-riwayat-absen .summary-amount{
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}
.scr-riwayat-absen .summary-days{
  font-size: 12px;
  color: var(--text-muted);
  align-self: flex-start;
  margin-top: 15px;
}
.scr-riwayat-absen .filter-container{
  padding: 24px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-riwayat-absen .filter-label{
  font-size: 12px;
  color: var(--text-secondary);
}
.scr-riwayat-absen .filter-inputs{
  display: flex;
  align-items: center;
  gap: 8px;
}
.scr-riwayat-absen .date-input{
  flex: 1;
  height: 42px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
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
.scr-riwayat-absen .date-input.is-set{
  border-color: #7faae6;
  background-color: #223a5c;
}
.scr-riwayat-absen .date-input:active{
  opacity: 0.8;
}
.scr-riwayat-absen .date-text{
  display: flex;
  flex-direction: column;
}
.scr-riwayat-absen .date-label{
  font-size: 10px;
  color: var(--text-tertiary);
}
.scr-riwayat-absen .date-value{
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
}
.scr-riwayat-absen .date-divider{
  width: 8px;
  height: 1.5px;
  background-color: #51657e;
}
.scr-riwayat-absen .history-list{
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
}
.scr-riwayat-absen .history-card{
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  border-bottom: 1px solid var(--divider-color);
  gap: 10px;
}
.scr-riwayat-absen .history-card:last-child{
  border-bottom: none;
}
.scr-riwayat-absen .hc-header{
  display: flex;
  align-items: center;
  gap: 12px;
}
.scr-riwayat-absen .hc-icon{
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.scr-riwayat-absen .hc-title-group{
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.scr-riwayat-absen .hc-title{
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}
.scr-riwayat-absen .hc-datetime{
  font-size: 11px;
  color: var(--text-tertiary);
}
.scr-riwayat-absen .hc-status-group{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.scr-riwayat-absen .hc-amount{
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-green);
}
.scr-riwayat-absen .hc-currency{
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
}
.scr-riwayat-absen .hc-status{
  font-size: 10px;
  font-weight: 500;
  color: var(--accent-green);
  background-color: var(--accent-green-bg);
  padding: 3px 7px;
  border-radius: 9px;
}
.scr-riwayat-absen .hc-details{
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-left: 48px;
}
.scr-riwayat-absen .hc-detail-row{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.scr-riwayat-absen .hc-detail-label{
  font-size: 12px;
  color: var(--text-tertiary);
}
.scr-riwayat-absen .hc-detail-value{
  font-size: 12px;
  color: var(--text-light);
}
.scr-riwayat-absen .pagination-wrapper{
  padding: 20px 16px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.scr-riwayat-absen .pagination-controls{
  display: flex;
  align-items: center;
  gap: 6px;
}
.scr-riwayat-absen .page-btn{
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
}
.scr-riwayat-absen .page-btn.active{
  background: linear-gradient(135deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
  font-weight: 600;
}
/* the Figma frame has no empty, ellipsis or disabled-arrow states */
.scr-riwayat-absen .list-state{
  padding: 12px 0;
  text-align: center;
  font-size: 12px;
  line-height: 18px;
  color: var(--text-muted);
}
.scr-riwayat-absen .page-dots{
  color: var(--text-tertiary);
  font-size: 12px;
  padding: 0 4px;
}
.scr-riwayat-absen .page-btn:disabled{
  opacity: 0.4;
  cursor: default;
}
.scr-riwayat-absen .prev-btn,
.scr-riwayat-absen .next-btn{
  background-color: var(--bg-card);
}
.scr-riwayat-absen .pagination-info{
  font-size: 11px;
  color: var(--text-tertiary);
}
.scr-riwayat-absen { width: 100%; background: radial-gradient(100% 100% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-riwayat-absen section > .app-container { min-height: 0; background: none; }
/* figma re-sync */
.scr-riwayat-absen .header-title.header-title { font-size: 17px; }
.scr-riwayat-absen .header-title.header-title { font-weight: 700; }
.scr-riwayat-absen .summary-amount.summary-amount { font-weight: 600; }
.scr-riwayat-absen .summary-days.summary-days { font-size: 11px; }
.scr-riwayat-absen .date-label.date-label { font-size: 9px; }
.scr-riwayat-absen .date-value.date-value { font-weight: 600; }
.scr-riwayat-absen .hc-title.hc-title { font-size: 13px; }
.scr-riwayat-absen .hc-title.hc-title { font-weight: 600; }
.scr-riwayat-absen .hc-currency.hc-currency { font-size: 10px; }
.scr-riwayat-absen .hc-currency.hc-currency { font-weight: 500; }
.scr-riwayat-absen .hc-status.hc-status { font-weight: 600; }
.scr-riwayat-absen .hc-detail-label.hc-detail-label { font-size: 11px; }
.scr-riwayat-absen .hc-detail-value.hc-detail-value { font-size: 11px; }
`;

export default function RiwayatAbsen() {
  // the log this screen painted last renders immediately; the API call below
  // replaces it in the background
  const [rows, setRows] = useState(() => readHistory('absen')?.rows || []);
  const [status, setStatus] = useState(() => (readHistory('absen') ? 'ready' : 'loading'));
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [picker, setPicker] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      // the headline and the page numbers both work on the whole log, so every
      // page of the attendance history is read once and cached in state
      const all = [];
      let failed = null;
      const sorted = () => [...all].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
      // each page is painted the moment it lands, so the log starts filling up
      // while the older pages are still being read
      const paint = () => {
        if (!alive) return;
        setRows(sorted());
        setStatus('ready');
      };
      for (let n = 1; n <= MAX_PAGES; n += 1) {
        const res = await api.attendanceLogs({ page: n });
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
        if (!readHistory('absen')) {
          setError(friendlyError(failed, 'Gagal memuat riwayat absen.'));
          setStatus('error');
        }
        return;
      }
      writeHistory('absen', { rows: sorted() });
      paint();
    })().catch(() => {
      if (!alive || readHistory('absen')) return;
      setError('Gagal memuat riwayat absen.');
      setStatus('error');
    });
    return () => {
      alive = false;
    };
  }, []);

  // the settings decide which wallet the claim credited; the frame names the
  // main one when the setting has not answered yet
  useEffect(() => {
    let alive = true;
    api.attendanceSettings()
      .then((res) => {
        if (alive && res.ok) setWallet(WALLET_LABEL[res.data?.balance_source] || '');
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // the date boxes narrow the log; an empty range means "everything"
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

  // the headline is the whole log, the boxes only narrow the list below
  const totalBonus = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const oldest = rows.length ? rows[rows.length - 1].created_at : '';
  const newest = rows.length ? rows[0].created_at : '';
  const fromDate = oldest ? dateTimeID(oldest).slice(0, 10) : '';
  const toDate = newest ? dateTimeID(newest).slice(0, 10) : '';
  const firstRow = filtered.length ? (current - 1) * ROWS_PER_PAGE + 1 : 0;
  const lastRow = Math.min(current * ROWS_PER_PAGE, filtered.length);

  return (
    <div className="scr-riwayat-absen">
      <style>{css}</style>
      <section id="section-header" className="app-section">
        <div className="app-container">
          <header className="header">
            <div className="icon-btn back-btn" data-back="1">
              <img src="/assets/img/2abb461b6a.svg" alt="Back" />
            </div>
            <div className="header-title-container">
              <h1 className="header-title">{t('Riwayat Absen')}</h1>
            </div>
            <div className="header-spacer"></div>
          </header>
        </div>
      </section>
      <section id="section-summary" className="app-section">
        <div className="app-container">
          <div className="summary-container">
            <div className="summary-card">
              <div className="summary-icon">
                <img src="/assets/img/8ec01d9c34.svg" alt="Calendar" />
              </div>
              <div className="summary-info">
                <div className="summary-label">{t('Total bonus absen · sejak akun aktif')}</div>
                <div className="summary-amount">{status === 'ready' ? `${idr(totalBonus)} IDR` : ''}</div>
              </div>
              <div className="summary-days">{status === 'ready' ? `${rows.length} absen` : ''}</div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-filter" className="app-section">
        <div className="app-container">
          <div className="filter-container">
            <div className="filter-label">{t('Pilih tanggal')}</div>
            <div className="filter-inputs">
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
        </div>
      </section>
      <section id="section-history-list" className="app-section">
        <div className="app-container">
          <div className="history-list">
            {status === 'error' && <p className="list-state">{error}</p>}
            {status === 'ready' && visible.length === 0 && (
              <p className="list-state">
                {rangeActive
                  ? 'Tidak ada absen pada rentang tanggal ini.'
                  : 'Belum ada absen.'}
              </p>
            )}
            {status === 'ready' && visible.map((row) => (
              <div className="history-card" key={row.id}>
                <div className="hc-header">
                  <div className="hc-icon">
                    <img src="/assets/img/a7d0c8cd27.svg" alt="icon" />
                  </div>
                  <div className="hc-title-group">
                    <div className="hc-title">Absen hari ke-{Number(row.streak_count) || 0}</div>
                    <div className="hc-datetime">{dateTimeID(row.created_at, true)} WIB</div>
                  </div>
                  <div className="hc-status-group">
                    <div className="hc-amount">+{idr(row.amount)} <span className="hc-currency">{t('IDR')}</span></div>
                    <div className="hc-status">{t('Berhasil')}</div>
                  </div>
                </div>
                <div className="hc-details">
                  <div className="hc-detail-row">
                    <span className="hc-detail-label">{t('Total absen')}</span>
                    <span className="hc-detail-value">{Number(row.streak_count) || 0} hari</span>
                  </div>
                  <div className="hc-detail-row">
                    <span className="hc-detail-label">{t('Bonus absen')}</span>
                    <span className="hc-detail-value">{idr(row.amount)} IDR</span>
                  </div>
                  <div className="hc-detail-row">
                    <span className="hc-detail-label">{t('Masuk ke')}</span>
                    <span className="hc-detail-value">{wallet || 'Saldo Tersedia'}</span>
                  </div>
                </div>
              </div>
            ))}
            
          </div>
        </div>
      </section>
      {/* nothing to page through while the list is empty */}
      {filtered.length > 0 && (
      <section id="section-pagination" className="app-section">
        <div className="app-container">
          <div className="pagination-wrapper">
            <div className="pagination-controls">
              <button
                type="button"
                className="page-btn prev-btn"
                aria-label={t('Previous page')}
                disabled={current <= 1}
                onClick={(event) => {
                  event.stopPropagation();
                  setPage(Math.max(1, current - 1));
                  event.currentTarget.closest('.phone-scroll')?.scrollTo(0, 0);
                }}
              >
                <img src="/assets/img/be233d23da.svg" alt="Prev" />
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
                className="page-btn next-btn"
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
            <div className="pagination-info">
              Menampilkan {firstRow}–{lastRow} dari {filtered.length} absen
            </div>
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
