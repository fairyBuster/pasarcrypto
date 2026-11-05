import { t } from '../../lib/i18n.js';
// landingpage-holding — ported from the Figma export, typography re-synced to Figma
const css = `
/* landingpage-holding — ported from Figma export, typography re-synced */
.scr-landingpage-holding { background: radial-gradient(50% 50% at 56.25% 2.18%, rgba(78, 108, 142, 0.6) 0%, rgba(78, 108, 142, 0) 100%),
    radial-gradient(50% 50% at 60% 0%, rgba(44, 72, 104, 0.45) 0%, rgba(44, 72, 104, 0) 100%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 18%, #0f2036 50%, #0c1b2e 80%, #0a1626 100%); }
.scr-landingpage-holding *{
  box-sizing: border-box;
}
.scr-landingpage-holding{
  font-family: 'Inter', sans-serif;
  margin: 0 auto;
  padding: 0;
  max-width: 100%;
  min-height: 100cqh;
  background:
    radial-gradient(50% 50% at 56.25% 2.18%, rgba(78, 108, 142, 0.6) 0%, rgba(78, 108, 142, 0) 100%),
    radial-gradient(50% 50% at 60% 0%, rgba(44, 72, 104, 0.45) 0%, rgba(44, 72, 104, 0) 100%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 18%, #0f2036 50%, #0c1b2e 80%, #0a1626 100%);
  background-color: #0a1626;
  color: #ffffff;
  line-height: 1.5;
  overflow-x: hidden;
}
.scr-landingpage-holding h1,
.scr-landingpage-holding h2,
.scr-landingpage-holding h3,
.scr-landingpage-holding h4,
.scr-landingpage-holding p{
  margin: 0;
}
.scr-landingpage-holding a{
  text-decoration: none;
  color: inherit;
}
.scr-landingpage-holding ul{
  list-style: none;
  padding: 0;
  margin: 0;
}
.scr-landingpage-holding .site-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  width: 100%;
}
.scr-landingpage-holding .site-header .logo img{
  width: 51px;
  height: 51px;
  object-fit: contain;
}
.scr-landingpage-holding .site-header .menu-btn{
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
.scr-landingpage-holding .site-header .menu-btn img{
  width: 16px;
  height: 16px;
}
.scr-landingpage-holding .hero-section{
  padding: 12px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scr-landingpage-holding .breadcrumb{
  font-size: 14px;
  color: #ffffff;
  opacity: 0.8;
}
.scr-landingpage-holding .hero-title{
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  margin-top: 10px;
}
.scr-landingpage-holding .hero-subtitle{
  font-size: 14px;
  color: #a9b7c8;
  line-height: 1.5;
  margin-top: 10px;
}
.scr-landingpage-holding .hero-image-wrapper{
  margin: 24px -16px 0;
  width: calc(100% + 32px);
  display: flex;
  justify-content: center;
}
.scr-landingpage-holding .hero-image{
  width: 100%;
  height: auto;
  object-fit: cover;
}
.scr-landingpage-holding .text-section{
  padding: 40px 16px 0;
}
.scr-landingpage-holding .section-title{
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}
.scr-landingpage-holding .section-text{
  font-size: 14px;
  color: #a9b7c8;
  line-height: 1.5;
}
.scr-landingpage-holding .list-section{
  padding: 40px 16px 0;
}
.scr-landingpage-holding .feature-list{
  margin-top: 16px;
  display: flex;
  flex-direction: column;
}
.scr-landingpage-holding .feature-item{
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(201, 212, 225, 0.16);
}
.scr-landingpage-holding .feature-item:first-child{
  border-top: 1px solid rgba(201, 212, 225, 0.16);
}
.scr-landingpage-holding .feature-icon{
  width: 38px;
  height: 38px;
  background-color: #1f3048;
  border-radius: 19px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.scr-landingpage-holding .feature-icon img{
  width: 18px;
  height: 18px;
}
.scr-landingpage-holding .feature-content{
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.scr-landingpage-holding .feature-title{
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}
.scr-landingpage-holding .feature-desc{
  font-size: 13px;
  color: #8597ab;
  line-height: 1.4;
}
.scr-landingpage-holding .example-box{
  margin-top: 16px;
  background-color: rgba(31, 48, 72, 0.55);
  border: 1px solid #8fb4ea;
  border-radius: 18px;
  padding: 22px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-landingpage-holding .example-label{
  font-size: 10px;
  font-weight: 700;
  color: #8fb4ea;
  letter-spacing: 0.5px;
}
.scr-landingpage-holding .example-text{
  font-size: 13px;
  color: #ffffff;
  line-height: 1.5;
}
.scr-landingpage-holding .tips-section{
  padding: 40px 16px 24px;
}
.scr-landingpage-holding .tips-list{
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scr-landingpage-holding .tips-item{
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
}
.scr-landingpage-holding .bullet{
  width: 6px;
  height: 6px;
  background-color: #8fa1b6;
  border-radius: 3px;
  margin-top: 7px;
  flex-shrink: 0;
}
.scr-landingpage-holding .tips-item p{
  font-size: 13px;
  color: #c3cedb;
  line-height: 1.5;
}
.scr-landingpage-holding .site-footer{
  background-color: rgba(4, 9, 18, 0.35);
  border-top: 1px solid #1c2d44;
  padding: 28px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.scr-landingpage-holding .footer-logo img{
  width: 44px;
  height: 44px;
  object-fit: contain;
}
.scr-landingpage-holding .footer-desc{
  font-size: 13px;
  color: #8597ab;
  line-height: 1.5;
}
.scr-landingpage-holding .footer-links{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
}
.scr-landingpage-holding .link-column{
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.scr-landingpage-holding .link-column h4{
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}
.scr-landingpage-holding .link-column ul{
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-landingpage-holding .link-column a{
  font-size: 12px;
  color: #8597ab;
  transition: color 0.2s;
}
.scr-landingpage-holding .link-column a:hover{
  color: #ffffff;
}
.scr-landingpage-holding .app-badges{
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 8px;
}
.scr-landingpage-holding .badge-img{
  height: 22px;
  width: auto;
  border-radius: 4px;
}
.scr-landingpage-holding .footer-disclaimer{
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(201, 212, 225, 0.14);
}
.scr-landingpage-holding .footer-disclaimer p{
  font-size: 11px;
  color: #51657e;
  line-height: 1.5;
}
.scr-landingpage-holding .footer-copyright{
  margin-top: 8px;
}
.scr-landingpage-holding .footer-copyright p{
  font-size: 11px;
  color: #75879c;
}
/* figma re-sync */
.scr-landingpage-holding .hero-title.hero-title { font-size: 27px; }
.scr-landingpage-holding .hero-title.hero-title { font-weight: 800; }
.scr-landingpage-holding .section-title.section-title { font-size: 20px; }
.scr-landingpage-holding .section-text.section-text { font-size: 13px; }
.scr-landingpage-holding .feature-desc.feature-desc { font-size: 12px; }
.scr-landingpage-holding .example-text.example-text { color: #C3CEDB; }
.scr-landingpage-holding .footer-desc.footer-desc { font-size: 12px; }
.scr-landingpage-holding .footer-desc.footer-desc { line-height: 18px; }
`;

