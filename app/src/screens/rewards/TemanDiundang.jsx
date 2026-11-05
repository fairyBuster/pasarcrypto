// teman-diundang — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { dateTimeID, idr, maskName, maskPhone } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// "1 2 3 … 8" with the current page always in the row
const pageItems = (current, total) => {
  if (total <= 1) return [1];
  const wanted = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((n) => {
    if (out.length && n - out[out.length - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
};

const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// one shimmering bar, sized like the text it stands in for
const Sk = ({ w = 40, h = 13, r = 5, style }) => (
  <span
    className="sk"
    style={{ width: w, height: `${h}px`, borderRadius: `${r}px`, ...style }}
    aria-hidden="true"
  />
);

// the tab copy names where the level sits in the invite chain
const levelDescription = (level) =>
  level === 1
    ? 'Teman yang daftar langsung pakai kode undanganmu.'
    : `Teman yang diundang oleh teman level ${level - 1} kamu.`;

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'waiting', label: 'Menunggu' },
];

// the invite chain only goes three levels deep
const MAX_LEVEL = 3;

// the screen pages ten members at a time; the API may hand back a whole server
// page per request, so one API page can feed more than one screen page
const PAGE_SIZE = 10;

// the tab row counts every invited member, active or not; the stats endpoint
// splits a level into the two halves, so they are added back together (the max
// keeps the count right when only members_total is filled in)
const levelTotal = (row) =>
  Math.max(num(row.members_total), num(row.members_active) + num(row.members_inactive));

// the two chips are the two halves of the active-member rule the API applies
const StatusChip = ({ on, label }) => (
  <div className="status-badge">
    <div className={on ? 'status-icon checked' : 'status-icon unchecked'}>
      {on && <img src="/assets/img/b0da77b37a.svg" alt="" />}
    </div>
    <span className={on ? 'status-text checked-text' : 'status-text unchecked-text'}>{label}</span>
  </div>
);

const css = `
/* teman-diundang — ported from Figma export, typography re-synced */
.scr-teman-diundang { background: linear-gradient(155deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-teman-diundang *,
.scr-teman-diundang *::before,
.scr-teman-diundang *::after{
  box-sizing: border-box;
}
.scr-teman-diundang body::before{
  content: '';
  position: fixed;
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
  background: radial-gradient(circle at 69% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%);
  pointer-events: none;
  z-index: -1;
}
.scr-teman-diundang section{
  max-width: 412px;
  margin: 0 auto;
  width: 100%;
}
.scr-teman-diundang #section-header{
  padding-top: 20px;
}
.scr-teman-diundang .site-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}
.scr-teman-diundang .icon-btn{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0;
}
.scr-teman-diundang .page-title{
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.scr-teman-diundang #section-tabs{
  padding-top: 20px;
}
.scr-teman-diundang .tabs-container{
  display: flex;
  padding: 0 16px;
  border-bottom: 1px solid #22344b;
}
.scr-teman-diundang .tab{
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding-bottom: 10px;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  margin-bottom: -1px;
}
.scr-teman-diundang .tab.active{
  border-bottom-color: #c9d4e1;
}
.scr-teman-diundang .tab-title{
  font-size: 14px;
  font-weight: 600;
}
.scr-teman-diundang .tab.active .tab-title{ color: #ffffff; }
.scr-teman-diundang .tab:not(.active) .tab-title{ color: #8597ab; }
.scr-teman-diundang .tab-count{
  font-size: 12px;
}
.scr-teman-diundang .tab.active .tab-count{ color: #a9b7c8; }
.scr-teman-diundang .tab:not(.active) .tab-count{ color: #75879c; }
.scr-teman-diundang .tab-description{
  padding: 10px 16px 0;
  color: #a9b7c8;
  font-size: 12px;
}
.scr-teman-diundang #section-filters{
  padding-top: 12px;
}
.scr-teman-diundang .filters-container{
  display: flex;
  gap: 8px;
  padding: 0 16px;
}
.scr-teman-diundang .filter-btn{
  height: 32px;
  padding: 0 14px;
  border-radius: 16px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}
.scr-teman-diundang .filter-btn.active{
  background: linear-gradient(to bottom, #f5f8fb, #c9d4e1);
  color: #0c1a2d;
}
.scr-teman-diundang .filter-btn:not(.active){
  background-color: #1f3048;
  color: #a9b7c8;
}
.scr-teman-diundang #section-user-list{
  padding-top: 4px;
}
.scr-teman-diundang .list-container{
  padding: 0 16px;
  display: flex;
  flex-direction: column;
}
.scr-teman-diundang .list-item{
  padding: 12px 0;
  border-bottom: 1px solid rgba(201, 212, 225, 0.18);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scr-teman-diundang .list-item:last-child{
  border-bottom: none;
}
.scr-teman-diundang .item-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.scr-teman-diundang .username{
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}
.scr-teman-diundang .phone{
  color: #8597ab;
  font-size: 12px;
}
.scr-teman-diundang .item-details{
  display: flex;
  justify-content: space-between;
}
.scr-teman-diundang .detail-col{
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-teman-diundang .detail-col.right{
  align-items: flex-end;
}
.scr-teman-diundang .detail-label{
  color: #75879c;
  font-size: 10px;
}
.scr-teman-diundang .detail-value{
  color: #e6ecf3;
  font-size: 12px;
  font-weight: 500;
}
.scr-teman-diundang .item-status{
  display: flex;
  gap: 16px;
  padding-top: 2px;
}
.scr-teman-diundang .status-badge{
  display: flex;
  align-items: center;
  gap: 6px;
}
.scr-teman-diundang .status-icon{
  width: 14px;
  height: 14px;
  border-radius: 7px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.scr-teman-diundang .status-icon.checked{
  background: linear-gradient(135deg, #5982bf 0%, #2b4c80 100%);
}
.scr-teman-diundang .status-icon.unchecked{
  border: 1px solid #51657e;
  box-sizing: border-box;
}
.scr-teman-diundang .status-text{
  font-size: 10px;
}
.scr-teman-diundang .status-text.checked-text{
  color: #a9b7c8;
}
.scr-teman-diundang .status-text.unchecked-text{
  color: #75879c;
}
.scr-teman-diundang #section-pagination{
  padding-top: 18px;
}
.scr-teman-diundang .pagination-container{
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
}
.scr-teman-diundang .page-btn{
  min-width: 32px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background: transparent;
  color: #a9b7c8;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0 6px;
}
.scr-teman-diundang .page-btn.active{
  background: linear-gradient(to bottom, #f5f8fb, #c9d4e1);
  color: #0c1a2d;
  font-weight: 600;
}
.scr-teman-diundang .page-btn.nav-btn{
  background-color: #1f3048;
  padding: 0;
  width: 32px;
}
.scr-teman-diundang .page-btn.nav-btn.disabled{
  opacity: 0.4;
  cursor: default;
}
.scr-teman-diundang .page-dots{
  color: #75879c;
  font-size: 12px;
  padding: 0 4px;
}
.scr-teman-diundang .pagination-info{
  text-align: center;
  color: #75879c;
  font-size: 10px;
  padding: 10px 16px 28px;
}
/* figma re-sync */
.scr-teman-diundang .page-title.page-title { font-size: 17px; }
.scr-teman-diundang .page-title.page-title { font-weight: 700; }
.scr-teman-diundang .tab-title.tab-title { color: #FFFFFF; }
.scr-teman-diundang .tab-count.tab-count { color: #A9B7C8; }
.scr-teman-diundang .tab-title.tab-title { font-weight: 500; }
.scr-teman-diundang .tab-description.tab-description { color: #8597AB; }
.scr-teman-diundang .filter-btn.filter-btn { font-weight: 600; }
.scr-teman-diundang .status-text.status-text { font-size: 11px; }
.scr-teman-diundang .pagination-info.pagination-info { font-size: 11px; }
/* the Figma frame has no loading, empty, failed or paging states */
.scr-teman-diundang .tab{ padding: 0 0 10px; background: transparent; border: none; font-family: inherit; }
.scr-teman-diundang .list-state{ padding: 12px 0; text-align: center; font-size: 12px; line-height: 18px; color: #75879c; }
.scr-teman-diundang .page-btn:disabled{ opacity: 0.4; cursor: default; }
/* skeleton placeholders — the frame's rows keep their shape while data lands */
.scr-teman-diundang .sk{
  display: block;
  border-radius: 5px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.16) 50%, rgba(255, 255, 255, 0.06) 100%);
  background-size: 220% 100%;
  animation: scr-teman-diundang-shimmer 1.3s ease-in-out infinite;
}
@keyframes scr-teman-diundang-shimmer{
  0%{ background-position: 140% 0; }
  100%{ background-position: -140% 0; }
}
@media (prefers-reduced-motion: reduce){
  .scr-teman-diundang .sk{
    animation: none;
    background: rgba(255, 255, 255, 0.1);
  }
}
.scr-teman-diundang .sk-status{
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
`;

export default function TemanDiundang() {
  const [stats, setStats] = useState([]);
  const [statsStatus, setStatsStatus] = useState('loading');
  const [level, setLevel] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [tab, setTab] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');

  // the tab row shows every level at once, so its counts are read in one go
  useEffect(() => {
    let alive = true;
    api.downlineStats()
      .then((res) => {
        if (!alive) return;
        if (!res.ok) {
          setStatsStatus('error');
          return;
        }
        setStats(Array.isArray(res.data?.levels) ? res.data.levels : []);
        setStatsStatus('ready');
      })
      .catch(() => {
        if (alive) setStatsStatus('error');
      });
    return () => {
      alive = false;
    };
  }, []);

  // the screen pages ten members at a time, while the API hands back a whole
  // server page per request — usually 20 rows, so one API page feeds two
  // screen pages
  const paging = level?.members_pagination;
  const totalMembers = num(paging?.total_members);
  const serverPerPage = Math.max(num(paging?.per_page) || 20, 1);
  const totalPages = Math.max(1, Math.ceil(totalMembers / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const globalStart = (current - 1) * PAGE_SIZE;
  const serverPage = Math.floor(globalStart / serverPerPage) + 1;
  const offset = globalStart % serverPerPage;

  // members are paged per level on the server, so one level is read per visit
  useEffect(() => {
    let alive = true;
    setStatus('loading');
    api.downlineOverview({ level: tab, page: serverPage })
      .then((res) => {
        if (!alive) return;
        if (!res.ok) {
          setError(friendlyError(res.data, 'Gagal memuat teman diundang.'));
          setStatus('error');
          return;
        }
        const rows = Array.isArray(res.data?.levels) ? res.data.levels : [];
        setLevel(rows.find((row) => row.level === tab) || null);
        setStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        setError('Gagal memuat teman diundang.');
        setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [tab, serverPage]);

  // the frame draws all three levels, so an empty one still gets its tab and
  // reads (0) instead of disappearing from the row
  const tabs = Array.from({ length: MAX_LEVEL }, (_, index) =>
    stats.find((row) => num(row.level) === index + 1) || { level: index + 1, members_total: 0 }
  );

  const members = Array.isArray(level?.members) ? level.members : [];
  // only the rows that belong to the current screen page stay on screen
  const pageRows = members.slice(offset, offset + PAGE_SIZE);
  const visible = filter === 'all'
    ? pageRows
    : pageRows.filter((member) => (filter === 'active' ? member.is_active : !member.is_active));

  const firstRow = totalMembers ? globalStart + 1 : 0;
  const lastRow = firstRow ? firstRow + pageRows.length - 1 : 0;
  const pagingText = filter === 'all'
    ? `Menampilkan ${firstRow}–${lastRow} dari ${totalMembers} teman`
    : `Menampilkan ${visible.length} dari ${pageRows.length} teman di halaman ini`;

  return (
    <div className="scr-teman-diundang">
      <style>{css}</style>
      <section id="section-header">
        <header className="site-header">
          <button className="icon-btn" data-back="1"><img src="/assets/img/44b91558db.svg" alt="Back" /></button>
          <h1 className="page-title">{t('Teman Diundang')}</h1>
          <button className="icon-btn" data-route="/riwayat/komisi"><img src="/assets/img/f5e88f73e1.svg" alt="Riwayat komisi" /></button>
        </header>
      </section>
      <section id="section-tabs">
        <div className="tabs-container">
          {tabs.map((row) => (
            <button
              key={row.level}
              type="button"
              className={row.level === tab ? 'tab active' : 'tab'}
              onClick={(event) => {
                event.stopPropagation();
                setTab(row.level);
                setPage(1);
              }}
            >
              <span className="tab-title">Level {row.level}</span>
              <span className="tab-count">
                {statsStatus === 'ready' ? (
                  `(${idr(levelTotal(row))})`
                ) : statsStatus === 'error' ? (
                  '(—)'
                ) : (
                  <Sk w={20} h={11} r={4} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                )}
              </span>
            </button>
          ))}
        </div>
        <div className="tab-description">
          {levelDescription(tab)}
        </div>
      </section>
      <section id="section-filters">
        <div className="filters-container">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === filter ? 'filter-btn active' : 'filter-btn'}
              onClick={(event) => {
                event.stopPropagation();
                setFilter(item.key);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
      <section id="section-user-list">
        <div className="list-container">
          {status === 'loading' && (
            <>
              <p className="sk-status" role="status">{t('Memuat teman diundang…')}</p>
              {[0, 1, 2].map((slot) => (
                <article className="list-item" key={`skeleton-${slot}`} aria-hidden="true">
                  <div className="item-header">
                    <Sk w={96} h={14} r={5} />
                    <Sk w={88} h={12} r={5} />
                  </div>
                  <div className="item-details">
                    <div className="detail-col" style={{ gap: '6px' }}>
                      <Sk w={72} h={10} r={4} />
                      <Sk w={110} h={12} r={5} />
                    </div>
                    <div className="detail-col right" style={{ gap: '6px' }}>
                      <Sk w={64} h={10} r={4} />
                      <Sk w={90} h={12} r={5} />
                    </div>
                  </div>
                  <div className="item-status">
                    <Sk w={88} h={14} r={7} />
                    <Sk w={96} h={14} r={7} />
                  </div>
                </article>
              ))}
            </>
          )}
          {status === 'error' && <div className="list-state">{error}</div>}
          {status === 'ready' && visible.length === 0 && (
            <div className="list-state">
              {members.length === 0
                ? 'Belum ada teman di level ini.'
                : 'Tidak ada teman dengan status ini di halaman ini.'}
            </div>
          )}

          {status === 'ready' && visible.map((member) => (
            <article className="list-item" key={member.phone}>
              <div className="item-header">
                <div className="username">{maskName(member.username)}</div>
                <div className="phone">{maskPhone(member.phone)}</div>
              </div>
              <div className="item-details">
                <div className="detail-col">
                  <div className="detail-label">{t('Tanggal Registrasi')}</div>
                  <div className="detail-value">{dateTimeID(member.registration_date)}</div>
                </div>
                <div className="detail-col right">
                  <div className="detail-label">{t('Volume Trading')}</div>
                  <div className="detail-value">{`${idr(member.total_investment_amount)} IDR`}</div>
                </div>
              </div>
              {/* <div className="item-details">
                <div className="detail-col">
                  <div className="detail-label">{t('Rank')}</div>
                  <div className="detail-value">{member.rank ? member.rank_title || '—' : '—'}</div>
                </div>
                <div className="detail-col right">
                  <div className="detail-label">{t('Kode Referral')}</div>
                  <div className="detail-value">{member.referral_code || '—'}</div>
                </div>
              </div> */}
              <div className="item-status">
                <StatusChip on={num(member.completed_deposits) > 0} label="Verifikasi Akun" />
                <StatusChip on={num(member.active_investments) > 0} label="Transaksi Kripto" />
              </div>
            </article>
          ))}
        </div>
      </section>
      {/* an empty level has nothing to page through */}
      {status === 'ready' && totalMembers > 0 && (
      <section id="section-pagination">
        <div className="pagination-container">
          <button
            type="button"
            className="page-btn nav-btn"
            aria-label={t('Previous')}
            disabled={current <= 1}
            onClick={(event) => {
              event.stopPropagation();
              setPage(Math.max(1, current - 1));
            }}
          >
            <img src="/assets/img/be233d23da.svg" alt="" />
          </button>
          {pageItems(current, totalPages).map((item, index) =>
            item === '…' ? (
              <span className="page-dots" key={`dots-${index}`}>…</span>
            ) : (
              <button
                key={item}
                type="button"
                className={item === current ? 'page-btn active' : 'page-btn'}
                onClick={(event) => {
                  event.stopPropagation();
                  setPage(item);
                }}
              >
                {item}
              </button>
            )
          )}
          <button
            type="button"
            className="page-btn nav-btn"
            aria-label={t('Next')}
            disabled={current >= totalPages}
            onClick={(event) => {
              event.stopPropagation();
              setPage(Math.min(totalPages, current + 1));
            }}
          >
            <img src="/assets/img/f55e6b8d63.svg" alt="" />
          </button>
        </div>
        <div className="pagination-info">
          {pagingText}
        </div>
      </section>
      )}
    </div>
  );
}
