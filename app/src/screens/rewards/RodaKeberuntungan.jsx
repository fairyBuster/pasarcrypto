// roda-keberuntungan — ported from the Figma export, typography re-synced to Figma
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { friendlyError } from '../../lib/auth.jsx';
import { idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

// the artwork is ten even slices inside the 280px wheel; every label sits on
// the middle of its slice, 78px out from the hub, as in the Figma frame
const SLICE_COUNT = 10;
const SLICE_ANGLE = 360 / SLICE_COUNT;
const LABEL_RADIUS = 78;
const TURNS = 5;
const SPIN_MS = 3800;

// Figma copy, clockwise from the top. Only the top slice is painted light, so
// its label reads in navy and the other nine stay white on the dark artwork.
const FALLBACK_LABELS = [
  '500.000 IDR',
  '10.000 IDR',
  '50.000 IDR',
  '5.000 IDR',
  '100.000 IDR',
  '15.000 IDR',
  '250.000 IDR',
  '20.000 IDR',
  '75.000 IDR',
  '25.000 IDR',
];

// a slice says what it pays; NONE is the zonk slice and carries no rupiah value
const prizeLabel = (prize) => {
  const amount = Number(prize?.amount) || 0;
  if (prize?.prize_type === 'NONE' || amount <= 0) return 'Zonk';
  return `${idr(amount)} IDR`;
};

// the admin uploads the prize artwork; a broken URL quietly falls back to text
const PrizeChip = ({ prize }) => {
  const [failed, setFailed] = useState(false);
  if (!prize?.image || failed) return null;
  return (
    <span className="wheel-prize">
      <img src={prize.image} alt={prize.name || ''} onError={() => setFailed(true)} />
    </span>
  );
};

// the catalogue rarely has exactly ten entries, so the slices cycle over it and
// every slice that paints the winning id becomes a valid landing spot
const slotForPrize = (prizeId, prizes) => {
  const index = prizes.findIndex((prize) => Number(prize.id) === Number(prizeId));
  if (index < 0) return Math.floor(Math.random() * SLICE_COUNT);
  const slots = [];
  for (let slot = index; slot < SLICE_COUNT; slot += prizes.length) slots.push(slot);
  return slots.length ? slots[Math.floor(Math.random() * slots.length)] : Math.floor(Math.random() * SLICE_COUNT);
};

const css = `
/* roda-keberuntungan — ported from Figma export, typography re-synced */
.scr-roda-keberuntungan { background: radial-gradient(55% 55% at 69.23% -4%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%), linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-roda-keberuntungan *{
  box-sizing: border-box;
}
.scr-roda-keberuntungan h1,
.scr-roda-keberuntungan h2,
.scr-roda-keberuntungan h3,
.scr-roda-keberuntungan h4,
.scr-roda-keberuntungan h5,
.scr-roda-keberuntungan h6,
.scr-roda-keberuntungan p{
  margin: 0;
}
.scr-roda-keberuntungan #section-header{
  position: relative;
  z-index: 10;
}
.scr-roda-keberuntungan .site-header{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 20px 16px 0 16px;
}
.scr-roda-keberuntungan .back-btn{
  width: 40px;
  height: 40px;
  background-color: #1f3048;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.scr-roda-keberuntungan .header-title{
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}
.scr-roda-keberuntungan .header-placeholder{
  width: 40px;
  height: 40px;
}
.scr-roda-keberuntungan #section-hero{
  position: relative;
  z-index: 10;
  padding-top: 22px;
}
.scr-roda-keberuntungan .hero-titles{
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scr-roda-keberuntungan .main-title{
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}
.scr-roda-keberuntungan .sub-title{
  color: #a9b7c8;
  font-size: 14px;
}
.scr-roda-keberuntungan .chances-info{
  padding: 20px 16px 0 16px;
}
.scr-roda-keberuntungan .chances-info p{
  color: #ffffff;
  font-size: 14px;
}
.scr-roda-keberuntungan .wheel-section{
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.scr-roda-keberuntungan .wheel-pointer{
  z-index: 2;
  margin-bottom: -4px;
}
.scr-roda-keberuntungan .wheel-pointer img{
  width: 28px;
  height: 30px;
  display: block;
}
.scr-roda-keberuntungan .wheel-container{
  width: 280px;
  height: 280px;
  position: relative;
}
.scr-roda-keberuntungan .wheel-merged-content{
  width: 100%;
  height: 100%;
  position: relative;
}
.scr-roda-keberuntungan .wheel-rotor{
  transition: transform 3.8s cubic-bezier(0.12, 0.78, 0.16, 1);
  will-change: transform;
}
.scr-roda-keberuntungan .wheel-abs{
  position: absolute;
}
/* a spoke is a zero-size pivot on the hub; its label hangs out along the slice
   and is written vertically, so the spoke rotation lays the text on the slice */
.scr-roda-keberuntungan .wheel-label{
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform-origin: 0 0;
}
.scr-roda-keberuntungan .wheel-text{
  position: absolute;
  left: 0;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  /* the nominal has to stay readable where it crosses the prize chip */
  text-shadow: 0 0 4px rgba(4, 10, 18, 0.9), 0 0 2px rgba(4, 10, 18, 0.9);
}
.scr-roda-keberuntungan .wheel-text.wheel-text-dark{
  color: #0C1A2D;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.75);
}
/* the admin uploads prize artwork; the chip sits behind the nominal text, so
   both stay visible on the same slice */
.scr-roda-keberuntungan .wheel-prize{
  position: absolute;
  left: 0;
  top: -78px;
  transform: translate(-50%, -50%);
  width: 42px;
  height: 42px;
  border-radius: 21px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.24);
}
.scr-roda-keberuntungan .wheel-prize img{
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.scr-roda-keberuntungan .action-section{
  padding: 28px 16px 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.scr-roda-keberuntungan .spin-btn{
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  border: none;
  color: #0c1a2d;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
.scr-roda-keberuntungan .spin-note{
  color: #8597ab;
  font-size: 12px;
}
.scr-roda-keberuntungan #section-notes{
  position: relative;
  z-index: 10;
  padding: 28px 16px 40px 16px;
}
/* the coin artwork runs behind this section, so the notes get their own surface
   instead of blending into it */
.scr-roda-keberuntungan .notes-card{
  background: linear-gradient(180deg, rgba(46, 71, 102, 0.92) 0%, rgba(14, 29, 47, 0.97) 100%);
  border: 1px solid rgba(201, 212, 225, 0.16);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 12px 28px rgba(4, 10, 18, 0.28);
}
.scr-roda-keberuntungan .notes-title{
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d3dce7;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(201, 212, 225, 0.12);
}
.scr-roda-keberuntungan .notes-title::before{
  content: "";
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
}
.scr-roda-keberuntungan .notes-list{
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.scr-roda-keberuntungan .note-item{
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
}
.scr-roda-keberuntungan .note-bullet{
  width: 6px;
  height: 6px;
  background-color: #8ba0b8;
  border-radius: 3px;
  flex-shrink: 0;
  margin-top: 6px;
}
.scr-roda-keberuntungan .note-text{
  color: #93a6bb;
  font-size: 12px;
  line-height: 1.5;
}
.scr-roda-keberuntungan #section-footer-image{
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.scr-roda-keberuntungan #section-footer-image img{
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
/* figma re-sync */
.scr-roda-keberuntungan .header-title.header-title { font-size: 17px; }
.scr-roda-keberuntungan .header-title.header-title { font-weight: 700; }
.scr-roda-keberuntungan .main-title.main-title { font-size: 20px; }
.scr-roda-keberuntungan .main-title.main-title { font-weight: 600; }
.scr-roda-keberuntungan .sub-title.sub-title { font-size: 12px; }
.scr-roda-keberuntungan .spin-btn.spin-btn { font-size: 14px; }
.scr-roda-keberuntungan .notes-title.notes-title { font-size: 13px; }
.scr-roda-keberuntungan .notes-title.notes-title { font-weight: 600; }
/* the Figma frame has no disabled, spinning or error states */
.scr-roda-keberuntungan .spin-btn:disabled{
  opacity: 0.6;
  cursor: default;
}
.scr-roda-keberuntungan .spin-note.note-error{
  color: #f5808f;
  text-align: center;
}
`;

export default function RodaKeberuntungan() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [active, setActive] = useState(false);
  const [tickets, setTickets] = useState(null);
  const [ticketCost, setTicketCost] = useState(1);
  const [prizes, setPrizes] = useState([]);
  const [error, setError] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const timer = useRef(0);

  useEffect(() => {
    let alive = true;

    api.rouletteStatus()
      .then((res) => {
        if (!alive) return;
        if (!res.ok) {
          setError(friendlyError(res.data, 'Gagal memuat roda keberuntungan.'));
        } else {
          const data = res.data || {};
          setActive(Boolean(data.is_active));
          setTickets(Number(data.tickets) || 0);
          setTicketCost(Number(data.ticket_cost) || 0);
          setPrizes(Array.isArray(data.prizes) ? data.prizes : []);
        }
        setStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        setError('Gagal memuat roda keberuntungan.');
        setStatus('ready');
      });

    return () => {
      alive = false;
    };
  }, []);

  // the result popup only opens once the wheel has visibly stopped
  useEffect(() => () => clearTimeout(timer.current), []);

  // a spin costs ticket_cost chances; the frame promises one chance per turn
  const perSpin = ticketCost > 0 ? ticketCost : 1;
  const spins = tickets == null ? null : Math.floor(tickets / perSpin);
  const canSpin = status === 'ready' && active && !spinning && spins > 0;

  const labels = FALLBACK_LABELS.map((fallback, index) =>
    prizes.length ? prizeLabel(prizes[index % prizes.length]) : fallback
  );

  const spin = async (event) => {
    // the shell would otherwise swallow the tap as an inactive prototype button
    event.stopPropagation();
    if (!canSpin) return;

    setSpinning(true);
    setError('');
    try {
      const res = await api.rouletteSpin();
      if (!res.ok) {
        setError(friendlyError(res.data, 'Gagal memutar roda, coba lagi.'));
        setSpinning(false);
        return;
      }

      const result = res.data || {};
      // the winning slice rotates back under the pointer; the slices are even,
      // so the middle of slice n sits at n * SLICE_ANGLE degrees
      const target = (360 - slotForPrize(result.prize_id, prizes) * SLICE_ANGLE) % 360;
      // a little slack keeps repeated wins from stopping dead centre
      const slack = Math.random() * 16 - 8;
      setRotation((current) => {
        const here = ((current % 360) + 360) % 360;
        return current + TURNS * 360 + ((target - here + 360) % 360) + slack;
      });
      setTickets(Number(result.tickets_after) || 0);

      timer.current = setTimeout(() => {
        try {
          sessionStorage.setItem('pscryp.lastSpin', JSON.stringify(result));
        } catch {
          // storage can be blocked; the route state still carries the values
        }
        navigate('/notifikasi/roda', { state: { spin: result } });
      }, SPIN_MS + 200);
    } catch {
      setError('Gagal memutar roda, coba lagi.');
      setSpinning(false);
    }
  };

  let buttonLabel = 'Putar Sekarang';
  if (spinning) buttonLabel = 'Memutar…';
  else if (status === 'ready' && !active) buttonLabel = 'Roda Tidak Tersedia';
  else if (status === 'ready' && spins === 0) buttonLabel = 'Kesempatan Habis';

  let note = '1 kali putar menggunakan 1 kesempatan';
  if (status === 'ready' && !active) note = 'Roda keberuntungan sedang tidak aktif.';
  else if (status === 'ready' && spins === 0) note = 'Kesempatan putar kamu sudah habis.';
  if (error) note = error;

  return (
    <div className="scr-roda-keberuntungan">
      <style>{css}</style>
      <section id="section-header">
        <header className="site-header">
          <div className="back-btn" data-back="1">
            <img src="/assets/img/aad66e4cfc.svg" alt="Back" />
          </div>
          <h1 className="header-title">{t('Roda Keberuntungan')}</h1>
          <div className="header-placeholder"></div>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero-titles">
          <h2 className="main-title">{t('Putar rodanya, raih bonus saldo')}</h2>
          <p className="sub-title">{t('Dapatkan hadiah utama dan jadilah pemenang!')}</p>
        </div>
        
        <div className="chances-info">
          <p>{t('Kesempatan kamu')} <strong>{spins == null ? '—' : `${spins}x`}</strong></p>
        </div>
      
        <div className="wheel-section">
          <div className="wheel-pointer">
            <img src="/assets/img/eb79d84f41.svg" alt="Pointer" />
          </div>
          <div className="wheel-container">
            
            <div
              className="wheel-merged-content wheel-rotor"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              
              <img src="/assets/img/45722dcfdf.svg" className="wheel-abs" style={{ left: "1px", top: "1px", width: "278px", height: "278px" }} alt="Wheel Outer Ring" />
              <img src="/assets/img/61b3ac4fb5.svg" className="wheel-abs" style={{ left: "14px", top: "14px", width: "252px", height: "252px" }} alt="Wheel Inner Ring" />
              
              
              {/* the export kept 280 frame coordinates inside a 248 group, so
                  the slices fanned 16px off the hub; the group now covers the
                  full wheel and the fan meets the hub again */}
              <div className="wheel-abs" style={{ left: "0px", top: "0px", width: "280px", height: "280px" }}>
                <img src="/assets/img/6b7e22d364.svg" className="wheel-abs" style={{ left: "101.68px", top: "16px", width: "76.64px", height: "124px" }} alt="Segment" />
                
                <img src="/assets/img/eb7e27aa03.svg" className="wheel-abs" style={{ left: "140px", top: "22.07px", width: "100.32px", height: "117.93px" }} alt="Segment" />
                
                <img src="/assets/img/7dd252ffee.svg" className="wheel-abs" style={{ left: "140px", top: "67.11px", width: "124px", height: "72.89px" }} alt="Segment" />
                
                <img src="/assets/img/789cb0342d.svg" className="wheel-abs" style={{ left: "140px", top: "140px", width: "124px", height: "72.89px" }} alt="Segment" />
                
                <img src="/assets/img/9dfe0a2439.svg" className="wheel-abs" style={{ left: "140px", top: "140px", width: "100.32px", height: "117.93px" }} alt="Segment" />
                
                <img src="/assets/img/ce04849f88.svg" className="wheel-abs" style={{ left: "101.68px", top: "140px", width: "76.64px", height: "124px" }} alt="Segment" />
                
                <img src="/assets/img/662841f4e7.svg" className="wheel-abs" style={{ left: "39.68px", top: "140px", width: "100.32px", height: "117.93px" }} alt="Segment" />
                
                <img src="/assets/img/9d71869021.svg" className="wheel-abs" style={{ left: "16px", top: "140px", width: "124px", height: "72.89px" }} alt="Segment" />
                
                <img src="/assets/img/2f1fa811ea.svg" className="wheel-abs" style={{ left: "16px", top: "67.11px", width: "124px", height: "72.89px" }} alt="Segment" />
                
                <img src="/assets/img/2810bbf94c.svg" className="wheel-abs" style={{ left: "39.68px", top: "22.07px", width: "100.32px", height: "117.93px" }} alt="Segment" />
                {labels.map((label, index) => {
                  // the API prize sits on the same slot as its label; the chip
                  // renders behind the text so the nominal always stays readable
                  const prize = prizes.length ? prizes[index % prizes.length] : null;
                  return (
                    <div
                      className="wheel-abs wheel-label"
                      style={{ transform: `rotate(${index * SLICE_ANGLE}deg)` }}
                      key={index}
                    >
                      {prize?.image && <PrizeChip prize={prize} />}
                      <span
                        className={index === 0 ? 'wheel-text wheel-text-dark' : 'wheel-text'}
                        style={{ top: `${-LABEL_RADIUS}px` }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
      
              
              <img src="/assets/img/91c28693c9.svg" className="wheel-abs" style={{ left: "269.4px", top: "137.4px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/9a4fb223be.svg" className="wheel-abs" style={{ left: "262.94px", top: "178.19px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/9c2d389646.svg" className="wheel-abs" style={{ left: "244.19px", top: "214.99px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/335acd5208.svg" className="wheel-abs" style={{ left: "214.99px", top: "244.19px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/4fd1b26632.svg" className="wheel-abs" style={{ left: "178.19px", top: "262.94px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/b8130ee38b.svg" className="wheel-abs" style={{ left: "137.4px", top: "269.4px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/c0b9ea07b5.svg" className="wheel-abs" style={{ left: "96.61px", top: "262.94px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/5dcf73d008.svg" className="wheel-abs" style={{ left: "59.81px", top: "244.19px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/5ef61d29df.svg" className="wheel-abs" style={{ left: "30.61px", top: "214.99px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/5dcf73d008.svg" className="wheel-abs" style={{ left: "11.86px", top: "178.19px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/c0b9ea07b5.svg" className="wheel-abs" style={{ left: "5.4px", top: "137.4px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/de1e19b325.svg" className="wheel-abs" style={{ left: "11.86px", top: "96.61px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/fda841dc8f.svg" className="wheel-abs" style={{ left: "30.61px", top: "59.81px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/de1e19b325.svg" className="wheel-abs" style={{ left: "59.81px", top: "30.61px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/fda841dc8f.svg" className="wheel-abs" style={{ left: "96.61px", top: "11.86px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/504402e56d.svg" className="wheel-abs" style={{ left: "137.4px", top: "5.4px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/0d43a94dd6.svg" className="wheel-abs" style={{ left: "178.19px", top: "11.86px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/88081b98bc.svg" className="wheel-abs" style={{ left: "214.99px", top: "30.61px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/0d43a94dd6.svg" className="wheel-abs" style={{ left: "244.19px", top: "59.81px", width: "5.2px", height: "5.2px" }} alt="Dot" />
              <img src="/assets/img/504402e56d.svg" className="wheel-abs" style={{ left: "262.94px", top: "96.61px", width: "5.2px", height: "5.2px" }} alt="Dot" />
      
              
              <img src="/assets/img/1a87a1a02a.svg" className="wheel-abs" style={{ left: "110px", top: "110px", width: "60px", height: "60px" }} alt="Center Base" />
              <img src="/assets/img/b31b35a54d.svg" className="wheel-abs" style={{ left: "114px", top: "114px", width: "52px", height: "52px" }} alt="Center Inner" />
              <img src="/assets/img/41deca0133.svg" className="wheel-abs" style={{ left: "128.3px", top: "128.85px", width: "23.4px", height: "22.3px" }} alt="Star Icon" />
            </div>
          </div>
        </div>
      
        <div className="action-section">
          <button type="button" className="spin-btn" disabled={!canSpin} onClick={spin}>
            {buttonLabel}
          </button>
          <p className={error ? 'spin-note note-error' : 'spin-note'}>{note}</p>
        </div>
      </section>
      <section id="section-notes">
        <div className="notes-card">
          <h3 className="notes-title">{t('Catatan')}</h3>
          <ul className="notes-list">
            <li className="note-item">
              <div className="note-bullet"></div>
              <p className="note-text">{t('Setiap kelipatan deposit Rp100.000 mendapatkan 1 kesempatan putar.')}</p>
            </li>
            <li className="note-item">
              <div className="note-bullet"></div>
              <p className="note-text">{t('Kesempatan putar akan otomatis bertambah setelah deposit berhasil.')}</p>
            </li>
            <li className="note-item">
              <div className="note-bullet"></div>
              <p className="note-text">{t('Setiap putaran menggunakan 1 kesempatan yang tersedia. Kesempatan putar yang belum digunakan akan tetap tersimpan di akun.')}</p>
            </li>
          </ul>
        </div>
      </section>
      <section id="section-footer-image">
        <img src="/assets/img/f3a8862473.png" alt="Decorative Coins Background" />
      </section>
    </div>
  );
}
