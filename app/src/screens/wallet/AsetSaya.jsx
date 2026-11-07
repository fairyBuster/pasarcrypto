// aset-saya — ported from the Figma export, typography re-synced to Figma
import { useState } from 'react';
import BottomNav from '../../components/BottomNav.jsx';
import { dateTimeID, idr, initials, usdtApprox } from '../../lib/format.js';
import { mediaUrl } from '../../lib/media.js';
import { useAssets } from '../../lib/useAssets.js';
import { useUsdRate } from '../../lib/useUsdRate.js';
import { t } from '../../lib/i18n.js';

// a fixed product pays rupiah per day, so its rate is measured against the money
// put in; a percentage product already carries the rate the API sends
const aprPercent = (row) =>
  row.profit_type === 'fixed'
    ? Number(row.total_amount) > 0
      ? (Number(row.daily_profit) / Number(row.total_amount)) * 100
      : 0
    : Number(row.profit_rate) || 0;
const percentText = (value) => `${Number(value).toFixed(2).replace('.', ',')}%`;
const css = `
/* aset-saya — ported from Figma export, typography re-synced */
.scr-aset-saya { background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-aset-saya{
  width: 100%;
  padding: 0;
  min-height: 100cqh;
  background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%);
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  position: relative;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  /* clip, not hidden: hidden makes this a scroll container and traps the
     sticky bottom nav at the end of the page instead of the frame bottom */
  overflow-x: clip;
}
.scr-aset-saya *{
  box-sizing: border-box;
}
.scr-aset-saya .header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px 0;
}
.scr-aset-saya .header-title{
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.scr-aset-saya .header-btn{
  background: #1f3048;
  border: none;
  border-radius: 18px;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.scr-aset-saya .total-asset-container{
  display: flex;
  padding: 22px 16px 0;
  gap: 12px;
}
.scr-aset-saya .total-asset-left{
  flex: 1;
  display: flex;
  flex-direction: column;
}
.scr-aset-saya .asset-label{
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a9b7c8;
  font-size: 14px;
}
.scr-aset-saya .eye-btn{
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }
.scr-aset-saya .eye-btn img{
    width: 100%;
    height: 100%;
    display: block;
  }
.scr-aset-saya .eye-btn::before{
    content: '';
    position: absolute;
    inset: -10px;
  }
.scr-aset-saya .eye-btn:active{
    opacity: 0.7;
  }
/* the same glyph, slashed, while the figures are hidden */
.scr-aset-saya .eye-btn.is-hidden::after{
    content: '';
    position: absolute;
    left: -1px;
    right: -1px;
    top: 50%;
    height: 1.4px;
    margin-top: -0.7px;
    border-radius: 1px;
    background: #a9b7c8;
  }
/* hidden figures keep their footprint, so nothing reflows when they return */
.scr-aset-saya.is-hidden .asset-value .amount,
.scr-aset-saya.is-hidden .asset-equivalent,
.scr-aset-saya.is-hidden .asset-change,
.scr-aset-saya.is-hidden .breakdown-value .amount,
.scr-aset-saya.is-hidden .breakdown-percent,
.scr-aset-saya.is-hidden .holdings-header .text-green,
.scr-aset-saya.is-hidden .amount-val,
.scr-aset-saya.is-hidden .amount-profit,
.scr-aset-saya.is-hidden .holding-stats .text-green{
    filter: blur(7px);
    user-select: none;
  }
.scr-aset-saya .asset-value{
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 6px;
}
.scr-aset-saya .asset-value .amount{
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
}
.scr-aset-saya .asset-value .currency{
  font-size: 14px;
  color: #a9b7c8;
}
.scr-aset-saya .asset-equivalent{
  color: #8597ab;
  font-size: 12px;
  margin-top: 2px;
}
.scr-aset-saya .asset-change{
  color: #3ecf8e;
  font-size: 12px;
  margin-top: 10px;
}
.scr-aset-saya .asset-actions{
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
.scr-aset-saya .btn-withdraw{
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
  border: none;
  border-radius: 17px;
  height: 34px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}
.scr-aset-saya .btn-history{
  background: #1f3048;
  border: 1px solid rgba(201, 212, 225, 0.2);
  color: #e6ecf3;
  border-radius: 17px;
  height: 34px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
}
.scr-aset-saya .total-asset-right{
  width: 113px;
  display: flex;
  align-items: center;
}
.scr-aset-saya .wallet-img{
  width: 100%;
  height: auto;
  object-fit: contain;
}
.scr-aset-saya #section-balance-breakdown{
  padding: 20px 16px 0;
}
.scr-aset-saya .breakdown-container{
  border-top: 1px solid rgba(201, 212, 225, 0.18);
  border-bottom: 1px solid rgba(201, 212, 225, 0.18);
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.scr-aset-saya .breakdown-item{
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scr-aset-saya .breakdown-header{
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 12px;
}
.scr-aset-saya .breakdown-label{
  display: flex;
  gap: 6px;
  color: #a9b7c8;
}
.scr-aset-saya .breakdown-percent{
  color: #75879c;
}
.scr-aset-saya .breakdown-value{
  display: flex;
  gap: 4px;
}
.scr-aset-saya .breakdown-value .amount{
  color: #ffffff;
  font-weight: 700;
}
.scr-aset-saya .breakdown-value .currency{
  color: #8597ab;
  font-size: 10px;
}
.scr-aset-saya .progress-track{
  height: 5px;
  background-color: #22344b;
  border-radius: 3px;
  overflow: hidden;
}
.scr-aset-saya .progress-fill{
  height: 100%;
  border-radius: 3px;
}
.scr-aset-saya #section-holdings{
  padding: 28px 16px 100px;
}
.scr-aset-saya .holdings-header h2{
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
}
.scr-aset-saya .holdings-header p{
  font-size: 12px;
  color: #a9b7c8;
  margin: 0;
}
.scr-aset-saya .text-green{
  color: #3ecf8e;
}
.scr-aset-saya .holdings-filters{
  display: flex;
  gap: 8px;
  margin-top: 16px;
  /* the row is built from the catalogue's categories, so it can outgrow the
     412px frame; it scrolls sideways instead of wrapping */
  overflow-x: auto;
  scrollbar-width: none;
}
.scr-aset-saya .holdings-filters::-webkit-scrollbar{
  display: none;
}
.scr-aset-saya .filter-chip{
  background: #1f3048;
  color: #a9b7c8;
  border: none;
  border-radius: 16px;
  height: 32px;
  padding: 0 14px;
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}
.scr-aset-saya .filter-chip.active{
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
  font-weight: 700;
}
.scr-aset-saya .holding-card{
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scr-aset-saya .holding-card-top{
  display: flex;
  align-items: center;
  gap: 10px;
}
.scr-aset-saya .holding-icon{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: 1px dashed rgba(200, 212, 226, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #a9b7c8;
  position: relative;
  overflow: hidden;
}
/* the product image overlays the initials; a missing file keeps them visible */
.scr-aset-saya .holding-icon img{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.scr-aset-saya .holding-info{
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.scr-aset-saya .holding-name{
  font-size: 16px;
  font-weight: 700;
}
.scr-aset-saya .holding-type{
  font-size: 10px;
  color: #8597ab;
  display: flex;
  align-items: center;
  gap: 6px;
}
.scr-aset-saya .holding-type .divider{
  color: #3a5272;
}
.scr-aset-saya .holding-amount{
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.scr-aset-saya .amount-val{
  font-size: 14px;
  font-weight: 700;
}
.scr-aset-saya .amount-val .currency{
  font-size: 10px;
  color: #8597ab;
  font-weight: normal;
}
.scr-aset-saya .amount-profit{
  font-size: 10px;
  color: #3ecf8e;
}
.scr-aset-saya .holding-date{
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  margin-top: 4px;
}
.scr-aset-saya .holding-date .label{
  color: #8597ab;
}
.scr-aset-saya .holding-date .value{
  color: #e6ecf3;
}
.scr-aset-saya .holding-stats{
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #a9b7c8;
  margin-top: 4px;
}
.scr-aset-saya .holding-progress-text{
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #8597ab;
  margin-top: 4px;
}
.scr-aset-saya .center-icon-wrapper{
  width: 54px;
  height: 54px;
  border-radius: 27px;
  background: linear-gradient(180deg, #52a8ff 0%, #002040 100%);
  border: 4px solid #0d1b2e;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
}
.scr-aset-saya .center-icon-wrapper img{
  width: 26px;
  height: 26px;
}
/* figma re-sync */
.scr-aset-saya .header-title.header-title { font-size: 22px; }
.scr-aset-saya .amount.amount { font-size: 14px; }
.scr-aset-saya .amount.amount { font-weight: 600; }
.scr-aset-saya .currency.currency { font-size: 13px; }
.scr-aset-saya .currency.currency { color: #A9B7C8; }
.scr-aset-saya .asset-equivalent.asset-equivalent { font-size: 11px; }
/* only the picked chip flips to dark text; the export keeps the rest light */
.scr-aset-saya .filter-chip.active.filter-chip { color: #0C1A2D; }
.scr-aset-saya .holding-name.holding-name { font-size: 9px; }
.scr-aset-saya .holding-name.holding-name { font-weight: 600; }
.scr-aset-saya .amount-profit.amount-profit { font-size: 11px; }
/* the Figma frame draws one filled card; these are the data states it lacks */
.scr-aset-saya .holdings-state{
    margin-top: 20px;
    font-size: 12px;
    color: #8597ab;
}
.scr-aset-saya .holdings-state.error{
    color: #f5808f;
}
.scr-aset-saya .empty-state{
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: 8px;
}
.scr-aset-saya .empty-icon{
    width: 80px;
    height: auto;
    margin-bottom: 16px;
}
.scr-aset-saya .empty-state h3{
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
}
.scr-aset-saya .empty-state p{
    font-size: 13px;
    color: #8597ab;
    line-height: 1.4;
    max-width: 260px;
    margin-bottom: 24px;
}
.scr-aset-saya .btn-outline{
    background-color: #1f3048;
    border: 1px solid rgba(201, 212, 225, 0.2);
    color: #e6ecf3;
    height: 36px;
    padding: 0 20px;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 600;
}
`;

