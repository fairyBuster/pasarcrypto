// rekening-bank-2 — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { t } from '../../lib/i18n.js';

const css = `
/* rekening-bank-2 — ported from Figma export, typography re-synced */
.scr-rekening-bank-2 body::before{
  content: '';
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 412px;
  height: 100cqh;
  background-color: #0a1626;
  background-image: 
    radial-gradient(circle at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 60%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%);
  z-index: -1;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}
.scr-rekening-bank-2 *{
  box-sizing: border-box;
}
.scr-rekening-bank-2 section{
  width: 100%;
  max-width: 412px;
  margin: 0 auto;
  position: relative;
}
.scr-rekening-bank-2 #section-header .header{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 1px 0;
  height: 60px;
}
.scr-rekening-bank-2 #section-header .back-btn{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}
.scr-rekening-bank-2 #section-header .back-btn:active{
  opacity: 0.8;
}
.scr-rekening-bank-2 #section-header .page-title{
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}
.scr-rekening-bank-2 #section-header .header-spacer{
  width: 40px;
}
.scr-rekening-bank-2 #section-info .info-container{
  display: flex;
  gap: 10px;
  padding: 20px 1px 0;
  align-items: flex-start;
}
.scr-rekening-bank-2 #section-info .info-icon{
  margin-top: 2px;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.scr-rekening-bank-2 #section-info .info-text{
  color: #a9b7c8;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
}
.scr-rekening-bank-2 #section-bank-cards .cards-container{
  padding: 12px 1px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.scr-rekening-bank-2 #section-bank-cards .bank-card{
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.scr-rekening-bank-2 #section-bank-cards .card-primary{
  background: linear-gradient(135deg, #24426a 0%, #1a3150 55%, #12233a 100%);
}
.scr-rekening-bank-2 #section-bank-cards .card-secondary{
  background-color: rgba(31, 48, 72, 0.55);
  border: 1px solid #2a3d56;
}
.scr-rekening-bank-2 #section-bank-cards .card-header{
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.scr-rekening-bank-2 #section-bank-cards .card-title-group{
  display: flex;
  align-items: center;
  gap: 8px;
}
.scr-rekening-bank-2 #section-bank-cards .bank-name{
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}
.scr-rekening-bank-2 #section-bank-cards .badge-utama{
  background-color: rgba(62, 207, 142, 0.14);
  color: #3ecf8e;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}
.scr-rekening-bank-2 #section-bank-cards .options-btn{
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}
.scr-rekening-bank-2 #section-bank-cards .account-name{
  color: #a9b7c8;
  font-size: 14px;
  margin: -8px 0 0 0;
}
.scr-rekening-bank-2 #section-bank-cards .card-divider{
  height: 1px;
  background-color: rgba(201, 212, 225, 0.2);
  margin: 0;
  width: 100%;
}
.scr-rekening-bank-2 #section-bank-cards .account-details{
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scr-rekening-bank-2 #section-bank-cards .detail-label{
  color: #8597ab;
  font-size: 12px;
}
.scr-rekening-bank-2 #section-bank-cards .detail-value{
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #ffffff;
}
.scr-rekening-bank-2 #section-add-account .add-container{
  padding: 12px 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.scr-rekening-bank-2 #section-add-account .add-account-btn{
  width: 100%;
  height: 46px;
  border: 1px dashed #51657e;
  border-radius: 14px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #c9d4e1;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.scr-rekening-bank-2 #section-add-account .add-account-btn:hover{
  background-color: rgba(81, 101, 126, 0.1);
}
.scr-rekening-bank-2 #section-add-account .limit-text{
  color: #75879c;
  font-size: 12px;
  margin: 0;
}
.scr-rekening-bank-2 #section-notes .notes-container{
  padding: 26px 16px 28px;
}
.scr-rekening-bank-2 #section-notes .notes-title{
  color: #a9b7c8;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}
.scr-rekening-bank-2 #section-notes .notes-list{
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.scr-rekening-bank-2 #section-notes .notes-list li{
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.scr-rekening-bank-2 #section-notes .bullet{
  width: 6px;
  height: 6px;
  background-color: #51657e;
  border-radius: 3px;
  margin-top: 6px;
  flex-shrink: 0;
}
.scr-rekening-bank-2 #section-notes .notes-list p{
  color: #75879c;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
}
/* the Figma frame draws two hardcoded cards; the API decides what renders */
.scr-rekening-bank-2 .list-state{ padding: 12px 0; text-align: center; font-size: 12px; line-height: 18px; color: #75879c; }
.scr-rekening-bank-2 .bank-notice{ margin: 12px 16px 0; padding: 10px 12px; border-radius: 12px; background-color: rgba(62, 207, 142, 0.12); color: #3ecf8e; font-size: 12px; }
/* the three-dot button used to draw a menu that opened nothing; it now carries
   the one setting the API exposes for a saved account */
.scr-rekening-bank-2 .account-sheet{ position: absolute; inset: 0; z-index: 40; display: flex; align-items: flex-end; background-color: rgba(4, 9, 18, 0.66); }
.scr-rekening-bank-2 .sheet-card{ width: 100%; padding: 10px 16px 18px; border-radius: 24px 24px 0 0; background: linear-gradient(180deg, #1d3350 0%, #12233a 100%); box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.45); }
.scr-rekening-bank-2 .sheet-handle{ width: 40px; height: 4px; margin: 0 auto 10px; border-radius: 2px; background-color: #51657e; }
.scr-rekening-bank-2 .sheet-title{ margin: 0 0 2px; color: #ffffff; font-size: 15px; font-weight: 600; }
.scr-rekening-bank-2 .sheet-sub{ margin: 0 0 14px; color: #8597ab; font-size: 12px; }
.scr-rekening-bank-2 .sheet-error{ margin: 0 0 10px; color: #f2667a; font-size: 12px; line-height: 18px; }
.scr-rekening-bank-2 .sheet-action{ width: 100%; height: 44px; margin-bottom: 8px; border: none; border-radius: 12px; background-color: #1f3048; color: #c3cedb; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.scr-rekening-bank-2 .sheet-action.is-primary{ background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%); color: #0c1a2d; }
.scr-rekening-bank-2 .sheet-action.ghost{ margin-bottom: 0; background-color: transparent; color: #8597ab; }
.scr-rekening-bank-2 .sheet-action:active{ opacity: 0.8; }
.scr-rekening-bank-2 .sheet-action:disabled{ opacity: 0.45; cursor: default; }
/* figma re-sync */
.scr-rekening-bank-2 .page-title.page-title { font-size: 17px; }
.scr-rekening-bank-2 .page-title.page-title { font-weight: 700; }
.scr-rekening-bank-2 .info-text.info-text { font-size: 12px; }
.scr-rekening-bank-2 .info-text.info-text { line-height: 18px; }
.scr-rekening-bank-2 .bank-name.bank-name { font-size: 14px; }
.scr-rekening-bank-2 .account-name.account-name { font-size: 12px; }
.scr-rekening-bank-2 .detail-label.detail-label { font-size: 11px; }
.scr-rekening-bank-2 .limit-text.limit-text { font-size: 11px; }
.scr-rekening-bank-2 .notes-title.notes-title { font-size: 12px; }
`;

