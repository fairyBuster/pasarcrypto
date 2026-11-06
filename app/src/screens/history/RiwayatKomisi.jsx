// riwayat-komisi — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { dateTimeID, idr, maskName, maskPhone, trxStamp } from '../../lib/format.js';
import { readHistory, writeHistory } from '../../lib/historyCache.js';
import DateSheet, { withinRange } from '../../components/DateSheet.jsx';
import { t } from '../../lib/i18n.js';

// ten rows a page, the same slice every history screen uses
const ROWS_PER_PAGE = 10;
const MAX_PAGES = 25;

// both commission kinds land in the main balance, so the rows are one history
const TYPES = ['PURCHASE_COMMISSION', 'PROFIT_COMMISSION'];
const TYPE_LABEL = {
  PURCHASE_COMMISSION: 'Komisi transaksi',
  PROFIT_COMMISSION: 'Komisi profit',
};

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

// the design splits the history by referral level
const TABS = [
  { key: 'all', label: 'Semua', level: 0 },
  { key: 'l1', label: 'Level 1', level: 1 },
  { key: 'l2', label: 'Level 2', level: 2 },
  { key: 'l3', label: 'Level 3', level: 3 },
];

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

// a commission row only carries the percentage that was applied, so the amount
// it was cut from is recovered with the product rate for that level; without the
// rate (product gone or level without a rebate) the row stays blank
const baseFor = (row, products) => {
  const product = products[row.product];
  const rates = row.type === 'PROFIT_COMMISSION'
    ? product?.profit_commission_rates
    : product?.purchase_commission_rates;
  const rate = Number(rates?.[Number(row.commission_level) - 1]) || 0;
  return rate > 0 ? (Number(row.amount) / rate) * 100 : null;
};

