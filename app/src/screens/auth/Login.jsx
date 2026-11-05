import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx';
import { t } from '../../lib/i18n.js';

// login — ported from the Figma export, typography re-synced to Figma
const css = `
/* login — ported from Figma export, typography re-synced */
.scr-login *{
  box-sizing: border-box;
}
.scr-login{
  width: 100%;
  margin: 0 auto;
}
.scr-login section{
  width: 100%;
}
.scr-login button,
.scr-login input{
  font-family: 'Inter', sans-serif;
}
.scr-login #section-header .header{
    padding: 20px 16px 0;
    display: flex;
    justify-content: flex-start;
  }
.scr-login #section-header .back-btn{
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: rgba(255, 255, 255, 0.08);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }
.scr-login #section-header .back-btn:hover{
    background-color: rgba(255, 255, 255, 0.15);
  }
.scr-login #section-hero .hero{
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 24px 0;
    text-align: center;
    overflow: hidden;
  }
/* Figma places this banner at x -12 with a 436px width, so it bleeds past both
   edges of the 24px padded column and the hero clips the outer 12px */
.scr-login #section-hero .hero-image{
    width: calc(100% + 72px);
    margin-left: -36px;
    margin-right: -36px;
    margin-bottom: 20px;
    object-fit: cover;
  }
.scr-login #section-hero .hero-title{
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 6px 0;
    color: #ffffff;
    line-height: 1.4;
  }
.scr-login #section-hero .hero-subtitle{
    font-size: 14px;
    color: #a9b7c8;
    margin: 0;
  }
.scr-login #section-form{
    padding: 28px 16px 0;
  }
.scr-login #section-form .form-card{
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 24px 20px;
  }
.scr-login #section-form .login-form{
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
.scr-login #section-form .form-group{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-login #section-form .form-group label{
    font-size: 12px;
    color: #d3dce7;
  }
.scr-login #section-form .input-wrapper{
    background-color: rgba(255, 255, 255, 0.08);
    border-radius: 25px;
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 18px;
    gap: 10px;
  }
.scr-login #section-form .input-wrapper input{
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 14px;
    flex: 1;
    outline: none;
    width: 100%;
  }
.scr-login #section-form .input-wrapper input::placeholder{
    color: #75879c;
  }
.scr-login #section-form .icon-btn{
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
.scr-login #section-form .captcha-row{
    display: flex;
    gap: 8px;
  }
.scr-login #section-form .captcha-input{
    flex: 1;
  }
/* printed-captcha look: speckled panel, noise dots and two tilted strokes */
.scr-login #section-form .captcha-box{
    width: 128px;
    height: 50px;
    border-radius: 10px;
    background-color: #e4eaf1;
    background-image:
      radial-gradient(circle at 18% 26%, rgba(26, 44, 68, 0.28) 1px, transparent 1.6px),
      radial-gradient(circle at 74% 34%, rgba(26, 44, 68, 0.24) 1px, transparent 1.6px),
      radial-gradient(circle at 46% 78%, rgba(26, 44, 68, 0.2) 1px, transparent 1.6px),
      radial-gradient(circle at 88% 82%, rgba(26, 44, 68, 0.22) 1px, transparent 1.6px),
      linear-gradient(135deg, #eef2f7 0%, #c9d4e1 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px 0 14px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    user-select: none;
  }
.scr-login #section-form .captcha-box::before,
.scr-login #section-form .captcha-box::after{
    content: '';
    position: absolute;
    left: -12%;
    right: -12%;
    height: 1.5px;
    background-color: rgba(26, 44, 68, 0.38);
    pointer-events: none;
  }
.scr-login #section-form .captcha-box::before{
    top: 31%;
    transform: rotate(-7deg);
  }
.scr-login #section-form .captcha-box::after{
    top: 68%;
    transform: rotate(6deg);
  }
.scr-login #section-form .captcha-text{
    color: #1a2c44;
    font-family: 'Courier New', ui-monospace, monospace;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 1px;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
  }
.scr-login #section-form .captcha-text span{
    display: inline-block;
    width: 14px;
    text-align: center;
  }
.scr-login #section-form .captcha-hint{
    font-size: 11px;
    color: #8597ab;
    margin: 0;
    line-height: 1.4;
  }
.scr-login #section-form .form-options{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
  }
.scr-login #section-form .checkbox-label{
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
.scr-login #section-form .checkbox{
    width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.1);
  }
.scr-login #section-form .checkbox.checked{
    background: linear-gradient(135deg, #f2f5f9 0%, #c4cfdc 100%);
  }
.scr-login #section-form .checkbox-label span{
    font-size: 12px;
    color: #a9b7c8;
  }
.scr-login #section-form .forgot-password{
    font-size: 12px;
    color: #ffffff;
    text-decoration: none;
    font-weight: 700;
  }
.scr-login #section-actions{
    padding: 28px 24px 0;
  }
.scr-login #section-actions .actions{
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
.scr-login #section-actions .btn-primary{
    width: 100%;
    height: 52px;
    border-radius: 26px;
    background: linear-gradient(to right, #f5f8fb 0%, #c9d4e1 100%);
    border: none;
    color: #0c1a2d;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s;
  }
.scr-login #section-actions .btn-primary:hover{
    opacity: 0.9;
  }
.scr-login #section-actions .register-prompt{
    text-align: center;
    font-size: 14px;
    color: #a9b7c8;
    margin: 0;
  }
.scr-login #section-actions .register-prompt a{
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }
.scr-login #section-footer{
    padding: 24px 0 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
.scr-login #section-footer .footer{
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
.scr-login #section-footer .disclaimer{
    font-size: 11px;
    color: #7f90a5;
    text-align: center;
    line-height: 1.5;
    margin: 0 24px 24px;
  }
.scr-login #section-footer .warning-box{
    background-color: rgba(201, 212, 225, 0.1);
    border-radius: 16px;
    padding: 12px 14px;
    display: flex;
    gap: 10px;
    margin: 0 16px 24px;
    align-items: flex-start;
    width: calc(100% - 32px);
  }
.scr-login #section-footer .warning-icon{
    margin-top: 2px;
    flex-shrink: 0;
  }
.scr-login #section-footer .warning-text{
    font-size: 11px;
    color: #a9b7c8;
    margin: 0;
    line-height: 1.5;
  }
.scr-login #section-footer .warning-text a{
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
  }
.scr-login #section-footer .warning-text a:hover{
    opacity: 0.8;
  }
.scr-login #section-footer .logos{
    display: flex;
    gap: 16px;
    justify-content: center;
    align-items: center;
  }
.scr-login #section-footer .logo{
    height: 22px;
    object-fit: contain;
  }
/* figma re-sync */
.scr-login .hero-title.hero-title { font-size: 24px; }
.scr-login .hero-title.hero-title { line-height: 32px; }
.scr-login .captcha-text.captcha-text { font-size: 18px; }
.scr-login .captcha-hint.captcha-hint { font-size: 12px; }
.scr-login .forgot-password.forgot-password { font-size: 13px; }
.scr-login .forgot-password.forgot-password { font-weight: 600; }
.scr-login .btn-primary.btn-primary { font-weight: 600; }
/* the Figma frame has no error state, so this is the smallest addition that
   keeps a failed login readable */
.scr-login .form-error{
    margin: 10px 2px 0;
    font-size: 12px;
    line-height: 18px;
    color: #f5808f;
  }
/* shown when the visitor arrives straight from a successful sign-up */
.scr-login .form-notice{
    margin: 10px 2px 0;
    font-size: 12px;
    line-height: 18px;
    color: #6ff0b4;
  }
.scr-login .btn-primary:disabled{
    opacity: 0.6;
  }
`;

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCaptcha = () =>
  Array.from({ length: 4 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join('');

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  // a finished sign-up arrives through the loading screen, which hands the email over
  const [identifier, setIdentifier] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  // a fixed seed would show the same code on every visit, so the first captcha
  // is rolled per mount like every refresh after it
  const [captchaCode, setCaptchaCode] = useState(newCaptcha);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // the guard sends us here with the screen the user actually asked for;
  // a plain sign-in opens the home tab, the app's main menu
  const from =
    location.state?.from && location.state.from !== '/login' ? location.state.from : '/home';
  // a finished sign-up lands here with a flag, so the reason for the redirect is visible
  const registered = Boolean(location.state?.registered);

  const rollCaptcha = () => {
    setCaptchaCode(newCaptcha());
    setCaptcha('');
    // a new code invalidates whatever the old one was rejected for
    setError('');
  };

  // each glyph gets its own tilt and lift so the code does not read as plain typography
  const captchaGlyphs = captchaCode.split('').map((char, index) => {
    const seed = char.charCodeAt(0) + index * 79;
    return { char, rotate: (seed % 15) - 7, lift: (seed % 5) - 2 };
  });

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!identifier.trim() || !password) {
      setError('Isi email atau nomor telepon dan kata sandi.');
      return;
    }
    if (captcha.trim().toUpperCase() !== captchaCode) {
      setError('Kode captcha tidak sesuai.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await signIn(identifier.trim(), password);
      // the channel popup greets every fresh sign-in before the destination
      // screen; its dismiss lands on the target the login was heading to
      navigate('/popup-home', { replace: true, state: { next: from } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="scr-login">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="back-btn" aria-label={t('Back')} data-back="1">
            <img src="/assets/img/1836902011.svg" alt="Back" />
          </button>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero">
          <img className="hero-image" src="/assets/img/d1f932276f.png" alt="Hero Banner" />
          <h1 className="hero-title">{t('Selamat Datang Kembali')}</h1>
          <p className="hero-subtitle">{t('Masuk ke akunmu untuk melanjutkan.')}</p>
        </div>
      </section>
      <section id="section-form">
        <div className="form-card">
          <form className="login-form" onSubmit={submit} noValidate>
            <div className="form-group">
              <label>{t('Username / Email / Nomor Telepon')}</label>
              <div className="input-wrapper">
                <img src="/assets/img/de769adeec.svg" alt="User Icon" className="input-icon" />
                <input
                  type="text"
                  placeholder={t('Username, email, atau no. telepon')}
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>{t('Kata Sandi')}</label>
              <div className="input-wrapper">
                <img src="/assets/img/a9ca914b1e.svg" alt="Lock Icon" className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('Masukkan kata sandi')}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowPassword((current) => !current);
                  }}
                >
                  <img src="/assets/img/bd4a34827b.svg" alt="Eye Icon" />
                </button>
              </div>
            </div>
      
            <div className="form-group captcha-group">
              <label>{t('Kode Captcha')}</label>
              <div className="captcha-row">
                <div className="input-wrapper captcha-input">
                  <input
                    type="text"
                    placeholder={t('Masukkan kode')}
                    value={captcha}
                    onChange={(event) => setCaptcha(event.target.value)}
                  />
                </div>
                <div className="captcha-box">
                  <span className="captcha-text">
                    {captchaGlyphs.map(({ char, rotate, lift }, index) => (
                      <span key={index} style={{ transform: `rotate(${rotate}deg) translateY(${lift}px)` }}>
                        {char}
                      </span>
                    ))}
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={t('Perbarui Captcha')}
                    onClick={(event) => {
                      event.stopPropagation();
                      rollCaptcha();
                    }}
                  >
                    <img src="/assets/img/09f1662a66.svg" alt="" />
                  </button>
                </div>
              </div>
              <p className="captcha-hint">{t('Ketik ulang kode yang tampil di kotak sebelah kanan ke kolom ini. Kode tidak bisa dibaca? Ketuk ikon putar untuk mengganti kode baru.')}</p>
            </div>
      
            <div className="form-options">
              <label className="checkbox-label">
                <div className="checkbox checked">
                  <img src="/assets/img/f70576a24f.svg" alt="Checked Icon" />
                </div>
                <span>{t('Ingat saya')}</span>
              </label>
              <a href="#" className="forgot-password" data-route="/lupa-password">{t('Lupa kata sandi?')}</a>
            </div>
            {registered && !error && (
              <p className="form-notice">{t('Pendaftaran berhasil. Silakan masuk untuk mulai menggunakan aplikasi.')}</p>
            )}
            {error && <p className="form-error">{error}</p>}
          </form>
        </div>
      </section>
      <section id="section-actions">
        <div className="actions">
          <button
            className="btn-primary"
            type="submit"
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              submit(event);
            }}
          >
            {busy ? 'Memproses…' : 'Masuk'}
          </button>
          <p className="register-prompt">{t('Belum punya akun?')} <a href="#" data-route="/register">{t('Daftar')}</a></p>
        </div>
      </section>
      <section id="section-footer">
        <footer className="footer">
          <p className="disclaimer">{t('Data yang kamu masukkan hanya digunakan untuk keperluan akses login ke akunmu. Kami tidak akan membagikan, menjual, atau menggunakan data kamu untuk tujuan lain tanpa persetujuan darimu.')}</p>
          
          <div className="warning-box">
            <img src="/assets/img/1039aba1ee.svg" alt="Info Icon" className="warning-icon" />
            <p className="warning-text">{t('Dengan masuk, saya menyatakan bahwa saya sudah dewasa dan menerima ketentuan-ketentuan')} <a href="#" data-route="/legal/perjanjian-klien">{t('Perjanjian Klien')}</a> {t('dan')} <a href="#" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a>.</p>
          </div>
      
          <div className="logos">
            <img src="/assets/img/OJK.png" alt="OJK Logo" className="logo" />
            <img src="/assets/img/BAPPEBTI.png" alt="BAPPEBTI Logo" className="logo" />
          </div>
        </footer>
      </section>
    </div>
  );
}
