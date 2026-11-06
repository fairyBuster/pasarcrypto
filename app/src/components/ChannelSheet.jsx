// channel-sheet — the "Terhubung Lebih Dekat" popup (popup-home), reused by any
// screen that needs to offer the Telegram / WhatsApp / Service channels.
import { useNavigate } from 'react-router-dom';

const css = `
.cs-root {
  /* a translucent black veil pinned over the whole frame — the screen behind
     (the home menu) stays dimly visible so the popup reads as an overlay */
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  background: rgba(4, 9, 18, 0.6);
}
.cs-card {
  width: 100%;
  max-width: 336px;
  /* margin auto keeps the card centred, and still scrollable when tall */
  margin: auto;
  padding: 10px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 28px;
  background:
    radial-gradient(circle at 84% 0%, rgba(90, 130, 191, 0.22) 0%, transparent 60%),
    radial-gradient(circle at 76% 0%, rgba(127, 170, 230, 0.3) 0%, transparent 60%),
    linear-gradient(160deg, #294a72 0%, #1a304f 45%, #0f1f35 100%);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
.cs-handle {
  width: 40px;
  height: 4px;
  margin-bottom: 4px;
  border-radius: 2px;
  background-color: #3a4f69;
}
.cs-hero {
  width: 100%;
  max-width: 335px;
  height: auto;
  display: block;
  object-fit: cover;
}
.cs-title {
  margin: 18px 0 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.01em;
  text-align: center;
}
.cs-desc {
  max-width: 290px;
  margin: 6px 0 0;
  color: #8597ab;
  font-size: 13px;
  line-height: 20px;
  text-align: center;
}
.cs-channels {
  display: flex;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 20px;
}
.cs-channel {
  width: 93px;
  padding: 14px 6px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 18px;
  background: linear-gradient(180deg, #2e4768 0%, #1e334f 100%);
  text-decoration: none;
  transition: transform 0.2s ease, background 0.2s ease;
}
.cs-channel:hover {
  transform: translateY(-2px);
  background: linear-gradient(180deg, #355277 0%, #233b5a 100%);
}
.cs-channel img {
  width: 51px;
  height: 51px;
  margin-bottom: 8px;
  object-fit: contain;
}
.cs-name {
  margin: 0 0 2px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
}
.cs-label {
  margin: 0;
  color: #8597ab;
  font-size: 10px;
}
.cs-dismiss {
  margin-top: 14px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #8597ab;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}
`;

export default function ChannelSheet({
  image,
  title,
  description,
  channels = [],
  dismissLabel = 'Nanti saja',
  dismissTo,
}) {
  const navigate = useNavigate();

  // with a target the sheet always steps forward (post-login → home);
  // without one it behaves like any other sheet and goes back
  const dismiss = () => {
    if (dismissTo) navigate(dismissTo, { replace: true });
    else navigate(-1);
  };

  return (
    <>
      <style>{css}</style>
      <div
        className="cs-root"
        // the dimmed area is a dismiss target as well: a tap that lands on the
        // veil itself closes the sheet, while anything inside the card does not
        onClick={(event) => {
          if (event.target === event.currentTarget) dismiss();
        }}
      >
        <div className="cs-card" role="dialog" aria-modal="true">
          <div className="cs-handle" />
          {image && <img className="cs-hero" src={image} alt="" />}
          <h2 className="cs-title" dangerouslySetInnerHTML={{ __html: title }} />
          <p className="cs-desc">{description}</p>
          <div className="cs-channels">
            {channels.map(({ id, name, label, icon, href, title: full }) => (
              <a
                key={id || name}
                className="cs-channel"
                href={href || '#'}
                title={full || undefined}
                // the channels live outside the app, so they open in their own
                // tab; a row without a link must not reset the hash route
                target={href ? '_blank' : undefined}
                rel={href ? 'noreferrer noopener' : undefined}
                onClick={href ? undefined : (event) => event.preventDefault()}
              >
                <img src={icon} alt="" />
                <span className="cs-name">{name}</span>
                <span className="cs-label">{label || 'Saluran'}</span>
              </a>
            ))}
          </div>
          <button type="button" className="cs-dismiss" onClick={dismiss}>
            {dismissLabel}
          </button>
        </div>
      </div>
    </>
  );
}
