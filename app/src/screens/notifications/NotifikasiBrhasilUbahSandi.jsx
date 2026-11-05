// notifikasi-brhasil-ubah-sandi — content only, the shell is components/NotificationPopup.jsx
import { useLocation } from 'react-router-dom';
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { t } from '../../lib/i18n.js';

export default function NotifikasiBrhasilUbahSandi() {
  // the signed-out recovery flow sends its own destination, so "Tutup" opens
  // the login form instead of stepping back into the spent form
  const next = useLocation().state?.next;
  return (
    <NotificationPopup
      layout="info"
      icon="/assets/img/73cc4f1319.svg"
      title={t('Kata Sandi Diperbarui')}
      body="Kata sandimu sudah diperbarui. Silakan masuk kembali menggunakan kata sandi yang baru."
      actions={[{ label: 'Tutup', to: next }]}
    />
  );
}
