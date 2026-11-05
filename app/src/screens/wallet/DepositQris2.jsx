// deposit-qris-2 — ported from the Figma export, typography re-synced to Figma
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx';
import { dateTimeWIB, idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

const css = `
/* deposit-qris-2 — ported from Figma export, typography re-synced */
.scr-deposit-qris-2 { background: radial-gradient(circle at top right, rgba(78, 108, 142, 0.4) 0%, transparent 60%), linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-deposit-qris-2 *{
  box-sizing: border-box;
}
.scr-deposit-qris-2 #section-header .header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px 0;
}
.scr-deposit-qris-2 #section-header .back-btn{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.scr-deposit-qris-2 #section-header .page-title{
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}
.scr-deposit-qris-2 #section-header .header-placeholder{
  width: 40px;
}
.scr-deposit-qris-2 #section-hero .hero-instruction{
  padding: 18px 16px 0;
}
.scr-deposit-qris-2 #section-hero .hero-instruction p{
  color: #a9b7c8;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
}
.scr-deposit-qris-2 #section-hero .qr-card-wrapper{
  padding: 14px 16px 0;
}
.scr-deposit-qris-2 #section-hero .qr-card{
  background: linear-gradient(180deg, #24426a 0%, #1a3150 55%, #12233a 100%);
  border-radius: 22px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scr-deposit-qris-2 #section-hero .qr-timer-row{
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.scr-deposit-qris-2 #section-hero .timer-label{
  color: #a9b7c8;
  font-size: 12px;
}
.scr-deposit-qris-2 #section-hero .timer-pill{
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}
.scr-deposit-qris-2 #section-hero .qr-box-container{
  background-color: #ffffff;
  padding: 16px 12px;
  border-radius: 16px;
  width: 200px;
  margin-bottom: 14px;
}
.scr-deposit-qris-2 #section-hero .qr-box{
  border: 2px dashed #b8c5d5;
  border-radius: 8px;
  width: 176px;
  height: 176px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}
.scr-deposit-qris-2 #section-hero .qr-box span{
  color: #8597ab;
  font-size: 14px;
  font-weight: 700;
}
.scr-deposit-qris-2 #section-hero .download-btn{
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 20px;
  height: 40px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 24px;
}
.scr-deposit-qris-2 #section-hero .payment-details{
  width: 100%;
}
.scr-deposit-qris-2 #section-hero .detail-row{
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px dashed rgba(201, 212, 225, 0.18);
}
.scr-deposit-qris-2 #section-hero .detail-label{
  color: #c3cfdd;
  font-size: 14px;
}
.scr-deposit-qris-2 #section-hero .detail-value{
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}
.scr-deposit-qris-2 #section-hero .detail-row.highlight .detail-label{
  color: #ffffff;
  font-weight: 700;
}
.scr-deposit-qris-2 #section-security .security-banner-wrapper{
  padding: 14px 16px 0;
}
.scr-deposit-qris-2 #section-security .security-banner{
  background: linear-gradient(90deg, #1d3656 0%, #162a44 100%);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.scr-deposit-qris-2 #section-security .security-img{
  width: 74px;
  height: 97px;
  object-fit: contain;
  position: relative;
  top: -6px;
  margin-bottom: -6px;
  flex-shrink: 0;
}
.scr-deposit-qris-2 #section-security .security-text h4{
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}
.scr-deposit-qris-2 #section-security .security-text p{
  margin: 0;
  color: #a9b7c8;
  font-size: 12px;
  line-height: 1.4;
}
.scr-deposit-qris-2 #section-guide .guide-wrapper{
  padding: 20px 16px;
}
.scr-deposit-qris-2 #section-guide .guide-title{
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #ffffff;
}
.scr-deposit-qris-2 #section-guide .guide-list{
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scr-deposit-qris-2 #section-guide .guide-list li{
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.scr-deposit-qris-2 #section-guide .bullet{
  width: 6px;
  height: 6px;
  background-color: #8597ab;
  border-radius: 2px;
  margin-top: 6px;
  flex-shrink: 0;
}
.scr-deposit-qris-2 #section-guide .guide-list p{
  margin: 0;
  color: #a9b7c8;
  font-size: 14px;
  line-height: 1.4;
}
.scr-deposit-qris-2 #section-footer{
  margin-top: auto;
}
.scr-deposit-qris-2 #section-footer .footer-wrapper{
  padding: 20px 16px 24px;
}
.scr-deposit-qris-2 #section-footer .primary-btn{
  width: 100%;
  height: 52px;
  border-radius: 26px;
  background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
  border: none;
  color: #0c1a2d;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* figma re-sync */
.scr-deposit-qris-2 .page-title.page-title { font-size: 17px; }
.scr-deposit-qris-2 .timer-label.timer-label { font-size: 10px; }
.scr-deposit-qris-2 .timer-pill.timer-pill { font-size: 13px; }
.scr-deposit-qris-2 .detail-label.detail-label { font-size: 13px; }
.scr-deposit-qris-2 .detail-label.detail-label { font-weight: 600; }
.scr-deposit-qris-2 .detail-label.detail-label { color: #C3CFDD; }
.scr-deposit-qris-2 .detail-value.detail-value { font-size: 13px; }
.scr-deposit-qris-2 .guide-title.guide-title { font-size: 14px; }
.scr-deposit-qris-2 .primary-btn.primary-btn { font-size: 15px; }
.scr-deposit-qris-2 .primary-btn.primary-btn { font-weight: 600; }
`;

export default function DepositQris2() {
  const [params] = useSearchParams();
  const { user } = useAuth();

  // the amount arrives from the previous screen; the balance follows the account
  const amount = Number(params.get('amount')) || 0;
  const deposit = Number(user?.balance_deposit) || 0;
  const [orderedAt] = useState(() => dateTimeWIB());

  return (
    <div className="scr-deposit-qris-2">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="back-btn" data-back="1">
            <img src="/assets/img/38162c7a69.svg" alt="Back" />
          </button>
          <h1 className="page-title">{t('Detail Pembayaran')}</h1>
          <div className="header-placeholder"></div>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero-instruction">
          <p>{t('Ikuti instruksi di bawah ini untuk menyelesaikan penyetoran dana.')}</p>
        </div>
        <div className="qr-card-wrapper">
          <div className="qr-card">
            <div className="qr-timer-row">
              <div className="timer-label">{t('Bayar sebelum')}</div>
              <div className="timer-pill">00:14:56</div>
            </div>
            <div className="qr-box-container">
              <div className="qr-box">
                <span>{t('QR CODE')}</span>
              </div>
            </div>
            <button className="download-btn">
              <img src="/assets/img/bf48dfeb38.svg" alt="Download" />
              <span>{t('Download')}</span>
            </button>
            <div className="payment-details">
              <div className="detail-row">
                <span className="detail-label">{t('Total Penyetoran')}</span>
                <span className="detail-value">{amount ? `${idr(amount)} IDR` : '—'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('Tanggal Transaksi')}</span>
                <span className="detail-value">{orderedAt}</span>
              </div>
              <div className="detail-row highlight">
                <span className="detail-label">{t('Saldo Isi Ulang Saat Ini')}</span>
                <span className="detail-value">{idr(deposit)} IDR</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-security">
        <div className="security-banner-wrapper">
          <div className="security-banner">
            <img src="/assets/img/9e084c1e66.png" alt="Security" className="security-img" />
            <div className="security-text">
              <h4>{t('Pembayaran aman & terlindungi')}</h4>
              <p>{t('Diproses oleh mitra pembayaran pihak ketiga resmi. Data dan transaksimu terenkripsi.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-guide">
        <div className="guide-wrapper">
          <h3 className="guide-title">{t('Panduan Penyetoran')}</h3>
          <ul className="guide-list">
            <li>
              <div className="bullet"></div>
              <p>{t('Buka aplikasi dompet digital atau mobile banking yang mendukung QRIS, lalu pilih scan QR.')}</p>
            </li>
            <li>
              <div className="bullet"></div>
              <p>{t('Arahkan kamera ke QR Code di atas hingga terbaca.')}</p>
            </li>
            <li>
              <div className="bullet"></div>
              <p>{t('Periksa nominal pembayaran, lalu konfirmasi transaksi.')}</p>
            </li>
            <li>
              <div className="bullet"></div>
              <p>{t('Saldo akan masuk otomatis setelah pembayaran berhasil.')}</p>
            </li>
          </ul>
        </div>
      </section>
      <section id="section-footer">
        <div className="footer-wrapper">
          <button className="primary-btn" data-route="/aset">{t('Saya Sudah Bayar')}</button>
        </div>
      </section>
    </div>
  );
}
