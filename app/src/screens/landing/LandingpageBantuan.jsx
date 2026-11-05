// landingpage-bantuan — ported from the Figma export, typography re-synced to Figma
import { useEffect, useRef, useState } from 'react';
import { session } from '../../lib/api.js';
import { t } from '../../lib/i18n.js';

const MESSAGE_LIMIT = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// there is no contact endpoint yet, so a signed-in visitor at least gets the
// name and email fields filled in from the stored session
const initialValues = () => {
  const user = session.user || {};
  return {
    name: String(user.full_name || user.username || '').trim(),
    email: String(user.email || '').trim(),
    message: '',
  };
};

const css = `
/* landingpage-bantuan — ported from Figma export, typography re-synced */
.scr-landingpage-bantuan *{
  box-sizing: border-box;
}
.scr-landingpage-bantuan #section-header{
    width: 100%;
    max-width: 100%;
  }
.scr-landingpage-bantuan .site-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
  }
.scr-landingpage-bantuan .header-logo{
    width: 51px;
    height: 51px;
    object-fit: contain;
  }
.scr-landingpage-bantuan .menu-toggle{
    background-color: #1f3048;
    border: none;
    border-radius: 16px;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    padding: 0;
  }
.scr-landingpage-bantuan .menu-toggle img{
    width: 16px;
    height: 16px;
  }
.scr-landingpage-bantuan #section-hero{
    width: 100%;
    max-width: 100%;
    padding: 26px 16px 0;
  }
.scr-landingpage-bantuan .hero-content{
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
.scr-landingpage-bantuan .breadcrumb{
    font-size: 12px;
    color: #a9b7c8;
    line-height: 1.5;
  }
.scr-landingpage-bantuan .hero-title{
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    line-height: 1.2;
  }
.scr-landingpage-bantuan .hero-subtitle{
    font-size: 14px;
    color: #a9b7c8;
    margin: 0;
    line-height: 1.5;
  }
.scr-landingpage-bantuan #section-form{
    width: 100%;
    max-width: 100%;
    padding: 24px 16px 0;
  }
.scr-landingpage-bantuan .contact-form{
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
.scr-landingpage-bantuan .form-group{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-landingpage-bantuan .form-label{
    font-size: 12px;
    color: #d3dce7;
    font-weight: 600;
    display: flex;
    gap: 2px;
  }
.scr-landingpage-bantuan .required{
    color: #f2667a;
  }
.scr-landingpage-bantuan .form-input,
.scr-landingpage-bantuan .form-textarea{
    background-color: #1f3048;
    border: 1px solid #2f4560;
    border-radius: 14px;
    padding: 14px;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    width: 100%;
    outline: none;
  }
.scr-landingpage-bantuan .form-input::placeholder,
.scr-landingpage-bantuan .form-textarea::placeholder{
    color: #75879c;
    opacity: 1;
  }
.scr-landingpage-bantuan .form-input:focus,
.scr-landingpage-bantuan .form-textarea:focus{
    border-color: #4a6b94;
  }
.scr-landingpage-bantuan .form-textarea{
    resize: vertical;
    min-height: 132px;
  }
.scr-landingpage-bantuan .char-count{
    font-size: 10px;
    color: #75879c;
    text-align: right;
    margin-top: -2px;
  }
.scr-landingpage-bantuan .char-count.near-limit{
    color: #f5808f;
  }
.scr-landingpage-bantuan .form-input.invalid,
.scr-landingpage-bantuan .form-textarea.invalid{
    border-color: #f5808f;
  }
.scr-landingpage-bantuan .form-error{
    font-size: 12px;
    line-height: 18px;
    color: #f5808f;
    margin: -2px 2px 0;
  }
.scr-landingpage-bantuan .submit-btn:disabled{
    opacity: 0.6;
    cursor: default;
  }
.scr-landingpage-bantuan .success-card{
    background-color: rgba(31, 48, 72, 0.6);
    border: 1px solid #2f4560;
    border-radius: 20px;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
  }
.scr-landingpage-bantuan .success-icon{
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    font-size: 22px;
    font-weight: 700;
    display: flex;
    justify-content: center;
    align-items: center;
  }
.scr-landingpage-bantuan .success-title{
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }
.scr-landingpage-bantuan .success-text{
    font-size: 13px;
    color: #a9b7c8;
    line-height: 1.5;
    margin: 0;
  }
.scr-landingpage-bantuan .success-text strong{
    color: #ffffff;
    font-weight: 600;
  }
.scr-landingpage-bantuan .success-btn{
    margin-top: 6px;
    background: transparent;
    border: 1px solid #4a6b94;
    color: #d3dce7;
    border-radius: 20px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
  }
.scr-landingpage-bantuan .form-submit-wrapper{
    margin-top: 4px;
  }
.scr-landingpage-bantuan .submit-btn{
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    border: none;
    border-radius: 24px;
    padding: 15px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Inter', sans-serif;
  }
.scr-landingpage-bantuan #section-info{
    width: 100%;
    max-width: 100%;
    padding: 16px 16px 32px;
  }
.scr-landingpage-bantuan .info-container{
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }
.scr-landingpage-bantuan .info-icon-wrapper{
    padding-top: 2px;
  }
.scr-landingpage-bantuan .info-icon{
    width: 16px;
    height: 16px;
    display: block;
  }
.scr-landingpage-bantuan .info-text{
    font-size: 12px;
    color: #8597ab;
    line-height: 1.5;
    margin: 0;
    flex: 1;
  }
.scr-landingpage-bantuan #section-footer{
    width: 100%;
    max-width: 100%;
    margin-top: auto;
  }
.scr-landingpage-bantuan .site-footer{
    background-color: rgba(4, 9, 18, 0.35);
    border-top: 1px solid #1c2d44;
    padding: 28px 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
.scr-landingpage-bantuan .footer-logo{
    width: 44px;
    height: 44px;
    object-fit: contain;
  }
.scr-landingpage-bantuan .footer-desc{
    font-size: 12px;
    color: #8597ab;
    line-height: 1.5;
    margin: 0;
  }
.scr-landingpage-bantuan .footer-links-grid{
    display: flex;
    gap: 16px;
    justify-content: space-between;
  }
.scr-landingpage-bantuan .footer-column{
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }
.scr-landingpage-bantuan .column-title{
    font-size: 12px;
    color: #ffffff;
    font-weight: 700;
    margin: 0;
  }
.scr-landingpage-bantuan .footer-link{
    font-size: 12px;
    color: #8597ab;
    text-decoration: none;
    line-height: 1.2;
  }
.scr-landingpage-bantuan .footer-link:hover{
    color: #ffffff;
  }
.scr-landingpage-bantuan .footer-partners{
    display: flex;
    gap: 10px;
    align-items: center;
  }
.scr-landingpage-bantuan .partner-logo{
    height: 22px;
    object-fit: contain;
    border-radius: 5px;
  }
.scr-landingpage-bantuan .ojk-logo{
    width: 49px;
  }
.scr-landingpage-bantuan .bappebti-logo{
    width: 68px;
  }
.scr-landingpage-bantuan .footer-disclaimer{
    border-top: 1px solid rgba(201, 212, 225, 0.14);
    padding-top: 16px;
  }
.scr-landingpage-bantuan .footer-disclaimer p{
    font-size: 10px;
    color: #51657e;
    line-height: 1.5;
    margin: 0;
  }
.scr-landingpage-bantuan .footer-copyright{
    font-size: 10px;
    color: #75879c;
    margin-top: -8px;
  }
/* figma re-sync */
.scr-landingpage-bantuan .breadcrumb.breadcrumb { font-size: 14px; }
.scr-landingpage-bantuan .breadcrumb.breadcrumb { line-height: 21px; }
.scr-landingpage-bantuan .char-count.char-count { font-size: 11px; }
.scr-landingpage-bantuan .submit-btn.submit-btn { font-size: 15px; }
.scr-landingpage-bantuan .footer-link.footer-link { color: #8597AB; }
.scr-landingpage-bantuan .footer-copyright.footer-copyright { font-size: 11px; }
`;