export default function AsetSaya() {
  const { active, deposit, available, balanceHold, interestTotal, todayIncome, status, error } =
    useAssets();
  // the API quotes the rupiah-per-USD rate the equivalent line is read at
  const usdRate = useUsdRate();
  // the breakdown rows are these three wallets, so their percentages are of
  // their own sum (the asset total also adds the running holdings)
  const shownTotal = deposit + available + balanceHold;
  const share = (part) => (shownTotal > 0 ? Math.round((part / shownTotal) * 100) : 0);
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
  // the chips are the product categories the investments endpoint returns; with
  // nothing picked the list shows every running holding
  const [category, setCategory] = useState('');
  const categories = [
    ...new Set(
      active
        .map((row) => (row.product_golongan || '').trim())
        .filter((name) => name && name !== '-')
    ),
  ];
  const rows = category
    ? active.filter((row) => (row.product_golongan || '').trim() === category)
    : active;

  return (
    <div className={`scr-aset-saya${balanceHidden ? ' is-hidden' : ''}`}>
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <h1 className="header-title">{t('Aset')}</h1>
          <button className="header-btn" data-route="/aset/portofolio">
            <img src="/assets/img/b31b5f48ed.svg" alt="Portofolio" />
          </button>
        </header>
      </section>
      <section id="section-total-asset">
        <div className="total-asset-container">
          <div className="total-asset-left">
            <div className="asset-label">
              <span>{t('Total Aset')}</span>
              <button
                type="button"
                className={`eye-btn${balanceHidden ? ' is-hidden' : ''}`}
                aria-label={balanceHidden ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
                aria-pressed={balanceHidden}
                onClick={toggleBalance}
              >
                <img src="/assets/img/efc32cb214.svg" alt="" />
              </button>
            </div>
            {/* the header prints the spendable balance; the breakdown below itemises the rest */}
            <div className="asset-value">
              <span className="amount" aria-hidden={balanceHidden || undefined}>{idr(available)}</span>
              <span className="currency">{t('IDR')}</span>
            </div>
            <div className="asset-equivalent" aria-hidden={balanceHidden || undefined}>{usdtApprox(available, usdRate)}</div>
            <div className="asset-change" aria-hidden={balanceHidden || undefined}>▲ Profit hari ini +{idr(todayIncome)} IDR</div>
            <div className="asset-actions">
              <button className="btn-withdraw" data-route="/draw">
                <img src="/assets/img/d4068b08e6.svg" alt="" />
                {t('Tarik')}
              </button>
              <button className="btn-history" data-route="/coin">
                <img src="/assets/img/db9506035c.svg" alt="" />
                {t('Riwayat')}
              </button>
            </div>
          </div>
          <div className="total-asset-right">
            <img src="/assets/img/d0c2833a90.png" alt="Wallet illustration" className="wallet-img" />
          </div>
        </div>
      </section>
      <section id="section-balance-breakdown">
        <div className="breakdown-container">
          <div className="breakdown-item">
            <div className="breakdown-header">
              <div className="breakdown-label">
                <span>{t('Saldo Isi Ulang')}</span>
                <span className="breakdown-percent">{share(deposit)}%</span>
              </div>
              <div className="breakdown-value">
                <span className="amount">{idr(deposit)}</span>
                <span className="currency">{t('IDR')}</span>
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${share(deposit)}%`, background: "linear-gradient(90deg, #7f93ab 0%, #f5f8fb 100%)" }}></div>
            </div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-header">
              <div className="breakdown-label">
                <span>{t('Saldo Tersedia')}</span>
                <span className="breakdown-percent">{share(available)}%</span>
              </div>
              <div className="breakdown-value">
                <span className="amount">{idr(available)}</span>
                <span className="currency">{t('IDR')}</span>
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${share(available)}%`, background: "linear-gradient(90deg, #2c4c80 0%, #8fb4ea 100%)" }}></div>
            </div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-header">
              <div className="breakdown-label">
                <span>{t('Sedang Digunakan')}</span>
                <span className="breakdown-percent">{share(balanceHold)}%</span>
              </div>
              <div className="breakdown-value">
                <span className="amount">{idr(balanceHold)}</span>
                <span className="currency">{t('IDR')}</span>
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${share(balanceHold)}%`, background: "linear-gradient(90deg, #1c8a5c 0%, #6ff0b4 100%)" }}></div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-holdings">
        <div className="holdings-header">
          <h2>{t('Coin Saya')}</h2>
          <p>{t('Total imbal hasil didapat')} <span className="text-green">+{idr(interestTotal)} IDR</span></p>
        </div>
        
        <div className="holdings-filters">
          <button
            type="button"
            className={`filter-chip${category ? '' : ' active'}`}
            aria-pressed={!category}
            onClick={(event) => {
              event.stopPropagation();
              setCategory('');
            }}
          >
            {t('Semua')}
          </button>
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              className={`filter-chip${category === name ? ' active' : ''}`}
              aria-pressed={category === name}
              onClick={(event) => {
                event.stopPropagation();
                setCategory(name);
              }}
            >
              {name}
            </button>
          ))}
        </div>

        {status === 'loading' && <p className="holdings-state">{t('Memuat holding…')}</p>}
        {status === 'error' && <p className="holdings-state error">{error}</p>}

        {status === 'ready' && rows.length === 0 && (
          <div className="empty-state">
            <img src="/assets/img/933eee66d5.png" alt="" className="empty-icon" />
            <h3>{category ? `Belum ada coin ${category.toLowerCase()}` : 'Belum ada coin aktif'}</h3>
            <p>{t('Coin yang aktif muncul di sini lengkap dengan imbal hasil dan sisa harinya.')}</p>
            <button className="btn-outline" data-route="/pasar">{t('Lihat Produk di Pasar')}</button>
          </div>
        )}

        {rows.map((row) => {
          const days = Number(row.duration_days) || 0;
          const remaining = Number(row.remaining_days) || 0;
          const passed = Math.max(0, days - remaining);
          const progress = days > 0 ? Math.min(100, Math.round((passed / days) * 100)) : 0;
          // the API sends the daily figure only, so the term total is daily × duration;
          // the stat prints the term total in rupiah, matching the frame
          const totalProfit = Number(row.daily_profit) * Math.max(1, days);
          return (
            <div className="holding-card" key={row.id}>
              <div className="holding-card-top">
                <div className="holding-icon">
                  <span>{initials(row.product_name)}</span>
                  {row.product_image && (
                    <img
                      src={mediaUrl(row.product_image)}
                      alt={row.product_name}
                      onError={(event) => {
                        // a missing media file leaves the initials underneath
                        event.currentTarget.remove();
                      }}
                    />
                  )}
                </div>
                <div className="holding-info">
                  <div className="holding-name">{row.product_name}</div>
                  <div className="holding-type">
                    <span>{row.product_specification && row.product_specification !== '-' ? row.product_specification : 'Produk'}</span>
                    {row.product_golongan && row.product_golongan !== '-' && (
                      <>
                        <span className="divider">|</span>
                        <span>{row.product_golongan}</span>
                      </>
                    )}
                    {Number(row.quantity) > 1 && (
                      <>
                        <span className="divider">|</span>
                        <span>{row.quantity} unit</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="holding-amount">
                  <div className="amount-val">{idr(row.total_amount)} <span className="currency">{t('IDR')}</span></div>
                  <div className="amount-profit">+{idr(row.total_claimed_profit)} IDR</div>
                </div>
              </div>
              
              <div className="holding-date">
                <img src="/assets/img/7faeebf0b5.svg" alt="" />
                <span className="label">{t('Tanggal beli')}</span>
                <span className="value">{dateTimeID(row.created_at)} WIB</span>
              </div>
              
              <div className="holding-stats">
                <div className="stat-item">
                  Est. APR {percentText(aprPercent(row))}
                </div>
                <div className="stat-item">
                  {t('Estimasi total returns')} <span className="text-green">+{idr(totalProfit)} IDR</span>
                </div>
              </div>
              
              <div className="holding-progress-text">
                <span>Berjalan</span>
                <span>Returns to {remaining} days</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #5a82bf 0%, #c9d4e1 100%)" }}></div>
              </div>
            </div>
          );
        })}
      </section>
      
      <BottomNav />
    </div>
  );
}
