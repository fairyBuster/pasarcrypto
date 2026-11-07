import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { ROUTES } from './screen-map.js';
import { RequireAuth, isPublicPath } from './lib/auth.jsx';
import { copyText } from './lib/clipboard.js';
import { t, useLanguage } from './lib/i18n.js';
import './styles/tokens.css';

// every generated screen is code-split; Vite resolves the glob at build time
const modules = import.meta.glob('./screens/*/*.jsx');
const lazyByComp = Object.fromEntries(
  Object.entries(modules).map(([file, loader]) => [
    file.split('/').pop().replace('.jsx', ''),
    lazy(loader),
  ])
);

function ScreenHost({ comp }) {
  const Screen = lazyByComp[comp];
  if (!Screen) {
    return <div className="route-missing">{t('Layar “{name}” belum tersedia', { name: comp })}</div>;
  }
  return (
    <Suspense fallback={<div className="route-loading" />}>
      <Screen />
    </Suspense>
  );
}

// a screen that throws must not take the whole shell down; the reload button
// also covers an import that failed after a deploy replaced its chunk
export class AppBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="route-missing">
          <p>{t('Layar gagal dimuat')}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {t('Muat ulang')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// URLs that were already shared keep working: the old path forwards to the
// renamed screen and keeps its query string (deposit/konfirmasi?order=...)
const LEGACY_ROUTES = {
  '/deposit': '/send',
  '/deposit/qris': '/send/qr',
  '/deposit/qris/konfirmasi': '/send/qr/konfirmasi',
  '/deposit/va': '/send/va',
  '/deposit/va/konfirmasi': '/send/va/konfirmasi',
  '/tarik': '/draw',
  '/tarik/konfirmasi': '/draw/konfirmasi',
  '/riwayat/deposit': '/riwayat/send',
  '/riwayat/penarikan': '/riwayat/draw',
  '/riwayat/keuntungan': '/coin',
  '/rewards/referral': '/rewards/share',
  '/fear-greed': '/learning',
  '/profil/bank': '/dompet/pilih',
  '/profil/bank/1': '/dompet',
  '/profil/bank/2': '/dompet/2',
  '/profil/bank/3': '/dompet/3',
  '/profil/password': '/change',
};

function LegacyRedirect({ to }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

// a shared invite link is path-based (/ref/CODE); the register screen reads the
// code from its query string, so the fragment carries it there
function ReferralRedirect() {
  const { code = '' } = useParams();
  return <Navigate to={`/register?ref=${encodeURIComponent(code)}`} replace />;
}

// tabs, filter pills, amount chips and pagination are in-page state, not routes
const TOGGLE_CLASSES = [
  'tab', 'tab-btn', 'tab-item', 'cat-pill', 'filter-btn', 'filter-chip',
  'chip', 'page-number', 'page-num-btn', 'page-btn', 'nav-arrow-btn',
  'action-btn', 'amount-btn', 'reply-chip', 'list-item',
  'radio-custom', 'lang-radio', 'toggle-track',
];
const COPY_CLASSES = ['copy-button', 'copy-btn', 'copy-icon', 'share-btn'];

const findWithClass = (el, root, list) => {
  let cur = el;
  while (cur && cur !== root) {
    const hit = list.find((c) => cur.classList?.contains(c));
    if (hit) return { el: cur, hit };
    cur = cur.parentElement;
  }
  return null;
};

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // a new language remounts the route tree, which repaints every t() call
  const { lang } = useLanguage();
  const scrollRef = useRef(null);
  const [toast, setToast] = useState('');

  // the marketing routes fill the window on desktop instead of the 412 px shell
  const isLanding = pathname === '/landing' || pathname.startsWith('/landing/');

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  // a throttled API call answers with an HTML 403 page; api.js turns that into
  // one shell-level notice, so every screen shows the same friendly copy
  useEffect(() => {
    const onRateLimit = (event) => {
      const message = event.detail?.message;
      if (message) setToast(message);
    };
    window.addEventListener('pscryp:rate-limit', onRateLimit);
    return () => window.removeEventListener('pscryp:rate-limit', onRateLimit);
  }, []);

  // the toast only confirms what actually reached the clipboard
  const copyToClipboard = async (value) => {
    if (!value) return;
    if (await copyText(value)) setToast(t('Disalin ke clipboard'));
  };

  // generated screens still carry href="#"; behaviour is delegated from here
  const handleClick = (event) => {
    const root = event.currentTarget;

    if (event.target.closest('[data-back]')) {
      event.preventDefault();
      navigate(-1);
      return;
    }

    const target = event.target.closest('[data-route]');
    if (target) {
      event.preventDefault();
      navigate(target.getAttribute('data-route'));
      return;
    }

    // a row that is not live yet answers the tap with a notification instead of
    // walking into a flow the backend would reject
    const notify = event.target.closest('[data-toast]');
    if (notify) {
      event.preventDefault();
      setToast(notify.getAttribute('data-toast') || '');
      return;
    }

    // copy / share buttons — the exact string to put on the clipboard
    const copyValue = event.target.closest('[data-copy]');
    if (copyValue) {
      event.preventDefault();
      copyToClipboard(copyValue.getAttribute('data-copy') || '');
      return;
    }

    // a real outbound link always wins over the class-based helpers below. The
    // generated screens mark selectable rows with classes like list-item, and a
    // link that carries one of those classes must still leave the app instead
    // of being swallowed as an in-page toggle
    const link = event.target.closest('a[href]');
    if (link && /^(?:https?:|mailto:|tel:)/i.test(link.getAttribute('href') || '')) return;

    // copy / share buttons
    const copy = findWithClass(event.target, root, COPY_CLASSES);
    if (copy) {
      event.preventDefault();
      const row = copy.el.closest('div');
      copyToClipboard((row?.innerText || copy.el.innerText || '').trim().split('\n')[0]);
      return;
    }

    // accordions (FAQ) expand in place
    const faq = findWithClass(event.target, root, ['faq-item']);
    if (faq) {
      event.preventDefault();
      faq.el.classList.toggle('expanded');
      return;
    }

    // tabs, pills, chips, pagination — swap the active state inside the group
    const toggle = findWithClass(event.target, root, TOGGLE_CLASSES);
    if (toggle && !toggle.el.classList.contains('disabled')) {
      event.preventDefault();
      const { el, hit } = toggle;
      const group = el.parentElement;
      if (group) {
        for (const sib of group.children) {
          if (sib !== el && sib.classList?.contains(hit)) sib.classList.remove('active');
        }
      }
      el.classList.toggle('active');
      return;
    }

    // a control nothing is wired to yet still swallows the tap, so a bare href="#"
    // cannot move the scroll position. A real submit button is the exception:
    // cancelling its click keeps every <form onSubmit> from ever firing. So is an
    // outbound link (telegram, whatsapp, mailto): its default navigation must
    // survive, otherwise the channels popup is a row of dead tiles.
    const interactive = event.target.closest('button, a, [role="button"]');
    if (interactive && interactive.getAttribute('type') !== 'submit') {
      const href = interactive.getAttribute('href');
      const outbound = interactive.tagName === 'A' && href && href !== '#';
      if (!outbound) event.preventDefault();
    }
  };

  return (
    <div className="phone-stage">
      <div className={`phone-frame${isLanding ? ' is-landing' : ''}`} onClick={handleClick}>
        <div className="phone-scroll" ref={scrollRef}>
          <Routes key={lang}>
            {ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  isPublicPath(route.path) ? (
                    <AppBoundary>
                      <ScreenHost comp={route.comp} />
                    </AppBoundary>
                  ) : (
                    <RequireAuth>
                      <AppBoundary>
                        <ScreenHost comp={route.comp} />
                      </AppBoundary>
                    </RequireAuth>
                  )
                }
              />
            ))}
            {Object.entries(LEGACY_ROUTES).map(([from, to]) => (
              <Route key={from} path={from} element={<LegacyRedirect to={to} />} />
            ))}
            {/* web entry opens the marketing landing page; the native app opens login */}
            <Route path="/" element={<Navigate to={Capacitor.isNativePlatform() ? '/login' : '/landing'} replace />} />
            {/* the short invite link every shared referral URL uses */}
            <Route path="/ref/:code" element={<ReferralRedirect />} />
            {/* a tapped article reuses the education-article frame, filled from /api/news/{id}/ */}
            <Route path="/landing/berita/:id" element={<AppBoundary><ScreenHost comp="LandingpageMateriDetail" /></AppBoundary>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {toast && (
          <div className="ui-toast-layer">
            <div className="ui-toast">{toast}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="route-missing">
      <p>{t('Halaman tidak ditemukan')}</p>
      <a href="#/landing" data-route="/landing">
        {t('Kembali ke awal')}
      </a>
    </div>
  );
}
