import { t } from '../../lib/i18n.js';
// syarat-layanan — ported from the Figma export, typography re-synced to Figma
const css = `
/* syarat-layanan — ported from Figma export, typography re-synced */
.scr-syarat-layanan { background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%), radial-gradient(50% 50% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%); }
.scr-syarat-layanan *{
  box-sizing: border-box;
}
.scr-syarat-layanan p,
.scr-syarat-layanan h1,
.scr-syarat-layanan h2,
.scr-syarat-layanan h3{
  margin: 0;
}
.scr-syarat-layanan section{
  width: 100%;
}
.scr-syarat-layanan .header{
    display: flex;
    align-items: center;
    padding: 20px 16px 0;
    gap: 12px;
  }
.scr-syarat-layanan .back-btn{
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: rgba(255, 255, 255, 0.08);
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    padding: 0;
  }
.scr-syarat-layanan .back-btn img{
    width: 20px;
    height: 20px;
  }
.scr-syarat-layanan .page-title{
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    flex: 1;
    text-align: center;
    padding-right: 52px;
  }
.scr-syarat-layanan .last-updated{
    padding: 20px 24px 0;
    text-align: center;
  }
.scr-syarat-layanan .last-updated p{
    color: #8597ab;
    font-size: 12px;
  }
.scr-syarat-layanan .intro-container{
    padding: 16px 16px 0;
  }
.scr-syarat-layanan .intro-box{
    background-color: rgba(201, 212, 225, 0.1);
    border-radius: 20px;
    padding: 16px;
  }
.scr-syarat-layanan .intro-box p{
    color: #d3dce7;
    font-size: 14px;
    line-height: 1.4;
  }
.scr-syarat-layanan .terms-container{
    padding: 16px 16px 0;
  }
.scr-syarat-layanan .terms-box{
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 4px 20px;
    display: flex;
    flex-direction: column;
  }
.scr-syarat-layanan .term-item{
    padding: 18px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-syarat-layanan .term-item.has-border{
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
.scr-syarat-layanan .term-header{
    display: flex;
    align-items: center;
    gap: 10px;
  }
.scr-syarat-layanan .term-number{
    width: 22px;
    height: 22px;
    border-radius: 11px;
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }
.scr-syarat-layanan .term-title{
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
  }
.scr-syarat-layanan .term-content{
    padding-left: 32px;
  }
.scr-syarat-layanan .term-content p{
    color: #a9b7c8;
    font-size: 12px;
    line-height: 1.5;
  }
.scr-syarat-layanan .contact-container{
    padding: 16px 16px 0;
  }
.scr-syarat-layanan .contact-box{
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 16px;
    display: flex;
    align-items: center;
  }
.scr-syarat-layanan .contact-text{
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
.scr-syarat-layanan .contact-text h3{
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
  }
.scr-syarat-layanan .contact-text p{
    color: #a9b7c8;
    font-size: 12px;
    line-height: 1.4;
  }
.scr-syarat-layanan .footer{
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 24px 0;
    margin-top: auto;
  }
.scr-syarat-layanan .footer-logo-1{
    width: 49px;
    height: 21px;
    border-radius: 5px;
    object-fit: contain;
  }
.scr-syarat-layanan .footer-logo-2{
    width: 68px;
    height: 22px;
    border-radius: 5px;
    object-fit: contain;
  }
/* figma re-sync */
.scr-syarat-layanan .page-title.page-title { font-size: 17px; }
.scr-syarat-layanan .page-title.page-title { font-weight: 700; }
`;

