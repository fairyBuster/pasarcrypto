// konfirmasi-pembelian — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { dateID, idr, orderDailyProfit, rateValue } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';
const css = `
/* konfirmasi-pembelian — ported from Figma export, typography re-synced */
.scr-konfirmasi-pembelian *{
  box-sizing: border-box;
}
.scr-konfirmasi-pembelian .modal-overlay{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100cqh;
    padding: 20px;
    background-color: #111111;
  }
.scr-konfirmasi-pembelian .modal-card{
    width: 100%;
    max-width: 320px;
    background: 
      radial-gradient(100% 100% at 50% 0%, rgba(127, 170, 230, 0.22) 0%, rgba(127, 170, 230, 0) 100%),
      linear-gradient(180deg, #24426A 0%, #1A3150 55%, #12233A 100%);
    border-radius: 24px;
    padding: 22px 20px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  }
.scr-konfirmasi-pembelian .modal-header{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
.scr-konfirmasi-pembelian .modal-title{
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 4px 0;
    text-align: center;
  }
.scr-konfirmasi-pembelian .modal-subtitle{
    font-size: 12px;
    color: #a9b7c8;
    text-align: center;
    margin: 0;
    line-height: 1.5;
  }
.scr-konfirmasi-pembelian .modal-amount-section{
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
.scr-konfirmasi-pembelian .amount-label{
    font-size: 12px;
    color: #a9b7c8;
    margin-bottom: 5px;
  }
.scr-konfirmasi-pembelian .amount-value-wrapper{
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
.scr-konfirmasi-pembelian .amount-value{
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.2;
  }
.scr-konfirmasi-pembelian .amount-currency{
    font-size: 12px;
    font-weight: 700;
    color: #a9b7c8;
  }
.scr-konfirmasi-pembelian .modal-details{
    width: 100%;
    margin-top: 16px;
    display: flex;
    flex-direction: column;
  }
.scr-konfirmasi-pembelian .detail-row{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 0;
    border-bottom: 1px solid rgba(201, 212, 225, 0.18);
  }
.scr-konfirmasi-pembelian .detail-row:last-child{
    border-bottom: none;
  }
.scr-konfirmasi-pembelian .detail-label{
    font-size: 12px;
    color: #a9b7c8;
  }
.scr-konfirmasi-pembelian .detail-value{
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
    text-align: right;
  }
.scr-konfirmasi-pembelian .text-green{
    color: #3ecf8e;
  }
.scr-konfirmasi-pembelian .modal-actions{
    width: 100%;
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
.scr-konfirmasi-pembelian .btn-primary{
    width: 100%;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(180deg, #F5F8FB 0%, #C9D4E1 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #0c1a2d;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }
.scr-konfirmasi-pembelian .btn-primary:active,
.scr-konfirmasi-pembelian .btn-primary:hover{
    opacity: 0.9;
  }
.scr-konfirmasi-pembelian .btn-secondary{
    margin-top: 12px;
    color: #a9b7c8;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    padding: 4px 8px;
    transition: color 0.2s ease;
  }
.scr-konfirmasi-pembelian .btn-secondary:active,
.scr-konfirmasi-pembelian .btn-secondary:hover{
    color: #ffffff;
  }
/* figma re-sync */
.scr-konfirmasi-pembelian .modal-title.modal-title { font-size: 17px; }
.scr-konfirmasi-pembelian .amount-label.amount-label { font-size: 11px; }
.scr-konfirmasi-pembelian .amount-value.amount-value { font-weight: 500; }
.scr-konfirmasi-pembelian .amount-value.amount-value { line-height: 36px; }
.scr-konfirmasi-pembelian .amount-currency.amount-currency { font-size: 13px; }
.scr-konfirmasi-pembelian .amount-currency.amount-currency { font-weight: 600; }
.scr-konfirmasi-pembelian .detail-label.detail-label { font-size: 13px; }
.scr-konfirmasi-pembelian .detail-value.detail-value { font-size: 13px; }
.scr-konfirmasi-pembelian .detail-value.detail-value { color: #3ECF8E; }
.scr-konfirmasi-pembelian .btn-primary.btn-primary { font-weight: 600; }
.scr-konfirmasi-pembelian .btn-secondary.btn-secondary { font-size: 13px; }
.scr-konfirmasi-pembelian .btn-secondary.btn-secondary { font-weight: 600; }
.scr-konfirmasi-pembelian .btn-secondary.btn-secondary { color: #A9B7C8; }
/* the Figma frame has no error / disabled state */
.scr-konfirmasi-pembelian .modal-error{
    margin: 0;
    width: 100%;
    text-align: center;
    font-size: 12px;
    line-height: 18px;
    color: #f5808f;
}
.scr-konfirmasi-pembelian .btn-primary:disabled{
    opacity: 0.6;
}
`;

