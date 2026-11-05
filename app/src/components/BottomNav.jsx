// bottom-nav — shared tab bar, imported by every tabbed screen
import { Link, useLocation } from 'react-router-dom';
import { t } from '../lib/i18n.js';

const css = `
.app-bottom-nav {
  position: sticky;
  bottom: 0;
  z-index: 30;
  width: 100%;
  height: 76px;
  margin-top: auto;
  background-color: #0d1b2e;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  padding-top: 10px;
  box-sizing: border-box;
}
.app-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 60px;
  color: #75879c;
  text-decoration: none;
  cursor: pointer;
}
.app-nav-item svg {
  width: 22px;
  height: 22px;
  display: block;
}
.app-nav-label {
  font-size: 10px;
  line-height: 1.2;
  color: #75879c;
}
.app-nav-item.is-active {
  color: #ffffff;
}
.app-nav-item.is-active .app-nav-label {
  color: #ffffff;
}
.app-nav-center {
  position: relative;
}
.app-nav-center-bg {
  width: 54px;
  height: 54px;
  border-radius: 27px;
  background: linear-gradient(180deg, #52a8ff 0%, #002040 100%);
  border: 4px solid #0d1b2e;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
}
.app-nav-center-bg img {
  width: 26px;
  height: 26px;
  display: block;
}
.app-nav-center .app-nav-label {
  margin-top: 26px;
  color: #d3dce7;
}
/* screens that host the bar get a full-height column so short pages still pin it low */
.phone-scroll > div:has(> .app-bottom-nav) {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
`;

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.74167,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const IconHome = () => (
  <svg viewBox="0 0 22 22" aria-hidden="true">
    <path
      d="M2.75 9.625L11 2.75L19.25 9.625V18.3333C19.25 18.5764 19.1534 18.8096 18.9815 18.9815C18.8096 19.1534 18.5764 19.25 18.3333 19.25H13.75V13.75H8.25V19.25H3.66667C3.42355 19.25 3.19039 19.1534 3.01849 18.9815C2.84658 18.8096 2.75 18.5764 2.75 18.3333V9.625Z"
      {...stroke}
    />
  </svg>
);

const IconFeed = () => (
  <svg viewBox="0 0 22 22" aria-hidden="true">
    <path
      d="M5.5 3.6665H16.5C18.0188 3.6665 19.25 4.89772 19.25 6.4165V15.5832C19.25 17.102 18.0188 18.3332 16.5 18.3332H5.5C3.98122 18.3332 2.75 17.102 2.75 15.5832V6.4165C2.75 4.89772 3.98122 3.6665 5.5 3.6665Z"
      {...stroke}
    />
    <path d="M6.41675 8.25H15.5834M6.41675 11.9167H15.5834M6.41675 15.5833H11.9167" {...stroke} />
  </svg>
);

const IconWallet = () => (
  <svg viewBox="0 0 22 22" aria-hidden="true">
    <path
      d="M5.5 5.5H16.5C18.0188 5.5 19.25 6.73122 19.25 8.25V15.5833C19.25 17.1021 18.0188 18.3333 16.5 18.3333H5.5C3.98122 18.3333 2.75 17.1021 2.75 15.5833V8.25C2.75 6.73122 3.98122 5.5 5.5 5.5Z"
      {...stroke}
    />
    <path d="M2.75 9.1665H19.25" {...stroke} />
    <path d="M14.6667 13.75H14.6767" {...stroke} />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 22 22" aria-hidden="true">
    <path
      d="M14.6666 7.33317C14.6666 9.35821 13.025 10.9998 10.9999 10.9998C8.97487 10.9998 7.33325 9.35821 7.33325 7.33317C7.33325 5.30813 8.97487 3.6665 10.9999 3.6665C13.025 3.6665 14.6666 5.30813 14.6666 7.33317Z"
      {...stroke}
    />
    <path
      d="M3.66675 19.2502C3.66675 15.5835 6.96675 12.8335 11.0001 12.8335C15.0334 12.8335 18.3334 15.5835 18.3334 19.2502"
      {...stroke}
    />
  </svg>
);

// Beranda is the home screen, the tab a sign-in opens on
const ITEMS = [
  { label: 'Beranda', to: '/home', Icon: IconHome },
  { label: 'Feed', to: '/feed', Icon: IconFeed },
  { label: 'Pasar', to: '/pasar', center: true },
  { label: 'Aset', to: '/aset', Icon: IconWallet },
  { label: 'Akun', to: '/akun', Icon: IconUser },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const activeOf = (item) => pathname === item.to || pathname.startsWith(item.to + '/');

  return (
    <>
      <style>{css}</style>
      <nav className="app-bottom-nav" aria-label={t('Navigasi utama')}>
        {ITEMS.map((item) => {
          const active = activeOf(item);
          const cls = ['app-nav-item', item.center ? 'app-nav-center' : '', active ? 'is-active' : '']
            .filter(Boolean)
            .join(' ');
          return (
            <Link key={item.label} to={item.to} className={cls} aria-current={active ? 'page' : undefined}>
              {item.center ? (
                <span className="app-nav-center-bg">
                  <img src="/assets/img/baa3015660.png" alt="" />
                </span>
              ) : (
                <item.Icon />
              )}
              <span className="app-nav-label">{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
