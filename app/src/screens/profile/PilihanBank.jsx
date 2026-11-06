// pilihan-bank — ported from the Figma export, typography re-synced to Figma
import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { t } from '../../lib/i18n.js';

const css = `
/* pilihan-bank — ported from Figma export, typography re-synced */
.scr-pilihan-bank *{
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
/* the design draws this screen as a sheet over the add-rekening form, so the
   root is a layer in the phone frame rather than a page of its own */
.scr-pilihan-bank{
    position: absolute;
    inset: 0;
    z-index: 40;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
.scr-pilihan-bank .sheet-backdrop{
    position: absolute;
    inset: 0;
    background-color: rgba(4, 9, 18, 0.66);
  }
.scr-pilihan-bank #section-bank-selection{
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
  }
.scr-pilihan-bank .bottom-sheet-modal{
    width: 100%;
    max-width: 412px;
    height: 600px;
    max-height: 86cqh;
    background: linear-gradient(180deg, #1d3350 0%, #12233a 100%);
    border-radius: 24px 24px 0 0;
    box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
  }
.scr-pilihan-bank .drag-indicator{
    padding-top: 10px;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }
.scr-pilihan-bank .indicator-bar{
    width: 40px;
    height: 4px;
    background-color: #51657e;
    border-radius: 2px;
  }
.scr-pilihan-bank .modal-header{
    padding: 14px 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }
.scr-pilihan-bank .modal-title{
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    margin: 0;
  }
.scr-pilihan-bank .btn-close{
    width: 30px;
    height: 30px;
    border-radius: 15px;
    background-color: rgba(0, 0, 0, 0.22);
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    padding: 0;
    transition: background-color 0.2s ease;
  }
.scr-pilihan-bank .btn-close:active{
    background-color: rgba(0, 0, 0, 0.4);
  }
.scr-pilihan-bank .search-bar-container{
    padding: 14px 20px 0;
    flex-shrink: 0;
  }
.scr-pilihan-bank .search-input-group{
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.22);
    border: 1px solid #2f4560;
    border-radius: 21px;
    height: 42px;
    padding: 0 14px;
    gap: 8px;
  }
.scr-pilihan-bank .icon-search{
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
.scr-pilihan-bank .input-search{
    background: transparent;
    border: none;
    color: #ffffff;
    width: 100%;
    outline: none;
    font-family: inherit;
    font-size: 14px;
  }
.scr-pilihan-bank .input-search::placeholder{
    color: #75879c;
  }
.scr-pilihan-bank .bank-selection-list{
    padding: 16px 20px 0;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    
    scrollbar-width: thin;
    scrollbar-color: #51657e transparent;
  }
.scr-pilihan-bank .bank-selection-list::-webkit-scrollbar{
    width: 4px;
  }
.scr-pilihan-bank .bank-selection-list::-webkit-scrollbar-thumb{
    background-color: #51657e;
    border-radius: 4px;
  }
.scr-pilihan-bank .list-group-title{
    color: #8597ab;
    font-size: 14px;
    font-weight: 400;
    margin: 0 0 12px 0;
    flex-shrink: 0;
  }
.scr-pilihan-bank .list-group{
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }
.scr-pilihan-bank .list-item{
    border-bottom: 1px solid rgba(201, 212, 225, 0.16);
  }
.scr-pilihan-bank .list-item:last-child{
    border-bottom: none;
  }
.scr-pilihan-bank .bank-label{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    cursor: pointer;
    width: 100%;
  }
.scr-pilihan-bank .bank-name{
    color: #ffffff;
    font-size: 14px;
    font-weight: 400;
  }
.scr-pilihan-bank .sr-only{
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
.scr-pilihan-bank .radio-custom{
    width: 20px;
    height: 20px;
    border-radius: 10px;
    border: 1px solid #51657e;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
.scr-pilihan-bank input[type="radio"]:checked + .radio-custom{
    border: none;
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  }
.scr-pilihan-bank .radio-custom img{
    display: none;
    width: 12px;
    height: 12px;
  }
.scr-pilihan-bank input[type="radio"]:checked + .radio-custom img{
    display: block;
  }
.scr-pilihan-bank .modal-footer{
    padding: 12px 20px 24px;
    flex-shrink: 0;
  }
.scr-pilihan-bank .btn-submit{
    width: 100%;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(90deg, #f5f8fb 0%, #c9d4e1 100%);
    border: none;
    color: #0c1a2d;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 0.2s ease;
  }
.scr-pilihan-bank .btn-submit:active{
    opacity: 0.8;
  }
.scr-pilihan-bank .btn-submit:disabled{
    opacity: 0.6;
    cursor: default;
  }
.scr-pilihan-bank .picker-state{
    color: #75879c;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    margin: 12px 0;
  }
.scr-pilihan-bank .bank-group + .bank-group{
    margin-top: 20px;
  }
/* figma re-sync */
.scr-pilihan-bank .list-group-title.list-group-title { font-size: 12px; }
.scr-pilihan-bank .list-group-title.list-group-title { font-weight: 600; }
.scr-pilihan-bank .bank-name.bank-name { font-size: 13px; }
.scr-pilihan-bank .bank-name.bank-name { font-weight: 500; }
.scr-pilihan-bank .btn-submit.btn-submit { font-size: 16px; }
/* the label sits on the light gradient, so it stays dark like the export —
   white here made the button read as an empty pill */
.scr-pilihan-bank .btn-submit.btn-submit { color: #0C1A2D; }
`;

