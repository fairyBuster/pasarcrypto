// akun — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import BottomNav from '../../components/BottomNav.jsx';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { idr, maskPhone } from '../../lib/format.js';
import { languageName } from '../../lib/language.js';
import { getLanguage, t } from '../../lib/i18n.js';

// every seeded rank gets its own palette: the avatar badge prints dark text on
// a light gradient, the row chip prints light text on a tinted pill
const RANK_TONES = {
  basic: {
    badge: 'linear-gradient(180deg, #edf2f8 0%, #93a6bc 100%)',
    chipBg: 'rgba(201, 212, 225, 0.16)',
    chipText: '#c9d4e1',
  },
  bronze: {
    badge: 'linear-gradient(180deg, #f6d9be 0%, #b4784a 100%)',
    chipBg: 'rgba(232, 180, 140, 0.16)',
    chipText: '#e8b48c',
  },
  silver: {
    badge: 'linear-gradient(180deg, #fbfdff 0%, #a8b8c8 100%)',
    chipBg: 'rgba(223, 231, 240, 0.16)',
    chipText: '#dfe7f0',
  },
  gold: {
    badge: 'linear-gradient(180deg, #ffe7a3 0%, #d9a93f 100%)',
    chipBg: 'rgba(217, 169, 63, 0.16)',
    chipText: '#ffd77a',
  },
  platinum: {
    badge: 'linear-gradient(180deg, #dcf6f3 0%, #57a5a1 100%)',
    chipBg: 'rgba(127, 224, 218, 0.16)',
    chipText: '#7fe0da',
  },
  diamond: {
    badge: 'linear-gradient(180deg, #f2fcff 0%, #86d2ec 100%)',
    chipBg: 'rgba(159, 230, 255, 0.16)',
    chipText: '#9fe6ff',
  },
  emerald: {
    badge: 'linear-gradient(180deg, #cdf7e3 0%, #2f9c6d 100%)',
    chipBg: 'rgba(111, 224, 171, 0.16)',
    chipText: '#6fe0ab',
  },
  sapphire: {
    badge: 'linear-gradient(180deg, #d6e5ff 0%, #5b86e0 100%)',
    chipBg: 'rgba(156, 192, 255, 0.16)',
    chipText: '#9cc0ff',
  },
  ruby: {
    badge: 'linear-gradient(180deg, #ffd6df 0%, #d4586f 100%)',
    chipBg: 'rgba(255, 157, 176, 0.16)',
    chipText: '#ff9db0',
  },
  master: {
    badge: 'linear-gradient(180deg, #e6daff 0%, #8a68d8 100%)',
    chipBg: 'rgba(200, 168, 255, 0.16)',
    chipText: '#c8a8ff',
  },
  grandmaster: {
    badge: 'linear-gradient(135deg, #ffe7a3 0%, #ffc9ef 35%, #c9b8ff 65%, #a9e8ff 100%)',
    chipBg: 'rgba(255, 215, 122, 0.16)',
    chipText: '#ffd77a',
  },
};

// an admin can name a rank anything, so an unknown title keeps the frame's gold
const toneOf = (title) => RANK_TONES[String(title || '').trim().toLowerCase().replace(/\s+/g, '')] || RANK_TONES.gold;

// rank-status scores the account against the next rank; each unmet figure is
// one part of the "Kurang …" line under the phone number. the ladder is scored
// from top-up alone, so only the self deposit counts here as well
const SHORTFALLS = [
  { need: 'next_required_deposit_self_total', have: 'deposit_self_total', unit: 'deposit ', money: true },
];

// the deposit thresholds arrive as "10000.00" strings
const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// "Rp 50.000 deposit sendiri"; the counter form stays for a non-money criterion
const needText = (item, missing) =>
  item.money ? `Rp ${idr(missing)} ${t(item.unit)}` : `${Math.round(missing)} ${t(item.unit)}`;

