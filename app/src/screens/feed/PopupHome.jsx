// popup-home — the Home screen stays mounted underneath so the translucent
// veil dims it (the home menu shows through); the shell is components/ChannelSheet.jsx
import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import ChannelSheet from '../../components/ChannelSheet.jsx';
import { t } from '../../lib/i18n.js';

const Home = lazy(() => import('../home/Home.jsx'));

export default function PopupHome() {
  const location = useLocation();
  // a fresh sign-in hands over the destination screen (the home tab); the
  // sheet dismisses forward into it instead of stepping back to the login
  const next = location.state?.next || '/home';

  return (
    <>
      {/* the dimmed home screen sits behind the overlay */}
      <Suspense fallback={null}>
        <Home />
      </Suspense>
      <ChannelSheet
      image="/assets/img/668810671e.png"
      title={t('Terhubung Lebih Dekat<br />dengan PasarCryptoIDN')}
      description="Dapatkan informasi terbaru, jelajahi dunia aset kripto, dan nikmati kemudahan layanan melalui komunitas serta saluran resmi kami."
      dismissLabel="Nanti saja"
      dismissTo={next}
      channels={[{"name":"Telegram","label":"Saluran","icon":"/assets/img/56c976c9cc.png"},{"name":"WhatsApp","label":"Saluran","icon":"/assets/img/50c60b7d43.png"},{"name":"Service","label":"Saluran","icon":"/assets/img/f58020ac9a.png"}]}
    />
    </>
  );
}
