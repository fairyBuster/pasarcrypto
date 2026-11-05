// notifikasi-absen — content only, the shell is components/NotificationPopup.jsx
import { useLocation } from 'react-router-dom';
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// written by MasukHarian so a refresh keeps the real numbers
export const LAST_ATTENDANCE_KEY = 'pscryp.lastAttendance';

const readLastAttendance = () => {
  try {
    return JSON.parse(sessionStorage.getItem(LAST_ATTENDANCE_KEY) || 'null');
  } catch {
    return null;
  }
};

export default function NotifikasiAbsen() {
  const { state } = useLocation();
  const claim = state?.attendance || readLastAttendance();
  const day = Number(claim?.streak) || 0;
  const next = Number(claim?.next_reward) || 0;

  return (
    <NotificationPopup
      layout="info"
      icon="/assets/img/64b8b61e6b.svg"
      title={t('Absen Berhasil')}
      actions={[{ label: 'Tutup', to: '/rewards/harian' }]}
    >
      <p>
        {claim ? (
          <>
            Bonus absen hari ke-{day} sebesar <strong>{idr(claim.claimed_amount)} IDR</strong> sudah
            masuk ke Saldo Tersedia.
            {next > 0 && <> {t('Absen lagi besok untuk dapat')} <strong>{idr(next)} IDR</strong>.</>}
          </>
        ) : (
          <>{t('Bonus absen sudah masuk ke Saldo Tersedia. Absen lagi besok untuk bonus berikutnya.')}</>
        )}
      </p>
    </NotificationPopup>
  );
}
