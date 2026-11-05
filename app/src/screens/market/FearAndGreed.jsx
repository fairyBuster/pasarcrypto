// fear-and-greed — ported from the Figma export, typography re-synced to Figma
import { useState } from 'react';
import { useFearGreed, fearGreedColor } from '../../lib/useFearGreed.js';
import { wibParts } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// the five buckets the index can land in, in the order the frame lists them
const SCALE = [
  { name: 'Extreme Fear', range: '0–24', dot: 'bg-red' },
  { name: 'Fear', range: '25–44', dot: 'bg-orange' },
  { name: 'Neutral', range: '45–55', dot: 'bg-yellow' },
  { name: 'Greed', range: '56–75', dot: 'bg-green' },
  { name: 'Extreme Greed', range: '76–100', dot: 'bg-dark-green' },
];

// the pills cut the series to the last N days; the endpoint returns a year
const RANGES = { '7D': 7, '30D': 30, '1Y': 365 };

// the frame plots the series in a 380x140 box: 100 sits at y 8, 0 at y 120
const CHART_W = 380;
const CHART_BASE = 120;
const CHART_SPAN = 112;

const chartPoints = (series) =>
  series.map((row, index) => ({
    x: series.length > 1 ? (index * CHART_W) / (series.length - 1) : 0,
    y: CHART_BASE - (Math.max(0, Math.min(100, row.value)) / 100) * CHART_SPAN,
  }));

const chartPath = (points) =>
  points
    .map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join('');

// the shared wibParts prints Indonesian short months, this screen reads English
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "25 Oct 2026, 07:00", the way the screen stamps the index
const stampOf = (at) => {
  const p = wibParts(new Date(at));
  return `${p.day} ${MONTHS_SHORT[p.month - 1]} ${p.year}, ${p.hour}:${p.minute}`;
};

// the axis prints the day and the short month ("25 Sep")
const tickOf = (at) => {
  const p = wibParts(new Date(at));
  return `${p.day} ${MONTHS_SHORT[p.month - 1]}`;
};

const valueOf = (row) => (row ? row.value : '—');
// the API already names the five buckets in English ("Extreme Fear", "Neutral", …)
const labelOf = (row) => (row ? row.label : '—');
const colorOf = (row) => (row ? fearGreedColor(row) : '#75879c');

