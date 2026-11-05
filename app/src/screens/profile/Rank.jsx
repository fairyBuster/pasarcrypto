// rank — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// the ladder is scored from top-up alone: rank-levels still carries the mission
// and downline thresholds, but the programme does not count them, so only the
// self-deposit criterion is read (and everything else below derives from it)
const CRITERIA = [
  {
    key: 'deposit_self_total',
    label: 'Volume isi ulang saya',
    basis: 'deposit sendiri',
    unit: 'IDR',
    required: 'deposit_self_total_required',
    progress: 'user_progress_deposit_self_total',
  },
];

// the seeded titles mapped onto the colour chips of the frame
const ICONS = {
  basic: 'icon-basic',
  bronze: 'icon-bronze',
  silver: 'icon-silver',
  gold: 'icon-gold',
  platinum: 'icon-platinum',
  diamond: 'icon-diamond',
  emerald: 'icon-emerald',
  sapphire: 'icon-sapphire',
  ruby: 'icon-ruby',
  master: 'icon-master',
  grandmaster: 'icon-legend',
};

// deposit thresholds arrive as "10000.00" strings
const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const count = (value, unit) => (unit === 'IDR' ? idr(value) : String(Math.round(value)));

const css = `
/* rank — ported from Figma export, typography re-synced */
.scr-rank { background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-rank body::before{
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 70% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 50%),
              radial-gradient(circle at 65% 0%, rgba(255, 215, 122, 0.16) 0%, rgba(255, 215, 122, 0) 40%);
  pointer-events: none;
  z-index: -1;
}
.scr-rank section{
  width: 100%;
  max-width: 412px;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
}
.scr-rank h1,
.scr-rank h2,
.scr-rank h3,
.scr-rank h4,
.scr-rank p{
  margin: 0;
}
.scr-rank .app-header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 0;
}
.scr-rank .icon-btn{
  background: #1f3048;
  border: none;
  border-radius: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.scr-rank .header-title{
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}
.scr-rank .header-spacer{
  width: 40px;
}
.scr-rank #section-hero{
  padding: 26px 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scr-rank .hero-content{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scr-rank .hero-badge{
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
}
.scr-rank .hero-badge-bg{
  position: absolute;
  inset: 0;
  border-radius: 48px;
  background: linear-gradient(135deg, #ffe7a3 0%, #d9a93f 100%);
  box-shadow: 0 0 0 8px rgba(255, 215, 122, 0.12), 0 0 0 16px rgba(255, 215, 122, 0.05);
}
.scr-rank .hero-badge img{
  position: relative;
  z-index: 1;
  width: 44px;
  height: 44px;
}
.scr-rank .hero-subtitle{
  color: #a9b7c8;
  font-size: 12px;
  margin-bottom: 2px;
}
.scr-rank .hero-title{
  color: #ffd77a;
  font-size: 24px;
  font-weight: 700;
}
.scr-rank #section-progress{
  padding: 20px 16px 0;
}
.scr-rank .progress-container{
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-rank .progress-labels{
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.scr-rank .label-current{ color: #a9b7c8; }
.scr-rank .label-value{ color: #ffffff; font-weight: 600; }
.scr-rank .label-next{ color: #a9b7c8; }
.scr-rank .progress-track{
  height: 8px;
  background-color: #22344b;
  border-radius: 4px;
  overflow: hidden;
}
.scr-rank .progress-fill{
  height: 100%;
  background: linear-gradient(90deg, #8fa1b6 0%, #f5f8fb 100%);
  border-radius: 4px;
}
.scr-rank .progress-desc{
  color: #ffffff;
  font-size: 12px;
  text-align: center;
  margin-top: 4px;
}
.scr-rank #section-action{
  padding: 16px 16px 0;
}
.scr-rank .btn-trade{
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0c1a2d;
  cursor: pointer;
}
.scr-rank #section-rank-list{
  padding: 30px 16px 0;
}
.scr-rank .rank-list-header{
  margin-bottom: 16px;
}
.scr-rank .list-title{
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 2px;
}
.scr-rank .list-subtitle{
  font-size: 12px;
  color: #8597ab;
}
.scr-rank .rank-cards{
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scr-rank .rank-card{
  border: 1px solid rgba(201, 212, 225, 0.16);
  border-radius: 12px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background-color: rgba(255,255,255,0.02);
}
.scr-rank .rank-card.card-active{
  background-color: rgba(255, 215, 122, 0.08);
  border-color: rgba(255, 215, 122, 0.3);
}
.scr-rank .card-header{
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.scr-rank .rank-icon{
  width: 38px;
  height: 38px;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.scr-rank .rank-icon img{ width: 16px; height: 16px; }
.scr-rank .icon-basic{ background: linear-gradient(135deg, #c9d4e1 0%, #51657e 100%); }
.scr-rank .icon-bronze{ background: linear-gradient(135deg, #e8b48c 0%, #9a5f37 100%); }
.scr-rank .icon-silver{ background: linear-gradient(135deg, #f5f8fb 0%, #8fa1b6 100%); opacity: 0.45; }
.scr-rank .icon-gold{ background: linear-gradient(135deg, #ffe7a3 0%, #d9a93f 100%); }
.scr-rank .icon-platinum{ background: linear-gradient(135deg, #e3fbf8 0%, #4f9e9a 100%); opacity: 0.45; }
.scr-rank .icon-emerald{ background: linear-gradient(135deg, #9ff0c8 0%, #1c8a5c 100%); opacity: 0.45; }
.scr-rank .icon-ruby{ background: linear-gradient(135deg, #ffb3c0 0%, #c23a55 100%); opacity: 0.45; }
.scr-rank .icon-sapphire{ background: linear-gradient(135deg, #b8d4ff 0%, #2f5fc4 100%); opacity: 0.45; }
.scr-rank .icon-diamond{ background: linear-gradient(135deg, #ffffff 0%, #9fe6ff 100%); opacity: 0.45; }
.scr-rank .icon-master{ background: linear-gradient(135deg, #d8c2ff 0%, #6b46c1 100%); opacity: 0.45; }
.scr-rank .icon-legend{ background: linear-gradient(135deg, #ffd77a 0%, #ff8fe0 35%, #a98bff 65%, #6fd6ff 100%); opacity: 0.45; }
/* the frame dims the ranks that are still locked, whatever their colour chip */
.scr-rank .rank-icon.is-unlocked{ opacity: 1; }
.scr-rank .rank-info{
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-rank .rank-name{
  font-size: 14px;
  color: #ffffff;
  font-weight: 600;
}
.scr-rank .rank-desc{
  font-size: 11px;
  color: #8597ab;
  line-height: 1.4;
}
.scr-rank .rank-status{
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 11px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.scr-rank .status-achieved{
  background-color: rgba(62, 207, 142, 0.14);
  color: #3ecf8e;
}
.scr-rank .status-current{
  background: linear-gradient(90deg, #ffe7a3 0%, #d9a93f 100%);
  color: #0c1a2d;
}
.scr-rank .status-locked{
  background-color: #1f3048;
  color: #8597ab;
}
.scr-rank .status-locked img{ width: 10px; height: 10px; }
.scr-rank .card-body{
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-left: 50px;
}
.scr-rank .req-item{
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}
.scr-rank .req-label{ color: #75879c; }
.scr-rank .req-value{ color: #d3dce7; }
.scr-rank .text-success{ color: #3ecf8e; }
.scr-rank .text-warning{ color: #ffd77a; }
.scr-rank #section-info{
  padding: 30px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.scr-rank .info-block{
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scr-rank .info-title{
  font-size: 14px;
  color: #ffffff;
  font-weight: 600;
}
.scr-rank .info-list{
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-rank .info-list li{
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 12px;
  color: #8597ab;
  line-height: 1.5;
}
.scr-rank .bullet{
  width: 6px;
  height: 6px;
  background-color: #8fa1b6;
  border-radius: 2px;
  margin-top: 6px;
  flex-shrink: 0;
}
.scr-rank .bullet-dark{
  background-color: #51657e;
}
/* figma re-sync */
.scr-rank .header-title.header-title { font-size: 17px; }
.scr-rank .header-title.header-title { font-weight: 700; }
.scr-rank .hero-title.hero-title { font-size: 26px; }
.scr-rank .label-current.label-current { color: #FFD77A; }
.scr-rank .progress-desc.progress-desc { color: #A9B7C8; }
.scr-rank .list-title.list-title { font-size: 15px; }
.scr-rank .rank-name.rank-name { font-size: 12px; }
.scr-rank .rank-name.rank-name { font-weight: 400; }
.scr-rank .req-value.req-value { color: #FFD77A; }
.scr-rank .info-title.info-title { font-size: 12px; }
.scr-rank .info-title.info-title { font-weight: 700; }
.scr-rank .info-title.info-title { color: #A9B7C8; }
/* the frame has no loading, empty or failed states */
.scr-rank .list-state{ padding: 12px 0; text-align: center; font-size: 12px; line-height: 18px; color: #75879c; }
/* the re-sync paints every value gold, so the met state has to win here */
.scr-rank .req-value.text-success{ color: #3ecf8e; }
`;

