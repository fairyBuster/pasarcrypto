// landingpage-1 — ported from the Figma export, typography re-synced to Figma
import { useMarketTicker } from '../../lib/useMarketTicker.js';
import { useNews } from '../../lib/useNews.js';
import { readMinutes } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// the hero of the education section is fixed Figma material — it never
// follows the news feed; tapping it opens the static article detail
const FALLBACK_IMG = '/assets/img/18705cb23a.png';
const FEATURED = {
  image: FALLBACK_IMG,
  tag: 'Kategori berita',
  title: 'Apa itu aset kripto dan bagaimana cara kerjanya?',
  desc: 'Kenali konsep dasar aset digital, blockchain, dan kenapa kripto bisa bernilai.',
  read: 'Baca · 4 menit',
};
const FALLBACK_LIST = [
  { tag: 'Kategori berita', title: 'Mengenal Bitcoin, aset kripto pertama di dunia', read: 'Baca · 3 menit' },
  { tag: 'Pemula', title: 'Stablecoin: kripto yang nilainya stabil', read: 'Baca · 3 menit' },
  { tag: 'Menengah', title: 'Apa itu blockchain dan kenapa aman?', read: 'Baca · 5 menit' },
  { tag: 'Keamanan', title: 'Tips menjaga akun dan aset kriptomu', read: 'Baca · 4 menit' },
  { tag: 'Menengah', title: 'Memahami risiko dan volatilitas harga', read: 'Baca · 5 menit' },
];

const readTime = (item) => `Baca · ${readMinutes(item)} menit`;

