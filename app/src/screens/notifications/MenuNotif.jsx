// menu-notif — ported from the Figma export, typography re-synced to Figma
import { dateTimeID, idr, maskAccount } from '../../lib/format.js';
import { useNotifications } from '../../lib/useNotifications.js';
import { t } from '../../lib/i18n.js';
const css = `
/* menu-notif — ported from Figma export, typography re-synced */
.scr-menu-notif .section-container{
  max-width: 412px;
  margin: 0 auto;
  width: 100%;
}
.scr-menu-notif *{
  box-sizing: border-box;
}
.scr-menu-notif #section-header{
    width: 100%;
  }
.scr-menu-notif .header-container{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px 8px;
  }
.scr-menu-notif .back-btn{
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: #1f3048;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
  }
.scr-menu-notif .back-btn img{
    width: 20px;
    height: 20px;
    display: block;
  }
.scr-menu-notif .header-title{
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    text-align: center;
    flex: 1;
  }
.scr-menu-notif .header-spacer{
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }
.scr-menu-notif #section-notifications{
    width: 100%;
    flex: 1;
  }
.scr-menu-notif .notifications-container{
    padding: 0 20px;
    display: flex;
    flex-direction: column;
  }
.scr-menu-notif .notification-item{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
    border-bottom: 1px solid #22344b;
    gap: 12px;
  }
.scr-menu-notif .notification-item.no-border{
    border-bottom: none;
  }
.scr-menu-notif .notification-content{
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }
.scr-menu-notif .notification-header{
    display: flex;
    align-items: center;
    gap: 8px;
  }
.scr-menu-notif .status-dot{
    width: 7px;
    height: 7px;
    background-color: #f2667a;
    border-radius: 4px;
    flex-shrink: 0;
  }
.scr-menu-notif .notification-title{
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    line-height: 1.4;
  }
.scr-menu-notif .notification-desc{
    color: #a9b7c8;
    font-size: 12px;
    line-height: 1.5;
    margin: 0;
  }
.scr-menu-notif .notification-time{
    color: #75879c;
    font-size: 11px;
    margin: 4px 0 0 0;
    display: block;
  }
.scr-menu-notif .arrow-icon{
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    display: block;
  }
/* figma re-sync */
.scr-menu-notif .header-title.header-title { font-size: 17px; }
.scr-menu-notif .header-title.header-title { font-weight: 700; }
.scr-menu-notif .notification-title.notification-title { font-size: 15px; }
.scr-menu-notif .notification-title.notification-title { font-weight: 700; }
.scr-menu-notif .notification-title.notification-title { line-height: 22px; }
/* the frame has no loading, empty or failed state */
.scr-menu-notif .list-state{
  padding: 30px 0;
  text-align: center;
  font-size: 12px;
  line-height: 18px;
  color: #75879c;
}
`;

// the frame names the event, so the title follows the ledger status
const TITLES = {
  DEPOSIT: {
    COMPLETED: 'Deposit Dikonfirmasi',
    REJECTED: 'Deposit Gagal',
    FAILED: 'Deposit Gagal',
    CANCELLED: 'Deposit Dibatalkan',
    DEFAULT: 'Deposit Diproses',
  },
  WITHDRAW: {
    COMPLETED: 'Penarikan Berhasil',
    REJECTED: 'Penarikan Gagal',
    FAILED: 'Penarikan Gagal',
    CANCELLED: 'Penarikan Dibatalkan',
    DEFAULT: 'Penarikan Diproses',
  },
  CREDIT: {
    DEFAULT: 'Saldo Ditambahkan',
  },
};

// the arrow has to land on the ledger the row came from
const ROUTES = {
  DEPOSIT: '/riwayat/deposit',
  WITHDRAW: '/riwayat/penarikan',
  CREDIT: '/riwayat/lainnya',
};

const titleOf = (row) => {
  const group = TITLES[row.type] || {};
  return group[row.status] || group.DEFAULT || 'Notifikasi';
};

const isFailed = (status) => status === 'REJECTED' || status === 'FAILED';

// one sentence for the event, then the same three facts the frame prints
const linesOf = (row) => {
  const amount = `${idr(row.amount)} IDR`;
  const lines = [];

  if (row.type === 'DEPOSIT') {
    lines.push(
      row.status === 'COMPLETED'
        ? 'Deposit kamu telah dikonfirmasi.'
        : isFailed(row.status)
          ? 'Deposit kamu gagal diproses.'
          : 'Deposit kamu sedang diproses.'
    );
    lines.push(`Jumlah deposit: ${amount}`);
  } else if (row.type === 'WITHDRAW') {
    lines.push(
      row.status === 'COMPLETED'
        ? `Kamu berhasil menarik ${amount} dari akunmu.`
        : isFailed(row.status)
          ? `Penarikan ${amount} kamu gagal.`
          : `Penarikan ${amount} sedang diproses.`
    );
    lines.push(`Jumlah penarikan: ${amount}`);
  } else {
    lines.push(`Saldo sebesar ${amount} telah ditambahkan.`);
  }

  if (row.bank_account_number) lines.push(`Nomor rekening: ${maskAccount(row.bank_account_number)}`);
  lines.push(`Waktu: ${dateTimeID(row.created_at, true)} (WIB)`);
  return lines;
};

// Jakarta wall time, so "Hari ini" does not flip at the wrong hour
const jakartaDate = (shift = 0) =>
  new Date(Date.now() + shift * 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

const relativeTime = (value) => {
  const stamp = dateTimeID(value);
  const day = String(value || '').slice(0, 10);
  const clock = stamp.slice(11, 16);
  if (day === jakartaDate(0)) return `Hari ini ${clock}`;
  if (day === jakartaDate(-1)) return `Kemarin ${clock}`;
  return stamp;
};

export default function MenuNotif() {
  const { items, status, isUnread, markRead } = useNotifications();

  return (
    <div className="scr-menu-notif">
      <style>{css}</style>
      <section id="section-header">
        <div className="section-container header-container">
          <button className="back-btn" aria-label={t('Go back')} data-back="1">
            <img src="/assets/img/d182388bc6.svg" alt="" />
          </button>
          <h1 className="header-title">{t('Notifikasi Sistem')}</h1>
          <div className="header-spacer"></div>
        </div>
      </section>
      <section id="section-notifications">
        <div className="section-container notifications-container">
          {status === 'loading' && <p className="list-state">{t('Memuat notifikasi…')}</p>}
          {status === 'error' && <p className="list-state">{t('Gagal memuat notifikasi.')}</p>}
          {status === 'ready' && items.length === 0 && (
            <p className="list-state">{t('Belum ada notifikasi.')}</p>
          )}
          {items.map((row, index) => {
            const lines = linesOf(row);
            return (
              <article
                key={row.id}
                className={`notification-item${index === items.length - 1 ? ' no-border' : ''}`}
                role="button"
                data-route={ROUTES[row.type] || '/riwayat/lainnya'}
                // opening it is what clears the dot; the route change follows
                onClick={() => markRead(row.id)}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    {isUnread(row.id) && <span className="status-dot"></span>}
                    <h2 className="notification-title">{titleOf(row)}</h2>
                  </div>
                  <p className="notification-desc">
                    {lines.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < lines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                  <time className="notification-time">{relativeTime(row.created_at)}</time>
                </div>
                <img src="/assets/img/a683915f24.svg" alt="" className="arrow-icon" />
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
