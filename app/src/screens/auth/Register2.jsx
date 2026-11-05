import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx';
import { normalizePhone } from '../../lib/phone.js';
import { t } from '../../lib/i18n.js';

// register-2 — ported from the Figma export, typography re-synced to Figma
const css = `
/* register-2 — ported from Figma export, typography re-synced */
.scr-register-2 *{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.scr-register-2 .app-container{
  width: 100%;
  max-width: 412px;
  min-height: 100cqh;
  background: 
    radial-gradient(circle at 69% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%),
    radial-gradient(circle at 60% 38%, rgba(44, 72, 104, 0.45) 0%, rgba(44, 72, 104, 0) 100%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 38%, #0f2036 70%, #0a1626 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}
.scr-register-2 input,
.scr-register-2 button{
  font-family: inherit;
}
.scr-register-2 .header-section{
    display: flex;
    flex-direction: column;
    padding-top: 20px;
  }
.scr-register-2 .nav-bar{
    padding: 0 16px;
  }
.scr-register-2 .back-btn{
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
.scr-register-2 .back-btn:hover{
    background-color: rgba(255, 255, 255, 0.12);
  }
.scr-register-2 .title-area{
    padding: 24px 24px 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
.scr-register-2 .main-title{
    color: #ffffff;
    font-size: 20px;
    font-weight: 700;
  }
.scr-register-2 .subtitle{
    color: #a9b7c8;
    font-size: 14px;
    line-height: 1.4;
    max-width: 270px;
    margin: 0 auto;
  }
.scr-register-2 .form-section{
    padding: 24px 16px 0;
  }
.scr-register-2 .form-card{
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 22px 20px;
  }
.scr-register-2 .input-group{
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }
.scr-register-2 .input-group label{
    color: #d3dce7;
    font-size: 12px;
  }
.scr-register-2 .input-wrapper{
    background-color: rgba(255, 255, 255, 0.08);
    border-radius: 25px;
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 18px;
    gap: 10px;
    border: 1px solid transparent;
    transition: border-color 0.2s;
  }
.scr-register-2 .input-wrapper:focus-within{
    border-color: rgba(255, 255, 255, 0.2);
  }
.scr-register-2 .input-wrapper input{
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 14px;
    flex: 1;
    outline: none;
    width: 100%;
  }
.scr-register-2 .input-wrapper input::placeholder{
    color: #75879c;
  }
.scr-register-2 .phone-prefix{
    display: flex;
    align-items: center;
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    padding-right: 10px;
    height: 22px;
  }
.scr-register-2 .phone-prefix span{
    color: #e6ecf3;
    font-size: 14px;
  }
.scr-register-2 .input-icon,
.scr-register-2 .input-icon-right{
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
.scr-register-2 .input-icon-right{
    cursor: pointer;
  }
.scr-register-2 .password-strength{
    display: flex;
    gap: 6px;
    padding: 2px 18px 0;
  }
.scr-register-2 .strength-bar{
    height: 4px;
    flex: 1;
    border-radius: 2px;
  }
.scr-register-2 .strength-bar.active{
    background: linear-gradient(90deg, #c9d4e1 0%, #f2f5f9 100%);
  }
.scr-register-2 .strength-bar.inactive{
    background-color: rgba(255, 255, 255, 0.12);
  }
.scr-register-2 .helper-text{
    color: #8597ab;
    font-size: 12px;
    line-height: 1.4;
    padding: 0 18px;
  }
.scr-register-2 .captcha-row{
    display: flex;
    gap: 8px;
  }
.scr-register-2 .captcha-input-wrapper{
    flex: 1;
  }
.scr-register-2 .captcha-box{
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
    position: relative;
    overflow: hidden;
    user-select: none;
  }
/* two faint strokes across the code, the way a printed captcha is scrambled */
.scr-register-2 .captcha-box::before,
.scr-register-2 .captcha-box::after{
    content: '';
    position: absolute;
    left: -12%;
    right: -12%;
    height: 1.5px;
    background-color: rgba(26, 44, 68, 0.38);
    pointer-events: none;
  }
.scr-register-2 .captcha-box::before{
    top: 31%;
    transform: rotate(-7deg);
  }
.scr-register-2 .captcha-box::after{
    top: 68%;
    transform: rotate(6deg);
  }
.scr-register-2 .captcha-text{
    color: #1a2c44;
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1px;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
  }
.scr-register-2 .captcha-text span{
    display: inline-block;
    width: 14px;
    text-align: center;
  }
.scr-register-2 .refresh-btn{
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    padding: 4px;
  }
.scr-register-2 .checkbox-group{
    display: flex;
    gap: 10px;
    margin-top: 24px;
    align-items: flex-start;
    cursor: pointer;
  }
.scr-register-2 .checkbox-icon{
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background: linear-gradient(180deg, #f2f5f9 0%, #c4cfdc 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
.scr-register-2 .checkbox-text{
    color: #d3dce7;
    font-size: 12px;
    line-height: 1.5;
  }
.scr-register-2 .checkbox-text a{
    color: #ffffff;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }
.scr-register-2 .checkbox-text a:hover{
    opacity: 0.8;
  }
.scr-register-2 .actions-section{
    padding: 24px 24px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
.scr-register-2 .submit-btn{
    width: 100%;
    height: 52px;
    border-radius: 26px;
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    font-size: 16px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    margin-bottom: 20px;
    transition: opacity 0.2s;
  }
.scr-register-2 .submit-btn:active{
    opacity: 0.8;
  }
.scr-register-2 .disclaimer-text{
    color: #7f90a5;
    font-size: 11px;
    line-height: 1.5;
    text-align: center;
    max-width: 310px;
  }
.scr-register-2 .logos{
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 24px;
    margin-bottom: 24px;
  }
.scr-register-2 .logos img{
    height: 22px;
    object-fit: contain;
  }
.scr-register-2 .footer-section{
    padding: 0 16px 24px;
    margin-top: auto;
  }
.scr-register-2 .info-box{
    background-color: rgba(201, 212, 225, 0.1);
    border-radius: 16px;
    padding: 12px 14px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
.scr-register-2 .info-icon-wrapper{
    padding-top: 2px;
    flex-shrink: 0;
  }
.scr-register-2 .info-text{
    color: #d3dce7;
    font-size: 11px;
    line-height: 1.5;
  }
.scr-register-2 .info-text a{
    color: #ffffff;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }
.scr-register-2 .info-text a:hover{
    opacity: 0.8;
  }
/* figma re-sync */
.scr-register-2 .main-title.main-title { font-size: 24px; }
.scr-register-2 .captcha-text.captcha-text { font-size: 18px; }
.scr-register-2 .submit-btn.submit-btn { font-weight: 600; }
/* the Figma frame has no error state */
.scr-register-2 .form-error{
    margin: 12px 2px 0;
    font-size: 12px;
    line-height: 18px;
    color: #f5808f;
  }
.scr-register-2 .submit-btn:disabled{
    opacity: 0.6;
  }
/* unchecked reads as an empty circle, the tick only shows once accepted */
.scr-register-2 .checkbox-icon img{
    opacity: 0;
    transition: opacity 0.12s ease;
  }
.scr-register-2 .checkbox-icon.active img{
    opacity: 1;
  }
`;

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCaptcha = () =>
  Array.from({ length: 4 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join('');

const readDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem('pscryp.register') || 'null');
  } catch {
    return null;
  }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register2() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [draft] = useState(readDraft);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState('');
  // a fixed seed would show the same code on every visit, so the first captcha
  // is rolled per mount like every refresh after it
  const [captchaCode, setCaptchaCode] = useState(newCaptcha);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // step 1 owns username + referral, so landing here directly means starting over
  if (!draft?.username) return <Navigate to="/register" replace />;

  // the format is free — the meter only tracks length, the single rule that applies
  const strength = [
    password.length >= 8,
    password.length >= 10,
    password.length >= 12,
    password.length >= 16,
  ].filter(Boolean).length;

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
    if (!phone.trim()) {
      setError('Nomor telepon wajib diisi.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Format email tidak valid.');
      return;
    }
    if (password.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }
    if (password !== password2) {
      setError('Konfirmasi kata sandi tidak sama.');
      return;
    }
    if (!captcha.trim()) {
      setError('Kode captcha wajib diisi.');
      return;
    }
    if (captcha.trim().toUpperCase() !== captchaCode) {
      setError('Kode captcha tidak sesuai.');
      return;
    }
    if (!terms) {
      setError('Centang persetujuan Syarat & Ketentuan dan Kebijakan Privasi terlebih dahulu.');
      return;
    }
    setError('');
    setBusy(true);

    // only the fields the design has — full_name and withdraw_pin stay out
    const payload = {
      username: draft.username,
      referral_code: draft.referral_code,
      phone: normalizePhone(phone),
      email: email.trim(),
      password,
      password2,
    };

    try {
      await signUp(payload);
    } catch (err) {
      setError(err.message);
      setBusy(false);
      return;
    }

    sessionStorage.removeItem('pscryp.register');
    // the invite link that locked the referral field is spent once the account exists
    sessionStorage.removeItem('pscryp.register.ref');
    // no session is opened on purpose: the new account has to sign in first, which
    // keeps throwaway sign-ups out of the app. the loading screen is the hand-off
    // and forwards the email so the login form comes prefilled
    navigate('/register/loading', { replace: true, state: { email: email.trim() } });
  };

  return (
    <div className="scr-register-2">
      <style>{css}</style>
      <section id="section-header" className="header-section">
        <nav className="nav-bar">
          <button className="back-btn" aria-label={t('Kembali')} data-back="1">
            <img src="/assets/img/f77e40de90.svg" alt="" />
          </button>
        </nav>
        <div className="title-area">
          <h1 className="main-title">{t('Lengkapi Data')}</h1>
          <p className="subtitle">{t('Sedikit lagi, lengkapi data berikut untuk menyelesaikan pendaftaran.')}</p>
        </div>
      </section>
      <section id="section-form" className="form-section">
        <div className="form-card">
          <form>
            
            <div className="input-group">
              <label>{t('Nomor Telepon')}</label>
              <div className="input-wrapper">
                <div className="phone-prefix">
                  <span>+62</span>
                </div>
                <input
                  type="tel"
                  placeholder={t('Masukkan nomor ponsel aktif')}
                  autoComplete="tel-national"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </div>
      
            
            <div className="input-group">
              <label>{t('Email')}</label>
              <div className="input-wrapper">
                <img src="/assets/img/eb68a5b11e.svg" alt="" className="input-icon" />
                <input
                  type="email"
                  placeholder={t('Masukkan email aktif')}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>
      
            
            <div className="input-group">
              <label>{t('Kata Sandi')}</label>
              <div className="input-wrapper">
                <img src="/assets/img/a9ca914b1e.svg" alt="" className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('Minimal 8 karakter')}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <img
                  src="/assets/img/bd4a34827b.svg"
                  alt="Tampilkan kata sandi"
                  className="input-icon-right"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowPassword((current) => !current);
                  }}
                />
              </div>
              <div className="password-strength">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`strength-bar${index < strength ? " active" : " inactive"}`}
                  ></div>
                ))}
              </div>
              <p className="helper-text">{t('Minimal 8 karakter, bebas kombinasi huruf, angka, atau simbol.')}</p>
            </div>
      
            
            <div className="input-group">
              <label>{t('Konfirmasi Kata Sandi')}</label>
              <div className="input-wrapper">
                <img src="/assets/img/a9ca914b1e.svg" alt="" className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('Ulangi kata sandi')}
                  autoComplete="new-password"
                  value={password2}
                  onChange={(event) => setPassword2(event.target.value)}
                />
                <img
                  src="/assets/img/bd4a34827b.svg"
                  alt="Tampilkan kata sandi"
                  className="input-icon-right"
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
      
            
            <div className="input-group">
              <label>{t('Kode Captcha')}</label>
              <div className="captcha-row">
                <div className="input-wrapper captcha-input-wrapper">
                  <input
                    type="text"
                    placeholder={t('Masukkan kode')}
                    value={captcha}
                    required
                    aria-required="true"
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
                    className="refresh-btn"
                    aria-label={t('Perbarui Captcha')}
                    onClick={(event) => {
                      event.stopPropagation();
                      rollCaptcha();
                    }}
                  >
                    <img src="/assets/img/ae1113f54d.svg" alt="" />
                  </button>
                </div>
              </div>
              <p className="helper-text">{t('Ketik ulang kode yang tampil di kotak sebelah kanan ke kolom ini. Kode tidak bisa dibaca? Ketuk ikon putar untuk mengganti kode baru.')}</p>
            </div>
      
            
            <div
              className="checkbox-group"
              role="checkbox"
              aria-checked={terms}
              tabIndex={0}
              onClick={(event) => {
                // the legal links inside the label leave the form, they must not tick the box
                if (event.target.closest('a')) return;
                event.stopPropagation();
                setTerms((current) => !current);
              }}
              onKeyDown={(event) => {
                if (event.key !== ' ' && event.key !== 'Enter') return;
                event.preventDefault();
                event.stopPropagation();
                setTerms((current) => !current);
              }}
            >
              <div className={`checkbox-icon${terms ? " active" : ""}`}>
                <img src="/assets/img/6fcacca506.svg" alt="" />
              </div>
              <p className="checkbox-text">{t('Saya menyetujui')} <a href="#" data-route="/legal/syarat-ketentuan">Syarat &amp; Ketentuan</a> {t('serta')} <a href="#" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a> {t('yang berlaku.')}</p>
            </div>
            {error && <p className="form-error">{error}</p>}
          </form>
        </div>
      </section>
      <section id="section-actions" className="actions-section">
        <button
          className="submit-btn"
          type="submit"
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            submit(event);
          }}
        >
          {busy ? 'Memproses…' : 'Daftar'}
        </button>
        <p className="disclaimer-text">{t('Data yang kamu masukkan hanya digunakan untuk keperluan proses registrasi akun di aplikasi ini. Kami tidak akan membagikan, menjual, atau menggunakan data kamu untuk tujuan lain di luar proses pendaftaran tanpa persetujuan darimu.')}</p>
        <div className="logos">
          <img src="/assets/img/OJK.png" alt="OJK" />
          <img src="/assets/img/BAPPEBTI.png" alt="BAPPEBTI" />
        </div>
      </section>
      <section id="section-footer" className="footer-section">
        <div className="info-box">
          <div className="info-icon-wrapper">
            <img src="/assets/img/1039aba1ee.svg" alt="" />
          </div>
          <p className="info-text">{t('Dengan mendaftar, saya menyatakan bahwa saya sudah dewasa dan menerima ketentuan-ketentuan')} <a href="#" data-route="/legal/perjanjian-klien">{t('Perjanjian Klien')}</a> {t('dan')} <a href="#" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a>.</p>
        </div>
      </section>
    </div>
  );
}