export default function LandingpageHolding() {
  return (
    <div className="scr-landingpage-holding">
      <style>{css}</style>
      <section id="section-header">
        <header className="site-header">
          <div className="logo">
            <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" />
          </div>
          <button className="menu-btn" aria-label={t('Menu')} data-route="/landing/v2">
            <img src="/assets/img/ab9ce508a0.svg" alt="Menu Icon" />
          </button>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero-section">
          <div className="breadcrumb">Beranda &rsaquo; Holding</div>
          <h1 className="hero-title">{t('Mengenal holding aset kripto')}</h1>
          <p className="hero-subtitle">{t('Pelajari apa itu holding, bagaimana imbal hasil didapat, dan hal-hal yang perlu kamu pahami sebelum memulai.')}</p>
          <div className="hero-image-wrapper">
            <img src="/assets/img/5557c0ca1c.png" alt="Holding Illustration" className="hero-image" />
          </div>
        </div>
      </section>
      <section id="section-what-is-holding">
        <div className="text-section">
          <h2 className="section-title">{t('Apa itu holding?')}</h2>
          <p className="section-text">{t('Holding adalah menyimpan aset kripto dalam jangka waktu tertentu dengan tujuan mendapatkan imbal hasil. Selama disimpan, aset kamu tetap menjadi milikmu dan tercatat di akunmu.')}</p>
        </div>
      </section>
      <section id="section-how-it-works">
        <div className="list-section">
          <h2 className="section-title">{t('Bagaimana imbal hasil didapat?')}</h2>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <img src="/assets/img/499565e1a7.svg" alt="Icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{t('Aset disimpan')}</h3>
                <p className="feature-desc">{t('Kamu menyimpan sejumlah aset kripto di platform.')}</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src="/assets/img/4bb30fcaab.svg" alt="Icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{t('Aset dikelola')}</h3>
                <p className="feature-desc">{t('Aset dikelola untuk menghasilkan nilai tambah.')}</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src="/assets/img/60d1d19331.svg" alt="Icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{t('Imbal hasil dibagikan')}</h3>
                <p className="feature-desc">{t('Hasilnya dibagikan secara berkala ke saldomu.')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-understanding-apr">
        <div className="text-section">
          <h2 className="section-title">{t('Memahami APR')}</h2>
          <p className="section-text">APR (Annual Percentage Rate) adalah persentase imbal hasil dalam satu tahun. Semakin tinggi APR, semakin besar perkiraan imbal hasil yang didapat.</p>
          
          <div className="example-box">
            <span className="example-label">{t('CONTOH')}</span>
            <p className="example-text">{t('Menyimpan 10.000.000 IDR dengan APR 8% per tahun berarti perkiraan imbal hasil sekitar 800.000 IDR per tahun, atau kurang lebih 2.190 IDR per hari.')}</p>
          </div>
        </div>
      </section>
      <section id="section-things-to-note">
        <div className="list-section">
          <h2 className="section-title">{t('Hal yang perlu diperhatikan')}</h2>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <img src="/assets/img/c7c8c6e7f0.svg" alt="Icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{t('Aset tetap milikmu')}</h3>
                <p className="feature-desc">{t('Aset yang kamu simpan tetap tercatat atas namamu.')}</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src="/assets/img/60d1d19331.svg" alt="Icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{t('Imbal hasil rutin')}</h3>
                <p className="feature-desc">{t('Imbal hasil dibagikan secara berkala ke saldomu.')}</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src="/assets/img/e618fea46b.svg" alt="Icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{t('Transparan')}</h3>
                <p className="feature-desc">{t('Setiap imbal hasil dan transaksi bisa dipantau kapan saja.')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-tips">
        <div className="tips-section">
          <h2 className="section-title">{t('Tips untuk pemula')}</h2>
          <ul className="tips-list">
            <li className="tips-item">
              <span className="bullet"></span>
              <p>{t('Mulai dari nominal kecil sambil memahami cara kerjanya.')}</p>
            </li>
            <li className="tips-item">
              <span className="bullet"></span>
              <p>{t('Gunakan dana yang tidak dipakai untuk kebutuhan sehari-hari.')}</p>
            </li>
            <li className="tips-item">
              <span className="bullet"></span>
              <p>{t('Pelajari aset yang kamu simpan sebelum memulai.')}</p>
            </li>
            <li className="tips-item">
              <span className="bullet"></span>
              <p>{t('Pantau asetmu secara berkala.')}</p>
            </li>
          </ul>
        </div>
      </section>
      <section id="section-footer">
        <footer className="site-footer">
          <div className="footer-logo">
            <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" />
          </div>
          <p className="footer-desc">{t('Platform aset kripto yang mudah, aman, dan transparan untuk semua orang.')}</p>
          
          <div className="footer-links">
            <div className="link-column">
              <h4>{t('Produk')}</h4>
              <ul>
                <li><a href="#section-what-is-holding" data-route="/landing/holding">{t('Holding')}</a></li>
                <li><a href="#" data-route="/landing/hadiah">{t('Hadiah')}</a></li>
                <li><a href="#" data-route="/landing/referral">{t('Program Referral')}</a></li>
              </ul>
            </div>
            <div className="link-column">
              <h4>{t('Perusahaan')}</h4>
              <ul>
                <li><a href="#" data-route="/landing/tentang">{t('Tentang Kami')}</a></li>
                <li><a href="#" data-route="/landing/bantuan">{t('Pusat Bantuan')}</a></li>
              </ul>
            </div>
            <div className="link-column">
              <h4>{t('Legal')}</h4>
              <ul>
                <li><a href="#" data-route="/legal/syarat-ketentuan">{t('Syarat & Ketentuan')}</a></li>
                <li><a href="#" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a></li>
                <li><a href="#" data-route="/legal/perjanjian-klien">{t('Perjanjian Klien')}</a></li>
              </ul>
            </div>
          </div>
      
          <div className="app-badges">
            <img src="/assets/img/OJK.png" alt="Get it on Google Play" className="badge-img" />
            <img src="/assets/img/BAPPEBTI.png" alt="Download on the App Store" className="badge-img" />
          </div>
      
          <div className="footer-disclaimer">
            <p>{t('Aset kripto adalah komoditas yang memiliki risiko tinggi. Est. APR bukan jaminan imbal hasil dan dapat berubah sewaktu-waktu. Lorem ipsum dolor sit amet, consectetur adipiscing elit.')}</p>
          </div>
          
          <div className="footer-copyright">
            <p>{t('© 2026 PasarCryptoIDN. Hak cipta dilindungi.')}</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
