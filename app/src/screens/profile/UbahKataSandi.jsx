// ubah-kata-sandi — ported from the Figma export, typography re-synced to Figma
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth, friendlyError } from '../../lib/auth.jsx';
import { normalizePhone } from '../../lib/phone.js';
import { t } from '../../lib/i18n.js';

const css = `
/* ubah-kata-sandi — ported from Figma export, typography re-synced */
.scr-ubah-kata-sandi { background: radial-gradient(100% 100% at 69.23% -4%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-ubah-kata-sandi *{
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.scr-ubah-kata-sandi a{
  text-decoration: none;
}
.scr-ubah-kata-sandi ul{
  list-style: none;
}
.scr-ubah-kata-sandi .header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px 0;
    height: 60px;
  }
.scr-ubah-kata-sandi .back-btn{
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: #1f3048;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
.scr-ubah-kata-sandi .page-title{
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    flex: 1;
  }
.scr-ubah-kata-sandi .header-spacer{
    width: 40px;
  }
.scr-ubah-kata-sandi .info-box{
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 20px 16px 0;
  }
.scr-ubah-kata-sandi .info-icon{
    padding-top: 2px;
  }
.scr-ubah-kata-sandi .info-text{
    color: #a9b7c8;
    font-size: 12px;
    line-height: 1.5;
  }
.scr-ubah-kata-sandi .form-section{
    padding: 0 16px 28px;
  }
.scr-ubah-kata-sandi .form-group{
    padding-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-ubah-kata-sandi .form-label{
    color: #d3dce7;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    gap: 2px;
  }
.scr-ubah-kata-sandi .asterisk{
    color: #f2667a;
  }
.scr-ubah-kata-sandi .input-wrapper{
    background-color: #1f3048;
    border: 1px solid #2f4560;
    border-radius: 14px;
    height: 46px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    justify-content: space-between;
  }
.scr-ubah-kata-sandi .input-wrapper.active{
    border-color: #8fa1b6;
  }
.scr-ubah-kata-sandi .form-input{
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 14px;
    outline: none;
    flex: 1;
    font-family: inherit;
    letter-spacing: 4px;
  }
.scr-ubah-kata-sandi .form-input.placeholder-style{
    color: #75879c;
    letter-spacing: normal;
  }
.scr-ubah-kata-sandi .form-input::placeholder{
    color: #75879c;
    letter-spacing: normal;
  }
.scr-ubah-kata-sandi .icon-btn{
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
.scr-ubah-kata-sandi .forgot-password-container{
    padding-top: 12px;
    display: flex;
    justify-content: flex-end;
  }
.scr-ubah-kata-sandi .forgot-password{
    color: #c9d4e1;
    font-size: 12px;
    text-decoration: none;
  }
.scr-ubah-kata-sandi .password-strength{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
  }
.scr-ubah-kata-sandi .strength-bars{
    display: flex;
    gap: 4px;
    width: 277px;
  }
.scr-ubah-kata-sandi .bar{
    height: 4px;
    border-radius: 2px;
    flex: 1;
  }
.scr-ubah-kata-sandi .bar.filled-medium{
    background-color: #e9c46a;
  }
.scr-ubah-kata-sandi .bar.empty{
    background-color: #22344b;
  }
.scr-ubah-kata-sandi .strength-text{
    color: #e9c46a;
    font-size: 10px;
    font-weight: 600;
  }
.scr-ubah-kata-sandi .text-muted{
    color: #8597ab;
    font-weight: 400;
  }
.scr-ubah-kata-sandi .requirements-container{
    padding-top: 14px;
  }
.scr-ubah-kata-sandi .requirements-box{
    background-color: rgba(31, 48, 72, 0.45);
    border-radius: 14px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-ubah-kata-sandi .requirements-title{
    color: #d3dce7;
    font-size: 12px;
    font-weight: 500;
    margin: 0;
  }
.scr-ubah-kata-sandi .requirements-list{
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
  }
.scr-ubah-kata-sandi .requirement-item{
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }
.scr-ubah-kata-sandi .requirement-item.valid{
    color: #d3dce7;
  }
.scr-ubah-kata-sandi .requirement-item.invalid{
    color: #8597ab;
  }
.scr-ubah-kata-sandi .check-icon{
    width: 16px;
    height: 16px;
    background-color: #3ecf8e;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
.scr-ubah-kata-sandi .uncheck-icon{
    width: 16px;
    height: 16px;
    border: 1px solid #51657e;
    border-radius: 8px;
    box-sizing: border-box;
  }
.scr-ubah-kata-sandi .submit-container{
    padding-top: 24px;
  }
.scr-ubah-kata-sandi .submit-btn{
    width: 100%;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
    border: none;
    color: #0c1a2d;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
/* the Figma frame only draws the "Sedang" state, the meter needs all three */
.scr-ubah-kata-sandi .bar.filled-weak{ background-color: #f2667a; }
.scr-ubah-kata-sandi .bar.filled-strong{ background-color: #3ecf8e; }
.scr-ubah-kata-sandi .strength-text.is-weak{ color: #f2667a; }
.scr-ubah-kata-sandi .strength-text.is-strong{ color: #3ecf8e; }
.scr-ubah-kata-sandi .form-error{ padding-top: 12px; font-size: 12px; line-height: 18px; color: #f2667a; }
.scr-ubah-kata-sandi .submit-btn:disabled{ opacity: 0.6; cursor: default; }
/* figma re-sync */
.scr-ubah-kata-sandi .page-title.page-title { font-size: 17px; }
.scr-ubah-kata-sandi .page-title.page-title { font-weight: 700; }
.scr-ubah-kata-sandi .requirements-title.requirements-title { font-weight: 600; }
`;

