import { t } from '../../lib/i18n.js';
// kebijakan-privasi — ported from the Figma export, typography re-synced to Figma
const css = `
/* kebijakan-privasi — ported from Figma export, typography re-synced */
.scr-kebijakan-privasi { background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-kebijakan-privasi section{
  width: 100%;
  max-width: 412px;
  box-sizing: border-box;
}
.scr-kebijakan-privasi *{
  box-sizing: border-box;
}
.scr-kebijakan-privasi .app-header{
    display: flex;
    align-items: center;
    padding: 20px 16px 0;
    gap: 12px;
  }
.scr-kebijakan-privasi .back-button{
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
.scr-kebijakan-privasi .header-title{
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    flex: 1;
    text-align: center;
    padding-right: 52px; 
  }
.scr-kebijakan-privasi .hero-content{
    padding: 20px 16px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
.scr-kebijakan-privasi .last-updated{
    color: #8597ab;
    font-size: 12px;
    margin: 0 0 16px 0;
    text-align: center;
  }
.scr-kebijakan-privasi .intro-card{
    background-color: rgba(201, 212, 225, 0.1);
    border-radius: 20px;
    padding: 16px;
    width: 100%;
  }
.scr-kebijakan-privasi .intro-card p{
    color: #d3dce7;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }
.scr-kebijakan-privasi .policy-container{
    padding: 24px 16px;
    display: flex;
    justify-content: center;
  }
.scr-kebijakan-privasi .policy-card{
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 4px 20px;
    width: 100%;
  }
.scr-kebijakan-privasi .policy-item{
    padding: 18px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-kebijakan-privasi .policy-item.separator{
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
.scr-kebijakan-privasi .policy-header{
    display: flex;
    align-items: center;
    gap: 10px;
  }
.scr-kebijakan-privasi .policy-number{
    width: 22px;
    height: 22px;
    border-radius: 11px;
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }
.scr-kebijakan-privasi .policy-title{
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }
.scr-kebijakan-privasi .policy-desc{
    color: #a9b7c8;
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    padding-left: 32px;
  }
.scr-kebijakan-privasi .contact-container{
    padding: 0 16px 24px;
    display: flex;
    justify-content: center;
  }
.scr-kebijakan-privasi .contact-card{
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
.scr-kebijakan-privasi .contact-title{
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }
.scr-kebijakan-privasi .contact-desc{
    color: #a9b7c8;
    font-size: 13px;
    margin: 0;
    line-height: 1.4;
  }
.scr-kebijakan-privasi .app-footer{
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 0 0 24px 0;
  }
.scr-kebijakan-privasi .footer-logo{
    height: 22px;
    width: auto;
    object-fit: contain;
    border-radius: 5px;
  }
/* figma re-sync */
.scr-kebijakan-privasi .header-title.header-title { font-size: 17px; }
.scr-kebijakan-privasi .header-title.header-title { font-weight: 700; }
.scr-kebijakan-privasi .contact-title.contact-title { font-size: 13px; }
.scr-kebijakan-privasi .contact-desc.contact-desc { font-size: 12px; }
`;

