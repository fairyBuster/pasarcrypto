// Shared data for the Aset screens: the three wallets, the running holdings,
// and the buckets the Figma chips and portfolio legend split them into.
import { useEffect, useState } from 'react';
import { api } from './api.js';
import { friendlyError } from './auth.jsx';

const sumBy = (rows, key) => rows.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);

// The product catalogue has no category column, so the design's three buckets
// are derived: a stablecoin product, else a holding whose principal stays
// claimable (fleksibel), else locked for the duration.
export function bucketOf(investment) {
  const label = `${investment?.product_golongan || ''} ${investment?.product_name || ''}`;
  if (/stablecoin|usdt|usdc|busd|\bdai\b/i.test(label)) return 'stablecoin';
  if (investment?.can_claim_principal) return 'fleksibel';
  return 'terkunci';
}

export const BUCKET_LABELS = {
  stablecoin: 'Stablecoin',
  terkunci: 'Terkunci',
  fleksibel: 'Fleksibel',
};

export function useAssets() {
  const [account, setAccount] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [todayIncome, setTodayIncome] = useState(0);
  const [balanceHold, setBalanceHold] = useState(0);
  const [interestTotal, setInterestTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    Promise.all([api.me(), api.investments(), api.todayStats(), api.allTimeStats()])
      .then(([me, list, today, allTime]) => {
        if (!alive) return;
        if (!me.ok) {
          setError(friendlyError(me.data, 'Gagal memuat aset.'));
          setStatus('error');
          return;
        }
        setAccount(me.data);
        if (list.ok) setInvestments(Array.isArray(list.data) ? list.data : []);
        if (today.ok) {
          setTodayIncome(Number(today.data?.total_income) || 0);
          // the held balance is part of the daily statistics, not account-info
          setBalanceHold(Number(today.data?.balance_hold) || 0);
        }
        // lifetime interest credited, kept by the all-time statistics
        if (allTime.ok) setInterestTotal(Number(allTime.data?.interest_total) || 0);
        setStatus('ready');
      })
      .catch(() => {
        if (!alive) return;
        setError('Gagal memuat aset.');
        setStatus('error');
      });

    return () => {
      alive = false;
    };
  }, []);

  // only running holdings count towards the asset total
  const active = investments.filter((row) => row.status === 'ACTIVE');
  const deposit = Number(account?.balance_deposit) || 0;
  const available = Number(account?.balance) || 0;
  const holding = sumBy(active, 'total_amount');
  const assetTotal = deposit + available + holding;
  // total profit already received — manual (hold) and automatic claims alike,
  // across every investment the user ever made; account-info carries the
  // authoritative all-status sum, the full list is the fallback
  const claimed =
    Number(account?.total_claimed_profit) || sumBy(investments, 'total_claimed_profit');
  const share = (part) => (assetTotal > 0 ? Math.round((part / assetTotal) * 100) : 0);

  const buckets = { stablecoin: 0, terkunci: 0, fleksibel: 0 };
  for (const row of active) {
    buckets[bucketOf(row)] += Number(row.total_amount) || 0;
  }

  return {
    account,
    investments,
    active,
    deposit,
    available,
    holding,
    assetTotal,
    claimed,
    todayIncome,
    balanceHold,
    interestTotal,
    share,
    buckets,
    status,
    error,
  };
}
