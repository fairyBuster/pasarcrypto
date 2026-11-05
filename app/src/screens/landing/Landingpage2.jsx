import { t } from '../../lib/i18n.js';
// landingpage2 — ported from the Figma export, typography re-synced to Figma
const css = `
/* landingpage2 — ported from Figma export, typography re-synced */
.scr-landingpage2 *{
  box-sizing: border-box;
}
.scr-landingpage2 a{
  text-decoration: none;
}
.scr-landingpage2 ul{
  list-style: none;
  padding: 0;
  margin: 0;
}
.scr-landingpage2 button{
  font-family: 'Inter', sans-serif;
}
.scr-landingpage2 .mobile-container{
  width: 100%;
  max-width: 412px;
  margin: 0 auto;
}
.scr-landingpage2 .site-header{
    display: flex;
    justify-content: flex-end;
    padding: 16px;
  }
.scr-landingpage2 .close-btn{
    background-color: #1f3048;
    border: none;
    border-radius: 16px;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }
.scr-landingpage2 .close-btn:hover{
    background-color: #2a405f;
  }
.scr-landingpage2 .main-nav{
    padding: 0 16px;
    margin-top: 6px;
  }
.scr-landingpage2 .nav-list{
    display: flex;
    flex-direction: column;
  }
.scr-landingpage2 .nav-item{
    border-bottom: 1px solid #1c2d44;
  }
.scr-landingpage2 .nav-link{
    display: flex;
    align-items: center;
    padding: 12px 0;
    width: 100%;
    cursor: pointer;
  }
.scr-landingpage2 .nav-icon{
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background-color: #1f3048;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
    flex-shrink: 0;
  }
.scr-landingpage2 .active-icon{
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  }
.scr-landingpage2 .nav-text{
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    flex-grow: 1;
  }
.scr-landingpage2 .nav-arrow{
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
.scr-landingpage2 .actions-wrapper{
    padding: 24px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 24px;
  }
.scr-landingpage2 .btn{
    width: 100%;
    height: 48px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 0.2s;
  }
.scr-landingpage2 .btn:hover{
    opacity: 0.9;
  }
.scr-landingpage2 .btn-primary{
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    border: none;
    color: #0c1a2d;
  }
.scr-landingpage2 .btn-secondary{
    background-color: rgba(31, 48, 72, 0.5);
    border: 1px solid rgba(201, 212, 225, 0.3);
    color: #ffffff;
  }
.scr-landingpage2 .site-footer{
    padding: 40px 16px 28px;
    display: flex;
    flex-direction: column;
  }
.scr-landingpage2 .language-selector{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 54px;
  }
.scr-landingpage2 .lang-label{
    color: #a9b7c8;
    font-size: 14px;
  }
.scr-landingpage2 .lang-dropdown{
    background-color: #1f3048;
    border: none;
    border-radius: 16px;
    height: 32px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
.scr-landingpage2 .lang-text{
    color: #e6ecf3;
    font-size: 13px;
  }
.scr-landingpage2 .footer-links{
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
.scr-landingpage2 .footer-link{
    color: #75879c;
    font-size: 12px;
    transition: color 0.2s;
  }
.scr-landingpage2 .footer-link:hover{
    color: #a9b7c8;
  }
/* figma re-sync */
.scr-landingpage2 .nav-text.nav-text { font-size: 15px; }
.scr-landingpage2 .nav-text.nav-text { font-weight: 600; }
.scr-landingpage2 .btn.btn { font-size: 15px; }
.scr-landingpage2 .btn.btn { font-weight: 700; }
.scr-landingpage2 .lang-label.lang-label { font-size: 13px; }
.scr-landingpage2 .lang-text.lang-text { font-size: 12px; }
.scr-landingpage2 .footer-link.footer-link { color: #75879C; }
`;

