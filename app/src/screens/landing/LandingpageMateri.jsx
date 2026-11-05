// landingpage-materi — ported from the Figma export, typography re-synced to Figma
import { useEffect, useMemo, useState } from 'react';
import { useNews } from '../../lib/useNews.js';
import { readMinutes } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

const PAGE_SIZE = 8;
const css = `
/* landingpage-materi — ported from Figma export, typography re-synced */
.scr-landingpage-materi { background: linear-gradient(160deg, #0c1a2d 0%, #13263d 18%, #0f2036 50%, #0c1b2e 80%, #0a1626 100%), 
              radial-gradient(50% 50% at 60% 0%, rgba(44, 72, 104, 0.45) 0%, rgba(44, 72, 104, 0) 100%), 
              radial-gradient(44% 44% at 56% 0%, rgba(78, 108, 142, 0.6) 0%, rgba(78, 108, 142, 0) 100%); }
.scr-landingpage-materi *{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.scr-landingpage-materi a{
  text-decoration: none;
  color: inherit;
}
.scr-landingpage-materi button{
  font-family: inherit;
}
.scr-landingpage-materi .header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
  }
.scr-landingpage-materi .header-logo{
    width: 51px;
    height: 51px;
    object-fit: contain;
  }
.scr-landingpage-materi .header-menu-btn{
    width: 32px;
    height: 32px;
    background-color: #1f3048;
    border-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
.scr-landingpage-materi .hero-content{
    padding: 10px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
.scr-landingpage-materi .breadcrumb{
    color: #ffffff;
    font-size: 14px;
    opacity: 0.9;
  }
.scr-landingpage-materi .hero-title{
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    margin-top: 10px;
    line-height: 1.2;
  }
.scr-landingpage-materi .hero-subtitle{
    font-size: 14px;
    color: #a9b7c8;
    line-height: 1.5;
    margin-top: 4px;
  }
.scr-landingpage-materi .search-container{
    padding: 20px 16px 0;
  }
.scr-landingpage-materi .search-bar{
    display: flex;
    align-items: center;
    gap: 10px;
    height: 46px;
    background-color: #1f3048;
    border: 1px solid #2f4560;
    border-radius: 23px;
    padding: 0 16px;
  }
.scr-landingpage-materi .search-input{
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 14px;
    width: 100%;
    outline: none;
  }
.scr-landingpage-materi .search-input::placeholder{
    color: #75879c;
  }
.scr-landingpage-materi .filter-container{
    padding: 14px 0 0 16px;
  }
.scr-landingpage-materi .filter-scroll{
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 10px;
    scrollbar-width: none; 
  }
.scr-landingpage-materi .filter-scroll::-webkit-scrollbar{
    display: none; 
  }
.scr-landingpage-materi .filter-pill{
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 14px;
    border: none;
    border-radius: 16px;
    background-color: #1f3048;
    color: #a9b7c8;
    font-size: 14px;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s ease;
  }
.scr-landingpage-materi .filter-pill.active{
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    font-weight: 600;
  }
.scr-landingpage-materi .content-list{
    padding: 10px 16px;
    display: flex;
    flex-direction: column;
  }
.scr-landingpage-materi .content-item{
    display: flex;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(201, 212, 225, 0.16);
  }
.scr-landingpage-materi .content-item:last-child{
    border-bottom: none;
  }
.scr-landingpage-materi .item-image-placeholder{
    position: relative;
    overflow: hidden;
    width: 76px;
    height: 76px;
    border: 1px solid #51657e;
    border-radius: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }
.scr-landingpage-materi .item-image-placeholder img{
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 13px;
    object-fit: cover;
  }
.scr-landingpage-materi .item-image-placeholder span{
    color: #75879c;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
.scr-landingpage-materi .item-details{
    display: flex;
    flex-direction: column;
    gap: 6px;
    justify-content: center;
  }
.scr-landingpage-materi .item-tag{
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
    width: fit-content;
    background-color: rgba(143, 180, 234, 0.14);
    color: #8fb4ea;
  }
.scr-landingpage-materi .content-empty{
    color: #75879c;
    font-size: 13px;
    padding: 24px 0;
    text-align: center;
  }
.scr-landingpage-materi .item-title{
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.4;
    margin: 0;
  }
.scr-landingpage-materi .item-meta{
    font-size: 13px;
    color: #75879c;
  }
.scr-landingpage-materi .pagination-container{
    padding: 40px 16px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
.scr-landingpage-materi .pagination-controls{
    display: flex;
    align-items: center;
    gap: 6px;
  }
.scr-landingpage-materi .page-btn,
.scr-landingpage-materi .page-num{
    width: 32px;
    height: 32px;
    border-radius: 16px;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    cursor: pointer;
    background-color: transparent;
    color: #a9b7c8;
  }
.scr-landingpage-materi .page-btn{
    background-color: #1f3048;
  }
.scr-landingpage-materi .page-btn.disabled{
    opacity: 0.4;
    cursor: not-allowed;
  }
.scr-landingpage-materi .page-num.active{
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    font-weight: 600;
  }
.scr-landingpage-materi .pagination-info{
    color: #75879c;
    font-size: 13px;
  }
.scr-landingpage-materi .footer{
    background-color: rgba(4, 9, 18, 0.35);
    border-top: 1px solid #1c2d44;
    padding: 28px 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
.scr-landingpage-materi .footer-logo{
    width: 44px;
    height: 44px;
    object-fit: contain;
  }
.scr-landingpage-materi .footer-desc{
    color: #8597ab;
    font-size: 14px;
    line-height: 1.5;
  }
.scr-landingpage-materi .footer-links{
    display: flex;
    gap: 16px;
    margin-top: 12px;
  }
.scr-landingpage-materi .link-column{
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }
.scr-landingpage-materi .link-column h4{
    color: #ffffff;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 2px;
  }
.scr-landingpage-materi .link-column a{
    color: #8597ab;
    font-size: 14px;
    transition: color 0.2s;
  }
.scr-landingpage-materi .link-column a:hover{
    color: #ffffff;
  }
.scr-landingpage-materi .footer-partners{
    display: flex;
    gap: 10px;
    margin-top: 12px;
  }
.scr-landingpage-materi .partner-logo{
    height: 22px;
    object-fit: contain;
    border-radius: 5px;
  }
.scr-landingpage-materi .footer-disclaimer{
    color: #51657e;
    font-size: 12px;
    line-height: 1.5;
    padding-top: 16px;
    border-top: 1px solid rgba(201, 212, 225, 0.14);
    margin-top: 10px;
  }
.scr-landingpage-materi .footer-copyright{
    color: #75879c;
    font-size: 13px;
    margin-top: 2px;
  }
/* figma re-sync */
.scr-landingpage-materi .breadcrumb.breadcrumb { color: #A9B7C8; }
.scr-landingpage-materi .hero-title.hero-title { font-size: 27px; }
.scr-landingpage-materi .hero-title.hero-title { font-weight: 800; }
.scr-landingpage-materi .hero-title.hero-title { line-height: 34px; }
.scr-landingpage-materi .filter-pill.filter-pill { font-size: 12px; }
.scr-landingpage-materi .filter-pill.filter-pill { color: #0C1A2D; }
.scr-landingpage-materi .item-title.item-title { font-size: 13px; }
.scr-landingpage-materi .item-title.item-title { line-height: 18px; }
.scr-landingpage-materi .item-meta.item-meta { font-size: 11px; }
.scr-landingpage-materi .pagination-info.pagination-info { font-size: 11px; }
.scr-landingpage-materi .footer-desc.footer-desc { font-size: 12px; }
.scr-landingpage-materi .footer-desc.footer-desc { line-height: 18px; }
.scr-landingpage-materi .footer-disclaimer.footer-disclaimer { font-size: 10px; }
.scr-landingpage-materi .footer-disclaimer.footer-disclaimer { line-height: 15px; }
.scr-landingpage-materi .footer-copyright.footer-copyright { font-size: 11px; }
`;

