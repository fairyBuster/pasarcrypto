// home — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import BottomNav from '../../components/BottomNav.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { useAssets } from '../../lib/useAssets.js';
import { useFearGreed, fearGreedColor } from '../../lib/useFearGreed.js';
import { useMarketHighlights } from '../../lib/useMarketHighlights.js';
import { useUsdRate } from '../../lib/useUsdRate.js';
import { api } from '../../lib/api.js';
import { idr, initials, quotaPercent, ratePercent, usdtApprox } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// the banner artwork shipped with the project, one image per slide
const BANNERS = ['/assets/img/backg1.png', '/assets/img/backg2.png', '/assets/img/backg3.png', '/assets/img/backg4.png'];
// safety cap while paging the product list; the backend has no price ordering
const MAX_PAGES = 10;
const css = `
/* home — ported from Figma export, typography re-synced */
.scr-home { background: linear-gradient(180deg, #0C1A2D 0%, #13263D 25%, #0F2036 60%, #0A1626 100%); }
.scr-home section{
  width: 100%;
  box-sizing: border-box;
  padding: 0 16px;
}
.scr-home p,
.scr-home h1,
.scr-home h2,
.scr-home h3,
.scr-home h4,
.scr-home h5,
.scr-home h6{
  margin: 0;
}
.scr-home a{
  text-decoration: none;
  color: inherit;
}
.scr-home *{
  box-sizing: border-box;
}
.scr-home .text-muted{ color: #8597ab; }
.scr-home .text-light{ color: #a9b7c8; }
.scr-home .text-lighter{ color: #c9d4e1; }
.scr-home .text-green{ color: #3ecf8e; }
.scr-home .text-red{ color: #f2667a; }
.scr-home .text-dark{ color: #0c1a2d; }
.scr-home #section-header{
    padding-top: 20px;
    padding-bottom: 16px;
  }
.scr-home .header-container{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
.scr-home .user-profile{
    display: flex;
    align-items: center;
    gap: 10px;
  }
.scr-home .avatar{
    width: 57px;
    height: 57px;
    border-radius: 50%;
    object-fit: cover;
  }
.scr-home .user-info{
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
.scr-home .greeting{
    font-size: 12px;
  }
.scr-home .username{
    font-size: 16px;
    font-weight: 600;
  }
.scr-home .header-actions{
    display: flex;
    gap: 10px;
  }
.scr-home .icon-btn{
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background-color: rgba(255, 255, 255, 0.08);
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    position: relative;
  }
.scr-home .notification-dot{
    position: absolute;
    top: 11px;
    right: 12px;
    width: 8px;
    height: 8px;
    background-color: #f5f8fb;
    border: 2px solid #15283f;
    border-radius: 50%;
  }
.scr-home #section-total-asset{
    margin-bottom: 24px;
  }
.scr-home .asset-card{
    background: linear-gradient(135deg, rgba(201, 212, 225, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%);
    border-radius: 20px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
  }
.scr-home .asset-header{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
.scr-home .asset-title-group{
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
.scr-home .eye-icon{
    width: 14px;
    height: 14px;
  }
/* the glyph keeps the frame's 14px slot; the button only widens the tap area */
.scr-home .eye-btn{
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }
.scr-home .eye-btn::before{
    content: '';
    position: absolute;
    inset: -12px;
  }
.scr-home .eye-btn:active{
    opacity: 0.7;
  }
/* the same glyph, slashed, while the figures are hidden */
.scr-home .eye-btn.is-hidden::after{
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
.scr-home .asset-card.is-hidden .amount,
.scr-home .asset-card.is-hidden .sub-balance,
.scr-home .asset-card.is-hidden .pnl-value,
.scr-home .asset-card.is-hidden .breakdown-value > span:not(.currency-small){
    filter: blur(7px);
    user-select: none;
  }
.scr-home .amount,
.scr-home .sub-balance,
.scr-home .pnl-value,
.scr-home .breakdown-value > span:not(.currency-small){
    transition: filter 0.16s ease;
  }
.scr-home .deposit-btn{
    background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    border: none;
    border-radius: 18px;
    height: 36px;
    padding: 0 18px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    position: absolute;
    right: 16px;
    top: 16px;
  }
.scr-home .asset-balance-group{
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
.scr-home .main-balance{
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
.scr-home .amount{
    font-size: 24px;
    font-weight: 700;
  }
.scr-home .currency{
    font-size: 12px;
  }
.scr-home .sub-balance{
    font-size: 12px;
    margin-bottom: 4px;
  }
.scr-home .pnl-group{
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
  }
.scr-home .pnl-value{
    font-weight: 500;
  }
.scr-home .asset-divider{
    height: 1px;
    background-color: rgba(255, 255, 255, 0.08);
    margin: 4px 0;
  }
.scr-home .asset-breakdown{
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
.scr-home .breakdown-row{
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }
.scr-home .breakdown-label{
    display: flex;
    align-items: center;
    gap: 10px;
  }
.scr-home .dot{
    width: 8px;
    height: 8px;
    border-radius: 4px;
  }
.scr-home .dot-blue{ background-color: #f5f8fb; }
.scr-home .dot-purple{ background-color: #9fb3ca; }
.scr-home .dot-darkblue{ background-color: #5f7d9e; }
.scr-home .breakdown-value{
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }
.scr-home .currency-small{
    font-size: 10px;
  }
.scr-home #section-quick-actions{
    margin-bottom: 24px;
  }
.scr-home .actions-grid{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 8px;
  }
.scr-home .action-item{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
.scr-home .action-item img{
    height: 48px;
    object-fit: contain;
  }
.scr-home .action-item span{
    font-size: 11px;
    color: #d3dce7;
    text-align: center;
  }
.scr-home #section-banner{
    margin-bottom: 24px;
  }
/* the four banner exports are 1140x428, so the slot keeps that ratio instead of
   the dashed placeholder height */
.scr-home .banner-container{
    position: relative;
    aspect-ratio: 1140 / 428;
    border-radius: 20px;
    overflow: hidden;
  }
.scr-home .banner-track{
    display: flex;
    height: 100%;
    transition: transform 0.35s ease;
  }
.scr-home .banner-image{
    width: 100%;
    height: 100%;
    flex: 0 0 100%;
    object-fit: cover;
    display: block;
  }
.scr-home .banner-indicator{
    position: absolute;
    top: 12px;
    right: 12px;
    background-color: rgba(9, 18, 32, 0.55);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    color: #ffffff;
  }
.scr-home .banner-dots{
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 12px;
  }
.scr-home .banner-dots .dot{
    width: 6px;
    height: 4px;
    padding: 0;
    border: none;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    cursor: pointer;
    transition: width 0.2s, background-color 0.2s;
  }
.scr-home .banner-dots .dot.active{
    width: 16px;
    background-color: #c9d4e1;
  }
.scr-home #section-widgets{
    margin-bottom: 24px;
  }
.scr-home .widgets-grid{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
.scr-home .widget-card{
    border-radius: 20px;
    position: relative;
    overflow: hidden;
  }
.scr-home .referral-card{
    background: linear-gradient(180deg, #24405f 0%, #142740 100%);
    padding: 16px;
    display: flex;
    flex-direction: column;
    min-height: 246px;
  }
.scr-home .referral-content{
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
.scr-home .referral-title{
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
  }
.scr-home .btn-mulai{
    background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    border: none;
    border-radius: 16px;
    padding: 4px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
.scr-home .referral-img{
    position: absolute;
    right: -30px;
    bottom: -20px;
    width: 160px;
    height: 159px;
    z-index: 1;
  }
.scr-home .widget-col{
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
.scr-home .small-card{
    background-color: rgba(255, 255, 255, 0.06);
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }
.scr-home .card-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
.scr-home .gauge-container{
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
  }
.scr-home .gauge-svg{
    width: 112px;
  }
.scr-home .gauge-info{
    position: absolute;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
.scr-home .gauge-value{
    color: #e9c46a;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
  }
.scr-home .gauge-label{
    font-size: 10px;
  }
.scr-home .trending-list{
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
  }
.scr-home .trending-item{
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
  }
.scr-home .coin-icon{
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.12);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 8px;
    font-weight: 600;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }
/* the product artwork covers the initials; a broken upload is removed in
   place, so the initials underneath stay visible instead of a broken icon */
.scr-home .coin-icon img{
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
.scr-home .coin-name{
    flex: 1;
    /* product names run longer than the coin names the frame drew */
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
.scr-home .coin-change{
    font-weight: 600;
  }
.scr-home #section-holding-analysis{
    margin-bottom: 24px;
  }
.scr-home .section-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
.scr-home .section-title{
    font-size: 16px;
    font-weight: 600;
  }
.scr-home .holding-scroll-container{
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 10px;
    margin: 0 -16px;
    padding-left: 16px;
    padding-right: 16px;
    scrollbar-width: none; 
  }
.scr-home .holding-scroll-container::-webkit-scrollbar{
    display: none; 
  }
.scr-home .holding-card{
    background-color: rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    padding: 16px;
    min-width: 288px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
.scr-home .holding-top{
    display: flex;
    align-items: center;
    gap: 10px;
  }
.scr-home .coin-badge{
    width: 38px;
    height: 38px;
    border-radius: 19px;
    background-color: rgba(255, 255, 255, 0.12);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    font-weight: 600;
    color: #e6ecf3;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }
.scr-home .coin-badge img{
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
.scr-home .holding-info{
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
.scr-home .holding-name{
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
.scr-home .holding-name .name{
    font-size: 14px;
    font-weight: 600;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
.scr-home .holding-name .tag{
    background-color: rgba(201, 212, 225, 0.14);
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 8px;
    color: #c9d4e1;
    flex-shrink: 0;
  }
.scr-home .holding-info .desc{
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
.scr-home .holding-apr{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
.scr-home .apr-value{
    font-size: 14px;
    font-weight: 600;
  }
.scr-home .apr-label{
    font-size: 10px;
  }
.scr-home .holding-volume{
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
  }
.scr-home .vol-value{
    margin-left: auto;
    font-weight: 600;
  }
.scr-home .holding-progress{
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
/* the frame's quota bar stays as drawn; the API has no quota total to fill it */
.scr-home .progress-bar{
    height: 4px;
    background-color: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
  }
.scr-home .progress-fill{
    height: 100%;
    background: linear-gradient(90deg, #c9d4e1 0%, #f5f8fb 100%);
    border-radius: 2px;
  }
.scr-home .holding-state{
    margin: 0;
    padding: 18px 0;
    font-size: 13px;
    line-height: 20px;
    color: #8597ab;
  }
.scr-home .holding-state.error{
    color: #f5808f;
  }
/* skeleton placeholders — the frame's boxes keep their size while the data lands */
.scr-home .sk{
    display: block;
    border-radius: 5px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.16) 50%, rgba(255, 255, 255, 0.06) 100%);
    background-size: 220% 100%;
    animation: scr-home-shimmer 1.3s ease-in-out infinite;
  }
@keyframes scr-home-shimmer{
    0%{ background-position: 140% 0; }
    100%{ background-position: -140% 0; }
  }
@media (prefers-reduced-motion: reduce){
    .scr-home .sk{
      animation: none;
      background: rgba(255, 255, 255, 0.1);
    }
  }
.scr-home .sk-status{
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
.scr-home .progress-labels{
    display: flex;
    justify-content: space-between;
    font-size: 10px;
  }
.scr-home .holding-footer{
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
.scr-home .footer-icon{
    width: 24px;
    height: 24px;
  }
.scr-home .footer-text{
    flex: 1;
    min-width: 0;
    font-size: 10px;
    color: #d3dce7;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
.scr-home #section-market-highlights{
    margin-bottom: 40px;
  }
.scr-home .market-grid{
    display: flex;
    gap: 6px;
    background-color: transparent;
    border-radius: 20px;
    overflow: hidden;
  }
.scr-home .market-col{
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }
.scr-home .market-card{
    padding: 10px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
.scr-home .card-tall{
    height: 100%;
    justify-content: space-between;
  }
.scr-home .bg-green-tint{
    background-color: rgba(62, 207, 142, 0.1);
  }
.scr-home .bg-red-tint{
    background-color: rgba(242, 102, 122, 0.1);
  }
.scr-home .bg-dark-tint{
    background-color: rgba(255, 255, 255, 0.06);
  }
.scr-home .card-content{
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 2;
  }
.scr-home .market-name{
    font-size: 14px;
    font-weight: 600;
  }
.scr-home .market-change{
    font-size: 10px;
    font-weight: 600;
  }
.scr-home .card-bottom{
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 16px;
    z-index: 2;
  }
.scr-home .more-count{
    font-size: 10px;
  }
.scr-home .bg-chart{
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1;
  }
.scr-home .nav-text{
    font-size: 10px;
    color: #75879c;
  }
.scr-home .center-item{
    position: relative;
    top: -26px;
  }
.scr-home .center-btn{
    width: 54px;
    height: 54px;
    border-radius: 27px;
    background: linear-gradient(180deg, #52A8FF 0%, #002040 100%);
    border: 4px solid #0d1b2e;
    display: flex;
    justify-content: center;
    align-items: center;
  }
.scr-home .center-btn img{
    width: 26px;
    height: 26px;
  }
/* figma re-sync */
.scr-home .deposit-btn.deposit-btn { font-size: 13px; }
.scr-home .amount.amount { font-size: 20px; }
.scr-home .currency-small.currency-small { font-size: 12px; }
.scr-home .banner-text.banner-text { font-size: 11px; }
.scr-home .banner-indicator.banner-indicator { font-size: 11px; }
.scr-home .gauge-value.gauge-value { line-height: 24px; }
.scr-home .coin-icon.coin-icon { font-size: 7px; }
.scr-home .coin-icon.coin-icon { font-weight: 700; }
.scr-home .section-title.section-title { font-size: 17px; }
.scr-home .section-title.section-title { font-weight: 700; }
.scr-home .coin-badge.coin-badge { font-weight: 700; }
.scr-home .name.name { font-size: 10px; }
.scr-home .name.name { font-weight: 700; }
.scr-home .tag.tag { font-size: 10px; }
.scr-home .desc.desc { font-size: 12px; }
.scr-home .apr-value.apr-value { font-size: 15px; }
.scr-home .apr-label.apr-label { font-size: 11px; }
.scr-home .footer-text.footer-text { font-size: 12px; }
.scr-home .market-name.market-name { font-size: 13px; }
.scr-home .market-name.market-name { font-weight: 700; }
.scr-home .market-change.market-change { font-size: 11px; }
`;

