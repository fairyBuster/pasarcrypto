// popup-home — the Home screen stays mounted underneath so the translucent
// veil dims it (the home menu shows through); the shell is components/ChannelSheet.jsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChannelSheet from '../../components/ChannelSheet.jsx';
import { api } from '../../lib/api.js';
import { t } from '../../lib/i18n.js';

const Home = lazy(() => import('../home/Home.jsx'));

// the sheet's slots are drawn for the three channels it was designed around, so
// the platform decides the caption and the artwork; the CMS title rides along
// as the tooltip and covers any platform the frame has no slot for
const PLATFORMS = {
  telegram: { name: 'Telegram', label: 'Saluran', icon: '/assets/img/56c976c9cc.png' },
  whatsapp: { name: 'WhatsApp', label: 'Saluran', icon: '/assets/img/50c60b7d43.png' },
  other: { name: 'Service', label: 'CS', icon: '/assets/img/f58020ac9a.png' },
};
const DEFAULT_ICON = '/assets/img/f58020ac9a.png';

// shown until /api/support/links/ answers. The captions stay so the card keeps
// its shape, but the targets only ever come from the API's results[].url — no
// link is baked into the bundle
const FALLBACK = [
  { id: 'telegram', name: 'Telegram', label: PLATFORMS.telegram.label, icon: PLATFORMS.telegram.icon },
  { id: 'whatsapp', name: 'WhatsApp', label: PLATFORMS.whatsapp.label, icon: PLATFORMS.whatsapp.icon },
  { id: 'other', name: 'Service', label: PLATFORMS.other.label, icon: PLATFORMS.other.icon },
];

const channelFrom = (row) => {
  const preset = PLATFORMS[row.platform] || {};
  return {
    id: String(row.id ?? row.title ?? row.url),
    name: preset.name || row.title || 'Saluran',
    label: preset.label || 'Saluran',
    icon: row.icon || preset.icon || DEFAULT_ICON,
    href: row.url || '',
    title: row.title || '',
  };
};

export default function PopupHome() {
  const location = useLocation();
  // a fresh sign-in hands over the destination screen (the home tab); the
  // sheet dismisses forward into it instead of stepping back to the login
  const next = location.state?.next || '/home';
  const [channels, setChannels] = useState(FALLBACK);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      // the upstream sits behind a CDN that occasionally 524s, so one retry is
      // cheaper than leaving the popup on its fallback links
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const res = await api.supportLinks().catch(() => null);
        if (!alive) return;
        if (!res?.ok) continue;
        const rows = Array.isArray(res.data?.results) ? res.data.results : [];
        const list = rows.filter((row) => row.is_active !== false).map(channelFrom);
        if (list.length) setChannels(list);
        return;
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

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
      channels={channels}
    />
    </>
  );
}
