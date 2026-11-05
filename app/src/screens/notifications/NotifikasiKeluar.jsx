// notifikasi-keluar — content only, the shell is components/NotificationPopup.jsx
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { t } from '../../lib/i18n.js';

export default function NotifikasiKeluar() {
  return (
    <NotificationPopup
      layout="confirm"
      icon="/assets/img/b4420403eb.svg"
      title={t('Keluar dari Akun?')}
      body="Kamu perlu masuk kembali menggunakan nomor HP atau email dan kata sandi untuk mengakses akunmu."
      actions={[{"label":"Ya, Keluar","to":"/welcome"},{"label":"Batal"}]}
    />
  );
}
