// notification-popup — shared modal shell for every notification/confirmation
// screen. Layout "info" = icon + left aligned copy + pill action (right);
// layout "confirm" = centered card with a full width primary + text cancel.
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

const css = `
.np-root {
  position: relative;
  min-height: 100cqh;
  width: 100%;
  background: linear-gradient(180deg, #0c1a2d 0%, #13263d 38%, #0f2036 70%, #0a1626 100%);
}
.np-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background-color: rgba(4, 9, 18, 0.85);
}
.np-card {
  width: 100%;
  max-width: 364px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 20px;
  background: linear-gradient(135deg, #1d3350 0%, #14263d 100%);
}
.np-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.np-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 20px;
  background: linear-gradient(135deg, #f5f8fa 0%, #c9d4e1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.np-icon img {
  width: 18px;
  height: 18px;
  display: block;
}
.np-title {
  margin: 0;
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  line-height: 24px;
}
.np-body {
  color: #a9b7c8;
  font-size: 13px;
  line-height: 20px;
}
.np-body p {
  margin: 0;
}
.np-body strong {
  color: #ffffff;
  font-weight: 700;
}
.np-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}
.np-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.np-btn--pill {
  height: 36px;
  padding: 0 22px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f5f8fa 0%, #c9d4e1 100%);
  color: #0c1a2d;
}
.np-btn--primary {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background: linear-gradient(90deg, #f5f8fb 0%, #c7d4e1 100%);
  color: #0c1a2d;
  font-size: 14px;
  font-weight: 700;
}
.np-btn--ghost {
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  color: #a9b7c8;
}
.np-btn:hover {
  opacity: 0.9;
}
.np-btn:active {
  opacity: 0.8;
}

/* centered confirmation layout */
.np-card--confirm {
  max-width: 320px;
  padding: 22px 20px 18px;
  border-radius: 24px;
  align-items: center;
  gap: 0;
  background: radial-gradient(100% 100% at 50% 0%, rgba(127, 170, 230, 0.22) 0%, rgba(127, 170, 230, 0) 100%),
    linear-gradient(180deg, #24416a 0%, #1a304f 55%, #122138 100%);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}
.np-card--confirm .np-head {
  flex-direction: column;
  gap: 10px;
}
.np-card--confirm .np-icon {
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background-color: rgba(242, 102, 122, 0.14);
  background-image: none;
}
.np-card--confirm .np-icon img {
  width: 24px;
  height: 24px;
}
.np-card--confirm .np-title {
  font-size: 18px;
  line-height: 1.2;
  text-align: center;
}
.np-card--confirm .np-body {
  margin-top: 8px;
  padding: 0 4px;
  text-align: center;
  line-height: 1.4;
}
.np-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  margin-top: 18px;
}
`;

export default function NotificationPopup({ icon, title, body, children, actions = [], layout = 'info' }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const confirm = layout === 'confirm';

  const run = (action) => {
    // "Ya, Keluar" on the logout confirmation is the one action that ends the session
    if (action.to === '/welcome' && pathname === '/notifikasi/keluar') signOut();
    // a replace action swaps the popup out of history, so back cannot reopen it
    if (action.to) navigate(action.to, action.replace ? { replace: true } : undefined);
    else navigate(-1);
  };

  const renderButton = (action, variant) => (
    <button
      key={action.label}
      type="button"
      className={`np-btn np-btn--${variant}`}
      onClick={(event) => {
        // the popup owns its actions; without this the shell's prototype
        // handler also fires and shows the "belum aktif" toast
        event.stopPropagation();
        run(action);
      }}
    >
      {action.label}
    </button>
  );

  return (
    <>
      <style>{css}</style>
      <div className="np-root">
        <div className="np-overlay">
          <div className={`np-card${confirm ? ' np-card--confirm' : ''}`} role="dialog" aria-modal="true">
            <div className="np-head">
              {icon && (
                <span className="np-icon">
                  <img src={icon} alt="" />
                </span>
              )}
              <h2 className="np-title">{title}</h2>
            </div>
            <div className="np-body">
              {body ? <p dangerouslySetInnerHTML={{ __html: body }} /> : children}
            </div>
            {confirm ? (
              <div className="np-actions">
                {actions.map((a, i) => renderButton(a, a.variant || (i === 0 ? 'primary' : 'ghost')))}
              </div>
            ) : (
              <div className="np-footer">
                {actions.map((a) => renderButton(a, a.variant || 'pill'))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
