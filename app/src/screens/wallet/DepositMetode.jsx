import { t } from '../../lib/i18n.js';
// deposit-metode — ported from the Figma export, typography re-synced to Figma
const css = `
/* deposit-metode — ported from Figma export, typography re-synced */
.scr-deposit-metode { background: radial-gradient(100% 100% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-deposit-metode{
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    width: 100%;
    min-height: 100cqh;
    background: radial-gradient(100% 100% at 50% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding-bottom: 24px;
}
.scr-deposit-metode h1,
.scr-deposit-metode h2,
.scr-deposit-metode h3,
.scr-deposit-metode p,
.scr-deposit-metode span{
    margin: 0;
    color: #ffffff;
}
.scr-deposit-metode a{
    text-decoration: none;
}
.scr-deposit-metode *{
    box-sizing: border-box;
}
.scr-deposit-metode .header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px 0 16px;
    height: 60px;
}
.scr-deposit-metode .back-btn{
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
}
.scr-deposit-metode .back-btn img{
    width: 20px;
    height: 20px;
}
.scr-deposit-metode .page-title{
    font-size: 16px;
    font-weight: 600;
}
.scr-deposit-metode .header-spacer{
    width: 40px;
    height: 40px;
}
.scr-deposit-metode .history-container{
    padding: 18px 16px 0 16px;
}
.scr-deposit-metode .history-btn{
    display: flex;
    align-items: center;
    background-color: #16263c;
    border-radius: 16px;
    padding: 14px;
    gap: 12px;
    transition: background-color 0.2s ease;
}
.scr-deposit-metode .history-btn:active{
    background-color: #1a2d47;
}
.scr-deposit-metode .history-icon{
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background-color: #24364e;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.scr-deposit-metode .history-icon img{
    width: 18px;
    height: 18px;
}
.scr-deposit-metode .history-text{
    flex: 1;
    font-size: 14px;
    font-weight: 500;
}
.scr-deposit-metode .arrow-icon{
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}
.scr-deposit-metode .method-group{
    display: flex;
    flex-direction: column;
}
.scr-deposit-metode .section-title{
    font-size: 14px;
    font-weight: 600;
    padding: 24px 16px 10px 16px;
}
.scr-deposit-metode .list-container{
    padding: 0 16px;
}
.scr-deposit-metode .list-item{
    display: flex;
    align-items: center;
    background: linear-gradient(180deg, #1c2e46 0%, #16273d 100%);
    border-radius: 18px;
    padding: 14px;
    gap: 12px;
    transition: filter 0.2s ease;
}
.scr-deposit-metode .list-item:active{
    filter: brightness(1.2);
}
.scr-deposit-metode .provider-logo{
    object-fit: contain;
    flex-shrink: 0;
}
.scr-deposit-metode .qris-logo{
    width: 61px;
    height: 28px;
}
.scr-deposit-metode .bri-logo{
    width: 35px;
    height: 34px;
    border-radius: 4px;
}
.scr-deposit-metode .provider-name{
    flex: 1;
    font-size: 14px;
    font-weight: 500;
}
.scr-deposit-metode .badge{
    background-color: rgba(90, 130, 191, 0.22);
    border-radius: 12px;
    padding: 4px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.scr-deposit-metode .badge span{
    color: #9fc0ec;
    font-size: 12px;
    font-weight: 500;
}
.scr-deposit-metode .security-container{
    padding: 16px 16px 0 16px;
}
.scr-deposit-metode .security-banner{
    background: linear-gradient(135deg, #1d3656 0%, #162a44 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    padding: 16px 16px 16px 100px;
    position: relative;
    min-height: 91px;
    margin-top: 6px;
}
.scr-deposit-metode .security-img{
    width: 74px;
    height: 97px;
    position: absolute;
    left: 16px;
    bottom: 0;
    object-fit: contain;
    z-index: 1;
}
.scr-deposit-metode .security-text{
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    z-index: 2;
}
.scr-deposit-metode .security-text h3{
    font-size: 12px;
    font-weight: 600;
}
.scr-deposit-metode .security-text p{
    font-size: 10px;
    color: #a9b7c8;
    line-height: 1.4;
}
/* figma re-sync */
.scr-deposit-metode .page-title.page-title { font-size: 17px; }
.scr-deposit-metode .page-title.page-title { font-weight: 700; }
.scr-deposit-metode .section-title.section-title { font-size: 15px; }
.scr-deposit-metode .section-title.section-title { font-weight: 700; }
.scr-deposit-metode .provider-name.provider-name { font-size: 15px; }
.scr-deposit-metode .provider-name.provider-name { font-weight: 700; }
`;

export default function DepositMetode() {
  return (
    <div className="scr-deposit-metode">
      <style>{css}</style>
      <section id="section-header">
          <header className="header">
              <button className="back-btn" aria-label={t('Go back')} data-back="1">
                  <img src="/assets/img/d182388bc6.svg" alt="" />
              </button>
              <h1 className="page-title">{t('Setor IDR')}</h1>
              <div className="header-spacer"></div>
          </header>
      </section>
      <section id="section-history">
          <div className="history-container">
              <a href="#" className="history-btn" data-route="/riwayat/deposit">
                  <div className="history-icon">
                      <img src="/assets/img/ee43abaf76.svg" alt="" />
                  </div>
                  <span className="history-text">{t('Riwayat Pembayaran')}</span>
                  <img src="/assets/img/c252a02177.svg" alt="" className="arrow-icon" />
              </a>
          </div>
      </section>
      <section id="section-payment-methods">
          <div className="method-group">
              <h2 className="section-title">{t('QRIS')}</h2>
              <div className="list-container">
                  <a href="#" className="list-item" data-route="/deposit/qris">
                      <img src="/assets/img/d37fb3edfd.png" alt="QRIS" className="provider-logo qris-logo" />
                      <span className="provider-name">{t('QRIS')}</span>
                      <div className="badge">
                          <span>{t('Instan')}</span>
                      </div>
                      <img src="/assets/img/c252a02177.svg" alt="" className="arrow-icon" />
                  </a>
              </div>
          </div>
      
          <div className="method-group">
              <h2 className="section-title">{t('Virtual Account')}</h2>
              <div className="list-container">
                  <a href="#" className="list-item" data-route="/deposit/va">
                      <img src="/assets/img/90ed915a6a.png" alt="BRI" className="provider-logo bri-logo" />
                      <span className="provider-name">{t('BRI')}</span>
                      <div className="badge">
                          <span>{t('Instan')}</span>
                      </div>
                      <img src="/assets/img/c252a02177.svg" alt="" className="arrow-icon" />
                  </a>
              </div>
          </div>
      </section>
      <section id="section-security">
          <div className="security-container">
              <div className="security-banner">
                  <img src="/assets/img/9e084c1e66.png" alt="" className="security-img" />
                  <div className="security-text">
                      <h3>{t('Pembayaran aman & terlindungi')}</h3>
                      <p>{t('Diproses oleh mitra pembayaran pihak ketiga resmi. Data dan transaksimu terenkripsi.')}</p>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
}
