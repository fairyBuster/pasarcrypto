// landingpage-materi-detail — ported from the Figma export, typography re-synced to Figma
// opened as /landing/berita/:id it renders the article behind the tapped landing card
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNews, useNewsItem } from '../../lib/useNews.js';
import { readMinutes } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

const pad = (value) => String(value).padStart(2, '0');

const formatDate = (value) => {
  const date = new Date(String(value || '').replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
};

// the API sends plain-text bodies separated by blank lines
const toBlocks = (body) =>
  String(body || '')
    .split(/\r?\n\s*\r?\n/)
    .map((text) => text.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((text) => ({ type: 'p', text }));

// the API has no reading time, so it is estimated from the word count and
// seeded per article, matching the value the landing card showed
const readTime = (item) => `Baca · ${readMinutes(item)} menit`;

// the frame's own copy, kept for the education route opened without an article id
const STATIC_VIEW = {
  breadcrumb: 'Beranda › Materi Edukasi › Pemula',
  tag: 'Pemula',
  title: 'Apa itu aset kripto dan bagaimana cara kerjanya?',
  creator: 'Creator',
  meta: '27-10-2026 · Baca 4 menit',
  image: '',
  blocks: [
    { type: 'p', text: 'Aset kripto adalah aset digital yang menggunakan teknologi kriptografi untuk mengamankan transaksi. Berbeda dengan uang biasa, aset kripto tidak dicetak secara fisik dan tercatat secara digital.' },
    { type: 'h2', text: 'Apa itu aset kripto?' },
    { type: 'p', text: 'Aset kripto adalah bentuk aset digital yang dapat disimpan, dikirim, dan diperdagangkan secara online. Contoh aset kripto yang populer antara lain Bitcoin (BTC), Ethereum (ETH), dan stablecoin seperti USDT.' },
    { type: 'p', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    { type: 'h2', text: 'Bagaimana cara kerjanya?' },
    { type: 'p', text: 'Setiap transaksi aset kripto dicatat dalam sebuah sistem yang disebut blockchain. Blockchain bekerja seperti buku catatan bersama yang tersebar di banyak komputer, sehingga sulit untuk diubah atau dipalsukan.' },
    { type: 'list', items: ['Transaksi dikirim ke jaringan.', 'Transaksi diverifikasi oleh jaringan.', 'Transaksi dicatat secara permanen di blockchain.'] },
    { type: 'h2', text: 'Kenapa aset kripto bisa bernilai?' },
    { type: 'p', text: 'Nilai aset kripto ditentukan oleh banyak faktor, seperti jumlah pengguna, kegunaan teknologinya, dan permintaan di pasar. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.' },
  ],
  keyPoints: [
    'Aset kripto adalah aset digital yang tercatat di blockchain.',
    'Blockchain membuat transaksi aman dan transparan.',
    'Nilai aset kripto dipengaruhi oleh banyak faktor.',
  ],
};

const STATIC_RELATED = [
  { tag: 'Pemula', title: 'Mengenal Bitcoin, aset kripto pertama di dunia', read: 'Baca · 3 menit' },
  { tag: 'Pemula', title: 'Stablecoin: kripto yang nilainya stabil', read: 'Baca · 3 menit' },
  { tag: 'Menengah', title: 'Apa itu blockchain dan kenapa aman?', read: 'Baca · 5 menit' },
];

const css = `
/* landingpage-materi-detail — ported from Figma export, typography re-synced */
.scr-landingpage-materi-detail{
  --bg-main: #0a1626;
  --text-main: #ffffff;
  --text-muted: #8597ab;
  --text-light: #c3cedb;
  --text-lighter: #e6ecf3;
  --accent-blue: #8fb4ea;
  --border-color: #51657e;
  --border-light: rgba(201, 212, 225, 0.18);
  --border-dark: #2a3d56;
}
.scr-landingpage-materi-detail *{
  box-sizing: border-box;
}
.scr-landingpage-materi-detail h1,
.scr-landingpage-materi-detail h2,
.scr-landingpage-materi-detail h3,
.scr-landingpage-materi-detail h4,
.scr-landingpage-materi-detail p{
  margin: 0;
}
.scr-landingpage-materi-detail a{
  text-decoration: none;
  color: inherit;
}
.scr-landingpage-materi-detail .full-width-section{
  width: 100%;
  display: flex;
  justify-content: center;
}
.scr-landingpage-materi-detail .app-container{
  width: 100%;
  max-width: 100%;
  padding: 0 16px;
}
.scr-landingpage-materi-detail .tag{
  background-color: rgba(143, 180, 234, 0.14);
  color: var(--accent-blue);
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-block;
  font-weight: 600;
}
.scr-landingpage-materi-detail .header-container{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    padding-bottom: 16px;
  }
.scr-landingpage-materi-detail .logo{
    width: 51px;
    height: 51px;
    object-fit: contain;
  }
.scr-landingpage-materi-detail .menu-btn{
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
.scr-landingpage-materi-detail .hero-container{
    padding-top: 10px;
    display: flex;
    flex-direction: column;
  }
.scr-landingpage-materi-detail .breadcrumb{
    color: var(--text-muted);
    font-size: 13px;
    margin-bottom: 12px;
  }
.scr-landingpage-materi-detail .tag-wrapper{
    margin-bottom: 12px;
  }
.scr-landingpage-materi-detail .hero-title{
    font-size: 24px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 16px;
  }
.scr-landingpage-materi-detail .meta-info{
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 24px;
  }
.scr-landingpage-materi-detail .creator{
    font-size: 16px;
    font-weight: 600;
  }
.scr-landingpage-materi-detail .date-read{
    font-size: 13px;
    color: var(--text-muted);
  }
.scr-landingpage-materi-detail .main-image-placeholder{
    border: 1px solid var(--border-color);
    border-radius: 22px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #75879c;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 24px;
  }
.scr-landingpage-materi-detail .main-image{
    width: 100%;
    height: auto;
    display: block;
    border-radius: 22px;
    margin-bottom: 24px;
    background-color: #1f3048;
  }
.scr-landingpage-materi-detail .content-container{
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 24px;
  }
.scr-landingpage-materi-detail .intro-text{
    color: var(--text-lighter);
    font-size: 16px;
    line-height: 1.5;
  }
.scr-landingpage-materi-detail .content-container h2{
    font-size: 18px;
    font-weight: 700;
    margin-top: 16px;
    margin-bottom: 2px;
  }
.scr-landingpage-materi-detail .content-container p{
    color: var(--text-light);
    font-size: 15px;
    line-height: 1.5;
  }
.scr-landingpage-materi-detail .custom-list{
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
.scr-landingpage-materi-detail .custom-list li{
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
.scr-landingpage-materi-detail .bullet{
    width: 6px;
    height: 6px;
    background-color: var(--accent-blue);
    border-radius: 3px;
    margin-top: 7px;
    flex-shrink: 0;
  }
.scr-landingpage-materi-detail .custom-list .text{
    color: var(--text-light);
    font-size: 15px;
    line-height: 1.4;
  }
.scr-landingpage-materi-detail .key-points-box{
    background-color: rgba(31, 48, 72, 0.6);
    border: 1px solid var(--accent-blue);
    border-radius: 18px;
    padding: 24px 16px;
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
.scr-landingpage-materi-detail .kp-title{
    color: var(--accent-blue);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
.scr-landingpage-materi-detail .kp-list .text{
    color: #d3dce7;
  }
.scr-landingpage-materi-detail .share-section{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
    padding: 16px 0;
    margin-top: 16px;
  }
.scr-landingpage-materi-detail .share-text{
    color: var(--text-muted);
    font-size: 15px;
  }
.scr-landingpage-materi-detail .share-btn{
    width: 34px;
    height: 34px;
    background-color: #1f3048;
    border-radius: 17px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    cursor: pointer;
    padding: 0;
  }
.scr-landingpage-materi-detail .pagination-container{
    display: flex;
    gap: 10px;
    padding-top: 24px;
    padding-bottom: 40px;
  }
.scr-landingpage-materi-detail .page-card{
    flex: 1;
    border: 1px solid var(--border-dark);
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: background-color 0.2s ease;
  }
.scr-landingpage-materi-detail .page-card:hover{
    background-color: rgba(42, 61, 86, 0.3);
  }
.scr-landingpage-materi-detail .page-card.next{
    align-items: flex-end;
    text-align: right;
  }
.scr-landingpage-materi-detail .nav-label{
    color: var(--text-muted);
    font-size: 13px;
  }
.scr-landingpage-materi-detail .nav-title{
    color: var(--text-main);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
  }
.scr-landingpage-materi-detail .related-container{
    padding-bottom: 40px;
  }
.scr-landingpage-materi-detail .related-heading{
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 16px;
  }
.scr-landingpage-materi-detail .related-list{
    display: flex;
    flex-direction: column;
  }
.scr-landingpage-materi-detail .related-card{
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid rgba(201, 212, 225, 0.16);
  }
.scr-landingpage-materi-detail .related-card:last-child{
    border-bottom: none;
  }
.scr-landingpage-materi-detail .rc-image{
    width: 76px;
    height: 76px;
    border: 1px solid var(--border-color);
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
.scr-landingpage-materi-detail .rc-image img{
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
.scr-landingpage-materi-detail .article-state{
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 40px;
    padding-bottom: 60px;
    color: var(--text-muted);
    font-size: 14px;
  }
.scr-landingpage-materi-detail .article-state a{
    color: var(--accent-blue);
    font-weight: 600;
  }
.scr-landingpage-materi-detail .rc-content{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    flex: 1;
  }
.scr-landingpage-materi-detail .rc-title{
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--text-main);
  }
.scr-landingpage-materi-detail .rc-meta{
    font-size: 13px;
    color: #75879c;
  }
.scr-landingpage-materi-detail .footer-section{
    background-color: rgba(4, 9, 18, 0.35);
    border-top: 1px solid #1c2d44;
    margin-top: 20px;
  }
.scr-landingpage-materi-detail .footer-container{
    padding-top: 28px;
    padding-bottom: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
.scr-landingpage-materi-detail .footer-logo{
    width: 44px;
    height: 44px;
    object-fit: contain;
  }
.scr-landingpage-materi-detail .footer-desc{
    color: var(--text-muted);
    font-size: 14px;
    line-height: 1.4;
  }
.scr-landingpage-materi-detail .footer-links-grid{
    display: flex;
    gap: 16px;
    justify-content: space-between;
  }
.scr-landingpage-materi-detail .footer-col{
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }
.scr-landingpage-materi-detail .footer-col h4{
    color: var(--text-main);
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
  }
.scr-landingpage-materi-detail .footer-col a{
    color: var(--text-muted);
    font-size: 14px;
    transition: color 0.2s ease;
  }
.scr-landingpage-materi-detail .footer-col a:hover{
    color: var(--text-main);
  }
.scr-landingpage-materi-detail .app-badges{
    display: flex;
    gap: 10px;
    align-items: center;
  }
.scr-landingpage-materi-detail .badge{
    height: 22px;
    width: auto;
    object-fit: contain;
    border-radius: 5px;
  }
.scr-landingpage-materi-detail .disclaimer{
    border-top: 1px solid rgba(201, 212, 225, 0.14);
    padding-top: 16px;
    color: #51657e;
    font-size: 12px;
    line-height: 1.5;
  }
.scr-landingpage-materi-detail .copyright{
    color: #75879c;
    font-size: 13px;
  }
/* figma re-sync */
.scr-landingpage-materi-detail .tag.tag { font-size: 10px; }
.scr-landingpage-materi-detail .creator.creator { font-size: 13px; }
.scr-landingpage-materi-detail .date-read.date-read { font-size: 11px; }
.scr-landingpage-materi-detail .intro-text.intro-text { line-height: 26px; }
.scr-landingpage-materi-detail .text.text { line-height: 19px; }
.scr-landingpage-materi-detail .text.text { color: #C3CEDB; }
.scr-landingpage-materi-detail .kp-title.kp-title { font-size: 10px; }
.scr-landingpage-materi-detail .text.text { font-size: 13px; }
.scr-landingpage-materi-detail .share-text.share-text { font-size: 12px; }
.scr-landingpage-materi-detail .nav-label.nav-label { font-size: 11px; }
.scr-landingpage-materi-detail .related-heading.related-heading { font-size: 20px; }
.scr-landingpage-materi-detail .rc-image.rc-image { font-size: 8px; }
.scr-landingpage-materi-detail .rc-image.rc-image { font-weight: 400; }
.scr-landingpage-materi-detail .rc-title.rc-title { font-size: 13px; }
.scr-landingpage-materi-detail .rc-title.rc-title { line-height: 18px; }
.scr-landingpage-materi-detail .rc-meta.rc-meta { font-size: 11px; }
.scr-landingpage-materi-detail .footer-desc.footer-desc { font-size: 12px; }
.scr-landingpage-materi-detail .footer-desc.footer-desc { line-height: 18px; }
.scr-landingpage-materi-detail .disclaimer.disclaimer { font-size: 10px; }
.scr-landingpage-materi-detail .disclaimer.disclaimer { line-height: 15px; }
.scr-landingpage-materi-detail .copyright.copyright { font-size: 11px; }
`;

export default function LandingpageMateriDetail() {
  const { id } = useParams();
  const article = useNewsItem(id);
  const news = useNews();
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    setImageBroken(false);
  }, [id]);

  const isArticle = Boolean(id);

  const view = article.item
    ? {
        breadcrumb: `Beranda › Berita › ${article.item.category_name || 'Umum'}`,
        tag: article.item.category_name || 'Berita',
        title: article.item.title || 'Tanpa judul',
        creator: article.item.author_name || 'Tim Redaksi',
        meta: [formatDate(article.item.published_at), readTime(article.item).replace(' · ', ' ')]
          .filter(Boolean)
          .join(' · '),
        image: article.item.image || '',
        blocks: toBlocks(article.item.body),
        keyPoints: [],
      }
    : STATIC_VIEW;

  const others = news.filter((row) => String(row.id) !== String(id));
  const position = news.findIndex((row) => String(row.id) === String(id));
  const prev = position > 0 ? news[position - 1] : null;
  const next = position >= 0 && position < news.length - 1 ? news[position + 1] : null;

  const header = (
    <section id="section-header" className="full-width-section">
      <header className="app-container header-container">
        <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" className="logo" />
        <button className="menu-btn" aria-label={t('Menu')} data-route="/landing/v2">
          <img src="/assets/img/ab9ce508a0.svg" alt="" />
        </button>
      </header>
    </section>
  );

  // a card tapped on the landing page waits for /api/news/{id}/ before painting
  if (isArticle && article.status !== 'ready') {
    return (
      <div className="scr-landingpage-materi-detail">
        <style>{css}</style>
        {header}
        <section className="full-width-section">
          <div className="app-container article-state">
            <p>{article.status === 'error' ? 'Berita tidak ditemukan.' : 'Memuat berita…'}</p>
            <a href="/landing" data-route="/landing">{t('‹ Kembali ke beranda')}</a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="scr-landingpage-materi-detail">
      <style>{css}</style>
      {header}
      <section id="section-hero" className="full-width-section">
        <div className="app-container hero-container">
          <nav aria-label={t('breadcrumb')} className="breadcrumb">
            {view.breadcrumb}
          </nav>
          <div className="tag-wrapper">
            <span className="tag">{view.tag}</span>
          </div>
          <h1 className="hero-title">{view.title}</h1>
          <div className="meta-info">
            <span className="creator">{view.creator}</span>
            <span className="date-read">{view.meta}</span>
          </div>
          {view.image && !imageBroken ? (
            <img
              src={view.image}
              alt={view.title}
              className="main-image"
              onError={() => setImageBroken(true)}
            />
          ) : (
            <div className="main-image-placeholder">
              <span>{t('AREA GAMBAR UTAMA')}</span>
            </div>
          )}
        </div>
      </section>
      <section id="section-content" className="full-width-section">
        <article className="app-container content-container">
          {view.blocks.map((block, index) => {
            if (block.type === 'h2') {
              return <h2 key={index}>{block.text}</h2>;
            }
            if (block.type === 'list') {
              return (
                <ul className="custom-list" key={index}>
                  {block.items.map((text) => (
                    <li key={text}>
                      <span className="bullet"></span>
                      <span className="text">{text}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={index} className={index === 0 ? 'intro-text' : undefined}>
                {block.text}
              </p>
            );
          })}

          {view.keyPoints.length ? (
            <aside className="key-points-box">
              <div className="kp-title">{t('POIN PENTING')}</div>
              <ul className="custom-list kp-list">
                {view.keyPoints.map((text) => (
                  <li key={text}>
                    <span className="bullet"></span>
                    <span className="text">{text}</span>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          <div className="share-section">
            <span className="share-text">{isArticle ? 'Bagikan artikel ini' : 'Bagikan materi ini'}</span>
            <button className="share-btn" aria-label={t('Share')}>
              <img src="/assets/img/feebc63bc9.svg" alt="" />
            </button>
          </div>
        </article>
      </section>
      {isArticle ? (
        prev || next ? (
          <section id="section-pagination" className="full-width-section">
            <nav aria-label={t('Pagination')} className="app-container pagination-container">
              {prev ? (
                <a
                  href={`/landing/berita/${prev.id}`}
                  className="page-card prev"
                  data-route={`/landing/berita/${prev.id}`}
                >
                  <span className="nav-label">{t('‹ Sebelumnya')}</span>
                  <span className="nav-title">{prev.title}</span>
                </a>
              ) : null}
              {next ? (
                <a
                  href={`/landing/berita/${next.id}`}
                  className="page-card next"
                  data-route={`/landing/berita/${next.id}`}
                >
                  <span className="nav-label">{t('Selanjutnya ›')}</span>
                  <span className="nav-title">{next.title}</span>
                </a>
              ) : null}
            </nav>
          </section>
        ) : null
      ) : (
        <section id="section-pagination" className="full-width-section">
          <nav aria-label={t('Pagination')} className="app-container pagination-container">
            <a href="#" className="page-card prev" data-route="/landing/materi">
              <span className="nav-label">{t('‹ Sebelumnya')}</span>
              <span className="nav-title">{t('Perbedaan aset kripto')}<br />{t('dan mata uang biasa')}</span>
            </a>
            <a href="#" className="page-card next" data-route="/landing/materi">
              <span className="nav-label">{t('Selanjutnya ›')}</span>
              <span className="nav-title">{t('Mengenal Bitcoin, aset')}<br />{t('kripto pertama di')}<br />{t('dunia')}</span>
            </a>
          </nav>
        </section>
      )}
      {isArticle ? (
        others.length ? (
          <section id="section-related" className="full-width-section">
            <div className="app-container related-container">
              <h2 className="related-heading">{t('Berita terkait')}</h2>
              <div className="related-list">
                {others.map((row) => (
                  <a
                    key={row.id}
                    href={`/landing/berita/${row.id}`}
                    className="related-card"
                    data-route={`/landing/berita/${row.id}`}
                  >
                    <div className="rc-image">
                      <span>{t('GAMBAR')}</span>
                      {row.image ? (
                        <img
                          src={row.image}
                          alt={row.title}
                          onError={(event) => event.currentTarget.remove()}
                        />
                      ) : null}
                    </div>
                    <div className="rc-content">
                      <span className="tag">{row.category_name || 'Berita'}</span>
                      <h3 className="rc-title">{row.title}</h3>
                      <span className="rc-meta">{readTime(row)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        ) : null
      ) : (
        <section id="section-related" className="full-width-section">
          <div className="app-container related-container">
            <h2 className="related-heading">{t('Materi terkait')}</h2>
            <div className="related-list">
              {STATIC_RELATED.map((row) => (
                <a key={row.title} href="#" className="related-card" data-route="/landing/materi/detail">
                  <div className="rc-image">{t('GAMBAR')}</div>
                  <div className="rc-content">
                    <span className="tag">{row.tag}</span>
                    <h3 className="rc-title">{row.title}</h3>
                    <span className="rc-meta">{row.read}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
      <section id="section-footer" className="full-width-section footer-section">
        <footer className="app-container footer-container">
          <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" className="footer-logo" />
          <p className="footer-desc">{t('Platform aset kripto yang mudah, aman, dan transparan untuk semua orang.')}</p>
          
          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>{t('Produk')}</h4>
              <a href="#" data-route="/landing/holding">{t('Holding')}</a>
              <a href="#" data-route="/landing/hadiah">{t('Hadiah')}</a>
              <a href="#" data-route="/landing/referral">{t('Program Referral')}</a>
            </div>
            <div className="footer-col">
              <h4>{t('Perusahaan')}</h4>
              <a href="#" data-route="/landing/tentang">{t('Tentang Kami')}</a>
              <a href="#" data-route="/landing/bantuan">{t('Pusat Bantuan')}</a>
            </div>
            <div className="footer-col">
              <h4>{t('Legal')}</h4>
              <a href="#" data-route="/legal/syarat-ketentuan">{t('Syarat & Ketentuan')}</a>
              <a href="#" data-route="/legal/kebijakan-privasi">{t('Kebijakan Privasi')}</a>
              <a href="#" data-route="/legal/perjanjian-klien">{t('Perjanjian Klien')}</a>
            </div>
          </div>
      
          <div className="app-badges">
            <img src="/assets/img/0df4ee1cbf.png" alt="Download on the App Store" className="badge" />
            <img src="/assets/img/77d24c42cf.png" alt="Get it on Google Play" className="badge" />
          </div>
      
          <div className="disclaimer">
            {t('Aset kripto adalah komoditas yang memiliki risiko tinggi. Est. APR bukan jaminan imbal hasil dan dapat berubah sewaktu-waktu. Lorem ipsum dolor sit amet, consectetur adipiscing elit.')}
          </div>
      
          <div className="copyright">
            {t('© 2026 PasarCryptoIDN. Hak cipta dilindungi.')}
          </div>
        </footer>
      </section>
    </div>
  );
}
