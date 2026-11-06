// rekening-bank-3 — ported from the Figma export, typography re-synced to Figma
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth, friendlyError } from '../../lib/auth.jsx';
import { normalizePhone } from '../../lib/phone.js';
import PilihanBank from './PilihanBank.jsx';
import { t } from '../../lib/i18n.js';

const css = `
/* rekening-bank-3 — ported from Figma export, typography re-synced */
.scr-rekening-bank-3 { background: radial-gradient(circle at 70% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 50%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-rekening-bank-3 *{
  box-sizing: border-box;
}
.scr-rekening-bank-3 section{
  width: 100%;
  max-width: 412px;
}
.scr-rekening-bank-3 .app-header{
  display: flex;
  align-items: center;
  padding: 20px 16px 0 16px;
  position: relative;
  min-height: 60px;
}
.scr-rekening-bank-3 .btn-back{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: absolute;
  left: 16px;
  top: 20px;
  padding: 0;
}
.scr-rekening-bank-3 .header-title{
  width: 100%;
  text-align: center;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.scr-rekening-bank-3 .info-banner{
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 20px 16px 0 16px;
}
.scr-rekening-bank-3 .info-icon{
  width: 16px;
  height: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}
.scr-rekening-bank-3 .info-text{
  color: #a9b7c8;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}
.scr-rekening-bank-3 .account-form{
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}
.scr-rekening-bank-3 .form-group{
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-rekening-bank-3 .form-label{
  color: #d3dce7;
  font-size: 12px;
  display: flex;
  gap: 2px;
}
.scr-rekening-bank-3 .required{
  color: #f2667a;
}
.scr-rekening-bank-3 .form-input-wrapper{
  position: relative;
  display: flex;
  align-items: center;
}
.scr-rekening-bank-3 .form-input{
  width: 100%;
  height: 46px;
  background-color: #1f3048;
  border: 1px solid #2f4560;
  border-radius: 14px;
  padding: 0 14px;
  color: #ffffff;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  font-family: inherit;
}
.scr-rekening-bank-3 .form-input::placeholder{
  color: #75879c;
}
.scr-rekening-bank-3 .select-like{
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.scr-rekening-bank-3 .select-like .placeholder{
  color: #75879c;
  font-size: 14px;
}
.scr-rekening-bank-3 .icon-arrow{
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.scr-rekening-bank-3 .form-helper{
  color: #75879c;
  font-size: 11px;
  margin: 6px 0 0 0;
}
.scr-rekening-bank-3 .form-toggle-group{
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.scr-rekening-bank-3 .toggle-text{
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-rekening-bank-3 .toggle-title{
  color: #ffffff;
  font-size: 14px;
}
.scr-rekening-bank-3 .toggle-subtitle{
  color: #8597ab;
  font-size: 12px;
}
.scr-rekening-bank-3 .toggle-switch{
  width: 40px;
  height: 24px;
  border-radius: 12px;
  background: #1f3048;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}
.scr-rekening-bank-3 .toggle-switch.active{
  background: linear-gradient(90deg, #2c4c80 0%, #5a82bf 100%);
}
.scr-rekening-bank-3 .toggle-thumb{
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #ffffff;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
}
.scr-rekening-bank-3 .toggle-switch.active .toggle-thumb{
  transform: translateX(16px);
}
.scr-rekening-bank-3 .form-submit{
  margin-top: 24px;
}
.scr-rekening-bank-3 .btn-submit{
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  border: none;
  color: #0c1a2d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.scr-rekening-bank-3 .notes-container{
  padding: 26px 16px 28px 16px;
}
.scr-rekening-bank-3 .notes-title{
  color: #a9b7c8;
  font-size: 14px;
  margin: 0 0 16px 0;
  font-weight: normal;
}
.scr-rekening-bank-3 .notes-list{
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-rekening-bank-3 .notes-item{
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.scr-rekening-bank-3 .bullet{
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #51657e;
  margin-top: 6px;
  flex-shrink: 0;
}
.scr-rekening-bank-3 .notes-text{
  color: #75879c;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}
.scr-rekening-bank-3 .select-like{ font-family: inherit; text-align: left; cursor: pointer; }
.scr-rekening-bank-3 .form-error{ margin: 12px 0 0 0; font-size: 12px; line-height: 18px; color: #f2667a; }
.scr-rekening-bank-3 .btn-submit:disabled{ opacity: 0.6; cursor: default; }
/* figma re-sync */
.scr-rekening-bank-3 .header-title.header-title { font-size: 17px; }
.scr-rekening-bank-3 .header-title.header-title { font-weight: 700; }
.scr-rekening-bank-3 .placeholder.placeholder { font-size: 13px; }
.scr-rekening-bank-3 .toggle-title.toggle-title { font-size: 13px; }
.scr-rekening-bank-3 .toggle-subtitle.toggle-subtitle { font-size: 11px; }
.scr-rekening-bank-3 .notes-title.notes-title { font-size: 12px; }
`;

