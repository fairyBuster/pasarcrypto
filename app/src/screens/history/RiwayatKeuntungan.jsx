// riwayat-keuntungan — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { dateTimeID, idr, rateLabel, rateValue } from '../../lib/format.js';
import { readHistory, writeHistory } from '../../lib/historyCache.js';
import { BUCKET_LABELS, bucketOf } from '../../lib/useAssets.js';
import DateSheet, { withinRange } from '../../components/DateSheet.jsx';
import { t } from '../../lib/i18n.js';

// ten rows a page, the same slice every history screen uses
const ROWS_PER_PAGE = 10;
// daily profit on every holding adds up fast, so the whole history is capped
const MAX_PAGES = 25;

// the design only draws the earned badge, the API also has the open states
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

// the chips are the product categories the catalogue sells (the same golongan
// the Pasar and Aset screens show); the fixed three lead, extras follow
const CATEGORY_ORDER = ['steady returns', 'flash earn', 'special earn'];
const categoryRank = (name) => CATEGORY_ORDER.indexOf(name.trim().toLowerCase());

// "1 2 3 … 27" with the current page always in the row
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

// an INTEREST row names the product but not the terms it was sold on, so the
// purchase is matched through the purchase id, then through the product itself
const metaFor = (row, investments) =>
  investments.find((item) => item.transaction_id && item.transaction_id === row.transaction_id) ||
  investments
    .filter((item) => item.product === row.product)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0] ||
  null;

const bucketFor = (row, investments) => {
  const meta = metaFor(row, investments);
  return bucketOf({
    product_golongan: meta?.product_golongan ?? '',
    product_name: meta?.product_name ?? row.product_name ?? '',
    can_claim_principal: Boolean(meta?.can_claim_principal),
  });
};

// a profit row itself carries no golongan, so the chip filter reads it from the
// purchase the row was matched to
const categoryFor = (row, investments) => {
  const meta = metaFor(row, investments);
  const name = (meta?.product_golongan || row.product_golongan || '').trim();
  return name && name !== '-' ? name : '';
};

