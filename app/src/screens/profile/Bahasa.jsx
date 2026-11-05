// bahasa — ported from the Figma export, typography re-synced to Figma
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LANGUAGES, readLanguage } from '../../lib/language.js';
import { setLanguage, t } from '../../lib/i18n.js';
const css = `
/* bahasa — ported from Figma export, typography re-synced */
.scr-bahasa { background: radial-gradient(circle at 80% 0%, rgba(78, 108, 142, 0.55) 0%, transparent 60%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-bahasa{
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: 412px;
  min-height: 100cqh;
  background:
    radial-gradient(circle at 80% 0%, rgba(78, 108, 142, 0.55) 0%, transparent 60%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%);
  background-color: #0c1a2d;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(255,255,255,0.05);
}
.scr-bahasa *{
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
.scr-bahasa .sr-only{
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
.scr-bahasa .app-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px 0;
  }
.scr-bahasa .back-btn{
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
.scr-bahasa .page-title{
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    flex: 1;
    text-align: center;
  }
.scr-bahasa .header-spacer{
    width: 40px;
  }
.scr-bahasa .desc-container{
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 20px 16px 18px;
  }
.scr-bahasa .desc-icon{
    margin-top: 2px;
    width: 16px;
    height: 16px;
  }
.scr-bahasa .desc-text{
    color: #a9b7c8;
    font-size: 14px;
    line-height: 1.3;
    margin: 0;
  }
.scr-bahasa .options-list{
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 16px;
  }
.scr-bahasa .lang-option{
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: rgba(31, 48, 72, 0.55);
    border: 1px solid #2a3d56;
  }
.scr-bahasa .lang-option.selected,
.scr-bahasa .lang-option:has(input:checked){
    background: linear-gradient(135deg, #24426a 0%, #1a3150 55%, #12233a 100%);
    border: 1px solid #8fa1b6;
  }
.scr-bahasa .lang-icon{
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: rgba(0, 0, 0, 0.22);
    border: 1px solid rgba(201, 212, 225, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e6ecf3;
    font-size: 14px;
    font-weight: 600;
  }
.scr-bahasa .lang-text{
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
.scr-bahasa .lang-main{
    color: #ffffff;
    font-size: 15px;
    font-weight: 500;
  }
.scr-bahasa .lang-sub{
    color: #8597ab;
    font-size: 13px;
  }
.scr-bahasa .lang-radio{
    width: 22px;
    height: 22px;
    border-radius: 11px;
    border: 1px solid #51657e;
    display: flex;
    align-items: center;
    justify-content: center;
  }
.scr-bahasa .lang-option.selected .lang-radio,
.scr-bahasa .lang-option:has(input:checked) .lang-radio{
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    border: none;
  }
.scr-bahasa .lang-radio img{
    width: 12px;
    height: 12px;
  }
.scr-bahasa .action-container{
    padding: 24px 16px;
  }
.scr-bahasa .btn-save{
    width: 100%;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
    font-size: 15px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
  }
.scr-bahasa .btn-save:active{
    opacity: 0.8;
  }
/* figma re-sync */
.scr-bahasa .page-title.page-title { font-size: 17px; }
.scr-bahasa .page-title.page-title { font-weight: 700; }
.scr-bahasa .desc-text.desc-text { font-size: 12px; }
.scr-bahasa .lang-icon.lang-icon { font-size: 13px; }
.scr-bahasa .lang-icon.lang-icon { font-weight: 700; }
.scr-bahasa .lang-main.lang-main { font-size: 14px; }
.scr-bahasa .lang-main.lang-main { font-weight: 600; }
.scr-bahasa .lang-sub.lang-sub { font-size: 11px; }
.scr-bahasa .btn-save.btn-save { font-size: 14px; }
`;

export default function Bahasa() {
  const navigate = useNavigate();
  const location = useLocation();
  // the choice is kept in the browser, the API has no language field
  const [selected, setSelected] = useState(readLanguage);

  const save = (event) => {
    event.stopPropagation();
    // the provider repaints the route tree, so the choice shows immediately
    setLanguage(selected);
    // a screen opened straight from a URL has no in-app history to pop back to
    if (location.key === 'default') navigate('/akun');
    else navigate(-1);
  };

  return (
    <div className="scr-bahasa">
      <style>{css}</style>
      <section id="section-header">
        <header className="app-header">
          <button className="back-btn" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/3f019b89bd.svg" alt="" />
          </button>
          <h1 className="page-title">{t('Bahasa')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-description">
        <div className="desc-container">
          <img src="/assets/img/8d66ab700f.svg" alt="" className="desc-icon" />
          <p className="desc-text">{t('Pilih bahasa yang ingin kamu gunakan di aplikasi.')}</p>
        </div>
      </section>
      <section id="section-options">
        <div className="options-list">
          
          {LANGUAGES.map((language) => {
            const active = language.value === selected;
            return (
              <label
                key={language.value}
                className={active ? 'lang-option selected' : 'lang-option'}
                onClick={(event) => event.stopPropagation()}
              >
                <input
                  type="radio"
                  name="language"
                  value={language.value}
                  checked={active}
                  onChange={() => setSelected(language.value)}
                  className="sr-only"
                />
                <div className="lang-icon">{language.short}</div>
                <div className="lang-text">
                  <span className="lang-main">{language.label}</span>
                  <span className="lang-sub">{t(language.sub)}</span>
                </div>
                <div className="lang-radio">
                  {active && <img src="/assets/img/090484b036.svg" alt="" />}
                </div>
              </label>
            );
          })}
        </div>
      </section>
      <section id="section-action">
        <div className="action-container">
          <button className="btn-save" onClick={save}>{t('Simpan')}</button>
        </div>
      </section>
    </div>
  );
}
