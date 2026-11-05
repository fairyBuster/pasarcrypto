// notifikasi-roda — content only, the shell is components/NotificationPopup.jsx
import { useLocation } from 'react-router-dom';
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// written by RodaKeberuntungan so a refresh keeps the real numbers
const LAST_SPIN_KEY = 'pscryp.lastSpin';

const readLastSpin = () => {
  try {
    return JSON.parse(sessionStorage.getItem(LAST_SPIN_KEY) || 'null');
  } catch {
    return null;
  }
};

export default function NotifikasiRoda() {
  const { state } = useLocation();
  const spin = state?.spin || readLastSpin();
  const amount = Number(spin?.prize_amount) || 0;
  // NONE is the zonk slice; BALANCE_DEPOSIT lands in the deposit wallet
  const won = Boolean(spin) && spin.prize_type !== 'NONE' && amount > 0;
  const wallet = spin?.prize_type === 'BALANCE_DEPOSIT' ? 'Saldo Deposit' : 'Saldo Tersedia';
  const left = Number(spin?.tickets_after) || 0;

  let title = 'Roda Keberuntungan';
  if (won) title = 'Kamu Dapat Hadiah!';
  else if (spin) title = 'Belum Beruntung';

  return (
    <NotificationPopup
      layout="info"
      icon="/assets/img/64b8b61e6b.svg"
      title={title}
      actions={[{ label: 'Tutup', to: '/rewards/roda' }]}
    >
      <p>
        {won ? (
          <>
            {t('Hadiah sebesar')} <strong>{idr(amount)} IDR</strong> sudah masuk ke {wallet}.
          </>
        ) : spin ? (
          <>{t('Zonk! Belum ada hadiah di putaran ini.')}</>
        ) : (
          <>{t('Putaran roda keberuntungan sudah selesai.')}</>
        )}
        {left > 0 && <> {t('Kamu masih punya')} <strong>{left}x</strong> {t('kesempatan putar.')}</>}
      </p>
    </NotificationPopup>
  );
}
