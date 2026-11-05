import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SupportChat from '../../components/SupportChat.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { normalizePhone } from '../../lib/phone.js';
import { t } from '../../lib/i18n.js';

// lupa-password — ported from the Figma export, typography re-synced to Figma
const css = `
/* lupa-password — ported from Figma export, typography re-synced */
.scr-lupa-password { width: 100%; margin: 0 auto; background: radial-gradient(circle at 69% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 50%),
    radial-gradient(circle at 60% 38%, rgba(44, 72, 104, 0.45) 0%, rgba(44, 72, 104, 0) 50%),
    linear-gradient(180deg, #0C1A2D 0%, #13263D 38%, #0F2036 70%, #0A1626 100%); }
.scr-lupa-password section{
  width: 100%;
  box-sizing: border-box;
}
.scr-lupa-password *{
  box-sizing: border-box;
}
.scr-lupa-password #section-header{
    padding: 20px 16px 0;
    position: relative;
    z-index: 10;
  }
.scr-lupa-password .app-header{
    display: flex;
  }
.scr-lupa-password .back-btn{
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: rgba(255, 255, 255, 0.08);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    transition: background-color 0.2s ease;
  }
.scr-lupa-password .back-btn:hover{
    background-color: rgba(255, 255, 255, 0.12);
  }
.scr-lupa-password #section-hero{
    padding: 24px 24px 0;
  }
.scr-lupa-password .hero-content{
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    /* the artwork is a decorative layer, so it keeps its Figma size and offset
       instead of sizing this column; 244px is where the title starts in Figma */
    padding-top: 244px;
  }
.scr-lupa-password .hero-image-container{
    position: absolute;
    top: -80px;
    left: -32px;
    width: calc(100% + 56px);
    display: flex;
    justify-content: center;
    z-index: 1;
    pointer-events: none;
  }
.scr-lupa-password .hero-image{
    width: 100%;
    height: auto;
    display: block;
  }
.scr-lupa-password .hero-title{
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    text-align: center;
    position: relative;
    z-index: 2;
  }
.scr-lupa-password .hero-subtitle{
    color: #a9b7c8;
    font-size: 14px;
    line-height: 1.5;
    text-align: center;
    margin: 0;
    position: relative;
    z-index: 2;
  }
.scr-lupa-password #section-form{
    padding: 28px 16px 0;
  }
.scr-lupa-password .form-card{
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
.scr-lupa-password .form-group{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-lupa-password .form-label{
    color: #d3dce7;
    font-size: 12px;
    font-weight: 400;
  }
.scr-lupa-password .input-wrapper{
    background-color: rgba(255, 255, 255, 0.08);
    border-radius: 25px;
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 18px;
    gap: 10px;
    transition: background-color 0.2s ease;
  }
.scr-lupa-password .input-wrapper:focus-within{
    background-color: rgba(255, 255, 255, 0.12);
  }
.scr-lupa-password .input-icon{
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
.scr-lupa-password .input-icon.right{
    cursor: pointer;
  }
.scr-lupa-password .form-input{
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 14px;
    font-family: inherit;
    flex-grow: 1;
    outline: none;
    width: 100%;
  }
.scr-lupa-password .form-input::placeholder{
    color: #75879c;
  }
.scr-lupa-password .form-helper{
    color: #8597ab;
    font-size: 11px;
    margin: 0;
    padding-left: 18px;
    line-height: 1.4;
  }
.scr-lupa-password .help-box{
    background-color: rgba(201, 212, 225, 0.1);
    border-radius: 16px;
    padding: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2px;
  }
.scr-lupa-password .help-text{
    color: #d3dce7;
    font-size: 12px;
    margin: 0;
    line-height: 1.4;
  }
.scr-lupa-password .btn-help{
    background: linear-gradient(180deg, #f5f7fa 0%, #c7d4e0 100%);
    color: #0c1a2d;
    border: none;
    border-radius: 16px;
    height: 32px;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
    transition: opacity 0.2s ease;
  }
.scr-lupa-password .btn-help:hover{
    opacity: 0.9;
  }
.scr-lupa-password #section-action{
    padding: 28px 24px 0;
  }
.scr-lupa-password .action-container{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
.scr-lupa-password .btn-primary{
    background: linear-gradient(180deg, #f5f7fa 0%, #c7d4e0 100%);
    color: #0c1a2d;
    border: none;
    border-radius: 26px;
    height: 52px;
    width: 100%;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.2s ease;
  }
.scr-lupa-password .btn-primary:hover{
    opacity: 0.9;
  }
.scr-lupa-password .login-prompt{
    color: #ffffff;
    font-size: 14px;
    margin: 0;
  }
.scr-lupa-password .login-link{
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }
.scr-lupa-password .login-link:hover{
    text-decoration: underline;
  }
.scr-lupa-password #section-footer{
    padding: 24px 24px 24px;
    margin-top: auto; 
  }
.scr-lupa-password .app-footer{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
.scr-lupa-password .disclaimer-text{
    color: #7f90a5;
    font-size: 10px;
    text-align: center;
    line-height: 1.5;
    margin: 0;
  }
.scr-lupa-password .footer-logos{
    display: flex;
    gap: 16px;
    justify-content: center;
    align-items: center;
  }
.scr-lupa-password .logo-img{
    height: 22px;
    width: auto;
    object-fit: contain;
  }
/* figma re-sync */
.scr-lupa-password .form-label.form-label { font-size: 13px; }
.scr-lupa-password .form-label.form-label { font-weight: 500; }
.scr-lupa-password .form-helper.form-helper { font-size: 12px; }
.scr-lupa-password .btn-primary.btn-primary { font-weight: 600; }
.scr-lupa-password .disclaimer-text.disclaimer-text { font-size: 11px; }
.scr-lupa-password .disclaimer-text.disclaimer-text { line-height: 17px; }
/* the Figma frame has no error state */
.scr-lupa-password .form-error{
    margin: 10px 2px 0;
    font-size: 12px;
    line-height: 18px;
    color: #f5808f;
  }
.scr-lupa-password .btn-primary:disabled{
    opacity: 0.6;
  }
`;