export default function KonfirmasiPembelian() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const productId = params.get('id');
  const quantity = Math.max(1, Number(params.get('qty')) || 1);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!productId) {
      navigate('/pasar', { replace: true });
      return undefined;
    }
    let alive = true;
    api
      .product(productId)
      .then((res) => {
        if (!alive) return;
        if (!res.ok) {
          setError(friendlyError(res.data, 'Gagal memuat produk.'));
          return;
        }
        setProduct(res.data);
      })
      .catch(() => {
        if (alive) setError('Gagal memuat produk.');
      });
    return () => {
      alive = false;
    };
  }, [productId, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy || !product) return;
    setBusy(true);
    setError('');
    const res = await api.purchase({ product_id: product.id, quantity });
    if (res.ok) {
      // the notification screen shows these numbers instead of design placeholders
      try {
        sessionStorage.setItem('pscryp.lastPurchase', JSON.stringify(res.data));
      } catch {
        // storage can be blocked; the route state still carries the values
      }
      navigate('/notifikasi/pembelian', { state: { purchase: res.data } });
      return;
    }
    // rank / prerequisite rejections become one friendly sentence instead of
    // the backend's "hanya bisa dibeli oleh user..." details
    const message = friendlyError(res.data, 'Pembelian gagal, coba lagi.');
    const notEligible = /hanya bisa dibeli oleh|terlebih dahulu/i.test(message);
    setError(
      notEligible
        ? 'Akun Anda tidak memenuhi syarat untuk memiliki koin ini, lihat status akun Anda'
        : message,
    );
    setBusy(false);
  };

  const price = Number(product?.price) || 0;
  const total = price * quantity;
  const perDay = orderDailyProfit(product, quantity);
  const walletLabel = product?.balance_source === 'balance_deposit' ? 'Isi Ulang' : 'Tersedia';

  return (
    <div className="scr-konfirmasi-pembelian">
      <style>{css}</style>
      <section id="confirmation-modal" className="modal-overlay">
        <div className="modal-card">
          <div className="modal-header">
            <h2 className="modal-title">{t('Konfirmasi Coin')}</h2>
            <p className="modal-subtitle">{t('Pastikan data di bawah ini sudah benar sebelum')}<br />{t('melanjutkan.')}</p>
          </div>
      
          <div className="modal-amount-section">
            <div className="amount-label">{t('Nominal coin')}</div>
            <div className="amount-value-wrapper">
              <span className="amount-value">{idr(total)}</span>
              <span className="amount-currency">{t('IDR')}</span>
            </div>
          </div>
      
          <div className="modal-details">
            <div className="detail-row">
              <span className="detail-label">{t('Produk')}</span>
              <span className="detail-value">{product ? `${product.name} × ${quantity}` : 'Memuat…'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('Periode')}</span>
              <span className="detail-value">{product ? `${product.duration} Hari` : ''}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('Return')}</span>
              <span className="detail-value text-green">{product ? rateValue(product) : ''}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('Estimasi return seluruhnya')}</span>
              <span className="detail-value text-green">{idr(perDay)} IDR</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('Mulai dapat imbal hasil')}</span>
              <span className="detail-value">{dateID(new Date(Date.now() + 86400000))}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('Dipotong dari')}</span>
              <span className="detail-value">Saldo {walletLabel}</span>
            </div>
          </div>
      
          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-primary"
              disabled={busy || !product}
              onClick={submit}
            >
              {busy ? 'Memproses…' : 'Ya, Mulai'}
            </button>
            <a href="#" className="btn-secondary" data-back="1">{t('Batal')}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