export default function RekeningBank3() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bank, setBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // the bank list is a sheet over this form, so the answers never leave the screen
  const [pickerOpen, setPickerOpen] = useState(false);
  // the holder name is typed by the user; nothing is suggested from the profile
  const [holderName, setHolderName] = useState('');

  const openPicker = (event) => {
    event.stopPropagation();
    setError('');
    setPickerOpen(true);
  };

  const pickBank = (picked) => {
    setBank(picked);
    setError('');
    setPickerOpen(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!bank) {
      setError('Pilih bank terlebih dahulu.');
      return;
    }
    if (!/^\d{6,50}$/.test(accountNumber)) {
      setError('Nomor rekening harus berupa 6–50 digit angka.');
      return;
    }
    const accountName = holderName.trim();
    if (!accountName) {
      setError('Nama pemilik rekening wajib diisi.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const res = await api.addUserBank({
        bank: bank.id,
        account_name: accountName,
        account_number: accountNumber,
        phone: normalizePhone(user?.phone || ''),
        is_default: isDefault,
      });
      if (!res.ok) {
        setError(friendlyError(res.data, 'Gagal menyimpan rekening.'));
        setBusy(false);
        return;
      }
      // replace the form so Back does not return to the submitted fields
      navigate('/dompet/2', { replace: true, state: { added: true } });
    } catch {
      setError('Gagal menyimpan rekening.');
      setBusy(false);
    }
  };

  return (
    <div className="scr-rekening-bank-3">
      <style>{css}</style>
      <section id="section-header">
        <header className="app-header">
          <button className="btn-back" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/7861050aa5.svg" alt="back" />
          </button>
          <h1 className="header-title">{t('Tambah Rekening')}</h1>
        </header>
      </section>
      <section id="section-info">
        <div className="info-banner">
          <img src="/assets/img/161566930f.svg" alt="info" className="info-icon" />
          <p className="info-text">{t('Pastikan data rekening benar agar penarikan tidak gagal.')}</p>
        </div>
      </section>
      <section id="section-form">
        <form className="account-form" onSubmit={submit} noValidate>
          
          <div className="form-group">
            <label className="form-label">{t('Bank')} <span className="required">*</span></label>
            <div className="form-input-wrapper">
              <button type="button" className="form-input select-like" onClick={openPicker}>
                <span className={bank ? '' : 'placeholder'}>{bank ? bank.name : 'Pilih bank'}</span>
                <img src="/assets/img/ec2e9bee09.svg" alt="arrow down" className="icon-arrow" />
              </button>
            </div>
          </div>
      
          
          <div className="form-group">
            <label className="form-label" htmlFor="account-number">{t('Nomor rekening')} <span className="required">*</span></label>
            <div className="form-input-wrapper">
              <input
                id="account-number"
                type="text"
                className="form-input"
                placeholder={t('Masukkan nomor rekening')}
                inputMode="numeric"
                autoComplete="off"
                maxLength={50}
                value={accountNumber}
                onChange={(event) => {
                  setAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 50));
                  setError('');
                }}
              />
            </div>
          </div>
      
          
          <div className="form-group">
            <label className="form-label" htmlFor="account-name">{t('Nama pemilik rekening')} <span className="required">*</span></label>
            <div className="form-input-wrapper">
              <input
                id="account-name"
                type="text"
                className="form-input"
                placeholder={t('Masukkan nama pemilik rekening')}
                autoComplete="off"
                maxLength={100}
                value={holderName}
                onChange={(event) => {
                  // a holder name carries letters, spaces and the punctuation names
                  // use ("M. Iqbal", "O'Brien", "Siti Nur-Aini") — never digits
                  setHolderName(event.target.value.replace(/[^\p{L}\s'.-]/gu, ''));
                  setError('');
                }}
              />
            </div>
          
          </div>
      
          
          <div className="form-toggle-group">
            <div className="toggle-text">
              <div className="toggle-title">{t('Jadikan rekening utama')}</div>
              <div className="toggle-subtitle">{t('Dipakai otomatis saat penarikan')}</div>
            </div>
            <div
              className={`toggle-switch${isDefault ? ' active' : ''}`}
              role="switch"
              aria-checked={isDefault}
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                setIsDefault((value) => !value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsDefault((value) => !value);
                }
              }}
            >
              <div className="toggle-thumb"></div>
            </div>
          </div>
      
          
          {error && <p className="form-error">{error}</p>}

          <div className="form-submit">
            <button
              type="submit"
              className="btn-submit"
              disabled={busy}
              // the shell cancels unhandled button clicks, which would swallow the submit
              onClick={(event) => event.stopPropagation()}
            >
              {busy ? 'Menyimpan…' : 'Simpan Rekening'}
            </button>
          </div>
        </form>
      </section>
      <section id="section-notes">
        <div className="notes-container">
          <h2 className="notes-title">{t('Catatan')}</h2>
          <ul className="notes-list">
            <li className="notes-item">
              <span className="bullet"></span>
              <p className="notes-text">{t('Nama pemilik rekening harus sama dengan nama akun kamu.')}</p>
            </li>
            <li className="notes-item">
              <span className="bullet"></span>
              <p className="notes-text">{t('Penarikan hanya bisa dilakukan ke rekening yang sudah terdaftar.')}</p>
            </li>
          
          </ul>
        </div>
      </section>
      {pickerOpen && (
        <PilihanBank onClose={() => setPickerOpen(false)} onSelect={pickBank} />
      )}
    </div>
  );
}
