// notifikasi-kata-sandi-salah — content only, the shell is components/NotificationPopup.jsx
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { t } from '../../lib/i18n.js';

export default function NotifikasiKataSandiSalah() {
  return (
    <NotificationPopup
      layout="confirm"
      icon="/assets/img/7588e72c66.svg"
      title={t('Kata Sandi Salah')}
      body="Kata sandi yang kamu masukkan tidak sesuai. Periksa kembali, lalu coba lagi."
      actions={[{"label":"Tutup"}]}
    />
  );
}
