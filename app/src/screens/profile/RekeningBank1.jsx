// rekening-bank-1 — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { t } from '../../lib/i18n.js';

const css = `
/* rekening-bank-1 — ported from Figma export, typography re-synced */
.scr-rekening-bank-1 section{
  width: 100%;
  max-width: 412px;
  box-sizing: border-box;
}
.scr-rekening-bank-1 *{
  box-sizing: border-box;
}
.scr-rekening-bank-1 #section-header{
  padding: 20px 16px 0;
}
.scr-rekening-bank-1 .header{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.scr-rekening-bank-1 .back-btn{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #1f3048;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s ease;
}
.scr-rekening-bank-1 .back-btn:hover{
  background-color: #2a405f;
}
.scr-rekening-bank-1 .page-title{
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
  text-align: center;
}
.scr-rekening-bank-1 .header-spacer{
  width: 40px;
}
.scr-rekening-bank-1 #section-empty-state{
  padding: 28px 16px 0;
}
.scr-rekening-bank-1 .empty-state-card{
  border: 1px solid #3a5272;
  border-radius: 18px;
  padding: 26px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: transparent;
}
.scr-rekening-bank-1 .empty-state-img{
  width: 80px;
  height: 104px;
  object-fit: contain;
  margin-bottom: 14px;
}
.scr-rekening-bank-1 .empty-state-title{
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #ffffff;
}
.scr-rekening-bank-1 .empty-state-desc{
  font-size: 14px;
  color: #8597ab;
  margin: 0 0 16px 0;
  line-height: 1.4;
}
.scr-rekening-bank-1 .add-account-btn{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 20px;
  border-radius: 19px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #0c1a2d;
  font-family: 'Inter', sans-serif;
  transition: opacity 0.2s ease;
}
.scr-rekening-bank-1 .add-account-btn:hover{
  opacity: 0.9;
}
.scr-rekening-bank-1 #section-notes{
  padding: 26px 16px 28px;
}
.scr-rekening-bank-1 .notes-container{
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scr-rekening-bank-1 .notes-title{
  font-size: 14px;
  font-weight: 600;
  color: #a9b7c8;
  margin: 0;
}
.scr-rekening-bank-1 .notes-list{
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scr-rekening-bank-1 .note-item{
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.scr-rekening-bank-1 .bullet{
  width: 6px;
  height: 6px;
  background-color: #51657e;
  border-radius: 3px;
  margin-top: 6px;
  flex-shrink: 0;
}
.scr-rekening-bank-1 .note-item p{
  margin: 0;
  font-size: 12px;
  color: #75879c;
  line-height: 1.5;
}
/* the frame is the empty variant; the API decides whether it is the right one */
.scr-rekening-bank-1 .list-state{ padding: 12px 0; text-align: center; font-size: 12px; line-height: 18px; color: #75879c; }
/* figma re-sync */
.scr-rekening-bank-1 .page-title.page-title { font-size: 17px; }
.scr-rekening-bank-1 .page-title.page-title { font-weight: 700; }
.scr-rekening-bank-1 .empty-state-title.empty-state-title { font-size: 15px; }
.scr-rekening-bank-1 .notes-title.notes-title { font-size: 12px; }
`;

export default function RekeningBank1() {
  const [count, setCount] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api.userBanks()
      .then((res) => {
        if (!alive) return;
        if (!res.ok || !Array.isArray(res.data)) {
          setError(friendlyError(res.data, 'Gagal memuat rekening.'));
          return;
        }
        setCount(res.data.length);
      })
      .catch(() => {
        if (!alive) return;
        setError('Gagal memuat rekening.');
      });
    return () => {
      alive = false;
    };
  }, []);

  // the Akun row lands on this frame; accounts that already have one go to the list
  if (count > 0) return <Navigate to="/dompet/2" replace />;

  return (
    <div className="scr-rekening-bank-1">
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
      <section id="section-empty-state">
        {count === null && !error && <p className="list-state">{t('Memuat rekening…')}</p>}
        {error && <p className="list-state">{error}</p>}
        {count === 0 && (
          <div className="empty-state-card">
            <img src="/assets/img/933eee66d5.png" alt="3D Ethereum Logo" className="empty-state-img" />
            <h2 className="empty-state-title">{t('Belum ada rekening bank')}</h2>
            <p className="empty-state-desc">{t('Tambahkan rekening bank untuk bisa')}<br />{t('menarik saldo ke rekeningmu.')}</p>
            <button className="add-account-btn" data-route="/dompet/3">
              <img src="/assets/img/27f59345a9.svg" alt="" />
              <span>{t('Tambah Rekening')}</span>
            </button>
          </div>
        )}
      </section>
      <section id="section-notes">
        <div className="notes-container">
          <h3 className="notes-title">{t('Catatan')}</h3>
          <ul className="notes-list">
            <li className="note-item">
              <div className="bullet"></div>
              <p>{t('Nama pemilik rekening harus sama dengan nama akun kamu.')}</p>
            </li>
            <li className="note-item">
              <div className="bullet"></div>
              <p>{t('Penarikan hanya bisa dilakukan ke rekening yang sudah terdaftar.')}</p>
            </li>
           
          </ul>
        </div>
      </section>
    </div>
  );
}
