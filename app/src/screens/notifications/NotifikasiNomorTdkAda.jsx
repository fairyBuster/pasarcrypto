// notifikasi-nomor-tdk-ada — content only, the shell is components/NotificationPopup.jsx
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { t } from '../../lib/i18n.js';

export default function NotifikasiNomorTdkAda() {
  return (
    <NotificationPopup
      layout="confirm"
      icon="/assets/img/7fab1d12b7.svg"
      title={t('Nomor Tidak Terdaftar')}
      body="Nomor ponsel yang kamu masukkan belum terdaftar. Periksa kembali nomornya, atau daftar akun baru terlebih dahulu."
      actions={[{"label":"Tutup"}]}
    />
  );
}
