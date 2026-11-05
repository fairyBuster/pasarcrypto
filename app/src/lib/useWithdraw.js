// Shared data for the withdraw screens: which wallet pays, where the money goes,
// and the limits/fees the API is going to apply to the request.
import { useEffect, useState } from 'react';
import { api } from './api.js';
import { friendlyError } from './auth.jsx';

// the backend only looks at the default account, so the screens agree with it
const pickBank = (rows) => rows.find((row) => row.is_default) || rows[0] || null;

export function useWithdraw() {
  const [state, setState] = useState({
    status: 'loading',
    error: '',
    settings: null,
    account: null,
    banks: [],
    bank: null,
    pinSet: false,
  });

  useEffect(() => {
    let alive = true;

    Promise.all([
      api.me(),
      api.withdrawSettings(),
      api.userBanks(),
      api.bankList(),
      api.withdrawPinStatus(),
    ])
      .then(([me, settings, banks, catalog, pin]) => {
        if (!alive) return;

        const rows = banks.ok && Array.isArray(banks.data) ? banks.data : [];
        const chosen = pickBank(rows);
        // the per-user list carries the fee, the public catalogue carries the limits
        const meta =
          (catalog.ok && Array.isArray(catalog.data) ? catalog.data : []).find(
            (row) => row.id === chosen?.bank
          ) || null;
        // the destination comes from its own endpoint, so a failed balance call
        // must not blank it
        const shared = {
          settings: settings.ok ? settings.data : null,
          banks: rows,
          bank: chosen
            ? {
                ...chosen,
                min: Number(meta?.min_withdrawal) || 0,
                max: Number(meta?.max_withdrawal) || 0,
                feePercent: Number(chosen.withdrawal_fee) || 0,
                feeFixed: Number(chosen.withdrawal_fee_fixed) || 0,
                processingDays: Number(meta?.processing_time) || 0,
              }
            : null,
          pinSet: Boolean(pin.ok && pin.data?.pin_set),
        };

        if (!me.ok) {
          setState((prev) => ({
            ...prev,
            ...shared,
            status: 'error',
            error: friendlyError(me.data, 'Gagal memuat saldo.'),
          }));
          return;
        }

        setState({ status: 'ready', error: '', account: me.data, ...shared });
      })
      .catch(() => {
        if (!alive) return;
        setState((prev) => ({ ...prev, status: 'error', error: 'Gagal memuat data penarikan.' }));
      });

    return () => {
      alive = false;
    };
  }, []);

  // the admin picks which wallet pays out; the API deducts from that one
  const wallet =
    state.settings?.balance_source === 'balance_deposit'
      ? Number(state.account?.balance_deposit) || 0
      : Number(state.account?.balance) || 0;

  // same arithmetic as withdrawal/serializers.py, so the preview equals the receipt
  const feeFor = (amount) => {
    const nominal = Number(amount) || 0;
    if (!state.bank || nominal <= 0) return 0;
    return Math.round((nominal * (state.bank.feePercent / 100) + state.bank.feeFixed) * 100) / 100;
  };

  return { ...state, wallet, feeFor };
}