export default function KebijakanPrivasi() {
  return (
    <div className="scr-kebijakan-privasi">
      <style>{css}</style>
      <section id="section-header">
        <header className="app-header">
          <button className="back-button" aria-label={t('Kembali')} data-back="1">
            <img src="/assets/img/f77e40de90.svg" alt="" />
          </button>
          <h1 className="header-title">{t('Kebijakan Privasi')}</h1>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero-content">
          <p className="last-updated">{t('Terakhir diperbarui: 18 April 2020')}</p>
          <div className="intro-card">
            <p>{t('Kami menghargai privasimu. Kebijakan ini menjelaskan bagaimana data kamu dikumpulkan, digunakan, dan dilindungi.')}</p>
          </div>
        </div>
      </section>
      <section id="section-policy-list">
        <div className="policy-container">
          <div className="policy-card">
            
            <div className="policy-item">
              <div className="policy-header">
                <div className="policy-number">1</div>
                <h2 className="policy-title">{t('Data yang Kami Kumpulkan')}</h2>
              </div>
              <p className="policy-desc">{t('Kami mengumpulkan data yang kamu berikan saat mendaftar dan menggunakan Aplikasi, seperti username, nomor telepon, email, serta data aktivitas penggunaan Aplikasi.')}</p>
            </div>
            
            <div className="policy-item separator">
              <div className="policy-header">
                <div className="policy-number">2</div>
                <h2 className="policy-title">{t('Cara Kami Menggunakan Data')}</h2>
              </div>
              <p className="policy-desc">{t('Data digunakan untuk proses pendaftaran, verifikasi akun, akses login, pemulihan akun, menjalankan layanan, serta meningkatkan kualitas Aplikasi.')}</p>
            </div>
            
            <div className="policy-item separator">
              <div className="policy-header">
                <div className="policy-number">3</div>
                <h2 className="policy-title">{t('Keamanan Data')}</h2>
              </div>
              <p className="policy-desc">{t('Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi data kamu dari akses, perubahan, atau pengungkapan yang tidak sah.')}</p>
            </div>
            
            <div className="policy-item separator">
              <div className="policy-header">
                <div className="policy-number">4</div>
                <h2 className="policy-title">{t('Pembagian Data kepada Pihak Ketiga')}</h2>
              </div>
              <p className="policy-desc">{t('Kami tidak menjual data kamu. Data hanya dapat dibagikan kepada pihak ketiga apabila diperlukan untuk menjalankan layanan, diwajibkan oleh hukum, atau dengan persetujuan darimu.')}</p>
            </div>
            
            <div className="policy-item separator">
              <div className="policy-header">
                <div className="policy-number">5</div>
                <h2 className="policy-title">{t('Hak Pengguna atas Data')}</h2>
              </div>
              <p className="policy-desc">{t('Kamu berhak mengakses, memperbarui, dan meminta penghapusan data pribadimu dengan menghubungi tim kami melalui menu Bantuan.')}</p>
            </div>
            
            <div className="policy-item separator">
              <div className="policy-header">
                <div className="policy-number">6</div>
                <h2 className="policy-title">{t('Penyimpanan Data')}</h2>
              </div>
              <p className="policy-desc">{t('Data disimpan selama akunmu masih aktif atau selama diperlukan untuk memenuhi kewajiban hukum yang berlaku.')}</p>
            </div>
            
            <div className="policy-item separator">
              <div className="policy-header">
                <div className="policy-number">7</div>
                <h2 className="policy-title">{t('Cookie & Teknologi Serupa')}</h2>
              </div>
              <p className="policy-desc">{t('Aplikasi dapat menggunakan cookie atau teknologi serupa untuk menyimpan preferensi dan meningkatkan pengalaman penggunaan.')}</p>
            </div>
            
            <div className="policy-item separator">
              <div className="policy-header">
                <div className="policy-number">8</div>
                <h2 className="policy-title">{t('Perubahan Kebijakan Privasi')}</h2>
              </div>
              <p className="policy-desc">{t('Kebijakan Privasi ini dapat diperbarui sewaktu-waktu. Perubahan akan diinformasikan melalui Aplikasi.')}</p>
            </div>
      
          </div>
        </div>
      </section>
      <section id="section-contact">
        <div className="contact-container">
          <div className="contact-card">
            <h3 className="contact-title">{t('Ada pertanyaan?')}</h3>
            <p className="contact-desc">{t('Hubungi tim kami melalui menu Bantuan di aplikasi.')}</p>
          </div>
        </div>
      </section>
      <section id="section-footer">
        <footer className="app-footer">
          <img src="/assets/img/OJK.png" alt="Logo 1" className="footer-logo" />
          <img src="/assets/img/BAPPEBTI.png" alt="Logo 2" className="footer-logo" />
        </footer>
      </section>
    </div>
  );
}
