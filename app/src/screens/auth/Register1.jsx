import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { t } from '../../lib/i18n.js';

// register-1 — ported from the Figma export, typography re-synced to Figma
const css = `
/* register-1 — ported from Figma export, typography re-synced */
.scr-register-1{
  margin: 0 auto;
  padding: 0;
  width: 100%;
  background-color: #0c1a2d;
  background-image: 
    radial-gradient(circle at 70% 0%, rgba(78, 108, 142, 0.55) 0%, transparent 50%),
    radial-gradient(circle at 60% 20%, rgba(44, 72, 104, 0.45) 0%, transparent 50%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 38%, #0f2036 70%, #0a1626 100%);
  min-height: 100cqh;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  color: #ffffff;
  box-sizing: border-box;
  overflow-x: hidden;
}
.scr-register-1 *{
  box-sizing: border-box;
}
.scr-register-1 input,
.scr-register-1 button{
  font-family: inherit;
}
.scr-register-1 .hero-section{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 48px;
}
.scr-register-1 .hero-image{
  width: 100%;
  height: auto;
  display: block;
}
.scr-register-1 .hero-text-container{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}
.scr-register-1 .hero-title{
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  text-align: center;
}
.scr-register-1 .hero-subtitle{
  font-size: 14px;
  color: #a9b7c8;
  text-align: center;
  margin: 6px 0 0 0;
  line-height: 1.4;
}
.scr-register-1 .form-section{
  padding: 28px 16px 0;
}
.scr-register-1 .form-card{
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
}
.scr-register-1 .form-group{
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scr-register-1 .form-label{
  font-size: 12px;
  color: #d3dce7;
  margin: 0;
}
.scr-register-1 .input-wrapper{
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 25px;
  height: 52px;
  padding: 0 18px;
  gap: 10px;
}
.scr-register-1 .input-icon{
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.scr-register-1 .form-input{
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 14px;
  width: 100%;
  outline: none;
}
.scr-register-1 .form-input::placeholder{
  color: #75879c;
}
.scr-register-1 .form-helper{
  font-size: 12px;
  color: #8597ab;
  margin: 0;
  padding-left: 18px;
}
.scr-register-1 .actions-section{
  padding: 28px 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.scr-register-1 .btn-primary{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 52px;
  border-radius: 26px;
  background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
  border: none;
  color: #0c1a2d;
  font-size: 16px;
  font-weight: 700;
  gap: 8px;
  cursor: pointer;
}
.scr-register-1 .btn-icon{
  width: 18px;
  height: 18px;
}
.scr-register-1 .login-link{
  font-size: 14px;
  color: #ffffff;
  margin: 0;
}
.scr-register-1 .login-link a{
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  cursor: pointer;
}
.scr-register-1 .login-link a:hover{
  opacity: 0.8;
}
.scr-register-1 .disclaimer-section{
  padding: 8px 24px 16px;
}
.scr-register-1 .disclaimer-text{
  font-size: 11px;
  color: #7f90a5;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}
.scr-register-1 .footer-section{
  padding: 0 16px 24px;
  margin-top: auto;
}
.scr-register-1 .info-card{
  display: flex;
  background-color: rgba(201, 212, 225, 0.1);
  border-radius: 16px;
  padding: 12px 14px;
  gap: 10px;
  align-items: flex-start;
}
.scr-register-1 .info-icon{
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}
.scr-register-1 .info-text{
  font-size: 11px;
  color: #ffffff;
  margin: 0;
  line-height: 1.5;
}
.scr-register-1 .info-text a{
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  cursor: pointer;
}
.scr-register-1 .info-text a:hover{
  opacity: 0.8;
}
/* figma re-sync */
.scr-register-1 .form-label.form-label { font-size: 13px; }
/* the Figma frame has no error state */
.scr-register-1 .form-error{
    margin: 10px 2px 0;
    font-size: 12px;
    line-height: 18px;
    color: #f5808f;
  }
.scr-register-1 .btn-primary:disabled{
    opacity: 0.6;
  }
.scr-register-1 .required-mark{
    color: #f5808f;
    margin-left: 2px;
  }
/* an invite link owns the code, so the field reads as locked instead of editable */
.scr-register-1 .input-wrapper.is-locked{
    background-color: rgba(255, 255, 255, 0.04);
    cursor: not-allowed;
  }
.scr-register-1 .input-wrapper.is-locked .form-input{
    color: #a9b7c8;
    cursor: not-allowed;
  }
.scr-register-1 .input-wrapper.is-locked .input-icon{
    opacity: 0.6;
  }
`;

// an invite link carries the referrer's code in the query string; when the page
// opens that way the code is fixed for this sign-up and cannot be edited or cleared
const LINK_KEYS = ['ref', 'referral', 'referral_code', 'kode'];
const LINKED_KEY = 'pscryp.register.ref';

