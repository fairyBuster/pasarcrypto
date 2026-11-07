// pasar-detail — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { friendlyError, useAuth } from '../../lib/auth.jsx';
import { dateID, idr, initials, orderDailyProfit, quotaPercent, ratePercent, volumeText } from '../../lib/format.js';
import { useProductChart, chartGeometry } from '../../lib/useProductChart.js';
import { t } from '../../lib/i18n.js';

// the chart draws the product's real price series from the backend chart
// endpoint; while it is missing or unavailable the static asset is shown
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
// the period chips (7H / 30H / 60H) were removed; the chart is fixed on one week
const CHART_DAYS = 7;
const dayLabel = (date) => `${date.getDate()} ${MONTHS[date.getMonth()]}`;
const daysAgo = (days) => new Date(Date.now() - days * 86400000);
// the drawn canvas size; the svg stretches to the container afterwards
const CHART_W = 360;
const CHART_H = 100;

// the orderbook is a mock: ten random rows, drawn twice so the upward scroll
// loops without a seam; quantities are small "receh" figures — skewed low,
// mostly under ~25 and occasionally up to 600, never thousands
const OB_ROWS = 10;
const OB_PREFIX = ['Us', 'Ra', 'Ke', 'An', 'Jo', 'Fa', 'Di', 'Ma', 'Ri', 'Nu'];
const OB_SUFFIX = ['01', 'na', 'ya', 'ri', 'ko', 'zz', '89', 'ns', 'ta', 'ra'];
const makeOrderRow = (index) => ({
  id: index,
  user: `${OB_PREFIX[index % OB_PREFIX.length]}****${OB_SUFFIX[(index + 3) % OB_SUFFIX.length]}`,
  amount: Math.round(Math.pow(600, Math.random()) * 100) / 100,
  width: 10 + Math.floor(Math.random() * 90),
});
const css = `
/* pasar-detail — ported from Figma export, typography re-synced */
.scr-pasar-detail .app-container{
    width: 100%;
    min-height: 100cqh;
    background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%), radial-gradient(50% 50% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%);
    color: #ffffff;
    position: relative;
    overflow-x: hidden;
    box-sizing: border-box;
}
.scr-pasar-detail *{
    box-sizing: border-box;
}
.scr-pasar-detail .text-green{ color: #3ecf8e; }
.scr-pasar-detail .text-red{ color: #f5808f; }
.scr-pasar-detail .text-gray{ color: #8597ab; }
.scr-pasar-detail .text-light-gray{ color: #a9b7c8; }
.scr-pasar-detail .text-dark-gray{ color: #75879c; }
.scr-pasar-detail .text-white{ color: #ffffff; }
.scr-pasar-detail .text-muted{ color: #c3cedb; }
.scr-pasar-detail .font-bold{ font-weight: 700; }
.scr-pasar-detail .font-semibold{ font-weight: 600; }
.scr-pasar-detail .font-medium{ font-weight: 500; }
.scr-pasar-detail .flex{ display: flex; }
.scr-pasar-detail .flex-col{ display: flex; flex-direction: column; }
.scr-pasar-detail .items-center{ align-items: center; }
.scr-pasar-detail .justify-between{ justify-content: space-between; }
.scr-pasar-detail .justify-center{ justify-content: center; }
.scr-pasar-detail #section-header .header-container{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 16px 0;
    }
.scr-pasar-detail #section-header .back-btn{
        width: 40px;
        height: 40px;
        background-color: #1f3048;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
.scr-pasar-detail #section-header .title-area{
        display: flex;
        flex-direction: column;
        align-items: center;
    }
.scr-pasar-detail #section-header .title{
        font-size: 16px;
        margin: 0;
        line-height: 1.2;
    }
.scr-pasar-detail #section-header .subtitle{
        font-size: 11px;
        margin: 4px 0 0;
    }
.scr-pasar-detail #section-header .placeholder{
        width: 40px;
        height: 40px;
    }
.scr-pasar-detail #section-asset-info .asset-info-container{
        display: flex;
        align-items: center;
        padding: 22px 16px 0;
        gap: 12px;
    }
.scr-pasar-detail #section-asset-info .logo-circle{
        width: 48px;
        height: 48px;
        border: 1px dashed rgba(200, 212, 226, 0.45);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        position: relative;
        overflow: hidden;
    }
.scr-pasar-detail #section-asset-info .logo-circle img{
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
.scr-pasar-detail #section-asset-info .name-area{
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
.scr-pasar-detail #section-asset-info .coin-name{
        font-size: 18px;
        margin-right: 8px;
    }
.scr-pasar-detail #section-asset-info .badge{
        background-color: rgba(201, 212, 225, 0.14);
        padding: 2px 8px;
        border-radius: 8px;
        font-size: 10px;
    }
.scr-pasar-detail #section-asset-info .tags-row{
        font-size: 11px;
        gap: 8px;
    }
.scr-pasar-detail #section-asset-info .divider{
        width: 1px;
        height: 10px;
        background-color: #3a5272;
    }
.scr-pasar-detail #section-asset-info .apr-area{
        align-items: flex-end;
    }
.scr-pasar-detail #section-asset-info .apr-value{
        font-size: 20px;
        line-height: 1.2;
    }
.scr-pasar-detail #section-asset-info .apr-label{
        font-size: 10px;
        margin-top: 2px;
    }
.scr-pasar-detail #section-chart .chart-container{
        padding: 26px 16px 0;
    }
.scr-pasar-detail #section-chart .chart-title{
        font-size: 14px;
    }
.scr-pasar-detail #section-chart .chart-subtitle{
        font-size: 11px;
        margin-top: 12px;
    }
.scr-pasar-detail #section-chart .chart-graphic{
        position: relative;
        height: 132px;
        margin-top: 16px;
    }
.scr-pasar-detail #section-chart .svg-container{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100px;
    }
.scr-pasar-detail #section-chart .x-axis{
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        font-size: 10px;
    }
.scr-pasar-detail #section-details .details-grid{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px 8px;
        padding: 24px 16px 0;
    }
.scr-pasar-detail #section-details .detail-label{
        font-size: 11px;
        margin-bottom: 4px;
    }
.scr-pasar-detail #section-details .detail-value{
        font-size: 13px;
    }
.scr-pasar-detail #section-progress .progress-container{
        padding: 16px 16px 0;
        gap: 6px;
    }
.scr-pasar-detail #section-progress .progress-labels{
        font-size: 10px;
    }
.scr-pasar-detail #section-progress .progress-track{
        width: 100%;
        height: 5px;
        background-color: #22344b;
        border-radius: 3px;
        overflow: hidden;
    }
.scr-pasar-detail #section-progress .progress-fill{
        height: 100%;
        width: 72%;
        background: linear-gradient(90deg, #5a82bf 0%, #c9d4e1 100%);
        border-radius: 3px;
    }
.scr-pasar-detail #section-ai .ai-container{
        padding: 26px 16px 0;
        gap: 12px;
    }
.scr-pasar-detail #section-ai .ai-title{
        font-size: 14px;
        margin: 0;
    }
.scr-pasar-detail #section-ai .ai-content{
        align-items: flex-start;
        gap: 10px;
    }
.scr-pasar-detail #section-ai .ai-icon{
        width: 24px;
        height: 24px;
        flex-shrink: 0;
    }
.scr-pasar-detail #section-ai .ai-text{
        font-size: 11px;
        line-height: 1.5;
        margin: 0;
    }
.scr-pasar-detail #section-input .input-section-container{
        padding: 26px 16px 0;
        border-top: 1px solid #22344b;
        margin-top: 24px;
    }
.scr-pasar-detail #section-input .input-header{
        font-size: 11px;
        margin-bottom: 12px;
    }
.scr-pasar-detail #section-input .input-box{
        background-color: #1f3048;
        border: 1px solid #3a5272;
        border-radius: 24px;
        height: 48px;
        padding: 0 16px;
        gap: 12px;
    }
.scr-pasar-detail #section-input .currency{
        font-size: 13px;
    }
.scr-pasar-detail #section-input .divider{
        width: 2px;
        height: 22px;
        background-color: #c9d4e1;
    }
.scr-pasar-detail #section-input .input-field{
        background: transparent;
        border: none;
        color: #ffffff;
        font-size: 13px;
        flex-grow: 1;
        outline: none;
        font-family: 'Inter', sans-serif;
    }
.scr-pasar-detail #section-input .input-field::placeholder{
        color: #75879c;
    }
.scr-pasar-detail #section-input .input-limits{
        font-size: 10px;
        margin-top: 8px;
    }
.scr-pasar-detail #section-input .estimations{
        margin-top: 16px;
        gap: 10px;
    }
.scr-pasar-detail #section-input .est-row{
        font-size: 11px;
    }
.scr-pasar-detail #section-action .action-container{
        padding: 24px 16px 0;
    }
.scr-pasar-detail #section-action .btn-primary{
        width: 100%;
        height: 44px;
        border-radius: 22px;
        background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
        color: #0c1a2d;
        border: none;
        font-size: 14px;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
    }
.scr-pasar-detail #section-notes .notes-container{
        padding: 24px 16px 0;
        gap: 8px;
    }
.scr-pasar-detail #section-notes .notes-title{
        font-size: 13px;
        margin: 0;
    }
.scr-pasar-detail #section-notes .notes-list{
        list-style: none;
        padding: 0;
        margin: 0;
        gap: 10px;
    }
.scr-pasar-detail #section-notes .notes-list li{
        align-items: flex-start;
        gap: 8px;
    }
.scr-pasar-detail #section-notes .bullet{
        width: 6px;
        height: 6px;
        background-color: #51657e;
        border-radius: 50%;
        margin-top: 5px;
        flex-shrink: 0;
    }
.scr-pasar-detail #section-notes .notes-list p{
        font-size: 11px;
        margin: 0;
        line-height: 1.4;
    }
.scr-pasar-detail #section-orderbook .orderbook-container{
        padding: 26px 16px 0;
        gap: 16px;
    }
.scr-pasar-detail #section-orderbook .ob-title{
        font-size: 14px;
        margin: 0;
    }
.scr-pasar-detail #section-orderbook .ob-pair{
        font-size: 10px;
    }
.scr-pasar-detail #section-orderbook .ob-table{
        gap: 8px;
    }
.scr-pasar-detail #section-orderbook .ob-thead{
        font-size: 10px;
        padding: 0 8px;
    }
.scr-pasar-detail #section-orderbook .ob-tbody{
        gap: 0;
        animation: ob-flow 22s linear infinite;
    }
.scr-pasar-detail #section-orderbook .ob-viewport{
        height: 222px;
        overflow: hidden;
    }
@keyframes ob-flow{
        from { transform: translateY(0); }
        to { transform: translateY(-50%); }
    }
@media (prefers-reduced-motion: reduce){
        .scr-pasar-detail #section-orderbook .ob-tbody{ animation: none; }
    }
.scr-pasar-detail #section-orderbook .ob-row{
        position: relative;
        display: flex;
        align-items: center;
        height: 26px;
        padding: 0 8px;
        font-size: 11px;
        margin-bottom: 2px;
    }
.scr-pasar-detail #section-orderbook .ob-bg{
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        background: linear-gradient(270deg, rgba(62, 207, 142, 0.13) 0%, rgba(62, 207, 142, 0) 100%);
        border-radius: 4px;
        z-index: 0;
    }
.scr-pasar-detail #section-orderbook .col-user,
.scr-pasar-detail #section-orderbook .col-amount,
.scr-pasar-detail #section-orderbook .col-total{
        position: relative;
        z-index: 1;
        flex: 1;
    }
.scr-pasar-detail #section-orderbook .col-user{ text-align: left; }
.scr-pasar-detail #section-orderbook .col-amount{ text-align: center; }
.scr-pasar-detail #section-orderbook .col-total{ text-align: right; }
.scr-pasar-detail #section-footer .footer-container{
        margin-top: 24px;
        padding: 16px;
        border-top: 1px solid rgba(201, 212, 225, 0.16);
    }
.scr-pasar-detail #section-footer .footer-price{
        font-size: 14px;
    }
.scr-pasar-detail #section-footer .footer-note{
        font-size: 10px;
    }
.scr-pasar-detail { min-height: 100cqh; width: 100%; background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%), radial-gradient(50% 50% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%); color: #ffffff; }
.scr-pasar-detail section > .app-container { min-height: 0; background: none; }
/* figma re-sync */
.scr-pasar-detail .title.title { font-size: 17px; }
.scr-pasar-detail .title.title { line-height: 24px; }
.scr-pasar-detail .logo-circle.logo-circle { font-size: 10px; }
.scr-pasar-detail .coin-name.coin-name { font-size: 10px; }
.scr-pasar-detail .apr-value.apr-value { font-size: 24px; }
.scr-pasar-detail .apr-value.apr-value { line-height: 30px; }
.scr-pasar-detail .apr-label.apr-label { font-size: 11px; }
.scr-pasar-detail .chart-title.chart-title { font-size: 15px; }
.scr-pasar-detail .detail-value.detail-value { font-size: 12px; }
.scr-pasar-detail .ai-title.ai-title { font-size: 15px; }
.scr-pasar-detail .ai-text.ai-text { font-size: 12px; }
.scr-pasar-detail .ai-text.ai-text { line-height: 18px; }
.scr-pasar-detail .currency.currency { font-size: 14px; }
.scr-pasar-detail .input-limits.input-limits { font-size: 11px; }
.scr-pasar-detail .font-medium.font-medium { font-weight: 600; }
.scr-pasar-detail .notes-title.notes-title { font-size: 12px; }
.scr-pasar-detail .ob-title.ob-title { font-size: 15px; }
.scr-pasar-detail .ob-pair.ob-pair { font-size: 11px; }
.scr-pasar-detail .footer-price.footer-price { font-size: 16px; }
.scr-pasar-detail .footer-note.footer-note { font-size: 11px; }
/* vertical rhythm */
.scr-pasar-detail #section-chart .chart-graphic { height: 117px; }
.scr-pasar-detail #section-details .details-grid { padding-top: 21px; }
.scr-pasar-detail #section-progress .progress-container { padding-top: 14px; }
.scr-pasar-detail #section-input .input-section-container { margin-top: 45px; }
.scr-pasar-detail #section-notes .notes-container { padding-top: 6px; }
.scr-pasar-detail #section-orderbook .orderbook-container { padding-top: 35px; }
.scr-pasar-detail #section-footer .footer-container { margin-top: 0; }
.scr-pasar-detail #section-footer .footer-container { padding-bottom: 47px; }
/* the real series renders as an svg; loading and failures keep their place */
.scr-pasar-detail .chart-state{
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #75879c;
}
.scr-pasar-detail .chart-state.chart-loading{
    background: linear-gradient(90deg, rgba(201,212,225,0.06) 25%, rgba(201,212,225,0.16) 50%, rgba(201,212,225,0.06) 75%);
    background-size: 200% 100%;
    animation: pd-shimmer 1.4s ease-in-out infinite;
    border-radius: 8px;
}
@keyframes pd-shimmer{
    from { background-position: 200% 0; }
    to { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce){
    .scr-pasar-detail .chart-state.chart-loading{ animation: none; }
}
/* the Figma frame has no loading / error / disabled state */
.scr-pasar-detail .detail-state{
    margin: 0;
    padding: 40px 24px;
    text-align: center;
    font-size: 13px;
    line-height: 20px;
    color: #8597ab;
}
.scr-pasar-detail .detail-state a{
    display: inline-block;
    margin-top: 10px;
    color: #a9c2e6;
    text-decoration: underline;
}
.scr-pasar-detail .btn-primary:disabled{
    opacity: 0.5;
}
`;

