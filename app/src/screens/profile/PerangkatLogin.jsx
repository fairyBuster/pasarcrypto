// perangkat-login — ported from the Figma export, typography re-synced to Figma
import pkg from '../../../package.json';
import { useNavigate } from 'react-router-dom';
import { session } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { wibParts } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// the browser is the only source for the device signed in right now
const readDevice = () => {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  const os = /Android/i.test(ua)
    ? 'Android'
    : /iPhone|iPad|iPod/i.test(ua)
      ? 'iOS'
      : /Windows/i.test(ua)
        ? 'Windows'
        : /Mac OS X/i.test(ua)
          ? 'macOS'
          : /Linux/i.test(ua)
            ? 'Linux'
            : t('Tidak diketahui');
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Browser';
  const version = (ua.match(/(?:Edg|OPR|Firefox|Chrome|Version)\/(\d+)/) || [])[1];
  return {
    name: t('Perangkat {os}', { os }),
    browser: version ? `${browser} ${version}` : browser,
  };
};

// the access token carries the sign-in time in its iat claim
const readSessionStart = () => {
  const token = session.access;
  if (!token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(payload));
    return claims.iat ? new Date(claims.iat * 1000) : null;
  } catch {
    return null;
  }
};

const wibText = (date) => {
  const { day, month, year, hour, minute } = wibParts(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(day)}-${pad(month)}-${year} ${hour}:${minute} WIB`;
};

const css = `
/* perangkat-login — ported from Figma export, typography re-synced */
.scr-perangkat-login *{
  box-sizing: border-box;
}
.scr-perangkat-login h1,
.scr-perangkat-login h2,
.scr-perangkat-login h3,
.scr-perangkat-login h4,
.scr-perangkat-login h5,
.scr-perangkat-login h6,
.scr-perangkat-login p{
  margin: 0;
}
.scr-perangkat-login .app-container{
  width: 100%;
  min-height: 100cqh;
  background: radial-gradient(55% 55% at 69.23% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(180deg, #0C1A2D 0%, #13263D 30%, #0F2036 70%, #0A1626 100%);
  position: relative;
  overflow-x: hidden;
  padding-bottom: 28px;
}
.scr-perangkat-login #section-header .app-container{
    min-height: auto;
    padding-bottom: 0;
  }
.scr-perangkat-login .top-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px 0;
  }
.scr-perangkat-login .icon-btn{
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
.scr-perangkat-login .back-btn{
    width: 40px;
    height: 40px;
    background-color: #1f3048;
    border-radius: 20px;
  }
.scr-perangkat-login .header-title{
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    flex: 1;
  }
.scr-perangkat-login .header-spacer{
    width: 40px;
    height: 40px;
  }
.scr-perangkat-login #section-info-banner .app-container{
    min-height: auto;
    padding-bottom: 0;
    background: transparent;
  }
.scr-perangkat-login .info-banner{
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 20px 16px 0;
  }
.scr-perangkat-login .info-icon{
    padding-top: 2px;
    display: flex;
  }
.scr-perangkat-login .info-text{
    color: #a9b7c8;
    font-size: 13px;
    line-height: 1.4;
  }
.scr-perangkat-login #section-current-device .app-container{
    min-height: auto;
    padding-bottom: 0;
    background: transparent;
  }
.scr-perangkat-login .section-title{
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    padding: 26px 16px 12px;
  }
