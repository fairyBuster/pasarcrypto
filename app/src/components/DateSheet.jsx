// date-sheet — the month grid behind every history date filter. The screen says
// which end of the range is being picked; the sheet only returns the day.
import { useEffect, useState } from 'react';
import { t } from '../lib/i18n.js';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
// Monday first, the same order the streak calendar uses
const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const pad = (value) => String(value).padStart(2, '0');

// the rows carry a timestamp, the filter carries a day: compare the date part
export const withinRange = (value, from, to) => {
  const day = String(value || '').slice(0, 10);
  if (!day) return !from && !to;
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
};

export const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const parseKey = (key) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(key || ''));
  return m ? { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) } : null;
};

// Monday-first month grid padded to whole weeks, like the design
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

const stepMonth = (cursor, delta) => {
  const raw = cursor.month + delta;
  return {
    year: cursor.year + Math.floor((raw - 1) / 12),
    month: ((raw - 1) % 12 + 12) % 12 + 1,
    day: 1,
  };
};

const css = `
.ds-overlay{
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: flex-end;
  background: rgba(4, 9, 18, 0.66);
}
.ds-sheet{
  width: 100%;
  max-height: 86cqh;
  overflow-y: auto;
  padding: 10px 16px 18px;
  border-radius: 24px 24px 0 0;
  background: linear-gradient(180deg, #1d3350 0%, #12233a 100%);
  box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.45);
  box-sizing: border-box;
}
.ds-handle{
  width: 40px;
  height: 4px;
  margin: 0 auto 10px;
  border-radius: 2px;
  background-color: #51657e;
}
.ds-head{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.ds-title{
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
}
.ds-close{
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 14px;
  background: rgba(31, 48, 72, 0.7);
  color: #c3cedb;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}
.ds-month{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ds-month-label{
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}
.ds-nav{
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 16px;
  background: rgba(31, 48, 72, 0.7);
  color: #c3cedb;
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
}
.ds-nav:active{
  opacity: 0.7;
}
.ds-weekdays,
.ds-week{
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.ds-weekdays{
  margin-bottom: 4px;
}
.ds-weekdays span{
  color: #75879c;
  font-size: 11px;
  text-align: center;
}
.ds-grid{
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.ds-day{
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #c3cedb;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}
.ds-day.is-empty{
  cursor: default;
}
.ds-day.is-today{
  box-shadow: inset 0 0 0 1px #3a5272;
}
.ds-day.is-selected{
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  color: #0c1a2d;
  font-weight: 700;
}
.ds-actions{
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
.ds-action{
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #1f3048;
  color: #c3cedb;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.ds-action.ghost{
  background: transparent;
  color: #8597ab;
}
.ds-action:active{
  opacity: 0.75;
}
`;

export default function DateSheet({ open, title, value, fallback, onPick, onClear, onClose }) {
  const [cursor, setCursor] = useState(() => parseKey(todayKey()));

  // every open starts on the month of the current choice, then on the month the
  // screen's rows live in, and only then on today
  useEffect(() => {
    if (open) setCursor(parseKey(value) || parseKey(fallback) || parseKey(todayKey()));
  }, [open, value, fallback]);

  // escape closes it, the way every other overlay in the app behaves
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !cursor) return null;

  const key = (day) => `${cursor.year}-${pad(cursor.month)}-${pad(day)}`;
  const today = todayKey();

  return (
    <div className="ds-overlay" onClick={onClose}>
      <style>{css}</style>
      <div
        className="ds-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ds-handle" />
        <div className="ds-head">
          <span className="ds-title">{title}</span>
          <button type="button" className="ds-close" aria-label={t('Tutup')} onClick={onClose}>
            ×
          </button>
        </div>
        <div className="ds-month">
          <button
            type="button"
            className="ds-nav"
            aria-label={t('Bulan sebelumnya')}
            onClick={() => setCursor((prev) => stepMonth(prev, -1))}
          >
            ‹
          </button>
          <span className="ds-month-label">
            {MONTHS[cursor.month - 1]} {cursor.year}
          </span>
          <button
            type="button"
            className="ds-nav"
            aria-label={t('Bulan berikutnya')}
            onClick={() => setCursor((prev) => stepMonth(prev, 1))}
          >
            ›
          </button>
        </div>
        <div className="ds-weekdays">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="ds-grid">
          {monthWeeks(cursor.year, cursor.month).map((week, weekIndex) => (
            <div className="ds-week" key={weekIndex}>
              {week.map((day, dayIndex) => {
                if (!day) return <span className="ds-day is-empty" key={dayIndex} />;
                const dayKey = key(day);
                const classes = ['ds-day'];
                if (dayKey === today) classes.push('is-today');
                if (dayKey === value) classes.push('is-selected');
                return (
                  <button
                    type="button"
                    className={classes.join(' ')}
                    key={dayIndex}
                    onClick={() => onPick(dayKey)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="ds-actions">
          <button type="button" className="ds-action" onClick={() => onPick(today)}>
            {t('Hari ini')}
          </button>
          <button type="button" className="ds-action ghost" onClick={onClear}>
            {t('Hapus filter')}
          </button>
        </div>
      </div>
    </div>
  );
}