// the frame shows masked values, so the full numbers never hit the screen
const maskName = (value) => {
  const text = String(value || '');
  return text.length > 4 ? `${text.slice(0, 2)}****${text.slice(-2)}` : text;
};

// the frame shows masked values, so the full numbers never hit the screen;
// even a short number still leaks too much, so it keeps only its last two digits
const maskAccount = (value) => {
  const text = String(value || '').replace(/\s/g, '');
  if (text.length <= 4) return '*'.repeat(text.length);
  if (text.length <= 8) return `${'*'.repeat(text.length - 2)}${text.slice(-2)}`;
  return `${text.slice(0, 4)} **** ${text.slice(-4)}`;
};

// the frame's spec caps the list at five; the add button disappears once full
const MAX_ACCOUNTS = 5;

export default function RekeningBank2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [banks, setBanks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  // the add form hands the success over so the list can confirm it, but the
  // history entry is rewritten right away so a reload does not repeat it
  const [justAdded] = useState(() => Boolean(location.state?.added));
  // the three-dot button opens a sheet for the account it belongs to; the API
  // only lets one account hold the default flag, so the rest is local bookkeeping
  const [menuFor, setMenuFor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [menuError, setMenuError] = useState('');
  const [notice, setNotice] = useState('');

  const openMenu = (account) => {
    setMenuError('');
    setMenuFor(account);
  };

  const markDefault = async () => {
    if (!menuFor) return;
    setSaving(true);
    setMenuError('');
    try {
      const res = await api.setDefaultBank(menuFor.id);
      if (!res.ok) {
        setMenuError(friendlyError(res.data, 'Gagal mengubah rekening utama.'));
        return;
      }
      setBanks((rows) => rows.map((row) => ({ ...row, is_default: row.id === menuFor.id })));
      setNotice('Rekening utama diperbarui.');
      setMenuFor(null);
    } catch {
      setMenuError('Gagal mengubah rekening utama.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (location.state?.added) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    let alive = true;
    api.userBanks()
      .then((res) => {
        if (!alive) return;
        if (!res.ok || !Array.isArray(res.data)) {
          setStatus('error');
          setError(friendlyError(res.data, 'Gagal memuat rekening.'));
          return;
        }
        setBanks(res.data);
        setStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        setStatus('error');
        setError('Gagal memuat rekening.');
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="scr-rekening-bank-2">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="back-btn" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/7861050aa5.svg" alt="" />
          </button>
          <h1 className="page-title">{t('Rekening Bank')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-info">
        <div className="info-container">
          <img src="/assets/img/161566930f.svg" alt="Info" className="info-icon" />
          <p className="info-text">{t('Rekening ini dipakai sebagai tujuan penarikan saldo kamu.')}</p>
        </div>
      </section>
      <section id="section-bank-cards">
        {justAdded && <p className="bank-notice">{t('Rekening berhasil ditambahkan.')}</p>}
        {!justAdded && notice && <p className="bank-notice">{t(notice)}</p>}
        <div className="cards-container">
          
          {status === 'loading' && <p className="list-state">{t('Memuat rekening…')}</p>}
          {status === 'error' && <p className="list-state">{error}</p>}
          {status === 'ready' && banks.length === 0 && (
            <p className="list-state">{t('Belum ada rekening bank.')}</p>
          )}
          {banks.map((account) => (
            <div
              className={`bank-card ${account.is_default ? 'card-primary' : 'card-secondary'}`}
              key={account.id}
            >
              <div className="card-header">
                <div className="card-title-group">
                  <h2 className="bank-name">{account.bank_name}</h2>
                  {account.is_default && <span className="badge-utama">{t('Utama')}</span>}
                </div>
                <button
                  className="options-btn"
                  aria-label={`Opsi ${account.bank_name}`}
                  onClick={() => openMenu(account)}
                >
                  <img src="/assets/img/cc4633ea16.svg" alt="" />
                </button>
              </div>
              <p className="account-name">{maskName(account.account_name)}</p>
              <div className="card-divider"></div>
              <div className="account-details">
                <span className="detail-label">{t('Nomor rekening')}</span>
                <span className="detail-value">{maskAccount(account.account_number)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section id="section-add-account">
        <div className="add-container">
          {status === 'ready' && banks.length < MAX_ACCOUNTS && (
            <button className="add-account-btn" data-route="/profil/bank/3">
              <img src="/assets/img/c535cc438a.svg" alt="" />
              <span>{t('Tambah Rekening')}</span>
            </button>
          )}
          {status === 'ready' && (
            <p className="limit-text">
              {banks.length >= MAX_ACCOUNTS
                ? `Maksimal ${MAX_ACCOUNTS} rekening terdaftar`
                : `${banks.length} rekening terdaftar`}
            </p>
          )}
        </div>
      </section>
      <section id="section-notes">
        <div className="notes-container">
          <h3 className="notes-title">{t('Catatan')}</h3>
          <ul className="notes-list">
            <li>
              <div className="bullet"></div>
              <p>{t('Nama pemilik rekening harus sama dengan nama akun kamu.')}</p>
            </li>
            <li>
              <div className="bullet"></div>
              <p>{t('Penarikan hanya bisa dilakukan ke rekening yang sudah terdaftar.')}</p>
            </li>
            {/* <li>
              <div className="bullet"></div>
              <p>{t('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')}</p>
            </li> */}
          </ul>
        </div>
      </section>
      {menuFor && (
        <div
          className="account-sheet"
          onClick={() => {
            if (!saving) setMenuFor(null);
          }}
        >
          <div
            className="sheet-card"
            role="dialog"
            aria-modal="true"
            aria-label={`Opsi ${menuFor.bank_name}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <p className="sheet-title">{menuFor.bank_name}</p>
            <p className="sheet-sub">{maskAccount(menuFor.account_number)}</p>
            {menuError && <p className="sheet-error">{menuError}</p>}
            <button
              type="button"
              className="sheet-action is-primary"
              disabled={saving || menuFor.is_default}
              onClick={markDefault}
            >
              {menuFor.is_default && t('Sudah menjadi rekening utama')}
              {!menuFor.is_default && !saving && t('Jadikan Rekening Utama')}
              {saving && t('Menyimpan…')}
            </button>
            <button
              type="button"
              className="sheet-action ghost"
              disabled={saving}
              onClick={() => setMenuFor(null)}
            >
              {t('Batal')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
