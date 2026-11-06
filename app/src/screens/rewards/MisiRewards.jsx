// misi-rewards — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { friendlyError, useAuth } from '../../lib/auth.jsx';
import { copyText } from '../../lib/clipboard.js';
import { idr } from '../../lib/format.js';
import { useInviteLink } from '../../lib/referral.js';
import { t } from '../../lib/i18n.js';

const MAX_PAGES = 10;

// the mission types count different things, so the progress line names its unit
const UNITS = {
  referral: 'teman',
  active_downline: 'teman',
  purchase: 'teman',
  service: 'teman',
  purchase_self: 'kali',
  service_self: 'kali',
  withdrawal: 'kali',
  deposit: 'IDR',
  deposit_self: 'IDR',
};

// a rupiah target (deposit missions) does not fit the 32px step circle, so big
// numbers are shortened the way the app writes them elsewhere
const badge = (value) => {
  if (value < 1000) return String(value);
  if (value < 1000000) return `${Math.round(value / 1000)}rb`;
  return `${Math.round(value / 1000000)}jt`;
};

const css = `
/* misi-rewards — ported from Figma export, typography re-synced */
.scr-misi-rewards { background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-misi-rewards .app-container{
  width: 100%;
  max-width: 412px;
  background: radial-gradient(circle at 69.23% -4%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%);
  position: relative;
  overflow: hidden;
}
.scr-misi-rewards *{
  box-sizing: border-box;
}
.scr-misi-rewards h1,
.scr-misi-rewards h2,
.scr-misi-rewards h3,
.scr-misi-rewards h4,
.scr-misi-rewards h5,
.scr-misi-rewards h6,
.scr-misi-rewards p{
  margin: 0;
}
.scr-misi-rewards ul,
.scr-misi-rewards ol{
  margin: 0;
  padding: 0;
  list-style: none;
}
.scr-misi-rewards a{
  text-decoration: none;
  color: inherit;
}
.scr-misi-rewards button{
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
}
.scr-misi-rewards .header-section{
  padding: 20px 16px 0;
}
.scr-misi-rewards .header-container{
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}
.scr-misi-rewards .back-button{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scr-misi-rewards .header-title{
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}
.scr-misi-rewards .header-placeholder{
  width: 40px;
  height: 40px;
}
.scr-misi-rewards .hero-section{
  padding: 2px 16px 0;
}
.scr-misi-rewards .hero-container{
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 101px;
}
.scr-misi-rewards .hero-text h2{
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  color: #ffffff;
}
.scr-misi-rewards .hero-image{
  width: 131px;
  height: 128px;
  position: relative;
  top: -13.5px;
}
.scr-misi-rewards .hero-image img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scr-misi-rewards .stats-section{
  padding: 18px 16px 0;
}
.scr-misi-rewards .stats-container{
  display: flex;
  align-items: flex-start;
}
.scr-misi-rewards .stat-item{
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.scr-misi-rewards .stat-item:last-child{
  padding-left: 16px;
}
.scr-misi-rewards .stat-divider{
  width: 1px;
  height: 43px;
  background-color: rgba(201, 212, 225, 0.18);
}
.scr-misi-rewards .stat-label{
  font-size: 12px;
  color: #8597ab;
}
.scr-misi-rewards .stat-value-group{
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.scr-misi-rewards .stat-value{
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}
.scr-misi-rewards .stat-unit{
  font-size: 12px;
  color: #a9b7c8;
}
.scr-misi-rewards .referral-section{
  padding: 14px 16px 0;
}
.scr-misi-rewards .referral-container{
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  border: 1px solid #51657e;
  border-radius: 22px;
  padding: 0 6px 0 16px;
}
.scr-misi-rewards .referral-info{
  display: flex;
  align-items: center;
  gap: 6px;
}
.scr-misi-rewards .referral-label{
  font-size: 12px;
  color: #8597ab;
}
.scr-misi-rewards .referral-code{
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}
.scr-misi-rewards .copy-button{
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background-color: #1f3048;
  border-radius: 16px;
}
.scr-misi-rewards .copy-button span{
  font-size: 12px;
  color: #e6ecf3;
}
.scr-misi-rewards .invite-section{
  padding: 12px 16px 0;
}
.scr-misi-rewards .invite-button{
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  border-radius: 22px;
}
.scr-misi-rewards .invite-button span{
  font-size: 14px;
  font-weight: 600;
  color: #0c1a2d;
}
.scr-misi-rewards .banner-section{
  padding: 12px 16px 0;
}
.scr-misi-rewards .banner-container{
  width: 100%;
  height: 143px;
  border-radius: 10px;
  overflow: hidden;
}
.scr-misi-rewards .banner-container img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scr-misi-rewards .howto-section{
  padding: 13px 16px 0;
}
.scr-misi-rewards .section-title{
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 14px;
}
.scr-misi-rewards .steps-container{
  display: flex;
  align-items: flex-start;
  margin-bottom: 14px;
}
.scr-misi-rewards .step-item{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7.5px;
  flex: 1;
}
.scr-misi-rewards .step-number{
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, #5a82bf 0%, #2c4c80 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}
.scr-misi-rewards .step-text{
  font-size: 10px;
  color: #a9b7c8;
  text-align: center;
  line-height: 1.4;
}
.scr-misi-rewards .step-connector{
  width: 16px;
  height: 1px;
  background-color: #51657e;
  margin-top: 13px;
}
.scr-misi-rewards .howto-note{
  font-size: 10px;
  color: #a9b7c8;
  line-height: 1.4;
}
.scr-misi-rewards .mission-section{
  padding: 8px 16px 0;
}
.scr-misi-rewards .mission-section .section-title{
  margin-bottom: 18px;
}
.scr-misi-rewards .mission-list{
  display: flex;
  flex-direction: column;
}
.scr-misi-rewards .mission-item{
  display: flex;
  min-height: 59px;
}
.scr-misi-rewards .mission-status{
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32px;
  margin-right: 12px;
}
.scr-misi-rewards .status-circle{
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  z-index: 1;
}
.scr-misi-rewards .status-circle.completed{
  background: linear-gradient(135deg, #5a82bf 0%, #2c4c80 100%);
  color: #ffffff;
}
.scr-misi-rewards .status-circle.active{
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
}
.scr-misi-rewards .status-circle.in-progress{
  background-color: #1f3048;
  border: 2px solid #c9d4e1;
  color: #ffffff;
}
.scr-misi-rewards .status-circle.locked{
  background-color: #1a2a40;
  border: 1px solid #2a3d56;
  color: #75879c;
}
.scr-misi-rewards .status-circle.locked.final{
  border: 1px solid #8597ab;
}
.scr-misi-rewards .status-line{
  width: 2px;
  flex-grow: 1;
  background-color: #2f4560;
}
.scr-misi-rewards .status-line.completed{
  background-color: #5a82bf;
}
.scr-misi-rewards .mission-content{
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
  padding-top: 6px;
  padding-bottom: 18px;
}
.scr-misi-rewards .mission-info{
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.scr-misi-rewards .mission-title{
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}
.scr-misi-rewards .mission-title.locked-text{
  color: #a9b7c8;
}
.scr-misi-rewards .mission-desc{
  font-size: 12px;
  color: #75879c;
}
.scr-misi-rewards .mission-desc.progress-text{
  color: #c9d4e1;
}
.scr-misi-rewards .mission-reward{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 4px;
}
.scr-misi-rewards .reward-amount{
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.scr-misi-rewards .reward-amount .amount{
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}
.scr-misi-rewards .reward-amount .currency{
  font-size: 12px;
  color: #8597ab;
}
.scr-misi-rewards .reward-amount.locked-text .amount{
  color: #a9b7c8;
}
.scr-misi-rewards .reward-status{
  font-size: 10px;
}
.scr-misi-rewards .reward-status.claimed{
  color: #3ecf8e;
}
.scr-misi-rewards .reward-status.locked{
  color: #75879c;
}
.scr-misi-rewards .claim-button{
  height: 24px;
  padding: 0 14px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  color: #0c1a2d;
}
.scr-misi-rewards .progress-bar-container{
  width: 64px;
  padding-top: 4px;
}
.scr-misi-rewards .progress-bar{
  width: 100%;
  height: 4px;
  background-color: #22344b;
  border-radius: 2px;
  overflow: hidden;
}
.scr-misi-rewards .progress-fill{
  height: 100%;
  background: linear-gradient(90deg, #5a82bf 0%, #c9d4e1 100%);
  border-radius: 2px;
}
.scr-misi-rewards .notes-section{
  padding: 2px 16px 28px;
}
.scr-misi-rewards .notes-title{
  font-size: 14px;
  font-weight: 600;
  color: #a9b7c8;
  margin-bottom: 3.5px;
}
.scr-misi-rewards .notes-text{
  font-size: 12px;
  color: #75879c;
  line-height: 1.4;
}
/* figma re-sync */
.scr-misi-rewards .header-title.header-title { font-size: 17px; }
.scr-misi-rewards .header-title.header-title { font-weight: 700; }
.scr-misi-rewards .stat-label.stat-label { font-size: 11px; }
.scr-misi-rewards .stat-value.stat-value { font-size: 18px; }
.scr-misi-rewards .stat-value.stat-value { font-weight: 600; }
.scr-misi-rewards .section-title.section-title { font-size: 15px; }
.scr-misi-rewards .section-title.section-title { font-weight: 700; }
.scr-misi-rewards .howto-note.howto-note { font-size: 12px; }
.scr-misi-rewards .howto-note.howto-note { line-height: 18px; }
.scr-misi-rewards .howto-note.howto-note { color: #8597AB; }
.scr-misi-rewards .mission-title.mission-title { font-size: 13px; }
.scr-misi-rewards .mission-desc.mission-desc { font-size: 11px; }
.scr-misi-rewards .amount.amount { font-size: 13px; }
.scr-misi-rewards .amount.amount { color: #FFFFFF; }
.scr-misi-rewards .currency.currency { color: #A9B7C8; }
.scr-misi-rewards .reward-status.reward-status { font-size: 11px; }
.scr-misi-rewards .claim-button.claim-button { font-size: 11px; }
.scr-misi-rewards .mission-desc.mission-desc { color: #C9D4E1; }
.scr-misi-rewards .mission-title.mission-title { font-weight: 500; }
.scr-misi-rewards .mission-title.mission-title { color: #A9B7C8; }
.scr-misi-rewards .amount.amount { font-weight: 500; }
.scr-misi-rewards .status-circle.status-circle { font-size: 11px; }
.scr-misi-rewards .notes-title.notes-title { font-size: 12px; }
.scr-misi-rewards .notes-text.notes-text { line-height: 18px; }
/* the Figma frame has no loading, empty, failed or copied states */
.scr-misi-rewards .list-state{ padding: 14px 0; text-align: center; font-size: 12px; line-height: 18px; color: #75879c; }
.scr-misi-rewards .claim-error{ margin: 0 0 12px; font-size: 11px; line-height: 16px; color: #f2667a; }
.scr-misi-rewards .claim-button:disabled{ opacity: 0.6; cursor: default; }
.scr-misi-rewards .copy-button:disabled{ opacity: 0.6; cursor: default; }
.scr-misi-rewards .copy-button.copied span{ color: #3ecf8e; }
`;