const css = `
/* riwayat-keuntungan — ported from Figma export, typography re-synced */
.scr-riwayat-keuntungan { background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-riwayat-keuntungan{
  font-family: 'Inter', sans-serif;
  padding: 0;
  width: 100%;
  min-height: 100cqh;
  background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%);
  color: #ffffff;
  box-sizing: border-box;
  padding-bottom: 28px;
  overflow-x: hidden;
}
.scr-riwayat-keuntungan .text-green{ color: #3ecf8e; }
.scr-riwayat-keuntungan .text-gray-dark{ color: #8597ab; }
.scr-riwayat-keuntungan button{
  font-family: 'Inter', sans-serif;
  outline: none;
}
.scr-riwayat-keuntungan .header{
  display: flex;
  align-items: center;
  padding: 20px 16px 0;
  gap: 12px;
}
.scr-riwayat-keuntungan .icon-btn{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.scr-riwayat-keuntungan .title-container{
  flex: 1;
  text-align: center;
}
.scr-riwayat-keuntungan .title{
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}
.scr-riwayat-keuntungan .spacer{
  width: 40px;
}
.scr-riwayat-keuntungan .summary-container{
  display: flex;
  align-items: center;
  padding: 20px 16px 0;
  gap: 12px;
}
.scr-riwayat-keuntungan .summary-icon{
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background: linear-gradient(135deg, #5a82bf 0%, #2c4c80 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.scr-riwayat-keuntungan .summary-info{
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-riwayat-keuntungan .summary-label{
  color: #a9b7c8;
  font-size: 12px;
  line-height: 1.2;
}
.scr-riwayat-keuntungan .summary-value{
  font-size: 20px;
  font-weight: 700;
}
.scr-riwayat-keuntungan .summary-count{
  color: #8597ab;
  font-size: 12px;
}
.scr-riwayat-keuntungan .filters-container{
  padding: 20px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-riwayat-keuntungan .filter-label{
  color: #a9b7c8;
  font-size: 12px;
}
.scr-riwayat-keuntungan .date-pickers{
  display: flex;
  align-items: center;
  gap: 8px;
}
.scr-riwayat-keuntungan .date-input{
  flex: 1;
  background-color: #1f3048;
  border: 1px solid #2f4560;
  border-radius: 12px;
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  box-sizing: border-box;
  /* the box is a button now, so the filter can actually be set */
  min-width: 0;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.scr-riwayat-keuntungan .date-input.is-set{
  border-color: #7faae6;
  background-color: #223a5c;
}
.scr-riwayat-keuntungan .date-input:active{
  opacity: 0.8;
}
.scr-riwayat-keuntungan .date-text{
  display: flex;
  flex-direction: column;
}
.scr-riwayat-keuntungan .date-label{
  color: #75879c;
  font-size: 10px;
}
.scr-riwayat-keuntungan .date-value{
  font-size: 12px;
}
.scr-riwayat-keuntungan .date-divider{
  width: 8px;
  height: 2px;
  background-color: #51657e;
  flex-shrink: 0;
}
.scr-riwayat-keuntungan .category-tabs{
  display: flex;
  gap: 8px;
  margin-top: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.scr-riwayat-keuntungan .category-tabs::-webkit-scrollbar{
  display: none;
}
.scr-riwayat-keuntungan .tab{
  background-color: #1f3048;
  color: #a9b7c8;
  border: none;
  border-radius: 15px;
  height: 30px;
  padding: 0 14px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}
.scr-riwayat-keuntungan .tab.active{
  background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
  font-weight: 700;
}
.scr-riwayat-keuntungan .tx-list{
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.scr-riwayat-keuntungan .tx-card{
  border-bottom: 1px solid rgba(201, 212, 225, 0.18);
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.scr-riwayat-keuntungan .tx-card:first-child{
  border-top: 1px solid rgba(201, 212, 225, 0.18);
}
.scr-riwayat-keuntungan .tx-header{
  display: flex;
  align-items: center;
  gap: 12px;
}
.scr-riwayat-keuntungan .tx-icon{
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #1f3048;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.scr-riwayat-keuntungan .tx-title-group{
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-riwayat-keuntungan .tx-title{
  font-size: 14px;
  font-weight: 700;
}
.scr-riwayat-keuntungan .tx-date{
  color: #75879c;
  font-size: 10px;
}
.scr-riwayat-keuntungan .tx-amount-group{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.scr-riwayat-keuntungan .tx-amount{
  font-size: 14px;
  font-weight: 700;
}
.scr-riwayat-keuntungan .tx-status{
  background-color: rgba(62, 207, 142, 0.14);
  color: #3ecf8e;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
}
.scr-riwayat-keuntungan .tx-details{
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 48px;
}
.scr-riwayat-keuntungan .tx-detail-row{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.scr-riwayat-keuntungan .tx-detail-label{
  color: #75879c;
  font-size: 12px;
}
.scr-riwayat-keuntungan .tx-detail-value{
  color: #c3cedb;
  font-size: 12px;
}
.scr-riwayat-keuntungan .pagination-container{
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.scr-riwayat-keuntungan .pagination{
  display: flex;
  align-items: center;
  gap: 6px;
}
.scr-riwayat-keuntungan .page-btn{
  width: 32px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background-color: transparent;
  color: #a9b7c8;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.scr-riwayat-keuntungan .page-btn.active{
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
  font-weight: 700;
}
.scr-riwayat-keuntungan .page-btn.nav-btn{
  background-color: #1f3048;
}
.scr-riwayat-keuntungan .page-btn:disabled{
  opacity: 0.4;
  cursor: default;
}
.scr-riwayat-keuntungan .page-dots{
  color: #75879c;
  font-size: 12px;
  padding: 0 4px;
}
.scr-riwayat-keuntungan .pagination-info{
  color: #75879c;
  font-size: 12px;
}
/* figma re-sync */
.scr-riwayat-keuntungan .title.title { font-size: 17px; }
.scr-riwayat-keuntungan .summary-value.summary-value { font-weight: 600; }
.scr-riwayat-keuntungan .summary-count.summary-count { font-size: 11px; }
.scr-riwayat-keuntungan .date-label.date-label { font-size: 9px; }
.scr-riwayat-keuntungan .tab.active.tab { color: #0C1A2D; }
.scr-riwayat-keuntungan .tx-title.tx-title { font-size: 13px; }
.scr-riwayat-keuntungan .tx-title.tx-title { font-weight: 600; }
.scr-riwayat-keuntungan .tx-date.tx-date { font-size: 11px; }
.scr-riwayat-keuntungan .tx-detail-label.tx-detail-label { font-size: 11px; }
.scr-riwayat-keuntungan .tx-detail-value.tx-detail-value { font-size: 11px; }
.scr-riwayat-keuntungan .tx-detail-value.tx-detail-value { color: #A9B7C8; }
.scr-riwayat-keuntungan .pagination-info.pagination-info { font-size: 11px; }
/* the Figma frame has no loading, empty or edge states */
.scr-riwayat-keuntungan .tx-status.status-diproses{
  background-color: rgba(201, 212, 225, 0.12);
  color: #c9d4e1;
}
.scr-riwayat-keuntungan .tx-status.status-gagal{
  background-color: rgba(242, 102, 122, 0.14);
  color: #f2667a;
}
.scr-riwayat-keuntungan .list-state{
  padding: 12px 0;
  color: #8597ab;
  font-size: 12px;
  text-align: center;
}
.scr-riwayat-keuntungan .page-btn:disabled{
  opacity: 0.4;
  cursor: default;
}
`;

