// notifikasi-universal — content only, the shell is components/NotificationPopup.jsx
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { t } from '../../lib/i18n.js';

export default function NotifikasiUniversal() {
  return (
    <NotificationPopup
      layout="info"
      icon="/assets/img/bc7fde78c0.svg"
      title={t('Judul Notifikasi')}
      body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore."
      actions={[{"label":"Tutup"}]}
    />
  );
}