const css = `
/* landingpage-1 — ported from Figma export, typography re-synced */
.scr-landingpage-1 { background: radial-gradient(100% 100% at 50% 0%, rgba(78, 108, 142, 0.6) 0%, rgba(78, 108, 142, 0) 100%),
              radial-gradient(100% 100% at 50% 0%, rgba(44, 72, 104, 0.45) 0%, rgba(44, 72, 104, 0) 100%),
              linear-gradient(180deg, #0c1a2d 0%, #13263d 18%, #0f2036 50%, #0c1b2e 80%, #0a1626 100%); }
.scr-landingpage-1 *{
  box-sizing: border-box;
}
.scr-landingpage-1 a{
  text-decoration: none;
  color: inherit;
}
.scr-landingpage-1 p,
.scr-landingpage-1 h1,
.scr-landingpage-1 h2,
.scr-landingpage-1 h3,
.scr-landingpage-1 h4,
.scr-landingpage-1 h5,
.scr-landingpage-1 h6{
  margin: 0;
}
.scr-landingpage-1 section{
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  position: relative;
}
.scr-landingpage-1 .site-header{
  padding-top: 16px;
}
.scr-landingpage-1 .top-nav{
  display: flex;
  justify-content: flex-end;
  padding: 0 16px;
  margin-bottom: 14px;
}
.scr-landingpage-1 .menu-icon{
  width: 32px;
  height: 32px;
  background-color: #1f3048;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.scr-landingpage-1 .ticker-wrap{
  width: 100%;
  background-color: rgba(4, 9, 18, 0.3);
  border-top: 1px solid #1c2d44;
  border-bottom: 1px solid #1c2d44;
  padding: 10px 0;
  overflow: hidden;
}
.scr-landingpage-1 .ticker{
  display: flex;
  width: max-content;
  animation: scr-landing-ticker 26s linear infinite;
}
.scr-landingpage-1 .ticker-group{
  display: flex;
  gap: 16px;
  padding-left: 16px;
  white-space: nowrap;
}
@keyframes scr-landing-ticker{
  from{ transform: translateX(0); }
  to{ transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce){.scr-landingpage-1 .ticker{
    animation: none;
  }}
.scr-landingpage-1 .ticker-item{
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.scr-landingpage-1 .coin{
  color: #ffffff;
  font-weight: 600;
}
.scr-landingpage-1 .price{
  color: #a9b7c8;
}
.scr-landingpage-1 .hero-content{
  padding: 28px 16px 0;
  display: flex;
  flex-direction: column;
}
.scr-landingpage-1 .hero-title{
  font-size: 32px;
  line-height: 1.15;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
}
.scr-landingpage-1 .hero-subtitle{
  font-size: 14px;
  line-height: 1.5;
  color: #a9b7c8;
  margin-bottom: 24px;
}
/* the Figma CTA pill: 48px tall, 16px light gradient, full content width */
.scr-landingpage-1 .btn-primary{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.scr-landingpage-1 .btn-primary:active{
  opacity: 0.85;
}
.scr-landingpage-1 .education-content{
  padding: 44px 16px 0;
}
.scr-landingpage-1 .section-header{
  text-align: center;
  margin-bottom: 24px;
}
.scr-landingpage-1 .section-label{
  font-size: 12px;
  font-weight: 600;
  color: #8fa6c2;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 8px;
}
.scr-landingpage-1 .section-title{
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}
.scr-landingpage-1 .section-desc{
  font-size: 14px;
  color: #a9b7c8;
  line-height: 1.5;
  padding: 0 12px;
}
.scr-landingpage-1 .featured-article{
  margin-bottom: 24px;
}
.scr-landingpage-1 .featured-article[data-route],
.scr-landingpage-1 .article-item[data-route]{
  cursor: pointer;
}
.scr-landingpage-1 .featured-img{
  width: calc(100% + 32px);
  margin: 0 -16px 16px;
  height: auto;
  display: block;
}
.scr-landingpage-1 .tag{
  display: inline-block;
  background-color: rgba(143, 180, 234, 0.14);
  color: #8fb4ea;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 10px;
  margin-bottom: 8px;
}
.scr-landingpage-1 .article-title{
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1.3;
}
.scr-landingpage-1 .article-desc{
  font-size: 14px;
  color: #a9b7c8;
  margin-bottom: 12px;
  line-height: 1.4;
}
.scr-landingpage-1 .read-time{
  font-size: 12px;
  color: #75879c;
}
.scr-landingpage-1 .article-list{
  display: flex;
  flex-direction: column;
}
.scr-landingpage-1 .article-item{
  display: flex;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid rgba(201, 212, 225, 0.16);
}
.scr-landingpage-1 .article-thumb{
  width: 76px;
  height: 76px;
  border: 1px solid #51657e;
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #75879c;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.scr-landingpage-1 .article-thumb img{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scr-landingpage-1 .article-info{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}
.scr-landingpage-1 .item-title{
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 6px;
  line-height: 1.3;
}
.scr-landingpage-1 .view-all{
  display: block;
  text-align: center;
  color: #c9d4e1;
  font-size: 14px;
  font-weight: 500;
  margin-top: 12px;
  padding: 12px 0;
}
.scr-landingpage-1 .glossary-content{
  padding: 44px 16px 0;
}
.scr-landingpage-1 .glossary-list{
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.scr-landingpage-1 .glossary-item{
  border-left: 1px solid #3a5272;
  padding: 12px 0 12px 14px;
}
.scr-landingpage-1 .term{
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}
.scr-landingpage-1 .definition{
  font-size: 14px;
  color: #8597ab;
  line-height: 1.4;
}
.scr-landingpage-1 .stats-content{
  padding: 30px 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scr-landingpage-1 .stats-image-container{
  width: 190px;
  margin-bottom: 24px;
}
.scr-landingpage-1 .stats-img{
  width: 100%;
  height: auto;
  display: block;
}
.scr-landingpage-1 .stats-row{
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 355px;
}
.scr-landingpage-1 .stat-item{
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.scr-landingpage-1 .stat-value{
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}
.scr-landingpage-1 .stat-label{
  font-size: 12px;
  color: #8597ab;
}
.scr-landingpage-1 .stat-divider{
  width: 1px;
  background-color: rgba(201, 212, 225, 0.18);
  height: 37px;
}
.scr-landingpage-1 .cta-content{
  padding: 36px 16px 0;
}
.scr-landingpage-1 .cta-box{
  background: radial-gradient(50% 50% at 50% 0%, rgba(127, 170, 230, 0.28) 0%, rgba(127, 170, 230, 0) 100%),
              linear-gradient(180deg, #24426a 0%, #1a3150 55%, #12233a 100%);
  border-radius: 24px;
  padding: 26px 18px;
  text-align: center;
}
.scr-landingpage-1 .cta-title{
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 24px;
}
.scr-landingpage-1 .site-footer{
  padding: 40px 0 0;
}
.scr-landingpage-1 .footer-content{
  background-color: rgba(4, 9, 18, 0.35);
  border-top: 1px solid #1c2d44;
  padding: 28px 16px 32px;
}
.scr-landingpage-1 .footer-logo{
  width: 44px;
  height: 44px;
  margin-bottom: 10px;
}
.scr-landingpage-1 .footer-desc{
  font-size: 14px;
  color: #8597ab;
  line-height: 1.4;
  margin-bottom: 24px;
}
.scr-landingpage-1 .footer-links{
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.scr-landingpage-1 .link-column{
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scr-landingpage-1 .link-column h4{
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
}
.scr-landingpage-1 .link-column a{
  font-size: 13px;
  color: #8597ab;
  transition: color 0.2s ease;
}
.scr-landingpage-1 .link-column a:hover{
  color: #ffffff;
}
.scr-landingpage-1 .app-badges{
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}
.scr-landingpage-1 .badge{
  height: 22px;
  width: auto;
  border-radius: 5px;
  display: block;
}
.scr-landingpage-1 .footer-bottom{
  border-top: 1px solid rgba(201, 212, 225, 0.14);
  padding-top: 16px;
}
.scr-landingpage-1 .disclaimer{
  font-size: 12px;
  color: #51657e;
  line-height: 1.4;
  margin-bottom: 12px;
}
.scr-landingpage-1 .copyright{
  font-size: 12px;
  color: #75879c;
}
/* figma re-sync */
.scr-landingpage-1 .coin.coin { font-weight: 700; }
.scr-landingpage-1 .section-label.section-label { font-size: 11px; }
.scr-landingpage-1 .section-label.section-label { font-weight: 700; }
.scr-landingpage-1 .section-title.section-title { font-size: 22px; }
.scr-landingpage-1 .section-desc.section-desc { font-size: 13px; }
.scr-landingpage-1 .tag.tag { font-size: 10px; }
.scr-landingpage-1 .tag.tag { font-weight: 600; }
.scr-landingpage-1 .article-title.article-title { font-size: 17px; }
.scr-landingpage-1 .article-title.article-title { font-weight: 700; }
.scr-landingpage-1 .article-title.article-title { line-height: 24px; }
.scr-landingpage-1 .article-desc.article-desc { font-size: 13px; }
.scr-landingpage-1 .read-time.read-time { font-size: 11px; }
.scr-landingpage-1 .article-thumb.article-thumb { font-size: 8px; }
.scr-landingpage-1 .article-thumb.article-thumb { font-weight: 400; }
.scr-landingpage-1 .item-title.item-title { font-size: 13px; }
.scr-landingpage-1 .item-title.item-title { line-height: 18px; }
.scr-landingpage-1 .view-all.view-all { font-size: 13px; }
.scr-landingpage-1 .view-all.view-all { font-weight: 600; }
.scr-landingpage-1 .term.term { font-size: 14px; }
.scr-landingpage-1 .term.term { font-weight: 700; }
.scr-landingpage-1 .definition.definition { font-size: 12px; }
.scr-landingpage-1 .definition.definition { line-height: 18px; }
.scr-landingpage-1 .stat-value.stat-value { font-weight: 800; }
.scr-landingpage-1 .stat-label.stat-label { font-size: 11px; }
.scr-landingpage-1 .cta-title.cta-title { font-size: 21px; }
.scr-landingpage-1 .cta-title.cta-title { font-weight: 800; }
.scr-landingpage-1 .footer-desc.footer-desc { font-size: 12px; }
.scr-landingpage-1 .footer-desc.footer-desc { line-height: 18px; }
.scr-landingpage-1 .disclaimer.disclaimer { font-size: 10px; }
.scr-landingpage-1 .disclaimer.disclaimer { line-height: 15px; }
.scr-landingpage-1 .copyright.copyright { font-size: 11px; }
`;