// a translated sentence keeps the amount and the rank emphasised wherever the
// language puts them, e.g. "You still need Rp 10.000 to reach Silver"
const emphasised = (template, values) =>
  template
    .split(/(\{[a-z]+\})/)
    .filter(Boolean)
    .map((part, index) => {
      const key = /^\{[a-z]+\}$/.test(part) ? part.slice(1, -1) : '';
      if (key && values[key] !== undefined) {
        return (
          <span key={`${key}-${index}`} className="progress-hl">
            {values[key]}
          </span>
        );
      }
      return part;
    });
const css = `
/* akun — ported from Figma export, typography re-synced */
.scr-akun { background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-akun .list-section{
  padding: 26px 16px 0;
}
.scr-akun .list-section-title{
  font-size: 14px;
  color: #8597ab;
  margin: 0 0 8px 0;
  font-weight: 600;
}
.scr-akun .list-container{
  display: flex;
  flex-direction: column;
}
.scr-akun .list-item{
  display: flex;
  align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid #1c2d44;
  gap: 12px;
  cursor: pointer;
}
.scr-akun .list-item:last-child{
  border-bottom: none;
}
.scr-akun .list-icon{
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background-color: #1f3048;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.scr-akun .list-label{
  font-size: 14px;
  color: #ffffff;
  flex-grow: 1;
}
.scr-akun .list-value{
  font-size: 12px;
  color: #8597ab;
}
.scr-akun .header-container{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px 0;
  height: 56px;
  box-sizing: border-box;
}
/* the profile art starts 28px above its section and would otherwise sit over
   the header icon, swallowing the tap before it reaches the route */
.scr-akun #section-header{
  position: relative;
  z-index: 1;
}
.scr-akun .header-title{
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}
.scr-akun .header-icon{
  width: 36px;
  height: 36px;
  background-color: #1f3048;
  border-radius: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.scr-akun .profile-section{
  position: relative;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scr-akun .profile-bg{
  position: absolute;
  /* lifted so the wave starts at the top edge, behind the header */
  top: -56px;
  left: -9px;
  width: 420px;
  height: 253px;
  z-index: 0;
  object-fit: cover;
  opacity: 0.5;
  pointer-events: none;
}
.scr-akun .profile-content{
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scr-akun .avatar-container{
  position: relative;
  margin-bottom: 10px;
}
.scr-akun .avatar-img{
  width: 92px;
  height: 92px;
  border-radius: 50%;
}
.scr-akun .gold-badge{
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #ffe7a3 0%, #d9a93f 100%);
  border: 2px solid #13263d;
  border-radius: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px 2px 8px;
  height: 22px;
  box-sizing: border-box;
}
.scr-akun .gold-badge span{
  color: #0c1a2d;
  font-size: 12px;
  font-weight: 700;
}
.scr-akun .user-info{
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}
.scr-akun .username-row{
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  cursor: pointer;
}
.scr-akun .username{
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.scr-akun .id-row{
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #a9b7c8;
  margin-bottom: 10px;
}
.scr-akun .dot{
  width: 3px;
  height: 3px;
  background-color: #51657e;
  border-radius: 50%;
}
.scr-akun .progress-text{
  font-size: 12px;
  color: #e6ecf3;
  margin: 0;
}
/* the count and the next rank are the two things the line is asking for */
.scr-akun .progress-hl{
  color: #ffd77a;
  font-weight: 700;
}
.scr-akun .action-buttons{
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: space-between;
}
.scr-akun .btn-primary,
.scr-akun .btn-secondary{
  flex: 1;
  height: 42px;
  border-radius: 21px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
.scr-akun .btn-primary{
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
}
.scr-akun .btn-secondary{
  background-color: #1f3048;
  border: 1px solid rgba(201, 212, 225, 0.2);
  color: #e6ecf3;
}
.scr-akun .banner-section{
  padding: 13px 16px 0;
}
.scr-akun .banner-img{
  width: 100%;
  height: auto;
  border-radius: 20px;
  display: block;
  cursor: pointer;
}
.scr-akun .history-section{
  padding: 26px 16px 0;
}
.scr-akun .section-header{
  margin-bottom: 12px;
}
.scr-akun .section-title{
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px 0;
}
.scr-akun .section-subtitle{
  font-size: 12px;
  color: #8597ab;
  margin: 0;
}
.scr-akun .history-grid{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.scr-akun .grid-item{
  background-color: rgba(31, 48, 72, 0.6);
  border-radius: 14px;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 12px 0 8px;
  gap: 10px;
  cursor: pointer;
}
.scr-akun .icon-wrapper{
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2c4c80 0%, #1a3150 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.scr-akun .item-label{
  font-size: 13px;
  color: #e6ecf3;
  flex-grow: 1;
}
.scr-akun .arrow-icon{
  opacity: 0.5;
}
.scr-akun .badge-gold{
  background-color: rgba(217, 169, 63, 0.16);
  color: #ffd77a;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}
.scr-akun .badge-red{
  background-color: rgba(242, 102, 122, 0.14);
  color: #f2667a;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
}
.scr-akun .badge-green{
  background-color: rgba(62, 207, 142, 0.14);
  color: #3ecf8e;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
}
.scr-akun .badge-online{
  background-color: rgba(201, 212, 225, 0.1);
  color: #c9d4e1;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.scr-akun .dot-online{
  width: 6px;
  height: 6px;
  background-color: #3ecf8e;
  border-radius: 50%;
}
.scr-akun .footer-section{
  padding: 26px 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scr-akun .btn-logout{
  width: 100%;
  height: 44px;
  border-radius: 22px;
  border: 1px solid rgba(242, 102, 122, 0.4);
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #f2667a;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 24px;
}
.scr-akun .app-version{
  font-size: 12px;
  color: #51657e;
  margin: 0;
}
/* figma re-sync */
.scr-akun .header-title.header-title { font-size: 22px; }
.scr-akun .progress-text.progress-text { color: #A9B7C8; }
.scr-akun .section-title.section-title { font-size: 15px; }
.scr-akun .item-label.item-label { font-size: 14px; }
.scr-akun .list-section-title.list-section-title { font-size: 13px; }
.scr-akun .app-version.app-version { font-size: 11px; }
`;

