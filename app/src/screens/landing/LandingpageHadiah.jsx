import { t } from '../../lib/i18n.js';
// landingpage-hadiah — ported from the Figma export, typography re-synced to Figma
const css = `
/* landingpage-hadiah — ported from Figma export, typography re-synced */
.scr-landingpage-hadiah { background: radial-gradient(60% 60% at 56.25% 0%, rgba(78, 108, 142, 0.6) 0%, rgba(78, 108, 142, 0) 100%),
    radial-gradient(60% 60% at 60% 0%, rgba(44, 72, 104, 0.45) 0%, rgba(44, 72, 104, 0) 100%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 18%, #0f2036 50%, #0c1b2e 80%, #0a1626 100%); }
.scr-landingpage-hadiah h1,
.scr-landingpage-hadiah h2,
.scr-landingpage-hadiah h3,
.scr-landingpage-hadiah h4,
.scr-landingpage-hadiah p{
  margin: 0;
}
.scr-landingpage-hadiah a{
  text-decoration: none;
  color: inherit;
}
.scr-landingpage-hadiah *{
  box-sizing: border-box;
}
.scr-landingpage-hadiah .section-header{
  padding: 40px 16px 6px;
}
.scr-landingpage-hadiah .section-title{
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}
.scr-landingpage-hadiah .section-subtitle{
  font-size: 14px;
  color: #a9b7c8;
  margin-top: 6px;
  line-height: 1.4;
}
.scr-landingpage-hadiah .list-container{
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
}
.scr-landingpage-hadiah .list-item{
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(201, 212, 225, 0.16);
}
.scr-landingpage-hadiah .list-item:last-child{
  border-bottom: none;
}
.scr-landingpage-hadiah .icon-container{
  width: 38px;
  height: 38px;
  background-color: #1f3048;
  border-radius: 19px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.scr-landingpage-hadiah .item-text{
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.scr-landingpage-hadiah .item-title{
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}
.scr-landingpage-hadiah .item-desc{
  font-size: 12px;
  color: #8597ab;
  line-height: 1.4;
}
.scr-landingpage-hadiah .list-container-no-border{
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.scr-landingpage-hadiah .list-item-borderless{
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}
.scr-landingpage-hadiah .icon-container-gradient{
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #2c4c80 0%, #1a3150 100%);
  border-radius: 19px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.scr-landingpage-hadiah .header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}
.scr-landingpage-hadiah .logo{
  width: 51px;
  height: 51px;
  object-fit: cover;
}
.scr-landingpage-hadiah .menu-btn{
  width: 32px;
  height: 32px;
  background-color: #1f3048;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.scr-landingpage-hadiah .hero-content{
  padding: 26px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scr-landingpage-hadiah .breadcrumb{
  font-size: 14px;
  color: #ffffff;
}
.scr-landingpage-hadiah .hero-title{
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  margin-top: 10px;
}
.scr-landingpage-hadiah .hero-desc{
  font-size: 14px;
  color: #a9b7c8;
  line-height: 1.5;
  margin-top: 10px;
}
.scr-landingpage-hadiah .hero-image-container{
  padding-top: 20px;
  display: flex;
  justify-content: center;
}
.scr-landingpage-hadiah .hero-image{
  width: 100%;
  max-width: 378px;
  height: auto;
}
.scr-landingpage-hadiah .tips-container{
  padding: 12px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scr-landingpage-hadiah .tip-item{
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
}
.scr-landingpage-hadiah .bullet{
  width: 6px;
  height: 6px;
  background-color: #8fa1b6;
  border-radius: 3px;
  margin-top: 7px;
  flex-shrink: 0;
}
.scr-landingpage-hadiah .tip-text{
  font-size: 12px;
  color: #c3cedb;
  line-height: 1.4;
}
.scr-landingpage-hadiah .footer{
  background-color: rgba(4, 9, 18, 0.35);
  border-top: 1px solid #1c2d44;
  padding: 28px 16px 32px;
  display: flex;
  flex-direction: column;
}
.scr-landingpage-hadiah .footer-logo{
  width: 44px;
  height: 44px;
  object-fit: cover;
}
.scr-landingpage-hadiah .footer-desc{
  font-size: 12px;
  color: #8597ab;
  margin-top: 10px;
  line-height: 1.5;
}
.scr-landingpage-hadiah .footer-links{
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin-top: 24px;
}
.scr-landingpage-hadiah .link-column{
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.scr-landingpage-hadiah .link-title{
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
}
.scr-landingpage-hadiah .link-item{
  font-size: 12px;
  color: #8597ab;
}
.scr-landingpage-hadiah .app-badges{
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 32px;
}
.scr-landingpage-hadiah .badge{
  height: 22px;
  object-fit: contain;
}
.scr-landingpage-hadiah .footer-disclaimer{
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(201, 212, 225, 0.14);
}
.scr-landingpage-hadiah .footer-disclaimer p{
  font-size: 10px;
  color: #51657e;
  line-height: 1.5;
}
.scr-landingpage-hadiah .footer-copyright{
  margin-top: 16px;
}
.scr-landingpage-hadiah .footer-copyright p{
  font-size: 10px;
  color: #75879c;
}
/* figma re-sync */
.scr-landingpage-hadiah .breadcrumb.breadcrumb { color: #A9B7C8; }
.scr-landingpage-hadiah .section-title.section-title { font-size: 20px; }
.scr-landingpage-hadiah .item-title.item-title { font-weight: 600; }
.scr-landingpage-hadiah .link-item.link-item { font-size: 14px; }
.scr-landingpage-hadiah .link-item.link-item { color: #FFFFFF; }
`;

