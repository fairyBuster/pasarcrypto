// deposit-qris-1 — ported from the Figma export, typography re-synced to Figma
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { DEPOSIT_LIMITS, DEPOSIT_WALLET, saveOrder } from '../../lib/deposit.js';
import { idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// the same bounds the info card below spells out
const MIN_DEPOSIT = DEPOSIT_LIMITS.QRIS.min;
const MAX_DEPOSIT = DEPOSIT_LIMITS.QRIS.max;

const css = `
/* deposit-qris-1 — ported from Figma export, typography re-synced */
.scr-deposit-qris-1 { background: radial-gradient(55% 55% at 69% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-deposit-qris-1 *{
  box-sizing: border-box;
}
.scr-deposit-qris-1 #section-header{
  padding: 20px 16px 0;
}
.scr-deposit-qris-1 .header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}
.scr-deposit-qris-1 .back-btn{
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
.scr-deposit-qris-1 .title{
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}
.scr-deposit-qris-1 .spacer{
  width: 40px;
}
.scr-deposit-qris-1 #section-deposit-amount{
  padding: 22px 16px 0;
}
.scr-deposit-qris-1 .amount-label{
  font-size: 14px;
  color: #ffffff;
  line-height: 17px;
}
.scr-deposit-qris-1 .amount-input-wrapper{
  margin-top: 10px;
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
.scr-deposit-qris-1 .amount-input-wrapper:focus-within{
  border-color: #8badd9;
}
.scr-deposit-qris-1 .amount-input{
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
.scr-deposit-qris-1 .amount-input::placeholder{
  color: #51657e;
  font-size: 13px;
  font-weight: 500;
}
/* the Figma frame has no empty, error or disabled states */
.scr-deposit-qris-1 .amount-hint{
  margin-top: 8px;
  font-size: 12px;
  color: #75879c;
  line-height: 1.4;
}
.scr-deposit-qris-1 .amount-hint.is-error{
  color: #f5808f;
}
.scr-deposit-qris-1 .btn-primary:disabled{
  opacity: 0.6;
  cursor: default;
}
.scr-deposit-qris-1 .currency{
  font-size: 12px;
  color: #a9b7c8;
  font-weight: 600;
}
.scr-deposit-qris-1 #section-deposit-info{
  padding: 16px 16px 0;
}
.scr-deposit-qris-1 .info-list{
  background-color: #16263c;
  border-radius: 16px;
  padding: 12px 14px;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-deposit-qris-1 .info-list li{
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.scr-deposit-qris-1 .bullet{
  width: 5px;
  height: 5px;
  background-color: #8597ab;
  border-radius: 3px;
  margin-top: 7px;
  flex-shrink: 0;
}
.scr-deposit-qris-1 .info-list p{
  margin: 0;
  font-size: 12px;
  color: #d3dce7;
  line-height: 1.5;
}
.scr-deposit-qris-1 .info-list strong{
  color: #ffffff;
  font-weight: 600;
}
.scr-deposit-qris-1 #section-action{
  padding: 20px 16px 0;
}
.scr-deposit-qris-1 .btn-primary{
  width: 100%;
  height: 52px;
  border-radius: 26px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}
.scr-deposit-qris-1 #section-security{
  padding: 16px 16px 24px;
}
.scr-deposit-qris-1 .security-banner{
  background: linear-gradient(135deg, #1d3656 0%, #162a44 100%);
  border-radius: 16px;
  position: relative;
  min-height: 91px;
  padding: 19px 16px 19px 100px;
  display: flex;
  align-items: center;
}
.scr-deposit-qris-1 .security-icon{
  position: absolute;
  left: 16px;
  top: -6px;
  width: 74px;
  height: 97px;
  object-fit: contain;
}
.scr-deposit-qris-1 .security-text{
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-deposit-qris-1 .security-text h4{
  margin: 0;
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
}
.scr-deposit-qris-1 .security-text p{
  margin: 0;
  font-size: 10px;
  color: #a9b7c8;
  line-height: 1.4;
}
/* figma re-sync */
.scr-deposit-qris-1 .title.title { font-size: 17px; }
.scr-deposit-qris-1 .title.title { font-weight: 700; }
.scr-deposit-qris-1 .currency.currency { font-size: 13px; }
.scr-deposit-qris-1 .btn-primary.btn-primary { font-size: 15px; }
.scr-deposit-qris-1 .btn-primary.btn-primary { font-weight: 600; }
`;

export default function DepositQris1() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const nominal = Number(amount) || 0;
  const underMin = nominal > 0 && nominal < MIN_DEPOSIT;
  const overMax = nominal > MAX_DEPOSIT;
  const valid = nominal >= MIN_DEPOSIT && nominal <= MAX_DEPOSIT;
  const hint = underMin
    ? `Minimal isi ulang ${idr(MIN_DEPOSIT)} IDR`
    : overMax
      ? `Maksimal isi ulang ${idr(MAX_DEPOSIT)} IDR`
      : '';

  // the charge is created here, the confirmation screen only renders the
  // pay_data that comes back
  const submit = async (event) => {
    // App.jsx turns bare buttons into a toast, so the navigation is ours
    event.stopPropagation();
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    const res = await api.initiateDeposit({
      amount: nominal,
      method: 'QRIS',
      wallet_type: DEPOSIT_WALLET,
    });
    if (!res.ok || !res.data?.order_num) {
      setError(friendlyError(res.data, 'Gagal membuat pembayaran, coba lagi.'));
      setBusy(false);
      return;
    }
    saveOrder({ ...res.data, requested_at: new Date().toISOString() });
    navigate(`/send/qr/konfirmasi?order=${encodeURIComponent(res.data.order_num)}`);
  };

  return (
    <div className="scr-deposit-qris-1">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="back-btn" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/11e3727a0b.svg" alt="" />
          </button>
          <h1 className="title">{t('QRIS')}</h1>
          <div className="spacer"></div>
        </header>
      </section>
      <section id="section-deposit-amount">
        <div className="amount-label">{t('Total Penyetoran')}</div>
        <div className="amount-input-wrapper">
          <input
            type="text"
            inputMode="numeric"
            className="amount-input"
            placeholder={t('Masukkan nominal untuk pengisian')}
            value={amount ? idr(Number(amount)) : ''}
            onChange={(event) => {
              setAmount(event.target.value.replace(/\D/g, ''));
              setError('');
            }}
          />
          <span className="currency">{t('IDR')}</span>
        </div>
        {hint ? (
          <div className="amount-hint is-error">{hint}</div>
        ) : error ? (
          <div className="amount-hint is-error">{error}</div>
        ) : null}
      </section>
      <section id="section-deposit-info">
        <ul className="info-list">
          <li>
            <span className="bullet"></span>
            <p>{t('Minimum isi ulang')} <strong>{idr(MIN_DEPOSIT)} IDR</strong>{t(', maksimum')}<br /><strong>{idr(MAX_DEPOSIT)} IDR</strong></p>
          </li>
          <li>
            <span className="bullet"></span>
            <p><strong>{t('Tanpa biaya layanan')}</strong> {t('untuk setiap isi ulang')}</p>
          </li>
        </ul>
      </section>
      <section id="section-action">
        <button
          type="button"
          className="btn-primary"
          disabled={!valid || busy}
          onClick={submit}
        >
          {busy ? t('Memproses…') : t('Selanjutnya')}
        </button>
      </section>
      <section id="section-security">
        <div className="security-banner">
          <img src="/assets/img/9e084c1e66.png" alt="Security Icon" className="security-icon" />
          <div className="security-text">
            <h4>{t('Pembayaran aman & terlindungi')}</h4>
            <p>{t('Diproses oleh mitra pembayaran pihak ketiga resmi. Data dan transaksimu terenkripsi.')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