export default function SyaratLayanan() {
  return (
    <div className="scr-syarat-layanan">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="back-btn" aria-label={t('Kembali')} data-back="1">
            <img src="/assets/img/f77e40de90.svg" alt="" />
          </button>
          <h1 className="page-title">{t('Syarat Layanan')}</h1>
        </header>
      </section>
      <section id="section-last-updated">
        <div className="last-updated">
          <p>{t('Terakhir diperbarui: 18 April 2020')}</p>
        </div>
      </section>
      <section id="section-intro">
        <div className="intro-container">
          <div className="intro-box">
            <p>{t('Syarat Layanan ini mengatur penggunaan seluruh fitur dan layanan yang tersedia di PasarCryptoID.')}</p>
          </div>
        </div>
      </section>
      <section id="section-terms-list">
        <div className="terms-container">
          <div className="terms-box">
            
            <div className="term-item">
              <div className="term-header">
                <div className="term-number">1</div>
                <h2 className="term-title">{t('Ruang Lingkup Layanan')}</h2>
              </div>
              <div className="term-content">
                <p>{t('PasarCryptoID menyediakan layanan yang dapat diakses oleh pengguna terdaftar. Jenis dan cakupan layanan dapat berbeda sesuai fitur yang tersedia di Aplikasi.')}</p>
              </div>
            </div>
            
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">2</div>
                <h2 className="term-title">{t('Ketersediaan Layanan')}</h2>
              </div>
              <div className="term-content">
                <p>{t('Kami berupaya agar layanan dapat diakses 24 jam setiap hari. Namun, layanan dapat sewaktu-waktu tidak tersedia karena pemeliharaan, pembaruan sistem, atau kendala teknis.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">3</div>
                <h2 className="term-title">{t('Penggunaan Fitur')}</h2>
              </div>
              <div className="term-content">
                <p>{t('Setiap fitur hanya boleh digunakan sesuai dengan fungsinya. Kami berhak membatasi penggunaan fitur apabila ditemukan aktivitas yang mencurigakan atau tidak wajar.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">4</div>
                <h2 className="term-title">{t('Biaya Layanan')}</h2>
              </div>
              <div className="term-content">
                <p>{t('Beberapa layanan dapat dikenakan biaya. Informasi biaya akan ditampilkan dengan jelas di Aplikasi sebelum pengguna melakukan transaksi.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">5</div>
                <h2 className="term-title">{t('Pemeliharaan & Gangguan Sistem')}</h2>
              </div>
              <div className="term-content">
                <p>{t('Kami akan berusaha memberikan informasi sebelum melakukan pemeliharaan terjadwal. Kami tidak bertanggung jawab atas gangguan yang disebabkan oleh pihak ketiga atau keadaan kahar.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">6</div>
                <h2 className="term-title">{t('Hak Kekayaan Intelektual')}</h2>
              </div>
              <div className="term-content">
                <p>{t('Seluruh konten, logo, desain, dan merek di dalam Aplikasi merupakan milik PasarCryptoID dan dilindungi hukum. Pengguna dilarang menyalin atau menggunakannya tanpa izin tertulis.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">7</div>
                <h2 className="term-title">{t('Penghentian Layanan')}</h2>
              </div>
              <div className="term-content">
                <p>{t('Kami berhak menghentikan sebagian atau seluruh layanan dengan pemberitahuan terlebih dahulu kepada pengguna melalui Aplikasi.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">8</div>
                <h2 className="term-title">{t('Kontak Layanan')}</h2>
              </div>
              <div className="term-content">
                <p>{t('Jika mengalami kendala atau memiliki pertanyaan terkait layanan, pengguna dapat menghubungi tim kami melalui menu Bantuan di Aplikasi.')}</p>
              </div>
            </div>
      
          </div>
        </div>
      </section>
      <section id="section-contact">
        <div className="contact-container">
          <div className="contact-box">
            <div className="contact-text">
              <h3>{t('Ada pertanyaan?')}</h3>
              <p>{t('Hubungi tim kami melalui menu Bantuan di aplikasi.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-footer">
        <footer className="footer">
          <img src="/assets/img/OJK.png" alt="Partner Logo 1" className="footer-logo-1" />
          <img src="/assets/img/BAPPEBTI.png" alt="Partner Logo 2" className="footer-logo-2" />
        </footer>
      </section>
    </div>
  );
}
