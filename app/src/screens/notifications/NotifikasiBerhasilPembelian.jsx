// notifikasi-berhasil-pembelian — content only, the shell is components/NotificationPopup.jsx
import { useLocation } from 'react-router-dom';
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { dateID, idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// written by KonfirmasiPembelian so a refresh keeps the real numbers
export const LAST_PURCHASE_KEY = 'pscryp.lastPurchase';

const readLastPurchase = () => {
  try {
    return JSON.parse(sessionStorage.getItem(LAST_PURCHASE_KEY) || 'null');
  } catch {
    return null;
  }
};

export default function NotifikasiBerhasilPembelian() {
  const { state } = useLocation();
  const purchase = state?.purchase || readLastPurchase();

  return (
    // closing the success popup lands on the holdings list
    <NotificationPopup
      layout="info"
      icon="/assets/img/64b8b61e6b.svg"
      title={t('Aset Berhasil')}
      actions={[{ label: 'Tutup', to: '/aset' }]}
    >
      <p>
        {purchase ? (
          <>
            {t('Aset')} <strong>{purchase.product_name}</strong> sebesar{' '}
            <strong>{idr(purchase.total_amount)} IDR</strong> {t('berhasil. Imbal hasil mulai dibagikan pada')} <strong>{dateID(purchase.next_claim_time)}</strong>{t('. Pantau perkembangannya di Aset Saya.')}
          </>
        ) : (
          <>
            {t('Aset kamu berhasil dibuat. Imbal hasil mulai dibagikan sesuai jadwal. Pantau perkembangannya di Aset Saya.')}
          </>
        )}
      </p>
    </NotificationPopup>
  );
}