// the frame greets by time of day; the account object has no field for it
const greetingFor = (hour) => {
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
};

// category market caps are USD, so they are shortened ("$2,2 T")
const compactUsd = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });
const changeText = (row) =>
  row?.change == null ? '—' : `${row.change >= 0 ? '+' : ''}${row.change.toFixed(2).replace('.', ',')}%`;
const changeClass = (row) => (row?.change == null ? 'text-muted' : row.change < 0 ? 'text-red' : 'text-green');
const changeTint = (row) => (row?.change == null ? 'bg-dark-tint' : row.change < 0 ? 'bg-red-tint' : 'bg-green-tint');
const capText = (row) => (row?.cap > 0 ? `$${compactUsd.format(row.cap)}` : '—');

// the frame shows a 24h volume; it is a placeholder, so it is regenerated every
// hour (and per card) to keep the tile alive
const volumeFor = (hour, id) => {
  const seed = Math.sin((hour + 1) * (Number(id) + 3) * 0.618) * 10000;
  return 12.5 + (seed - Math.floor(seed)) * 4;
};
const volumeText = (hour, id) => `${volumeFor(hour, id).toFixed(1).replace('.', ',')} Jt USDT`;

// a stock-enabled product with zero stock has no detail to open from a card
const soldOut = (product) => !!product?.stock_enabled && Number(product?.stock) <= 0;

