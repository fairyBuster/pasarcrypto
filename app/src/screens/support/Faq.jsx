// faq — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { t } from '../../lib/i18n.js';

// the frame carries one icon per category; new categories fall back to the first
const CATEGORY_ICONS = {
  akun: '/assets/img/d35075c3ad.svg',
  'saldo & transaksi': '/assets/img/874c931742.svg',
  'poin & feed': '/assets/img/5757ad32de.svg',
};
const FALLBACK_ICON = '/assets/img/d35075c3ad.svg';
const iconFor = (category) => CATEGORY_ICONS[category.toLowerCase()] || FALLBACK_ICON;

const css = `
/* faq — ported from Figma export, typography re-synced */
.scr-faq { background: radial-gradient(100% 100% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-faq *{
  box-sizing: border-box;
}
.scr-faq h1,
.scr-faq h2,
.scr-faq h3,
.scr-faq p{
  margin: 0;
}
.scr-faq button{
  font-family: inherit;
}
.scr-faq .header{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px 0;
}
.scr-faq .icon-btn{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  padding: 0;
}
.scr-faq .page-title{
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}
.scr-faq .spacer{
  width: 40px;
  height: 40px;
}
.scr-faq .search-section{
  padding: 18px 16px 0;
}
.scr-faq .search-bar{
  height: 46px;
  background-color: #1f3048;
  border-radius: 23px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
}
.scr-faq .search-input{
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 14px;
  flex: 1;
  outline: none;
  width: 100%;
}
.scr-faq .search-input::placeholder{
  color: #75879c;
}
.scr-faq .faq-section{
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-top: 22px;
}
.scr-faq .faq-category{
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scr-faq .category-header{
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
.scr-faq .category-icon{
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #5a82bf 0%, #2c4c80 100%);
}
.scr-faq .category-title{
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  flex: 1;
}
.scr-faq .category-count{
  font-size: 12px;
  color: #8597ab;
}
.scr-faq .faq-list{
  background: linear-gradient(180deg, #1c2e46 0%, #16273d 100%);
  border-radius: 18px;
  padding: 0 14px;
  display: flex;
  flex-direction: column;
}
.scr-faq .faq-item{
  padding: 13px 0;
  border-bottom: 1px solid #24364e;
  display: flex;
  flex-direction: column;
}
.scr-faq .faq-item:last-child,
.scr-faq .faq-item.expanded{
  border-bottom: none;
}
.scr-faq .faq-question{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
}
.scr-faq .question-text{
  font-size: 13px;
  line-height: 1.4;
  color: #ffffff;
  flex: 1;
  font-weight: 500;
}
.scr-faq .chevron-icon{
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #24364e;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.scr-faq .chevron-icon.active{
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
}
.scr-faq .faq-answer{
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: #ffffff;
  opacity: 0.85;
  padding-right: 20px;
  white-space: pre-line;
  display: none;
}
.scr-faq .faq-item.expanded .faq-answer{
  display: block;
}
.scr-faq .icon-collapse{
  display: none;
}
.scr-faq .faq-item.expanded .chevron-icon{
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
}
.scr-faq .faq-item.expanded .icon-expand{
  display: none;
}
.scr-faq .faq-item.expanded .icon-collapse{
  display: block;
}
.scr-faq .faq-state{
  padding: 0 16px;
  color: #8597ab;
  font-size: 12px;
  line-height: 1.5;
}
.scr-faq .live-chat-section{
  padding: 26px 16px 28px;
}
.scr-faq .live-chat-banner{
  background: linear-gradient(135deg, #2c4c80 0%, #1f3a62 50%, #152a46 100%);
  border-radius: 22px;
  position: relative;
  display: flex;
  min-height: 179px;
}
.scr-faq .banner-content{
  padding: 16px;
  display: flex;
  flex-direction: column;
  z-index: 2;
  width: 65%;
}
.scr-faq .banner-subtitle{
  color: #9fc0ec;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.scr-faq .banner-title{
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  margin: 5px 0 0 0;
  line-height: 1.3;
}
.scr-faq .banner-badges{
  display: flex;
  flex-direction: row;
  gap: 6px;
  margin-top: 21px;
}
.scr-faq .badge{
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 11px;
  height: 22px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #e6ecf3;
  font-weight: 500;
}
.scr-faq .status-dot{
  width: 6px;
  height: 6px;
  background-color: #3ecf8e;
  border-radius: 3px;
}
.scr-faq .chat-btn{
  margin-top: 30px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  border-radius: 18px;
  padding: 10px 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  color: #0c1a2d;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  width: fit-content;
}
.scr-faq .banner-image{
  position: absolute;
  right: 0;
  bottom: 0;
  width: 162px;
  height: 163px;
  object-fit: contain;
  z-index: 1;
  pointer-events: none;
}
/* figma re-sync */
.scr-faq .page-title.page-title { font-size: 17px; }
.scr-faq .page-title.page-title { font-weight: 700; }
.scr-faq .category-title.category-title { font-weight: 700; }
.scr-faq .category-count.category-count { font-size: 11px; }
.scr-faq .question-text.question-text { font-weight: 400; }
.scr-faq .faq-answer.faq-answer { color: #A9B7C8; }
`;

