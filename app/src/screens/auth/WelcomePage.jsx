import { t } from '../../lib/i18n.js';
// welcome-page — ported from the Figma export, typography re-synced to Figma
const css = `
/* welcome-page — ported from Figma export, typography re-synced */
.scr-welcome-page *{
  box-sizing: border-box;
}
.scr-welcome-page{
  width: 100%;
  margin: 0 auto;
}
.scr-welcome-page #section-welcome{
  width: 100%;
  display: flex;
  justify-content: center;
}
.scr-welcome-page .app-container{
  width: 100%;
  height: 100cqh;
  background-image: url('/assets/img/bg-welcome.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  overflow: hidden;
}
.scr-welcome-page .content-wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 40px 24px;
  gap: 6px;
  text-align: center;
  width: 100%;
  z-index: 1;
}
.scr-welcome-page .heading-container{
  width: 100%;
  display: flex;
  justify-content: center;
}
.scr-welcome-page .heading{
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}
.scr-welcome-page .subtitle-container{
  width: 100%;
  max-width: 280px;
  display: flex;
  justify-content: center;
}
.scr-welcome-page .subtitle{
  color: #a9b7c8;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}
.scr-welcome-page .button-container{
  width: 100%;
  padding-top: 4px;
  display: flex;
  justify-content: center;
}
.scr-welcome-page .btn-primary{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 364px;
  height: 52px;
  border-radius: 26px;
  background: linear-gradient(270deg, #625853 0%, #bdac9f 46.63%, #686868 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}
.scr-welcome-page .btn-primary:hover{
  opacity: 0.9;
}
.scr-welcome-page .btn-primary:active{
  transform: scale(0.98);
}
.scr-welcome-page .login-container{
  width: 100%;
  padding-top: 14px;
  display: flex;
  justify-content: center;
}
.scr-welcome-page .login-text{
  color: #ffffff;
  font-size: 14px;
  margin: 0;
}
.scr-welcome-page .login-link{
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
}
.scr-welcome-page .login-link:hover{
  text-decoration: underline;
}
.scr-welcome-page .terms-container{
  width: 100%;
  max-width: 290px;
  margin-top: 6px;
  display: flex;
  justify-content: center;
}
.scr-welcome-page .terms-text{
  color: #8597ab;
  font-size: 12px;
  margin: 0;
  line-height: 1.5;
}
.scr-welcome-page .terms-text a{
  color: #e6ecf3;
  text-decoration: none;
  font-weight: 600;
}
.scr-welcome-page .terms-text a:hover{
  text-decoration: underline;
}
@media (max-height: 700px){.scr-welcome-page .app-container{
    height: 100cqh;
  }
.scr-welcome-page .content-wrapper{
    padding-bottom: 24px;
  }}
/* figma re-sync */
.scr-welcome-page .heading.heading { font-size: 28px; }
.scr-welcome-page .heading.heading { line-height: 36px; }
.scr-welcome-page .btn-primary.btn-primary { font-weight: 600; }
`;

export default function WelcomePage() {
  return (
    <div className="scr-welcome-page">
      <style>{css}</style>
      <section id="section-welcome">
        <div className="app-container">
          <div className="content-wrapper">
            <div className="heading-container">
              <h1 className="heading">{t('Selamat Datang')}</h1>
            </div>
            
            <div className="subtitle-container">
              <p className="subtitle">{t('Daftar sekarang dan mulai dapatkan penghasilan dari koneksimu.')}</p>
            </div>
            
            <div className="button-container">
              <a href="#" className="btn-primary" data-route="/register">{t('Daftar')}</a>
            </div>
            
            <div className="login-container">
              <p className="login-text">{t('Sudah punya akun?')} <a href="#" className="login-link" data-route="/login">{t('Masuk')}</a></p>
            </div>
            
            <div className="terms-container">
              <p className="terms-text">
                {t('Dengan mengetuk Daftar, saya menyetujui')} 
                <a href="#" data-route="/legal/syarat-layanan">{t('Syarat Layanan')}</a> {t('dan')} <a href="#" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi.')}</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