// the trending widget prefers catalogue entries the holding cards below do not
// already preview, then wraps around so a short catalogue still fills both rows
const trendingRowsFrom = (catalogue, preview) => {
  const shown = new Set(preview.map((product) => product.id));
  const rows = catalogue.filter((product) => !shown.has(product.id)).slice(0, 2);
  for (const product of catalogue) {
    if (rows.length >= 2) break;
    if (!rows.some((row) => row.id === product.id)) rows.push(product);
  }
  return rows;
};

// the frame stacks placeholder circles; each slot now carries a top coin logo
const MergedAvatars = ({ icons = [], slots = 3 }) => (
  <div className="merged-avatars" style={{ position: 'relative', width: `${20 + 14 * (slots - 1)}px`, height: '20px' }}>
    {Array.from({ length: slots }).map((_, index) => {
      const style = {
        position: 'absolute',
        left: `${index * 14}px`,
        top: 0,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)',
        border: '2px solid #142740',
        zIndex: slots - index,
      };
      return icons[index]
        ? <img key={index} src={icons[index]} alt="" style={{ ...style, objectFit: 'cover' }} />
        : <div key={index} style={style}></div>;
    })}
  </div>
);

// one shimmering bar, sized like the text or block it stands in for
const Sk = ({ w = '100%', h = 10, r = 5, style }) => (
  <span className="sk" style={{ width: w, height: `${h}px`, borderRadius: `${r}px`, ...style }} aria-hidden="true"></span>
);

