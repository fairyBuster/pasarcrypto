import { t } from '../../lib/i18n.js';
// perjanjian-klien — ported from the Figma export, typography re-synced to Figma
const css = `
/* perjanjian-klien — ported from Figma export, typography re-synced */
.scr-perjanjian-klien { background: radial-gradient(50% 50% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(180deg, #0C1A2D 0%, #13263D 30%, #0F2036 70%, #0A1626 100%); }
.scr-perjanjian-klien{
  font-family: 'Inter', sans-serif;
  margin: 0 auto;
  padding: 0;
  max-width: 412px;
  min-height: 100cqh;
  background: radial-gradient(50% 50% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(180deg, #0C1A2D 0%, #13263D 30%, #0F2036 70%, #0A1626 100%);
  box-sizing: border-box;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}
.scr-perjanjian-klien *{
  box-sizing: border-box;
}
.scr-perjanjian-klien .header{
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px 16px 0;
  position: relative;
}
.scr-perjanjian-klien .back-btn{
  background-color: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1;
  padding: 0;
}
.scr-perjanjian-klien .page-title{
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  pointer-events: none;
}
.scr-perjanjian-klien .subtitle-container{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 24px 0;
}
.scr-perjanjian-klien .subtitle{
  color: #8597ab;
  margin: 0;
  font-size: 12px;
}
.scr-perjanjian-klien .intro-container{
  display: flex;
  flex-direction: column;
  padding: 16px 16px 0;
}
.scr-perjanjian-klien .intro-overlay{
  background-color: rgba(201, 212, 225, 0.1);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.scr-perjanjian-klien .intro-text{
  color: #d3dce7;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}
.scr-perjanjian-klien .terms-container{
  display: flex;
  flex-direction: column;
  padding: 16px 16px 0;
}
.scr-perjanjian-klien .terms-overlay{
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 4px 20px;
  display: flex;
  flex-direction: column;
}
.scr-perjanjian-klien .term-item{
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 0;
}
.scr-perjanjian-klien .term-item.has-border{
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.scr-perjanjian-klien .term-header{
  display: flex;
  align-items: center;
  gap: 10px;
}
.scr-perjanjian-klien .term-number{
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background: linear-gradient(180deg, #F5F7FA 0%, #C7D4E0 100%);
  color: #0c1a2d;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.scr-perjanjian-klien .term-title{
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}
.scr-perjanjian-klien .term-desc-container{
  padding-left: 32px;
  display: flex;
  flex-direction: column;
}
.scr-perjanjian-klien .term-desc{
  color: #a9b7c8;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}
.scr-perjanjian-klien .contact-container{
  display: flex;
  flex-direction: column;
  padding: 16px 16px 0;
}
.scr-perjanjian-klien .contact-overlay{
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.scr-perjanjian-klien .contact-text{
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.scr-perjanjian-klien .contact-title{
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}
.scr-perjanjian-klien .contact-desc{
  color: #a9b7c8;
  font-size: 13px;
  margin: 0;
}
.scr-perjanjian-klien .footer-logos{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 0;
}
.scr-perjanjian-klien .logo-1{
  width: 49px;
  height: 21px;
  object-fit: cover;
  border-radius: 5px;
}
.scr-perjanjian-klien .logo-2{
  width: 68px;
  height: 22px;
  object-fit: cover;
  border-radius: 5px;
}
/* figma re-sync */
.scr-perjanjian-klien .page-title.page-title { font-size: 17px; }
.scr-perjanjian-klien .page-title.page-title { font-weight: 700; }
.scr-perjanjian-klien .intro-text.intro-text { font-size: 13px; }
.scr-perjanjian-klien .contact-title.contact-title { font-size: 13px; }
.scr-perjanjian-klien .contact-desc.contact-desc { font-size: 12px; }
`;

