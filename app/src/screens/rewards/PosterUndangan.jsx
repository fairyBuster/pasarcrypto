// poster-undangan — ported from the Figma export, typography re-synced to Figma
import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { useAuth } from '../../lib/auth.jsx';
import { copyText } from '../../lib/clipboard.js';
import { inviteLink } from '../../lib/referral.js';
import { t } from '../../lib/i18n.js';
const css = `
/* poster-undangan — ported from Figma export, typography re-synced */
.scr-poster-undangan section{
  width: 100%;
  box-sizing: border-box;
  padding: 0 24px;
}
.scr-poster-undangan h1,
.scr-poster-undangan h2,
.scr-poster-undangan h3,
.scr-poster-undangan p{
  margin: 0;
}
.scr-poster-undangan button{
  font-family: inherit;
  border: none;
  cursor: pointer;
  padding: 0;
  background: none;
}
.scr-poster-undangan .header{
    text-align: center;
    padding: 40px 0 24px 0;
  }
.scr-poster-undangan .header h1{
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }
.scr-poster-undangan .invite-card{
    background: radial-gradient(circle at top right, rgba(120, 150, 190, 0.45) 0%, transparent 60%), 
                linear-gradient(145deg, #2c4c80 0%, #1a3150 50%, #0f1f35 100%);
    border: 1px solid rgba(201, 212, 225, 0.25);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    box-sizing: border-box;
  }
.scr-poster-undangan .card-content{
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
.scr-poster-undangan .card-logo{
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin-bottom: 4px;
  }
.scr-poster-undangan .card-title{
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    color: #ffffff;
  }
.scr-poster-undangan .card-subtitle{
    font-size: 12px;
    line-height: 1.5;
    color: #a9b7c8;
  }
.scr-poster-undangan .card-image-wrapper{
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 12px;
  }
.scr-poster-undangan .card-image{
    width: 100%;
    max-width: 212px;
    height: auto;
    object-fit: contain;
  }
.scr-poster-undangan .card-footer{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px dashed rgba(201, 212, 225, 0.25);
  }
.scr-poster-undangan .invite-info{
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
.scr-poster-undangan .info-label{
    font-size: 10px;
    color: #a9b7c8;
  }
.scr-poster-undangan .info-code{
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 1px;
  }
.scr-poster-undangan .info-instruction{
    font-size: 10px;
    color: #8597ab;
  }
.scr-poster-undangan .qr-container{
    background-color: #f5f8fb;
    border-radius: 10px;
    width: 72px;
    height: 72px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }
.scr-poster-undangan .qr-box{
    width: 60px;
    height: 60px;
    border: 1px dashed #8597ab;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
.scr-poster-undangan .qr-text{
    font-size: 11px;
    font-weight: 600;
    color: #51657e;
  }
/* the generated QR fills the box the frame reserved for it */
.scr-poster-undangan .qr-svg{
    display: block;
    width: 60px;
    height: 60px;
  }
.scr-poster-undangan #section-actions{
    margin-top: 24px;
  }
.scr-poster-undangan .actions-container{
    display: flex;
    gap: 10px;
    width: 100%;
  }
.scr-poster-undangan .btn{
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    height: 44px;
    border-radius: 22px;
    font-size: 14px;
    font-weight: 600;
    transition: opacity 0.2s ease;
  }
.scr-poster-undangan .btn:active{
    opacity: 0.8;
  }
.scr-poster-undangan .btn:disabled{
    opacity: 0.5;
    cursor: default;
  }
.scr-poster-undangan .btn-icon{
    width: 16px;
    height: 16px;
  }
.scr-poster-undangan .btn-save{
    background-color: #1f3048;
    color: #e6ecf3;
  }
.scr-poster-undangan .btn-share{
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
  }
.scr-poster-undangan #section-footer{
    margin-top: 24px;
    margin-bottom: 40px;
  }
.scr-poster-undangan .footer{
    text-align: center;
    width: 100%;
  }
.scr-poster-undangan .btn-close{
    color: #a9b7c8;
    font-size: 14px;
    font-weight: 500;
    padding: 8px 16px;
    transition: color 0.2s ease;
  }
.scr-poster-undangan .btn-close:active{
    color: #ffffff;
  }
/* figma re-sync */
.scr-poster-undangan .info-code.info-code { font-size: 18px; }
.scr-poster-undangan .qr-text.qr-text { font-size: 9px; }
.scr-poster-undangan .btn-close.btn-close { font-size: 13px; }
.scr-poster-undangan .btn-close.btn-close { font-weight: 600; }
.scr-poster-undangan .btn-close.btn-close { color: #A9B7C8; }
`;

