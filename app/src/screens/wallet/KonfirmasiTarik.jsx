// konfirmasi-tarik — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { idr, maskAccount } from '../../lib/format.js';
import { useWithdraw } from '../../lib/useWithdraw.js';
import { t } from '../../lib/i18n.js';
const css = `
/* konfirmasi-tarik — ported from Figma export, typography re-synced */
.scr-konfirmasi-tarik *{
  box-sizing: border-box;
}
.scr-konfirmasi-tarik .app-container{
    width: 100%;
    max-width: 412px; 
    background-color: #131313;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    min-height: 100cqh;
  }
.scr-konfirmasi-tarik .modal-card{
    width: 100%;
    max-width: 320px;
    
    background: 
      radial-gradient(circle at 50% 0%, rgba(127, 170, 230, 0.22) 0%, rgba(127, 170, 230, 0) 60%),
      linear-gradient(180deg, #24426a 0%, #1a3150 55%, #12233a 100%);
    border-radius: 24px;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
.scr-konfirmasi-tarik .modal-header{
    text-align: center;
    margin-bottom: 24px;
  }
.scr-konfirmasi-tarik .modal-title{
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
    letter-spacing: 0.2px;
  }
.scr-konfirmasi-tarik .modal-subtitle{
    color: #a9b7c8;
    font-size: 12px;
    line-height: 1.5;
    margin: 0;
  }
.scr-konfirmasi-tarik .amount-section{
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
    gap: 4px;
  }
.scr-konfirmasi-tarik .amount-label{
    color: #a9b7c8;
    font-size: 12px;
  }
.scr-konfirmasi-tarik .amount-value-container{
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
.scr-konfirmasi-tarik .amount-value{
    color: #ffffff;
    font-size: 28px;
    font-weight: 700;
  }
.scr-konfirmasi-tarik .amount-currency{
    color: #a9b7c8;
    font-size: 12px;
    font-weight: 600;
  }
.scr-konfirmasi-tarik .details-list{
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 32px;
    border-top: 1px solid rgba(201, 212, 225, 0.18);
    border-bottom: 1px solid rgba(201, 212, 225, 0.18);
  }
.scr-konfirmasi-tarik .detail-row{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(201, 212, 225, 0.18);
  }
.scr-konfirmasi-tarik .detail-row:last-child{
    border-bottom: none;
  }
.scr-konfirmasi-tarik .detail-label{
    color: #a9b7c8;
    font-size: 13px;
  }
.scr-konfirmasi-tarik .detail-value{
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
  }
.scr-konfirmasi-tarik .action-buttons{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
.scr-konfirmasi-tarik .btn-primary{
    width: 100%;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    font-size: 14px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: inherit;
  }
.scr-konfirmasi-tarik .btn-secondary{
    background: transparent;
    border: none;
    color: #a9b7c8;
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    padding: 8px;
    font-family: inherit;
  }
/* the Figma frame has no PIN, error or disabled state */
.scr-konfirmasi-tarik .detail-input{
    width: 132px;
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 6px;
    text-align: right;
  }
.scr-konfirmasi-tarik .detail-input::placeholder{
    color: #51657e;
    letter-spacing: 2px;
  }
.scr-konfirmasi-tarik .modal-error{
    width: 100%;
    margin: 0;
    text-align: center;
    font-size: 12px;
    line-height: 18px;
    color: #f5808f;
  }
.scr-konfirmasi-tarik .btn-primary:disabled{
    opacity: 0.6;
    cursor: default;
  }
/* figma re-sync */
.scr-konfirmasi-tarik .modal-title.modal-title { font-size: 17px; }
.scr-konfirmasi-tarik .modal-title.modal-title { font-weight: 700; }
.scr-konfirmasi-tarik .amount-label.amount-label { font-size: 11px; }
.scr-konfirmasi-tarik .amount-value.amount-value { font-weight: 500; }
.scr-konfirmasi-tarik .amount-currency.amount-currency { font-size: 13px; }
.scr-konfirmasi-tarik .btn-primary.btn-primary { font-weight: 600; }
.scr-konfirmasi-tarik .btn-secondary.btn-secondary { font-weight: 600; }
`;

export default function KonfirmasiTarik() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const amount = Number(String(params.get('amount') || '').replace(/\D/g, '')) || 0;
  const { status, error: loadError, settings, bank, pinSet } = useWithdraw();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // the amount lives in the URL so a refresh keeps the same request on screen
  useEffect(() => {
    if (!amount) navigate('/tarik', { replace: true });
  }, [amount, navigate]);

  const requirePin = Boolean(settings?.require_pin);
  const pinMissing = requirePin && status === 'ready' && !pinSet;
  const canSubmit =
    status === 'ready' &&
    Boolean(bank) &&
    !pinMissing &&
    !busy &&
    (!requirePin || pin.length === 6);

  const notice =
    error ||
    (status === 'error' ? loadError : '') ||
    (pinMissing ? 'PIN penarikan belum diatur untuk akun ini.' : '');

  const submit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    const res = await api.withdraw({
      amount: String(amount),
      bank_account_id: bank.id,
      ...(requirePin ? { pin } : {}),
    });
    if (res.ok) {
      // a successful request skips the notification and lands on the withdrawal history
      navigate('/riwayat/penarikan');
      return;
    }
    setError(friendlyError(res.data, 'Penarikan gagal, coba lagi.'));
    setBusy(false);
  };

  return (
    <div className="scr-konfirmasi-tarik">
      <style>{css}</style>
      <section id="section-confirmation-modal" className="app-container">
        <div className="modal-card">
          
          <header className="modal-header">
            <h2 className="modal-title">{t('Konfirmasi Penarikan')}</h2>
            <p className="modal-subtitle">{t('Pastikan data di bawah ini sudah benar sebelum')}<br />{t('melanjutkan.')}</p>
          </header>
      
          <div className="amount-section">
            <span className="amount-label">{t('Nominal penarikan')}</span>
            <div className="amount-value-container">
              <span className="amount-value">{idr(amount)}</span>
              <span className="amount-currency">{t('IDR')}</span>
            </div>
          </div>
      
          <div className="details-list">
            <div className="detail-row">
              <span className="detail-label">{t('Nama rekening')}</span>
              <span className="detail-value">{bank ? bank.account_name : '—'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('Nomor rekening')}</span>
              <span className="detail-value">{bank ? maskAccount(bank.account_number) : '—'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('Bank')}</span>
              <span className="detail-value">{bank ? bank.bank_name : '—'}</span>
            </div>
            {requirePin && (
              <div className="detail-row">
                <span className="detail-label">{t('PIN penarikan')}</span>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  className="detail-input"
                  placeholder={t('6 digit')}
                  value={pin}
                  disabled={pinMissing}
                  onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
            )}
          </div>

          {notice && <p className="modal-error">{notice}</p>}
      
          <div className="action-buttons">
            <button type="button" className="btn-primary" disabled={!canSubmit} onClick={submit}>
              {busy ? 'Memproses…' : 'Ya, Tarik Sekarang'}
            </button>
            <button className="btn-secondary" data-back="1">{t('Batal')}</button>
          </div>
      
        </div>
      </section>
    </div>
  );
}