export default function PerjanjianKlien() {
  return (
    <div className="scr-perjanjian-klien">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="back-btn" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/f77e40de90.svg" alt="" />
          </button>
          <h1 className="page-title">{t('Perjanjian Klien')}</h1>
        </header>
      </section>
      <section id="section-intro">
        <div className="subtitle-container">
          <p className="subtitle">{t('Terakhir diperbarui: 18 April 2020')}</p>
        </div>
        <div className="intro-container">
          <div className="intro-overlay">
            <p className="intro-text">{t('Perjanjian Klien ini merupakan kesepakatan antara kamu sebagai Klien dan PasarCryptoID sebagai penyedia layanan.')}</p>
          </div>
        </div>
      </section>
      <section id="section-terms">
        <div className="terms-container">
          <div className="terms-overlay">
            
            <div className="term-item">
              <div className="term-header">
                <div className="term-number">1</div>
                <h2 className="term-title">{t('Para Pihak')}</h2>
              </div>
              <div className="term-desc-container">
                <p className="term-desc">Perjanjian ini dibuat antara pengguna yang telah terdaftar ("Klien") dan PasarCryptoID ("Penyedia Layanan").</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">2</div>
                <h2 className="term-title">{t('Persyaratan Klien')}</h2>
              </div>
              <div className="term-desc-container">
                <p className="term-desc">{t('Klien wajib berusia minimal 18 tahun, cakap secara hukum, dan telah menyelesaikan proses pendaftaran dengan data yang benar.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">3</div>
                <h2 className="term-title">{t('Hak & Kewajiban Klien')}</h2>
              </div>
              <div className="term-desc-container">
                <p className="term-desc">{t('Klien berhak menggunakan layanan sesuai ketentuan yang berlaku. Klien wajib menjaga keamanan akun dan mematuhi seluruh syarat yang ditetapkan oleh Penyedia Layanan.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">4</div>
                <h2 className="term-title">{t('Hak & Kewajiban Penyedia Layanan')}</h2>
              </div>
              <div className="term-desc-container">
                <p className="term-desc">{t('Penyedia Layanan wajib menyediakan layanan sesuai yang dijanjikan dan menjaga kerahasiaan data Klien. Penyedia Layanan berhak menolak atau membatasi transaksi yang mencurigakan.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">5</div>
                <h2 className="term-title">{t('Transaksi & Saldo')}</h2>
              </div>
              <div className="term-desc-container">
                <p className="term-desc">{t('Setiap transaksi yang dilakukan melalui akun Klien dianggap sah dan dilakukan oleh Klien. Klien bertanggung jawab memastikan saldo mencukupi sebelum bertransaksi.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">6</div>
                <h2 className="term-title">{t('Risiko')}</h2>
              </div>
              <div className="term-desc-container">
                <p className="term-desc">{t('Klien memahami bahwa setiap penggunaan layanan memiliki risiko. Klien bertanggung jawab penuh atas keputusan yang diambil dalam menggunakan layanan.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">7</div>
                <h2 className="term-title">{t('Penyelesaian Sengketa')}</h2>
              </div>
              <div className="term-desc-container">
                <p className="term-desc">{t('Setiap perselisihan akan diselesaikan terlebih dahulu secara musyawarah. Jika tidak tercapai kesepakatan, penyelesaian dilakukan sesuai hukum yang berlaku di Indonesia.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">8</div>
                <h2 className="term-title">{t('Masa Berlaku Perjanjian')}</h2>
              </div>
              <div className="term-desc-container">
                <p className="term-desc">{t('Perjanjian ini berlaku sejak Klien menyelesaikan pendaftaran dan tetap berlaku hingga akun ditutup oleh Klien atau Penyedia Layanan.')}</p>
              </div>
            </div>
      
            <div className="term-item has-border">
              <div className="term-header">
                <div className="term-number">9</div>
                <h2 className="term-title">{t('Pernyataan Persetujuan')}</h2>
              </div>
              <div className="term-desc-container">
                <p className="term-desc">{t('Dengan mendaftar, Klien menyatakan telah dewasa, telah membaca dan memahami isi Perjanjian ini, serta menyetujui seluruh ketentuannya.')}</p>
              </div>
            </div>
      
          </div>
        </div>
      </section>
      <section id="section-contact">
        <div className="contact-container">
          <div className="contact-overlay">
            <div className="contact-text">
              <h3 className="contact-title">{t('Ada pertanyaan?')}</h3>
              <p className="contact-desc">{t('Hubungi tim kami melalui menu Bantuan di aplikasi.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-footer">
        <div className="footer-logos">
          <img src="/assets/img/OJK.png" alt="Logo 1" className="logo-1" />
          <img src="/assets/img/BAPPEBTI.png" alt="Logo 2" className="logo-2" />
        </div>
      </section>
    </div>
  );
}
