import { t } from '../../lib/i18n.js';
// landingpage-referral — ported from the Figma export, typography re-synced to Figma
const css = `
/* landingpage-referral — ported from Figma export, typography re-synced */
.scr-landingpage-referral .app-container{
  max-width: 100%;
  width: 100%;
  min-height: 100cqh;
  background-color: #0c1a2d;
  background-image: 
    radial-gradient(circle at 60% 0%, rgba(44, 72, 104, 0.45) 0%, transparent 50%),
    radial-gradient(circle at 56% 2%, rgba(78, 108, 142, 0.6) 0%, transparent 40%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 18%, #0f2036 50%, #0c1b2e 80%, #0a1626 100%);
  overflow-x: hidden;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}
.scr-landingpage-referral h1,
.scr-landingpage-referral h2,
.scr-landingpage-referral h3,
.scr-landingpage-referral h4,
.scr-landingpage-referral p{
  margin: 0;
}
.scr-landingpage-referral *{
  box-sizing: border-box;
}
.scr-landingpage-referral .text-muted{
  color: #a9b7c8;
}
.scr-landingpage-referral .text-darker{
  color: #8597ab;
}
.scr-landingpage-referral .site-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
  }
.scr-landingpage-referral .header-logo{
    width: 51px;
    height: 51px;
    object-fit: cover;
  }
.scr-landingpage-referral .menu-button{
    width: 32px;
    height: 32px;
    background-color: #1f3048;
    border-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    cursor: pointer;
    padding: 0;
  }
.scr-landingpage-referral .hero-content{
    padding: 10px 16px 0;
    display: flex;
    flex-direction: column;
  }
.scr-landingpage-referral .breadcrumb{
    font-size: 14px;
    margin-bottom: 20px;
  }
.scr-landingpage-referral .hero-title{
    font-size: 32px;
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 10px;
  }
.scr-landingpage-referral .hero-subtitle{
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 20px;
  }
.scr-landingpage-referral .hero-image-wrapper{
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
.scr-landingpage-referral .hero-image{
    width: 257px;
    height: auto;
    max-width: 100%;
  }
.scr-landingpage-referral .about-content{
    padding: 40px 16px 10px;
  }
.scr-landingpage-referral .section-heading{
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 12px;
  }
.scr-landingpage-referral .section-description{
    font-size: 14px;
    line-height: 1.5;
  }
.scr-landingpage-referral .how-it-works-content{
    padding: 40px 16px 10px;
  }
.scr-landingpage-referral .steps-container{
    display: flex;
    flex-direction: column;
    margin-top: 16px;
  }
.scr-landingpage-referral .step-item{
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(201, 212, 225, 0.16);
  }
.scr-landingpage-referral .step-item:last-child{
    border-bottom: none;
  }
.scr-landingpage-referral .step-icon{
    width: 38px;
    height: 38px;
    background-color: #1f3048;
    border-radius: 19px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }
.scr-landingpage-referral .step-text{
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 2px;
  }
.scr-landingpage-referral .step-title{
    font-size: 14px;
    font-weight: 700;
  }
.scr-landingpage-referral .step-desc{
    font-size: 12px;
    line-height: 1.4;
  }
.scr-landingpage-referral .tiers-content{
    padding: 40px 16px 10px;
  }
.scr-landingpage-referral .tier-list{
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
  }
.scr-landingpage-referral .tier-item{
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
  }
.scr-landingpage-referral .tier-badge{
    background: linear-gradient(135deg, #2c4c80 0%, #1a3150 100%);
    height: 28px;
    padding: 0 14px;
    border-radius: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }
.scr-landingpage-referral .tier-desc{
    font-size: 12px;
    line-height: 1.5;
    padding-top: 6px;
  }
.scr-landingpage-referral .point-types-content{
    padding: 40px 16px 10px;
  }
.scr-landingpage-referral .point-box{
    background-color: rgba(31, 48, 72, 0.55);
    border: 1px solid #2a3d56;
    border-radius: 18px;
    padding: 4px 16px;
    margin-top: 16px;
    display: flex;
    flex-direction: column;
  }
.scr-landingpage-referral .point-item{
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(201, 212, 225, 0.16);
  }
.scr-landingpage-referral .point-item:last-child{
    border-bottom: none;
  }
.scr-landingpage-referral .point-title{
    font-size: 14px;
    font-weight: 700;
  }
.scr-landingpage-referral .point-desc{
    font-size: 12px;
  }
.scr-landingpage-referral .tips-content{
    padding: 40px 16px 20px;
  }
.scr-landingpage-referral .tips-list{
    list-style: none;
    padding: 0;
    margin: 16px 0 0 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
.scr-landingpage-referral .tips-list li{
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
  }
.scr-landingpage-referral .bullet{
    width: 6px;
    height: 6px;
    background-color: #8fa1b6;
    border-radius: 3px;
    margin-top: 6px;
    flex-shrink: 0;
  }
.scr-landingpage-referral .tip-text{
    font-size: 12px;
    color: #c3cedb;
    line-height: 1.4;
  }
.scr-landingpage-referral .site-footer{
    background-color: rgba(4, 9, 18, 0.35);
    border-top: 1px solid #1c2d44;
    padding: 28px 16px 32px;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
  }
.scr-landingpage-referral .footer-brand{
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 24px;
  }
.scr-landingpage-referral .footer-logo{
    width: 44px;
    height: 44px;
    object-fit: cover;
  }
.scr-landingpage-referral .brand-desc{
    font-size: 12px;
    line-height: 1.5;
  }
.scr-landingpage-referral .footer-links-grid{
    display: flex;
    flex-direction: row;
    gap: 16px;
    margin-bottom: 24px;
  }
.scr-landingpage-referral .link-column{
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }
.scr-landingpage-referral .col-title{
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 2px;
  }
.scr-landingpage-referral .footer-link{
    font-size: 12px;
    color: #8597ab;
    text-decoration: none;
    line-height: 1.2;
  }
.scr-landingpage-referral .app-downloads{
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin-bottom: 24px;
  }
.scr-landingpage-referral .app-badge img{
    height: 22px;
    border-radius: 5px;
    object-fit: contain;
  }
.scr-landingpage-referral .footer-disclaimer{
    border-top: 1px solid rgba(201, 212, 225, 0.14);
    padding-top: 16px;
    margin-bottom: 16px;
  }
.scr-landingpage-referral .footer-disclaimer p{
    font-size: 10px;
    color: #51657e;
    line-height: 1.5;
  }
.scr-landingpage-referral .footer-copyright p{
    font-size: 10px;
    color: #75879c;
  }
/* figma re-sync */
.scr-landingpage-referral .section-heading.section-heading { font-size: 20px; }
.scr-landingpage-referral .section-description.section-description { font-size: 13px; }
.scr-landingpage-referral .step-title.step-title { font-weight: 600; }
.scr-landingpage-referral .step-desc.step-desc { line-height: 18px; }
.scr-landingpage-referral .tier-badge.tier-badge { font-size: 11px; }
.scr-landingpage-referral .point-title.point-title { font-size: 13px; }
.scr-landingpage-referral .point-title.point-title { font-weight: 600; }
.scr-landingpage-referral .tip-text.tip-text { font-size: 13px; }
.scr-landingpage-referral .tip-text.tip-text { line-height: 19px; }
`;

