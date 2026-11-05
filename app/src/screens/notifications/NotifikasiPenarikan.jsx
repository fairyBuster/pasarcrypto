// notifikasi-penarikan — content only, the shell is components/NotificationPopup.jsx
import { useLocation } from 'react-router-dom';
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// written by KonfirmasiTarik so a refresh keeps the real numbers
export const LAST_WITHDRAW_KEY = 'pscryp.lastWithdrawal';

const readLastWithdrawal = () => {
  try {
    return JSON.parse(sessionStorage.getItem(LAST_WITHDRAW_KEY) || 'null');
  } catch {
    return null;
  }
};

export default function NotifikasiPenarikan() {
  const { state } = useLocation();
  const withdrawal = state?.withdrawal || readLastWithdrawal();

  return (
    <NotificationPopup
      layout="info"
      icon="/assets/img/242aea32ce.svg"
      title={t('Penarikan Sedang Diproses')}
      actions={[{ label: 'Tutup', to: '/tarik' }]}
    >
      <p>
        {withdrawal ? (
          <>
            {t('Penarikan sebesar')} <strong>{idr(withdrawal.amount)} IDR</strong> {t('sedang diproses. Silakan pantau statusnya di')} <strong>{t('Riwayat Penarikan')}</strong> {t('hingga penarikan berhasil.')}
          </>
        ) : (
          <>
            Penarikan kamu sedang diproses. Silakan pantau statusnya di{' '}
            <strong>{t('Riwayat Penarikan')}</strong> {t('hingga penarikan berhasil.')}
          </>
        )}
      </p>
    </NotificationPopup>
  );
}
