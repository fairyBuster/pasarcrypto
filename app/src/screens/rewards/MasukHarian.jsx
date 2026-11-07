// masuk-harian — ported from the Figma export, typography re-synced to Figma
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { friendlyError, useAuth } from '../../lib/auth.jsx';
import { idr } from '../../lib/format.js';
import { t } from '../../lib/i18n.js';

const DAYS = 7;
const MAX_PAGES = 10;

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const pad = (value) => String(value).padStart(2, '0');

// where a claimed date sits inside the 7-day program (1-based; 0 = off-window)
const programDay = (start, date) => {
  const from = Date.parse(`${start}T00:00:00Z`);
  const at = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(at)) return 0;
  return Math.round((at - from) / 86400000) + 1;
};

// Monday-first month grid, padded to whole weeks like the design
const monthWeeks = (year, month) => {
  const lead = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const total = new Date(year, month, 0).getDate();
  const cells = Array(lead).fill(null);
  for (let day = 1; day <= total; day += 1) cells.push(day);
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

// one step of the 7-day ladder: "daily" configures every step, the other modes
// pay the same base each day and add the day-7 bonus once. The fallbacks mirror
// the claim endpoint, so the ladder never promises a different amount.
const stepAmount = (day, settings, rank) => {
  if (!settings) return null;
  // "random" has no step value until the claim itself is made
  if (settings.reward_type === 'random') return null;
  const base = Number(settings.fixed_amount) || 0;
  const configured = (value) => {
    const amount = Number(value) || 0;
    return amount > 0 ? amount : base;
  };
  let amount;
  if (settings.reward_type === 'daily') amount = configured(settings.daily_rewards?.[String(day)]);
  else if (settings.reward_type === 'rank') amount = configured(rank ? settings.rank_rewards?.[String(rank)] : 0);
  else amount = base;
  if (day === DAYS && settings.consecutive_bonus_enabled && !settings.bonus_claim_separate_enabled) {
    amount += Number(settings.bonus_7_days) || 0;
  }
  return amount;
};

const css = `
/* masuk-harian — ported from Figma export, typography re-synced */
.scr-masuk-harian { width: 100%;
    min-height: 100cqh;
    background: radial-gradient(circle at 69% 0%, rgba(78, 108, 142, 0.55) 0%, rgba(78, 108, 142, 0) 100%),
    linear-gradient(180deg, #0c1a2d 0%, #13263d 30%, #0f2036 70%, #0a1626 100%); }
.scr-masuk-harian section{
  width: 100%;
  max-width: 412px;
  box-sizing: border-box;
}
.scr-masuk-harian p,
.scr-masuk-harian h1,
.scr-masuk-harian h2,
.scr-masuk-harian h3,
.scr-masuk-harian h4{
  margin: 0;
}
.scr-masuk-harian *{
  box-sizing: border-box;
}
.scr-masuk-harian .header{
    display: flex;
    align-items: center;
    padding: 20px 16px 0;
    gap: 12px;
  }
.scr-masuk-harian .back-btn{
    width: 40px;
    height: 40px;
    background-color: #1f3048;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
.scr-masuk-harian .title{
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
  }
.scr-masuk-harian .spacer{
    width: 40px;
  }
.scr-masuk-harian .hero{
    display: flex;
    padding: 22px 16px 0;
    gap: 12px;
    align-items: center;
  }
.scr-masuk-harian .hero-content{
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }
.scr-masuk-harian .hero-content h2{
    font-size: 20px;
    font-weight: 700;
    line-height: 1.4;
  }
.scr-masuk-harian .hero-content p{
    font-size: 12px;
    color: #a9b7c8;
    line-height: 1.4;
  }
.scr-masuk-harian .hero-img{
    width: 123px;
    height: 108px;
    object-fit: contain;
  }
.scr-masuk-harian .stats{
    display: flex;
    padding: 18px 16px 0;
  }
.scr-masuk-harian .stat-box{
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
.scr-masuk-harian .stat-divider{
    border-left: 1px solid rgba(201, 212, 225, 0.18);
    padding-left: 16px;
  }
.scr-masuk-harian .stat-label{
    font-size: 12px;
    color: #8597ab;
  }
.scr-masuk-harian .stat-value-group{
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
.scr-masuk-harian .stat-value{
    font-size: 20px;
    font-weight: 700;
  }
.scr-masuk-harian .stat-unit{
    font-size: 12px;
    color: #a9b7c8;
  }
.scr-masuk-harian .weekly-bonus{
    padding: 28px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
.scr-masuk-harian .wb-header{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
.scr-masuk-harian .wb-header h3{
    font-size: 14px;
    font-weight: 600;
  }
.scr-masuk-harian .wb-header span{
    font-size: 12px;
    color: #8597ab;
  }
.scr-masuk-harian .wb-days{
    display: flex;
    justify-content: space-between;
  }
.scr-masuk-harian .wb-day{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
.scr-masuk-harian .day-circle{
    width: 38px;
    height: 38px;
    border-radius: 19px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }
.scr-masuk-harian .day-circle.checked{
    background: linear-gradient(135deg, #5a82bf 0%, #2c4c80 100%);
  }
.scr-masuk-harian .day-circle.active{
    background: linear-gradient(135deg, #f5f8fb 0%, #c9d4e1 100%);
    color: #0c1a2d;
  }
.scr-masuk-harian .day-circle.upcoming{
    background-color: #1a2a40;
    color: #75879c;
  }
.scr-masuk-harian .day-circle.upcoming.border{
    border: 1px dashed #8597ab;
  }
.scr-masuk-harian .day-amt{
    font-size: 10px;
    color: #75879c;
    font-weight: 600;
  }
.scr-masuk-harian .day-lbl{
    font-size: 9px;
    color: #75879c;
  }
.scr-masuk-harian .active-text{
    color: #ffffff;
  }
.scr-masuk-harian .upcoming-text{
    color: #d3dce7;
  }
.scr-masuk-harian .wb-footer{
    text-align: right;
    font-size: 10px;
    color: #75879c;
    margin-top: -4px;
  }
.scr-masuk-harian .action-section{
    padding: 18px 16px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
.scr-masuk-harian .action-btn{
    width: 100%;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(90deg, #f5f8fb 0%, #c7d4e1 100%);
    border: none;
    color: #0c1a2d;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
  }
.scr-masuk-harian .action-subtext{
    font-size: 12px;
    color: #8597ab;
  }
.scr-masuk-harian .action-subtext strong{
    color: #ffffff;
    font-weight: 600;
  }
.scr-masuk-harian .calendar{
    padding: 28px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
.scr-masuk-harian .cal-header{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
.scr-masuk-harian .cal-header h3{
    font-size: 14px;
    font-weight: 600;
  }
.scr-masuk-harian .cal-header span{
    font-size: 12px;
    color: #8597ab;
  }
.scr-masuk-harian .cal-weekdays{
    display: flex;
    justify-content: space-between;
  }
.scr-masuk-harian .cal-weekdays span{
    width: 38px;
    text-align: center;
    font-size: 11px;
    color: #75879c;
  }
.scr-masuk-harian .cal-grid{
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
.scr-masuk-harian .cal-row{
    display: flex;
    justify-content: space-between;
  }
.scr-masuk-harian .cal-cell{
    width: 38px;
    height: 34px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    border-radius: 17px;
  }
.scr-masuk-harian .cal-cell.empty{
    visibility: hidden;
  }
.scr-masuk-harian .cal-cell.attended{
    background-color: rgba(90, 130, 191, 0.28);
    color: #ffffff;
  }
.scr-masuk-harian .cal-cell.missed{
    color: #51657e;
  }
.scr-masuk-harian .cal-cell.today{
    border: 1px solid #c9d4e1;
    color: #ffffff;
  }
.scr-masuk-harian .cal-cell.future{
    color: #75879c;
  }
.scr-masuk-harian .cal-legend{
    display: flex;
    gap: 16px;
    margin-top: 8px;
  }
.scr-masuk-harian .legend-item{
    display: flex;
    align-items: center;
    gap: 6px;
  }
.scr-masuk-harian .legend-color{
    width: 10px;
    height: 10px;
    border-radius: 5px;
  }
.scr-masuk-harian .attended-color{
    background-color: rgba(90, 130, 191, 0.55);
  }
.scr-masuk-harian .today-color{
    border: 1px solid #c9d4e1;
  }
.scr-masuk-harian .missed-color{
    background-color: #2a3d56;
  }
.scr-masuk-harian .legend-item span{
    font-size: 11px;
    color: #8597ab;
  }
.scr-masuk-harian .notes{
    padding: 24px 16px 28px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-masuk-harian .notes h4{
    font-size: 12px;
    color: #a9b7c8;
    font-weight: 400;
  }
.scr-masuk-harian .notes-list{
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
.scr-masuk-harian .notes-list li{
    font-size: 11px;
    color: #75879c;
    line-height: 1.4;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
.scr-masuk-harian .notes-list li::before{
    content: "";
    display: block;
    width: 6px;
    height: 6px;
    background-color: #51657e;
    border-radius: 3px;
    margin-top: 4px;
    flex-shrink: 0;
  }
/* figma re-sync */
.scr-masuk-harian .title.title { font-size: 17px; }
.scr-masuk-harian .title.title { font-weight: 700; }
.scr-masuk-harian .stat-label.stat-label { font-size: 11px; }
.scr-masuk-harian .stat-value.stat-value { font-size: 18px; }
.scr-masuk-harian .stat-value.stat-value { font-weight: 600; }
.scr-masuk-harian .day-amt.day-amt { font-size: 11px; }
.scr-masuk-harian .day-lbl.day-lbl { color: #FFFFFF; }
.scr-masuk-harian .day-amt.day-amt { color: #D3DCE7; }
.scr-masuk-harian .wb-footer.wb-footer { font-size: 11px; }
.scr-masuk-harian .action-btn.action-btn { font-weight: 600; }
.scr-masuk-harian .cal-cell.cal-cell { font-size: 12px; }
/* the Figma frame has no error / disabled / loading states */
.scr-masuk-harian .action-error{
    margin: 0;
    width: 100%;
    text-align: center;
    font-size: 12px;
    line-height: 18px;
    color: #f5808f;
  }
.scr-masuk-harian .action-btn:disabled{
    opacity: 0.6;
    cursor: default;
  }
.scr-masuk-harian .cal-state{
    padding: 8px 0;
    font-size: 12px;
    line-height: 18px;
    color: #8597ab;
  }
/* skeleton placeholders — every figure keeps its slot while the endpoints answer */
.scr-masuk-harian .sk{
    display: block;
    border-radius: 5px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.16) 50%, rgba(255, 255, 255, 0.06) 100%);
    background-size: 220% 100%;
    animation: scr-masuk-harian-shimmer 1.3s ease-in-out infinite;
}
@keyframes scr-masuk-harian-shimmer{
    0%{ background-position: 140% 0; }
    100%{ background-position: -140% 0; }
}
@media (prefers-reduced-motion: reduce){
    .scr-masuk-harian .sk{ animation: none; background: rgba(255, 255, 255, 0.1); }
}
.scr-masuk-harian .sk-status{
    position: absolute; width: 1px; height: 1px; overflow: hidden;
    clip: rect(0 0 0 0); white-space: nowrap;
}
`;

// one shimmering bar, sized like the line it stands in for
const Sk = ({ w, h = 13, r = 5, style }) => (
  <span className="sk" style={{ width: w, height: `${h}px`, borderRadius: `${r}px`, ...style }} aria-hidden="true"></span>
);

export default function MasukHarian() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [streak, setStreak] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [settings, setSettings] = useState(null);
  const [totalBonus, setTotalBonus] = useState(null);
  // the lifetime figure resolves after the first paint (or pages through the
  // attendance log), so it keeps its own flag instead of holding up the screen
  const [bonusReady, setBonusReady] = useState(false);
  const [calendarOff, setCalendarOff] = useState(false);
  const [calendarError, setCalendarError] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const [streakRes, calendarRes, settingsRes, allTimeRes] = await Promise.all([
        api.attendanceStreak(),
        api.attendanceCalendar(),
        api.attendanceSettings(),
        // lifetime totals: one field already sums every bonus ever credited
        api.allTimeStats(),
      ]);
      if (!alive) return;

      if (streakRes.ok) setStreak(streakRes.data);
      else setError(friendlyError(streakRes.data, 'Gagal memuat data absen.'));

      if (calendarRes.ok) setCalendar(calendarRes.data);
      // 400 = the admin switched the calendar off, so the section is dropped
      else if (calendarRes.status === 400) setCalendarOff(true);
      else setCalendarError(friendlyError(calendarRes.data, 'Gagal memuat kalender.'));

      if (settingsRes.ok) setSettings(settingsRes.data);
      setStatus('ready');

      // the bonus keeps adding up across months, so the headline is the lifetime
      // attendance total from the statistics endpoint; the log pages below only
      // cover builds that do not expose that field yet
      const lifetime = allTimeRes.ok ? allTimeRes.data?.attendance_total : null;
      if (lifetime != null) {
        setTotalBonus(Number(lifetime) || 0);
        setBonusReady(true);
      } else {
        let total = 0;
        let complete = false;
        for (let page = 1; page <= MAX_PAGES; page += 1) {
          const res = await api.attendanceLogs({ page });
          if (!res.ok) break;
          const list = Array.isArray(res.data?.results) ? res.data.results : [];
          total += list.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
          if (!res.data?.next || list.length === 0) {
            complete = true;
            break;
          }
        }
        if (!alive) return;
        setTotalBonus(complete ? total : null);
        setBonusReady(true);
      }
    })().catch(() => {
      if (!alive) return;
      setError('Gagal memuat data absen.');
      setStatus('ready');
      setBonusReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const daily = settings?.reward_type === 'daily';
  const rank = user?.rank;
  const canClaim = Boolean(streak?.can_claim_today);
  const hasClaimed = Boolean(streak?.has_claimed_today);
  // each figure shows a skeleton bar until its own response lands
  const loading = status === 'loading';

  // which ladder steps are claimed, and which one today would fill
  let claimedDays = new Set();
  let position = 1;
  if (streak && daily) {
    claimedDays = new Set(
      (streak.program_claim_dates || [])
        .map((date) => programDay(streak.program_start_date, date))
        .filter((day) => day >= 1 && day <= DAYS)
    );
    position = Math.min(Math.max(Number(streak.cycle_day) || 1, 1), DAYS);
  } else if (streak) {
    const done = Math.min(Math.max(Number(streak.streak) || 0, 0), DAYS);
    claimedDays = new Set(Array.from({ length: done }, (_, index) => index + 1));
    position = canClaim ? Math.min(done + 1, DAYS) : Math.max(done, 1);
  }
  const activeDay = canClaim ? position : null;

  const todayReward = (() => {
    if (!canClaim || !settings) return null;
    if (settings.reward_type === 'random') {
      const min = Number(settings.min_amount) || 0;
      const max = Math.max(min, Number(settings.max_amount) || 0);
      return min || max ? `${idr(min)}–${idr(max)}` : null;
    }
    const value = stepAmount(activeDay || 1, settings, rank);
    return value == null ? null : idr(value);
  })();

  let actionNote = null;
  let actionTone = 'hint';
  if (claimError || error) {
    actionNote = claimError || error;
    actionTone = 'error';
  } else if (todayReward) {
    actionNote = <>{t('Bonus hari ini')} <strong>{todayReward} IDR</strong></>;
  } else if (hasClaimed) {
    actionNote = 'Absen hari ini sudah dilakukan.';
  } else if (streak?.program_completed) {
    actionNote = 'Program absensi 7 hari sudah selesai.';
  } else if (streak) {
    actionNote = 'Bonus hari ini sedang tidak tersedia.';
  }

  const buttonLabel = claiming
    ? 'Memproses…'
    : status === 'loading' || canClaim
      ? 'Absen Sekarang'
      : hasClaimed
        ? 'Sudah Absen Hari Ini'
        : 'Absensi Tidak Tersedia';

  const claim = async (event) => {
    event.stopPropagation();
    if (claiming || !canClaim) return;
    setClaiming(true);
    setClaimError('');
    const res = await api.attendanceClaim();
    if (!res.ok) {
      setClaimError(friendlyError(res.data, 'Absen gagal, coba lagi.'));
      setClaiming(false);
      return;
    }
    // the popup repeats what just landed and what tomorrow pays
    const nextDay = activeDay ? activeDay + 1 : 0;
    const payload = {
      ...res.data,
      next_reward: nextDay && nextDay <= DAYS ? stepAmount(nextDay, settings, rank) : null,
    };
    try {
      sessionStorage.setItem('pscryp.lastAttendance', JSON.stringify(payload));
    } catch {
      // storage can be blocked; the route state still carries the values
    }
    navigate('/notifikasi/absen', { state: { attendance: payload } });
  };

  const attendedSet = new Set(calendar?.attended_dates || []);
  const missedSet = new Set(calendar?.missed_dates || []);
  const weeks = calendar ? monthWeeks(calendar.year, calendar.month) : [];
  const todayKey = calendar?.today || '';
  const cellKey = (day) => `${calendar.year}-${pad(calendar.month)}-${pad(day)}`;

  return (
    <div className="scr-masuk-harian">
      <style>{css}</style>
      {loading && <p className="sk-status" role="status">{t('Memuat data absen…')}</p>}
      <section id="section-header">
        <header className="header">
          <div
            className="back-btn"
            role="button"
            aria-label={t('Kembali ke home')}
            onClick={(event) => {
              event.stopPropagation();
              // after a claim this screen sits on top of the attendance popup, so
              // history-back could land on a dead end; the header always goes home
              navigate('/home', { replace: true });
            }}
          >
            <img src="/assets/img/33e291688c.svg" alt="Back" />
          </div>
          <h1 className="title">{t('Absen Harian')}</h1>
          <div className="spacer"></div>
        </header>
      </section>
      <section id="section-hero">
        <div className="hero">
          <div className="hero-content">
            <h2>{t('Absen tiap hari,')}<br />{t('bonusnya terus naik')}</h2>
            <p>{t('Absen 7 hari berturut-turut')}<br />{t('untuk hasil maksimal.')}</p>
          </div>
          <img src="/assets/img/10544b71c3.png" alt="Gift Box" className="hero-img" />
        </div>
      </section>
      <section id="section-stats">
        <div className="stats">
          <div className="stat-box">
            <span className="stat-label">{t('Absen beruntun')}</span>
            <div className="stat-value-group">
              {loading ? (
                // centred: a block bar next to the small unit label would
                // otherwise baseline-align and deepen the row
                <Sk w={30} h={22} r={6} style={{ alignSelf: 'center' }} />
              ) : (
                <span className="stat-value">{streak ? Number(streak.streak) || 0 : '—'}</span>
              )}
              <span className="stat-unit">{t('hari')}</span>
            </div>
          </div>
          <div className="stat-box stat-divider">
            <span className="stat-label">{t('Total bonus absen')}</span>
            <div className="stat-value-group">
              {bonusReady ? (
                <span className="stat-value">{totalBonus == null ? '—' : idr(totalBonus)}</span>
              ) : (
                <Sk w={64} h={22} r={6} style={{ alignSelf: 'center' }} />
              )}
              <span className="stat-unit">{t('IDR')}</span>
            </div>
          </div>
        </div>
      </section>
      <section id="section-weekly-bonus">
        <div className="weekly-bonus">
          <div className="wb-header">
            <h3>{t('Bonus 7 Hari')}</h3>
            {loading ? (
              <Sk w={74} h={14} />
            ) : (
              streak && <span>Hari ke-{position} dari {DAYS}</span>
            )}
          </div>
          <div className="wb-days">
            {Array.from({ length: DAYS }, (_, index) => index + 1).map((day) => {
              const checked = claimedDays.has(day);
              const active = day === activeDay && !checked;
              const tone = active ? 'active' : !checked && day > position ? 'upcoming' : '';
              const amount = stepAmount(day, settings, rank);
              return (
                <div className="wb-day" key={day}>
                  <div
                    className={
                      checked
                        ? 'day-circle checked'
                        : active
                          ? 'day-circle active'
                          : `day-circle upcoming${day === DAYS ? ' border' : ''}`
                    }
                  >
                    {checked ? <img src="/assets/img/6f816c6c82.svg" alt="Check" /> : <span>{day}</span>}
                  </div>
                  {loading ? (
                    <Sk w={28} h={13} />
                  ) : (
                    <span className={tone ? `day-amt ${tone}-text` : 'day-amt'}>
                      {amount == null ? '—' : idr(amount)}
                    </span>
                  )}
                  <span className={active ? 'day-lbl active-text' : 'day-lbl'}>Hari {day}</span>
                </div>
              );
            })}
          </div>
          <div className="wb-footer">
            {t('Semua bonus dalam IDR')}
          </div>
        </div>
      </section>
      <section id="section-action">
        <div className="action-section">
          <button
            type="button"
            className="action-btn"
            disabled={!canClaim || claiming}
            onClick={claim}
          >
            {buttonLabel}
          </button>
          {loading && !claimError && !error ? (
            <Sk w={170} h={14} />
          ) : (
            actionNote && (
              <p className={actionTone === 'error' ? 'action-error' : 'action-subtext'}>{actionNote}</p>
            )
          )}
        </div>
      </section>
      {!calendarOff && (
        <section id="section-calendar">
          <div className="calendar">
            <div className="cal-header">
              {calendar ? (
                <h3>{`${MONTHS[calendar.month - 1]} ${calendar.year}`}</h3>
              ) : (
                <Sk w={104} h={17} />
              )}
              {calendar ? (
                <span>{calendar.attended_count} hari absen</span>
              ) : (
                !calendarError && <Sk w={58} h={14} />
              )}
            </div>
            <div className="cal-weekdays">
              <span>{t('Sen')}</span><span>{t('Sel')}</span><span>{t('Rab')}</span><span>{t('Kam')}</span><span>{t('Jum')}</span><span>{t('Sab')}</span><span>{t('Min')}</span>
            </div>
            {calendar ? (
              <>
                <div className="cal-grid">
                  {weeks.map((week, weekIndex) => (
                    <div className="cal-row" key={weekIndex}>
                      {week.map((day, dayIndex) => {
                        if (!day) return <div className="cal-cell empty" key={dayIndex}></div>;
                        const key = cellKey(day);
                        const attended = attendedSet.has(key);
                        const missed = missedSet.has(key);
                        const isToday = key === todayKey;
                        const classes = ['cal-cell'];
                        if (attended) classes.push('attended');
                        if (missed) classes.push('missed');
                        if (isToday) classes.push('today');
                        if (!attended && !missed && !isToday && key > todayKey) classes.push('future');
                        return (
                          <div className={classes.join(' ')} key={dayIndex}>
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="cal-legend">
                  <div className="legend-item">
                    <div className="legend-color attended-color"></div>
                    <span>{t('Sudah absen')}</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color today-color"></div>
                    <span>{t('Hari ini')}</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color missed-color"></div>
                    <span>{t('Terlewat')}</span>
                  </div>
                </div>
              </>
            ) : calendarError ? (
              <div className="cal-state">{calendarError}</div>
            ) : (
              <>
                {/* a month spans at most six Monday-first rows, so the
                    placeholder grid takes that shape */}
                <div className="cal-grid">
                  {Array.from({ length: 6 }, (_, weekIndex) => (
                    <div className="cal-row" key={weekIndex}>
                      {Array.from({ length: 7 }, (_, dayIndex) => (
                        <div className="cal-cell" key={dayIndex}>
                          <Sk w={24} h={12} r={6} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="cal-legend">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div className="legend-item" key={index}>
                      <Sk w={10} h={10} r={5} />
                      <Sk w={46} h={12} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}
      <section id="section-notes">
        <div className="notes">
          <h4>{t('Catatan')}</h4>
          <ul className="notes-list">
            <li>{t('Absen hanya dapat dilakukan 1 kali setiap hari.')}</li>
            <li>{t('Bonus harian akan otomatis ditambahkan ke Saldo Tersedia setelah berhasil absen.')}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
