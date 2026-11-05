// profil-edit-form — the edit state of "Data Akun" on the profile screens.
// PUT /api/auth/profile-update/ takes full_name, username, telegram,
// date_of_birth and gender; email stays read-only on the server.
import { useState } from 'react';
import { useAuth } from '../lib/auth.jsx';
import { t } from '../lib/i18n.js';

const GENDERS = [
  { value: 'male', label: 'Pria' },
  { value: 'female', label: 'Wanita' },
];

const css = `
.pe-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.pe-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pe-label {
  display: flex;
  gap: 2px;
  color: #d3dce7;
  font-size: 12px;
}
.pe-required {
  color: #f2667a;
}
.pe-input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #2f4560;
  border-radius: 14px;
  background-color: #1f3048;
  color: #ffffff;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  color-scheme: dark;
}
.pe-input::placeholder {
  color: #75879c;
}
.pe-input:focus {
  border-color: #51657e;
}
.pe-gender {
  display: flex;
  gap: 8px;
}
.pe-chip {
  flex: 1;
  height: 40px;
  border: 1px solid #2f4560;
  border-radius: 20px;
  background-color: #1f3048;
  color: #a9b7c8;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.pe-chip.active {
  border-color: transparent;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
}
.pe-error {
  margin: 0;
  color: #f2667a;
  font-size: 12px;
  line-height: 18px;
}
.pe-actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.pe-cancel,
.pe-save {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.pe-cancel {
  border: 1px solid #2f4560;
  background-color: transparent;
  color: #c9d4e1;
}
.pe-save {
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
}
.pe-save:disabled,
.pe-cancel:disabled {
  opacity: 0.6;
  cursor: default;
}
`;

export default function ProfilEditForm({ onCancel, onSaved }) {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [telegram, setTelegram] = useState(user?.telegram || '');
  // the API speaks yyyy-mm-dd, the date input hands back the same shape
  const [birthDate, setBirthDate] = useState((user?.date_of_birth || '').slice(0, 10));
  const [gender, setGender] = useState(user?.gender || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    const name = fullName.trim();
    const handle = username.trim();
    if (!name) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!handle) {
      setError('Username wajib diisi.');
      return;
    }
    const payload = {
      full_name: name,
      username: handle,
      telegram: telegram.trim(),
    };
    // only send what the user actually filled in, the rest stays untouched
    if (birthDate) payload.date_of_birth = birthDate;
    if (gender) payload.gender = gender;

    setBusy(true);
    setError('');
    try {
      await updateProfile(payload);
      onSaved?.();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan profil.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="pe-form" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
      <style>{css}</style>
      <div className="pe-group">
        <label className="pe-label" htmlFor="pe-full-name">
          {t('Nama lengkap')} <span className="pe-required">*</span>
        </label>
        <input
          id="pe-full-name"
          className="pe-input"
          type="text"
          autoComplete="name"
          maxLength={100}
          placeholder={t('Masukkan nama lengkap')}
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
            setError('');
          }}
        />
      </div>
      <div className="pe-group">
        <label className="pe-label" htmlFor="pe-username">
          {t('Username')} <span className="pe-required">*</span>
        </label>
        <input
          id="pe-username"
          className="pe-input"
          type="text"
          autoComplete="username"
          maxLength={50}
          placeholder={t('Masukkan username')}
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setError('');
          }}
        />
      </div>
      <div className="pe-group">
        <label className="pe-label" htmlFor="pe-telegram">
          {t('Telegram')}
        </label>
        <input
          id="pe-telegram"
          className="pe-input"
          type="text"
          autoComplete="off"
          maxLength={50}
          placeholder={t('@username_telegram')}
          value={telegram}
          onChange={(event) => setTelegram(event.target.value)}
        />
      </div>
      <div className="pe-group">
        <label className="pe-label" htmlFor="pe-birth-date">
          {t('Tanggal lahir')}
        </label>
        <input
          id="pe-birth-date"
          className="pe-input"
          type="date"
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
        />
      </div>
      <div className="pe-group">
        <span className="pe-label">{t('Jenis kelamin')}</span>
        <div className="pe-gender">
          {GENDERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={gender === option.value ? 'pe-chip active' : 'pe-chip'}
              onClick={(event) => {
                event.stopPropagation();
                setGender(option.value);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="pe-error">{error}</p>}
      <div className="pe-actions">
        <button
          type="button"
          className="pe-cancel"
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            onCancel?.();
          }}
        >
          {t('Batal')}
        </button>
        <button type="submit" className="pe-save" disabled={busy}>
          {busy ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
