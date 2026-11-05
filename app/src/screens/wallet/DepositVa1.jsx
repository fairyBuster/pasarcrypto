// deposit-va1 — ported from the Figma export, typography re-synced to Figma
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// the same bounds the info card below spells out
const MIN_DEPOSIT = 50000;
const MAX_DEPOSIT = 50000000;

const css = `
/* deposit-va1 — ported from Figma export, typography re-synced */
.scr-deposit-va1 { background: radial-gradient(55% 55% at 69.23% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), 
              linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-deposit-va1 *{
  box-sizing: border-box;
}
.scr-deposit-va1 .header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px 0;
    width: 100%;
  }
.scr-deposit-va1 .back-btn{
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
    transition: background-color 0.2s;
  }
.scr-deposit-va1 .back-btn:hover{
    background-color: #2a4060;
  }
.scr-deposit-va1 .back-btn img{
    width: 20px;
    height: 20px;
  }
.scr-deposit-va1 .header-title{
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    text-align: center;
    flex: 1;
  }
.scr-deposit-va1 .header-placeholder{
    width: 40px;
    height: 40px;
  }
.scr-deposit-va1 .deposit-container{
    padding: 22px 16px 0;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
.scr-deposit-va1 .deposit-label{
    color: #ffffff;
    font-size: 14px;
    margin-bottom: 10px;
  }
.scr-deposit-va1 .deposit-input-wrapper{
    background-color: #1f3048;
    border: 1px solid #5a82bf;
    border-radius: 18px;
    height: 56px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 18px;
    transition: border-color 0.15s ease;
  }
.scr-deposit-va1 .deposit-input-wrapper:focus-within{
    border-color: #8badd9;
  }
.scr-deposit-va1 .deposit-input{
    /* the field takes the rest of the row so the placeholder never gets clipped */
    flex: 1;
    min-width: 0;
    padding: 0;
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 20px;
    font-weight: 700;
    font-family: inherit;
  }
.scr-deposit-va1 .deposit-input::placeholder{
    color: #51657e;
    font-size: 13px;
    font-weight: 500;
  }
/* the Figma frame has no empty, error or disabled states */
.scr-deposit-va1 .amount-hint{
    margin-top: 8px;
    font-size: 12px;
    color: #75879c;
    line-height: 1.4;
  }
.scr-deposit-va1 .amount-hint.is-error{
    color: #f5808f;
  }
.scr-deposit-va1 .btn-primary:disabled{
    opacity: 0.6;
    cursor: default;
  }
.scr-deposit-va1 .deposit-currency{
    color: #a9b7c8;
    font-size: 14px;
    font-weight: 600;
  }
.scr-deposit-va1 .info-container{
    padding: 16px 16px 0;
    width: 100%;
  }
.scr-deposit-va1 .info-box{
    background-color: #16263c;
    border-radius: 16px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-deposit-va1 .info-item{
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
.scr-deposit-va1 .bullet-container{
    padding-top: 6px;
  }
.scr-deposit-va1 .bullet{
    width: 5px;
    height: 5px;
    background-color: #8597ab;
    border-radius: 3px;
  }
.scr-deposit-va1 .info-text{
    color: #d3dce7;
    font-size: 12px;
    margin: 0;
    line-height: 1.5;
  }
.scr-deposit-va1 .info-text strong{
    font-weight: 700;
    color: #ffffff;
  }
.scr-deposit-va1 .action-container{
    padding: 20px 16px 0;
    width: 100%;
  }
.scr-deposit-va1 .btn-primary{
    width: 100%;
    height: 52px;
    border-radius: 26px;
    background: linear-gradient(180deg, #f5f8fb 0%, #c7d4e1 100%);
    color: #0c1a2d;
    border: none;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.2s;
  }
.scr-deposit-va1 .btn-primary:hover{
    opacity: 0.9;
  }
.scr-deposit-va1 .security-container{
    padding: 16px 16px 24px;
    width: 100%;
    margin-top: 24px;
  }
.scr-deposit-va1 .security-banner{
    background: linear-gradient(90deg, #1d3656 0%, #162a44 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    padding: 16px 16px 16px 100px;
    position: relative;
    min-height: 91px;
  }
.scr-deposit-va1 .security-icon{
    position: absolute;
    left: 16px;
    top: -6px;
    width: 74px;
    height: 97px;
    object-fit: contain;
    z-index: 1;
  }
.scr-deposit-va1 .security-text-content{
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    z-index: 2;
  }
.scr-deposit-va1 .security-title{
    color: #ffffff;
    font-size: 13px;
    margin: 0;
    font-weight: 700;
  }
.scr-deposit-va1 .security-desc{
    color: #a9b7c8;
    font-size: 11px;
    margin: 0;
    line-height: 1.4;
  }
/* figma re-sync */
.scr-deposit-va1 .header-title.header-title { font-size: 17px; }
.scr-deposit-va1 .header-title.header-title { font-weight: 700; }
.scr-deposit-va1 .deposit-currency.deposit-currency { font-size: 13px; }
.scr-deposit-va1 .btn-primary.btn-primary { font-size: 15px; }
.scr-deposit-va1 .btn-primary.btn-primary { font-weight: 600; }
.scr-deposit-va1 .security-title.security-title { font-weight: 600; }
`;