// the tile copy while the categories feed is still in flight
const TileSkeleton = () => (
  <>
    <Sk w="72%" />
    <Sk w="42%" style={{ marginTop: '4px' }} />
  </>
);

// name and 24h move, or the two bars that hold their place until the feed answers
const MarketText = ({ loading, row }) =>
  loading ? (
    <TileSkeleton />
  ) : (
    <>
      <span className="market-name">{row.name}</span>
      <span className={`market-change ${changeClass(row)}`}>{changeText(row)}</span>
    </>
  );

export default function Home() {
  const { user } = useAuth();
  const { deposit, available, balanceHold, todayIncome, status } = useAssets();
  // the API quotes the rupiah-per-USD rate the sub-balance is read at
  const usdRate = useUsdRate();
  const { data: fearGreedData, status: fearGreedStatus } = useFearGreed();
  const fearGreed = fearGreedData?.now || null;
  // the five market tiles, Layer 1 first to match the frame's tall card
  const { rows: highlights, status: marketStatus } = useMarketHighlights();
  const [layerOne, solana, meme, defi, ai] = highlights;
  // the knob rides the 46px arc: 0 sits at the left end, 100 at the right
  const knobAngle = Math.PI * (1 - Math.max(0, Math.min(100, fearGreed?.value ?? 50)) / 100);
  const knob = { x: 56 + 46 * Math.cos(knobAngle), y: 56 - 46 * Math.sin(knobAngle) };
  const ready = status === 'ready';
  // the balances print "—" once the request fails; while it is in flight the
  // figures keep their slot as skeleton bars
  const loading = status === 'loading';
  const marketLoading = marketStatus === 'loading';
  const amount = (value) => (ready ? idr(value) : '—');
  // the card sums the three balances it lists
  const total = deposit + available + balanceHold;
  // the API reports today's income only, so the rate is measured against the
  // principal that produced it
  const pnlBase = total - todayIncome;
  const pnlRate = ready && pnlBase > 0 ? (todayIncome / pnlBase) * 100 : 0;
  const pnl = `${todayIncome > 0 ? '+' : ''}${idr(todayIncome)} IDR (${pnlRate.toFixed(2).replace('.', ',')}%)`;
  // the login payload only has phone/email, account-info adds the username
  const username = user?.username || user?.full_name || 'Username';

  // the eye hides the figures; it is a privacy preference, so it outlives a reload
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

  // the frame shows four banner slides with a 1/4 counter, so the slot rotates
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSlide((current) => (current + 1) % BANNERS.length), 5000);
    return () => window.clearInterval(id);
  }, []);

  // the section previews only the two cheapest products; the list endpoint has
  // no price ordering, so every page is read before sorting. The same fetch
  // feeds the trending widget, which keeps the catalogue order the API sends
  const [products, setProducts] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [productsStatus, setProductsStatus] = useState('loading');
  useEffect(() => {
    let alive = true;
    (async () => {
      const all = [];
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const res = await api.products({ page });
        if (!alive) return;
        if (!res.ok) {
          setProductsStatus('error');
          return;
        }
        const list = Array.isArray(res.data?.results) ? res.data.results : [];
        all.push(...list);
        if (!res.data?.next || list.length === 0) break;
      }
      setCatalogue(all);
      setProducts([...all].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)).slice(0, 2));
      setProductsStatus('ready');
    })().catch(() => {
      if (alive) setProductsStatus('error');
    });
    return () => {
      alive = false;
    };
  }, []);

  // the trending rows read the product catalogue (name + artwork) instead of a
  // coin feed; the two cards below already preview the cheapest pair, so the
  // widget prefers other entries before it wraps around
  const trendingLoading = productsStatus === 'loading';
  const trendingRows = trendingRowsFrom(catalogue, products);

  // the volume placeholder rolls over when the hour changes
  const [hourSlot, setHourSlot] = useState(() => Math.floor(Date.now() / 3600000));
  useEffect(() => {
    const id = window.setInterval(() => setHourSlot(Math.floor(Date.now() / 3600000)), 30000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="scr-home">
      <style>{css}</style>
      <section id="section-header">
        <header className="header-container">
          {/* the identity block is the entry point to the profile screen */}
          <div className="user-profile" role="button" aria-label={t('Buka profil saya')} data-route="/profil">
            <img src="/assets/img/d27c34de05.png" alt="User Avatar" className="avatar" />
            <div className="user-info">
              <span className="greeting text-muted">{greetingFor(new Date().getHours())} 👋</span>
              <span className="username">{username}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" data-route="/faq">
              <img src="/assets/img/08e8adf69a.svg" alt="Support" />
            </button>
            <button className="icon-btn" data-route="/notifikasi">
              <img src="/assets/img/2003aea9ba.svg" alt="Notifications" />
              <span className="notification-dot"></span>
            </button>
          </div>
        </header>
      </section>
      <section id="section-total-asset">
        <div className={`asset-card${balanceHidden ? ' is-hidden' : ''}`}>
          <div className="asset-header">
            <div className="asset-title-group">
              <span className="asset-title text-light">{t('Total Aset')}</span>
              <button
                type="button"
                className={`eye-btn${balanceHidden ? ' is-hidden' : ''}`}
                aria-label={balanceHidden ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
                aria-pressed={balanceHidden}
                onClick={toggleBalance}
              >
                <img src="/assets/img/a5c24f2e4d.svg" alt="" className="eye-icon" />
              </button>
            </div>
            <button className="deposit-btn" data-route="/send">{t('Deposit')}</button>
          </div>
          
          <div className="asset-balance-group">
            <div className="main-balance">
              {loading ? (
                <Sk w={148} h={20} r={6} />
              ) : (
                <span className="amount" aria-hidden={balanceHidden || undefined}>{amount(total)}</span>
              )}
              <span className="currency text-light">{t('IDR')}</span>
            </div>
            {loading ? (
              <Sk w={92} />
            ) : (
              /* the same total read as USDT, at the rate the asset screens quote */
              <div className="sub-balance text-lighter" aria-hidden={balanceHidden || undefined}>
                {ready ? usdtApprox(total, usdRate) : '—'}
              </div>
            )}
            <div className="pnl-group">
              <span className="pnl-label text-light">{t('P&L Hari Ini')}</span>
              {loading ? (
                <Sk w={118} />
              ) : (
                <span className="pnl-value" aria-hidden={balanceHidden || undefined}>{ready ? pnl : '—'}</span>
              )}
            </div>
          </div>
      
          <div className="asset-divider"></div>
      
          <div className="asset-breakdown">
            <div className="breakdown-row">
              <div className="breakdown-label">
                <span className="dot dot-blue"></span>
                <span className="text-light">{t('Saldo Isi Ulang')}</span>
              </div>
              <div className="breakdown-value" aria-hidden={balanceHidden || undefined}>
                {loading ? <Sk w={72} /> : <span>{amount(deposit)}</span>}
                <span className="currency-small text-muted">{t('IDR')}</span>
              </div>
            </div>
            <div className="breakdown-row">
              <div className="breakdown-label">
                <span className="dot dot-purple"></span>
                <span className="text-light">{t('Balance')}</span>
              </div>
              <div className="breakdown-value" aria-hidden={balanceHidden || undefined}>
                {loading ? <Sk w={72} /> : <span>{amount(available)}</span>}
                <span className="currency-small text-muted">{t('IDR')}</span>
              </div>
            </div>
            <div className="breakdown-row">
              <div className="breakdown-label">
                <span className="dot dot-darkblue"></span>
                <span className="text-light">{t('Returns')}</span>
              </div>
              <div className="breakdown-value" aria-hidden={balanceHidden || undefined}>
                {loading ? <Sk w={72} /> : <span>{amount(balanceHold)}</span>}
                <span className="currency-small text-muted">{t('IDR')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-quick-actions">
        <div className="actions-grid">
          <a href="#/draw" className="action-item" data-route="/draw">
            <img src="/assets/img/a89c155e9c.png" alt="Tarik" />
            <span>{t('Tarik')}</span>
          </a>
          <a href="#misi" className="action-item" data-route="/rewards/misi">
            <img src="/assets/img/9fc3da089a.png" alt="Misi" />
            <span>{t('Misi')}</span>
          </a>
          <a href="#rewards" className="action-item" data-route="/rewards/roda">
            <img src="/assets/img/27bab20d3c.png" alt="Lucky Rewards" />
            <span>{t('Lucky Rewards')}</span>
          </a>
          <a href="#masuk" className="action-item" data-route="/rewards/harian">
            <img src="/assets/img/48b29e5494.png" alt="Masuk harian" />
            <span>{t('Masuk harian')}</span>
          </a>
        </div>
      </section>
      <section id="section-banner">
        <div className="banner-container">
          <div className="banner-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
            {BANNERS.map((src) => (
              <img key={src} src={src} alt="" className="banner-image" />
            ))}
          </div>
          <div className="banner-indicator">{slide + 1}/{BANNERS.length}</div>
        </div>
        <div className="banner-dots">
          {BANNERS.map((src, index) => (
            <button
              key={src}
              type="button"
              className={`dot${index === slide ? ' active' : ''}`}
              aria-label={`Banner ${index + 1}`}
              onClick={(event) => {
                // the frame navigates any bare button, this one only changes slide
                event.stopPropagation();
                setSlide(index);
              }}
            ></button>
          ))}
        </div>
      </section>
      <section id="section-widgets">
        <div className="widgets-grid">
          <div className="widget-card referral-card" data-route="/rewards/share">
            <div className="referral-content">
              <span className="text-light" style={{ fontSize: "10px" }}>{t('Program Referral')}</span>
              <h3 className="referral-title">{t('Ajak Teman,')}<br />{t('Dapat Bonus')}<br />{t('Poin')}</h3>
              <button className="btn-mulai" data-route="/rewards/share">{t('Mulai')}</button>
            </div>
            <img src="/assets/img/1024158bf1.png" alt="Coins" className="referral-img" />
          </div>
          
          <div className="widget-col">
            <div className="widget-card small-card" data-route="/learning">
              <div className="card-header">
                <span className="text-light" style={{ fontSize: "12px" }}>{t('Fear & Greed')}</span>
                <img src="/assets/img/43b9aba116.svg" alt="Arrow" />
              </div>
              <div className="gauge-container">
                {/* the frame shipped a flat arc with the knob pinned at 50; the
                    knob is placed from the live index instead */}
                <svg className="gauge-svg" viewBox="0 0 112 62" fill="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="fg-gauge" x1="10" y1="10" x2="102" y2="10" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F2667A" />
                      <stop offset="0.5" stopColor="#E9C46A" />
                      <stop offset="1" stopColor="#3ECF8E" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 56C10 43.8 14.8464 32.0998 23.4731 23.4731C32.0998 14.8464 43.8 10 56 10C68.2 10 79.9002 14.8464 88.5269 23.4731C97.1536 32.0998 102 43.8 102 56"
                    stroke="url(#fg-gauge)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <circle cx={knob.x.toFixed(1)} cy={knob.y.toFixed(1)} r="5" fill="#ffffff" stroke="#15283F" strokeWidth="2" />
                </svg>
                <div className="gauge-info">
                  {fearGreedStatus === 'loading' ? (
                    <>
                      <Sk w={30} h={20} r={6} />
                      <Sk w={54} style={{ marginTop: '6px' }} />
                    </>
                  ) : (
                    <>
                      <span className="gauge-value" style={{ color: fearGreed ? fearGreedColor(fearGreed) : undefined }}>
                        {fearGreed ? fearGreed.value : '—'}
                      </span>
                      <span className="gauge-label text-muted">{fearGreed ? fearGreed.label : ''}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="widget-card small-card" data-route="/pasar">
              <div className="card-header">
                <span className="text-light" style={{ fontSize: "12px" }}>{t('Trending')}</span>
                <img src="/assets/img/43b9aba116.svg" alt="Arrow" />
              </div>
              <div className="trending-list">
                {/* the frame only held placeholders; the rows take the name and
                    artwork of the catalogue, initials stand in on a broken URL */}
                {trendingLoading &&
                  [0, 1].map((slot) => (
                    <div className="trending-item" key={`trending-skeleton-${slot}`} aria-hidden="true">
                      <div className="coin-icon"></div>
                      <span className="coin-name"><Sk w={48} h={10} /></span>
                      <Sk w={36} h={10} />
                    </div>
                  ))}
                {!trendingLoading && trendingRows.length === 0 && (
                  <div className="trending-item">
                    <span className="coin-name text-muted">{t('Tidak tersedia')}</span>
                  </div>
                )}
                {!trendingLoading &&
                  trendingRows.map((product) => (
                    <div
                      className="trending-item"
                      key={product.id}
                      data-route={soldOut(product) ? undefined : `/pasar/detail?id=${product.id}`}
                    >
                      <div className="coin-icon">
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
                      <span className="coin-name">{product.name}</span>
                      <span className="coin-change text-green">{ratePercent(product)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-holding-analysis">
        <div className="section-header">
          <h2 className="section-title">{t('Holding Analysis')}</h2>
          <img
            src="/assets/img/48490159a0.svg"
            alt="More"
            role="button"
            aria-label={t('Buka menu produk')}
            data-route="/pasar"
          />
        </div>
        
        <div className="holding-scroll-container">
          {/* the same card outlines the real rows draw, so nothing jumps on arrival */}
          {productsStatus === 'loading' &&
            [0, 1].map((slot) => (
              <div className="holding-card" key={`skeleton-${slot}`} aria-hidden="true">
                <div className="holding-top">
                  <Sk w={38} h={38} r={19} style={{ flexShrink: 0 }} />
                  <div className="holding-info" style={{ gap: '8px' }}>
                    <Sk w="78%" />
                    <Sk w="52%" />
                  </div>
                </div>
                <Sk w="64%" />
                <div className="holding-progress">
                  <Sk h={4} r={2} />
                  <div className="progress-labels">
                    <Sk w={74} h={8} />
                    <Sk w={98} h={8} />
                  </div>
                </div>
                <div className="holding-footer">
                  <Sk w="100%" h={12} />
                </div>
              </div>
            ))}
          {productsStatus === 'loading' && <p className="sk-status" role="status">{t('Memuat produk…')}</p>}
          {productsStatus === 'error' && <p className="holding-state error">{t('Gagal memuat produk.')}</p>}
          {productsStatus === 'ready' && products.length === 0 && (
            <p className="holding-state">{t('Belum ada produk aktif.')}</p>
          )}
          {products.map((product) => (
          <div className="holding-card" key={product.id} data-route={soldOut(product) ? undefined : `/pasar/detail?id=${product.id}`}>
            <div className="holding-top">
              <div className="coin-badge">
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
              <div className="holding-info">
                <div className="holding-name">
                  <span className="name">{product.name}</span>
                  <span className="tag">{product.golongan && product.golongan !== '-' ? product.golongan : 'Holding'}</span>
                </div>
                {product.specifications && (
                  <span className="desc text-muted">{product.specifications}</span>
                )}
              </div>
              <div className="holding-apr">
                <span className="apr-value text-green">{ratePercent(product)}</span>
                <span className="apr-label text-muted">{t('Est. APR')}</span>
              </div>
            </div>
            
            <div className="holding-volume">
              <img src="/assets/img/d648c557e4.svg" alt="Volume" />
              <span className="vol-label text-light">{t('Volume 24J')}</span>
              <span className="vol-value">{volumeText(hourSlot, product.id)}</span>
            </div>
            
            <div className="holding-progress">
              <div className="progress-bar">
                {/* stock reads against the 5000-unit ceiling, so the bar shows the share left */}
                <div
                  className="progress-fill"
                  style={{ width: `${quotaPercent(product)}%` }}
                ></div>
              </div>
              <div className="progress-labels">
                <span className="text-muted">
                  {product.stock_enabled
                    ? (Number(product.stock) > 0 ? 'Stok tersedia' : 'Stok habis')
                    : 'Stok tidak dibatasi'}
                </span>
                <span className="text-muted">
                  {product.stock_enabled && Number(product.stock) > 0 ? `Sisa ${quotaPercent(product)}%` : ''}
                </span>
              </div>
            </div>
            
            <div className="holding-footer">
              <img src="/assets/img/3b30b80b95.png" alt="Icon" className="footer-icon" />
              <span className="footer-text">{product.description}</span>
              <img src="/assets/img/9cf2bc7677.svg" alt="Arrow" />
            </div>
          </div>
          ))}
        </div>
      </section>
      <section id="section-market-highlights">
        <div className="section-header">
          <h2 className="section-title">{t('Sorotan Pasar')}</h2>
          <img src="/assets/img/48490159a0.svg" alt="More" data-route="/pasar" />
        </div>
        
        <div className="market-grid">
          
          <div className="market-col">
            <div className={`market-card card-tall ${changeTint(layerOne)}`} data-route="/pasar">
              <div className="card-content">
                <MarketText loading={marketLoading} row={layerOne} />
              </div>
              <div className="card-bottom">
                <MergedAvatars icons={layerOne.icons} slots={3} />
                {marketLoading ? <Sk w={34} /> : <span className="more-count text-light">{capText(layerOne)}</span>}
              </div>
              {/* the green sparkline only belongs on a positive tile */}
              {layerOne.change > 0 && (
                <img src="/assets/img/ca006bd036.svg" alt="Chart" className="bg-chart" />
              )}
            </div>
          </div>
          
          
          <div className="market-col">
            <div className={`market-card ${changeTint(solana)}`} data-route="/pasar">
              <div className="card-content">
                <MarketText loading={marketLoading} row={solana} />
              </div>
              <div className="card-bottom">
                <MergedAvatars icons={solana.icons} slots={2} />
                {marketLoading ? <Sk w={34} /> : <span className="more-count text-light">{capText(solana)}</span>}
              </div>
            </div>
            <div className={`market-card ${changeTint(meme)}`} style={{ flex: "1" }} data-route="/pasar">
              <div className="card-content">
                <MarketText loading={marketLoading} row={meme} />
              </div>
              <div className="card-bottom" style={{ marginTop: "auto" }}>
                <MergedAvatars icons={meme.icons} slots={3} />
                {marketLoading ? <Sk w={34} /> : <span className="more-count text-light">{capText(meme)}</span>}
              </div>
            </div>
          </div>
          
          
          <div className="market-col">
            <div className={`market-card ${changeTint(defi)}`} data-route="/pasar">
              <div className="card-content">
                <MarketText loading={marketLoading} row={defi} />
              </div>
              <div className="card-bottom">
                <MergedAvatars icons={defi.icons} slots={2} />
                {marketLoading ? <Sk w={34} /> : <span className="more-count text-light">{capText(defi)}</span>}
              </div>
            </div>
            <div className={`market-card ${changeTint(ai)}`} data-route="/pasar">
              <div className="card-content">
                <MarketText loading={marketLoading} row={ai} />
              </div>
            </div>
            <div className="market-card bg-dark-tint" style={{ justifyContent: "center" }} data-route="/pasar">
              <span className="text-muted" style={{ fontSize: "12px" }}>{t('Lainnya')}</span>
            </div>
          </div>
        </div>
      </section>
      
      <BottomNav />
    </div>
  );
}