export default function Akun() {
  // the whole object comes from /api/auth/account-info/, hydrated by AuthProvider
  const { user } = useAuth();
  const username = user?.username || user?.full_name || 'Username';
  // the frame prints an alphanumeric account id, which is the referral code
  const accountId = user?.referral_code || '—';
  // the profile itself is still a Figma placeholder, so a missing value falls
  // back to the same masked shape instead of an empty row
  const phone = user?.phone ? maskPhone(user.phone) : '—';

  // the badge, the row chip and the progress line all print the account's rank;
  // account-info only carries the rank number, so the title and the gap to the
  // next rank come from rank-status — the same source the Rank screen reads
  const [rank, setRank] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.rankStatus();
        if (!alive || !res.ok || !res.data || typeof res.data !== 'object') return;
        setRank(res.data);
      } catch {
        // without the endpoint the rank slots simply stay off
      }
    })();
    return () => { alive = false; };
  }, []);

  // the "Absen Harian" row reports today's claim, so it reads the streak endpoint
  // rather than the settings; null keeps the chip off until the answer lands
  const [attended, setAttended] = useState(null);
  useEffect(() => {
    let alive = true;
    api
      .attendanceStreak()
      .then((res) => {
        if (alive && res.ok) setAttended(Boolean(res.data?.has_claimed_today));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // the verification chip follows the portfolio: an account that has never
  // bought a product is listed as unverified, one with any investment is not
  const [verified, setVerified] = useState(null);
  useEffect(() => {
    let alive = true;
    api
      .investments()
      .then((res) => {
        if (!alive || !res.ok) return;
        const owned = Array.isArray(res.data) ? res.data.length : Number(res.data?.count) || 0;
        setVerified(owned > 0);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const rankTitle = String(rank?.current_title || '').trim();
  const tone = toneOf(rankTitle);
  const nextTitle = String(rank?.next_title || '').trim();
  const shortfalls = rank
    ? SHORTFALLS.map((item) => ({ ...item, missing: num(rank[item.need]) - num(rank[item.have]) })).filter(
        (item) => num(rank[item.need]) > 0 && item.missing > 0
      )
    : [];

  return (
    <div className="scr-akun">
      <style>{css}</style>
      <section id="section-header">
        <header className="header-container">
          <h1 className="header-title">{t('Akun')}</h1>
          <div className="header-icon" data-route="/notifikasi">
            <img src="/assets/img/5c4103abd9.svg" alt="Notification" />
          </div>
        </header>
      </section>
      <section id="section-profile" className="profile-section">
        <img src="/assets/img/3057facc29.png" className="profile-bg" alt="Background" />
        <div className="profile-content">
          <div className="avatar-container">
            <img src="/assets/img/d27c34de05.png" className="avatar-img" alt="Avatar" data-route="/profil" />
            {/* the badge sits outside the avatar's box, so waiting for the title
                costs no layout */}
            {rankTitle && (
              <div className="gold-badge" style={{ background: tone.badge }}>
                <img src="/assets/img/f988d908fd.svg" alt="" />
                <span>{rankTitle}</span>
              </div>
            )}
          </div>
          
          <div className="user-info">
            <div className="username-row" data-route="/profil">
              <h2 className="username">{username}</h2>
              <img src="/assets/img/61d0b63cf8.svg" alt="Verified" />
            </div>
            <div className="id-row">
              <span className="phone">{phone}</span>
              <span className="dot"></span>
              <span className="id-text">ID {accountId}</span>
              {/* the shell's [data-copy] handler puts the code on the clipboard */}
              <img
                src="/assets/img/37effa0585.svg"
                alt="Copy"
                style={{ cursor: "pointer" }}
                data-copy={accountId !== '—' ? accountId : undefined}
              />
            </div>
            {rankTitle && (
              <p className="progress-text">
                {!nextTitle
                  ? t('Kamu sudah berada di rank tertinggi.')
                  : shortfalls.length === 0
                    ? emphasised(t('Syarat naik ke {rank} sudah terpenuhi'), { rank: nextTitle })
                    : emphasised(t('Kurang {amount}  untuk naik ke {rank}'), {
                        amount: shortfalls.map((item) => needText(item, item.missing)).join(t(' dan ')),
                        rank: nextTitle,
                      })}
              </p>
            )}
          </div>
      
          <div className="action-buttons">
            <button className="btn-primary" data-route="/send">
              <img src="/assets/img/27f59345a9.svg" alt="Top Up" />
              <span>{t('Isi Ulang')}</span>
            </button>
            <button className="btn-secondary" data-route="/draw">
              <img src="/assets/img/d463632364.svg" alt="Withdraw" />
              <span>{t('Penarikan')}</span>
            </button>
          </div>
        </div>
      </section>
      <section id="section-banner" className="banner-section" data-route="/pasar">
        <img src="/assets/img/d680ba1e04.png" alt="Transparent Services Crypto Banner" className="banner-img" />
      </section>
      <section id="section-transaction-history" className="history-section">
        <div className="section-header">
          <h3 className="section-title">{t('Riwayat Transaksi')}</h3>
          <p className="section-subtitle">{t('Pilih jenis riwayat untuk melihat catatan transaksimu')}</p>
        </div>
        <div className="history-grid">
          <div className="grid-item" data-route="/riwayat/send">
            <div className="icon-wrapper">
              <img src="/assets/img/cc68f81cb9.svg" alt="Deposit" />
            </div>
            <span className="item-label">{t('Deposit')}</span>
            <img src="/assets/img/ed881aa87c.svg" alt="Arrow" className="arrow-icon" />
          </div>
          <div className="grid-item" data-route="/riwayat/draw">
            <div className="icon-wrapper">
              <img src="/assets/img/7c55492545.svg" alt="Penarikan" />
            </div>
            <span className="item-label">{t('Penarikan')}</span>
            <img src="/assets/img/ed881aa87c.svg" alt="Arrow" className="arrow-icon" />
          </div>
          <div className="grid-item" data-route="/coin">
            <div className="icon-wrapper">
              <img src="/assets/img/4bb30fcaab.svg" alt="Keuntungan" />
            </div>
            <span className="item-label">{t('Keuntungan')}</span>
            <img src="/assets/img/ed881aa87c.svg" alt="Arrow" className="arrow-icon" />
          </div>
          <div className="grid-item" data-route="/riwayat/komisi">
            <div className="icon-wrapper">
              <img src="/assets/img/2b377daf77.svg" alt="Komisi" />
            </div>
            <span className="item-label">{t('Komisi')}</span>
            <img src="/assets/img/ed881aa87c.svg" alt="Arrow" className="arrow-icon" />
          </div>
          <div className="grid-item" data-route="/riwayat/absen">
            <div className="icon-wrapper">
              <img src="/assets/img/503e6d2641.svg" alt="Absen" />
            </div>
            <span className="item-label">{t('Absen')}</span>
            <img src="/assets/img/ed881aa87c.svg" alt="Arrow" className="arrow-icon" />
          </div>
          <div className="grid-item" data-route="/riwayat/hadiah">
            <div className="icon-wrapper">
              <img src="/assets/img/27b8b8fb5b.svg" alt="Hadiah" />
            </div>
            <span className="item-label">{t('Hadiah')}</span>
            <img src="/assets/img/ed881aa87c.svg" alt="Arrow" className="arrow-icon" />
          </div>
          <div className="grid-item" data-route="/riwayat/misi">
            <div className="icon-wrapper">
              <img src="/assets/img/7264e4e8e9.svg" alt="Misi" />
            </div>
            <span className="item-label">{t('Misi')}</span>
            <img src="/assets/img/ed881aa87c.svg" alt="Arrow" className="arrow-icon" />
          </div>
          <div className="grid-item" data-route="/riwayat/lainnya">
            <div className="icon-wrapper">
              <img src="/assets/img/a63b54f39a.svg" alt="Lainnya" />
            </div>
            <span className="item-label">{t('Lainnya')}</span>
            <img src="/assets/img/ed881aa87c.svg" alt="Arrow" className="arrow-icon" />
          </div>
        </div>
      </section>
      <section id="section-activities-rewards" className="list-section">
        <h3 className="list-section-title">{t('Aktivitas & Hadiah')}</h3>
        <div className="list-container">
          <div className="list-item" data-route="/rank">
            <div className="list-icon"><img src="/assets/img/b6d18f522c.svg" alt="Rank" /></div>
            <span className="list-label">{t('Rank Saya')}</span>
            {rankTitle && (
              <div className="badge-gold" style={{ background: tone.chipBg, color: tone.chipText }}>
                {rankTitle}
              </div>
            )}
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/rewards/misi">
            <div className="list-icon"><img src="/assets/img/9edc3d38ec.svg" alt="Misi" /></div>
            <span className="list-label">{t('Misi Rewards')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/rewards/share">
            <div className="list-icon"><img src="/assets/img/803cf45c4a.svg" alt="Undangan" /></div>
            <span className="list-label">{t('Undangan')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/rewards/teman">
            <div className="list-icon"><img src="/assets/img/b131623c90.svg" alt="Teman" /></div>
            <span className="list-label">{t('Teman Diundang')}</span>
            <span className="list-value">{t('Level 1–3')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/rewards/harian">
            <div className="list-icon"><img src="/assets/img/60c38a9ebf.svg" alt="Absen" /></div>
            <span className="list-label">{t('Absen Harian')}</span>
            {attended !== null && (
              <div className={attended ? 'badge-green' : 'badge-red'}>
                {attended ? t('Sudah absen') : t('Belum absen')}
              </div>
            )}
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/rewards/roda">
            <div className="list-icon"><img src="/assets/img/9620d04cda.svg" alt="Roda" /></div>
            <span className="list-label">{t('Roda Keberuntungan')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
        </div>
      </section>
      <section id="section-account-settings" className="list-section">
        <h3 className="list-section-title">{t('Akun & Setelan')}</h3>
        <div className="list-container">
          <div className="list-item" data-route="/profil">
            <div className="list-icon"><img src="/assets/img/4c25e4c52e.svg" alt="Profil" /></div>
            <span className="list-label">{t('Profil Saya')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item">
            <div className="list-icon"><img src="/assets/img/c9ed19c17e.svg" alt="Verifikasi" /></div>
            <span className="list-label">{t('Verifikasi Status Akun')}</span>
            {verified !== null && (
              <div className={verified ? 'badge-green' : 'badge-red'}>
                {verified ? t('Terverifikasi') : t('Belum terverifikasi')}
              </div>
            )}
          </div>
          <div className="list-item" data-route="/dompet">
            <div className="list-icon"><img src="/assets/img/c83972142f.svg" alt="Bank" /></div>
            <span className="list-label">{t('Rekening Bank')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/change">
            <div className="list-icon"><img src="/assets/img/557a882d15.svg" alt="Sandi" /></div>
            <span className="list-label">{t('Ubah Kata Sandi')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/profil/perangkat">
            <div className="list-icon"><img src="/assets/img/99e5c7fc63.svg" alt="Perangkat" /></div>
            <span className="list-label">{t('Perangkat Login')}</span>
            <span className="list-value">{t('1 aktif')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/profil/bahasa">
            <div className="list-icon"><img src="/assets/img/ad5f00a7e3.svg" alt="Bahasa" /></div>
            <span className="list-label">{t('Bahasa')}</span>
            {/* the row prints the name in the language that is active now */}
            <span className="list-value">{t(languageName(getLanguage()))}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
        </div>
      </section>
      <section id="section-help" className="list-section">
        <h3 className="list-section-title">{t('Bantuan')}</h3>
        <div className="list-container">
          <div className="list-item" data-route="/faq">
            <div className="list-icon"><img src="/assets/img/b1e335e2d4.svg" alt="FAQ" /></div>
            <span className="list-label">{t('Pusat Bantuan (FAQ)')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/chat-cs">
            <div className="list-icon"><img src="/assets/img/27e9fab82c.svg" alt="Chat" /></div>
            <span className="list-label">{t('Chat dengan Tim Kami')}</span>
            <div className="badge-online">
              <span className="dot-online"></span>
              <span>{t('Online')}</span>
            </div>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
        </div>
      </section>
      <section id="section-about" className="list-section">
        <h3 className="list-section-title">{t('Tentang')}</h3>
        <div className="list-container">
          <div className="list-item">
            <div className="list-icon"><img src="/assets/img/fb130bf4df.svg" alt="Unduh" /></div>
            <span className="list-label">{t('Unduh Aplikasi')}</span>
            <span className="list-value">{t('Android')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/tentang-kami">
            <div className="list-icon"><img src="/assets/img/2e08d4e9ea.svg" alt="Tentang" /></div>
            <span className="list-label">{t('Tentang Kami')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/legal/syarat-ketentuan">
            <div className="list-icon"><img src="/assets/img/efb903abe4.svg" alt="Syarat" /></div>
            <span className="list-label">{t('Syarat & Ketentuan')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/legal/syarat-layanan">
            <div className="list-icon"><img src="/assets/img/efb903abe4.svg" alt="Layanan" /></div>
            <span className="list-label">{t('Syarat Layanan')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/legal/kebijakan-privasi">
            <div className="list-icon"><img src="/assets/img/5837c66ad1.svg" alt="Privasi" /></div>
            <span className="list-label">{t('Kebijakan Privasi')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
          <div className="list-item" data-route="/legal/perjanjian-klien">
            <div className="list-icon"><img src="/assets/img/c16f20e452.svg" alt="Perjanjian" /></div>
            <span className="list-label">{t('Perjanjian Klien')}</span>
            <img src="/assets/img/8602b31a6d.svg" alt="Arrow" />
          </div>
        </div>
      </section>
      <section id="section-footer" className="footer-section">
        <button className="btn-logout" data-route="/notifikasi/keluar">
          <img src="/assets/img/c3684a4c9c.svg" alt="Logout" />
          <span>{t('Keluar')}</span>
        </button>
        <p className="app-version">{t('PasarCryptoID · Versi 1.0.0')}</p>
        
        </section>
      <BottomNav />
    </div>
  );
}