export default function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;
    api.faqs()
      .then((res) => {
        if (!alive) return;
        if (!res.ok) {
          setError(friendlyError(res.data, 'Gagal memuat FAQ.'));
          setStatus('error');
          return;
        }
        const rows = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setFaqs(rows.filter((row) => row.is_active !== false));
        setStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        setError('Gagal memuat FAQ.');
        setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, []);

  // the search box filters what the API already returned, answers included
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? faqs.filter(
        (faq) =>
          String(faq.question || '').toLowerCase().includes(needle) ||
          String(faq.answer || '').toLowerCase().includes(needle)
      )
    : faqs;

  // rows arrive flat with a category name, so they are grouped in order
  const groups = [];
  [...matches]
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .forEach((faq) => {
      const title = String(faq.category || 'Lainnya').trim();
      let group = groups.find((row) => row.title === title);
      if (!group) {
        group = { title, items: [] };
        groups.push(group);
      }
      group.items.push(faq);
    });

  return (
    <div className="scr-faq">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="icon-btn" data-back="1">
            <img src="/assets/img/2eeb61e53e.svg" alt="Back" />
          </button>
          <h1 className="page-title">{t('Pusat Bantuan')}</h1>
          <div className="spacer"></div>
        </header>
      </section>
      <section id="section-search">
        <div className="search-section">
          <div className="search-bar">
            <img src="/assets/img/8b6a177729.svg" alt="Search" />
            <input
              type="text"
              placeholder={t('Cari pertanyaan…')}
              className="search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </section>
      <section id="section-faq">
        <div className="faq-section">
          
          {status === 'loading' && <p className="faq-state">{t('Memuat FAQ…')}</p>}
          {status === 'error' && <p className="faq-state">{error}</p>}
          {status === 'ready' && groups.length === 0 && (
            <p className="faq-state">{t('Belum ada FAQ yang cocok.')}</p>
          )}
          {groups.map((group) => (
            <div className="faq-category" key={group.title}>
              <div className="category-header">
                <div className="category-icon">
                  <img src={iconFor(group.title)} alt={group.title} />
                </div>
                <h2 className="category-title">{group.title}</h2>
                <span className="category-count">{group.items.length} artikel</span>
              </div>
              <div className="faq-list">
                {group.items.map((faq) => (
                  <div className="faq-item" key={faq.id}>
                    <div className="faq-question">
                      <span className="question-text">{faq.question}</span>
                      <div className="chevron-icon">
                        <img src="/assets/img/be9fafa487.svg" alt="Expand" className="icon-expand" />
                        <img src="/assets/img/c2c0acb54e.svg" alt="Collapse" className="icon-collapse" />
                      </div>
                    </div>
                    <div className="faq-answer">{faq.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      
          

      
          

        </div>
      </section>
      <section id="section-livechat">
        <div className="live-chat-section">
          <div className="live-chat-banner">
            <div className="banner-content">
              <span className="banner-subtitle">{t('LIVE CHAT')}</span>
              <h2 className="banner-title">{t('Ngobrol langsung')}<br />{t('dengan tim kami')}</h2>
              <div className="banner-badges">
                <div className="badge">
                  <span className="status-dot"></span>
                  <span>{t('Online')}</span>
                </div>
                <div className="badge">
                  <span>{t('Respon cepat')}</span>
                </div>
              </div>
              <button className="chat-btn" data-route="/chat-cs">
                {t('Mulai Chat')}
                <img src="/assets/img/380d80e63e.svg" alt="Arrow Right" />
              </button>
            </div>
            <img src="/assets/img/67f3b95004.png" alt="Hand pointing" className="banner-image" />
          </div>
        </div>
      </section>
    </div>
  );
}
