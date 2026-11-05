// notif-saldo-tdk-ckup — content only, the shell is components/NotificationPopup.jsx
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { t } from '../../lib/i18n.js';

export default function NotifSaldoTdkCkup() {
  return (
    <NotificationPopup
      layout="info"
      icon="/assets/img/b14c64ba95.svg"
      title={t('Saldo Tidak Mencukupi')}
      body="Saldo kamu belum cukup untuk melanjutkan transaksi ini. Silakan isi saldo terlebih dahulu, lalu coba lagi."
      actions={[{"label":"Tutup"}]}
    />
  );
}
