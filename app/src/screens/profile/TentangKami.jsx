import { t } from '../../lib/i18n.js';
// tentang-kami — ported from the Figma export, typography re-synced to Figma
const css = `
/* tentang-kami — ported from Figma export, typography re-synced */
.scr-tentang-kami { background: radial-gradient(circle at 50% 10%, rgba(78, 108, 142, 0.4) 0%, rgba(78, 108, 142, 0) 50%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-tentang-kami *{
  box-sizing: border-box;
}
.scr-tentang-kami .section-title{
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding: 28px 16px 0;
  color: #ffffff;
}
.scr-tentang-kami .header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 0;
}
.scr-tentang-kami .icon-btn{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  padding: 0;
}
.scr-tentang-kami .header-title{
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}
.scr-tentang-kami .header-spacer{
  width: 40px;
}
.scr-tentang-kami .hero{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 0;
  text-align: center;
}
.scr-tentang-kami .hero-logo{
  width: 102px;
  height: 102px;
  margin-bottom: 14px;
}
.scr-tentang-kami .hero-title{
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #ffffff;
}
.scr-tentang-kami .hero-subtitle{
  font-size: 12px;
  color: #8597ab;
  margin: 0 0 18px 0;
}
.scr-tentang-kami .hero-desc{
  font-size: 12px;
  color: #c3cedb;
  line-height: 1.5;
  margin: 0;
}
.scr-tentang-kami .stats{
  padding: 20px 16px 0;
}
.scr-tentang-kami .stats-container{
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(201, 212, 225, 0.18);
  border-radius: 8px;
  padding: 14px 0;
}
.scr-tentang-kami .stat-item{
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.scr-tentang-kami .stat-divider{
  width: 1px;
  height: 36px;
  background-color: rgba(201, 212, 225, 0.18);
}
.scr-tentang-kami .stat-value{
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}
.scr-tentang-kami .stat-label{
  font-size: 10px;
  color: #8597ab;
}
.scr-tentang-kami .visi-misi{
  padding: 0 16px;
}
.scr-tentang-kami .vm-block{
  margin-bottom: 14px;
}
.scr-tentang-kami .vm-subtitle{
  font-size: 10px;
  color: #8fa6c2;
  margin: 0 0 4px 0;
  font-weight: 600;
}
.scr-tentang-kami .vm-text{
  font-size: 12px;
  color: #d3dce7;
  margin: 0;
  line-height: 1.5;
}
.scr-tentang-kami .vm-list{
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-tentang-kami .vm-list li{
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.scr-tentang-kami .vm-list .bullet{
  width: 6px;
  height: 6px;
  background-color: #8fa1b6;
  border-radius: 2px;
  margin-top: 6px;
  flex-shrink: 0;
}
.scr-tentang-kami .vm-list p{
  font-size: 12px;
  color: #d3dce7;
  margin: 0;
  line-height: 1.5;
}
.scr-tentang-kami .timeline{
  padding: 0 16px;
  display: flex;
  flex-direction: column;
}
.scr-tentang-kami .timeline-item{
  display: flex;
  gap: 12px;
}
.scr-tentang-kami .timeline-marker{
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
}
.scr-tentang-kami .timeline-marker .dot{
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
}
.scr-tentang-kami .timeline-marker .dot.filled{
  background: linear-gradient(135deg, #f5f8fb 0%, #c9d4e1 100%);
}
.scr-tentang-kami .timeline-marker .dot.hollow{
  border: 2px solid #8597ab;
  background: transparent;
  box-sizing: border-box;
}
.scr-tentang-kami .timeline-marker .line{
  width: 2px;
  background-color: #2f4560;
  flex-grow: 1;
  margin-top: 4px;
  margin-bottom: 4px;
  min-height: 40px;
}
.scr-tentang-kami .timeline-content{
  padding-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-tentang-kami .timeline-date{
  font-size: 10px;
  color: #8fa6c2;
}
.scr-tentang-kami .timeline-title{
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}
.scr-tentang-kami .timeline-desc{
  font-size: 11px;
  color: #8597ab;
  line-height: 1.4;
}
.scr-tentang-kami .services-grid{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 12px;
  padding: 0 16px;
}
.scr-tentang-kami .service-item{
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scr-tentang-kami .icon-bg{
  width: 36px;
  height: 36px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scr-tentang-kami .icon-bg.gradient{
  background: linear-gradient(135deg, #2c4c80 0%, #1a3150 100%);
}
.scr-tentang-kami .service-title{
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}
.scr-tentang-kami .service-desc{
  font-size: 10px;
  color: #8597ab;
  line-height: 1.4;
}
.scr-tentang-kami .features-list{
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 16px;
}
.scr-tentang-kami .feature-item{
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.scr-tentang-kami .feature-item .icon-bg{
  width: 38px;
  height: 38px;
  border-radius: 19px;
  flex-shrink: 0;
}
.scr-tentang-kami .feature-content{
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-tentang-kami .feature-title{
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}
.scr-tentang-kami .feature-desc{
  font-size: 11px;
  color: #8597ab;
  line-height: 1.4;
}
.scr-tentang-kami .legal-list{
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}
.scr-tentang-kami .legal-item{
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(201, 212, 225, 0.16);
}
.scr-tentang-kami .legal-item:last-child{
  border-bottom: none;
}
.scr-tentang-kami .legal-item .icon-bg{
  width: 34px;
  height: 34px;
  border-radius: 17px;
  flex-shrink: 0;
}
.scr-tentang-kami .icon-bg.solid{
  background-color: #1f3048;
}
.scr-tentang-kami .legal-content{
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-tentang-kami .legal-label{
  font-size: 10px;
  color: #8597ab;
}
.scr-tentang-kami .legal-value{
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}
.scr-tentang-kami .certificates{
  display: flex;
  gap: 8px;
  padding: 16px 16px 0;
}
.scr-tentang-kami .cert-btn{
  flex: 1;
  height: 64px;
  border: 1px solid #51657e;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #75879c;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.scr-tentang-kami .team-grid{
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
}
.scr-tentang-kami .team-member{
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100px;
}
.scr-tentang-kami .team-photo{
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
}
.scr-tentang-kami .team-name{
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
  line-height: 1.2;
}
.scr-tentang-kami .team-role{
  font-size: 10px;
  color: #8597ab;
}
.scr-tentang-kami .licensed-logos{
  display: flex;
  gap: 12px;
  padding: 0 16px;
  align-items: center;
}
.scr-tentang-kami .licensed-logos img{
  height: 22px;
  object-fit: contain;
  border-radius: 4px;
}
.scr-tentang-kami .contact-list{
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}
.scr-tentang-kami .contact-item{
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(201, 212, 225, 0.16);
}
.scr-tentang-kami .contact-item:last-child{
  border-bottom: none;
}
.scr-tentang-kami .contact-item .icon-bg{
  width: 34px;
  height: 34px;
  border-radius: 17px;
  flex-shrink: 0;
}
.scr-tentang-kami .contact-content{
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-tentang-kami .contact-label{
  font-size: 10px;
  color: #8597ab;
}
.scr-tentang-kami .contact-value{
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.4;
}
.scr-tentang-kami .footer{
  padding: 28px 16px 0;
  text-align: center;
}
.scr-tentang-kami .footer-text{
  font-size: 12px;
  color: #51657e;
  line-height: 1.5;
}
/* figma re-sync */
.scr-tentang-kami .header-title.header-title { font-size: 17px; }
.scr-tentang-kami .header-title.header-title { font-weight: 700; }
.scr-tentang-kami .hero-desc.hero-desc { font-size: 13px; }
.scr-tentang-kami .hero-desc.hero-desc { line-height: 21px; }
.scr-tentang-kami .stat-value.stat-value { font-size: 17px; }
.scr-tentang-kami .stat-label.stat-label { font-size: 11px; }
.scr-tentang-kami .section-title.section-title { font-size: 15px; }
.scr-tentang-kami .section-title.section-title { font-weight: 700; }
.scr-tentang-kami .vm-subtitle.vm-subtitle { font-weight: 700; }
.scr-tentang-kami .vm-text.vm-text { font-size: 13px; }
.scr-tentang-kami .vm-text.vm-text { line-height: 20px; }
.scr-tentang-kami .timeline-date.timeline-date { font-size: 11px; }
.scr-tentang-kami .timeline-title.timeline-title { font-size: 13px; }
.scr-tentang-kami .timeline-desc.timeline-desc { font-size: 12px; }
.scr-tentang-kami .timeline-desc.timeline-desc { line-height: 17px; }
.scr-tentang-kami .service-title.service-title { font-size: 13px; }
.scr-tentang-kami .service-desc.service-desc { font-size: 11px; }
.scr-tentang-kami .service-desc.service-desc { line-height: 16px; }
.scr-tentang-kami .feature-title.feature-title { font-size: 13px; }
.scr-tentang-kami .feature-desc.feature-desc { font-size: 12px; }
.scr-tentang-kami .feature-desc.feature-desc { line-height: 17px; }
.scr-tentang-kami .legal-label.legal-label { font-size: 11px; }
.scr-tentang-kami .legal-value.legal-value { font-size: 13px; }
.scr-tentang-kami .legal-value.legal-value { font-weight: 500; }
.scr-tentang-kami .cert-btn.cert-btn { font-size: 7px; }
.scr-tentang-kami .cert-btn.cert-btn { font-weight: 400; }
.scr-tentang-kami .team-name.team-name { font-size: 12px; }
.scr-tentang-kami .team-name.team-name { line-height: 15px; }
.scr-tentang-kami .team-role.team-role { font-size: 11px; }
.scr-tentang-kami .contact-label.contact-label { font-size: 11px; }
.scr-tentang-kami .contact-value.contact-value { font-size: 13px; }
.scr-tentang-kami .contact-value.contact-value { font-weight: 500; }
.scr-tentang-kami .contact-value.contact-value { line-height: 18px; }
`;

