import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
    const timer = setTimeout(() => setToast(''), 1600);
    return () => clearTimeout(timer);
  }, [toast]);

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

    // copy / share buttons — the exact string to put on the clipboard
    const copyValue = event.target.closest('[data-copy]');
    if (copyValue) {
      event.preventDefault();
      copyToClipboard(copyValue.getAttribute('data-copy') || '');
      return;
    }

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
    // cannot move the scroll position — but the prototype never announces itself
    const interactive = event.target.closest('button, a, [role="button"]');
    if (interactive) {
      event.preventDefault();
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
                    <ScreenHost comp={route.comp} />
                  ) : (
                    <RequireAuth>
                      <ScreenHost comp={route.comp} />
                    </RequireAuth>
                  )
                }
              />
            ))}
            {/* Entry point opens the marketing landing page, not the welcome splash */}
            <Route path="/" element={<Navigate to="/landing" replace />} />
            {/* a tapped article reuses the education-article frame, filled from /api/news/{id}/ */}
            <Route path="/landing/berita/:id" element={<ScreenHost comp="LandingpageMateriDetail" />} />
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
      <a href="/landing" data-route="/landing">
        {t('Kembali ke awal')}
      </a>
    </div>
  );
}