export default function LupaPassword() {
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // the help button opens the live-chat sheet without leaving the recovery form
  const [chatOpen, setChatOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!identifier.trim()) {
      setError('Isi email atau nomor telepon.');
      return;
    }
    if (identifier.includes('@')) {
      // the endpoint looks accounts up by phone only, whatever the label says
      setError('Pemulihan lewat email belum tersedia. Gunakan nomor telepon atau hubungi tim dukungan.');
      return;
    }
    if (!oldPassword) {
      setError('Kata sandi lama wajib diisi.');
      return;
    }
    if (password.length < 8) {
      setError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (password !== password2) {
      setError('Konfirmasi kata sandi baru tidak sama.');
      return;
    }
    if (password === oldPassword) {
      setError('Kata sandi baru harus berbeda dari kata sandi lama.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      // the endpoint looks the account up by phone and checks the old password
      await changePassword({
        phone: normalizePhone(identifier),
        old_password: oldPassword,
        new_password: password,
        new_password_confirm: password2,
      });
      // the form is spent once the password changes, and the popup's "Tutup"
      // carries the user on to the login screen instead of back here
      navigate('/notifikasi/ubah-sandi', { replace: true, state: { next: '/login' } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="scr-lupa-password">
      <style>{css}</style>
      <section id="section-header">
        <header className="app-header">
          <button className="back-btn" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/44b91558db.svg" alt="Back Icon" />
          </button>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero-content">
          <div className="hero-image-container">
            <img src="/assets/img/5557c0ca1c.png" alt="Coins Ribbon" className="hero-image" />
          </div>
          <h1 className="hero-title">{t('Lupa Kata Sandi?')}</h1>
          <p className="hero-subtitle">{t('Jangan khawatir, kami bantu. Masukkan nomor telepon terdaftar, kata sandi lama, dan kata sandi baru di bawah ini.')}</p>
        </div>
      </section>
      <section id="section-form">
        <div className="form-container">
          <form className="form-card" onSubmit={submit} noValidate>
            
            <div className="form-group">
              <label className="form-label">{t('Email / Nomor Telepon')}</label>
              <div className="input-wrapper">
                <img src="/assets/img/eb68a5b11e.svg" alt="Email Icon" className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('Email atau no. telepon')}
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
              </div>
              <p className="form-helper">{t('Pastikan sama dengan yang kamu gunakan saat mendaftar.')}</p>
            </div>
      
            <div className="form-group">
              <label className="form-label">{t('Kata Sandi Lama')}</label>
              <div className="input-wrapper">
                <img src="/assets/img/a9ca914b1e.svg" alt="Lock Icon" className="input-icon" />
                <input
                  type={showOld ? 'text' : 'password'}
                  className="form-input"
                  placeholder={t('Masukkan kata sandi lama')}
                  autoComplete="current-password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                />
                <img
                  src="/assets/img/bd4a34827b.svg"
                  alt="Show Password"
                  className="input-icon right"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowOld((current) => !current);
                  }}
                />
              </div>
              <div className="help-box">
                <p className="help-text">{t('Lupa kata sandi lama?')}<br />{t('Tim kami siap membantu.')}</p>
                <button
                  className="btn-help"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setChatOpen(true);
                  }}
                >
                  {t('Minta Bantuan')}
                </button>
              </div>
            </div>
      
            <div className="form-group">
              <label className="form-label">{t('Kata Sandi Baru')}</label>
              <div className="input-wrapper">
                <img src="/assets/img/a9ca914b1e.svg" alt="Lock Icon" className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder={t('Minimal 8 karakter')}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <img
                  src="/assets/img/bd4a34827b.svg"
                  alt="Show Password"
                  className="input-icon right"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowPassword((current) => !current);
                  }}
                />
              </div>
              <p className="form-helper">{t('Gunakan kombinasi huruf besar, huruf kecil, dan angka.')}</p>
            </div>
      
            <div className="form-group">
              <label className="form-label">{t('Konfirmasi Kata Sandi Baru')}</label>
              <div className="input-wrapper">
                <img src="/assets/img/a9ca914b1e.svg" alt="Lock Icon" className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder={t('Ulangi kata sandi baru')}
                  autoComplete="new-password"
                  value={password2}
                  onChange={(event) => setPassword2(event.target.value)}
                />
                <img
                  src="/assets/img/bd4a34827b.svg"
                  alt="Show Password"
                  className="input-icon right"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowPassword((current) => !current);
                  }}
                />
              </div>
            </div>
      
            {error && <p className="form-error">{error}</p>}
          </form>
        </div>
      </section>
      <section id="section-action">
        <div className="action-container">
          <button
            className="btn-primary"
            type="submit"
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              submit(event);
            }}
          >
            {busy ? 'Memproses…' : 'Atur Ulang Kata Sandi'}
          </button>
          <p className="login-prompt">{t('Ingat kata sandimu?')} <a href="#login" className="login-link" data-route="/login">{t('Masuk')}</a></p>
        </div>
      </section>
      <section id="section-footer">
        <footer className="app-footer">
          <p className="disclaimer-text">{t('Data yang kamu masukkan hanya digunakan untuk keperluan pemulihan akunmu. Kami tidak akan membagikan, menjual, atau menggunakan data kamu untuk tujuan lain tanpa persetujuan darimu.')}</p>
          <div className="footer-logos">
            <img src="/assets/img/OJK.png" alt="OJK Logo" className="logo-img" />
            <img src="/assets/img/BAPPEBTI.png" alt="BAPPEBTI Logo" className="logo-img" />
          </div>
        </footer>
      </section>
      {chatOpen && <SupportChat variant="sheet" onClose={() => setChatOpen(false)} />}
    </div>
  );
}
