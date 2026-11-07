// profil-saya-1 — ported from the Figma export, typography re-synced to Figma
import { useEffect, useRef, useState } from 'react';
import ProfilEditForm from '../../components/ProfilEditForm.jsx';
import { api } from '../../lib/api.js';
import { mediaUrl } from '../../lib/media.js';
import { friendlyError, useAuth } from '../../lib/auth.jsx';
import { dateID, maskEmail, maskPhone } from '../../lib/format.js';
import { useInviteLink } from '../../lib/referral.js';
import { t } from '../../lib/i18n.js';

// the avatar upload accepts exactly what the API documents
const PHOTO_TYPES = ['image/jpeg', 'image/png'];
const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_KEY = 'pscryp.avatar';

const css = `
/* profil-saya-1 — ported from Figma export, typography re-synced */
.scr-profil-saya-1 { background: radial-gradient(55% 55% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), 
              linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-profil-saya-1{
  margin: 0 auto;
  max-width: 412px;
  min-height: 100cqh;
  background: radial-gradient(55% 55% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), 
              linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%);
  font-family: 'Inter', sans-serif;
  color: #ffffff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  overflow-x: hidden;
}
@media (min-width: 413px){.scr-profil-saya-1{
    min-height: 892px;
    height: 100cqh;
    max-height: 900px;
    margin-top: 2cqh;
    margin-bottom: 2cqh;
    border-radius: 24px;
    overflow-y: auto;
    box-shadow: 0 0 0 8px #1a222c, 0 20px 40px rgba(0,0,0,0.8);
  }
.scr-profil-saya-1 body::-webkit-scrollbar-thumb{
    background: rgba(255,255,255,0.2);
    border-radius: 3px;
  }}
.scr-profil-saya-1 *{
  box-sizing: border-box;
}
.scr-profil-saya-1 button{
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
}
.scr-profil-saya-1 h1,
.scr-profil-saya-1 h2,
.scr-profil-saya-1 h3,
.scr-profil-saya-1 p{
  margin: 0;
}
.scr-profil-saya-1 a{
  text-decoration: none;
  color: inherit;
}
.scr-profil-saya-1 #section-header{
    padding: 20px 16px 0;
  }
.scr-profil-saya-1 .app-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
.scr-profil-saya-1 .btn-back{
    width: 40px;
    height: 40px;
    background-color: #1f3048;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
  }
.scr-profil-saya-1 .btn-back:active{
    opacity: 0.7;
  }
.scr-profil-saya-1 .page-title{
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    text-align: center;
  }
.scr-profil-saya-1 .header-spacer{
    width: 40px; 
  }
.scr-profil-saya-1 #section-profile{
    padding: 24px 16px 0;
  }
.scr-profil-saya-1 .profile-container{
    display: flex;
    flex-direction: column;
    align-items: center;
  }
.scr-profil-saya-1 .avatar-wrapper{
    position: relative;
    width: 92px;
    height: 92px;
    margin-bottom: 10px;
  }
.scr-profil-saya-1 .avatar-img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background-color: #000; 
  }
.scr-profil-saya-1 .btn-edit-avatar{
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    border: 3px solid #13263d;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
.scr-profil-saya-1 .btn-change-text{
    color: #c9d4e1;
    font-size: 14px;
    font-weight: 400;
    padding: 4px 8px;
  }
.scr-profil-saya-1 .btn-edit-avatar:disabled,
.scr-profil-saya-1 .btn-change-text:disabled{
    opacity: 0.5;
    cursor: default;
  }
/* the hidden input only exists to hand the buttons a native file dialog */
.scr-profil-saya-1 .photo-input{
    display: none;
  }
.scr-profil-saya-1 .photo-feedback{
    margin-top: 8px;
    font-size: 11px;
    line-height: 1.4;
    text-align: center;
    color: #8597ab;
  }
.scr-profil-saya-1 .photo-feedback.success{ color: #3ecf8e; }
.scr-profil-saya-1 .photo-feedback.error{ color: #ff9d9d; }
.scr-profil-saya-1 #section-account-data{
    padding: 28px 16px 0;
  }
.scr-profil-saya-1 .section-title{
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 8px;
  }
.scr-profil-saya-1 .section-head{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }
.scr-profil-saya-1 .section-head .section-title{
    margin-bottom: 0;
  }
.scr-profil-saya-1 .btn-edit{
    color: #c9d4e1;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 0;
  }
.scr-profil-saya-1 .data-list{
    display: flex;
    flex-direction: column;
  }
.scr-profil-saya-1 .data-row{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid #1c2d44;
  }
.scr-profil-saya-1 .data-row.no-border{
    border-bottom: none;
  }
.scr-profil-saya-1 .data-row.link{
    cursor: pointer;
  }
.scr-profil-saya-1 .data-label{
    color: #8597ab;
    font-size: 14px;
    flex: 1;
  }
.scr-profil-saya-1 .data-value-wrapper{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex: 2;
  }
.scr-profil-saya-1 .data-value{
    color: #ffffff;
    font-size: 14px;
    text-align: right;
  }
.scr-profil-saya-1 .data-icon{
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
/* the copy icon is a button now, keeping the frame's 16px footprint */
.scr-profil-saya-1 .copy-link{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
  }
.scr-profil-saya-1 .copy-link:active{
    opacity: 0.7;
  }
.scr-profil-saya-1 .badge-rank{
    display: flex;
    align-items: center;
    gap: 4px;
    height: 22px;
    padding: 0 9px 0 7px;
    border-radius: 11px;
  }
.scr-profil-saya-1 .badge-rank.gold{
    background: linear-gradient(180deg, #ffe7a3 0%, #d9a93f 100%);
  }
.scr-profil-saya-1 .badge-rank span{
    color: #0c1a2d;
    font-size: 12px;
    font-weight: 700;
  }
.scr-profil-saya-1 #section-shipping-address{
    padding: 28px 16px 28px;
  }
.scr-profil-saya-1 .section-title{
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 4px;
  }
.scr-profil-saya-1 .section-description{
    color: #8597ab;
    font-size: 12px;
    line-height: 1.4;
    margin-bottom: 12px;
  }
.scr-profil-saya-1 .empty-state-card{
    border: 1px solid #3a5272;
    border-radius: 18px;
    padding: 22px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background-color: rgba(28, 45, 68, 0.2); 
  }
.scr-profil-saya-1 .empty-state-img{
    width: 80px;
    height: 104px;
    object-fit: contain;
    margin-bottom: 14px;
  }
.scr-profil-saya-1 .empty-state-title{
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 4px;
  }
.scr-profil-saya-1 .empty-state-desc{
    color: #8597ab;
    font-size: 12px;
    line-height: 1.5;
    margin-bottom: 14px;
    max-width: 260px;
  }
/* a saved address replaces the empty state once the list answers */
.scr-profil-saya-1 .address-card{
    border: 1px solid #3a5272;
    border-radius: 18px;
    padding: 16px;
    background-color: rgba(28, 45, 68, 0.2);
  }
.scr-profil-saya-1 .address-card + .address-card{
    margin-top: 10px;
  }
.scr-profil-saya-1 .address-top{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }
.scr-profil-saya-1 .address-name{
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
  }
.scr-profil-saya-1 .address-badge{
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    border-radius: 10px;
    background: linear-gradient(180deg, #ffe7a3 0%, #d9a93f 100%);
    color: #0c1a2d;
    font-size: 11px;
    font-weight: 700;
  }
.scr-profil-saya-1 .address-phone{
    color: #d3dce7;
    font-size: 12px;
    margin-bottom: 6px;
  }
.scr-profil-saya-1 .address-text{
    color: #8597ab;
    font-size: 12px;
    line-height: 1.5;
  }
.scr-profil-saya-1 .address-tag{
    display: inline-block;
    margin-right: 6px;
    padding: 1px 6px;
    border-radius: 6px;
    background: rgba(90, 130, 191, 0.25);
    color: #d3dce7;
    font-size: 11px;
    font-weight: 600;
  }
.scr-profil-saya-1 .address-actions{
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
.scr-profil-saya-1 .btn-ghost{
    height: 30px;
    padding: 0 14px;
    border-radius: 15px;
    border: 1px solid #3a5272;
    color: #d3dce7;
    font-size: 12px;
    font-weight: 600;
  }
.scr-profil-saya-1 .btn-ghost:active{
    opacity: 0.8;
  }
.scr-profil-saya-1 .retry-line{
    color: #8fb2e8;
    font-size: 12px;
    font-weight: 600;
    text-decoration: underline;
    padding: 4px 0;
  }
/* the card holds its size while the list is on its way */
.scr-profil-saya-1 .sk{
    display: block;
    border-radius: 5px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.16) 50%, rgba(255, 255, 255, 0.06) 100%);
    background-size: 220% 100%;
    animation: scr-profil-shimmer 1.3s ease-in-out infinite;
  }
@keyframes scr-profil-shimmer{
    0%{ background-position: 140% 0; }
    100%{ background-position: -140% 0; }
  }
@media (prefers-reduced-motion: reduce){
    .scr-profil-saya-1 .sk{
      animation: none;
      background: rgba(255, 255, 255, 0.1);
    }
  }
.scr-profil-saya-1 .btn-primary{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 36px;
    padding: 0 18px;
    border-radius: 18px;
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    transition: transform 0.1s, opacity 0.2s;
  }
.scr-profil-saya-1 .btn-primary:active{
    transform: scale(0.98);
    opacity: 0.9;
  }
.scr-profil-saya-1 .btn-primary span{
    color: #0c1a2d;
    font-size: 14px;
    font-weight: 700;
  }
/* figma re-sync */
.scr-profil-saya-1 .page-title.page-title { font-size: 17px; }
.scr-profil-saya-1 .btn-change-text.btn-change-text { font-size: 12px; }
.scr-profil-saya-1 .btn-change-text.btn-change-text { font-weight: 600; }
.scr-profil-saya-1 .section-title.section-title { font-size: 15px; }
.scr-profil-saya-1 .data-label.data-label { font-size: 13px; }
.scr-profil-saya-1 .data-value.data-value { font-size: 13px; }
.scr-profil-saya-1 .data-value.data-value { color: #8597AB; }
.scr-profil-saya-1 .empty-state-title.empty-state-title { font-weight: 600; }
`;