export default function LandingpageHadiah() {
  return (
    <div className="scr-landingpage-hadiah">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <img src="/assets/img/baa3015660.png" alt="Logo" className="logo" />
          <div className="menu-btn" role="button" aria-label={t('Menu')} data-route="/landing/v2">
            <img src="/assets/img/ab9ce508a0.svg" alt="Menu" />
          </div>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero-content">
          <div className="breadcrumb">{t('Beranda › Hadiah')}</div>
          <h1 className="hero-title">{t('Mengenal program')}<br />{t('hadiah')}</h1>
          <p className="hero-desc">{t('Pelajari berbagai program hadiah yang tersedia,')}<br />{t('jenis hadiahnya, dan bagaimana cara')}<br />{t('mendapatkannya.')}</p>
        </div>
        <div className="hero-image-container">
          <img src="/assets/img/ceb657af0b.png" alt="Hero Image" className="hero-image" />
        </div>
      </section>
      <section id="section-program-hadiah">
        <div className="section-header">
          <h2 className="section-title">{t('Program hadiah')}</h2>
          <p className="section-subtitle">{t('Ada beberapa cara untuk mendapatkan hadiah')}<br />{t('selama menggunakan aplikasi.')}</p>
        </div>
        <div className="list-container">
          <div className="list-item" data-route="/rewards/misi">
            <div className="icon-container">
              <img src="/assets/img/7264e4e8e9.svg" alt="Misi" />
            </div>
            <div className="item-text">
              <h3 className="item-title">{t('Misi')}</h3>
              <p className="item-desc">{t('Selesaikan target tertentu, misalnya mengajak')}<br />{t('teman trading, untuk membuka hadiah.')}</p>
            </div>
          </div>
          <div className="list-item">
            <div className="icon-container">
              <img src="/assets/img/89f22d385a.svg" alt="Absen harian" />
            </div>
            <div className="item-text">
              <h3 className="item-title">{t('Absen harian')}</h3>
              <p className="item-desc">{t('Absen setiap hari dan dapatkan bonus. Hitungan')}<br />{t('absen terus berjalan.')}</p>
            </div>
          </div>
          <div className="list-item" data-route="/rewards/roda">
            <div className="icon-container">
              <img src="/assets/img/8f518a0174.svg" alt="Roda keberuntungan" />
            </div>
            <div className="item-text">
              <h3 className="item-title">{t('Roda keberuntungan')}</h3>
              <p className="item-desc">{t('Putar roda dengan kesempatan yang kamu miliki')}<br />{t('untuk mendapatkan hadiah acak.')}</p>
            </div>
          </div>
          <div className="list-item" data-route="/landing/referral">
            <div className="icon-container">
              <img src="/assets/img/dd4855e8ff.svg" alt="Program referral" />
            </div>
            <div className="item-text">
              <h3 className="item-title">{t('Program referral')}</h3>
              <p className="item-desc">{t('Bagikan link undangan dan dapatkan poin dari')}<br />{t('teman yang bergabung.')}</p>
            </div>
          </div>
          <div className="list-item">
            <div className="icon-container">
              <img src="/assets/img/78c8648747.svg" alt="Poin komunitas" />
            </div>
            <div className="item-text">
              <h3 className="item-title">{t('Poin komunitas')}</h3>
              <p className="item-desc">{t('Dapatkan poin setiap kali membuat postingan di')}<br />{t('Feed.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-jenis-hadiah">
        <div className="section-header">
          <h2 className="section-title">{t('Jenis hadiah')}</h2>
        </div>
        <div className="list-container-no-border">
          <div className="list-item-borderless">
            <div className="icon-container-gradient">
              <img src="/assets/img/499565e1a7.svg" alt="Bonus saldo" />
            </div>
            <div className="item-text">
              <h3 className="item-title">{t('Bonus saldo')}</h3>
              <p className="item-desc">{t('Masuk ke Saldo Tersedia dan bisa langsung')}<br />{t('digunakan atau ditarik.')}</p>
            </div>
          </div>
          <div className="list-item-borderless">
            <div className="icon-container-gradient">
              <img src="/assets/img/7264e4e8e9.svg" alt="Poin" />
            </div>
            <div className="item-text">
              <h3 className="item-title">{t('Poin')}</h3>
              <p className="item-desc">{t('Dikumpulkan dari referral dan aktivitas')}<br />{t('komunitas.')}</p>
            </div>
          </div>
          <div className="list-item-borderless">
            <div className="icon-container-gradient">
              <img src="/assets/img/9a6024f1c3.svg" alt="Hadiah barang" />
            </div>
            <div className="item-text">
              <h3 className="item-title">{t('Hadiah barang')}</h3>
              <p className="item-desc">{t('Dikirim ke alamat pengiriman yang kamu')}<br />{t('daftarkan.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-cara-mendapatkan">
        <div className="section-header">
          <h2 className="section-title">{t('Cara mendapatkan hadiah')}</h2>
        </div>
        <div className="list-container">
          <div className="list-item">
            <div className="icon-container">
              <img src="/assets/img/9fcbb05ca5.svg" alt="Ikuti program" />
            </div>
            <div className="item-text">
              <h3 className="item-title">{t('Ikuti program')}</h3>
              <p className="item-desc">{t('Pilih program hadiah yang ingin kamu ikuti di')}<br />{t('aplikasi.')}</p>
            </div>
          </div>
          <div className="list-item">
            <div className="icon-container">
              <img src="/assets/img/60d1d19331.svg" alt="Selesaikan aktivitas" />
            </div>
            <div className="item-text">
              <h3 className="item-title">{t('Selesaikan aktivitas')}</h3>
              <p className="item-desc">{t('Lakukan aktivitas sesuai syarat masing-masing')}<br />{t('program.')}</p>
            </div>
          </div>
          <div className="list-item">
            <div className="icon-container">
              <img src="/assets/img/fea70f8c22.svg" alt="Hadiah diterima" />
            </div>
            <div className="item-text">
              <h3 className="item-title">{t('Hadiah diterima')}</h3>
              <p className="item-desc">{t('Hadiah otomatis masuk atau dikirim ke')}<br />{t('alamatmu.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-tips">
        <div className="section-header">
          <h2 className="section-title">{t('Tips')}</h2>
        </div>
        <div className="tips-container">
          <div className="tip-item">
            <div className="bullet"></div>
            <p className="tip-text">{t('Absen setiap hari agar hitungan absenmu terus')}<br />{t('bertambah.')}</p>
          </div>
          <div className="tip-item">
            <div className="bullet"></div>
            <p className="tip-text">{t('Lengkapi alamat pengiriman agar hadiah barang')}<br />{t('bisa langsung dikirim.')}</p>
          </div>
          <div className="tip-item">
            <div className="bullet"></div>
            <p className="tip-text">{t('Cek halaman misi secara berkala untuk melihat')}<br />{t('progresmu.')}</p>
          </div>
        </div>
      </section>
      <section id="section-footer">
        <footer className="footer">
          <img src="/assets/img/baa3015660.png" alt="Logo" className="footer-logo" />
          <p className="footer-desc">{t('Platform aset kripto yang mudah, aman, dan transparan')}<br />{t('untuk semua orang.')}</p>
          
          <div className="footer-links">
            <div className="link-column">
              <h4 className="link-title">{t('Produk')}</h4>
              <a href="#" className="link-item" data-route="/landing/holding">{t('Holding')}</a>
              <a href="#" className="link-item" data-route="/landing/hadiah">{t('Hadiah')}</a>
              <a href="#" className="link-item" data-route="/landing/referral">{t('Program Referral')}</a>
            </div>
            <div className="link-column">
              <h4 className="link-title">{t('Perusahaan')}</h4>
              <a href="#" className="link-item" data-route="/landing/tentang">{t('Tentang Kami')}</a>
              <a href="#" className="link-item" data-route="/landing/bantuan">{t('Pusat Bantuan')}</a>
            </div>
            <div className="link-column">
              <h4 className="link-title">{t('Legal')}</h4>
              <a href="#" className="link-item" data-route="/legal/syarat-ketentuan">{t('Syarat & Ketentuan')}</a>
              <a href="#" className="link-item" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a>
              <a href="#" className="link-item" data-route="/legal/perjanjian-klien">{t('Perjanjian Klien')}</a>
            </div>
          </div>
      
          <div className="app-badges">
            <img src="/assets/img/0df4ee1cbf.png" alt="App Store" className="badge" />
            <img src="/assets/img/77d24c42cf.png" alt="Google Play" className="badge" />
          </div>
      
          <div className="footer-disclaimer">
            <p>{t('Aset kripto adalah komoditas yang memiliki risiko tinggi. Est. APR')}<br />{t('bukan jaminan imbal hasil dan dapat berubah sewaktu-waktu. Lorem')}<br />{t('ipsum dolor sit amet, consectetur adipiscing elit.')}</p>
          </div>
      
          <div className="footer-copyright">
            <p>{t('© 2026 PasarCryptoIDN. Hak cipta dilindungi.')}</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
