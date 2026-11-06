// Shared plumbing for the Yuipay deposit flow: the channels the API accepts,
// the order that carries pay_data, and its expiry countdown.
import { useEffect, useState } from 'react';

// Yuipay answers a QR string for QRIS and a VA number for BRIVA, so the method
// screen and the two confirmation frames both read this table
export const DEPOSIT_METHODS = [
  {
    code: 'QRIS',
    label: 'QRIS',
    type: 'QRIS',
    logo: '/assets/img/d37fb3edfd.png',
    logoClass: 'qris-logo',
  },
  {
    code: 'BRI',
    label: 'BRI',
    type: 'VA',
    logo: '/assets/img/90ed915a6a.png',
    logoClass: 'bri-logo',
  },
];

// the amount bounds the gateway enforces per channel (IDR, whole rupiah)
export const DEPOSIT_LIMITS = {
  QRIS: { min: 10000, max: 10000000 },
  VA: { min: 10000, max: 50000000 },
};

// a deposit tops up the wallet the frames call "Saldo Isi Ulang"
export const DEPOSIT_WALLET = 'BALANCE_DEPOSIT';

const ORDER_KEY = 'pscryp.deposit.';

// the initiated order stays in this tab: the URL only carries its number, so
// pay_data never ends up in the address bar or in the back button
export const saveOrder = (order) => {
  try {
    // the raw vendor payload is of no use to the receipt and can be large
    const { provider, ...rest } = order;
    sessionStorage.setItem(ORDER_KEY + order.order_num, JSON.stringify(rest));
  } catch {
    // private mode can refuse storage; the confirmation screen then sends the
    // user back to the amount screen instead of showing a half-filled receipt
  }
};

export const readOrder = (orderNum) => {
  if (!orderNum) return null;
  try {
    const raw = sessionStorage.getItem(ORDER_KEY + orderNum);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// a VA number is printed in groups of four; anything that is not a plain
// number (a prefixed reference, for instance) is printed as the gateway sent it
export const vaText = (value) => {
  const text = String(value || '').trim();
  return /^\d[\d\s]*$/.test(text)
    ? text.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
    : text;
};

// the clipboard takes the number the bank expects, without the reading groups
export const vaBare = (value) => String(value || '').replace(/\s/g, '');

// milliseconds left until the order expires; null when no expiry came back
export function useCountdown(expiresAt) {
  const target = expiresAt ? Date.parse(expiresAt) : NaN;
  const [left, setLeft] = useState(() =>
    Number.isFinite(target) ? Math.max(0, target - Date.now()) : null
  );

  useEffect(() => {
    if (!Number.isFinite(target)) return undefined;
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [target]);

  return left;
}

// hh:mm:ss, the clock both payment cards print
export const clock = (ms) => {
  const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
};
