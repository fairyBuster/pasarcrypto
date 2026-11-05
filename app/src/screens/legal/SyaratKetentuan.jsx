import { t } from '../../lib/i18n.js';
// syarat-ketentuan — ported from the Figma export, typography re-synced to Figma
const css = `
/* syarat-ketentuan — ported from Figma export, typography re-synced */
.scr-syarat-ketentuan { background: radial-gradient(circle at 69% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%),
              linear-gradient(160deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-syarat-ketentuan *,
.scr-syarat-ketentuan *::before,
.scr-syarat-ketentuan *::after{
  box-sizing: inherit;
}
.scr-syarat-ketentuan h1,
.scr-syarat-ketentuan h2,
.scr-syarat-ketentuan h3,
.scr-syarat-ketentuan h4,
.scr-syarat-ketentuan p{
  margin: 0;
}
.scr-syarat-ketentuan #section-header{
    padding-top: 20px;
  }
.scr-syarat-ketentuan .top-nav{
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
  }
.scr-syarat-ketentuan .back-button{
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
.scr-syarat-ketentuan .page-title{
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    padding-right: 52px;
  }
.scr-syarat-ketentuan .last-updated{
    padding: 20px 24px 0;
    text-align: center;
  }
.scr-syarat-ketentuan .last-updated p{
    color: #8597ab;
    font-size: 12px;
    font-weight: 400;
  }
.scr-syarat-ketentuan #section-intro{
    padding: 16px 16px 0;
  }
.scr-syarat-ketentuan .intro-card{
    background-color: rgba(201, 212, 225, 0.1);
    border-radius: 20px;
    padding: 16px;
  }
.scr-syarat-ketentuan .intro-card p{
    color: #d3dce7;
    font-size: 14px;
    line-height: 1.4;
    font-weight: 400;
  }
.scr-syarat-ketentuan #section-terms{
    padding: 16px 16px 0;
  }
.scr-syarat-ketentuan .terms-list{
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 4px 20px;
    display: flex;
    flex-direction: column;
  }
.scr-syarat-ketentuan .term-item{
    padding: 18px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-syarat-ketentuan .term-item:not(:first-child){
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
.scr-syarat-ketentuan .term-header{
    display: flex;
    align-items: center;
    gap: 10px;
  }
.scr-syarat-ketentuan .term-number{
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
.scr-syarat-ketentuan .term-title{
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
  }
.scr-syarat-ketentuan .term-content{
    padding-left: 32px;
  }
.scr-syarat-ketentuan .term-content p{
    color: #a9b7c8;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 400;
  }
.scr-syarat-ketentuan #section-footer{
    padding: 16px 16px 24px;
  }
.scr-syarat-ketentuan .help-card{
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 16px;
    margin-bottom: 24px;
  }
.scr-syarat-ketentuan .help-content{
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
.scr-syarat-ketentuan .help-content h3{
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
  }
.scr-syarat-ketentuan .help-content p{
    color: #a9b7c8;
    font-size: 12px;
    font-weight: 400;
  }
.scr-syarat-ketentuan .footer-logos{
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }
.scr-syarat-ketentuan .logo-1{
    width: 49px;
    height: 21px;
    object-fit: contain;
  }
.scr-syarat-ketentuan .logo-2{
    width: 68px;
    height: 22px;
    object-fit: contain;
  }
/* figma re-sync */
.scr-syarat-ketentuan .page-title.page-title { font-size: 17px; }
.scr-syarat-ketentuan .page-title.page-title { font-weight: 700; }
.scr-syarat-ketentuan .term-number.term-number { font-size: 11px; }
`;