export default function MisiRewards() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [stats, setStats] = useState({ friends: null, rewardTotal: null, truncated: false });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [claimingId, setClaimingId] = useState(null);
  const [claimError, setClaimError] = useState('');
  const [copied, setCopied] = useState(false);
  // the host comes from /api/auth/settings/, so the copied link points at the
  // domain the API reports rather than whatever host this tab opened
  const invite = useInviteLink(user?.referral_code || '');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // the mission list carries the per-user progress; the two headline numbers
        // come from the active level-1 friends and the lifetime totals
        const [res, downlineRes, allTimeRes] = await Promise.all([
          api.missions(),
          // the stats endpoint carries one number per level, so the count is not
          // capped by the member list's page size
          api.downlineStats(),
          // this one sums every claimed mission reward in a single field
          api.allTimeStats(),
        ]);
        if (!alive) return;
        if (!res.ok) {
          setError(friendlyError(res.data, 'Gagal memuat misi.'));
          setStatus('error');
          return;
        }
        const list = [...(res.data?.results || [])].sort(
          (a, b) => Number(a.requirement) - Number(b.requirement) || a.id - b.id
        );

        // the all-time endpoint already totals every claimed reward; builds that
        // predate that field still get the ledger sum below
        const claimed = allTimeRes.ok ? allTimeRes.data?.missions_total : null;
        let rewardTotal = claimed == null ? 0 : Number(claimed) || 0;
        let truncated = false;
        if (claimed == null) {
          for (let page = 1; ; page += 1) {
            const tx = await api.transactions({ type: 'MISSIONS', status: 'COMPLETED', page });
            if (!alive) return;
            if (!tx.ok) {
              rewardTotal = null;
              break;
            }
            const rows = tx.data?.results || [];
            rewardTotal += rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
            if (!tx.data?.next) break;
            if (page >= MAX_PAGES) {
              truncated = true;
              break;
            }
          }
        }

        setMissions(list);
        setStats({
          // the missions reward level-1 friends only once they are trading
          friends: downlineRes.ok
            ? Number(downlineRes.data?.levels?.find((row) => row.level === 1)?.members_active) || 0
            : null,
          rewardTotal,
          truncated,
        });
        setStatus('ready');
      } catch {
        if (!alive) return;
        setError('Gagal memuat misi.');
        setStatus('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // the button reads as the invitation code, but what reaches the clipboard is
  // the invite link that code belongs to
  const copyCode = async (event) => {
    event.stopPropagation();
    const code = user?.referral_code;
    if (!code) return;
    if (await copyText(invite)) setCopied(true);
  };

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const claim = async (event, mission) => {
    event.stopPropagation();
    if (claimingId) return;
    setClaimingId(mission.id);
    setClaimError('');
    try {
      const times = Math.max(1, Number(mission.claimable_times) || 1);
      const res = await api.missionClaim(mission.id, times);
      if (!res.ok) {
        setClaimError(friendlyError(res.data, 'Gagal klaim hadiah, coba lagi.'));
        setClaimingId(null);
        return;
      }
      // the popup reads the payload from the route, with the stored copy as a
      // fallback for a refresh
      const payload = { ...res.data, mission_title: mission.title };
      try {
        sessionStorage.setItem('pscryp.lastMission', JSON.stringify(payload));
      } catch {
        /* storage disabled */
      }
      navigate('/notifikasi/misi', { state: { mission: payload } });
    } catch {
      setClaimError('Gagal klaim hadiah, coba lagi.');
      setClaimingId(null);
    }
  };

  return (
    <div className="scr-misi-rewards">
      <style>{css}</style>
      <section id="section-header" className="header-section">
        <div className="header-container">
          {/* the back arrow returns to the akun screen, not the browser history */}
          <a href="#/akun" className="back-button">
            <img src="/assets/img/44b91558db.svg" alt="Back" />
          </a>
          <h1 className="header-title">{t('Misi Rewards')}</h1>
          <div className="header-placeholder"></div>
        </div>
      </section>
      <section id="section-hero" className="hero-section">
        <div className="hero-container">
          <div className="hero-text">
            <h2>{t('Ajak teman gabung,')}<br />{t('hadiahnya makin besar')}</h2>
          </div>
          <div className="hero-image">
            <img src="/assets/img/4399a391de.png" alt="Hero Image" />
          </div>
        </div>
      </section>
      <section id="section-stats" className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-label">{t('Teman trading')}</span>
            <div className="stat-value-group">
              <span className="stat-value">{stats.friends == null ? '' : idr(stats.friends)}</span>
              <span className="stat-unit">{t('orang')}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">{t('Total hadiah didapat')}</span>
            <div className="stat-value-group">
              <span className="stat-value">
                {stats.rewardTotal == null
                  ? ''
                  : `${idr(stats.rewardTotal)}${stats.truncated ? '+' : ''}`}
              </span>
              <span className="stat-unit">{t('IDR')}</span>
            </div>
          </div>
        </div>
      </section>
      <section id="section-referral-code" className="referral-section">
        <div className="referral-container">
          <div className="referral-info">
            <span className="referral-label">{t('Kode undangan')}</span>
            <span className="referral-code">{user?.referral_code || ''}</span>
          </div>
          <button
            className={`copy-button${copied ? ' copied' : ''}`}
            onClick={copyCode}
            disabled={!user?.referral_code}
          >
            <img src="/assets/img/89b44cd30c.svg" alt="Copy" />
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>
      </section>
      <section id="section-invite-button" className="invite-section">
        <button className="invite-button" data-route="/rewards/share">
          <img src="/assets/img/28b6db7b75.svg" alt="Invite" />
          <span>{t('Undang Teman')}</span>
        </button>
      </section>
      <section id="section-banner" className="banner-section">
        <div className="banner-container">
          <img src="/assets/img/76fb80f222.png" alt="Level Up Your Crypto Journey" />
        </div>
      </section>
      <section id="section-howto" className="howto-section">
        <h3 className="section-title">{t('Cara dapat hadiah')}</h3>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <p className="step-text">{t('Bagikan kode')}<br />{t('undanganmu')}</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">2</div>
            <p className="step-text">{t('Teman daftar &')}<br />{t('mulai trading')}</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">3</div>
            <p className="step-text">{t('Klaim bonus saldo')}<br />{t('di sini')}</p>
          </div>
        </div>
        <p className="howto-note">{t('Setiap misi memberi bonus saldo IDR yang masuk ke Saldo Tersedia setelah diklaim. Hadiah tiap misi bisa diklaim satu kali.')}</p>
      </section>
      <section id="section-mission-list" className="mission-section">
        <h3 className="section-title">{t('Daftar Misi')}</h3>
        <div className="mission-list">
          {status === 'loading' && <div className="list-state">{t('Memuat misi…')}</div>}
          {status === 'error' && <div className="list-state">{error}</div>}
          {status === 'ready' && missions.length === 0 && (
            <div className="list-state">{t('Belum ada misi aktif saat ini.')}</div>
          )}
          {claimError && <div className="claim-error">{claimError}</div>}
          {missions.map((mission, index) => {
            const requirement = Number(mission.requirement) || 0;
            const progress = Number(mission.progress) || 0;
            const remaining = Number(mission.remaining) || 0;
            const done = mission.status === 'claimed' || mission.status === 'exhausted';
            const canClaim = Boolean(mission.can_claim);
            const started = !done && !canClaim && progress > 0 && progress < requirement;
            const tone = done ? 'completed' : canClaim ? 'active' : started ? 'in-progress' : 'locked';
            const unit = UNITS[mission.type] || 'teman';
            const count = (value) => (unit === 'IDR' ? idr(value) : String(value));
            const percent = requirement > 0 ? Math.min(100, Math.round((progress / requirement) * 100)) : 0;
            const wallet =
              mission.reward_balance_type === 'balance_deposit' ? 'Bonus saldo isi ulang' : 'Bonus saldo';
            const desc = started
              ? `Posisi kamu sekarang · ${count(progress)}/${count(requirement)} ${unit}`
              : mission.description && mission.description !== mission.title
                ? mission.description
                : wallet;
            return (
              <div className={`mission-item${canClaim ? ' active' : ''}`} key={mission.id}>
                <div className="mission-status">
                  <div className={`status-circle ${tone}${index === missions.length - 1 ? ' final' : ''}`}>
                    {badge(requirement)}
                  </div>
                  {index < missions.length - 1 && (
                    <div className={`status-line${done ? ' completed' : ''}`}></div>
                  )}
                </div>
                <div className="mission-content">
                  <div className="mission-info">
                    <h4 className={`mission-title${tone === 'locked' ? ' locked-text' : ''}`}>
                      {mission.title}
                    </h4>
                    <p className={`mission-desc${started ? ' progress-text' : ''}`}>{desc}</p>
                  </div>
                  <div className="mission-reward">
                    <div className={`reward-amount${tone === 'locked' ? ' locked-text' : ''}`}>
                      <span className="amount">{idr(mission.reward)}</span>
                      <span className="currency">{t('IDR')}</span>
                    </div>
                    {done && <span className="reward-status claimed">{t('✓ Diklaim')}</span>}
                    {canClaim && (
                      <button
                        className="claim-button"
                        onClick={(event) => claim(event, mission)}
                        disabled={claimingId === mission.id}
                      >
                        {claimingId === mission.id ? 'Memproses…' : 'Klaim'}
                      </button>
                    )}
                    {started && (
                      <div className="progress-bar-container">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    )}
                    {!done && !canClaim && !started && (
                      <span className="reward-status locked">Butuh {remaining} lagi</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      

      

      

      
      
        </div>
      </section>
      <section id="section-notes" className="notes-section">
        <h3 className="notes-title">{t('Catatan')}</h3>
        <p className="notes-text">{t('Teman akan dihitung setelah mendaftar menggunakan kode referral kamu dan menyelesaikan transaksi trading pertama. Setiap teman yang memenuhi syarat akan menambah progres pencapaian. Bonus dapat diklaim setelah jumlah teman mencapai target yang ditentukan.')}</p>
      </section>
    </div>
  );
}
