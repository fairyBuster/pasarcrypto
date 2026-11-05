// portofolio — ported from the Figma export, typography re-synced to Figma
import { idr } from '../../lib/format.js';
import { useAssets } from '../../lib/useAssets.js';
import { t } from '../../lib/i18n.js';
const css = `
/* portofolio — ported from Figma export, typography re-synced */
.scr-portofolio *{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
/* the frame centres the card in the viewport, not at the top of the page */
.scr-portofolio{
    min-height: 100cqh;
    display: flex;
    justify-content: center;
    align-items: center;
}
.scr-portofolio #section-portfolio-popup{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 20px;
  }
.scr-portofolio .portfolio-card{
    width: 100%;
    max-width: 320px;
    background: radial-gradient(circle at 72% 0%, rgba(127, 170, 230, 0.22) 0%, rgba(127, 170, 230, 0) 100%),
                linear-gradient(135deg, #24426a 0%, #1a3050 55%, #12233a 100%);
    border-radius: 24px;
    padding: 22px 20px 18px 20px;
    display: flex;
    flex-direction: column;
  }
.scr-portofolio .card-header{
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
.scr-portofolio .title{
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.5;
  }
.scr-portofolio .subtitle{
    font-size: 12px;
    color: #a9b7c8;
    margin-top: 4px;
  }
.scr-portofolio .chart-section{
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    margin-top: 18px;
  }
.scr-portofolio .chart-image{
    width: 130px;
    height: 98px;
    display: block;
  }
.scr-portofolio .chart-legend{
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }
.scr-portofolio .legend-item{
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }
.scr-portofolio .dot{
    width: 8px;
    height: 8px;
    border-radius: 4px;
    flex-shrink: 0;
  }
.scr-portofolio .dot-stablecoin{
    background: linear-gradient(135deg, #f5f8fb 0%, #a7b5c7 100%);
  }
.scr-portofolio .dot-terkunci{
    background: linear-gradient(135deg, #6ff0b4 0%, #1c8a5c 100%);
  }
.scr-portofolio .dot-fleksibel{
    background: linear-gradient(135deg, #8fb4ea 0%, #2c4c80 100%);
  }
.scr-portofolio .legend-label{
    color: #d3dce7;
    flex: 1;
  }
.scr-portofolio .legend-value{
    color: #d3dce7;
    font-weight: 400;
  }
.scr-portofolio .details-section{
    display: flex;
    flex-direction: column;
    margin-top: 16px;
  }
.scr-portofolio .detail-row{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 11px 0;
    border-top: 1px solid rgba(201, 212, 225, 0.18);
    font-size: 12px;
  }
.scr-portofolio .detail-label{
    color: #a9b7c8;
  }
.scr-portofolio .detail-value{
    color: #ffffff;
    font-weight: 600;
  }
.scr-portofolio .detail-value.highlight{
    color: #3ecf8e;
  }
.scr-portofolio .card-footer{
    display: flex;
    justify-content: flex-end;
    margin-top: 14px;
  }
.scr-portofolio .btn-close{
    background: linear-gradient(to right, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    border: none;
    border-radius: 18px;
    height: 36px;
    padding: 0 22px;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease;
  }
.scr-portofolio .btn-close:hover{
    opacity: 0.9;
  }
/* figma re-sync */
.scr-portofolio .title.title { font-size: 17px; }
.scr-portofolio .title.title { font-weight: 700; }
.scr-portofolio .legend-value.legend-value { font-weight: 600; }
.scr-portofolio .detail-label.detail-label { color: #D3DCE7; }
.scr-portofolio .detail-value.detail-value { color: #3ECF8E; }
.scr-portofolio .btn-close.btn-close { font-size: 13px; }
`;

export default function Portofolio() {
  const { claimed, investments } = useAssets();
  // "Total coin" sums every purchase ever made, not only the running holdings;
  // the three category rows below use the same all-status base
  const boughtTotal = investments.reduce(
    (sum, row) => sum + (Number(row.total_amount) || 0),
    0,
  );
  // the three product categories the Pasar chips use, in their fixed design
  // order; dot colours keep the Figma gradients of the old bucket legend
  const CATEGORIES = ['Steady Returns', 'Flash Earn', 'Special Earn'];
  const DOT_CLASS = ['dot-stablecoin', 'dot-terkunci', 'dot-fleksibel'];
  const legend = CATEGORIES.map((label, i) => ({
    key: `cat${i}`,
    label,
    dot: DOT_CLASS[i],
    value: investments.reduce(
      (sum, row) =>
        (row.product_golongan || '').trim() === label
          ? sum + (Number(row.total_amount) || 0)
          : sum,
      0,
    ),
  }));
  // the legend splits the bought total, so percentages use that same base
  const pct = (part) =>
    boughtTotal > 0 ? `${((part / boughtTotal) * 100).toFixed(1).replace('.', ',')}%` : '0%';

  return (
    <div className="scr-portofolio">
      <style>{css}</style>
      <section id="section-portfolio-popup">
        <div className="portfolio-card">
          <header className="card-header">
            <h2 className="title">{t('Portofolio')}</h2>
            <p className="subtitle">{t('Ringkasan coin kamu saat ini')}</p>
          </header>

          <div className="chart-section">
            <img src="/assets/img/f5ddef7416.svg" alt="Portfolio Chart" className="chart-image" />
            <div className="chart-legend">
              {legend.map((item) => (
                <div className="legend-item" key={item.key}>
                  <div className={`dot ${item.dot}`}></div>
                  <span className="legend-label">{item.label}</span>
                  <span className="legend-value">{pct(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="details-section">
            <div className="detail-row">
              <span className="detail-label">{t('Total coin')}</span>
              <span className="detail-value">{idr(boughtTotal)} IDR</span>
            </div>
            {legend.map((item) => (
              <div className="detail-row" key={item.key}>
                <span className="detail-label">{item.label}</span>
                <span className="detail-value">{idr(item.value)} IDR</span>
              </div>
            ))}
            <div className="detail-row">
              <span className="detail-label">{t('Total imbal hasil')}</span>
              <span className="detail-value highlight">+{idr(claimed)} IDR</span>
            </div>
          </div>

          <footer className="card-footer">
            <button className="btn-close" data-back="1">{t('Tutup')}</button>
          </footer>
        </div>
      </section>
    </div>
  );
}
