// pasar — ported from the Figma export, typography re-synced to Figma
import { useEffect, useRef, useState } from 'react';
import BottomNav from '../../components/BottomNav.jsx';
import { api } from '../../lib/api.js';
import { mediaUrl } from '../../lib/media.js';
import { friendlyError, useAuth } from '../../lib/auth.jsx';
import { idr, initials, quotaPercent, ratePercent, volumeText } from '../../lib/format.js';
import { useProductChart, chartGeometry } from '../../lib/useProductChart.js';
import { t } from '../../lib/i18n.js';
// the endpoint is paginated and has no ordering, so the pages are walked
const MAX_PAGES = 10;

// the card mirrors the quota label: full when unlimited, empty when sold out
const quotaText = (product) => {
  if (!product?.stock_enabled) return 'Stok tersedia';
  if (Number(product.stock) <= 0) return 'Not available';
  return `Sisa ${quotaPercent(product)}%`;
};
const quotaFill = (product) => {
  if (!product?.stock_enabled) return 100;
  if (Number(product.stock) <= 0) return 0;
  return quotaPercent(product);
};
// a stock-enabled product with zero stock cannot be bought
const soldOut = (product) => !!product?.stock_enabled && Number(product.stock) <= 0;
// the card chart is the product's real 7-day series from the backend chart
// endpoint (same hook as the detail screen) drawn as percent change, so every
// coin keeps its own shape; unknown products, empty data, and failures keep the
// static asset
const CARD_W = 360;
const CARD_H = 100;
const CardChart = ({ productId }) => {
  // every visible card asks for its own series, so a card only calls once it is
  // about to scroll into view instead of firing the whole list on mount
  const slot = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = slot.current;
    if (!node || visible) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  const { points, status } = useProductChart(visible ? productId : null);
  const plot = status === 'ready' ? chartGeometry(points, CARD_W, CARD_H) : null;
  if (!plot) {
    // the slot keeps its height but stays empty while the series is on its way;
    // only a product whose chart cannot be drawn keeps the static figure
    const waiting = status === 'loading' || status === 'unsupported';
    return (
      <div className="chart-slot" ref={slot}>
        {waiting ? null : <img src="/assets/img/111ef1c789.svg" alt="Chart" className="chart-img" />}
      </div>
    );
  }
  const stroke = plot.up ? '#3ecf8e' : '#f2667a';
  return (
    <div className="chart-slot" ref={slot}>
      <svg
        className="chart-img"
        viewBox={`0 0 ${CARD_W} ${CARD_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* the zero line is what makes a pegged coin read as flat */}
        <line
          x1="0"
          y1={plot.center}
          x2={CARD_W}
          y2={plot.center}
          stroke="rgba(201, 212, 225, 0.18)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <polygon points={plot.area} fill={plot.up ? 'rgba(62, 207, 142, 0.12)' : 'rgba(242, 102, 122, 0.12)'} />
        <polyline
          points={plot.line}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={plot.last.x} cy={plot.last.y} r="3.5" fill={stroke} />
      </svg>
    </div>
  );
};
const css = `
/* pasar — ported from Figma export, typography re-synced */
.scr-pasar { background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-pasar *{
    box-sizing: border-box;
}
.scr-pasar section{
    width: 100%;
    position: relative;
}
.scr-pasar h1,
.scr-pasar h2,
.scr-pasar h3,
.scr-pasar p{ 
    margin: 0; 
}
.scr-pasar a{ 
    text-decoration: none; 
}
.scr-pasar button{ 
    border: none; 
    cursor: pointer; 
    font-family: inherit; 
}
.scr-pasar .flex-row{ 
    display: flex; 
    flex-direction: row; 
}
.scr-pasar .flex-col{ 
    display: flex; 
    flex-direction: column; 
}
.scr-pasar .items-center{ 
    align-items: center; 
}
.scr-pasar .justify-between{ 
    justify-content: space-between; 
}
.scr-pasar .justify-center{ 
    justify-content: center; 
}
.scr-pasar .header{
    padding: 20px 16px 0;
}
.scr-pasar .header h1{
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
}
.scr-pasar .search-btn{
    width: 36px;
    height: 36px;
    background-color: #1f3048;
    border-radius: 18px;
}
.scr-pasar .subtitle{
    color: #8597ab;
    font-size: 12px;
    margin-top: 4px;
}
.scr-pasar #section-hero{
    padding: 18px 16px 0;
}
.scr-pasar .hero-content{
    gap: 12px;
}
.scr-pasar .hero-left{
    width: 128px;
    flex-shrink: 0;
}
.scr-pasar .hero-left h2{
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
}
.scr-pasar .hero-left p{
    font-size: 10px;
    color: #a9b7c8;
    margin-top: 6px;
    line-height: 1.4;
}
.scr-pasar .coins-img{
    width: 125px;
    height: 124px;
    margin-top: 10px;
    margin-left: -8px;
}
.scr-pasar .hero-right{
    flex-grow: 1;
}
.scr-pasar .balance-card{
    background: linear-gradient(135deg, #2a4a72 0%, #1a314f 50%, #12233a 100%);
    border-radius: 20px;
    padding: 14px;
    gap: 12px;
}
.scr-pasar .balance-section{
    gap: 4px;
}
.scr-pasar .balance-header span{
    font-size: 12px;
    font-weight: 600;
}
.scr-pasar .balance-desc{
    font-size: 10px;
    color: #a9b7c8;
}
.scr-pasar .balance-amount{
    margin-top: 4px;
    gap: 4px;
}
.scr-pasar .balance-amount .amount{
    font-size: 16px;
    font-weight: 700;
}
.scr-pasar .balance-amount .currency{
    font-size: 12px;
    color: #a9b7c8;
}
.scr-pasar .btn-isi-ulang{
    background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    font-size: 12px;
    font-weight: 600;
    border-radius: 15px;
    height: 30px;
    width: 82px;
    margin-top: 8px;
}
.scr-pasar .btn-tarik{
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid rgba(201, 212, 225, 0.22);
    color: #e6ecf3;
    font-size: 12px;
    font-weight: 600;
    border-radius: 15px;
    height: 30px;
    width: 63px;
    margin-top: 8px;
}
.scr-pasar .divider{
    height: 1px;
    background-color: rgba(201, 212, 225, 0.22);
    margin: 4px 0;
}
.scr-pasar .holding-status{
    margin-top: 24px;
}
.scr-pasar .status-text{
    font-size: 12px;
}
.scr-pasar .history-link{
    font-size: 12px;
    color: #c9d4e1;
    gap: 4px;
}
.scr-pasar #section-filters{
    padding: 28px 16px 0;
}
.scr-pasar .filters-header h2{
    font-size: 16px;
    font-weight: 700;
}
.scr-pasar .filter-chips{
    margin-top: 12px;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
}
.scr-pasar .filter-chips::-webkit-scrollbar{
    display: none;
}
.scr-pasar .chip{
    height: 32px;
    border-radius: 16px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    background-color: #1f3048;
    color: #a9b7c8;
    flex-shrink: 0;
    white-space: nowrap;
}
.scr-pasar .chip.active{
    background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
}
.scr-pasar #section-product-list{
    padding: 16px 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.scr-pasar .product-card{
    border: 1px solid rgba(201, 212, 225, 0.22);
    padding: 16px 0 24px;
    display: flex;
    flex-direction: column;
}
.scr-pasar .card-top,
.scr-pasar .chart-section,
.scr-pasar .volume-section,
.scr-pasar .progress-bar,
.scr-pasar .promo-banner,
.scr-pasar .btn-mulai{
    padding-left: 16px;
    padding-right: 16px;
}
.scr-pasar .progress-bar{
    padding-left: 0;
    padding-right: 0;
    margin: 0 16px;
}
.scr-pasar .btn-mulai{
    width: calc(100% - 32px);
    margin-left: 16px;
}
.scr-pasar .coin-info{
    gap: 10px;
    min-width: 0;
}
.scr-pasar .coin-icon{
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 20px;
    border: 1px solid rgba(200, 212, 226, 0.45);
    position: relative;
    overflow: hidden;
}
.scr-pasar .coin-icon img{
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.scr-pasar .coin-icon span{
    font-size: 11px;
    color: #a9b7c8;
    font-weight: 600;
}
.scr-pasar .coin-details{
    gap: 5px;
    min-width: 0;
}
.scr-pasar .coin-title{
    gap: 6px;
    min-width: 0;
}
.scr-pasar .coin-title h3{
    font-size: 16px;
    font-weight: 700;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.scr-pasar .badge{
    background-color: rgba(201, 212, 225, 0.14);
    color: #c9d4e1;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 8px;
    flex-shrink: 0;
}
.scr-pasar .coin-tags{
    gap: 8px;
    font-size: 10px;
    color: #8597ab;
    min-width: 0;
}
.scr-pasar .tag-spec{
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.scr-pasar .tag-divider{
    height: 10px;
    width: 1px;
    background-color: #3a5272;
    flex-shrink: 0;
}
.scr-pasar .apr-info{
    align-items: flex-end;
}
.scr-pasar .apr-value{
    color: #3ecf8e;
    font-size: 18px;
    font-weight: 700;
}
.scr-pasar .apr-label{
    color: #8597ab;
    font-size: 10px;
}
.scr-pasar .chart-section{
    margin-top: 16px;
    gap: 4px;
}
.scr-pasar .chart-title{
    color: #75879c;
    font-size: 10px;
}
/* the coin price sits on the right of the chart header */
.scr-pasar .chart-price{
    color: #e6ecf3;
    font-size: 10px;
    font-weight: 600;
}
.scr-pasar .chart-change.up{
    color: #3ecf8e;
    font-size: 10px;
}
.scr-pasar .chart-img{
    width: 100%;
    height: 48px;
    object-fit: cover;
}
/* the chart only asks for its series once the slot approaches the viewport */
.scr-pasar .chart-slot{
    display: block;
    width: 100%;
    height: 48px;
}
.scr-pasar .volume-section{
    margin-top: 12px;
}
.scr-pasar .volume-left{
    gap: 6px;
}
.scr-pasar .vol-label{
    color: #8597ab;
    font-size: 10px;
}
.scr-pasar .vol-value{
    color: #e6ecf3;
    font-size: 10px;
    font-weight: 600;
}
.scr-pasar .quota-label{
    color: #8597ab;
    font-size: 10px;
}
.scr-pasar .progress-bar{
    height: 5px;
    background-color: #22344b;
    border-radius: 3px;
    margin-top: 6px;
    overflow: hidden;
}
.scr-pasar .progress-fill{
    height: 100%;
    background: linear-gradient(90deg, #5a82bf 0%, #c9d4e1 100%);
    border-radius: 3px;
}
.scr-pasar .promo-banner{
    margin-top: 12px;
    gap: 8px;
}
.scr-pasar .promo-icon{
    width: 24px;
    height: 24px;
}
.scr-pasar .promo-banner p{
    flex-grow: 1;
    color: #a9b7c8;
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.scr-pasar .promo-arrow{
    width: 14px;
    height: 14px;
}
.scr-pasar .btn-mulai{
    background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    font-size: 14px;
    font-weight: 600;
    border-radius: 17px;
    height: 34px;
    margin-top: 16px;
}
.scr-pasar .center-item{
    position: relative;
}
.scr-pasar .center-icon-wrapper{
    position: absolute;
    top: -26px;
    width: 54px;
    height: 54px;
    border-radius: 27px;
    border: 4px solid #0d1b2e;
    background: linear-gradient(180deg, #52a8ff 0%, #002040 100%);
}
.scr-pasar .center-icon-wrapper img{
    width: 26px;
    height: 26px;
}
.scr-pasar .active-text{
    margin-top: 32px;
    color: #ffffff !important;
    font-weight: 600;
}
/* figma re-sync */
.scr-pasar .amount.amount { font-size: 14px; }
.scr-pasar .amount.amount { font-weight: 600; }
.scr-pasar .currency.currency { font-size: 9px; }
.scr-pasar .chip.chip { font-weight: 600; }
.scr-pasar .chip.active.chip { color: #0C1A2D; }
.scr-pasar .apr-value.apr-value { font-size: 16px; }
.scr-pasar .apr-value.apr-value { font-weight: 600; }
.scr-pasar .vol-label.vol-label { font-size: 11px; }
.scr-pasar .vol-value.vol-value { font-size: 11px; }
.scr-pasar .quota-label.quota-label { font-size: 11px; }
.scr-pasar .btn-mulai.btn-mulai { font-size: 13px; }
/* the Figma frame has no loading / error state for the list */
.scr-pasar .list-state{
    margin: 0;
    padding: 18px 0;
    text-align: center;
    font-size: 13px;
    line-height: 20px;
    color: #8597ab;
}
.scr-pasar .list-state.error{
    color: #f5808f;
}
/* the eye hides both figures — one privacy switch for the card, like the home
   balance; the frame's glyph is 15px, the button only widens the tap area */
.scr-pasar .eye-btn{
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
}
.scr-pasar .eye-btn::before{
    content: '';
    position: absolute;
    inset: -12px;
}
.scr-pasar .eye-btn:active{
    opacity: 0.7;
}
/* the same glyph, slashed, while the figures are hidden */
.scr-pasar .eye-btn.is-hidden::after{
    content: '';
    position: absolute;
    left: -1px;
    right: -1px;
    top: 50%;
    height: 1.4px;
    margin-top: -0.7px;
    border-radius: 1px;
    background: #a9b7c8;
    transform: rotate(-45deg);
}
/* hidden figures keep their footprint, so nothing reflows when they return */
.scr-pasar .balance-card.is-hidden .amount{
    filter: blur(7px);
    user-select: none;
}
.scr-pasar .amount{
    transition: filter 0.16s ease;
}
/* sold-out products keep a visible but inert, darker button */
.scr-pasar .btn-mulai.btn-soldout{
    background: #22344b;
    color: #75879c;
    cursor: default;
    opacity: 1;
}
`;

export default function Pasar() {
  const { user } = useAuth();
  const [account, setAccount] = useState(user);
  const [items, setItems] = useState([]);
  const [held, setHeld] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  // null means the first category until the user picks another; there is no
  // "Semua" chip anymore, the list always shows one golongan at a time
  const [category, setCategory] = useState(null);
  // the eye hides both figures; it is a privacy preference, so it outlives a reload
  const [balanceHidden, setBalanceHidden] = useState(
    () => localStorage.getItem('pscryp.hideBalance') === '1',
  );
  const toggleBalance = () =>
    setBalanceHidden((prev) => {
      // only a hidden balance is worth remembering
      if (prev) localStorage.removeItem('pscryp.hideBalance');
      else localStorage.setItem('pscryp.hideBalance', '1');
      return !prev;
    });
  // the volume placeholder rolls over when the hour changes
  const [hourSlot, setHourSlot] = useState(() => Math.floor(Date.now() / 3600000));

  useEffect(() => {
    const id = window.setInterval(() => setHourSlot(Math.floor(Date.now() / 3600000)), 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;

    // every page is read, because the chips are built from the whole catalogue
    (async () => {
      try {
        const all = [];
        for (let page = 1; page <= MAX_PAGES; page += 1) {
          const res = await api.products({ page });
          if (!alive) return;
          if (!res.ok) {
            setError(friendlyError(res.data, 'Gagal memuat produk.'));
            setStatus('error');
            return;
          }
          const rows = Array.isArray(res.data?.results) ? res.data.results : [];
          all.push(...rows);
          if (!res.data?.next || rows.length === 0) break;
        }
        // the cheapest product lands at the top
        all.sort((a, b) => Number(a.price) - Number(b.price));
        setItems(all);
        setStatus('ready');
      } catch {
        if (!alive) return;
        setError('Gagal memuat produk.');
        setStatus('error');
      }
    })();

    // balances move as soon as something is bought, so read them fresh
    api
      .me()
      .then((res) => {
        if (alive && res.ok) setAccount(res.data);
      })
      .catch(() => {});

    // the banner totals the holdings that are still running
    api
      .investments()
      .then((res) => {
        if (!alive || !res.ok) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        const active = rows.filter((row) => row.status === 'ACTIVE');
        setHeld(active.reduce((sum, row) => sum + (Number(row.total_amount) || 0), 0));
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  // the chip row has a fixed design order: steady left, flash middle, special
  // right; categories the catalogue adds beyond those trail the trio
  const CATEGORY_ORDER = ['steady returns', 'flash earn', 'special earn'];
  const categoryRank = (name) => CATEGORY_ORDER.indexOf(name.trim().toLowerCase());
  const categories = [
    ...new Set(
      items
        .map((product) => (product.golongan || '').trim())
        .filter((name) => name && name !== '-')
    ),
  ].sort((a, b) => {
    const ra = categoryRank(a);
    const rb = categoryRank(b);
    if (ra === -1 && rb === -1) return 0;
    if (ra === -1) return 1;
    if (rb === -1) return -1;
    return ra - rb;
  });
  const selected = category ?? categories[0] ?? '';
  const visible = selected
    ? items.filter((product) => (product.golongan || '').trim() === selected)
    : items;

  return (
    <div className="scr-pasar">
      <style>{css}</style>
      <section id="section-header">
          <header className="header">
              <div className="header-top flex-row justify-between items-center">
                  <h1>{t('Pasar')}</h1>
                  <div className="search-btn flex-row justify-center items-center" data-route="/pasar/cari">
                      <img src="/assets/img/73cede68f7.svg" alt="Search" />
                  </div>
              </div>
              <p className="subtitle">{t('Coin Analysis · pilih produk dan pantau pasarnya!')}</p>
          </header>
      </section>
      <section id="section-hero">
          <div className="hero-content flex-row">
              <div className="hero-left flex-col">
                  <h2>{t('Saatnya')}<br />{t('kembangkan')}<br />{t('asetmu')}</h2>
                  <p>{t('Temukan pilihan coin yang sesuai dan pantau perkembangan asetmu dalam satu platform.')}</p>
                  <img src="/assets/img/1024158bf1.png" alt="Coins" className="coins-img" />
              </div>
              <div className="hero-right">
                  <div className={`balance-card flex-col${balanceHidden ? ' is-hidden' : ''}`}>
                      <div className="balance-section flex-col">
                          <div className="balance-header flex-row justify-between items-center">
                              <span>{t('Saldo Isi Ulang')}</span>
                              <button
                                  type="button"
                                  className={`eye-btn${balanceHidden ? ' is-hidden' : ''}`}
                                  aria-label={balanceHidden ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
                                  aria-pressed={balanceHidden}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleBalance();
                                  }}
                              >
                                  <img src="/assets/img/6eae8c6a13.svg" alt="" />
                              </button>
                          </div>
                          <p className="balance-desc">{t('Dipakai untuk mulai coin.')}</p>
                          <div className="balance-amount flex-row items-center">
                              <span className="amount">{idr(account?.balance_deposit)}</span>
                              <span className="currency">{t('IDR')}</span>
                          </div>
                          <button className="btn-isi-ulang" data-route="/send">{t('Isi Ulang')}</button>
                      </div>
                      <div className="divider"></div>
                      <div className="balance-section flex-col">
                          <div className="balance-header flex-row justify-between items-center">
                              <span>{t('Saldo Tersedia')}</span>
                              <button
                                  type="button"
                                  className={`eye-btn${balanceHidden ? ' is-hidden' : ''}`}
                                  aria-label={balanceHidden ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
                                  aria-pressed={balanceHidden}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleBalance();
                                  }}
                              >
                                  <img src="/assets/img/6eae8c6a13.svg" alt="" />
                              </button>
                          </div>
                          <p className="balance-desc">{t('Bisa ditarik ke rekeningmu.')}</p>
                          <div className="balance-amount flex-row items-center">
                              <span className="amount">{idr(account?.balance)}</span>
                              <span className="currency">{t('IDR')}</span>
                          </div>
                          <button className="btn-tarik" data-route="/draw">{t('Tarik')}</button>
                      </div>
                  </div>
              </div>
          </div>
          <div className="holding-status flex-row justify-between items-center">
              <span className="status-text">{t('Sedang berlangsung')} <strong>{idr(held)} IDR</strong></span>
              <a href="#" className="history-link flex-row items-center" data-route="/coin">{t('Riwayat Coin')} <img src="/assets/img/ca4e0764f0.svg" alt="Arrow" /></a>
          </div>
      </section>
      <section id="section-filters">
          <div className="filters-header flex-row justify-between items-center">
              <h2>{t('Semua Produk')}</h2>
          </div>
          <div className="filter-chips flex-row">
              {categories.map((name) => (
                  <button
                      type="button"
                      key={name}
                      className={`chip${selected === name ? ' active' : ''}`}
                      aria-pressed={selected === name}
                      onClick={(event) => {
                        event.stopPropagation();
                        setCategory(name);
                      }}
                  >
                      {name}
                  </button>
              ))}
          </div>
      </section>
      <section id="section-product-list">
          
          {status === 'loading' && <p className="list-state">{t('Memuat produk…')}</p>}
          {status === 'error' && <p className="list-state error">{error}</p>}
          {status === 'ready' && items.length === 0 && (
              <p className="list-state">{t('Belum ada produk yang aktif.')}</p>
          )}
          {status === 'ready' && items.length > 0 && visible.length === 0 && (
              <p className="list-state">{t('Belum ada produk di kategori ini.')}</p>
          )}
          {visible.map((product) => (
          // a sold-out card keeps the "Not available" button inert and opens nothing
          <div className="product-card" key={product.id} data-route={soldOut(product) ? undefined : `/pasar/detail?id=${product.id}`}>
              <div className="card-top flex-row justify-between items-center">
                  <div className="coin-info flex-row items-center">
                      <div className="coin-icon flex-row justify-center items-center">
                          <span>{initials(product.name)}</span>
                          {product.image && (
                              <img
                                  src={mediaUrl(product.image)}
                                  alt={product.name}
                                  onError={(event) => {
                                    // a missing media file leaves the initials underneath
                                    event.currentTarget.remove();
                                  }}
                              />
                          )}
                      </div>
                      <div className="coin-details flex-col">
                          <div className="coin-title flex-row items-center">
                              <h3>{product.name}</h3>
                              <span className="badge">{t('Stake')}</span>
                          </div>
                          <div className="coin-tags flex-row items-center">
                              {product.specifications && <span className="tag-spec">{product.specifications}</span>}
                              {product.golongan && product.golongan !== '-' && (
                                  <>
                                      {product.specifications && <div className="tag-divider"></div>}
                                      <span>{product.golongan}</span>
                                  </>
                              )}
                          </div>
                      </div>
                  </div>
                  <div className="apr-info flex-col">
                      {/* the APR quote reads as a percent, like the home card */}
                      <span className="apr-value">{ratePercent(product)}</span>
                      {/* the value is always a percent, so the label is fixed */}
                      <span className="apr-label">{t('Est. APR')}</span>
                  </div>
              </div>
              <div className="chart-section flex-col">
                  <div className="chart-header flex-row justify-between items-center">
                      <span className="chart-title">{t('Grafik harga · 7 hari')}</span>
                      {/* the price quote stacks value over label, right-aligned */}
                      <div className="apr-info flex-col">
                          <span className="apr-value">{idr(product.price)} IDR</span>
                          <span className="apr-label">{t('Mulai dari')}</span>
                      </div>
                  </div>
                  <CardChart productId={product.id} />
              </div>
              <div className="volume-section flex-row justify-between items-center">
                  <div className="volume-left flex-row items-center">
                      <img src="/assets/img/88d5164c5f.svg" alt="Volume" />
                      <span className="vol-label">{t('Volume 24J')}</span>
                      <span className="vol-value">{volumeText(hourSlot, product.id)}</span>
                  </div>
                  <span className="quota-label">{quotaText(product)}</span>
              </div>
              <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${quotaFill(product)}%` }}></div>
              </div>
              <div className="promo-banner flex-row items-center">
                  <img src="/assets/img/3b30b80b95.png" alt="Promo" className="promo-icon" />
                  <p>{product.description}</p>
                  <img src="/assets/img/9cf2bc7677.svg" alt="Arrow" className="promo-arrow" />
              </div>
              {soldOut(product) ? (
                  <button className="btn-mulai btn-soldout" disabled type="button">{t('Not available')}</button>
              ) : (
                  // the button opens the detail first; the buy flow starts there
                  <button className="btn-mulai" data-route={`/pasar/detail?id=${product.id}`}>{t('Start')}</button>
              )}
          </div>
          ))}
      </section>
      
      <BottomNav />
    </div>
  );
}
