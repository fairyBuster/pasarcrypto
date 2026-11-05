// notifikasi-berhasil-daftar — content only, the shell is components/NotificationPopup.jsx
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { t } from '../../lib/i18n.js';

export default function NotifikasiBerhasilDaftar() {
  return (
    <NotificationPopup
      layout="info"
      icon="/assets/img/73cc4f1319.svg"
      title={t('Pendaftaran Berhasil!')}
      body="Selamat, akunmu sudah berhasil dibuat. Silakan masuk untuk mulai menggunakan aplikasi."
      actions={[{"label":"Tutup"}]}
    />
  );
}
