import { t } from '../../lib/i18n.js';
// landingpage-tentang — ported from the Figma export, typography re-synced to Figma
const css = `
/* landingpage-tentang — ported from Figma export, typography re-synced */
.scr-landingpage-tentang { background: linear-gradient(165deg, #0c1a2d 0%, #13263d 18%, #0f2036 50%, #0c1b2e 80%, #0a1626 100%); }
.scr-landingpage-tentang *{
  box-sizing: border-box;
}
.scr-landingpage-tentang .site-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}
.scr-landingpage-tentang .logo{
  width: 51px;
  height: 51px;
  object-fit: contain;
}
.scr-landingpage-tentang .menu-toggle{
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #1f3048;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0;
}
.scr-landingpage-tentang .menu-toggle img{
  width: 16px;
  height: 16px;
}
.scr-landingpage-tentang .hero-section{
  padding-top: 6px;
  display: flex;
  flex-direction: column;
}
.scr-landingpage-tentang .hero-content{
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scr-landingpage-tentang .breadcrumb{
  font-size: 12px;
  color: #a9b7c8;
}
.scr-landingpage-tentang .main-heading{
  font-size: 28px;
  line-height: 1.3;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}
.scr-landingpage-tentang .hero-image-wrapper{
  margin-top: 24px;
  width: 100%;
  height: 320px;
  position: relative;
  overflow: hidden;
}
.scr-landingpage-tentang .hero-img{
  position: absolute;
  top: -64px;
  left: 0;
  width: 100%;
  height: 412px;
  object-fit: cover;
}
.scr-landingpage-tentang .story-section{
  padding: 40px 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scr-landingpage-tentang .section-label{
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #8fa6c2;
  margin: 0 0 8px 0;
  text-transform: uppercase;
}
.scr-landingpage-tentang .story-text{
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scr-landingpage-tentang .story-text p{
  font-size: 14px;
  line-height: 1.5;
  color: #c3cedb;
  margin: 0;
}
.scr-landingpage-tentang .quote-container{
  margin-top: 22px;
  padding-left: 18px;
  border-left: 2px solid #8fb4ea;
}
.scr-landingpage-tentang .quote-content{
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.scr-landingpage-tentang .quote-text{
  font-size: 16px;
  line-height: 1.4;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}
.scr-landingpage-tentang .quote-author{
  display: flex;
  align-items: center;
  gap: 10px;
}
.scr-landingpage-tentang .author-img{
  width: 41px;
  height: 39px;
  border-radius: 50%;
  object-fit: cover;
}
.scr-landingpage-tentang .author-details{
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-landingpage-tentang .author-name{
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}
.scr-landingpage-tentang .author-role{
  font-size: 12px;
  color: #8597ab;
}
.scr-landingpage-tentang .stats-section{
  padding: 40px 16px 10px;
}
.scr-landingpage-tentang .stats-list{
  margin-top: 14px;
  display: flex;
  flex-direction: column;
}
.scr-landingpage-tentang .stat-row{
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #1c2d44;
}
.scr-landingpage-tentang .stat-row.no-border{
  border-bottom: none;
}
.scr-landingpage-tentang .stat-value{
  width: 128px;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(180deg, #f5f8fb 0%, #8fb4ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.scr-landingpage-tentang .stat-desc{
  flex: 1;
  font-size: 14px;
  color: #a9b7c8;
  line-height: 1.3;
}
.scr-landingpage-tentang .values-section{
  padding: 40px 16px;
}
.scr-landingpage-tentang .values-list{
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.scr-landingpage-tentang .value-card{
  display: flex;
  align-items: center;
  gap: 14px;
}
.scr-landingpage-tentang .value-img{
  width: 98px;
  height: 98px;
  object-fit: cover;
  border-radius: 8px;
}
.scr-landingpage-tentang .value-info{
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.scr-landingpage-tentang .value-title{
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}
.scr-landingpage-tentang .value-text{
  font-size: 13px;
  line-height: 1.4;
  color: #8597ab;
  margin: 0;
}
.scr-landingpage-tentang .site-footer{
  position: relative;
  margin-top: 40px;
}
.scr-landingpage-tentang .footer-overlay{
  background-color: rgba(4, 9, 18, 0.35);
  border-top: 1px solid #1c2d44;
  padding: 28px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.scr-landingpage-tentang .footer-logo{
  width: 44px;
  height: 44px;
  object-fit: contain;
}
.scr-landingpage-tentang .footer-tagline{
  font-size: 13px;
  line-height: 1.4;
  color: #8597ab;
  margin: 0;
}
.scr-landingpage-tentang .footer-nav{
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  gap: 16px;
}
.scr-landingpage-tentang .nav-col{
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.scr-landingpage-tentang .nav-title{
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}
.scr-landingpage-tentang .nav-list{
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scr-landingpage-tentang .nav-list a{
  text-decoration: none;
  font-size: 13px;
  color: #8597ab;
}
.scr-landingpage-tentang .app-downloads{
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.scr-landingpage-tentang .store-badge{
  height: 22px;
  object-fit: contain;
  border-radius: 4px;
}
.scr-landingpage-tentang .footer-disclaimer{
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(201, 212, 225, 0.14);
}
.scr-landingpage-tentang .footer-disclaimer p{
  font-size: 11px;
  line-height: 1.4;
  color: #51657e;
  margin: 0;
}
.scr-landingpage-tentang .footer-copyright{
  margin-top: 16px;
}
.scr-landingpage-tentang .footer-copyright p{
  font-size: 11px;
  color: #75879c;
  margin: 0;
}
/* figma re-sync */
.scr-landingpage-tentang .breadcrumb.breadcrumb { font-size: 11px; }
.scr-landingpage-tentang .breadcrumb.breadcrumb { color: #75879C; }
.scr-landingpage-tentang .main-heading.main-heading { font-size: 30px; }
.scr-landingpage-tentang .main-heading.main-heading { font-weight: 800; }
.scr-landingpage-tentang .main-heading.main-heading { line-height: 38px; }
.scr-landingpage-tentang .quote-text.quote-text { font-size: 18px; }
.scr-landingpage-tentang .quote-text.quote-text { font-weight: 600; }
.scr-landingpage-tentang .quote-text.quote-text { line-height: 27px; }
.scr-landingpage-tentang .author-name.author-name { font-size: 13px; }
.scr-landingpage-tentang .author-name.author-name { font-weight: 600; }
.scr-landingpage-tentang .author-role.author-role { font-size: 11px; }
.scr-landingpage-tentang .stat-value.stat-value { font-size: 30px; }
.scr-landingpage-tentang .stat-value.stat-value { font-weight: 800; }
.scr-landingpage-tentang .stat-desc.stat-desc { font-size: 13px; }
.scr-landingpage-tentang .value-text.value-text { font-size: 12px; }
.scr-landingpage-tentang .footer-tagline.footer-tagline { font-size: 12px; }
.scr-landingpage-tentang .nav-title.nav-title { font-size: 12px; }
`;