export default function SyaratKetentuan() {
  return (
    <div className="scr-syarat-ketentuan">
      <style>{css}</style>
      <section id="section-header">
        <header className="top-nav">
          <button className="back-button" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/f77e40de90.svg" alt="" />
          </button>
          <h1 className="page-title">{t('Syarat & Ketentuan')}</h1>
        </header>
        <div className="last-updated">
          <p>{t('Terakhir diperbarui: 18 April 2020')}</p>
        </div>
      </section>
      <section id="section-intro">
        <div className="intro-card">
          <p>{t('Dengan mendaftar dan menggunakan PasarCryptoID, kamu dianggap telah membaca, memahami, dan menyetujui Syarat & Ketentuan berikut.')}</p>
        </div>
      </section>
      <section id="section-terms">
        <div className="terms-list">
          <div className="term-item">
            <div className="term-header">
              <div className="term-number">1</div>
              <h2 className="term-title">{t('Ketentuan Umum')}</h2>
            </div>
            <div className="term-content">
              <p>{t('Syarat & Ketentuan ini berlaku untuk seluruh pengguna PasarCryptoID. Jika kamu tidak menyetujui sebagian atau seluruh ketentuan ini, mohon untuk tidak menggunakan aplikasi.')}</p>
            </div>
          </div>
          <div className="term-item">
            <div className="term-header">
              <div className="term-number">2</div>
              <h2 className="term-title">{t('Definisi')}</h2>
            </div>
            <div className="term-content">
              <p>{t('"Aplikasi" adalah PasarCryptoID beserta seluruh fitur di dalamnya. "Pengguna" adalah setiap orang yang mendaftar dan menggunakan Aplikasi. "Kami" adalah PasarCryptoID selaku pengelola Aplikasi.')}</p>
            </div>
          </div>
          <div className="term-item">
            <div className="term-header">
              <div className="term-number">3</div>
              <h2 className="term-title">{t('Pendaftaran Akun')}</h2>
            </div>
            <div className="term-content">
              <p>{t('Pengguna wajib berusia minimal 18 tahun dan mengisi data dengan benar, lengkap, dan terbaru. Satu orang hanya diperbolehkan memiliki satu akun.')}</p>
            </div>
          </div>
          <div className="term-item">
            <div className="term-header">
              <div className="term-number">4</div>
              <h2 className="term-title">{t('Keamanan Akun')}</h2>
            </div>
            <div className="term-content">
              <p>{t('Pengguna bertanggung jawab menjaga kerahasiaan username, kata sandi, dan kode verifikasi. Segala aktivitas yang terjadi melalui akun pengguna menjadi tanggung jawab pengguna.')}</p>
            </div>
          </div>
          <div className="term-item">
            <div className="term-header">
              <div className="term-number">5</div>
              <h2 className="term-title">{t('Kewajiban Pengguna')}</h2>
            </div>
            <div className="term-content">
              <p>{t('Pengguna wajib menggunakan Aplikasi sesuai dengan hukum yang berlaku, tidak merugikan pihak lain, dan mematuhi seluruh ketentuan yang ditetapkan oleh Kami.')}</p>
            </div>
          </div>
          <div className="term-item">
            <div className="term-header">
              <div className="term-number">6</div>
              <h2 className="term-title">{t('Larangan Penggunaan')}</h2>
            </div>
            <div className="term-content">
              <p>{t('Pengguna dilarang memalsukan data, menggunakan akun milik orang lain, menyalahgunakan sistem atau celah keamanan, serta menggunakan Aplikasi untuk kegiatan yang melanggar hukum.')}</p>
            </div>
          </div>
          <div className="term-item">
            <div className="term-header">
              <div className="term-number">7</div>
              <h2 className="term-title">{t('Batasan Tanggung Jawab')}</h2>
            </div>
            <div className="term-content">
              <p>{t('Kami tidak bertanggung jawab atas kerugian yang timbul akibat kelalaian pengguna, gangguan jaringan di luar kendali Kami, atau penggunaan Aplikasi yang tidak sesuai ketentuan.')}</p>
            </div>
          </div>
          <div className="term-item">
            <div className="term-header">
              <div className="term-number">8</div>
              <h2 className="term-title">{t('Penangguhan & Penutupan Akun')}</h2>
            </div>
            <div className="term-content">
              <p>{t('Kami berhak menangguhkan atau menutup akun tanpa pemberitahuan sebelumnya apabila ditemukan pelanggaran terhadap Syarat & Ketentuan ini.')}</p>
            </div>
          </div>
          <div className="term-item">
            <div className="term-header">
              <div className="term-number">9</div>
              <h2 className="term-title">{t('Perubahan Ketentuan')}</h2>
            </div>
            <div className="term-content">
              <p>{t('Kami dapat mengubah Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui Aplikasi, dan penggunaan Aplikasi setelah perubahan dianggap sebagai persetujuan.')}</p>
            </div>
          </div>
          <div className="term-item">
            <div className="term-header">
              <div className="term-number">10</div>
              <h2 className="term-title">{t('Hukum yang Berlaku')}</h2>
            </div>
            <div className="term-content">
              <p>{t('Syarat & Ketentuan ini tunduk pada dan ditafsirkan berdasarkan hukum yang berlaku di Negara Republik Indonesia.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-footer">
        <div className="help-card">
          <div className="help-content">
            <h3>{t('Ada pertanyaan?')}</h3>
            <p>{t('Hubungi tim kami melalui menu Bantuan di aplikasi.')}</p>
          </div>
        </div>
        <div className="footer-logos">
          <img src="/assets/img/OJK.png" alt="Logo 1" className="logo-1" />
          <img src="/assets/img/BAPPEBTI.png" alt="Logo 2" className="logo-2" />
        </div>
      </section>
    </div>
  );
}
