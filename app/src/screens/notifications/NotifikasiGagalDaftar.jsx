// notifikasi-gagal-daftar — content only, the shell is components/NotificationPopup.jsx
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { t } from '../../lib/i18n.js';

export default function NotifikasiGagalDaftar() {
  return (
    <NotificationPopup
      layout="info"
      icon="/assets/img/cd7b76eba7.svg"
      title={t('Pendaftaran Gagal')}
      body="Maaf, pendaftaranmu belum berhasil diproses. Periksa kembali data yang kamu isi, lalu coba lagi."
      actions={[{"label":"Tutup"}]}
    />
  );
}