export default function LandingpageTentang() {
  return (
    <div className="scr-landingpage-tentang">
      <style>{css}</style>
      <section id="header">
        <header className="site-header">
          <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" className="logo" />
          <button className="menu-toggle" aria-label={t('Menu')} data-route="/landing/v2">
            <img src="/assets/img/ab9ce508a0.svg" alt="Menu" />
          </button>
        </header>
      </section>
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <div className="breadcrumb">{t('Beranda › Tentang Kami')}</div>
          <h1 className="main-heading">{t('Kami percaya aset kripto bisa dipahami semua orang.')}</h1>
        </div>
        <div className="hero-image-wrapper">
          <img src="/assets/img/0424b57ed5.png" alt="Golden XAUUSD247 Market Tile" className="hero-img" />
        </div>
      </section>
      <section id="story" className="story-section">
        <h2 className="section-label">{t('CERITA KAMI')}</h2>
        <div className="story-text">
          <p>{t('PasarCryptoIDN lahir dari keinginan sederhana: membuat aset kripto terasa dekat, aman, dan mudah dipahami oleh siapa saja, bukan hanya mereka yang sudah berpengalaman.')}</p>
          <p>{t('Kami memahami bahwa dunia kripto sering kali terasa rumit bagi sebagian orang. Karena itu, kami ingin menghadirkan pengalaman yang lebih sederhana, transparan, dan nyaman, mulai dari mengenal aset kripto hingga mengelola portofolio digital.')}</p>
        </div>
        <div className="quote-container">
          <div className="quote-content">
            <p className="quote-text">{t('“Kami ingin setiap orang bisa mengenal aset kripto dengan tenang dan percaya diri.”')}</p>
            <div className="quote-author">
              <img src="/assets/img/6a58c276c3.png" alt="Samuel Montgomery" className="author-img" />
              <div className="author-details">
                <span className="author-name">{t('Samuel Montgomery')}</span>
                <span className="author-role">{t('Pendiri PasarCryptoIDN')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="stats" className="stats-section">
        <h2 className="section-label">{t('DALAM ANGKA')}</h2>
        <div className="stats-list">
          <div className="stat-row">
            <div className="stat-value">2020</div>
            <div className="stat-desc">{t('Tahun berdiri')}</div>
          </div>
          <div className="stat-row">
            <div className="stat-value">{t('100 Rb+')}</div>
            <div className="stat-desc">{t('Pengguna bergabung')}</div>
          </div>
          <div className="stat-row">
            <div className="stat-value">24/7</div>
            <div className="stat-desc">{t('Sistem berjalan')}</div>
          </div>
          <div className="stat-row no-border">
            <div className="stat-value">08–22</div>
            <div className="stat-desc">{t('Layanan bantuan setiap hari')}<br />(WIB)</div>
          </div>
        </div>
      </section>
      <section id="values" className="values-section">
        <h2 className="section-label">{t('YANG KAMI PEGANG')}</h2>
        <div className="values-list">
          <div className="value-card">
            <img src="/assets/img/d6080c20e4.png" alt="Sederhana" className="value-img" />
            <div className="value-info">
              <h3 className="value-title">{t('Sederhana')}</h3>
              <p className="value-text">{t('Kami membuat aset kripto mudah dipahami, tanpa istilah yang membingungkan.')}</p>
            </div>
          </div>
          <div className="value-card">
            <img src="/assets/img/b6027892dc.png" alt="Terbuka" className="value-img" />
            <div className="value-info">
              <h3 className="value-title">{t('Terbuka')}</h3>
              <p className="value-text">{t('Setiap transaksi dan imbal hasil bisa kamu lihat dengan jelas.')}</p>
            </div>
          </div>
          <div className="value-card">
            <img src="/assets/img/9c20e511ac.png" alt="Peduli" className="value-img" />
            <div className="value-info">
              <h3 className="value-title">{t('Peduli')}</h3>
              <p className="value-text">{t('Kami mendengar masukan pengguna dan terus memperbaiki layanan.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="footer">
        <footer className="site-footer">
          <div className="footer-overlay">
            <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" className="footer-logo" />
            <p className="footer-tagline">{t('Platform aset kripto yang mudah, aman, dan transparan untuk semua orang.')}</p>
            
            <div className="footer-nav">
              <div className="nav-col">
                <h4 className="nav-title">{t('Produk')}</h4>
                <ul className="nav-list">
                  <li><a href="#" data-route="/landing/holding">{t('Holding')}</a></li>
                  <li><a href="#" data-route="/landing/hadiah">{t('Hadiah')}</a></li>
                  <li><a href="#" data-route="/landing/referral">{t('Program Referral')}</a></li>
                </ul>
              </div>
              <div className="nav-col">
                <h4 className="nav-title">{t('Perusahaan')}</h4>
                <ul className="nav-list">
                  <li><a href="#" data-route="/landing/tentang">{t('Tentang Kami')}</a></li>
                  <li><a href="#" data-route="/landing/bantuan">{t('Pusat Bantuan')}</a></li>
                </ul>
              </div>
              <div className="nav-col">
                <h4 className="nav-title">{t('Legal')}</h4>
                <ul className="nav-list">
                  <li><a href="#" data-route="/legal/syarat-ketentuan">{t('Syarat & Ketentuan')}</a></li>
                  <li><a href="#" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a></li>
                  <li><a href="#" data-route="/legal/perjanjian-klien">{t('Perjanjian Klien')}</a></li>
                </ul>
              </div>
            </div>
      
            <div className="app-downloads">
              <img src="/assets/img/OJK.png" alt="Get it on Google Play" className="store-badge" />
              <img src="/assets/img/BAPPEBTI.png" alt="Download on the App Store" className="store-badge" />
            </div>
      
            <div className="footer-disclaimer">
              <p>{t('Aset kripto adalah komoditas yang memiliki risiko tinggi. Est. APR bukan jaminan imbal hasil dan dapat berubah sewaktu-waktu. Lorem ipsum dolor sit amet, consectetur adipiscing elit.')}</p>
            </div>
      
            <div className="footer-copyright">
              <p>{t('© 2026 PasarCryptoIDN. Hak cipta dilindungi.')}</p>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