const CATEGORY_TITLES = { BANK: 'Bank', EWALLET: 'E-Wallet' };
const CATEGORY_ORDER = ['BANK', 'EWALLET'];

export default function PilihanBank({ onClose, onSelect }) {
  const [banks, setBanks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const groups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matched = banks.filter((item) => item.name.toLowerCase().includes(query));
    return CATEGORY_ORDER.map((key) => ({
      key,
      title: CATEGORY_TITLES[key],
      items: matched.filter((item) => item.category === key),
    })).filter((group) => group.items.length > 0);
  }, [banks, search]);

  useEffect(() => {
    let alive = true;
    api.bankList()
      .then((res) => {
        if (!alive) return;
        if (!res.ok || !Array.isArray(res.data)) {
          setStatus('error');
          setError(friendlyError(res.data, 'Gagal memuat daftar bank.'));
          return;
        }
        setBanks(res.data);
        setStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        setStatus('error');
        setError('Gagal memuat daftar bank.');
      });
    return () => {
      alive = false;
    };
  }, []);

  // escape closes the sheet, the way every other overlay in the app behaves
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // the picker only exists as a sheet over the add-rekening form; a direct visit
  // would show an overlay with nothing behind it, so it opens that form instead
  if (!onClose) return <Navigate to="/dompet/3" replace />;

  const close = (event) => {
    event.stopPropagation();
    onClose();
  };

  const submit = (event) => {
    event.stopPropagation();
    const picked = banks.find((item) => item.id === selectedId);
    if (picked) onSelect(picked);
  };

  return (
    <div className="scr-pilihan-bank" role="dialog" aria-modal="true" aria-label={t('Pilih bank')}>
      <style>{css}</style>
      <div className="sheet-backdrop" onClick={close}></div>
      <section id="section-bank-selection">
        <div className="bottom-sheet-modal">
            
            <div className="drag-indicator">
              <div className="indicator-bar"></div>
            </div>
            
            
            <header className="modal-header">
              <h2 className="modal-title">{t('Pilih Bank')}</h2>
              <button className="btn-close" aria-label={t('Tutup pilihan bank')} onClick={close}>
                <img src="/assets/img/def86fdcf9.svg" alt="Close" />
              </button>
            </header>
      
            
            <div className="search-bar-container">
              <div className="search-input-group">
                <img src="/assets/img/0cb2a6ca00.svg" alt="Search" className="icon-search" />
                <input
                  type="text"
                  className="input-search"
                  placeholder={t('Cari nama bank')}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
      
            
            <div className="bank-selection-list">
              {status === 'loading' && <p className="picker-state">{t('Memuat daftar bank…')}</p>}
              {status === 'error' && <p className="picker-state">{error}</p>}
              {status === 'ready' && groups.length === 0 && (
                <p className="picker-state">{t('Bank tidak ditemukan.')}</p>
              )}
              {groups.map((group) => (
                <div className="bank-group" key={group.key}>
                  <h3 className="list-group-title">{group.title}</h3>
                  <ul className="list-group">
                    {group.items.map((bank) => (
                      <li className="list-item" key={bank.id}>
                        <label
                          className="bank-label"
                          // the shell treats list rows as tabs and would cancel the radio
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedId(bank.id);
                          }}
                        >
                          <span className="bank-name">{bank.name}</span>
                          <input
                            type="radio"
                            name="selected_bank"
                            value={bank.id}
                            className="sr-only"
                            checked={selectedId === bank.id}
                            onChange={() => setSelectedId(bank.id)}
                          />
                          <span className="radio-custom">
                            <img src="/assets/img/090484b036.svg" alt="Selected" />
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
      
            
            <div className="modal-footer">
              <button type="button" className="btn-submit" onClick={submit} disabled={!selectedId}>
                {t('Pilih Bank')}
              </button>
            </div>
        </div>
      </section>
    </div>
  );
}
