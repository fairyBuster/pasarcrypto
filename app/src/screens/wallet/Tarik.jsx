// tarik — ported from the Figma export, typography re-synced to Figma
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { idr, maskAccount } from '../../lib/format.js';
import { useWithdraw } from '../../lib/useWithdraw.js';
import { t } from '../../lib/i18n.js';
const css = `
/* tarik — ported from Figma export, typography re-synced */
.scr-tarik .app-container{
  max-width: 412px;
  width: 100%;
  min-height: 100cqh;
  background: linear-gradient(180deg, #0C1A2D 0%, #13263D 30%, #0F2036 70%, #0A1626 100%);
  position: relative;
  overflow: hidden;
  color: #ffffff;
  box-sizing: border-box;
}
.scr-tarik .content-layer{
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-height: 100cqh;
}
.scr-tarik *{
  box-sizing: border-box;
}
/* the export anchored the art to its .app-container; the JSX keeps the root
   bare, so the root takes that positioning back */
.scr-tarik{
  position: relative;
  min-height: 100cqh;
  /* clip, not hidden: hidden would make this a scroll container */
  overflow: clip;
}
/* the export wrapped the screen in a .content-layer above this art; the JSX
   keeps the sections bare, so they get the stacking order instead */
.scr-tarik .bg-layer{
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.scr-tarik > section{
  position: relative;
  z-index: 1;
}
.scr-tarik .bg-coins{
  position: absolute;
  top: 0;
  right: 0;
  width: 203px;
  height: 332px;
  object-fit: cover;
  opacity: 0.8;
}
.scr-tarik .top-header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 0;
  height: 60px;
}
.scr-tarik .btn-icon{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0;
}
.scr-tarik .page-title{
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
  flex: 1;
  text-align: center;
}
.scr-tarik .header-spacer{
  width: 40px;
  height: 40px;
}
.scr-tarik .history-container{
  padding: 18px 16px 0;
}
.scr-tarik .history-card{
  display: flex;
  align-items: center;
  background-color: #16263c;
  border-radius: 16px;
  padding: 14px;
  text-decoration: none;
  gap: 12px;
}
.scr-tarik .history-icon-wrapper{
  width: 36px;
  height: 36px;
  background-color: #24364e;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.scr-tarik .history-label{
  flex: 1;
  color: #ffffff;
  font-size: 14px;
  font-weight: 400;
}
.scr-tarik .history-arrow{
  width: 16px;
  height: 16px;
}
.scr-tarik .balance-wrapper{
  padding: 24px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.scr-tarik .text-caption{
  font-size: 12px;
  margin-bottom: 4px;
}
.scr-tarik .text-light-blue{
  color: #c9d4e1;
}
.scr-tarik .text-muted{
  color: #8597ab;
}
.scr-tarik .balance-amount-row{
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.scr-tarik .balance-value{
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}
.scr-tarik .balance-currency{
  font-size: 14px;
  color: #c9d4e1;
  font-weight: 600;
}
.scr-tarik .destination-block{
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(201, 212, 225, 0.1);
}
.scr-tarik .destination-details{
  font-size: 14px;
  color: #ffffff;
  margin-top: 4px;
}
.scr-tarik .input-container{
  padding: 26px 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scr-tarik .input-label{
  color: #8597ab;
  font-size: 12px;
  margin-bottom: 12px;
}
.scr-tarik .input-field-wrapper{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid #5a82bf;
  padding-bottom: 8px;
  width: 260px;
  margin-bottom: 12px;
}
.scr-tarik .currency-prefix{
  color: #a9b7c8;
  font-size: 16px;
  font-weight: 600;
}
.scr-tarik .amount-input{
  /* the field takes the rest of the row; a fixed width cut the placeholder */
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  outline: none;
}
.scr-tarik .amount-input::placeholder{
  color: #51657e;
}
.scr-tarik .input-hint{
  color: #75879c;
  font-size: 10px;
  text-align: center;
}
.scr-tarik .details-container{
  padding: 26px 20px 0;
  display: flex;
  flex-direction: column;
}
.scr-tarik .detail-row{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}
.scr-tarik .detail-label{
  color: #a9b7c8;
  font-size: 12px;
}
.scr-tarik .detail-value{
  color: #ffffff;
  font-size: 12px;
}
.scr-tarik .total-row{
  border-top: 1px dashed rgba(201, 212, 225, 0.18);
  margin-top: 8px;
  padding-top: 16px;
}
.scr-tarik .detail-label-bold{
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}
.scr-tarik .detail-value-bold{
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}
.scr-tarik .action-container{
  padding: 24px 16px 0;
}
.scr-tarik .btn-primary{
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}
.scr-tarik .notes-container{
  padding: 14px 20px 0;
}
.scr-tarik .notes-title{
  color: #c9d4e1;
  font-size: 12px;
  font-weight: 400;
  margin: 0 0 4px 0;
}
.scr-tarik .notes-text{
  color: #8597ab;
  font-size: 10px;
  line-height: 1.5;
  margin: 0;
}
.scr-tarik .footer-container{
  padding: 24px 16px 40px;
  display: flex;
  justify-content: center;
  margin-top: auto;
}
.scr-tarik .trust-badge{
  display: flex;
  align-items: center;
  gap: 6px;
}
.scr-tarik .trust-badge span{
  color: #8597ab;
  font-size: 10px;
}
/* the Figma frame has no empty, error or disabled states */
.scr-tarik .input-hint--error{
  color: #f5808f;
}
.scr-tarik .destination-link{
  display: inline-block;
  margin-top: 4px;
  color: #a9c2e6;
  font-size: 13px;
  text-decoration: none;
}
.scr-tarik .btn-primary:disabled{
  opacity: 0.6;
  cursor: default;
}
/* figma re-sync */
.scr-tarik .page-title.page-title { font-size: 17px; }
.scr-tarik .page-title.page-title { font-weight: 700; }
.scr-tarik .history-label.history-label { font-weight: 500; }
.scr-tarik .balance-value.balance-value { font-size: 26px; }
.scr-tarik .balance-value.balance-value { line-height: 32px; }
.scr-tarik .balance-currency.balance-currency { font-size: 16px; }
.scr-tarik .balance-currency.balance-currency { color: #A9B7C8; }
.scr-tarik .text-caption.text-caption { font-size: 11px; }
.scr-tarik .input-hint.input-hint { font-size: 11px; }
.scr-tarik .detail-label.detail-label { font-size: 13px; }
.scr-tarik .detail-value.detail-value { font-size: 13px; }
.scr-tarik .detail-label-bold.detail-label-bold { font-size: 13px; }
.scr-tarik .detail-value-bold.detail-value-bold { font-size: 13px; }
.scr-tarik .notes-title.notes-title { font-weight: 600; }
`;