const linkedReferral = (params) => {
  for (const key of LINK_KEYS) {
    const value = params.get(key)?.trim();
    if (value) return value;
  }
  // the query string is dropped once the visitor moves around the app, so the
  // linked code survives on sessionStorage for the rest of the sign-up
  return sessionStorage.getItem(LINKED_KEY) || '';
};

export default function Register1() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [linkedCode] = useState(() => {
    const code = linkedReferral(params);
    if (code) sessionStorage.setItem(LINKED_KEY, code);
    return code;
  });
  const [username, setUsername] = useState('');
  const [referral, setReferral] = useState(linkedCode);
  const [error, setError] = useState('');

  const locked = Boolean(linkedCode);

  // the two fields of step 1 travel to step 2 through sessionStorage
  const submit = (event) => {
    event.preventDefault();
    const name = username.trim();
    if (!/^[A-Za-z0-9]{4,16}$/.test(name)) {
      setError('Username 4–16 karakter, hanya huruf dan angka.');
      return;
    }
    if (!referral.trim()) {
      setError('Kode referral wajib diisi.');
      return;
    }
    setError('');
    sessionStorage.setItem(
      'pscryp.register',
      // the backend matches referral codes case-sensitively, so send as typed
      JSON.stringify({ username: name, referral_code: referral.trim() })
    );
    navigate('/register/step-2');
  };

  return (
    <div className="scr-register-1">
      <style>{css}</style>
      <section id="section-hero">
        <div className="hero-section">
          <img src="/assets/img/c6b28f5be1.png" alt="Hero Image" className="hero-image" />
          <div className="hero-text-container">
            <h1 className="hero-title">{t('Buat Akun Baru')}</h1>
            <p className="hero-subtitle">{t('Mulai dengan membuat username')}<br />{t('untuk akunmu.')}</p>
          </div>
        </div>
      </section>
      <section id="section-form">
        <div className="form-section">
          <div className="form-card">
            <form className="registration-form" onSubmit={submit} noValidate>
              <div className="form-group">
                <label className="form-label">{t('Username')}</label>
                <div className="input-wrapper">
                  <img src="/assets/img/de769adeec.svg" alt="User Icon" className="input-icon" />
                  <input
                    type="text"
                    placeholder={t('Masukkan username')}
                    className="form-input"
                    autoComplete="username"
                    maxLength={16}
                    value={username}
                    onChange={(event) =>
                      // the field only takes letters and digits, and the cap holds
                      // even when the value arrives pasted rather than typed
                      setUsername(event.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 16))
                    }
                  />
                </div>
                <p className="form-helper">{t('4–16 karakter, hanya huruf dan angka.')}</p>
              </div>
              <div className="form-group" style={{ marginTop: "18px" }}>
                <label className="form-label">
                  {t('Kode Referral')} <span className="required-mark">*</span>
                </label>
                <div className={`input-wrapper${locked ? ' is-locked' : ''}`}>
                  <img src="/assets/img/6557fb79c7.svg" alt="Gift Icon" className="input-icon" />
                  <input
                    type="text"
                    placeholder={t('Masukkan kode referral')}
                    className="form-input"
                    value={referral}
                    readOnly={locked}
                    required
                    aria-required="true"
                    aria-readonly={locked || undefined}
                    onChange={(event) => {
                      if (locked) return;
                      setReferral(event.target.value);
                    }}
                  />
                </div>
                {locked && (
                  <p className="form-helper">{t('Kode dari tautan undangan, tidak dapat diubah.')}</p>
                )}
              </div>
              {error && <p className="form-error">{error}</p>}
            </form>
          </div>
        </div>
      </section>
      <section id="section-actions">
        <div className="actions-section">
          <button
            className="btn-primary"
            type="submit"
            onClick={(event) => {
              event.stopPropagation();
              submit(event);
            }}
          >
            {t('Lanjut')}
            <img src="/assets/img/79e1893f60.svg" alt="Arrow Right" className="btn-icon" />
          </button>
          <p className="login-link">{t('Sudah punya akun?')} <a href="#" data-route="/login">{t('Masuk')}</a></p>
        </div>
      </section>
      <section id="section-disclaimer">
        <div className="disclaimer-section">
          <p className="disclaimer-text">
            {t('Data yang kamu masukkan hanya digunakan untuk keperluan proses registrasi akun di aplikasi ini. Kami tidak akan membagikan, menjual, atau menggunakan data kamu untuk tujuan lain di luar proses pendaftaran tanpa persetujuan darimu.')}
          </p>
        </div>
      </section>
      <section id="section-footer">
        <div className="footer-section">
          <div className="info-card">
            <img src="/assets/img/1039aba1ee.svg" alt="Info Icon" className="info-icon" />
            <p className="info-text">
              {t('Dengan mendaftar, saya menyatakan bahwa saya sudah dewasa dan menerima ketentuan-ketentuan')} <a href="#" data-route="/legal/perjanjian-klien">{t('Perjanjian Klien')}</a> {t('dan')} <a href="#" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