export default function PosterUndangan() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  // the card, not the whole screen, is what gets saved
  const cardRef = useRef(null);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const code = user?.referral_code || '';
  const link = inviteLink(code);

  const share = async (event) => {
    event.stopPropagation();
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Undangan PasarCrypto',
          text: `Ayo gabung PasarCrypto dengan kode ${code} dan mulai trading bersama.`,
          url: link,
        });
        return;
      } catch {
        // dismissed or blocked, the clipboard below is still a usable outcome
      }
    }
    // a desktop browser has no share sheet, so the link goes to the clipboard
    if (await copyText(link)) setCopied(true);
  };

  const save = async (event) => {
    event.stopPropagation();
    const node = cardRef.current;
    if (!node || saving) return;
    setSaving(true);
    try {
      // 3x keeps the saved poster sharp when it is opened on a phone
      const dataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true });
      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.download = `poster-undangan-${code || 'pscryp'}.png`;
      anchor.click();
    } catch {
      // capture can fail when the browser refuses canvas access
    }
    setSaving(false);
  };

  return (
    <div className="scr-poster-undangan">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <h1>{t('Poster Undangan')}</h1>
        </header>
      </section>
      <section id="section-card">
        <div className="invite-card" ref={cardRef}>
          <div className="card-content">
            <img src="/assets/img/baa3015660.png" alt="PasarCrypto Logo" className="card-logo" />
            <h2 className="card-title">{t('Ajak teman,')}<br />{t('dapat bonus poin')}</h2>
            <p className="card-subtitle">{t('Daftar pakai kode di bawah dan mulai')}<br />{t('trading kripto bersama.')}</p>
            <div className="card-image-wrapper">
              <img src="/assets/img/ceb657af0b.png" alt="Crypto Coins" className="card-image" />
            </div>
          </div>
          <div className="card-footer">
            <div className="invite-info">
              <span className="info-label">{t('Kode undangan')}</span>
              <span className="info-code">{code || '—'}</span>
              <span className="info-instruction">{t('Pindai QR untuk daftar')}</span>
            </div>
            <div className="qr-container">
              {link ? (
                // the poster's QR opens the same invitation link the share button uses
                <QRCodeSVG
                  value={link}
                  size={60}
                  bgColor="#f5f8fb"
                  fgColor="#0c1a2d"
                  level="M"
                  title={t('Kode QR undangan')}
                  className="qr-svg"
                />
              ) : (
                <div className="qr-box">
                  <span className="qr-text">{t('QR')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section id="section-actions">
        <div className="actions-container">
          <button className="btn btn-save" onClick={save} disabled={saving}>
            <img src="/assets/img/0fb2a15cbe.svg" alt="Save Icon" className="btn-icon" />
            <span>{saving ? 'Menyimpan…' : 'Simpan'}</span>
          </button>
          <button className="btn btn-share" onClick={share} disabled={!link}>
            <img src="/assets/img/7e7ab09e86.svg" alt="Share Icon" className="btn-icon" />
            <span>{copied ? 'Link Tersalin' : 'Ajak Teman'}</span>
          </button>
        </div>
      </section>
      <section id="section-footer">
        <footer className="footer">
          <button className="btn-close" data-back="1">{t('Tutup')}</button>
        </footer>
      </section>
    </div>
  );
}