const css = `
/* riwayat-komisi — ported from Figma export, typography re-synced */
.scr-riwayat-komisi *{
  box-sizing: border-box;
}
.scr-riwayat-komisi .app-container{
  width: 100%;
  min-height: 100cqh;
  background: radial-gradient(100% 100% at 70% 0%, rgba(78, 108, 142, 0.4) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(160deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%);
  font-family: 'Inter', sans-serif;
  color: #ffffff;
  position: relative;
  overflow-x: hidden;
}
.scr-riwayat-komisi button{
  font-family: inherit;
}
.scr-riwayat-komisi .app-header{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
    }
.scr-riwayat-komisi .back-btn{
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
.scr-riwayat-komisi .header-title{
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      color: #ffffff;
    }
.scr-riwayat-komisi .header-placeholder{
      width: 40px;
      height: 40px;
    }
.scr-riwayat-komisi #section-summary{
      padding: 0 16px;
    }
.scr-riwayat-komisi .summary-container{
      display: flex;
      align-items: center;
      gap: 12px;
    }
.scr-riwayat-komisi .summary-icon-wrapper{
      width: 44px;
      height: 44px;
      border-radius: 22px;
      background: linear-gradient(135deg, #5a82bf 0%, #2c4c80 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
.scr-riwayat-komisi .summary-content{
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 2px;
    }
.scr-riwayat-komisi .summary-label{
      font-size: 11px;
      color: #a9b7c8;
    }
.scr-riwayat-komisi .summary-value{
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
    }
.scr-riwayat-komisi .summary-stats{
      font-size: 11px;
      color: #8597ab;
    }
.scr-riwayat-komisi #section-filters{
      padding: 20px 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
.scr-riwayat-komisi .date-picker-section{
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
.scr-riwayat-komisi .date-label{
      font-size: 12px;
      color: #a9b7c8;
    }
.scr-riwayat-komisi .date-inputs{
      display: flex;
      align-items: center;
      gap: 8px;
    }
.scr-riwayat-komisi .date-field{
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
.scr-riwayat-komisi .date-field.is-set{
      border-color: #7faae6;
      background-color: #223a5c;
    }
.scr-riwayat-komisi .date-field:active{
      opacity: 0.8;
    }
.scr-riwayat-komisi .date-field-text{
      display: flex;
      flex-direction: column;
    }
.scr-riwayat-komisi .date-field-label{
      font-size: 10px;
      color: #75879c;
    }
.scr-riwayat-komisi .date-field-value{
      font-size: 12px;
      color: #ffffff;
    }
.scr-riwayat-komisi .date-separator{
      width: 8px;
      height: 1.5px;
      background-color: #51657e;
    }
.scr-riwayat-komisi .tabs-section{
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
    }
.scr-riwayat-komisi .tabs-section::-webkit-scrollbar{
      display: none;
    }
.scr-riwayat-komisi .tab-btn{
      height: 30px;
      padding: 0 14px;
      border-radius: 15px;
      background-color: #1f3048;
      color: #a9b7c8;
      font-size: 12px;
      border: none;
      white-space: nowrap;
      cursor: pointer;
    }
.scr-riwayat-komisi .tab-btn.active{
      background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
      color: #0c1a2d;
      font-weight: 600;
    }
.scr-riwayat-komisi #section-list{
      padding: 0 16px;
      display: flex;
      flex-direction: column;
    }
.scr-riwayat-komisi .transaction-card{
      padding: 16px 0;
      border-bottom: 1px solid rgba(201, 212, 225, 0.18);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
.scr-riwayat-komisi .transaction-card:last-child{
      border-bottom: none;
    }
.scr-riwayat-komisi .card-header{
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
.scr-riwayat-komisi .card-icon{
      width: 36px;
      height: 36px;
      border-radius: 18px;
      background-color: #1f3048;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
.scr-riwayat-komisi .card-title-area{
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 2px;
    }
.scr-riwayat-komisi .card-title{
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
    }
.scr-riwayat-komisi .card-datetime{
      font-size: 10px;
      color: #75879c;
    }
.scr-riwayat-komisi .card-status-area{
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
.scr-riwayat-komisi .card-points{
      font-size: 13px;
      font-weight: 600;
      color: #3ecf8e;
    }
.scr-riwayat-komisi .card-badge{
      font-size: 9px;
      color: #3ecf8e;
      background-color: rgba(62, 207, 142, 0.14);
      padding: 2px 6px;
      border-radius: 8px;
    }
.scr-riwayat-komisi .card-body{
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-left: 48px;
    }
.scr-riwayat-komisi .info-row{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
.scr-riwayat-komisi .info-label{
      font-size: 11px;
      color: #75879c;
    }
.scr-riwayat-komisi .info-value{
      font-size: 11px;
      color: #c3cedb;
      display: flex;
      align-items: center;
      gap: 4px;
      text-align: right;
    }
.scr-riwayat-komisi #section-pagination{
    padding: 24px 16px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
.scr-riwayat-komisi .pagination-controls{
    display: flex;
    align-items: center;
    gap: 6px;
  }
.scr-riwayat-komisi .page-nav-btn{
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background-color: rgba(31, 48, 72, 0.4);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
.scr-riwayat-komisi .page-num-btn{
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background-color: transparent;
    color: #a9b7c8;
    font-size: 12px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
.scr-riwayat-komisi .page-num-btn.active{
    background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    font-weight: 600;
  }
.scr-riwayat-komisi .page-dots{
    color: #75879c;
    font-size: 12px;
    padding: 0 4px;
  }
.scr-riwayat-komisi .pagination-info{
    font-size: 11px;
    color: #75879c;
  }
/* the Figma frame has no loading, empty or edge states */
.scr-riwayat-komisi .card-badge.status-diproses{
    color: #c9d4e1;
    background-color: rgba(201, 212, 225, 0.12);
  }
.scr-riwayat-komisi .card-badge.status-gagal{
    color: #f2667a;
    background-color: rgba(242, 102, 122, 0.14);
  }
.scr-riwayat-komisi .card-points.text-muted{
    color: #8597ab;
  }
.scr-riwayat-komisi .list-state{
    padding: 12px 0;
    color: #8597ab;
    font-size: 12px;
    text-align: center;
  }
.scr-riwayat-komisi .page-nav-btn:disabled{
    opacity: 0.4;
    cursor: default;
  }
.scr-riwayat-komisi .info-value .copy-icon{
    width: 11px;
    height: 11px;
    cursor: pointer;
  }
/* figma re-sync */
.scr-riwayat-komisi .header-title.header-title { font-size: 17px; }
.scr-riwayat-komisi .header-title.header-title { font-weight: 700; }
.scr-riwayat-komisi .summary-label.summary-label { font-size: 12px; }
.scr-riwayat-komisi .summary-value.summary-value { font-weight: 600; }
.scr-riwayat-komisi .date-field-label.date-field-label { font-size: 9px; }
.scr-riwayat-komisi .tab-btn.active.tab-btn { color: #0C1A2D; }
.scr-riwayat-komisi .card-datetime.card-datetime { font-size: 11px; }
.scr-riwayat-komisi .card-badge.card-badge { font-size: 10px; }
`;

