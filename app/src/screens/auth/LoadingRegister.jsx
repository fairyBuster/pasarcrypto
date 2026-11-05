import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx';
import { t } from '../../lib/i18n.js';
// loading-register — ported from the Figma export, typography re-synced to Figma
const css = `
/* loading-register — ported from Figma export, typography re-synced */
.scr-loading-register *{
  box-sizing: border-box;
}
.scr-loading-register #section-loading{
    width: 100%;
    display: flex;
    justify-content: center;
  }
.scr-loading-register .app-container{
    width: 100%;
    max-width: 412px;
    min-height: 100cqh;
    
    background: 
      radial-gradient(circle at 60% 0%, rgba(44, 72, 104, 0.45) 0%, rgba(44, 72, 104, 0) 60%),
      radial-gradient(circle at 69% 100%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 60%),
      linear-gradient(180deg, #0c1a2d 0%, #13263d 38%, #0f2036 70%, #0a1626 100%);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
.scr-loading-register .top-spacer{
    flex: 1;
    min-height: 50cqh;
  }
.scr-loading-register .bottom-content-wrapper{
    padding: 0 12px 12px 12px;
    display: flex;
    flex-direction: column;
  }
.scr-loading-register .status-card{
    background-color: rgba(255, 255, 255, 0.07);
    border-radius: 28px;
    padding: 28px 24px 24px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
.scr-loading-register .loading-indicator{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
  }
.scr-loading-register .dot{
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    animation: scr-loading-dot 1.2s ease-in-out infinite;
  }
/* the design freezes one frame of this wave: each dot lifts in turn and fades back */
@keyframes scr-loading-dot{
    0%, 80%, 100%{
      transform: translateY(0) scale(0.9);
      opacity: 0.45;
    }
    40%{
      transform: translateY(-6px) scale(1);
      opacity: 1;
    }
  }
.scr-loading-register .dot-primary{
    animation-delay: 0s;
  }
.scr-loading-register .dot-secondary{
    animation-delay: 0.16s;
  }
.scr-loading-register .dot-tertiary{
    animation-delay: 0.32s;
  }
@media (prefers-reduced-motion: reduce){
    .scr-loading-register .dot{
      animation: none;
    }
.scr-loading-register .dot-primary{
      opacity: 1;
    }
.scr-loading-register .dot-secondary{
      opacity: 0.7;
    }
.scr-loading-register .dot-tertiary{
      opacity: 0.4;
    }
  }
.scr-loading-register .text-content{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
.scr-loading-register .title{
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    text-align: center;
    line-height: 1.4;
  }
.scr-loading-register .subtitle{
    color: #a9b7c8;
    font-size: 14px;
    font-weight: 400;
    margin: 0;
    text-align: center;
    line-height: 1.5;
  }
.scr-loading-register .info-alert{
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 12px 14px;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    margin-top: 8px;
  }
.scr-loading-register .info-icon-wrapper{
    display: flex;
    flex-direction: column;
    padding-top: 1px;
    width: 16px;
    flex-shrink: 0;
  }
.scr-loading-register .info-icon{
    width: 100%;
    height: auto;
    display: block;
  }
.scr-loading-register .info-text-wrapper{
    display: flex;
    flex-direction: column;
    flex: 1;
  }
.scr-loading-register .info-text{
    color: #8597ab;
    font-size: 12px;
    font-weight: 400;
    margin: 0;
    line-height: 1.5;
  }
@media (max-width: 360px){.scr-loading-register .status-card{
      padding: 24px 16px 20px 16px;
    }
.scr-loading-register .title{
      font-size: 16px;
    }
.scr-loading-register .subtitle{
      font-size: 13px;
    }}
/* figma re-sync */
.scr-loading-register .title.title { font-size: 20px; }
.scr-loading-register .title.title { font-weight: 700; }
.scr-loading-register .title.title { line-height: 28px; }
`;

export default function LoadingRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authed } = useAuth();
  // step 2 hands the new email over so the login form can prefill it
  const email = location.state?.email || '';

  // the account already exists by the time this screen shows — the pause is the
  // transition. an open session goes straight in, a fresh sign-up has to sign in
  // and lands on login with the reason for the hand-off
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authed) {
        navigate('/home', { replace: true });
        return;
      }
      navigate('/login', { replace: true, state: { registered: true, email } });
    }, 2200);
    return () => clearTimeout(timer);
  }, [authed, email, navigate]);

  return (
    <div className="scr-loading-register">
      <style>{css}</style>
      <section id="section-loading">
        <div className="app-container">
          <div className="top-spacer"></div>
          <div className="bottom-content-wrapper">
            <div className="status-card">
              <div className="loading-indicator">
                <div className="dot dot-primary"></div>
                <div className="dot dot-secondary"></div>
                <div className="dot dot-tertiary"></div>
              </div>
              
              <div className="text-content">
                <h1 className="title">{t('Sedang Memproses')}</h1>
                <p className="subtitle">{t('Pendaftaranmu sedang kami proses,')}<br />{t('mohon tunggu sebentar ya.')}</p>
              </div>
      
              <div className="info-alert">
                <div className="info-icon-wrapper">
                  <img src="/assets/img/e61ad2d5d6.svg" alt="Information" className="info-icon" />
                </div>
                <div className="info-text-wrapper">
                  <p className="info-text">{t('Proses ini hanya butuh beberapa detik. Jangan tutup aplikasi, berpindah ke aplikasi lain, atau kembali ke halaman sebelumnya sampai proses selesai.')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