.scr-perangkat-login .device-card{
    margin: 0 16px;
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
.scr-perangkat-login .current-device{
    background: linear-gradient(135deg, #24426A 0%, #1A3150 55%, #12233A 100%);
  }
.scr-perangkat-login .device-header{
    display: flex;
    align-items: center;
    gap: 12px;
  }
.scr-perangkat-login .device-icon-wrapper{
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: rgba(0, 0, 0, 0.22);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }
.scr-perangkat-login .device-title-area{
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }
.scr-perangkat-login .device-name{
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
  }
.scr-perangkat-login .app-version{
    color: #8597ab;
    font-size: 12px;
  }
.scr-perangkat-login .status-active{
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 2px;
  }
.scr-perangkat-login .status-dot{
    width: 6px;
    height: 6px;
    background-color: #3ecf8e;
    border-radius: 3px;
  }
.scr-perangkat-login .status-text{
    color: #3ecf8e;
    font-size: 12px;
    font-weight: 500;
  }
.scr-perangkat-login .device-details{
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding-left: 52px; 
  }
.scr-perangkat-login .detail-row{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
.scr-perangkat-login .detail-label{
    color: #75879c;
    font-size: 12px;
  }
.scr-perangkat-login .detail-value{
    color: #c3cedb;
    font-size: 12px;
    text-align: right;
  }
.scr-perangkat-login #section-other-devices .app-container{
    min-height: auto;
    padding-bottom: 0;
    background: transparent;
  }
.scr-perangkat-login .other-devices-header{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 26px 16px 12px;
  }
.scr-perangkat-login .section-title-inline{
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
  }
.scr-perangkat-login .other-device-empty{
    margin: 0 16px;
    color: #8597ab;
    font-size: 12px;
    line-height: 1.5;
  }
.scr-perangkat-login .btn-logout-this{
    margin: 22px 16px 0;
    width: calc(100% - 32px);
    height: 44px;
    background: transparent;
    border: 1px solid rgba(242, 102, 122, 0.45);
    border-radius: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    color: #f2667a;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }
.scr-perangkat-login #section-notes .app-container{
    min-height: auto;
    background: transparent;
  }
.scr-perangkat-login .notes-container{
    padding: 26px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
.scr-perangkat-login .notes-title{
    color: #a9b7c8;
    font-size: 13px;
    font-weight: 400;
    margin-bottom: 2px;
  }
.scr-perangkat-login .notes-list{
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-perangkat-login .note-item{
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
.scr-perangkat-login .note-bullet-wrapper{
    padding-top: 6px;
    display: flex;
  }
.scr-perangkat-login .note-bullet{
    width: 6px;
    height: 6px;
    background-color: #51657e;
    border-radius: 2px;
    display: block;
  }
.scr-perangkat-login .note-text{
    color: #75879c;
    font-size: 12px;
    line-height: 1.5;
  }
.scr-perangkat-login { min-height: 100cqh; width: 100%; background: radial-gradient(55% 55% at 69.23% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(180deg, #0C1A2D 0%, #13263D 30%, #0F2036 70%, #0A1626 100%); }
.scr-perangkat-login section > .app-container { min-height: 0; background: none; }
/* figma re-sync */
.scr-perangkat-login .header-title.header-title { font-size: 17px; }
.scr-perangkat-login .header-title.header-title { font-weight: 700; }
.scr-perangkat-login .info-text.info-text { font-size: 12px; }
.scr-perangkat-login .section-title.section-title { font-size: 15px; }
.scr-perangkat-login .section-title.section-title { font-weight: 700; }
.scr-perangkat-login .app-version.app-version { font-size: 11px; }
.scr-perangkat-login .status-text.status-text { font-size: 11px; }
.scr-perangkat-login .status-text.status-text { font-weight: 600; }
.scr-perangkat-login .detail-label.detail-label { font-size: 11px; }
.scr-perangkat-login .detail-value.detail-value { font-size: 11px; }
.scr-perangkat-login .section-title-inline.section-title-inline { font-size: 15px; }
.scr-perangkat-login .section-title-inline.section-title-inline { font-weight: 700; }
.scr-perangkat-login .notes-title.notes-title { font-size: 12px; }
.scr-perangkat-login .notes-title.notes-title { font-weight: 600; }
`;

export default function PerangkatLogin() {
  // this card describes the session that is open in this browser
  const device = readDevice();
  const signedInAt = readSessionStart();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // one tap ends the session right here and drops the user on the entry screen
  const logoutThisDevice = async (event) => {
    event.stopPropagation();
    await signOut();
    navigate('/welcome');
  };

  return (
    <div className="scr-perangkat-login">
      <style>{css}</style>
      <section id="section-header">
        <div className="app-container">
          <header className="top-header">
            <button className="icon-btn back-btn" aria-label={t('Go back')} data-back="1">
              <img src="/assets/img/3f019b89bd.svg" alt="Back" />
            </button>
            <h1 className="header-title">{t('Perangkat Login')}</h1>
            <div className="header-spacer"></div>
          </header>
        </div>
      </section>
      <section id="section-info-banner">
        <div className="app-container">
          <div className="info-banner">
            <div className="info-icon">
              <img src="/assets/img/0eac2c71ab.svg" alt="Info" />
            </div>
            <p className="info-text">{t('Berikut perangkat yang sedang memakai sesimu. Keluar dari perangkat ini untuk mengakhiri sesi.')}</p>
          </div>
        </div>
      </section>
      <section id="section-current-device">
        <div className="app-container">
          <h2 className="section-title">{t('Perangkat ini')}</h2>
          <div className="device-card current-device">
            <div className="device-header">
              <div className="device-icon-wrapper">
                <img src="/assets/img/42123c6335.svg" alt="Device Icon" />
              </div>
              <div className="device-title-area">
                <h3 className="device-name">{device.name}</h3>
                <span className="app-version">{t('Aplikasi v{version}', { version: pkg.version })}</span>
                <div className="status-active">
                  <span className="status-dot"></span>
                  <span className="status-text">{t('Aktif sekarang')}</span>
                </div>
              </div>
            </div>
            <div className="device-details">
              <div className="detail-row">
                <span className="detail-label">{t('Browser')}</span>
                <span className="detail-value">{device.browser}</span>
              </div>
              {signedInAt && (
                <div className="detail-row">
                  <span className="detail-label">{t('Masuk sejak')}</span>
                  <span className="detail-value">{wibText(signedInAt)}</span>
                </div>
              )}
            </div>
          </div>
          {/* the session this browser holds is the only one the API can end */}
          <button className="btn-logout-this" onClick={logoutThisDevice}>
            <img src="/assets/img/c3684a4c9c.svg" alt="" />
            <span>{t('Keluar dari Perangkat Ini')}</span>
          </button>
        </div>
      </section>
      <section id="section-other-devices">
        <div className="app-container">
          <div className="other-devices-header">
            <h2 className="section-title-inline">{t('Perangkat lain')}</h2>
          </div>
          {/* the API keeps no device registry, so this browser is the only
              session that can be listed; the block reports that honestly */}
          <p className="other-device-empty">{t('Tidak ada perangkat lain yang login.')}</p>
        </div>
      </section>
      <section id="section-notes">
        <div className="app-container">
          <div className="notes-container">
            <h4 className="notes-title">{t('Catatan')}</h4>
            <ul className="notes-list">
              <li className="note-item">
                <div className="note-bullet-wrapper">
                  <span className="note-bullet"></span>
                </div>
                <p className="note-text">{t('Jika kamu mencurigai orang lain memakai akunmu, keluar dari perangkat ini lalu ubah kata sandi.')}</p>
              </li>
              <li className="note-item">
                <div className="note-bullet-wrapper">
                  <span className="note-bullet"></span>
                </div>
                <p className="note-text">{t('Setelah keluar, kamu perlu nomor HP atau email dan kata sandi untuk masuk lagi.')}</p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