export default function PasarDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('id');
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [account, setAccount] = useState(user);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  // the period chips were removed; the chart window is fixed at one week
  const period = CHART_DAYS;
  // the real daily series for the fixed window; product is null until loaded
  const { points, status: chartStatus } = useProductChart(product?.id, period);
  // the volume placeholder rolls over when the hour changes
  const [hourSlot, setHourSlot] = useState(() => Math.floor(Date.now() / 3600000));
  const [orderRows] = useState(() => Array.from({ length: OB_ROWS }, (_, index) => makeOrderRow(index)));

  useEffect(() => {
    if (!id) {
      navigate('/pasar', { replace: true });
      return undefined;
    }
    let alive = true;
    api
      .product(id)
      .then((res) => {
        if (!alive) return;
        if (!res.ok) {
          setError(friendlyError(res.data, 'Gagal memuat produk.'));
          setStatus('error');
          return;
        }
        setProduct(res.data);
        setStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        setError('Gagal memuat produk.');
        setStatus('error');
      });
    api
      .me()
      .then((res) => {
        if (alive && res.ok) setAccount(res.data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id, navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => setHourSlot(Math.floor(Date.now() / 3600000)), 30000);
    return () => window.clearInterval(timer);
  }, []);

  if (status !== 'ready') {
    return (
      <div className="scr-pasar-detail">
        <style>{css}</style>
        <section id="section-header">
          <div className="app-container">
            <header className="header-container">
              <div className="back-btn" data-back="1">
                <img src="/assets/img/766dc7b439.svg" alt="Back" />
              </div>
              <div className="title-area">
                <h1 className="title font-semibold">{t('Detail Holding')}</h1>
              </div>
              <div className="placeholder"></div>
            </header>
          </div>
        </section>
        <p className="detail-state">{status === 'error' ? error : 'Memuat produk…'}</p>
      </div>
    );
  }

  // a sold-out product has no detail to show; a saved or shared link must not
  // bypass the disabled card that leads here
  if (product && product.stock_enabled && Number(product.stock) <= 0) {
    return (
      <div className="scr-pasar-detail">
        <style>{css}</style>
        <section id="section-header">
          <div className="app-container">
            <header className="header-container">
              <div className="back-btn" data-back="1">
                <img src="/assets/img/766dc7b439.svg" alt="Back" />
              </div>
              <div className="title-area">
                <h1 className="title font-semibold">{t('Produk Tidak Tersedia')}</h1>
              </div>
              <div className="placeholder"></div>
            </header>
          </div>
        </section>
        <p className="detail-state">
          {t('Produk ini sudah habis atau tidak tersedia.')}
          <br />
          <a href="#/pasar" data-route="/pasar">{t('Kembali ke Pasar')}</a>
        </p>
      </div>
    );
  }

  const price = Number(product.price) || 0;
  const wallet =
    product.balance_source === 'balance_deposit' ? Number(account?.balance_deposit) : Number(account?.balance);
  const walletLabel = product.balance_source === 'balance_deposit' ? 'Isi Ulang' : 'Tersedia';
  // the field holds the product price, so an order is always one unit
  const quantity = price > 0 ? 1 : 0;
  const perDay = orderDailyProfit(product, quantity);
  const startDate = dateID(new Date(Date.now() + 86400000));
  const canBuy = quantity > 0;
  // the quota shares the real stock math with the market list: 5000 stock = 100%
  const remaining = quotaPercent(product);
  const filled = 100 - remaining;

  // the price series folded into svg percent-change coordinates; null while
  // loading or unknown, and a flat stablecoin draws flat
  const plot = chartStatus === 'ready' ? chartGeometry(points, CHART_W, CHART_H) : null;
  // first vs last real price drives the trend line above the chart
  const change = (() => {
    if (!points || points.length < 2) return null;
    const first = points[0].v;
    const last = points[points.length - 1].v;
    if (first <= 0) return null;
    const percent = Math.abs((last - first) / first) * 100;
    return { up: last >= first, percent };
  })();
  // the x axis quotes the series' own first/middle/last timestamps when ready
  const axis =
    plot && points.length >= 2
      ? [
          new Date(points[0].t),
          new Date(points[Math.floor(points.length / 2)].t),
          new Date(points[points.length - 1].t),
        ]
      : [daysAgo(period), daysAgo(Math.round(period / 2)), new Date()];

  return (
    <div className="scr-pasar-detail">
      <style>{css}</style>
      <section id="section-header">
          <div className="app-container">
              <header className="header-container">
                  <div className="back-btn" data-back="1">
                      <img src="/assets/img/766dc7b439.svg" alt="Back" />
                  </div>
                  <div className="title-area">
                      <h1 className="title font-semibold">{t('Detail Holding')}</h1>
                      <p className="subtitle text-gray">
                          {product.name}
                          {product.specifications ? ` · ${product.specifications}` : ''}
                      </p>
                  </div>
                  <div className="placeholder"></div>
              </header>
          </div>
      </section>
      <section id="section-asset-info">
          <div className="app-container">
              <div className="asset-info-container">
                  <div className="logo-area">
                      <div className="logo-circle text-light-gray font-medium">
                          {initials(product.name)}
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
                  </div>
                  <div className="name-area">
                      <div className="name-row flex items-center">
                          <span className="coin-name font-bold text-white">{product.name}</span>
                      </div>
                      <div className="tags-row flex items-center text-gray">
                          {product.specifications && <span className="tag">{product.specifications}</span>}
                          {product.golongan && product.golongan !== '-' && (
                              <>
                                  {product.specifications && <span className="divider"></span>}
                                  <span className="tag">{product.golongan}</span>
                              </>
                          )}
                      </div>
                  </div>
                  <div className="apr-area flex-col">
                      <div className="apr-value text-green font-bold">{ratePercent(product)}</div>
                      <div className="apr-label text-gray">{t('Est. APR')}</div>
                  </div>
              </div>
          </div>
      </section>
      <section id="section-chart">
          <div className="app-container">
              <div className="chart-container">
                  <div className="chart-header flex justify-between items-center">
                      <div className="chart-title font-semibold text-white">{t('Grafik APR')}</div>
                  </div>
                  <div className={`chart-subtitle ${change ? (change.up ? 'text-green' : 'text-red') : 'text-gray'}`}>
                      {change ? (
                          <>
                              {change.up ? 'Naik' : 'Turun'} {change.up ? '▲' : '▼'}{' '}
                              {change.percent.toFixed(2).replace('.', ',')}%{' '}
                              <span className="text-gray">dalam {period} hari terakhir</span>
                          </>
                      ) : (
                          <span>Grafik harga {period} hari terakhir</span>
                      )}
                  </div>
                  <div className="chart-graphic">
                      <div className="svg-container">
                          {plot ? (
                              <svg
                                  viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                                  preserveAspectRatio="none"
                                  style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
                              >
                                  <polygon points={plot.area} fill={plot.up ? 'rgba(62, 207, 142, 0.12)' : 'rgba(242, 102, 122, 0.12)'} />
                                  <line
                                      x1="0"
                                      y1={plot.center}
                                      x2={CHART_W}
                                      y2={plot.center}
                                      stroke="rgba(201, 212, 225, 0.18)"
                                      strokeWidth="1"
                                      strokeDasharray="3 4"
                                  />
                                  <polyline
                                      points={plot.line}
                                      fill="none"
                                      stroke={plot.up ? '#3ecf8e' : '#f2667a'}
                                      strokeWidth="2"
                                      strokeLinejoin="round"
                                      strokeLinecap="round"
                                  />
                                  <circle cx={plot.last.x} cy={plot.last.y} r="3.5" fill={plot.up ? '#3ecf8e' : '#f2667a'} />
                              </svg>
                          ) : chartStatus === 'loading' ? (
                              <div className="chart-state chart-loading" />
                          ) : (
                              // no known series for this coin: the static asset stays
                              <div style={{ position: 'absolute', inset: '0' }}>
                                  <img src="/assets/img/345cb49984.svg" alt="chart line" style={{ position: 'absolute', width: '100%', height: 'auto', objectFit: 'fill', top: '20px' }} />
                                  <img src="/assets/img/345cb49984.svg" alt="chart line" style={{ position: 'absolute', width: '100%', height: 'auto', objectFit: 'fill', top: '50px' }} />
                                  <img src="/assets/img/345cb49984.svg" alt="chart line" style={{ position: 'absolute', width: '100%', height: 'auto', objectFit: 'fill', top: '80px' }} />
                                  <img src="/assets/img/57af05fcf0.svg" alt="chart area" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'fill', top: '8px' }} />
                                  <img src="/assets/img/d3c18653fe.svg" alt="chart stroke" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'fill', top: '8px' }} />
                                  <img src="/assets/img/f68dd066d8.svg" alt="chart dot" style={{ position: 'absolute', right: '0', top: '4px', width: '8px', height: '8px' }} />
                              </div>
                          )}
                      </div>
                      <div className="x-axis flex justify-between text-dark-gray">
                          <span>{dayLabel(axis[0])}</span>
                          <span>{dayLabel(axis[1])}</span>
                          <span>{dayLabel(axis[2])}</span>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      <section id="section-details">
          <div className="app-container">
              <div className="details-grid">
                  <div className="detail-item flex-col">
                      <span className="detail-label text-gray">{t('Minimal stake')}</span>
                      <span className="detail-value text-white font-medium">{idr(price)} IDR</span>
                  </div>
                  <div className="detail-item flex-col">
                      <span className="detail-label text-gray">{t('Periode')}</span>
                      <span className="detail-value text-white font-medium">{product.duration} Hari</span>
                  </div>
                  <div className="detail-item flex-col">
                      <span className="detail-label text-gray">{t('Imbal harian')}</span>
                      <span className="detail-value text-white font-medium">{idr(perDay)} IDR</span>
                  </div>
                  <div className="detail-item flex-col">
                      <span className="detail-label text-gray">{t('Imbal hasil dibagikan')}</span>
                      <span className="detail-value text-white font-medium">{t('Setiap hari')}</span>
                  </div>
                  <div className="detail-item flex-col">
                      <span className="detail-label text-gray">{t('Volume 24J')}</span>
                      <span className="detail-value text-white font-medium">{volumeText(hourSlot, product.id)}</span>
                  </div>
              </div>
          </div>
      </section>
      <section id="section-progress">
          <div className="app-container">
              <div className="progress-container flex-col">
                  <div className="progress-labels flex justify-between">
                      <span className="text-white font-medium">
                          {product.stock_enabled ? `Sisa ${remaining}%` : 'Kuota tidak dibatasi'}
                      </span>
                      <span className="text-gray">
                          {product.stock_enabled ? `Kuota terisi ${filled}%` : ''}
                      </span>
                  </div>
                  <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${remaining}%` }}></div>
                  </div>
              </div>
          </div>
      </section>
      <section id="section-ai">
          <div className="app-container">
              <div className="ai-container flex-col">
                  <h3 className="ai-title font-semibold text-white">{t('Analisis AI')}</h3>
                  <div className="ai-content flex">
                      <img src="/assets/img/3b30b80b95.png" alt="Product Icon" className="ai-icon" />
                      <p className="ai-text text-light-gray">{product.description || 'Belum ada deskripsi untuk produk ini.'}</p>
                  </div>
              </div>
          </div>
      </section>
      <section id="section-input">
          <div className="app-container">
              <div className="input-section-container flex-col">
                  <div className="input-header flex justify-between">
                      <span className="text-light-gray">{t('Jumlah Trade')}</span>
                      <span className="text-white font-bold">Saldo {walletLabel} {idr(wallet)} IDR</span>
                  </div>
                  
                  <div className="input-box flex items-center">
                      <span className="currency font-semibold text-white">{t('IDR')}</span>
                      <div className="divider"></div>
                      <input
                          type="text"
                          className="input-field text-dark-gray"
                          value={idr(price)}
                          readOnly
                      />
                  </div>

                  <div className="input-limits text-dark-gray">
                      1 unit · {idr(price)} IDR
                  </div>
                  
                  <div className="estimations flex-col">
                      <div className="est-row flex justify-between">
                          <span className="text-gray">{t('Estimasi imbal hasil / hari')}</span>
                          <span className="text-green font-medium">{idr(perDay)} IDR</span>
                      </div>
                      <div className="est-row flex justify-between">
                          <span className="text-gray">{t('Estimasi imbal hasil keseluruhan')}</span>
                          <span className="text-green font-medium">{idr(perDay * Number(product.duration))} IDR</span>
                      </div>
                      <div className="est-row flex justify-between">
                          <span className="text-gray">{t('Mulai dapat imbal hasil')}</span>
                          <span style={{ color: "#e6ecf3" }} className="font-medium">{startDate}</span>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      <section id="section-action">
          <div className="app-container">
              <div className="action-container">
                  <button
                      className="btn-primary font-bold"
                      disabled={!canBuy}
                      data-route={canBuy ? `/pasar/beli/konfirmasi?id=${product.id}&qty=${quantity}` : undefined}
                  >
                      {t('Mulai Trade')}
                  </button>
              </div>
          </div>
      </section>
      <section id="section-notes">
          <div className="app-container">
              <div className="notes-container flex-col">
                  <h4 className="notes-title text-light-gray font-medium">{t('Catatan')}</h4>
                  <ul className="notes-list flex-col">
                      <li className="flex">
                          <div className="bullet"></div>
                          <p className="text-dark-gray">{t('Riwayat pembelian menampilkan transaksi yang telah berhasil dilakukan oleh pengguna.')}</p>
                      </li>
                      <li className="flex">
                          <div className="bullet"></div>
                          <p className="text-dark-gray">{t('Identitas pengguna disamarkan untuk menjaga privasi dan keamanan akun.')}</p>
                      </li>
                  </ul>
              </div>
          </div>
      </section>
      <section id="section-orderbook">
          <div className="app-container">
              <div className="orderbook-container flex-col">
                  <div className="ob-header flex justify-between items-center">
                      <h3 className="ob-title font-semibold text-white">{t('Orderbook Beli')}</h3>
                      <span className="ob-pair text-gray">{product.name}/IDR</span>
                  </div>
                  
                  <div className="ob-table flex-col">
                      <div className="ob-thead flex text-dark-gray">
                          <div className="col-user">{t('Pengguna')}</div>
                          <div className="col-amount">{t('Qty Order')}</div>
                          <div className="col-total">Total (IDR)</div>
                      </div>
                      
                      <div className="ob-viewport">
                          <div className="ob-tbody flex-col">
                              {[0, 1].map((copy) => (
                                  <div className="ob-cycle" key={copy}>
                                      {orderRows.map((row) => (
                                          <div className="ob-row" key={row.id}>
                                              <div className="ob-bg" style={{ width: `${row.width}%` }}></div>
                                              <div className="col-user text-white">{row.user}</div>
                                              {/* the orderbook figures render flat, without thousand separators */}
                                              <div className="col-amount text-muted">{Math.round(row.amount)}</div>
                                              <div className="col-total text-muted">{Math.round(row.amount * price)}</div>
                                          </div>
                                      ))}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      <section id="section-footer">
          <div className="app-container">
              <div className="footer-container flex justify-between items-center">
                  <div className="footer-price text-green font-bold">{idr(price)} IDR</div>
                  <div className="footer-note text-gray">Harga terakhir · {product.name}</div>
              </div>
          </div>
      </section>
    </div>
  );
}