const css = `
/* fear-and-greed — ported from Figma export, typography re-synced */
.scr-fear-and-greed { background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-fear-and-greed *{
  box-sizing: border-box;
}
.scr-fear-and-greed h1,
.scr-fear-and-greed h2,
.scr-fear-and-greed h3,
.scr-fear-and-greed p{
  margin: 0;
}
.scr-fear-and-greed .site-header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 0;
}
.scr-fear-and-greed .back-btn{
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
.scr-fear-and-greed .page-title{
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}
.scr-fear-and-greed .header-spacer{
  width: 40px;
}
.scr-fear-and-greed .gauge-wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 24px;
}
.scr-fear-and-greed .gauge-visual{
  position: relative;
  width: 260px;
  height: 146px;
}
.scr-fear-and-greed .gauge-arc{
  position: absolute;
}
.scr-fear-and-greed .arc-1{ left: 26px; top: 56.3px; width: 28.6px; height: 69.1px; }
.scr-fear-and-greed .arc-2{ left: 58.3px; top: 25.7px; width: 52.9px; height: 26.9px; }
.scr-fear-and-greed .arc-3{ left: 116.3px; top: 24px; width: 30.6px; height: 1.4px; }
.scr-fear-and-greed .arc-4{ left: 152px; top: 26.4px; width: 52px; height: 28.5px; }
.scr-fear-and-greed .arc-5{ left: 207.6px; top: 58.7px; width: 26.4px; height: 66.7px; }
.scr-fear-and-greed .gauge-pointer{
  position: absolute;
  left: 121px;
  top: 15px;
  width: 18px;
  height: 18px;
  z-index: 2;
  transition: transform 0.45s ease;
}
.scr-fear-and-greed .gauge-center-text{
  position: absolute;
  top: 54px;
  left: 0;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scr-fear-and-greed .gauge-score{
  font-size: 53px;
  font-weight: 700;
  color: #e9c46a;
  line-height: 1;
}
.scr-fear-and-greed .gauge-status{
  font-size: 17px;
  color: #d3dce7;
  margin-top: 1px;
}
.scr-fear-and-greed .gauge-timestamp{
  font-size: 13px;
  color: #75879c;
  margin-top: 6px;
}
.scr-fear-and-greed .stats-container{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 22px 16px 0;
}
.scr-fear-and-greed .stat-block{
  display: flex;
  flex-direction: column;
  flex: 1;
}
.scr-fear-and-greed .stat-block:nth-child(3){
  padding-left: 15px;
}
.scr-fear-and-greed .stat-block:nth-child(5){
  padding-left: 15px;
}
.scr-fear-and-greed .stat-divider{
  width: 1px;
  background-color: rgba(201, 212, 225, 0.18);
  height: 56px;
}
.scr-fear-and-greed .stat-title{
  font-size: 13px;
  color: #8597ab;
}
.scr-fear-and-greed .stat-value{
  font-size: 26px;
  font-weight: 700;
  margin-top: 4px;
  line-height: 1;
}
.scr-fear-and-greed .stat-label{
  font-size: 13px;
  color: #a9b7c8;
  margin-top: 13px;
}
.scr-fear-and-greed .text-yellow{ color: #e9c46a; }
.scr-fear-and-greed .text-green{ color: #9bd36e; }
.scr-fear-and-greed .text-orange{ color: #f29a6a; }
.scr-fear-and-greed .text-red{ color: #f2667a; }
.scr-fear-and-greed .text-dark-green{ color: #3ecf8e; }
.scr-fear-and-greed #section-history{
  padding: 30px 16px 0;
}
.scr-fear-and-greed .history-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.scr-fear-and-greed .section-title{
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}
.scr-fear-and-greed .time-filters{
  display: flex;
  background-color: #1f3048;
  border-radius: 16px;
  padding: 3px;
  gap: 4px;
}
.scr-fear-and-greed .filter-btn{
  padding: 6px 10px;
  border-radius: 13px;
  font-size: 13px;
  color: #a9b7c8;
  cursor: pointer;
  line-height: 1;
  border: none;
  background: transparent;
  font-family: inherit;
}
.scr-fear-and-greed .filter-btn.active{
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
  font-weight: 600;
}
.scr-fear-and-greed .chart-area{
  position: relative;
  width: 380px;
  max-width: 100%;
  height: 140px;
  margin: 0 auto;
}
.scr-fear-and-greed .chart-layer{ position: absolute; }
.scr-fear-and-greed .chart-layer:nth-child(1){ left: 0px; top: 92px; width: 380px; height: 28px; }
.scr-fear-and-greed .chart-layer:nth-child(2){ left: 0px; top: 69.6px; width: 380px; height: 22.4px; }
.scr-fear-and-greed .chart-layer:nth-child(3){ left: 0px; top: 57.3px; width: 380px; height: 12.3px; }
.scr-fear-and-greed .chart-layer:nth-child(4){ left: 0px; top: 34.9px; width: 380px; height: 22.4px; }
.scr-fear-and-greed .chart-layer:nth-child(5){ left: 0px; top: 8px; width: 380px; height: 26.9px; }
.scr-fear-and-greed .chart-layer:nth-child(6){ left: 0px; top: 92px; width: 380px; height: 0px; }
.scr-fear-and-greed .chart-layer:nth-child(7){ left: 0px; top: 64px; width: 380px; height: 0px; }
.scr-fear-and-greed .chart-layer:nth-child(8){ left: 0px; top: 36px; width: 380px; height: 0px; }
/* the curve, its fill and the end dot are drawn from the real series */
.scr-fear-and-greed .chart-line{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.scr-fear-and-greed .x-axis{
  position: absolute;
  top: 126px;
  left: 0;
  width: 100%;
  height: 12px;
}
.scr-fear-and-greed .x-axis span{
  position: absolute;
  font-size: 12px;
  color: #75879c;
  top: 0;
}
.scr-fear-and-greed .x-axis span:nth-child(1){ left: 0; }
.scr-fear-and-greed .x-axis span:nth-child(2){ left: 50%; transform: translateX(-50%); }
.scr-fear-and-greed .x-axis span:nth-child(3){ left: auto; right: 0; }
.scr-fear-and-greed #section-scale{
  padding: 30px 16px 0;
}
.scr-fear-and-greed .section-title{
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}
.scr-fear-and-greed .scale-list{
  margin-top: 12px;
  display: flex;
  flex-direction: column;
}
.scr-fear-and-greed .scale-row{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(201, 212, 225, 0.16);
}
.scr-fear-and-greed .scale-row:last-child{
  border-bottom: none;
}
.scr-fear-and-greed .scale-left{
  display: flex;
  align-items: center;
  gap: 10px;
}
.scr-fear-and-greed .dot{
  width: 10px;
  height: 10px;
  border-radius: 5px;
}
.scr-fear-and-greed .bg-red{ background-color: #f2667a; }
.scr-fear-and-greed .bg-orange{ background-color: #f29a6a; }
.scr-fear-and-greed .bg-yellow{ background-color: #e9c46a; }
.scr-fear-and-greed .bg-green{ background-color: #9bd36e; }
.scr-fear-and-greed .bg-dark-green{ background-color: #3ecf8e; }
.scr-fear-and-greed .scale-name{
  font-size: 16px;
  color: #a9b7c8;
}
.scr-fear-and-greed .text-white{
  color: #ffffff;
}
.scr-fear-and-greed .scale-right{
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #75879c;
}
.scr-fear-and-greed .badge-now{
  background-color: rgba(233, 196, 106, 0.16);
  color: #e9c46a;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 10px;
}
.scr-fear-and-greed #section-explanation{
  padding: 30px 16px 0;
}
.scr-fear-and-greed .section-title{
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}
.scr-fear-and-greed .explanation-text{
  font-size: 14px;
  color: #a9b7c8;
  line-height: 1.5;
  margin-top: 12px;
}
.scr-fear-and-greed .tags-container{
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 16px;
}
.scr-fear-and-greed .tag{
  background-color: #1f3048;
  color: #d3dce7;
  font-size: 15px;
  padding: 6px 12px;
  border-radius: 15px;
}
.scr-fear-and-greed #section-notes{
  padding: 26px 16px 28px;
}
.scr-fear-and-greed .section-title{
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}
.scr-fear-and-greed .notes-list{
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-fear-and-greed .note-item{
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.scr-fear-and-greed .note-bullet{
  width: 6px;
  height: 6px;
  background-color: #51657e;
  border-radius: 3px;
  margin-top: 6px;
  flex-shrink: 0;
}
.scr-fear-and-greed .note-text{
  font-size: 13px;
  color: #75879c;
  line-height: 1.5;
}
/* figma re-sync */
.scr-fear-and-greed .page-title.page-title { font-size: 17px; }
.scr-fear-and-greed .page-title.page-title { font-weight: 700; }
.scr-fear-and-greed .gauge-score.gauge-score { font-size: 44px; }
.scr-fear-and-greed .gauge-status.gauge-status { font-size: 14px; }
.scr-fear-and-greed .gauge-timestamp.gauge-timestamp { font-size: 11px; }
.scr-fear-and-greed .stat-title.stat-title { font-size: 11px; }
.scr-fear-and-greed .stat-value.stat-value { font-size: 20px; }
.scr-fear-and-greed .stat-value.stat-value { font-weight: 600; }
.scr-fear-and-greed .stat-label.stat-label { font-size: 11px; }
.scr-fear-and-greed .stat-label.stat-label { color: #D3DCE7; }
.scr-fear-and-greed .section-title.section-title { font-size: 12px; }
.scr-fear-and-greed .section-title.section-title { font-weight: 700; }
.scr-fear-and-greed .filter-btn.filter-btn { font-size: 11px; }
.scr-fear-and-greed .filter-btn.filter-btn:not(.active) { color: #A9B7C8; }
.scr-fear-and-greed .scale-name.scale-name { font-size: 13px; }
.scr-fear-and-greed .scale-right.scale-right { font-size: 12px; }
.scr-fear-and-greed .scale-name.scale-name { color: #D3DCE7; }
.scr-fear-and-greed .badge-now.badge-now { font-size: 10px; }
.scr-fear-and-greed .explanation-text.explanation-text { font-size: 13px; }
.scr-fear-and-greed .tag.tag { font-size: 12px; }
.scr-fear-and-greed .section-title.section-title { color: #A9B7C8; }
.scr-fear-and-greed .note-text.note-text { font-size: 12px; }
.scr-fear-and-greed .note-text.note-text { line-height: 18px; }
`;

