// deposit-va2 — ported from the Figma export, typography re-synced to Figma
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx';
import { dateTimeWIB, idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

const css = `
/* deposit-va2 — ported from Figma export, typography re-synced */
.scr-deposit-va2 { background: radial-gradient(100% 100% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%),
              linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-deposit-va2 section{
  width: 100%;
  max-width: 412px;
  box-sizing: border-box;
}
.scr-deposit-va2 *{
  box-sizing: border-box;
}
.scr-deposit-va2 p,
.scr-deposit-va2 h1,
.scr-deposit-va2 h2,
.scr-deposit-va2 h3,
.scr-deposit-va2 h4,
.scr-deposit-va2 h5,
.scr-deposit-va2 h6{
  margin: 0;
}
.scr-deposit-va2 .header{
  display: flex;
  align-items: center;
  padding: 20px 16px 0;
  gap: 12px;
}
.scr-deposit-va2 .back-btn{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.scr-deposit-va2 .header-title{
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  text-align: center;
}
.scr-deposit-va2 .header-spacer{
  width: 40px;
  height: 40px;
}
.scr-deposit-va2 .instructions{
  padding: 18px 16px 0;
}
.scr-deposit-va2 .instructions p{
  color: #a9b7c8;
  font-size: 14px;
  line-height: 1.4;
}
.scr-deposit-va2 .payment-card-wrapper{
  padding: 14px 16px 0;
}
.scr-deposit-va2 .payment-card{
  background: linear-gradient(135deg, #24426a 0%, #1a3150 55%, #12233a 100%);
  border-radius: 22px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scr-deposit-va2 .pc-header{
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}
.scr-deposit-va2 .pc-bank-name{
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}
.scr-deposit-va2 .pc-timer-wrapper{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.scr-deposit-va2 .pc-timer-label{
  color: #a9b7c8;
  font-size: 10px;
}
.scr-deposit-va2 .pc-timer-value{
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 2px 8px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
}
.scr-deposit-va2 .pc-va-box{
  background-color: rgba(0, 0, 0, 0.22);
  border: 1px solid #3a5272;
  border-radius: 18px;
  width: 100%;
  padding: 24px 16px 32px;
  margin-top: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-deposit-va2 .pc-va-label{
  color: #a9b7c8;
  font-size: 12px;
}
.scr-deposit-va2 .pc-va-number{
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}
.scr-deposit-va2 .pc-copy-btn{
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  font-family: inherit;
  border-radius: 20px;
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: -20px;
  position: relative;
  z-index: 2;
  cursor: pointer;
  backdrop-filter: blur(4px);
}
.scr-deposit-va2 .pc-copy-text{
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
}
.scr-deposit-va2 .pc-details{
  width: 100%;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
}
.scr-deposit-va2 .pc-detail-row{
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px dashed rgba(201, 212, 225, 0.2);
}
.scr-deposit-va2 .pc-detail-label{
  color: #c3cfdd;
  font-size: 12px;
}
.scr-deposit-va2 .pc-detail-value{
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
}
.scr-deposit-va2 .security-section{
  padding: 16px 16px 0;
}
.scr-deposit-va2 .security-banner{
  background: linear-gradient(90deg, #1d3656 0%, #162a44 100%);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.scr-deposit-va2 .security-icon{
  width: 60px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
}
.scr-deposit-va2 .security-text-wrapper{
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.scr-deposit-va2 .security-title{
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
}
.scr-deposit-va2 .security-desc{
  color: #a9b7c8;
  font-size: 10px;
  line-height: 1.4;
}
.scr-deposit-va2 .guide-section{
  padding: 24px 16px 0;
}
.scr-deposit-va2 .guide-title{
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}
.scr-deposit-va2 .guide-list{
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scr-deposit-va2 .guide-item{
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.scr-deposit-va2 .guide-bullet{
  width: 6px;
  height: 6px;
  background-color: #8597ab;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.scr-deposit-va2 .guide-text{
  color: #a9b7c8;
  font-size: 12px;
  line-height: 1.5;
}
.scr-deposit-va2 #section-footer{
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.scr-deposit-va2 .footer-section{
  padding: 24px 16px;
}
.scr-deposit-va2 .btn-primary{
  background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
  border-radius: 26px;
  height: 52px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #0c1a2d;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
/* figma re-sync */
.scr-deposit-va2 .header-title.header-title { font-size: 17px; }
.scr-deposit-va2 .header-title.header-title { font-weight: 700; }
.scr-deposit-va2 .pc-timer-value.pc-timer-value { font-size: 13px; }
.scr-deposit-va2 .pc-timer-value.pc-timer-value { font-weight: 700; }
.scr-deposit-va2 .pc-va-label.pc-va-label { font-size: 11px; }
.scr-deposit-va2 .pc-va-number.pc-va-number { font-size: 22px; }
.scr-deposit-va2 .pc-copy-text.pc-copy-text { font-size: 13px; }
.scr-deposit-va2 .pc-copy-text.pc-copy-text { font-weight: 600; }
.scr-deposit-va2 .pc-detail-label.pc-detail-label { font-size: 14px; }
.scr-deposit-va2 .pc-detail-value.pc-detail-value { font-size: 14px; }
.scr-deposit-va2 .pc-detail-value.pc-detail-value { font-weight: 700; }
.scr-deposit-va2 .pc-detail-label.pc-detail-label { color: #FFFFFF; }
.scr-deposit-va2 .security-title.security-title { font-size: 13px; }
.scr-deposit-va2 .security-desc.security-desc { font-size: 11px; }
.scr-deposit-va2 .security-desc.security-desc { line-height: 16px; }
.scr-deposit-va2 .guide-title.guide-title { font-weight: 700; }
.scr-deposit-va2 .btn-primary.btn-primary { font-size: 15px; }
.scr-deposit-va2 .btn-primary.btn-primary { font-weight: 600; }
`;

// shown grouped for reading; the clipboard takes it bare so it can be pasted
// straight into a banking app
const VA_NUMBER = '1234 5678 9012 345';

export default function DepositVa2() {
  const [params] = useSearchParams();
  const { user } = useAuth();

  // same contract as the QRIS confirmation: the amount rides in the URL, the
  // rupiah balance comes from the account the session already hydrated
  const amount = Number(params.get('amount')) || 0;
  const deposit = Number(user?.balance_deposit) || 0;
  const [orderedAt] = useState(() => dateTimeWIB());

  return (
    <div className="scr-deposit-va2">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <div className="back-btn" data-back="1">
            <img src="/assets/img/38162c7a69.svg" alt="Back" />
          </div>
          <h1 className="header-title">{t('Detail Pembayaran')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-instructions">
        <div className="instructions">
          <p>{t('Ikuti instruksi di bawah ini untuk menyelesaikan penyetoran dana.')}</p>
        </div>
      </section>
      <section id="section-payment-card">
        <div className="payment-card-wrapper">
          <div className="payment-card">
            <div className="pc-header">
              <span className="pc-bank-name">{t('BRI Virtual Account')}</span>
              <div className="pc-timer-wrapper">
                <span className="pc-timer-label">{t('Bayar sebelum')}</span>
                <span className="pc-timer-value">23:59:12</span>
              </div>
            </div>
            
            <div className="pc-va-box">
              <span className="pc-va-label">{t('Nomor Virtual Account')}</span>
              <span className="pc-va-number">{VA_NUMBER}</span>
            </div>
            
            <button
              type="button"
              className="pc-copy-btn"
              data-copy={VA_NUMBER.replace(/\s/g, '')}
              aria-label={t('Salin Nomor Virtual Account')}
            >
              <img src="/assets/img/4ece3586ef.svg" alt="" />
              <span className="pc-copy-text">{t('Salin Nomor')}</span>
            </button>
            
            <div className="pc-details">
              <div className="pc-detail-row">
                <span className="pc-detail-label">{t('Total Penyetoran')}</span>
                <span className="pc-detail-value">{amount ? `${idr(amount)} IDR` : '—'}</span>
              </div>
              <div className="pc-detail-row">
                <span className="pc-detail-label">{t('Tanggal Transaksi')}</span>
                <span className="pc-detail-value">{orderedAt}</span>
              </div>
              <div className="pc-detail-row">
                <span className="pc-detail-label">{t('Saldo Isi Ulang Saat Ini')}</span>
                <span className="pc-detail-value">{idr(deposit)} IDR</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-security">
        <div className="security-section">
          <div className="security-banner">
            <img src="/assets/img/9e084c1e66.png" alt="Security Shield" className="security-icon" />
            <div className="security-text-wrapper">
              <span className="security-title">{t('Pembayaran aman & terlindungi')}</span>
              <span className="security-desc">{t('Diproses oleh mitra pembayaran pihak ketiga resmi. Data dan transaksimu terenkripsi.')}</span>
            </div>
          </div>
        </div>
      </section>
      <section id="section-guide">
        <div className="guide-section">
          <h2 className="guide-title">{t('Panduan Penyetoran')}</h2>
          <div className="guide-list">
            <div className="guide-item">
              <div className="guide-bullet"></div>
              <p className="guide-text">{t('Buka aplikasi mobile banking BRI, ATM, atau internet banking BRI.')}</p>
            </div>
            <div className="guide-item">
              <div className="guide-bullet"></div>
              <p className="guide-text">{t('Pilih menu Pembayaran, lalu pilih BRIVA.')}</p>
            </div>
            <div className="guide-item">
              <div className="guide-bullet"></div>
              <p className="guide-text">{t('Masukkan nomor Virtual Account di atas, lalu periksa nominalnya.')}</p>
            </div>
            <div className="guide-item">
              <div className="guide-bullet"></div>
              <p className="guide-text">{t('Konfirmasi pembayaran. Saldo akan masuk otomatis setelah berhasil.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-footer">
        <div className="footer-section">
          <button className="btn-primary" data-route="/aset">{t('Saya Sudah Bayar')}</button>
        </div>
      </section>
    </div>
  );
}