export default function Landingpage1() {
  const ticker = useMarketTicker();
  const news = useNews();

  const featured = FEATURED;

  const list = news.length
    // the frame shows five rows under the featured card, so the rest of the feed
    // is left to the "Lihat semua materi" page
    ? news.slice(1, 6).map((item) => ({
        id: item.id,
        key: item.id,
        image: item.image || '',
        tag: item.category_name || 'Berita',
        title: item.title,
        read: readTime(item),
      }))
    : FALLBACK_LIST.map((item, index) => ({ ...item, key: index, image: '' }));

  // the article detail screen lives at /landing/berita/:id
  const detailRoute = (id) => (id != null ? `/landing/berita/${id}` : undefined);

  return (
    <div className="scr-landingpage-1">
      <style>{css}</style>
      <section id="section-header">
        <header className="site-header">
          <div className="top-nav">
            <div className="menu-icon" data-route="/landing/v2">
              <img src="/assets/img/ab9ce508a0.svg" alt="Menu" />
            </div>
          </div>
          <div className="ticker-wrap">
            <div className="ticker">
              {[0, 1].map((copy) => (
                <div className="ticker-group" key={copy} aria-hidden={copy === 1}>
                  {ticker.map((item) => (
                    <div className="ticker-item" key={item.symbol}>
                      <span className="coin">{item.symbol}</span>
                      <span className="price">{item.price}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero-content">
          <h1 className="hero-title">{t('Asetmu berkembang,')}<br />{t('peluangmu semakin')}<br />{t('luas.')}</h1>
          <p className="hero-subtitle">{t('Kenali potensi aset kripto dan kelola portofoliomu dengan lebih mudah, praktis, dan fleksibel dalam satu platform.')}</p>
          <a href="#" className="btn-primary" data-route="/register">{t('Daftar Gratis')}</a>
        </div>
      </section>
      <section id="section-education">
        <div className="education-content">
          <div className="section-header">
            <span className="section-label">{t('EDUKASI KRIPTO')}</span>
            <h2 className="section-title">{t('Belajar kripto dari dasar')}</h2>
            <p className="section-desc">{t('Pahami dulu sebelum mulai. Materi singkat dan mudah dimengerti untuk pemula.')}</p>
          </div>
          
          <article className="featured-article" data-route="/landing/materi/detail">
            <img
              src={featured.image}
              alt={featured.title}
              className="featured-img"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMG;
              }}
            />
            <div className="article-body">
              <span className="tag">{featured.tag}</span>
              <h3 className="article-title">{featured.title}</h3>
              <p className="article-desc">{featured.desc}</p>
              <span className="read-time">{featured.read}</span>
            </div>
          </article>
      
          <div className="article-list">
            {list.map((item) => (
              <article className="article-item" key={item.key} data-route={detailRoute(item.id)}>
                <div className="article-thumb">
                  <span>{t('GAMBAR')}</span>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={(event) => {
                        event.currentTarget.remove();
                      }}
                    />
                  ) : null}
                </div>
                <div className="article-info">
                  <span className="tag">{item.tag}</span>
                  <h4 className="item-title">{item.title}</h4>
                  <span className="read-time">{item.read}</span>
                </div>
              </article>
            ))}
          </div>
      
          <a href="#" className="view-all" data-route="/landing/materi">{t('Lihat semua materi ›')}</a>
        </div>
      </section>
      <section id="section-glossary">
        <div className="glossary-content">
          <div className="section-header">
            <span className="section-label">{t('ISTILAH PENTING')}</span>
            <h2 className="section-title">{t('Kamus kripto singkat')}</h2>
          </div>
          
          <div className="glossary-list">
            <div className="glossary-item">
              <h4 className="term">{t('Blockchain')}</h4>
              <p className="definition">{t('Catatan transaksi digital yang tersebar dan sulit diubah.')}</p>
            </div>
            <div className="glossary-item">
              <h4 className="term">{t('Stablecoin')}</h4>
              <p className="definition">{t('Aset kripto yang nilainya dipatok ke mata uang, contohnya USDT.')}</p>
            </div>
            <div className="glossary-item">
              <h4 className="term">{t('Volatilitas')}</h4>
              <p className="definition">{t('Seberapa besar dan cepat harga naik-turun dalam waktu tertentu.')}</p>
            </div>
            <div className="glossary-item">
              <h4 className="term">{t('Wallet')}</h4>
              <p className="definition">Tempat menyimpan aset kripto, bisa online (hot) atau offline (cold).</p>
            </div>
            <div className="glossary-item">
              <h4 className="term">{t('APR')}</h4>
              <p className="definition">{t('Persentase imbal hasil per tahun.')}</p>
            </div>
          </div>
        </div>
      </section>
      <section id="section-stats">
        <div className="stats-content">
          <div className="stats-image-container">
            <img src="/assets/img/df8637d510.png" alt="Stats Illustration" className="stats-img" />
          </div>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">{t('100 Rb+')}</span>
              <span className="stat-label">{t('Pengguna aktif')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">10</span>
              <span className="stat-label">{t('Tingkatan rank')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{t('0 IDR')}</span>
              <span className="stat-label">{t('Biaya deposit')}</span>
            </div>
          </div>
        </div>
      </section>
      <section id="section-cta">
        <div className="cta-content">
          <div className="cta-box">
            <h3 className="cta-title">{t('Mulai holding hari ini')}</h3>
            <a href="#" className="btn-primary" data-route="/register">{t('Daftar Sekarang')}</a>
          </div>
        </div>
      </section>
      <section id="section-footer">
        <footer className="site-footer">
          <div className="footer-content">
            <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" className="footer-logo" />
            <p className="footer-desc">{t('Platform aset kripto yang mudah, aman, dan transparan untuk semua orang.')}</p>
            
            <div className="footer-links">
              <div className="link-column">
                <h4>{t('Produk')}</h4>
                <a href="#" data-route="/landing/holding">{t('Holding')}</a>
                <a href="#" data-route="/landing/hadiah">{t('Hadiah')}</a>
                <a href="#" data-route="/landing/referral">{t('Program Referral')}</a>
              </div>
              <div className="link-column">
                <h4>{t('Perusahaan')}</h4>
                <a href="#" data-route="/landing/tentang">{t('Tentang Kami')}</a>
                <a href="#" data-route="/landing/bantuan">{t('Pusat Bantuan')}</a>
              </div>
              <div className="link-column">
                <h4>{t('Legal')}</h4>
                <a href="#" data-route="/legal/syarat-ketentuan">{t('Syarat & Ketentuan')}</a>
                <a href="#" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a>
                <a href="#" data-route="/legal/perjanjian-klien">{t('Perjanjian Klien')}</a>
              </div>
            </div>
      
            <div className="app-badges">
              <a href="#"><img src="/assets/img/OJK.png" alt="Download on the App Store" className="badge" /></a>
              <a href="#"><img src="/assets/img/BAPPEBTI.png" alt="Get it on Google Play" className="badge" /></a>
            </div>
      
            <div className="footer-bottom">
              <p className="disclaimer">{t('Aset kripto adalah komoditas yang memiliki risiko tinggi. Est. APR bukan jaminan imbal hasil dan dapat berubah sewaktu-waktu.')}</p>
              <p className="copyright">{t('© 2026 PasarCryptoIDN. Hak cipta dilindungi.')}</p>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