export default function LandingpageReferral() {
  return (
    <div className="scr-landingpage-referral">
      <style>{css}</style>
      <section id="section-header">
        <header className="site-header">
          <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" className="header-logo" />
          <button className="menu-button" aria-label={t('Menu')} data-route="/landing/v2">
            <img src="/assets/img/ab9ce508a0.svg" alt="" />
          </button>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero-content">
          <div className="breadcrumb">{t('Beranda › Program Referral')}</div>
          <h1 className="hero-title">{t('Mengenal program')}<br />{t('referral')}</h1>
          <p className="hero-subtitle text-muted">{t('Pelajari bagaimana program referral bekerja dan apa saja yang bisa kamu dapatkan dengan mengajak teman.')}</p>
          <div className="hero-image-wrapper">
            <img src="/assets/img/5a25f69237.png" alt="Referral Program Illustration" className="hero-image" />
          </div>
        </div>
      </section>
      <section id="section-about">
        <div className="about-content">
          <h2 className="section-heading">{t('Apa itu program referral?')}</h2>
          <p className="section-description text-muted">{t('Program referral adalah program untuk mengajak teman bergabung menggunakan link atau kode undangan milikmu. Setiap teman yang bergabung dan aktif akan memberimu poin.')}</p>
        </div>
      </section>
      <section id="section-how-it-works">
        <div className="how-it-works-content">
          <h2 className="section-heading">{t('Cara kerjanya')}</h2>
          
          <div className="steps-container">
            <div className="step-item">
              <div className="step-icon">
                <img src="/assets/img/dd4855e8ff.svg" alt="Share Icon" />
              </div>
              <div className="step-text">
                <h3 className="step-title">{t('Bagikan link undangan')}</h3>
                <p className="step-desc text-darker">{t('Setiap akun memiliki link dan kode undangan unik.')}</p>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-icon">
                <img src="/assets/img/9fcbb05ca5.svg" alt="Join Icon" />
              </div>
              <div className="step-text">
                <h3 className="step-title">{t('Teman bergabung')}</h3>
                <p className="step-desc text-darker">{t('Teman mendaftar menggunakan link atau kodemu.')}</p>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-icon">
                <img src="/assets/img/967d320e70.svg" alt="Points Icon" />
              </div>
              <div className="step-text">
                <h3 className="step-title">{t('Dapatkan poin')}</h3>
                <p className="step-desc text-darker">{t('Poin bertambah saat teman mendaftar dan mulai aktif.')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-tiers">
        <div className="tiers-content">
          <h2 className="section-heading">{t('Tingkatan teman')}</h2>
          <p className="section-description text-muted">{t('Teman yang kamu undang terbagi menjadi tiga level.')}</p>
          
          <div className="tier-list">
            <div className="tier-item">
              <div className="tier-badge">{t('Level 1')}</div>
              <p className="tier-desc text-muted">{t('Teman yang mendaftar langsung menggunakan link atau kode undanganmu.')}</p>
            </div>
            
            <div className="tier-item">
              <div className="tier-badge">{t('Level 2')}</div>
              <p className="tier-desc text-muted">{t('Teman yang diundang oleh teman Level 1 kamu.')}</p>
            </div>
            
            <div className="tier-item">
              <div className="tier-badge">{t('Level 3')}</div>
              <p className="tier-desc text-muted">{t('Teman yang diundang oleh teman Level 2 kamu.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-point-types">
        <div className="point-types-content">
          <h2 className="section-heading">{t('Jenis poin')}</h2>
          
          <div className="point-box">
            <div className="point-item">
              <h3 className="point-title">{t('Teman mendaftar')}</h3>
              <p className="point-desc text-darker">{t('Poin diberikan saat teman berhasil mendaftar.')}</p>
            </div>
            
            <div className="point-item">
              <h3 className="point-title">{t('Teman mulai aktif')}</h3>
              <p className="point-desc text-darker">{t('Poin tambahan saat teman mulai bertransaksi.')}</p>
            </div>
            
            <div className="point-item">
              <h3 className="point-title">{t('Aktivitas berkelanjutan')}</h3>
              <p className="point-desc text-darker">{t('Poin dari aktivitas teman selanjutnya.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-tips">
        <div className="tips-content">
          <h2 className="section-heading">{t('Tips mengajak teman')}</h2>
          
          <ul className="tips-list">
            <li>
              <span className="bullet"></span>
              <span className="tip-text">{t('Ceritakan pengalamanmu menggunakan aplikasi.')}</span>
            </li>
            <li>
              <span className="bullet"></span>
              <span className="tip-text">{t('Bagikan link undangan lewat media sosial atau pesan pribadi.')}</span>
            </li>
            <li>
              <span className="bullet"></span>
              <span className="tip-text">{t('Bantu temanmu memahami cara memulai.')}</span>
            </li>
          </ul>
        </div>
      </section>
      <section id="section-footer">
        <footer className="site-footer">
          <div className="footer-brand">
            <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" className="footer-logo" />
            <p className="brand-desc text-darker">{t('Platform aset kripto yang mudah, aman, dan transparan untuk semua orang.')}</p>
          </div>
          
          <div className="footer-links-grid">
            <div className="link-column">
              <h4 className="col-title">{t('Produk')}</h4>
              <a href="#" className="footer-link" data-route="/landing/holding">{t('Holding')}</a>
              <a href="#" className="footer-link" data-route="/landing/hadiah">{t('Hadiah')}</a>
              <a href="#" className="footer-link" data-route="/landing/referral">{t('Program Referral')}</a>
            </div>
            
            <div className="link-column">
              <h4 className="col-title">{t('Perusahaan')}</h4>
              <a href="#" className="footer-link" data-route="/landing/tentang">{t('Tentang Kami')}</a>
              <a href="#" className="footer-link" data-route="/landing/bantuan">{t('Pusat Bantuan')}</a>
            </div>
            
            <div className="link-column">
              <h4 className="col-title">{t('Legal')}</h4>
              <a href="#" className="footer-link" data-route="/legal/syarat-ketentuan">{t('Syarat & Ketentuan')}</a>
              <a href="#" className="footer-link" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a>
              <a href="#" className="footer-link" data-route="/legal/perjanjian-klien">{t('Perjanjian Klien')}</a>
            </div>
          </div>
          
          <div className="app-downloads">
            <a href="#" className="app-badge"><img src="/assets/img/OJK.png" alt="Download on App Store" /></a>
            <a href="#" className="app-badge"><img src="/assets/img/BAPPEBTI.png" alt="Get it on Google Play" /></a>
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
