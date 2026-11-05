// program-referral — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { copyText } from '../../lib/clipboard.js';
import { idr } from '../../lib/format.js';
import { inviteLink } from '../../lib/referral.js';
import { t } from '../../lib/i18n.js';
const css = `
/* program-referral — ported from Figma export, typography re-synced */
.scr-program-referral *{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.scr-program-referral .app-container{
  width: 100%;
  min-height: 100cqh;
  background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%);
  color: #ffffff;
  position: relative;
  overflow-x: hidden;
}
.scr-program-referral .text-primary{ color: #ffffff; }
.scr-program-referral .text-secondary{ color: #a9b7c8; }
.scr-program-referral .text-tertiary{ color: #8597ab; }
.scr-program-referral .text-muted{ color: #75879c; }
.scr-program-referral .text-highlight{ color: #c9d4e1; }
.scr-program-referral .font-bold{ font-weight: 700; }
.scr-program-referral .font-semibold{ font-weight: 600; }
.scr-program-referral .font-medium{ font-weight: 500; }
.scr-program-referral .font-regular{ font-weight: 400; }
.scr-program-referral .text-xs{ font-size: 12px; line-height: 1.4; }
.scr-program-referral .text-sm{ font-size: 14px; line-height: 1.5; }
.scr-program-referral .text-base{ font-size: 16px; line-height: 1.5; }
.scr-program-referral .text-lg{ font-size: 20px; line-height: 1.4; }
.scr-program-referral .text-xl{ font-size: 24px; line-height: 1.3; }
.scr-program-referral button{
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.scr-program-referral .header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px 12px;
  }
.scr-program-referral .btn-back{
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: #1f3048;
    display: flex;
    align-items: center;
    justify-content: center;
  }
.scr-program-referral .header-title{
    flex: 1;
    text-align: center;
  }
.scr-program-referral .header-spacer{
    width: 40px; 
  }
.scr-program-referral .hero{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 24px;
  }
.scr-program-referral .hero-title{
    flex: 1;
    max-width: 240px;
  }
.scr-program-referral .hero-image-wrapper{
    width: 125px;
    height: 116px;
    flex-shrink: 0;
  }
.scr-program-referral .hero-image{
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
.scr-program-referral .stats-container{
    padding: 0 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
.scr-program-referral .stat-main{
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
.scr-program-referral .stat-value-group{
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
.scr-program-referral .stat-secondary-group{
    display: flex;
    align-items: center;
  }
.scr-program-referral .stat-item{
    display: flex;
    flex-direction: column;
    flex: 1;
  }
.scr-program-referral .mt-1{ margin-top: 4px; }
.scr-program-referral .pl-4{ padding-left: 16px; }
.scr-program-referral .stat-divider{
    width: 1px;
    height: 36px;
    background-color: rgba(201, 212, 225, 0.18);
  }
.scr-program-referral .referral-container{
    padding: 0 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
.scr-program-referral .ref-fields{
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
.scr-program-referral .ref-row{
    display: flex;
    align-items: center;
    height: 44px;
    border: 1px dashed #51657e;
    border-radius: 22px;
    padding: 0 6px 0 16px;
  }
.scr-program-referral .ref-label{
    width: 56px;
  }
.scr-program-referral .ref-value{
    flex: 1;
  }
.scr-program-referral .truncate{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
.scr-program-referral .btn-copy{
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #1f3048;
    height: 32px;
    padding: 0 12px;
    border-radius: 16px;
  }
.scr-program-referral .action-buttons{
    display: flex;
    gap: 10px;
  }
.scr-program-referral .btn-primary{
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(to right, #f5f8fb, #c9d4e1);
  }
.scr-program-referral .btn-secondary{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 44px;
    padding: 0 20px;
    border-radius: 22px;
    background-color: #1f3048;
  }
.scr-program-referral .bonus-container{
    padding: 0 16px 32px;
  }
.scr-program-referral .mb-4{ margin-bottom: 16px; }
.scr-program-referral .bonus-card{
    background: linear-gradient(135deg, #24426a 0%, #1a3150 55%, #12233a 100%);
    border-radius: 20px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 16px;
  }
.scr-program-referral .bonus-card-header{
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
.scr-program-referral .bonus-card-amount{
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
.scr-program-referral .progress-bar{
    display: flex;
    gap: 4px;
    height: 6px;
    width: 100%;
  }
.scr-program-referral .progress-segment{
    height: 100%;
    border-radius: 3px;
  }
.scr-program-referral .segment-1{ flex: 1; background-color: #5a82bf; }
.scr-program-referral .segment-2{ flex: 2.5; background-color: #c9d4e1; }
.scr-program-referral .segment-3{ flex: 1.2; background-color: #51657e; }
.scr-program-referral .level-list{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-program-referral .level-item{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
.scr-program-referral .level-info{
    display: flex;
    align-items: center;
    gap: 8px;
  }
.scr-program-referral .dot{
    width: 8px;
    height: 8px;
    border-radius: 4px;
  }
.scr-program-referral .dot-1{ background-color: #5a82bf; }
.scr-program-referral .dot-2{ background-color: #c9d4e1; }
.scr-program-referral .dot-3{ background-color: #51657e; }
.scr-program-referral .other-bonus-link{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
.scr-program-referral .link-btn{
    display: flex;
    align-items: center;
    gap: 4px;
  }
.scr-program-referral .invited-container{
    padding: 0 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
.scr-program-referral .invited-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
.scr-program-referral .invited-stats{
    display: flex;
    align-items: center;
  }
.scr-program-referral .invited-stat-item{
    display: flex;
    flex-direction: column;
    flex: 1;
  }
.scr-program-referral .pl-3{ padding-left: 12px; }
.scr-program-referral .invited-stat-divider{
    width: 1px;
    height: 36px;
    background-color: rgba(201, 212, 225, 0.18);
  }
.scr-program-referral .notes-container{
    padding: 0 16px 40px;
  }
.scr-program-referral .mb-3{ margin-bottom: 12px; }
.scr-program-referral .notes-list{
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
.scr-program-referral .note-item{
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
.scr-program-referral .note-bullet{
    width: 6px;
    height: 6px;
    border-radius: 3px;
    background-color: #51657e;
    margin-top: 6px;
    flex-shrink: 0;
  }
.scr-program-referral { min-height: 100cqh; width: 100%; background: linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); color: #ffffff; }
.scr-program-referral section > .app-container { min-height: 0; background: none; }
/* figma re-sync */
.scr-program-referral .text-base.text-base { font-size: 11px; }
.scr-program-referral .text-xs.text-xs { line-height: 15px; }
.scr-program-referral .text-sm.text-sm { line-height: 16px; }
.scr-program-referral .text-sm.text-sm { font-size: 13px; }
.scr-program-referral .text-base.text-base { line-height: 13px; }
.scr-program-referral .text-xl.text-xl { font-size: 26px; }
.scr-program-referral .text-tertiary.text-tertiary { color: #A9B7C8; }
/* skeleton placeholders — the figures keep their slot while the endpoint answers */
.scr-program-referral .sk{
    display: block;
    border-radius: 5px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.16) 50%, rgba(255, 255, 255, 0.06) 100%);
    background-size: 220% 100%;
    animation: scr-program-referral-shimmer 1.3s ease-in-out infinite;
}
@keyframes scr-program-referral-shimmer{
    0%{ background-position: 140% 0; }
    100%{ background-position: -140% 0; }
}
@media (prefers-reduced-motion: reduce){
    .scr-program-referral .sk{
      animation: none;
      background: rgba(255, 255, 255, 0.1);
    }
}
.scr-program-referral .sk-status{
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
}
/* without a referral code the copy and share actions stay visible but untappable */
.scr-program-referral .btn-copy:disabled,
.scr-program-referral .btn-primary:disabled{ opacity: 0.5; cursor: default; }
`;