export default function LandingpageBantuan() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const update = (field) => (event) => {
    const next = event.target.value;
    setValues((prev) => ({
      ...prev,
      [field]: field === 'message' ? next.slice(0, MESSAGE_LIMIT) : next,
    }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  const validate = () => {
    const next = {};
    if (values.name.trim().length < 2) next.name = 'Nama minimal 2 karakter.';
    if (!EMAIL_RE.test(values.email.trim())) next.email = 'Masukkan alamat email yang valid.';
    if (values.message.trim().length < 10) next.message = 'Pesan minimal 10 karakter.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // no inbox behind the prototype, so a valid form resolves after a short delay
  const submit = (event) => {
    event.preventDefault();
    if (status === 'sending' || !validate()) return;
    setStatus('sending');
    timer.current = setTimeout(() => setStatus('sent'), 900);
  };

  const reset = () => {
    setValues({ name: '', email: '', message: '' });
    setErrors({});
    setStatus('idle');
  };

  return (
    <div className="scr-landingpage-bantuan">
      <style>{css}</style>
      <section id="section-header">
        <header className="site-header">
          <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" className="header-logo" />
          <button className="menu-toggle" aria-label={t('Menu')} data-route="/landing/v2">
            <img src="/assets/img/ab9ce508a0.svg" alt="" />
          </button>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero-content">
          <div className="breadcrumb">{t('Beranda › Pusat Bantuan')}</div>
          <h1 className="hero-title">{t('Ada yang bisa kami')}<br />{t('bantu?')}</h1>
          <p className="hero-subtitle">{t('Tinggalkan pesan melalui formulir di bawah. Tim')}<br />{t('kami akan menghubungimu melalui email.')}</p>
        </div>
      </section>
      <section id="section-form">
        {status === 'sent' ? (
          <div className="success-card" role="status" aria-live="polite">
            <div className="success-icon">✓</div>
            <h2 className="success-title">{t('Pesan terkirim')}</h2>
            <p className="success-text">
              Terima kasih, {values.name.trim() || 'kak'}. Tim kami akan membalas ke{' '}
              <strong>{values.email.trim()}</strong> {t('maksimal 1×24 jam pada hari kerja.')}
            </p>
            <button
              type="button"
              className="success-btn"
              onClick={(event) => {
                event.stopPropagation();
                reset();
              }}
            >
              {t('Kirim pesan lain')}
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="bantuan-name">{t('Nama')} <span className="required">*</span></label>
              <input
                id="bantuan-name"
                type="text"
                className={`form-input${errors.name ? ' invalid' : ''}`}
                placeholder={t('Masukkan nama kamu')}
                value={values.name}
                onChange={update('name')}
                aria-invalid={Boolean(errors.name)}
                maxLength={60}
              />
              {errors.name ? <p className="form-error">{errors.name}</p> : null}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bantuan-email">{t('Email')} <span className="required">*</span></label>
              <input
                id="bantuan-email"
                type="email"
                className={`form-input${errors.email ? ' invalid' : ''}`}
                placeholder={t('Masukkan email kamu')}
                value={values.email}
                onChange={update('email')}
                aria-invalid={Boolean(errors.email)}
                maxLength={120}
              />
              {errors.email ? <p className="form-error">{errors.email}</p> : null}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bantuan-message">{t('Pesan')} <span className="required">*</span></label>
              <textarea
                id="bantuan-message"
                className={`form-textarea${errors.message ? ' invalid' : ''}`}
                placeholder={t('Tulis pertanyaan atau kendala kamu…')}
                value={values.message}
                onChange={update('message')}
                aria-invalid={Boolean(errors.message)}
                maxLength={MESSAGE_LIMIT}
              ></textarea>
              <div className={`char-count${values.message.length >= MESSAGE_LIMIT - 50 ? ' near-limit' : ''}`}>
                {values.message.length}/{MESSAGE_LIMIT}
              </div>
              {errors.message ? <p className="form-error">{errors.message}</p> : null}
            </div>

            <div className="form-submit-wrapper">
              <button
                type="submit"
                className="submit-btn"
                disabled={status === 'sending'}
                onClick={(event) => event.stopPropagation()}
              >
                {status === 'sending' ? 'Mengirim…' : 'Kirim Pesan'}
              </button>
            </div>
          </form>
        )}
      </section>
      <section id="section-info">
        <div className="info-container">
          <div className="info-icon-wrapper">
            <img src="/assets/img/b8edc42ab6.svg" alt="Info" className="info-icon" />
          </div>
          <p className="info-text">{t('Tim kami akan membalas melalui email dalam waktu maksimal 1×24 jam pada hari kerja.')}</p>
        </div>
      </section>
      <section id="section-footer">
        <footer className="site-footer">
          <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" className="footer-logo" />
          
          <p className="footer-desc">{t('Platform aset kripto yang mudah, aman, dan transparan untuk semua orang.')}</p>
          
          <div className="footer-links-grid">
            <div className="footer-column">
              <h3 className="column-title">{t('Produk')}</h3>
              <a href="#" className="footer-link" data-route="/landing/holding">{t('Holding')}</a>
              <a href="#" className="footer-link" data-route="/landing/hadiah">{t('Hadiah')}</a>
              <a href="#" className="footer-link" data-route="/landing/referral">{t('Program Referral')}</a>
            </div>
            
            <div className="footer-column">
              <h3 className="column-title">{t('Perusahaan')}</h3>
              <a href="#" className="footer-link" data-route="/landing/tentang">{t('Tentang Kami')}</a>
              <a href="#" className="footer-link" data-route="/landing/bantuan">{t('Pusat Bantuan')}</a>
            </div>
            
            <div className="footer-column">
              <h3 className="column-title">{t('Legal')}</h3>
              <a href="#" className="footer-link" data-route="/legal/syarat-ketentuan">{t('Syarat & Ketentuan')}</a>
              <a href="#" className="footer-link" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a>
              <a href="#" className="footer-link" data-route="/legal/perjanjian-klien">{t('Perjanjian Klien')}</a>
            </div>
          </div>
          
          <div className="footer-partners">
            <img src="/assets/img/OJK.png" alt="OJK" className="partner-logo ojk-logo" />
            <img src="/assets/img/BAPPEBTI.png" alt="BAPPEBTI" className="partner-logo bappebti-logo" />
          </div>
          
          <div className="footer-disclaimer">
            <p>{t('Aset kripto adalah komoditas yang memiliki risiko tinggi. Est. APR bukan jaminan imbal hasil dan dapat berubah sewaktu-waktu. Lorem ipsum dolor sit amet, consectetur adipiscing elit.')}</p>
          </div>
          
          <div className="footer-copyright">
            {t('© 2026 PasarCryptoIDN. Hak cipta dilindungi.')}
          </div>
        </footer>
      </section>
    </div>
  );
}