export default function UbahKataSandi() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState({ old: false, next: false, confirm: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // the checklist mirrors the four rules printed on the Figma frame
  const rules = [
    { label: 'Minimal 8 karakter', ok: newPassword.length >= 8 },
    { label: 'Huruf besar dan huruf kecil', ok: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
    { label: 'Minimal 1 angka', ok: /\d/.test(newPassword) },
    {
      label: 'Berbeda dari kata sandi lama',
      ok: Boolean(newPassword) && Boolean(oldPassword) && newPassword !== oldPassword,
    },
  ];
  const passed = rules.slice(0, 3).filter((rule) => rule.ok).length;
  // too-short passwords never read as stronger than "Lemah"
  const strength = newPassword ? (newPassword.length >= 8 ? Math.max(1, passed) : 1) : 0;
  const strengthLabel = ['', 'Lemah', 'Sedang', 'Kuat'][strength];
  const barClass = (index) => {
    if (index >= strength) return 'bar empty';
    if (strength === 1) return 'bar filled-weak';
    if (strength === 3) return 'bar filled-strong';
    return 'bar filled-medium';
  };
  const toggleVisible = (key) => setVisible((current) => ({ ...current, [key]: !current[key] }));

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!oldPassword) {
      setError('Kata sandi lama wajib diisi.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (!rules[1].ok || !rules[2].ok) {
      setError('Kata sandi baru harus memuat huruf besar, huruf kecil, dan angka.');
      return;
    }
    if (newPassword === oldPassword) {
      setError('Kata sandi baru harus berbeda dari kata sandi lama.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Konfirmasi kata sandi baru tidak sama.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      // the API looks the account up by phone; the session already holds it
      const res = await api.changePassword({
        phone: normalizePhone(user?.phone || ''),
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: confirm,
      });
      if (!res.ok) {
        setError(friendlyError(res.data, 'Gagal mengubah kata sandi.'));
        setBusy(false);
        return;
      }
      // the password changed, so the old session has to end here: sign out and
      // let the user back in with the new password
      await signOut();
      navigate('/notifikasi/ubah-sandi', { replace: true, state: { next: '/login' } });
    } catch {
      setError('Gagal mengubah kata sandi.');
      setBusy(false);
    }
  };

  return (
    <div className="scr-ubah-kata-sandi">
      <style>{css}</style>
      <section id="section-header">
        <header className="header">
          <button className="back-btn" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/3f019b89bd.svg" alt="Back" />
          </button>
          <h1 className="page-title">{t('Ubah Kata Sandi')}</h1>
          <div className="header-spacer"></div>
        </header>
      </section>
      <section id="section-info">
        <div className="info-box">
          <div className="info-icon">
            <img src="/assets/img/0eac2c71ab.svg" alt="Security Info" />
          </div>
          <p className="info-text">{t('Demi keamanan, jangan bagikan kata sandi kamu kepada siapa pun, termasuk tim kami.')}</p>
        </div>
      </section>
      <section id="section-form" className="form-section">
        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="form-label">{t('Kata sandi lama')} <span className="asterisk">*</span></label>
            <div className="input-wrapper">
              <input
                type={visible.old ? 'text' : 'password'}
                className="form-input"
                placeholder={t('Masukkan kata sandi lama')}
                autoComplete="current-password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={visible.old ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleVisible('old');
                }}
              >
                <img
                  src={visible.old ? '/assets/img/a1fffbc376.svg' : '/assets/img/367121f100.svg'}
                  alt={visible.old ? 'Hide password' : 'Show password'}
                />
              </button>
            </div>
          </div>
      
          
          <div className="forgot-password-container">
            <a href="#" className="forgot-password" data-route="/lupa-password">{t('Lupa kata sandi?')}</a>
          </div>
      
          
          <div className="form-group">
            <label className="form-label">{t('Kata sandi baru')} <span className="asterisk">*</span></label>
            <div className="input-wrapper active">
              <input
                type={visible.next ? 'text' : 'password'}
                className="form-input"
                placeholder={t('Masukkan kata sandi baru')}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={visible.next ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleVisible('next');
                }}
              >
                <img
                  src={visible.next ? '/assets/img/a1fffbc376.svg' : '/assets/img/367121f100.svg'}
                  alt={visible.next ? 'Hide password' : 'Show password'}
                />
              </button>
            </div>
            <div className="password-strength">
              <div className="strength-bars">
                {[0, 1, 2].map((index) => (
                  <div key={index} className={barClass(index)}></div>
                ))}
              </div>
              <span className={`strength-text${strength === 1 ? ' is-weak' : ''}${strength === 3 ? ' is-strong' : ''}`}>
                <span className="text-muted">{t('Kekuatan:')}</span> {strengthLabel || '—'}
              </span>
            </div>
          </div>
      
          
          <div className="requirements-container">
            <div className="requirements-box">
              <h3 className="requirements-title">{t('Kata sandi harus memiliki:')}</h3>
              <ul className="requirements-list">
                {rules.map((rule) => (
                  <li key={rule.label} className={`requirement-item ${rule.ok ? 'valid' : 'invalid'}`}>
                    {rule.ok ? (
                      <div className="check-icon"><img src="/assets/img/46192bb8a9.svg" alt="Valid" /></div>
                    ) : (
                      <div className="uncheck-icon"></div>
                    )}
                    <span>{rule.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
      
          
          <div className="form-group">
            <label className="form-label">{t('Konfirmasi kata sandi baru')} <span className="asterisk">*</span></label>
            <div className="input-wrapper">
              <input
                type={visible.confirm ? 'text' : 'password'}
                className="form-input"
                placeholder={t('Ulangi kata sandi baru')}
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={visible.confirm ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleVisible('confirm');
                }}
              >
                <img
                  src={visible.confirm ? '/assets/img/a1fffbc376.svg' : '/assets/img/367121f100.svg'}
                  alt={visible.confirm ? 'Hide password' : 'Show password'}
                />
              </button>
            </div>
          </div>
      
          
          {error && <p className="form-error">{error}</p>}

          <div className="submit-container">
            <button
              type="submit"
              className="submit-btn"
              disabled={busy}
              // the shell cancels unhandled button clicks, which would swallow the submit
              onClick={(event) => event.stopPropagation()}
            >
              {busy ? 'Menyimpan…' : 'Simpan Kata Sandi'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