export default function LandingpageMateri() {
  const news = useNews();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [slow, setSlow] = useState(false);

  // the public feed can fail; the list must not sit on "Memuat…" forever
  useEffect(() => {
    if (news.length) return undefined;
    const timer = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(timer);
  }, [news.length]);

  // the pills are the categories the feed actually carries, nothing invented
  const categories = useMemo(() => {
    const seen = [];
    for (const row of news) {
      const name = row.category_name || 'Berita';
      if (!seen.includes(name)) seen.push(name);
    }
    return seen;
  }, [news]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return news.filter((row) => {
      if (category !== 'all' && (row.category_name || 'Berita') !== category) return false;
      return !needle || String(row.title || '').toLowerCase().includes(needle);
    });
  }, [news, category, query]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  const pills = [
    { value: 'all', label: t('Semua') },
    ...categories.map((name) => ({ value: name, label: name })),
  ];

  return (
    <div className="scr-landingpage-materi">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <img src="/assets/img/baa3015660.png" alt="Logo PasarCrypto" className="header-logo" />
          <div className="header-menu-btn" role="button" aria-label={t('Menu')} data-route="/landing/v2">
            <img src="/assets/img/ab9ce508a0.svg" alt="Menu" />
          </div>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero-content">
          <div className="breadcrumb">{t('Beranda › Materi Edukasi')}</div>
          <h1 className="hero-title">{t('Semua materi edukasi')}</h1>
          <p className="hero-subtitle">{t('Pelajari aset kripto langkah demi langkah, dari dasar sampai tips keamanan.')}</p>
        </div>
      </section>
      <section id="section-search-filter">
        <div className="search-container">
          <div className="search-bar">
            <img src="/assets/img/80313efb02.svg" alt="Search Icon" />
            <input
              type="text"
              className="search-input"
              placeholder={t('Cari materi…')}
              aria-label={t('Cari materi')}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div className="filter-container">
          <div className="filter-scroll">
            {pills.map((pill) => (
              <button
                className={`filter-pill${category === pill.value ? ' active' : ''}`}
                key={pill.value}
                type="button"
                aria-pressed={category === pill.value}
                onClick={() => {
                  setCategory(pill.value);
                  setPage(1);
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section id="section-content-list">
        <div className="content-list">
          {visible.map((row) => (
            <a
              className="content-item"
              key={row.id}
              href={`/landing/berita/${row.id}`}
              data-route={`/landing/berita/${row.id}`}
            >
              <div className="item-image-placeholder">
                <span>{t('GAMBAR')}</span>
                {row.image ? (
                  <img
                    src={row.image}
                    alt={row.title}
                    onError={(event) => {
                      event.currentTarget.remove();
                    }}
                  />
                ) : null}
              </div>
              <div className="item-details">
                <div className="item-tag">{row.category_name || t('Berita')}</div>
                <h3 className="item-title">{row.title}</h3>
                <div className="item-meta">{`Baca · ${readMinutes(row)} menit`}</div>
              </div>
            </a>
          ))}

          {visible.length === 0 && (
            <p className="content-empty">
              {!news.length
                ? slow
                  ? t('Materi belum tersedia.')
                  : t('Memuat materi…')
                : t('Tidak ada materi yang cocok.')}
            </p>
          )}
        </div>
      </section>
      <section id="section-pagination">
        <div className="pagination-container">
          <div className="pagination-controls">
            <button
              className={`page-btn${current === 1 ? ' disabled' : ''}`}
              type="button"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <img src="/assets/img/be233d23da.svg" alt={t('Sebelumnya')} />
            </button>
            {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
              <button
                className={`page-num${number === current ? ' active' : ''}`}
                key={number}
                type="button"
                onClick={() => setPage(number)}
              >
                {number}
              </button>
            ))}
            <button
              className={`page-btn${current === pages ? ' disabled' : ''}`}
              type="button"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              <img src="/assets/img/f55e6b8d63.svg" alt={t('Berikutnya')} />
            </button>
          </div>
          <div className="pagination-info">
            {rows.length
              ? t('Menampilkan {from}–{to} dari {total} materi', {
                  from: start + 1,
                  to: Math.min(start + PAGE_SIZE, rows.length),
                  total: rows.length,
                })
              : t('Menampilkan 0 dari 0 materi')}
          </div>
        </div>
      </section>
      <section id="section-footer">
        <footer className="footer">
          <img src="/assets/img/baa3015660.png" alt="Logo PasarCrypto" className="footer-logo" />
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
      
          <div className="footer-partners">
            <img src="/assets/img/OJK.png" alt="Partner 1" className="partner-logo" />
            <img src="/assets/img/BAPPEBTI.png" alt="Partner 2" className="partner-logo" />
          </div>
      
          <div className="footer-disclaimer">
            {t('Aset kripto adalah komoditas yang memiliki risiko tinggi. Est. APR bukan jaminan imbal hasil dan dapat berubah sewaktu-waktu. Lorem ipsum dolor sit amet, consectetur adipiscing elit.')}
          </div>
      
          <div className="footer-copyright">
            {t('© 2026 PasarCryptoIDN. Hak cipta dilindungi.')}
          </div>
        </footer>
      </section>
    </div>
  );
}