export default function ProfilSaya1() {
  // the whole object comes from /api/auth/account-info/, hydrated by AuthProvider
  const { user } = useAuth();
  // the host comes from /api/auth/settings/, so the copied link points at the
  // domain the API reports rather than whatever host this tab opened
  const referralLink = useInviteLink(user?.referral_code || '');
  // the edit state swaps the read-only rows for the PUT form
  const [editing, setEditing] = useState(false);
  // the rank row names the current rank, which only rank-status carries
  const [rankTitle, setRankTitle] = useState('');
  // the shipping addresses behind the empty state, read from the paginated list
  const [addresses, setAddresses] = useState([]);
  const [addressStatus, setAddressStatus] = useState('loading');
  const [addressAttempt, setAddressAttempt] = useState(0);

  // profile photo — POST /api/auth/profile-photo/ answers with the new avatar
  // URL, kept in local storage so the pick survives navigation
  const fileRef = useRef(null);
  const [avatar, setAvatar] = useState(
    () => localStorage.getItem(AVATAR_KEY) || '/assets/img/d27c34de05.png'
  );
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoMessage, setPhotoMessage] = useState({ kind: '', text: '' });

  const openPhotoPicker = () => {
    if (photoBusy) return;
    setPhotoMessage({ kind: '', text: '' });
    fileRef.current?.click();
  };

  const pickAvatar = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || photoBusy) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      setPhotoMessage({ kind: 'error', text: 'Format foto tidak didukung. Pakai JPG, JPEG, atau PNG.' });
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setPhotoMessage({ kind: 'error', text: 'Ukuran foto maksimal 2MB.' });
      return;
    }
    const form = new FormData();
    form.append('avatar', file);
    setPhotoBusy(true);
    api.uploadProfilePhoto(form)
      .then((res) => {
        if (!res.ok) {
          setPhotoMessage({ kind: 'error', text: friendlyError(res.data, 'Gagal mengupload foto profil.') });
          return;
        }
        const url = res.data?.avatar;
        if (url) {
          setAvatar(url);
          localStorage.setItem(AVATAR_KEY, url);
        }
        setPhotoMessage({ kind: 'success', text: res.data?.message || 'Foto profil berhasil diupload.' });
      })
      .catch(() => setPhotoMessage({ kind: 'error', text: 'Gagal mengupload foto profil.' }))
      .finally(() => setPhotoBusy(false));
  };

  useEffect(() => {
    let alive = true;
    setAddressStatus('loading');
    api.addresses()
      .then((res) => {
        if (!alive) return;
        if (!res.ok) {
          setAddressStatus('error');
          return;
        }
        const rows = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];
        setAddresses(rows);
        setAddressStatus('ready');
      })
      .catch(() => {
        if (alive) setAddressStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [addressAttempt]);

  useEffect(() => {
    let alive = true;
    api.rankStatus()
      .then((res) => {
        if (alive && res.ok) setRankTitle(res.data?.current_title || '');
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div className="scr-profil-saya-1">
      <style>{css}</style>
      <section id="section-header">
        <header className="app-header">
          <button className="btn-back" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/e4afe024ef.svg" alt="" />
          </button>
          <h1 className="page-title">{t('Profil Saya')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-profile">
        <div className="profile-container">
          <div className="avatar-wrapper">
            <img src={mediaUrl(avatar)} alt="User Avatar" className="avatar-img" />
            <button
              type="button"
              className="btn-edit-avatar"
              aria-label={t('Edit profile picture')}
              onClick={openPhotoPicker}
              disabled={photoBusy}
            >
              <img src="/assets/img/46c0acace0.svg" alt="" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="photo-input"
              onChange={pickAvatar}
            />
          </div>
          <button type="button" className="btn-change-text" onClick={openPhotoPicker} disabled={photoBusy}>
            {t('Ubah foto profil')}
          </button>
          {photoMessage.text && (
            <p className={`photo-feedback ${photoMessage.kind}`}>{photoMessage.text}</p>
          )}
        </div>
      </section>
      <section id="section-account-data">
        <div className="section-head">
          <h2 className="section-title">{t('Data Akun')}</h2>
          {!editing && (
            <button
           
            >
              
            </button>
          )}
        </div>

        {editing ? (
          <ProfilEditForm onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />
        ) : (
        <div className="data-list">
          
          <div className="data-row">
            <span className="data-label">{t('Username')}</span>
            <div className="data-value-wrapper">
              <span className="data-value">{user?.username || user?.full_name || '—'}</span>
              <img src="/assets/img/2faab1d55e.svg" alt="Lock" className="data-icon" />
            </div>
          </div>
          
          
          <div className="data-row">
            <span className="data-label">{t('ID Pengguna')}</span>
            <div className="data-value-wrapper">
              <span className="data-value">{user?.referral_code || '—'}</span>
              {/* the code is what the frame prints, the invite link is what gets shared */}
              <button
                type="button"
                className="copy-link"
                aria-label={t('Salin link referral')}
                data-copy={referralLink || undefined}
              >
                <img src="/assets/img/1edf6f972a.svg" alt="" className="data-icon" />
              </button>
            </div>
          </div>
          
          
          <div className="data-row">
            <span className="data-label">{t('Nomor HP')}</span>
            <div className="data-value-wrapper">
              <span className="data-value">{maskPhone(user?.phone)}</span>
        
            </div>
          </div>
          
          
          <div className="data-row">
            <span className="data-label">{t('Email')}</span>
            <div className="data-value-wrapper">
              <span className="data-value">{maskEmail(user?.email)}</span>

            </div>
          </div>
          
          
          <div className="data-row link" role="button" aria-label={t('Buka menu rank')} data-route="/rank">
            <span className="data-label">{t('Rank')}</span>
            <div className="data-value-wrapper">
              <div className="badge-rank gold">
                <img src="/assets/img/6465a054f3.svg" alt="Crown" />
                <span>{rankTitle || '—'}</span>
              </div>
              <img src="/assets/img/8602b31a6d.svg" alt="Arrow Right" className="data-icon" />
            </div>
          </div>
          
          
          <div className="data-row no-border">
            <span className="data-label">{t('Bergabung sejak')}</span>
            <div className="data-value-wrapper">
              <span className="data-value">{user?.created_at ? dateID(user.created_at) : '—'}</span>
            </div>
          </div>
        </div>
        )}
      </section>
      <section id="section-shipping-address">
        <h2 className="section-title">{t('Alamat Pengiriman')}</h2>
        <p className="section-description">{t('Dipakai untuk mengirim hadiah barang dari Roda Keberuntungan dan program lainnya.')}</p>

        {addressStatus === 'loading' && (
          <div className="address-card" aria-hidden="true">
            <span className="sk" style={{ width: '42%', height: 12 }}></span>
            <span className="sk" style={{ width: '30%', height: 10, marginTop: 10 }}></span>
            <span className="sk" style={{ width: '88%', height: 10, marginTop: 10 }}></span>
            <span className="sk" style={{ width: '62%', height: 10, marginTop: 6 }}></span>
          </div>
        )}

        {addressStatus === 'error' && (
          <button type="button" className="retry-line" onClick={() => setAddressAttempt((n) => n + 1)}>
            {t('Gagal memuat alamat, coba lagi')}
          </button>
        )}

        {addressStatus === 'ready' && addresses.length === 0 && (
          <div className="empty-state-card">
            <img src="/assets/img/933eee66d5.png" alt="Empty Box" className="empty-state-img" />
            <h3 className="empty-state-title">{t('Belum ada alamat pengiriman')}</h3>
            <p className="empty-state-desc">{t('Tambahkan alamat agar hadiah barang yang kamu menangkan bisa langsung dikirim.')}</p>

            <button className="btn-primary" data-route="/profil/alamat">
              <img src="/assets/img/c54fed7db0.svg" alt="Plus Icon" />
              <span>{t('Tambah Alamat')}</span>
            </button>
          </div>
        )}

        {addressStatus === 'ready' &&
          addresses
            .slice()
            // the primary address is the one gifts ship to, so it reads first
            .sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)))
            .map((row) => {
              // the form writes the label into the block as "[Rumah], …"; the
              // courier note is the courier's, not part of the summary
              const label = /^\[([^\]]+)\]/.exec(row.address_details || '')?.[1] || '';
              const text = (row.address_details || '')
                .replace(/^\[[^\]]+\],?\s*/, '')
                .replace(/,\s*Catatan:.*$/, '');
              return (
                <div className="address-card" key={row.id}>
                  <div className="address-top">
                    <span className="address-name">{row.recipient_name || 'Penerima'}</span>
                    {row.is_primary ? <span className="address-badge">{t('Utama')}</span> : null}
                  </div>
                  {row.phone_number ? <p className="address-phone">{row.phone_number}</p> : null}
                  <p className="address-text">
                    {label ? <span className="address-tag">{label}</span> : null}
                    {label ? ' ' : null}
                    {text || '—'}
                  </p>
                  <div className="address-actions">
                    {/* the form edits whichever record this card stands for */}
                    <button className="btn-ghost" data-route={`/profil/alamat?id=${row.id}`}>
                      {t('Ubah alamat')}
                    </button>
                  </div>
                </div>
              );
            })}
      </section>
    </div>
  );
}