export default function RiwayatKomisi() {
  // the rows and lookups this screen painted last render immediately; the API
  // calls below replace them in the background
  const [rows, setRows] = useState(() => readHistory('komisi')?.rows || []);
  const [members, setMembers] = useState(() => readHistory('komisi')?.members || {});
  const [products, setProducts] = useState(() => readHistory('komisi')?.products || {});
  const [status, setStatus] = useState(() => (readHistory('komisi') ? 'ready' : 'loading'));
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  // the date boxes open this sheet; an empty range means "everything"
  const [range, setRange] = useState({ from: '', to: '' });
  const [picker, setPicker] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      // the rows name the friend only by phone, so the downline list supplies the
      // names, and the product rates recover the amount a commission came from
      const downlines = api.downlines();
      const catalogue = (async () => {
        const map = {};
        for (let n = 1; n <= MAX_PAGES; n += 1) {
          const res = await api.products({ page: n });
          if (!res.ok) break;
          const list = Array.isArray(res.data?.results) ? res.data.results : [];
          for (const item of list) map[item.id] = item;
          if (!res.data?.next || list.length === 0) break;
        }
        return map;
      })();

      // the chips and the page numbers work on the whole history, so every page
      // of both commission kinds is read once and cached in state
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

      const [people, catalog] = await Promise.all([downlines, catalogue]);
      if (!alive) return;

      // a failed page only sinks the screen when nothing at all came back;
      // with a cached list on screen the refresh stays silent
      if (all.length === 0 && failed) {
        if (!readHistory('komisi')) {
          setError(friendlyError(failed, 'Gagal memuat riwayat komisi.'));
          setStatus('error');
        }
        return;
      }

      const byPhone = {};
      if (people.ok) {
        for (const member of people.data?.members || []) byPhone[member.phone] = member;
      }

      all.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
      writeHistory('komisi', { rows: all, members: byPhone, products: catalog });
      setRows([...all]);
      setMembers(byPhone);
      setProducts(catalog);
      setStatus('ready');
    })().catch(() => {
      if (!alive || readHistory('komisi')) return;
      setError('Gagal memuat riwayat komisi.');
      setStatus('error');
    });
    return () => {
      alive = false;
    };
  }, []);

  const active = TABS.find((item) => item.key === tab) || TABS[0];
  // the chips pick the level, the date boxes pick the days
  const filtered = rows.filter(
    (row) =>
      (!active.level || Number(row.commission_level) === active.level) &&
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

  // "sejak akun aktif": commission that actually reached the balance
  const settled = rows.filter((row) => row.status === 'COMPLETED');
  const totalCommission = settled.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const oldest = rows.length ? rows[rows.length - 1].created_at : '';
  const newest = rows.length ? rows[0].created_at : '';
  const fromDate = oldest ? dateTimeID(oldest).slice(0, 10) : '—';
  const toDate = newest ? dateTimeID(newest).slice(0, 10) : '—';

  const firstRow = filtered.length ? (current - 1) * ROWS_PER_PAGE + 1 : 0;
  const lastRow = Math.min(current * ROWS_PER_PAGE, filtered.length);

  return (
    <div className="scr-riwayat-komisi">
      <style>{css}</style>
      <main className="app-container">
        <section id="section-header">
          <header className="app-header">
            <button className="back-btn" data-back="1">
              <img src="/assets/img/e4afe024ef.svg" alt="Back" />
            </button>
            <h1 className="header-title">{t('Riwayat Komisi')}</h1>
            <div className="header-placeholder"></div>
          </header>
        </section>
      <section id="section-summary">
          <div className="summary-container">
            <div className="summary-icon-wrapper">
              <img src="/assets/img/79280a0f89.svg" alt="Commission Icon" />
            </div>
            <div className="summary-content">
              <div className="summary-label">{t('Total komisi · sejak akun aktif')}</div>
              <div className="summary-value">{idr(totalCommission)} IDR</div>
            </div>
            <div className="summary-stats">
              {settled.length} transaksi
            </div>
          </div>
        </section>
      <section id="section-filters">
          <div className="date-picker-section">
            <div className="date-label">{t('Pilih tanggal')}</div>
            <div className="date-inputs">
              <button
                type="button"
                className={`date-field${range.from ? ' is-set' : ''}`}
                onClick={() => setPicker('from')}
              >
                <img src="/assets/img/c844b1a1dc.svg" alt="" />
                <div className="date-field-text">
                  <span className="date-field-label">{t('Dari')}</span>
                  <span className="date-field-value">{range.from || fromDate}</span>
                </div>
              </button>
              <div className="date-separator"></div>
              <button
                type="button"
                className={`date-field${range.to ? ' is-set' : ''}`}
                onClick={() => setPicker('to')}
              >
                <img src="/assets/img/c844b1a1dc.svg" alt="" />
                <div className="date-field-text">
                  <span className="date-field-label">{t('Sampai')}</span>
                  <span className="date-field-value">{range.to || toDate}</span>
                </div>
              </button>
            </div>
          </div>
          <div className="tabs-section">
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
        </section>
      <section id="section-list">
        {status === 'error' && <div className="list-state">{error}</div>}
        {status === 'ready' && visible.length === 0 && (
          <div className="list-state">
            {rangeActive
              ? 'Tidak ada komisi pada rentang tanggal ini.'
              : 'Belum ada komisi pada filter ini.'}
          </div>
        )}

        {visible.map((row) => {
          const friend = members[row.upline_phone];
          const friendName = friend?.full_name || friend?.username || row.upline_phone || '';
          const level = Number(row.commission_level) || 0;
          const base = baseFor(row, products);
          const done = row.status === 'COMPLETED';
          return (
            <div className="transaction-card" key={row.id}>
              <div className="card-header">
                <div className="card-icon"><img src="/assets/img/206d4769d2.svg" alt="User" /></div>
                <div className="card-title-area">
                  <div className="card-title">{friendName ? `Komisi dari ${maskName(friendName)}` : 'Komisi'}</div>
                  <div className="card-datetime">{dateTimeID(row.created_at, true)} WIB</div>
                </div>
                <div className="card-status-area">
                  <div className={done ? 'card-points' : 'card-points text-muted'}>+{idr(row.amount)} IDR</div>
                  <div className={`card-badge ${STATUS_TONE[row.status] || 'status-diproses'}`}>
                    {STATUS_LABEL[row.status] || row.status}
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">{t('Teman')}</span>
                  <span className="info-value">
                    {friendName ? [maskName(friendName), level ? `Level ${level}` : ''].filter(Boolean).join(' · ') : '—'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t('Nomor teman')}</span>
                  <span className="info-value">{maskPhone(row.upline_phone)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t('Jenis')}</span>
                  <span className="info-value">{TYPE_LABEL[row.type] || row.type}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{row.type === 'PROFIT_COMMISSION' ? 'Profit teman' : 'Volume trading teman'}</span>
                  <span className="info-value">{base == null ? '—' : `${idr(base)} IDR`}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t('No. Transaksi')}</span>
                  <div className="info-value">
                    {trxStamp(row.trx_id, row.created_at)}
                    <img src="/assets/img/99db6e1ed6.svg" alt="Copy" className="copy-icon" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>
      {/* nothing to page through while the list is empty or failed to load */}
      {status === 'ready' && filtered.length > 0 && (
      <section id="section-pagination">
        <div className="pagination-controls">
          <button
            type="button"
            className="page-nav-btn"
            disabled={current <= 1}
            onClick={(event) => {
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
                className={item === current ? 'page-num-btn active' : 'page-num-btn'}
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
          Menampilkan {firstRow}–{lastRow} dari {filtered.length} transaksi
        </div>
      </section>
      )}
      </main>
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