export default function Tarik() {
  const navigate = useNavigate();
  const { status, error, bank, wallet, feeFor } = useWithdraw();
  const [amount, setAmount] = useState('');

  const nominal = Number(amount) || 0;
  const min = bank?.min || 0;
  const max = bank?.max || 0;
  const fee = feeFor(nominal);
  const net = Math.max(0, nominal - fee);
  const underMin = min > 0 && nominal > 0 && nominal < min;
  const overMax = max > 0 && nominal > max;
  const overBalance = nominal > wallet;
  const valid = Boolean(bank) && nominal > 0 && !underMin && !overMax && !overBalance;

  const limits = [
    min > 0 ? `Min. ${idr(min)} IDR` : '',
    max > 0 ? `Maks. ${idr(max)} IDR` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  let hint = limits ? `${limits} per transaksi` : 'Masukkan nominal penarikan.';
  if (status === 'error') hint = error;
  else if (status === 'loading') hint = 'Memuat data penarikan…';
  else if (!bank) hint = 'Belum ada rekening tujuan. Tambahkan rekening bank dahulu.';
  else if (wallet < min) hint = `Saldo kamu belum mencapai batas minimum ${idr(min)} IDR.`;
  else if (underMin) hint = `Minimal penarikan ${idr(min)} IDR.`;
  else if (overBalance) hint = 'Nominal melebihi saldo tersedia.';
  else if (overMax) hint = `Maksimal penarikan ${idr(max)} IDR per transaksi.`;

  const invalid = status === 'ready' && nominal > 0 && (underMin || overMax || overBalance);

  return (
    <div className="scr-tarik">
      <style>{css}</style>
      <div className="bg-layer">
        <img src="/assets/img/501b0035e1.png" alt="Coins Background" className="bg-coins" />
      </div>
      <section id="section-header">
        <header className="top-header">
          <button className="btn-icon" aria-label={t('Back')} data-route="/home">
            <img src="/assets/img/f77e40de90.svg" alt="" />
          </button>
          <h1 className="page-title">{t('Tarik IDR')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-history">
        <div className="history-container">
          <a href="#" className="history-card" data-route="/riwayat/penarikan">
            <div className="history-icon-wrapper">
              <img src="/assets/img/ee43abaf76.svg" alt="" />
            </div>
            <span className="history-label">{t('Riwayat Penarikan')}</span>
            <img src="/assets/img/c252a02177.svg" alt="Arrow Right" className="history-arrow" />
          </a>
        </div>
      </section>
      <section id="section-balance">
        <div className="balance-wrapper">
          <div className="balance-block">
            <div className="text-caption text-light-blue">{t('Saldo tersedia untuk ditarik')}</div>
            <div className="balance-amount-row">
              <span className="balance-value">{status === 'ready' ? idr(wallet) : '—'}</span>
              <span className="balance-currency">{t('IDR')}</span>
            </div>
          </div>
          
          <div className="destination-block">
            <div className="text-caption text-muted">{t('Ditarik ke')}</div>
            {bank ? (
              <div className="destination-details">
                {/* /api/banks/user/ carries the name, the number and the holder;
                    a missing piece drops instead of leaving a dangling dot */}
                {[bank.bank_name || bank.bank_code, maskAccount(bank.account_number), bank.account_name]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            ) : (
              <>
                <div className="destination-details">
                  {status === 'error'
                    ? 'Gagal memuat rekening'
                    : status === 'ready'
                      ? 'Belum ada rekening tujuan'
                      : 'Memuat rekening…'}
                </div>
                {status === 'ready' && (
                  <a href="#" className="destination-link" data-route="/profil/bank">
                    {t('Tambah rekening bank')}
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </section>
      <section id="section-input">
        <div className="input-container">
          <div className="input-label">{t('Jumlah penarikan')}</div>
          <div className="input-field-wrapper">
            <span className="currency-prefix">{t('IDR')}</span>
            <input
              type="text"
              inputMode="numeric"
              className="amount-input"
              placeholder={t('Masukkan nominal')}
              value={amount ? idr(Number(amount)) : ''}
              onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className={`input-hint${invalid ? ' input-hint--error' : ''}`}>{hint}</div>
        </div>
      </section>
      <section id="section-details">
        <div className="details-container">
          <div className="detail-row">
            <span className="detail-label">{t('Biaya administrasi')}</span>
            <span className="detail-value">{idr(fee)} IDR</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('Estimasi proses')}</span>
            <span className="detail-value">
              {t('Maksimal 24 jam')}
            </span>
          </div>
          <div className="detail-row total-row">
            <span className="detail-label-bold">{t('Kamu terima')}</span>
            <span className="detail-value-bold">{idr(net)} IDR</span>
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
              event.stopPropagation();
              navigate(`/tarik/konfirmasi?amount=${nominal}`);
            }}
          >
            {t('Tarik Sekarang')}
          </button>
        </div>
      </section>
      <section id="section-notes">
        <div className="notes-container">
          <h3 className="notes-title">{t('Catatan')}</h3>
          <p className="notes-text">
            {t('Pastikan alamat dan jaringan penarikan yang dipilih sudah benar sebelum melanjutkan transaksi. Penarikan akan diproses setelah melalui verifikasi sistem dan dapat membutuhkan waktu sesuai kondisi jaringan blockchain serta metode penarikan yang digunakan.')}<br />
            {t('Transaksi yang telah berhasil diproses tidak dapat dibatalkan. Pastikan seluruh informasi penarikan sudah sesuai untuk menghindari kesalahan pengiriman aset.')}
          </p>
        </div>
      </section>
      <section id="section-footer">
        <div className="footer-container">
          <div className="trust-badge">
            <img src="/assets/img/c18210cf7f.svg" alt="Shield Icon" />
            <span>{t('Diproses mitra pembayaran resmi · Transaksi terenkripsi')}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
