// feed — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import BottomNav from '../../components/BottomNav.jsx';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { t } from '../../lib/i18n.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// the design prints "24 Okt" from the Jakarta wall time the API sends
const shortDateID = (value) => {
  const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1] || ''}`.trim() : '—';
};
const css = `
/* feed — ported from Figma export, typography re-synced */
.scr-feed *{
    box-sizing: border-box;
}
.scr-feed p,
.scr-feed h1,
.scr-feed h2,
.scr-feed h3,
.scr-feed h4,
.scr-feed h5,
.scr-feed h6{
    margin: 0;
}
.scr-feed a{
    text-decoration: none;
    color: inherit;
}
.scr-feed button{
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
}
.scr-feed .section-container{
    max-width: 412px;
    margin: 0 auto;
    width: 100%;
    position: relative;
}
.scr-feed #section-header .header-content{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 16px 0 16px;
}
.scr-feed #section-header .header-title{
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
}
.scr-feed #section-header .header-search-btn{
    width: 36px;
    height: 36px;
    background-color: #1f3048;
    border-radius: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.scr-feed #section-header .header-search-btn img{
    width: 18px;
    height: 18px;
}
.scr-feed #section-create-post .create-post-container{
    padding: 18px 16px 0 16px;
}
.scr-feed #section-create-post .create-post-input-row{
    display: flex;
    align-items: center;
    gap: 10px;
}
.scr-feed #section-create-post .user-avatar{
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
}
.scr-feed #section-create-post .input-box{
    flex: 1;
    height: 44px;
    background-color: #1f3048;
    border-radius: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 6px 0 16px;
}
.scr-feed #section-create-post .input-placeholder{
    color: #75879c;
    font-size: 14px;
}
.scr-feed #section-create-post .add-btn{
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background: linear-gradient(135deg, #f5f8fb 0%, #c9d4e1 100%);
    display: flex;
    justify-content: center;
    align-items: center;
}
.scr-feed #section-create-post .add-btn img{
    width: 16px;
    height: 16px;
}
.scr-feed #section-create-post .create-post-subtext{
    font-size: 11px;
    color: #c3cedb;
    padding-left: 46px;
    margin-top: 10px;
}
.scr-feed #section-feed-list .feed-list{
    padding: 18px 16px 96px 16px; 
}
.scr-feed #section-feed-list .post-card{
    border-bottom: 1px solid #1c2d44;
    padding-bottom: 16px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.scr-feed #section-feed-list .post-card:last-child{
    border-bottom: none;
    margin-bottom: 0;
}
.scr-feed #section-feed-list .post-header{
    display: flex;
    align-items: flex-start;
    gap: 10px;
}
.scr-feed #section-feed-list .post-avatar{
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
}
.scr-feed #section-feed-list .post-user-info{
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
}
.scr-feed #section-feed-list .post-user-name-row{
    display: flex;
    align-items: center;
    gap: 5px;
}
.scr-feed #section-feed-list .post-username{
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
}
.scr-feed #section-feed-list .verified-icon{
    width: 15px;
    height: 15px;
}
.scr-feed #section-feed-list .post-date{
    font-size: 12px;
    color: #75879c;
}
.scr-feed #section-feed-list .post-options-btn{
    padding: 2px 0;
}
.scr-feed #section-feed-list .post-options-btn img{
    width: 18px;
    height: 18px;
}
.scr-feed #section-feed-list .post-content{
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.scr-feed #section-feed-list .post-title{
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.4;
}
.scr-feed #section-feed-list .post-body{
    font-size: 14px;
    color: #c3cedb;
    line-height: 1.5;
}
.scr-feed #section-feed-list .post-image-placeholder{
    height: 226px;
    border: 1px solid #51657e;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 6px;
    width: 220px;
}
.scr-feed #section-feed-list .post-image-placeholder span{
    font-size: 12px;
    color: #75879c;
    font-weight: 600;
}
.scr-feed #section-feed-list .post-actions{
    display: flex;
    align-items: center;
    gap: 28px;
    margin-top: 8px;
}
.scr-feed #section-feed-list .action-btn{
    display: flex;
    align-items: center;
    gap: 6px;
}
.scr-feed #section-feed-list .action-btn img{
    width: 18px;
    height: 18px;
}
.scr-feed #section-feed-list .action-btn span{
    font-size: 13px;
    color: #8597ab;
}
.scr-feed #section-feed-list .action-btn span.highlight-text{
    color: #7fa6dc;
}
/* figma re-sync */
.scr-feed .header-title.header-title { font-size: 22px; }
.scr-feed .input-placeholder.input-placeholder { font-size: 13px; }
.scr-feed .create-post-subtext.create-post-subtext { color: #8597AB; }
.scr-feed .post-username.post-username { font-size: 15px; }
.scr-feed .post-title.post-title { font-size: 16px; }
.scr-feed .post-title.post-title { line-height: 23px; }
.scr-feed .post-body.post-body { color: #7FA6DC; }
/* the Figma frame has no loading, empty or failed states */
.scr-feed .list-state{ padding: 12px 0; text-align: center; font-size: 12px; line-height: 18px; color: #75879c; }
.scr-feed .post-images{ display: flex; gap: 8px; overflow-x: auto; margin-top: 6px; padding-bottom: 2px; scrollbar-width: none; }
.scr-feed .post-images::-webkit-scrollbar{ display: none; }
.scr-feed .post-image{ width: 220px; height: 226px; object-fit: cover; border-radius: 12px; border: 1px solid #22344b; flex-shrink: 0; }
.scr-feed .post-image.is-broken{ display: none; }
.scr-feed .action-btn:disabled{ opacity: 0.5; cursor: default; }
/* the magnifier opens an inline caption search; no Figma frame exists for it */
.scr-feed .feed-search-row{
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 0;
}
.scr-feed .feed-search-bar{
  flex: 1;
  height: 40px;
  background-color: #1f3048;
  border: 1px solid #3a5272;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  min-width: 0;
}
.scr-feed .feed-search-bar img{
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}
.scr-feed .feed-search-bar input{
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e6ecf3;
  font-size: 13px;
  font-family: inherit;
  min-width: 0;
}
.scr-feed .feed-search-bar input::placeholder{
  color: #75879c;
}
.scr-feed .feed-search-cancel{
  color: #c9d4e1;
  font-size: 13px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
}
`;

export default function Feed() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(0);
  // the magnifier filters the feed by caption keywords instead of opening the
  // product search; the list is already client-side, so no new request
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  // the list endpoint returns at most five approved reviews, no paging
  useEffect(() => {
    let alive = true;
    api.reviews()
      .then((res) => {
        if (!alive) return;
        if (!res.ok) {
          setError(friendlyError(res.data, 'Gagal memuat feed.'));
          setStatus('error');
          return;
        }
        setReviews(Array.isArray(res.data) ? res.data : []);
        setStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        setError('Gagal memuat feed.');
        setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, []);

  // POST likes, DELETE unlikes; the server answers with the fresh count
  const toggleLike = (review) => {
    if (busyId) return;
    setBusyId(review.id);
    api.likeReview(review.id, review.is_liked)
      .then((res) => {
        if (!res.ok) return;
        setReviews((rows) => rows.map((row) => (row.id === review.id
          ? { ...row, is_liked: Boolean(res.data?.liked), likes_count: Number(res.data?.likes_count) || 0 }
          : row)));
      })
      .catch(() => {})
      .finally(() => setBusyId(0));
  };

  const q = query.trim().toLowerCase();
  const visible = q
    ? reviews.filter((review) => String(review.text || '').toLowerCase().includes(q))
    : reviews;

  return (
    <div className="scr-feed">
      <style>{css}</style>
      <section id="section-header" className="section-container">
          <header className="header-content">
              <h1 className="header-title">{t('Feed')}</h1>
              <button
                  className="header-search-btn"
                  aria-label={t('Cari postingan')}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSearching((open) => !open);
                  }}
              >
                  <img src="/assets/img/73cede68f7.svg" alt="Search" />
              </button>
          </header>
          {searching && (
              <div className="feed-search-row">
                  <div className="feed-search-bar">
                      <img src="/assets/img/73cede68f7.svg" alt="Search" />
                      <input
                          type="text"
                          autoFocus
                          value={query}
                          placeholder={t('Cari kata kunci postingan…')}
                          onChange={(event) => setQuery(event.target.value)}
                      />
                  </div>
                  <button
                      className="feed-search-cancel"
                      onClick={() => {
                        setSearching(false);
                        setQuery('');
                      }}
                  >
                      {t('Batal')}
                  </button>
              </div>
          )}
      </section>
      <section id="section-create-post" className="section-container">
          <div className="create-post-container">
              <div className="create-post-input-row">
                  <img className="user-avatar" src="/assets/img/baa3015660.png" alt="User Avatar" />
                  <div className="input-box" data-route="/feed/create">
                      <span className="input-placeholder">{t('Bagikan berita atau pendapatmu…')}</span>
                      <button className="add-btn">
                          <img src="/assets/img/9b78b09676.svg" alt="Add" />
                      </button>
                  </div>
              </div>
              <div className="create-post-subtext">
                  {t('Dapat +1000 IDR setiap kamu membuat postingan')}
              </div>
          </div>
      </section>
      <section id="section-feed-list" className="section-container">
          <div className="feed-list">
              {status === 'loading' && <p className="list-state">{t('Memuat feed…')}</p>}
              {status === 'error' && <p className="list-state">{error}</p>}
              {status === 'ready' && reviews.length === 0 && (
                  <p className="list-state">{t('Belum ada postingan di Feed.')}</p>
              )}
              {status === 'ready' && reviews.length > 0 && q && visible.length === 0 && (
                  <p className="list-state">{t('Tidak ada postingan yang cocok.')}</p>
              )}
              {visible.map((review) => (
                  <article className="post-card" key={review.id}>
                      <div className="post-header">
                          <img className="post-avatar" src="/assets/img/d27c34de05.png" alt={review.user_display_name} />
                          <div className="post-user-info">
                              <div className="post-user-name-row">
                                  <span className="post-username">{review.user_display_name}</span>
                              </div>
                              <span className="post-date">{shortDateID(review.created_at)}</span>
                          </div>
                      </div>
                      <div className="post-content">
                          <p className="post-body">{review.text}</p>
                          {Array.isArray(review.images) && review.images.length > 0 && (
                              <div className="post-images">
                                  {review.images.map((image) => (
                                      <img
                                          className="post-image"
                                          key={image.id}
                                          src={image.image}
                                          alt="Gambar ulasan"
                                          onError={(event) => {
                                            // the DB can still point at a file that was removed
                                            event.currentTarget.classList.add('is-broken');
                                          }}
                                      />
                                  ))}
                              </div>
                          )}
                      </div>
                      <div className="post-actions">
                          <button
                              type="button"
                              className="action-btn"
                              disabled={busyId === review.id}
                              onClick={(event) => {
                                // the shell shows its own toast for unhandled buttons
                                event.stopPropagation();
                                toggleLike(review);
                              }}
                          >
                              <img
                                  src={review.is_liked ? '/assets/img/c5c8ae3bdf.svg' : '/assets/img/3f6a40a62a.svg'}
                                  alt="Suka"
                              />
                              <span className={review.is_liked ? 'highlight-text' : undefined}>
                                  {review.likes_count ?? 0}
                              </span>
                          </button>
                      </div>
                  </article>
              ))}
          </div>
      </section>
      
      <BottomNav />
    </div>
  );
}
