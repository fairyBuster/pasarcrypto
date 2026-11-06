import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { initials, quotaPercent, rateLabel, rateValue, volumeText } from '../../lib/format.js';
import { useProductChart, chartGeometry } from '../../lib/useProductChart.js';
import { t } from '../../lib/i18n.js';
// pencarian — ported from the Figma export, typography re-synced to Figma
// the endpoint is paginated and has no search filter, so the pages are walked
const MAX_PAGES = 10;
// the first key also collected every product-card tap, so it is retired; a new
// key starts the list from real submitted searches only
const RECENT_KEY = 'pscryp.recentSearches.v2';
const LEGACY_RECENT_KEY = 'pscryp.recentSearches';
const MAX_RECENT = 8;

// the card mirrors the quota label: full when unlimited, empty when sold out
const quotaText = (product) => {
  if (!product?.stock_enabled) return 'Stok tersedia';
  if (Number(product.stock) <= 0) return 'Stok habis';
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
// endpoint (same hook as the market list); empty data and failures keep the
// static asset
const CARD_W = 360;
const CARD_H = 100;
const CardChart = ({ productId }) => {
  const { points, status } = useProductChart(productId);
  const plot = status === 'ready' ? chartGeometry(points, CARD_W, CARD_H) : null;
  if (!plot) {
    // the placeholder keeps the chart's footprint, so nothing jumps when the
    // series lands; only a product whose chart cannot be drawn shows the static
    // figure
    if (status === 'loading' || status === 'unsupported') {
      return <div className="chart-loading" aria-hidden="true" />;
    }
    return <img src="/assets/img/d1f1eda1cc.svg" alt="Chart" className="chart-img" />;
  }
  const stroke = plot.up ? '#3ecf8e' : '#f2667a';
  return (
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
  );
};
const css = `
/* pencarian — ported from Figma export, typography re-synced */
.scr-pencarian *{
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.scr-pencarian h1,
.scr-pencarian h2,
.scr-pencarian h3,
.scr-pencarian h4,
.scr-pencarian h5,
.scr-pencarian h6,
.scr-pencarian p{
  margin: 0;
}
.scr-pencarian button{
  font-family: 'Inter', sans-serif;
}
.scr-pencarian #section-search{
  padding: 20px 16px 0;
}
.scr-pencarian .search-header{
  display: flex;
  align-items: center;
  gap: 12px;
}
.scr-pencarian .search-bar{
  flex: 1;
  background-color: #1f3048;
  border: 1px solid #3a5272;
  border-radius: 22px;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
}
.scr-pencarian .search-icon{
  width: 16px;
  height: 16px;
}
.scr-pencarian .search-divider{
  width: 2px;
  height: 20px;
  background-color: #c9d4e1;
}
.scr-pencarian .search-input{
  background: transparent;
  border: none;
  color: #75879c;
  font-size: 14px;
  outline: none;
  width: 100%;
  font-family: 'Inter', sans-serif;
}
.scr-pencarian .search-input::placeholder{
  color: #75879c;
}
.scr-pencarian .cancel-btn{
  background: transparent;
  border: none;
  color: #c9d4e1;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}
.scr-pencarian #section-recent-searches{
  padding: 26px 16px 0;
}
.scr-pencarian .recent-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.scr-pencarian .section-title{
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}
.scr-pencarian .clear-btn{
  background: transparent;
  border: none;
  color: #8597ab;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}
.scr-pencarian .recent-chips{
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.scr-pencarian .chip{
  background-color: #1f3048;
  border-radius: 16px;
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 6px;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
.scr-pencarian .chip-icon{
  width: 13px;
  height: 13px;
}
.scr-pencarian .chip-text{
  color: #d3dce7;
  font-size: 12px;
}
.scr-pencarian #section-most-searched{
  padding: 26px 16px 20px;
}
.scr-pencarian #section-most-searched .section-title{
  margin-bottom: 16px;
}
.scr-pencarian .asset-card{
  display: flex;
  flex-direction: column;
}
.scr-pencarian .card-header{
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.scr-pencarian .asset-icon-wrapper{
  width: 40px;
  height: 40px;
  border: 1px dashed rgba(200, 212, 226, 0.45);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.scr-pencarian .asset-icon-wrapper img{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.scr-pencarian .asset-icon-text{
  color: #a9b7c8;
  font-size: 10px;
  font-weight: 600;
}
.scr-pencarian .asset-info{
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.scr-pencarian .asset-name-row{
  display: flex;
  align-items: center;
  gap: 6px;
}
.scr-pencarian .asset-name{
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}
.scr-pencarian .asset-tag{
  background-color: rgba(201, 212, 225, 0.14);
  color: #c9d4e1;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
}
.scr-pencarian .asset-subtitle-row{
  display: flex;
  align-items: center;
  gap: 8px;
}
.scr-pencarian .asset-subtitle{
  color: #8597ab;
  font-size: 12px;
}
.scr-pencarian .subtitle-divider{
  width: 1px;
  height: 10px;
  background-color: #3a5272;
}
.scr-pencarian .asset-apr{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.scr-pencarian .apr-value{
  color: #3ecf8e;
  font-size: 16px;
  font-weight: 700;
}
.scr-pencarian .apr-label{
  color: #8597ab;
  font-size: 10px;
  margin-top: 2px;
}
.scr-pencarian .chart-section{
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}
.scr-pencarian .chart-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.scr-pencarian .chart-title{
  color: #75879c;
  font-size: 10px;
}
.scr-pencarian .chart-change{
  color: #3ecf8e;
  font-size: 10px;
}
.scr-pencarian .chart-img{
  width: 100%;
  height: 48px;
  margin-top: 6px;
  display: block;
}
/* the same footprint while the series loads, with nothing drawn yet */
.scr-pencarian .chart-loading{
  width: 100%;
  height: 48px;
  margin-top: 6px;
  display: block;
}
.scr-pencarian .volume-section{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.scr-pencarian .volume-left{
  display: flex;
  align-items: center;
  gap: 6px;
}
.scr-pencarian .volume-icon{
  width: 13px;
  height: 13px;
}
.scr-pencarian .volume-label{
  color: #8597ab;
  font-size: 10px;
}
.scr-pencarian .volume-value{
  color: #e6ecf3;
  font-size: 10px;
  font-weight: 600;
}
.scr-pencarian .quota-label{
  color: #8597ab;
  font-size: 10px;
}
.scr-pencarian .progress-bar-track{
  background-color: #22344b;
  height: 5px;
  border-radius: 3px;
  width: 100%;
  margin-bottom: 12px;
}
.scr-pencarian .progress-bar-fill{
  background: linear-gradient(90deg, #5a82bf 0%, #c9d4e1 100%);
  height: 100%;
  border-radius: 3px;
}
.scr-pencarian .info-banner{
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.scr-pencarian .info-icon{
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.scr-pencarian .info-text{
  color: #a9b7c8;
  font-size: 11px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.scr-pencarian .info-arrow{
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.scr-pencarian .action-btn{
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  border: none;
  border-radius: 17px;
  height: 34px;
  color: #0c1a2d;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.scr-pencarian #section-results{
  padding: 26px 16px 20px;
}
.scr-pencarian #section-results .section-title{
  margin-bottom: 16px;
}
.scr-pencarian .results-list{
  display: flex;
  flex-direction: column;
  gap: 24px;
}
/* the Figma frame has no loading / error / empty state for the lists */
.scr-pencarian .list-state{
  margin: 0;
  padding: 18px 0;
  text-align: center;
  font-size: 13px;
  line-height: 20px;
  color: #8597ab;
}
.scr-pencarian .list-state.error{
  color: #f5808f;
}
/* figma re-sync */
.scr-pencarian .section-title.section-title { font-size: 15px; }
.scr-pencarian .section-title.section-title { font-weight: 700; }
.scr-pencarian .asset-icon-text.asset-icon-text { font-size: 12px; }
.scr-pencarian .asset-icon-text.asset-icon-text { font-weight: 400; }
.scr-pencarian .asset-icon-text.asset-icon-text { color: #D3DCE7; }
.scr-pencarian .asset-name.asset-name { font-size: 12px; }
.scr-pencarian .asset-name.asset-name { font-weight: 400; }
.scr-pencarian .asset-name.asset-name { color: #D3DCE7; }
.scr-pencarian .asset-subtitle.asset-subtitle { color: #D3DCE7; }
.scr-pencarian .asset-subtitle.asset-subtitle { font-size: 11px; }
.scr-pencarian .apr-value.apr-value { font-weight: 600; }
.scr-pencarian .volume-label.volume-label { font-size: 11px; }
.scr-pencarian .volume-value.volume-value { font-size: 11px; }
.scr-pencarian .quota-label.quota-label { font-size: 11px; }
.scr-pencarian .action-btn.action-btn { font-size: 13px; }
.scr-pencarian .action-btn.action-btn { font-weight: 600; }
/* sold-out products keep a visible but inert, darker button */
.scr-pencarian .action-btn.action-soldout{
    background: #22344b;
    color: #75879c;
    cursor: default;
    opacity: 1;
}
`;

export default function Pencarian() {
  // the catalogue is walked like Pasar, then sorted by APR so the "most
  // searched" picks mirror the market's highest-yield products
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  // the volume placeholder rolls over when the hour changes
  const [hourSlot, setHourSlot] = useState(() => Math.floor(Date.now() / 3600000));
  // the terms outlive a reload; a chip tap or a picked result bumps its slot
  const [recent, setRecent] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      return Array.isArray(raw)
        ? raw.filter((term) => typeof term === 'string').slice(0, MAX_RECENT)
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // drop the entries the old card-tap behaviour saved; the new key only ever
    // holds terms the user actually submitted
    try {
      localStorage.removeItem(LEGACY_RECENT_KEY);
    } catch {
      // storage can be blocked
    }
    const id = window.setInterval(() => setHourSlot(Math.floor(Date.now() / 3600000)), 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
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
        all.sort((a, b) => Number(b.profit_rate) - Number(a.profit_rate));
        setItems(all);
        setStatus('ready');
      } catch {
        if (!alive) return;
        setError('Gagal memuat produk.');
        setStatus('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const remember = (term) => {
    const clean = String(term || '').trim();
    if (!clean) return;
    setRecent((prev) => {
      const next = [clean, ...prev.filter((item) => item !== clean)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };
  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  const q = query.trim().toLowerCase();
  const results = q
    ? items.filter((product) =>
        [product.name, product.golongan, product.specifications]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q)),
      )
    : [];

  // one card per product; the whole card opens the detail, the button buys.
  // tapping a card is not a search, so only a submitted term (or a history
  // chip) goes into "Pencarian terakhir"
  const card = (product) => (
    <div className="asset-card" key={product.id} data-route={`/pasar/detail?id=${product.id}`}>
      <div className="card-header">
        <div className="asset-icon-wrapper">
          <span className="asset-icon-text">{initials(product.name)}</span>
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              onError={(event) => {
                // a missing media file leaves the initials underneath
                event.currentTarget.remove();
              }}
            />
          )}
        </div>
        <div className="asset-info">
          <div className="asset-name-row">
            <span className="asset-name">{product.name}</span>
            <span className="asset-tag">{t('Holding')}</span>
          </div>
          <div className="asset-subtitle-row">
            {product.specifications && <span className="asset-subtitle">{product.specifications}</span>}
            {product.specifications && product.golongan && product.golongan !== '-' && <div className="subtitle-divider"></div>}
            {product.golongan && product.golongan !== '-' && <span className="asset-subtitle">{product.golongan}</span>}
          </div>
        </div>
        <div className="asset-apr">
          <span className="apr-value">{rateValue(product)}</span>
          <span className="apr-label">{rateLabel(product)}</span>
        </div>
      </div>
          
      <div className="chart-section">
        <div className="chart-header">
          <span className="chart-title">{t('Grafik harga · 7 hari')}</span>
        </div>
        <CardChart productId={product.id} />
      </div>
      
      <div className="volume-section">
        <div className="volume-left">
          <img src="/assets/img/effeb653c1.svg" alt="Volume" className="volume-icon" />
          <span className="volume-label">{t('Volume 24J')}</span>
          <span className="volume-value">{volumeText(hourSlot, product.id)}</span>
        </div>
        <span className="quota-label">{quotaText(product)}</span>
      </div>
      
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${quotaFill(product)}%` }}></div>
      </div>
      
      <div className="info-banner">
        <img src="/assets/img/3b30b80b95.png" alt="Info" className="info-icon" />
        <span className="info-text">{product.description}</span>
        <img src="/assets/img/9cf2bc7677.svg" alt="Arrow Right" className="info-arrow" />
      </div>
      
      {soldOut(product) ? (
        <button className="action-btn action-soldout" disabled type="button">{t('Not available')}</button>
      ) : (
        // the button opens the detail first; the buy flow starts there
        <button className="action-btn" data-route={`/pasar/detail?id=${product.id}`}>{t('Mulai Holding')}</button>
      )}
    </div>
  );

  return (
    <div className="scr-pencarian">
      <style>{css}</style>
      <section id="section-search">
        <div className="search-header">
          <form
            className="search-bar"
            onSubmit={(event) => {
              event.preventDefault();
              remember(query);
            }}
          >
            <img src="/assets/img/d106258138.svg" alt="Search" className="search-icon" />
            <div className="search-divider"></div>
            <input
              type="text"
              placeholder={t('Cari koin atau produk')}
              className="search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
          <button className="cancel-btn" data-back="1">{t('Batal')}</button>
        </div>
      </section>
      {q ? (
        <section id="section-results">
          <h2 className="section-title">{t('Hasil pencarian')}</h2>
          {status === 'loading' && <p className="list-state">{t('Memuat produk…')}</p>}
          {status === 'error' && <p className="list-state error">{error}</p>}
          {status === 'ready' && results.length === 0 && (
            <p className="list-state">{t('Tidak ada produk yang cocok.')}</p>
          )}
          {results.length > 0 && (
            <div className="results-list">
              {results.map(card)}
            </div>
          )}
        </section>
      ) : (
        <>
          {recent.length > 0 && (
            <section id="section-recent-searches">
              <div className="recent-header">
                <h2 className="section-title">{t('Pencarian terakhir')}</h2>
                <button className="clear-btn" onClick={clearRecent}>{t('Hapus')}</button>
              </div>
              <div className="recent-chips">
                {recent.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="chip"
                    onClick={(event) => {
                      // the shell would otherwise toggle the chip's active state
                      event.stopPropagation();
                      setQuery(term);
                      remember(term);
                    }}
                  >
                    <img src="/assets/img/e3e4ffdaa5.svg" alt="History" className="chip-icon" />
                    <span className="chip-text">{term}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
          <section id="section-most-searched">
            <h2 className="section-title">{t('Paling dicari')}</h2>
            {status === 'loading' && <p className="list-state">{t('Memuat produk…')}</p>}
            {status === 'error' && <p className="list-state error">{error}</p>}
            {status === 'ready' && items.length === 0 && (
              <p className="list-state">{t('Belum ada produk yang aktif.')}</p>
            )}
            {status === 'ready' && items.length > 0 && (
              <div className="results-list">
                {items.slice(0, 3).map(card)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
