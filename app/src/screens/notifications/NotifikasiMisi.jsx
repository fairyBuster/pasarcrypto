// notifikasi-misi — content only, the shell is components/NotificationPopup.jsx
import { useLocation } from 'react-router-dom';
import NotificationPopup from '../../components/NotificationPopup.jsx';
import { idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// the reward screen hands the claim result over in the route state; the stored
// copy keeps the numbers after a refresh
const readClaim = () => {
  try {
    return JSON.parse(sessionStorage.getItem('pscryp.lastMission') || 'null');
  } catch {
    return null;
  }
};

// the popup body is rendered as HTML, so the mission name has to be escaped
const escape = (value) =>
  String(value).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

export default function NotifikasiMisi() {
  const { state } = useLocation();
  const claim = state?.mission || readClaim();
  const wallet = claim?.wallet_type === 'balance_deposit' ? 'Saldo Isi Ulang' : 'Saldo Tersedia';

  return (
    <NotificationPopup
      layout="info"
      icon="/assets/img/64b8b61e6b.svg"
      title={t('Hadiah Berhasil Diklaim')}
      body={
        claim
          ? `Bonus misi <strong>${escape(claim.mission_title || 'Misi Rewards')}</strong> {t('sebesar')} <strong>${idr(
              claim.reward_amount
            )} IDR</strong> sudah masuk ke ${wallet}. Ajak lebih banyak teman untuk membuka hadiah berikutnya.`
          : 'Hadiah misi sudah masuk ke Saldo Tersedia. Ajak lebih banyak teman untuk membuka hadiah berikutnya.'
      }
      actions={[{ label: 'Tutup', to: '/rewards/misi' }]}
    />
  );
}