export default function Rank() {
  const [levels, setLevels] = useState([]);
  const [status, setStatus] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [levelsRes, statusRes] = await Promise.all([api.rankLevels(), api.rankStatus()]);
        if (!alive) return;
        if (!levelsRes.ok) {
          setError(friendlyError(levelsRes.data, 'Gagal memuat rank.'));
          setState('error');
          return;
        }
        setLevels([...(levelsRes.data || [])].sort((a, b) => num(a.rank) - num(b.rank)));
        setStatus(statusRes.ok ? statusRes.data : null);
        setState('ready');
      } catch {
        if (!alive) return;
        setError('Gagal memuat rank.');
        setState('error');
      }
    })();
    return () => { alive = false; };
  }, []);

  const currentLevel = levels.find((level) => level.is_current_rank) || null;
  const currentTitle = status?.current_title || currentLevel?.title || '—';

  let nextLevel = null;
  if (status?.next_rank != null) {
    nextLevel = levels.find((level) => num(level.rank) === num(status.next_rank)) || null;
  } else if (currentLevel) {
    nextLevel = levels.find((level) => num(level.rank) > num(currentLevel.rank)) || null;
  } else {
    nextLevel = levels[0] || null;
  }
  const nextTitle = status?.next_title || nextLevel?.title || null;

  // rank-status names the basis it counted, but a rank can ask for more than one
  // criterion, so the hero line falls back to the first one the next rank needs
  let basis = CRITERIA.find((item) => item.key === status?.progress_basis) || null;
  if (!basis || !nextLevel || num(nextLevel[basis.required]) <= 0) {
    basis = nextLevel ? CRITERIA.find((item) => num(nextLevel[item.required]) > 0) || null : null;
  }
  const basisNow = basis && nextLevel ? num(nextLevel[basis.progress]) : 0;
  const basisNeed = basis && nextLevel ? num(nextLevel[basis.required]) : 0;
  const percent = basisNeed > 0 ? Math.min(100, Math.round((basisNow / basisNeed) * 100)) : 100;

  const unmet = nextLevel
    ? CRITERIA
        .filter(
          (item) =>
            num(nextLevel[item.required]) > 0 && num(nextLevel[item.progress]) < num(nextLevel[item.required])
        )
        .map(
          (item) =>
            `${count(num(nextLevel[item.required]) - num(nextLevel[item.progress]), item.unit)} ${item.unit}`
        )
    : [];

  const basisText = CRITERIA
    .filter((item) => levels.some((level) => num(level[item.required]) > 0))
    .map((item) => item.basis)
    .join(' dan ');

  const progressDesc = !nextLevel
    ? 'Kamu sudah berada di rank tertinggi.'
    : unmet.length
      ? `Kurang ${unmet.join(' dan ')} lagi untuk naik ke ${nextTitle}`
      : `Syarat naik ke ${nextTitle} sudah terpenuhi`;

  return (
    <div className="scr-rank">
      <style>{css}</style>
      <section id="section-header">
        <header className="app-header">
          <button className="icon-btn" aria-label={t('Back')} data-back="1">
            <img src="/assets/img/7fac63440f.svg" alt="" />
          </button>
          <h1 className="header-title">{t('Rank Saya')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <div className="hero-badge-bg"></div>
            <img src="/assets/img/70d7cc0d43.svg" alt="" />
          </div>
          <p className="hero-subtitle">{t('Rank kamu saat ini')}</p>
          <h2 className="hero-title">{state === 'ready' ? currentTitle : '—'}</h2>
        </div>
      </section>
      <section id="section-progress">
        <div className="progress-container">
          <div className="progress-labels">
            <span className="label-current">{state === 'ready' ? currentTitle : '—'}</span>
            <span className="label-value">
              {state === 'ready' && basis
                ? `${count(basisNow, basis.unit)} / ${count(basisNeed, basis.unit)} ${basis.unit}`
                : '—'}
            </span>
            <span className="label-next">
              {state === 'ready' ? nextTitle || 'Rank tertinggi' : '—'}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${state === 'ready' ? percent : 0}%` }}></div>
          </div>
          <p className="progress-desc">{state === 'ready' ? progressDesc : ''}</p>
        </div>
      </section>
      <section id="section-action">
        <div className="action-container">
          <button className="btn-trade" data-route="/pasar">
            <img src="/assets/img/7c00454744.svg" alt="" />
            <span>{t('Mulai Trading')}</span>
          </button>
        </div>
      </section>
      <section id="section-rank-list">
        <div className="rank-list-header">
          <h3 className="list-title">{t('Tingkatan Rank')}</h3>
          <p className="list-subtitle">
            {state === 'ready' ? `${levels.length} tingkatan rank dari ${basisText || 'aktivitas'} kamu` : ''}
          </p>
        </div>
        <div className="rank-cards">
          {state === 'loading' && <div className="list-state">{t('Memuat rank…')}</div>}
          {state === 'error' && <div className="list-state">{error}</div>}
          {state === 'ready' && levels.length === 0 && (
            <div className="list-state">{t('Belum ada konfigurasi rank.')}</div>
          )}
          {state === 'ready' && levels.map((level) => {
            const current = Boolean(level.is_current_rank);
            const unlocked = Boolean(level.is_unlocked);
            const rows = CRITERIA.filter((item) => num(level[item.required]) > 0);
            const missing = rows.filter((item) => num(level[item.progress]) < num(level[item.required]));
            const icon = ICONS[String(level.title || '').toLowerCase()] || 'icon-silver';
            const description = String(level.description || '').trim();
            return (
              <div className={`rank-card${current ? ' card-active' : ''}`} key={level.rank}>
                <div className="card-header">
                  <div className={`rank-icon ${icon}${unlocked ? ' is-unlocked' : ''}`}>
                    <img src="/assets/img/c3dff765a1.svg" alt="" />
                  </div>
                  <div className="rank-info">
                    <h4 className="rank-name">{level.title}</h4>
                    {description && description !== '-' && <p className="rank-desc">{description}</p>}
                  </div>
                  {current ? (
                    <div className="rank-status status-current"><span>{t('Rank kamu')}</span></div>
                  ) : unlocked ? (
                    <div className="rank-status status-achieved"><span>{t('✓ Tercapai')}</span></div>
                  ) : (
                    <div className="rank-status status-locked">
                      <img src="/assets/img/3c1438c3e1.svg" alt="" /><span>{t('Terkunci')}</span>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  {rows.length === 0 && (
                    <div className="req-item">
                      <span className="req-label">{t('Syarat minimal')}</span>
                      <span className="req-value text-success">{t('Tanpa syarat')}</span>
                    </div>
                  )}
                  {rows.map((item) => (
                    <div className="req-item" key={item.key}>
                      <span className="req-label">{item.label}</span>
                      <span className="req-value">
                        {count(num(level[item.progress]), item.unit)} / {count(num(level[item.required]), item.unit)} {item.unit}
                      </span>
                    </div>
                  ))}
                  {!unlocked && missing.length > 0 && (
                    <div className="req-item">
                      <span className="req-label">{t('Syarat untuk memenuhi')}</span>
                      <span className="req-value text-warning">
                        {missing
                          .map(
                            (item) =>
                              `${count(num(level[item.required]) - num(level[item.progress]), item.unit)} ${item.unit}`
                          )
                          .join(' · ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section id="section-info">
        <div className="info-block">
          <h3 className="info-title">{t('Cara naik rank')}</h3>
          <ul className="info-list">
            <li>
              <div className="bullet"></div>
              <span>Syarat rank dihitung dari {basisText || 'aktivitas'} kamu.</span>
            </li>
            <li>
              <div className="bullet"></div>
              <span>{t('Progres diperbarui otomatis setiap kali ada aktivitas baru.')}</span>
            </li>
            <li>
              <div className="bullet"></div>
              <span>{t('Rank naik otomatis saat syarat rank berikutnya terpenuhi.')}</span>
            </li>
          </ul>
        </div>
        <div className="info-block">
          <h3 className="info-title">{t('Catatan')}</h3>
          <ul className="info-list">
            <li>
              <div className="bullet bullet-dark"></div>
              <span>{t('Rank yang sudah dicapai tidak akan turun.')}</span>
            </li>
            <li>
              <div className="bullet bullet-dark"></div>
              <span>{t('Rank diperbarui setiap kali halaman ini dibuka.')}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
