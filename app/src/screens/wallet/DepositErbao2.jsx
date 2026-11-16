// deposit-erbao-2 — the QRIS 1 receipt: renders the QR string Erbaopay returns
// together with its countdown
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { useAuth } from '../../lib/auth.jsx';
import { clock, payUrl, readOrder, useCountdown } from '../../lib/deposit.js';
import { dateTimeWIB, idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

const css = `
/* deposit-erbao-2 — QRIS 1 payment receipt */
.scr-deposit-erbao-2 {
  background: radial-gradient(circle at top right, rgba(78, 108, 142, 0.4) 0%, transparent 60%),
              linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%);
  min-height: 100cqh;
  display: flex;
  flex-direction: column;
}
.scr-deposit-erbao-2 *{
  box-sizing: border-box;
}
.scr-deposit-erbao-2 .header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 0;
}
.scr-deposit-erbao-2 .back-btn{
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
.scr-deposit-erbao-2 .back-btn img{
  width: 20px;
  height: 20px;
}
.scr-deposit-erbao-2 .header-title{
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  text-align: center;
  flex: 1;
}
.scr-deposit-erbao-2 .header-placeholder{
  width: 40px;
  height: 40px;
}
.scr-deposit-erbao-2 .instructions{
  padding: 18px 16px 0;
}
.scr-deposit-erbao-2 .instructions p{
  margin: 0;
  color: #a9b7c8;
  font-size: 13px;
  line-height: 1.5;
}
.scr-deposit-erbao-2 .payment-card-wrapper{
  padding: 16px;
}
.scr-deposit-erbao-2 .payment-card{
  background: linear-gradient(180deg, #1c2e46 0%, #16273d 100%);
  border-radius: 20px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.scr-deposit-erbao-2 .pc-header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.scr-deposit-erbao-2 .pc-channel{
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
}
.scr-deposit-erbao-2 .pc-timer{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.scr-deposit-erbao-2 .pc-timer-label{
  color: #8597ab;
  font-size: 10px;
}
.scr-deposit-erbao-2 .pc-timer-value{
  background-color: #24364e;
  border-radius: 10px;
  padding: 4px 10px;
  color: #9fc0ec;
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.scr-deposit-erbao-2 .pc-timer-value.is-expired{
  color: #f5808f;
}
.scr-deposit-erbao-2 .pc-qr{
  align-self: center;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 12px;
  display: flex;
}
.scr-deposit-erbao-2 .pc-action{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #24364e;
  border: 1px solid #33506f;
  border-radius: 14px;
  height: 44px;
  color: #dfe9f5;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
.scr-deposit-erbao-2 .pc-action:disabled{
  opacity: 0.55;
  cursor: default;
}
.scr-deposit-erbao-2 .pc-action img{
  width: 16px;
  height: 16px;
}
.scr-deposit-erbao-2 .pc-empty{
  margin: 0;
  color: #a9b7c8;
  font-size: 13px;
  text-align: center;
}
.scr-deposit-erbao-2 .pc-details{
  border-top: 1px solid #24364e;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scr-deposit-erbao-2 .pc-detail-row{
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.scr-deposit-erbao-2 .pc-detail-label{
  color: #a9b7c8;
  font-size: 13px;
}
.scr-deposit-erbao-2 .pc-detail-value{
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  text-align: right;
}
.scr-deposit-erbao-2 .security-section{
  padding: 4px 16px 0;
}
.scr-deposit-erbao-2 .security-banner{
  background: linear-gradient(90deg, #1d3656 0%, #162a44 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 16px 16px 16px 100px;
  position: relative;
  min-height: 91px;
}
.scr-deposit-erbao-2 .security-icon{
  position: absolute;
  left: 16px;
  top: -6px;
  width: 74px;
  height: 97px;
  object-fit: contain;
  z-index: 1;
}
.scr-deposit-erbao-2 .security-text-wrapper{
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  z-index: 2;
}
.scr-deposit-erbao-2 .security-title{
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}
.scr-deposit-erbao-2 .security-desc{
  color: #a9b7c8;
  font-size: 11px;
  line-height: 1.4;
}
.scr-deposit-erbao-2 .guide-section{
  padding: 20px 16px 0;
}
.scr-deposit-erbao-2 .guide-title{
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 12px;
}
.scr-deposit-erbao-2 .guide-list{
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scr-deposit-erbao-2 .guide-item{
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.scr-deposit-erbao-2 .guide-bullet{
  width: 6px;
  height: 6px;
  background-color: #8597ab;
  border-radius: 2px;
  margin-top: 6px;
  flex-shrink: 0;
}
.scr-deposit-erbao-2 .guide-text{
  margin: 0;
  color: #a9b7c8;
  font-size: 13px;
  line-height: 1.5;
}
.scr-deposit-erbao-2 .footer-section{
  margin-top: auto;
  padding: 20px 16px 24px;
}
.scr-deposit-erbao-2 .btn-primary{
  width: 100%;
  height: 52px;
  border-radius: 26px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c7d4e1 100%);
  color: #0c1a2d;
  border: none;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
}
`;

// every order on this screen is a QRIS code, so the guide never changes
const GUIDE = [
  'Buka aplikasi dompet digital atau m-banking yang mendukung QRIS, lalu pilih scan QR.',
  'Arahkan kamera ke QR Code di atas hingga terbaca.',
  'Periksa nominal pembayaran, lalu konfirmasi transaksi.',
  'Saldo akan masuk otomatis setelah pembayaran berhasil.',
];

export default function DepositErbao2() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();

  // the charge was opened on the amount screen, so this frame only renders it
  const orderNum = params.get('order') || '';
  const order = useMemo(() => readOrder(orderNum), [orderNum]);
  const [saving, setSaving] = useState(false);
  const qrRef = useRef(null);

  const deposit = Number(user?.balance_deposit) || 0;
  const payData = order?.pay_data || '';
  const isQr = order?.pay_data_type === 'QR_CODE' && Boolean(payData);
  const hosted = payUrl(order?.pay_url);
  const left = useCountdown(order?.expires_at);
  const expired = left === 0;

  // without an order there is nothing to pay, so the amount screen takes over
  useEffect(() => {
    if (!order) navigate('/send/erbao', { replace: true });
  }, [order, navigate]);

  // an answer without a QR still carries the provider page, and that page owns
  // the rest of the flow
  useEffect(() => {
    if (order && !isQr && hosted) window.location.assign(hosted);
  }, [order, isQr, hosted]);

  const downloadQr = async (event) => {
    event.stopPropagation();
    if (!qrRef.current || !isQr || saving) return;
    setSaving(true);
    try {
      const png = await toPng(qrRef.current, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      const anchor = document.createElement('a');
      anchor.href = png;
      anchor.download = `qris-${order.order_num || 'deposit'}.png`;
      anchor.click();
    } catch {
      // capture can fail when the browser refuses canvas access
    }
    setSaving(false);
  };

  if (!order) return <div className="scr-deposit-erbao-2" />;

  return (
    <div className="scr-deposit-erbao-2">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="back-btn" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/38162c7a69.svg" alt="" />
          </button>
          <h1 className="header-title">{t('Detail Pembayaran')}</h1>
          <div className="header-placeholder"></div>
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
              <span className="pc-channel">{t('QRIS 1')}</span>
              <div className="pc-timer">
                <span className="pc-timer-label">{t('Bayar sebelum')}</span>
                <span className={`pc-timer-value${expired ? ' is-expired' : ''}`}>
                  {left == null ? '—' : clock(left)}
                </span>
              </div>
            </div>
            {isQr && (
              <>
                <div className="pc-qr" ref={qrRef}>
                  {/* pay_data is the QR string Erbaopay built for this order */}
                  <QRCodeSVG
                    value={payData}
                    size={168}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#0c1a2d"
                  />
                </div>
                <button
                  type="button"
                  className="pc-action"
                  disabled={saving}
                  onClick={downloadQr}
                >
                  <img src="/assets/img/bf48dfeb38.svg" alt="" />
                  <span>{saving ? t('Menyiapkan…') : t('Download')}</span>
                </button>
              </>
            )}
            {!isQr && (
              <p className="pc-empty">{t('Kode QR belum tersedia, muat ulang halaman ini.')}</p>
            )}
            <div className="pc-details">
              <div className="pc-detail-row">
                <span className="pc-detail-label">{t('Total Penyetoran')}</span>
                <span className="pc-detail-value">{idr(order.amount)} IDR</span>
              </div>
              <div className="pc-detail-row">
                <span className="pc-detail-label">{t('Tanggal Transaksi')}</span>
                <span className="pc-detail-value">{dateTimeWIB(order.requested_at)}</span>
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
            {GUIDE.map((line) => (
              <div className="guide-item" key={line}>
                <div className="guide-bullet"></div>
                <p className="guide-text">{t(line)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="section-footer">
        <div className="footer-section">
          <button className="btn-primary" data-route="/riwayat/send">{t('Saya Sudah Bayar')}</button>
        </div>
      </section>
    </div>
  );
}