export default function TentangKami() {
  return (
    <div className="scr-tentang-kami">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="icon-btn" data-back="1"><img src="/assets/img/3f019b89bd.svg" alt="Back" /></button>
          <h1 className="header-title">{t('Tentang Kami')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero">
          <img src="/assets/img/baa3015660.png" alt="Logo" className="hero-logo" />
          <h2 className="hero-title">{t('PasarCryptoID')}</h2>
          <p className="hero-subtitle">{t('Platform aset kripto untuk semua orang')}</p>
          <p className="hero-desc">{t('PasarCryptoID adalah platform yang membantu kamu menyimpan dan mengembangkan aset kripto dengan mudah, aman, dan transparan')}</p>
        </div>
      </section>
      <section id="section-stats">
        <div className="stats">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-value">2020</div>
              <div className="stat-label">{t('Berdiri')}</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">{t('100 Rb+')}</div>
              <div className="stat-label">{t('Pengguna')}</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">{t('Sistem aktif')}</div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-visi-misi">
        <h3 className="section-title">{t('Visi & Misi')}</h3>
        <div className="visi-misi">
          <div className="vm-block">
            <h4 className="vm-subtitle">{t('VISI')}</h4>
            <p className="vm-text">{t('Menjadi platform aset kripto paling tepercaya dan mudah digunakan oleh masyarakat Indonesia.')}</p>
          </div>
          <div className="vm-block">
            <h4 className="vm-subtitle">{t('MISI')}</h4>
            <ul className="vm-list">
              <li>
                <span className="bullet"></span>
                <p>{t('Menyediakan produk holding yang aman dan transparan.')}</p>
              </li>
              <li>
                <span className="bullet"></span>
                <p>{t('Membuat investasi kripto mudah dipahami oleh semua kalangan.')}</p>
              </li>
              <li>
                <span className="bullet"></span>
                <p>{t('Memberikan layanan pelanggan yang cepat dan ramah.')}</p>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section id="section-timeline">
        <h3 className="section-title">{t('Perjalanan Kami')}</h3>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-marker">
              <div className="dot filled"></div>
              <div className="line"></div>
            </div>
            <div className="timeline-content">
              <div className="timeline-date">{t('18 April 2020')}</div>
              <div className="timeline-title">{t('Perusahaan didirikan')}</div>
              <div className="timeline-desc">{t('Awal perjalanan dalam mengembangkan layanan aset kripto yang mudah diakses oleh semua orang.')}</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker">
              <div className="dot filled"></div>
              <div className="line"></div>
            </div>
            <div className="timeline-content">
              <div className="timeline-date">{t('Jun 2026')}</div>
              <div className="timeline-title">{t('Peluncuran versi beta')}</div>
              <div className="timeline-desc">{t('Uji coba bersama komunitas awal.')}</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker">
              <div className="dot filled"></div>
              <div className="line"></div>
            </div>
            <div className="timeline-content">
              <div className="timeline-date">{t('Okt 2026')}</div>
              <div className="timeline-title">{t('Peluncuran resmi')}</div>
              <div className="timeline-desc">{t('Aplikasi tersedia untuk umum di Android & iOS.')}</div>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker">
              <div className="dot hollow"></div>
            </div>
            <div className="timeline-content">
              <div className="timeline-date">2027</div>
              <div className="timeline-title">{t('Ekspansi produk')}</div>
              <div className="timeline-desc">{t('Rencana produk dan layanan baru.')}</div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-services">
        <h3 className="section-title">{t('Layanan Kami')}</h3>
        <div className="services-grid">
          <div className="service-item">
            <div className="icon-bg gradient"><img src="/assets/img/a65a881910.svg" alt="" /></div>
            <div className="service-title">{t('Holding')}</div>
            <div className="service-desc">{t('Produk imbal hasil fleksibel & terkunci')}</div>
          </div>
          <div className="service-item">
            <div className="icon-bg gradient"><img src="/assets/img/6b99207650.svg" alt="" /></div>
            <div className="service-title">{t('Deposit & Tarik')}</div>
            <div className="service-desc">{t('Via QRIS dan transfer bank')}</div>
          </div>
          <div className="service-item">
            <div className="icon-bg gradient"><img src="/assets/img/48ab79f370.svg" alt="" /></div>
            <div className="service-title">{t('Program Hadiah')}</div>
            <div className="service-desc">{t('Misi, absen, roda keberuntungan')}</div>
          </div>
          <div className="service-item">
            <div className="icon-bg gradient"><img src="/assets/img/717e0a7906.svg" alt="" /></div>
            <div className="service-title">{t('Komunitas')}</div>
            <div className="service-desc">{t('Berbagi berita & pendapat di Feed')}</div>
          </div>
        </div>
      </section>
      <section id="section-why-us">
        <h3 className="section-title">{t('Kenapa PasarCryptoID?')}</h3>
        <div className="features-list">
          <div className="feature-item">
            <div className="icon-bg gradient"><img src="/assets/img/c7c8c6e7f0.svg" alt="" /></div>
            <div className="feature-content">
              <div className="feature-title">{t('Aman & terlindungi')}</div>
              <div className="feature-desc">{t('Dana dan data pengguna dijaga dengan standar keamanan berlapis.')}</div>
            </div>
          </div>
          <div className="feature-item">
            <div className="icon-bg gradient"><img src="/assets/img/79e6a59bf7.svg" alt="" /></div>
            <div className="feature-content">
              <div className="feature-title">{t('Transparan')}</div>
              <div className="feature-desc">{t('Semua transaksi, imbal hasil, dan biaya tercatat jelas di aplikasi.')}</div>
            </div>
          </div>
          <div className="feature-item">
            <div className="icon-bg gradient"><img src="/assets/img/60d1d19331.svg" alt="" /></div>
            <div className="feature-content">
              <div className="feature-title">{t('Cepat & mudah')}</div>
              <div className="feature-desc">{t('Deposit, penarikan, dan holding bisa dilakukan dalam hitungan menit.')}</div>
            </div>
          </div>
          <div className="feature-item">
            <div className="icon-bg gradient"><img src="/assets/img/f6006a9408.svg" alt="" /></div>
            <div className="feature-content">
              <div className="feature-title">{t('Bantuan setiap hari')}</div>
              <div className="feature-desc">{t('Tim kami siap membantu kamu melalui live chat.')}</div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-legal">
        <h3 className="section-title">{t('Legalitas & Keamanan')}</h3>
        <div className="legal-list">
          <div className="legal-item">
            <div className="icon-bg solid"><img src="/assets/img/532953cd7e.svg" alt="" /></div>
            <div className="legal-content">
              <div className="legal-label">{t('Badan hukum')}</div>
              <div className="legal-value">{t('PasarCryptoID')}</div>
            </div>
          </div>
          <div className="legal-item">
            <div className="icon-bg solid"><img src="/assets/img/532953cd7e.svg" alt="" /></div>
            <div className="legal-content">
              <div className="legal-label">{t('Nomor izin usaha')}</div>
              <div className="legal-value">{t('0002/UPTP/SIP/5/2019')}</div>
            </div>
          </div>
          <div className="legal-item">
            <div className="icon-bg solid"><img src="/assets/img/eff40673b6.svg" alt="" /></div>
            <div className="legal-content">
              <div className="legal-label">{t('Pengawasan')}</div>
              <div className="legal-value">Otoritas Jasa Keuangan dan Badan Pengawas Perdagangan Berjangka Komoditi</div>
            </div>
          </div>
          <div className="legal-item">
            <div className="icon-bg solid"><img src="/assets/img/1f88b21b1f.svg" alt="" /></div>
            <div className="legal-content">
              <div className="legal-label">{t('Enkripsi data')}</div>
              <div className="legal-value">{t('Standar enkripsi industri')}</div>
            </div>
          </div>
          <div className="legal-item">
            <div className="icon-bg solid"><img src="/assets/img/9b7d99e423.svg" alt="" /></div>
            <div className="legal-content">
              <div className="legal-label">{t('Penyimpanan aset')}</div>
              <div className="legal-value">{t('Cold wallet & multi-signature')}</div>
            </div>
          </div>
        </div>
        {/* <div className="certificates">
          <div className="cert-btn">{t('SERTIFIKAT')}</div>
          <div className="cert-btn">{t('SERTIFIKAT')}</div>
          <div className="cert-btn">{t('SERTIFIKAT')}</div>
        </div> */}
      </section>
      <section id="section-team">
        <h3 className="section-title">{t('Tim Kami')}</h3>
        <div className="team-grid">
          <div className="team-member">
            <img src="/assets/img/6a58c276c3.png" alt="Samuel Montgomery" className="team-photo" />
            <div className="team-name">{t('Samuel Montgomery')}</div>
            <div className="team-role">{t('CEO')}</div>
          </div>
          <div className="team-member">
            <img src="/assets/img/a73034c0d1.png" alt="Felix Tanduwijaya" className="team-photo" />
            <div className="team-name">{t('Felix Tanduwijaya')}</div>
            <div className="team-role">{t('CTO')}</div>
          </div>
          <div className="team-member">
            <img src="/assets/img/dc31eb71c3.png" alt="Vivienne Sinclair" className="team-photo" />
            <div className="team-name">{t('Vivienne Sinclair')}</div>
            <div className="team-role">{t('COO')}</div>
          </div>
        </div>
      </section>
      <section id="section-licensed">
        <h3 className="section-title">{t('Berizin oleh')}</h3>
        <div className="licensed-logos">
          <img src="/assets/img/OJK.png" alt="License 1" />
          <img src="/assets/img/BAPPEBTI.png" alt="License 2" />
        </div>
      </section>
      <section id="section-contact">
        <h3 className="section-title">{t('Hubungi Kami')}</h3>
        <div className="contact-list">
          <div className="contact-item">
            <div className="icon-bg solid"><img src="/assets/img/57f3c54e1a.svg" alt="" /></div>
            <div className="contact-content">
              <div className="contact-label">{t('Email')}</div>
              <div className="contact-value">{t('support@pasarcryptoid.com')}</div>
            </div>
          </div>
          <div className="contact-item">
            <div className="icon-bg solid"><img src="/assets/img/fdeae56522.svg" alt="" /></div>
            <div className="contact-content">
              <div className="contact-label">{t('Website')}</div>
              <div className="contact-value">{t('pasarcryptoid.com')}</div>
            </div>
          </div>
          <div className="contact-item">
            <div className="icon-bg solid"><img src="/assets/img/38c337420d.svg" alt="" /></div>
            <div className="contact-content">
              <div className="contact-label">{t('Alamat kantor')}</div>
              <div className="contact-value">{t('Soho Capital, Lantai 39, Suite 3905, Jl. Letjen S. Parman Kav. 28, Tanjung Duren Selatan, Grogol Petamburan, Jakarta Barat, DKI Jakarta 11470.')}</div>
            </div>
          </div>
          <div className="contact-item">
            <div className="icon-bg solid"><img src="/assets/img/566d717448.svg" alt="" /></div>
            <div className="contact-content">
              <div className="contact-label">{t('Jam layanan')}</div>
              <div className="contact-value">{t('Setiap hari, 08.00 – 22.00 WIB')}</div>
            </div>
          </div>
        </div>
      </section>
      <footer id="section-footer">
        <div className="footer">
          <div className="footer-text">{t('PasarCryptoID')}<br />{t('Versi aplikasi 1.0.0')}</div>
        </div>
      </footer>
    </div>
  );
}