export default function RiwayatKeuntungan() {
  // the rows and holdings this screen painted last render immediately; the API
  // calls below replace them in the background
  const [rows, setRows] = useState(() => readHistory('keuntungan')?.rows || []);
  const [investments, setInvestments] = useState(() => readHistory('keuntungan')?.investments || []);
  const [status, setStatus] = useState(() => (readHistory('keuntungan') ? 'ready' : 'loading'));
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  // the date boxes open this sheet; an empty range means "everything"
  const [range, setRange] = useState({ from: '', to: '' });
  const [picker, setPicker] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      // the holdings carry the product terms the profit rows leave out
      const holdings = api.investments();
      // the chips and the page numbers work on the whole history, so every page
      // of the endpoint is read once and cached in state
      const all = [];
      // each page is painted the moment it lands, so the list starts filling up
      // while the older pages are still being read
      const paint = () => {
        if (!alive) return;
        setRows([...all]);
        setStatus((prev) => (prev === 'error' ? prev : 'ready'));
      };
      for (let n = 1; n <= MAX_PAGES; n += 1) {
        const res = await api.transactions({ type: 'INTEREST', page: n });
        if (!res.ok) {
          // with a cached list on screen the refresh stays silent
          if (n === 1 && alive && !readHistory('keuntungan')) {
            setError(friendlyError(res.data, 'Gagal memuat riwayat keuntungan.'));
            setStatus('error');
          }
          break;
        }
        const list = Array.isArray(res.data?.results) ? res.data.results : [];
        all.push(...list);
        paint();
        if (!res.data?.next || list.length === 0) break;
      }
      const held = await holdings;
      if (!alive) return;
      const heldList = held.ok && Array.isArray(held.data) ? held.data : null;
      setRows([...all]);
      if (heldList) setInvestments(heldList);
      writeHistory('keuntungan', heldList ? { rows: all, investments: heldList } : { rows: all });
      setStatus((prev) => (prev === 'error' ? prev : 'ready'));
    })().catch(() => {
      if (!alive || readHistory('keuntungan')) return;
      setError('Gagal memuat riwayat keuntungan.');
      setStatus('error');
    });
    return () => {
      alive = false;
    };
  }, []);

  // the categories come from the holdings themselves, the same values the
  // catalogue and the Aset chips use; "Semua" always leads
  const categories = [
    ...new Set(
      investments
        .map((row) => (row.product_golongan || '').trim())
        .filter((name) => name && name !== '-')
    ),
  ].sort((a, b) => {
    const ra = categoryRank(a);
    const rb = categoryRank(b);
    if (ra === -1 && rb === -1) return a.localeCompare(b);
    if (ra === -1) return 1;
    if (rb === -1) return -1;
    return ra - rb;
  });
  const tabs = [
    { key: 'all', label: 'Semua', category: '' },
    ...categories.map((name) => ({ key: name, label: name, category: name })),
  ];
  const active = tabs.find((item) => item.key === tab) || tabs[0];
  // the chips pick the product category, the date boxes pick the days
  const filtered = rows.filter(
    (row) =>
      (!active.category || categoryFor(row, investments) === active.category) &&
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

  // "sejak akun aktif": profit that actually landed in the wallet
  const settled = rows.filter((row) => row.status === 'COMPLETED');
  const totalProfit = settled.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const oldest = rows.length ? rows[rows.length - 1].created_at : '';
  const newest = rows.length ? rows[0].created_at : '';
  const fromDate = oldest ? dateTimeID(oldest).slice(0, 10) : '—';
  const toDate = newest ? dateTimeID(newest).slice(0, 10) : '—';

  const firstRow = filtered.length ? (current - 1) * ROWS_PER_PAGE + 1 : 0;
  const lastRow = Math.min(current * ROWS_PER_PAGE, filtered.length);

  return (
    <div className="scr-riwayat-keuntungan">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="icon-btn" data-back="1">
            <img src="/assets/img/7fac63440f.svg" alt="Back" />
          </button>
          <div className="title-container">
            <h1 className="title">{t('Riwayat Keuntungan')}</h1>
          </div>
          <div className="spacer"></div>
        </header>
      </section>
      <section id="section-summary">
        <div className="summary-container">
          <div className="summary-icon">
            <img src="/assets/img/c9440904e9.svg" alt="Profit" />
          </div>
          <div className="summary-info">
            <div className="summary-label">{t('Total keuntungan · sejak akun aktif')}</div>
            <div className="summary-value">{idr(totalProfit)} IDR</div>
          </div>
          <div className="summary-count">{settled.length} transaksi</div>
        </div>
      </section>
      <section id="section-filters">
        <div className="filters-container">
          <div className="filter-label">{t('Pilih tanggal')}</div>
          <div className="date-pickers">
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
          <div className="category-tabs">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`tab${item.key === active.key ? ' active' : ''}`}
                onClick={(event) => {
                  // the shell also toggles .active on .tab, React owns it here
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
      </section>
      <section id="section-transaction-list">
        <div className="tx-list">

          {status === 'error' && <p className="list-state">{error}</p>}
          {status === 'ready' && visible.length === 0 && (
            <p className="list-state">
              {rangeActive
                ? 'Tidak ada keuntungan pada rentang tanggal ini.'
                : 'Belum ada keuntungan pada filter ini.'}
            </p>
          )}
          {visible.map((row) => {
            const meta = metaFor(row, investments);
            const name = meta?.product_name || row.product_name || '';
            const golongan =
              meta?.product_golongan && meta.product_golongan !== '-' ? meta.product_golongan : '';
            const kind = bucketFor(row, investments);
            const days = Number(meta?.duration_days) || 0;
            const jenis = kind === 'terkunci' ? (meta ? `Terkunci ${days} hari` : '—') : BUCKET_LABELS[kind];
            return (
              <div className="tx-card" key={row.id}>
                <div className="tx-header">
                  <div className="tx-icon">
                    <img src="/assets/img/035483c77b.svg" alt="Profit" />
                  </div>
                  <div className="tx-title-group">
                    <div className="tx-title">{name ? `Imbal hasil ${name}` : 'Imbal hasil'}</div>
                    <div className="tx-date">{dateTimeID(row.created_at, true)} WIB</div>
                  </div>
                  <div className="tx-amount-group">
                    <div className="tx-amount">
                      <span className={row.status === 'COMPLETED' ? 'text-green' : 'text-gray-dark'}>
                        +{idr(row.amount)}
                      </span>{' '}
                      <span className="text-gray-dark">{t('IDR')}</span>
                    </div>
                    <div className={`tx-status ${STATUS_TONE[row.status] || 'status-diproses'}`}>
                      {STATUS_LABEL[row.status] || row.status}
                    </div>
                  </div>
                </div>
                <div className="tx-details">
                  <div className="tx-detail-row">
                    <span className="tx-detail-label">{t('Produk')}</span>
                    <span className="tx-detail-value">
                      {golongan ? `${golongan} · ${name}` : name || '—'}
                    </span>
                  </div>
                  <div className="tx-detail-row">
                    <span className="tx-detail-label">{t('Jenis')}</span>
                    <span className="tx-detail-value">{jenis}</span>
                  </div>
                  <div className="tx-detail-row">
                    <span className="tx-detail-label">{t('Nominal holding')}</span>
                    <span className="tx-detail-value">
                      {meta ? `${idr(meta.total_amount)} IDR` : '—'}
                    </span>
                  </div>
                  <div className="tx-detail-row">
                    <span className="tx-detail-label">{meta ? rateLabel(meta) : 'Est. APR'}</span>
                    <span className="tx-detail-value">{meta ? rateValue(meta) : '—'}</span>
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
          <div className="pagination">
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
          <div className="pagination-info">
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