export default function DepositVa1() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');

  const nominal = Number(amount) || 0;
  const underMin = nominal > 0 && nominal < MIN_DEPOSIT;
  const overMax = nominal > MAX_DEPOSIT;
  const valid = nominal >= MIN_DEPOSIT && nominal <= MAX_DEPOSIT;
  const hint = underMin
    ? `Minimal isi ulang ${idr(MIN_DEPOSIT)} IDR`
    : overMax
      ? `Maksimal isi ulang ${idr(MAX_DEPOSIT)} IDR`
      : '';

  return (
    <div className="scr-deposit-va1">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="back-btn" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/81d36ea048.svg" alt="" />
          </button>
          <h1 className="header-title">{t('BRI Virtual Account')}</h1>
          <div className="header-placeholder"></div>
        </header>
      </section>
      <section id="section-deposit">
        <div className="deposit-container">
          <label className="deposit-label">{t('Total Penyetoran')}</label>
          <div className="deposit-input-wrapper">
            <input
              type="text"
              inputMode="numeric"
              className="deposit-input"
              placeholder={t('Masukkan nominal untuk pengisian')}
              value={amount ? idr(Number(amount)) : ''}
              onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))}
            />
            <span className="deposit-currency">{t('IDR')}</span>
          </div>
          {hint && <div className="amount-hint is-error">{hint}</div>}
        </div>
      </section>
      <section id="section-info">
        <div className="info-container">
          <div className="info-box">
            <div className="info-item">
              <div className="bullet-container">
                <div className="bullet"></div>
              </div>
              <p className="info-text">{t('Minimum isi ulang')} <strong>{t('50.000 IDR')}</strong>{t(', maksimum')}<br /><strong>{t('50.000.000 IDR')}</strong></p>
            </div>
            <div className="info-item">
              <div className="bullet-container">
                <div className="bullet"></div>
              </div>
              <p className="info-text"><strong>{t('Tanpa biaya layanan')}</strong> {t('untuk setiap isi ulang')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-action">
        <div className="action-container">
          <button
            type="button"
            className="btn-primary"
            disabled={!valid}
            onClick={(event) => {
              // App.jsx turns bare buttons into a toast, so the navigation is ours
              event.stopPropagation();
              navigate(`/deposit/va/konfirmasi?amount=${nominal}`);
            }}
          >
            {t('Selanjutnya')}
          </button>
        </div>
      </section>
      <section id="section-security">
        <div className="security-container">
          <div className="security-banner">
            <img src="/assets/img/9e084c1e66.png" alt="Security Shield" className="security-icon" />
            <div className="security-text-content">
              <h3 className="security-title">{t('Pembayaran aman & terlindungi')}</h3>
              <p className="security-desc">{t('Diproses oleh mitra pembayaran pihak ketiga resmi. Data dan transaksimu terenkripsi.')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