// the frame only draws the three nearest levels, the endpoint returns all five
const LEVELS = [1, 2, 3];
const num = (value) => Number(value) || 0;

// one shimmering bar, sized like the figure it stands in for
const Sk = ({ w = 40, h = 13, r = 5, style }) => (
  <span className="sk" style={{ width: w, height: `${h}px`, borderRadius: `${r}px`, ...style }} aria-hidden="true"></span>
);

export default function ProgramReferral() {
  const { user } = useAuth();
  const [levels, setLevels] = useState([]);
  const [status, setStatus] = useState('loading');
  const [copied, setCopied] = useState('');

  // one endpoint carries both the commission and the member counts
  useEffect(() => {
    let alive = true;
    api.downlineStats()
      .then((res) => {
        if (!alive) return;
        if (!res.ok) {
          setStatus('error');
          return;
        }
        setLevels(Array.isArray(res.data?.levels) ? res.data.levels : []);
        setStatus('ready');
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(''), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const ready = status === 'ready';
  // while the endpoint is in flight every figure holds its slot as a skeleton bar
  const loading = status === 'loading';
  const rows = LEVELS.map((level) => levels.find((row) => row.level === level)).filter(Boolean);
  const countOf = (level) => num(levels.find((row) => row.level === level)?.members_total);

  // the headline is what levels 1-3 have paid so far
  const commission = rows.reduce(
    (sum, row) => sum + num(row.profit_commission_amount) + num(row.purchase_commission_amount),
    0
  );
  // invited counts every member, trading only the ones who already deposited
  const invited = rows.reduce((sum, row) => sum + num(row.members_total), 0);
  const trading = rows.reduce((sum, row) => sum + num(row.members_active), 0);

  const code = user?.referral_code || '';
  const link = inviteLink(code);

  // the shell copies closest('div').innerText, which here is the whole row
  const copy = async (event, key, value) => {
    event.stopPropagation();
    if (!value) return;
    // the label only confirms what actually reached the clipboard
    if (await copyText(value)) setCopied(key);
  };

  const share = async (event) => {
    event.stopPropagation();
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PasarCrypto',
          // mirrors the hero's promise, so the invite sells the same reward
          text: `Ajak teman, dapat bonus poin! Gabung di PasarCrypto pakai kode ${code}.`,
          url: link,
        });
        return;
      } catch {
        // dismissed or blocked, the clipboard below is still a usable outcome
      }
    }
    // a desktop browser has no share sheet, so the link goes to the clipboard
    if (await copyText(link)) setCopied('share');
  };

  return (
    <div className="scr-program-referral">
      <style>{css}</style>
      <section id="section-header">
        <div className="app-container">
          <header className="header">
            <button className="btn-back" aria-label={t('Go back')} data-back="1">
              <img src="/assets/img/aad66e4cfc.svg" alt="Back" />
            </button>
            <h1 className="header-title text-base font-semibold">{t('Program Referral')}</h1>
            <div className="header-spacer"></div>
          </header>
        </div>
      </section>
      <section id="section-hero">
        <div className="app-container">
          <div className="hero">
            <h2 className="hero-title text-xl font-bold">{t('Ajak teman,')}<br />{t('dapat bonus poin')}</h2>
            <div className="hero-image-wrapper">
              <img src="/assets/img/5a25f69237.png" alt="Bonus Coins" className="hero-image" />
            </div>
          </div>
        </div>
      </section>
      <section id="section-stats">
        <div className="app-container">
          <div className="stats-container">
            {loading && <p className="sk-status" role="status">{t('Memuat data referral…')}</p>}
            <div className="stat-main">
              <span className="text-tertiary text-xs">{t('Poin didapat')}</span>
              <div className="stat-value-group">
                {loading ? (
                  // centred rather than baseline-aligned: a block skeleton next to
                  // the small IDR label would otherwise make the row 3px taller
                  <Sk w={118} h={34} r={6} style={{ alignSelf: 'center' }} />
                ) : (
                  <span className="text-xl font-bold">{ready ? idr(commission) : '—'}</span>
                )}
                <span className="text-secondary text-xs font-medium">{t('IDR')}</span>
              </div>
            </div>
            
            <div className="stat-secondary-group">
              <div className="stat-item">
                <span className="text-tertiary text-xs">{t('Teman diundang')}</span>
                {loading ? (
                  <Sk w={26} style={{ marginTop: '4px' }} />
                ) : (
                  <span className="text-base font-bold mt-1">{ready ? invited : '—'}</span>
                )}
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item pl-4">
                <span className="text-tertiary text-xs">{t('Sudah trading')}</span>
                {loading ? (
                  <Sk w={26} style={{ marginTop: '4px' }} />
                ) : (
                  <span className="text-base font-bold mt-1">{ready ? trading : '—'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-referral">
        <div className="app-container">
          <div className="referral-container">
            <div className="ref-fields">
              <div className="ref-row">
                <span className="ref-label text-tertiary text-xs">{t('Kode')}</span>
                <span className="ref-value text-sm font-semibold">{code || '—'}</span>
                <button className="btn-copy" onClick={(event) => copy(event, 'code', code)} disabled={!code}>
                  <img src="/assets/img/89b44cd30c.svg" alt="Copy" />
                  <span className="text-xs text-highlight">{copied === 'code' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <div className="ref-row">
                <span className="ref-label text-tertiary text-xs">{t('Tautan')}</span>
                <span className="ref-value text-sm font-semibold truncate">{link ? link.replace(/^https:\/\//, '') : '—'}</span>
                <button className="btn-copy" onClick={(event) => copy(event, 'link', link)} disabled={!link}>
                  <img src="/assets/img/89b44cd30c.svg" alt="Copy" />
                  <span className="text-xs text-highlight">{copied === 'link' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
            
            <div className="action-buttons">
              <button className="btn-primary" onClick={share} disabled={!link}>
                <img src="/assets/img/26a1d86e8f.svg" alt="Share" />
                <span className="text-sm font-semibold" style={{ color: "#0c1a2d" }}>{copied === 'share' ? 'Tersalin' : 'Bagikan'}</span>
              </button>
              <button className="btn-secondary" data-route="/rewards/poster">
                <img src="/assets/img/7adb672641.svg" alt="Poster" />
                <span className="text-sm font-medium text-highlight">{t('Poster')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      <section id="section-bonus">
        <div className="app-container">
          <div className="bonus-container">
            <h3 className="text-base font-semibold mb-4">{t('Bonus per teman')}</h3>
            
            <div className="bonus-card">
              <div className="bonus-card-header">
                <span className="text-secondary text-xs">{t('Dapatkan maksimal')}</span>
                <div className="bonus-card-amount">
                  <span className="text-xl font-bold">50000</span>
                  <span className="text-secondary text-xs">{t('IDR per teman')}</span>
                </div>
              </div>
              
              <div className="progress-bar">
                <div className="progress-segment segment-1"></div>
                <div className="progress-segment segment-2"></div>
                <div className="progress-segment segment-3"></div>
              </div>
              
              <div className="level-list">
                <div className="level-item">
                  <div className="level-info">
                    <div className="dot dot-1"></div>
                    <span className="text-secondary text-xs">{t('Level 1')}</span>
                  </div>
                  <span className="text-xs font-semibold">{t('est. 33%')}</span>
                </div>
                <div className="level-item">
                  <div className="level-info">
                    <div className="dot dot-2"></div>
                    <span className="text-secondary text-xs">{t('Level 2')}</span>
                  </div>
                  <span className="text-xs font-semibold">{t('est. 2%')}</span>
                </div>
                <div className="level-item">
                  <div className="level-info">
                    <div className="dot dot-3"></div>
                    <span className="text-secondary text-xs">{t('Level 3')}</span>
                  </div>
                  <span className="text-xs font-semibold">{t('est. 1%')}</span>
                </div>
              </div>
            </div>
            
            <div className="other-bonus-link">
              <span className="text-xs">{t('Ada juga')} <span className="font-semibold">{t('bonus saldo IDR lainnya')}</span></span>
              <button className="link-btn" data-route="/rewards/misi">
                <span className="text-highlight text-xs">{t('Lihat Misi Rewards')}</span>
                <img src="/assets/img/8bb974c4cd.svg" alt="Arrow Right" />
              </button>
            </div>
          </div>
        </div>
      </section>
      <section id="section-invited-friends">
        <div className="app-container">
          <div className="invited-container">
            <div className="invited-header">
              <h3 className="text-base font-semibold">{t('Teman diundang')}</h3>
              <button className="link-btn" data-route="/rewards/teman">
                <span className="text-highlight text-xs">{t('Lihat semua')}</span>
                <img src="/assets/img/8bb974c4cd.svg" alt="Arrow Right" />
              </button>
            </div>
            
            <div className="invited-stats">
              <div className="invited-stat-item">
                <span className="text-tertiary text-xs">{t('Level 1')}</span>
                {loading ? (
                  <Sk w={30} h={28} r={6} style={{ marginTop: '4px' }} />
                ) : (
                  <span className="text-lg font-bold mt-1">{ready ? countOf(1) : '—'}</span>
                )}
              </div>
              <div className="invited-stat-divider"></div>
              <div className="invited-stat-item pl-3">
                <span className="text-tertiary text-xs">{t('Level 2')}</span>
                {loading ? (
                  <Sk w={30} h={28} r={6} style={{ marginTop: '4px' }} />
                ) : (
                  <span className="text-lg font-bold mt-1">{ready ? countOf(2) : '—'}</span>
                )}
              </div>
              <div className="invited-stat-divider"></div>
              <div className="invited-stat-item pl-3">
                <span className="text-tertiary text-xs">{t('Level 3')}</span>
                {loading ? (
                  <Sk w={30} h={28} r={6} style={{ marginTop: '4px' }} />
                ) : (
                  <span className="text-lg font-bold mt-1">{ready ? countOf(3) : '—'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="section-notes">
        <div className="app-container">
          <div className="notes-container">
            <h4 className="text-secondary text-sm font-medium mb-3">{t('Catatan')}</h4>
            <ul className="notes-list">
              <li className="note-item">
                <div className="note-bullet"></div>
                <p className="text-muted text-xs">{t('Bagikan kode atau tautan referral untuk mengundang teman.')}</p>
              </li>
              <li className="note-item">
                <div className="note-bullet"></div>
                <p className="text-muted text-xs">{t('Bonus referral diberikan setelah teman yang diundang menyelesaikan trading pertama. Bonus dihitung berdasarkan level referral dan ketentuan program yang berlaku.')}</p>
              </li>
              <li className="note-item">
                <div className="note-bullet"></div>
                <p className="text-muted text-xs">{t('Setiap pengguna hanya dapat terdaftar melalui satu kode referral. Bonus yang memenuhi syarat akan otomatis ditambahkan ke saldo akun.')}</p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