export default function Landingpage2() {
  return (
    <div className="scr-landingpage2">
      <style>{css}</style>
      <section id="section-header" className="mobile-container">
        <header className="site-header">
          <button className="close-btn" aria-label={t('Close menu')} data-back="1">
            <img src="/assets/img/1e084af4b1.svg" alt="Close icon" />
          </button>
        </header>
      </section>
      <section id="section-navigation" className="mobile-container">
        <nav className="main-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <a href="#beranda" className="nav-link" data-route="/home">
                <div className="nav-icon active-icon">
                  <img src="/assets/img/0ba52945eb.svg" alt="Beranda icon" />
                </div>
                <span className="nav-text">{t('Beranda')}</span>
                <img src="/assets/img/8602b31a6d.svg" alt="Arrow right" className="nav-arrow" />
              </a>
            </li>
            <li className="nav-item" data-route="/pasar">
              <a href="#holding" className="nav-link" data-route="/landing/holding">
                <div className="nav-icon">
                  <img src="/assets/img/a18d5dcf0a.svg" alt="Holding icon" />
                </div>
                <span className="nav-text">{t('Holding')}</span>
                <img src="/assets/img/8602b31a6d.svg" alt="Arrow right" className="nav-arrow" />
              </a>
            </li>
            <li className="nav-item" data-route="/landing/hadiah">
              <a href="#hadiah" className="nav-link" data-route="/landing/hadiah">
                <div className="nav-icon">
                  <img src="/assets/img/c75e3333da.svg" alt="Hadiah icon" />
                </div>
                <span className="nav-text">{t('Hadiah')}</span>
                <img src="/assets/img/8602b31a6d.svg" alt="Arrow right" className="nav-arrow" />
              </a>
            </li>
            <li className="nav-item">
              <a href="#referral" className="nav-link" data-route="/landing/referral">
                <div className="nav-icon">
                  <img src="/assets/img/74b4a2a878.svg" alt="Program Referral icon" />
                </div>
                <span className="nav-text">{t('Program Referral')}</span>
                <img src="/assets/img/8602b31a6d.svg" alt="Arrow right" className="nav-arrow" />
              </a>
            </li>
            <li className="nav-item">
              <a href="#tentang-kami" className="nav-link" data-route="/landing/tentang">
                <div className="nav-icon">
                  <img src="/assets/img/2e08d4e9ea.svg" alt="Tentang Kami icon" />
                </div>
                <span className="nav-text">{t('Tentang Kami')}</span>
                <img src="/assets/img/8602b31a6d.svg" alt="Arrow right" className="nav-arrow" />
              </a>
            </li>
            <li className="nav-item" data-route="/landing/bantuan">
              <a href="#pusat-bantuan" className="nav-link" data-route="/landing/bantuan">
                <div className="nav-icon">
                  <img src="/assets/img/57dcbd6187.svg" alt="Pusat Bantuan icon" />
                </div>
                <span className="nav-text">{t('Pusat Bantuan')}</span>
                <img src="/assets/img/8602b31a6d.svg" alt="Arrow right" className="nav-arrow" />
              </a>
            </li>
          </ul>
        </nav>
      </section>
      <section id="section-actions" className="mobile-container">
        <div className="actions-wrapper">
          <button className="btn btn-primary" data-route="/register">{t('Daftar Sekarang')}</button>
          <button className="btn btn-secondary" data-route="/login">{t('Masuk')}</button>
        </div>
      </section>
      <section id="section-footer" className="mobile-container">
        <footer className="site-footer">
          {/* <div className="language-selector">
            <span className="lang-label">{t('Bahasa')}</span>
            <button className="lang-dropdown">
              <img src="/assets/img/b7ab324f95.svg" alt="Globe icon" />
              <span className="lang-text">{t('Indonesia')}</span>
              <img src="/assets/img/bf9598d8bc.svg" alt="Dropdown arrow" />
            </button>
          </div> */}
          <div className="footer-links">
            <a href="#syarat" className="footer-link" data-route="/legal/syarat-ketentuan">{t('Syarat & Ketentuan')}</a>
            <a href="#privasi" className="footer-link" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a>
            <a href="#perjanjian" className="footer-link" data-route="/legal/perjanjian-klien">{t('Perjanjian Klien')}</a>
          </div>
        </footer>
      </section>
    </div>
  );
}