export default function FearAndGreed() {
  const { status, data } = useFearGreed();
  // 30D is the frame's default; the pills re-slice the same series, so
  // switching a range needs no new request
  const [range, setRange] = useState('30D');

  const now = data?.now || null;
  const value = now ? now.value : null;
  const series = data?.series?.slice(-(RANGES[range] || 30)) || [];
  const points = series.length > 1 ? chartPoints(series) : [];
  const last = points[points.length - 1] || null;
  const path = points.length ? chartPath(points) : '';

  // 0 sits at the left end of the arc, 50 straight up and 100 at the right
  const pointerAngle = value == null ? 0 : (value - 50) * 1.8;

  // the axis marks the first, middle and last day of the series
  const ticks = series.length
    ? [
        series[0],
        series[Math.floor((series.length - 1) / 2)],
        series[series.length - 1],
      ]
    : [];

  const timestamp =
    status === 'loading'
      ? 'Loading index data…'
      : now
        ? `Updated ${stampOf(now.at)} WIB`
        : 'Index data is not available yet';

  return (
    <div className="scr-fear-and-greed">
      <style>{css}</style>
      <section id="section-header">
        <header className="site-header">
          <button className="back-btn" data-back="1">
            <img src="/assets/img/f77e40de90.svg" alt="Back" />
          </button>
          <h1 className="page-title">{t('Fear & Greed')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-gauge">
        <div className="gauge-wrapper">
          <div className="gauge-visual">
            
            <img src="/assets/img/8b02fea99c.svg" className="gauge-arc arc-1" alt="" />
            <img src="/assets/img/79da848010.svg" className="gauge-arc arc-2" alt="" />
            <img src="/assets/img/d9b9e0cb54.svg" className="gauge-arc arc-3" alt="" />
            <img src="/assets/img/eb9d171ad2.svg" className="gauge-arc arc-4" alt="" />
            <img src="/assets/img/d3675161fd.svg" className="gauge-arc arc-5" alt="" />
            <img src="/assets/img/343a1b6079.svg" className="gauge-pointer" alt="" style={{ transform: `rotate(${pointerAngle}deg)`, transformOrigin: '9px 110.4px' }} />
            <div className="gauge-center-text">
              <div className="gauge-score" style={{ color: colorOf(now) }}>{valueOf(now)}</div>
              <div className="gauge-status">{labelOf(now)}</div>
            </div>
          </div>
          <div className="gauge-timestamp">{timestamp}</div>
        </div>
      </section>
      <section id="section-stats">
        <div className="stats-container">
          <div className="stat-block">
            <div className="stat-title">{t('Yesterday')}</div>
            <div className="stat-value" style={{ color: colorOf(data?.yesterday) }}>{valueOf(data?.yesterday)}</div>
            <div className="stat-label">{labelOf(data?.yesterday)}</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-block">
            <div className="stat-title">{t('Last Week')}</div>
            <div className="stat-value" style={{ color: colorOf(data?.week) }}>{valueOf(data?.week)}</div>
            <div className="stat-label">{labelOf(data?.week)}</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-block">
            <div className="stat-title">{t('Last Month')}</div>
            <div className="stat-value" style={{ color: colorOf(data?.month) }}>{valueOf(data?.month)}</div>
            <div className="stat-label">{labelOf(data?.month)}</div>
          </div>
        </div>
      </section>
      <section id="section-history">
        <div className="history-header">
          <h2 className="section-title">{t('History')}</h2>
          <div className="time-filters">
            {['7D', '30D', '1Y'].map((key) => (
              <button
                key={key}
                type="button"
                className={key === range ? 'filter-btn active' : 'filter-btn'}
                onClick={(event) => {
                  // the shell would otherwise swap the classes itself, without data
                  event.stopPropagation();
                  setRange(key);
                }}
              >
                {t(key)}
              </button>
            ))}
          </div>
        </div>
        <div className="chart-area">
          {/* the zone bands and grid lines stay exactly as the frame drew them;
              the curve, its fill and the end dot come from the real series */}
          <img src="/assets/img/7f43f9ca09.svg" className="chart-layer" alt="" />
          <img src="/assets/img/6693f9744c.svg" className="chart-layer" alt="" />
          <img src="/assets/img/1801e106a4.svg" className="chart-layer" alt="" />
          <img src="/assets/img/fe0f251182.svg" className="chart-layer" alt="" />
          <img src="/assets/img/8d7a1c16eb.svg" className="chart-layer" alt="" />
          <img src="/assets/img/d3605fb5c1.svg" className="chart-layer" alt="" />
          <img src="/assets/img/d3605fb5c1.svg" className="chart-layer" alt="" />
          <img src="/assets/img/d3605fb5c1.svg" className="chart-layer" alt="" />

          <svg className="chart-line" viewBox="0 0 380 140" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="fg-fill" x1="0" y1="8" x2="0" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C9D4E1" stopOpacity="0.18" />
                <stop offset="1" stopColor="#C9D4E1" stopOpacity="0" />
              </linearGradient>
            </defs>
            {path && <path d={`${path}L${last.x.toFixed(1)} ${CHART_BASE}L0 ${CHART_BASE}Z`} fill="url(#fg-fill)" />}
            {path && <path d={path} fill="none" stroke="#C9D4E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
            {last && <circle cx={Math.min(last.x, CHART_W - 5).toFixed(1)} cy={last.y.toFixed(1)} r="5" fill={colorOf(now)} stroke="#0F2036" strokeWidth="2" />}
          </svg>

          <div className="x-axis">
            {[0, 1, 2].map((index) => (
              <span key={index}>{ticks[index] ? tickOf(ticks[index].at) : ''}</span>
            ))}
          </div>
        </div>
      </section>
      <section id="section-scale">
        <h2 className="section-title">{t('What the Scale Means')}</h2>
        <div className="scale-list">
          {SCALE.map((row) => {
            const active = now?.label === row.name;
            return (
              <div className="scale-row" key={row.name}>
                <div className="scale-left">
                  <div className={`dot ${row.dot}`}></div>
                  <div className={active ? 'scale-name text-white' : 'scale-name'}>{row.name}</div>
                </div>
                <div className="scale-right">
                  <span className="scale-range">{row.range}</span>
                  {active && <span className="badge-now">{t('Now')}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section id="section-explanation">
        <h2 className="section-title">What Is Fear &amp; Greed?</h2>
        <p className="explanation-text">
          {t('An index that measures crypto market sentiment from 0 to 100. A low reading means the market is fearful, a high reading means the market is greedy.')}
        </p>
        <div className="tags-container">
          <span className="tag">{t('Volatility')}</span>
          <span className="tag">{t('Market volume')}</span>
          <span className="tag">{t('Social media')}</span>
          <span className="tag">{t('BTC dominance')}</span>
          <span className="tag">{t('Search trends')}</span>
        </div>
      </section>
      <section id="section-notes">
        <h2 className="section-title">{t('Notes')}</h2>
        <div className="notes-list">
          <div className="note-item">
            <div className="note-bullet"></div>
            <div className="note-text">The Fear &amp; Greed Index shows crypto market sentiment on a scale of 0–100. The value can change with market conditions and activity.</div>
          </div>
          <div className="note-item">
            <div className="note-bullet"></div>
            <div className="note-text">{t('Data is updated periodically and may differ from live market conditions. This index is for information only, not a recommendation to buy or sell crypto assets.')}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
